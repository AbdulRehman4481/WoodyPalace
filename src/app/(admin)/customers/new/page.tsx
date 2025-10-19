'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerForm } from '@/components/features/customers/CustomerForm';
import { CreateCustomerRequest, UpdateCustomerRequest } from '@/types/customer';

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateCustomerRequest | UpdateCustomerRequest) => {
    setLoading(true);
    setError(null);

    const createPromise = fetch('/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }
      return response.json();
    });

    const { toast } = await import('@/lib/toast');
    toast.promise(createPromise, {
      loading: 'Creating customer...',
      success: (result) => {
        router.push(`/customers/${result.data.id}`);
        router.refresh();
        return `Customer created successfully!`;
      },
      error: (err) => {
        setLoading(false);
        setError(err.message);
        return err.message || 'Failed to create customer';
      },
    });
  };

  const handleCancel = () => {
    router.push('/customers');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
        <p className="text-gray-600 mt-1">
          Create a new customer account.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <CustomerForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}

