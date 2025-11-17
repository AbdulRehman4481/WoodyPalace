export type HomePageSection = 'BEST_SELLERS' | 'LATEST_DEALS' | 'TRENDING_THIS_WEEK' | 'TOP_SELLING_PRODUCTS';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku: string;
  inventoryQuantity: number;
  isActive: boolean;
  isDiscontinued: boolean;
  images: string[];
  categories?: ProductCategory[];
  homePageSection?: HomePageSection | null;
  discountPercentage?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  productId: string;
  categoryId: string;
  isPrimary: boolean;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  parent?: Category;
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  sku: string;
  inventoryQuantity?: number;
  isActive?: boolean;
  images?: string[];
  categoryIds?: string[];
  homePageSection?: HomePageSection | null;
  discountPercentage?: number | null;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  inventoryQuantity?: number;
  isActive?: boolean;
  isDiscontinued?: boolean;
  images?: string[];
  categoryIds?: string[];
  homePageSection?: HomePageSection | null;
  discountPercentage?: number | null;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  slug?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ProductFilters {
  categoryId?: string;
  isActive?: boolean;
  isDiscontinued?: boolean;
  priceMin?: number;
  priceMax?: number;
  inventoryMin?: number;
  inventoryMax?: number;
}
