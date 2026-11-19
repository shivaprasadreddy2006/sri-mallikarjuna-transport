import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Check, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { invoiceApi } from '../services/api';
import InvoiceTemplateView from '../components/InvoiceTemplateView';
import { numberToIndianWords } from '../utils/numberToWords';

export default function EditBill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Original Data Snapshot
  const [originalInvoice, setOriginalInvoice] = useState(null);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [sacCode, setSacCode] = useState('9966');

  // Customer
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState([]);
  const [customerGst, setCustomerGst] = useState('');

  // Entries
  const [entries, setEntries] = useState([]);

  // GST
  const [hasGst, setHasGst] = useState(true);
  const [gstRate, setGstRate] = useState(18);

  useEffect(() => {
    async function load() {
      try {
        const res = await invoiceApi.getById(id);
        if (res.success && res.invoice) {
          const inv = res.invoice;
          setOriginalInvoice(inv);
          setInvoiceNumber(inv.invoiceNumber);
          setInvoiceDate(inv.invoiceDate);
          setSacCode(inv.sacCode || '9966');
          setCustomerName(inv.customerDetails?.name || '');
          setCustomerAddress(inv.customerDetails?.addressLines || []);
          setCustomerGst(inv.customerDetails?.gstNumber || '');
          setEntries(inv.entries || []);
          setHasGst(inv.hasGst !== undefined ? inv.hasGst : true);
          setGstRate(inv.gstRate || 18);
        }
      } catch (err) {
        console.error('Failed to load bill for editing:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Live Totals Calculations
  const totalFreight = entries.reduce((acc, curr) => acc + (Number(curr.freight) || 0), 0);
  const totalUnloading = entries.reduce((acc, curr) => acc + (Number(curr.unloading) || 0), 0);
  const subTotal = totalFreight + totalUnloading;

  const cgstRate = hasGst ? gstRate / 2 : 0;
  const sgstRate = hasGst ? gstRate / 2 : 0;
  const cgstAmount = hasGst ? Math.round(subTotal * (cgstRate / 100)) : 0;
  const sgstAmount = hasGst ? Math.round(subTotal * (sgstRate / 100)) : 0;
  const grandTotal = subTotal + cgstAmount + sgstAmount;
  const amountInWords = numberToIndianWords(grandTotal);

  const handleEntryChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;

    if (field === 'freight' || field === 'unloading') {
      const fr = Number(field === 'freight' ? value : updated[index].freight) || 0;
      const un = Number(field === 'unloading' ? value : updated[index].unloading) || 0;
      updated[index].total = fr + un;
    }

    setEntries(updated);
  };

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      {
        sNo: entries.length + 1,
        loadingDate: invoiceDate,
        vehicleNumber: '',
        customerInvoiceNo: '',
        from: entries[entries.length - 1]?.from || 'Jadcherla',
        to: entries[entries.length - 1]?.to || 'Sri city\nAP',
        freight: 0,
        unloading: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveEntry = (index) => {
    if (entries.length <= 1) return;
    const filtered = entries.filter((_, i) => i !== index).map((e, idx) => ({ ...e, sNo: idx + 1 }));
    setEntries(filtered);
  };

  const previewInvoiceData = {
    invoiceNumber,
    invoiceDate,
    sacCode,
    customerDetails: {
      name: customerName,
      addressLines: customerAddress,
      gstNumber: customerGst,
    },
    businessDetailsSnapshot: originalInvoice?.businessDetailsSnapshot || {},
    entries,
    totalFreight,
    totalUnloading,
    subTotal,
    hasGst,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    grandTotal,
    amountInWords,
  };

  const handleUpdate = async () => {
    setSaving(true);
    setErrorMessage('');

    try {
      const payload = {
        invoiceDate,
        customerDetails: {
          name: customerName,
          addressLines: customerAddress,
          gstNumber: customerGst,
        },
        entries,
        hasGst,
        gstRate,
      };

      const res = await invoiceApi.update(id, payload);
      if (res.success) {
        navigate(`/view/${id}`);
      } else {
        setErrorMessage(res.message || 'బిల్ సవరించడంలో విఫలమైంది.');
      }
    } catch (err) {
      console.error('Update failed:', err);
      setErrorMessage(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin text-amber-500 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">బిల్లు వివరాలు లోడ్ అవుతున్నాయి...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              బిల్ సవరణ (#{invoiceNumber})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              అసలు బిల్ నంబర్ మారదు. మార్పులు చేసి సేవ్ చేయండి.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>బిల్ నంబర్ & తేదీ</span>
              <span className="text-xs font-bold text-slate-500">Bill NO: #{invoiceNumber}</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  బిల్ నంబర్ (మార్చలేరు)
                </label>
                <input
                  type="text"
                  disabled
                  value={invoiceNumber}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-base font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  తేదీ (DD-MM-YYYY)
                </label>
                <input
                  type="text"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              కస్టమర్ వివరాలు
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  కస్టమర్ పేరు
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  కస్టమర్ GST నంబర్
                </label>
                <input
                  type="text"
                  value={customerGst}
                  onChange={(e) => setCustomerGst(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
                />
              </div>
            </div>
          </div>

          {/* Transport Entries */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                రవాణా ఎంట్రీలు ({entries.length})
              </h2>
              <button
                type="button"
                onClick={handleAddEntry}
                className="inline-flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addEntry}</span>
              </button>
            </div>

            {entries.map((entry, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    ఎంట్రీ #{idx + 1}
                  </span>
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEntry(idx)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      వాహనం నంబర్ *
                    </label>
                    <input
                      type="text"
                      value={entry.vehicleNumber}
                      onChange={(e) => handleEntryChange(idx, 'vehicleNumber', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      లోడింగ్ తేదీ
                    </label>
                    <input
                      type="text"
                      value={entry.loadingDate || invoiceDate}
                      onChange={(e) => handleEntryChange(idx, 'loadingDate', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      ఇన్వాయిస్ / LR నంబర్
                    </label>
                    <input
                      type="text"
                      value={entry.customerInvoiceNo}
                      onChange={(e) => handleEntryChange(idx, 'customerInvoiceNo', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      నుంచి (From)
                    </label>
                    <input
                      type="text"
                      value={entry.from}
                      onChange={(e) => handleEntryChange(idx, 'from', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      వరకు (To)
                    </label>
                    <input
                      type="text"
                      value={entry.to}
                      onChange={(e) => handleEntryChange(idx, 'to', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      ఫ్రైట్ (₹) *
                    </label>
                    <input
                      type="number"
                      value={entry.freight}
                      onChange={(e) => handleEntryChange(idx, 'freight', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      అన్లోడింగ్ (₹)
                    </label>
                    <input
                      type="number"
                      value={entry.unloading}
                      onChange={(e) => handleEntryChange(idx, 'unloading', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      మొత్తం (₹)
                    </label>
                    <div className="px-3 py-2 bg-slate-200/80 border border-slate-300 rounded-lg text-sm font-black text-slate-900">
                      ₹{entry.total.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* GST */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
              సొమ్ము లెక్కలు & GST
            </h2>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasGst}
                  onChange={(e) => setHasGst(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded"
                />
                <span className="text-sm font-bold text-slate-800">{t.applyGst}</span>
              </label>
            </div>

            <div className="space-y-2 text-sm text-slate-700 pt-2">
              <div className="flex justify-between">
                <span>సబ్ టోటల్:</span>
                <span className="font-bold">₹{subTotal.toLocaleString('en-IN')}</span>
              </div>
              {hasGst && (
                <>
                  <div className="flex justify-between text-blue-700">
                    <span>CGST @ 9%:</span>
                    <span className="font-bold">₹{cgstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>SGST @ 9%:</span>
                    <span className="font-bold">₹{sgstAmount.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-lg font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>గ్రాండ్ టోటల్:</span>
                <span className="text-emerald-700">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-xs text-slate-500 italic pt-1">
                అక్షరాలలో: <span className="font-semibold text-slate-800">{amountInWords}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleUpdate}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl transition-all text-base sm:text-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span>అప్‌డేట్ చేస్తున్నాము...</span>
                </>
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  <span>{t.saveChanges}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-4 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>

        {/* Live Preview (Right) */}
        <div className="lg:col-span-6 sticky top-24">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-t-3xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="text-xs sm:text-sm font-bold tracking-wide uppercase">
                {t.previewTitle}
              </span>
            </div>
            <span className="text-xs text-amber-400 font-semibold">ప్రత్యక్ష ప్రివ్యూ</span>
          </div>

          <div className="bg-slate-200/90 rounded-b-3xl p-3 sm:p-4 shadow-xl border-x border-b border-slate-300 max-h-[85vh] overflow-y-auto">
            <InvoiceTemplateView invoice={previewInvoiceData} />
          </div>
        </div>
      </div>
    </div>
  );
}
