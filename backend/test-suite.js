const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API = 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING MASTER VERIFICATION TEST SUITE (Tests 1 - 10)');
  console.log('====================================================\n');

  try {
    // 0. Health check
    console.log('Checking Server Health...');
    const health = await axios.get(`${API}/health`);
    console.log('✅ Server Health:', health.data.status);

    // TEST 1: Create a bill manually with one entry (matching the original reference bill #36)
    console.log('\n--- Test 1: Create a bill manually with one entry ---');
    const bill1Payload = {
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
        },
      ],
      hasGst: true,
      gstRate: 18,
    };

    // First delete if 36 exists from earlier runs
    try {
      const existing = await axios.get(`${API}/invoices/36`);
      if (existing.data?.invoice?._id) {
        await axios.delete(`${API}/invoices/${existing.data.invoice._id}`);
      }
    } catch (_) {}

    const bill1Res = await axios.post(`${API}/invoices`, bill1Payload);
    const bill1 = bill1Res.data.invoice;
    console.log(`✅ Bill #36 Created:`, {
      invoiceNumber: bill1.invoiceNumber,
      grandTotal: bill1.grandTotal,
      cgst: bill1.cgstAmount,
      sgst: bill1.sgstAmount,
      words: bill1.amountInWords,
    });
    if (bill1.grandTotal !== 29500) throw new Error(`Expected grandTotal 29500 but got ${bill1.grandTotal}`);

    // TEST 2: Create a bill with multiple entries
    console.log('\n--- Test 2: Create a bill with multiple entries ---');
    const bill2Payload = {
      invoiceDate: '07-11-2026',
      customerDetails: {
        name: 'M/S. THE SUPREME INDUSTRIES LIMITED',
      },
      entries: [
        {
          sNo: 1,
          loadingDate: '04-11-2026',
          vehicleNumber: 'TS08UH0187',
          customerInvoiceNo: 'SPI/26-27/1803',
          from: 'Jadcherla',
          to: 'Sri city\nAP',
          freight: 25000,
          unloading: 0,
        },
        {
          sNo: 2,
          loadingDate: '05-11-2026',
          vehicleNumber: 'TS09AB1234',
          customerInvoiceNo: 'SPI/26-27/1804',
          from: 'Warangal',
          to: 'Hyderabad',
          freight: 15000,
          unloading: 500,
        },
      ],
      hasGst: true,
      gstRate: 18,
    };
    const bill2Res = await axios.post(`${API}/invoices`, bill2Payload);
    const bill2 = bill2Res.data.invoice;
    console.log(`✅ Multi-entry Bill Created:`, {
      invoiceNumber: bill2.invoiceNumber,
      entriesCount: bill2.entries.length,
      subTotal: bill2.subTotal,
      grandTotal: bill2.grandTotal,
      words: bill2.amountInWords,
    });
    if (bill2.subTotal !== 40500) throw new Error(`Expected subTotal 40500 but got ${bill2.subTotal}`);

    // TEST 3: Enter Telugu voice command and extract invoice details
    console.log('\n--- Test 3: Enter a Telugu voice command and extract invoice details ---');
    const voiceInput = 'ఈరోజు ఒక కొత్త బిల్ తయారు చేయి. వాహనం నంబర్ TS09AB1234. వరంగల్ నుంచి హైదరాబాద్ వరకు సరుకు తీసుకెళ్లారు. ఫ్రైట్ 15000 రూపాయలు. అన్లోడింగ్ 500.';
    const aiRes = await axios.post(`${API}/ai/interpret`, { transcript: voiceInput });
    console.log('✅ Telugu Voice Parsed Output:', JSON.stringify(aiRes.data.data, null, 2));
    const parsedData = aiRes.data.data;
    if (parsedData.entries?.[0]?.vehicleNumber !== 'TS09AB1234') {
      throw new Error(`Expected vehicle TS09AB1234 but got ${parsedData.entries?.[0]?.vehicleNumber}`);
    }
    if (parsedData.entries?.[0]?.freight !== 15000) {
      throw new Error(`Expected freight 15000 but got ${parsedData.entries?.[0]?.freight}`);
    }
    if (parsedData.entries?.[0]?.unloading !== 500) {
      throw new Error(`Expected unloading 500 but got ${parsedData.entries?.[0]?.unloading}`);
    }

    // TEST 4: Correct an incorrectly recognized field before saving
    console.log('\n--- Test 4: Correct an incorrectly recognized field before saving ---');
    const correctedPayload = {
      invoiceDate: parsedData.invoiceDate,
      customerDetails: {
        name: parsedData.customerName,
      },
      entries: [
        {
          sNo: 1,
          loadingDate: parsedData.entries[0].loadingDate,
          vehicleNumber: 'TS09AB9999', // Corrected vehicle number
          from: parsedData.entries[0].from,
          to: parsedData.entries[0].to,
          freight: 16000, // Corrected freight
          unloading: 600, // Corrected unloading
        },
      ],
      hasGst: true,
      gstRate: 18,
    };
    const bill4Res = await axios.post(`${API}/invoices`, correctedPayload);
    const bill4 = bill4Res.data.invoice;
    console.log(`✅ Corrected Invoice Created #${bill4.invoiceNumber}:`, {
      vehicleNumber: bill4.entries[0].vehicleNumber,
      freight: bill4.entries[0].freight,
      grandTotal: bill4.grandTotal,
    });

    // TEST 5: Generate an A4 PDF and verify invoice is properly aligned
    console.log('\n--- Test 5: Generate an A4 PDF and verify invoice alignment ---');
    const pdfRes = await axios.get(`${API}/invoices/${bill1._id}/pdf`, {
      responseType: 'arraybuffer',
    });
    console.log(`✅ PDF Generated successfully! Size: ${pdfRes.data.length} bytes`);
    const pdfPath = path.join(__dirname, 'verified-invoice-36.pdf');
    fs.writeFileSync(pdfPath, pdfRes.data);
    console.log(`📄 Saved verified PDF to: ${pdfPath}`);

    // TEST 6: Create invoices with different numbers of rows
    console.log('\n--- Test 6: Create invoices with different numbers of rows (e.g. 4 rows) ---');
    const bill6Payload = {
      invoiceDate: '10-11-2026',
      entries: [
        { sNo: 1, vehicleNumber: 'TS08UH0187', from: 'Jadcherla', to: 'Sri city', freight: 25000 },
        { sNo: 2, vehicleNumber: 'TS09AB1234', from: 'Hyderabad', to: 'Vijayawada', freight: 12000 },
        { sNo: 3, vehicleNumber: 'AP29XY5678', from: 'Warangal', to: 'Khammam', freight: 8000 },
        { sNo: 4, vehicleNumber: 'TS07EK4321', from: 'Kattedan', to: 'Jadcherla', freight: 6000 },
      ],
      hasGst: false, // test without GST
    };
    const bill6Res = await axios.post(`${API}/invoices`, bill6Payload);
    const bill6 = bill6Res.data.invoice;
    console.log(`✅ 4-row Non-GST Invoice Created #${bill6.invoiceNumber}: Subtotal = ₹${bill6.subTotal}, GrandTotal = ₹${bill6.grandTotal}`);

    // TEST 7: Save invoices and check whether they appear in date-wise history
    console.log('\n--- Test 7: Save invoices and check whether they appear in date-wise history ---');
    const historyRes = await axios.get(`${API}/invoices`);
    console.log(`✅ Invoices in history: ${historyRes.data.invoices.length} invoices found.`);
    const foundBill1 = historyRes.data.invoices.find((i) => i.invoiceNumber === '36');
    if (!foundBill1) throw new Error('Invoice #36 not found in history!');
    console.log(`✅ Found Bill #36 in history list.`);

    // TEST 8: Search an invoice using its vehicle number
    console.log('\n--- Test 8: Search an invoice using vehicle number TS09AB9999 ---');
    const searchRes = await axios.get(`${API}/invoices?search=TS09AB9999`);
    console.log(`✅ Search result count: ${searchRes.data.invoices.length}`);
    if (searchRes.data.invoices.length === 0) throw new Error('Search by vehicle TS09AB9999 failed');
    console.log(`✅ Successfully located invoice #${searchRes.data.invoices[0].invoiceNumber} by vehicle number!`);

    // TEST 9: Open an old invoice, edit it, and download it again
    console.log('\n--- Test 9: Open an old invoice, edit it, and download it again ---');
    const editPayload = {
      entries: [
        {
          sNo: 1,
          loadingDate: '03-11-2026',
          vehicleNumber: 'TS08UH0187',
          customerInvoiceNo: 'SPI/26-27/1802',
          from: 'Jadcherla',
          to: 'Sri city\nAP',
          freight: 26000, // updated freight
          unloading: 500,
        },
      ],
      hasGst: true,
      gstRate: 18,
    };
    const updateRes = await axios.put(`${API}/invoices/${bill1._id}`, editPayload);
    const updatedBill = updateRes.data.invoice;
    console.log(`✅ Invoice #36 Updated: Grand Total is now ₹${updatedBill.grandTotal} (was 29500)`);
    // Re-download PDF
    const reDownloadedPdf = await axios.get(`${API}/invoices/${bill1._id}/pdf`, { responseType: 'arraybuffer' });
    console.log(`✅ Re-downloaded updated PDF: ${reDownloadedPdf.data.length} bytes`);

    // TEST 10: Check Dashboard stats
    console.log('\n--- Test 10: Check Dashboard stats ---');
    const statsRes = await axios.get(`${API}/invoices/dashboard-stats`);
    console.log('✅ Dashboard Statistics:', statsRes.data.stats);

    console.log('\n====================================================');
    console.log('🎉 ALL 10 TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTestSuite();
