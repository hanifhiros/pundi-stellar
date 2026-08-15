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
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900 leading-tight">
              Kirim Uang
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {savingsPct}% otomatis disisihkan jadi tabungan emas keluarga
            </p>
          </div>
        </div>
        <span className="badge-green-subtle hidden sm:inline-flex px-3 py-1.5 text-sm">
          <Zap className="w-4 h-4" /> Selesai ~5 detik
        </span>
      </div>

      {/* Success Receipt Modal */}
      {lastTxSuccess && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-300 space-y-5 animate-in fade-in">
          <div className="flex items-center gap-4 text-emerald-900">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-emerald-950">
                Kiriman Berhasil Terkirim!
              </h3>
              <p className="text-sm text-emerald-700 mt-0.5">
                Transaksi telah dieksekusi secara atomik di Stellar Soroban Testnet.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-white rounded-2xl border border-emerald-200">
              <p className="text-sm text-slate-500 font-semibold">Diterima Keluarga</p>
              <p className="text-xl font-black text-emerald-700 mt-1.5">
                {formatIDR(lastTxSuccess.familyIDR)}
              </p>
              <p className="text-xs text-slate-400 mt-1">via BI-FAST / DANA</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-amber-200">
              <p className="text-sm text-slate-500 font-semibold">Tabungan Emas</p>
              <p className="text-xl font-black text-amber-600 mt-1.5">
                +{lastTxSuccess.goldGrams.toFixed(3)} gr
              </p>
              <p className="text-xs text-slate-400 mt-1">Tujuan: {lastTxSuccess.label}</p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-emerald-200/70">
            <a
              href={getStellarExpertContractUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:underline"
            >
              <span>Cek Bukti di Stellar Expert</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => setLastTxSuccess(null)}
              className="text-sm text-emerald-700 font-bold hover:underline"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Negara Kerja */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-3.5">
            Pilih Negara Kerja
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {SUPPORTED_CURRENCIES.map((c) => {
              const isSelected = c.code === selectedCurrencyCode;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCurrencyCode(c.code)}
                  disabled={isProcessing}
                  className={`country-chip ${isSelected ? "active" : ""}`}
                >
                  <FlagIcon code={c.code} className="w-8 h-8 mb-1" />
                  <div className="text-center min-w-0">
                    <p className="text-sm font-extrabold text-slate-900 leading-tight">
                      {c.code}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {c.country}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nominal Input */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <label
              htmlFor="remittance-amount"
              className="text-sm font-bold uppercase tracking-wider text-slate-500"
            >
              Nominal Kiriman ({currency.code})
            </label>
            <span className="text-sm font-semibold text-slate-400">
              1 {currency.code} ≈ {(currency.rateToUSDC * USDC_TO_IDR_RATE).toLocaleString("id-ID")} IDR
            </span>
          </div>

          <div className="pundi-input-box h-16">
            <div className="px-5 bg-slate-50 h-full flex items-center gap-2.5 border-r border-slate-200 shrink-0">
              <FlagIcon code={currency.code} className="w-6 h-6" />
              <span className="font-extrabold text-slate-800 text-base">
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
            <span className="text-xs text-slate-400 font-semibold mr-1">Nominal Cepat:</span>
            {[200, 500, 1000, 2000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                {val} {currency.code}
              </button>
            ))}
          </div>
        </div>

        {/* Keterangan */}
        <div>
          <label
            htmlFor="remittance-label"
            className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-3.5"
          >
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
            className="w-full h-14 px-5 border border-slate-200 rounded-2xl text-base font-medium text-slate-800 outline-none focus:border-amber-500 transition-all bg-white"
          />
        </div>

        {/* Transparent Live Breakdown */}
        {numAmount > 0 && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/60 via-slate-50 to-emerald-50/40 border border-amber-200/80 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-900 flex items-center gap-2 uppercase tracking-wider">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                Estimasi Transparan
              </span>
              <span className="text-sm font-bold text-emerald-700">
                Total Biaya: <strong>~1%</strong> (Hemat vs 5-6%)
              </span>
            </div>

            {/* Split Meter Bar */}
            <div className="space-y-1.5">
              <div className="split-meter">
                <div
                  className="split-fill-green"
                  style={{ width: `${familyPct}%` }}
                />
                <div
                  className="split-fill-gold"
                  style={{ width: `${savingsPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-700">Keluarga: {familyPct}%</span>
                <span className="text-amber-700">Tabungan Emas: {savingsPct}%</span>
              </div>
            </div>

            {/* 2 Big Outcome Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500">
                  🏦 Diterima Keluarga ({familyPct}%)
                </p>
                <p className="text-xl font-black text-emerald-700 mt-1 font-display">
                  {formatIDR(familyIDR)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sampai utuh via BI-FAST / DANA
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500">
                  🪙 Tabungan Emas ({savingsPct}%)
                </p>
                <p className="text-xl font-black text-amber-600 mt-1 font-display">
                  {goldGrams >= 0.001 ? `${goldGrams.toFixed(3)} gram` : formatGold(goldMg)}
                </p>
                <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                  ≈ {formatIDR(goldIDR)} (Emas Fisik 99.99%)
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
