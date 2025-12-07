'use client';

import React, { useState } from 'react';
import { Order } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  User,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderDetailProps {
  order: Order;
}

export function OrderDetail({ order }: OrderDetailProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/orders');
  };

  const handleEdit = () => {
    router.push(`/orders/${order.id}/edit`);
  };

  // Get status badge color and icon
  const getStatusInfo = (status: string) => {
    const statusInfo: Record<string, { color: string; icon: React.ReactNode }> = {
      PENDING: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <Clock className="h-4 w-4" /> 
      },
      PROCESSING: { 
        color: 'bg-blue-100 text-blue-800', 
        icon: <AlertCircle className="h-4 w-4" /> 
      },
      SHIPPED: { 
        color: 'bg-purple-100 text-purple-800', 
        icon: <Truck className="h-4 w-4" /> 
      },
      DELIVERED: { 
        color: 'bg-green-100 text-green-800', 
        icon: <CheckCircle className="h-4 w-4" /> 
      },
      CANCELLED: { 
        color: 'bg-red-100 text-red-800', 
        icon: <XCircle className="h-4 w-4" /> 
      },
    };
    return statusInfo[status] || { color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-4 w-4" /> };
  };

  // Get payment status badge color and icon
  const getPaymentStatusInfo = (status: string) => {
    const statusInfo: Record<string, { color: string; icon: React.ReactNode }> = {
      PENDING: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <Clock className="h-4 w-4" /> 
      },
      PAID: { 
        color: 'bg-green-100 text-green-800', 
        icon: <CheckCircle className="h-4 w-4" /> 
      },
      FAILED: { 
        color: 'bg-red-100 text-red-800', 
        icon: <XCircle className="h-4 w-4" /> 
      },
      REFUNDED: { 
        color: 'bg-orange-100 text-orange-800', 
        icon: <AlertCircle className="h-4 w-4" /> 
      },
    };
    return statusInfo[status] || { color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-4 w-4" /> };
  };

  const orderStatusInfo = getStatusInfo(order.status);
  const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-gray-600">Placed on {formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${orderStatusInfo.color} flex items-center space-x-1`}>
            {orderStatusInfo.icon}
            <span>{order.status}</span>
          </Badge>
          <Badge className={`${paymentStatusInfo.color} flex items-center space-x-1`}>
            {paymentStatusInfo.icon}
            <span>{order.paymentStatus}</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Order Items ({order.orderItems.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-lg">{item.productName}</h3>
                      <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                      {item.isDiscontinued && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Discontinued
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(item.unitPrice)}</div>
                      <div className="text-sm text-gray-500">× {item.quantity}</div>
                      <div className="font-semibold text-lg">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}
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
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">Customer</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">{order.customer?.email}</div>
                  <div className="text-sm text-gray-500">Email</div>
                </div>
              </div>
              {order.customer?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{order.customer.phone}</div>
                    <div className="text-sm text-gray-500">Phone</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Shipping Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </div>
                <div>{order.shippingAddress.address1}</div>
                {order.shippingAddress.address2 && <div>{order.shippingAddress.address2}</div>}
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Billing Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="font-medium">
                  {order.billingAddress.firstName} {order.billingAddress.lastName}
                </div>
                <div>{order.billingAddress.address1}</div>
                {order.billingAddress.address2 && <div>{order.billingAddress.address2}</div>}
                <div>
                  {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}
                </div>
                <div>{order.billingAddress.country}</div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{formatCurrency(order.shippingAmount)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
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
                Update Order
              </Button>
              <Button variant="outline" className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
              <Button variant="outline" className="w-full">
                <Truck className="h-4 w-4 mr-2" />
                Track Shipment
              </Button>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Order Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">Order Placed</div>
                    <div className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">Last Updated</div>
                    <div className="text-xs text-gray-500">{formatDateTime(order.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
