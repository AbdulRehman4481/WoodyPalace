import { DealListWrapper } from '@/components/features/deals/DealListWrapper';
import { requireAdmin } from '@/lib/auth-helpers';

export default async function DealsPage() {
  await requireAdmin();

  return (
    <div className="p-6">
      <DealListWrapper />
    </div>
  );
}

