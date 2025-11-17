'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BannerForm } from '@/components/features/banners/BannerForm';
import { CreateBannerRequest, UpdateBannerRequest } from '@/types/banner';
import { toast } from '@/lib/toast';

export default function NewBannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateBannerRequest | UpdateBannerRequest) => {
    setLoading(true);
    setError(null);

    const createPromise = fetch('/api/banners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create banner');
      }
      return response.json();
    });

    toast.promise(createPromise, {
      loading: 'Creating banner...',
      success: (result) => {
        router.push('/banners');
        router.refresh();
        return `Banner "${data.title}" created successfully!`;
      },
      error: (err) => {
        setLoading(false);
        setError(err.message);
        return err.message || 'Failed to create banner';
      },
    });
  };

  const handleCancel = () => {
    router.push('/banners');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Banner</h1>
        <p className="text-gray-600 mt-1">
          Create a new banner for your website.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <BannerForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}

