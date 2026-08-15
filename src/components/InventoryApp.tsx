"use client";

import { useState } from "react";
import { SendRemittanceForm } from "@/components/CreateItemForm";
import { RemittanceHistory } from "@/components/InventoryList";
import { GoldVaultCard } from "@/components/GoldVaultCard";
import { SavingsRuleSetup } from "@/components/SavingsRuleSetup";
import { GuideFaqSection } from "@/components/GuideFaqSection";
import { usePundi } from "@/hooks/usePundi";
import { useFreighter } from "@/hooks/useFreighter";
import { shortenAddress } from "@/lib/stellar";
import {
  Send,
  Sliders,
  LayoutDashboard,
  HelpCircle,
  Globe,
  Wallet,
  LogOut,
} from "lucide-react";

type NavTab = "kirim" | "aturan" | "dashboard" | "panduan";

const MENU_ITEMS = [
  { id: "kirim" as NavTab, label: "Kirim Uang", icon: Send },
  { id: "aturan" as NavTab, label: "Aturan Nabung", icon: Sliders },
  { id: "dashboard" as NavTab, label: "Dashboard", icon: LayoutDashboard },
  { id: "panduan" as NavTab, label: "Panduan & FAQ", icon: HelpCircle },
];

export function InventoryApp() {
  const [activeTab, setActiveTab] = useState<NavTab>("kirim");
  const { connected, address, connect, disconnect, loading: walletLoading } = useFreighter();

  const {
    savingsRule,
    remittances,
    totalGoldMg,
    loading: dataLoading,
    actionLoading,
    loadData,
    setRule,
    sendRemittance,
  } = usePundi();

  return (
    <div className="pundi-layout">
      {/* ── Left Sidebar (Desktop & Mobile Drawer) ── */}
      <aside className="pundi-sidebar">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
              p
            </div>
            <span className="text-2xl font-black text-emerald-800 tracking-tight">
              pundi
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 font-extrabold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-emerald-700" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Footer Info */}
        <div className="pt-5 border-t border-slate-200 space-y-3">
          {/* Wallet Status Card */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> Dompet
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                Testnet
              </span>
            </div>

            {connected && address ? (
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="min-w-0">
                  <p className="text-xs font-mono font-bold text-slate-800 truncate">
                    {shortenAddress(address)}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                    Tersambung
                  </p>
                </div>
                <button
                  type="button"
                  onClick={disconnect}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                  title="Putus Sambungan"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={connect}
                disabled={walletLoading}
                className="w-full mt-1 py-1.5 px-3 bg-white hover:bg-slate-100 text-emerald-800 border border-slate-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sambung Wallet</span>
              </button>
            )}
          </div>

          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5" />
              <span>Bahasa: <strong>Indonesia (ID)</strong></span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Ditenagai oleh Stellar Soroban. Transaksi tercatat aman on-chain.
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main Canvas (Centered with Whitespace) ── */}
      <main className="pundi-main">
        <div className="pundi-container">
          {/* TAB 1: KIRIM UANG */}
          {activeTab === "kirim" && (
            <SendRemittanceForm
              savingsRule={savingsRule}
              onSubmit={sendRemittance}
              loading={actionLoading}
            />
          )}

          {/* TAB 2: ATURAN NABUNG */}
          {activeTab === "aturan" && (
            <SavingsRuleSetup
              existingRule={savingsRule}
              onSave={setRule}
              loading={actionLoading}
              totalGoldMg={totalGoldMg}
            />
          )}

          {/* TAB 3: DASHBOARD & RIWAYAT */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h1 className="pundi-title">Dashboard</h1>
                <p className="pundi-subtitle">
                  Pantau tabungan emas dan tarik kapan saja
                </p>
              </div>

              <GoldVaultCard
                totalGoldMg={totalGoldMg}
                remittanceCount={remittances.length}
                goalLabel={savingsRule?.label}
              />

              <RemittanceHistory
                remittances={remittances}
                loading={dataLoading}
                onRefresh={loadData}
              />
            </div>
          )}

          {/* TAB 4: PANDUAN & FAQ */}
          {activeTab === "panduan" && (
            <div className="space-y-6">
              <div>
                <h1 className="pundi-title">Panduan & Tanya Jawab</h1>
                <p className="pundi-subtitle">
                  Pelajari cara kerja Pundi dan jawaban lengkap seputar keamanan
                </p>
              </div>
              <GuideFaqSection />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
