import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Clock,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Ban,
  HardDrive,
  DollarSign,
  Tag,
  Key,
} from 'lucide-react';
import { Customer, WifiPackage, SystemSettings } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  packages: WifiPackage[];
  settings: SystemSettings;
  onCreateCustomer: (cust: Partial<Customer>) => Promise<void>;
  onUpdateCustomer: (id: string, cust: Partial<Customer>) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  packages,
  settings,
  onCreateCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'active' | 'expired' | 'blocked'>('active');
  const [macAddress, setMacAddress] = useState('');
  const [packageId, setPackageId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      c.macAddresses.some((m) => m.toLowerCase().includes(search.toLowerCase())) ||
      (c.notes && c.notes.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreateModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setStatus('active');
    setMacAddress('');
    setPackageId(packages[0]?.id || '');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setPhone(cust.phone);
    setEmail(cust.email || '');
    setStatus(cust.status);
    setMacAddress(cust.macAddresses[0] || '');
    setPackageId(cust.activePackageId || '');
    setNotes(cust.notes || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedPkg = packages.find((p) => p.id === packageId);
      const macList = macAddress
        .split(',')
        .map((m) => m.trim().toUpperCase())
        .filter(Boolean);

      const payload: Partial<Customer> = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        status,
        macAddresses: macList,
        activePackageId: selectedPkg?.id,
        activePackageName: selectedPkg?.name,
        notes: notes.trim(),
      };

      if (editingCustomer) {
        await onUpdateCustomer(editingCustomer.id, payload);
      } else {
        await onCreateCustomer(payload);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMb = (mb: number) => {
    if (mb > 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-md backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Customer &amp; Subscriber Management</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                {customers.length} Registered Users
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage resident tenants, hotel/hostel guests, and café regulars with MAC address authentication bindings.
            </p>
          </div>

          <button
            id="btn-add-customer"
            onClick={openCreateModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, phone, email, notes, or MAC address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="all">All Customer Statuses</option>
              <option value="active">Active Plan</option>
              <option value="expired">Expired Plan</option>
              <option value="blocked">Blocked / Blacklisted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-700 text-slate-400">
                <th className="py-3 px-4 font-medium">Customer Details</th>
                <th className="py-3 px-4 font-medium">Bound MAC Devices</th>
                <th className="py-3 px-4 font-medium">Current Package</th>
                <th className="py-3 px-4 font-medium">Data Consumption</th>
                <th className="py-3 px-4 font-medium">Total Paid</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Notes</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No customers found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-750/30 transition">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-bold text-white text-xs">{cust.name}</div>
                        <div className="text-[11px] text-slate-400">{cust.phone}</div>
                        {cust.email && (
                          <div className="text-[10px] text-slate-500">{cust.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {cust.macAddresses.length > 0 ? (
                        <div className="space-y-0.5">
                          {cust.macAddresses.map((mac, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300 mr-1"
                            >
                              {mac}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px]">No MAC bound</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {cust.activePackageName ? (
                        <div>
                          <div className="font-semibold text-cyan-300 truncate max-w-[140px]">
                            {cust.activePackageName}
                          </div>
                          {cust.expiresAt && (
                            <div className="text-[10px] text-slate-400">
                              Exp: {new Date(cust.expiresAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No active plan</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {formatMb(cust.dataUsedMb)}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {settings.currencySymbol}
                      {cust.totalPaid.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {cust.status === 'active' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                      {cust.status === 'expired' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Expired
                        </span>
                      )}
                      {cust.status === 'blocked' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Blocked
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      <span className="truncate block max-w-[130px]">{cust.notes || '—'}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => openEditModal(cust)}
                          className="p-1 rounded text-slate-400 hover:text-cyan-300 transition"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCustomer(cust.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Liam Walker"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@mail.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  MAC Address Authentication (comma-separated for multiple)
                </label>
                <input
                  type="text"
                  value={macAddress}
                  onChange={(e) => setMacAddress(e.target.value)}
                  placeholder="4A:2C:19:8B:7F:3D, 7E:11:09:A3:4C:91"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-emerald-500 uppercase"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Allows device to bypass captive portal directly via router MAC Cookie.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Active Package Plan</label>
                  <select
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">No Plan (Unassigned)</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({settings.currencySymbol}{pkg.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="blocked">Blocked / Blacklisted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Room / Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Room 204 or Café Regular"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
                >
                  {isSubmitting ? 'Saving...' : editingCustomer ? 'Update' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
