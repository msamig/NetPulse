import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Check,
  Zap,
  HardDrive,
  Clock,
  Smartphone,
  Shield,
  Star,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { WifiPackage, SystemSettings } from '../types';

interface PackagesViewProps {
  packages: WifiPackage[];
  settings: SystemSettings;
  onCreatePackage: (pkg: Partial<WifiPackage>) => Promise<void>;
  onUpdatePackage: (id: string, pkg: Partial<WifiPackage>) => Promise<void>;
  onDeletePackage: (id: string) => Promise<void>;
}

export const PackagesView: React.FC<PackagesViewProps> = ({
  packages,
  settings,
  onCreatePackage,
  onUpdatePackage,
  onDeletePackage,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<WifiPackage | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('5.00');
  const [duration, setDuration] = useState('24');
  const [durationType, setDurationType] = useState<'minutes' | 'hours' | 'days'>('hours');
  const [isUnlimitedQuota, setIsUnlimitedQuota] = useState(true);
  const [dataLimitGb, setDataLimitGb] = useState('5');
  const [downloadSpeedMbps, setDownloadSpeedMbps] = useState(20);
  const [uploadSpeedMbps, setUploadSpeedMbps] = useState(10);
  const [simultaneousDevices, setSimultaneousDevices] = useState(1);
  const [description, setDescription] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [validityDays, setValidityDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingPackage(null);
    setName('');
    setPrice('5.00');
    setDuration('24');
    setDurationType('hours');
    setIsUnlimitedQuota(true);
    setDataLimitGb('5');
    setDownloadSpeedMbps(20);
    setUploadSpeedMbps(10);
    setSimultaneousDevices(1);
    setDescription('');
    setIsPopular(false);
    setIsActive(true);
    setValidityDays(7);
    setShowModal(true);
  };

  const openEditModal = (pkg: WifiPackage) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setPrice(pkg.price.toString());
    setDuration(pkg.duration.toString());
    setDurationType(pkg.durationType);
    setIsUnlimitedQuota(pkg.dataLimitMb === 0);
    setDataLimitGb(pkg.dataLimitMb > 0 ? (pkg.dataLimitMb / 1024).toString() : '5');
    setDownloadSpeedMbps(pkg.downloadSpeedMbps);
    setUploadSpeedMbps(pkg.uploadSpeedMbps);
    setSimultaneousDevices(pkg.simultaneousDevices);
    setDescription(pkg.description);
    setIsPopular(Boolean(pkg.isPopular));
    setIsActive(pkg.isActive);
    setValidityDays(pkg.validityDays);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<WifiPackage> = {
        name: name.trim(),
        price: Number(price) || 0,
        duration: Number(duration) || 1,
        durationType,
        dataLimitMb: isUnlimitedQuota ? 0 : (Number(dataLimitGb) || 1) * 1024,
        downloadSpeedMbps: Number(downloadSpeedMbps) || 10,
        uploadSpeedMbps: Number(uploadSpeedMbps) || 5,
        simultaneousDevices: Number(simultaneousDevices) || 1,
        description: description.trim(),
        isPopular,
        isActive,
        validityDays: Number(validityDays) || 7,
      };

      if (editingPackage) {
        await onUpdatePackage(editingPackage.id, payload);
      } else {
        await onCreatePackage(payload);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (val: number, type: string) => {
    if (type === 'minutes') return `${val} Minutes`;
    if (type === 'hours') return `${val} ${val === 1 ? 'Hour' : 'Hours'}`;
    return `${val} ${val === 1 ? 'Day' : 'Days'}`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-md backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              <span>Internet Packages &amp; Bandwidth Plans</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                {packages.length} Configured Plans
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure download/upload limits, data quotas, duration, and simultaneous devices synchronized with MikroTik User Profiles.
            </p>
          </div>

          <button
            id="btn-create-package"
            onClick={openCreateModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-slate-800/70 border rounded-xl p-5 shadow-md relative flex flex-col justify-between transition hover:border-slate-600 ${
              pkg.isPopular
                ? 'border-cyan-500/50 ring-1 ring-cyan-500/20 shadow-cyan-500/5'
                : 'border-slate-700/60'
            }`}
          >
            {pkg.isPopular && (
              <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-white" /> Popular Choice
              </span>
            )}

            <div>
              {/* Title & Status */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{pkg.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatDuration(pkg.duration, pkg.durationType)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">
                    {settings.currencySymbol}
                    {pkg.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Description */}
              {pkg.description && (
                <p className="text-xs text-slate-300 mt-2.5 line-clamp-2">{pkg.description}</p>
              )}

              {/* Key Features List */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2 text-xs">
                {/* Speed */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Speed Rate Limit
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {pkg.downloadSpeedMbps}M DL / {pkg.uploadSpeedMbps}M UL
                  </span>
                </div>

                {/* Quota */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                    Data Quota Limit
                  </span>
                  <span className="font-bold text-slate-200">
                    {pkg.dataLimitMb === 0 ? (
                      <span className="text-emerald-400">Unlimited Data</span>
                    ) : (
                      `${(pkg.dataLimitMb / 1024).toFixed(0)} GB`
                    )}
                  </span>
                </div>

                {/* Devices */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                    Simultaneous Devices
                  </span>
                  <span className="text-slate-200 font-medium">
                    {pkg.simultaneousDevices} {pkg.simultaneousDevices === 1 ? 'Device' : 'Devices'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  pkg.isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {pkg.isActive ? 'Active on Portal' : 'Disabled'}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(pkg)}
                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center space-x-1 transition"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDeletePackage(pkg.id)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                  title="Delete Package"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">
                  {editingPackage ? 'Edit Internet Package' : 'Create Internet Package'}
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
              {/* Name & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 24-Hour Nomad Unlimited"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Price ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration Length</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration Unit</label>
                  <select
                    value={durationType}
                    onChange={(e) => setDurationType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>

              {/* Speed Limits */}
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60 space-y-3">
                <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>MikroTik RouterOS Bandwidth Profile</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Download Speed</span>
                      <span className="font-bold text-cyan-400 font-mono">{downloadSpeedMbps} Mbps</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={downloadSpeedMbps}
                      onChange={(e) => setDownloadSpeedMbps(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Upload Speed</span>
                      <span className="font-bold text-emerald-400 font-mono">{uploadSpeedMbps} Mbps</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={uploadSpeedMbps}
                      onChange={(e) => setUploadSpeedMbps(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quota Limit */}
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium">Data Quota Limit</label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnlimitedQuota}
                      onChange={(e) => setIsUnlimitedQuota(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-300 font-medium">Unlimited Quota</span>
                  </label>
                </div>

                {!isUnlimitedQuota && (
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={dataLimitGb}
                      onChange={(e) => setDataLimitGb(e.target.value)}
                      placeholder="5"
                      className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <span className="text-slate-400 font-medium">Gigabytes (GB)</span>
                  </div>
                )}
              </div>

              {/* Simultaneous Devices & Validity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Max Simultaneous Devices
                  </label>
                  <select
                    value={simultaneousDevices}
                    onChange={(e) => setSimultaneousDevices(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>1 Device</option>
                    <option value={2}>2 Devices</option>
                    <option value={3}>3 Devices</option>
                    <option value={4}>4 Devices</option>
                    <option value={5}>5 Devices</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Voucher Validity (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary for customer portal..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Badges Toggles */}
              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-slate-300 font-medium">Highlight as Popular</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300 font-medium">Active (Visible in Portal)</span>
                </label>
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
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingPackage
                    ? 'Update Package'
                    : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
