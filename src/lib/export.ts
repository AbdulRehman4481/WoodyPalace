// Data Export Utilities

export interface ExportOptions {
  filename?: string;
  format: 'csv' | 'json';
  data: any[];
  headers?: string[];
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0] || {});
  
  // Create header row
  const headerRow = csvHeaders.map(h => `"${h}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return csvHeaders.map(header => {
      const value = item[header];
      
      // Handle different data types
      if (value === null || value === undefined) {
        return '""';
      }
      
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      
      return `"${value}"`;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Convert data to JSON format
 */
export function convertToJSON(data: any[]): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Generate export filename
 */
export function generateExportFilename(type: string, format: 'csv' | 'json'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${type}-export-${timestamp}.${format}`;
}

/**
 * Format data for export
 */
export function formatDataForExport(data: any[], type: 'products' | 'orders' | 'customers' | 'categories'): any[] {
  if (!data || data.length === 0) {
    return [];
  }

  switch (type) {
    case 'products':
      return data.map(product => ({
        ID: product.id,
        Name: product.name,
        SKU: product.sku,
        Price: product.price,
        'Inventory Quantity': product.inventoryQuantity,
        Active: product.isActive ? 'Yes' : 'No',
        Discontinued: product.isDiscontinued ? 'Yes' : 'No',
        'Created At': new Date(product.createdAt).toLocaleString(),
        'Updated At': new Date(product.updatedAt).toLocaleString(),
      }));

    case 'orders':
      return data.map(order => ({
        ID: order.id,
        'Order Number': order.orderNumber,
        'Customer ID': order.customerId,
        Status: order.status,
        'Payment Status': order.paymentStatus,
        Subtotal: order.subtotal,
        'Tax Amount': order.taxAmount,
        'Shipping Amount': order.shippingAmount,
        'Total Amount': order.totalAmount,
        'Created At': new Date(order.createdAt).toLocaleString(),
        'Updated At': new Date(order.updatedAt).toLocaleString(),
      }));

    case 'customers':
      return data.map(customer => ({
        ID: customer.id,
        'First Name': customer.firstName,
        'Last Name': customer.lastName,
        Email: customer.email,
        Phone: customer.phone || 'N/A',
        Active: customer.isActive ? 'Yes' : 'No',
        'Last Login': customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleString() : 'Never',
        'Created At': new Date(customer.createdAt).toLocaleString(),
      }));

    case 'categories':
      return data.map(category => ({
        ID: category.id,
        Name: category.name,
        Slug: category.slug,
        'Parent ID': category.parentId || 'N/A',
        Active: category.isActive ? 'Yes' : 'No',
        'Sort Order': category.sortOrder,
        'Created At': new Date(category.createdAt).toLocaleString(),
        'Updated At': new Date(category.updatedAt).toLocaleString(),
      }));

    default:
      return data;
  }
}

/**
 * Create export response
 */
export function createExportResponse(data: string, filename: string, format: 'csv' | 'json'): Response {
  const contentType = format === 'csv' ? 'text/csv' : 'application/json';
  const blob = new Blob([data], { type: contentType });
  
  return new Response(blob, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

/**
 * Validate export request
 */
export function validateExportRequest(type: string, format: string): { valid: boolean; error?: string } {
  const validTypes = ['products', 'orders', 'customers', 'categories', 'analytics'];
  const validFormats = ['csv', 'json'];

  if (!validTypes.includes(type)) {
    return { valid: false, error: `Invalid export type: ${type}` };
  }

  if (!validFormats.includes(format)) {
    return { valid: false, error: `Invalid export format: ${format}` };
  }

  return { valid: true };
}

/**
 * Export data with filtering
 */
export interface ExportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  categoryId?: string;
  isActive?: boolean;
}

export function applyExportFilters(data: any[], filters: ExportFilters, type: string): any[] {
  let filteredData = [...data];

  // Date range filtering
  if (filters.dateFrom || filters.dateTo) {
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.createdAt);
      if (filters.dateFrom && itemDate < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && itemDate > new Date(filters.dateTo)) {
        return false;
      }
      return true;
    });
  }

  // Status filtering
  if (filters.status) {
    filteredData = filteredData.filter(item => item.status === filters.status);
  }

  // Category filtering
  if (filters.categoryId) {
    filteredData = filteredData.filter(item => {
      if (item.categories && Array.isArray(item.categories)) {
        return item.categories.some((cat: any) => cat.categoryId === filters.categoryId);
      }
      return false;
    });
  }

  // Active status filtering
  if (filters.isActive !== undefined) {
    filteredData = filteredData.filter(item => item.isActive === filters.isActive);
  }

  return filteredData;
}
