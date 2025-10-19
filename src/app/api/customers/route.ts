import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { CustomerService } from '@/lib/services/customer';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { customerFiltersSchema, customerSearchSchema, paginationSchema } from '@/lib/validations';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    // Check if this is a search request
    const isSearch = searchParams.get('search') === 'true';
    
    if (isSearch) {
      // Handle search request
      const searchQuery = {
        query: searchParams.get('query') || undefined,
        email: searchParams.get('email') || undefined,
        firstName: searchParams.get('firstName') || undefined,
        lastName: searchParams.get('lastName') || undefined,
        phone: searchParams.get('phone') || undefined,
      };

      const pagination = {
        page: Number(searchParams.get('page')) || 1,
        limit: Number(searchParams.get('limit')) || 20,
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      };

      // Validate search query and pagination
      const validatedSearchQuery = customerSearchSchema.parse(searchQuery);
      const validatedPagination = paginationSchema.parse(pagination);

      const result = await CustomerService.search(validatedSearchQuery, validatedPagination);
      return createSuccessResponse(result);
    } else {
      // Handle regular listing request
      const filters = {
        isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
        hasOrders: searchParams.get('hasOrders') ? searchParams.get('hasOrders') === 'true' : undefined,
        dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
        dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      };

      const pagination = {
        page: Number(searchParams.get('page')) || 1,
        limit: Number(searchParams.get('limit')) || 20,
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      };

      // Validate filters and pagination
      const validatedFilters = customerFiltersSchema.parse(filters);
      const validatedPagination = paginationSchema.parse(pagination);

      const result = await CustomerService.findMany(validatedFilters, validatedPagination);
      return createSuccessResponse(result);
    }
  } catch (error) {
    console.error('Customers GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch customers',
      500
    );
  }
});

export const POST = withAdminAuth(async (_req: NextRequest) => {
  try {
    // For now, we'll skip the create customer endpoint as it's typically handled by the frontend registration
    // This could be used for admin-created customer accounts
    return createErrorResponse('Customer creation not implemented', 501);
  } catch (error) {
    console.error('Customers POST error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create customer',
      500
    );
  }
});
