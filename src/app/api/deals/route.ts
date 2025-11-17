import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { DealService } from '@/lib/services/deal';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { createDealSchema, dealFiltersSchema, paginationSchema } from '@/lib/validations';
import { AuditLogger } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters = {
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      isUpcoming: searchParams.get('isUpcoming') ? searchParams.get('isUpcoming') === 'true' : undefined,
      isActiveNow: searchParams.get('isActiveNow') ? searchParams.get('isActiveNow') === 'true' : undefined,
      isExpired: searchParams.get('isExpired') ? searchParams.get('isExpired') === 'true' : undefined,
    };

    const pagination = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const validatedFilters = dealFiltersSchema.parse(filters);
    const validatedPagination = paginationSchema.parse(pagination);

    const result = await DealService.findMany(validatedFilters, validatedPagination);

    return createSuccessResponse(result);
  } catch (error) {
    console.error('Deals GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch deals',
      500
    );
  }
});

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const validatedData = createDealSchema.parse(body);

    const deal = await DealService.create(validatedData);

    await AuditLogger.logCreate(
      'Deal',
      deal.id,
      validatedData,
      user.id,
      req
    );

    return createSuccessResponse(deal, 'Deal created successfully');
  } catch (error) {
    console.error('Deals POST error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return createValidationErrorResponse({
        general: [error.message],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create deal',
      500
    );
  }
});
