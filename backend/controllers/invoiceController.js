const Invoice = require('../models/Invoice');
const BusinessSettings = require('../models/BusinessSettings');
const Counter = require('../models/Counter');
const AuditHistory = require('../models/AuditHistory');
const { numberToIndianWords } = require('../services/numberToWords');
const { generateInvoicePdfBuffer, generateInvoiceHtml } = require('../services/pdfService');

// Get next sequential invoice number
async function getNextInvoiceNumberHelper() {
  const settings = await BusinessSettings.findOne();
  const startNum = settings?.startingInvoiceNumber || 36;

  let counter = await Counter.findOne({ id: 'invoiceNumber' });
  if (!counter) {
    // Find highest existing invoice number
    const highestInv = await Invoice.findOne().sort({ numericInvoiceNumber: -1 });
    const currentMax = highestInv?.numericInvoiceNumber || (startNum - 1);
    counter = await Counter.create({ id: 'invoiceNumber', seq: currentMax });
  }

  const updatedCounter = await Counter.findOneAndUpdate(
    { id: 'invoiceNumber' },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );

  return updatedCounter.seq;
}

// Calculate financial figures: Fixed GST at 18% (9% CGST + 9% SGST)
function calculateInvoiceFinancials(entries) {
  let totalFreight = 0;
  let totalUnloading = 0;

  const sanitizedEntries = (entries || []).map((e, index) => {
    let sNo = e.sNo;
    if (sNo === undefined || sNo === null) {
      sNo = index === 0 ? 1 : '';
    }

    const freightNum = Number(e.freight) || 0;
    const freightVal = e.freight !== undefined && e.freight !== null && e.freight !== '' ? freightNum : '';

    let unloadingNum = 0;
    let unloadingVal = '';
    if (typeof e.unloading === 'number') {
      unloadingNum = e.unloading;
      unloadingVal = e.unloading;
    } else if (typeof e.unloading === 'string' && e.unloading.trim() !== '') {
      if (!isNaN(Number(e.unloading))) {
        unloadingNum = Number(e.unloading);
        unloadingVal = unloadingNum;
      } else {
        unloadingVal = e.unloading.trim();
        unloadingNum = 0;
      }
    } else if (e.unloadingText) {
      unloadingVal = e.unloadingText;
    }

    let totalVal = '';
    if (typeof e.total === 'number' && e.total > 0) {
      totalVal = e.total;
    } else if (freightNum > 0 || unloadingNum > 0) {
      totalVal = freightNum + unloadingNum;
    } else if (e.total !== undefined && e.total !== null && e.total !== '') {
      totalVal = e.total;
    }

    totalFreight += freightNum;
    totalUnloading += unloadingNum;

    return {
      sNo,
      loadingDate: e.loadingDate || '',
      vehicleNumber: (e.vehicleNumber || '').toUpperCase().trim(),
      customerInvoiceNo: (e.customerInvoiceNo || '').trim(),
      from: (e.from || '').trim(),
      to: (e.to || '').trim(),
      freight: freightVal,
      unloading: unloadingVal,
      unloadingText: typeof unloadingVal === 'string' ? unloadingVal : '',
      total: totalVal,
    };
  });

  const subTotal = totalFreight + totalUnloading;
  const cgstRate = 9;
  const sgstRate = 9;
  const cgstAmount = Math.round(subTotal * 0.09);
  const sgstAmount = Math.round(subTotal * 0.09);
  const grandTotal = subTotal + cgstAmount + sgstAmount;
  const amountInWords = numberToIndianWords(grandTotal);

  return {
    entries: sanitizedEntries,
    totalFreight,
    totalUnloading,
    subTotal,
    hasGst: true,
    gstRate: 18,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    grandTotal,
    amountInWords,
  };
}

// Format DD-MM-YYYY to Date object
function parseDateStringToDate(dateStr) {
  if (!dateStr) return new Date();
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date();
}

