import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { ProductService } from '@/lib/services/product';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { createProductSchema, productFiltersSchema, productPaginationSchema } from '@/lib/validations';
import { AuditLogger } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const query = searchParams.get('query') || undefined;
    const filters = {
      categoryId: searchParams.get('categoryId') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      isDiscontinued: searchParams.get('isDiscontinued') ? searchParams.get('isDiscontinued') === 'true' : undefined,
      priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
      priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
      inventoryMin: searchParams.get('inventoryMin') ? Number(searchParams.get('inventoryMin')) : undefined,
      inventoryMax: searchParams.get('inventoryMax') ? Number(searchParams.get('inventoryMax')) : undefined,
    };

    const pagination = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Validate filters and pagination
    const validatedFilters = productFiltersSchema.parse(filters);
    const validatedPagination = productPaginationSchema.parse(pagination);

    let result;
    if (query) {
      result = await ProductService.search(query, validatedFilters, validatedPagination);
    } else {
      result = await ProductService.findMany(validatedFilters, validatedPagination);
    }

    return createSuccessResponse(result);
  } catch (error) {
    console.error('Products GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch products',
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
    
    // Validate request body
    const validatedData = createProductSchema.parse(body);

    // Check if SKU already exists
    const existingProduct = await ProductService.findBySku(validatedData.sku);
    if (existingProduct) {
      return createValidationErrorResponse({
        sku: ['SKU already exists'],
      });
    }

    const product = await ProductService.create(validatedData);

    // Log the creation
    await AuditLogger.logCreate(
      'Product',
      product.id,
      validatedData,
      user.id,
      req
    );

    return createSuccessResponse(product, 'Product created successfully');
  } catch (error) {
    console.error('Products POST error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return createValidationErrorResponse({
        general: [error.message],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create product',
      500
    );
  }
});
