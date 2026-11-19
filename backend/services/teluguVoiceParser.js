/**
 * Telugu Voice & Natural Language Parser
 * Extracts structured transport billing data from Telugu and English voice transcripts.
 */

// Telugu digit mapping
const teluguDigits = {
  '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4',
  '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9'
};

// Telugu number word to value mapping
const teluguNumberWords = {
  'ఒకటి': 1, 'ఒక': 1, 'రెండు': 2, 'మూడు': 3, 'నాలుగు': 4,
  'ఐదు': 5, 'ఆరు': 6, 'ఏడు': 7, 'ఎనిమిది': 8, 'తొమ్మిది': 9,
  'పది': 10, 'పదకొండు': 11, 'పన్నెండు': 12, 'పదమూడు': 13, 'పద్నాలుగు': 14,
  'పదిహేను': 15, 'పదహారు': 16, 'పదిహేడు': 17, 'పద్దెనిమిది': 18, 'పంతొమ్మిది': 19,
  'ఇరవై': 20, 'ఇరవై ఐదు': 25, 'ముప్పై': 30, 'నలభై': 40, 'యాభై': 50,
  'అరవై': 60, 'డెబ్బై': 70, 'ఎనభై': 80, 'తొంభై': 90,
  'వంద': 100, 'నూరు': 100, 'ఐదు వందలు': 500,
  'వెయ్యి': 1000, 'వేయి': 1000, 'వేలు': 1000, 'వేల': 1000,
  'లక్ష': 100000, 'లక్షలు': 100000
};

// Common city / place transliterations
const teluguPlaces = {
  'వరంగల్': 'Warangal',
  'హైదరాబాద్': 'Hyderabad',
  'హైదరాబాదు': 'Hyderabad',
  'సికింద్రాబాద్': 'Secunderabad',
  'విజయవాడ': 'Vijayawada',
  'గుంటూరు': 'Guntur',
  'జాడ్చర్ల': 'Jadcherla',
  'జడ్చర్ల': 'Jadcherla',
  'శ్రీసిటీ': 'Sri city',
  'శ్రీ సిటీ': 'Sri city',
  'తిరుపతి': 'Tirupati',
  'కరీంనగర్': 'Karimnagar',
  'నిజామాబాద్': 'Nizamabad',
  'ఖమ్మం': 'Khammam',
  'మహబూబ్నగర్': 'Mahabubnagar',
  'మహబూబ్‌నగర్': 'Mahabubnagar',
  'బెంగళూరు': 'Bengaluru',
  'చెన్నై': 'Chennai',
  'కాటేదాన్': 'Kattedan',
  'కాటేదన్': 'Kattedan'
};

function normalizeTeluguText(text) {
  if (!text) return '';
  let str = text;
  // Replace Telugu digits with English digits
  for (const [t, d] of Object.entries(teluguDigits)) {
    str = str.replace(new RegExp(t, 'g'), d);
  }
  return str.trim();
}

function extractAllVehicles(text) {
  const norm = normalizeTeluguText(text);
  const vehicles = [];

  const engVehRegex = /\b([A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4})\b/gi;
  let match;
  while ((match = engVehRegex.exec(norm)) !== null) {
    const v = match[1].replace(/[\s-]/g, '').toUpperCase();
    if (!vehicles.includes(v)) vehicles.push(v);
  }

  const teluguVehRegex = /(టీఎస్|టిఎస్|ఏపీ|ఎపి|TS|AP)\s*([0-9]{1,2})\s*([A-Za-zఁ-౿]{1,4})?\s*([0-9]{4})/gi;
  while ((match = teluguVehRegex.exec(norm)) !== null) {
    let state = match[1].toUpperCase();
    if (state === 'టీఎస్' || state === 'టిఎస్') state = 'TS';
    if (state === 'ఏపీ' || state === 'ఎపి') state = 'AP';
    const num1 = match[2].padStart(2, '0');
    let series = (match[3] || '').toUpperCase().trim();
    if (series === 'యూహెచ్' || series === 'యుహెచ్') series = 'UH';
    if (series === 'ఏబి' || series === 'ఎబి') series = 'AB';
    const num2 = match[4];
    const v = `${state}${num1}${series}${num2}`;
    if (!vehicles.includes(v)) vehicles.push(v);
  }

  return vehicles;
}

function extractVehicleNumber(text) {
  const all = extractAllVehicles(text);
  return all.length > 0 ? all[0] : '';
}

