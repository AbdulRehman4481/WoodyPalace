import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { handleFileUpload } from '@/lib/file-upload';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const uploadedFiles = await handleFileUpload(req, 'file');
    
    return createSuccessResponse(
      { files: uploadedFiles },
      'Files uploaded successfully'
    );
  } catch (error) {
    console.error('Upload API error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Upload failed',
      400
    );
  }
});
