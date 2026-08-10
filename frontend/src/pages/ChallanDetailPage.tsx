import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getChallanByIdApi,
  confirmChallanApi,
  cancelChallanApi,
} from '../services/challan.service';
import { Challan } from '../types';
import { Badge } from '../components/common/Badge';
import { ChallanPrintView } from '../components/challans/ChallanPrintView';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Building,
  Calendar,
  UserCheck,
  Package,
} from 'lucide-react';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id) fetchChallanDetail();
  }, [id]);

  const fetchChallanDetail = async () => {
    setLoading(true);
    try {
      const data = await getChallanByIdApi(id!);
      setChallan(data);
    } catch (err: any) {
      showError('Failed to load sales challan', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const updated = await confirmChallanApi(id!);
      setChallan(updated);
      showSuccess(
        'Challan Confirmed Successfully',
        `Stock has been deducted for all products in Sales Challan ${updated.challanNumber}.`
      );
    } catch (err: any) {
      // Handles 409 Conflict error listing short items
      showError('Stock Confirmation Failed', err.message, err.details);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this challan? Stock will be restored if previously confirmed.')) {
      return;
    }

    setIsProcessing(true);
    try {
      const updated = await cancelChallanApi(id!);
      setChallan(updated);
      showSuccess('Challan Cancelled', `Challan ${updated.challanNumber} has been marked as Cancelled.`);
    } catch (err: any) {
      showError('Failed to cancel challan', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-medium">Loading sales challan...</div>;
  }

  if (!challan) {
    return (
      <div className="p-12 text-center text-slate-400">
        Sales Challan not found.{' '}
        <Link to="/challans" className="text-cyan-400 underline">
          Return to Challans List
        </Link>
      </div>
    );
  }

  const isDraft = challan.status === 'Draft';
  const isConfirmed = challan.status === 'Confirmed';
  const isCancelled = challan.status === 'Cancelled';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link
            to="/challans"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-mono font-bold text-cyan-400">
                {challan.challanNumber}
              </h1>
              <Badge
                label={challan.status}
                variant={isConfirmed ? 'success' : isCancelled ? 'danger' : 'warning'}
                size="md"
              />
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <Building className="w-3.5 h-3.5" />
              <span>Customer: {challan.customer?.name} ({challan.customer?.businessName})</span>
            </p>
          </div>
        </div>

        {/* Action Controls for Admin/Sales */}
        <div className="flex items-center gap-3">
          {hasRole('ADMIN', 'SALES') && isDraft && (
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isProcessing ? 'Confirming...' : 'Confirm & Deduct Stock'}</span>
            </button>
          )}

          {hasRole('ADMIN', 'SALES') && !isCancelled && (
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-rose-950 border border-rose-700/50 hover:bg-rose-900 text-rose-200 font-semibold rounded-xl text-sm disabled:opacity-50 transition-all"
            >
              <XCircle className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : 'Cancel Challan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Details & Print View Component */}
      <ChallanPrintView challan={challan} />
    </div>
  );
};
