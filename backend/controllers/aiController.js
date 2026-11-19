const { interpretVoiceInstruction } = require('../services/geminiService');
const { calculateInvoiceFinancials } = require('./invoiceController');
const BusinessSettings = require('../models/BusinessSettings');

// Interpret Telugu voice transcript or text
async function interpretTeluguVoice(req, res) {
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Transcript is required. దయచేసి మాట్లాడండి లేదా టెక్స్ట్ నమోదు చేయండి.',
      });
    }

    const interpretation = await interpretVoiceInstruction(transcript.trim());

    // Enrich entries with calculations if entries are present
    if (interpretation.entries && interpretation.entries.length > 0) {
      const settings = await BusinessSettings.findOne();
      const defaultGstRate = settings?.defaultGstRate || 18;

      const calc = calculateInvoiceFinancials(
        interpretation.entries,
        true,
        defaultGstRate
      );

      interpretation.calculatedTotals = {
        subTotal: calc.subTotal,
        cgstAmount: calc.cgstAmount,
        sgstAmount: calc.sgstAmount,
        grandTotal: calc.grandTotal,
        amountInWords: calc.amountInWords,
      };
    }

    return res.json({
      success: true,
      data: interpretation,
    });
  } catch (error) {
    console.error('Error interpreting voice instruction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to interpret voice instruction: ' + error.message,
    });
  }
}

module.exports = {
  interpretTeluguVoice,
};
