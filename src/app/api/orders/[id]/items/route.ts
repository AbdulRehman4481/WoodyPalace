import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { OrderService } from '@/lib/services/order';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse } from '@/lib/api-response';

export const GET = withAdminAuth(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    // Verify order exists
    const order = await OrderService.findById(id);
    if (!order) {
      return createNotFoundResponse('Order');
    }

    const orderItems = await OrderService.getOrderItems(id);
    return createSuccessResponse({ orderItems });
  } catch (error) {
    console.error('Order items GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch order items',
      500
    );
  }
});
