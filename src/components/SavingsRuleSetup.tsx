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
} from "lucide-react";

interface SavingsRuleSetupProps {
  existingRule: SavingsRule | null;
  onSave: (rule: { label: string; savings_bps: number }) => Promise<void>;
  loading: boolean;
  totalGoldMg?: bigint;
}

const GOAL_PRESETS = [
  { label: "Sekolah Anak", icon: GraduationCap, color: "text-blue-600 bg-blue-50" },
  { label: "Beli Rumah", icon: Home, color: "text-emerald-600 bg-emerald-50" },
  { label: "Dana Darurat", icon: Shield, color: "text-amber-600 bg-amber-50" },
  { label: "Modal Usaha", icon: Briefcase, color: "text-purple-600 bg-purple-50" },
  { label: "Umrah / Haji", icon: Compass, color: "text-teal-600 bg-teal-50" },
  { label: "Kesehatan", icon: HeartPulse, color: "text-rose-600 bg-rose-50" },
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
    <div>
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="pundi-title">Aturan Nabung</h1>
        <p className="pundi-subtitle">Tentukan tujuan dan persentase sisihan</p>
      </div>

      {/* Main Card */}
      <div className="pundi-card">
        {/* Success Banner */}
        {saved && !loading && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center gap-3 text-emerald-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-950">
                Aturan Tabungan Berhasil Disimpan di Soroban!
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {currentPercent}% dari setiap kiriman akan otomatis disisihkan untuk "{useCustom ? customLabel : selectedLabel}".
              </p>
            </div>
          </div>
        )}

        {/* Existing Rule Pill */}
        {existingRule && !saved && (
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-slate-400 font-medium">Aturan aktif saat ini:</p>
              <p className="text-sm font-bold text-slate-800">
                {existingRule.savings_bps / 100}% otomatis jadi emas untuk{" "}
                <span className="text-amber-600 font-extrabold">{existingRule.label}</span>
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              On-Chain
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Pilih Tujuan */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2.5">
              Tujuan Tabungan
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
                    className={`goal-btn ${isSelected ? "selected" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${preset.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{preset.label}</span>
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
                className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                ✏️ {useCustom ? "Pilih dari daftar di atas" : "Tulis tujuan sendiri"}
              </button>
              {useCustom && (
                <div className="pundi-input-group mt-2">
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="Contoh: Modal Usaha Warung"
                    disabled={loading}
                    maxLength={32}
                    className="pundi-input-control text-sm font-semibold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. Persentase Sisihan */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2.5">
              Persentase Yang Disisihkan Jadi Emas
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
                    className={`pct-btn ${isSelected ? "selected" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="pct-val">{p.label}</span>
                      {p.tag === "Rekomendasi" && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Top
                        </span>
                      )}
                    </div>
                    <p className="pct-desc">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Big Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-kirim-pundi"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menyimpan ke Soroban Smart Contract...</span>
              </>
            ) : (
              <span>
                {existingRule ? "Perbarui Aturan Tabungan" : "Simpan Aturan"}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
