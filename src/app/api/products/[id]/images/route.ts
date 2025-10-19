import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { ProductService } from '@/lib/services/product';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse } from '@/lib/api-response';
import { handleFileUpload } from '@/lib/file-upload';
import { AuditLogger } from '@/lib/audit-logger';
import { getCurrentUser } from '@/lib/auth-helpers';

export const POST = withAdminAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { id } = params;

    // Check if product exists
    const existingProduct = await ProductService.findById(id);
    if (!existingProduct) {
      return createNotFoundResponse('Product');
    }

    // Handle file upload
    const uploadedFiles = await handleFileUpload(req, 'image');
    
    if (uploadedFiles.length === 0) {
      return createErrorResponse('No image files uploaded', 400);
    }

    // Add images to product
    const imageUrls = uploadedFiles.map(file => file.url);
    const productId = params.id;
    const updatedProduct = await ProductService.addImage(productId, imageUrls[0]);

    // Log the image addition
    await AuditLogger.logUpdate(
      'Product',
      productId,
      { images: existingProduct.images },
      { images: updatedProduct.images },
      user.id,
      req
    );

    return createSuccessResponse(
      { product: updatedProduct, uploadedFiles },
      'Image uploaded successfully'
    );
  } catch (error) {
    console.error('Product image upload error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to upload image',
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
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('imageUrl');

    if (!imageUrl) {
      return createErrorResponse('Image URL is required', 400);
    }

    // Check if product exists
    const existingProduct = await ProductService.findById(id);
    if (!existingProduct) {
      return createNotFoundResponse('Product');
    }

    // Remove image from product
    const updatedProduct = await ProductService.removeImage(id, imageUrl);

    // Log the image removal
    await AuditLogger.logUpdate(
      'Product',
      id,
      { images: existingProduct.images },
      { images: updatedProduct.images },
      user.id,
      req
    );

    return createSuccessResponse(updatedProduct, 'Image removed successfully');
  } catch (error) {
    console.error('Product image delete error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to remove image',
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
    const { imageUrls } = body;

    if (!Array.isArray(imageUrls)) {
      return createErrorResponse('imageUrls must be an array', 400);
    }

    // Check if product exists
    const existingProduct = await ProductService.findById(id);
    if (!existingProduct) {
      return createNotFoundResponse('Product');
    }

    // Reorder images
    const updatedProduct = await ProductService.reorderImages(id, imageUrls);

    // Log the image reordering
    await AuditLogger.logUpdate(
      'Product',
      id,
      { images: existingProduct.images },
      { images: updatedProduct.images },
      user.id,
      req
    );

    return createSuccessResponse(updatedProduct, 'Images reordered successfully');
  } catch (error) {
    console.error('Product image reorder error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to reorder images',
      500
    );
  }
});
