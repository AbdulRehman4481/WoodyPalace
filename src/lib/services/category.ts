import { db } from '../db';
import { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryFilters, CategoryTree } from '@/types/category';
import { PaginationParams, PaginatedResponse } from '@/types/common';
import { calculatePagination, slugify } from '../utils';

export class CategoryService {
  static async create(data: CreateCategoryRequest): Promise<Category> {
    // Generate slug if not provided
    const slug = data.slug || slugify(data.name);

    // Check if slug already exists
    const existingCategory = await db.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw new Error('Category with this slug already exists');
    }

    // Validate parent category exists if provided
    if (data.parentId) {
      const parentCategory = await db.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
    }

    const category = await db.category.create({
      data: {
        name: data.name,
        description: data.description,
        slug,
        image: data.image,
        parentId: data.parentId,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            productCategories: true,
          },
        },
      },
    });

    return this.mapToCategory(category);
  }

  static async findById(id: string): Promise<Category | null> {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            productCategories: true,
          },
        },
      },
    });

    return category ? this.mapToCategory(category) : null;
  }

  static async findBySlug(slug: string): Promise<Category | null> {
    const category = await db.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            productCategories: true,
          },
        },
      },
    });

    return category ? this.mapToCategory(category) : null;
  }

  static async findMany(
    filters: CategoryFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Category>> {
    const { page = 1, limit = 20, sortBy = 'sortOrder', sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.parentId !== undefined) {
      if (filters.parentId === null) {
        where.parentId = null; // Root categories
      } else {
        where.parentId = filters.parentId;
      }
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.hasProducts !== undefined) {
      if (filters.hasProducts) {
        where.productCategories = {
          some: {},
        };
      } else {
        where.productCategories = {
          none: {},
        };
      }
    }

    const [categories, total] = await Promise.all([
      db.category.findMany({
        where,
        include: {
          parent: true,
          children: {
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: {
              productCategories: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.category.count({ where }),
    ]);

    const mappedCategories = categories.map(category => this.mapToCategory(category));
    const paginationData = calculatePagination(page, limit, total);

    return {
      data: mappedCategories,
      pagination: paginationData,
    };
  }

  static async getTree(): Promise<CategoryTree[]> {
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            productCategories: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return this.buildCategoryTree(categories);
  }

  static async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Check if slug is being changed and if it already exists
    if (data.slug && data.slug !== existingCategory.slug) {
      const existingCategoryWithSlug = await db.category.findUnique({
        where: { slug: data.slug },
      });

      if (existingCategoryWithSlug) {
        throw new Error('Category with this slug already exists');
      }
    }

    // Validate parent category exists if provided
    if (data.parentId && data.parentId !== existingCategory.parentId) {
      if (data.parentId === id) {
        throw new Error('Category cannot be its own parent');
      }

      const parentCategory = await db.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parentCategory) {
        throw new Error('Parent category not found');
      }

      // Check for circular reference
      const isCircular = await this.checkCircularReference(id, data.parentId);
      if (isCircular) {
        throw new Error('Cannot create circular reference in category hierarchy');
      }
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug,
        image: data.image,
        parentId: data.parentId,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
      include: {
        parent: true,
        children: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            productCategories: true,
          },
        },
      },
    });

    return this.mapToCategory(category);
  }

  static async delete(id: string): Promise<void> {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: {
            productCategories: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has products
    if (category._count.productCategories > 0) {
      throw new Error('Cannot delete category that has products assigned');
    }

    // Check if category has children
    if (category.children.length > 0) {
      throw new Error('Cannot delete category that has subcategories');
    }

    await db.category.delete({
      where: { id },
    });
  }

  static async moveCategory(
    categoryId: string,
    newParentId?: string,
    newSortOrder?: number
  ): Promise<Category> {
    const category = await db.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Validate new parent exists if provided
    if (newParentId) {
      if (newParentId === categoryId) {
        throw new Error('Category cannot be its own parent');
      }

      const parentCategory = await db.category.findUnique({
        where: { id: newParentId },
      });

      if (!parentCategory) {
        throw new Error('Parent category not found');
      }

      // Check for circular reference
      const isCircular = await this.checkCircularReference(categoryId, newParentId);
      if (isCircular) {
        throw new Error('Cannot create circular reference in category hierarchy');
      }
    }

    const updatedCategory = await db.category.update({
      where: { id: categoryId },
      data: {
        parentId: newParentId,
        sortOrder: newSortOrder ?? category.sortOrder,
      },
      include: {
        parent: true,
        children: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            productCategories: true,
          },
        },
      },
    });

    return this.mapToCategory(updatedCategory);
  }

  static async reorderCategories(categoryIds: string[]): Promise<void> {
    const updates = categoryIds.map((id, index) => ({
      where: { id },
      data: { sortOrder: index },
    }));

    await Promise.all(
      updates.map(update => db.category.update(update))
    );
  }

  static async getRootCategories(): Promise<Category[]> {
    const categories = await db.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            productCategories: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map(category => this.mapToCategory(category));
  }

  static async getCategoryPath(categoryId: string): Promise<Category[]> {
    const path: Category[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const category = await db.category.findUnique({
        where: { id: currentId },
        include: {
          parent: true,
        },
      });

      if (!category) break;

      path.unshift(this.mapToCategory(category));
      currentId = category.parentId;
    }

    return path;
  }

  private static async checkCircularReference(
    categoryId: string,
    potentialParentId: string
  ): Promise<boolean> {
    let currentId: string | null = potentialParentId;

    while (currentId) {
      if (currentId === categoryId) {
        return true;
      }

      const category = await db.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      currentId = category?.parentId || null;
    }

    return false;
  }

  private static buildCategoryTree(categories: any[]): CategoryTree[] {
    const categoryMap = new Map<string, CategoryTree>();
    const rootCategories: CategoryTree[] = [];

    // First pass: create all category nodes
    categories.forEach(category => {
      const categoryTree: CategoryTree = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        productCount: category._count.productCategories,
        children: [],
        level: 0,
      };

      categoryMap.set(category.id, categoryTree);
    });

    // Second pass: build the tree structure
    categories.forEach(category => {
      const categoryTree = categoryMap.get(category.id)!;

      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          categoryTree.level = parent.level + 1;
          parent.children.push(categoryTree);
        }
      } else {
        rootCategories.push(categoryTree);
      }
    });

    return rootCategories;
  }

  private static mapToCategory(dbCategory: any): Category {
    return {
      id: dbCategory.id,
      name: dbCategory.name,
      description: dbCategory.description,
      slug: dbCategory.slug,
      image: dbCategory.image,
      parentId: dbCategory.parentId,
      isActive: dbCategory.isActive,
      sortOrder: dbCategory.sortOrder,
      parent: dbCategory.parent,
      children: dbCategory.children,
      productCount: dbCategory._count?.productCategories || 0,
      createdAt: dbCategory.createdAt,
      updatedAt: dbCategory.updatedAt,
    };
  }
}
