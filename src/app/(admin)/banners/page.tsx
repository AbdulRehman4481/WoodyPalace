import { BannerListWrapper } from '@/components/features/banners/BannerListWrapper';
import { requireAdmin } from '@/lib/auth-helpers';

export default async function BannersPage() {
  await requireAdmin();

  return (
    <div className="p-6">
      <BannerListWrapper />
    </div>
  );
}

