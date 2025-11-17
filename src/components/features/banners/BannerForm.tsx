'use client';

import React, { useState, useEffect } from 'react';
import { Banner, CreateBannerRequest, UpdateBannerRequest, BannerType } from '@/types/banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/ui/image-upload';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBannerSchema, updateBannerSchema } from '@/lib/validations';
import { Loader2, Eye } from 'lucide-react';
import Image from 'next/image';

interface BannerFormProps {
  banner?: Banner;
  onSubmit: (data: CreateBannerRequest | UpdateBannerRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function BannerForm({ banner, onSubmit, onCancel, loading = false }: BannerFormProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const isEditing = !!banner;

  const schema = isEditing ? updateBannerSchema : createBannerSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema) as any,
    defaultValues: banner ? {
      topTitle: banner.topTitle || '',
      title: banner.title,
      description: banner.description || '',
      discount: banner.discount || '',
      image: banner.image,
      imageWidth: banner.imageWidth || 1200,
      imageHeight: banner.imageHeight || 600,
      type: banner.type,
      isCarousel: banner.isCarousel || false,
      bannerColor: banner.bannerColor || '#FFFFFF',
      titleColor: banner.titleColor || '#000000',
      descriptionColor: banner.descriptionColor || '#666666',
      buttonColor: banner.buttonColor || '#3B82F6',
      buttonTextColor: banner.buttonTextColor || '#FFFFFF',
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
    } : {
      topTitle: '',
      title: '',
      description: '',
      discount: '',
      image: '',
      imageWidth: 1200,
      imageHeight: 600,
      type: BannerType.NEW_ARRIVAL,
      isCarousel: false,
      bannerColor: '#FFFFFF',
      titleColor: '#000000',
      descriptionColor: '#666666',
      buttonColor: '#3B82F6',
      buttonTextColor: '#FFFFFF',
      isActive: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (banner) {
      setImageUrl(banner.image);
    }
  }, [banner]);

  const handleImageChange = (url: string | undefined) => {
    const image = url || '';
    setImageUrl(image);
    setValue('image', image);
  };

  // Watch form values for preview
  const watchedType = watch('type');
  const watchedTopTitle = watch('topTitle');
  const watchedTitle = watch('title');
  const watchedDescription = watch('description');
  const watchedDiscount = watch('discount');
  const watchedBannerColor = watch('bannerColor') || '#FFFFFF';
  const watchedTitleColor = watch('titleColor') || '#000000';
  const watchedDescriptionColor = watch('descriptionColor') || '#666666';
  const watchedButtonColor = watch('buttonColor') || '#3B82F6';
  const watchedButtonTextColor = watch('buttonTextColor') || '#FFFFFF';
  const watchedImage = watch('image') || imageUrl;
  const watchedImageWidth = watch('imageWidth') || 1200;
  const watchedImageHeight = watch('imageHeight') || 600;
  const watchedIsCarousel = watch('isCarousel');

  // Handle color picker changes - sync with text input
  const handleColorPickerChange = (field: 'bannerColor' | 'titleColor' | 'descriptionColor' | 'buttonColor' | 'buttonTextColor', value: string) => {
    setValue(field, value, { shouldValidate: true });
  };

