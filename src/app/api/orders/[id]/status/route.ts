import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { OrderService } from '@/lib/services/order';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse, createValidationErrorResponse } from '@/lib/api-response';
import { orderStatusUpdateSchema } from '@/lib/validations';
import { AuditLogger } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';

export const PUT = withAdminAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { id } = params;
    const body = await req.json();

    // Validate request body
    const validatedData = orderStatusUpdateSchema.parse(body);

    // Get existing order for audit logging
    const existingOrder = await OrderService.findById(id);
    if (!existingOrder) {
      return createNotFoundResponse('Order');
    }

    const updatedOrder = await OrderService.updateStatus(id, validatedData);

    // Log the status update
    await AuditLogger.logUpdate(
      'Order',
      id,
      { status: existingOrder.status },
      { 
        status: updatedOrder.status,
        notes: validatedData.notes,
        adminComment: validatedData.adminComment,
      },
      user.id,
      req
    );

    return createSuccessResponse(updatedOrder, 'Order status updated successfully');
  } catch (error) {
    console.error('Order status update error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return createValidationErrorResponse({
        general: [error.message],
      });
    }

    if (error instanceof Error && error.message.includes('Invalid status transition')) {
      return createValidationErrorResponse({
        status: [error.message],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to update order status',
      500
    );
  }
});
