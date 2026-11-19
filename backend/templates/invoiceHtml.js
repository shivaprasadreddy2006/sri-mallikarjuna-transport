/**
 * Master Transport Invoice HTML Generator
 * Exactly reproduces the SRI MALLIKARJUNA TRANSPORT master bill template on an A4 sheet.
 * Fixed table height (always 8 body rows total) so A4 dimensions are permanently stable.
 */

function generateInvoiceHtml(invoice) {
  const {
    invoiceNumber = '25',
    invoiceDate = '16-09-2026',
    sacCode = '9966',
    customerDetails = {},
    businessDetailsSnapshot = {},
    entries = [],
    totalFreight = 5000,
    totalUnloading = 0,
    subTotal = 5000,
    hasGst = true,
    cgstRate = 9,
    cgstAmount = 450,
    sgstRate = 9,
    sgstAmount = 450,
    grandTotal = 5900,
    amountInWords = 'five thousand nine hundred only',
  } = invoice;

  // Business details (defaults to SRI MALLIKARJUNA TRANSPORT, with full emergency override support)
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

  // Process entries into grid rows
  // Each entry represents a row in the table (e.g. S.No 1, or sub-row with invoice number)
  const renderedGridRows = [];

  entries.forEach((item, idx) => {
    const sNo = item.sNo !== undefined && item.sNo !== null && item.sNo !== '' ? item.sNo : (idx === 0 ? 1 : '');
    const loadingDate = item.loadingDate || '';
    const vehicleNo = item.vehicleNumber || '';
    const invoiceNo = item.customerInvoiceNo || '';
    const from = item.from || '';
    const to = (item.to || '').replace(/[\n,]+/g, '<br/>');
    const freight = item.freight ? item.freight : '';
    
    let unloading = '';
    if (item.unloadingText !== undefined && item.unloadingText !== '') {
      unloading = item.unloadingText;
    } else if (item.unloading) {
      unloading = item.unloading;
    }

    const total = item.total ? item.total : '';

    renderedGridRows.push(`
      <tr class="item-row">
        <td class="col-sno">${sNo}</td>
        <td class="col-date">${loadingDate}</td>
        <td class="col-veh">${vehicleNo}</td>
        <td class="col-inv">${invoiceNo}</td>
        <td class="col-from">${from}</td>
        <td class="col-to">${to}</td>
        <td class="col-freight">${freight}</td>
        <td class="col-unloading">${unloading}</td>
        <td class="col-total">${total}</td>
      </tr>
    `);
  });

  // Table ALWAYS has 8 body rows total so table size NEVER changes
  const minRows = 8;
  const fillerRowCount = Math.max(0, minRows - renderedGridRows.length);

  for (let i = 0; i < fillerRowCount; i++) {
    renderedGridRows.push(`
      <tr class="filler-row">
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    `);
  }

  const formattedSubTotal = subTotal || totalFreight;
  const formattedCgst = cgstAmount || Math.round(formattedSubTotal * 0.09);
  const formattedSgst = sgstAmount || Math.round(formattedSubTotal * 0.09);
  const formattedGrandTotal = grandTotal || (formattedSubTotal + formattedCgst + formattedSgst);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${bizName} - Bill #${invoiceNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: Arial, "Helvetica Neue", Helvetica, "Liberation Sans", sans-serif;
      color: #000;
      background: #fff;
      font-size: 11px;
      line-height: 1.25;
    }
    .invoice-container {
      width: 170mm;
      max-width: 170mm;
      margin: 0 auto;
      background: #fff;
    }

    /* HEADER BLOCK */
    .header-block {
      text-align: center;
      margin-bottom: 2px;
    }
    .company-title {
      font-family: "Times New Roman", Times, Georgia, serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .address-wrapper {
      position: relative;
      display: block;
      width: 100%;
    }
    .company-address {
      font-size: 10.5px;
      line-height: 1.3;
      color: #000;
      text-align: center;
    }
    .mobile-box {
      position: absolute;
      right: 0;
      bottom: 0;
      text-align: right;
      font-size: 10.5px;
      line-height: 1.3;
    }
    .mobile-label {
      font-size: 10.5px;
      font-weight: 700;
    }
    .mobile-numbers {
      font-weight: 700;
      white-space: nowrap;
    }

    /* GST & EMAIL ROW */
    .gst-email-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      font-weight: 700;
      padding-top: 8px;
      padding-bottom: 3px;
      border-bottom: 1.5px solid #000;
      margin-bottom: 8px;
    }

    /* META AND CONSIGNEE */
    .meta-customer-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .meta-col {
      width: 44%;
      vertical-align: top;
      font-size: 11px;
    }
    .customer-col {
      width: 56%;
      vertical-align: top;
      font-size: 10.5px;
      padding-left: 15px;
      line-height: 1.35;
    }
    .tax-invoice-label {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .bill-no-row {
      margin-bottom: 22px;
      font-weight: 700;
    }
    .underline-field {
      border-bottom: 1.2px solid #000;
      display: inline-block;
      min-width: 150px;
      padding: 0 4px;
    }
    .date-row {
      font-weight: 700;
    }
    .to-label {
      font-weight: 600;
      margin-bottom: 2px;
    }
    .customer-name {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 11px;
    }
    .customer-gst {
      font-weight: 700;
      margin-top: 1px;
    }

    /* SAC CODE */
    .sac-code-row {
      text-align: center;
      font-weight: 700;
      font-size: 11.5px;
      margin-top: 6px;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }

    /* ITEM TABLE */
    .bill-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.2px solid #000;
      margin-bottom: 0px;
      table-layout: fixed;
    }
    .bill-table th,
    .bill-table td {
      border: 1px solid #000;
      padding: 3px 2px;
      font-size: 9.5px;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .bill-table th {
      font-weight: 700;
      text-align: center;
      font-size: 9.5px;
      text-transform: uppercase;
      line-height: 1.15;
      padding: 4px 1px;
      background-color: #fff;
    }
    .col-sno { width: 5%; text-align: center; }
    .col-date { width: 11%; text-align: center; }
    .col-veh { width: 14%; text-align: center; font-weight: 600; }
    .col-inv { width: 16%; text-align: center; font-size: 9px; line-height: 1.1; }
    .col-from { width: 11%; text-align: center; }
    .col-to { width: 11%; text-align: center; }
    .col-freight { width: 10%; text-align: center; font-weight: 600; }
    .col-unloading { width: 11%; text-align: center; }
    .col-total { width: 11%; text-align: center; font-weight: 700; }

    .item-row td {
      height: 20px;
    }
    .filler-row td {
      height: 18px;
    }

    /* SUMMARY TOTAL ROWS */
    .summary-label-col {
      text-align: left !important;
      font-size: 10px;
      padding-left: 6px !important;
    }
    .summary-val-col {
      text-align: center !important;
      font-weight: 600;
      font-size: 10px;
    }
    .grand-total-label {
      font-weight: 700 !important;
      font-size: 10.5px !important;
    }
    .grand-total-val {
      font-weight: 700 !important;
      font-size: 10.5px !important;
    }
    .blue-tax {
      color: #0b57d0 !important;
      font-weight: 700;
    }

    /* RUPEES BOX */
    .rupees-box {
      border-left: 1.2px solid #000;
      border-right: 1.2px solid #000;
      border-bottom: 1.2px solid #000;
      padding: 4px 6px;
      font-size: 10.5px;
      font-weight: 700;
      margin-bottom: 18px;
    }

    /* FOOTER / BANK & SIGNATURE */
    .footer-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .footer-table td {
      vertical-align: top;
    }
    .bank-col {
      width: 55%;
      font-size: 10.5px;
      line-height: 1.45;
    }
    .bank-row {
      display: flex;
      margin-bottom: 1px;
    }
    .bank-lbl {
      width: 95px;
      font-weight: 600;
    }
    .bank-val {
      font-weight: 700;
    }
    .signature-col {
      width: 45%;
      text-align: right;
      padding-top: 72px;
    }
    .signature-box {
      display: inline-block;
      text-align: center;
      min-width: 250px;
      border-top: 1.8px solid #000;
      padding-top: 4px;
    }
    .signature-title {
      font-weight: 700;
      font-size: 10.5px;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header Block -->
    <div class="header-block">
      <div class="company-title">${bizName}</div>
      <div class="address-wrapper">
        <div class="company-address">
          ${bizAddresses.map((line) => `<div>${line}</div>`).join('')}
        </div>
        <div class="mobile-box">
          <div class="mobile-label">MOBILE NO:</div>
          <div class="mobile-numbers">${bizMobiles}</div>
        </div>
      </div>
    </div>

    <!-- GST and Email Row with Divider Line -->
    <div class="gst-email-row">
      <div>GST NO: ${bizGst}</div>
      <div>Email: ${bizEmail}</div>
    </div>

    <!-- Meta and Consignee Section -->
    <table class="meta-customer-table">
      <tr>
        <td class="meta-col">
          <div class="tax-invoice-label">Tax Invoice:</div>
          <div class="bill-no-row">Bill NO : <span class="underline-field">${invoiceNumber}</span></div>
          <div class="date-row">DATE: <span class="underline-field">${invoiceDate}</span></div>
        </td>
        <td class="customer-col">
          <div class="to-label">To,</div>
          <div class="customer-name">${custName}</div>
          ${custAddresses.map((addr) => `<div>${addr}</div>`).join('')}
          <div class="customer-gst">GST NO: ${custGst}</div>
        </td>
      </tr>
    </table>

    <!-- SAC Code -->
    <div class="sac-code-row">SAC ${sacCode}</div>

    <!-- Main Item Table -->
    <table class="bill-table">
      <thead>
        <tr>
          <th class="col-sno">S.NO</th>
          <th class="col-date">LOADING<br/>DATE</th>
          <th class="col-veh">VEHICLE NO</th>
          <th class="col-inv">INVOICE NO</th>
          <th class="col-from">FROM</th>
          <th class="col-to">TO</th>
          <th class="col-freight">FRIGHT</th>
          <th class="col-unloading">UNLOADING<br/>CHARGE</th>
          <th class="col-total">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${renderedGridRows.join('')}
        
        <!-- Summary Totals -->
        <tr>
          <td colspan="7" rowspan="4" style="border-right: 1.2px solid #000;"></td>
          <td class="summary-label-col">total</td>
          <td class="summary-val-col">${formattedSubTotal}</td>
        </tr>
        <tr>
          <td class="summary-label-col blue-tax">CGST@9%</td>
          <td class="summary-val-col blue-tax">${formattedCgst}</td>
        </tr>
        <tr>
          <td class="summary-label-col blue-tax">SGST@9%</td>
          <td class="summary-val-col blue-tax">${formattedSgst}</td>
        </tr>
        <tr>
          <td class="summary-label-col grand-total-label">Grand Total</td>
          <td class="summary-val-col grand-total-val">${formattedGrandTotal}</td>
        </tr>
      </tbody>
    </table>

    <!-- Rupees Box -->
    <div class="rupees-box">
      Rupess: ${amountInWords}
    </div>

    <!-- Bank Details & Signature Section -->
    <table class="footer-table">
      <tr>
        <td class="bank-col">
          <div class="bank-row"><span class="bank-lbl">Account Name:</span><span class="bank-val">${bank.accountName}</span></div>
          <div class="bank-row"><span class="bank-lbl">A/c No:</span><span class="bank-val">${bank.accountNumber}</span></div>
          <div class="bank-row"><span class="bank-lbl">Bank Name:</span><span class="bank-val">${bank.bankName}</span></div>
          <div class="bank-row"><span class="bank-lbl">Branch</span><span class="bank-val">${bank.branch}</span></div>
          <div class="bank-row"><span class="bank-lbl">IFSC Code:</span><span class="bank-val">${bank.ifscCode}</span></div>
        </td>
        <td class="signature-col">
          <div class="signature-box">
            <div class="signature-title">${signatureText}</div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

module.exports = {
  generateInvoiceHtml,
};
