'use client';

import React, { useState, useEffect } from 'react';
import { Deal, CreateDealRequest, UpdateDealRequest, Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDealSchema, updateDealSchema } from '@/lib/validations';
import { Loader2, X, Clock, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DealFormProps {
  deal?: Deal;
  onSubmit: (data: CreateDealRequest | UpdateDealRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function DealForm({ deal, onSubmit, onCancel, loading = false }: DealFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [massiveDealProductId, setMassiveDealProductId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const isEditing = !!deal;
  const schema = isEditing ? updateDealSchema : createDealSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema) as any,
    defaultValues: deal ? {
      title: deal.title,
      description: deal.description || '',
      startDate: deal.startDate ? new Date(deal.startDate).toISOString().slice(0, 16) : '',
      endDate: deal.endDate ? new Date(deal.endDate).toISOString().slice(0, 16) : '',
      massiveDealProductId: deal.massiveDealProductId || '',
      productIds: deal.dealProducts?.map(dp => dp.productId) || [],
      isActive: deal.isActive,
    } : {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      massiveDealProductId: '',
      productIds: [],
      isActive: true,
    },
  });

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=1000&isActive=true');
        const data = await response.json();
        if (data.success) {
          setProducts(data.data.data || []);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };

    loadProducts();
  }, []);

  // Initialize form with deal data
  useEffect(() => {
    if (deal) {
      const productIds = deal.dealProducts?.map(dp => dp.productId) || [];
      setSelectedProductIds(productIds);
      setMassiveDealProductId(deal.massiveDealProductId || '');
      setValue('productIds', productIds);
      setValue('massiveDealProductId', deal.massiveDealProductId || '');
    }
  }, [deal, setValue]);

  const handleProductToggle = (productId: string) => {
    const newSelected = selectedProductIds.includes(productId)
      ? selectedProductIds.filter(id => id !== productId)
      : [...selectedProductIds, productId];
    
    setSelectedProductIds(newSelected);
    setValue('productIds', newSelected);
  };

  const handleMassiveDealChange = (productId: string) => {
    setMassiveDealProductId(productId);
    setValue('massiveDealProductId', productId || undefined);
    
    // If product is not in selected list, add it
    if (productId && !selectedProductIds.includes(productId)) {
      const newSelected = [...selectedProductIds, productId];
      setSelectedProductIds(newSelected);
      setValue('productIds', newSelected);
    }
  };

  const removeProduct = (productId: string) => {
    const newSelected = selectedProductIds.filter(id => id !== productId);
    setSelectedProductIds(newSelected);
    setValue('productIds', newSelected);
    
    // If it was the massive deal, clear it
    if (massiveDealProductId === productId) {
      setMassiveDealProductId('');
      setValue('massiveDealProductId', undefined);
    }
  };

  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected products
  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
  const massiveDealProduct = products.find(p => p.id === massiveDealProductId);

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!watchedEndDate) return null;
    const end = new Date(watchedEndDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Deal Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter deal title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter deal description"
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date & Time *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...register('startDate')}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">End Date & Time *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                {...register('endDate')}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>
              )}
              {watchedEndDate && (
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Time remaining: {getTimeRemaining()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              {...register('isActive')}
              defaultChecked={deal?.isActive ?? true}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active (deal is live)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Massive Deal Product */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Massive Deal Product
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="massiveDealProduct">Select Massive Deal Product (Optional)</Label>
            <Select
              value={massiveDealProductId}
              onValueChange={handleMassiveDealChange}
            >
              <SelectTrigger id="massiveDealProduct">
                <SelectValue placeholder="Select a product for massive deal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - ${product.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {massiveDealProduct && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-900">{massiveDealProduct.name}</p>
                    <p className="text-sm text-blue-700">${massiveDealProduct.price}</p>
                  </div>
                  <Badge className="bg-red-500">Massive Deal</Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Add Products to Deal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="productSearch">Search Products</Label>
            <Input
              id="productSearch"
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Selected Products */}
          {selectedProducts.length > 0 && (
            <div>
              <Label>Selected Products ({selectedProducts.length})</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">${product.price} • SKU: {product.sku}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {massiveDealProductId === product.id && (
                        <Badge className="bg-red-500">Massive</Badge>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(product.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Products */}
          <div>
            <Label>Available Products</Label>
            <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-gray-500 p-4 text-center">No products found</p>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleProductToggle(product.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleProductToggle(product.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">${product.price} • SKU: {product.sku}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Deal' : 'Create Deal'}
        </Button>
      </div>
    </form>
  );
}

