# Mini ERP + CRM Operations Portal — Frontend Web Portal

React + TypeScript + Vite + Tailwind CSS web client powering the Mini ERP + CRM Operations Portal.

## Key Technical Features

1. **In-Memory JWT Authentication**:
   - `AuthContext` stores signed JWT tokens in memory (React state) rather than `localStorage`.
   - **Security Advantage**: Prevents XSS (Cross-Site Scripting) script attacks from accessing stored credentials.
   - **User Experience**: Header features a 1-click Quick Demo Role Switcher for instant role testing across `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS`.

2. **Responsive Admin Layout & Navigation**:
   - Dynamic sidebar drawer for tablet/mobile viewports.
   - Active route styling and role badge indicators.

3. **Universal Toast Notifications**:
   - `ToastProvider` pops up interactive notifications for success and error events.
   - Displays structured `shortItems` payload when a sales challan confirmation is rejected due to insufficient stock (**HTTP 409 Conflict**).

4. **PDF Invoice & Delivery Challan Export**:
   - One-click print / PDF export view formatted for physical delivery challan generation.

## Available Pages & Routes

- `/login`: Public Login UI with 1-click test credentials for all 4 roles.
- `/dashboard`: Real-time KPI summary (Customer counts by status, Low Stock alerts, Recent Sales Challans).
- `/customers` & `/customers/:id`: Customer CRM table, search, status/type filters, pagination, follow-up notes timeline, and add-note form.
- `/products` & `/products/:id`: Product catalog table with low-stock warning highlights (`currentStock <= minStockAlert`), append-only stock movement audit log, and stock movement form.
- `/challans`, `/challans/new`, `/challans/:id`: Sales challan management, draft saving, atomic stock confirmation, cancellation stock restoration, and printable delivery challan PDF view.

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Vite development server:
   ```bash
   npm run dev
   ```
3. Build production bundle:
   ```bash
   npm run build
   ```
