import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { CategoryService } from '@/lib/services/category';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse, createValidationErrorResponse } from '@/lib/api-response';
import { AuditLogger } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';
import { z } from 'zod';

const moveCategorySchema = z.object({
  newParentId: z.string().optional(),
  newSortOrder: z.number().optional(),
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
    const validatedData = moveCategorySchema.parse(body);

    // Get existing category for audit logging
    const existingCategory = await CategoryService.findById(id);
    if (!existingCategory) {
      return createNotFoundResponse('Category');
    }

    const updatedCategory = await CategoryService.moveCategory(
      id,
      validatedData.newParentId,
      validatedData.newSortOrder
    );

    // Log the move operation
    await AuditLogger.logUpdate(
      'Category',
      id,
      {
        parentId: existingCategory.parentId,
        sortOrder: existingCategory.sortOrder,
      },
      {
        parentId: updatedCategory.parentId,
        sortOrder: updatedCategory.sortOrder,
      },
      user.id,
      req
    );

    return createSuccessResponse(updatedCategory, 'Category moved successfully');
  } catch (error) {
    console.error('Category move error:', error);
    
    if (error instanceof Error && error.message.includes('circular reference')) {
      return createValidationErrorResponse({
        newParentId: ['Cannot create circular reference in category hierarchy'],
      });
    }

    if (error instanceof Error && error.message.includes('cannot be its own parent')) {
      return createValidationErrorResponse({
        newParentId: ['Category cannot be its own parent'],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to move category',
      500
    );
  }
});
