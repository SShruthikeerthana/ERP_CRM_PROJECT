import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getChallansApi } from '../services/challan.service';
import { Challan, ChallanStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { FileSpreadsheet, Search, Filter, Plus, Eye, Building } from 'lucide-react';

export const ChallanListPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showError } = useToast();

  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchChallans();
  }, [page, statusFilter]);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const data = await getChallansApi({
        page,
        limit: 10,
        search: searchTerm,
        status: statusFilter || undefined,
      });

      setChallans(data.items);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.total);
    } catch (err: any) {
      showError('Failed to load sales challans', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchChallans();
  };

  const getStatusVariant = (status: ChallanStatus) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Draft':
        return 'warning';
      case 'Cancelled':
        return 'danger';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
            <span>Sales Challan Operations</span>
          </h1>
          <p className="text-sm text-slate-400">
            Generate draft delivery challans, confirm stock dispatches & manage sales orders.
          </p>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <Link
            to="/challans/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Challan</span>
          </Link>
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
            placeholder="Search challan #, customer name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filter Status:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Challan Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Challan Number</th>
                <th className="p-4">Customer Account</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Items & Total Qty</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading sales challans...
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No sales challans found.
                  </td>
                </tr>
              ) : (
                challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-cyan-400">{ch.challanNumber}</td>

                    <td className="p-4">
                      <div className="font-semibold text-white">{ch.customer?.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3" />
                        <span>{ch.customer?.businessName}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge label={ch.status} variant={getStatusVariant(ch.status)} />
                    </td>

                    <td className="p-4 text-center">
                      <span className="font-mono text-slate-200 font-bold">
                        {ch.totalQuantity} units
                      </span>
                      <span className="text-xs text-slate-500 block">
                        ({ch.items?.length || 0} line items)
                      </span>
                    </td>

                    <td className="p-4 text-xs text-slate-400">
                      {new Date(ch.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        to={`/challans/${ch.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-cyan-300 hover:text-cyan-200 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Challan</span>
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
    </div>
  );
};
