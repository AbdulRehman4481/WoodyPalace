'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/features/products/ProductForm';
import { LoadingPage } from '@/components/ui/loading';
import { Product, UpdateProductRequest } from '@/types/product';

interface ProductEditPageProps {
  params: { id: string };
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load product');
        }

        setProduct(data.data);
      } catch (err) {
        console.error('Failed to load product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleSubmit = async (data: UpdateProductRequest) => {
    setSaving(true);
    setError(null);

    const updatePromise = fetch(`/api/products/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }
      return response.json();
    });

    const { toast } = await import('@/lib/toast');
    toast.promise(updatePromise, {
      loading: 'Updating product...',
      success: () => {
        router.push(`/products/${params.id}`);
        router.refresh();
        return 'Product updated successfully!';
      },
      error: (err) => {
        setSaving(false);
        setError(err.message);
        return err.message || 'Failed to update product';
      },
    });
  };

  const handleCancel = () => {
    router.push(`/products/${params.id}`);
  };

  if (loading) {
    return <LoadingPage message="Loading product..." />;
  }

  if (error && !product) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/products')}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">
          <p className="text-red-600">Product not found</p>
          <button
            onClick={() => router.push('/products')}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-1">
          Update product information, pricing, and inventory.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={saving}
      />
    </div>
  );
}
