import { Product } from './product';

export interface Deal {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  massiveDealProductId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  massiveDealProduct?: Product;
  dealProducts?: DealProduct[];
}

export interface DealProduct {
  id: string;
  dealId: string;
  productId: string;
  createdAt: Date;
  deal?: Deal;
  product?: Product;
}

export interface CreateDealRequest {
  title: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  massiveDealProductId?: string;
  productIds?: string[];
  isActive?: boolean;
}

export interface UpdateDealRequest {
  title?: string;
  description?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  massiveDealProductId?: string;
  productIds?: string[];
  isActive?: boolean;
}

export interface DealFilters {
  isActive?: boolean;
  isUpcoming?: boolean;
  isActiveNow?: boolean;
  isExpired?: boolean;
}
