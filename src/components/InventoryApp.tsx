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
  { key: "dashboard", label: "Saldo & Riwayat", icon: Coins },
  { key: "panduan", label: "Bantuan", icon: HelpCircle },
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
    <div className="space-y-6 sm:space-y-8">
      {/* Wallet Required Notice */}
      <WalletRequiredBanner />

      {/* Global Feedback Banner */}
      {(error || message) && (
        <div
          className={`p-5 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in shadow-sm ${
            error
              ? "bg-rose-50 border border-rose-200 text-rose-800"
              : "bg-emerald-50 border border-emerald-200 text-emerald-800"
          }`}
        >
          <span className="text-base font-bold">{error ?? message}</span>
          <button
            type="button"
            onClick={clearFeedback}
            className="p-1.5 hover:opacity-75 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <section className="rounded-2xl bg-gradient-to-br from-amber-100 via-amber-50 to-white border border-amber-200 px-6 py-6 sm:px-8 sm:py-8 shadow-sm">
        <p className="text-sm font-bold text-amber-800 uppercase tracking-widest">Kirim uang untuk keluarga, otomatis menabung emas.</p>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 mt-2 leading-tight">Semua bisa dilakukan dengan 3 langkah sederhana.</h1>
        <p className="text-base text-slate-600 mt-3 max-w-2xl leading-relaxed">Pilih menu di bawah. Kami akan menunjukkan dengan sangat transparan berapa uang yang diterima keluarga dan berapa yang menjadi tabungan emas fisik murni.</p>
      </section>

      {/* Pill Navigation Bar */}
      <div className="flex justify-center my-6">
        <div className="nav-pill-track grid grid-cols-2 sm:flex w-full sm:w-auto gap-2 p-1.5 bg-slate-100/80 rounded-2xl sm:rounded-full">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`nav-pill-btn font-display w-full justify-center sm:w-auto ${
                  isActive ? "active bg-white shadow-sm" : "hover:bg-slate-200/50"
                } rounded-xl sm:rounded-full`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-amber-600" : "text-slate-400"}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Views */}
      <div className="pt-2">
        {/* TAB 1: KIRIM UANG */}
        {activeTab === "kirim" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
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
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> Mengapa Pundi?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Biaya kiriman konvensional memotong hingga 5-6%. Di Pundi, biaya hanya ~1%, dan selisihnya langsung menjadi tabungan emas fisik murni (LBMA 99.99%) untuk masa depan Anda dan keluarga.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("panduan")}
                  className="text-xs font-bold text-amber-700 hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
                >
                  Pelajari cara kerja & FAQ →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATURAN TABUNGAN */}
        {activeTab === "aturan" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <SavingsRuleSetup
              existingRule={savingsRule}
              onSave={setRule}
              loading={actionLoading}
              totalGoldMg={totalGoldMg}
            />
          </div>
        )}

        {/* TAB 3: DASHBOARD & RIWAYAT */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Hero Stats */}
            {connected && (remittances.length > 0 || Number(totalGoldMg) > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm">
                  <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest">
                    Total Terkirim
                  </p>
                  <p className="text-xl sm:text-3xl font-black text-slate-900 mt-2 font-display truncate">
                    {formatIDR(totalSentIDR)}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                    {remittances.length}× kiriman selesai
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-50/90 to-amber-100/40 border border-amber-200/90 shadow-sm">
                  <p className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-widest">
                    Saldo Emas Fisik
                  </p>
                  <p className="text-xl sm:text-3xl font-black text-amber-600 mt-2 font-display truncate">
                    {goldGrams >= 0.001 ? `${goldGrams.toFixed(3)} gram` : formatGold(totalGoldMg)}
                  </p>
                  <p className="text-xs sm:text-sm text-amber-800/80 mt-1 font-bold">
                    ≈ {formatIDR(goldValueIDR)}
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-50/90 to-emerald-100/40 border border-emerald-200/90 shadow-sm col-span-2 sm:col-span-1">
                  <p className="text-xs sm:text-sm font-bold text-emerald-800 uppercase tracking-widest">
                    Aturan Tabungan
                  </p>
                  <p className="text-lg sm:text-2xl font-black text-emerald-950 mt-2 font-display truncate">
                    {savingsRule ? `${savingsRule.savings_bps / 100}% (${savingsRule.label})` : "10% Default"}
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-700 font-bold mt-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Otomatis Aktif
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
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
          </div>
        )}

        {/* TAB 4: PANDUAN & FAQ */}
        {activeTab === "panduan" && <GuideFaqSection />}
      </div>
    </div>
  );
}
