'use client';

import React, { useState, useEffect } from 'react';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';
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
import { createCategorySchema, updateCategorySchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';
import { Loader2, Folder, FolderOpen } from 'lucide-react';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  defaultParentId?: string;
}

export function CategoryForm({ category, onSubmit, onCancel, loading = false, defaultParentId }: CategoryFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  const isEditing = !!category;
  const schema = isEditing ? updateCategorySchema : createCategorySchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateCategoryRequest | UpdateCategoryRequest>({
    resolver: zodResolver(schema) as any,
    defaultValues: category ? {
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      image: category.image || '',
      parentId: category.parentId || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    } : {
      name: '',
      description: '',
      slug: '',
      image: '',
      parentId: defaultParentId || '',
      isActive: true,
      sortOrder: 0,
    },
  });

  const watchedName = watch('name');
  const watchedSlug = watch('slug');

  // Load categories for parent selection
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

  // Auto-generate slug when name changes
  useEffect(() => {
    if (autoGenerateSlug && watchedName && !isEditing) {
      const generatedSlug = slugify(watchedName);
      setValue('slug', generatedSlug);
    }
  }, [watchedName, autoGenerateSlug, setValue, isEditing]);

  // Initialize form with category data
  useEffect(() => {
    if (category) {
      setAutoGenerateSlug(false); // Don't auto-generate for existing categories
    }
  }, [category]);

  // Handle form submission
  const onFormSubmit = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    try {
      // Clean up empty strings
      const cleanedData = {
        ...data,
        parentId: data.parentId === '' ? undefined : data.parentId,
        description: data.description === '' ? undefined : data.description,
        image: data.image === '' ? undefined : data.image,
      };

      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Filter out current category and its descendants from parent options
  const getAvailableParents = () => {
    if (!category) return categories;
    
    const filterDescendants = (cats: Category[], excludeId: string): Category[] => {
      return cats.filter(cat => {
        if (cat.id === excludeId) return false;
        if (cat.children) {
          cat.children = filterDescendants(cat.children, excludeId);
        }
        return true;
      });
    };

    return filterDescendants(categories, category.id);
  };

  const availableParents = getAvailableParents();

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter category name"
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
                  placeholder="Enter category description"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <ImageUpload
                  value={watch('image')}
                  onChange={(url) => setValue('image', url || '')}
                  label="Category Image"
                  description="Upload an image to represent this category"
                />
                {errors.image && (
                  <p className="text-sm text-red-600 mt-1">{errors.image.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="category-slug"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
                  )}
                  {!isEditing && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="auto-generate-slug"
                        checked={autoGenerateSlug}
                        onCheckedChange={(checked) => setAutoGenerateSlug(checked as boolean)}
                      />
                      <Label htmlFor="auto-generate-slug" className="text-sm">
                        Auto-generate from name
                      </Label>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min="0"
                    {...register('sortOrder', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.sortOrder && (
                    <p className="text-sm text-red-600 mt-1">{errors.sortOrder.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Category */}
          <Card>
            <CardHeader>
              <CardTitle>Parent Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="parentId">Parent Category</Label>
                <Select
                  value={watch('parentId') || '__none__'}
                  onValueChange={(value) => setValue('parentId', value === '__none__' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No parent (root category)</SelectItem>
                    {availableParents.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.parentId && (
                  <p className="text-sm text-red-600 mt-1">{errors.parentId.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to create a root category
                </p>
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
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  {...register('isActive')}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Inactive categories won't be visible to customers
              </p>
            </CardContent>
          </Card>

          {/* Category Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Category Image Preview */}
                {watch('image') && (
                  <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={watch('image')}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {watch('parentId') ? (
                      <FolderOpen className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Folder className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="font-medium text-sm">
                      {watchedName || 'Category Name'}
                    </span>
                  </div>
                  {watchedSlug && (
                    <p className="text-xs text-gray-500">
                      /{watchedSlug}
                    </p>
                  )}
                  {watch('description') && (
                    <p className="text-xs text-gray-600">
                      {watch('description')}
                    </p>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      watch('isActive') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {watch('isActive') ? 'Active' : 'Inactive'}
                    </span>
                    {watch('parentId') && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                        Subcategory
                      </span>
                    )}
                  </div>
                </div>
              </div>
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
          {isEditing ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
}
