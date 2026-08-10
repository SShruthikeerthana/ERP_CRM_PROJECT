import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCustomersApi, createCustomerApi } from '../services/customer.service';
import { Customer, CustomerStatus, CustomerType } from '../types';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { CustomerModal } from '../components/customers/CustomerModal';
import { Users, Search, Filter, Plus, Phone, Mail, Building, Eye } from 'lucide-react';

export const CustomerListPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [page, statusFilter, typeFilter]);

  const fetchCustomers = async (searchOverride?: string) => {
    setLoading(true);
    try {
      const data = await getCustomersApi({
        page,
        limit: 10,
        search: searchOverride !== undefined ? searchOverride : searchTerm,
        status: statusFilter || undefined,
        customerType: typeFilter || undefined,
      });

      setCustomers(data.items);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.total);
    } catch (err: any) {
      showError('Failed to load customers', err.message);
    } fontFinally: {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleCreateCustomer = async (formData: Partial<Customer>) => {
    setModalLoading(true);
    try {
      const newCustomer = await createCustomerApi(formData);
      showSuccess('Customer Added', `Successfully registered ${newCustomer.name}`);
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      showError('Error Creating Customer', err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusVariant = (status: CustomerStatus) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Lead':
        return 'warning';
      case 'Inactive':
        return 'default';
    }
  };

  const getTypeVariant = (type: CustomerType) => {
    switch (type) {
      case 'Wholesale':
        return 'info';
      case 'Distributor':
        return 'purple';
      case 'Retail':
        return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Customer CRM Management</span>
          </h1>
          <p className="text-sm text-slate-400">
            Track leads, wholesale distributors, retail accounts & follow-up activities.
          </p>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, mobile, email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filters:</span>
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
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Customer Types</option>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
          </select>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Customer & Business</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">GST Number</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No customers found matching search filters.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3" />
                        <span>{c.businessName}</span>
                      </div>
                    </td>

                    <td className="p-4 text-xs space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Phone className="w-3 h-3 text-cyan-400" />
                        <span>{c.mobile}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Mail className="w-3 h-3" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <Badge label={c.customerType} variant={getTypeVariant(c.customerType)} />
                    </td>

                    <td className="p-4">
                      <Badge label={c.status} variant={getStatusVariant(c.status)} />
                    </td>

                    <td className="p-4 text-xs font-mono text-slate-400">
                      {c.gstNumber || <span className="italic text-slate-600">N/A</span>}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        to={`/customers/${c.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-cyan-300 hover:text-cyan-200 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Profile</span>
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

      {/* Add Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCustomer}
        isLoading={modalLoading}
      />
    </div>
  );
};
