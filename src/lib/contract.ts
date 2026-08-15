// ============================================================
// PUNDI — Contract client functions (Soroban / Stellar)
// ============================================================
// Catatan implementasi:
//   - Bindings TypeScript di-generate dari SavingsVaultContract
//   - Untuk testnet demo: operasi record_remittance menggunakan mock
//     karena anchor IDR dan swap XAUm masih disimulasikan
//   - Transaksi on-chain set_savings_rule berjalan di testnet nyata
// ============================================================

import { Client } from "bindings";
import type { AssembledTransaction } from "@stellar/stellar-sdk/contract";
import {
  CONTRACT_ID,
  NETWORK_PASSPHRASE,
  RPC_URL,
  GOLD_PRICE_USD_MOCK,
} from "@/lib/stellar";

// ----------------------------------------------------------
// Types (mencerminkan struct Soroban di lib.rs)
// ----------------------------------------------------------

export interface SavingsRule {
  user: string;
  label: string;
  savings_bps: number;
}

export interface RemittanceRecord {
  id: bigint;
  sender: string;
  total_usdc: bigint;
  recipient_amount: bigint;
  gold_amount_mg: bigint;
  gold_price_usd: bigint;
  timestamp: bigint;
  label: string;
}

// ----------------------------------------------------------
// Contract client factory
// ----------------------------------------------------------

type SignTransaction = NonNullable<
  ConstructorParameters<typeof Client>[0]["signTransaction"]
>;

export function createContractClient(
  publicKey?: string,
  signTransaction?: SignTransaction,
): Client {
  return new Client({
    contractId: CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    ...(publicKey ? { publicKey } : {}),
    ...(signTransaction ? { signTransaction } : {}),
  });
}

// ----------------------------------------------------------
// READ: Ambil aturan tabungan user
// ----------------------------------------------------------
export async function fetchSavingsRule(
  user: string,
): Promise<SavingsRule | null> {
  try {
    const client = createContractClient();
    const tx = await client.get_savings_rule({ user });
    const result = tx.result;
    if (!result) return null;
    return result as unknown as SavingsRule;
  } catch {
    return null;
  }
}

// ----------------------------------------------------------
// WRITE: Set aturan tabungan (dipanggil sekali di awal)
// ----------------------------------------------------------
export async function setSavingsRule(
  publicKey: string,
  signTransaction: SignTransaction,
  rule: { label: string; savings_bps: number },
): Promise<string> {
  const client = createContractClient(publicKey, signTransaction);
  const tx = await client.set_savings_rule({
    user: publicKey,
    label: rule.label,
    savings_bps: rule.savings_bps,
  });
  const sent = await signAndSend(tx);
  return (sent.result as string) ?? "Aturan berhasil disimpan";
}

// ----------------------------------------------------------
// READ: Ambil riwayat kiriman user
// ----------------------------------------------------------
export async function fetchRemittances(
  user: string,
): Promise<RemittanceRecord[]> {
  try {
    const client = createContractClient();
    const tx = await client.get_remittances({ user });
    return (tx.result as unknown as RemittanceRecord[]) ?? [];
  } catch {
    return [];
  }
}

// ----------------------------------------------------------
// READ: Hitung total emas user (miligram)
// ----------------------------------------------------------
export async function fetchTotalGold(user: string): Promise<bigint> {
  try {
    const client = createContractClient();
    const tx = await client.get_total_gold({ user });
    return BigInt(tx.result ?? 0);
  } catch {
    return 0n;
  }
}

// ----------------------------------------------------------
// WRITE: Catat transaksi remitansi
// Input: jumlah USDC (micro-USDC, 6 desimal), label tujuan
// ----------------------------------------------------------
export async function recordRemittance(
  publicKey: string,
  signTransaction: SignTransaction,
  params: {
    total_usdc: bigint;
    label: string;
  },
): Promise<RemittanceRecord> {
  const client = createContractClient(publicKey, signTransaction);
  const tx = await client.record_remittance({
    sender: publicKey,
    total_usdc: params.total_usdc,
    gold_price_usd: BigInt(GOLD_PRICE_USD_MOCK),
    label: params.label,
  });
  const sent = await signAndSend(tx);
  return sent.result as unknown as RemittanceRecord;
}

// ----------------------------------------------------------
// Helper: sign & send
// ----------------------------------------------------------
async function signAndSend<T>(tx: AssembledTransaction<T>) {
  return await tx.signAndSend();
}
