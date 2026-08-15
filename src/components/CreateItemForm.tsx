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
    <div className="pundi-card-premium space-y-6">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 leading-tight">
              Kirim Uang
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              {savingsPct}% otomatis menjadi tabungan emas keluarga
            </p>
          </div>
        </div>
        <span className="badge-green-subtle hidden sm:inline-flex px-3 py-1.5 text-xs font-bold shadow-xs">
          <Zap className="w-3.5 h-3.5" /> Seketika ~5 detik
        </span>
      </div>

      {/* Success Receipt Modal */}
      {lastTxSuccess && (
        <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-4 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-3 text-emerald-900">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-black text-lg text-emerald-950">
                Uang Berhasil Terkirim!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-700 font-medium">
                Keluarga telah menerima dana, dan tabungan emas tersimpan dengan aman.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs">
              <p className="text-[11px] text-slate-400 font-bold tracking-wider uppercase">Diterima Keluarga</p>
              <p className="text-xl font-black text-emerald-700 mt-1 font-display">
                {formatIDR(lastTxSuccess.familyIDR)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">via BI-FAST / DANA</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-xs">
              <p className="text-[11px] text-slate-400 font-bold tracking-wider uppercase">Tabungan Emas Fisik</p>
              <p className="text-xl font-black text-amber-600 mt-1 font-display">
                +{lastTxSuccess.goldGrams.toFixed(3)} gr
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Tujuan: {lastTxSuccess.label}</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-emerald-200/70">
            <button
              type="button"
              onClick={() => setLastTxSuccess(null)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Tutup Rincian
            </button>
            <a
              href={getStellarExpertContractUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
            >
              <span>Bukti Transaksi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Negara Kerja */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-black text-[11px] flex items-center justify-center shrink-0">
              1
            </span>
            <label className="text-xs font-black uppercase tracking-wider text-slate-600">
              Pilih Negara Kerja
            </label>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-2.5">
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
                  <FlagIcon code={c.code} className="w-7 h-7" />
                  <div className="text-center min-w-0 w-full mt-1">
                    <p className="text-xs font-black text-slate-900 leading-tight">
                      {c.code}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                      {c.country}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Nominal Input */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-black text-[11px] flex items-center justify-center shrink-0">
                2
              </span>
              <label
                htmlFor="remittance-amount"
                className="text-xs font-black uppercase tracking-wider text-slate-600"
              >
                Nominal Kiriman ({currency.code})
              </label>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              1 {currency.code} ≈ {(currency.rateToUSDC * USDC_TO_IDR_RATE).toLocaleString("id-ID")} IDR
            </span>
          </div>

          <div className="pundi-input-box h-14 shadow-xs rounded-xl flex items-center focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 overflow-hidden bg-white border border-slate-300">
            <div className="px-4 bg-slate-50 h-full flex items-center gap-2.5 border-r border-slate-200 shrink-0">
              <FlagIcon code={currency.code} className="w-5 h-5" />
              <span className="font-black text-slate-800 text-base">
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
              className="w-full h-full px-4 text-2xl font-black text-slate-900 bg-transparent outline-none font-display placeholder:text-slate-300"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-bold mr-1 uppercase tracking-wider">Cepat:</span>
            {[200, 500, 1000, 2000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                {val} {currency.code}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Keterangan */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-black text-[11px] flex items-center justify-center shrink-0">
              3
            </span>
            <label
              htmlFor="remittance-label"
              className="text-xs font-black uppercase tracking-wider text-slate-600"
            >
              Keterangan (Opsional)
            </label>
          </div>
          <input
            id="remittance-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="misal: Kiriman Bulanan, Tabungan Anak"
            disabled={isProcessing}
            maxLength={32}
            className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 transition-all bg-white shadow-xs"
          />
        </div>

        {/* Transparent Live Breakdown */}
        {numAmount > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Rincian Transparan
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Hemat Biaya ~1%
              </span>
            </div>

            {/* Split Meter Bar */}
            <div className="space-y-2">
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${familyPct}%` }}
                />
                <div
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${savingsPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                <span className="text-emerald-700">Keluarga ({familyPct}%)</span>
                <span className="text-amber-700">Tabungan Emas ({savingsPct}%)</span>
              </div>
            </div>

            {/* 2 Big Outcome Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-emerald-200 shadow-xs space-y-0.5">
                <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  Diterima Keluarga ({familyPct}%)
                </p>
                <p className="text-xl sm:text-2xl font-black text-emerald-700 font-display">
                  {formatIDR(familyIDR)}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  via BI-FAST / DANA
                </p>
              </div>

              <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-amber-200 shadow-xs space-y-0.5">
                <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  Tabungan Emas ({savingsPct}%)
                </p>
                <p className="text-xl sm:text-2xl font-black text-amber-600 font-display">
                  {goldGrams >= 0.001 ? `${goldGrams.toFixed(3)} gr` : formatGold(goldMg)}
                </p>
                <p className="text-[11px] text-amber-700 font-bold">
                  ≈ {formatIDR(goldIDR)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
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
              <span>Memproses Transaksi...</span>
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
