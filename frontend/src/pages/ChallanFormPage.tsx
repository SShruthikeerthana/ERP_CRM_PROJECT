import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getCustomersApi } from '../services/customer.service';
import { getProductsApi } from '../services/product.service';
import { createChallanApi, confirmChallanApi } from '../services/challan.service';
import { Customer, Product } from '../types';
import { ArrowLeft, Plus, Trash2, Save, CheckCircle2, Package, User } from 'lucide-react';

interface SelectedItem {
  productId: string;
  quantity: number;
}

export const ChallanFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<SelectedItem[]>([{ productId: '', quantity: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialOptions();
  }, []);

  const fetchInitialOptions = async () => {
    setLoading(true);
    try {
      const [custRes, prodRes] = await Promise.all([
        getCustomersApi({ limit: 100 }),
        getProductsApi({ limit: 100 }),
      ]);
      setCustomers(custRes.items);
      setProducts(prodRes.items);
    } catch (err: any) {
      showError('Failed to load selection options', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemRow = () => {
    setItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'quantity' ? Math.max(1, parseInt(value, 10) || 1) : value,
      };
      return updated;
    });
  };

  const calculateTotalQuantity = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  };

  const handleSave = async (shouldConfirm: boolean = false) => {
    if (!selectedCustomerId) {
      showError('Validation Error', 'Please select a customer account.');
      return;
    }

    const validItems = items.filter((item) => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      showError('Validation Error', 'Please select at least one product with valid quantity.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Draft Challan
      const newChallan = await createChallanApi({
        customerId: selectedCustomerId,
        items: validItems,
      });

      if (shouldConfirm) {
        // 2. Try to confirm immediately inside transaction
        try {
          await confirmChallanApi(newChallan.id);
          showSuccess(
            'Challan Confirmed!',
            `Sales Challan ${newChallan.challanNumber} created & stock deducted.`
          );
          navigate(`/challans/${newChallan.id}`);
        } catch (confirmErr: any) {
          // If confirm fails due to 409 short stock, challan stays as Draft!
          showError(
            'Draft Saved, but Stock Confirmation Failed',
            confirmErr.message,
            confirmErr.details
          );
          navigate(`/challans/${newChallan.id}`);
        }
      } else {
        showSuccess(
          'Draft Challan Saved',
          `Created Sales Challan ${newChallan.challanNumber} as Draft.`
        );
        navigate(`/challans/${newChallan.id}`);
      }
    } catch (err: any) {
      showError('Failed to create sales challan', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-medium">Loading form options...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Back button & Title Bar */}
      <div className="flex items-center gap-3">
        <Link
          to="/challans"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Sales Challan</h1>
          <p className="text-xs text-slate-400">
            Snapshot product information & dispatch stock to wholesale customer.
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
        {/* Customer Selector Section */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Select Customer Account *</span>
          </label>
          <select
            required
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">-- Choose Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.businessName} ({c.customerType})
              </option>
            ))}
          </select>
        </div>

        {/* Product Items Table Section */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              <span>Challan Product Line Items</span>
            </h3>
            <button
              type="button"
              onClick={handleAddItemRow}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const selectedProd = products.find((p) => p.id === item.productId);

              return (
                <div
                  key={index}
                  className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-7">
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">
                      Product SKU *
                    </label>
                    <select
                      required
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} — {p.name} (Stock: {p.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-4">
                    {selectedProd && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Available: <b className="text-emerald-400">{selectedProd.currentStock}</b>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(index)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Footer Bar */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">
            Total Line Items: <b className="text-white">{items.length}</b>
          </span>
          <span className="text-slate-400">
            Total Requested Quantity:{' '}
            <b className="text-cyan-400 text-sm font-mono">{calculateTotalQuantity()} units</b>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all border border-slate-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save as Draft (No Stock Check)</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-cyan-600/20 disabled:opacity-50 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Deduct Stock</span>
          </button>
        </div>
      </div>
    </div>
  );
};
