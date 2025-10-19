import { CustomerListWrapper } from '@/components/features/customers/CustomerListWrapper';
import { requireAdmin } from '@/lib/auth-helpers';

export default async function CustomersPage() {
  await requireAdmin();

  return (
    <div className="p-6">
      <CustomerListWrapper />
    </div>
  );
}
