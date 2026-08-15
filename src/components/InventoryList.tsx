"use client";

import type { RemittanceRecord } from "@/lib/contract";
import {
  formatIDR,
  formatGold,
  formatTimestamp,
  USDC_TO_IDR_RATE,
  getStellarExpertContractUrl,
} from "@/lib/stellar";
import {
  History,
  ExternalLink,
  RefreshCw,
  Inbox,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

interface RemittanceHistoryProps {
  remittances: RemittanceRecord[];
  loading: boolean;
  onRefresh: () => void;
}

export function RemittanceHistory({
  remittances,
  loading,
  onRefresh,
}: RemittanceHistoryProps) {
  const sorted = [...remittances].reverse();

  return (
    <div className="pundi-card-premium space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-slate-900 leading-tight">
              Riwayat Transaksi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tercatat langsung di Soroban Smart Contract & terverifikasi on-chain
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-600" : ""}`} />
          <span>{loading ? "Memuat..." : "Refresh"}</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 w-full bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-600">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-800">Belum Ada Transaksi</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Setiap kali Anda mengirim uang, bukti transaksi on-chain akan muncul di sini lengkap dengan rincian Rupiah keluarga dan gram emas.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {sorted.map((record) => {
            const totalIDR =
              (Number(record.total_usdc) / 1_000_000) * USDC_TO_IDR_RATE;
            const recipientIDR =
              (Number(record.recipient_amount) / 1_000_000) * USDC_TO_IDR_RATE;
            const goldMg = Number(record.gold_amount_mg);
            const goldGrams = goldMg / 1000;
            const totalUsdc = Number(record.total_usdc);
            const savingsPct =
              totalUsdc > 0
                ? Math.round(
                    ((totalUsdc - Number(record.recipient_amount)) / totalUsdc) *
                      100
                  )
                : 10;
            const familyPct = 100 - savingsPct;

            return (
              <div
                key={record.id.toString()}
                className="py-4 space-y-3 hover:bg-amber-50/20 rounded-2xl px-3 transition-colors"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900 font-display leading-tight">
                        {formatIDR(totalIDR)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatTimestamp(record.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="badge-gold-subtle text-xs">
                      {record.label || "Kiriman"}
                    </span>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      #{record.id.toString().slice(-6)}
                    </p>
                  </div>
                </div>

                {/* Split Breakdown Chips */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">
                      🏦 Keluarga ({familyPct}%)
                    </span>
                    <span className="font-extrabold text-emerald-800">
                      {formatIDR(recipientIDR)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">
                      🪙 Emas ({savingsPct}%)
                    </span>
                    <span className="font-extrabold text-amber-700">
                      +{goldGrams >= 0.001 ? `${goldGrams.toFixed(3)} gr` : formatGold(record.gold_amount_mg)}
                    </span>
                  </div>
                </div>

                {/* Explorer Link */}
                <div className="flex justify-end pt-1">
                  <a
                    href={getStellarExpertContractUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-amber-700 hover:underline"
                  >
                    <span>Verifikasi Bukti di Stellar Expert</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sorted.length > 0 && !loading && (
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>{sorted.length} transaksi on-chain selesai</span>
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Terverifikasi Stellar
          </span>
        </div>
      )}
    </div>
  );
}
