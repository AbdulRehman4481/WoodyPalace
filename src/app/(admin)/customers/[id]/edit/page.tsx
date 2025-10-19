import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-helpers';
import { CustomerService } from '@/lib/services/customer';
import { CustomerForm } from '@/components/features/customers/CustomerForm';
import { LoadingPage } from '@/components/ui/loading';
import { Suspense } from 'react';

interface CustomerEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerEditPage({ params }: CustomerEditPageProps) {
  await requireAdmin();
  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Customer</h1>
        <p className="text-gray-600 mt-2">
          Update customer information, address, and account status.
        </p>
      </div>

      <Suspense fallback={<LoadingPage message="Loading customer..." />}>
        <CustomerEditContent id={id} />
      </Suspense>
    </div>
  );
}

async function CustomerEditContent({ id }: { id: string }) {
  try {
    const customer = await CustomerService.findById(id);

    if (!customer) {
      notFound();
    }

    const handleSubmit = async (data: any) => {
      'use server';
      
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/customers/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update customer');
        }

        redirect(`/customers/${id}`);
      } catch (error) {
        console.error('Update error:', error);
        throw error;
      }
    };

    const handleCancel = () => {
      redirect(`/admin/customers/${id}`);
    };

    return (
      <CustomerForm
        customer={customer}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  } catch (error) {
    console.error('Failed to load customer:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load customer</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }
}
