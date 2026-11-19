import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Check, Download, Printer, ArrowLeft, AlertCircle, FileCheck, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { invoiceApi, settingsApi } from '../services/api';
import InvoiceTemplateView from '../components/InvoiceTemplateView';
import { numberToIndianWords } from '../utils/numberToWords';

export default function CreateBill() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [nextInvoiceNum, setNextInvoiceNum] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    return `${d}-${m}-${y}`;
  });
  const [sacCode, setSacCode] = useState('9966');

  // Customer Details
  const [customerName, setCustomerName] = useState('M/S. THE SUPREME INDUSTRIES LIMITED');
  const [customerAddress, setCustomerAddress] = useState([
    'JADCHERLA, PPD UNIT NO. 24,26, TO 40',
    '43 TO 45, 41P, 42P, 47P,48P, GREEN',
    'INDUSTRIEAL PARK',
    'MAHABUBNAGAR-509301',
  ]);
  const [customerGst, setCustomerGst] = useState('36AAACT1344F1ZP');

  // Entries
  const [entries, setEntries] = useState([
    {
      sNo: 1,
      loadingDate: '',
      vehicleNumber: '',
      customerInvoiceNo: '',
      from: 'Jadcherla',
      to: 'Sri city\nAP',
      freight: 25000,
      unloading: 0,
      total: 25000,
    },
  ]);

  // GST
  const [hasGst, setHasGst] = useState(true);
  const [gstRate, setGstRate] = useState(18);

  // Load Settings and Next Bill Number
  useEffect(() => {
    async function init() {
      try {
        const [settingsRes, nextNumRes] = await Promise.all([
          settingsApi.get(),
          invoiceApi.getNextNumber(),
        ]);

        if (settingsRes.success && settingsRes.settings) {
          const s = settingsRes.settings;
          setSettings(s);
          if (s.sacCode) setSacCode(s.sacCode);
          if (s.defaultCustomer?.name) setCustomerName(s.defaultCustomer.name);
          if (s.defaultCustomer?.addressLines) setCustomerAddress(s.defaultCustomer.addressLines);
          if (s.defaultCustomer?.gstNumber) setCustomerGst(s.defaultCustomer.gstNumber);
          if (s.defaultGstRate !== undefined) setGstRate(s.defaultGstRate);
        }

        const nextNum = String(nextNumRes.nextInvoiceNumber || 36);
        setNextInvoiceNum(nextNum);
        setInvoiceNumber(nextNum);

        // Pre-fill from voice extraction if passed
        const voiceData = location.state?.extractedData;
        if (voiceData) {
          if (voiceData.invoiceDate) setInvoiceDate(voiceData.invoiceDate);
          if (voiceData.customerName) setCustomerName(voiceData.customerName);
          if (voiceData.targetInvoiceNumber) setInvoiceNumber(voiceData.targetInvoiceNumber);

          if (voiceData.entries && voiceData.entries.length > 0) {
            setEntries(
              voiceData.entries.map((item, idx) => ({
                sNo: idx + 1,
                loadingDate: item.loadingDate || voiceData.invoiceDate || invoiceDate,
                vehicleNumber: (item.vehicleNumber || '').toUpperCase(),
                customerInvoiceNo: item.customerInvoiceNo || '',
                from: item.from || 'Jadcherla',
                to: item.to || 'Sri city\nAP',
                freight: Number(item.freight) || 0,
                unloading: Number(item.unloading) || 0,
                total: (Number(item.freight) || 0) + (Number(item.unloading) || 0),
              }))
            );
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [location.state]);

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

  // Manage entries
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

  // Preview Object
  const previewInvoiceData = {
    invoiceNumber: invoiceNumber || nextInvoiceNum,
    invoiceDate,
    sacCode,
    customerDetails: {
      name: customerName,
      addressLines: customerAddress,
      gstNumber: customerGst,
    },
    businessDetailsSnapshot: settings || {},
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

  // Save handler
  const handleSaveInvoice = async () => {
    // Basic validation
    if (!invoiceNumber.trim()) {
      setErrorMessage('దయచేసి బిల్ నంబర్ నమోదు చేయండి.');
      return;
    }
    const hasInvalidVeh = entries.some((e) => !e.vehicleNumber.trim());
    if (hasInvalidVeh) {
      setErrorMessage('దయచేసి ప్రతి ఎంట్రీకి వాహనం నంబర్ నమోదు చేయండి.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const payload = {
        invoiceNumber,
        invoiceDate,
        sacCode,
        customerDetails: {
          name: customerName,
          addressLines: customerAddress,
          gstNumber: customerGst,
        },
        entries,
        hasGst,
        gstRate,
      };

      const res = await invoiceApi.create(payload);
      if (res.success && res.invoice) {
        setSavedInvoice(res.invoice);
        // Confetti celebration
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (_) {}
      } else {
        setErrorMessage(res.message || 'బిల్లు సేవ్ చేయడంలో విఫలమైంది.');
      }
    } catch (err) {
      console.error('Save failed:', err);
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
          <p className="text-slate-600 font-semibold">బిల్ తయారీ వివరాలు లోడ్ అవుతున్నాయి...</p>
        </div>
      </div>
    );
  }

  // Once saved, show final confirmation view
  if (savedInvoice) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Success Banner */}
        <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <FileCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black">బిల్లు విజయవంతంగా భద్రపరచబడింది!</h2>
              <p className="text-emerald-100 text-sm font-medium">
                బిల్ నంబర్ #{savedInvoice.invoiceNumber} | మొత్తం ₹{savedInvoice.grandTotal.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={invoiceApi.getPdfUrl(savedInvoice._id)}
              download={`Invoice_${savedInvoice.invoiceNumber}.pdf`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-white text-emerald-900 font-bold px-6 py-3 rounded-xl shadow hover:bg-emerald-50 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadPdf}</span>
            </a>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl shadow hover:bg-emerald-800 transition-colors text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printBill}</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/history')}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>పాత బిల్లుల లిస్ట్‌కి వెళ్ళు</span>
          </button>
          <button
            onClick={() => {
              setSavedInvoice(null);
              navigate('/voice-bill');
            }}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>ఇంకొక కొత్త బిల్ చేయండి (Create Another)</span>
          </button>
        </div>

        {/* Master Invoice Template Preview on Screen */}
        <div className="border border-slate-300 rounded-3xl p-4 sm:p-8 bg-slate-100 shadow-inner">
          <InvoiceTemplateView invoice={savedInvoice} />
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
              {location.state?.extractedData ? 'వాయిస్ ద్వారా వచ్చిన బిల్ వివరాలు' : t.createBill}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              వివరాలు సరిచూసుకోండి, అవసరమైతే మార్చండి, తర్వాత సేవ్ చేయండి.
            </p>
          </div>
        </div>

        {/* Voice Origin Indicator */}
        {location.state?.rawVoice && (
          <div className="hidden lg:flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs text-amber-900 font-semibold max-w-sm truncate">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span className="truncate">"{location.state.rawVoice}"</span>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Two Column Layout: Editor (Left) & Master Template Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form (Left 6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Bill Meta Card */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>బిల్ నంబర్ & తేదీ (Bill Meta)</span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                SAC: {sacCode}
              </span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  బిల్ నంబర్ (Bill NO) *
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  తేదీ (Date: DD-MM-YYYY) *
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

          {/* Customer / Consignee Card */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              కస్టమర్ వివరాలు (Customer / To)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  కంపెనీ / కస్టమర్ పేరు
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

          {/* Transport Entries Card */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                రవాణా ఎంట్రీలు (Transport Entries - {entries.length})
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
                      title="Delete Entry"
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
                      placeholder="TS08UH0187"
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
                      placeholder="03-11-2026"
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
                      placeholder="SPI/26-27/1802"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      నుంచి (From) *
                    </label>
                    <input
                      type="text"
                      value={entry.from}
                      onChange={(e) => handleEntryChange(idx, 'from', e.target.value)}
                      placeholder="Jadcherla"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      వరకు (To) *
                    </label>
                    <input
                      type="text"
                      value={entry.to}
                      onChange={(e) => handleEntryChange(idx, 'to', e.target.value)}
                      placeholder="Sri city AP"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      ఫ్రైట్ (Freight ₹) *
                    </label>
                    <input
                      type="number"
                      value={entry.freight}
                      onChange={(e) => handleEntryChange(idx, 'freight', e.target.value)}
                      placeholder="25000"
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
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      ఎంట్రీ మొత్తం (Total ₹)
                    </label>
                    <div className="px-3 py-2 bg-slate-200/80 border border-slate-300 rounded-lg text-sm font-black text-slate-900">
                      ₹{entry.total.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Calculation & GST Card */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
              సొమ్ము లెక్కలు & GST (Tax Calculation)
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
              {hasGst && (
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  CGST 9% + SGST 9%
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm text-slate-700 pt-2">
              <div className="flex justify-between">
                <span>సబ్ టోటల్ (Sub Total):</span>
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
                <span>గ్రాండ్ టోటల్ (Grand Total):</span>
                <span className="text-emerald-700">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-xs text-slate-500 italic pt-1">
                అక్షరాలలో: <span className="font-semibold text-slate-800">{amountInWords}</span>
              </div>
            </div>
          </div>

          {/* Confirm & Save Button */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveInvoice}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 text-base sm:text-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span>సేవ్ చేస్తున్నాము...</span>
                </>
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  <span>{t.confirmAndSave}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-4 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>

        {/* Live Master Invoice Preview (Right 6 Cols) */}
        <div className="lg:col-span-6 sticky top-24">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-t-3xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="text-xs sm:text-sm font-bold tracking-wide uppercase">
                {t.previewTitle}
              </span>
            </div>
            <span className="text-xs text-amber-400 font-semibold">ఖచ్చితమైన అసలు లేఅవుట్</span>
          </div>

          <div className="bg-slate-200/90 rounded-b-3xl p-3 sm:p-4 shadow-xl border-x border-b border-slate-300 max-h-[85vh] overflow-y-auto">
            <InvoiceTemplateView invoice={previewInvoiceData} />
          </div>
        </div>
      </div>
    </div>
  );
}
