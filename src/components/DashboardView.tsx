import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Radio,
  HardDrive,
  Ticket,
  Users,
  Server,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
  ExternalLink,
  Laptop,
  Smartphone,
  Tv,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import {
  DashboardStats,
  HotspotSession,
  Payment,
  RouterDevice,
  SystemSettings,
  WifiPackage,
} from '../types';

interface DashboardViewProps {
  stats: DashboardStats;
  sessions: HotspotSession[];
  payments: Payment[];
  routers: RouterDevice[];
  packages: WifiPackage[];
  settings: SystemSettings;
  onNavigate: (tab: string) => void;
  onKickSession: (id: string) => void;
  onQuickGenerateVouchers: () => void;
  onQuickRecordPayment: () => void;
  onSyncRouters: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  sessions,
  payments,
  routers,
  packages,
  settings,
  onNavigate,
  onKickSession,
  onQuickGenerateVouchers,
  onQuickRecordPayment,
  onSyncRouters,
}) => {
  // Live simulated bandwidth throughput
  const [liveThroughput, setLiveThroughput] = useState({
    downloadMbps: 28.4,
    uploadMbps: 9.6,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const activeFactor = Math.max(1, sessions.length);
      const dl = (15 + Math.random() * 20 + activeFactor * 3.2).toFixed(1);
      const ul = (5 + Math.random() * 8 + activeFactor * 1.1).toFixed(1);
      setLiveThroughput({
        downloadMbps: Number(dl),
        uploadMbps: Number(ul),
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [sessions.length]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'laptop':
        return <Laptop className="w-4 h-4 text-blue-400" />;
      case 'smart_tv':
        return <Tv className="w-4 h-4 text-purple-400" />;
      case 'phone':
      default:
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 sm:p-6 shadow-md backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Hotspot Operations Dashboard</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                Router Gateway Sync Active
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Managing customer access, billing, and real-time bandwidth across {routers.length} network gateways.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="dash-btn-gen-vouchers"
              onClick={onQuickGenerateVouchers}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Generate Vouchers</span>
            </button>
            <button
              id="dash-btn-record-pay"
              onClick={onQuickRecordPayment}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
            <button
              id="dash-btn-sync-router"
              onClick={onSyncRouters}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium border border-slate-600 transition"
              title="Poll active MikroTik and TP-Link router states"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Routers</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Revenue */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Today's Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white">
              {settings.currencySymbol}
              {stats.todayRevenue.toFixed(2)}
            </div>
            <div className="flex items-center text-xs text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>Monthly projected: {settings.currencySymbol}{stats.monthRevenue.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Active Hotspot Sessions */}
        <div
          onClick={() => onNavigate('sessions')}
          className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 shadow-sm relative overflow-hidden cursor-pointer hover:border-cyan-500/40 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Devices</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white">
              {stats.activeSessionsCount}
            </div>
            <div className="flex items-center text-xs text-cyan-400 mt-1">
              <span>Live router clients authenticated</span>
            </div>
          </div>
        </div>

        {/* Total Bandwidth Today */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Data Consumed Today</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white">
              {stats.totalBandwidthTodayGb} <span className="text-sm font-normal text-slate-400">GB</span>
            </div>
            <div className="flex items-center text-xs text-slate-400 mt-1">
              <span>Traffic across all access points</span>
            </div>
          </div>
        </div>

        {/* Available Vouchers */}
        <div
          onClick={() => onNavigate('vouchers')}
          className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 shadow-sm relative overflow-hidden cursor-pointer hover:border-indigo-500/40 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Ready Vouchers</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white">
              {stats.availableVouchersCount}
            </div>
            <div className="flex items-center text-xs text-indigo-400 mt-1">
              <span>Unused voucher cards in stock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Router Gateway Status & Throughput Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Throughput Gauge */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Live Gateway Bandwidth</h3>
            </div>
            <span className="text-[11px] text-slate-400">Updated every 3s</span>
          </div>

          <div className="space-y-4">
            {/* Download Speed */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5 text-cyan-400" />
                  Aggregate Download
                </span>
                <span className="font-bold text-cyan-300 font-mono">
                  {liveThroughput.downloadMbps} Mbps
                </span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (liveThroughput.downloadMbps / 100) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Upload Speed */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  Aggregate Upload
                </span>
                <span className="font-bold text-emerald-300 font-mono">
                  {liveThroughput.uploadMbps} Mbps
                </span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (liveThroughput.uploadMbps / 50) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Router Diagnostics */}
            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span>Primary Router:</span>
              <span className="text-slate-200 font-medium">
                {routers[0]?.name || 'MikroTik RB750Gr3'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>API Connection:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Port {routers[0]?.apiPort || 8728} Healthy
              </span>
            </div>
          </div>
        </div>

        {/* Router Hardware Health Cards */}
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Network Hardware &amp; Routers</h3>
            </div>
            <button
              onClick={() => onNavigate('routers')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <span>Manage Routers</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {routers.slice(0, 2).map((router) => (
              <div
                key={router.id}
                className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3.5 space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white truncate max-w-[180px]">
                      {router.name}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">{router.ipAddress}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {router.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400">CPU Load</div>
                    <div className="font-semibold text-slate-200">{router.cpuLoad}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">RAM</div>
                    <div className="font-semibold text-slate-200">{router.ramUsage}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Hotspot Users</div>
                    <div className="font-semibold text-cyan-400">{router.activeHotspotUsers}</div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 truncate">
                  Model: {router.model} • {router.firmware}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Hotspot Sessions Preview */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Live Router Hotspot Sessions</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              {sessions.length} Active
            </span>
          </div>
          <button
            onClick={() => onNavigate('sessions')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            <span>View All Sessions</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="pb-2.5 font-medium">Device &amp; User</th>
                <th className="pb-2.5 font-medium">IP &amp; MAC</th>
                <th className="pb-2.5 font-medium">Speed Profile</th>
                <th className="pb-2.5 font-medium">Data Downloaded</th>
                <th className="pb-2.5 font-medium">Signal</th>
                <th className="pb-2.5 font-medium text-right">Router Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {sessions.slice(0, 4).map((s) => (
                <tr key={s.id} className="hover:bg-slate-750/30 transition">
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-slate-700/60">
                        {getDeviceIcon(s.deviceType)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{s.deviceName}</div>
                        <div className="text-[11px] text-slate-400">{s.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-[11px]">
                    <div className="text-slate-200">{s.ipAddress}</div>
                    <div className="text-slate-500">{s.macAddress}</div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-mono">
                      {s.rateLimit}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 font-mono">
                    {formatBytes(s.bytesIn)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-1.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          s.signalDbm > -60
                            ? 'bg-emerald-400'
                            : s.signalDbm > -75
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                      ></div>
                      <span className="text-slate-300">{s.signalDbm} dBm</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      id={`dash-btn-kick-${s.id}`}
                      onClick={() => onKickSession(s.id)}
                      className="px-2.5 py-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-800/60 transition text-[11px] font-medium"
                      title="Send /ip hotspot active remove command"
                    >
                      Kick
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payments Feed */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Recent Transactions &amp; Receipts</h3>
          </div>
          <button
            onClick={() => onNavigate('payments')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            <span>Full Ledger</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {payments.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">{p.receiptNumber}</span>
                <span className="font-bold text-emerald-400">
                  {settings.currencySymbol}
                  {p.amount.toFixed(2)}
                </span>
              </div>
              <div className="text-xs font-semibold text-white truncate">{p.customerName}</div>
              <div className="text-[11px] text-slate-400 truncate">{p.packageName}</div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                <span className="uppercase font-medium text-slate-400">{p.method}</span>
                <span>{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
