import { DealListWrapper } from '@/components/features/deals/DealListWrapper';
import { requireAdmin } from '@/lib/auth-helpers';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function DealsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals"
        description="Manage product deals, limited time offers, and special promotions."
        breadcrumbs={[
          { label: 'Deals', href: '/deals' },
        ]}
        actions={
          <Link href="/deals/new">
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              Create Deal
            </Button>
          </Link>
        }
      />

      <DealListWrapper />
    </div>
  );
}

