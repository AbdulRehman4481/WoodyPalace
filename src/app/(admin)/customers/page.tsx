import { CustomerListWrapper } from '@/components/features/customers/CustomerListWrapper';
import { requireAdmin } from '@/lib/auth-helpers';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Download, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default async function CustomersPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your customer base, view history, and analyze behavior."
        breadcrumbs={[
          { label: 'Customers', href: '/customers' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="glass-button">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/customers/new">
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </Link>
          </div>
        }
      />

      <CustomerListWrapper />
    </div>
  );
}