function parseTeluguAmountWords(text) {
  let val = 0;
  // Check for phrases like "ఇరవై ఐదు వేలు" (25000), "పదిహేను వేలు" (15000), "పన్నెండు వేలు" (12000)
  if (/ఇరవై\s*ఐదు\s*(వేలు|వేల|వేయి)/i.test(text)) return 25000;
  if (/ఇరవై\s*(వేలు|వేల|వేయి)/i.test(text)) return 20000;
  if (/పదిహేను\s*(వేలు|వేల|వేయి)/i.test(text)) return 15000;
  if (/పద్నాలుగు\s*(వేలు|వేల|వేయి)/i.test(text)) return 14000;
  if (/పదమూడు\s*(వేలు|వేల|వేయి)/i.test(text)) return 13000;
  if (/పన్నెండు\s*(వేలు|వేల|వేయి)/i.test(text)) return 12000;
  if (/పదకొండు\s*(వేలు|వేల|వేయి)/i.test(text)) return 11000;
  if (/పది\s*(వేలు|వేల|వేయి)/i.test(text)) return 10000;
  if (/ముప్పై\s*(వేలు|వేల|వేయి)/i.test(text)) return 30000;
  if (/యాభై\s*(వేలు|వేల|వేయి)/i.test(text)) return 50000;
  if (/ఐదు\s*వందలు/i.test(text)) return 500;
  return val;
}

function extractAmounts(text) {
  const norm = normalizeTeluguText(text);
  let freight = 0;
  let unloading = 0;

  // Unloading pattern first
  const unloadingMatch = norm.match(/(?:అన్లోడింగ్|అన్\s*లోడింగ్|unloading|hamali|హమాలీ|ఛార్జెస్)[\s\w:]*?(\d{2,6})/i);
  if (unloadingMatch) {
    unloading = parseInt(unloadingMatch[1], 10);
  } else if (/అన్లోడింగ్[\s\w]*?ఐదు\s*వందలు/i.test(norm)) {
    unloading = 500;
  }

  // Freight pattern
  const freightMatch = norm.match(/(?:ఫ్రైట్|ఫ్రైట్|freight|కిరాయి|బాడిగ|అమౌంట్|మొత్తం)[\s\w:]*?(\d{3,7})/i);
  if (freightMatch) {
    freight = parseInt(freightMatch[1], 10);
  } else {
    // Check if word amount exists e.g. "ఇరవై ఐదు వేలు"
    const wordAmt = parseTeluguAmountWords(norm);
    if (wordAmt > 0) {
      freight = wordAmt;
    } else {
      // General standalone number > 1000
      const genMatch = norm.match(/\b(\d{4,6})\b/);
      if (genMatch && parseInt(genMatch[1], 10) !== unloading) {
        freight = parseInt(genMatch[1], 10);
      }
    }
  }

  return { freight, unloading };
}

function extractLocations(text) {
  let from = '';
  let to = '';

  // Patterns like: "<From> నుంచి <To> వరకు", "<From> నుండి <To> కి"
  const fromToRegex = /([\u0C00-\u0C7F\w\s]+?)\s*(?:నుంచి|నుండి|నుండీ|from)\s+([\u0C00-\u0C7F\w\s]+?)\s*(?:వరకు|కి|కు|to|\.|$)/i;
  const match = text.match(fromToRegex);
  if (match) {
    from = match[1].trim();
    to = match[2].trim();
  }

  // Check known places
  for (const [tel, eng] of Object.entries(teluguPlaces)) {
    if (from.includes(tel)) from = eng;
    if (to.includes(tel)) to = eng;
    if (!from && new RegExp(`${tel}\\s*(?:నుంచి|నుండి)`, 'i').test(text)) {
      from = eng;
    }
    if (!to && new RegExp(`${tel}\\s*(?:వరకు|కి|కు)`, 'i').test(text)) {
      to = eng;
    }
  }

  // Default fallback if Jadcherla -> Sri city
  if (!from && (/జాడ్చర్ల|జడ్చర్ల|jadcherla/i.test(text))) from = 'Jadcherla';
  if (!to && (/శ్రీసిటీ|శ్రీ సిటీ|sri city/i.test(text))) to = 'Sri city';

  return { from, to };
}

