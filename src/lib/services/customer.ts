import { db } from '../db';
import { Customer, CreateCustomerRequest, UpdateCustomerRequest, CustomerFilters, CustomerAnalytics, CustomerSearchQuery, CustomerOrderHistory } from '@/types/customer';
import { PaginationParams, PaginatedResponse } from '@/types/common';
import { calculatePagination } from '../utils';

export class CustomerService {
  static async create(data: CreateCustomerRequest): Promise<Customer> {
    // Check if email already exists
    const existingCustomer = await db.customer.findUnique({
      where: { email: data.email },
    });

    if (existingCustomer) {
      throw new Error('Customer with this email already exists');
    }

    const customer = await db.customer.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        isActive: true,
      },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Include recent orders
        },
      },
    });

    return this.mapToCustomer(customer);
  }

  static async findById(id: string): Promise<Customer | null> {
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Include recent orders
        },
      },
    });

    return customer ? this.mapToCustomer(customer) : null;
  }

  static async findByEmail(email: string): Promise<Customer | null> {
    const customer = await db.customer.findUnique({
      where: { email },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return customer ? this.mapToCustomer(customer) : null;
  }

  static async findMany(
    filters: CustomerFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Customer>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.hasOrders !== undefined) {
      if (filters.hasOrders) {
        where.orders = {
          some: {},
        };
      } else {
        where.orders = {
          none: {},
        };
      }
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

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.customer.count({ where }),
    ]);

    const mappedCustomers = customers.map(customer => this.mapToCustomer(customer));
    const paginationData = calculatePagination(page, limit, total);

    return {
      data: mappedCustomers,
      pagination: paginationData,
    };
  }

  static async search(
    searchQuery: CustomerSearchQuery,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Customer>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (searchQuery.query) {
      where.OR = [
        { email: { contains: searchQuery.query, mode: 'insensitive' } },
        { firstName: { contains: searchQuery.query, mode: 'insensitive' } },
        { lastName: { contains: searchQuery.query, mode: 'insensitive' } },
        { phone: { contains: searchQuery.query, mode: 'insensitive' } },
      ];
    }

    if (searchQuery.email) {
      where.email = { contains: searchQuery.email, mode: 'insensitive' };
    }

    if (searchQuery.firstName) {
      where.firstName = { contains: searchQuery.firstName, mode: 'insensitive' };
    }

    if (searchQuery.lastName) {
      where.lastName = { contains: searchQuery.lastName, mode: 'insensitive' };
    }

    if (searchQuery.phone) {
      where.phone = { contains: searchQuery.phone, mode: 'insensitive' };
    }

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.customer.count({ where }),
    ]);

    const mappedCustomers = customers.map(customer => this.mapToCustomer(customer));
    const paginationData = calculatePagination(page, limit, total);

    return {
      data: mappedCustomers,
      pagination: paginationData,
    };
  }

  static async update(id: string, data: UpdateCustomerRequest): Promise<Customer> {
    const existingCustomer = await db.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new Error('Customer not found');
    }

    // Check if email is being changed and if it already exists
    if (data.email && data.email !== existingCustomer.email) {
      const existingCustomerWithEmail = await db.customer.findUnique({
        where: { email: data.email },
      });

      if (existingCustomerWithEmail) {
        throw new Error('Customer with this email already exists');
      }
    }

    const customer = await db.customer.update({
      where: { id },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        isActive: data.isActive,
      },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return this.mapToCustomer(customer);
  }

  static async delete(id: string): Promise<void> {
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check if customer has orders
    if (customer.orders.length > 0) {
      throw new Error('Cannot delete customer that has orders');
    }

    await db.customer.delete({
      where: { id },
    });
  }

  static async getOrderHistory(customerId: string, pagination: PaginationParams = {}): Promise<CustomerOrderHistory> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [orders, totalOrders, orderStats] = await Promise.all([
      db.order.findMany({
        where: { customerId },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({
        where: { customerId },
      }),
      db.order.aggregate({
        where: { customerId },
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      }),
    ]);

    const lastOrder = await db.order.findFirst({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return {
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
      })),
      totalOrders,
      totalSpent: Number(orderStats._sum.totalAmount || 0),
      averageOrderValue: Number(orderStats._avg.totalAmount || 0),
      lastOrderDate: lastOrder?.createdAt,
    };
  }

  static async getAnalytics(dateFrom?: Date, dateTo?: Date): Promise<CustomerAnalytics> {
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
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
      customersWithOrders,
      topCustomers,
      orderStats,
    ] = await Promise.all([
      db.customer.count({ where }),
      db.customer.count({ where: { ...where, isActive: true } }),
      db.customer.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      db.customer.count({
        where: {
          ...where,
          orders: {
            some: {},
          },
        },
      }),
      db.customer.findMany({
        where: {
          ...where,
          orders: {
            some: {},
          },
        },
        include: {
          orders: {
            select: {
              totalAmount: true,
            },
          },
        },
        orderBy: {
          orders: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
      db.order.aggregate({
        where: {
          customer: where,
        },
        _count: { id: true },
      }),
    ]);

    const averageOrdersPerCustomer = totalCustomers > 0 ? Number(orderStats._count.id || 0) / totalCustomers : 0;

    return {
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
      customersWithOrders,
      averageOrdersPerCustomer,
      topCustomers: topCustomers.map(customer => ({
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        totalOrders: customer.orders.length,
        totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
      })),
    };
  }

  static async getRecentCustomers(limit: number = 10): Promise<Customer[]> {
    const customers = await db.customer.findMany({
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return customers.map(customer => this.mapToCustomer(customer));
  }

  static async getActiveCustomers(pagination: PaginationParams = {}): Promise<PaginatedResponse<Customer>> {
    return this.findMany({ isActive: true }, pagination);
  }

  static async getInactiveCustomers(pagination: PaginationParams = {}): Promise<PaginatedResponse<Customer>> {
    return this.findMany({ isActive: false }, pagination);
  }

  static async getCustomersWithOrders(pagination: PaginationParams = {}): Promise<PaginatedResponse<Customer>> {
    return this.findMany({ hasOrders: true }, pagination);
  }

  static async getCustomersWithoutOrders(pagination: PaginationParams = {}): Promise<PaginatedResponse<Customer>> {
    return this.findMany({ hasOrders: false }, pagination);
  }

  static async updateLastLogin(customerId: string): Promise<void> {
    await db.customer.update({
      where: { id: customerId },
      data: { lastLoginAt: new Date() },
    });
  }

  static async toggleActiveStatus(customerId: string): Promise<Customer> {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const updatedCustomer = await db.customer.update({
      where: { id: customerId },
      data: { isActive: !customer.isActive },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return this.mapToCustomer(updatedCustomer);
  }

  private static mapToCustomer(dbCustomer: any): Customer {
    return {
      id: dbCustomer.id,
      email: dbCustomer.email,
      firstName: dbCustomer.firstName,
      lastName: dbCustomer.lastName,
      phone: dbCustomer.phone,
      address: dbCustomer.address,
      isActive: dbCustomer.isActive,
      lastLoginAt: dbCustomer.lastLoginAt,
      orders: dbCustomer.orders?.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
      })) || [],
      createdAt: dbCustomer.createdAt,
      updatedAt: dbCustomer.updatedAt,
    };
  }
}
