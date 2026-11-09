// src/assistant/cards/TransactionCard.jsx
import React from 'react';
import { FileText, ShieldCheck, CheckCircle2, Clock, ArrowRight, ExternalLink, Scale, CreditCard } from 'lucide-react';
import { TRANSACTION_LIFECYCLE_STEPS } from '../../data/mockData';

export default function TransactionCard({ data, onAction }) {
  if (!data) return null;

  const {
    orderId = data.transactionId || 'ORD-AGX-48291',
    contractNumber = data.contractNumber || 'CN-2026-LDH-89F2',
    escrowReference = data.escrowHash ? `ESC-SHA256-${data.escrowHash.slice(0, 8)}` : 'ESC-AXIS-683553',
    commodity = 'Wheat (Sharbati Grade-A)',
    mandi = 'Ludhiana APMC, Punjab',
    quantity = 100,
    unit = 'Quintals',
    rate = data.agreedRate || 2450,
    buyer = data.buyer || 'ITC Agri Business Division',
    seller = data.seller || 'Harpreet Singh (Khanna FPO)',
    status = data.status || 'Contract Note Issued',
    currentStep = data.currentStep || 1, // Step 1 to 6
    paymentStatus = data.canPayEscrow ? 'Awaiting 100% Escrow Funding' : 'Funds Secured in Escrow',
    deliveryStatus = currentStep >= 3 ? 'Goods Dispatched to Mandi' : 'Awaiting Seller Dispatch',
    settlementStatus = currentStep >= 6 ? 'Funds Settled to Farmer Bank' : 'Awaiting APMC Quality Assay & Weighment',
    totalEscrow = data.grossAmount || data.totalAmount || data.totalEscrow || 245000,
    canPayEscrow = data.canPayEscrow ?? (currentStep === 1),
    virtualEscrowAccount = data.virtualEscrowAccount || 'ENAM-AXIS-LDH-2026',
  } = data;

  return (
    <div className="my-3 rounded-2xl bg-white border border-black/[0.08] p-5 shadow-xs hover:shadow-md transition-all max-w-lg">
      {/* Header */}
      <div className="pb-3 border-b border-black/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>{status}</span>
          </span>
          <span className="font-mono text-[11px] font-bold text-slate-700">
            {contractNumber}
          </span>
        </div>

        <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#121212]">
          Trade Contract: {commodity}
        </h3>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
          <span>{mandi}</span>
          <span className="font-mono text-[11px] text-[#155E91] font-semibold">{escrowReference}</span>
        </div>
      </div>

      {/* Trade Parties & Value */}
      <div className="grid grid-cols-2 gap-3 py-3 border-b border-black/[0.06] text-xs">
        <div className="p-2.5 bg-[#F8FAFB] rounded-xl space-y-0.5 border border-[#E8E9E7]">
          <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Buyer & Settlement</span>
          <span className="font-bold text-slate-900 truncate block">{buyer}</span>
          <span className="text-[10px] text-slate-500 font-mono block">Virtual A/C: {virtualEscrowAccount}</span>
        </div>

        <div className="p-2.5 bg-[#F8FAFB] rounded-xl space-y-0.5 text-right border border-[#E8E9E7]">
          <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Total Escrow Value</span>
          <span className="text-base font-black font-mono text-[#155E91] block">
            ₹{Number(totalEscrow).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {quantity} {unit} @ ₹{rate}/Qtl
          </span>
        </div>
      </div>

      {/* 6-Step Visual Lifecycle Tracker */}
      <div className="py-3 border-b border-black/[0.06]">
        <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-2">
          e-NAM Escrow Clearinghouse State:
        </span>
        <div className="flex items-center justify-between relative px-1">
          <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
          {TRANSACTION_LIFECYCLE_STEPS.map((step) => {
            const isCompleted = step.id <= currentStep;
            const isCurrent = step.id === currentStep;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                  isCurrent 
                    ? 'bg-[#155E91] text-white ring-4 ring-[#155E91]/20 scale-110' 
                    : isCompleted 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}>
                  {isCompleted ? '✓' : step.id}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-2 px-1">
          <span>1. Issued</span>
          <span>2. Funded</span>
          <span>3. Dispatch</span>
          <span>4. Assay</span>
          <span>5. Accept</span>
          <span>6. Settled</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 pt-2.5 flex items-center justify-between gap-2">
        <button
          onClick={() => onAction?.('VIEW_CONTRACT_NOTE', data)}
          className="text-[#62676D] hover:text-[#17191C] font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View Contract Note</span>
        </button>

        {canPayEscrow ? (
          <button
            onClick={() => onAction?.('PAY_ESCROW', data)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#155E91] hover:bg-[#114B75] text-white font-heading font-extrabold text-xs shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay Escrow (₹{Number(totalEscrow).toLocaleString()})</span>
          </button>
        ) : (
          <button
            onClick={() => onAction?.('VIEW_TRANSACTIONS', data)}
            className="text-[#155E91] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <span>Open in Settlements</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
