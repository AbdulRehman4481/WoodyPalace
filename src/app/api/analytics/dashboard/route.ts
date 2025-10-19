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
    
    // Category filter
    const categoryId = searchParams.get('categoryId');
    if (categoryId) {
      filters.categoryId = categoryId;
    }
    
    // Product filter
    const productId = searchParams.get('productId');
    if (productId) {
      filters.productId = productId;
    }
    
    // Customer filter
    const customerId = searchParams.get('customerId');
    if (customerId) {
      filters.customerId = customerId;
    }
    
    // Status filter
    const status = searchParams.get('status');
    if (status) {
      filters.status = status;
    }

    const dashboardAnalytics = await AnalyticsService.getDashboardAnalytics(filters);
    
    return createSuccessResponse({
      data: dashboardAnalytics,
      filters,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch dashboard analytics',
      500
    );
  }
});
