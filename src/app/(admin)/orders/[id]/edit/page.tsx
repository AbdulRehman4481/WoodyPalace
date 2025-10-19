import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-helpers';
import { OrderService } from '@/lib/services/order';
import { OrderStatusUpdate } from '@/components/features/orders/OrderStatusUpdate';
import { LoadingPage } from '@/components/ui/loading';
import { Suspense } from 'react';

interface OrderEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderEditPage({ params }: OrderEditPageProps) {
  await requireAdmin();
  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Update Order Status</h1>
        <p className="text-gray-600 mt-2">
          Update order status, add notes, and manage order fulfillment.
        </p>
      </div>

      <Suspense fallback={<LoadingPage message="Loading order..." />}>
        <OrderEditContent id={id} />
      </Suspense>
    </div>
  );
}

async function OrderEditContent({ id }: { id: string }) {
  try {
    const order = await OrderService.findById(id);

    if (!order) {
      notFound();
    }

    const handleStatusUpdate = async (statusUpdate: any) => {
      'use server';
      
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/orders/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(statusUpdate),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update order status');
        }

        redirect(`/orders/${id}`);
      } catch (error) {
        console.error('Status update error:', error);
        throw error;
      }
    };

    const handleCancel = () => {
      redirect(`/admin/orders/${id}`);
    };

    return (
      <OrderStatusUpdate
        order={order}
        onStatusUpdate={handleStatusUpdate}
        onCancel={handleCancel}
      />
    );
  } catch (error) {
    console.error('Failed to load order:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load order</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }
}
