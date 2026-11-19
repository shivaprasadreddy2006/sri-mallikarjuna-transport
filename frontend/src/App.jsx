import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import VoiceBillPage from './pages/VoiceBillPage';
import TypeBillPage from './pages/TypeBillPage';
import InvoiceHistory from './pages/InvoiceHistory';
import ViewInvoice from './pages/ViewInvoice';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-amber-400 selection:text-slate-950">
        <Navbar />
        <main className="flex-1 pb-12">
          <Routes>
            <Route path="/" element={<VoiceBillPage />} />
            <Route path="/type-bill" element={<TypeBillPage />} />
            <Route path="/history" element={<InvoiceHistory />} />
            <Route path="/view/:id" element={<ViewInvoice />} />
          </Routes>
        </main>
        <footer className="no-print bg-slate-900 text-slate-400 py-4 text-center text-xs border-t border-slate-800">
          <p className="font-semibold text-slate-300">
            SRI MALLIKARJUNA TRANSPORT &copy; {new Date().getFullYear()}
          </p>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Voice-Based Transport Billing System &bull; Hyderabad
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
