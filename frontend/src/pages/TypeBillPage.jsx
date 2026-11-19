import React, { useState, useEffect } from 'react';
import { Download, Printer, CheckCircle, RefreshCw, AlertCircle, ArrowRight, ChevronDown, ChevronUp, Sliders, Sparkles, Eye, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { invoiceApi, settingsApi } from '../services/api';
import InvoiceTemplateView from '../components/InvoiceTemplateView';
import InvoiceRowsEditor from '../components/InvoiceRowsEditor';
import { numberToIndianWords } from '../utils/numberToWords';

export default function TypeBillPage() {
  const [saving, setSaving] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mobileTab, setMobileTab] = useState('form'); // 'form' or 'preview'

  // Bill metadata
  const [invoiceNumber, setInvoiceNumber] = useState('36');
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    return `${d}-${m}-${y}`;
  });
  const [sacCode, setSacCode] = useState('9966');

  // Multi-row Bill Entries
  const [rows, setRows] = useState([
    {
      sNo: 1,
      loadingDate: '03-11-2026',
      vehicleNumber: 'TS08UH0187',
      customerInvoiceNo: 'SPI/26-27/1802',
      from: 'Jadcherla',
      to: 'Sri city\nAP',
      freight: 25000,
      unloading: '',
      unloadingText: '',
      total: 25000,
    },
  ]);

  // Emergency / Full Template Customization Fields (prefilled with permanent defaults)
  const [companyName, setCompanyName] = useState('SRI MALLIKARJUNA TRANSPORT');
  const [companyAddress, setCompanyAddress] = useState(
    '#8-8-130, Near Water Tank,\nMadhuban Colony, Kattedan\nRajendhra Nagar (M), R.R.Dist,\nHyderabad, 500077'
  );
  const [mobileNumbers, setMobileNumbers] = useState('9652444104, 9603040908');
  const [companyGst, setCompanyGst] = useState('36AMXPT6116D1ZM');
  const [companyEmail, setCompanyEmail] = useState('reddynarsimha404@gmail.com');

  const [customerName, setCustomerName] = useState('M/S. THE SUPREME INDUSTRIES LIMITED');
  const [customerAddress, setCustomerAddress] = useState(
    'JADCHERLA, PPD UNIT NO. 24,26, TO 40\n43 TO 45, 41P, 42P, 47P,48P, GREEN\nINDUSTRIEAL PARK\nMAHABUBNAGAR-509301'
  );
  const [customerGst, setCustomerGst] = useState('36AAACT1344F1ZP');

  const [bankAccountName, setBankAccountName] = useState('SRI MALLIKARJUNA TRANSPORT');
  const [bankAccountNumber, setBankAccountNumber] = useState('45306162224');
  const [bankName, setBankName] = useState('SBI');
  const [bankBranch, setBankBranch] = useState('JALPALLE ,HYDERBAD');
  const [bankIfsc, setBankIfsc] = useState('SBIN0018886');
  const [signatureText, setSignatureText] = useState('FOR SRI MALLIKARJUNA TRANSPORT');

  useEffect(() => {
    async function init() {
      try {
        const [settingsRes, nextNumRes] = await Promise.all([
          settingsApi.get(),
          invoiceApi.getNextNumber(),
        ]);
        if (settingsRes.success && settingsRes.settings) {
          const s = settingsRes.settings;
          if (s.businessName) setCompanyName(s.businessName);
          if (s.addressLines) setCompanyAddress(s.addressLines.join('\n'));
          if (s.mobileNumbers) setMobileNumbers(s.mobileNumbers);
          if (s.gstNumber) setCompanyGst(s.gstNumber);
          if (s.email) setCompanyEmail(s.email);

          if (s.defaultCustomer?.name) setCustomerName(s.defaultCustomer.name);
          if (s.defaultCustomer?.addressLines) setCustomerAddress(s.defaultCustomer.addressLines.join('\n'));
          if (s.defaultCustomer?.gstNumber) setCustomerGst(s.defaultCustomer.gstNumber);
          if (s.sacCode) setSacCode(s.sacCode);

          if (s.bankDetails) {
            if (s.bankDetails.accountName) setBankAccountName(s.bankDetails.accountName);
            if (s.bankDetails.accountNumber) setBankAccountNumber(s.bankDetails.accountNumber);
            if (s.bankDetails.bankName) setBankName(s.bankDetails.bankName);
            if (s.bankDetails.branch) setBankBranch(s.bankDetails.branch);
            if (s.bankDetails.ifscCode) setBankIfsc(s.bankDetails.ifscCode);
          }
          if (s.signatureText) setSignatureText(s.signatureText);
        }
        if (nextNumRes.nextInvoiceNumber) {
          setInvoiceNumber(String(nextNumRes.nextInvoiceNumber));
        }
      } catch (err) {
        console.error('Init error:', err);
      }
    }
    init();
  }, []);

  // Quick Preset Handlers
  const loadBill36Preset = () => {
    setInvoiceNumber('36');
    setInvoiceDate('06-11-2026');
    setRows([
      {
        sNo: 1,
        loadingDate: '03-11-2026',
        vehicleNumber: 'TS08UH0187',
        customerInvoiceNo: 'SPI/26-27/1802',
        from: 'Jadcherla',
        to: 'Sri city\nAP',
        freight: 25000,
        unloading: '',
        unloadingText: '',
        total: 25000,
      },
    ]);
  };

  const loadBill25Preset = () => {
    setInvoiceNumber('25');
    setInvoiceDate('16-09-2026');
    setRows([
      {
        sNo: 1,
        loadingDate: '09-09-2026',
        vehicleNumber: 'TS12UB6538',
        customerInvoiceNo: 'SPG26-27/144',
        from: 'ACPL',
        to: 'Jadcherla',
        freight: 5000,
        unloading: 'Nill',
        unloadingText: 'Nill',
        total: 5000,
      },
      {
        sNo: '',
        loadingDate: '',
        vehicleNumber: '',
        customerInvoiceNo: 'H005818',
        from: 'kotthur',
        to: '',
        freight: '',
        unloading: '',
        unloadingText: '',
        total: '',
      },
      {
        sNo: '',
        loadingDate: '',
        vehicleNumber: '',
        customerInvoiceNo: 'A124/26-27D-1589',
        from: '',
        to: '',
        freight: '',
        unloading: '',
        unloadingText: '',
        total: '',
      },
    ]);
  };

  const loadTwoVehiclesPreset = () => {
    setRows([
      {
        sNo: 1,
        loadingDate: invoiceDate,
        vehicleNumber: 'TS08UH0187',
        customerInvoiceNo: 'SPI/26-27/1802',
        from: 'Jadcherla',
        to: 'Sri city AP',
        freight: 15000,
        unloading: '',
        total: 15000,
      },
      {
        sNo: 2,
        loadingDate: invoiceDate,
        vehicleNumber: 'TS09AB1234',
        customerInvoiceNo: 'SPI/26-27/1803',
        from: 'Jadcherla',
        to: 'Hyderabad',
        freight: 10000,
        unloading: 500,
        total: 10500,
      },
    ]);
  };

  // Real-time Financial Calculations: Fixed GST at 18% (9% CGST + 9% SGST)
  let totalFreight = 0;
  let totalUnloading = 0;

  rows.forEach((r) => {
    const f = Number(r.freight) || 0;
    let u = 0;
    if (typeof r.unloading === 'number') {
      u = r.unloading;
    } else if (typeof r.unloading === 'string' && !isNaN(Number(r.unloading)) && r.unloading.trim() !== '') {
      u = Number(r.unloading);
    }
    totalFreight += f;
    totalUnloading += u;
  });

  const subTotal = totalFreight + totalUnloading;
  const cgstRate = 9;
  const sgstRate = 9;
  const cgstAmount = Math.round(subTotal * 0.09);
  const sgstAmount = Math.round(subTotal * 0.09);
  const grandTotal = subTotal + cgstAmount + sgstAmount;
  const amountInWords = numberToIndianWords(grandTotal);

  // Live preview invoice object matching master template
  const previewInvoice = {
    invoiceNumber: invoiceNumber || '36',
    invoiceDate: invoiceDate || '06-11-2026',
    sacCode: sacCode || '9966',
    customerDetails: {
      name: customerName,
      addressLines: customerAddress.split('\n').filter(Boolean),
      gstNumber: customerGst,
    },
    businessDetailsSnapshot: {
      businessName: companyName,
      addressLines: companyAddress.split('\n').filter(Boolean),
      mobileNumbers: mobileNumbers,
      email: companyEmail,
      gstNumber: companyGst,
      bankDetails: {
        accountName: bankAccountName,
        accountNumber: bankAccountNumber,
        bankName: bankName,
        branch: bankBranch,
        ifscCode: bankIfsc,
      },
      signatureText: signatureText,
    },
    entries: rows,
    totalFreight,
    totalUnloading,
    subTotal,
    hasGst: true,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    grandTotal,
    amountInWords,
  };

  const handleConfirmAndSave = async () => {
    const hasAtLeastOneVehicle = rows.some((r) => r.vehicleNumber && r.vehicleNumber.trim() !== '');
    if (!hasAtLeastOneVehicle) {
      setErrorMsg('Please enter at least one vehicle number in the table.');
      setMobileTab('form');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        invoiceNumber,
        invoiceDate,
        sacCode,
        customerDetails: previewInvoice.customerDetails,
        businessDetailsSnapshot: previewInvoice.businessDetailsSnapshot,
        entries: rows,
        hasGst: true,
        gstRate: 18,
      };

      const res = await invoiceApi.create(payload);
      if (res.success && res.invoice) {
        setSavedInvoice(res.invoice);
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (_) {}

        // Auto download PDF
        const downloadUrl = invoiceApi.getPdfUrl(res.invoice._id);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `Invoice_${res.invoice.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setErrorMsg(res.message || 'Failed to save bill.');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setErrorMsg(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetForNewBill = async () => {
    setSavedInvoice(null);
    try {
      const nextNumRes = await invoiceApi.getNextNumber();
      if (nextNumRes.nextInvoiceNumber) {
        setInvoiceNumber(String(nextNumRes.nextInvoiceNumber));
      }
    } catch (_) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Success Notification Bar */}
      {savedInvoice && (
        <div className="p-4 sm:p-5 bg-emerald-600 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
            <div>
              <h2 className="text-base sm:text-xl font-bold">Bill #{savedInvoice.invoiceNumber} Generated & Downloaded!</h2>
              <p className="text-emerald-100 text-xs">
                Total: ₹{savedInvoice.grandTotal.toLocaleString('en-IN')} (including 18% GST)
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
            <a
              href={invoiceApi.getPdfUrl(savedInvoice._id)}
              download={`Invoice_${savedInvoice.invoiceNumber}.pdf`}
              className="inline-flex items-center gap-1.5 bg-white text-emerald-950 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs shadow hover:bg-emerald-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 bg-emerald-800 text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs shadow hover:bg-emerald-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleResetForNewBill}
              className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs shadow hover:bg-amber-300 transition-colors"
            >
              <span>+ New Bill</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile-Only Segmented Switch: [ ✍️ Edit Form ] vs [ 📄 A4 Preview ] */}
      <div className="xl:hidden flex bg-slate-200/90 p-1 rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => setMobileTab('form')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'form'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Type & Edit Rows</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'preview'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>A4 Sheet Preview</span>
        </button>
      </div>

      {/* Main Grid: Left Editor & Right Live Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Form: Table Rows & Settings */}
        <div className={`xl:col-span-7 space-y-4 sm:space-y-5 ${mobileTab === 'preview' ? 'hidden xl:block' : 'block'}`}>
          {/* Top Quick Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 sm:pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800">
                  Type Transport Bill
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Fixed 8-row layout for A4 print.
                </p>
              </div>

              {/* Sample Presets */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold text-slate-400">Presets:</span>
                <button
                  type="button"
                  onClick={loadBill36Preset}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] sm:text-[11px] font-semibold transition-colors"
                >
                  Bill #36
                </button>
                <button
                  type="button"
                  onClick={loadBill25Preset}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] sm:text-[11px] font-semibold transition-colors"
                >
                  Bill #25
                </button>
                <button
                  type="button"
                  onClick={loadTwoVehiclesPreset}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] sm:text-[11px] font-semibold transition-colors"
                >
                  2 Vehicles
                </button>
              </div>
            </div>

            {/* Bill Meta Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Bill No
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full text-xs sm:text-sm font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="36"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Bill Date
                </label>
                <input
                  type="text"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  placeholder="06-11-2026"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  SAC Code
                </label>
                <input
                  type="text"
                  value={sacCode}
                  onChange={(e) => setSacCode(e.target.value)}
                  className="w-full text-xs sm:text-sm font-mono border border-slate-300 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="9966"
                />
              </div>
            </div>
          </div>

          {/* Interactive Multi-Row Table Editor */}
          <InvoiceRowsEditor rows={rows} onChangeRows={setRows} />

          {/* Financial Totals Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Summary (18% Fixed GST)
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                CGST 9% + SGST 9%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
              <div className="bg-slate-50 p-2 sm:p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-slate-500 text-[10px] sm:text-xs block">Freight Total</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">₹{totalFreight.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 p-2 sm:p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-slate-500 text-[10px] sm:text-xs block">Unloading Total</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">₹{totalUnloading.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-blue-50/70 p-2 sm:p-2.5 rounded-lg border border-blue-200/60 text-blue-900">
                <span className="text-blue-700 text-[10px] sm:text-xs block">CGST + SGST (18%)</span>
                <span className="text-xs sm:text-sm font-bold">₹{(cgstAmount + sgstAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-emerald-50 p-2 sm:p-2.5 rounded-lg border border-emerald-200 text-emerald-950">
                <span className="text-emerald-700 text-[10px] sm:text-xs font-semibold block">Grand Total</span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-700">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="text-[11px] sm:text-xs text-slate-600 bg-slate-50 p-2 sm:p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800">Rupess in Words:</span> {amountInWords}
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmAndSave}
              disabled={saving}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Bill PDF...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm & Generate Bill (Download PDF)</span>
                </>
              )}
            </button>
          </div>

          {/* Emergency / Full Template Customization (Collapsible) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Edit Company, Customer & Bank Details (Emergency Options)
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500">
                    Modify business address, customer or bank details if ever needed.
                  </span>
                </div>
              </div>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showAdvanced && (
              <div className="p-4 pt-0 border-t border-slate-100 space-y-4 text-xs">
                {/* Company Block */}
                <div className="space-y-2 pt-3">
                  <h4 className="font-bold text-slate-700">1. Transport Company Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-0.5">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5">Mobile Numbers</label>
                      <input
                        type="text"
                        value={mobileNumbers}
                        onChange={(e) => setMobileNumbers(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5">GST Number</label>
                      <input
                        type="text"
                        value={companyGst}
                        onChange={(e) => setCompanyGst(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5">Email</label>
                      <input
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 mb-0.5">Address (Lines separated by enter)</label>
                      <textarea
                        rows={3}
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Block */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-700">2. Customer / Consignee Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-0.5">Customer Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5">Customer GST Number</label>
                      <input
                        type="text"
                        value={customerGst}
                        onChange={(e) => setCustomerGst(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 mb-0.5">Customer Address</label>
                      <textarea
                        rows={3}
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Block */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-700">3. Bank & Signature Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-0.5">Account Name</label>
                      <input
                        type="text"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5">A/c Number</label>
                      <input
                        type="text"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5">Branch</label>
                      <input
                        type="text"
                        value={bankBranch}
                        onChange={(e) => setBankBranch(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5">IFSC Code</label>
                      <input
                        type="text"
                        value={bankIfsc}
                        onChange={(e) => setBankIfsc(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5">Signature Text</label>
                      <input
                        type="text"
                        value={signatureText}
                        onChange={(e) => setSignatureText(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Live A4 Master Invoice Preview */}
        <div className={`xl:col-span-5 space-y-3 sticky top-4 ${mobileTab === 'form' ? 'hidden xl:block' : 'block'}`}>
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Live A4 Sheet Preview
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              A4 Portrait • Fixed 8 Rows
            </span>
          </div>

          <div className="overflow-x-auto bg-slate-100 p-2 sm:p-4 rounded-2xl border border-slate-200 flex justify-center">
            <InvoiceTemplateView invoice={previewInvoice} />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar on Mobile for Instant Generation */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 px-4 flex items-center justify-between shadow-2xl z-30">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block leading-none">
            Total (18% GST)
          </span>
          <span className="text-base font-extrabold text-emerald-700">
            ₹{grandTotal.toLocaleString('en-IN')}
          </span>
        </div>

        <button
          type="button"
          onClick={handleConfirmAndSave}
          disabled={saving}
          className="bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          <span>Generate Bill</span>
        </button>
      </div>
    </div>
  );
}
