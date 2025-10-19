'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductFilters } from '@/types/product';
import { PaginatedResponse } from '@/types/common';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter, X, Package } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';

interface ProductListProps {
  initialProducts?: PaginatedResponse<Product>;
  onProductSelect?: (product: Product) => void;
  onProductEdit?: (product: Product) => void;
  onProductDelete?: (product: Product) => void;
  onProductAdd?: () => void;
  showActions?: boolean;
}

export function ProductList({
  initialProducts,
  onProductSelect,
  onProductEdit,
  onProductDelete,
  onProductAdd,
  showActions = true,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Load products
  const loadProducts = async (page = 1, search = '', filterParams: ProductFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { query: search }),
        ...(filterParams.categoryId && { categoryId: filterParams.categoryId }),
        ...(filterParams.isActive !== undefined && { isActive: filterParams.isActive.toString() }),
        ...(filterParams.isDiscontinued !== undefined && { isDiscontinued: filterParams.isDiscontinued.toString() }),
        ...(filterParams.priceMin !== undefined && { priceMin: filterParams.priceMin.toString() }),
        ...(filterParams.priceMax !== undefined && { priceMax: filterParams.priceMax.toString() }),
        ...(filterParams.inventoryMin !== undefined && { inventoryMin: filterParams.inventoryMin.toString() }),
        ...(filterParams.inventoryMax !== undefined && { inventoryMax: filterParams.inventoryMax.toString() }),
      });

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      setProducts(data.data.data);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts.data);
      setPagination(initialProducts.pagination);
    } else {
      loadProducts();
    }
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    loadProducts(1, query, filters);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    loadProducts(1, searchQuery, newFilters);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    loadProducts(1, '', {});
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    loadProducts(page, searchQuery, filters);
  };

  // Handle product actions
  const handleProductAction = async (action: string, product: Product) => {
    switch (action) {
      case 'edit':
        onProductEdit?.(product);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
          onProductDelete?.(product);
        }
        break;
      case 'view':
        onProductSelect?.(product);
        break;
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Products</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              {showActions && (
                  <Link href='/products/new'>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />

                  Add Product
                </Button>
                  </Link>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products by name, description, or SKU..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.isActive?.toString() || '__all__'}
                  onValueChange={(value) => handleFilterChange('isActive', value === '__all__' ? undefined : value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All statuses</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Discontinued</label>
                <Select
                  value={filters.isDiscontinued?.toString() || '__all__'}
                  onValueChange={(value) => handleFilterChange('isDiscontinued', value === '__all__' ? undefined : value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All products</SelectItem>
                    <SelectItem value="false">Active products</SelectItem>
                    <SelectItem value="true">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Min Price</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.priceMin || ''}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Max Price</label>
                <Input
                  type="number"
                  placeholder="999.99"
                  value={filters.priceMax || ''}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div className="md:col-span-4 flex justify-end">
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button variant="outline" onClick={() => loadProducts()} className="mt-2">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAction={handleProductAction}
              showActions={showActions}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <EmptyState
            icon={Package}
            title="No products found"
            description={searchQuery || Object.keys(filters).length > 0
              ? "Try adjusting your search or filters"
              : "Get started by adding your first product to the catalog"}
            action={showActions ? {
              label: "Add Product",
              onClick: onProductAdd || (() => {}),
            } : undefined}
          />
        )
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </div>
      )}

      {/* Loading overlay */}
      {loading && products.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
