# Quickstart Guide: E-Commerce Admin Panel

**Feature**: E-Commerce Admin Panel  
**Date**: 2025-01-27  
**Purpose**: Get the admin panel up and running quickly

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd myapp
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database credentials
   ```

3. **Database setup**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Admin Panel: http://localhost:3000/admin
   - API Documentation: http://localhost:3000/api/docs

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_admin"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# File Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880  # 5MB

# Application
NODE_ENV="development"
```

## Default Admin Account

After running the seed script, you can log in with:
- **Email**: admin@example.com
- **Password**: admin123

**⚠️ Change these credentials in production!**

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin route group
│   │   ├── products/      # Product management
│   │   ├── categories/    # Category management
│   │   ├── orders/        # Order management
│   │   ├── customers/     # Customer management
│   │   └── analytics/     # Analytics dashboard
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication
│   │   ├── products/      # Product API
│   │   ├── categories/    # Category API
│   │   ├── orders/        # Order API
│   │   ├── customers/     # Customer API
│   │   ├── analytics/     # Analytics API
│   │   └── export/        # Data export API
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   └── features/         # Feature-specific components
│       ├── products/     # Product components
│       ├── categories/   # Category components
│       ├── orders/       # Order components
│       ├── customers/    # Customer components
│       └── analytics/    # Analytics components
├── lib/                  # Utilities and configurations
│   ├── auth.ts          # NextAuth.js configuration
│   ├── db.ts            # Prisma client
│   ├── utils.ts         # Utility functions
│   ├── validations.ts   # Zod schemas
│   └── constants.ts     # App constants
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── styles/               # Additional styling
```

## Key Features

### 1. Product Management
- Create, read, update, delete products
- Manage product images
- Set inventory quantities
- Assign products to categories
- SKU management

### 2. Category Management
- Hierarchical category structure
- Create and organize categories
- Assign products to multiple categories
- Category slug management

### 3. Order Management
- View all customer orders
- Update order status
- Process refunds
- Order search and filtering
- Order details and history

### 4. Customer Management
- View customer profiles
- Update customer information
- Customer order history
- Account status management

### 5. Analytics Dashboard
- Sales analytics and reports
- Inventory reports
- Customer insights
- Revenue tracking
- Low stock alerts

### 6. Data Export
- Export products to CSV/JSON
- Export orders to CSV/JSON
- Export customer data to CSV/JSON
- Custom date range exports

## API Usage Examples

### Authentication
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'

# Use token in subsequent requests
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/products
```

### Product Management
```bash
# Get all products
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/products

# Create product
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Product",
    "price": 29.99,
    "sku": "SP-001",
    "inventoryQuantity": 100,
    "description": "A sample product"
  }'

# Update product
curl -X PUT http://localhost:3000/api/products/{id} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"price": 34.99}'
```

### Order Management
```bash
# Get orders
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/orders?status=pending&page=1&limit=20"

# Update order status
curl -X PUT http://localhost:3000/api/orders/{id} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "processing"}'
```

## Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript check

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
npm run db:reset         # Reset database
npm run db:studio        # Open Prisma Studio

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Run tests with coverage
```

## Common Tasks

### Adding a New Product
1. Navigate to Products → Add New Product
2. Fill in product details (name, price, SKU, inventory)
3. Upload product images
4. Assign to categories
5. Save product

### Processing an Order
1. Navigate to Orders
2. Find the order by number or customer
3. Review order details and items
4. Update order status (pending → processing → shipped → delivered)
5. Add notes if needed

### Managing Categories
1. Navigate to Categories
2. Create new category or edit existing
3. Set parent category for hierarchy
4. Assign products to categories
5. Reorder categories as needed

### Viewing Analytics
1. Navigate to Analytics
2. Select time period (day, week, month, year)
3. View sales metrics and trends
4. Check inventory reports
5. Review customer insights

## Troubleshooting

### Database Connection Issues
```bash
# Check database connection
npx prisma db pull

# Reset database
npx prisma migrate reset
```

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Ensure admin user exists in database

### File Upload Issues
- Check UPLOAD_DIR exists and is writable
- Verify MAX_FILE_SIZE is appropriate
- Ensure file types are allowed

### Performance Issues
- Check database indexes
- Monitor API response times
- Review bundle size with `npm run analyze`

## Production Deployment

1. **Environment Setup**:
   - Set production environment variables
   - Configure production database
   - Set up file storage (local or cloud)

2. **Build and Deploy**:
   ```bash
   npm run build
   npm run start
   ```

3. **Database Migration**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Security Checklist**:
   - Change default admin credentials
   - Set strong NEXTAUTH_SECRET
   - Configure HTTPS
   - Set up monitoring and logging
   - Enable rate limiting

## Support

For issues and questions:
- Check the API documentation at `/api/docs`
- Review the data model in `data-model.md`
- Check the research decisions in `research.md`
- Refer to the full specification in `spec.md`
