'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingPage } from '@/components/ui/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign,
  TrendingUp,
  RefreshCw,
  Download,
  BarChart3,
  Globe,
  Smile,
  ArrowRight,
  UserCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { DashboardAnalytics, RealTimeMetrics } from '@/types/analytics';
import { useRouter } from 'next/navigation';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { GaugeChart } from '@/components/dashboard/GaugeChart';
import { TimePeriodSelector } from '@/components/dashboard/TimePeriodSelector';
import { 
  BarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

type TimePeriod = 'today' | 'week' | 'month' | 'year';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const router = useRouter();

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setRefreshing(true);
      const response = await fetch('/api/analytics/dashboard');
      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data);
        if (result.data.realTime) {
          setRealTimeMetrics(result.data.realTime);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData(true); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  if (loading) {
    return (
      <AdminLayout>
        <LoadingPage message="Loading dashboard..." />
      </AdminLayout>
    );
  }

  const overview = analytics?.overview || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    customerGrowth: 0,
    productGrowth: 0,
  };

  const salesTrend = analytics?.sales?.salesTrend || [];
  const salesByPeriod = analytics?.sales?.salesByPeriod || [];
  const topProducts = analytics?.sales?.topProducts || [];
  const topCustomers = analytics?.customers?.topCustomers || [];
  const ordersByStatus = analytics?.orders?.ordersByStatus || [];
  const averageOrderValue = analytics?.sales?.averageOrderValue || 0;
  const activeCustomers = analytics?.customers?.activeCustomers || 0;

  // Prepare chart data
  const chartData = salesTrend.slice(-12).map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    revenue: item.revenue,
    orders: item.orders,
  }));

  const barChartData = salesByPeriod.slice(-12).map(item => ({
    name: item.period,
    revenue: item.revenue,
    orders: item.orders,
  }));

  // Calculate customer satisfaction score (mock - you can replace with real data)
  const customerSatisfaction = Math.min(5, 4.2 + (overview.customerGrowth / 100) * 0.8);

  // Mock country data (you can replace with real data from analytics)
  const topCountries = [
    { name: 'United States', percentage: 45, flag: '🇺🇸' },
    { name: 'Canada', percentage: 20, flag: '🇨🇦' },
    { name: 'United Kingdom', percentage: 15, flag: '🇬🇧' },
    { name: 'Australia', percentage: 12, flag: '🇦🇺' },
    { name: 'Germany', percentage: 8, flag: '🇩🇪' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <AdminLayout>
      <main className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {autoRefresh ? 'Live' : 'Paused'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData()}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Real-time Metrics Banner */}
        {realTimeMetrics && (
          <Card className="shadow-lg border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Live Metrics</p>
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(realTimeMetrics.lastUpdated).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.activeUsers}</p>
                    <p className="text-xs text-gray-600">Active Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.currentOrders}</p>
                    <p className="text-xs text-gray-600">Current Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(realTimeMetrics.revenueToday)}</p>
                    <p className="text-xs text-gray-600">Revenue Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.ordersToday}</p>
                    <p className="text-xs text-gray-600">Orders Today</p>
                  </div>
                  {realTimeMetrics.topSellingProduct && (
                    <div className="text-center border-l pl-6">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                        {realTimeMetrics.topSellingProduct}
                      </p>
                      <p className="text-xs text-gray-600">Top Product</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Row - Small Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Orders"
            value={overview.totalOrders.toLocaleString()}
            growth={overview.orderGrowth}
            icon={<ShoppingCart className="h-6 w-6 text-white" />}
            iconColor="bg-green-500"
          />
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(overview.totalRevenue)}
            growth={overview.revenueGrowth}
            icon={<DollarSign className="h-6 w-6 text-white" />}
            iconColor="bg-blue-500"
          />
          <MetricCard
            title="Total Customers"
            value={overview.totalCustomers.toLocaleString()}
            growth={overview.customerGrowth}
            icon={<Users className="h-6 w-6 text-white" />}
            iconColor="bg-purple-500"
          />
          <MetricCard
            title="Total Products"
            value={overview.totalProducts.toLocaleString()}
            growth={overview.productGrowth}
            icon={<Package className="h-6 w-6 text-white" />}
            iconColor="bg-orange-500"
          />
        </div>

        {/* Second Row - Charts with Time Period Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Revenue Trend
                </CardTitle>
                <TimePeriodSelector value={timePeriod} onChange={setTimePeriod} />
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Volume Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Order Volume
                </CardTitle>
                <TimePeriodSelector value={timePeriod} onChange={setTimePeriod} />
              </div>
            </CardHeader>
            <CardContent>
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="orders" fill="#10b981" radius={[8, 8, 0, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Third Row - Large Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Top Products
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/products')}
                  className="text-xs"
                >
                  View All
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product, idx) => (
                  <div 
                    key={product.productId} 
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/products/${product.productId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.productName}</p>
                        <p className="text-xs text-gray-500">
                          {product.quantitySold} sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
                {topProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No products data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Satisfaction Gauge */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-yellow-600" />
                Customer Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-4">
                <GaugeChart 
                  value={customerSatisfaction} 
                  max={5} 
                  label={customerSatisfaction >= 4 ? 'Excellent' : customerSatisfaction >= 3 ? 'Good' : 'Needs Improvement'}
                  color={customerSatisfaction >= 4 ? '#10b981' : customerSatisfaction >= 3 ? '#f59e0b' : '#ef4444'}
                  size={220}
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{customerSatisfaction.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Out of 5.0</p>
              </div>
            </CardContent>
          </Card>

          {/* Top Countries */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  Top Countries
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    // Export functionality
                    const data = topCountries.map(c => `${c.flag} ${c.name}: ${c.percentage}%`).join('\n');
                    const blob = new Blob([data], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'top-countries-report.txt';
                    a.click();
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCountries.map((country, idx) => (
                  <div key={country.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag}</span>
                      <span className="font-medium text-gray-900">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                        {country.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fourth Row - Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Distribution */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Order Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersByStatus.length > 0 ? (
                <div className="space-y-4">
                  {ordersByStatus.map((status) => {
                    const total = ordersByStatus.reduce((sum, s) => sum + s.count, 0);
                    const percentage = total > 0 ? (status.count / total) * 100 : 0;
                    
                    return (
                      <div key={status.status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {status.status.toLowerCase().replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{status.count}</span>
                            <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: COLORS[ordersByStatus.indexOf(status) % COLORS.length]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No order status data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Top Customers
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/customers')}
                  className="text-xs"
                >
                  Show All
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.slice(0, 5).map((customer, idx) => (
                  <div 
                    key={customer.customerId} 
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/customers/${customer.customerId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
                        <UserCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{customer.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {customer.totalOrders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-xs text-gray-500">Total spent</p>
                    </div>
                  </div>
                ))}
                {topCustomers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No customer data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(averageOrderValue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {activeCustomers.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(analytics?.inventory?.totalValue || 0)}
                  </p>
                </div>
                <Package className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analytics?.orders?.orderFulfillment?.onTimeDelivery?.toFixed(1) || 0}%
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AdminLayout>
  );
}
