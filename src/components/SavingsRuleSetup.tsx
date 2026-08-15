"use client";

import { FormEvent, useState } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import type { SavingsRule } from "@/lib/contract";
import {
  GraduationCap,
  Home,
  Shield,
  Briefcase,
  Compass,
  HeartPulse,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

interface SavingsRuleSetupProps {
  existingRule: SavingsRule | null;
  onSave: (rule: { label: string; savings_bps: number }) => Promise<void>;
  loading: boolean;
  totalGoldMg?: bigint;
}

const GOAL_PRESETS = [
  { label: "Sekolah Anak", icon: GraduationCap, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { label: "Beli Rumah", icon: Home, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { label: "Dana Darurat", icon: Shield, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { label: "Modal Usaha", icon: Briefcase, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { label: "Umrah / Haji", icon: Compass, color: "text-teal-600 bg-teal-50 border-teal-200" },
  { label: "Kesehatan", icon: HeartPulse, color: "text-rose-600 bg-rose-50 border-rose-200" },
];

const PERCENTAGES = [
  { pct: 5, label: "5%", desc: "Rp 50.000 / Rp 1 jt", tag: "Santai" },
  { pct: 10, label: "10%", desc: "Rp 100.000 / Rp 1 jt", tag: "Rekomendasi" },
  { pct: 15, label: "15%", desc: "Rp 150.000 / Rp 1 jt", tag: "Mantap" },
  { pct: 20, label: "20%", desc: "Rp 200.000 / Rp 1 jt", tag: "Maksimal" },
];

export function SavingsRuleSetup({
  existingRule,
  onSave,
  loading,
}: SavingsRuleSetupProps) {
  const { connected, connect } = useFreighter();

  const [selectedLabel, setSelectedLabel] = useState(
    existingRule?.label ?? "Sekolah Anak"
  );
  const [customLabel, setCustomLabel] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [savingsBps, setSavingsBps] = useState(
    existingRule?.savings_bps ?? 1000
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!connected) {
      try {
        await connect();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyambungkan wallet.");
      }
      return;
    }

    const finalLabel = useCustom ? customLabel.trim() : selectedLabel;
    if (!finalLabel) {
      setError("Pilih atau tuliskan tujuan tabungan emas.");
      return;
    }

    try {
      await onSave({ label: finalLabel, savings_bps: savingsBps });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan aturan.");
    }
  };

  const currentPercent = savingsBps / 100;

  return (
    <div className="pundi-card-premium space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-slate-900 leading-tight">
              Aturan Tabungan Emas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dipasang sekali — otomatis berlaku untuk semua kiriman berikutnya
            </p>
          </div>
        </div>
        {existingRule && (
          <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Sedang Berjalan
          </span>
        )}
      </div>

      {/* Success Notification */}
      {saved && !loading && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center gap-3 text-emerald-900 animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-950">
              Aturan Tabungan Berhasil Disimpan!
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {currentPercent}% dari setiap kiriman akan otomatis disisihkan untuk "{useCustom ? customLabel : selectedLabel}".
            </p>
          </div>
        </div>
      )}

      {/* Existing Rule Notice */}
      {existingRule && !saved && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Aturan yang Sedang Berjalan:
            </p>
            <p className="text-sm font-bold text-slate-800">
              {existingRule.savings_bps / 100}% otomatis jadi emas untuk{" "}
              <span className="text-amber-600 font-extrabold">{existingRule.label}</span>
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Aktif
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Pilih Tujuan */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            1. Pilih Tujuan Tabungan
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {GOAL_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = !useCustom && selectedLabel === preset.label;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setSelectedLabel(preset.label);
                    setUseCustom(false);
                  }}
                  disabled={loading}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                    isSelected
                      ? "bg-amber-50 border-amber-400 ring-1 ring-amber-400 text-amber-950 font-bold shadow-sm"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${preset.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold truncate">{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Input Toggle */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setUseCustom(!useCustom)}
              disabled={loading}
              className="text-xs font-bold text-amber-700 hover:underline inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
            >
              ✏️ {useCustom ? "Pilih dari daftar di atas" : "Tulis tujuan sendiri"}
            </button>
            {useCustom && (
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Contoh: Modal Usaha Warung"
                disabled={loading}
                maxLength={32}
                className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 mt-2 bg-white"
              />
            )}
          </div>
        </div>

        {/* 2. Persentase Sisihan */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            2. Persentase Yang Disisihkan Jadi Emas
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PERCENTAGES.map((p) => {
              const isSelected = savingsBps === p.pct * 100;
              return (
                <button
                  key={p.pct}
                  type="button"
                  onClick={() => setSavingsBps(p.pct * 100)}
                  disabled={loading}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                    isSelected
                      ? "bg-amber-50 border-amber-400 ring-1 ring-amber-400 shadow-sm"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xl font-black font-display ${
                        isSelected ? "text-amber-600" : "text-slate-900"
                      }`}
                    >
                      {p.label}
                    </span>
                    {p.tag === "Rekomendasi" && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Top
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                    {p.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tips Box */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900/90 leading-relaxed shadow-sm">
          💡 <strong>Tips Pundi:</strong> Mengatur 10% adalah angka ideal. Uang yang terkirim ke keluarga tetap 90% (hampir tidak terasa bedanya), namun tabungan emas keluarga akan terkumpul stabil dari bulan ke bulan.
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-gold-action focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none focus-visible:ring-offset-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Menyimpan Aturan...</span>
            </>
          ) : (
            <span>
              {existingRule ? "Perbarui Aturan Tabungan" : "Simpan Aturan Tabungan"}
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
