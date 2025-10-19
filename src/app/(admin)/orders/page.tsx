import { OrderListWrapper } from '@/components/features/orders/OrderListWrapper';
import { requireAdmin } from '@/lib/auth-helpers';

export default async function OrdersPage() {
  await requireAdmin();

  return (
    <div className="p-6">
      <OrderListWrapper />
    </div>
  );
}
