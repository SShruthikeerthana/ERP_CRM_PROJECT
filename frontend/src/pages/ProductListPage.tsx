import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProductsApi, createProductApi } from '../services/product.service';
import { Product } from '../types';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { ProductModal } from '../components/products/ProductModal';
import { Package, Search, Plus, AlertTriangle, Eye, Layers, MapPin } from 'lucide-react';

export const ProductListPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter, lowStockOnly]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProductsApi({
        page,
        limit: 10,
        search: searchTerm,
        category: categoryFilter || undefined,
        lowStockOnly: lowStockOnly || undefined,
      });

      setProducts(data.items);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.total);
    } catch (err: any) {
      showError('Failed to fetch products', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleCreateProduct = async (formData: Partial<Product>) => {
    setModalLoading(true);
    try {
      const newProduct = await createProductApi(formData);
      showSuccess('Product Added', `Successfully registered ${newProduct.name} (SKU: ${newProduct.sku})`);
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showError('Error Creating Product', err.message);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            <span>Product Catalog & Stock Control</span>
          </h1>
          <p className="text-sm text-slate-400">
            Monitor inventory levels, warehouse locations, SKUs, and minimum stock alerts.
          </p>
        </div>

        {hasRole('ADMIN', 'WAREHOUSE') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search SKU, name, category..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setLowStockOnly(!lowStockOnly);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              lowStockOnly
                ? 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-md shadow-amber-900/30'
                : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Warning Only</span>
          </button>

          <input
            type="text"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by Category"
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Product Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">SKU & Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Unit Price (₹)</th>
                <th className="p-4 text-center">Current Stock</th>
                <th className="p-4">Warehouse Location</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-900/40 transition-colors ${
                      p.isLowStock ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-cyan-400">{p.sku}</span>
                        {p.isLowStock && (
                          <span
                            title={`Stock below alert threshold (${p.minStockAlert})`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950 border border-amber-600 text-amber-300 text-[10px] font-bold animate-pulse"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-white mt-0.5">{p.name}</div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-300">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {p.category}
                      </span>
                    </td>

                    <td className="p-4 text-right font-mono font-semibold text-slate-200">
                      ₹{p.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`font-mono text-base font-extrabold px-3 py-1 rounded-xl border ${
                          p.isLowStock
                            ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                            : 'bg-slate-950 border-slate-800 text-emerald-400'
                        }`}
                      >
                        {p.currentStock}
                      </span>
                    </td>

                    <td className="p-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{p.location}</span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        to={`/products/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-cyan-300 hover:text-cyan-200 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Stock History</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={10}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* Add Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProduct}
        isLoading={modalLoading}
      />
    </div>
  );
};
