import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { CategoryService } from '@/lib/services/category';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { createCategorySchema, categoryFiltersSchema, paginationSchema } from '@/lib/validations';
import { AuditLogger } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const filters = {
      parentId: searchParams.get('parentId') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      hasProducts: searchParams.get('hasProducts') ? searchParams.get('hasProducts') === 'true' : undefined,
    };

    const pagination = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      sortBy: searchParams.get('sortBy') || 'sortOrder',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    };

    // Check if requesting tree structure
    const tree = searchParams.get('tree') === 'true';

    if (tree) {
      const categories = await CategoryService.getTree();
      return createSuccessResponse({ categories });
    }

    // Validate filters and pagination
    const validatedFilters = categoryFiltersSchema.parse(filters);
    const validatedPagination = paginationSchema.parse(pagination);

    const result = await CategoryService.findMany(validatedFilters, validatedPagination);

    return createSuccessResponse(result);
  } catch (error) {
    console.error('Categories GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch categories',
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
    const validatedData = createCategorySchema.parse(body);

    const category = await CategoryService.create(validatedData);

    // Log the creation
    await AuditLogger.logCreate(
      'Category',
      category.id,
      validatedData,
      user.id,
      req
    );

    return createSuccessResponse(category, 'Category created successfully');
  } catch (error) {
    console.error('Categories POST error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return createValidationErrorResponse({
        general: [error.message],
      });
    }

    if (error instanceof Error && error.message.includes('already exists')) {
      return createValidationErrorResponse({
        slug: ['Category with this slug already exists'],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create category',
      500
    );
  }
});
