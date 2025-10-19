'use client';

import { useRouter } from 'next/navigation';
import { OrderList } from './OrderList';
import { Order } from '@/types/order';

export function OrderListWrapper() {
  const router = useRouter();

  const handleOrderSelect = (order: Order) => {
    router.push(`/orders/${order.id}`);
  };

  const handleOrderEdit = (order: Order) => {
    router.push(`/orders/${order.id}/edit`);
  };

  return (
    <OrderList
      onOrderSelect={handleOrderSelect}
      onOrderEdit={handleOrderEdit}
    />
  );
}

