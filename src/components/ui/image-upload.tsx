'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
// Removed validateImageFile import to avoid client-side Node.js module issues

// Client-side file validation
const validateImageFile = (file: File, maxSize: number = 5): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size (maxSize in MB)
  if (file.size > maxSize * 1024 * 1024) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize}MB`,
    };
  }

  return { valid: true };
};

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
  description?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = 'Image',
  description,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file, maxSize);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.data.files.length > 0) {
        const imageUrl = data.data.files[0].url;
        onChange(imageUrl);
        
        // Success toast
        const { toast } = await import('@/lib/toast');
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setError('Failed to upload image');
      const { toast } = await import('@/lib/toast');
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    onChange(undefined);
    setError(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      
      <div className="space-y-4">
        {/* Current Image Display */}
        {value && (
          <div className="relative w-full max-w-xs">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={value}
                alt="Category image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
                unoptimized={value.includes('cloudinary.com')}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemoveImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Upload Area */}
        {!value && (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={handleUploadClick}
          >
            <div className="flex flex-col items-center space-y-2">
              {uploading ? (
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
              <div className="text-sm text-gray-600">
                {uploading ? (
                  'Uploading...'
                ) : (
                  <>
                    <span className="font-medium text-blue-600">Click to upload</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, WEBP up to {maxSize}MB
              </p>
            </div>
          </div>
        )}

        {/* Upload Button (when image exists) */}
        {value && (
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Change Image
              </>
            )}
          </Button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
