// Analytics and Reporting Types

export interface DateRange {
  from: Date;
  to: Date;
}

export interface AnalyticsFilters {
  dateRange?: DateRange;
  categoryId?: string;
  productId?: string;
  customerId?: string;
  status?: string;
}

// Sales Analytics
export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  salesByPeriod: SalesByPeriod[];
  salesByCategory: SalesByCategory[];
  topProducts: TopProduct[];
  salesTrend: SalesTrend[];
}

export interface SalesByPeriod {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface SalesByCategory {
  categoryId: string;
  categoryName: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  revenue: number;
  quantitySold: number;
  averagePrice: number;
}

export interface SalesTrend {
  date: Date;
  revenue: number;
  orders: number;
}

// Inventory Analytics
export interface InventoryAnalytics {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: LowStockProduct[];
  outOfStockProducts: OutOfStockProduct[];
  inventoryByCategory: InventoryByCategory[];
  inventoryTrend: InventoryTrend[];
  stockAlerts: StockAlert[];
}

export interface LowStockProduct {
  productId: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  categoryName: string;
  lastRestocked?: Date;
}

export interface OutOfStockProduct {
  productId: string;
  productName: string;
  categoryName: string;
  lastSold?: Date;
  daysOutOfStock: number;
}

export interface InventoryByCategory {
  categoryId: string;
  categoryName: string;
  totalProducts: number;
  totalValue: number;
  averageValue: number;
}

export interface InventoryTrend {
  date: Date;
  totalValue: number;
  totalProducts: number;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
  currentStock: number;
  threshold: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: Date;
}

// Customer Analytics
export interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  customerGrowth: number;
  averageCustomerValue: number;
  customerLifetimeValue: CustomerLifetimeValue[];
  customerSegments: CustomerSegment[];
  topCustomers: TopCustomer[];
  customerRetention: CustomerRetention;
}

export interface CustomerLifetimeValue {
  customerId: string;
  customerName: string;
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  firstOrderDate: Date;
  lastOrderDate: Date;
  lifetimeValue: number;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  averageValue: number;
  description: string;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate: Date;
}

export interface CustomerRetention {
  period: string;
  newCustomers: number;
  returningCustomers: number;
  retentionRate: number;
}

// Order Analytics
export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: OrderStatusCount[];
  ordersByPaymentStatus: PaymentStatusCount[];
  orderTrend: OrderTrend[];
  orderFulfillment: OrderFulfillment;
}

export interface OrderStatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface PaymentStatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface OrderTrend {
  date: Date;
  orders: number;
  revenue: number;
}

export interface OrderFulfillment {
  averageFulfillmentTime: number;
  onTimeDelivery: number;
  delayedOrders: number;
  fulfillmentTrend: FulfillmentTrend[];
}

export interface FulfillmentTrend {
  date: Date;
  averageTime: number;
  onTimeRate: number;
}

// Dashboard Analytics
export interface DashboardAnalytics {
  overview: DashboardOverview;
  sales: SalesAnalytics;
  inventory: InventoryAnalytics;
  customers: CustomerAnalytics;
  orders: OrderAnalytics;
  alerts: DashboardAlert[];
  lastUpdated: Date;
}

export interface DashboardOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  productGrowth: number;
}

export interface DashboardAlert {
  id: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'HIGH_ORDER_VOLUME' | 'CUSTOMER_ISSUE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  actionRequired: boolean;
  createdAt: Date;
  data?: any;
}

// Export and Reporting
export interface AnalyticsExport {
  type: 'CSV' | 'JSON' | 'PDF';
  data: any;
  filename: string;
  generatedAt: Date;
  filters: AnalyticsFilters;
}

export interface ReportConfig {
  name: string;
  description: string;
  type: 'SALES' | 'INVENTORY' | 'CUSTOMER' | 'ORDER' | 'CUSTOM';
  filters: AnalyticsFilters;
  format: 'CSV' | 'JSON' | 'PDF';
  schedule?: ReportSchedule;
}

export interface ReportSchedule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
}

// Chart and Visualization
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins?: {
    legend?: {
      position: string;
    };
    title?: {
      display: boolean;
      text: string;
    };
  };
  scales?: {
    x?: {
      display: boolean;
      title?: {
        display: boolean;
        text: string;
      };
    };
    y?: {
      display: boolean;
      title?: {
        display: boolean;
        text: string;
      };
    };
  };
}

// Analytics API Response Types
export interface AnalyticsResponse<T> {
  data: T;
  filters: AnalyticsFilters;
  generatedAt: Date;
  cacheExpiry?: Date;
}

export interface PaginatedAnalyticsResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: AnalyticsFilters;
  generatedAt: Date;
}

// Real-time Analytics
export interface RealTimeMetrics {
  activeUsers: number;
  currentOrders: number;
  revenueToday: number;
  ordersToday: number;
  topSellingProduct: string;
  lastUpdated: Date;
}

export interface AnalyticsSubscription {
  id: string;
  userId: string;
  metrics: string[];
  frequency: 'REALTIME' | 'HOURLY' | 'DAILY';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
