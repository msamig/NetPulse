import React, { useState } from 'react';
import {
  Server,
  Plus,
  RefreshCw,
  Terminal,
  Copy,
  Download,
  CheckCircle,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  ExternalLink,
  Sliders,
  Check,
} from 'lucide-react';
import { RouterDevice, SystemSettings } from '../types';

interface RoutersViewProps {
  routers: RouterDevice[];
  settings: SystemSettings;
  onAddRouter: (router: Partial<RouterDevice>) => Promise<void>;
  onSyncRouter: (id: string) => Promise<void>;
  onGetScript: (id: string) => Promise<{ script: string; type: string; routerName: string }>;
}

export const RoutersView: React.FC<RoutersViewProps> = ({
  routers,
  settings,
  onAddRouter,
  onSyncRouter,
  onGetScript,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [activeScript, setActiveScript] = useState<{
    script: string;
    type: string;
    routerName: string;
  } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Add Router Form
  const [name, setName] = useState('');
  const [type, setType] = useState<'mikrotik' | 'tplink_omada' | 'openwrt'>('mikrotik');
  const [ipAddress, setIpAddress] = useState('192.168.88.1');
  const [apiPort, setApiPort] = useState(8728);
  const [username, setUsername] = useState('admin');
  const [model, setModel] = useState('MikroTik hEX (RB750Gr3)');
  const [location, setLocation] = useState('Main Server Rack');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await onSyncRouter(id);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingId(null);
    }
  };

  const handleViewScript = async (id: string) => {
    try {
      const data = await onGetScript(id);
      setActiveScript(data);
      setShowScriptModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyScript = () => {
    if (!activeScript) return;
    navigator.clipboard.writeText(activeScript.script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadScript = () => {
    if (!activeScript) return;
    const blob = new Blob([activeScript.script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeScript.routerName.replace(/[^a-zA-Z0-9]/g, '_')}_hotspot_config.rsc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddRouter({
        name: name.trim(),
        type,
        ipAddress: ipAddress.trim(),
        apiPort: Number(apiPort) || 8728,
        username: username.trim(),
        model: model.trim(),
        location: location.trim(),
      });
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-md backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              <span>Router &amp; Network Gateways</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                {routers.filter((r) => r.status === 'online').length} of {routers.length} Online
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Direct API integration with MikroTik RouterOS (port 8728), TP-Link Omada External Portal, and OpenWrt / CoovaChilli.
            </p>
          </div>

          <button
            id="btn-add-router"
            onClick={() => {
              setName('');
              setType('mikrotik');
              setIpAddress('192.168.88.1');
              setApiPort(8728);
              setUsername('admin');
              setModel('MikroTik hEX (RB750Gr3)');
              setLocation('Server Rack');
              setShowAddModal(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Connect New Gateway</span>
          </button>
        </div>
      </div>

      {/* Routers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {routers.map((router) => (
          <div
            key={router.id}
            className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{router.name}</h3>
                  <div className="text-xs font-mono text-cyan-400 mt-0.5 flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    <span>{router.ipAddress}</span>
                    <span className="text-slate-500">:{router.apiPort}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {router.status}
                </span>
              </div>

              {/* Hardware stats */}
              <div className="grid grid-cols-3 gap-2 text-center my-4 py-2.5 bg-slate-900/60 rounded-lg border border-slate-700/60">
                <div>
                  <div className="text-[10px] text-slate-400">CPU Usage</div>
                  <div className="font-bold text-slate-200 mt-0.5">{router.cpuLoad}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">RAM Used</div>
                  <div className="font-bold text-slate-200 mt-0.5">{router.ramUsage}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Active Hotspot</div>
                  <div className="font-bold text-cyan-400 mt-0.5">{router.activeHotspotUsers} Users</div>
                </div>
              </div>

              {/* Meta details */}
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Hardware Model:</span>
                  <span className="text-slate-200 truncate max-w-[140px]">{router.model}</span>
                </div>
                <div className="flex justify-between">
                  <span>Firmware OS:</span>
                  <span className="text-slate-200">{router.firmware}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-slate-300">{router.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Polled:</span>
                  <span className="text-slate-500 text-[11px]">
                    {new Date(router.lastSynced).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <button
                onClick={() => handleViewScript(router.id)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition"
                title="Generate MikroTik / TP-Link setup script"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Config Script</span>
              </button>

              <button
                onClick={() => handleSync(router.id)}
                disabled={syncingId === router.id}
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium flex items-center space-x-1 transition"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${syncingId === router.id ? 'animate-spin' : ''}`}
                />
                <span>{syncingId === router.id ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Script Generator Modal */}
      {showScriptModal && activeScript && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-white text-base">
                    Hotspot Provisioning Script ({activeScript.routerName})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Paste this into MikroTik WinBox Terminal or SSH session to configure user profiles, walled garden, and API.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Script Textarea */}
            <div className="flex-1 overflow-y-auto">
              <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300 whitespace-pre-wrap leading-relaxed select-all">
                {activeScript.script}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Format: RouterOS .rsc / CLI Script</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadScript}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .rsc</span>
                </button>
                <button
                  onClick={handleCopyScript}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow flex items-center space-x-1.5"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Script'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Router Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Connect Router Gateway</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Router Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Reception MikroTik RB750Gr3"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Equipment Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="mikrotik">MikroTik RouterOS</option>
                    <option value="tplink_omada">TP-Link Omada</option>
                    <option value="openwrt">OpenWrt / CoovaChilli</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">API Port</label>
                  <input
                    type="number"
                    value={apiPort}
                    onChange={(e) => setApiPort(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">IP Address / Host</label>
                  <input
                    type="text"
                    required
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="192.168.88.1"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">API Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Hardware Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. hEX, RB4011, CCR1009, ER605"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Physical Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Main Server Rack / Floor 2"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow"
                >
                  {isSubmitting ? 'Connecting...' : 'Add Gateway'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
