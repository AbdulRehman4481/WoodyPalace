import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { DealService } from '@/lib/services/deal';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse, createValidationErrorResponse } from '@/lib/api-response';
import { updateDealSchema } from '@/lib/validations';
import { AuditLogger } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';

export const GET = withAdminAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const deal = await DealService.findById(params.id);
    
    if (!deal) {
      return createNotFoundResponse('Deal');
    }

    return createSuccessResponse(deal);
  } catch (error) {
    console.error('Deal GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch deal',
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

    const existingDeal = await DealService.findById(params.id);
    if (!existingDeal) {
      return createNotFoundResponse('Deal');
    }

    const body = await req.json();
    const validatedData = updateDealSchema.parse(body);

    const oldValues = {
      title: existingDeal.title,
      description: existingDeal.description,
      startDate: existingDeal.startDate,
      endDate: existingDeal.endDate,
      massiveDealProductId: existingDeal.massiveDealProductId,
      productIds: existingDeal.dealProducts?.map(dp => dp.productId) || [],
      isActive: existingDeal.isActive,
    };

    const deal = await DealService.update(params.id, validatedData);

    await AuditLogger.logUpdate(
      'Deal',
      params.id,
      oldValues,
      { ...oldValues, ...validatedData },
      user.id,
      req
    );

    return createSuccessResponse(deal, 'Deal updated successfully');
  } catch (error) {
    console.error('Deal PUT error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return createValidationErrorResponse({
        general: [error.message],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to update deal',
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

    const existingDeal = await DealService.findById(params.id);
    if (!existingDeal) {
      return createNotFoundResponse('Deal');
    }

    await DealService.delete(params.id);

    await AuditLogger.logDelete(
      'Deal',
      params.id,
      existingDeal,
      user.id,
      req
    );

    return createSuccessResponse(null, 'Deal deleted successfully');
  } catch (error) {
    console.error('Deal DELETE error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to delete deal',
      500
    );
  }
});
