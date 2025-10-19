'use client';

import React, { useState } from 'react';
import type { CustomerAnalytics as CustomerAnalyticsType } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  TrendingUp,
  BarChart3,
  PieChart,
  Star,
  RefreshCw
} from 'lucide-react';

interface CustomerAnalyticsProps {
  data?: CustomerAnalyticsType;
  loading?: boolean;
  onRefresh?: () => void;
}

export function CustomerAnalytics({ data, loading = false, onRefresh }: CustomerAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'segments' | 'lifetime' | 'retention'>('overview');

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
            <p className="text-gray-500">No customer data available</p>
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
    if (growth < 0) return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
    return null;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSegmentColor = (segment: string) => {
    switch (segment.toLowerCase()) {
      case 'high value': return 'bg-green-100 text-green-800';
      case 'medium value': return 'bg-blue-100 text-blue-800';
      case 'low value': return 'bg-yellow-100 text-yellow-800';
      case 'new': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{data.totalCustomers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold">{data.activeCustomers.toLocaleString()}</p>
                <div className="text-sm text-gray-500">
                  {((data.activeCustomers / data.totalCustomers) * 100).toFixed(1)}% active
                </div>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Customers</p>
                <p className="text-2xl font-bold">{data.newCustomers.toLocaleString()}</p>
                <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(data.customerGrowth)}`}>
                  {getGrowthIcon(data.customerGrowth)}
                  <span>{data.customerGrowth.toFixed(1)}%</span>
                </div>
              </div>
              <UserPlus className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Customer Value</p>
                <p className="text-2xl font-bold">{formatCurrency(data.averageCustomerValue)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer Analytics</CardTitle>
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
              { key: 'segments', label: 'Segments', icon: PieChart },
              { key: 'lifetime', label: 'Lifetime Value', icon: Star },
              { key: 'retention', label: 'Retention', icon: TrendingUp },
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
              <h3 className="text-lg font-semibold">Customer Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Top Customers</h4>
                  <div className="space-y-2">
                    {data.topCustomers.slice(0, 5).map((customer, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium">{customer.customerName}</div>
                          <div className="text-xs text-gray-500">{customer.totalOrders} orders</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatCurrency(customer.totalSpent)}</div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(customer.averageOrderValue)} avg
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Customer Segments</h4>
                  <div className="space-y-2">
                    {data.customerSegments.map((segment, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium">{segment.segment}</div>
                          <div className="text-xs text-gray-500">{segment.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{segment.count} customers</div>
                          <Badge className={getSegmentColor(segment.segment)}>
                            {segment.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'segments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Segments</h3>
              <div className="space-y-2">
                {data.customerSegments.map((segment, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">{segment.segment}</div>
                      <div className="text-sm text-gray-500">{segment.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{segment.count} customers</div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(segment.averageValue)} avg value
                      </div>
                      <Badge className={getSegmentColor(segment.segment)}>
                        {segment.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'lifetime' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Lifetime Value</h3>
              <div className="space-y-2">
                {data.customerLifetimeValue.slice(0, 10).map((customer, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">{customer.customerName}</div>
                      <div className="text-sm text-gray-500">
                        {customer.totalOrders} orders • {formatDate(customer.firstOrderDate)} - {formatDate(customer.lastOrderDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(customer.lifetimeValue)}</div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(customer.totalSpent)} total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'retention' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Retention</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{data.customerRetention.period}</div>
                    <div className="text-sm text-gray-500">Retention Analysis</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{data.customerRetention.retentionRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">
                      {data.customerRetention.returningCustomers} returning
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
