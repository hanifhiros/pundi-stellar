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
  Zap,
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
    <div className="pundi-card-premium space-y-8">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-black text-2xl text-slate-900 leading-tight">
              Kirim Uang
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Sebagian otomatis menjadi tabungan emas keluarga
            </p>
          </div>
        </div>
        <span className="badge-green-subtle hidden sm:inline-flex px-4 py-2 text-sm font-bold shadow-sm">
          <Zap className="w-4 h-4" /> Sampai Seketika
        </span>
      </div>

      {/* Success Receipt Modal */}
      {lastTxSuccess && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-6 animate-in fade-in shadow-sm">
          <div className="flex items-center gap-4 text-emerald-900">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-black text-xl text-emerald-950">
                Uang Berhasil Terkirim!
              </h3>
              <p className="text-sm text-emerald-700 mt-1 font-medium">
                Keluarga Anda telah menerima dana, dan tabungan emas sudah tercatat dengan aman.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 bg-white rounded-xl border border-emerald-200 shadow-sm">
              <p className="text-xs text-slate-500 font-bold tracking-wide uppercase mb-1">Diterima Keluarga</p>
              <p className="text-2xl font-black text-emerald-700 mt-1 font-display">
                {formatIDR(lastTxSuccess.familyIDR)}
              </p>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">Masuk ke rekening tujuan</p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-amber-200 shadow-sm">
              <p className="text-xs text-slate-500 font-bold tracking-wide uppercase mb-1">Tabungan Emas Fisik</p>
              <p className="text-2xl font-black text-amber-600 mt-1 font-display">
                +{lastTxSuccess.goldGrams.toFixed(3)} gr
              </p>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">Tujuan: {lastTxSuccess.label}</p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-emerald-200/70">
            <button
              type="button"
              onClick={() => setLastTxSuccess(null)}
              className="text-sm text-emerald-700 font-bold hover:text-emerald-900 transition-colors px-4 py-2 rounded-lg hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-500 w-full sm:w-auto text-center"
            >
              Kirim Lagi
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* 1. Negara Kerja */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">1</span>
            Pilih Negara Kerja
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SUPPORTED_CURRENCIES.map((c) => {
              const isSelected = c.code === selectedCurrencyCode;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCurrencyCode(c.code)}
                  disabled={isProcessing}
                  className={`country-chip focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${isSelected ? "active" : ""}`}
                >
                  <FlagIcon code={c.code} className="w-7 h-7 mb-1" />
                  <div className="text-center min-w-0 w-full">
                    <p className="text-sm font-black text-slate-900 leading-tight">
                      {c.code}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                      {c.country}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Nominal Input */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <label
              htmlFor="remittance-amount"
              className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2"
            >
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs shrink-0">2</span>
              Nominal Kiriman ({currency.code})
            </label>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
              1 {currency.code} ≈ {(currency.rateToUSDC * USDC_TO_IDR_RATE).toLocaleString("id-ID")} IDR
            </span>
          </div>

          <div className="pundi-input-box h-16 shadow-sm rounded-2xl flex items-center focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 overflow-hidden">
            <div className="px-5 bg-slate-50 h-full flex items-center gap-3 border-r border-slate-200 shrink-0">
              <FlagIcon code={currency.code} className="w-6 h-6" />
              <span className="font-black text-slate-800 text-xl">
                {currency.code}
              </span>
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
              className="w-full h-full px-5 text-3xl font-black text-slate-900 bg-transparent outline-none font-display placeholder:text-slate-300"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-xs text-slate-400 font-bold mr-1 uppercase tracking-wide">Pilih Cepat:</span>
            {[200, 500, 1000, 2000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none text-slate-700 text-sm font-bold transition-colors"
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Keterangan */}
        <div>
          <label
            htmlFor="remittance-label"
            className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2"
          >
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">3</span>
            Keterangan (Opsional)
          </label>
          <input
            id="remittance-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="misal: Kiriman Bulan Agustus, Sekolah Anak"
            disabled={isProcessing}
            maxLength={32}
            className="w-full h-14 px-5 border border-slate-200 rounded-2xl text-base font-medium text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 transition-all bg-white shadow-sm"
          />
        </div>

        {/* Transparent Live Breakdown */}
        {numAmount > 0 && (
          <div className="p-6 sm:p-8 rounded-[24px] bg-slate-50 border border-slate-200/80 space-y-6 shadow-sm mt-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Rincian Kiriman
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/50 px-3 py-1.5 rounded-lg border border-emerald-200/50">
                Biaya Sangat Murah (~1%)
              </span>
            </div>

            {/* Split Meter Bar */}
            <div className="space-y-3">
              <div className="split-meter h-3 shadow-inner bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${familyPct}%` }}
                />
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: `${savingsPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-emerald-700">Diterima: {familyPct}%</span>
                <span className="text-amber-700">Ditabung: {savingsPct}%</span>
              </div>
            </div>

            {/* 2 Big Outcome Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-5 bg-white rounded-2xl border border-emerald-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                <p className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-1">
                  Uang Untuk Keluarga
                </p>
                <p className="text-2xl font-black text-emerald-700 mt-2 font-display">
                  {formatIDR(familyIDR)}
                </p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Utuh masuk rekening via BI-FAST / DANA
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                <p className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-1">
                  Tabungan Emas Murni
                </p>
                <p className="text-2xl font-black text-amber-600 mt-2 font-display">
                  {goldGrams >= 0.001 ? `${goldGrams.toFixed(3)} gram` : formatGold(goldMg)}
                </p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Pundi menyimpan otomatis (≈ {formatIDR(goldIDR)})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Big Gold Action Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="btn-gold-action font-display"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses Transaksi di Stellar...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Kirim Sekarang</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
