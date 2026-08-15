"use client";

import { FormEvent, useState, useEffect } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import type { SavingsRule } from "@/lib/contract";
import { FlagIcon } from "@/components/FlagIcon";
import {
  formatIDR,
  formatGold,
  USDC_TO_IDR_RATE,
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
  getStellarExpertContractUrl,
} from "@/lib/stellar";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface SendRemittanceFormProps {
  savingsRule: SavingsRule | null;
  onSubmit: (params: { total_usdc: bigint; label: string }) => Promise<void>;
  loading: boolean;
}

export function SendRemittanceForm({
  savingsRule,
  onSubmit,
  loading,
}: SendRemittanceFormProps) {
  const { connected, connect } = useFreighter();

  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState("SGD");
  const [amount, setAmount] = useState("500");
  const [label, setLabel] = useState(savingsRule?.label ?? "Kiriman Bulanan");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [lastTxSuccess, setLastTxSuccess] = useState<{
    familyIDR: number;
    goldGrams: number;
    totalSentFormatted: string;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (savingsRule?.label) setLabel(savingsRule.label);
  }, [savingsRule?.label]);

  const currency: SupportedCurrency =
    SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrencyCode) ??
    SUPPORTED_CURRENCIES[0];

  const savingsBps = savingsRule?.savings_bps ?? 1000; // 10% default
  const savingsPct = savingsBps / 100;
  const familyPct = 100 - savingsPct;

  const numAmount = parseFloat(amount) || 0;
  const usdcAmount = numAmount * currency.rateToUSDC;
  const familyIDR = ((usdcAmount * familyPct) / 100) * USDC_TO_IDR_RATE;
  const goldMg =
    usdcAmount > 0
      ? ((usdcAmount * savingsPct) / 100 / 3312) * 31_103.5
      : 0;
  const goldGrams = goldMg / 1000;
  const goldIDR = ((usdcAmount * savingsPct) / 100) * USDC_TO_IDR_RATE;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLastTxSuccess(null);

    if (!connected) {
      try {
        await connect();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyambungkan wallet.");
      }
      return;
    }

    if (!amount || numAmount <= 0) {
      setError("Masukkan nominal kiriman yang valid.");
      return;
    }
    if (usdcAmount < 1) {
      setError("Nominal terlalu kecil. Minimum setara 1 USDC.");
      return;
    }

    const totalMicroUsdc = BigInt(Math.round(usdcAmount * 1_000_000));
    setSending(true);
    try {
      await onSubmit({ total_usdc: totalMicroUsdc, label });
      setLastTxSuccess({
        familyIDR,
        goldGrams,
        totalSentFormatted: `${currency.symbol} ${numAmount.toLocaleString("id-ID")}`,
        label,
      });
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim kiriman.");
    } finally {
      setSending(false);
    }
  };

  const isProcessing = loading || sending;

  return (
    <div>
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="pundi-title">Kirim Uang</h1>
        <p className="pundi-subtitle">Kirim ke keluarga, otomatis tabung emas</p>
      </div>

      {/* Main Form Card */}
      <div className="pundi-card">
        {/* Success Modal / Notification */}
        {lastTxSuccess && (
          <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-4">
            <div className="flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-emerald-950">
                  Kiriman Berhasil Terkirim!
                </h3>
                <p className="text-xs text-emerald-700">
                  Transaksi telah dieksekusi di Stellar Soroban Testnet.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-emerald-200">
                <p className="text-xs text-slate-500 font-medium">Diterima Keluarga</p>
                <p className="text-lg font-black text-emerald-700 mt-1">
                  {formatIDR(lastTxSuccess.familyIDR)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">via BI-FAST / DANA</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200">
                <p className="text-xs text-slate-500 font-medium">Tabungan Emas</p>
                <p className="text-lg font-black text-amber-600 mt-1">
                  +{lastTxSuccess.goldGrams.toFixed(3)} gr
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tujuan: {lastTxSuccess.label}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-emerald-200/70">
              <a
                href={getStellarExpertContractUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline"
              >
                <span>Cek Bukti di Stellar Expert</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setLastTxSuccess(null)}
                className="text-xs text-emerald-700 font-medium hover:underline"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Negara Kerja */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">
              Negara Kerja
            </label>
            <div className="country-grid">
              {SUPPORTED_CURRENCIES.map((c) => {
                const isSelected = c.code === selectedCurrencyCode;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCurrencyCode(c.code)}
                    disabled={isProcessing}
                    className={`country-btn ${isSelected ? "selected" : ""}`}
                  >
                    <FlagIcon code={c.code} className="w-7 h-7" />
                    <span className="code">{c.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nominal Kiriman */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="remittance-amount"
                className="text-xs font-bold text-slate-600"
              >
                Nominal Kiriman
              </label>
              <span className="text-xs font-semibold text-slate-400">
                1 {currency.code} ≈ {(currency.rateToUSDC * USDC_TO_IDR_RATE).toLocaleString("id-ID")} IDR
              </span>
            </div>

            <div className="pundi-input-group">
              <div className="pundi-input-prefix">
                {currency.code}
              </div>
              <input
                id="remittance-amount"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                disabled={isProcessing}
                className="pundi-input-control"
              />
            </div>

            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 font-medium">
              <FlagIcon code={currency.code} className="w-4 h-4" />
              <span>{currency.name}</span>
            </div>
          </div>

          {/* Transparent Live Breakdown */}
          {numAmount > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Estimasi Transparan
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  Total Biaya: <strong>~1%</strong> (Hemat vs 5-6%)
                </span>
              </div>

              {/* Split Bar */}
              <div>
                <div className="split-track">
                  <div
                    className="split-seg-green"
                    style={{ width: `${familyPct}%` }}
                  />
                  <div
                    className="split-seg-gold"
                    style={{ width: `${savingsPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold mt-1.5">
                  <span className="text-emerald-700">Keluarga: {familyPct}%</span>
                  <span className="text-amber-700">Tabungan Emas: {savingsPct}%</span>
                </div>
              </div>

              {/* 2 Result Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-white rounded-xl border border-emerald-200">
                  <p className="text-xs font-medium text-slate-500">
                    🏦 Diterima Keluarga ({familyPct}%)
                  </p>
                  <p className="text-xl font-black text-emerald-700 mt-1">
                    {formatIDR(familyIDR)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sampai utuh via BI-FAST / DANA
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-amber-200">
                  <p className="text-xs font-medium text-slate-500">
                    🪙 Tabungan Emas ({savingsPct}%)
                  </p>
                  <p className="text-xl font-black text-amber-600 mt-1">
                    {goldGrams >= 0.001 ? `${goldGrams.toFixed(3)} gram` : formatGold(goldMg)}
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                    ≈ {formatIDR(goldIDR)} (Emas Fisik 99.99%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Big Green Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="btn-kirim-pundi"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses Kiriman...</span>
              </>
            ) : (
              <span>Kirim Sekarang</span>
            )}
          </button>

          {/* Footer note */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Mode Demo / Testnet — Transaksi nyata di blockchain Stellar
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Anchor fiat (SGD/IDR) & swap XAUm disimulasikan
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
