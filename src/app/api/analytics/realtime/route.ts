import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { AnalyticsService } from '@/lib/services/analytics';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  try {
    const realTimeMetrics = await AnalyticsService.getRealTimeMetrics();
    
    return createSuccessResponse({
      data: realTimeMetrics,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error('Real-time analytics error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch real-time metrics',
      500
    );
  }
});
