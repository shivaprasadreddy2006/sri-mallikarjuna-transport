const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { generateInvoiceHtml } = require('../templates/invoiceHtml');

// Check possible Chrome / Edge / Chromium paths across Windows and Linux / Docker
function getChromeExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const possiblePaths = [
    // Windows paths
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    // Linux / Docker / Cloud paths
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

let browserInstance = null;

async function getBrowser() {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  const customPath = getChromeExecutablePath();
  const launchOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  };

  if (customPath) {
    launchOptions.executablePath = customPath;
  }

  try {
    browserInstance = await puppeteer.launch(launchOptions);
    return browserInstance;
  } catch (err) {
    console.warn(`[PDFService] Puppeteer launch with executablePath failed, retrying with default: ${err.message}`);
    delete launchOptions.executablePath;
    browserInstance = await puppeteer.launch(launchOptions);
    return browserInstance;
  }
}

async function generateInvoicePdfBuffer(invoiceData) {
  const html = generateInvoiceHtml(invoiceData);
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000,
    });

    // Generate exact A4 PDF with vertically centered invoice content
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm',
      },
    });

    return pdfBuffer;
  } finally {
    await page.close();
  }
}

module.exports = {
  generateInvoicePdfBuffer,
  generateInvoiceHtml,
};
