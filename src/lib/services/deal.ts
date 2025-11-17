import { db } from '../db';
import { Deal, CreateDealRequest, UpdateDealRequest, DealFilters } from '@/types/deal';
import { PaginationParams, PaginatedResponse } from '@/types/common';
import { calculatePagination } from '../utils';

export class DealService {
  static async create(data: CreateDealRequest): Promise<Deal> {
    const deal = await db.deal.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        massiveDealProductId: data.massiveDealProductId,
        isActive: data.isActive ?? true,
        dealProducts: data.productIds?.length ? {
          create: data.productIds.map(productId => ({
            productId,
          }))
        } : undefined,
      },
      include: {
        massiveDealProduct: true,
        dealProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    return this.mapToDeal(deal);
  }

  static async findById(id: string): Promise<Deal | null> {
    const deal = await db.deal.findUnique({
      where: { id },
      include: {
        massiveDealProduct: true,
        dealProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    return deal ? this.mapToDeal(deal) : null;
  }

  static async findMany(
    filters: DealFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Deal>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};
    const now = new Date();

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isActiveNow) {
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    }

    if (filters.isUpcoming) {
      where.startDate = { gt: now };
    }

    if (filters.isExpired) {
      where.endDate = { lt: now };
    }

    const [deals, total] = await Promise.all([
      db.deal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          massiveDealProduct: true,
          dealProducts: {
            include: {
              product: true,
            },
          },
        },
      }),
      db.deal.count({ where }),
    ]);

    return {
      data: deals.map(this.mapToDeal),
      pagination: calculatePagination(page, limit, total),
    };
  }

  static async update(id: string, data: UpdateDealRequest): Promise<Deal> {
    // Get existing deal products
    const existingDeal = await db.deal.findUnique({
      where: { id },
      include: { dealProducts: true },
    });

    if (!existingDeal) {
      throw new Error('Deal not found');
    }

    // Update deal
    const deal = await db.deal.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
        ...(data.massiveDealProductId !== undefined && { massiveDealProductId: data.massiveDealProductId }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        massiveDealProduct: true,
        dealProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update products if provided
    if (data.productIds !== undefined) {
      // Delete existing deal products
      await db.dealProduct.deleteMany({
        where: { dealId: id },
      });

      // Create new deal products
      if (data.productIds.length > 0) {
        await db.dealProduct.createMany({
          data: data.productIds.map(productId => ({
            dealId: id,
            productId,
          })),
        });
      }

      // Reload with updated products
      return this.findById(id) as Promise<Deal>;
    }

    return this.mapToDeal(deal);
  }

  static async delete(id: string): Promise<void> {
    await db.deal.delete({
      where: { id },
    });
  }

  static async getActiveDeals(): Promise<Deal[]> {
    const now = new Date();
    const deals = await db.deal.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        massiveDealProduct: true,
        dealProducts: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return deals.map(this.mapToDeal);
  }

  private static mapToDeal(deal: any): Deal {
    return {
      id: deal.id,
      title: deal.title,
      description: deal.description,
      startDate: deal.startDate,
      endDate: deal.endDate,
      massiveDealProductId: deal.massiveDealProductId,
      isActive: deal.isActive,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
      massiveDealProduct: deal.massiveDealProduct,
      dealProducts: deal.dealProducts,
    };
  }
}
