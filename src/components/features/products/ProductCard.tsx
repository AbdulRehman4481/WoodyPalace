'use client';

import React from 'react';
import { Product } from '@/types/product';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign, 
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  onAction?: (action: string, product: Product) => void;
  showActions?: boolean;
}

export function ProductCard({ product, onAction, showActions = true }: ProductCardProps) {
  const handleAction = (action: string) => {
    onAction?.(action, product);
  };

  const getStatusBadge = () => {
    if (product.isDiscontinued) {
      return <Badge variant="destructive">Discontinued</Badge>;
    }
    if (!product.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getInventoryBadge = () => {
    if (product.inventoryQuantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (product.inventoryQuantity < 10) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    return <Badge variant="outline">In Stock</Badge>;
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate" title={product.name}>
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 truncate" title={product.sku}>
              SKU: {product.sku}
            </p>
          </div>
          <div className="flex flex-col space-y-1 ml-2">
            {getStatusBadge()}
            {getInventoryBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              unoptimized={product.images[0]?.includes('cloudinary.com')}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <ImageIcon className="h-12 w-12" />
            </div>
          )}
          
          {/* Image count indicator */}
          {product.images && product.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              +{product.images.length - 1}
            </div>
          )}
        </div>

        {/* Product Description */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2" title={product.description}>
            {product.description}
          </p>
        )}

        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.categories.slice(0, 2).map((category) => (
              <Badge key={category.id} variant="outline" className="text-xs">
                {category.category?.name}
              </Badge>
            ))}
            {product.categories.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{product.categories.length - 2} more
              </Badge>
            )}
          </div>
        )}

        {/* Product Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>Price</span>
            </div>
            <span className="font-semibold">{formatCurrency(product.price)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Package className="h-4 w-4 mr-1" />
              <span>Stock</span>
            </div>
            <span className="font-semibold">{product.inventoryQuantity}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Created</span>
            </div>
            <span className="text-xs">{formatDate(product.createdAt)}</span>
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
