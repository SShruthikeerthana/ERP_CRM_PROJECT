import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getCustomerByIdApi,
  updateCustomerApi,
  addFollowUpNoteApi,
} from '../services/customer.service';
import { Customer } from '../types';
import { Badge } from '../components/common/Badge';
import { CustomerModal } from '../components/customers/CustomerModal';
import {
  ArrowLeft,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  Clock,
  Edit,
  Plus,
  FileSpreadsheet,
  MessageSquareText,
  UserCheck,
} from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) fetchCustomerDetail();
  }, [id]);

  const fetchCustomerDetail = async () => {
    setLoading(true);
    try {
      const data = await getCustomerByIdApi(id!);
      setCustomer(data);
    } catch (err: any) {
      showError('Failed to fetch customer profile', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async (formData: Partial<Customer>) => {
    setIsUpdating(true);
    try {
      const updated = await updateCustomerApi(id!, formData);
      setCustomer((prev) => (prev ? { ...prev, ...updated } : updated));
      showSuccess('Customer Updated', 'Details updated successfully.');
      setIsEditModalOpen(false);
    } catch (err: any) {
      showError('Error updating customer', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    try {
      const noteObj = await addFollowUpNoteApi(id!, newNote.trim());
      setCustomer((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          followUpNotes: [noteObj, ...(prev.followUpNotes || [])],
        };
      });
      showSuccess('Follow-up Note Added', 'Note logged to customer timeline.');
      setNewNote('');
    } catch (err: any) {
      showError('Failed to add note', err.message);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Loading customer profile...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-12 text-center text-slate-400">
        Customer profile not found.{' '}
        <Link to="/customers" className="text-cyan-400 underline">
          Return to Customer List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button & Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/customers"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
              <Badge label={customer.status} variant={customer.status === 'Active' ? 'success' : 'warning'} />
              <Badge label={customer.customerType} variant="info" />
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <Building className="w-3.5 h-3.5" />
              <span>{customer.businessName}</span>
            </p>
          </div>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold rounded-xl transition-all"
          >
            <Edit className="w-4 h-4 text-cyan-400" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Grid: Left Column (Details), Right Column (Follow-up Notes & Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Information Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-semibold text-white border-b border-slate-800 pb-3">
              Account Overview
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Mobile Phone</span>
                <span className="text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  {customer.mobile}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block font-medium">Email Address</span>
                <span className="text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  {customer.email || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block font-medium">GSTIN Number</span>
                <span className="text-slate-200 font-mono font-semibold block mt-0.5">
                  {customer.gstNumber || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block font-medium">Next Follow-up Date</span>
                <span className="text-amber-400 font-semibold flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {customer.followUpDate || 'Not scheduled'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block font-medium">Address</span>
                <span className="text-slate-300 flex items-start gap-1.5 mt-0.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  {customer.address}
                </span>
              </div>

              {customer.notes && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block font-medium">General Notes</span>
                  <p className="text-slate-300 italic mt-0.5">{customer.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Sales Challans Overview */}
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <h3 className="text-base font-semibold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>Recent Sales Challans</span>
            </h3>

            {!customer.challans || customer.challans.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No sales challans for this customer.</p>
            ) : (
              <div className="space-y-2">
                {customer.challans.map((ch) => (
                  <Link
                    key={ch.id}
                    to={`/challans/${ch.id}`}
                    className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-cyan-500/40 flex justify-between items-center text-xs transition-all block"
                  >
                    <div>
                      <span className="font-mono font-bold text-cyan-400 block">{ch.challanNumber}</span>
                      <span className="text-slate-500">{new Date(ch.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-200 block">{ch.totalQuantity} units</span>
                      <Badge label={ch.status} size="sm" variant={ch.status === 'Confirmed' ? 'success' : 'default'} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Follow-up Notes Timeline Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquareText className="w-5 h-5 text-cyan-400" />
                <span>Follow-up Activity Timeline</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                {customer.followUpNotes?.length || 0} Notes
              </span>
            </div>

            {/* Add Follow-up Note Form */}
            {hasRole('ADMIN', 'SALES') && (
              <form onSubmit={handleAddNote} className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-semibold text-slate-300">
                  Log New Follow-Up Note
                </label>
                <textarea
                  required
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record interaction outcome, phone call notes, quote details..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNote.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-cyan-600/20 disabled:opacity-40 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isSubmittingNote ? 'Saving...' : 'Add Note to Timeline'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Timeline Notes List */}
            <div className="space-y-4 pt-2">
              {!customer.followUpNotes || customer.followUpNotes.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No follow-up notes recorded yet.
                </div>
              ) : (
                customer.followUpNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-semibold text-slate-200">
                          {note.createdBy?.name || 'Staff User'}
                        </span>
                        <Badge label={note.createdBy?.role || 'SALES'} size="sm" variant="info" />
                      </div>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{note.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Customer Modal */}
      <CustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateCustomer}
        customer={customer}
        isLoading={isUpdating}
      />
    </div>
  );
};
