import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Ticket,
  Plus,
  Printer,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  Clock,
  QrCode as QrIcon,
  Copy,
  ExternalLink,
  Download,
  Key,
} from 'lucide-react';
import { Voucher, WifiPackage, SystemSettings } from '../types';

interface VouchersViewProps {
  vouchers: Voucher[];
  packages: WifiPackage[];
  settings: SystemSettings;
  onGenerateBatch: (params: {
    packageId: string;
    count: number;
    batchName: string;
    prefix: string;
    includePin: boolean;
  }) => Promise<void>;
  onDeleteVoucher: (id: string) => Promise<void>;
  onDeleteBatch: (batchId: string) => Promise<void>;
  onTestRedeem: (code: string) => void;
}

export const VouchersView: React.FC<VouchersViewProps> = ({
  vouchers,
  packages,
  settings,
  onGenerateBatch,
  onDeleteVoucher,
  onDeleteBatch,
  onTestRedeem,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');

  // Generate modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || '');
  const [batchCount, setBatchCount] = useState(10);
  const [batchPrefix, setBatchPrefix] = useState('WIFI');
  const [batchName, setBatchName] = useState('Front Desk Batch');
  const [includePin, setIncludePin] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Print modal state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [vouchersToPrint, setVouchersToPrint] = useState<Voucher[]>([]);
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [printLayout, setPrintLayout] = useState<'a4' | 'thermal'>('a4');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter vouchers
  const filteredVouchers = vouchers.filter((v) => {
    const matchSearch =
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.packageName.toLowerCase().includes(search.toLowerCase()) ||
      v.batchName.toLowerCase().includes(search.toLowerCase()) ||
      (v.usedBy && v.usedBy.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchPackage = packageFilter === 'all' || v.packageId === packageFilter;

    return matchSearch && matchStatus && matchPackage;
  });

  // Generate QR codes for vouchers in print preview
  useEffect(() => {
    if (showPrintModal && vouchersToPrint.length > 0) {
      const urls: Record<string, string> = {};
      const promises = vouchersToPrint.map(async (v) => {
        try {
          // Encodes simulated auto-login url
          const targetUrl = `https://${window.location.host}/login?voucher=${v.code}${
            v.pin ? `&pin=${v.pin}` : ''
          }`;
          const dataUrl = await QRCode.toDataURL(targetUrl, {
            margin: 1,
            width: 140,
            color: { dark: '#000000', light: '#ffffff' },
          });
          urls[v.id] = dataUrl;
        } catch (err) {
          console.error('QR code generation error:', err);
        }
      });

      Promise.all(promises).then(() => {
        setQrCodeUrls(urls);
      });
    }
  }, [showPrintModal, vouchersToPrint]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackageId) return;
    setIsGenerating(true);
    try {
      await onGenerateBatch({
        packageId: selectedPackageId,
        count: Number(batchCount) || 10,
        batchName: batchName.trim() || 'General Batch',
        prefix: batchPrefix.trim().toUpperCase() || 'WIFI',
        includePin,
      });
      setShowGenerateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const openPrintAll = () => {
    setVouchersToPrint(filteredVouchers.slice(0, 48)); // Print up to 48 on sheet
    setShowPrintModal(true);
  };

  const openPrintBatch = (batchId: string) => {
    const batchVouchers = vouchers.filter((v) => v.batchId === batchId);
    setVouchersToPrint(batchVouchers);
    setShowPrintModal(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-md backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-400" />
              <span>Vouchers &amp; Scratch Cards</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                {vouchers.filter((v) => v.status === 'available').length} Ready for Sale
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Generate batch access codes with printable QR cards for front desks, cafés, and guest rooms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-open-gen-vouchers"
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Batch</span>
            </button>

            <button
              id="btn-print-vouchers"
              onClick={openPrintAll}
              disabled={filteredVouchers.length === 0}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold border border-slate-600 transition disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheets / Cards</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search voucher code, package, batch, or guest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available (Unused)</option>
              <option value="active">Active (Currently Online)</option>
              <option value="used">Used / Expired</option>
            </select>

            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="all">All Packages</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-700 text-slate-400">
                <th className="py-3 px-4 font-medium">Voucher Code</th>
                <th className="py-3 px-4 font-medium">PIN</th>
                <th className="py-3 px-4 font-medium">Package Plan</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Used By / Activated</th>
                <th className="py-3 px-4 font-medium">Batch</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No vouchers found. Click "Generate Batch" to create some!
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-750/30 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-white text-xs bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
                          {v.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(v.code)}
                          className="text-slate-400 hover:text-indigo-400 transition"
                          title="Copy Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {copiedCode === v.code && (
                          <span className="text-[10px] text-emerald-400">Copied!</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {v.pin ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-200">
                          {v.pin}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{v.packageName}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-400">
                      {settings.currencySymbol}
                      {v.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {v.status === 'available' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Available
                        </span>
                      )}
                      {v.status === 'active' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">
                          Active Online
                        </span>
                      )}
                      {v.status === 'used' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700 text-slate-400">
                          Used
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {v.usedBy ? (
                        <div>
                          <div className="font-medium text-slate-200 truncate max-w-[150px]">
                            {v.usedBy}
                          </div>
                          {v.activatedAt && (
                            <div className="text-[10px] text-slate-400">
                              {new Date(v.activatedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Unclaimed</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <span className="truncate block max-w-[120px]">{v.batchName}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {v.status === 'available' && (
                          <button
                            onClick={() => onTestRedeem(v.code)}
                            className="px-2 py-1 rounded bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-800 text-[10px] font-medium transition"
                            title="Test logging in with this code"
                          >
                            Test Login
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteVoucher(v.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                          title="Delete Voucher"
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

      {/* Generate Vouchers Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Generate Voucher Batch</h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Internet Package</label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — {settings.currencySymbol}
                      {pkg.price.toFixed(2)} ({pkg.downloadSpeedMbps}Mbps)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Quantity</label>
                  <select
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={5}>5 Vouchers</option>
                    <option value={10}>10 Vouchers</option>
                    <option value={25}>25 Vouchers</option>
                    <option value={50}>50 Vouchers</option>
                    <option value={100}>100 Vouchers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Code Prefix</label>
                  <input
                    type="text"
                    value={batchPrefix}
                    onChange={(e) => setBatchPrefix(e.target.value)}
                    placeholder="e.g. WIFI, CAFE"
                    maxLength={6}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Batch Label / Description</label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="e.g. Reception Desk Morning Batch"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-pin"
                  checked={includePin}
                  onChange={(e) => setIncludePin(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="chk-pin" className="text-slate-300 select-none">
                  Include 4-digit Security PIN on cards
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow flex items-center space-x-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{isGenerating ? 'Generating...' : 'Create Vouchers'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Vouchers Modal / Sheet with QR Codes */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <Printer className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Printable Wi-Fi Voucher Cards</h3>
                  <p className="text-xs text-slate-400">
                    Ready to cut for café tables, hotel keycards, or thermal receipt printer.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
                  <button
                    onClick={() => setPrintLayout('a4')}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      printLayout === 'a4' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    A4 Card Grid
                  </button>
                  <button
                    onClick={() => setPrintLayout('thermal')}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      printLayout === 'thermal' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Thermal POS Slip
                  </button>
                </div>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-white text-xl font-bold ml-2"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Printable Preview Area */}
            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div
                id="printable-voucher-sheet"
                className={
                  printLayout === 'a4'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'
                    : 'flex flex-col items-center space-y-4 max-w-sm mx-auto'
                }
              >
                {vouchersToPrint.map((v) => (
                  <div
                    key={v.id}
                    className="bg-white text-slate-900 rounded-lg p-3.5 border-2 border-dashed border-slate-400 shadow-sm flex flex-col justify-between relative overflow-hidden"
                    style={{ minHeight: '170px' }}
                  >
                    {/* Voucher Top */}
                    <div>
                      <div className="flex items-start justify-between border-b pb-1.5 mb-2">
                        <div>
                          <div className="text-[11px] font-extrabold uppercase tracking-tight text-slate-800">
                            {settings.venueName}
                          </div>
                          <div className="text-[9px] text-slate-500">Wi-Fi Hotspot Access Card</div>
                        </div>
                        <span className="text-[11px] font-bold text-indigo-700 font-mono">
                          {settings.currencySymbol}
                          {v.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Package Name */}
                      <div className="text-xs font-bold text-slate-800 mb-1">{v.packageName}</div>

                      {/* Code & QR Code Row */}
                      <div className="flex items-center justify-between my-2">
                        <div>
                          <div className="text-[9px] font-medium uppercase text-slate-500">
                            Voucher Code
                          </div>
                          <div className="font-mono font-black text-sm tracking-wider text-slate-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            {v.code}
                          </div>
                          {v.pin && (
                            <div className="mt-1 flex items-center space-x-1 text-[10px]">
                              <span className="text-slate-500 font-medium">PIN:</span>
                              <span className="font-mono font-bold text-slate-800">{v.pin}</span>
                            </div>
                          )}
                        </div>

                        {/* QR Code */}
                        {qrCodeUrls[v.id] && (
                          <div className="text-center">
                            <img
                              src={qrCodeUrls[v.id]}
                              alt="Scan to Connect"
                              className="w-14 h-14 border rounded"
                            />
                            <span className="text-[7px] text-slate-500 block">Scan to Connect</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Instructions */}
                    <div className="pt-1.5 border-t border-slate-200 text-[8px] text-slate-500 flex justify-between items-center">
                      <span>1. Connect to Wi-Fi SSID: {settings.venueName}</span>
                      <span>2. Enter code</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-xs">
              <span className="text-slate-400">
                Showing {vouchersToPrint.length} vouchers ready for printing.
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Sheet (PDF / Printer)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
