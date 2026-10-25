import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Ticket,
  CreditCard,
  Sparkles,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HardDrive,
  Zap,
  LogOut,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Lock,
} from 'lucide-react';
import {
  WifiPackage,
  SystemSettings,
  HotspotSession,
  Voucher,
} from '../types';
import { api } from '../api/client';

interface CaptivePortalSimulatorProps {
  settings: SystemSettings;
  packages: WifiPackage[];
  availableVouchers: Voucher[];
  onSessionCreated: (session: HotspotSession) => void;
  onClose?: () => void;
}

export const CaptivePortalSimulator: React.FC<CaptivePortalSimulatorProps> = ({
  settings,
  packages,
  availableVouchers,
  onSessionCreated,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'voucher' | 'buy' | 'trial'>('voucher');

  // Voucher Login Form
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherPin, setVoucherPin] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Online Purchase Form
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    packages.find((p) => p.isActive)?.id || packages[0]?.id || ''
  );
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mpesa' | 'paypal'>('mpesa');
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Free trial
  const [trialLoading, setTrialLoading] = useState(false);

  // Active Authenticated State
  const [activeSession, setActiveSession] = useState<HotspotSession | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(3600);
  const [usedDataMb, setUsedDataMb] = useState<number>(14);

  // Simulated Device Details
  const simulatedMac = '5E:8A:2C:19:D4:62';
  const simulatedDevice = 'iPhone 15 (Guest Safari)';

  // Countdown timer when connected
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
      setUsedDataMb((prev) => +(prev + Math.random() * 0.4).toFixed(1));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleVoucherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    setVoucherLoading(true);
    setVoucherError(null);
    try {
      const res = await api.portalLogin({
        voucherCode: voucherCode.trim(),
        pin: voucherPin.trim(),
        macAddress: simulatedMac,
        deviceName: simulatedDevice,
      });

      setActiveSession(res.session);
      setRemainingSeconds(3600 * 2); // 2 hours default
      onSessionCreated(res.session);
    } catch (err: any) {
      setVoucherError(err.message || 'Failed to authenticate voucher');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handlePurchaseAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseLoading(true);
    setPurchaseError(null);
    try {
      const res = await api.portalPurchaseConnect({
        packageId: selectedPackageId,
        customerName: guestName.trim() || 'Online Guest',
        customerPhone: guestPhone.trim() || '+1 555-0199',
        paymentMethod,
        macAddress: simulatedMac,
        deviceName: simulatedDevice,
      });

      setActiveSession(res.session);
      setRemainingSeconds(3600 * 12);
      onSessionCreated(res.session);
    } catch (err: any) {
      setPurchaseError(err.message || 'Purchase failed');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleFreeTrialConnect = async () => {
    setTrialLoading(true);
    try {
      const res = await api.portalLogin({
        isFreeTrial: true,
        macAddress: simulatedMac,
        deviceName: simulatedDevice,
      });

      setActiveSession(res.session);
      setRemainingSeconds((settings.freeTrialMinutes || 30) * 60);
      onSessionCreated(res.session);
    } catch (err: any) {
      alert(err.message || 'Trial login failed');
    } finally {
      setTrialLoading(false);
    }
  };

  const handleDisconnect = () => {
    setActiveSession(null);
  };

  const fillSampleVoucher = () => {
    const sample = availableVouchers[0];
    if (sample) {
      setVoucherCode(sample.code);
      if (sample.pin) setVoucherPin(sample.pin);
    }
  };

  const formatCountdown = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const activePackages = packages.filter((p) => p.isActive);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Smartphone Device Frame Mockup */}
      <div className="w-full max-w-sm sm:max-w-md bg-slate-950 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/60 relative overflow-hidden">
        {/* Phone Notch & Speaker */}
        <div className="flex justify-center mb-2">
          <div className="w-24 h-4 bg-slate-800 rounded-full flex items-center justify-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-900"></div>
            <div className="w-8 h-1 rounded-full bg-slate-700"></div>
          </div>
        </div>

        {/* Captive Portal Browser Screen */}
        <div className="bg-slate-900 rounded-[28px] overflow-hidden flex flex-col min-h-[620px] max-h-[720px] border border-slate-800 text-slate-100 relative">
          {/* Simulated Browser Bar */}
          <div className="bg-slate-950/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1.5 font-mono truncate">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>hotspot.local/login</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3 h-3" />
                <span>Wi-Fi</span>
              </span>
            </div>
          </div>

          {/* Connected View vs Splash Login View */}
          {activeSession ? (
            /* ========================================================
               ALREADY CONNECTED SCREEN
               ======================================================== */
            <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto space-y-4">
              <div className="text-center pt-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 mb-3">
                  <CheckCircle2 className="w-8 h-8 text-white animate-bounce" />
                </div>
                <h2 className="text-lg font-bold text-white">You're Connected!</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-speed internet access is now active on your device.
                </p>
              </div>

              {/* Countdown & Quota Card */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3 shadow-inner">
                {/* Countdown */}
                <div className="text-center">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Time Remaining
                  </span>
                  <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight mt-0.5">
                    {formatCountdown(remainingSeconds)}
                  </div>
                </div>

                {/* Quota Progress */}
                <div className="space-y-1 pt-1 border-t border-slate-700/60 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data Transferred:</span>
                    <span className="font-bold text-slate-200 font-mono">{usedDataMb} MB</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (usedDataMb / 1024) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Network Rate Limit */}
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Speed Profile
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {activeSession.rateLimit}
                  </span>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Assigned IP:</span>
                  <span className="text-slate-200">{activeSession.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span>Device MAC:</span>
                  <span className="text-slate-300">{activeSession.macAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span>Router Gateway:</span>
                  <span className="text-slate-300 truncate max-w-[150px]">
                    {activeSession.routerName}
                  </span>
                </div>
              </div>

              {/* Disconnect Action */}
              <button
                onClick={handleDisconnect}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Disconnect Wi-Fi Session</span>
              </button>
            </div>
          ) : (
            /* ========================================================
               PORTAL SPLASH & LOGIN SCREEN
               ======================================================== */
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between overflow-y-auto space-y-4">
              {/* Branding Header */}
              <div className="text-center pt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto shadow-md shadow-cyan-500/20 mb-2">
                  <Wifi className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-base font-bold text-white tracking-tight">
                  {settings.captivePortalTitle}
                </h1>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {settings.captivePortalWelcomeMsg}
                </p>
              </div>

              {/* Portal Mode Tabs */}
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('voucher')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1 ${
                    activeTab === 'voucher'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Ticket className="w-3 h-3" />
                  <span>Voucher</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('buy')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1 ${
                    activeTab === 'buy'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Buy Pass</span>
                </button>

                {settings.allowFreeTrial && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('trial')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1 ${
                      activeTab === 'trial'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Free Trial</span>
                  </button>
                )}
              </div>

              {/* ================= VOUCHER TAB ================= */}
              {activeTab === 'voucher' && (
                <form onSubmit={handleVoucherLogin} className="space-y-3 text-xs">
                  {voucherError && (
                    <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{voucherError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Enter Voucher Access Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. WIFI-9824-3102"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-cyan-300 focus:outline-none focus:border-indigo-500 uppercase tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      4-Digit Security PIN (If on card)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 4190"
                      value={voucherPin}
                      onChange={(e) => setVoucherPin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {availableVouchers.length > 0 && (
                    <button
                      type="button"
                      onClick={fillSampleVoucher}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Quick Test: Paste Sample Available Voucher ({availableVouchers[0]?.code})</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={voucherLoading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2 transition mt-2"
                  >
                    <span>{voucherLoading ? 'Authenticating...' : 'Connect to High-Speed Wi-Fi'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* ================= BUY PASS ONLINE TAB ================= */}
              {activeTab === 'buy' && (
                <form onSubmit={handlePurchaseAndConnect} className="space-y-3 text-xs">
                  {purchaseError && (
                    <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{purchaseError}</span>
                    </div>
                  )}

                  {/* Plan Picker */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-medium">Choose Your Pass</label>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {activePackages.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                              isSelected
                                ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500/30'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div>
                              <div className="font-semibold text-white text-xs">{pkg.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {pkg.downloadSpeedMbps} Mbps •{' '}
                                {pkg.dataLimitMb === 0
                                  ? 'Unlimited'
                                  : `${(pkg.dataLimitMb / 1024).toFixed(0)} GB`}
                              </div>
                            </div>
                            <span className="font-bold text-emerald-400 text-sm font-mono">
                              {settings.currencySymbol}
                              {pkg.price.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Guest Info */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Alex"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Phone / Mobile</label>
                      <input
                        type="text"
                        required
                        placeholder="+1 555-0199"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Payment Method</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mpesa')}
                        className={`py-1.5 rounded-lg border text-[11px] font-semibold transition ${
                          paymentMethod === 'mpesa'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        M-Pesa
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`py-1.5 rounded-lg border text-[11px] font-semibold transition ${
                          paymentMethod === 'card'
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        Card / Pay
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('paypal')}
                        className={`py-1.5 rounded-lg border text-[11px] font-semibold transition ${
                          paymentMethod === 'paypal'
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        PayPal
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={purchaseLoading}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center justify-center space-x-2 transition"
                  >
                    <span>
                      {purchaseLoading ? 'Processing Payment...' : 'Pay & Connect Instantly'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* ================= FREE TRIAL TAB ================= */}
              {activeTab === 'trial' && (
                <div className="space-y-4 text-xs text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {settings.freeTrialMinutes}-Minute Complimentary Wi-Fi
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      New to {settings.venueName}? Test out our fiber speed connection with zero commitment.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{settings.freeTrialMinutes} minutes active internet</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Up to 5 Mbps speed limit</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFreeTrialConnect}
                    disabled={trialLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition"
                  >
                    <span>{trialLoading ? 'Activating Session...' : 'Start Free Trial Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Footer Terms */}
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
                Need help? Call reception: <span className="text-slate-400">{settings.supportPhone}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
