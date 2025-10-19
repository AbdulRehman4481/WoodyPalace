import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { AnalyticsService } from '@/lib/services/analytics';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { AnalyticsFilters } from '@/types/analytics';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse filters from query parameters
    const filters: AnalyticsFilters = {};
    
    // Date range filter
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    if (dateFrom && dateTo) {
      filters.dateRange = {
        from: new Date(dateFrom),
        to: new Date(dateTo),
      };
    }
    
    // Customer filter
    const customerId = searchParams.get('customerId');
    if (customerId) {
      filters.customerId = customerId;
    }

    const customerAnalytics = await AnalyticsService.getCustomerAnalytics(filters);
    
    return createSuccessResponse({
      data: customerAnalytics,
      filters,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error('Customer analytics error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch customer analytics',
      500
    );
  }
});
