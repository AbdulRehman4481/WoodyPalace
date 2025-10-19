import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { OrderService } from '@/lib/services/order';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { orderFiltersSchema, orderSearchSchema, paginationSchema } from '@/lib/validations';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    // Check if this is a search request
    const isSearch = searchParams.get('search') === 'true';
    
    if (isSearch) {
      // Handle search request
      const searchQuery = {
        query: searchParams.get('query') || undefined,
        orderNumber: searchParams.get('orderNumber') || undefined,
        customerEmail: searchParams.get('customerEmail') || undefined,
        customerName: searchParams.get('customerName') || undefined,
        productName: searchParams.get('productName') || undefined,
        productSku: searchParams.get('productSku') || undefined,
      };

      const pagination = {
        page: Number(searchParams.get('page')) || 1,
        limit: Number(searchParams.get('limit')) || 20,
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      };

      // Validate search query and pagination
      const validatedSearchQuery = orderSearchSchema.parse(searchQuery);
      const validatedPagination = paginationSchema.parse(pagination);

      const result = await OrderService.search(validatedSearchQuery, validatedPagination);
      return createSuccessResponse(result);
    } else {
      // Handle regular listing request
      const filters = {
        status: searchParams.get('status') || undefined,
        paymentStatus: searchParams.get('paymentStatus') || undefined,
        customerId: searchParams.get('customerId') || undefined,
        dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
        dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
        totalMin: searchParams.get('totalMin') ? Number(searchParams.get('totalMin')) : undefined,
        totalMax: searchParams.get('totalMax') ? Number(searchParams.get('totalMax')) : undefined,
      };

      const pagination = {
        page: Number(searchParams.get('page')) || 1,
        limit: Number(searchParams.get('limit')) || 20,
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      };

      // Validate filters and pagination
      const validatedFilters = orderFiltersSchema.parse(filters);
      const validatedPagination = paginationSchema.parse(pagination);

      const result = await OrderService.findMany(validatedFilters, validatedPagination);
      return createSuccessResponse(result);
    }
  } catch (error) {
    console.error('Orders GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch orders',
      500
    );
  }
});
