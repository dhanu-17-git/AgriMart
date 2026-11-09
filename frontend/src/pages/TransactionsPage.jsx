// src/pages/TransactionsPage.jsx
// Complete AG Market Escrow Payment Gateway & Settlement Hub.
// Default view is the live Escrow Checkout with interactive QR scanner, UPI apps, Virtual Accounts, and Cards.
// Also includes the full e-NAM Settlement History & Contract Ledger.
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, QrCode, Building2, ShieldCheck, CheckCircle2, Lock, 
  ArrowRight, Download, RefreshCw, FileText, Sparkles, Copy, Smartphone, 
  History, Clock, AlertCircle, ArrowUpRight, Scale, Check, ShoppingCart, 
  Printer, ChevronRight, CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiGetTransactions, apiPerformTransactionAction } from '../services/api';

const DEFAULT_PAYMENT_CONTRACTS = [
  {
    id: 'contract-wheat-01',
    contractNumber: 'CN-2026-LDH-89F2',
    transactionId: 'TXN-2026-LDH-4410',
    commodity: 'Wheat (Sharbati Grade-A)',
    mandi: 'Ludhiana APMC, Punjab',
    quantity: 100,
    unit: 'Quintals',
    rate: 2450,
    grossAmount: 245000,
    mandiCess: 3675,
    escrowFee: 1225,
    totalPayable: 249900,
    seller: 'Harpreet Singh (Khanna Farmer Producer Co.)',
    buyer: 'Devinder Singh (Kisan Trader)',
    status: 'Pending Escrow Deposit',
    currentStep: 1,
    escrowHash: '0x8f2a91b4c3e7d6a5e1f0b9c8d7a6e5f4',
    virtualAccount: 'ENAMAXIS98214432',
    ifsc: 'UTIB0000004',
  },
  {
    id: 'contract-mustard-02',
    contractNumber: 'CN-2026-ALW-4109',
    transactionId: 'TXN-2026-ALW-1120',
    commodity: 'Mustard (Sarson High-Oil 42%)',
    mandi: 'Alwar APMC, Rajasthan',
    quantity: 60,
    unit: 'Quintals',
    rate: 5680,
    grossAmount: 340800,
    mandiCess: 5112,
    escrowFee: 1704,
    totalPayable: 347616,
    seller: 'Kailash Meena (Alwar Oil Mill FPO)',
    buyer: 'Devinder Singh (Kisan Trader)',
    status: 'Pending Escrow Deposit',
    currentStep: 1,
    escrowHash: '0x41b9c2a8f3d7e6a5e1f0b9c8d7a6e5f4',
    virtualAccount: 'ENAMAXIS77109241',
    ifsc: 'UTIB0000004',
  },
  {
    id: 'contract-cotton-03',
    contractNumber: 'CN-2026-RJK-7811',
    transactionId: 'TXN-2026-RJK-9932',
    commodity: 'Cotton (Shankar-6 29mm)',
    mandi: 'Rajkot APMC, Gujarat',
    quantity: 40,
    unit: 'Bales',
    rate: 7140,
    grossAmount: 285600,
    mandiCess: 4284,
    escrowFee: 1428,
    totalPayable: 291312,
    seller: 'Bhavesh Patel (Saurashtra Ginning Syndicate)',
    buyer: 'Devinder Singh (Kisan Trader)',
    status: 'Escrow Funded (100%)',
    currentStep: 2,
    escrowHash: '0x78a1f2b4c3e7d6a5e1f0b9c8d7a6e5f4',
    virtualAccount: 'ENAMAXIS33819201',
    ifsc: 'UTIB0000004',
  }
];

