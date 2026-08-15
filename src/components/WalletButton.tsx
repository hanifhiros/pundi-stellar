"use client";

import { useState } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { shortenAddress } from "@/lib/stellar";

export function WalletButton() {
  const { connected, address, network, installed, loading, connect, disconnect } =
    useFreighter();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <button className="btn btn-outline btn-sm" disabled>
        Memuat...
      </button>
    );
  }

  if (!installed) {
    return (
      <a
        href="https://www.freighter.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-gold btn-sm"
      >
        Pasang Freighter
      </a>
    );
  }

  if (connected && address) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            textAlign: "right",
            padding: "6px 12px",
            background: "var(--bg-subtle)",
            borderRadius: 8,
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              justifyContent: "flex-end",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#15803D" }}>
              Tersambung
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-medium)", fontFamily: "monospace" }}>
            {shortenAddress(address)}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-xlight)" }}>
            {network ?? "testnet"}
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={disconnect}>
          Putus
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button
        className="btn btn-gold btn-sm"
        onClick={handleConnect}
        disabled={connecting}
      >
        {connecting ? "Menyambung..." : "🔑 Sambung Wallet"}
      </button>
      {error && (
        <p style={{ fontSize: 12, color: "var(--error)", textAlign: "right" }}>
          {error}
        </p>
      )}
    </div>
  );
}
