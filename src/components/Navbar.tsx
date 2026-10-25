import React from 'react';
import {
  Wifi,
  Users,
  Ticket,
  Package,
  CreditCard,
  Radio,
  BarChart3,
  Settings,
  Smartphone,
  Server,
  Activity,
  UserCheck,
} from 'lucide-react';
import { SystemSettings, RouterDevice } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  settings: SystemSettings;
  routers: RouterDevice[];
  activeSessionsCount: number;
  availableVouchersCount: number;
  onOpenPortal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  settings,
  routers,
  activeSessionsCount,
  availableVouchersCount,
  onOpenPortal,
}) => {
  const onlineRouters = routers.filter((r) => r.status === 'online').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    {
      id: 'sessions',
      label: 'Active Sessions',
      icon: Radio,
      badge: activeSessionsCount > 0 ? activeSessionsCount : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'vouchers',
      label: 'Vouchers',
      icon: Ticket,
      badge: availableVouchersCount > 0 ? availableVouchersCount : undefined,
      badgeColor: 'bg-indigo-600 text-white',
    },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'routers', label: 'Routers / API', icon: Server },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Venue Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">NetPulse</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-medium">
                  Hotspot Billing v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {settings.venueName}
              </p>
            </div>
          </div>

          {/* Right Section: Router Beacon & Captive Portal Simulator Trigger */}
          <div className="flex items-center space-x-3">
            {/* Router Status Pill */}
            <div
              onClick={() => setCurrentTab('routers')}
              className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer hover:bg-slate-800 transition"
              title="Click to view router gateways and API status"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-slate-300">
                {onlineRouters}/{routers.length} Routers Online
              </span>
            </div>

            {/* Interactive Guest Portal Simulator Button */}
            <button
              id="btn-open-guest-portal"
              onClick={onOpenPortal}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>Guest Portal (Live View)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none text-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
