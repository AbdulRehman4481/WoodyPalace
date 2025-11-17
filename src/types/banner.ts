export enum BannerType {
  NEW_ARRIVAL = 'NEW_ARRIVAL',
  DISCOUNT = 'DISCOUNT',
  COMING_SOON = 'COMING_SOON',
}

export interface Banner {
  id: string;
  topTitle?: string;
  title: string;
  description?: string;
  discount?: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  type: BannerType;
  isCarousel: boolean;
  bannerColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBannerRequest {
  topTitle?: string;
  title: string;
  description?: string;
  discount?: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  type: BannerType;
  isCarousel?: boolean;
  bannerColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateBannerRequest {
  topTitle?: string;
  title?: string;
  description?: string;
  discount?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: BannerType;
  isCarousel?: boolean;
  bannerColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface BannerFilters {
  type?: BannerType;
  isActive?: boolean;
}

