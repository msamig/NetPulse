import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Printer,
  DollarSign,
  Download,
  Calendar,
  CheckCircle,
  Receipt,
  Ticket,
} from 'lucide-react';
import { Payment, WifiPackage, SystemSettings } from '../types';

interface PaymentsViewProps {
  payments: Payment[];
  packages: WifiPackage[];
  settings: SystemSettings;
  onRecordPayment: (data: {
    customerName: string;
    customerPhone?: string;
    packageId: string;
    packageName: string;
    amount: number;
    method: string;
    generateVoucher?: boolean;
  }) => Promise<any>;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  packages,
  settings,
  onRecordPayment,
}) => {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amount, setAmount] = useState(packages[0]?.price.toString() || '5.00');
  const [generateVoucher, setGenerateVoucher] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPayments = payments.filter((p) => {
    const matchSearch =
      p.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (p.customerPhone && p.customerPhone.includes(search)) ||
      p.packageName.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase());

    const matchMethod = methodFilter === 'all' || p.method === methodFilter;
    return matchSearch && matchMethod;
  });

  const handlePackageChange = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      setAmount(pkg.price.toString());
    }
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    setIsSubmitting(true);
    try {
      const pkg = packages.find((p) => p.id === selectedPackageId);
      const res = await onRecordPayment({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        packageId: selectedPackageId,
        packageName: pkg ? pkg.name : 'Custom Plan',
        amount: Number(amount) || 0,
        method: paymentMethod,
        generateVoucher,
      });

      setShowRecordModal(false);
      if (res && res.payment) {
        setSelectedReceipt(res.payment);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-md backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>Payments, Billing &amp; Receipts</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                Total: {settings.currencySymbol}
                {totalRevenue.toFixed(2)}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Audit trail of cash collections, M-Pesa, Credit Cards, PayPal, and online captive portal sales.
            </p>
          </div>

          <button
            id="btn-record-payment"
            onClick={() => {
              setCustomerName('');
              setCustomerPhone('');
              setSelectedPackageId(packages[0]?.id || '');
              setAmount(packages[0]?.price.toString() || '5.00');
              setPaymentMethod('cash');
              setGenerateVoucher(true);
              setShowRecordModal(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment / Walk-in Sale</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by receipt #, customer, phone, or reference code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="all">All Payment Channels</option>
              <option value="cash">Cash Register (POS)</option>
              <option value="mpesa">M-Pesa Mobile Money</option>
              <option value="card">Credit / Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe Online</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-700 text-slate-400">
                <th className="py-3 px-4 font-medium">Receipt #</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Package Purchased</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Method</th>
                <th className="py-3 px-4 font-medium">Reference Code</th>
                <th className="py-3 px-4 font-medium">Date &amp; Time</th>
                <th className="py-3 px-4 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-750/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{p.customerName}</div>
                      {p.customerPhone && (
                        <div className="text-[11px] text-slate-400">{p.customerPhone}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-cyan-300 font-medium">{p.packageName}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 font-mono text-sm">
                      {settings.currencySymbol}
                      {p.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded uppercase font-semibold text-[10px] bg-slate-900 text-slate-300 border border-slate-700">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {p.reference}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {new Date(p.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center space-x-1 ml-auto transition"
                      >
                        <Receipt className="w-3 h-3 text-slate-400" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Walk-in Sale Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Record Payment / POS Sale</h3>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Customer / Guest Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Table 4 Guest or Walk-in Customer"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Customer Phone (Optional)</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Internet Package</label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => handlePackageChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — {settings.currencySymbol}
                      {pkg.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Amount Paid ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cash">Cash Register (POS)</option>
                    <option value="mpesa">M-Pesa Mobile Money</option>
                    <option value="card">Credit / Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-pos-voucher"
                  checked={generateVoucher}
                  onChange={(e) => setGenerateVoucher(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="chk-pos-voucher" className="text-slate-300 select-none">
                  Instantly issue active Wi-Fi Voucher Code for customer
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Hotspot Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Payment Receipt Preview</span>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Thermal Slip Layout */}
            <div className="bg-white text-slate-900 p-5 rounded-lg border-2 border-dashed border-slate-300 shadow-inner space-y-3 font-sans">
              <div className="text-center border-b pb-2">
                <h3 className="font-extrabold uppercase text-sm tracking-wide">
                  {settings.venueName}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">High-Speed Wi-Fi Hotspot</p>
                <div className="text-[9px] text-slate-400 mt-1 font-mono">
                  {selectedReceipt.receiptNumber}
                </div>
              </div>

              <div className="text-xs space-y-1 py-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedReceipt.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-medium">{selectedReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan:</span>
                  <span className="font-medium">{selectedReceipt.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-medium uppercase">{selectedReceipt.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ref:</span>
                  <span className="font-mono text-[10px] text-slate-700">
                    {selectedReceipt.reference}
                  </span>
                </div>
              </div>

              <div className="border-t border-b py-2 flex justify-between items-center text-sm font-bold">
                <span>TOTAL PAID:</span>
                <span className="text-base text-emerald-700 font-mono">
                  {settings.currencySymbol}
                  {selectedReceipt.amount.toFixed(2)}
                </span>
              </div>

              <div className="text-center text-[9px] text-slate-500 pt-1">
                Thank you for your business! Support: {settings.supportPhone}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
