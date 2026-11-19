import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, Building2, CreditCard, UserCheck, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { settingsApi } from '../services/api';

export default function Settings() {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [businessName, setBusinessName] = useState('SRI MALLIKARJUNA TRANSPORT');
  const [addressLines, setAddressLines] = useState([
    '#8-8-130, Near Water Tank,',
    'Madhuban Colony, Kattedan',
    'Rajendhra Nagar (M), R.R.Dist,',
    'Hyderabad, 500077',
  ]);
  const [mobileNumbers, setMobileNumbers] = useState('9652444104, 9603040908');
  const [email, setEmail] = useState('reddynarsimha404@gmail.com');
  const [gstNumber, setGstNumber] = useState('36AMXPT6116D1ZM');
  const [sacCode, setSacCode] = useState('9966');

  // Bank
  const [bankAccountName, setBankAccountName] = useState('SRI MALLIKARJUNA TRANSPORT');
  const [bankAccountNumber, setBankAccountNumber] = useState('45306162224');
  const [bankName, setBankName] = useState('SBI');
  const [bankBranch, setBankBranch] = useState('JALPALLE ,HYDERBAD');
  const [bankIfsc, setBankIfsc] = useState('SBIN0018886');
  const [signatureText, setSignatureText] = useState('FOR SRI MALLIKARJUNA TRANSPORT');

  // Customer Default
  const [defaultCustomerName, setDefaultCustomerName] = useState('M/S. THE SUPREME INDUSTRIES LIMITED');
  const [defaultCustomerAddress, setDefaultCustomerAddress] = useState([
    'JADCHERLA, PPD UNIT NO. 24,26, TO 40',
    '43 TO 45, 41P, 42P, 47P,48P, GREEN',
    'INDUSTRIEAL PARK',
    'MAHABUBNAGAR-509301',
  ]);
  const [defaultCustomerGst, setDefaultCustomerGst] = useState('36AAACT1344F1ZP');
  const [startingInvoiceNumber, setStartingInvoiceNumber] = useState(36);

  useEffect(() => {
    async function load() {
      try {
        const res = await settingsApi.get();
        if (res.success && res.settings) {
          const s = res.settings;
          setBusinessName(s.businessName || '');
          if (s.addressLines) setAddressLines(s.addressLines);
          setMobileNumbers(s.mobileNumbers || '');
          setEmail(s.email || '');
          setGstNumber(s.gstNumber || '');
          setSacCode(s.sacCode || '9966');

          if (s.bankDetails) {
            setBankAccountName(s.bankDetails.accountName || '');
            setBankAccountNumber(s.bankDetails.accountNumber || '');
            setBankName(s.bankDetails.bankName || '');
            setBankBranch(s.bankDetails.branch || '');
            setBankIfsc(s.bankDetails.ifscCode || '');
          }

          setSignatureText(s.signatureText || '');

          if (s.defaultCustomer) {
            setDefaultCustomerName(s.defaultCustomer.name || '');
            if (s.defaultCustomer.addressLines) setDefaultCustomerAddress(s.defaultCustomer.addressLines);
            setDefaultCustomerGst(s.defaultCustomer.gstNumber || '');
          }

          if (s.startingInvoiceNumber) setStartingInvoiceNumber(s.startingInvoiceNumber);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage('');

    try {
      const payload = {
        businessName,
        addressLines,
        mobileNumbers,
        email,
        gstNumber,
        sacCode,
        bankDetails: {
          accountName: bankAccountName,
          accountNumber: bankAccountNumber,
          bankName,
          branch: bankBranch,
          ifscCode: bankIfsc,
        },
        signatureText,
        defaultCustomer: {
          name: defaultCustomerName,
          addressLines: defaultCustomerAddress,
          gstNumber: defaultCustomerGst,
        },
        startingInvoiceNumber: Number(startingInvoiceNumber) || 36,
      };

      const res = await settingsApi.update(payload);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setErrorMessage(res.message || 'సెట్టింగ్స్ సేవ్ చేయడంలో విఫలమైంది.');
      }
    } catch (err) {
      console.error('Save settings error:', err);
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
          <p className="text-slate-600 font-semibold">సెట్టింగ్స్ లోడ్ అవుతున్నాయి...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {t.settings}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            ట్రాన్స్‌పోర్ట్ వ్యాపారం పేరు, చిరునామా, బ్యాంక్ వివరాలు మరియు డిఫాల్ట్ కస్టమర్ వివరాలు
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-lg transition-all text-sm disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>సేవ్ చేస్తున్నాము...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{t.saveSettings}</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">సెట్టింగ్స్ విజయవంతంగా భద్రపరచబడ్డాయి! కొత్త బిల్లుల్లో ఈ వివరాలు వస్తాయి.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 pb-3 border-b border-slate-100 font-black text-base">
            <Building2 className="w-5 h-5 text-amber-500" />
            <span>కంపెనీ వివరాలు (Company Header)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                ట్రాన్స్‌పోర్ట్ కంపెనీ పేరు
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                చిరునామా (లైన్ వారీగా)
              </label>
              <textarea
                rows={4}
                value={addressLines.join('\n')}
                onChange={(e) => setAddressLines(e.target.value.split('\n'))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                మొబైల్ నంబర్లు (Mobile Numbers)
              </label>
              <input
                type="text"
                value={mobileNumbers}
                onChange={(e) => setMobileNumbers(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                ఈమెయిల్ (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                కంపెనీ GST నంబర్
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 uppercase focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                SAC Code
              </label>
              <input
                type="text"
                value={sacCode}
                onChange={(e) => setSacCode(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 pb-3 border-b border-slate-100 font-black text-base">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <span>బ్యాంక్ ఖాతా వివరాలు (Bank Details)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                ఖాతాదారుని పేరు (Account Name)
              </label>
              <input
                type="text"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                ఖాతా సంఖ్య (Account Number)
              </label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                బ్యాంక్ పేరు (Bank Name)
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                బ్రాంచ్ (Branch)
              </label>
              <input
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={bankIfsc}
                onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 uppercase focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                సంతకం టెక్స్ట్ (Signature Title)
              </label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Default Customer Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 pb-3 border-b border-slate-100 font-black text-base">
            <UserCheck className="w-5 h-5 text-amber-500" />
            <span>ప్రధాన కస్టమర్ వివరాలు (Default Customer / Consignee)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                కస్టమర్ పేరు (M/S. ...)
              </label>
              <input
                type="text"
                value={defaultCustomerName}
                onChange={(e) => setDefaultCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                కస్టమర్ చిరునామా (Address)
              </label>
              <textarea
                rows={3}
                value={defaultCustomerAddress.join('\n')}
                onChange={(e) => setDefaultCustomerAddress(e.target.value.split('\n'))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                కస్టమర్ GST నంబర్
              </label>
              <input
                type="text"
                value={defaultCustomerGst}
                onChange={(e) => setDefaultCustomerGst(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 uppercase focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                ప్రారంభ బిల్ నంబర్ (Starting Bill No)
              </label>
              <input
                type="number"
                value={startingInvoiceNumber}
                onChange={(e) => setStartingInvoiceNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="text-right">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-xl transition-all text-base disabled:opacity-50"
          >
            {saving ? 'సేవ్ చేస్తున్నాము...' : t.saveSettings}
          </button>
        </div>
      </form>
    </div>
  );
}
