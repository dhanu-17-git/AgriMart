// src/pages/MarketMandiApp.jsx
// Post-login Market & Mandi application shell.
// Restored to the authentic Scandinavian clean light background (bg-[#FBFBF9]).
// Displays strictly APMC Mandi commodity trading, price charts, order books, copilot, and transactions.
// Contains ZERO Store, shopping cart, or equipment rental UI.
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MandiTicker from '../components/MandiTicker';
import MarketNavbar from '../components/MarketNavbar';
import AgriStockExchangeView from '../components/AgriStockExchangeView';
import MarketFooter from '../components/MarketFooter';
import MarketCopilotLauncher from '../components/MarketCopilotLauncher';
import MarketCopilotPage from './MarketCopilotPage';
import TransactionsPage from './TransactionsPage';

export default function MarketMandiApp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Recover user session from localStorage or establish demo member session
  const [user] = useState(() => {
    try {
      const session = localStorage.getItem('agrimart_user_session') || localStorage.getItem('agrimart_user');
      if (session) return JSON.parse(session);
    } catch {
      // fallback
    }
    const defaultUser = { name: 'Devinder Singh (Kisan Trader)', identifier: '+91 98765 43210', role: 'merchant' };
    try {
      localStorage.setItem('agrimart_user_session', JSON.stringify(defaultUser));
    } catch { /* silent */ }
    return defaultUser;
  });

  // Derive active tab directly from URL path (URL is single source of truth)
  const getTabFromPath = (path) => {
    if (path.includes('/arrivals') || path.includes('/apmc')) return 'arrivals';
    if (path.includes('/lots') || path.includes('/commodities')) return 'lots';
    if (path.includes('/bids') || path.includes('/auctions')) return 'bids';
    if (path.includes('/transactions') || path.includes('/contracts') || path.includes('/payments') || path.includes('/escrow')) return 'contracts';
    if (path.includes('/copilot')) return 'copilot';
    return 'exchange';
  };

  const mandiTab = getTabFromPath(location.pathname);
  const isCopilotRoute = location.pathname.includes('/copilot');
  const isTransactionsRoute = location.pathname.includes('/transactions') || 
                              location.pathname.includes('/contracts') || 
                              location.pathname.includes('/payments') || 
                              location.pathname.includes('/escrow');

  const handleTabChange = (newTab) => {
    const tabRouteMap = {
      exchange: '/market-mandi/terminal',
      arrivals: '/market-mandi/apmc',
      lots: '/market-mandi/commodities',
      bids: '/market-mandi/bids',
      contracts: '/market-mandi/payments',
      copilot: '/market-mandi/copilot',
    };
    navigate(tabRouteMap[newTab] || '/market-mandi/app');
  };

  return (
    <div className="ag-market-workspace min-h-screen flex flex-col bg-[var(--market-background)] text-[var(--text-primary)] selection:bg-[#E8F1EC] selection:text-[#287653] font-sans">
      
      {/* TOP STRIP: APMC Mandi Stock Ticker */}
      <MandiTicker onOpenMandiTerminal={() => handleTabChange('exchange')} />

      {/* Dedicated Light Market Navbar */}
      <MarketNavbar 
        user={user}
        onOpenLogin={() => navigate('/market-mandi/login')}
        mandiTab={mandiTab}
        onSelectMandiTab={handleTabChange}
      />

      {/* MAIN CONTENT */}
      <main className={`flex-1 ${isCopilotRoute ? 'min-h-0' : 'pb-16'}`}>
        {isCopilotRoute ? (
          <MarketCopilotPage 
            user={user} 
            onNavigateTab={handleTabChange} 
          />
        ) : isTransactionsRoute ? (
          <TransactionsPage 
            onReturnToAssistant={() => navigate('/market-mandi/copilot')} 
          />
        ) : (
          <AgriStockExchangeView 
            activeTab={mandiTab} 
            onTabChange={handleTabChange} 
          />
        )}
      </main>

      {/* FLOATING COPILOT LAUNCHER: Visible on all Market routes except Copilot itself */}
      {!isCopilotRoute && (
        <MarketCopilotLauncher />
      )}

      {!isCopilotRoute && (
        <MarketFooter onSelectMandiTab={handleTabChange} />
      )}

    </div>
  );
}
