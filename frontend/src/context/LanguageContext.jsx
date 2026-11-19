import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    appTitle: 'Sri Mallikarjuna Transport',
    appSubtitle: 'Smart Transport Billing System',
    langToggle: 'తెలుగు లోకి మార్చండి',
    dashboard: 'Dashboard',
    createBill: 'Create Bill',
    voiceBill: 'Voice Billing',
    history: 'Previous Bills',
    settings: 'Business Settings',
    logout: 'Logout',
    todayBills: "Today's Bills",
    totalBills: 'Total Bills',
    totalRevenue: 'Total Turnover',
    latestBill: 'Latest Bill',
    speakToCreate: 'Speak to Create Bill',
    speakSubtitle: 'Tap mic and speak in Telugu (e.g. వాహనం నంబర్, వరంగల్ నుంచి హైదరాబాద్, ఫ్రైట్ 15000)',
    manualCreate: 'Create Bill Manually',
    manualSubtitle: 'Type invoice details manually using simple form',
    viewHistory: 'Previous Bills History',
    historySubtitle: 'Search, view, re-download, or edit past transport bills',
    manageSettings: 'Business Settings',
    settingsSubtitle: 'Update transport company name, address, GST, and bank account',
    recentBills: 'Recent Bills',
    noRecentBills: 'No bills created yet. Tap "Speak to Create Bill" to start!',
    viewAll: 'View All',
    searchPlaceholder: 'Search by Vehicle (TS08...), Bill No, Customer, City...',
    date: 'Date',
    billNo: 'Bill No',
    customer: 'Customer',
    vehicleNo: 'Vehicle No',
    route: 'Route',
    freight: 'Freight',
    unloading: 'Unloading',
    total: 'Total',
    actions: 'Actions',
    downloadPdf: 'Download PDF',
    printBill: 'Print Bill',
    editBill: 'Edit Bill',
    deleteBill: 'Delete',
    confirmDelete: 'Are you sure you want to delete this bill?',
    saveSuccess: 'Bill saved successfully!',
    listening: 'Listening... Please speak in Telugu',
    tapToSpeak: 'Tap to Speak',
    tapToStop: 'Stop Listening',
    speechNotSupported: 'Speech recognition is not supported in this browser. Please use Google Chrome or type text below.',
    confirmAndSave: 'Confirm & Save Bill',
    cancel: 'Cancel',
    saveSettings: 'Save Settings',
    addEntry: '+ Add Another Vehicle / Entry',
    removeEntry: 'Remove',
    loadingDate: 'Loading Date',
    fromLocation: 'From (రవాణా మొదలు)',
    toLocation: 'To (చేరాల్సిన ప్రదేశం)',
    customerInvoiceNo: 'Customer Inv / LR No',
    subTotal: 'Sub Total',
    applyGst: 'Apply 18% GST (CGST 9% + SGST 9%)',
    cgst: 'CGST (9%)',
    sgst: 'SGST (9%)',
    grandTotal: 'Grand Total (మొత్తం)',
    amountInWords: 'Amount in Words',
    previewTitle: 'Master Invoice Preview (అసలు బిల్ డిజైన్)',
    saveChanges: 'Save Changes',
    back: 'Back',
    allTime: 'All Time',
    today: 'Today',
    thisMonth: 'This Month',
    resetFilter: 'Reset Filters',
    filterByDate: 'Filter by Date',
  },
  te: {
    appTitle: 'శ్రీ మల్లికార్జున ట్రాన్స్‌పోర్ట్',
    appSubtitle: 'స్మార్ట్ వాయిస్ బిల్లింగ్ సిస్టమ్',
    langToggle: 'Switch to English',
    dashboard: 'హోమ్ పేజీ',
    createBill: 'కొత్త బిల్',
    voiceBill: 'వాయిస్ బిల్లింగ్',
    history: 'పాత బిల్లులు',
    settings: 'బిజినెస్ సెట్టింగ్స్',
    logout: 'లాగౌట్',
    todayBills: 'ఈరోజు బిల్లులు',
    totalBills: 'మొత్తం బిల్లులు',
    totalRevenue: 'మొత్తం టర్నోవర్',
    latestBill: 'చివరి బిల్లు',
    speakToCreate: 'మాట్లాడి బిల్ చేయండి',
    speakSubtitle: 'మైక్ నొక్కి తెలుగులో చెప్పండి (ఉదా: వాహనం నంబర్, రూట్, ఫ్రైట్ అమౌంట్)',
    manualCreate: 'నేరుగా బిల్ రాయండి',
    manualSubtitle: 'ఫారమ్ ఉపయోగించి వివరాలు నమోదు చేయండి',
    viewHistory: 'పాత బిల్లుల చరిత్ర',
    historySubtitle: 'పాత బిల్లులు వెతకండి, చూడండి లేదా PDF డౌన్‌లోడ్ చేసుకోండి',
    manageSettings: 'బిజినెస్ సెట్టింగ్స్',
    settingsSubtitle: 'కంపెనీ పేరు, చిరునామా, బ్యాంక్ వివరాలు మార్చుకోండి',
    recentBills: 'ఇటీవలి బిల్లులు',
    noRecentBills: 'ఇంకా బిల్లులు లేవు. మొదట ఒక బిల్ చేయండి!',
    viewAll: 'అన్నీ చూడండి',
    searchPlaceholder: 'వాహనం నంబర్ (TS08...), బిల్ నంబర్, కంపెనీ పేరుతో వెతకండి...',
    date: 'తేదీ',
    billNo: 'బిల్ నంబర్',
    customer: 'కస్టమర్ పేరు',
    vehicleNo: 'వాహనం నంబర్',
    route: 'రూట్ (From - To)',
    freight: 'ఫ్రైట్ (రూ.)',
    unloading: 'అన్లోడింగ్ ఛార్జీ',
    total: 'మొత్తం',
    actions: 'చర్యలు',
    downloadPdf: 'PDF డౌన్‌లోడ్',
    printBill: 'ప్రింట్ చేయి',
    editBill: 'సవరించు (Edit)',
    deleteBill: 'తొలగించు',
    confirmDelete: 'మీరు ఖచ్చితంగా ఈ బిల్లును తొలగించాలనుకుంటున్నారా?',
    saveSuccess: 'బిల్లు విజయవంతంగా భద్రపరచబడింది!',
    listening: 'వింటున్నాము... దయచేసి తెలుగులో మాట్లాడండి',
    tapToSpeak: 'మైక్ నొక్కి మాట్లాడండి',
    tapToStop: 'ఆపండి',
    speechNotSupported: 'మీ బ్రౌజర్‌లో మైక్రోఫోన్ వాయిస్ అందుబాటులో లేదు. దయచేసి కింద టెక్స్ట్ రాయండి.',
    confirmAndSave: 'ఖరారు చేసి భద్రపరచు (Save Bill)',
    cancel: 'రద్దు చేయి',
    saveSettings: 'సెట్టింగ్స్ సేవ్ చేయి',
    addEntry: '+ ఇంకొక వాహనం / ఎంట్రీ జోడించు',
    removeEntry: 'తీసివేయి',
    loadingDate: 'లోడింగ్ తేదీ',
    fromLocation: 'నుంచి (From)',
    toLocation: 'వరకు (To)',
    customerInvoiceNo: 'ఇన్వాయిస్ / LR నంబర్',
    subTotal: 'సబ్ టోటల్',
    applyGst: '18% GST వర్తింపు (CGST 9% + SGST 9%)',
    cgst: 'CGST (9%)',
    sgst: 'SGST (9%)',
    grandTotal: 'మొత్తం సొమ్ము (Grand Total)',
    amountInWords: 'అక్షరాలలో మొత్తం',
    previewTitle: 'అసలు బిల్ డిజైన్ ప్రివ్యూ (Master Invoice)',
    saveChanges: 'మార్పులు భద్రపరచు',
    back: 'వెనక్కి వెళ్ళు',
    allTime: 'అన్ని తేదీలు',
    today: 'ఈరోజు',
    thisMonth: 'ఈ నెల',
    resetFilter: 'ఫిల్టర్లు క్లియర్ చేయి',
    filterByDate: 'తేదీ వారీగా వెతుకు',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('app_lang') || 'te'; // Telugu default for owner!
  });

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'te' ? 'en' : 'te'));
  };

  const t = translations[lang] || translations.te;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
