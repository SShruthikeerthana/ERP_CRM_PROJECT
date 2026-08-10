import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Product, MovementType } from '../../types';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { quantityChanged: number; movementType: MovementType; reason: string }) => Promise<void>;
  product: Product | null;
  isLoading?: boolean;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading = false,
}) => {
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [quantityChanged, setQuantityChanged] = useState<number>(1);
  const [reason, setReason] = useState<string>('');

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      movementType,
      quantityChanged: Number(quantityChanged),
      reason,
    });
    setQuantityChanged(1);
    setReason('');
  };

  const projectedStock =
    movementType === 'IN'
      ? product.currentStock + (Number(quantityChanged) || 0)
      : product.currentStock - (Number(quantityChanged) || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Stock Movement — ${product.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Stock Summary Banner */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400 block">SKU: {product.sku}</span>
            <span className="text-slate-200 font-semibold">Location: {product.location}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">Current Live Stock</span>
            <span className="text-lg font-bold text-cyan-400">{product.currentStock} units</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Movement Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMovementType('IN')}
              className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                movementType === 'IN'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-900/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Stock IN (Add)
            </button>

            <button
              type="button"
              onClick={() => setMovementType('OUT')}
              className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                movementType === 'OUT'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-lg shadow-rose-900/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              Stock OUT (Deduct)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Quantity Changed *
          </label>
          <input
            type="number"
            min="1"
            required
            value={quantityChanged}
            onChange={(e) => setQuantityChanged(parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Reason / Document Reference *
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              movementType === 'IN'
                ? 'e.g. Inward Purchase Order PO-9801'
                : 'e.g. Dispatched for Store Branch Transfer'
            }
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Projected Stock Notice */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
          <span className="text-slate-400">Projected Stock Level:</span>
          <span
            className={`font-semibold ${
              projectedStock < 0
                ? 'text-rose-400 font-bold'
                : projectedStock <= product.minStockAlert
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {projectedStock} units
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || (movementType === 'OUT' && projectedStock < 0)}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-40 transition-all"
          >
            {isLoading ? 'Processing...' : 'Record Movement'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
