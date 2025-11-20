'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/features/products/ProductForm';
import { CreateProductRequest, UpdateProductRequest } from '@/types/product';
import { toast } from '@/lib/toast';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateProductRequest | UpdateProductRequest) => {
    setLoading(true);
    setError(null);

    const createPromise = fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }
      return response.json();
    });

    toast.promise(createPromise, {
      loading: 'Creating product...',
      success: (result) => {
        router.push(`/products/${result.data.id}`);
        router.refresh();
        return `Product "${data.name}" created successfully!`;
      },
      error: (err) => {
        setLoading(false);
        setError(err.message);
        return err.message || 'Failed to create product';
      },
    });
  };

  const handleCancel = () => {
    router.push('/products');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-1">
          Create a new product in your catalog.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <ProductForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}

