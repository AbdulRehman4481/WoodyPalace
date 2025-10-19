import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { CustomerService } from '@/lib/services/customer';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse } from '@/lib/api-response';
import { AuditLogger } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';

export const PUT = withAdminAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
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

    const updatedCustomer = await CustomerService.toggleActiveStatus(id);

    // Log the status change
    await AuditLogger.logUpdate(
      'Customer',
      id,
      { isActive: existingCustomer.isActive },
      { isActive: updatedCustomer.isActive },
      user.id,
      req
    );

    return createSuccessResponse(updatedCustomer, 'Customer status updated successfully');
  } catch (error) {
    console.error('Customer toggle status error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to update customer status',
      500
    );
  }
});
