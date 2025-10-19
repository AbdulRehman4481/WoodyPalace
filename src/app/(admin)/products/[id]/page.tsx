import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-helpers';
import { ProductService } from '@/lib/services/product';
import { ProductDetail } from '@/components/features/products/ProductDetail';
import { LoadingPage } from '@/components/ui/loading';
import { Suspense } from 'react';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  await requireAdmin();
  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<LoadingPage message="Loading product..." />}>
        <ProductDetailContent id={id} />
      </Suspense>
    </div>
  );
}

async function ProductDetailContent({ id }: { id: string }) {
  try {
    const product = await ProductService.findById(id);

    if (!product) {
      notFound();
    }

    return <ProductDetail product={product} />;
  } catch (error) {
    console.error('Failed to load product:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load product</p>
        <p className="text-sm text-gray-600 mt-2">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
      </div>
    );
  }
}
