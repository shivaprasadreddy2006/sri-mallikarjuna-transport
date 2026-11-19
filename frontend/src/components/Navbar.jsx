import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck, Mic, FileEdit, History, Download, Smartphone } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      alert('To install on your phone:\n1. Tap the three dots (⋮) in Chrome.\n2. Tap "Install app" or "Add to Home screen".');
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
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

              {!isInstalled && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow transition-colors ml-2"
                  title="Install application on phone"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              )}
            </nav>

            {/* Mobile Header Right: Quick Install Pill */}
            <div className="sm:hidden flex items-center gap-2">
              {!isInstalled && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-1 bg-emerald-600 active:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Install</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed Native App Style) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 shadow-2xl safe-area-bottom">
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
    </>
  );
}
