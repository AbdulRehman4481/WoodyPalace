import { Address } from './common';

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Address;
  isActive: boolean;
  lastLoginAt?: Date;
  orders?: Order[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
}

export interface CreateCustomerRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Address;
}

export interface UpdateCustomerRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: Address;
  isActive?: boolean;
}

export interface CustomerFilters {
  isActive?: boolean;
  hasOrders?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  customersWithOrders: number;
  averageOrdersPerCustomer: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalSpent: number;
  }>;
}

export interface CustomerSearchQuery {
  query?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CustomerOrderHistory {
  orders: Order[];
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  type: 'SHIPPING' | 'BILLING';
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressRequest {
  type: 'SHIPPING' | 'BILLING';
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  type?: 'SHIPPING' | 'BILLING';
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface CustomerExportData {
  customers: Customer[];
  exportDate: Date;
  totalCount: number;
  activeCount: number;
}
