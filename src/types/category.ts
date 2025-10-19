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
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
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

export interface CategoryFilters {
  parentId?: string;
  isActive?: boolean;
  hasProducts?: boolean;
}

export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  children: CategoryTree[];
  level: number;
}

export interface CategoryMoveRequest {
  categoryId: string;
  newParentId?: string;
  newSortOrder?: number;
}

export interface CategoryReorderRequest {
  categoryIds: string[];
}
