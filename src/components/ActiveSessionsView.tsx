import React, { useState } from 'react';
import {
  Radio,
  Search,
  Laptop,
  Smartphone,
  Tv,
  Tablet,
  Filter,
  UserX,
  Clock,
  HardDrive,
  Wifi,
  ShieldAlert,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Info,
} from 'lucide-react';
import { HotspotSession, RouterDevice, SystemSettings } from '../types';

interface ActiveSessionsViewProps {
  sessions: HotspotSession[];
  routers: RouterDevice[];
  settings: SystemSettings;
  onKickSession: (id: string) => void;
  onRefresh: () => void;
}

export const ActiveSessionsView: React.FC<ActiveSessionsViewProps> = ({
  sessions,
  routers,
  settings,
  onKickSession,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRouter, setSelectedRouter] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<HotspotSession | null>(null);

  const filteredSessions = sessions.filter((s) => {
    const matchSearch =
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.deviceName.toLowerCase().includes(search.toLowerCase()) ||
      s.ipAddress.includes(search) ||
      s.macAddress.toLowerCase().includes(search.toLowerCase());

    const matchRouter = selectedRouter === 'all' || s.routerId === selectedRouter;

    return matchSearch && matchRouter;
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'laptop':
        return <Laptop className="w-4 h-4 text-blue-400" />;
      case 'smart_tv':
        return <Tv className="w-4 h-4 text-purple-400" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-indigo-400" />;
      case 'phone':
      default:
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-md backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span>Live Hotspot Sessions (Router Active Clients)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                {sessions.length} Devices Online
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time lease table from MikroTik RouterOS <code className="text-cyan-300 font-mono text-[11px]">/ip hotspot active</code> &amp; TP-Link Omada gateways.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium border border-slate-600 transition"
              title="Poll Router Leases"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Poll Router</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by device, user, IP, or MAC address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedRouter}
              onChange={(e) => setSelectedRouter(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
            >
              <option value="all">All Routers &amp; Gateways</option>
              {routers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-700 text-slate-400">
                <th className="py-3 px-4 font-medium">Device &amp; User</th>
                <th className="py-3 px-4 font-medium">Network (IP / MAC)</th>
                <th className="py-3 px-4 font-medium">Gateway Router</th>
                <th className="py-3 px-4 font-medium">Rate Limit</th>
                <th className="py-3 px-4 font-medium">Uptime</th>
                <th className="py-3 px-4 font-medium">Data Traffic</th>
                <th className="py-3 px-4 font-medium">Signal</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No active sessions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-slate-750/30 transition cursor-pointer"
                    onClick={() => setSelectedSession(session)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-slate-700/60">
                          {getDeviceIcon(session.deviceType)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{session.deviceName}</div>
                          <div className="text-[11px] text-cyan-400">{session.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="text-slate-200 font-medium">{session.ipAddress}</div>
                      <div className="text-slate-500">{session.macAddress}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="text-slate-200 truncate max-w-[140px]">
                        {session.routerName}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-mono">
                        {session.rateLimit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatUptime(session.uptimeSeconds)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="flex items-center space-x-1 text-cyan-400">
                        <ArrowDown className="w-3 h-3" />
                        <span>{formatBytes(session.bytesIn)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-emerald-400">
                        <ArrowUp className="w-3 h-3" />
                        <span>{formatBytes(session.bytesOut)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            session.signalDbm > -60
                              ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                              : session.signalDbm > -75
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        ></div>
                        <span className="text-slate-300 font-mono">{session.signalDbm} dBm</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        id={`btn-kick-${session.id}`}
                        onClick={() => onKickSession(session.id)}
                        className="flex items-center space-x-1 ml-auto px-2.5 py-1 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 border border-rose-800/80 transition text-[11px] font-medium"
                        title="Execute /ip hotspot active remove"
                      >
                        <UserX className="w-3 h-3" />
                        <span>Disconnect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Client Hotspot Lease Details</h3>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900/70 p-3 rounded-lg space-y-2 border border-slate-700/60">
                <div className="flex justify-between">
                  <span className="text-slate-400">Device Name:</span>
                  <span className="font-semibold text-white">{selectedSession.deviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Username / Voucher:</span>
                  <span className="font-mono text-cyan-400">{selectedSession.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IP Address:</span>
                  <span className="font-mono text-slate-200">{selectedSession.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MAC Address:</span>
                  <span className="font-mono text-slate-300">{selectedSession.macAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Gateway:</span>
                  <span className="text-slate-200">{selectedSession.routerName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                  <div className="text-slate-400 text-[10px]">Total Download</div>
                  <div className="font-bold text-cyan-400 font-mono mt-0.5">
                    {formatBytes(selectedSession.bytesIn)}
                  </div>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                  <div className="text-slate-400 text-[10px]">Total Upload</div>
                  <div className="font-bold text-emerald-400 font-mono mt-0.5">
                    {formatBytes(selectedSession.bytesOut)}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Session Started:</span>
                  <span className="text-slate-300">
                    {new Date(selectedSession.startedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expires At:</span>
                  <span className="text-amber-400">
                    {new Date(selectedSession.expiresAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedSession(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onKickSession(selectedSession.id);
                  setSelectedSession(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 text-xs font-medium flex items-center space-x-1"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Kick Client from Router</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
