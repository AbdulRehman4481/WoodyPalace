# Data Model: E-Commerce Admin Panel

**Feature**: E-Commerce Admin Panel  
**Date**: 2025-01-27  
**Purpose**: Define database schema and entity relationships

## Entity Definitions

### AdminUser
Represents administrative users with authentication credentials and permissions.

**Fields**:
- `id`: UUID (Primary Key)
- `email`: String (Unique, Required)
- `passwordHash`: String (Required)
- `name`: String (Required)
- `role`: Enum ['ADMIN'] (Required, Default: 'ADMIN')
- `isActive`: Boolean (Required, Default: true)
- `lastLoginAt`: DateTime (Optional)
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)

**Validation Rules**:
- Email must be valid format
- Password must be at least 8 characters
- Name must be 2-100 characters

**Relationships**:
- One-to-many with AuditLog (createdBy)

### Product
Represents items for sale with attributes and category assignments.

**Fields**:
- `id`: UUID (Primary Key)
- `name`: String (Required, 2-200 characters)
- `description`: Text (Optional)
- `price`: Decimal (Required, >= 0)
- `sku`: String (Unique, Required, 3-50 characters)
- `inventoryQuantity`: Integer (Required, >= 0)
- `isActive`: Boolean (Required, Default: true)
- `isDiscontinued`: Boolean (Required, Default: false)
- `images`: String[] (Optional, Array of image URLs)
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)

**Validation Rules**:
- Price must be positive decimal
- SKU must be unique and alphanumeric
- Inventory quantity cannot be negative
- At least one image required for active products

**Relationships**:
- Many-to-many with Category (ProductCategory)
- One-to-many with OrderItem
- One-to-many with AuditLog

### Category
Represents product groupings with hierarchical structure.

**Fields**:
- `id`: UUID (Primary Key)
- `name`: String (Required, 2-100 characters)
- `description`: Text (Optional)
- `slug`: String (Unique, Required, 2-100 characters)
- `parentId`: UUID (Optional, Self-referencing)
- `isActive`: Boolean (Required, Default: true)
- `sortOrder`: Integer (Required, Default: 0)
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)

**Validation Rules**:
- Name must be unique within same parent category
- Slug must be URL-safe and unique
- Cannot set self as parent (prevent circular references)
- Sort order must be non-negative integer

**Relationships**:
- Self-referencing (parent/children)
- Many-to-many with Product (ProductCategory)
- One-to-many with AuditLog

### ProductCategory
Junction table for many-to-many relationship between products and categories.

**Fields**:
- `id`: UUID (Primary Key)
- `productId`: UUID (Foreign Key to Product)
- `categoryId`: UUID (Foreign Key to Category)
- `isPrimary`: Boolean (Required, Default: false)
- `createdAt`: DateTime (Required)

**Validation Rules**:
- Product can only have one primary category
- Unique combination of productId and categoryId

### Customer
Represents customer accounts with contact information and order history.

**Fields**:
- `id`: UUID (Primary Key)
- `email`: String (Unique, Required)
- `firstName`: String (Required, 2-50 characters)
- `lastName`: String (Required, 2-50 characters)
- `phone`: String (Optional, 10-20 characters)
- `address`: Address (Optional, Embedded)
- `isActive`: Boolean (Required, Default: true)
- `lastLoginAt`: DateTime (Optional)
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)

**Validation Rules**:
- Email must be valid format
- Phone must be valid format if provided
- Address fields must be valid if provided

**Relationships**:
- One-to-many with Order
- One-to-many with AuditLog

### Order
Represents customer purchases with items, status, and payment information.

**Fields**:
- `id`: UUID (Primary Key)
- `orderNumber`: String (Unique, Required, Auto-generated)
- `customerId`: UUID (Foreign Key to Customer)
- `status`: Enum ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] (Required, Default: 'PENDING')
- `subtotal`: Decimal (Required, >= 0)
- `taxAmount`: Decimal (Required, >= 0)
- `shippingAmount`: Decimal (Required, >= 0)
- `totalAmount`: Decimal (Required, >= 0)
- `shippingAddress`: Address (Required, Embedded)
- `billingAddress`: Address (Required, Embedded)
- `paymentStatus`: Enum ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] (Required, Default: 'PENDING')
- `notes`: Text (Optional)
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)

