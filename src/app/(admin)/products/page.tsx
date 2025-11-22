import { ProductListWrapper } from '@/components/features/products/ProductListWrapper';
import { requireAdmin } from '@/lib/auth-helpers';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function ProductsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog, inventory, and pricing."
        breadcrumbs={[
          { label: 'Products', href: '/products' },
        ]}
        actions={
          <Link href="/products/new">
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        }
      />

      <ProductListWrapper />
    </div>
  );
}
