import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { OrderService } from '@/lib/services/order';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;

    const analytics = await OrderService.getAnalytics(dateFrom, dateTo);
    return createSuccessResponse(analytics);
  } catch (error) {
    console.error('Order analytics error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch order analytics',
      500
    );
  }
});
