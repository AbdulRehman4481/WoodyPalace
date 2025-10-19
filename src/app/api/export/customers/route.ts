import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { CustomerService } from '@/lib/services/customer';
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
    const validation = validateExportRequest('customers', format);
    if (!validation.valid) {
      return createErrorResponse(validation.error || 'Invalid export request', 400);
    }

    // Get filters from query parameters
    const filters: ExportFilters = {
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
    };

    // Fetch all customers (with pagination set to large limit)
    const result = await CustomerService.findMany({
      isActive: filters.isActive,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
    }, { page: 1, limit: 10000 });

    // Apply additional filters
    let customers = applyExportFilters(result.data, filters, 'customers');

    // Format data for export
    const formattedData = formatDataForExport(customers, 'customers');

    // Generate filename
    const filename = generateExportFilename('customers', format as 'csv' | 'json');

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
    console.error('Customer export error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to export customers',
      500
    );
  }
});
