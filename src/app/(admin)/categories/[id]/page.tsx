import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-helpers';
import { CategoryService } from '@/lib/services/category';
import { CategoryDetail } from '@/components/features/categories/CategoryDetail';
import { LoadingPage } from '@/components/ui/loading';
import { Suspense } from 'react';

interface CategoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  await requireAdmin();
  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<LoadingPage message="Loading category..." />}>
        <CategoryDetailContent id={id} />
      </Suspense>
    </div>
  );
}

async function CategoryDetailContent({ id }: { id: string }) {
  try {
    const category = await CategoryService.findById(id);

    if (!category) {
      notFound();
    }

    return <CategoryDetail category={category} />;
  } catch (error) {
    console.error('Failed to load category:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load category</p>
        <p className="text-sm text-gray-600 mt-2">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
      </div>
    );
  }
}
