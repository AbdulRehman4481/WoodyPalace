import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { ProductService } from '@/lib/services/product';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse, createValidationErrorResponse } from '@/lib/api-response';
import { updateProductSchema } from '@/lib/validations';
import { AuditLogger, getChangedFields } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';

export const GET = withAdminAuth(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    const product = await ProductService.findById(id);
    if (!product) {
      return createNotFoundResponse('Product');
    }

    return createSuccessResponse(product);
  } catch (error) {
    console.error('Product GET error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch product',
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
    const validatedData = updateProductSchema.parse(body);

    // Get existing product for audit logging
    const existingProduct = await ProductService.findById(id);
    if (!existingProduct) {
      return createNotFoundResponse('Product');
    }

    // Check if SKU is being changed and if it already exists
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const existingProductWithSku = await ProductService.findBySku(validatedData.sku);
      if (existingProductWithSku) {
        return createValidationErrorResponse({
          sku: ['SKU already exists'],
        });
      }
    }

    const updatedProduct = await ProductService.update(id, validatedData);

    // Log the update
    const { oldValues, newValues } = getChangedFields(
      existingProduct,
      validatedData
    );

    if (Object.keys(newValues).length > 0) {
      await AuditLogger.logUpdate(
        'Product',
        id,
        oldValues,
        newValues,
        user.id,
        req
      );
    }

    return createSuccessResponse(updatedProduct, 'Product updated successfully');
  } catch (error) {
    console.error('Product PUT error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return createValidationErrorResponse({
        general: [error.message],
      });
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to update product',
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

    const existingProduct = await ProductService.findById(id);
    if (!existingProduct) {
      return createNotFoundResponse('Product');
    }

    await ProductService.delete(id);

    // Log the deletion
    await AuditLogger.logDelete(
      'Product',
      id,
      existingProduct,
      user.id,
      req
    );

    return createSuccessResponse(null, 'Product deleted successfully');
  } catch (error) {
    console.error('Product DELETE error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to delete product',
      500
    );
  }
});
