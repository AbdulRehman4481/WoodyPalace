import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { BannerService } from '@/lib/services/banner';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse, createValidationErrorResponse } from '@/lib/api-response';
import { updateBannerSchema } from '@/lib/validations';
import { AuditLogger } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';

export const GET = withAdminAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const banner = await BannerService.findById(params.id);
    
    if (!banner) {
      return createNotFoundResponse('Banner');
    }

    return createSuccessResponse(banner);
  } catch (error) {
    console.error('Banner GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch banner',
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

    const existingBanner = await BannerService.findById(params.id);
    if (!existingBanner) {
      return createNotFoundResponse('Banner');
    }

    const body = await req.json();
    const validatedData = updateBannerSchema.parse(body);

    const oldValues = {
      topTitle: existingBanner.topTitle,
      title: existingBanner.title,
      description: existingBanner.description,
      discount: existingBanner.discount,
      image: existingBanner.image,
      imageWidth: existingBanner.imageWidth,
      imageHeight: existingBanner.imageHeight,
      type: existingBanner.type,
      isCarousel: existingBanner.isCarousel,
      bannerColor: existingBanner.bannerColor,
      titleColor: existingBanner.titleColor,
      descriptionColor: existingBanner.descriptionColor,
      buttonColor: existingBanner.buttonColor,
      buttonTextColor: existingBanner.buttonTextColor,
      isActive: existingBanner.isActive,
      sortOrder: existingBanner.sortOrder,
    };

    const banner = await BannerService.update(params.id, validatedData);

    await AuditLogger.logUpdate(
      'Banner',
      params.id,
      oldValues,
      { ...oldValues, ...validatedData },
      user.id,
      req
    );

    return createSuccessResponse(banner, 'Banner updated successfully');
  } catch (error) {
    console.error('Banner PUT error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return createValidationErrorResponse({
        general: [error.message],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to update banner',
      500
    );
  }
});

export const DELETE = withAdminAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const existingBanner = await BannerService.findById(params.id);
    if (!existingBanner) {
      return createNotFoundResponse('Banner');
    }

    await BannerService.delete(params.id);

    await AuditLogger.logDelete(
      'Banner',
      params.id,
      existingBanner,
      user.id,
      req
    );

    return createSuccessResponse(null, 'Banner deleted successfully');
  } catch (error) {
    console.error('Banner DELETE error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to delete banner',
      500
    );
  }
});