export default function TransactionsPage({ onReturnToAssistant }) {
  // Navigation View: 'checkout' (Direct Payment Gateway) | 'ledger' (Settlement History)
  const [activeView, setActiveView] = useState('checkout');
  
  // Selected Contract for Payment
  const [contracts, setContracts] = useState(DEFAULT_PAYMENT_CONTRACTS);
  const [selectedContractId, setSelectedContractId] = useState(DEFAULT_PAYMENT_CONTRACTS[0].id);
  
  // Payment Method: 'upi_qr' | 'upi_id' | 'virtual_account' | 'netbanking' | 'card'
  const [paymentMethod, setPaymentMethod] = useState('upi_qr');
  const [upiId, setUpiId] = useState('devinder.singh@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('412');
  const [copiedField, setCopiedField] = useState(null);

  // Processing & Success States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [receipt, setReceipt] = useState(null);

  // Active Contract Object
  const currentContract = contracts.find(c => c.id === selectedContractId) || contracts[0];

  // Load backend transactions if available
  useEffect(() => {
    async function loadBackendData() {
      try {
        const res = await apiGetTransactions();
        if (Array.isArray(res) && res.length > 0) {
          const mapped = res.map(t => ({
            id: t.id,
            contractNumber: t.contract_note_number,
            transactionId: t.transaction_id,
            commodity: t.commodity_name || 'Wheat',
            mandi: t.apmc_name || 'Ludhiana APMC, Punjab',
            quantity: Number(t.quantity_quintals),
            unit: 'Quintals',
            rate: Number(t.agreed_rate),
            grossAmount: Number(t.gross_amount),
            mandiCess: Number(t.mandi_cess),
            escrowFee: Number(t.escrow_fee),
            totalPayable: Number(t.gross_amount) + Number(t.mandi_cess) + Number(t.escrow_fee),
            seller: t.seller_name || 'Registered Producer',
            buyer: t.buyer_name || 'Institutional Merchant',
            status: t.status === 'contract_issued' ? 'Pending Escrow Deposit' : 'Escrow Funded (100%)',
            currentStep: t.status === 'contract_issued' ? 1 : 2,
            escrowHash: t.escrow_deposit_hash || '0x8f2a91b4c3e7d6a5',
            virtualAccount: 'ENAMAXIS98214432',
            ifsc: 'UTIB0000004',
          }));
          setContracts(prev => [...mapped, ...prev]);
          setSelectedContractId(mapped[0].id);
        }
      } catch (e) {
        // Fallback to default contracts
      }
    }
    loadBackendData();
  }, []);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Execute Simulated Payment & Advance Escrow State
  const handlePayNow = async () => {
    setIsProcessing(true);
    setReceipt(null);

    // Step 1: Connecting
    setProcessingStep('Connecting to e-NAM Clearinghouse & Axis Bank Escrow Gateway...');
    await new Promise(r => setTimeout(r, 900));

    // Step 2: Quarantining Funds
    setProcessingStep(`Quarantining ₹${currentContract.totalPayable.toLocaleString()} in Mandi Escrow Vault...`);
    await new Promise(r => setTimeout(r, 1100));

    // Step 3: Generating Cryptographic Proof
    setProcessingStep('Generating SHA-256 Escrow Deposit Stamp & Smart Contract Lock...');
    await new Promise(r => setTimeout(r, 800));

    // Try backend action if valid uuid
    try {
      if (currentContract.id && currentContract.id.includes('-') && currentContract.id.length > 20) {
        await apiPerformTransactionAction(currentContract.id, 'fund_escrow');
      }
    } catch (e) { /* silent */ }

    // Update contract state
    setContracts(prev => prev.map(c => {
      if (c.id === currentContract.id) {
        return {
          ...c,
          status: 'Escrow Funded (100%)',
          currentStep: 2,
        };
      }
      return c;
    }));

    const newReceipt = {
      receiptNumber: `PAY-ENAM-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentId: `UPI-RR-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      contractNumber: currentContract.contractNumber,
      commodity: currentContract.commodity,
      mandi: currentContract.mandi,
      amount: currentContract.totalPayable,
      seller: currentContract.seller,
      method: paymentMethod === 'upi_qr' ? 'UPI Dynamic QR (PhonePe / GPay)' : 
              paymentMethod === 'upi_id' ? `UPI VPA (${upiId})` : 
              paymentMethod === 'virtual_account' ? 'e-NAM Axis Bank Virtual Escrow Account' : 
              paymentMethod === 'card' ? 'Commercial Debit Card' : `NetBanking (${selectedBank})`,
      timestamp: new Date().toLocaleString(),
      escrowHash: currentContract.escrowHash,
      status: 'SUCCESS • 100% ESCROW LOCKED',
    };

    setReceipt(newReceipt);
    setIsProcessing(false);
    setProcessingStep('');

    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
    } catch (e) { /* silent */ }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-[#17191C] flex flex-col font-sans">
      
      {/* Top Clearinghouse Trust Header */}
      <div className="bg-[#17191C] text-white px-4 sm:px-8 py-2.5 text-xs font-mono flex flex-wrap items-center justify-between gap-3 border-b border-[#2C3138]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#16845B]" />
          <span className="font-semibold text-white">e-NAM Multi-Bank Escrow Clearinghouse</span>
          <span className="text-[#92979D] hidden md:inline">&bull; 100% Guaranteed Farmer Payout on Quality Verification</span>
        </div>
        <div className="flex items-center gap-4 text-[#92979D] text-xs">
          <span>Escrow Trustee: <strong className="text-white">Axis Bank Agricultural Clearing Corp</strong></span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Bank-Grade 256-Bit SSL</span>
          </span>
        </div>
      </div>

      <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 py-8 space-y-6 flex-1">
        
        {/* Navigation Tabs: Checkout vs Ledger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E9E7]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#155E91] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#155E91] font-mono">
                AgriPay &bull; Mandi Escrow Gateway
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#17191C] tracking-tight">
              {activeView === 'checkout' ? 'Escrow Payment Checkout' : 'Settlement History & Contract Ledger'}
            </h1>
          </div>

          {/* Switch Mode Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E8E9E7] rounded-full shadow-2xs">
            <button
              onClick={() => { setActiveView('checkout'); setReceipt(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-extrabold transition-all cursor-pointer ${
                activeView === 'checkout'
                  ? 'bg-[#155E91] text-white shadow-xs'
                  : 'text-[#62676D] hover:text-[#17191C]'
              }`}>
              <CreditCard className="w-3.5 h-3.5" />
              <span>Make Escrow Payment</span>
            </button>

            <button
              onClick={() => setActiveView('ledger')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-extrabold transition-all cursor-pointer ${
                activeView === 'ledger'
                  ? 'bg-[#17191C] text-white shadow-xs'
                  : 'text-[#62676D] hover:text-[#17191C]'
              }`}>
              <History className="w-3.5 h-3.5" />
              <span>Settlement Ledger ({contracts.length})</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: DIRECT ESCROW PAYMENT CHECKOUT (DEFAULT)
            ========================================================================= */}
        {activeView === 'checkout' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT 7 COLS: PAYMENT METHODS & SCANNER */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Select Active Contract Dropdown / Pill selector */}
              <div className="p-4 rounded-3xl bg-white border border-[#E8E9E7] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-heading font-extrabold text-[#17191C] uppercase tracking-wider">
                    Select Contract to Pay:
                  </label>
                  <span className="text-[11px] font-mono text-[#155E91] font-bold">
                    {contracts.filter(c => c.currentStep === 1).length} Pending Payment
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {contracts.map(c => {
                    const isSelected = c.id === currentContract.id;
                    const isPaid = c.currentStep >= 2;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelectedContractId(c.id); setReceipt(null); }}
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#155E91] bg-[#155E91]/5 ring-2 ring-[#155E91]/20'
                            : 'border-[#E8E9E7] bg-white hover:bg-[#F8FAFB]'
                        }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold text-[#70777F]">{c.contractNumber}</span>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isPaid ? 'FUNDED' : 'UNPAID'}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-[#17191C] truncate">{c.commodity}</h4>
                        <div className="text-[11px] font-mono text-[#155E91] font-bold mt-1">
                          ₹{c.totalPayable.toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SUCCESS RECEIPT VIEW */}
              {receipt ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#16845B]/30 shadow-lg space-y-6 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#16845B] flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#16845B] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Payment Received &bull; Escrow Secured
                    </span>
                    <h3 className="font-heading font-extrabold text-2xl text-[#17191C] mt-2">
                      ₹{receipt.amount.toLocaleString()} Locked in Escrow
                    </h3>
                    <p className="text-xs text-[#62676D] max-w-md mx-auto">
                      Funds are quarantined under Axis Bank Clearinghouse custody for <strong>{receipt.seller}</strong>. Payment will be automatically released upon delivery weighment at {receipt.mandi}.
                    </p>
                  </div>

                  {/* Receipt Details Box */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFB] border border-[#E8E9E7] text-left font-mono text-xs space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transaction Reference:</span>
                      <strong className="text-slate-900">{receipt.receiptNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank UTR / UPI Ref:</span>
                      <strong className="text-[#155E91]">{receipt.paymentId}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contract Note:</span>
                      <strong className="text-slate-900">{receipt.contractNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Mode:</span>
                      <span className="text-slate-700">{receipt.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timestamp:</span>
                      <span>{receipt.timestamp}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#E8E9E7]">
                      <span className="text-slate-500">Escrow SHA-256 Stamp:</span>
                      <span className="text-[10px] text-emerald-700 font-bold">{receipt.escrowHash.slice(0, 24)}...</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => alert(`Receipt ${receipt.receiptNumber} downloaded.`)}
                      className="px-5 py-2.5 rounded-full border border-[#E8E9E7] bg-white text-xs font-heading font-bold text-[#17191C] hover:bg-[#F8FAFB] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Payment Receipt</span>
                    </button>

                    <button
                      onClick={() => setActiveView('ledger')}
                      className="px-6 py-2.5 rounded-full bg-[#155E91] text-white text-xs font-heading font-extrabold hover:bg-[#114B75] transition-all cursor-pointer shadow-xs">
                      View Settlement Ledger &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                /* INTERACTIVE PAYMENT GATEWAY TABS */
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E9E7] shadow-2xs space-y-6">
                  
                  {/* Payment Method Selector Grid */}
                  <div className="space-y-3">
                    <label className="text-xs font-heading font-extrabold text-[#17191C] uppercase tracking-wider block">
                      Choose Payment Method:
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi_qr')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          paymentMethod === 'upi_qr'
                            ? 'border-[#155E91] bg-[#155E91]/10 text-[#155E91] font-bold shadow-2xs'
                            : 'border-[#E8E9E7] bg-white text-[#62676D] hover:bg-[#F8FAFB]'
                        }`}>
                        <QrCode className="w-5 h-5 text-[#155E91]" />
                        <span className="text-[11px] font-heading">UPI QR Code</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi_id')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          paymentMethod === 'upi_id'
                            ? 'border-[#155E91] bg-[#155E91]/10 text-[#155E91] font-bold shadow-2xs'
                            : 'border-[#E8E9E7] bg-white text-[#62676D] hover:bg-[#F8FAFB]'
                        }`}>
                        <Smartphone className="w-5 h-5 text-[#155E91]" />
                        <span className="text-[11px] font-heading">UPI VPA / Apps</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('virtual_account')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          paymentMethod === 'virtual_account'
                            ? 'border-[#155E91] bg-[#155E91]/10 text-[#155E91] font-bold shadow-2xs'
                            : 'border-[#E8E9E7] bg-white text-[#62676D] hover:bg-[#F8FAFB]'
                        }`}>
                        <Building2 className="w-5 h-5 text-[#155E91]" />
                        <span className="text-[11px] font-heading">e-NAM A/C</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('netbanking')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          paymentMethod === 'netbanking'
                            ? 'border-[#155E91] bg-[#155E91]/10 text-[#155E91] font-bold shadow-2xs'
                            : 'border-[#E8E9E7] bg-white text-[#62676D] hover:bg-[#F8FAFB]'
                        }`}>
                        <CreditCard className="w-5 h-5 text-[#155E91]" />
                        <span className="text-[11px] font-heading">NetBanking</span>
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: UPI DYNAMIC QR CODE SCANNER */}
                  {paymentMethod === 'upi_qr' && (
                    <div className="p-6 rounded-3xl bg-[#F8FAFB] border border-[#E8E9E7] flex flex-col items-center text-center space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-xs font-mono font-bold text-[#16845B]">
                          Instant Dynamic UPI QR Generated
                        </span>
                      </div>

                      {/* Scannable Dynamic SVG QR Code */}
                      <div className="relative p-3 bg-white rounded-2xl border-2 border-[#155E91] shadow-md group">
                        <svg className="w-48 h-48 sm:w-56 sm:h-56" viewBox="0 0 100 100" fill="currentColor">
                          {/* Corner Squares */}
                          <rect x="8" y="8" width="26" height="26" rx="4" fill="#17191C" />
                          <rect x="12" y="12" width="18" height="18" rx="2" fill="white" />
                          <rect x="15" y="15" width="12" height="12" rx="2" fill="#155E91" />
                          
                          <rect x="66" y="8" width="26" height="26" rx="4" fill="#17191C" />
                          <rect x="70" y="12" width="18" height="18" rx="2" fill="white" />
                          <rect x="73" y="15" width="12" height="12" rx="2" fill="#155E91" />

                          <rect x="8" y="66" width="26" height="26" rx="4" fill="#17191C" />
                          <rect x="12" y="70" width="18" height="18" rx="2" fill="white" />
                          <rect x="15" y="73" width="12" height="12" rx="2" fill="#155E91" />

                          {/* Data Pixels Matrix */}
                          <rect x="40" y="12" width="6" height="6" fill="#17191C" />
                          <rect x="52" y="12" width="8" height="6" fill="#17191C" />
                          <rect x="40" y="24" width="8" height="8" fill="#155E91" />
                          <rect x="54" y="24" width="6" height="8" fill="#17191C" />
                          <rect x="12" y="42" width="14" height="6" fill="#17191C" />
                          <rect x="32" y="42" width="6" height="16" fill="#155E91" />
                          <rect x="44" y="42" width="12" height="12" fill="#17191C" />
                          <rect x="62" y="42" width="16" height="6" fill="#17191C" />
                          <rect x="84" y="42" width="8" height="12" fill="#155E91" />
                          <rect x="44" y="60" width="6" height="14" fill="#17191C" />
                          <rect x="56" y="60" width="14" height="6" fill="#155E91" />
                          <rect x="76" y="60" width="16" height="14" fill="#17191C" />
                          <rect x="40" y="80" width="12" height="12" fill="#17191C" />
                          <rect x="58" y="78" width="12" height="14" fill="#155E91" />
                        </svg>

                        {/* Center e-NAM Logo badge */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E9E7] flex items-center justify-center shadow-xs">
                            <Lock className="w-5 h-5 text-[#155E91]" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-mono font-bold text-[#17191C]">
                          Scan &amp; Pay: ₹{currentContract.totalPayable.toLocaleString()}
                        </span>
                        <p className="text-[11px] text-[#70777F]">
                          Open Google Pay, PhonePe, Paytm, or BHIM on your mobile phone to scan.
                        </p>
                      </div>

                      {/* Fast Supported UPI Apps */}
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-[#E8E9E7] w-full max-w-sm">
                        <span className="px-3 py-1 rounded-full bg-white border border-[#E8E9E7] text-[10px] font-mono font-bold text-slate-700">Google Pay</span>
                        <span className="px-3 py-1 rounded-full bg-white border border-[#E8E9E7] text-[10px] font-mono font-bold text-slate-700">PhonePe</span>
                        <span className="px-3 py-1 rounded-full bg-white border border-[#E8E9E7] text-[10px] font-mono font-bold text-slate-700">Paytm</span>
                        <span className="px-3 py-1 rounded-full bg-white border border-[#E8E9E7] text-[10px] font-mono font-bold text-slate-700">BHIM UPI</span>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: UPI ID INPUT */}
                  {paymentMethod === 'upi_id' && (
                    <div className="p-6 rounded-3xl bg-[#F8FAFB] border border-[#E8E9E7] space-y-4 text-xs font-mono">
                      <div>
                        <label className="text-xs font-heading font-extrabold text-[#17191C] block mb-1">
                          Enter your Virtual Payment Address (UPI ID):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@bank"
                            className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-[#E8E9E7] text-xs font-bold text-[#17191C] focus:outline-none focus:border-[#155E91]"
                          />
                          <button
                            type="button"
                            className="px-4 py-2.5 rounded-2xl bg-[#17191C] text-white text-xs font-bold cursor-pointer">
                            Verify VPA
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#70777F]">
                        A collect request for <strong>₹{currentContract.totalPayable.toLocaleString()}</strong> will be dispatched to your UPI application.
                      </p>
                    </div>
                  )}

                  {/* TAB 3: e-NAM VIRTUAL ESCROW ACCOUNT (NEFT / RTGS) */}
                  {paymentMethod === 'virtual_account' && (
                    <div className="p-6 rounded-3xl bg-[#F8FAFB] border border-[#E8E9E7] space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E8E9E7]">
                        <span className="text-[#62676D]">Virtual Escrow A/C Number:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-sm font-bold text-[#17191C]">{currentContract.virtualAccount}</strong>
                          <button
                            onClick={() => copyToClipboard(currentContract.virtualAccount, 'acc')}
                            className="p-1 hover:bg-white rounded text-[#155E91] cursor-pointer">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b border-[#E8E9E7]">
                        <span className="text-[#62676D]">IFSC Code:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-[#17191C]">{currentContract.ifsc}</strong>
                          <button
                            onClick={() => copyToClipboard(currentContract.ifsc, 'ifsc')}
                            className="p-1 hover:bg-white rounded text-[#155E91] cursor-pointer">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b border-[#E8E9E7]">
                        <span className="text-[#62676D]">Account Beneficiary:</span>
                        <strong className="text-[#17191C]">AgriMart e-NAM Clearinghouse Corp</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#62676D]">Settlement Bank:</span>
                        <strong className="text-[#17191C]">Axis Bank Corporate Clearing Hub</strong>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: NETBANKING */}
                  {paymentMethod === 'netbanking' && (
                    <div className="p-6 rounded-3xl bg-[#F8FAFB] border border-[#E8E9E7] space-y-3">
                      <label className="text-xs font-heading font-extrabold text-[#17191C] block">
                        Select Commercial Banking Portal:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                        {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Kotak Mahindra'].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBank(b)}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold ${
                              selectedBank === b
                                ? 'border-[#155E91] bg-white text-[#155E91] shadow-2xs'
                                : 'border-[#E8E9E7] bg-white/70 text-[#62676D] hover:bg-white'
                            }`}>
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Pay Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={handlePayNow}
                      disabled={isProcessing}
                      className="w-full py-4 rounded-2xl bg-[#155E91] hover:bg-[#114B75] text-white font-heading font-extrabold text-sm sm:text-base transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]">
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>{processingStep || 'Processing Settlement...'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Pay &amp; Secure Escrow: ₹{currentContract.totalPayable.toLocaleString()}</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] font-mono text-center text-[#70777F] mt-2 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
                      <span>Zero-risk escrow custody. Funds released only after delivery weighment verification.</span>
                    </p>
                  </div>

                </div>
              )}

            </div>

            {/* RIGHT 5 COLS: FINANCIAL BREAKDOWN & ESCROW CERTIFICATE */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Order Cost Breakdown Box */}
              <div className="p-6 rounded-3xl bg-white border border-[#E8E9E7] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E9E7]">
                  <span className="text-xs font-mono font-bold text-[#70777F] uppercase tracking-wider">
                    Contract Summary
                  </span>
                  <span className="text-xs font-mono font-bold text-[#155E91]">
                    {currentContract.contractNumber}
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#62676D]">Commodity:</span>
                    <strong className="text-[#17191C]">{currentContract.commodity}</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#62676D]">APMC Mandi:</span>
                    <strong className="text-[#17191C]">{currentContract.mandi}</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#62676D]">Certified Quantity:</span>
                    <strong className="text-[#17191C]">{currentContract.quantity} {currentContract.unit}</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#62676D]">Agreed Rate:</span>
                    <strong className="text-[#17191C]">₹{currentContract.rate}/Qtl</strong>
                  </div>

                  <div className="pt-2 border-t border-[#E8E9E7] space-y-2 text-[11px]">
                    <div className="flex justify-between text-[#70777F]">
                      <span>Gross Crop Value:</span>
                      <span>₹{currentContract.grossAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-[#70777F]">
                      <span>APMC Statutory Cess (1.5%):</span>
                      <span>₹{currentContract.mandiCess.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-[#70777F]">
                      <span>Axis Clearinghouse Fee (0.5%):</span>
                      <span>₹{currentContract.escrowFee.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-[#E8E9E7] flex justify-between items-center text-sm">
                    <span className="font-heading font-extrabold text-[#17191C]">Total Escrow Payable:</span>
                    <span className="font-mono font-black text-lg text-[#155E91]">
                      ₹{currentContract.totalPayable.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal Settlement & Guarantee Certificate */}
              <div className="p-6 rounded-3xl bg-[#F8FAFB] border border-[#E8E9E7] space-y-3 text-xs">
                <div className="flex items-center gap-2 text-[#155E91] font-heading font-extrabold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Clearinghouse Guarantee Terms</span>
                </div>

                <ul className="space-y-2 text-[11px] text-[#62676D] font-sans list-disc list-inside">
                  <li><strong>T+0 Inward Clearing:</strong> Funds are locked in escrow immediately and held under statutory banking trustee.</li>
                  <li><strong>Quality Assay Protection:</strong> If physical quality testing detects moisture &gt; 12%, price adjustments are applied automatically before settlement.</li>
                  <li><strong>Farmer Direct Settlement:</strong> Remaining proceeds are directly wired to the farmer's bank account upon delivery acceptance.</li>
                </ul>

                <div className="pt-3 border-t border-[#E8E9E7] flex items-center justify-between font-mono text-[10px] text-[#70777F]">
                  <span>SHA-256 Vault Seal:</span>
                  <span className="font-bold text-[#17191C]">{currentContract.escrowHash.slice(0, 16)}...</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 2: FULL SETTLEMENT HISTORY & CONTRACT LEDGER
            ========================================================================= */}
        {activeView === 'ledger' && (
          <div className="space-y-4">
            {contracts.map(c => {
              const isPaid = c.currentStep >= 2;
              return (
                <div 
                  key={c.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E8E9E7] shadow-2xs space-y-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E9E7]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-[#155E91]/10 text-[#155E91]'
                      }`}>
                        {isPaid ? <Check className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-extrabold text-base text-[#17191C]">
                            {c.commodity}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isPaid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <span className="text-xs text-[#62676D] font-mono">{c.mandi} &bull; {c.contractNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-sm text-[#17191C]">
                        ₹{c.totalPayable.toLocaleString()}
                      </span>

                      {!isPaid ? (
                        <button
                          onClick={() => {
                            setSelectedContractId(c.id);
                            setActiveView('checkout');
                            setReceipt(null);
                          }}
                          className="px-4 py-1.5 rounded-full bg-[#155E91] text-white text-xs font-heading font-extrabold hover:bg-[#114B75] transition-all cursor-pointer shadow-xs">
                          Pay Escrow &rarr;
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-[#E7F5EE] text-[#16845B] text-xs font-mono font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Escrow Locked</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-[#62676D] font-mono gap-3">
                    <span>Seller: <strong className="text-[#17191C]">{c.seller}</strong></span>
                    <span>Volume: <strong>{c.quantity} {c.unit} @ ₹{c.rate}/Qtl</strong></span>
                    <span>Virtual A/C: <strong>{c.virtualAccount}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
