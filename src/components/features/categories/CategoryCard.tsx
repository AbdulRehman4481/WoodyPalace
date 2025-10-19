'use client';

import React from 'react';
import { Category } from '@/types/category';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  Calendar,
  Folder,
  FolderOpen,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';

interface CategoryCardProps {
  category: Category;
  onAction?: (action: string, category: Category) => void;
  showActions?: boolean;
}

export function CategoryCard({ category, onAction, showActions = true }: CategoryCardProps) {
  const handleAction = (action: string) => {
    onAction?.(action, category);
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

  const getChildrenCountBadge = () => {
    if (!category.children || category.children.length === 0) {
      return null;
    }
    return (
      <Badge variant="secondary">
        {category.children.length} Subcategor{category.children.length === 1 ? 'y' : 'ies'}
      </Badge>
    );
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {category.children && category.children.length > 0 ? (
              <FolderOpen className="h-5 w-5 text-blue-500" />
            ) : (
              <Folder className="h-5 w-5 text-gray-400" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate" title={category.name}>
                {category.name}
              </h3>
              <p className="text-sm text-gray-600 truncate" title={category.slug}>
                /{category.slug}
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-1 ml-2">
            {getStatusBadge()}
            {getProductCountBadge()}
            {getChildrenCountBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category Image */}
        {category.image && (
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              unoptimized={category.image.includes('cloudinary.com')}
            />
          </div>
        )}

        {/* Description */}
        {category.description && (
          <p className="text-sm text-gray-600 line-clamp-2" title={category.description}>
            {category.description}
          </p>
        )}

        {/* Parent Category */}
        {category.parent && (
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Parent:</span>
            <Badge variant="outline" className="text-xs">
              {category.parent.name}
            </Badge>
          </div>
        )}

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Subcategories:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {category.children.slice(0, 3).map((child) => (
                <Badge key={child.id} variant="outline" className="text-xs">
                  {child.name}
                </Badge>
              ))}
              {category.children.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{category.children.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Category Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Package className="h-4 w-4 mr-1" />
              <span>Products</span>
            </div>
            <span className="font-semibold">{category.productCount || 0}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Created</span>
            </div>
            <span className="text-xs">{formatDate(category.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Updated</span>
            </div>
            <span className="text-xs">{formatDate(category.updatedAt)}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('view')}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('edit')}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('delete')}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
