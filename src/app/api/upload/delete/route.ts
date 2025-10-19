import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

export const DELETE = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { publicIds } = body;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return createErrorResponse('Public IDs are required', 400);
    }

    // Dynamic import to avoid client-side issues
    const { deleteFromCloudinary, deleteMultipleFromCloudinary } = await import('@/lib/cloudinary');
    
    if (publicIds.length === 1) {
      await deleteFromCloudinary(publicIds[0]);
    } else {
      await deleteMultipleFromCloudinary(publicIds);
    }

    return createSuccessResponse(
      { deletedCount: publicIds.length },
      'Images deleted successfully'
    );
  } catch (error) {
    console.error('Delete API error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Delete failed',
      400
    );
  }
});
