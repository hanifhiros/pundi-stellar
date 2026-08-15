"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchSavingsRule,
  setSavingsRule as setSavingsRuleOnChain,
  fetchRemittances,
  fetchTotalGold,
  recordRemittance as recordRemittanceOnChain,
  type SavingsRule,
  type RemittanceRecord,
} from "@/lib/contract";
import { useFreighter } from "@/hooks/useFreighter";

export function usePundi() {
  const { address, connected, sign } = useFreighter();

  const [savingsRule, setSavingsRuleState] = useState<SavingsRule | null>(null);
  const [remittances, setRemittances] = useState<RemittanceRecord[]>([]);
  const [totalGoldMg, setTotalGoldMg] = useState<bigint>(0n);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // ----------------------------------------------------------
  // Load all data for connected user
  // ----------------------------------------------------------
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (address) {
        const [rule, txs, gold] = await Promise.all([
          fetchSavingsRule(address),
          fetchRemittances(address),
          fetchTotalGold(address),
        ]);
        setSavingsRuleState(rule);
        setRemittances(txs);
        setTotalGoldMg(gold);
      } else {
        setSavingsRuleState(null);
        setRemittances([]);
        setTotalGoldMg(0n);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ----------------------------------------------------------
  // Set savings rule (once at setup)
  // ----------------------------------------------------------
  const setRule = useCallback(
    async (rule: { label: string; savings_bps: number }) => {
      if (!connected || !address) {
        throw new Error("Sambungkan wallet Freighter terlebih dahulu");
      }
      setActionLoading(true);
      setError(null);
      setMessage(null);
      try {
        const result = await setSavingsRuleOnChain(address, sign, rule);
        setMessage(result);
        await loadData();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Gagal menyimpan aturan";
        setError(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [address, connected, loadData, sign],
  );

  // ----------------------------------------------------------
  // Send remittance (main action)
  // ----------------------------------------------------------
  const sendRemittance = useCallback(
    async (params: { total_usdc: bigint; label: string }) => {
      if (!connected || !address) {
        throw new Error("Sambungkan wallet Freighter terlebih dahulu");
      }
      setActionLoading(true);
      setError(null);
      setMessage(null);
      try {
        await recordRemittanceOnChain(address, sign, params);
        setMessage("✅ Kiriman berhasil! Tabungan emas sudah disisihkan.");
        await loadData();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Gagal mengirim";
        setError(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [address, connected, loadData, sign],
  );

  const clearFeedback = useCallback(() => {
    setError(null);
    setMessage(null);
  }, []);

  return {
    savingsRule,
    remittances,
    totalGoldMg,
    loading,
    actionLoading,
    error,
    message,
    loadData,
    setRule,
    sendRemittance,
    clearFeedback,
  };
}
