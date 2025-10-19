'use client';

import React, { useState } from 'react';
import type { InventoryAnalytics } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface InventoryReportProps {
  data?: InventoryAnalytics;
  loading?: boolean;
  onRefresh?: () => void;
}

export function InventoryReport({ data, loading = false, onRefresh }: InventoryReportProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'categories' | 'trend'>('overview');

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
            <p className="text-gray-500">No inventory data available</p>
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

  const getAlertSeverity = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (current <= minimum) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{data.totalProducts.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(data.totalValue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{data.lowStockProducts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{data.outOfStockProducts.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Report</CardTitle>
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
              { key: 'alerts', label: 'Alerts', icon: AlertTriangle },
              { key: 'categories', label: 'Categories', icon: Package },
              { key: 'trend', label: 'Trend', icon: TrendingUp },
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
              <h3 className="text-lg font-semibold">Inventory Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Low Stock Products</h4>
                  <div className="space-y-2">
                    {data.lowStockProducts.slice(0, 5).map((product, index) => {
                      const stockStatus = getStockStatus(product.currentStock, product.minimumStock);
                      return (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="text-sm font-medium">{product.productName}</div>
                            <div className="text-xs text-gray-500">{product.categoryName}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{product.currentStock} / {product.minimumStock}</div>
                            <Badge className={stockStatus.color}>{stockStatus.status}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Out of Stock Products</h4>
                  <div className="space-y-2">
                    {data.outOfStockProducts.slice(0, 5).map((product, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium">{product.productName}</div>
                          <div className="text-xs text-gray-500">{product.categoryName}</div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                          <div className="text-xs text-gray-500">{product.daysOutOfStock} days</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stock Alerts</h3>
              <div className="space-y-2">
                {data.stockAlerts.map((alert, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">{alert.productName}</div>
                      <div className="text-sm text-gray-500">
                        {alert.alertType.replace('_', ' ')} • {alert.currentStock} in stock
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getAlertSeverity(alert.severity)}>{alert.severity}</Badge>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(alert.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Inventory by Category</h3>
              <div className="space-y-2">
                {data.inventoryByCategory.map((category, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">{category.categoryName}</div>
                      <div className="text-sm text-gray-500">{category.totalProducts} products</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(category.totalValue)}</div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(category.averageValue)} avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'trend' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Inventory Trend</h3>
              <div className="space-y-2">
                {data.inventoryTrend.slice(0, 10).map((trend, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">{formatDate(trend.date)}</div>
                      <div className="text-sm text-gray-500">{trend.totalProducts} products</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(trend.totalValue)}</div>
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
