"use client";

import { useState } from "react";
import {
  formatGold,
  formatIDR,
  estimateGoldValueIDR,
  getStellarExpertContractUrl,
} from "@/lib/stellar";
import {
  ShieldCheck,
  ExternalLink,
  ArrowDownLeft,
  Coins,
  CheckCircle2,
} from "lucide-react";

interface GoldVaultCardProps {
  totalGoldMg: bigint;
  remittanceCount: number;
  goalLabel?: string;
}

export function GoldVaultCard({
  totalGoldMg,
  remittanceCount,
  goalLabel,
}: GoldVaultCardProps) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNotice, setWithdrawNotice] = useState<string | null>(null);

  const mg = Number(totalGoldMg);
  const grams = mg / 1000;
  const valueIDR = estimateGoldValueIDR(mg);
  const hasGold = mg > 0;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const reqGrams = parseFloat(withdrawAmount) || 0;
    if (reqGrams <= 0 || reqGrams > grams) {
      setWithdrawNotice("Nominal gram tidak valid atau melebihi saldo emas.");
      return;
    }
    const payoutIDR = (reqGrams / grams) * valueIDR;
    setWithdrawNotice(
      `Sukses! Simulasi penarikan ${reqGrams} gram emas berhasil. Dana setara ${formatIDR(
        payoutIDR
      )} diteruskan ke rekening bank via BI-FAST.`
    );
    setWithdrawAmount("");
  };

  return (
    <div className="pundi-card-gold-premium space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-xl">
            🪙
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 font-display">
              Brankas Emas Saya
            </h2>
            <p className="text-xs text-amber-900/70 font-medium">
              Emas Murni Fisik LBMA 99.99% · Matrixdock
            </p>
          </div>
        </div>
        <span className="badge-gold-subtle">
          <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi
        </span>
      </div>

      {/* Gold Balance Figure */}
      <div className="p-5 rounded-2xl bg-white/90 border border-amber-200/90 shadow-2xs space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider">
            Total Saldo Emas
          </span>
          {goalLabel && (
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
              Tujuan: {goalLabel}
            </span>
          )}
        </div>

        {hasGold ? (
          <div className="pt-1">
            <p className="text-3xl sm:text-4xl font-black text-amber-600 font-display tracking-tight">
              {grams >= 0.001
                ? `${grams.toLocaleString("id-ID", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })} gram`
                : formatGold(totalGoldMg)}
            </p>
            <p className="text-base font-bold text-slate-800 mt-1">
              ≈ {formatIDR(valueIDR)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Nilai Rupiah mengikuti harga emas dunia secara real-time
            </p>
          </div>
        ) : (
          <div className="py-2 space-y-1">
            <p className="text-base font-bold text-slate-800">
              Belum ada emas tersimpan
            </p>
            <p className="text-xs text-slate-500">
              Kirim uang pertama Anda untuk mulai menabung emas secara otomatis.
            </p>
          </div>
        )}
      </div>

      {/* 3 Metric Badges */}
      <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100/80">
          <p className="text-[11px] text-slate-500 font-semibold">Total Kiriman</p>
          <p className="text-base font-black text-slate-900 mt-0.5">{remittanceCount}×</p>
        </div>
        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/80">
          <p className="text-[11px] text-emerald-700 font-semibold">Biaya Kirim</p>
          <p className="text-base font-black text-emerald-700 mt-0.5">~1%</p>
        </div>
        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100/80">
          <p className="text-[11px] text-slate-500 font-semibold">Biaya Jaringan</p>
          <p className="text-base font-black text-slate-900 mt-0.5">~$0.000003</p>
        </div>
      </div>

      {/* Withdraw simulation */}
      <div className="space-y-3 pt-1 border-t border-amber-200/60">
        {hasGold && (
          <button
            type="button"
            onClick={() => setShowWithdraw(!showWithdraw)}
            className="w-full py-2.5 px-4 rounded-xl border border-amber-300 bg-white hover:bg-amber-50/50 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
          >
            <ArrowDownLeft className="w-4 h-4 text-amber-600" />
            <span>{showWithdraw ? "Tutup Menu Tarik" : "Tarik Tabungan Emas (Kapan Saja)"}</span>
          </button>
        )}

        {showWithdraw && hasGold && (
          <form
            onSubmit={handleWithdraw}
            className="p-4 rounded-xl bg-white border border-amber-300 space-y-3 animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🏧</span>
              <p className="text-xs font-bold text-slate-900">
                Pencairan Emas ke Rekening / DANA
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Tidak ada kunci waktu atau biaya penalti:
            </p>

            <div className="flex gap-2">
              <input
                type="number"
                step="0.001"
                max={grams}
                min="0.001"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={`Maks: ${grams.toFixed(3)} gr`}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0"
              >
                Cairkan
              </button>
            </div>

            {withdrawNotice && (
              <div
                className={`p-3 rounded-lg text-xs ${
                  withdrawNotice.startsWith("Sukses")
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {withdrawNotice}
              </div>
            )}
          </form>
        )}

        <div className="flex items-center justify-between text-xs pt-1">
          <a
            href="https://www.matrixdock.com/products/xaum"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-800 font-bold hover:underline"
          >
            <span>Audit Emas Matrixdock</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
          </a>

          <a
            href={getStellarExpertContractUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-500 font-bold hover:underline"
          >
            <span>Smart Contract di Stellar</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
