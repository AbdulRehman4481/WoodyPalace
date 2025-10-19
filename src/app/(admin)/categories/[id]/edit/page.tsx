'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryForm } from '@/components/features/categories/CategoryForm';
import { LoadingPage } from '@/components/ui/loading';
import { Category, UpdateCategoryRequest } from '@/types/category';

interface CategoryEditPageProps {
  params: Promise<{ id: string }>;
}

export default function CategoryEditPage({ params }: CategoryEditPageProps) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id: categoryId }) => {
      setId(categoryId);
      loadCategory(categoryId);
    });
  }, [params]);

  const loadCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load category');
      }

      setCategory(data.data);
    } catch (err) {
      console.error('Failed to load category:', err);
      setError(err instanceof Error ? err.message : 'Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateCategoryRequest) => {
    setSaving(true);
    setError(null);

    const updatePromise = fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }
      return response.json();
    });

    const { toast } = await import('@/lib/toast');
    toast.promise(updatePromise, {
      loading: 'Updating category...',
      success: () => {
        router.push(`/categories/${id}`);
        router.refresh();
        return 'Category updated successfully!';
      },
      error: (err) => {
        setSaving(false);
        setError(err.message);
        return err.message || 'Failed to update category';
      },
    });
  };

  const handleCancel = () => {
    router.push(`/categories/${id}`);
  };

  if (loading) {
    return <LoadingPage message="Loading category..." />;
  }

  if (error && !category) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/categories')}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">
          <p className="text-red-600">Category not found</p>
          <button
            onClick={() => router.push('/categories')}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-gray-600 mt-1">
          Update category information, hierarchy, and settings.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <CategoryForm
        category={category}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={saving}
      />
    </div>
  );
}
