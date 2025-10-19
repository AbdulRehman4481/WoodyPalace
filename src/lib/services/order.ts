import { db } from '../db';
import { Order, OrderItem, UpdateOrderRequest, OrderFilters, OrderAnalytics, OrderStatusUpdate, OrderSearchQuery } from '@/types/order';
import { PaginationParams, PaginatedResponse } from '@/types/common';
import { calculatePagination } from '../utils';

export class OrderService {
  static async findById(id: string): Promise<Order | null> {
    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return order ? this.mapToOrder(order) : null;
  }

  static async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const order = await db.order.findUnique({
      where: { orderNumber },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return order ? this.mapToOrder(order) : null;
  }

  static async findMany(
    filters: OrderFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Order>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    if (filters.totalMin || filters.totalMax) {
      where.totalAmount = {};
      if (filters.totalMin) {
        where.totalAmount.gte = filters.totalMin;
      }
      if (filters.totalMax) {
        where.totalAmount.lte = filters.totalMax;
      }
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          customer: true,
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  price: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    const mappedOrders = orders.map(order => this.mapToOrder(order));
    const paginationData = calculatePagination(page, limit, total);

    return {
      data: mappedOrders,
      pagination: paginationData,
    };
  }

  static async search(
    searchQuery: OrderSearchQuery,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Order>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (searchQuery.query) {
      where.OR = [
        { orderNumber: { contains: searchQuery.query, mode: 'insensitive' } },
        { customer: { email: { contains: searchQuery.query, mode: 'insensitive' } } },
        { customer: { firstName: { contains: searchQuery.query, mode: 'insensitive' } } },
        { customer: { lastName: { contains: searchQuery.query, mode: 'insensitive' } } },
        { orderItems: { some: { productName: { contains: searchQuery.query, mode: 'insensitive' } } } },
        { orderItems: { some: { productSku: { contains: searchQuery.query, mode: 'insensitive' } } } },
      ];
    }

    if (searchQuery.orderNumber) {
      where.orderNumber = { contains: searchQuery.orderNumber, mode: 'insensitive' };
    }

    if (searchQuery.customerEmail) {
      where.customer = { email: { contains: searchQuery.customerEmail, mode: 'insensitive' } };
    }

    if (searchQuery.customerName) {
      where.customer = {
        OR: [
          { firstName: { contains: searchQuery.customerName, mode: 'insensitive' } },
          { lastName: { contains: searchQuery.customerName, mode: 'insensitive' } },
        ],
      };
    }

    if (searchQuery.productName) {
      where.orderItems = { some: { productName: { contains: searchQuery.productName, mode: 'insensitive' } } };
    }

    if (searchQuery.productSku) {
      where.orderItems = { some: { productSku: { contains: searchQuery.productSku, mode: 'insensitive' } } };
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          customer: true,
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  price: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    const mappedOrders = orders.map(order => this.mapToOrder(order));
    const paginationData = calculatePagination(page, limit, total);

    return {
      data: mappedOrders,
      pagination: paginationData,
    };
  }

  static async update(id: string, data: UpdateOrderRequest): Promise<Order> {
    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new Error('Order not found');
    }

    const order = await db.order.update({
      where: { id },
      data: {
        status: data.status,
        paymentStatus: data.paymentStatus,
        notes: data.notes,
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return this.mapToOrder(order);
  }

  static async updateStatus(id: string, statusUpdate: OrderStatusUpdate): Promise<Order> {
    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Validate status transition
    this.validateStatusTransition(existingOrder.status, statusUpdate.status);

    const order = await db.order.update({
      where: { id },
      data: {
        status: statusUpdate.status,
        notes: statusUpdate.notes || existingOrder.notes,
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return this.mapToOrder(order);
  }

  static async getAnalytics(dateFrom?: Date, dateTo?: Date): Promise<OrderAnalytics> {
    const where: any = {};

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      ordersByPaymentStatus,
      topProducts,
    ] = await Promise.all([
      db.order.count({ where }),
      db.order.aggregate({
        where,
        _sum: { totalAmount: true },
      }),
      db.order.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      db.order.groupBy({
        by: ['paymentStatus'],
        where,
        _count: { paymentStatus: true },
      }),
      db.orderItem.groupBy({
        by: ['productId', 'productName'],
        where: {
          order: where,
        },
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 10,
      }),
    ]);

    const averageOrderValue = totalOrders > 0 ? Number(totalRevenue._sum.totalAmount || 0) / totalOrders : 0;

    const statusMap: Record<string, number> = {};
    ordersByStatus.forEach(item => {
      statusMap[item.status] = item._count.status;
    });

    const paymentStatusMap: Record<string, number> = {};
    ordersByPaymentStatus.forEach(item => {
      paymentStatusMap[item.paymentStatus] = item._count.paymentStatus;
    });

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      averageOrderValue,
      ordersByStatus: statusMap as any,
      ordersByPaymentStatus: paymentStatusMap as any,
      topProducts: topProducts.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: Number(item._sum.quantity || 0),
        revenue: Number(item._sum.totalPrice || 0),
      })),
    };
  }

  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const orderItems = await db.orderItem.findMany({
      where: { orderId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return orderItems.map(item => this.mapToOrderItem(item));
  }

  static async getOrdersByCustomer(customerId: string, pagination: PaginationParams = {}): Promise<PaginatedResponse<Order>> {
    return this.findMany({ customerId }, pagination);
  }

  static async getRecentOrders(limit: number = 10): Promise<Order[]> {
    const orders = await db.order.findMany({
      include: {
        customer: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return orders.map(order => this.mapToOrder(order));
  }

  static async getOrdersByStatus(status: string, pagination: PaginationParams = {}): Promise<PaginatedResponse<Order>> {
    return this.findMany({ status: status as any }, pagination);
  }

  static async getOrdersByDateRange(dateFrom: Date, dateTo: Date, pagination: PaginationParams = {}): Promise<PaginatedResponse<Order>> {
    return this.findMany({ dateFrom, dateTo }, pagination);
  }

  private static validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      PENDING: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [], // Final state
      CANCELLED: [], // Final state
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private static mapToOrder(dbOrder: any): Order {
    return {
      id: dbOrder.id,
      orderNumber: dbOrder.orderNumber,
      customerId: dbOrder.customerId,
      status: dbOrder.status,
      subtotal: Number(dbOrder.subtotal),
      taxAmount: Number(dbOrder.taxAmount),
      shippingAmount: Number(dbOrder.shippingAmount),
      totalAmount: Number(dbOrder.totalAmount),
      shippingAddress: dbOrder.shippingAddress,
      billingAddress: dbOrder.billingAddress,
      paymentStatus: dbOrder.paymentStatus,
      notes: dbOrder.notes,
      customer: dbOrder.customer,
      orderItems: dbOrder.orderItems?.map((item: any) => this.mapToOrderItem(item)) || [],
      createdAt: dbOrder.createdAt,
      updatedAt: dbOrder.updatedAt,
    };
  }

  private static mapToOrderItem(dbOrderItem: any): OrderItem {
    return {
      id: dbOrderItem.id,
      orderId: dbOrderItem.orderId,
      productId: dbOrderItem.productId,
      productName: dbOrderItem.productName,
      productSku: dbOrderItem.productSku,
      quantity: dbOrderItem.quantity,
      unitPrice: Number(dbOrderItem.unitPrice),
      totalPrice: Number(dbOrderItem.totalPrice),
      isDiscontinued: dbOrderItem.isDiscontinued,
      product: dbOrderItem.product,
      createdAt: dbOrderItem.createdAt,
    };
  }
}

export const orderService = new OrderService();
