'use client';

import { useRouter } from 'next/navigation';
import { ProductList } from './ProductList';
import { PaginatedResponse } from '@/types/common';
import { Product } from '@/types/product';
import { toast } from '@/lib/toast';

interface ProductListWrapperProps {
  initialProducts?: PaginatedResponse<Product>;
}

export function ProductListWrapper({ initialProducts }: ProductListWrapperProps = {}) {
  const router = useRouter();

  const handleProductSelect = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  const handleProductEdit = (product: Product) => {
    router.push(`/products/${product.id}/edit`);
  };

  const handleProductDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    const deletePromise = fetch(`/api/products/${product.id}`, {
      method: 'DELETE',
    }).then(async (response) => {
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete product');
      }
      router.refresh();
      return response;
    });

    toast.promise(deletePromise, {
      loading: 'Deleting product...',
      success: `Product "${product.name}" deleted successfully`,
      error: (err) => err.message || 'Failed to delete product',
    });
  };

  const handleProductAdd = () => {
    router.push('/products/new');
  };

  return (
    <ProductList
      initialProducts={initialProducts}
      onProductSelect={handleProductSelect}
      onProductEdit={handleProductEdit}
      onProductDelete={handleProductDelete}
      onProductAdd={handleProductAdd}
    />
  );
}