// 1. Create Invoice
async function createInvoice(req, res) {
  try {
    const data = req.body;

    // Get current business settings for snapshot
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = await BusinessSettings.create({});
    }

    // Determine invoice number
    let invoiceNumber = data.invoiceNumber;
    let numericInvoiceNumber = null;

    if (!invoiceNumber) {
      const nextNum = await getNextInvoiceNumberHelper();
      invoiceNumber = String(nextNum);
      numericInvoiceNumber = nextNum;
    } else {
      invoiceNumber = String(invoiceNumber).trim();
      const parsedNum = parseInt(invoiceNumber, 10);
      if (!isNaN(parsedNum)) {
        numericInvoiceNumber = parsedNum;
        // Keep counter updated to at least this number
        await Counter.findOneAndUpdate(
          { id: 'invoiceNumber' },
          { $max: { seq: parsedNum } },
          { upsert: true }
        );
      }
    }

    // Check duplicate
    const existing = await Invoice.findOne({ invoiceNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Invoice number ${invoiceNumber} already exists. Please use a unique number.`,
      });
    }

    const financials = calculateInvoiceFinancials(data.entries);

    const invoiceDate = data.invoiceDate || new Date().toISOString().split('T')[0];
    const dateValue = parseDateStringToDate(invoiceDate);

    // Business details snapshot (supports emergency customization from frontend request)
    const businessDetailsSnapshot = {
      businessName: data.businessDetailsSnapshot?.businessName || settings.businessName || 'SRI MALLIKARJUNA TRANSPORT',
      addressLines: data.businessDetailsSnapshot?.addressLines?.length ? data.businessDetailsSnapshot.addressLines : settings.addressLines,
      mobileNumbers: data.businessDetailsSnapshot?.mobileNumbers || settings.mobileNumbers || '9652444104, 9603040908',
      email: data.businessDetailsSnapshot?.email || settings.email || 'reddynarsimha404@gmail.com',
      gstNumber: data.businessDetailsSnapshot?.gstNumber || settings.gstNumber || '36AMXPT6116D1ZM',
      bankDetails: {
        accountName: data.businessDetailsSnapshot?.bankDetails?.accountName || settings.bankDetails?.accountName || 'SRI MALLIKARJUNA TRANSPORT',
        accountNumber: data.businessDetailsSnapshot?.bankDetails?.accountNumber || settings.bankDetails?.accountNumber || '45306162224',
        bankName: data.businessDetailsSnapshot?.bankDetails?.bankName || settings.bankDetails?.bankName || 'SBI',
        branch: data.businessDetailsSnapshot?.bankDetails?.branch || settings.bankDetails?.branch || 'JALPALLE ,HYDERBAD',
        ifscCode: data.businessDetailsSnapshot?.bankDetails?.ifscCode || settings.bankDetails?.ifscCode || 'SBIN0018886',
      },
      signatureText: data.businessDetailsSnapshot?.signatureText || settings.signatureText || 'FOR SRI MALLIKARJUNA TRANSPORT',
    };

    const newInvoice = new Invoice({
      invoiceNumber,
      numericInvoiceNumber,
      invoiceDate,
      dateValue,
      sacCode: data.sacCode || settings.sacCode || '9966',
      customerDetails: {
        name: data.customerDetails?.name || settings.defaultCustomer?.name || 'M/S. THE SUPREME INDUSTRIES LIMITED',
        addressLines: data.customerDetails?.addressLines || settings.defaultCustomer?.addressLines || [],
        gstNumber: data.customerDetails?.gstNumber || settings.defaultCustomer?.gstNumber || '',
      },
      businessDetailsSnapshot,
      entries: financials.entries,
      totalFreight: financials.totalFreight,
      totalUnloading: financials.totalUnloading,
      subTotal: financials.subTotal,
      hasGst: financials.hasGst,
      gstRate: financials.gstRate,
      cgstRate: financials.cgstRate,
      cgstAmount: financials.cgstAmount,
      sgstRate: financials.sgstRate,
      sgstAmount: financials.sgstAmount,
      grandTotal: financials.grandTotal,
      amountInWords: financials.amountInWords,
      status: 'confirmed',
      notes: data.notes || '',
    });

    const savedInvoice = await newInvoice.save();

    // Log to audit history
    await AuditHistory.create({
      invoiceId: savedInvoice._id,
      invoiceNumber: savedInvoice.invoiceNumber,
      action: 'created',
      changes: savedInvoice.toObject(),
    });

    return res.status(201).json({
      success: true,
      message: 'Invoice created and saved successfully',
      invoice: savedInvoice,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Get All Invoices (with search and filters)
async function getAllInvoices(req, res) {
  try {
    const {
      search,
      vehicle,
      customer,
      fromCity,
      toCity,
      startDate,
      endDate,
      month,
      year,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Search query across invoiceNumber, vehicleNumber, customer name
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { invoiceNumber: regex },
        { 'customerDetails.name': regex },
        { 'entries.vehicleNumber': regex },
        { 'entries.from': regex },
        { 'entries.to': regex },
        { 'entries.customerInvoiceNo': regex },
      ];
    }

    if (vehicle && vehicle.trim() !== '') {
      query['entries.vehicleNumber'] = new RegExp(vehicle.trim(), 'i');
    }

    if (customer && customer.trim() !== '') {
      query['customerDetails.name'] = new RegExp(customer.trim(), 'i');
    }

    // Date filters
    if (startDate && endDate) {
      query.dateValue = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const totalCount = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1, numericInvoiceNumber: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return res.json({
      success: true,
      invoices,
      totalCount,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalCount / parseInt(limit, 10)),
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Get Single Invoice by ID or Number
async function getInvoiceById(req, res) {
  try {
    const { id } = req.params;
    let invoice = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      invoice = await Invoice.findById(id);
    }
    if (!invoice) {
      invoice = await Invoice.findOne({ invoiceNumber: id });
    }

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const auditHistory = await AuditHistory.find({ invoiceId: invoice._id }).sort({ timestamp: -1 });

    return res.json({
      success: true,
      invoice,
      auditHistory,
    });
  } catch (error) {
    console.error('Error getting invoice:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Update Invoice
async function updateInvoice(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const previousData = invoice.toObject();

    // Recalculate financials
    const financials = calculateInvoiceFinancials(
      data.entries !== undefined ? data.entries : invoice.entries
    );

    if (data.invoiceDate) {
      invoice.invoiceDate = data.invoiceDate;
      invoice.dateValue = parseDateStringToDate(data.invoiceDate);
    }

    if (data.customerDetails) {
      invoice.customerDetails = {
        name: data.customerDetails.name || invoice.customerDetails.name,
        addressLines: data.customerDetails.addressLines || invoice.customerDetails.addressLines,
        gstNumber: data.customerDetails.gstNumber !== undefined ? data.customerDetails.gstNumber : invoice.customerDetails.gstNumber,
      };
    }

    invoice.entries = financials.entries;
    invoice.totalFreight = financials.totalFreight;
    invoice.totalUnloading = financials.totalUnloading;
    invoice.subTotal = financials.subTotal;
    invoice.hasGst = financials.hasGst;
    invoice.gstRate = financials.gstRate;
    invoice.cgstRate = financials.cgstRate;
    invoice.cgstAmount = financials.cgstAmount;
    invoice.sgstRate = financials.sgstRate;
    invoice.sgstAmount = financials.sgstAmount;
    invoice.grandTotal = financials.grandTotal;
    invoice.amountInWords = financials.amountInWords;

    if (data.notes !== undefined) invoice.notes = data.notes;
    if (data.status) invoice.status = data.status;

    const updatedInvoice = await invoice.save();

    // Log audit
    await AuditHistory.create({
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      action: 'updated',
      changes: {
        previous: previousData,
        current: updatedInvoice.toObject(),
      },
    });

    return res.json({
      success: true,
      message: 'Invoice updated successfully',
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Delete Invoice
async function deleteInvoice(req, res) {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    await AuditHistory.create({
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      action: 'deleted',
      changes: invoice.toObject(),
    });

    await Invoice.findByIdAndDelete(id);

    return res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Generate and Download PDF
async function downloadPdf(req, res) {
  try {
    const { id } = req.params;
    let invoice = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      invoice = await Invoice.findById(id);
    }
    if (!invoice) {
      invoice = await Invoice.findOne({ invoiceNumber: id });
    }

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const pdfBuffer = await generateInvoicePdfBuffer(invoice.toObject());

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice_${invoice.invoiceNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate PDF: ' + error.message });
  }
}

// 7. Preview HTML
async function previewInvoiceHtml(req, res) {
  try {
    const { id } = req.params;
    let invoice = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      invoice = await Invoice.findById(id);
    }
    if (!invoice) {
      invoice = await Invoice.findOne({ invoiceNumber: id });
    }

    if (!invoice) {
      return res.status(404).send('Invoice not found');
    }

    const html = generateInvoiceHtml(invoice.toObject());
    res.set('Content-Type', 'text/html');
    return res.send(html);
  } catch (error) {
    return res.status(500).send('Error previewing invoice: ' + error.message);
  }
}

// 8. Get Next Invoice Number
async function getNextInvoiceNumber(req, res) {
  try {
    const settings = await BusinessSettings.findOne();
    const startNum = settings?.startingInvoiceNumber || 36;
    const counter = await Counter.findOne({ id: 'invoiceNumber' });
    const nextNum = counter ? counter.seq + 1 : startNum;
    return res.json({ success: true, nextInvoiceNumber: nextNum });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 9. Dashboard Statistics
async function getDashboardStats(req, res) {
  try {
    const totalInvoices = await Invoice.countDocuments();

    // Today's date in DD-MM-YYYY format
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const mon = String(today.getMonth() + 1).padStart(2, '0');
    const yr = today.getFullYear();
    const todayStr = `${day}-${mon}-${yr}`;

    const todayInvoices = await Invoice.countDocuments({ invoiceDate: todayStr });
    const latestInvoice = await Invoice.findOne().sort({ createdAt: -1 });

    // Recent 5 invoices
    const recentInvoices = await Invoice.find().sort({ createdAt: -1 }).limit(5);

    // Total revenue sum
    const totalRevenueResult = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    return res.json({
      success: true,
      stats: {
        totalInvoices,
        todayInvoices,
        totalRevenue,
        latestInvoice,
        recentInvoices,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  downloadPdf,
  previewInvoiceHtml,
  getNextInvoiceNumber,
  getDashboardStats,
  calculateInvoiceFinancials,
};
