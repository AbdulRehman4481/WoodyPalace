import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-helpers';
import { OrderService } from '@/lib/services/order';
import { OrderDetail } from '@/components/features/orders/OrderDetail';
import { LoadingPage } from '@/components/ui/loading';
import { Suspense } from 'react';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  await requireAdmin();
  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<LoadingPage message="Loading order..." />}>
        <OrderDetailContent id={id} />
      </Suspense>
    </div>
  );
}

async function OrderDetailContent({ id }: { id: string }) {
  try {
    const order = await OrderService.findById(id);

    if (!order) {
      notFound();
    }

    return <OrderDetail order={order} />;
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
