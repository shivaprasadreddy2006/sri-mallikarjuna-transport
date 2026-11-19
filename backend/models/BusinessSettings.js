const mongoose = require('mongoose');

const BusinessSettingsSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      default: 'SRI MALLIKARJUNA TRANSPORT',
    },
    addressLines: {
      type: [String],
      default: [
        '#8-8-130, Near Water Tank,',
        'Madhuban Colony, Kattedan',
        'Rajendhra Nagar (M), R.R.Dist,',
        'Hyderabad, 500077',
      ],
    },
    mobileNumbers: {
      type: String,
      default: '9652444104, 9603040908',
    },
    email: {
      type: String,
      default: 'reddynarsimha404@gmail.com',
    },
    gstNumber: {
      type: String,
      default: '36AMXPT6116D1ZM',
    },
    sacCode: {
      type: String,
      default: '9966',
    },
    bankDetails: {
      accountName: { type: String, default: 'SRI MALLIKARJUNA TRANSPORT' },
      accountNumber: { type: String, default: '45306162224' },
      bankName: { type: String, default: 'SBI' },
      branch: { type: String, default: 'JALPALLE ,HYDERBAD' },
      ifscCode: { type: String, default: 'SBIN0018886' },
    },
    signatureText: {
      type: String,
      default: 'FOR SRI MALLIKARJUNA TRANSPORT',
    },
    defaultCustomer: {
      name: { type: String, default: 'M/S. THE SUPREME INDUSTRIES LIMITED' },
      addressLines: {
        type: [String],
        default: [
          'JADCHERLA, PPD UNIT NO. 24,26, TO 40',
          '43 TO 45, 41P, 42P, 47P,48P, GREEN',
          'INDUSTRIEAL PARK',
          'MAHABUBNAGAR-509301',
        ],
      },
      gstNumber: { type: String, default: '36AAACT1344F1ZP' },
    },
    defaultGstRate: {
      type: Number,
      default: 18, // 9% CGST + 9% SGST
    },
    startingInvoiceNumber: {
      type: Number,
      default: 36,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BusinessSettings', BusinessSettingsSchema);
