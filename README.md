# Mini ERP + CRM Operations Portal

Full-stack Mini ERP + CRM Operations Portal built for a wholesale and distribution company. The portal manages customer relationships, product inventories, stock movements, and sales delivery challans with strict role-based access control (RBAC).

---

## 🚀 Required Tech Stack

- **Backend**: Node.js + Express.js + TypeScript + Prisma ORM + PostgreSQL / SQLite
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **Auth**: JWT-based authentication with role-based route middleware
- **Validation**: Zod schema validation for all API request bodies, queries, and parameters
- **DevOps**: Docker & Docker Compose containerization setup

---

## 🔑 Default Seed Credentials & RBAC Access Matrix

Run `npm run seed` inside `/backend` (or `npm run seed` from root) to populate default test accounts.

| Role | Email | Password | Module Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@operations.com` | `Admin123!` | Full unrestricted access across all system modules |
| **Sales** | `sales@operations.com` | `Sales123!` | Full Customer CRM & Sales Challan access; Read-only Inventory |
| **Warehouse** | `warehouse@operations.com` | `Warehouse123!` | Full Product & Stock access; Read-only CRM & Challans |
| **Accounts** | `accounts@operations.com` | `Accounts123!` | Read-only access across all portal modules |

---

## 📁 Repository Monorepo Structure

```
/ERP-CRM-PROJECT
├── package.json                        # Root monorepo script runner
├── docker-compose.yml                  # Docker Compose multi-container setup
├── Mini_ERP_CRM.postman_collection.json # Ready-to-use Postman collection
├── README.md                           # Master project & case study documentation
│
├── backend/                            # Express + TypeScript + Prisma API
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile                      # Production Node.js Docker container
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma               # Prisma data models & enums
│   │   └── seed.ts                     # Database seeder script
│   └── src/
│       ├── app.ts                      # Express app bootstrap
│       ├── server.ts                   # Server entry point
│       ├── config/                     # Environment & DB connection
│       ├── constants/                  # Roles & system constants
│       ├── types/                      # TypeScript API interfaces
│       ├── utils/                      # Standardized response helper & errors
│       ├── middlewares/                # Error handler, Zod validator, JWT verify, RBAC
│       ├── validators/                 # Zod schemas (auth, customer, product, challan)
│       ├── services/                   # Business logic & atomic transactions
│       ├── controllers/                # Request controllers
│       └── routes/                     # Express API routes
│
└── frontend/                           # React + TypeScript + Vite Client
    ├── package.json
    ├── vite.config.ts
    ├── Dockerfile                      # NGINX production Docker container
    ├── nginx.conf                      # NGINX SPA routing configuration
    ├── .env.example
    └── src/
        ├── main.tsx & App.tsx
        ├── index.css                   # Tailwind styling & print PDF styles
        ├── context/                    # AuthContext (in-memory JWT) & ToastContext
        ├── services/                   # Base HTTP API client & domain wrappers
        ├── components/                 # UI components (AdminLayout, Modals, Badges)
        ├── pages/                      # Dashboard, Customers, Products, Challans
        └── routes/AppRoutes.tsx        # Protected route definitions
```

---

## 🛠️ Core Business Logic & Architectural Highlights

### 1. Unified API Response Shape
All API endpoints return responses adhering strictly to the standardized envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```
In case of an error:
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Insufficient stock available for 'Heavy Duty Copper Wire Spool'",
    "details": {
      "shortItems": [
        { "sku": "PROD-COPPER-02", "name": "Heavy Duty Copper Wire Spool", "requested": 10, "available": 4 }
      ]
    }
  }
}
```

### 2. In-Memory JWT Authentication Security
- The signed JWT token is stored purely in React Context memory (`AuthContext`) rather than `localStorage`.
- **Security Rationale**: Storing tokens in memory prevents XSS script access to credentials.
- **UX Helper**: The top bar of the application features a **1-Click Quick Demo Role Switcher** (`Admin`, `Sales`, `Warehouse`, `Accounts`) allowing reviewers to instantly test role-based access.

### 3. Sales Challan All-or-Nothing Stock Transaction
- **Draft Creation**: `POST /api/v1/challans` saves sales orders as `Draft` without stock checks, capturing item snapshots (`productName`, `sku`, `unitPrice` at sale time).
- **Atomic Confirmation**: `POST /api/v1/challans/:id/confirm` executes inside a Prisma `$transaction`. Live stock is checked for all items. If **ANY** item has `currentStock < requestedQuantity`, the transaction aborts with **HTTP 409 Conflict** and returns a clear `shortItems` list. If all items have stock, stock is decremented and `StockMovement` `OUT` records are created.
- **Stock Restoration**: `POST /api/v1/challans/:id/cancel` restores product stock and records `StockMovement` `IN` entries in a `$transaction`.

---

## ⚡ How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Option A: Standard Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   npm run dev:backend -- prefix
   ```
   Or install in both folders:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Initialize Database & Seed Test Users**:
   ```bash
   cd backend
   npx prisma db push
   npm run seed
   ```

3. **Start Backend & Frontend Servers**:
   - Backend API: `http://localhost:5000`
   - Frontend Web App: `http://localhost:3000`

   To run both simultaneously from the root directory:
   ```bash
   npm run dev
   ```

### Option B: Docker Compose Setup

Run the multi-container stack with a single command:
```bash
docker-compose up --build
```
- Backend API running on `http://localhost:5000`
- Frontend Web Portal running on `http://localhost:3000`
- PostgreSQL database running on `localhost:5432`

---

## 🌐 Cloud Deployment Guide (Free Hosting Platforms)

### 1. Database (Supabase or Render Postgres)
- Create a free PostgreSQL instance on [Supabase](https://supabase.com) or [Render](https://render.com).
- Copy the connection string (e.g., `postgresql://postgres:[password]@db.supabase.co:5432/postgres`).

### 2. Backend (Render, Railway, or Fly.io)
- Connect repository to [Render Web Service](https://render.com).
- Root Directory: `backend`
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npx prisma db push && npm run seed && npm start`
- Environment Variables:
  - `PORT`: `5000`
  - `NODE_ENV`: `production`
  - `DATABASE_URL`: `<YOUR_POSTGRES_CONNECTION_STRING>`
  - `JWT_SECRET`: `<YOUR_RANDOM_SECRET>`

### 3. Frontend (Vercel or Netlify)
- Connect repository to [Vercel](https://vercel.com).
- Root Directory: `frontend`
- Framework Preset: `Vite`
- Environment Variable: `VITE_API_BASE_URL` = `<YOUR_LIVE_BACKEND_API_URL>/api/v1`

---

## 📄 Postman Collection Usage

1. Open Postman.
2. Click **Import** and select `Mini_ERP_CRM.postman_collection.json` located in the root directory.
3. The collection is pre-configured with environment variables (`{{baseUrl}}`, `{{authToken}}`).
4. Execute `Login - Admin` or `Login - Sales` to obtain a JWT token, then paste the token into `authToken` variable to test protected endpoints.

---

## 📄 License & Case Study Assignment Context

Developed as a case study solution for the Mini ERP + CRM Operations Portal assignment.
