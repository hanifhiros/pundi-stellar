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
    <div className="pundi-card-premium space-y-14">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-10 border-b border-slate-100">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[24px] bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm">
            <Send className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-display font-black text-4xl text-slate-900 leading-tight tracking-tight">
              Kirim Uang
            </h2>
            <p className="text-lg text-slate-500 mt-2 font-medium">
              {savingsPct}% otomatis disisihkan jadi tabungan emas keluarga
            </p>
          </div>
        </div>
        <span className="badge-green-subtle hidden sm:inline-flex px-5 py-2.5 text-sm font-bold shadow-sm">
          <Zap className="w-5 h-5" /> Selesai ~5 detik
        </span>
      </div>

      {/* Success Receipt Modal */}
      {lastTxSuccess && (
        <div className="p-10 rounded-3xl bg-emerald-50 border border-emerald-300 space-y-8 animate-in fade-in shadow-sm">
          <div className="flex items-center gap-6 text-emerald-900">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-black text-2xl text-emerald-950 tracking-tight">
                Kiriman Berhasil Terkirim!
              </h3>
              <p className="text-lg text-emerald-700 mt-1.5 font-medium">
                Transaksi telah dieksekusi secara atomik di Stellar Soroban Testnet.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="p-8 bg-white rounded-3xl border border-emerald-200 shadow-sm">
              <p className="text-sm text-slate-500 font-bold tracking-widest uppercase mb-1">Diterima Keluarga</p>
              <p className="text-3xl font-black text-emerald-700 mt-2 font-display">
                {formatIDR(lastTxSuccess.familyIDR)}
              </p>
              <p className="text-base text-slate-400 mt-2 font-medium">via BI-FAST / DANA</p>
            </div>
            <div className="p-8 bg-white rounded-3xl border border-amber-200 shadow-sm">
              <p className="text-sm text-slate-500 font-bold tracking-widest uppercase mb-1">Tabungan Emas</p>
              <p className="text-3xl font-black text-amber-600 mt-2 font-display">
                +{lastTxSuccess.goldGrams.toFixed(3)} gr
              </p>
              <p className="text-base text-slate-400 mt-2 font-medium">Tujuan: {lastTxSuccess.label}</p>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between border-t border-emerald-200/70">
            <a
              href={getStellarExpertContractUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-base font-bold text-emerald-800 hover:text-emerald-600 transition-colors"
            >
              <span>Cek Bukti di Stellar Expert</span>
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              type="button"
              onClick={() => setLastTxSuccess(null)}
              className="text-base text-emerald-700 font-bold hover:text-emerald-900 transition-colors px-6 py-2.5 rounded-xl hover:bg-emerald-100"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-16">
        {/* Negara Kerja */}
        <div>
          <label className="block text-[15px] font-black uppercase tracking-widest text-slate-400 mb-8">
            Pilih Negara Kerja
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-6">
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
                  <FlagIcon code={c.code} className="w-9 h-9 mb-2" />
                  <div className="text-center min-w-0">
                    <p className="text-base font-black text-slate-900 leading-tight">
                      {c.code}
                    </p>
                    <p className="text-[13px] text-slate-500 truncate mt-1.5 font-medium">
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
          <div className="flex items-center justify-between mb-8">
            <label
              htmlFor="remittance-amount"
              className="text-[15px] font-black uppercase tracking-widest text-slate-400"
            >
              Nominal Kiriman ({currency.code})
            </label>
            <span className="text-[15px] font-bold text-slate-400 bg-slate-50 px-4 py-1.5 rounded-xl">
              1 {currency.code} ≈ {(currency.rateToUSDC * USDC_TO_IDR_RATE).toLocaleString("id-ID")} IDR
            </span>
          </div>

          <div className="pundi-input-box h-24 shadow-sm rounded-3xl">
            <div className="px-8 bg-slate-50 h-full flex items-center gap-4 border-r border-slate-200 shrink-0">
              <FlagIcon code={currency.code} className="w-8 h-8" />
              <span className="font-black text-slate-800 text-2xl">
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
              className="w-full h-full px-8 text-5xl font-black text-slate-900 bg-transparent outline-none font-display placeholder:text-slate-300"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-4 mt-8 flex-wrap">
            <span className="text-[15px] text-slate-400 font-bold mr-2 uppercase tracking-widest">Nominal Cepat:</span>
            {[200, 500, 1000, 2000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[15px] font-bold transition-colors"
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
            className="block text-[15px] font-black uppercase tracking-widest text-slate-400 mb-8"
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
            className="w-full h-20 px-8 border border-slate-200 rounded-3xl text-xl font-medium text-slate-800 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all bg-white shadow-sm"
          />
        </div>

        {/* Transparent Live Breakdown */}
        {numAmount > 0 && (
          <div className="p-10 rounded-[32px] bg-gradient-to-br from-amber-50/80 via-slate-50 to-emerald-50/60 border border-amber-200/80 space-y-10 shadow-sm mt-4">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-black text-amber-900 flex items-center gap-3 uppercase tracking-widest">
                <ShieldCheck className="w-7 h-7 text-amber-600" />
                Estimasi Transparan
              </span>
              <span className="text-[15px] font-bold text-emerald-800 bg-emerald-100/50 px-5 py-2 rounded-xl border border-emerald-200/50">
                Total Biaya: <strong className="text-emerald-900 text-lg">~1%</strong> (Hemat vs 5-6%)
              </span>
            </div>

            {/* Split Meter Bar */}
            <div className="space-y-4">
              <div className="split-meter h-5 shadow-inner">
                <div
                  className="split-fill-green"
                  style={{ width: `${familyPct}%` }}
                />
                <div
                  className="split-fill-gold"
                  style={{ width: `${savingsPct}%` }}
                />
              </div>
              <div className="flex justify-between text-base font-black uppercase tracking-widest">
                <span className="text-emerald-700">Keluarga: {familyPct}%</span>
                <span className="text-amber-700">Tabungan Emas: {savingsPct}%</span>
              </div>
            </div>

            {/* 2 Big Outcome Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="p-8 bg-white rounded-3xl border border-emerald-200 shadow-sm">
                <p className="text-[15px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                  🏦 Diterima Keluarga ({familyPct}%)
                </p>
                <p className="text-3xl font-black text-emerald-700 mt-3 font-display">
                  {formatIDR(familyIDR)}
                </p>
                <p className="text-base text-slate-400 mt-2 font-medium">
                  Sampai utuh via BI-FAST / DANA
                </p>
              </div>

              <div className="p-8 bg-white rounded-3xl border border-amber-200 shadow-sm">
                <p className="text-[15px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                  🪙 Tabungan Emas ({savingsPct}%)
                </p>
                <p className="text-3xl font-black text-amber-600 mt-3 font-display">
                  {goldGrams >= 0.001 ? `${goldGrams.toFixed(3)} gram` : formatGold(goldMg)}
                </p>
                <p className="text-base text-amber-700 font-bold mt-2 bg-amber-50 inline-block px-3 py-1 rounded-xl">
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
