"use client"

import { AdminLayout } from "@/components/layout/AdminLayout"
import { StatCard } from "@/components/dashboard/StatCard"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Clock, Package } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  revenue: number;
}

interface Activity {
  id: string;
  text: string;
  time: string;
  type: 'order' | 'customer' | 'product';
}

interface DashboardClientProps {
  stats: DashboardStats;
  activities: Activity[];
}

export function DashboardClient({ stats, activities }: DashboardClientProps) {
  const hasData = stats.totalProducts > 0 || stats.totalOrders > 0 || stats.totalCustomers > 0;

  return (
    <AdminLayout>
      <main className="p-6 space-y-6">
        {/* Welcome Section */}
        <header>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back!</h2>
          <p className="text-gray-600 mt-1">
            {hasData 
              ? "Here's what's happening with your store today."
              : "Get started by adding products to your store."}
          </p>
        </header>

        {/* Stats Grid */}
        {hasData && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              iconName="package"
              iconColor="bg-blue-500"
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              iconName="cart"
              iconColor="bg-green-500"
            />
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers}
              iconName="users"
              iconColor="bg-purple-500"
            />
            <StatCard
              title="Revenue"
              value={formatCurrency(stats.revenue)}
              iconName="dollar"
              iconColor="bg-orange-500"
            />
          </section>
        )}

        {/* Quick Actions and Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActions />

          {/* Recent Activity */}
          {activities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      {activity.type === 'order' && <ShoppingCart className="h-5 w-5 text-gray-400 mt-0.5" />}
                      {activity.type === 'product' && <Package className="h-5 w-5 text-gray-400 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </AdminLayout>
  )
}
