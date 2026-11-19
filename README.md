# 🚚 Smart Transport Billing System
### Telugu Voice-Based Transport Billing Application for **SRI MALLIKARJUNA TRANSPORT**

An easy-to-use, production-quality full-stack transport billing application built for small transport business owners who do not know how to use Excel. Generate, edit, save, search, and download pixel-perfect transport bills using **Telugu voice commands** or simple manual inputs.

---

## 🌟 Key Features

1. **🎙️ Telugu Voice Assistant (`te-IN`)**
   - Non-technical friendly with a large, accessible microphone button.
   - Speak naturally in Telugu, Telugu + English, or common transport terminology:
     - *"ఈరోజు ఒక కొత్త బిల్ తయారు చేయి. వాహనం నంబర్ TS09AB1234. వరంగల్ నుంచి హైదరాబాద్ వరకు సరుకు తీసుకెళ్లారు. ఫ్రైట్ 15000 రూపాయలు."*
     - *"వాహనం నంబర్ TS08UH0187, జాడ్చర్ల నుంచి శ్రీసిటీ, ఫ్రైట్ 25000."*
     - *"ఈ బిల్లో అన్లోడింగ్ ఛార్జెస్ 500."*
     - *"ఈరోజు బిల్లులు చూపించు."*
     - *"బిల్ నంబర్ 36 డౌన్లోడ్ చేయి."*
   - Built-in dual-engine AI parser:
     - **Google Gemini API** (`gemini-2.5-flash`) for deep semantic extraction.
     - **Built-in Telugu NLP Rule Parser** that works 100% offline without requiring an API key.
   - Text fallback input available if browser microphone access is denied.

2. **📄 Exact Master Invoice Replica (Fixed Design)**
   - Replicates the business's original transport bill template:
     - **Company**: SRI MALLIKARJUNA TRANSPORT
     - **Address**: #8-8-130, Near Water Tank, Madhuban Colony, Kattedan, Rajendhra Nagar (M), R.R.Dist, Hyderabad, 500077
     - **Mobiles**: 9652444104, 9603040908 | **GST**: 36AMXPT6116D1ZM | **Email**: reddynarsimha404@gmail.com
     - **Tax Section**: Tax Invoice, Bill NO, DATE, SAC 9966
     - **Consignee**: M/S. THE SUPREME INDUSTRIES LIMITED, Jadcherla
     - **Table**: S.NO | LOADING DATE | VEHICLE NO | INVOICE NO | FROM | TO | FRIGHT | UNLOADING CHARGE | TOTAL
     - **Taxes**: Subtotal, CGST@9%, SGST@9%, Grand Total
     - **Rupees**: Full-width box with automatic Indian currency words conversion
     - **Bank**: SBI, Jalpalle, Hyderabad (A/c No: 45306162224, IFSC: SBIN0018886)
     - **Signature**: FOR SRI MALLIKARJUNA TRANSPORT
   - Supports variable numbers of rows with automatic grid height normalization.

3. **🖨️ A4 Portrait PDF Generation with Puppeteer**
   - High-fidelity print-ready output matching exact physical dimensions.
   - Dedicated print stylesheet for crisp borders, aligned columns, and zero blank pages.
   - Instant 1-click Download and Browser Print.

4. **⚡ Dashboard & Billing History**
   - 4 large primary buttons: Speak to Create Bill, Create Manually, Previous Bills, Business Settings.
   - Real-time statistics: Total Bills, Today's Bills, Total Turnover.
   - Search by Vehicle Number, Bill Number, Consignee, or City.
   - Filter by Date, Month, or All Time.
   - Full Audit Trail for all bill creations and updates.

5. **🌐 Bilingual Interface**
   - 1-click toggle between **తెలుగు** (Telugu) and **English** with persistent preferences.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, React Router v7, Axios, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express.js 5, MongoDB, Mongoose 9.
- **AI & Speech**: Web Speech API (`te-IN`), Google Gemini API (`@google/genai` / REST), Local Telugu NLP Parser.
- **PDF Engine**: Puppeteer (A4 portrait, 0 margin clipping, vector typography).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **MongoDB** running locally on port 27017 or a MongoDB Atlas connection string

### 2. Environment Configuration

#### Backend (`backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_transport_billing
# Optional: Set your Gemini API key for enhanced semantic understanding
GEMINI_API_KEY=
```

#### Frontend (`frontend/.env`):
```env
VITE_API_BASE_URL=/api
```

### 3. Installation

From the project root:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Build the frontend production bundle
npm run build
```

