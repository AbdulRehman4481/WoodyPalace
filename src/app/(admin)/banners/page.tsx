import { BannerListWrapper } from '@/components/features/banners/BannerListWrapper';
import { requireAdmin } from '@/lib/auth-helpers';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function BannersPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        description="Manage your website banners, promotional slides, and featured content."
        breadcrumbs={[
          { label: 'Banners', href: '/banners' },
        ]}
        actions={
          <Link href="/banners/new">
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </Link>
        }
      />

      <BannerListWrapper />
    </div>
  );
}

