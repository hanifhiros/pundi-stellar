"use client";

import { useFreighter } from "@/hooks/useFreighter";
import { shortenAddress } from "@/lib/stellar";
import { LogOut, Loader2, Zap } from "lucide-react";

export function WalletButton() {
  const { connected, address, connect, disconnect, loading } = useFreighter();

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2.5 px-4 py-2 bg-amber-50 border border-amber-300 rounded-full shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-sm font-mono font-bold text-amber-950">
            {shortenAddress(address)}
          </span>
        </div>
        <button
          type="button"
          onClick={disconnect}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
          title="Keluar"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={connect}
      disabled={loading}
      className="btn-wallet-primary focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none focus-visible:ring-offset-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Memuat...</span>
        </>
      ) : (
        <>
          <Zap className="w-4 h-4 fill-current" />
          <span>Masuk / Daftar</span>
        </>
      )}
    </button>
  );
}
