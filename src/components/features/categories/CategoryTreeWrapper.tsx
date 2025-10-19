'use client';

import { useRouter } from 'next/navigation';
import { CategoryTree } from './CategoryTree';
import { CategoryTree as CategoryTreeType } from '@/types/category';
import { toast } from '@/lib/toast';

export function CategoryTreeWrapper() {
  const router = useRouter();

  const handleCategorySelect = (category: CategoryTreeType) => {
    router.push(`/categories/${category.id}`);
  };

  const handleCategoryEdit = (category: CategoryTreeType) => {
    router.push(`/categories/${category.id}/edit`);
  };

  const handleCategoryDelete = async (category: CategoryTreeType) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    const deletePromise = fetch(`/api/categories/${category.id}`, {
      method: 'DELETE',
    }).then(async (response) => {
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete category');
      }
      router.refresh();
      return response;
    });

    toast.promise(deletePromise, {
      loading: 'Deleting category...',
      success: `Category "${category.name}" deleted successfully`,
      error: (err) => err.message || 'Failed to delete category',
    });
  };

  const handleCategoryAdd = (parentId?: string) => {
    const url = parentId 
      ? `/categories/new?parentId=${parentId}`
      : '/categories/new';
    router.push(url);
  };

  const handleCategoryMove = (_category: CategoryTreeType) => {
    toast.info('Move category feature coming soon!');
  };

  return (
    <CategoryTree
      onCategorySelect={handleCategorySelect}
      onCategoryEdit={handleCategoryEdit}
      onCategoryDelete={handleCategoryDelete}
      onCategoryAdd={handleCategoryAdd}
      onCategoryMove={handleCategoryMove}
    />
  );
}

