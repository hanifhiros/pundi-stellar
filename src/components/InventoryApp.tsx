"use client";

import { useState } from "react";
import { SendRemittanceForm } from "@/components/CreateItemForm";
import { RemittanceHistory } from "@/components/InventoryList";
import { GoldVaultCard } from "@/components/GoldVaultCard";
import { SavingsRuleSetup } from "@/components/SavingsRuleSetup";
import { GuideFaqSection } from "@/components/GuideFaqSection";
import { WalletRequiredBanner } from "@/components/WalletRequiredBanner";
import { usePundi } from "@/hooks/usePundi";
import { useFreighter } from "@/hooks/useFreighter";
import {
  formatGold,
  formatIDR,
  estimateGoldValueIDR,
  USDC_TO_IDR_RATE,
} from "@/lib/stellar";
import {
  Send,
  Sliders,
  Coins,
  History,
  HelpCircle,
  ShieldCheck,
  Zap,
  Sparkles,
  X,
} from "lucide-react";

type TabKey = "kirim" | "aturan" | "dashboard" | "panduan";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "kirim", label: "Kirim Uang", icon: Send },
  { key: "aturan", label: "Aturan Tabungan", icon: Sliders },
  { key: "dashboard", label: "Brankas & Riwayat", icon: Coins },
  { key: "panduan", label: "Panduan & FAQ", icon: HelpCircle },
];

export function InventoryApp() {
  const { connected } = useFreighter();
  const [activeTab, setActiveTab] = useState<TabKey>("kirim");

  const {
    savingsRule,
    remittances,
    totalGoldMg,
    loading: dataLoading,
    actionLoading,
    error,
    message,
    loadData,
    setRule,
    sendRemittance,
    clearFeedback,
  } = usePundi();

  const totalSentIDR = remittances.reduce(
    (acc, r) => acc + (Number(r.total_usdc) / 1_000_000) * USDC_TO_IDR_RATE,
    0
  );
  const goldValueIDR = estimateGoldValueIDR(Number(totalGoldMg));
  const goldGrams = Number(totalGoldMg) / 1000;

  return (
    <div className="space-y-8">
      {/* Wallet Required Notice */}
      <WalletRequiredBanner />

      {/* Global Feedback Banner */}
      {(error || message) && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in ${
            error
              ? "bg-rose-50 border border-rose-200 text-rose-800"
              : "bg-emerald-50 border border-emerald-200 text-emerald-800"
          }`}
        >
          <span className="text-sm font-bold">{error ?? message}</span>
          <button
            type="button"
            onClick={clearFeedback}
            className="p-1 hover:opacity-75 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Stats (Visible when connected with data) */}
      {connected && (remittances.length > 0 || Number(totalGoldMg) > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Terkirim
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 font-display truncate">
              {formatIDR(totalSentIDR)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {remittances.length}× kiriman selesai
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 to-amber-100/40 border border-amber-200/90 shadow-card">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Saldo Emas Fisik
            </p>
            <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1.5 font-display truncate">
              {goldGrams >= 0.001 ? `${goldGrams.toFixed(3)} gram` : formatGold(totalGoldMg)}
            </p>
            <p className="text-xs text-amber-800/80 mt-0.5 font-bold">
              ≈ {formatIDR(goldValueIDR)}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-emerald-100/40 border border-emerald-200/90 shadow-card col-span-2 sm:col-span-1">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Aturan Tabungan
            </p>
            <p className="text-base sm:text-lg font-black text-emerald-950 mt-1.5 font-display truncate">
              {savingsRule ? `${savingsRule.savings_bps / 100}% (${savingsRule.label})` : "10% Default"}
            </p>
            <p className="text-xs text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> On-Chain Soroban
            </p>
          </div>
        </div>
      )}

      {/* Pill Navigation Bar */}
      <div className="flex justify-center">
        <div className="nav-pill-track overflow-x-auto max-w-full">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`nav-pill-btn font-display ${isActive ? "active" : ""}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Views */}
      <div className="pt-2">
        {/* TAB 1: KIRIM UANG */}
        {activeTab === "kirim" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <SendRemittanceForm
                savingsRule={savingsRule}
                onSubmit={sendRemittance}
                loading={actionLoading}
              />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <GoldVaultCard
                totalGoldMg={totalGoldMg}
                remittanceCount={remittances.length}
                goalLabel={savingsRule?.label}
              />
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-3">
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <span>💡</span> Keunggulan Pundi
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Remitansi konvensional memotong biaya 5–6.36%. Di Pundi, biaya hanya ~1% di jaringan Stellar, dan selisihnya otomatis menjadi tabungan emas keluarga Anda.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("panduan")}
                  className="text-xs font-bold text-amber-700 hover:underline inline-flex items-center gap-1"
                >
                  Pelajari alur cara kerja & FAQ →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATURAN TABUNGAN */}
        {activeTab === "aturan" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <SavingsRuleSetup
                existingRule={savingsRule}
                onSave={setRule}
                loading={actionLoading}
                totalGoldMg={totalGoldMg}
              />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <GoldVaultCard
                totalGoldMg={totalGoldMg}
                remittanceCount={remittances.length}
                goalLabel={savingsRule?.label}
              />
            </div>
          </div>
        )}

        {/* TAB 3: DASHBOARD & RIWAYAT */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <GoldVaultCard
                totalGoldMg={totalGoldMg}
                remittanceCount={remittances.length}
                goalLabel={savingsRule?.label}
              />
            </div>
            <div className="lg:col-span-7">
              <RemittanceHistory
                remittances={remittances}
                loading={dataLoading}
                onRefresh={loadData}
              />
            </div>
          </div>
        )}

        {/* TAB 4: PANDUAN & FAQ */}
        {activeTab === "panduan" && <GuideFaqSection />}
      </div>
    </div>
  );
}
