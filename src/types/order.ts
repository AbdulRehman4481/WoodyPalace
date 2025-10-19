import { OrderStatus, PaymentStatus, Address } from './common';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentStatus: PaymentStatus;
  notes?: string;
  customer?: Customer;
  orderItems: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

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
  product?: Product;
  createdAt: Date;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Address;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  images?: string[];
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  totalMin?: number;
  totalMax?: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByPaymentStatus: Record<PaymentStatus, number>;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  notes?: string;
  adminComment?: string;
}

export interface OrderRefund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  adminNotes?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRefundRequest {
  orderId: string;
  amount: number;
  reason: string;
  adminNotes?: string;
}

export interface OrderSearchQuery {
  query?: string;
  orderNumber?: string;
  customerEmail?: string;
  customerName?: string;
  productName?: string;
  productSku?: string;
}

export interface OrderExportData {
  orders: Order[];
  exportDate: Date;
  totalCount: number;
  totalRevenue: number;
}
