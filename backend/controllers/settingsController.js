const BusinessSettings = require('../models/BusinessSettings');

// Get current business settings or create default
async function getSettings(req, res) {
  try {
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = await BusinessSettings.create({
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
        sacCode: '9966',
        bankDetails: {
          accountName: 'SRI MALLIKARJUNA TRANSPORT',
          accountNumber: '45306162224',
          bankName: 'SBI',
          branch: 'JALPALLE ,HYDERBAD',
          ifscCode: 'SBIN0018886',
        },
        signatureText: 'FOR SRI MALLIKARJUNA TRANSPORT',
        defaultCustomer: {
          name: 'M/S. THE SUPREME INDUSTRIES LIMITED',
          addressLines: [
            'JADCHERLA, PPD UNIT NO. 24,26, TO 40',
            '43 TO 45, 41P, 42P, 47P,48P, GREEN',
            'INDUSTRIEAL PARK',
            'MAHABUBNAGAR-509301',
          ],
          gstNumber: '36AAACT1344F1ZP',
        },
        defaultGstRate: 18,
        startingInvoiceNumber: 36,
      });
    }
    return res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Update business settings
async function updateSettings(req, res) {
  try {
    const updateData = req.body;
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = new BusinessSettings(updateData);
    } else {
      Object.assign(settings, updateData);
    }
    await settings.save();
    return res.json({ success: true, message: 'Settings saved successfully', settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getSettings,
  updateSettings,
};
