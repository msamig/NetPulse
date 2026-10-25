import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  HardDrive,
  Calendar,
  Download,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { DailyRevenue, HourlyTraffic, SystemSettings } from '../types';
import { api } from '../api/client';

interface ReportsViewProps {
  settings: SystemSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ settings }) => {
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [hourlyTraffic, setHourlyTraffic] = useState<HourlyTraffic[]>([]);
  const [packagePopularity, setPackagePopularity] = useState<
    Array<{ id: string; name: string; count: number; revenue: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getReports()
      .then((data) => {
        setDailyRevenue(data.dailyRevenue || []);
        setHourlyTraffic(data.hourlyTraffic || []);
        setPackagePopularity(data.packagePopularity || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.revenue), 100);
  const maxTraffic = Math.max(...hourlyTraffic.map((h) => h.activeUsers), 40);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-md backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>Hotspot Analytics &amp; Revenue Reports</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Analyze peak internet rush hours, revenue trends, voucher conversion rates, and package performance.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold border border-slate-600 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Revenue & Vouchers Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Bar Chart */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Daily Revenue (Past 7 Days)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Total gross earnings per day</p>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              {settings.currencySymbol}
              {dailyRevenue.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)} Total
            </span>
          </div>

          {/* Bar Visualization */}
          <div className="pt-4 flex items-end justify-between h-48 gap-2">
            {dailyRevenue.map((d, i) => {
              const heightPercent = Math.max(10, (d.revenue / maxRevenue) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition">
                    {settings.currencySymbol}
                    {d.revenue}
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-t h-36 flex items-end p-0.5">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t transition-all duration-500 hover:brightness-110"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-slate-300">{d.date}</span>
                  <span className="text-[9px] text-slate-500">{d.vouchersSold} cards</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Congestion & Traffic Hours */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Peak Traffic Hours</span>
              </h3>
              <p className="text-[11px] text-slate-400">Active users throughout the day</p>
            </div>
            <span className="text-xs text-slate-400">Peak: 18:00 (48 clients)</span>
          </div>

          {/* Hourly Traffic Bars */}
          <div className="pt-4 flex items-end justify-between h-48 gap-2">
            {hourlyTraffic.map((h, i) => {
              const heightPercent = Math.max(8, (h.activeUsers / maxTraffic) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition font-mono">
                    {h.activeUsers}u
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-t h-36 flex items-end p-0.5">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 to-blue-400 rounded-t transition-all duration-500 hover:brightness-110"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-300">{h.hour}</span>
                  <span className="text-[9px] text-slate-500">
                    {(h.downloadMb / 1024).toFixed(0)}GB
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Package Performance Breakdown */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span>Package Popularity &amp; Revenue Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {packagePopularity.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <span className="font-semibold text-white text-xs">{pkg.name}</span>
                <span className="text-xs font-bold text-emerald-400">
                  {settings.currencySymbol}
                  {pkg.revenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Vouchers Activated:</span>
                <span className="font-medium text-slate-200">{pkg.count} sold</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
