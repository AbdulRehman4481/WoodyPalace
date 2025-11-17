import { db } from '../db';
import { Banner, CreateBannerRequest, UpdateBannerRequest, BannerFilters } from '@/types/banner';
import { PaginationParams, PaginatedResponse } from '@/types/common';
import { calculatePagination } from '../utils';

export class BannerService {
  static async create(data: CreateBannerRequest): Promise<Banner> {
    const banner = await db.banner.create({
      data: {
        topTitle: data.topTitle,
        title: data.title,
        description: data.description,
        discount: data.discount,
        image: data.image,
        imageWidth: data.imageWidth ?? 1200,
        imageHeight: data.imageHeight ?? 600,
        type: data.type,
        isCarousel: data.isCarousel ?? false,
        bannerColor: data.bannerColor ?? '#FFFFFF',
        titleColor: data.titleColor ?? '#000000',
        descriptionColor: data.descriptionColor ?? '#666666',
        buttonColor: data.buttonColor ?? '#3B82F6',
        buttonTextColor: data.buttonTextColor ?? '#FFFFFF',
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return this.mapToBanner(banner);
  }

  static async findById(id: string): Promise<Banner | null> {
    const banner = await db.banner.findUnique({
      where: { id },
    });

    return banner ? this.mapToBanner(banner) : null;
  }

  static async findMany(
    filters: BannerFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Banner>> {
    const { page = 1, limit = 20, sortBy = 'sortOrder', sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [banners, total] = await Promise.all([
      db.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      db.banner.count({ where }),
    ]);

    return {
      data: banners.map(this.mapToBanner),
      pagination: calculatePagination(page, limit, total),
    };
  }

  static async update(id: string, data: UpdateBannerRequest): Promise<Banner> {
    const banner = await db.banner.update({
      where: { id },
      data: {
        ...(data.topTitle !== undefined && { topTitle: data.topTitle }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.discount !== undefined && { discount: data.discount }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.imageWidth !== undefined && { imageWidth: data.imageWidth }),
        ...(data.imageHeight !== undefined && { imageHeight: data.imageHeight }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.isCarousel !== undefined && { isCarousel: data.isCarousel }),
        ...(data.bannerColor !== undefined && { bannerColor: data.bannerColor }),
        ...(data.titleColor !== undefined && { titleColor: data.titleColor }),
        ...(data.descriptionColor !== undefined && { descriptionColor: data.descriptionColor }),
        ...(data.buttonColor !== undefined && { buttonColor: data.buttonColor }),
        ...(data.buttonTextColor !== undefined && { buttonTextColor: data.buttonTextColor }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });

    return this.mapToBanner(banner);
  }

  static async delete(id: string): Promise<void> {
    await db.banner.delete({
      where: { id },
    });
  }

  static async getActiveBanners(type?: Banner['type']): Promise<Banner[]> {
    const where: any = { isActive: true };
    if (type) {
      where.type = type;
    }

    const banners = await db.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return banners.map(this.mapToBanner);
  }

  private static mapToBanner(banner: any): Banner {
    return {
      id: banner.id,
      topTitle: banner.topTitle,
      title: banner.title,
      description: banner.description,
      discount: banner.discount,
      image: banner.image,
      imageWidth: banner.imageWidth,
      imageHeight: banner.imageHeight,
      type: banner.type,
      isCarousel: banner.isCarousel,
      bannerColor: banner.bannerColor,
      titleColor: banner.titleColor,
      descriptionColor: banner.descriptionColor,
      buttonColor: banner.buttonColor,
      buttonTextColor: banner.buttonTextColor,
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    };
  }
}

