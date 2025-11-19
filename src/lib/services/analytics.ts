import { db } from '../db';
import { 
  SalesAnalytics, 
  InventoryAnalytics, 
  CustomerAnalytics, 
  OrderAnalytics,
  DashboardAnalytics,
  AnalyticsFilters,
  DateRange,
  SalesByPeriod,
  SalesByCategory,
  TopProduct,
  SalesTrend,
  LowStockProduct,
  OutOfStockProduct,
  InventoryByCategory,
  InventoryTrend,
  StockAlert,
  CustomerLifetimeValue,
  CustomerSegment,
  TopCustomer,
  CustomerRetention,
  OrderStatusCount,
  PaymentStatusCount,
  OrderTrend,
  OrderFulfillment,
  FulfillmentTrend,
  DashboardOverview,
  DashboardAlert,
  RealTimeMetrics
} from '@/types/analytics';

export class AnalyticsService {
  // Sales Analytics
  static async getSalesAnalytics(filters: AnalyticsFilters = {}): Promise<SalesAnalytics> {
    const { dateRange, categoryId } = filters;
    
    const whereClause: any = {};
    if (dateRange) {
      whereClause.createdAt = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    }

    // Get basic sales metrics
    const [totalOrders, totalRevenue, orderStats] = await Promise.all([
      db.order.count({ where: whereClause }),
      db.order.aggregate({
        where: whereClause,
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      }),
      db.order.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { id: true },
      }),
    ]);

    // Get sales by period (daily for last 30 days)
    const salesByPeriod = await this.getSalesByPeriod(dateRange);
    
    // Get sales by category
    const salesByCategory = await this.getSalesByCategory(dateRange, categoryId);
    
    // Get top products
    const topProducts = await this.getTopProducts(dateRange, categoryId);
    
    // Get sales trend
    const salesTrend = await this.getSalesTrend(dateRange);

    // Calculate growth (compare with previous period)
    const previousPeriod = this.getPreviousPeriod(dateRange);
    const previousRevenue = await this.getPreviousPeriodRevenue(previousPeriod);
    const revenueGrowth = previousRevenue > 0 
      ? ((Number(totalRevenue._sum.totalAmount || 0) - previousRevenue) / previousRevenue) * 100 
      : 0;

    return {
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      totalOrders,
      averageOrderValue: Number(totalRevenue._avg.totalAmount || 0),
      revenueGrowth,
      orderGrowth: 0, // TODO: Calculate order growth
      salesByPeriod,
      salesByCategory,
      topProducts,
      salesTrend,
    };
  }

  // Inventory Analytics
  static async getInventoryAnalytics(filters: AnalyticsFilters = {}): Promise<InventoryAnalytics> {
    const { categoryId } = filters;

    const whereClause: any = {};
    if (categoryId) {
      whereClause.categories = {
        some: { categoryId },
      };
    }

    // Get basic inventory metrics
    const [totalProducts, inventoryValue, lowStockProducts, outOfStockProducts] = await Promise.all([
      db.product.count({ where: whereClause }),
      db.product.aggregate({
        where: whereClause,
        _sum: { price: true },
      }),
      this.getLowStockProducts(categoryId),
      this.getOutOfStockProducts(categoryId),
    ]);

    // Get inventory by category
    const inventoryByCategory = await this.getInventoryByCategory();
    
    // Get inventory trend
    const inventoryTrend = await this.getInventoryTrend();
    
    // Get stock alerts
    const stockAlerts = await this.getStockAlerts();

    return {
      totalProducts,
      totalValue: Number(inventoryValue._sum.price || 0),
      lowStockProducts,
      outOfStockProducts,
      inventoryByCategory,
      inventoryTrend,
      stockAlerts,
    };
  }

  // Customer Analytics
  static async getCustomerAnalytics(filters: AnalyticsFilters = {}): Promise<CustomerAnalytics> {
    const { dateRange } = filters;

    const whereClause: any = {};
    if (dateRange) {
      whereClause.createdAt = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    }

    // Get basic customer metrics
    const [totalCustomers, activeCustomers, newCustomers, customerStats] = await Promise.all([
      db.customer.count(),
      db.customer.count({ where: { isActive: true } }),
      db.customer.count({ where: whereClause }),
      db.customer.aggregate({
        _count: { id: true },
        _avg: { orders: { _count: true } },
      }),
    ]);

    // Get customer lifetime value
    const customerLifetimeValue = await this.getCustomerLifetimeValue();
    
    // Get customer segments
    const customerSegments = await this.getCustomerSegments();
    
    // Get top customers
    const topCustomers = await this.getTopCustomers();
    
    // Get customer retention
    const customerRetention = await this.getCustomerRetention();

    // Calculate growth
    const previousPeriod = this.getPreviousPeriod(dateRange);
    const previousCustomers = await this.getPreviousPeriodCustomers(previousPeriod);
    const customerGrowth = previousCustomers > 0 
      ? ((newCustomers - previousCustomers) / previousCustomers) * 100 
      : 0;

    return {
      totalCustomers,
      activeCustomers,
      newCustomers,
      customerGrowth,
      averageCustomerValue: 0, // TODO: Calculate average customer value
      customerLifetimeValue,
      customerSegments,
      topCustomers,
      customerRetention,
    };
  }

  // Order Analytics
  static async getOrderAnalytics(filters: AnalyticsFilters = {}): Promise<OrderAnalytics> {
    const { dateRange } = filters;

    const whereClause: any = {};
    if (dateRange) {
      whereClause.createdAt = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    }

    // Get basic order metrics
    const [totalOrders, totalRevenue, orderStats, paymentStats] = await Promise.all([
      db.order.count({ where: whereClause }),
      db.order.aggregate({
        where: whereClause,
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      }),
      db.order.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { id: true },
      }),
      db.order.groupBy({
        by: ['paymentStatus'],
        where: whereClause,
        _count: { id: true },
      }),
    ]);

    // Get order trend
    const orderTrend = await this.getOrderTrend(dateRange);
    
    // Get order fulfillment
    const orderFulfillment = await this.getOrderFulfillment(dateRange);

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      averageOrderValue: Number(totalRevenue._avg.totalAmount || 0),
      ordersByStatus: orderStats.map(stat => ({
        status: stat.status,
        count: stat._count.id,
        percentage: 0, // TODO: Calculate percentage
      })),
      ordersByPaymentStatus: paymentStats.map(stat => ({
        status: stat.paymentStatus,
        count: stat._count.id,
        percentage: 0, // TODO: Calculate percentage
      })),
      orderTrend,
      orderFulfillment,
    };
  }

  // Dashboard Analytics
  static async getDashboardAnalytics(filters: AnalyticsFilters = {}): Promise<DashboardAnalytics> {
    const [sales, inventory, customers, orders, alerts] = await Promise.all([
      this.getSalesAnalytics(filters),
      this.getInventoryAnalytics(filters),
      this.getCustomerAnalytics(filters),
      this.getOrderAnalytics(filters),
      this.getDashboardAlerts(),
    ]);

    const overview: DashboardOverview = {
      totalRevenue: sales.totalRevenue,
      totalOrders: sales.totalOrders,
      totalCustomers: customers.totalCustomers,
      totalProducts: inventory.totalProducts,
      revenueGrowth: sales.revenueGrowth,
      orderGrowth: sales.orderGrowth,
      customerGrowth: customers.customerGrowth,
      productGrowth: 0, // TODO: Calculate product growth
    };

    return {
      overview,
      sales,
      inventory,
      customers,
      orders,
      alerts,
      lastUpdated: new Date(),
    };
  }

  // Real-time Metrics
  static async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get last hour for "current" metrics
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [
      ordersToday, 
      revenueToday, 
      topSellingProduct,
      currentOrders,
      recentCustomers
    ] = await Promise.all([
      // Orders today
      db.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      // Revenue today
      db.order.aggregate({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: { totalAmount: true },
      }),
      // Top selling product today
      this.getTopSellingProductToday(),
      // Current orders (last hour)
      db.order.count({
        where: {
          createdAt: {
            gte: oneHourAgo,
          },
          status: {
            in: ['PENDING', 'PROCESSING', 'SHIPPED'],
          },
        },
      }),
      // Recent unique customers (last hour) - approximate active users
      db.order.findMany({
        where: {
          createdAt: {
            gte: oneHourAgo,
          },
        },
        select: {
          customerId: true,
        },
        distinct: ['customerId'],
      }),
    ]);

    return {
      activeUsers: recentCustomers.length,
      currentOrders,
      revenueToday: Number(revenueToday._sum.totalAmount || 0),
      ordersToday,
      topSellingProduct,
      lastUpdated: new Date(),
    };
  }

  // Helper methods
  private static async getSalesByPeriod(dateRange?: DateRange): Promise<SalesByPeriod[]> {
    const defaultRange = dateRange || {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      to: new Date(),
    };

    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: defaultRange.from,
          lte: defaultRange.to,
        },
      },
      include: {
        items: true,
      },
    });

    // Group by day
    const salesByDay: Record<string, { revenue: number; orders: number; orderValues: number[] }> = {};
    
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!salesByDay[dateKey]) {
        salesByDay[dateKey] = { revenue: 0, orders: 0, orderValues: [] };
      }
      salesByDay[dateKey].revenue += Number(order.totalAmount);
      salesByDay[dateKey].orders += 1;
      salesByDay[dateKey].orderValues.push(Number(order.totalAmount));
    });

    return Object.entries(salesByDay)
      .map(([period, data]) => ({
        period,
        revenue: data.revenue,
        orders: data.orders,
        averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private static async getSalesByCategory(dateRange?: DateRange, categoryId?: string): Promise<SalesByCategory[]> {
    // Implementation for sales by category
    return [];
  }

  private static async getTopProducts(dateRange?: DateRange, categoryId?: string): Promise<TopProduct[]> {
    const whereClause: any = {};
    
    if (dateRange) {
      whereClause.order = {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      };
    }

    if (categoryId) {
      whereClause.product = {
        categories: {
          some: {
            categoryId,
          },
        },
      };
    }

    const orderItems = await db.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: whereClause,
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      _avg: {
        unitPrice: true,
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc',
        },
      },
      take: 10,
    });

    return orderItems.map(item => ({
      productId: item.productId,
      productName: item.productName || 'Unknown Product',
      revenue: Number(item._sum.totalPrice || 0),
      quantitySold: Number(item._sum.quantity || 0),
      averagePrice: Number(item._avg.unitPrice || 0),
    }));
  }

  private static async getSalesTrend(dateRange?: DateRange): Promise<SalesTrend[]> {
    const defaultRange = dateRange || {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      to: new Date(),
    };

    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: defaultRange.from,
          lte: defaultRange.to,
        },
      },
    });

    // Group by date
    const salesByDate: Record<string, { revenue: number; orders: number }> = {};
    
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { revenue: 0, orders: 0 };
      }
      salesByDate[dateKey].revenue += Number(order.totalAmount);
      salesByDate[dateKey].orders += 1;
    });

    return Object.entries(salesByDate)
      .map(([dateStr, data]) => ({
        date: new Date(dateStr),
        revenue: data.revenue,
        orders: data.orders,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private static async getLowStockProducts(categoryId?: string): Promise<LowStockProduct[]> {
    const whereClause: any = {
      inventoryQuantity: {
        lte: 10, // Low stock threshold
      },
    };

    if (categoryId) {
      whereClause.categories = {
        some: { categoryId },
      };
    }

    const products = await db.product.findMany({
      where: whereClause,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return products.map(product => ({
      productId: product.id,
      productName: product.name,
      currentStock: product.inventoryQuantity,
      minimumStock: 10, // TODO: Add minimum stock field to product
      categoryName: product.categories[0]?.category?.name || 'Uncategorized',
    }));
  }

  private static async getOutOfStockProducts(categoryId?: string): Promise<OutOfStockProduct[]> {
    const whereClause: any = {
      inventoryQuantity: 0,
    };

    if (categoryId) {
      whereClause.categories = {
        some: { categoryId },
      };
    }

    const products = await db.product.findMany({
      where: whereClause,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return products.map(product => ({
      productId: product.id,
      productName: product.name,
      categoryName: product.categories[0]?.category?.name || 'Uncategorized',
      daysOutOfStock: 0, // TODO: Calculate days out of stock
    }));
  }

  private static async getInventoryByCategory(): Promise<InventoryByCategory[]> {
    // Implementation for inventory by category
    return [];
  }

  private static async getInventoryTrend(): Promise<InventoryTrend[]> {
    // Implementation for inventory trend
    return [];
  }

  private static async getStockAlerts(): Promise<StockAlert[]> {
    // Implementation for stock alerts
    return [];
  }

  private static async getCustomerLifetimeValue(): Promise<CustomerLifetimeValue[]> {
    // Implementation for customer lifetime value
    return [];
  }

  private static async getCustomerSegments(): Promise<CustomerSegment[]> {
    // Implementation for customer segments
    return [];
  }

  private static async getTopCustomers(): Promise<TopCustomer[]> {
    // Implementation for top customers
    return [];
  }

  private static async getCustomerRetention(): Promise<CustomerRetention> {
    // Implementation for customer retention
    return {
      period: 'monthly',
      newCustomers: 0,
      returningCustomers: 0,
      retentionRate: 0,
    };
  }

  private static async getOrderTrend(dateRange?: DateRange): Promise<OrderTrend[]> {
    // Implementation for order trend
    return [];
  }

  private static async getOrderFulfillment(dateRange?: DateRange): Promise<OrderFulfillment> {
    // Implementation for order fulfillment
    return {
      averageFulfillmentTime: 0,
      onTimeDelivery: 0,
      delayedOrders: 0,
      fulfillmentTrend: [],
    };
  }

  private static async getDashboardAlerts(): Promise<DashboardAlert[]> {
    // Implementation for dashboard alerts
    return [];
  }

  private static async getTopSellingProductToday(): Promise<string> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const topProduct = await db.orderItem.groupBy({
      by: ['productName'],
      where: {
        order: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 1,
    });

    return topProduct.length > 0 && topProduct[0].productName 
      ? topProduct[0].productName 
      : 'No sales today';
  }

  private static getPreviousPeriod(dateRange?: DateRange): DateRange | undefined {
    if (!dateRange) return undefined;
    
    const duration = dateRange.to.getTime() - dateRange.from.getTime();
    return {
      from: new Date(dateRange.from.getTime() - duration),
      to: new Date(dateRange.to.getTime() - duration),
    };
  }

  private static async getPreviousPeriodRevenue(previousPeriod?: DateRange): Promise<number> {
    if (!previousPeriod) return 0;
    
    const result = await db.order.aggregate({
      where: {
        createdAt: {
          gte: previousPeriod.from,
          lte: previousPeriod.to,
        },
      },
      _sum: { totalAmount: true },
    });

    return Number(result._sum.totalAmount || 0);
  }

  private static async getPreviousPeriodCustomers(previousPeriod?: DateRange): Promise<number> {
    if (!previousPeriod) return 0;
    
    return db.customer.count({
      where: {
        createdAt: {
          gte: previousPeriod.from,
          lte: previousPeriod.to,
        },
      },
    });
  }
}
