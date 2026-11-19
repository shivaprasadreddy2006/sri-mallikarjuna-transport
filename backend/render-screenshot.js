const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { generateInvoiceHtml } = require('./templates/invoiceHtml');

async function renderScreenshot() {
  const sample = {
    invoiceNumber: '36',
    invoiceDate: '06-11-2026',
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
        loadingDate: '03-11-2026',
        vehicleNumber: 'TS08UH0187',
        customerInvoiceNo: 'SPI/26-27/1802',
        from: 'Jadcherla',
        to: 'Sri city\nAP',
        freight: 25000,
        unloading: 0,
        total: 25000,
      },
    ],
    totalFreight: 25000,
    totalUnloading: 0,
    subTotal: 25000,
    hasGst: true,
    cgstRate: 9,
    cgstAmount: 2250,
    sgstRate: 9,
    sgstAmount: 2250,
    grandTotal: 29500,
    amountInWords: 'Twenty nine thousand five hundred only',
  };

  const html = generateInvoiceHtml(sample);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 850, height: 1200, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outPath = path.join(__dirname, 'invoice-preview.png');
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  console.log('SCREENSHOT_SAVED:', outPath);
}

renderScreenshot().catch((e) => {
  console.error(e);
  process.exit(1);
});
