export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isDiscontinued: boolean;
  product?: {
    id: string;
    name: string;
    sku: string;
    price: number;
    images?: string[];
  };
  createdAt: Date;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateOrderItemRequest {
  quantity?: number;
  unitPrice?: number;
}

export interface OrderItemFilters {
  productId?: string;
  productSku?: string;
  isDiscontinued?: boolean;
  quantityMin?: number;
  quantityMax?: number;
  unitPriceMin?: number;
  unitPriceMax?: number;
}
