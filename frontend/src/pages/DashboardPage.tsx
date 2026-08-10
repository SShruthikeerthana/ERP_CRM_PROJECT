import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCustomersApi } from '../services/customer.service';
import { getProductsApi } from '../services/product.service';
import { getChallansApi } from '../services/challan.service';
import { Customer, Product, Challan } from '../types';
import { Badge } from '../components/common/Badge';
import {
  Users,
  Package,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Plus,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [customerStats, setCustomerStats] = useState({
    total: 0,
    active: 0,
    lead: 0,
    inactive: 0,
  });

  const [productStats, setProductStats] = useState({
    total: 0,
    lowStockCount: 0,
  });

  const [challanStats, setChallanStats] = useState({
    total: 0,
    draft: 0,
    confirmed: 0,
    cancelled: 0,
  });

  const [recentChallans, setRecentChallans] = useState<Challan[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Customer Metrics
      const [customersRes, activeRes, leadRes, inactiveRes] = await Promise.all([
        getCustomersApi({ limit: 1 }),
        getCustomersApi({ status: 'Active', limit: 1 }),
        getCustomersApi({ status: 'Lead', limit: 1 }),
        getCustomersApi({ status: 'Inactive', limit: 1 }),
      ]);

      setCustomerStats({
        total: customersRes.pagination.total,
        active: activeRes.pagination.total,
        lead: leadRes.pagination.total,
        inactive: inactiveRes.pagination.total,
      });

      // Fetch Products & Low Stock Alert items
      const [productsRes, lowStockRes] = await Promise.all([
        getProductsApi({ limit: 1 }),
        getProductsApi({ lowStockOnly: true, limit: 5 }),
      ]);

      setProductStats({
        total: productsRes.pagination.total,
        lowStockCount: lowStockRes.pagination.total,
      });
      setLowStockProducts(lowStockRes.items);

      // Fetch Sales Challans Metrics
      const [challansRes, draftRes, confirmedRes, cancelledRes] = await Promise.all([
        getChallansApi({ limit: 5 }),
        getChallansApi({ status: 'Draft', limit: 1 }),
        getChallansApi({ status: 'Confirmed', limit: 1 }),
        getChallansApi({ status: 'Cancelled', limit: 1 }),
      ]);

      setChallanStats({
        total: challansRes.pagination.total,
        draft: draftRes.pagination.total,
        confirmed: confirmedRes.pagination.total,
        cancelled: cancelledRes.pagination.total,
      });
      setRecentChallans(challansRes.items);
    } catch (error) {
      console.error('Error loading dashboard telemetry:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Operations Center
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time Operations KPI Summary for Wholesale & Logistics Management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
            <Link
              to="/challans/new"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-cyan-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Challan</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Metrics Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Customer CRM
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800/50">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-white">{customerStats.total}</div>
            <span className="text-xs text-slate-400">Total Registered Accounts</span>
          </div>

          <div className="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-950/60 rounded-lg">
              <span className="text-emerald-400 font-bold block">{customerStats.active}</span>
              <span className="text-slate-400">Active</span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-lg">
              <span className="text-amber-400 font-bold block">{customerStats.lead}</span>
              <span className="text-slate-400">Leads</span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-lg">
              <span className="text-slate-400 font-bold block">{customerStats.inactive}</span>
              <span className="text-slate-400">Inactive</span>
            </div>
          </div>
        </div>

        {/* Product & Stock Alert Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Inventory & Products
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-800/50">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-white">{productStats.total}</div>
            <span className="text-xs text-slate-400">Master Product SKUs</span>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-medium">Low Stock Alert:</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-700/50 font-bold">
              {productStats.lowStockCount} Products
            </span>
          </div>
        </div>

        {/* Sales Challan Metrics Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sales Challans
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800/50">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-white">{challanStats.total}</div>
            <span className="text-xs text-slate-400">Total Challans Created</span>
          </div>

          <div className="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-950/60 rounded-lg">
              <span className="text-slate-300 font-bold block">{challanStats.draft}</span>
              <span className="text-slate-400">Draft</span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-lg">
              <span className="text-emerald-400 font-bold block">{challanStats.confirmed}</span>
              <span className="text-slate-400">Confirmed</span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-lg">
              <span className="text-rose-400 font-bold block">{challanStats.cancelled}</span>
              <span className="text-slate-400">Cancelled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Low Stock Warnings & Recent Sales Challans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Items Warning Table */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-semibold text-white">Low Stock Warning Items</h3>
            </div>
            <Link
              to="/products"
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              ✨ All product inventory levels are healthy!
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 bg-slate-900/80 rounded-xl border border-amber-900/30 flex items-center justify-between"
                >
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">{product.name}</span>
                    <span className="text-xs text-slate-500 font-mono">SKU: {product.sku} | Loc: {product.location}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-amber-400 block">{product.currentStock} units</span>
                    <span className="text-[10px] text-slate-400">Min Alert: {product.minStockAlert}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales Challans Widget */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-semibold text-white">Recent Sales Challans</h3>
            </div>
            <Link
              to="/challans"
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentChallans.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No sales challans recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {recentChallans.map((challan) => (
                <Link
                  key={challan.id}
                  to={`/challans/${challan.id}`}
                  className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between transition-all block"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-cyan-400 font-mono">
                        {challan.challanNumber}
                      </span>
                      <Badge
                        label={challan.status}
                        variant={
                          challan.status === 'Confirmed'
                            ? 'success'
                            : challan.status === 'Cancelled'
                            ? 'danger'
                            : 'default'
                        }
                      />
                    </div>
                    <span className="text-xs text-slate-300 block mt-0.5">
                      {challan.customer?.name} ({challan.customer?.businessName})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-slate-200 block">
                      {challan.totalQuantity} units
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(challan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
