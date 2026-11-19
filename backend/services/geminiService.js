const axios = require('axios');
const { parseTeluguVoiceLocally } = require('./teluguVoiceParser');

/**
 * Service to interpret Telugu / English voice instructions using Google Gemini API
 * with automatic fallback to local Telugu NLP rule-based parser.
 */
async function interpretVoiceInstruction(transcript) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.log('[AI Service] No Gemini API Key configured, using local Telugu NLP parser.');
    return parseTeluguVoiceLocally(transcript);
  }

  const prompt = `
You are an expert AI assistant for a transport business called "SRI MALLIKARJUNA TRANSPORT".
The business owner speaks in Telugu (or Telugu mixed with English).
Your task is to parse their spoken instructions into structured billing JSON.

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

Spoken Instruction:
"${transcript}"

Extract the following information:
1. "intent": One of "create_invoice", "edit_invoice", "search_invoices", "download_invoice"
2. "targetInvoiceNumber": If the user referenced an existing bill/invoice number (e.g., 36, 105), extract it here.
3. "invoiceDate": Date of invoice (DD-MM-YYYY format, defaults to today if "ఈరోజు" or unspecified).
4. "customerName": Customer name if mentioned, default to "M/S. THE SUPREME INDUSTRIES LIMITED" if transport is related to their standard route.
5. "entries": An array of billing entries. Each entry must have:
   - "loadingDate": DD-MM-YYYY format
   - "vehicleNumber": Standard vehicle number (e.g. "TS08UH0187", "TS09AB1234"). Ensure valid format without spaces.
   - "customerInvoiceNo": Any LR or customer invoice number mentioned (e.g. "SPI/26-27/1802")
   - "from": Origin city (e.g. "Jadcherla", "Warangal", "Hyderabad")
   - "to": Destination city (e.g. "Sri city", "Hyderabad", "Vijayawada")
   - "freight": Numeric freight amount in rupees (e.g. 25000, 15000)
   - "unloading": Numeric unloading charge in rupees (e.g. 500, 0)
   - "total": freight + unloading
6. "updateFields": If intent is "edit_invoice", specify which fields should be updated (e.g. { "freight": 15000 }).

CRITICAL RULES:
- Never invent missing vehicle numbers or amounts. If not specified, leave blank or 0.
- Convert Telugu place names to standard English (వరంగల్ -> Warangal, హైదరాబాద్ -> Hyderabad, జాడ్చర్ల -> Jadcherla, శ్రీసిటీ -> Sri city).
- Return ONLY valid JSON matching this structure. No markdown formatting, no code blocks, no explanation.
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      },
      { timeout: 15000 }
    );

    const candidates = response.data?.candidates;
    if (candidates && candidates.length > 0) {
      const text = candidates[0].content?.parts[0]?.text;
      if (text) {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        parsed.source = 'gemini_api';
        parsed.rawTranscript = transcript;
        return parsed;
      }
    }

    throw new Error('No valid content from Gemini API response');
  } catch (error) {
    console.warn(`[AI Service] Gemini API call failed (${error.message}). Falling back to local Telugu NLP parser.`);
    const fallbackResult = parseTeluguVoiceLocally(transcript);
    fallbackResult.source = 'local_nlp_fallback';
    fallbackResult.apiError = error.message;
    return fallbackResult;
  }
}

module.exports = {
  interpretVoiceInstruction,
};
