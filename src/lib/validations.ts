import { z } from 'zod';

// Common schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const searchSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.string(), z.any()).optional(),
});

// Admin user schemas
export const createAdminUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  role: z.string().default('ADMIN'),
});

export const updateAdminUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name must be less than 200 characters'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  sku: z.string().min(1, 'SKU is required').max(100, 'SKU must be less than 100 characters'),
  inventoryQuantity: z.coerce.number().min(0, 'Inventory quantity must be non-negative').default(0),
  isActive: z.boolean().default(true),
  images: z.array(z.string().min(1, 'Image URL is required')).default([]),
  categoryIds: z.array(z.string()).default([]),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name must be less than 200 characters').optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be non-negative').optional(),
  sku: z.string().min(1, 'SKU is required').max(100, 'SKU must be less than 100 characters').optional(),
  inventoryQuantity: z.coerce.number().min(0, 'Inventory quantity must be non-negative').optional(),
  isActive: z.boolean().optional(),
  isDiscontinued: z.boolean().optional(),
  images: z.array(z.string().min(1, 'Image URL is required')).optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const productFiltersSchema = z.object({
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
  isDiscontinued: z.boolean().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  inventoryMin: z.coerce.number().min(0).optional(),
  inventoryMax: z.coerce.number().min(0).optional(),
});

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters'),
  description: z.string().optional(),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters').optional(),
  description: z.string().optional(),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().optional(),
});

export const categoryFiltersSchema = z.object({
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  hasProducts: z.boolean().optional(),
});

// Order schemas
export const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  notes: z.string().optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  notes: z.string().optional(),
  adminComment: z.string().optional(),
});

export const orderFiltersSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  customerId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  totalMin: z.coerce.number().min(0).optional(),
  totalMax: z.coerce.number().min(0).optional(),
});

export const orderSearchSchema = z.object({
  query: z.string().optional(),
  orderNumber: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  productName: z.string().optional(),
  productSku: z.string().optional(),
});

export const createRefundSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.coerce.number().min(0.01, 'Refund amount must be greater than 0'),
  reason: z.string().min(1, 'Refund reason is required').max(500, 'Reason must be less than 500 characters'),
  adminNotes: z.string().optional(),
});

export const updateRefundSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED']),
  adminNotes: z.string().optional(),
});

// Customer schemas
export const createCustomerSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
  }).optional(),
});

export const updateCustomerSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters').optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
  }).optional(),
  isActive: z.boolean().optional(),
});

export const customerFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  hasOrders: z.boolean().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const customerSearchSchema = z.object({
  query: z.string().optional(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export const createAddressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING']),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  address1: z.string().min(1, 'Address is required').max(100, 'Address must be less than 100 characters'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
  state: z.string().min(1, 'State is required').max(50, 'State must be less than 50 characters'),
  zipCode: z.string().min(1, 'ZIP code is required').max(20, 'ZIP code must be less than 20 characters'),
  country: z.string().min(1, 'Country is required').max(50, 'Country must be less than 50 characters'),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING']).optional(),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters').optional(),
  address1: z.string().min(1, 'Address is required').max(100, 'Address must be less than 100 characters').optional(),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters').optional(),
  state: z.string().min(1, 'State is required').max(50, 'State must be less than 50 characters').optional(),
  zipCode: z.string().min(1, 'ZIP code is required').max(20, 'ZIP code must be less than 20 characters').optional(),
  country: z.string().min(1, 'Country is required').max(50, 'Country must be less than 50 characters').optional(),
  isDefault: z.boolean().optional(),
});

// File upload schemas
export const fileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  destination: z.string(),
  filename: z.string(),
  path: z.string(),
});

// Export types
export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryFiltersInput = z.infer<typeof categoryFiltersSchema>;

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderFiltersInput = z.infer<typeof orderFiltersSchema>;

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerFiltersInput = z.infer<typeof customerFiltersSchema>;

export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
