import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-helpers';
import { CustomerService } from '@/lib/services/customer';
import { CustomerDetail } from '@/components/features/customers/CustomerDetail';
import { LoadingPage } from '@/components/ui/loading';
import { Suspense } from 'react';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  await requireAdmin();
  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<LoadingPage message="Loading customer..." />}>
        <CustomerDetailContent id={id} />
      </Suspense>
    </div>
  );
}

async function CustomerDetailContent({ id }: { id: string }) {
  try {
    const customer = await CustomerService.findById(id);

    if (!customer) {
      notFound();
    }

    return <CustomerDetail customer={customer} />;
  } catch (error) {
    console.error('Failed to load customer:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load customer</p>
        <p className="text-sm text-gray-600 mt-2">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
      </div>
    );
  }
}
