import { db } from '../db';
import { Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '@/types/product';
import { PaginationParams, PaginatedResponse } from '@/types/common';
import { calculatePagination } from '../utils';

export class ProductService {
  static async create(data: CreateProductRequest): Promise<Product> {
    const product = await db.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        sku: data.sku,
        inventoryQuantity: data.inventoryQuantity || 0,
        isActive: data.isActive ?? true,
        images: data.images || [],
        homePageSection: data.homePageSection || null,
        discountPercentage: data.discountPercentage !== undefined && data.discountPercentage !== null 
          ? data.discountPercentage 
          : null,
        productCategories: data.categoryIds?.length ? {
          create: data.categoryIds.map(categoryId => ({
            categoryId,
            isPrimary: false,
          }))
        } : undefined,
      },
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return this.mapToProduct(product);
  }

  static async findById(id: string): Promise<Product | null> {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return product ? this.mapToProduct(product) : null;
  }

  static async findBySku(sku: string): Promise<Product | null> {
    const product = await db.product.findUnique({
      where: { sku },
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return product ? this.mapToProduct(product) : null;
  }

  static async findMany(
    filters: ProductFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    // Whitelist of valid sort fields to prevent SQL injection and invalid field errors
    const validSortFields = ['createdAt', 'updatedAt', 'name', 'price', 'inventoryQuantity', 'sku'] as const;
    const safeSortBy = validSortFields.includes(sortBy as any) ? sortBy : 'createdAt';

    const where: any = {};

    if (filters.categoryId) {
      where.productCategories = {
        some: {
          categoryId: filters.categoryId,
        },
      };
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isDiscontinued !== undefined) {
      where.isDiscontinued = filters.isDiscontinued;
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.price = {};
      if (filters.priceMin !== undefined) {
        where.price.gte = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        where.price.lte = filters.priceMax;
      }
    }

    if (filters.inventoryMin !== undefined || filters.inventoryMax !== undefined) {
      where.inventoryQuantity = {};
      if (filters.inventoryMin !== undefined) {
        where.inventoryQuantity.gte = filters.inventoryMin;
      }
      if (filters.inventoryMax !== undefined) {
        where.inventoryQuantity.lte = filters.inventoryMax;
      }
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          productCategories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { [safeSortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    const mappedProducts = products.map(product => this.mapToProduct(product));
    const paginationData = calculatePagination(page, limit, total);

    return {
      data: mappedProducts,
      pagination: paginationData,
    };
  }

  static async search(
    query: string,
    filters: ProductFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    // Whitelist of valid sort fields to prevent SQL injection and invalid field errors
    const validSortFields = ['createdAt', 'updatedAt', 'name', 'price', 'inventoryQuantity', 'sku'] as const;
    const safeSortBy = validSortFields.includes(sortBy as any) ? sortBy : 'createdAt';

    const where: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Apply additional filters
    if (filters.categoryId) {
      where.productCategories = {
        some: {
          categoryId: filters.categoryId,
        },
      };
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isDiscontinued !== undefined) {
      where.isDiscontinued = filters.isDiscontinued;
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.price = {};
      if (filters.priceMin !== undefined) {
        where.price.gte = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        where.price.lte = filters.priceMax;
      }
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          productCategories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { [safeSortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    const mappedProducts = products.map(product => this.mapToProduct(product));
    const paginationData = calculatePagination(page, limit, total);

    return {
      data: mappedProducts,
      pagination: paginationData,
    };
  }

  static async update(id: string, data: UpdateProductRequest): Promise<Product> {
    const existingProduct = await db.product.findUnique({
      where: { id },
      include: {
        productCategories: true,
      },
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Handle category updates
    if (data.categoryIds !== undefined) {
      // Remove existing categories
      await db.productCategory.deleteMany({
        where: { productId: id },
      });

      // Add new categories
      if (data.categoryIds.length > 0) {
        await db.productCategory.createMany({
          data: data.categoryIds.map(categoryId => ({
            productId: id,
            categoryId,
            isPrimary: false,
          })),
        });
      }
    }

    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.inventoryQuantity !== undefined) updateData.inventoryQuantity = data.inventoryQuantity;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isDiscontinued !== undefined) updateData.isDiscontinued = data.isDiscontinued;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.homePageSection !== undefined) updateData.homePageSection = data.homePageSection;
    if (data.discountPercentage !== undefined) {
      updateData.discountPercentage = data.discountPercentage !== null ? data.discountPercentage : null;
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return this.mapToProduct(product);
  }

  static async delete(id: string): Promise<void> {
    // Check if product has existing orders
    const orderItems = await db.orderItem.findMany({
      where: { productId: id },
    });

    if (orderItems.length > 0) {
      // Mark as discontinued instead of deleting
      await db.product.update({
        where: { id },
        data: { isDiscontinued: true },
      });
    } else {
      // Safe to delete
      await db.product.delete({
        where: { id },
      });
    }
  }

  static async updateInventory(id: string, quantity: number): Promise<Product> {
    const product = await db.product.update({
      where: { id },
      data: { inventoryQuantity: quantity },
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return this.mapToProduct(product);
  }

  static async addImage(id: string, imageUrl: string): Promise<Product> {
    const product = await db.product.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        images: [...product.images, imageUrl],
      },
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return this.mapToProduct(updatedProduct);
  }

  static async removeImage(id: string, imageUrl: string): Promise<Product> {
    const product = await db.product.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        images: product.images.filter(img => img !== imageUrl),
      },
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return this.mapToProduct(updatedProduct);
  }

  static async reorderImages(id: string, imageUrls: string[]): Promise<Product> {
    const updatedProduct = await db.product.update({
      where: { id },
      data: { images: imageUrls },
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return this.mapToProduct(updatedProduct);
  }

  private static mapToProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      description: dbProduct.description,
      price: Number(dbProduct.price),
      sku: dbProduct.sku,
      inventoryQuantity: dbProduct.inventoryQuantity,
      isActive: dbProduct.isActive,
      isDiscontinued: dbProduct.isDiscontinued,
      images: dbProduct.images,
      homePageSection: dbProduct.homePageSection || null,
      discountPercentage: dbProduct.discountPercentage !== null && dbProduct.discountPercentage !== undefined
        ? Number(dbProduct.discountPercentage)
        : null,
      categories: dbProduct.productCategories?.map((pc: any) => ({
        id: pc.id,
        productId: pc.productId,
        categoryId: pc.categoryId,
        isPrimary: pc.isPrimary,
        category: pc.category,
      })),
      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt,
    };
  }
}
