import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck, Mic, FileEdit, History, Smartphone, Share2, Check, X, ExternalLink } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsStandalone(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      try {
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallPrompt(null);
          setIsStandalone(true);
          return;
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }
    // Always open helpful install & share modal
    setShowModal(true);
  };

  const handleCopyLink = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SRI MALLIKARJUNA TRANSPORT Billing',
          text: 'Open and install the Sri Mallikarjuna Transport Billing App:',
          url: url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share cancelled
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      alert(`App URL:\n${url}`);
    }
  };

  const navItems = [
    { path: '/', label: 'Voice Bill', icon: Mic, highlight: true },
    { path: '/type-bill', label: 'Type Bill', icon: FileEdit },
    { path: '/history', label: 'Previous Bills', icon: History },
  ];

  return (
    <>
      {/* Top Header (Desktop & Mobile) */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md">
                <Truck className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white leading-tight">
                  SRI MALLIKARJUNA TRANSPORT
                </h1>
                <p className="text-[10px] sm:text-xs text-amber-400 font-medium">
                  Smart Billing
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden sm:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      item.highlight && isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : isActive
                        ? 'bg-slate-800 text-amber-400 border border-slate-700'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow transition-colors ml-2 cursor-pointer"
                title="Install or share application"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isStandalone ? 'App Options' : 'Install App'}</span>
              </button>
            </nav>

            {/* Mobile Header Right: Always Visible Install/Share Pill */}
            <div className="sm:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1 bg-emerald-600 active:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow cursor-pointer"
              >
                <Smartphone className="w-3 h-3" />
                <span>{isStandalone ? 'App Info' : 'Install'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed Native App Style) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-800 shadow-2xl safe-area-bottom">
        <div className="grid grid-cols-3 h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-0.5 transition-colors ${
                  isActive
                    ? 'text-amber-400 font-bold bg-slate-800/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1 rounded-full ${
                    item.highlight && isActive
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : isActive
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] leading-tight font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Install & Mobile Setup Guide Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in duration-200 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">Install Mobile App</h3>
                  <p className="text-[11px] text-slate-500">Sri Mallikarjuna Transport</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-slate-700">
              {installPrompt && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Click to Install App Now</span>
                </button>
              )}

              {/* Android Instructions */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Android (Google Chrome):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                  <li>Tap the <strong>3 vertical dots (⋮)</strong> at top-right of Chrome.</li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Tap <strong>Install</strong>. The app icon will appear on your screen!</li>
                </ol>
              </div>

              {/* iPhone Instructions */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>iPhone / iPad (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                  <li>Tap the <strong>Share</strong> button (box with arrow pointing up).</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong>Add</strong> at top-right.</li>
                </ol>
              </div>

              {/* Share link to other mobiles */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-800" />
                    <span>Link Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share Link to Other Mobiles / WhatsApp</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
