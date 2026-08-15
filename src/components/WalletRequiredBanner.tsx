"use client";

import { useFreighter } from "@/hooks/useFreighter";
import { Zap } from "lucide-react";

export function WalletRequiredBanner() {
  const { connected, connect, loading } = useFreighter();

  if (connected) return null;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-100/70 via-amber-50 to-amber-100/70 border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
          🪙
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-950 font-display">
            Sambungkan Freighter untuk Mengirim & Menabung
          </h3>
          <p className="text-xs text-amber-900/80 mt-0.5 font-medium">
            Semua transaksi dieksekusi secara instan dan aman di Stellar Soroban Testnet.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={connect}
        disabled={loading}
        className="btn-banner-primary"
      >
        <Zap className="w-4 h-4 fill-current" />
        <span>Sambung Sekarang</span>
      </button>
    </div>
  );
}
