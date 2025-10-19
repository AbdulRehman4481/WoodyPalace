'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CategoryForm } from '@/components/features/categories/CategoryForm';
import { CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

export default function NewCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parentId = searchParams.get('parentId');

  const handleSubmit = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    setLoading(true);
    setError(null);

    const createPromise = fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }
      return response.json();
    });

    const { toast } = await import('@/lib/toast');
    toast.promise(createPromise, {
      loading: 'Creating category...',
      success: (result) => {
        router.push(`/categories/${result.data.id}`);
        router.refresh();
        return `Category "${data.name}" created successfully!`;
      },
      error: (err) => {
        setLoading(false);
        setError(err.message);
        return err.message || 'Failed to create category';
      },
    });
  };

  const handleCancel = () => {
    router.push('/categories');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Category</h1>
        <p className="text-gray-600 mt-1">
          Create a new category to organize your products.
          {parentId && ' This category will be created as a subcategory.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <CategoryForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        defaultParentId={parentId || undefined}
      />
    </div>
  );
}

