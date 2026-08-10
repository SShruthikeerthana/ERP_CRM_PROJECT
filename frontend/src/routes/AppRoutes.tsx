import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminLayout } from '../components/layout/AdminLayout';

import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CustomerListPage } from '../pages/CustomerListPage';
import { CustomerDetailPage } from '../pages/CustomerDetailPage';
import { ProductListPage } from '../pages/ProductListPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ChallanListPage } from '../pages/ChallanListPage';
import { ChallanFormPage } from '../pages/ChallanFormPage';
import { ChallanDetailPage } from '../pages/ChallanDetailPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Portal Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Customer CRM */}
          <Route path="/customers" element={<CustomerListPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />

          {/* Products & Inventory */}
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          {/* Sales Challans */}
          <Route path="/challans" element={<ChallanListPage />} />
          <Route
            path="/challans/new"
            element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}
          >
            <Route index element={<ChallanFormPage />} />
          </Route>
          <Route path="/challans/:id" element={<ChallanDetailPage />} />

          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
