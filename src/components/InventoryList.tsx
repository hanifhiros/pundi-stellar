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
    <div className="card space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              Riwayat Transaksi
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tercatat langsung di Soroban Smart Contract & terverifikasi on-chain
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="btn btn-outline btn-sm text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Memuat..." : "Refresh"}</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-20 w-full" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-700">Belum Ada Transaksi</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Setiap kali Anda mengirim uang lewat Pundi, bukti transaksi on-chain akan muncul di sini beserta pembagian keluarga & tabungan emas.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
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
                className="py-4 space-y-3 hover:bg-gray-50/60 rounded-xl px-2 transition-colors"
              >
                {/* Top Line */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-gray-900 leading-tight">
                        {formatIDR(totalIDR)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTimestamp(record.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="badge-gold text-xs">
                      {record.label || "Kiriman"}
                    </span>
                    <p className="text-[11px] font-mono text-gray-400 mt-1">
                      Tx #{record.id.toString().slice(-6)}
                    </p>
                  </div>
                </div>

                {/* Split Box */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">
                      🏦 Keluarga ({familyPct}%)
                    </span>
                    <span className="font-extrabold text-emerald-800">
                      {formatIDR(recipientIDR)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">
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
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-amber-700 hover:underline"
                  >
                    <span>Cek Bukti di Stellar Expert</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sorted.length > 0 && !loading && (
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>{sorted.length} transaksi on-chain tercatat</span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4" /> Terverifikasi Aman
          </span>
        </div>
      )}
    </div>
  );
}
