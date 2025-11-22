import { OrderListWrapper } from '@/components/features/orders/OrderListWrapper';
import { requireAdmin } from '@/lib/auth-helpers';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default async function OrdersPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="View and manage customer orders, shipments, and returns."
        breadcrumbs={[
          { label: 'Orders', href: '/orders' },
        ]}
        actions={
          <Button variant="outline" className="glass-button">
            <Download className="h-4 w-4 mr-2" />
            Export Orders
          </Button>
        }
      />

      <OrderListWrapper />
    </div>
  );
}
