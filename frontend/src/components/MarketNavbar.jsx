// src/components/MarketNavbar.jsx
// Pixel-perfect implementation matching AG Market Reference Design System.
// Authentic white/charcoal palette, #155E91 brand blue accent, #16845B positive green, #E8E9E7 subtle borders.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale, FileText, ArrowLeft, User, Search, ShieldCheck,
  TrendingUp, Activity, Landmark, Sparkles, CreditCard
} from 'lucide-react';

export default function MarketNavbar({
  user,
  onOpenLogin,
  mandiTab = 'exchange',
  onSelectMandiTab
}) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E9E7] transition-all">
      {/* Main Header Bar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-6">

          {/* Left: Portal Return & Brandmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8FAFB] hover:bg-[#F2F4F7] text-[#62676D] hover:text-[#17191C] text-xs font-semibold font-heading transition-colors border border-[#E8E9E7] shadow-2xs cursor-pointer"
              title="Return to AgriMart Central Portal"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="hidden sm:inline">Portal</span>
            </button>

            <div
              onClick={() => onSelectMandiTab('exchange')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <img 
                src="/assets/logos/official-ag-market-icon.png" 
                alt="AG Market Official Logo" 
                className="h-9 w-9 object-contain shrink-0 drop-shadow-2xs group-hover:scale-105 transition-transform" 
              />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight font-heading leading-tight text-[#17191C]">
                  AG Market
                </span>
                <span className="text-[8.5px] tracking-wider uppercase font-mono font-bold -mt-0.5 text-[#70777F]">
                  Mandi &bull; Trade &bull; Market Intelligence
                </span>
              </div>
            </div>
          </div>

          {/* Center: Smooth, Professional Centered Search Bar */}
          <div className="hidden md:flex flex-1 justify-center max-w-xl mx-2 sm:mx-6">
            <div className="w-full max-w-md flex items-center justify-between px-3.5 py-2 bg-[#F8FAFB] hover:bg-white focus-within:bg-white text-[#62676D] rounded-full border border-[#E8E9E7] hover:border-[#D1D5DB] focus-within:border-[#155E91] focus-within:ring-2 focus-within:ring-[#155E91]/15 transition-all shadow-2xs">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Search className="w-4 h-4 text-[#70777F] shrink-0" />
                <input
                  type="text"
                  placeholder="Search commodities, APMC mandis, live auctions..."
                  className="w-full bg-transparent border-0 outline-none text-xs text-[#17191C] placeholder:text-[#92979D] font-sans"
                />
              </div>
              <kbd className="text-[10px] font-mono font-medium text-[#70777F] bg-white px-2 py-0.5 rounded-md border border-[#E8E9E7] shadow-2xs ml-2 shrink-0">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: Escrow Action & Trader Account */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onSelectMandiTab('contracts')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#155E91] hover:bg-[#114B75] text-white text-xs font-heading font-extrabold shadow-2xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Open Escrow Payments & Contract Settlements">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payments &amp; Escrow</span>
            </button>

            {/* Trader Profile */}
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#17191C] hover:bg-[#F8FAFB] border border-[#E8E9E7] rounded-full transition-colors font-medium shadow-2xs cursor-pointer"
              aria-label="Trader Account">
              <div className="w-5 h-5 rounded-full bg-[#155E91]/10 flex items-center justify-center text-[#155E91] font-bold text-[10px]">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3 h-3 text-[#70777F]" />}
              </div>
              <span className="hidden sm:inline font-heading font-semibold text-xs">
                {user ? (user.name ? user.name.split(' ')[0] : 'Trader') : 'Trader Sign In'}
              </span>
            </button>
          </div>

        </div>

        {/* Clean Editorial Sub-Navigation Bar */}
        <div className="flex items-center justify-between border-t border-[#E8E9E7] py-2.5 text-xs overflow-x-auto no-scrollbar gap-6">
          <div className="flex items-center gap-6 sm:gap-7 shrink-0 text-xs font-medium">
            <button
              onClick={() => onSelectMandiTab('exchange')}
              className={`py-1 relative flex items-center gap-1.5 transition-colors cursor-pointer ${mandiTab === 'exchange' ? 'text-[#17191C] font-bold' : 'text-[#62676D] hover:text-[#17191C]'
                }`}>
              <Scale className="w-3.5 h-3.5 text-[#16845B]" />
              <span>Live APMC Exchange</span>
              {mandiTab === 'exchange' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#17191C] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectMandiTab('arrivals')}
              className={`py-1 relative flex items-center gap-1.5 transition-colors cursor-pointer ${mandiTab === 'arrivals' ? 'text-[#17191C] font-bold' : 'text-[#62676D] hover:text-[#17191C]'
                }`}>
              <Activity className="w-3.5 h-3.5 text-[#70777F]" />
              <span>Real-Time Arrivals</span>
              {mandiTab === 'arrivals' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#17191C] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectMandiTab('lots')}
              className={`py-1 relative flex items-center gap-1.5 transition-colors cursor-pointer ${mandiTab === 'lots' ? 'text-[#17191C] font-bold' : 'text-[#62676D] hover:text-[#17191C]'
                }`}>
              <TrendingUp className="w-3.5 h-3.5 text-[#70777F]" />
              <span>Wholesale Lots</span>
              {mandiTab === 'lots' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#17191C] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectMandiTab('bids')}
              className={`py-1 relative flex items-center gap-1.5 transition-colors cursor-pointer ${mandiTab === 'bids' ? 'text-[#17191C] font-bold' : 'text-[#62676D] hover:text-[#17191C]'
                }`}>
              <Landmark className="w-3.5 h-3.5 text-[#70777F]" />
              <span>Merchant Bids</span>
              {mandiTab === 'bids' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#17191C] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectMandiTab('contracts')}
              className={`py-1 relative flex items-center gap-1.5 transition-colors cursor-pointer ${mandiTab === 'contracts' ? 'text-[#155E91] font-extrabold' : 'text-[#62676D] hover:text-[#17191C]'
                }`}>
              <CreditCard className="w-3.5 h-3.5 text-[#155E91]" />
              <span>Payments &amp; Escrow</span>
              {mandiTab === 'contracts' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#155E91] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectMandiTab('copilot')}
              className={`py-1 relative flex items-center gap-1.5 transition-colors cursor-pointer ${mandiTab === 'copilot' ? 'text-[#17191C] font-bold' : 'text-[#62676D] hover:text-[#17191C]'
                }`}>
              <Sparkles className="w-3.5 h-3.5 text-[#C47A37]" />
              <span className="font-semibold">AI Copilot</span>
              {mandiTab === 'copilot' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#C47A37] rounded-full" />
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-[#70777F] shrink-0">
            <span>Trading Hours: 09:00 - 17:30 IST</span>
            <span>&bull;</span>
            <span className="text-[#16845B] font-semibold">AGMARKNET Data</span>
          </div>
        </div>

      </div>
    </header>
  );
}
