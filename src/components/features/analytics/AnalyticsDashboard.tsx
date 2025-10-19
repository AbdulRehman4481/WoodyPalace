'use client';

import React, { useState } from 'react';
import { DashboardAnalytics, RealTimeMetrics } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users,
  Package,
  AlertTriangle,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react';
import { SalesChart } from './SalesChart';
import { InventoryReport } from './InventoryReport';
import { CustomerAnalytics } from './CustomerAnalytics';

interface AnalyticsDashboardProps {
  data?: DashboardAnalytics;
  realTimeData?: RealTimeMetrics;
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: (type: string) => void;
}

export function AnalyticsDashboard({ 
  data, 
  realTimeData, 
  loading = false, 
  onRefresh, 
  onExport 
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'inventory' | 'customers'>('overview');
  const [_dateRange, _setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getAlertSeverity = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-gray-500">No analytics data available</p>
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          {onExport && (
            <Button variant="outline" onClick={() => onExport('dashboard')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Real-time Metrics */}
      {realTimeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{realTimeData.activeUsers}</div>
                <div className="text-sm text-gray-500">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{realTimeData.currentOrders}</div>
                <div className="text-sm text-gray-500">Current Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(realTimeData.revenueToday)}</div>
                <div className="text-sm text-gray-500">Revenue Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{realTimeData.ordersToday}</div>
                <div className="text-sm text-gray-500">Orders Today</div>
              </div>
            </div>
            <div className="text-center mt-4">
              <div className="text-sm text-gray-500">
                Last updated: {formatDate(realTimeData.lastUpdated)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</p>
                <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(data.overview.revenueGrowth)}`}>
                  {getGrowthIcon(data.overview.revenueGrowth)}
                  <span>{data.overview.revenueGrowth.toFixed(1)}%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{data.overview.totalOrders.toLocaleString()}</p>
                <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(data.overview.orderGrowth)}`}>
                  {getGrowthIcon(data.overview.orderGrowth)}
                  <span>{data.overview.orderGrowth.toFixed(1)}%</span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{data.overview.totalCustomers.toLocaleString()}</p>
                <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(data.overview.customerGrowth)}`}>
                  {getGrowthIcon(data.overview.customerGrowth)}
                  <span>{data.overview.customerGrowth.toFixed(1)}%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{data.overview.totalProducts.toLocaleString()}</p>
                <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(data.overview.productGrowth)}`}>
                  {getGrowthIcon(data.overview.productGrowth)}
                  <span>{data.overview.productGrowth.toFixed(1)}%</span>
                </div>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Alerts & Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.alerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm text-gray-500">{alert.message}</div>
                  </div>
                  <div className="text-right">
                    <Badge className={getAlertSeverity(alert.severity)}>{alert.severity}</Badge>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(alert.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detailed Analytics</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(_dateRange.from)} - {formatDate(_dateRange.to)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'sales', label: 'Sales' },
              { key: 'inventory', label: 'Inventory' },
              { key: 'customers', label: 'Customers' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sales Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-medium">{formatCurrency(data.sales.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Orders</span>
                      <span className="font-medium">{data.sales.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Order Value</span>
                      <span className="font-medium">{formatCurrency(data.sales.averageOrderValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue Growth</span>
                      <span className={`font-medium ${getGrowthColor(data.sales.revenueGrowth)}`}>
                        {data.sales.revenueGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Inventory Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Products</span>
                      <span className="font-medium">{data.inventory.totalProducts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Value</span>
                      <span className="font-medium">{formatCurrency(data.inventory.totalValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Stock</span>
                      <span className="font-medium text-yellow-600">{data.inventory.lowStockProducts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Out of Stock</span>
                      <span className="font-medium text-red-600">{data.inventory.outOfStockProducts.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <SalesChart data={data.sales} onRefresh={onRefresh} />
          )}

          {activeTab === 'inventory' && (
            <InventoryReport data={data.inventory} onRefresh={onRefresh} />
          )}

          {activeTab === 'customers' && (
            <CustomerAnalytics data={data.customers} onRefresh={onRefresh} />
          )}
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {formatDate(data.lastUpdated)}
      </div>
    </div>
  );
}
