'use client';

import React, { useState } from 'react';
import type { SalesAnalytics } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';

interface SalesChartProps {
  data?: SalesAnalytics;
  loading?: boolean;
  onRefresh?: () => void;
}

export function SalesChart({ data, loading = false, onRefresh }: SalesChartProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trend' | 'categories' | 'products'>('overview');

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
            <p className="text-gray-500">No sales data available</p>
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

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
                <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(data.revenueGrowth)}`}>
                  {getGrowthIcon(data.revenueGrowth)}
                  <span>{data.revenueGrowth.toFixed(1)}%</span>
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
                <p className="text-2xl font-bold">{data.totalOrders.toLocaleString()}</p>
                <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(data.orderGrowth)}`}>
                  {getGrowthIcon(data.orderGrowth)}
                  <span>{data.orderGrowth.toFixed(1)}%</span>
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
                <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(data.averageOrderValue)}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Products</p>
                <p className="text-2xl font-bold">{data.topProducts.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sales Analytics</CardTitle>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            )}
          </div>
          <div className="flex space-x-1">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'trend', label: 'Trend', icon: TrendingUp },
              { key: 'categories', label: 'Categories', icon: PieChart },
              { key: 'products', label: 'Products', icon: Package },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sales Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Recent Sales by Period</h4>
                  <div className="space-y-2">
                    {data.salesByPeriod.slice(0, 5).map((period, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{period.period}</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(period.revenue)}</div>
                          <div className="text-xs text-gray-500">{period.orders} orders</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sales by Category</h4>
                  <div className="space-y-2">
                    {data.salesByCategory.slice(0, 5).map((category, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{category.categoryName}</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(category.revenue)}</div>
                          <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trend' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sales Trend</h3>
              <div className="space-y-2">
                {data.salesTrend.slice(0, 10).map((trend, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">{formatDate(trend.date)}</div>
                      <div className="text-sm text-gray-500">{trend.orders} orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(trend.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sales by Category</h3>
              <div className="space-y-2">
                {data.salesByCategory.map((category, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">{category.categoryName}</div>
                      <div className="text-sm text-gray-500">{category.orders} orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(category.revenue)}</div>
                      <Badge variant="outline">{category.percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Top Selling Products</h3>
              <div className="space-y-2">
                {data.topProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">{product.productName}</div>
                      <div className="text-sm text-gray-500">
                        {product.quantitySold} sold • {formatCurrency(product.averagePrice)} avg
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(product.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
