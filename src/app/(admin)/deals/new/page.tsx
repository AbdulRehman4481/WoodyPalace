'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DealForm } from '@/components/features/deals/DealForm';
import { CreateDealRequest, UpdateDealRequest } from '@/types/deal';
import { toast } from '@/lib/toast';

export default function NewDealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateDealRequest | UpdateDealRequest) => {
    setLoading(true);
    setError(null);

    const createPromise = fetch('/api/deals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create deal');
      }
      return response.json();
    });

    toast.promise(createPromise, {
      loading: 'Creating deal...',
      success: (result) => {
        router.push('/deals');
        router.refresh();
        return `Deal "${data.title}" created successfully!`;
      },
      error: (err) => {
        setLoading(false);
        setError(err.message);
        return err.message || 'Failed to create deal';
      },
    });
  };

  const handleCancel = () => {
    router.push('/deals');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Deal</h1>
        <p className="text-gray-600 mt-1">
          Create a new deal with products and limited time offer.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <DealForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}
