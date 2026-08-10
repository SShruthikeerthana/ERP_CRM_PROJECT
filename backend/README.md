# Mini ERP + CRM Operations Portal — Backend API Service

Node.js + Express + TypeScript + Prisma PostgreSQL/SQLite REST API service powering the Mini ERP + CRM Operations Portal.

## Module Overview & Endpoints

### 1. Authentication & Role-Based Access Control (`/api/v1/auth`)
- **`POST /api/v1/auth/login`**: Authenticate credentials, returns JWT token (1h expiry) and user profile (`id`, `name`, `email`, `role`).
- **`GET /api/v1/auth/me`**: Returns profile of currently authenticated user.

### 2. Customer CRM Module (`/api/v1/customers`)
- **`GET /api/v1/customers`**: Paginated listing with search (`name`, `mobile`, `email`, `businessName`) and filters (`status`, `customerType`). Accessible by all roles.
- **`GET /api/v1/customers/:id`**: Detailed customer view including timeline of historical follow-up notes.
- **`POST /api/v1/customers`**: Create a new customer (`Retail`, `Wholesale`, `Distributor`). Restricted to `ADMIN` and `SALES`.
- **`PUT /api/v1/customers/:id`**: Update customer details. Restricted to `ADMIN` and `SALES`.
- **`POST /api/v1/customers/:id/notes`**: Append a new follow-up note associated with the logged-in user. Restricted to `ADMIN` and `SALES`.

### 3. Product & Inventory Module (`/api/v1/products`)
- **`GET /api/v1/products`**: Paginated catalog with search (`name`, `sku`, `category`) and automatic low-stock warning flag (`isLowStock = currentStock <= minStockAlert`). Accessible by all roles.
- **`GET /api/v1/products/:id`**: Product detail view including historical stock movements.
- **`POST /api/v1/products`**: Add new product with SKU uniqueness enforcement. Restricted to `ADMIN` and `WAREHOUSE`.
- **`PUT /api/v1/products/:id`**: Modify product details. Restricted to `ADMIN` and `WAREHOUSE`.
- **`POST /api/v1/products/:id/stock-movements`**: Record stock movement (`IN` or `OUT`). Executed inside an atomic Prisma `$transaction`. Returns **HTTP 409 Conflict** if an `OUT` movement would cause negative stock (`currentStock < 0`). Restricted to `ADMIN` and `WAREHOUSE`.
- **`GET /api/v1/products/:id/stock-movements`**: Append-only movement history audit log.

### 4. Sales Challan Module (`/api/v1/challans`)
- **`POST /api/v1/challans`**: Create new sales challan saved in `Draft` status. Automatically generates unique challan number (e.g. `CH-2026-00001`) and snapshots product data (`productName`, `sku`, `unitPrice`). Skips stock check. Restricted to `ADMIN` and `SALES`.
- **`PUT /api/v1/challans/:id`**: Modify draft challan items and quantity. Restricted to `ADMIN` and `SALES`.
- **`POST /api/v1/challans/:id/confirm`**: Transition `Draft` -> `Confirmed` inside an atomic Prisma `$transaction`. Checks live stock for all items; if ANY item is short, rejects whole confirmation with **HTTP 409 Conflict** returning `shortItems`. If all items have stock, decrements stocks and inserts append-only `StockMovement` `OUT` records. Restricted to `ADMIN` and `SALES`.
- **`POST /api/v1/challans/:id/cancel`**: Cancel challan. If previously `Confirmed`, restores product stocks and inserts `StockMovement` `IN` records inside a `$transaction`. Restricted to `ADMIN` and `SALES`.
- **`GET /api/v1/challans`**: Paginated challan listing with status and customer filters.
- **`GET /api/v1/challans/:id`**: Full challan detail view with snapshot data and status history.

## Test Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@operations.com` | `Admin123!` | Unrestricted access across all modules |
| **Sales** | `sales@operations.com` | `Sales123!` | Full CRM & Challan access; Read-only Inventory |
| **Warehouse** | `warehouse@operations.com` | `Warehouse123!` | Full Product & Stock access; Read-only CRM & Challans |
| **Accounts** | `accounts@operations.com` | `Accounts123!` | Read-only access across all modules |

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Initialize database schema:
   ```bash
   npx prisma db push
   ```
3. Seed database:
   ```bash
   npm run seed
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
