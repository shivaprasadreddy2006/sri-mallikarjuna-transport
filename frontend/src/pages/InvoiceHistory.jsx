import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Download, Eye, Trash2, FileText, RefreshCw, X, Mic } from 'lucide-react';
import { invoiceApi } from '../services/api';

export default function InvoiceHistory() {
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const res = await invoiceApi.getAll(params);
      if (res.success && res.invoices) {
        setInvoices(res.invoices);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [searchTerm]);

  const handleDelete = async (id, billNo) => {
    if (!window.confirm(`Are you sure you want to delete Bill #${billNo}?`)) return;
    try {
      await invoiceApi.delete(id);
      fetchInvoices();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Previous Bills
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Search, view, and re-download your saved transport bills
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow text-xs transition-all w-fit"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>+ Create New Bill (Voice)</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Vehicle No (e.g. TS08UH0187) or Bill No..."
            className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
            <p className="text-xs font-bold text-slate-600">Loading bills...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <h3 className="text-base font-bold text-slate-700">No bills found</h3>
            <p className="text-xs text-slate-500 mt-1">Try a different search or create a new bill.</p>
          </div>
        ) : (
          <>
            {/* 1. Mobile Phone Cards (< sm screens) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {invoices.map((inv) => (
                <div key={inv._id} className="p-3.5 space-y-2 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900">
                        #{inv.invoiceNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {inv.invoiceDate}
                      </span>
                    </div>

                    <span className="text-base font-extrabold text-emerald-700">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="text-xs space-y-0.5">
                    <div className="font-bold text-slate-800">
                      🚗 {inv.entries?.map((e) => e.vehicleNumber).filter(Boolean).join(', ') || '-'}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      📍 {inv.entries?.[0]?.from || '-'} → {inv.entries?.[0]?.to?.replace(/\n/g, ' ') || '-'}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <a
                      href={invoiceApi.getPdfUrl(inv._id)}
                      download={`Invoice_${inv.invoiceNumber}.pdf`}
                      className="inline-flex items-center gap-1 bg-amber-500 active:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>

                    <Link
                      to={`/view/${inv._id}`}
                      className="inline-flex items-center gap-1 bg-slate-100 active:bg-slate-200 text-slate-800 font-bold text-xs px-2.5 py-1.5 rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>

                    <button
                      onClick={() => handleDelete(inv._id, inv.invoiceNumber)}
                      className="p-1.5 rounded-lg text-red-500 active:bg-red-50"
                      title="Delete Bill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Desktop Table View (>= sm screens) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Bill No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Vehicle No</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-black text-slate-900 text-base">
                        #{inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs font-semibold">
                        {inv.invoiceDate}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        {inv.entries?.map((e) => e.vehicleNumber).filter(Boolean).join(', ') || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        {inv.entries?.[0]?.from || '-'} → {inv.entries?.[0]?.to?.replace(/\n/g, ' ') || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-700 text-base">
                        ₹{inv.grandTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={invoiceApi.getPdfUrl(inv._id)}
                            download={`Invoice_${inv.invoiceNumber}.pdf`}
                            className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                          <Link
                            to={`/view/${inv._id}`}
                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(inv._id, inv.invoiceNumber)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete Bill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
