'use client';

import React, { useState, useEffect } from 'react';
import { Customer, CustomerFilters } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDateTime, debounce } from '@/lib/utils';
import {
  Search,
  Filter,
  Eye,
  Edit,
  User,
  Mail,
  Phone,
  Calendar,
  Package,
  RefreshCw,
  UserCheck,
  UserX,
  X,
  MoreHorizontal
} from 'lucide-react';
import { GlassTable } from '@/components/ui/GlassTable';
import { LoadingSpinner } from '@/components/ui/loading';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CustomerListProps {
  onCustomerSelect?: (customer: Customer) => void;
  onCustomerEdit?: (customer: Customer) => void;
  onCustomerAdd?: () => void;
  showActions?: boolean;
}

export function CustomerList({ onCustomerSelect, onCustomerEdit, onCustomerAdd, showActions = true }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Load customers
  const loadCustomers = async (page = 1, newFilters = filters, search = '') => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (search || isSearchMode) {
        params.append('search', 'true');
        if (search) params.append('query', search);
        if (newFilters.isActive !== undefined) params.append('isActive', String(newFilters.isActive));
        if (newFilters.hasOrders !== undefined) params.append('hasOrders', String(newFilters.hasOrders));
      } else {
        Object.entries(newFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value));
          }
        });
      }

      params.append('page', String(page));
      params.append('limit', String(pagination.limit));
      params.append('sortBy', 'createdAt');
      params.append('sortOrder', 'desc');

      const response = await fetch(`/api/customers?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch customers');
      }

      setCustomers(data.data.data || []);
      setPagination(prev => ({
        ...prev,
        page: data.data.pagination.page,
        total: data.data.pagination.total,
        totalPages: data.data.pagination.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = debounce((query: string) => {
    if (query.trim()) {
      setIsSearchMode(true);
      loadCustomers(1, filters, query);
    } else {
      setIsSearchMode(false);
      loadCustomers(1, filters);
    }
  }, 300);

  // Initial load
  useEffect(() => {
    loadCustomers();
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof CustomerFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    loadCustomers(1, newFilters, searchQuery);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    loadCustomers(1, {}, '');
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    loadCustomers(newPage, filters, searchQuery);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadCustomers(pagination.page, filters, searchQuery);
  };

  // Toggle customer active status
  const handleToggleStatus = async (customer: Customer) => {
    try {
      const response = await fetch(`/api/customers/${customer.id}/toggle-status`, {
        method: 'PUT',
      });

      if (response.ok) {
        loadCustomers(pagination.page, filters, searchQuery);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update customer status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      alert('Failed to update customer status');
    }
  };

  const columns = [
    {
      header: 'Customer',
      cell: (customer: Customer) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-white/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium text-foreground">
              {customer.firstName} {customer.lastName}
            </div>
            <div className="text-xs text-muted-foreground">ID: {customer.id.slice(-8)}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      cell: (customer: Customer) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span>{customer.email}</span>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{customer.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (customer: Customer) => (
        <Badge
          variant={customer.isActive ? 'default' : 'secondary'}
          className={customer.isActive ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20' : ''}
        >
          {customer.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Orders',
      cell: (customer: Customer) => (
        <div className="flex items-center gap-1 font-medium text-foreground">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{customer.orders?.length || 0}</span>
        </div>
      ),
    },
    {
      header: 'Joined',
      cell: (customer: Customer) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDateTime(customer.createdAt)}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (customer: Customer) => (
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
              <DropdownMenuItem onClick={() => onCustomerSelect?.(customer)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCustomerEdit?.(customer)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleToggleStatus(customer)}>
                {customer.isActive ? (
                  <>
                    <UserX className="mr-2 h-4 w-4 text-red-500" />
                    <span className="text-red-500">Deactivate</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                    <span className="text-green-500">Activate</span>
                  </>
                )}
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
            placeholder="Search customers..."
            value={searchQuery}
            onChange={handleSearchChange}
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
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="glass-card p-6 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.isActive !== undefined ? String(filters.isActive) : '__all__'}
              onValueChange={(value) => handleFilterChange('isActive', value === '__all__' ? '' : value)}
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Order Status</label>
            <Select
              value={filters.hasOrders !== undefined ? String(filters.hasOrders) : '__all__'}
              onValueChange={(value) => handleFilterChange('hasOrders', value === '__all__' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All customers</SelectItem>
                <SelectItem value="true">With orders</SelectItem>
                <SelectItem value="false">Without orders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date From</label>
            <Input
              type="date"
              value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value).toISOString() : '')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date To</label>
            <Input
              type="date"
              value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value ? new Date(e.target.value).toISOString() : '')}
            />
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
      {loading && !customers.length ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          {error}
        </div>
      ) : (
        <GlassTable
          data={customers}
          columns={columns}
        />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} customers
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
