import { db } from '../db';
import { ProductCategory } from '@/types/product';

export class ProductCategoryService {
  static async create(
    productId: string,
    categoryId: string,
    isPrimary: boolean = false
  ): Promise<ProductCategory> {
    const productCategory = await db.productCategory.create({
      data: {
        productId,
        categoryId,
        isPrimary,
      },
      include: {
        category: true,
      },
    });

    return this.mapToProductCategory(productCategory);
  }

  static async findByProductId(productId: string): Promise<ProductCategory[]> {
    const productCategories = await db.productCategory.findMany({
      where: { productId },
      include: {
        category: true,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return productCategories.map(pc => this.mapToProductCategory(pc));
  }

  static async findByCategoryId(categoryId: string): Promise<ProductCategory[]> {
    const productCategories = await db.productCategory.findMany({
      where: { categoryId },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return productCategories.map(pc => this.mapToProductCategory(pc));
  }

  static async findById(id: string): Promise<ProductCategory | null> {
    const productCategory = await db.productCategory.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    return productCategory ? this.mapToProductCategory(productCategory) : null;
  }

  static async update(
    id: string,
    data: { isPrimary?: boolean }
  ): Promise<ProductCategory> {
    const productCategory = await db.productCategory.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    return this.mapToProductCategory(productCategory);
  }

  static async delete(id: string): Promise<void> {
    await db.productCategory.delete({
      where: { id },
    });
  }

  static async deleteByProductAndCategory(
    productId: string,
    categoryId: string
  ): Promise<void> {
    await db.productCategory.deleteMany({
      where: {
        productId,
        categoryId,
      },
    });
  }

  static async setPrimaryCategory(
    productId: string,
    categoryId: string
  ): Promise<void> {
    // First, remove primary status from all categories for this product
    await db.productCategory.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });

    // Then set the specified category as primary
    await db.productCategory.updateMany({
      where: {
        productId,
        categoryId,
      },
      data: { isPrimary: true },
    });
  }

  static async getProductCountByCategory(categoryId: string): Promise<number> {
    return await db.productCategory.count({
      where: { categoryId },
    });
  }

  static async getCategoryCountByProduct(productId: string): Promise<number> {
    return await db.productCategory.count({
      where: { productId },
    });
  }

  static async bulkCreate(
    productId: string,
    categoryIds: string[],
    primaryCategoryId?: string
  ): Promise<ProductCategory[]> {
    // Delete existing categories for this product
    await db.productCategory.deleteMany({
      where: { productId },
    });

    // Create new category associations
    const productCategories = await Promise.all(
      categoryIds.map(async (categoryId) => {
        const isPrimary = primaryCategoryId === categoryId;
        return await db.productCategory.create({
          data: {
            productId,
            categoryId,
            isPrimary,
          },
          include: {
            category: true,
          },
        });
      })
    );

    return productCategories.map(pc => this.mapToProductCategory(pc));
  }

  private static mapToProductCategory(dbProductCategory: any): ProductCategory {
    return {
      id: dbProductCategory.id,
      productId: dbProductCategory.productId,
      categoryId: dbProductCategory.categoryId,
      isPrimary: dbProductCategory.isPrimary,
      category: dbProductCategory.category,
    };
  }
}
