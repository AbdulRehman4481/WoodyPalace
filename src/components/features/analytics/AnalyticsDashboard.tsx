'use client';

import React, { useState } from 'react';
import { DashboardAnalytics, RealTimeMetrics } from '@/types/analytics';
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
  Calendar,
  Activity
} from 'lucide-react';
import { SalesChart } from './SalesChart';
import { InventoryReport } from './InventoryReport';
import { CustomerAnalytics } from './CustomerAnalytics';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading';

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
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-500';
    if (growth < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getAlertSeverity = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'LOW': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8 flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground mb-4">No analytics data available</p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline">
            Refresh
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end gap-2">
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh} className="bg-white/5 border-white/10 hover:bg-white/10">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
        {onExport && (
          <Button variant="outline" onClick={() => onExport('dashboard')} className="bg-white/5 border-white/10 hover:bg-white/10">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>

      {/* Real-time Metrics */}
      {realTimeData && (
        <div className="glass-card p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />
          <div className="flex items-center gap-2 mb-6">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
            </div>
            <h3 className="font-semibold text-lg">Real-time Metrics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="text-3xl font-bold gradient-text mb-1">{realTimeData.activeUsers}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="text-3xl font-bold gradient-text mb-1">{realTimeData.currentOrders}</div>
              <div className="text-sm text-muted-foreground">Current Orders</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="text-3xl font-bold gradient-text mb-1">{formatCurrency(realTimeData.revenueToday)}</div>
              <div className="text-sm text-muted-foreground">Revenue Today</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="text-3xl font-bold gradient-text mb-1">{realTimeData.ordersToday}</div>
              <div className="text-sm text-muted-foreground">Orders Today</div>
            </div>
          </div>
          <div className="text-center mt-4">
            <div className="text-xs text-muted-foreground/50">
              Last updated: {formatDate(realTimeData.lastUpdated)}
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold mb-2">{formatCurrency(data.overview.totalRevenue)}</p>
          <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(data.overview.revenueGrowth)}`}>
            {getGrowthIcon(data.overview.revenueGrowth)}
            <span>{data.overview.revenueGrowth.toFixed(1)}% from last month</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold mb-2">{data.overview.totalOrders.toLocaleString()}</p>
          <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(data.overview.orderGrowth)}`}>
            {getGrowthIcon(data.overview.orderGrowth)}
            <span>{data.overview.orderGrowth.toFixed(1)}% from last month</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold mb-2">{data.overview.totalCustomers.toLocaleString()}</p>
          <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(data.overview.customerGrowth)}`}>
            {getGrowthIcon(data.overview.customerGrowth)}
            <span>{data.overview.customerGrowth.toFixed(1)}% from last month</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Package className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <p className="text-2xl font-bold mb-2">{data.overview.totalProducts.toLocaleString()}</p>
          <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(data.overview.productGrowth)}`}>
            {getGrowthIcon(data.overview.productGrowth)}
            <span>{data.overview.productGrowth.toFixed(1)}% from last month</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="glass-card p-6 rounded-xl border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-lg">Alerts & Notifications</h3>
          </div>
          <div className="space-y-3">
            {data.alerts.slice(0, 5).map((alert, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                <div>
                  <div className="font-medium">{alert.title}</div>
                  <div className="text-sm text-muted-foreground">{alert.message}</div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={getAlertSeverity(alert.severity)}>{alert.severity}</Badge>
                  <div className="text-xs text-muted-foreground mt-1">{formatDate(alert.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Detailed Analytics</h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-white/5 px-3 py-1.5 rounded-md">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(_dateRange.from)} - {formatDate(_dateRange.to)}
              </span>
            </div>

            <div className="flex p-1 bg-black/20 rounded-lg">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'sales', label: 'Sales' },
                { key: 'inventory', label: 'Inventory' },
                { key: 'customers', label: 'Customers' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    activeTab === key
                      ? "bg-primary text-white shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Sales Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-medium text-lg">{formatCurrency(data.sales.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-muted-foreground">Total Orders</span>
                      <span className="font-medium text-lg">{data.sales.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-muted-foreground">Average Order Value</span>
                      <span className="font-medium text-lg">{formatCurrency(data.sales.averageOrderValue)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-muted-foreground">Revenue Growth</span>
                      <span className={`font-medium text-lg ${getGrowthColor(data.sales.revenueGrowth)}`}>
                        {data.sales.revenueGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-500" />
                    Inventory Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-muted-foreground">Total Products</span>
                      <span className="font-medium text-lg">{data.inventory.totalProducts}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-muted-foreground">Total Value</span>
                      <span className="font-medium text-lg">{formatCurrency(data.inventory.totalValue)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-muted-foreground">Low Stock</span>
                      <span className="font-medium text-lg text-yellow-500">{data.inventory.lowStockProducts.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-muted-foreground">Out of Stock</span>
                      <span className="font-medium text-lg text-red-500">{data.inventory.outOfStockProducts.length}</span>
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
        </div>
      </div>
    </div>
  );
}
