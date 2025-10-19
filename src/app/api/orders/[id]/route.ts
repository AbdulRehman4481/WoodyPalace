import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { OrderService } from '@/lib/services/order';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse, createValidationErrorResponse } from '@/lib/api-response';
import { updateOrderSchema } from '@/lib/validations';
import { AuditLogger, getChangedFields } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';

export const GET = withAdminAuth(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    const order = await OrderService.findById(id);
    if (!order) {
      return createNotFoundResponse('Order');
    }

    return createSuccessResponse(order);
  } catch (error) {
    console.error('Order GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch order',
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
    const validatedData = updateOrderSchema.parse(body);

    // Get existing order for audit logging
    const existingOrder = await OrderService.findById(id);
    if (!existingOrder) {
      return createNotFoundResponse('Order');
    }

    const updatedOrder = await OrderService.update(id, validatedData);

    // Log the update
    const { oldValues, newValues } = getChangedFields(
      existingOrder,
      validatedData
    );

    if (Object.keys(newValues).length > 0) {
      await AuditLogger.logUpdate(
        'Order',
        id,
        oldValues,
        newValues,
        user.id,
        req
      );
    }

    return createSuccessResponse(updatedOrder, 'Order updated successfully');
  } catch (error) {
    console.error('Order PUT error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return createValidationErrorResponse({
        general: [error.message],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to update order',
      500
    );
  }
});
