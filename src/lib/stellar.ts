// ============================================================
// PUNDI — Stellar/Soroban constants & helpers
// ============================================================

export const STELLAR_NETWORK = "testnet" as const;

// Contract ID SavingsVaultContract di Soroban testnet
export const CONTRACT_ID =
  "CAJVFVM4DT6ZR634PU3MRFGP5FHDE5AAHCZXR4F54KWKZV25YQ7LYB2Z";

export const RPC_URL = "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

// ----------------------------------------------------------
// Harga emas simulasi: XAUm (LBMA 99.99%, Matrixdock)
// Di produksi: ambil dari Stellar DEX order book lewat SEP-38
// Satuan: micro-USD per troy oz (1 USD = 1_000_000 micro-USD)
// ----------------------------------------------------------
export const GOLD_PRICE_USD_MOCK = 3_312_000_000; // ~$3,312 per oz (Juli 2026)

// Nilai tukar USDC → IDR simulasi (kurs anchor)
export const USDC_TO_IDR_RATE = 16_250; // 1 USDC ≈ Rp 16.250

// Mata uang yang didukung PMI dengan kurs ke USDC & IDR
export interface SupportedCurrency {
  code: string;
  name: string;
  country: string;
  flagCode: "SGD" | "HKD" | "MYR" | "KRW" | "USD";
  rateToUSDC: number;
  symbol: string;
}

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  {
    code: "SGD",
    name: "Dolar Singapura",
    country: "Singapura",
    flagCode: "SGD",
    rateToUSDC: 0.75, // 1 SGD ≈ 0.75 USD
    symbol: "S$",
  },
  {
    code: "HKD",
    name: "Dolar Hong Kong",
    country: "Hong Kong",
    flagCode: "HKD",
    rateToUSDC: 0.128, // 1 HKD ≈ 0.128 USD
    symbol: "HK$",
  },
  {
    code: "MYR",
    name: "Ringgit Malaysia",
    country: "Malaysia",
    flagCode: "MYR",
    rateToUSDC: 0.225, // 1 MYR ≈ 0.225 USD
    symbol: "RM",
  },
  {
    code: "KRW",
    name: "Won Korea Selatan",
    country: "Korea Selatan",
    flagCode: "KRW",
    rateToUSDC: 0.00073, // 1000 KRW ≈ 0.73 USD
    symbol: "₩",
  },
  {
    code: "USD",
    name: "Dolar Amerika",
    country: "Global / US",
    flagCode: "USD",
    rateToUSDC: 1.0,
    symbol: "$",
  },
];

// ----------------------------------------------------------
// Format helpers
// ----------------------------------------------------------

/** Format angka sebagai Rupiah, misal: Rp 1.250.000 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format micro-USDC menjadi string USDC, misal: "12.50 USDC" */
export function formatUSDC(microUsdc: bigint): string {
  const usdc = Number(microUsdc) / 1_000_000;
  return `${usdc.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}

/** Format miligram emas menjadi gram, misal: "0.523 gram" */
export function formatGold(milligrams: bigint | number): string {
  const mg = typeof milligrams === "bigint" ? Number(milligrams) : milligrams;
  const grams = mg / 1000;
  if (grams < 0.001) return `${mg.toFixed(1)} mg`;
  return `${grams.toLocaleString("id-ID", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} gram`;
}

/** Estimasi nilai emas dalam IDR */
export function estimateGoldValueIDR(milligrams: number): number {
  // 1 troy oz = 31,103 gram = 31_103 mg
  const pricePerOzUSD = GOLD_PRICE_USD_MOCK / 1_000_000;
  const pricePerMgUSD = pricePerOzUSD / 31_103;
  const valueUSD = milligrams * pricePerMgUSD;
  return valueUSD * USDC_TO_IDR_RATE;
}

/** Format harga lama (price bigint IDR) — dipertahankan untuk kompatibilitas */
export function formatPrice(price: bigint): string {
  return formatIDR(Number(price));
}

/** Persingkat alamat Stellar */
export function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

/** Format timestamp ledger ke string tanggal lokal */
export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** URL Stellar Expert Explorer untuk Contract */
export function getStellarExpertContractUrl(contractId: string = CONTRACT_ID): string {
  return `https://stellar.expert/explorer/testnet/contract/${contractId}`;
}

/** URL Stellar Expert Explorer untuk Akun / Wallet */
export function getStellarExpertAccountUrl(account: string): string {
  return `https://stellar.expert/explorer/testnet/account/${account}`;
}

/** URL Stellar Expert Explorer untuk Transaksi */
export function getStellarExpertTxUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}
