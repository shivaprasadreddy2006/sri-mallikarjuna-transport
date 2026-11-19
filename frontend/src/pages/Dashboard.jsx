import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, PlusCircle, History, Settings, FileText, ArrowRight, IndianRupee, Calendar, Truck, Clock, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { invoiceApi } from '../services/api';

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalInvoices: 0,
    todayInvoices: 0,
    totalRevenue: 0,
    latestInvoice: null,
    recentInvoices: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await invoiceApi.getDashboardStats();
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <Truck className="w-96 h-96 -mr-16 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-bold mb-4">
            <span>SRI MALLIKARJUNA TRANSPORT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            ట్రాన్స్‌పోర్ట్ బిల్లింగ్ సిస్టమ్
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
            కంప్యూటర్ లేదా ఎక్సెల్ పరిజ్ఞానం అవసరం లేకుండా, తెలుగులో మాట్లాడి క్షణాల్లో సరైన బిల్లు తయారు చేసుకోండి.
          </p>
        </div>
      </div>

      {/* 4 PRIMARY DASHBOARD ACTIONS (Large, High Contrast, Non-Technical Friendly) */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          ప్రధాన సేవలు (Main Actions)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Action 1: Speak to Create Bill */}
          <Link
            to="/voice-bill"
            className="group relative bg-amber-500 hover:bg-amber-400 rounded-3xl p-6 sm:p-8 shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 text-slate-950 flex flex-col justify-between"
          >
            <div>
              <div className="w-16 h-16 bg-slate-950 text-amber-400 rounded-2xl flex items-center justify-center shadow-md mb-6 group-hover:scale-110 transition-transform">
                <Mic className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-2 tracking-tight">
                {t.speakToCreate}
              </h3>
              <p className="text-slate-900 text-xs sm:text-sm font-semibold opacity-90 leading-snug">
                తెలుగులో మాట్లాడి కొత్త బిల్లు తయారు చేయండి.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
              <span>ఇప్పుడే మాట్లాడండి</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 2: Create Bill Manually */}
          <Link
            to="/create"
            className="group bg-white hover:bg-slate-50 rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 transition-all transform hover:-translate-y-1 active:translate-y-0 text-slate-900 flex flex-col justify-between"
          >
            <div>
              <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-2 tracking-tight">
                {t.manualCreate}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-snug">
                ఫారమ్ లో వాహనం నంబర్, ఫ్రైట్ టైప్ చేసి బిల్ తయారు చేయండి.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 font-bold text-xs text-blue-700 uppercase tracking-wider">
              <span>ఓపెన్ చేయండి</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 3: Previous Bills */}
          <Link
            to="/history"
            className="group bg-white hover:bg-slate-50 rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 transition-all transform hover:-translate-y-1 active:translate-y-0 text-slate-900 flex flex-col justify-between"
          >
            <div>
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <History className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-2 tracking-tight">
                {t.history}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-snug">
                పాత బిల్లులు వెతకండి, చూడండి లేదా PDF రీ-డౌన్‌లోడ్ చేసుకోండి.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 font-bold text-xs text-emerald-700 uppercase tracking-wider">
              <span>లిస్ట్ చూడండి</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 4: Business Settings */}
          <Link
            to="/settings"
            className="group bg-white hover:bg-slate-50 rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 transition-all transform hover:-translate-y-1 active:translate-y-0 text-slate-900 flex flex-col justify-between"
          >
            <div>
              <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-2 tracking-tight">
                {t.settings}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-snug">
                బ్యాంక్ ఖాతా, ఫోన్ నంబర్లు మరియు GST వివరాలు నిర్వహించండి.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 font-bold text-xs text-purple-700 uppercase tracking-wider">
              <span>మార్చుకోండి</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* DASHBOARD STATISTICS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.totalBills}</p>
            <h4 className="text-3xl font-black text-slate-900 mt-1">{stats.totalInvoices}</h4>
          </div>
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.todayBills}</p>
            <h4 className="text-3xl font-black text-slate-900 mt-1">{stats.todayInvoices}</h4>
          </div>
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.totalRevenue}</p>
            <h4 className="text-3xl font-black text-emerald-700 mt-1">
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </h4>
          </div>
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* RECENT INVOICES SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-black text-slate-900">{t.recentBills}</h3>
          </div>
          <Link
            to="/history"
            className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700"
          >
            {t.viewAll} →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
            <p className="text-sm">బిల్లులు లోడ్ అవుతున్నాయి...</p>
          </div>
        ) : stats.recentInvoices.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold">{t.noRecentBills}</p>
            <Link
              to="/voice-bill"
              className="inline-flex items-center gap-2 mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow text-sm transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>వాయిస్ బిల్ ప్రారంభించండి</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">{t.billNo}</th>
                  <th className="py-3 px-4">{t.date}</th>
                  <th className="py-3 px-4">{t.vehicleNo}</th>
                  <th className="py-3 px-4">{t.route}</th>
                  <th className="py-3 px-4">{t.customer}</th>
                  <th className="py-3 px-4 text-right">{t.grandTotal}</th>
                  <th className="py-3 px-4 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stats.recentInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-black text-slate-900">
                      #{inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{inv.invoiceDate}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {inv.entries?.[0]?.vehicleNumber || '-'}
                      {inv.entries?.length > 1 && (
                        <span className="ml-1 text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                          +{inv.entries.length - 1}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {inv.entries?.[0]?.from || '-'} → {inv.entries?.[0]?.to || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 truncate max-w-[180px]">
                      {inv.customerDetails?.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-700">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center space-x-2">
                      <Link
                        to={`/view/${inv._id}`}
                        className="inline-block px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                      >
                        చూడండి
                      </Link>
                      <a
                        href={invoiceApi.getPdfUrl(inv._id)}
                        download={`Invoice_${inv.invoiceNumber}.pdf`}
                        className="inline-block px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
                      >
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
