import React, { useState } from 'react';
import {
  Settings,
  Save,
  Check,
  Globe,
  Shield,
  Phone,
  Mail,
  DollarSign,
  Wifi,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {
  const [venueName, setVenueName] = useState(settings.venueName);
  const [venueType, setVenueType] = useState(settings.venueType);
  const [currency, setCurrency] = useState(settings.currency);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [termsUrl, setTermsUrl] = useState(settings.termsUrl);
  const [captivePortalTitle, setCaptivePortalTitle] = useState(settings.captivePortalTitle);
  const [captivePortalWelcomeMsg, setCaptivePortalWelcomeMsg] = useState(
    settings.captivePortalWelcomeMsg
  );
  const [allowFreeTrial, setAllowFreeTrial] = useState(settings.allowFreeTrial);
  const [freeTrialMinutes, setFreeTrialMinutes] = useState(settings.freeTrialMinutes);
  const [autoDisconnectOnExpiry, setAutoDisconnectOnExpiry] = useState(
    settings.autoDisconnectOnExpiry
  );

  // Walled Garden
  const [walledGarden, setWalledGarden] = useState<string[]>(settings.walledGarden || []);
  const [newDomain, setNewDomain] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setWalledGarden([...walledGarden, newDomain.trim().toLowerCase()]);
    setNewDomain('');
  };

  const handleRemoveDomain = (idx: number) => {
    setWalledGarden(walledGarden.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateSettings({
        venueName: venueName.trim(),
        venueType,
        currency,
        currencySymbol,
        supportPhone: supportPhone.trim(),
        supportEmail: supportEmail.trim(),
        termsUrl: termsUrl.trim(),
        captivePortalTitle: captivePortalTitle.trim(),
        captivePortalWelcomeMsg: captivePortalWelcomeMsg.trim(),
        allowFreeTrial,
        freeTrialMinutes: Number(freeTrialMinutes) || 30,
        autoDisconnectOnExpiry,
        walledGarden,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-md backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" />
              <span>System &amp; Hotspot Settings</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure venue branding, guest splash portal, currency, and router walled garden domains.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : savedSuccess ? 'Changes Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Venue Identity */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Venue Identity &amp; Branding</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Venue / Business Name (SSID)
              </label>
              <input
                type="text"
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Establishment Type</label>
              <select
                value={venueType}
                onChange={(e) => setVenueType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="hostel">Hostel / Backpackers / Hotel</option>
                <option value="cafe">Café / Coffee Shop / Restaurant</option>
                <option value="apartment">Apartment Complex / Student Dorm</option>
                <option value="gaming">Gaming Lounge / Cybercafé</option>
                <option value="office">Coworking Space / Office</option>
                <option value="neighborhood_isp">Neighborhood ISP Hotspot</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Currency Code</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="USD, KES, EUR, GBP, INR"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="$, €, £, KSh, ₹, ₦"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Captive Portal Splash Customization */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Customer Captive Portal Splash Page</span>
          </h3>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Splash Page Header Title</label>
            <input
              type="text"
              value={captivePortalTitle}
              onChange={(e) => setCaptivePortalTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Welcome Instructions</label>
            <textarea
              rows={2}
              value={captivePortalWelcomeMsg}
              onChange={(e) => setCaptivePortalWelcomeMsg(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Support Phone / WhatsApp</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Terms of Service URL</label>
              <input
                type="text"
                value={termsUrl}
                onChange={(e) => setTermsUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Free Trial Settings */}
          <div className="pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowFreeTrial}
                  onChange={(e) => setAllowFreeTrial(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-slate-200 font-semibold">
                  Enable Free Trial Pass on Portal
                </span>
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Allows walk-in visitors to test the Wi-Fi for a complimentary period before purchasing.
              </p>
            </div>

            {allowFreeTrial && (
              <div className="flex items-center space-x-2">
                <span className="text-slate-300">Duration:</span>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={freeTrialMinutes}
                  onChange={(e) => setFreeTrialMinutes(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                />
                <span className="text-slate-400">minutes</span>
              </div>
            )}
          </div>
        </div>

        {/* Walled Garden Configuration */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Router Walled Garden (Whitelisted Domains Before Login)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Domains guests can freely access prior to entering a voucher or paying (e.g. payment gateways, venue website).
          </p>

          <div className="flex flex-wrap gap-2">
            {walledGarden.map((domain, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300"
              >
                <span>{domain}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDomain(idx)}
                  className="text-slate-500 hover:text-rose-400 ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. payment.example.com"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleAddDomain}
              className="px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Domain</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
