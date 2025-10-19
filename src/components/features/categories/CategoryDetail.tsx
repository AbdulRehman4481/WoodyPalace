'use client';

import React, { useState } from 'react';
import { Category } from '@/types/category';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package, 
  Calendar,
  Folder,
  FolderOpen,
  Users,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CategoryDetailProps {
  category: Category;
}

export function CategoryDetail({ category }: CategoryDetailProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleEdit = () => {
    router.push(`/admin/categories/${category.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/categories');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/categories');
  };

  const handleAddSubcategory = () => {
    router.push(`/admin/categories/new?parentId=${category.id}`);
  };

  const handleViewProducts = () => {
    router.push(`/admin/products?categoryId=${category.id}`);
  };

  const getStatusBadge = () => {
    if (!category.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getProductCountBadge = () => {
    if (category.productCount === 0) {
      return <Badge variant="outline">No Products</Badge>;
    }
    if (category.productCount === 1) {
      return <Badge variant="outline">1 Product</Badge>;
    }
    return <Badge variant="outline">{category.productCount} Products</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
          <div className="flex items-center space-x-2">
            {category.children && category.children.length > 0 ? (
              <FolderOpen className="h-6 w-6 text-blue-500" />
            ) : (
              <Folder className="h-6 w-6 text-gray-400" />
            )}
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-gray-600">/{category.slug}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          {getProductCountBadge()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Image */}
          {category.image && (
            <Card>
              <CardHeader>
                <CardTitle>Category Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full max-w-md aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                    unoptimized={category.image.includes('cloudinary.com')}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {category.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{category.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Parent Category */}
          {category.parent && (
            <Card>
              <CardHeader>
                <CardTitle>Parent Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Folder className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{category.parent.name}</span>
                  <Badge variant="outline">/{category.parent.slug}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subcategories */}
          {category.children && category.children.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Subcategories</span>
                  <span className="text-sm font-normal text-gray-500">
                    {category.children.length} subcategor{category.children.length !== 1 ? 'ies' : 'y'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/admin/categories/${child.id}`)}
                    >
                      {child.children && child.children.length > 0 ? (
                        <FolderOpen className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Folder className="h-5 w-5 text-gray-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{child.name}</p>
                        <p className="text-xs text-gray-500 truncate">/{child.slug}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {child.productCount || 0} products
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Products in this Category</span>
                <Button variant="outline" size="sm" onClick={handleViewProducts}>
                  <Package className="h-4 w-4 mr-2" />
                  View All Products
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {category.productCount === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No products in this category</p>
                  <Button className="mt-2" onClick={handleViewProducts}>
                    <Package className="h-4 w-4 mr-2" />
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    This category contains {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                  </p>
                  <Button onClick={handleViewProducts}>
                    <Package className="h-4 w-4 mr-2" />
                    View Products
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category Information */}
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  <span>Products</span>
                </div>
                <span className="font-semibold">{category.productCount || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Subcategories</span>
                </div>
                <span className="font-semibold">{category.children?.length || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Created</span>
                </div>
                <span className="text-sm">{formatDateTime(category.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Updated</span>
                </div>
                <span className="text-sm">{formatDateTime(category.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleEdit} className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit Category
              </Button>
              <Button 
                variant="outline" 
                onClick={handleAddSubcategory}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subcategory
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleting}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete Category'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Level:</span>
                <span>{category.parent ? 'Subcategory' : 'Root Category'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sort Order:</span>
                <span>{category.sortOrder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="capitalize">
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
