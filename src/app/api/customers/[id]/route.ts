import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { CustomerService } from '@/lib/services/customer';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse, createValidationErrorResponse } from '@/lib/api-response';
import { updateCustomerSchema } from '@/lib/validations';
import { AuditLogger, getChangedFields } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';

export const GET = withAdminAuth(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    const customer = await CustomerService.findById(id);
    if (!customer) {
      return createNotFoundResponse('Customer');
    }

    return createSuccessResponse(customer);
  } catch (error) {
    console.error('Customer GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch customer',
      500
    );
  }
});

export const PUT = withAdminAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { id } = params;
    const body = await req.json();

    // Validate request body
    const validatedData = updateCustomerSchema.parse(body);

    // Get existing customer for audit logging
    const existingCustomer = await CustomerService.findById(id);
    if (!existingCustomer) {
      return createNotFoundResponse('Customer');
    }

    const updatedCustomer = await CustomerService.update(id, validatedData);

    // Log the update
    const { oldValues, newValues } = getChangedFields(
      existingCustomer,
      validatedData
    );

    if (Object.keys(newValues).length > 0) {
      await AuditLogger.logUpdate(
        'Customer',
        id,
        oldValues,
        newValues,
        user.id,
        req
      );
    }

    return createSuccessResponse(updatedCustomer, 'Customer updated successfully');
  } catch (error) {
    console.error('Customer PUT error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return createValidationErrorResponse({
        general: [error.message],
      });
    }

    if (error instanceof Error && error.message.includes('already exists')) {
      return createValidationErrorResponse({
        email: ['Customer with this email already exists'],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to update customer',
      500
    );
  }
});

export const DELETE = withAdminAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { id } = params;

    const existingCustomer = await CustomerService.findById(id);
    if (!existingCustomer) {
      return createNotFoundResponse('Customer');
    }

    await CustomerService.delete(id);

    // Log the deletion
    await AuditLogger.logDelete(
      'Customer',
      id,
      existingCustomer,
      user.id,
      req
    );

    return createSuccessResponse(null, 'Customer deleted successfully');
  } catch (error) {
    console.error('Customer DELETE error:', error);
    
    if (error instanceof Error && error.message.includes('has orders')) {
      return createValidationErrorResponse({
        general: ['Cannot delete customer that has orders'],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to delete customer',
      500
    );
  }
});
