'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingPage } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Calendar,
  Download,
  Bell
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { DashboardAnalytics, RealTimeMetrics } from '@/types/analytics';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentSales } from '@/components/dashboard/RecentSales';
import { AIInsights } from '@/components/dashboard/AIInsights';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard');
        if (response.ok) {
          const result = await response.json();
          setAnalytics(result.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Clock timer
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  // Mock data for charts if API returns empty (for visual demo)
  const revenueData = analytics?.sales?.salesTrend?.slice(-7).map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    revenue: item.revenue,
  })) || [
      { name: 'Mon', revenue: 4000 },
      { name: 'Tue', revenue: 3000 },
      { name: 'Wed', revenue: 2000 },
      { name: 'Thu', revenue: 2780 },
      { name: 'Fri', revenue: 1890 },
      { name: 'Sat', revenue: 2390 },
      { name: 'Sun', revenue: 3490 },
    ];

  const recentSales = analytics?.sales?.recentSales || [
    { id: '1', name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: 1999.00, status: 'completed', date: '2024-01-15' },
    { id: '2', name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: 39.00, status: 'pending', date: '2024-01-15' },
    { id: '3', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: 299.00, status: 'failed', date: '2024-01-14' },
    { id: '4', name: 'William Kim', email: 'will@email.com', amount: 99.00, status: 'completed', date: '2024-01-14' },
    { id: '5', name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: 39.00, status: 'completed', date: '2024-01-14' },
  ];

  return (
    <AdminLayout>
      <main className="p-8 space-y-8 min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight gradient-text">Dashboard</h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="rounded-full">
              <Bell className="w-4 h-4" />
            </Button>
            <Button className="rounded-full shadow-lg shadow-primary/25">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(overview.totalRevenue)}
            growth={overview.revenueGrowth}
            icon={DollarSign}
            description="Total revenue this month"
            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10"
          />
          <StatsCard
            title="Total Orders"
            value={overview.totalOrders.toLocaleString()}
            growth={overview.orderGrowth}
            icon={ShoppingCart}
            description="New orders placed"
            className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
          />
          <StatsCard
            title="Total Customers"
            value={overview.totalCustomers.toLocaleString()}
            growth={overview.customerGrowth}
            icon={Users}
            description="Active customers"
            className="bg-gradient-to-br from-orange-500/10 to-amber-500/10"
          />
          <StatsCard
            title="Total Products"
            value={overview.totalProducts.toLocaleString()}
            growth={overview.productGrowth}
            icon={Package}
            description="Products in inventory"
            className="bg-gradient-to-br from-pink-500/10 to-rose-500/10"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Left Column (Charts) */}
          <div className="lg:col-span-5 space-y-6">
            <RevenueChart data={revenueData} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Placeholder for another chart or widget */}
              <AIInsights />
              {/* You could add another small chart here */}
            </div>
          </div>

          {/* Right Column (Recent Activity) */}
          <div className="lg:col-span-2 space-y-6">
            <RecentSales sales={recentSales as any[]} />
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
