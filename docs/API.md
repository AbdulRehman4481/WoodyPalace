# API Documentation

This document provides comprehensive documentation for the E-Commerce Admin Panel API endpoints.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication. Include the session token in your requests.

```javascript
// Using fetch
fetch('/api/products', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
```

## Products API

### List Products

**GET** `/api/products`

Query Parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search query
- `categoryId` (string): Filter by category
- `isActive` (boolean): Filter by active status
- `isDiscontinued` (boolean): Filter by discontinued status

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### Get Product

**GET** `/api/products/[id]`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Product Name",
    "sku": "SKU123",
    "price": 99.99,
    ...
  }
}
```

### Create Product

**POST** `/api/products`

**Request Body:**
```json
{
  "name": "Product Name",
  "sku": "SKU123",
  "price": 99.99,
  "inventoryQuantity": 100,
  "isActive": true
}
```

### Update Product

**PUT** `/api/products/[id]`

**Request Body:**
```json
{
  "name": "Updated Name",
  "price": 109.99
}
```

### Delete Product

**DELETE** `/api/products/[id]`

## Categories API

### List Categories

**GET** `/api/categories`

Query Parameters:
- `tree` (boolean): Return hierarchical tree structure
- `parentId` (string): Filter by parent category
- `isActive` (boolean): Filter by active status

### Create Category

**POST** `/api/categories`

**Request Body:**
```json
{
  "name": "Category Name",
  "slug": "category-slug",
  "parentId": "optional-parent-id",
  "isActive": true,
  "sortOrder": 0
}
```

### Move Category

**PUT** `/api/categories/[id]/move`

**Request Body:**
```json
{
  "newParentId": "new-parent-id",
  "newSortOrder": 5
}
```

## Orders API

### List Orders

**GET** `/api/orders`

Query Parameters:
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by order status
- `paymentStatus` (string): Filter by payment status
- `dateFrom` (string): Start date
- `dateTo` (string): End date

### Get Order

**GET** `/api/orders/[id]`

### Update Order Status

**PUT** `/api/orders/[id]/status`

**Request Body:**
```json
{
  "status": "SHIPPED",
  "notes": "Order shipped via FedEx",
  "adminComment": "Tracking: 123456789"
}
```

### Get Order Analytics

**GET** `/api/orders/analytics`

## Customers API

### List Customers

**GET** `/api/customers`

Query Parameters:
- `search` (boolean): Enable search mode
- `query` (string): Search query
- `isActive` (boolean): Filter by active status
- `hasOrders` (boolean): Filter by order history

### Get Customer

**GET** `/api/customers/[id]`

### Update Customer

**PUT** `/api/customers/[id]`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "isActive": true
}
```

### Get Customer Orders

**GET** `/api/customers/[id]/orders`

### Toggle Customer Status

**PUT** `/api/customers/[id]/toggle-status`

## Analytics API

### Get Sales Analytics

**GET** `/api/analytics/sales`

Query Parameters:
- `dateFrom` (string): Start date
- `dateTo` (string): End date
- `categoryId` (string): Filter by category

### Get Inventory Analytics

**GET** `/api/analytics/inventory`

### Get Customer Analytics

**GET** `/api/analytics/customers`

### Get Dashboard Analytics

**GET** `/api/analytics/dashboard`

### Get Real-time Metrics

**GET** `/api/analytics/realtime`

## Export API

### Export Products

**GET** `/api/export/products`

Query Parameters:
- `format` (string): 'csv' or 'json' (default: 'csv')
- `dateFrom` (string): Filter start date
- `dateTo` (string): Filter end date
- `isActive` (boolean): Filter by active status
- `categoryId` (string): Filter by category

**Response:** File download

### Export Orders

**GET** `/api/export/orders`

Query Parameters:
- `format` (string): 'csv' or 'json'
- `status` (string): Filter by order status
- `dateFrom` (string): Filter start date
- `dateTo` (string): Filter end date

### Export Customers

**GET** `/api/export/customers`

Query Parameters:
- `format` (string): 'csv' or 'json'
- `isActive` (boolean): Filter by active status
- `dateFrom` (string): Filter start date
- `dateTo` (string): Filter end date

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to 100 requests per minute per IP address.

## Pagination

All list endpoints support pagination with the following parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Pagination response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering

Most endpoints support filtering through query parameters. Common filters:
- Date ranges: `dateFrom`, `dateTo`
- Status: `status`, `isActive`
- Search: `search`, `query`
- Category: `categoryId`
- Sort: `sortBy`, `sortOrder`

## Best Practices

1. **Use pagination** for large datasets
2. **Implement retry logic** for failed requests
3. **Cache responses** when appropriate
4. **Handle errors gracefully**
5. **Use filters** to reduce data transfer
6. **Validate data** before sending requests
7. **Monitor rate limits**
8. **Use compression** for large payloads

