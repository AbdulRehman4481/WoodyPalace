import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { BannerService } from '@/lib/services/banner';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { createBannerSchema, bannerFiltersSchema, paginationSchema } from '@/lib/validations';
import { AuditLogger } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters = {
      type: searchParams.get('type') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
    };

    const pagination = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      sortBy: searchParams.get('sortBy') || 'sortOrder',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    };

    const validatedFilters = bannerFiltersSchema.parse(filters);
    const validatedPagination = paginationSchema.parse(pagination);

    const result = await BannerService.findMany(validatedFilters, validatedPagination);

    return createSuccessResponse(result);
  } catch (error) {
    console.error('Banners GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch banners',
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
    const validatedData = createBannerSchema.parse(body);

    const banner = await BannerService.create(validatedData);

    await AuditLogger.logCreate(
      'Banner',
      banner.id,
      validatedData,
      user.id,
      req
    );

    return createSuccessResponse(banner, 'Banner created successfully');
  } catch (error) {
    console.error('Banners POST error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return createValidationErrorResponse({
        general: [error.message],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create banner',
      500
    );
  }
});