### 4. Running the Application

You can start the unified server directly:
```bash
cd backend
npm start
```
The entire application will be live at:
👉 **http://localhost:5000**

For frontend hot-reloading development mode:
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev
```
Development frontend will be live at: **http://localhost:5173**

---

## 🧪 Automated Verification Test Suite

Run the full end-to-end test suite covering all 10 core workflows:
```bash
node backend/test-suite.js
```

### Verified Test Cases:
- [x] **Test 1**: Create a bill manually with one entry (Bill #36, ₹29,500 Grand Total).
- [x] **Test 2**: Create a bill with multiple entries (2 entries, ₹40,500 Subtotal, ₹47,790 Grand Total).
- [x] **Test 3**: Telugu voice command interpretation into structured billing JSON.
- [x] **Test 4**: In-place field correction before confirming bill.
- [x] **Test 5**: Pixel-perfect A4 PDF generation via Puppeteer (`verified-invoice-36.pdf`).
- [x] **Test 6**: Invoices with varying row counts (4 rows) and GST toggle.
- [x] **Test 7**: MongoDB date-wise history and persistence.
- [x] **Test 8**: Search invoice by vehicle number (`TS09AB9999`).
- [x] **Test 9**: Open an existing bill, edit freight, and re-download identical PDF.
- [x] **Test 10**: Live dashboard metrics & mobile-responsive viewport.

---

## 📂 Project Directory Structure

```
SRI-MALLIKARJUNA-TRANSPORT/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handler
│   ├── controllers/
│   │   ├── aiController.js       # Voice interpretation controller
│   │   ├── invoiceController.js  # Invoice CRUD, stats, PDF generation
│   │   └── settingsController.js # Business details & counter management
│   ├── models/
│   │   ├── AuditHistory.js       # Change log & audit records
│   │   ├── BusinessSettings.js   # Master company settings
│   │   ├── Counter.js            # Atomic sequential bill numbering
│   │   └── Invoice.js            # Invoice document schema
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── invoiceRoutes.js
│   │   └── settingsRoutes.js
│   ├── services/
│   │   ├── geminiService.js      # Gemini API integration
│   │   ├── numberToWords.js      # Indian currency numbers-to-words
│   │   ├── pdfService.js         # Puppeteer A4 PDF generator
│   │   └── teluguVoiceParser.js  # High-accuracy Telugu NLP rule parser
│   ├── templates/
│   │   └── invoiceHtml.js        # Exact master transport invoice template
│   ├── server.js                 # Express server & static asset handler
│   ├── test-suite.js             # 10-point automated test suite
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InvoiceTemplateView.jsx # Live HTML invoice renderer
│   │   │   └── Navbar.jsx              # Navigation with language switcher
│   │   ├── context/
│   │   │   └── LanguageContext.jsx     # Telugu/English translation provider
│   │   ├── pages/
│   │   │   ├── CreateBill.jsx          # Interactive bill creator & preview
│   │   │   ├── Dashboard.jsx           # Main touch-friendly hub
│   │   │   ├── EditBill.jsx            # Invoice editing & re-calculation
│   │   │   ├── InvoiceHistory.jsx      # Bill search, filtering, download
│   │   │   ├── Settings.jsx            # Business details manager
│   │   │   ├── ViewInvoice.jsx         # Full-screen view & browser print
│   │   │   └── VoiceBillPage.jsx       # Big mic Telugu voice assistant
│   │   ├── services/
│   │   │   └── api.js                  # Axios client API service
│   │   ├── utils/
│   │   │   ├── numberToWords.js        # Client-side Indian currency words
│   │   │   └── speechRecognition.js    # Browser speech recognition ('te-IN')
│   │   ├── App.jsx                     # Route definitions
│   │   ├── index.css                   # Tailwind v4 styles & print CSS
│   │   └── main.jsx
│   ├── vite.config.js
│   └── .env.example
├── reference/
│   └── REFERENCE_SPEC.md        # Master invoice layout specification
├── package.json                 # Top-level workspace script runner
└── README.md
```

---

## 📞 Support & Business Info

**SRI MALLIKARJUNA TRANSPORT**  
📍 #8-8-130, Near Water Tank, Madhuban Colony, Kattedan, Rajendhra Nagar (M), R.R.Dist, Hyderabad, 500077  
📱 Mobile: 9652444104, 9603040908  
✉️ Email: reddynarsimha404@gmail.com  
🧾 GSTIN: 36AMXPT6116D1ZM
