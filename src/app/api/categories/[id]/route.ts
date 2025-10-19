import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { CategoryService } from '@/lib/services/category';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse, createValidationErrorResponse } from '@/lib/api-response';
import { updateCategorySchema } from '@/lib/validations';
import { AuditLogger, getChangedFields } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';

export const GET = withAdminAuth(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    const category = await CategoryService.findById(id);
    if (!category) {
      return createNotFoundResponse('Category');
    }

    return createSuccessResponse(category);
  } catch (error) {
    console.error('Category GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch category',
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

    const { id } = params;
    const body = await req.json();

    // Validate request body
    const validatedData = updateCategorySchema.parse(body);

    // Get existing category for audit logging
    const existingCategory = await CategoryService.findById(id);
    if (!existingCategory) {
      return createNotFoundResponse('Category');
    }

    const updatedCategory = await CategoryService.update(id, validatedData);

    // Log the update
    const { oldValues, newValues } = getChangedFields(
      existingCategory,
      validatedData
    );

    if (Object.keys(newValues).length > 0) {
      await AuditLogger.logUpdate(
        'Category',
        id,
        oldValues,
        newValues,
        user.id,
        req
      );
    }

    return createSuccessResponse(updatedCategory, 'Category updated successfully');
  } catch (error) {
    console.error('Category PUT error:', error);
    
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

    if (error instanceof Error && error.message.includes('circular reference')) {
      return createValidationErrorResponse({
        parentId: ['Cannot create circular reference in category hierarchy'],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to update category',
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

    const { id } = params;

    const existingCategory = await CategoryService.findById(id);
    if (!existingCategory) {
      return createNotFoundResponse('Category');
    }

    await CategoryService.delete(id);

    // Log the deletion
    await AuditLogger.logDelete(
      'Category',
      id,
      existingCategory,
      user.id,
      req
    );

    return createSuccessResponse(null, 'Category deleted successfully');
  } catch (error) {
    console.error('Category DELETE error:', error);
    
    if (error instanceof Error && error.message.includes('has products')) {
      return createValidationErrorResponse({
        general: ['Cannot delete category that has products assigned'],
      });
    }

    if (error instanceof Error && error.message.includes('has subcategories')) {
      return createValidationErrorResponse({
        general: ['Cannot delete category that has subcategories'],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to delete category',
      500
    );
  }
});
