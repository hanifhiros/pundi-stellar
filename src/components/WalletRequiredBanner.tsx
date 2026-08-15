"use client";

import { useState } from "react";
import { useFreighter } from "@/hooks/useFreighter";

export function WalletRequiredBanner() {
  const { connected, loading, connect } = useFreighter();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading || connected) return null;

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      await connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyambungkan wallet");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--gold-bg)",
        border: "1.5px solid var(--gold-border)",
        borderRadius: 12,
        padding: "18px 22px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 22, lineHeight: 1.4 }}>🔒</span>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>
            Sambungkan wallet untuk mulai
          </p>
          <p style={{ fontSize: 14, color: "var(--text-medium)", marginTop: 2 }}>
            Gunakan Freighter untuk mengirim uang dan mengatur tabungan emas.
          </p>
          {error && (
            <p style={{ fontSize: 13, color: "var(--error)", marginTop: 6 }}>{error}</p>
          )}
        </div>
      </div>
      <button className="btn btn-gold" onClick={handleConnect} disabled={connecting} style={{ flexShrink: 0 }}>
        {connecting ? "Menyambung..." : "⚡ Sambung Freighter"}
      </button>
    </div>
  );
}
