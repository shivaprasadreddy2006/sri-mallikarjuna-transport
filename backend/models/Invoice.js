const mongoose = require('mongoose');

const InvoiceEntrySchema = new mongoose.Schema({
  sNo: { type: mongoose.Schema.Types.Mixed, default: '' },
  loadingDate: { type: String, default: '' },
  vehicleNumber: { type: String, default: '', trim: true, uppercase: true },
  customerInvoiceNo: { type: String, default: '', trim: true },
  from: { type: String, default: '', trim: true },
  to: { type: String, default: '', trim: true },
  freight: { type: mongoose.Schema.Types.Mixed, default: '' },
  unloading: { type: mongoose.Schema.Types.Mixed, default: '' },
  unloadingText: { type: String, default: '' },
  total: { type: mongoose.Schema.Types.Mixed, default: '' },
}, { _id: false });

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    numericInvoiceNumber: {
      type: Number,
      index: true,
    },
    invoiceDate: {
      type: String,
      required: true, // e.g. "06-11-2026"
    },
    dateValue: {
      type: Date,
      index: true,
    },
    sacCode: {
      type: String,
      default: '9966',
    },
    customerDetails: {
      name: { type: String, required: true, trim: true },
      addressLines: { type: [String], default: [] },
      gstNumber: { type: String, default: '', trim: true, uppercase: true },
    },
    businessDetailsSnapshot: {
      businessName: { type: String, required: true },
      addressLines: { type: [String], default: [] },
      mobileNumbers: { type: String, default: '' },
      email: { type: String, default: '' },
      gstNumber: { type: String, default: '' },
      bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        branch: String,
        ifscCode: String,
      },
      signatureText: { type: String, default: 'FOR SRI MALLIKARJUNA TRANSPORT' },
    },
    entries: [InvoiceEntrySchema],
    totalFreight: {
      type: Number,
      required: true,
      default: 0,
    },
    totalUnloading: {
      type: Number,
      default: 0,
    },
    subTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    hasGst: {
      type: Boolean,
      default: true,
    },
    gstRate: {
      type: Number,
      default: 18,
    },
    cgstRate: {
      type: Number,
      default: 9,
    },
    cgstAmount: {
      type: Number,
      default: 0,
    },
    sgstRate: {
      type: Number,
      default: 9,
    },
    sgstAmount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    amountInWords: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'draft', 'cancelled'],
      default: 'confirmed',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

InvoiceSchema.index({ 'entries.vehicleNumber': 1 });
InvoiceSchema.index({ 'customerDetails.name': 1 });
InvoiceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