  // Handle text input changes - sync with color picker
  const handleColorTextChange = (field: 'bannerColor' | 'titleColor' | 'descriptionColor' | 'buttonColor' | 'buttonTextColor', value: string) => {
    // Validate hex color format
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) || value === '') {
      const defaults: Record<string, string> = {
        bannerColor: '#FFFFFF',
        titleColor: '#000000',
        descriptionColor: '#666666',
        buttonColor: '#3B82F6',
        buttonTextColor: '#FFFFFF',
      };
      setValue(field, value || defaults[field], { shouldValidate: true });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Banner Information</CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCarousel"
              {...register('isCarousel')}
              defaultChecked={banner?.isCarousel ?? false}
            />
            <Label htmlFor="isCarousel" className="cursor-pointer font-semibold">
              Carousel Banner (1 of 9 banners)
            </Label>
          </div>

          <div>
            <Label htmlFor="topTitle">Top Title (Optional)</Label>
            <Input
              id="topTitle"
              {...register('topTitle')}
              placeholder="Enter top title (e.g., 'Limited Time')"
              className={errors.topTitle ? 'border-red-500' : ''}
            />
            {errors.topTitle && (
              <p className="text-sm text-red-500 mt-1">{errors.topTitle.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter banner title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="discount">Discount (Optional)</Label>
            <Input
              id="discount"
              {...register('discount')}
              placeholder="e.g., '50% OFF', 'Save $20'"
              className={errors.discount ? 'border-red-500' : ''}
            />
            {errors.discount && (
              <p className="text-sm text-red-500 mt-1">{errors.discount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter banner description"
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Banner Type *</Label>
            <Select
              value={watchedType || BannerType.NEW_ARRIVAL}
              onValueChange={(value) => setValue('type', value as BannerType)}
            >
              <SelectTrigger id="type" className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select banner type" />
              </SelectTrigger>
              <SelectContent className='bg-amber-200'>
                <SelectItem value={BannerType.NEW_ARRIVAL}>New Arrival</SelectItem>
                <SelectItem value={BannerType.DISCOUNT}>Discount</SelectItem>
                <SelectItem value={BannerType.COMING_SOON}>Coming Soon</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <Label>Banner Image *</Label>
            <ImageUpload
              value={imageUrl}
              onChange={handleImageChange}
              label="Upload Banner Image"
              description="Upload an image for this banner (max 5MB)"
            />
            {errors.image && (
              <p className="text-sm text-red-500 mt-1">{errors.image.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="imageWidth">Image Width (px)</Label>
              <Input
                id="imageWidth"
                type="number"
                {...register('imageWidth', { valueAsNumber: true })}
                placeholder="1200"
                min={100}
                max={2000}
                className={errors.imageWidth ? 'border-red-500' : ''}
              />
              {errors.imageWidth && (
                <p className="text-sm text-red-500 mt-1">{errors.imageWidth.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="imageHeight">Image Height (px)</Label>
              <Input
                id="imageHeight"
                type="number"
                {...register('imageHeight', { valueAsNumber: true })}
                placeholder="600"
                min={100}
                max={2000}
                className={errors.imageHeight ? 'border-red-500' : ''}
              />
              {errors.imageHeight && (
                <p className="text-sm text-red-500 mt-1">{errors.imageHeight.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bannerColor">Banner Background Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="bannerColor"
                  type="color"
                  value={watchedBannerColor}
                  onChange={(e) => handleColorPickerChange('bannerColor', e.target.value)}
                  className="h-10 w-20 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={watchedBannerColor}
                  onChange={(e) => handleColorTextChange('bannerColor', e.target.value)}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
              {errors.bannerColor && (
                <p className="text-sm text-red-500 mt-1">{errors.bannerColor.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="titleColor">Title Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="titleColor"
                  type="color"
                  value={watchedTitleColor}
                  onChange={(e) => handleColorPickerChange('titleColor', e.target.value)}
                  className="h-10 w-20 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={watchedTitleColor}
                  onChange={(e) => handleColorTextChange('titleColor', e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
              {errors.titleColor && (
                <p className="text-sm text-red-500 mt-1">{errors.titleColor.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="descriptionColor">Description Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="descriptionColor"
                  type="color"
                  value={watchedDescriptionColor}
                  onChange={(e) => handleColorPickerChange('descriptionColor', e.target.value)}
                  className="h-10 w-20 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={watchedDescriptionColor}
                  onChange={(e) => handleColorTextChange('descriptionColor', e.target.value)}
                  placeholder="#666666"
                  className="flex-1"
                />
              </div>
              {errors.descriptionColor && (
                <p className="text-sm text-red-500 mt-1">{errors.descriptionColor.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buttonColor">Button Background Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="buttonColor"
                  type="color"
                  value={watchedButtonColor}
                  onChange={(e) => handleColorPickerChange('buttonColor', e.target.value)}
                  className="h-10 w-20 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={watchedButtonColor}
                  onChange={(e) => handleColorTextChange('buttonColor', e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
              {errors.buttonColor && (
                <p className="text-sm text-red-500 mt-1">{errors.buttonColor.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="buttonTextColor">Button Text Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="buttonTextColor"
                  type="color"
                  value={watchedButtonTextColor}
                  onChange={(e) => handleColorPickerChange('buttonTextColor', e.target.value)}
                  className="h-10 w-20 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={watchedButtonTextColor}
                  onChange={(e) => handleColorTextChange('buttonTextColor', e.target.value)}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
              {errors.buttonTextColor && (
                <p className="text-sm text-red-500 mt-1">{errors.buttonTextColor.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              type="number"
              {...register('sortOrder', { 
                valueAsNumber: true,
                setValueAs: (v) => (v === '' ? 0 : Number(v))
              })}
              placeholder="0"
              min={0}
              className={errors.sortOrder ? 'border-red-500' : ''}
            />
            {errors.sortOrder && (
              <p className="text-sm text-red-500 mt-1">{errors.sortOrder.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Lower numbers appear first. Default is 0.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              {...register('isActive')}
              defaultChecked={banner?.isActive ?? true}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active (visible on website)
            </Label>
          </div>
        </CardContent>
      </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update Banner' : 'Create Banner'}
          </Button>
        </div>
      </form>

      {/* Preview Section */}
      <Card className="sticky top-6 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Banner Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="relative w-full rounded-lg overflow-hidden border-2 border-gray-200"
            style={{
              backgroundColor: watchedBannerColor,
              minHeight: '300px',
            }}
          >
            {/* Banner Image */}
            {watchedImage ? (
              <div 
                className="relative w-full bg-gray-100 flex items-center justify-center overflow-hidden"
                style={{ 
                  height: `${(watchedImageHeight / watchedImageWidth) * 100}%`,
                  minHeight: '200px',
                  maxHeight: '400px',
                }}
              >
                <Image
                  src={watchedImage}
                  alt={watchedTitle || 'Banner preview'}
                  width={watchedImageWidth}
                  height={watchedImageHeight}
                  className="object-contain w-full h-full"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 text-sm">No image uploaded</p>
              </div>
            )}

            {/* Banner Content Overlay */}
            <div className="p-6 space-y-3">
              {watchedTopTitle && (
                <p
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: watchedTitleColor, opacity: 0.8 }}
                >
                  {watchedTopTitle}
                </p>
              )}
              {watchedDiscount && (
                <div className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white bg-red-500">
                  {watchedDiscount}
                </div>
              )}
              {watchedTitle && (
                <h3
                  className="text-2xl font-bold"
                  style={{ color: watchedTitleColor }}
                >
                  {watchedTitle}
                </h3>
              )}
              {watchedDescription && (
                <p
                  className="text-base leading-relaxed"
                  style={{ color: watchedDescriptionColor }}
                >
                  {watchedDescription}
                </p>
              )}
              {!watchedTitle && !watchedDescription && (
                <div className="space-y-2">
                  {watchedTopTitle && (
                    <div
                      className="h-4 bg-gray-300 rounded animate-pulse"
                      style={{ width: '40%', backgroundColor: watchedTitleColor, opacity: 0.3 }}
                    />
                  )}
                  <div
                    className="h-6 bg-gray-300 rounded animate-pulse"
                    style={{ width: '60%', backgroundColor: watchedTitleColor, opacity: 0.3 }}
                  />
                  <div
                    className="h-4 bg-gray-300 rounded animate-pulse"
                    style={{ width: '80%', backgroundColor: watchedDescriptionColor, opacity: 0.3 }}
                  />
                  <div
                    className="h-4 bg-gray-300 rounded animate-pulse"
                    style={{ width: '70%', backgroundColor: watchedDescriptionColor, opacity: 0.3 }}
                  />
                </div>
              )}
              {/* Button Preview */}
              <div className="pt-2">
                <button
                  className="px-6 py-2 rounded-md font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: watchedButtonColor,
                    color: watchedButtonTextColor,
                  }}
                >
                  Shop Now
                </button>
              </div>
            </div>

            {/* Banner Type Badge */}
            {watchedType && (
              <div className="absolute top-4 right-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{
                    backgroundColor:
                      watchedType === BannerType.NEW_ARRIVAL
                        ? '#3B82F6'
                        : watchedType === BannerType.DISCOUNT
                        ? '#EF4444'
                        : '#A855F7',
                  }}
                >
                  {watchedType === BannerType.NEW_ARRIVAL
                    ? 'New Arrival'
                    : watchedType === BannerType.DISCOUNT
                    ? 'Discount'
                    : 'Coming Soon'}
                </span>
              </div>
            )}
          </div>

          {/* Banner Info */}
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Type:</span>
              <span className="font-semibold">
                {watchedIsCarousel ? 'Carousel Banner' : 'Simple Banner'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Image Size:</span>
              <span className="font-semibold">
                {watchedImageWidth} × {watchedImageHeight} px
              </span>
            </div>
          </div>

          {/* Color Preview Info */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: watchedBannerColor }}
              />
              <span className="text-gray-600">Background: {watchedBannerColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: watchedTitleColor }}
              />
              <span className="text-gray-600">Title: {watchedTitleColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: watchedDescriptionColor }}
              />
              <span className="text-gray-600">Description: {watchedDescriptionColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: watchedButtonColor }}
              />
              <span className="text-gray-600">Button: {watchedButtonColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: watchedButtonTextColor }}
              />
              <span className="text-gray-600">Button Text: {watchedButtonTextColor}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

