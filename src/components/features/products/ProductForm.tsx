'use client';

import React, { useState, useEffect } from 'react';
import { Product, CreateProductRequest, UpdateProductRequest, HomePageSection } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, updateProductSchema } from '@/lib/validations';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface Category {
  id: string;
  name: string;
}

export function ProductForm({ product, onSubmit, onCancel, loading = false }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const isEditing = !!product;
  const schema = isEditing ? updateProductSchema : createProductSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateProductRequest | UpdateProductRequest>({
    resolver: zodResolver(schema),
    defaultValues: product ? {
      name: product.name,
      description: product.description || '',
      price: product.price,
      sku: product.sku,
      inventoryQuantity: product.inventoryQuantity,
      isActive: product.isActive,
      isDiscontinued: product.isDiscontinued,
      images: product.images,
      categoryIds: product.categories?.map(c => c.categoryId) || [],
      homePageSection: product.homePageSection || null,
      discountPercentage: product.discountPercentage || null,
    } : {
      name: '',
      description: '',
      price: 0,
      sku: '',
      inventoryQuantity: 0,
      isActive: true,
      isDiscontinued: false,
      images: [],
      categoryIds: [],
      homePageSection: null,
      discountPercentage: null,
    },
  });

  const watchedPrice = watch('price');
  const watchedHomePageSection = watch('homePageSection');

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success) {
          setCategories(data.data.data || []);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setSelectedCategories(product.categories?.map(c => c.categoryId) || []);
      setImages(product.images || []);
    }
  }, [product]);

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('file', file); // Changed from 'image' to 'file'
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        const newImages = data.data.files.map((file: { url: string }) => file.url);
        setImages(prev => [...prev, ...newImages]);
        setValue('images', [...images, ...newImages]);
        
        // Success toast
        const { toast } = await import('@/lib/toast');
        toast.success(`${newImages.length} image(s) uploaded successfully`);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      const { toast } = await import('@/lib/toast');
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove image
  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue('images', newImages);

    // If it's a Cloudinary URL, delete from Cloudinary
    if (imageToRemove && imageToRemove.includes('cloudinary.com')) {
      try {
        const { extractPublicIdFromCloudinaryUrl } = await import('@/lib/image-utils');
        const publicId = extractPublicIdFromCloudinaryUrl(imageToRemove);
        
        if (publicId) {
          await fetch('/api/upload/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ publicIds: [publicId] }),
          });
        }
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
        // Don't show error to user as the image is already removed from the form
      }
    }
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    let newCategories;
    if (checked) {
      newCategories = [...selectedCategories, categoryId];
    } else {
      newCategories = selectedCategories.filter(id => id !== categoryId);
    }
    setSelectedCategories(newCategories);
    setValue('categoryIds', newCategories);
  };

  // Handle form submission
  const onFormSubmit = async (data: CreateProductRequest | UpdateProductRequest) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit, async (errors) => {
      console.log('Form validation errors:', errors);
      const { toast } = await import('@/lib/toast');
      toast.error('Please fix the form errors before submitting');
    })} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter product description"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    {...register('sku')}
                    placeholder="Enter SKU"
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-600 mt-1">{errors.sku.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                  )}
                  {watchedPrice !== undefined && watchedPrice !== null && watchedPrice > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {formatCurrency(watchedPrice)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="inventoryQuantity">Inventory Quantity</Label>
                <Input
                  id="inventoryQuantity"
                  type="number"
                  min="0"
                  {...register('inventoryQuantity', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.inventoryQuantity && (
                  <p className="text-sm text-red-600 mt-1">{errors.inventoryQuantity.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="homePageSection">Home Page Section</Label>
                <Select
                  value={watchedHomePageSection || 'none'}
                  onValueChange={(value) => {
                    const sectionValue = value === 'none' ? null : value as HomePageSection;
                    setValue('homePageSection', sectionValue);
                    // Clear discount if section is not LATEST_DEALS
                    if (sectionValue !== 'LATEST_DEALS') {
                      setValue('discountPercentage', null);
                    }
                  }}
                >
                  <SelectTrigger id="homePageSection">
                    <SelectValue placeholder="Select a section (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="BEST_SELLERS">Best Sellers</SelectItem>
                    <SelectItem value="LATEST_DEALS">Latest Deals</SelectItem>
                    <SelectItem value="TRENDING_THIS_WEEK">Trending This Week</SelectItem>
                    <SelectItem value="TOP_SELLING_PRODUCTS">Top Selling Products</SelectItem>
                  </SelectContent>
                </Select>
                {errors.homePageSection && (
                  <p className="text-sm text-red-600 mt-1">{errors.homePageSection.message}</p>
                )}
              </div>

              {watchedHomePageSection === 'LATEST_DEALS' && (
                <div>
                  <Label htmlFor="discountPercentage">Discount Percentage *</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register('discountPercentage', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.discountPercentage && (
                    <p className="text-sm text-red-600 mt-1">{errors.discountPercentage.message}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    Enter discount percentage (0-100)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(category.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`category-${category.id}`} className="text-sm">
                      {category.name}
                    </Label>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-gray-500">No categories available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  {...register('isActive')}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              {isEditing && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDiscontinued"
                    {...register('isDiscontinued')}
                  />
                  <Label htmlFor="isDiscontinued">Discontinued</Label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Button */}
              <div>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                    </p>
                  </div>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImages}
                />
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploaded Images:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={image}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                            unoptimized={image.includes('cloudinary.com')}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
