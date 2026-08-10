import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getProductByIdApi,
  updateProductApi,
  recordStockMovementApi,
} from '../services/product.service';
import { Product, MovementType } from '../types';
import { Badge } from '../components/common/Badge';
import { ProductModal } from '../components/products/ProductModal';
import { StockMovementModal } from '../components/products/StockMovementModal';
import {
  ArrowLeft,
  Package,
  Layers,
  MapPin,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Clock,
  UserCheck,
  Edit,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isRecordingMovement, setIsRecordingMovement] = useState(false);

  useEffect(() => {
    if (id) fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const data = await getProductByIdApi(id!);
      setProduct(data);
    } catch (err: any) {
      showError('Failed to fetch product details', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (formData: Partial<Product>) => {
    setIsUpdating(true);
    try {
      const updated = await updateProductApi(id!, formData);
      setProduct((prev) => (prev ? { ...prev, ...updated } : updated));
      showSuccess('Product Catalog Updated', 'Product details saved successfully.');
      setIsEditModalOpen(false);
    } catch (err: any) {
      showError('Error updating product', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRecordMovement = async (data: {
    quantityChanged: number;
    movementType: MovementType;
    reason: string;
  }) => {
    setIsRecordingMovement(true);
    try {
      const result = await recordStockMovementApi(id!, data);
      setProduct(result.product);
      showSuccess(
        'Stock Movement Logged',
        `Successfully recorded ${data.movementType} movement of ${data.quantityChanged} units.`
      );
      setIsMovementModalOpen(false);
      fetchProductDetail();
    } catch (err: any) {
      // Handles 409 Conflict error with short items payload display in Toast
      showError('Stock Movement Failed', err.message, err.details);
    } finally {
      setIsRecordingMovement(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-medium">Loading inventory item...</div>;
  }

  if (!product) {
    return (
      <div className="p-12 text-center text-slate-400">
        Product not found.{' '}
        <Link to="/products" className="text-cyan-400 underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-sm text-cyan-400 px-2.5 py-1 bg-cyan-950/80 border border-cyan-700/50 rounded-lg">
                {product.sku}
              </span>
              <h1 className="text-2xl font-bold text-white">{product.name}</h1>
              {product.isLowStock && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-950 border border-rose-500 text-rose-300 text-xs font-bold animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alert
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Category: {product.category}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasRole('ADMIN', 'WAREHOUSE') && (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold rounded-xl transition-all"
              >
                <Edit className="w-4 h-4 text-cyan-400" />
                <span>Edit Info</span>
              </button>

              <button
                onClick={() => setIsMovementModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Record Stock Movement</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Product Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <span className="text-xs font-medium text-slate-400 block">Current Live Stock</span>
          <span className="text-3xl font-black text-emerald-400 font-mono block">
            {product.currentStock} units
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-1">
          <span className="text-xs font-medium text-slate-400 block">Unit Price (₹)</span>
          <span className="text-2xl font-bold text-white font-mono block">
            ₹{product.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-1">
          <span className="text-xs font-medium text-slate-400 block">Min Stock Alert Level</span>
          <span className="text-2xl font-bold text-amber-400 font-mono block">
            {product.minStockAlert} units
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-1">
          <span className="text-xs font-medium text-slate-400 block">Warehouse Location</span>
          <span className="text-base font-semibold text-slate-200 flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4 text-cyan-400" />
            {product.location}
          </span>
        </div>
      </div>

      {/* Append-Only Stock Movement History Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>Append-Only Stock Movement Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical ledger of stock adjustments, inward receipts, and challan dispatches.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {product.stockMovements?.length || 0} Movements Logged
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Quantity Changed</th>
                <th className="p-3">Reason / Reference</th>
                <th className="p-3">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {!product.stockMovements || product.stockMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : (
                product.stockMovements.map((sm) => {
                  const isIn = sm.movementType === 'IN';
                  return (
                    <tr key={sm.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 text-slate-400">
                        {new Date(sm.createdAt).toLocaleString()}
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                            isIn
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                              : 'bg-rose-950 text-rose-300 border border-rose-700/50'
                          }`}
                        >
                          {isIn ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          Stock {sm.movementType}
                        </span>
                      </td>

                      <td
                        className={`p-3 text-right font-mono font-bold text-sm ${
                          isIn ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isIn ? `+${sm.quantityChanged}` : `-${sm.quantityChanged}`}
                      </td>

                      <td className="p-3 text-slate-200 font-medium">{sm.reason}</td>

                      <td className="p-3 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span>{sm.createdBy?.name || 'Staff User'}</span>
                          <Badge label={sm.createdBy?.role || 'WAREHOUSE'} size="sm" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      <ProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProduct}
        product={product}
        isLoading={isUpdating}
      />

      {/* Stock Movement Modal */}
      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSubmit={handleRecordMovement}
        product={product}
        isLoading={isRecordingMovement}
      />
    </div>
  );
};
