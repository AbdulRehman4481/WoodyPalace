'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderFilters } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDateTime, debounce } from '@/lib/utils';
import {
  Search,
  Filter,
  Eye,
  Edit,
  User,
  Calendar,
  DollarSign,
  RefreshCw,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OrderListProps {
  onOrderSelect?: (order: Order) => void;
  onOrderEdit?: (order: Order) => void;
  showActions?: boolean;
}

export function OrderList({ onOrderSelect, onOrderEdit, showActions = true }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<OrderFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Load orders
  const loadOrders = async (page = 1, newFilters = filters, search = '') => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (search || isSearchMode) {
        params.append('search', 'true');
        if (search) params.append('query', search);
        if (newFilters.status) params.append('status', newFilters.status);
        if (newFilters.paymentStatus) params.append('paymentStatus', newFilters.paymentStatus);
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

      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.data.data || []);
      setPagination(prev => ({
        ...prev,
        page: data.data.pagination.page,
        total: data.data.pagination.total,
        totalPages: data.data.pagination.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = debounce((query: string) => {
    if (query.trim()) {
      setIsSearchMode(true);
      loadOrders(1, filters, query);
    } else {
      setIsSearchMode(false);
      loadOrders(1, filters);
    }
  }, 300);

  // Initial load
  useEffect(() => {
    loadOrders();
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    loadOrders(1, newFilters, searchQuery);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    loadOrders(1, {}, '');
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    loadOrders(newPage, filters, searchQuery);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadOrders(pagination.page, filters, searchQuery);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      PROCESSING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      SHIPPED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      DELIVERED: 'bg-green-500/10 text-green-500 border-green-500/20',
      CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return statusColors[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  // Get payment status badge color
  const getPaymentStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      PAID: 'bg-green-500/10 text-green-500 border-green-500/20',
      FAILED: 'bg-red-500/10 text-red-500 border-red-500/20',
      REFUNDED: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };
    return statusColors[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const columns = [
    {
      header: 'Order #',
      cell: (order: Order) => (
        <div>
          <div className="font-medium text-foreground">{order.orderNumber}</div>
          <div className="text-xs text-muted-foreground">
            {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer',
      cell: (order: Order) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium text-foreground">
              {order.customer?.firstName} {order.customer?.lastName}
            </div>
            <div className="text-xs text-muted-foreground">{order.customer?.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (order: Order) => (
        <Badge variant="outline" className={getStatusBadge(order.status)}>
          {order.status}
        </Badge>
      ),
    },
    {
      header: 'Payment',
      cell: (order: Order) => (
        <Badge variant="outline" className={getPaymentStatusBadge(order.paymentStatus)}>
          {order.paymentStatus}
        </Badge>
      ),
    },
    {
      header: 'Total',
      cell: (order: Order) => (
        <div className="flex items-center gap-1 font-medium text-foreground">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          {formatCurrency(order.totalAmount)}
        </div>
      ),
    },
    {
      header: 'Date',
      cell: (order: Order) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDateTime(order.createdAt)}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (order: Order) => (
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
              <DropdownMenuItem onClick={() => onOrderSelect?.(order)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOrderEdit?.(order)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Order
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
            placeholder="Search orders, customers..."
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
              value={filters.status || '__all__'}
              onValueChange={(value) => handleFilterChange('status', value === '__all__' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Status</label>
            <Select
              value={filters.paymentStatus || '__all__'}
              onValueChange={(value) => handleFilterChange('paymentStatus', value === '__all__' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All payment statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All payment statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
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
      {loading && !orders.length ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          {error}
        </div>
      ) : (
        <GlassTable
          data={orders}
          columns={columns}
        />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} orders
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
