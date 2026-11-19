import React, { useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

export default function InvoiceTemplateView({ invoice }) {
  const [zoomFit, setZoomFit] = useState(true);
  if (!invoice) return null;

  const {
    invoiceNumber = '25',
    invoiceDate = '16-09-2026',
    sacCode = '9966',
    customerDetails = {},
    businessDetailsSnapshot = {},
    entries = [],
    totalFreight = 5000,
    totalUnloading = 0,
    unloadingText = '',
    subTotal = 5000,
    hasGst = true,
    cgstRate = 9,
    cgstAmount = 450,
    sgstRate = 9,
    sgstAmount = 450,
    grandTotal = 5900,
    amountInWords = 'five thousand nine hundred only',
  } = invoice;

  const bizName = businessDetailsSnapshot.businessName || 'SRI MALLIKARJUNA TRANSPORT';
  const bizAddresses = businessDetailsSnapshot.addressLines && businessDetailsSnapshot.addressLines.length > 0
    ? businessDetailsSnapshot.addressLines
    : [
        '#8-8-130, Near Water Tank,',
        'Madhuban Colony, Kattedan',
        'Rajendhra Nagar (M), R.R.Dist,',
        'Hyderabad, 500077',
      ];
  const bizMobiles = businessDetailsSnapshot.mobileNumbers || '9652444104, 9603040908';
  const bizEmail = businessDetailsSnapshot.email || 'reddynarsimha404@gmail.com';
  const bizGst = businessDetailsSnapshot.gstNumber || '36AMXPT6116D1ZM';

  const bank = businessDetailsSnapshot.bankDetails || {
    accountName: 'SRI MALLIKARJUNA TRANSPORT',
    accountNumber: '45306162224',
    bankName: 'SBI',
    branch: 'JALPALLE ,HYDERBAD',
    ifscCode: 'SBIN0018886',
  };
  const signatureText = businessDetailsSnapshot.signatureText || 'FOR SRI MALLIKARJUNA TRANSPORT';

  const custName = customerDetails.name || 'M/S. THE SUPREME INDUSTRIES LIMITED';
  const custAddresses = customerDetails.addressLines && customerDetails.addressLines.length > 0
    ? customerDetails.addressLines
    : [
        'JADCHERLA, PPD UNIT NO. 24,26, TO 40',
        '43 TO 45, 41P, 42P, 47P,48P, GREEN',
        'INDUSTRIEAL PARK',
        'MAHABUBNAGAR-509301',
      ];
  const custGst = customerDetails.gstNumber || '36AAACT1344F1ZP';

  // Render exactly the entries as table rows, then pad up to 8 total rows for fixed table height
  const renderedGridRows = [];

  entries.forEach((item, idx) => {
    const sNo = item.sNo !== undefined && item.sNo !== null && item.sNo !== '' ? item.sNo : (idx === 0 ? 1 : '');
    const loadingDate = item.loadingDate || '';
    const vehicleNo = item.vehicleNumber || '';
    const invoiceNo = item.customerInvoiceNo || '';
    const from = item.from || '';
    const to = item.to || '';
    const freight = item.freight !== undefined && item.freight !== null && item.freight !== '' ? item.freight : '';
    
    let unloading = '';
    if (item.unloadingText !== undefined && item.unloadingText !== '') {
      unloading = item.unloadingText;
    } else if (item.unloading !== undefined && item.unloading !== null && item.unloading !== '') {
      unloading = item.unloading;
    } else if (unloadingText) {
      unloading = unloadingText;
    }

    const total = item.total !== undefined && item.total !== null && item.total !== '' ? item.total : '';

    renderedGridRows.push(
      <tr key={`row-${idx}`} className="border-b border-black h-[22px] text-[9.5px]">
        <td className="border border-black px-1 py-0.5 text-center w-[5%]">{sNo}</td>
        <td className="border border-black px-1 py-0.5 text-center w-[11%]">{loadingDate}</td>
        <td className="border border-black px-1 py-0.5 text-center w-[14%] font-semibold">{vehicleNo}</td>
        <td className="border border-black px-1 py-0.5 text-center w-[16%] text-[9px] leading-tight break-all font-mono">
          {invoiceNo}
        </td>
        <td className="border border-black px-1 py-0.5 text-center w-[11%]">{from}</td>
        <td className="border border-black px-1 py-0.5 text-center w-[11%] leading-tight">
          {String(to).split(/[\n,]+/).map((line, lIdx) => (
            <div key={lIdx}>{line.trim()}</div>
          ))}
        </td>
        <td className="border border-black px-1 py-0.5 text-center w-[10%] font-semibold">{freight}</td>
        <td className="border border-black px-1 py-0.5 text-center w-[11%]">{unloading}</td>
        <td className="border border-black px-1 py-0.5 text-center w-[11%] font-bold">{total}</td>
      </tr>
    );
  });

  const minRows = 8;
  const fillerRowCount = Math.max(0, minRows - renderedGridRows.length);

  for (let i = 0; i < fillerRowCount; i++) {
    renderedGridRows.push(
      <tr key={`filler-${i}`} className="border-b border-black h-[22px] text-[9.5px]">
        <td className="border border-black p-0.5 text-center">&nbsp;</td>
        <td className="border border-black p-0.5 text-center">&nbsp;</td>
        <td className="border border-black p-0.5 text-center">&nbsp;</td>
        <td className="border border-black p-0.5 text-center">&nbsp;</td>
        <td className="border border-black p-0.5 text-center">&nbsp;</td>
        <td className="border border-black p-0.5 text-center">&nbsp;</td>
        <td className="border border-black p-0.5 text-center">&nbsp;</td>
        <td className="border border-black p-0.5 text-center">&nbsp;</td>
        <td className="border border-black p-0.5 text-center">&nbsp;</td>
      </tr>
    );
  }

  const formattedSubTotal = subTotal || (totalFreight + totalUnloading);
  const formattedCgst = cgstAmount || 0;
  const formattedSgst = sgstAmount || 0;
  const formattedGrandTotal = grandTotal || 0;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Mobile-only Zoom Toggle */}
      <div className="sm:hidden flex justify-end w-full mb-1.5 px-1">
        <button
          type="button"
          onClick={() => setZoomFit(!zoomFit)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 px-2.5 py-1 rounded-lg transition-colors shadow-xs"
        >
          {zoomFit ? (
            <>
              <ZoomIn className="w-3 h-3 text-slate-600" />
              <span>Full Size (100%)</span>
            </>
          ) : (
            <>
              <ZoomOut className="w-3 h-3 text-slate-600" />
              <span>Fit Phone Screen</span>
            </>
          )}
        </button>
      </div>

      <div className="w-full overflow-x-auto pb-2 flex justify-center">
        <div
          className={`w-[670px] min-w-[670px] bg-white text-black p-6 sm:p-8 shadow-xl border border-slate-300 font-sans print:shadow-none print:border-none print:p-0 print:w-full print:min-w-0 text-[11px] leading-snug transition-transform origin-top ${
            zoomFit ? 'scale-[0.52] sm:scale-100 -mb-[280px] sm:mb-0' : 'scale-100 mb-0'
          }`}
        >
      {/* Header Block */}
      <div className="text-center mb-1">
        <h1
          className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-black mb-1"
          style={{ fontFamily: 'Times New Roman, Times, Georgia, serif' }}
        >
          {bizName}
        </h1>

        <div className="relative inline-block w-full">
          <div className="text-[10.5px] text-neutral-900 leading-tight">
            {bizAddresses.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>

          <div className="sm:absolute sm:right-0 sm:bottom-0 text-right mt-1 sm:mt-0">
            <div className="text-[10.5px] font-bold text-black tracking-wide">MOBILE NO:</div>
            <div className="text-[10.5px] font-bold text-neutral-900 leading-tight">
              {bizMobiles}
            </div>
          </div>
        </div>
      </div>

      {/* GST and Email Row with Border */}
      <div className="flex justify-between items-end text-[11px] font-bold border-b border-black pb-1 mb-2.5 pt-1.5">
        <div>GST NO: {bizGst}</div>
        <div>Email: {bizEmail}</div>
      </div>

      {/* Meta and Consignee Information */}
      <div className="grid grid-cols-12 gap-3 text-[11px] mb-2">
        <div className="col-span-5 space-y-3.5">
          <div className="font-semibold text-neutral-900">Tax Invoice:</div>
          <div className="font-bold flex items-center gap-1.5">
            <span>Bill NO :</span>
            <span className="border-b border-black inline-block min-w-[110px] px-1 font-bold text-neutral-950">
              {invoiceNumber}
            </span>
          </div>
          <div className="font-bold flex items-center gap-1.5">
            <span>DATE:</span>
            <span className="border-b border-black inline-block min-w-[110px] px-1 font-bold text-neutral-950">
              {invoiceDate}
            </span>
          </div>
        </div>

        <div className="col-span-7 pl-2 sm:pl-3 leading-snug text-[10.5px]">
          <div className="font-semibold">To,</div>
          <div className="font-bold uppercase text-black text-[11px]">{custName}</div>
          {custAddresses.map((addr, idx) => (
            <div key={idx} className="text-neutral-900">{addr}</div>
          ))}
          <div className="font-bold mt-0.5">GST NO: {custGst}</div>
        </div>
      </div>

      {/* SAC Code */}
      <div className="text-center font-bold text-xs my-1.5 tracking-wide text-neutral-950">
        SAC {sacCode}
      </div>

      {/* Item Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse border border-black text-center text-[9.5px]">
          <thead>
            <tr className="border-b border-black font-bold uppercase text-[9.5px] leading-tight">
              <th className="border border-black p-1 w-[5%]">S.NO</th>
              <th className="border border-black p-1 w-[11%]">LOADING<br />DATE</th>
              <th className="border border-black p-1 w-[14%]">VEHICLE NO</th>
              <th className="border border-black p-1 w-[16%]">INVOICE NO</th>
              <th className="border border-black p-1 w-[11%]">FROM</th>
              <th className="border border-black p-1 w-[11%]">TO</th>
              <th className="border border-black p-1 w-[10%]">FRIGHT</th>
              <th className="border border-black p-1 w-[11%]">UNLOADING<br />CHARGE</th>
              <th className="border border-black p-1 w-[11%]">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {renderedGridRows}

            {/* Summary Totals */}
            <tr>
              <td colSpan={7} rowSpan={hasGst ? 4 : 1} className="border-r border-black"></td>
              <td className="border border-black p-1 text-left pl-2.5 text-[10px] font-medium">total</td>
              <td className="border border-black p-1 font-semibold text-[10px]">{formattedSubTotal}</td>
            </tr>

            {hasGst ? (
              <>
                <tr>
                  <td className="border border-black p-1 text-left pl-2.5 text-[10px] font-bold text-blue-700">
                    CGST@{cgstRate}%
                  </td>
                  <td className="border border-black p-1 font-bold text-[10px] text-blue-700">
                    {formattedCgst}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-left pl-2.5 text-[10px] font-bold text-blue-700">
                    SGST@{sgstRate}%
                  </td>
                  <td className="border border-black p-1 font-bold text-[10px] text-blue-700">
                    {formattedSgst}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-left pl-2.5 text-[10px] font-bold text-black">
                    Grand Total
                  </td>
                  <td className="border border-black p-1 font-bold text-[10px] text-black">
                    {formattedGrandTotal}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan={7} className="border-r border-black"></td>
                <td className="border border-black p-1 text-left pl-2.5 text-[10px] font-bold text-black">
                  Grand Total
                </td>
                <td className="border border-black p-1 font-bold text-[10px] text-black">
                  {formattedGrandTotal}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Rupees in Words Box */}
      <div className="border-x border-b border-black p-1.5 font-bold text-[10.5px] text-neutral-950 mb-4">
        Rupess: {amountInWords}
      </div>

      {/* Footer / Bank Details & Signature */}
      <div className="grid grid-cols-12 gap-3 text-[10.5px] mt-2 items-end">
        <div className="col-span-7 space-y-0.5 text-neutral-900 leading-tight">
          <div className="flex">
            <span className="w-24 font-semibold">Account Name:</span>
            <span className="font-bold">{bank.accountName}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-semibold">A/c No:</span>
            <span className="font-bold">{bank.accountNumber}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-semibold">Bank Name:</span>
            <span className="font-bold">{bank.bankName}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-semibold">Branch</span>
            <span className="font-bold">{bank.branch}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-semibold">IFSC Code:</span>
            <span className="font-bold">{bank.ifscCode}</span>
          </div>
        </div>

        <div className="col-span-5 text-center pt-8">
          <div className="border-t-2 border-black inline-block min-w-[210px] pt-1">
            <div className="font-bold text-[10.5px] tracking-wider uppercase text-black">
              {signatureText}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
);
}
