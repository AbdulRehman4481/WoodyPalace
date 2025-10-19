import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { OrderService } from '@/lib/services/order';
import { createErrorResponse } from '@/lib/api-response';
import { 
  convertToCSV, 
  convertToJSON, 
  generateExportFilename, 
  formatDataForExport,
  validateExportRequest,
  applyExportFilters,
  ExportFilters
} from '@/lib/export';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv';

    // Validate export request
    const validation = validateExportRequest('orders', format);
    if (!validation.valid) {
      return createErrorResponse(validation.error || 'Invalid export request', 400);
    }

    // Get filters from query parameters
    const filters: ExportFilters = {
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      status: searchParams.get('status') || undefined,
    };

    // Fetch all orders (with pagination set to large limit)
    const result = await OrderService.findMany({
      status: filters.status as any,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
    }, {}, 1, 10000);

    // Apply additional filters
    let orders = applyExportFilters(result.orders, filters, 'orders');

    // Format data for export
    const formattedData = formatDataForExport(orders, 'orders');

    // Generate filename
    const filename = generateExportFilename('orders', format as 'csv' | 'json');

    // Convert data based on format
    let exportData: string;
    let contentType: string;

    if (format === 'csv') {
      exportData = convertToCSV(formattedData);
      contentType = 'text/csv';
    } else {
      exportData = convertToJSON(formattedData);
      contentType = 'application/json';
    }

    // Return export file
    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Order export error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to export orders',
      500
    );
  }
});
