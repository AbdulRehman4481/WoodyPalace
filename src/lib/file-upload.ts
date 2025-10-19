import { NextRequest } from 'next/server';
import { UPLOAD_CONFIG } from './constants';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  url: string;
  public_id?: string;
  cloudinary_result?: {
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    bytes: number;
    created_at: string;
  };
}

export async function handleFileUpload(
  request: NextRequest,
  fieldName: string = 'file'
): Promise<UploadedFile[]> {
  try {
    const formData = await request.formData();
    const files = formData.getAll(fieldName) as File[];
    
    if (!files.length) {
      throw new Error('No files uploaded');
    }

    const uploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      // Validate file type
      if (!UPLOAD_CONFIG.allowedImageTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}`);
      }

      // Validate file size
      if (file.size > UPLOAD_CONFIG.maxFileSize) {
        throw new Error(`File too large: ${file.size} bytes`);
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary (dynamic import to avoid client-side issues)
      const { uploadToCloudinary } = await import('./cloudinary');
      const cloudinaryResult = await uploadToCloudinary(buffer, {
        folder: 'ecommerce-products',
        resource_type: 'image',
        overwrite: false,
      });

      // Create file info
      const uploadedFile: UploadedFile = {
        fieldname: fieldName,
        originalname: file.name,
        encoding: '7bit',
        mimetype: file.type,
        size: file.size,
        url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
        cloudinary_result: cloudinaryResult,
      };

      uploadedFiles.push(uploadedFile);
    }

    return uploadedFiles;
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!UPLOAD_CONFIG.allowedImageTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${UPLOAD_CONFIG.allowedImageTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

export function generateImageUrl(filename: string): string {
  return `/uploads/${filename}`;
}

export async function deleteUploadedFile(filename: string): Promise<void> {
  const { unlink } = await import('fs/promises');
  const { join } = await import('path');
  
  const filepath = join(process.cwd(), UPLOAD_CONFIG.uploadDir, filename);
  return unlink(filepath);
}