function extractDates(text) {
  const today = new Date();
  const format = (d) => {
    const day = String(d.getDate()).padStart(2, '0');
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    const yr = d.getFullYear();
    return `${day}-${mon}-${yr}`;
  };

  if (/ఈరోజు|today|నేడు/i.test(text)) {
    return format(today);
  }
  if (/నిన్న|yesterday/i.test(text)) {
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    return format(yest);
  }

  // Look for DD-MM-YYYY or DD/MM/YYYY
  const dateMatch = text.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dateMatch) {
    const d = String(dateMatch[1]).padStart(2, '0');
    const m = String(dateMatch[2]).padStart(2, '0');
    const y = dateMatch[3];
    return `${d}-${m}-${y}`;
  }

  return format(today);
}

function extractIntent(text) {
  const norm = text.toLowerCase();

  if (/డౌన్లోడ్|ప్రింట్|download|print/i.test(norm)) {
    return 'download_invoice';
  }
  if (/చూపించు|వెతుకు|లిస్ట్|ఓపెన్ చేయి|history|search|show|find|list/i.test(norm)) {
    return 'search_invoices';
  }
  if (/మార్చు|మార్పు|అప్డేట్|ఎడిట్|యాడ్ చేయి|ఇంకొక ఎంట్రీ|update|edit|modify|add entry/i.test(norm)) {
    return 'edit_invoice';
  }
  // Default is create_invoice
  return 'create_invoice';
}

function extractCustomerInvoiceNo(text, vehicleNo = '') {
  // e.g. SPI/26-27/1802 or INV-123
  const match = text.match(/\b([A-Z]{2,4}\/[0-9-]+\/[0-9]+)\b/i);
  if (match) return match[1].toUpperCase();

  const numMatch = text.match(/(?:ఇన్వాయిస్\s*నంబర్|కస్టమర్\s*ఇన్వాయిస్|invoice\s*no|lr\s*no|ఎల్ఆర్)\s*[:#-]?\s*([A-Za-z0-9/-]+)/i);
  if (numMatch) {
    const val = numMatch[1].toUpperCase().trim();
    if (val !== vehicleNo) return val;
  }

  return '';
}

function parseTeluguVoiceLocally(transcript) {
  if (!transcript || typeof transcript !== 'string') {
    return {
      intent: 'create_invoice',
      invoiceDate: extractDates(''),
      customerName: 'M/S. THE SUPREME INDUSTRIES LIMITED',
      entries: [],
      rawTranscript: transcript || '',
    };
  }

  const intent = extractIntent(transcript);
  const invoiceDate = extractDates(transcript);
  const allVehicles = extractAllVehicles(transcript);
  const vehicleNo = allVehicles.length > 0 ? allVehicles[0] : '';
  const { freight, unloading } = extractAmounts(transcript);
  const { from, to } = extractLocations(transcript);
  const customerInvoiceNo = extractCustomerInvoiceNo(transcript, vehicleNo);

  // Check invoice number for search/download/edit
  let targetInvoiceNumber = '';
  const billNoMatch = transcript.match(/(?:బిల్|ఇన్వాయిస్|bill|invoice)\s*(?:నంబర్|no)?\s*[:#-]?\s*(\d+)/i);
  if (billNoMatch) {
    targetInvoiceNumber = billNoMatch[1];
  }

  // Create entries: support multiple vehicles loaded at once
  const entries = [];
  if (allVehicles.length > 1) {
    allVehicles.forEach((veh, idx) => {
      entries.push({
        sNo: idx + 1,
        loadingDate: invoiceDate,
        vehicleNumber: veh,
        customerInvoiceNo: idx === 0 ? customerInvoiceNo : '',
        from: from || 'Jadcherla',
        to: to || 'Sri city',
        freight: freight || 0,
        unloading: idx === 0 ? unloading : 0,
        total: freight || 0,
      });
    });
  } else if (vehicleNo || freight > 0 || from || to) {
    entries.push({
      sNo: 1,
      loadingDate: invoiceDate,
      vehicleNumber: vehicleNo || '',
      customerInvoiceNo: customerInvoiceNo || '',
      from: from || '',
      to: to || '',
      freight: freight || 0,
      unloading: unloading || 0,
      total: (freight || 0) + (unloading || 0),
    });
  }

  return {
    intent,
    targetInvoiceNumber,
    invoiceDate,
    customerName: 'M/S. THE SUPREME INDUSTRIES LIMITED',
    entries,
    rawTranscript: transcript,
    parsedConfidence: 0.9,
    source: 'local_nlp_parser',
  };
}

module.exports = {
  parseTeluguVoiceLocally,
  extractVehicleNumber,
  extractAmounts,
  extractLocations,
  extractDates,
  extractIntent,
};
