'use client';

import React, { useState, useEffect } from 'react';
import { Customer, CustomerOrderHistory } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { 
  ArrowLeft, 
  Edit, 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  UserCheck,
  UserX,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CustomerDetailProps {
  customer: Customer;
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
  const router = useRouter();
  const [orderHistory, setOrderHistory] = useState<CustomerOrderHistory | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Load order history
  const loadOrderHistory = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`/api/customers/${customer.id}/orders`);
      const data = await response.json();
      
      if (response.ok) {
        setOrderHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to load order history:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrderHistory();
  }, [customer.id]);

  const handleBack = () => {
    router.push('/customers');
  };

  const handleEdit = () => {
    router.push(`/customers/${customer.id}/edit`);
  };

  const handleToggleStatus = async () => {
    try {
      const response = await fetch(`/api/customers/${customer.id}/toggle-status`, {
        method: 'PUT',
      });

      if (response.ok) {
        // Refresh the page or update the customer data
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update customer status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      alert('Failed to update customer status');
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-gray-600">Customer since {formatDateTime(customer.createdAt)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(customer.isActive)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Order History</span>
                </span>
                <Button variant="outline" size="sm" onClick={loadOrderHistory}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : orderHistory ? (
                <div className="space-y-4">
                  {/* Order Stats */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{orderHistory.totalOrders}</div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(orderHistory.totalSpent)}</div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(orderHistory.averageOrderValue)}</div>
                      <div className="text-sm text-gray-600">Avg Order Value</div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  {orderHistory.orders.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-medium">Recent Orders</h4>
                      {orderHistory.orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <div>
                            <div className="font-medium">{order.orderNumber}</div>
                            <div className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(order.totalAmount)}</div>
                            <Badge className="text-xs">{order.status}</Badge>
                          </div>
                        </div>
                      ))}
                      {orderHistory.orders.length > 5 && (
                        <div className="text-center pt-2">
                          <Button variant="outline" size="sm">
                            View All Orders
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No orders found</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Failed to load order history</p>
                  <Button variant="outline" onClick={loadOrderHistory} className="mt-2">
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">{customer.email}</div>
                  <div className="text-sm text-gray-500">Email</div>
                </div>
              </div>
              {customer.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{customer.phone}</div>
                    <div className="text-sm text-gray-500">Phone</div>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">{formatDateTime(customer.createdAt)}</div>
                  <div className="text-sm text-gray-500">Member Since</div>
                </div>
              </div>
              {customer.lastLoginAt && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{formatDateTime(customer.lastLoginAt)}</div>
                    <div className="text-sm text-gray-500">Last Login</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Information */}
          {customer.address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="font-medium">
                    {customer.address.firstName} {customer.address.lastName}
                  </div>
                  <div>{customer.address.address1}</div>
                  {customer.address.address2 && <div>{customer.address.address2}</div>}
                  <div>
                    {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                  </div>
                  <div>{customer.address.country}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-semibold">{customer.orders?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="capitalize">
                  {customer.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer ID</span>
                <span className="font-mono text-xs">{customer.id.slice(-8)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleEdit} className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </Button>
              <Button 
                variant="outline" 
                onClick={handleToggleStatus}
                className={`w-full ${customer.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
              >
                {customer.isActive ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate Account
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate Account
                  </>
                )}
              </Button>
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