**Validation Rules**:
- Order number must be unique and auto-generated
- Total amount must equal subtotal + tax + shipping
- Shipping and billing addresses required
- Status transitions must be valid

**Relationships**:
- Many-to-one with Customer
- One-to-many with OrderItem
- One-to-many with AuditLog

### OrderItem
Represents individual products within an order with quantity and price.

**Fields**:
- `id`: UUID (Primary Key)
- `orderId`: UUID (Foreign Key to Order)
- `productId`: UUID (Foreign Key to Product)
- `productName`: String (Required, Snapshot of product name)
- `productSku`: String (Required, Snapshot of product SKU)
- `quantity`: Integer (Required, > 0)
- `unitPrice`: Decimal (Required, >= 0, Snapshot of price)
- `totalPrice`: Decimal (Required, >= 0)
- `isDiscontinued`: Boolean (Required, Default: false)
- `createdAt`: DateTime (Required)

**Validation Rules**:
- Quantity must be positive integer
- Total price must equal quantity × unit price
- Product snapshot fields required for order integrity

**Relationships**:
- Many-to-one with Order
- Many-to-one with Product

### AuditLog
Represents administrative actions for audit purposes.

**Fields**:
- `id`: UUID (Primary Key)
- `action`: String (Required, 2-100 characters)
- `entityType`: String (Required, 2-50 characters)
- `entityId`: UUID (Required)
- `oldValues`: JSON (Optional)
- `newValues`: JSON (Optional)
- `adminUserId`: UUID (Foreign Key to AdminUser)
- `ipAddress`: String (Optional, 7-45 characters)
- `userAgent`: String (Optional, Max 500 characters)
- `createdAt`: DateTime (Required)

**Validation Rules**:
- Action must be descriptive and specific
- Entity type must match actual entity names
- IP address must be valid format if provided

**Relationships**:
- Many-to-one with AdminUser

### Address
Embedded type for customer and order addresses.

**Fields**:
- `street`: String (Required, 5-200 characters)
- `city`: String (Required, 2-100 characters)
- `state`: String (Required, 2-50 characters)
- `postalCode`: String (Required, 5-20 characters)
- `country`: String (Required, 2-50 characters)

**Validation Rules**:
- All fields required for complete address
- Postal code format validation based on country

## Database Constraints

### Unique Constraints
- AdminUser.email
- Product.sku
- Category.slug
- ProductCategory (productId, categoryId)
- Customer.email
- Order.orderNumber

### Check Constraints
- Product.price >= 0
- Product.inventoryQuantity >= 0
- Order.subtotal >= 0
- Order.taxAmount >= 0
- Order.shippingAmount >= 0
- Order.totalAmount >= 0
- OrderItem.quantity > 0
- OrderItem.unitPrice >= 0
- OrderItem.totalPrice >= 0

### Indexes
- Product.sku (Unique)
- Product.name (Search)
- Category.slug (Unique)
- Category.parentId (Foreign Key)
- Order.customerId (Foreign Key)
- Order.status (Query)
- Order.createdAt (Sorting)
- OrderItem.orderId (Foreign Key)
- OrderItem.productId (Foreign Key)
- AuditLog.entityType + entityId (Query)
- AuditLog.createdAt (Sorting)

## State Transitions

### Order Status Flow
```
PENDING → PROCESSING → SHIPPED → DELIVERED
    ↓         ↓           ↓
CANCELLED  CANCELLED  CANCELLED
```

### Product Lifecycle
```
Active → Discontinued (soft delete)
    ↓
Deleted (hard delete, mark order items as discontinued)
```

### Admin User Status
```
Active → Inactive (disable access)
    ↓
Deleted (remove from system)
```

## Data Integrity Rules

1. **Product Deletion**: When a product is deleted, mark all related OrderItems as discontinued
2. **Category Deletion**: Prevent deletion if products are assigned to the category
3. **Order Modification**: Only allow status updates, not item modifications after creation
4. **Audit Trail**: All administrative actions must be logged with user and timestamp
5. **Concurrent Editing**: Last save wins with no conflict detection (as clarified)
6. **Data Export**: Support CSV and JSON formats for all entities
