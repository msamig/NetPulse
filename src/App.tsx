import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ActiveSessionsView } from './components/ActiveSessionsView';
import { VouchersView } from './components/VouchersView';
import { PackagesView } from './components/PackagesView';
import { CustomersView } from './components/CustomersView';
import { PaymentsView } from './components/PaymentsView';
import { RoutersView } from './components/RoutersView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { CaptivePortalSimulator } from './components/CaptivePortalSimulator';
import {
  DashboardStats,
  HotspotSession,
  Voucher,
  WifiPackage,
  Customer,
  Payment,
  RouterDevice,
  SystemSettings,
} from './types';
import {
  initialPackages,
  initialCustomers,
  initialVouchers,
  initialSessions,
  initialPayments,
  initialRouters,
  initialSettings,
} from './mockData';
import { api } from './api/client';
import { CheckCircle2, AlertTriangle, X, Radio, Smartphone } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Core Data States
  const [packages, setPackages] = useState<WifiPackage[]>(initialPackages);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [sessions, setSessions] = useState<HotspotSession[]>(initialSessions);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [routers, setRouters] = useState<RouterDevice[]>(initialRouters);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 89.5,
    monthRevenue: 1650.0,
    activeSessionsCount: initialSessions.length,
    totalBandwidthTodayGb: 48.9,
    availableVouchersCount: initialVouchers.filter((v) => v.status === 'available').length,
    activeCustomersCount: initialCustomers.filter((c) => c.status === 'active').length,
    onlineRoutersCount: initialRouters.filter((r) => r.status === 'online').length,
    totalRoutersCount: initialRouters.length,
  });

  // Captive Portal Test Modal
  const [showPortalModal, setShowPortalModal] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Initial Load from API
  const refreshAllData = async () => {
    try {
      const [
        fetchedStats,
        fetchedPkgs,
        fetchedCusts,
        fetchedVouchers,
        fetchedSessions,
        fetchedPayments,
        fetchedRouters,
        fetchedSettings,
      ] = await Promise.all([
        api.getStats().catch(() => null),
        api.getPackages().catch(() => null),
        api.getCustomers().catch(() => null),
        api.getVouchers().catch(() => null),
        api.getSessions().catch(() => null),
        api.getPayments().catch(() => null),
        api.getRouters().catch(() => null),
        api.getSettings().catch(() => null),
      ]);

      if (fetchedStats) setStats(fetchedStats);
      if (fetchedPkgs) setPackages(fetchedPkgs);
      if (fetchedCusts) setCustomers(fetchedCusts);
      if (fetchedVouchers) setVouchers(fetchedVouchers);
      if (fetchedSessions) setSessions(fetchedSessions);
      if (fetchedPayments) setPayments(fetchedPayments);
      if (fetchedRouters) setRouters(fetchedRouters);
      if (fetchedSettings) setSettings(fetchedSettings);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Update computed stats when lists change
  useEffect(() => {
    const todayRev = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    setStats((prev) => ({
      ...prev,
      todayRevenue: +todayRev.toFixed(2),
      activeSessionsCount: sessions.length,
      availableVouchersCount: vouchers.filter((v) => v.status === 'available').length,
      activeCustomersCount: customers.filter((c) => c.status === 'active').length,
      onlineRoutersCount: routers.filter((r) => r.status === 'online').length,
      totalRoutersCount: routers.length,
    }));
  }, [sessions, vouchers, customers, payments, routers]);

  // Session Actions
  const handleKickSession = async (id: string) => {
    try {
      const res = await api.kickSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      showToast(res.message || 'Client kicked from router gateway', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to kick session', 'error');
    }
  };

  // Voucher Actions
  const handleGenerateBatch = async (params: {
    packageId: string;
    count: number;
    batchName: string;
    prefix: string;
    includePin: boolean;
  }) => {
    try {
      const res = await api.generateVouchers(params);
      setVouchers((prev) => [...res.vouchers, ...prev]);
      showToast(`Successfully generated ${res.count} vouchers!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate vouchers', 'error');
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    try {
      await api.deleteVoucher(id);
      setVouchers((prev) => prev.filter((v) => v.id !== id));
      showToast('Voucher deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete voucher', 'error');
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
      await api.deleteVoucherBatch(batchId);
      setVouchers((prev) => prev.filter((v) => v.batchId !== batchId));
      showToast('Voucher batch removed', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete batch', 'error');
    }
  };

  const handleTestRedeem = (code: string) => {
    setShowPortalModal(true);
  };

  // Package Actions
  const handleCreatePackage = async (data: Partial<WifiPackage>) => {
    try {
      const created = await api.createPackage(data);
      setPackages((prev) => [created, ...prev]);
      showToast(`Created plan "${created.name}"`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create plan', 'error');
    }
  };

  const handleUpdatePackage = async (id: string, data: Partial<WifiPackage>) => {
    try {
      const updated = await api.updatePackage(id, data);
      setPackages((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast(`Updated plan "${updated.name}"`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update plan', 'error');
    }
  };

  const handleDeletePackage = async (id: string) => {
    try {
      await api.deletePackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
      showToast('Package removed', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete package', 'error');
    }
  };

  // Customer Actions
  const handleCreateCustomer = async (data: Partial<Customer>) => {
    try {
      const created = await api.createCustomer(data);
      setCustomers((prev) => [created, ...prev]);
      showToast(`Added customer "${created.name}"`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create customer', 'error');
    }
  };

  const handleUpdateCustomer = async (id: string, data: Partial<Customer>) => {
    try {
      const updated = await api.updateCustomer(id, data);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
      showToast(`Updated customer "${updated.name}"`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update customer', 'error');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await api.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      showToast('Customer deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete customer', 'error');
    }
  };

  // Payment Actions
  const handleRecordPayment = async (data: any) => {
    try {
      const res = await api.createPayment(data);
      setPayments((prev) => [res.payment, ...prev]);
      if (res.voucher) {
        setVouchers((prev) => [res.voucher, ...prev]);
      }
      showToast(`Payment of ${settings.currencySymbol}${res.payment.amount} recorded!`, 'success');
      return res;
    } catch (err: any) {
      showToast(err.message || 'Failed to record payment', 'error');
      throw err;
    }
  };

  // Router Actions
  const handleAddRouter = async (data: Partial<RouterDevice>) => {
    try {
      const created = await api.addRouter(data);
      setRouters((prev) => [...prev, created]);
      showToast(`Connected gateway "${created.name}"`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add router', 'error');
    }
  };

  const handleSyncRouter = async (id: string) => {
    try {
      const synced = await api.syncRouter(id);
      setRouters((prev) => prev.map((r) => (r.id === id ? synced : r)));
      showToast(`Synchronized ${synced.name} with RouterOS API`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Sync failed', 'error');
    }
  };

  const handleGetRouterScript = async (id: string) => {
    return api.getRouterScript(id);
  };

  // Settings Action
  const handleUpdateSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      const updated = await api.updateSettings(newSettings);
      setSettings(updated);
      showToast('System settings updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl border flex items-center space-x-2.5 text-xs font-medium backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-800'
                : toast.type === 'info'
                ? 'bg-slate-800/90 text-slate-200 border-slate-700'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        settings={settings}
        routers={routers}
        activeSessionsCount={sessions.length}
        availableVouchersCount={vouchers.filter((v) => v.status === 'available').length}
        onOpenPortal={() => setShowPortalModal(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            sessions={sessions}
            payments={payments}
            routers={routers}
            packages={packages}
            settings={settings}
            onNavigate={(tab) => setCurrentTab(tab)}
            onKickSession={handleKickSession}
            onQuickGenerateVouchers={() => setCurrentTab('vouchers')}
            onQuickRecordPayment={() => setCurrentTab('payments')}
            onSyncRouters={() => {
              if (routers[0]) handleSyncRouter(routers[0].id);
            }}
          />
        )}

        {currentTab === 'sessions' && (
          <ActiveSessionsView
            sessions={sessions}
            routers={routers}
            settings={settings}
            onKickSession={handleKickSession}
            onRefresh={refreshAllData}
          />
        )}

        {currentTab === 'vouchers' && (
          <VouchersView
            vouchers={vouchers}
            packages={packages}
            settings={settings}
            onGenerateBatch={handleGenerateBatch}
            onDeleteVoucher={handleDeleteVoucher}
            onDeleteBatch={handleDeleteBatch}
            onTestRedeem={handleTestRedeem}
          />
        )}

        {currentTab === 'packages' && (
          <PackagesView
            packages={packages}
            settings={settings}
            onCreatePackage={handleCreatePackage}
            onUpdatePackage={handleUpdatePackage}
            onDeletePackage={handleDeletePackage}
          />
        )}

        {currentTab === 'customers' && (
          <CustomersView
            customers={customers}
            packages={packages}
            settings={settings}
            onCreateCustomer={handleCreateCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        )}

        {currentTab === 'payments' && (
          <PaymentsView
            payments={payments}
            packages={packages}
            settings={settings}
            onRecordPayment={handleRecordPayment}
          />
        )}

        {currentTab === 'routers' && (
          <RoutersView
            routers={routers}
            settings={settings}
            onAddRouter={handleAddRouter}
            onSyncRouter={handleSyncRouter}
            onGetScript={handleGetRouterScript}
          />
        )}

        {currentTab === 'reports' && <ReportsView settings={settings} />}

        {currentTab === 'settings' && (
          <SettingsView settings={settings} onUpdateSettings={handleUpdateSettings} />
        )}
      </main>

      {/* Interactive Captive Portal Modal */}
      {showPortalModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-lg w-full flex flex-col items-center">
            {/* Top Close / Info Header */}
            <div className="w-full flex items-center justify-between mb-2 px-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white">
                  Guest Wi-Fi Captive Portal Simulator
                </span>
              </div>
              <button
                onClick={() => setShowPortalModal(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Close Simulator ✕
              </button>
            </div>

            {/* Captive Portal Inside Frame */}
            <CaptivePortalSimulator
              settings={settings}
              packages={packages}
              availableVouchers={vouchers.filter((v) => v.status === 'available')}
              onSessionCreated={(newSession) => {
                setSessions((prev) => [newSession, ...prev]);
                showToast(
                  `Guest authenticated! IP: ${newSession.ipAddress} active on router.`,
                  'success'
                );
              }}
              onClose={() => setShowPortalModal(false)}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {settings.venueName} • Wi-Fi Hotspot Billing &amp; Management Architecture
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            RouterOS API • TP-Link Omada • OpenWrt Ready
          </span>
        </div>
      </footer>
    </div>
  );
}
