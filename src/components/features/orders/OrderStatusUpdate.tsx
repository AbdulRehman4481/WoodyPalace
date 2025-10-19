'use client';

import React, { useState } from 'react';
import { Order, OrderStatusUpdate as OrderStatusUpdateType } from '@/types/order';
import { OrderStatus } from '@/types/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Truck,
  Loader2,
  Save,
  ArrowRight
} from 'lucide-react';

interface OrderStatusUpdateProps {
  order: Order;
  onStatusUpdate: (statusUpdate: OrderStatusUpdateType) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function OrderStatusUpdate({ order, onStatusUpdate, onCancel, loading = false }: OrderStatusUpdateProps) {
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.notes || '');
  const [adminComment, setAdminComment] = useState('');
  const [saving, setSaving] = useState(false);

  // Get available status transitions
  const getAvailableStatuses = (currentStatus: string) => {
    const validTransitions: Record<string, string[]> = {
      PENDING: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [], // Final state
      CANCELLED: [], // Final state
    };

    return validTransitions[currentStatus] || [];
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    const statusInfo: Record<string, { color: string; icon: React.ReactNode; description: string }> = {
      PENDING: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <Clock className="h-4 w-4" />,
        description: 'Order is waiting to be processed'
      },
      PROCESSING: { 
        color: 'bg-blue-100 text-blue-800', 
        icon: <AlertCircle className="h-4 w-4" />,
        description: 'Order is being prepared for shipment'
      },
      SHIPPED: { 
        color: 'bg-purple-100 text-purple-800', 
        icon: <Truck className="h-4 w-4" />,
        description: 'Order has been shipped and is in transit'
      },
      DELIVERED: { 
        color: 'bg-green-100 text-green-800', 
        icon: <CheckCircle className="h-4 w-4" />,
        description: 'Order has been delivered to customer'
      },
      CANCELLED: { 
        color: 'bg-red-100 text-red-800', 
        icon: <XCircle className="h-4 w-4" />,
        description: 'Order has been cancelled'
      },
    };
    return statusInfo[status] || { color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-4 w-4" />, description: 'Unknown status' };
  };

  const availableStatuses = getAvailableStatuses(order.status);
  const currentStatusInfo = getStatusInfo(order.status);
  const newStatusInfo = getStatusInfo(status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status === order.status && !notes && !adminComment) {
      return; // No changes
    }

    setSaving(true);
    try {
      await onStatusUpdate({
        status,
        notes: notes || undefined,
        adminComment: adminComment || undefined,
      });
    } catch (error) {
      console.error('Status update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const isStatusChange = status !== order.status;
  const hasChanges = isStatusChange || notes !== (order.notes || '') || adminComment;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Order Status</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Status */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Current Status</Label>
            <div className="mt-2">
              <Badge className={`${currentStatusInfo.color} flex items-center space-x-1 w-fit`}>
                {currentStatusInfo.icon}
                <span>{order.status}</span>
              </Badge>
              <p className="text-sm text-gray-500 mt-1">{currentStatusInfo.description}</p>
            </div>
          </div>

          {/* Status Transition */}
          {availableStatuses.length > 0 && (
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                New Status
              </Label>
              <div className="mt-2 flex items-center space-x-4">
                <Select value={status} onValueChange={(value: string) => setStatus(value as OrderStatus)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={order.status}>
                      Keep current: {order.status}
                    </SelectItem>
                    {availableStatuses.map((availableStatus) => (
                      <SelectItem key={availableStatus} value={availableStatus}>
                        {availableStatus}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {isStatusChange && (
                  <>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <Badge className={`${newStatusInfo.color} flex items-center space-x-1`}>
                      {newStatusInfo.icon}
                      <span>{status}</span>
                    </Badge>
                  </>
                )}
              </div>
              {isStatusChange && (
                <p className="text-sm text-gray-500 mt-1">{newStatusInfo.description}</p>
              )}
            </div>
          )}

          {/* No Available Transitions */}
          {availableStatuses.length === 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Order is in final state
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                This order cannot be moved to a different status.
              </p>
            </div>
          )}

          {/* Order Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Order Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add or update order notes..."
              rows={3}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              These notes will be visible to customers
            </p>
          </div>

          {/* Admin Comment */}
          <div>
            <Label htmlFor="adminComment" className="text-sm font-medium text-gray-700">
              Admin Comment
            </Label>
            <Textarea
              id="adminComment"
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="Internal notes (not visible to customers)..."
              rows={3}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Internal notes for admin reference only
            </p>
          </div>

          {/* Status Change Warning */}
          {isStatusChange && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Status Change Warning
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Changing the order status from <strong>{order.status}</strong> to <strong>{status}</strong> 
                will notify the customer and may trigger automated processes.
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!hasChanges || saving || loading}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
