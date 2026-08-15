"use client";

import { useFreighter } from "@/hooks/useFreighter";
import { shortenAddress } from "@/lib/stellar";
import { LogOut, Loader2, Zap } from "lucide-react";

export function WalletButton() {
  const { connected, address, connect, disconnect, loading } = useFreighter();

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2.5 px-4 py-2 bg-amber-50 border border-amber-300 rounded-full shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs font-mono font-bold text-amber-950">
            {shortenAddress(address)}
          </span>
        </div>
        <button
          type="button"
          onClick={disconnect}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Putus Sambungan"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={connect}
      disabled={loading}
      className="btn-wallet-primary"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Menyambungkan...</span>
        </>
      ) : (
        <>
          <Zap className="w-4 h-4 fill-current" />
          <span>Sambung Freighter</span>
        </>
      )}
    </button>
  );
}
