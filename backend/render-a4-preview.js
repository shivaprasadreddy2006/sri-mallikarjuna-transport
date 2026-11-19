const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { generateInvoiceHtml } = require('./templates/invoiceHtml');

async function renderBill25Preview() {
  const sample = {
    invoiceNumber: '25',
    invoiceDate: '16-09-2026',
    sacCode: '9966',
    customerDetails: {
      name: 'M/S. THE SUPREME INDUSTRIES LIMITED',
      addressLines: [
        'JADCHERLA, PPD UNIT NO. 24,26, TO 40',
        '43 TO 45, 41P, 42P, 47P,48P, GREEN',
        'INDUSTRIEAL PARK',
        'MAHABUBNAGAR-509301',
      ],
      gstNumber: '36AAACT1344F1ZP',
    },
    businessDetailsSnapshot: {
      businessName: 'SRI MALLIKARJUNA TRANSPORT',
      addressLines: [
        '#8-8-130, Near Water Tank,',
        'Madhuban Colony, Kattedan',
        'Rajendhra Nagar (M), R.R.Dist,',
        'Hyderabad, 500077',
      ],
      mobileNumbers: '9652444104, 9603040908',
      email: 'reddynarsimha404@gmail.com',
      gstNumber: '36AMXPT6116D1ZM',
      bankDetails: {
        accountName: 'SRI MALLIKARJUNA TRANSPORT',
        accountNumber: '45306162224',
        bankName: 'SBI',
        branch: 'JALPALLE ,HYDERBAD',
        ifscCode: 'SBIN0018886',
      },
      signatureText: 'FOR SRI MALLIKARJUNA TRANSPORT',
    },
    entries: [
      {
        sNo: 1,
        loadingDate: '09-09-2026',
        vehicleNumber: 'TS12UB6538',
        customerInvoiceNo: 'SPG26-27/144\nH005818\nA124/26-27D-1589',
        from: 'ACPL\nkotthur',
        to: 'Jadcherla',
        freight: 5000,
        unloading: 0,
        unloadingText: 'Nill',
        total: 5000,
      },
    ],
    totalFreight: 5000,
    totalUnloading: 0,
    unloadingText: 'Nill',
    subTotal: 5000,
    hasGst: true,
    cgstRate: 9,
    cgstAmount: 450,
    sgstRate: 9,
    sgstAmount: 450,
    grandTotal: 5900,
    amountInWords: 'five thousand nine hundred only',
  };

  const html = generateInvoiceHtml(sample);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Generate PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '22mm',
      bottom: '20mm',
      left: '20mm',
      right: '20mm',
    },
  });
  fs.writeFileSync(path.join(__dirname, 'test-bill-25.pdf'), pdfBuffer);

  const outPng = path.join(__dirname, 'bill-25-preview.png');
  await page.screenshot({
    path: outPng,
    clip: { x: 0, y: 0, width: 794, height: 1123 },
  });

  await browser.close();
  console.log('BILL_25_PREVIEW_GENERATED:', outPng);
}

renderBill25Preview().catch(console.error);
