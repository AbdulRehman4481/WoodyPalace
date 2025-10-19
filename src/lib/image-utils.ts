/**
 * Client-side image utility functions
 * These functions don't import Cloudinary to avoid client-side build issues
 */

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com');
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromCloudinaryUrl(url: string): string | null {
  try {
    const matches = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp|svg)$/i);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
}

/**
 * Generate optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number
): string {
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  // Extract public ID from Cloudinary URL
  const matches = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp|svg)$/i);
  if (!matches) {
    return url;
  }

  const publicId = matches[1];
  const baseUrl = url.split('/v')[0];
  const version = url.match(/\/v(\d+)\//)?.[1] || '1';
  
  let transformation = '';
  if (width || height) {
    const params = [];
    if (width) params.push(`w_${width}`);
    if (height) params.push(`h_${height}`);
    params.push('c_fill', 'q_auto', 'f_auto');
    transformation = `/${params.join(',')}`;
  }

  return `${baseUrl}/v${version}${transformation}/${publicId}.${matches[2]}`;
}

/**
 * Validate image file on client side
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}
