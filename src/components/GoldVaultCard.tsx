"use client";

import { useState } from "react";
import {
  formatGold,
  formatIDR,
  estimateGoldValueIDR,
  getStellarExpertContractUrl,
} from "@/lib/stellar";
import {
  Coins,
  ShieldCheck,
  ExternalLink,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
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
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawGrams, setWithdrawGrams] = useState("");
  const [withdrawStatus, setWithdrawStatus] = useState<string | null>(null);

  const mg = Number(totalGoldMg);
  const grams = mg / 1000;
  const valueIDR = estimateGoldValueIDR(mg);
  const hasGold = mg > 0;

  const handleSimulateWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const reqGrams = parseFloat(withdrawGrams) || 0;
    if (reqGrams <= 0 || reqGrams > grams) {
      setWithdrawStatus("Nominal gram tidak valid atau melebihi saldo.");
      return;
    }
    const payoutIDR = (reqGrams / grams) * valueIDR;
    setWithdrawStatus(
      `Sukses! Simulasi penarikan ${reqGrams} gram emas berhasil. Dana setara ${formatIDR(
        payoutIDR
      )} diteruskan ke rekening bank via BI-FAST.`
    );
    setWithdrawGrams("");
  };

  return (
    <div className="card-gold space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100/80 border border-amber-300 flex items-center justify-center text-amber-700">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900">
              Brankas Emas Saya
            </h2>
            <p className="text-xs text-amber-700 font-medium">
              Emas Murni Fisik 99.99% · Dikelola Matrixdock
            </p>
          </div>
        </div>
        <span className="badge-gold bg-amber-100/60 border-amber-300 text-amber-800">
          <ShieldCheck className="w-3.5 h-3.5" /> LBMA 99.99%
        </span>
      </div>

      {/* Main Gold Valuation */}
      <div className="p-4 rounded-2xl bg-white/80 border border-amber-200/80 shadow-xs space-y-2">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Total Tabungan Emas
          </span>
          {goalLabel && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Untuk: {goalLabel}
            </span>
          )}
        </div>

        {hasGold ? (
          <div>
            <p className="text-3xl sm:text-4xl font-black text-amber-600 tracking-tight leading-none">
              {grams >= 0.001
                ? `${grams.toLocaleString("id-ID", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })} gram`
                : formatGold(totalGoldMg)}
            </p>
            <p className="text-lg font-bold text-gray-800 mt-2">
              ≈ {formatIDR(valueIDR)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Nilai Rupiah mengikuti harga emas dunia secara real-time
            </p>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-base font-bold text-gray-700">
              Belum ada emas tersimpan
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Kirim uang pertama Anda sekarang untuk mulai mengumpulkan emas otomatis.
            </p>
          </div>
        )}
      </div>

      {/* Key Metric Stats Grid */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-amber-200/60 text-center">
        <div className="p-2.5 bg-amber-50/50 rounded-xl">
          <p className="text-[11px] text-gray-500 font-medium">Total Kiriman</p>
          <p className="text-base font-black text-gray-900 mt-0.5">
            {remittanceCount}×
          </p>
        </div>
        <div className="p-2.5 bg-emerald-50/50 rounded-xl">
          <p className="text-[11px] text-emerald-700 font-medium">Biaya Kirim</p>
          <p className="text-base font-black text-emerald-700 mt-0.5">~1%</p>
        </div>
        <div className="p-2.5 bg-amber-50/50 rounded-xl">
          <p className="text-[11px] text-gray-500 font-medium">Biaya Jaringan</p>
          <p className="text-base font-black text-gray-900 mt-0.5">~$0.000003</p>
        </div>
      </div>

      {/* Withdraw & Verification Action Buttons */}
      <div className="space-y-3 pt-1">
        {hasGold && (
          <div>
            <button
              type="button"
              onClick={() => setShowWithdrawModal(!showWithdrawModal)}
              className="btn btn-outline w-full h-11 text-xs font-bold border-amber-300 text-amber-900 hover:bg-amber-100/50 flex items-center justify-center gap-1.5"
            >
              <ArrowDownLeft className="w-4 h-4 text-amber-600" />
              <span>
                {showWithdrawModal ? "Tutup Menu Tarik" : "Tarik Tabungan Emas (Kapan Saja)"}
              </span>
            </button>
          </div>
        )}

        {/* Withdraw Simulation Box */}
        {showWithdrawModal && hasGold && (
          <form
            onSubmit={handleSimulateWithdraw}
            className="p-4 rounded-xl bg-white border border-amber-300 space-y-3 animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🏧</span>
              <p className="text-xs font-bold text-gray-900">
                Pencairan Emas ke Rekening / DANA
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Tidak ada kunci waktu atau penalti. Masukkan gram emas yang ingin dicairkan:
            </p>

            <div className="flex gap-2">
              <input
                type="number"
                step="0.001"
                max={grams}
                min="0.001"
                value={withdrawGrams}
                onChange={(e) => setWithdrawGrams(e.target.value)}
                placeholder={`Maks: ${grams.toFixed(3)} gr`}
                className="pundi-input h-10 text-xs font-bold"
              />
              <button
                type="submit"
                className="btn btn-gold h-10 px-4 text-xs font-bold shrink-0"
              >
                Cairkan
              </button>
            </div>

            {withdrawStatus && (
              <div
                className={`p-3 rounded-lg text-xs ${
                  withdrawStatus.startsWith("Sukses")
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {withdrawStatus}
              </div>
            )}
          </form>
        )}

        {/* External Matrixdock Proof Links */}
        <div className="flex items-center justify-between text-xs pt-1">
          <a
            href="https://www.matrixdock.com/products/xaum"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-800 font-semibold hover:underline"
          >
            <span>Audit Emas Fisik Matrixdock</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
          </a>

          <a
            href={getStellarExpertContractUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gray-500 font-semibold hover:underline"
          >
            <span>Smart Contract di Stellar</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
