import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer, RefreshCw } from 'lucide-react';
import { invoiceApi } from '../services/api';
import InvoiceTemplateView from '../components/InvoiceTemplateView';

export default function ViewInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await invoiceApi.getById(id);
        if (res.success && res.invoice) {
          setInvoice(res.invoice);
        }
      } catch (err) {
        console.error('Failed to load invoice:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-600">Loading bill...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Bill Not Found</h2>
        <Link
          to="/history"
          className="inline-block mt-4 bg-amber-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs"
        >
          Back to Previous Bills
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* Top Controls Bar (Hidden during Print) */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              Bill #{invoice.invoiceNumber}
            </h1>
            <p className="text-xs text-slate-500">
              Date: {invoice.invoiceDate} | Total: ₹{invoice.grandTotal.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={invoiceApi.getPdfUrl(invoice._id)}
            download={`Invoice_${invoice.invoiceNumber}.pdf`}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl shadow transition-colors text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </a>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl shadow transition-colors text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Invoice Render Card */}
      <div className="bg-slate-100 p-2 sm:p-6 rounded-2xl border border-slate-200 print:bg-white print:border-none print:p-0">
        <InvoiceTemplateView invoice={invoice} />
      </div>
    </div>
  );
}
