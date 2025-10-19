import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { CustomerService } from '@/lib/services/customer';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse } from '@/lib/api-response';
import { paginationSchema } from '@/lib/validations';

export const GET = withAdminAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);

    // Verify customer exists
    const customer = await CustomerService.findById(id);
    if (!customer) {
      return createNotFoundResponse('Customer');
    }

    const pagination = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    };

    const validatedPagination = paginationSchema.parse(pagination);
    const orderHistory = await CustomerService.getOrderHistory(id, validatedPagination);
    
    return createSuccessResponse(orderHistory);
  } catch (error) {
    console.error('Customer orders GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch customer orders',
      500
    );
  }
});
