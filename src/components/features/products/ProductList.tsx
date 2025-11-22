'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductFilters } from '@/types/product';
import { PaginatedResponse } from '@/types/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X, MoreHorizontal, Edit, Trash, Eye } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';
import { GlassTable } from '@/components/ui/GlassTable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

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

  const columns = [
    {
      header: 'Product',
      cell: (product: Product) => (
        <div className="flex items-center gap-3">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-10 w-10 rounded-lg object-cover border border-white/10"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-white/10">
              <span className="text-xs font-bold text-primary">
                {product.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{product.name}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {product.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Price',
      cell: (product: Product) => (
        <span className="font-medium">{formatCurrency(product.price)}</span>
      ),
    },
    {
      header: 'Inventory',
      cell: (product: Product) => (
        <Badge variant={product.inventoryQuantity > 10 ? 'outline' : 'destructive'} className="glass-border">
          {product.inventoryQuantity} in stock
        </Badge>
      ),
    },
    {
      header: 'Status',
      cell: (product: Product) => (
        <Badge
          variant={product.isActive ? 'default' : 'secondary'}
          className={product.isActive ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20' : ''}
        >
          {product.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (product: Product) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onProductSelect?.(product)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onProductEdit?.(product)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Product
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onProductDelete?.(product)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-background/50 border-white/10 focus:border-primary/50"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-primary/10 border-primary/20 text-primary' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="glass-card p-6 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.isActive?.toString() || '__all__'}
              onValueChange={(value) => handleFilterChange('isActive', value === '__all__' ? undefined : value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Price Range</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceMin || ''}
                onChange={(e) => handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceMax || ''}
                onChange={(e) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="md:col-span-4 flex justify-end">
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading && !products.length ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <GlassTable
          data={products}
          columns={columns}
        />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Showing {products.length} of {pagination.total} products
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadProducts(pagination.page - 1, searchQuery, filters)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadProducts(pagination.page + 1, searchQuery, filters)}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
