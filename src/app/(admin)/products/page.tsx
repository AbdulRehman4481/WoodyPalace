import { ProductListWrapper } from '@/components/features/products/ProductListWrapper';
import { requireAdmin } from '@/lib/auth-helpers';

export default async function ProductsPage() {
  await requireAdmin();

  return (
    <div className="p-6">
      <ProductListWrapper />
    </div>
  );
}
