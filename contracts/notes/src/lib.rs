#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec,
};

// ============================================================
// PUNDI — SavingsVault Contract (Soroban / Stellar)
// ============================================================
// Kontrak ini adalah inti dari Pundi: setiap kali PMI mengirim uang,
// kontrak membagi kiriman menjadi dua bagian —
//   • Sebagian besar (default 90%) dikirim ke keluarga dalam rupiah
//   • Sisanya (default 10%) dikonversi ke emas (XAUm) dan disimpan
//
// Semua transaksi bersifat atomik lewat pathPayment Stellar.
// Kontrak hanya mencatat bukti kepemilikan — saldo emas sesungguhnya
// terverifikasi langsung di Matrixdock (Allocation Lookup Tool).
// ============================================================

// ----------------------------------------------------------
// Tipe data: Aturan tabungan yang dipasang sekali oleh PMI
// ----------------------------------------------------------
#[contracttype]
#[derive(Clone, Debug)]
pub struct SavingsRule {
    /// Alamat Stellar wallet PMI (pengirim)
    pub user: Address,
    /// Label tujuan tabungan, misal "Sekolah Anak" / "Beli Rumah"
    pub label: String,
    /// Persentase yang disisihkan, dalam basis points (1000 = 10%)
    pub savings_bps: u32,
}

// ----------------------------------------------------------
// Tipe data: Catatan setiap transaksi remitansi
// ----------------------------------------------------------
#[contracttype]
#[derive(Clone, Debug)]
pub struct RemittanceRecord {
    /// ID unik transaksi (dari PRNG Soroban)
    pub id: u64,
    /// Alamat wallet pengirim (PMI)
    pub sender: Address,
    /// Total USDC yang dikirim, dalam micro-USDC (6 desimal, jadi 1 USDC = 1_000_000)
    pub total_usdc: u64,
    /// Jumlah yang diterima keluarga (dalam micro-USDC, lalu dikonversi ke IDR oleh anchor)
    pub recipient_amount: u64,
    /// Jumlah emas yang disisihkan, dalam miligram (1 gram = 1000 mg)
    pub gold_amount_mg: u64,
    /// Harga emas XAUm saat transaksi, dalam micro-USD per troy oz (simulasi)
    pub gold_price_usd: u64,
    /// Ledger timestamp saat transaksi dibuat
    pub timestamp: u64,
    /// Label tujuan tabungan yang dipakai di transaksi ini
    pub label: String,
}

// ----------------------------------------------------------
// Storage keys
// ----------------------------------------------------------
// Key untuk Vec<RemittanceRecord> milik setiap user (per-user storage)
const REMITTANCES_KEY: Symbol = symbol_short!("REMIT");
// Key untuk SavingsRule milik setiap user (per-user storage)
const RULE_KEY: Symbol = symbol_short!("RULE");

// ----------------------------------------------------------
// Contract
// ----------------------------------------------------------
#[contract]
pub struct SavingsVaultContract;

#[contractimpl]
impl SavingsVaultContract {
    // --------------------------------------------------------
    // SET_SAVINGS_RULE
    // Dipanggil sekali di awal — PMI menetapkan aturan tabungan.
    // Bisa dipanggil lagi kapan saja untuk mengubah aturan.
    //
    // Params:
    //   user        — address PMI (harus menandatangani transaksi)
    //   label       — tujuan tabungan, misal "Sekolah Anak"
    //   savings_bps — persentase dalam basis points (500–2000, yaitu 5–20%)
    // --------------------------------------------------------
    pub fn set_savings_rule(env: Env, user: Address, label: String, savings_bps: u32) -> String {
        // PMI harus menandatangani sendiri (otorisasi)
        user.require_auth();

        // Validasi range: 5% – 20% (500 – 2000 bps)
        if savings_bps < 500 || savings_bps > 2000 {
            return String::from_str(&env, "savings_bps harus antara 500 (5%) dan 2000 (20%)");
        }

        let rule = SavingsRule {
            user: user.clone(),
            label,
            savings_bps,
        };

        // Simpan dengan composite key per user
        env.storage()
            .persistent()
            .set(&(RULE_KEY, user), &rule);

        String::from_str(&env, "Aturan tabungan berhasil disimpan")
    }

    // --------------------------------------------------------
    // GET_SAVINGS_RULE
    // Baca aturan tabungan user. Mengembalikan Option<SavingsRule>.
    // --------------------------------------------------------
    pub fn get_savings_rule(env: Env, user: Address) -> Option<SavingsRule> {
        env.storage()
            .persistent()
            .get(&(RULE_KEY, user))
    }

    // --------------------------------------------------------
    // RECORD_REMITTANCE
    // Dipanggil setiap kali PMI mengirim uang.
    // Kontrak menghitung split, mencatat dalam gram emas, dan menyimpan record.
    //
    // Di dunia nyata, pathPayment Stellar sudah atomik — kontrak ini
    // mencatat bukti kepemilikan setelah transaksi on-chain settle (~5 detik).
    // Untuk testnet ini, anchor dan swap XAUm masih disimulasikan.
    //
    // Params:
    //   sender         — address PMI pengirim
    //   total_usdc     — total USDC yang dikirim (dalam micro-USDC)
    //   gold_price_usd — harga emas XAUm saat ini (dalam micro-USD per troy oz)
    //   label          — label tujuan tabungan
    // --------------------------------------------------------
    pub fn record_remittance(
        env: Env,
        sender: Address,
        total_usdc: u64,
        gold_price_usd: u64,
        label: String,
    ) -> RemittanceRecord {
        // Pengirim harus otorisasi
        sender.require_auth();

        // Ambil aturan tabungan user, default 10% jika belum diset
        let savings_bps: u32 = env
            .storage()
            .persistent()
            .get::<_, SavingsRule>(&(RULE_KEY, sender.clone()))
            .map(|r| r.savings_bps)
            .unwrap_or(1000); // default 10%

        // Hitung split:
        //   gold_usdc   = total_usdc * savings_bps / 10_000
        //   family_usdc = total_usdc - gold_usdc
        let gold_usdc = (total_usdc as u128 * savings_bps as u128 / 10_000u128) as u64;
        let recipient_amount = total_usdc - gold_usdc;

        // Hitung gram emas:
        // 1 troy oz = 31,103 gram = 31_103 mg
        // gold_amount_mg = (gold_usdc / gold_price_usd) * 31_103_000
        // (semua dalam micro untuk presisi integer)
        //
        // gold_usdc dalam micro-USDC (÷10^6 = USD)
        // gold_price_usd dalam micro-USD/oz (÷10^6 = USD/oz)
        // gold_amount_oz = gold_usdc / gold_price_usd
        // gold_amount_mg = gold_amount_oz * 31_103_000 mg/oz
        let gold_amount_mg = if gold_price_usd > 0 {
            (gold_usdc as u128 * 31_103_000u128 / gold_price_usd as u128) as u64
        } else {
            0
        };

        // Buat record
        let record = RemittanceRecord {
            id: env.prng().gen::<u64>(),
            sender: sender.clone(),
            total_usdc,
            recipient_amount,
            gold_amount_mg,
            gold_price_usd,
            timestamp: env.ledger().timestamp(),
            label,
        };

        // Ambil riwayat lama, tambahkan record baru
        let mut remittances: Vec<RemittanceRecord> = env
            .storage()
            .persistent()
            .get(&(REMITTANCES_KEY, sender.clone()))
            .unwrap_or(Vec::new(&env));

        remittances.push_back(record.clone());

        // Simpan kembali
        env.storage()
            .persistent()
            .set(&(REMITTANCES_KEY, sender), &remittances);

        // Kembalikan record yang baru dibuat untuk konfirmasi frontend
        record
    }

    // --------------------------------------------------------
    // GET_REMITTANCES
    // Ambil seluruh riwayat kiriman user.
    // Bisa dibaca publik (tanpa auth) — semua data on-chain transparan.
    // --------------------------------------------------------
    pub fn get_remittances(env: Env, user: Address) -> Vec<RemittanceRecord> {
        env.storage()
            .persistent()
            .get(&(REMITTANCES_KEY, user))
            .unwrap_or(Vec::new(&env))
    }

    // --------------------------------------------------------
    // GET_TOTAL_GOLD
    // Hitung total akumulasi emas user dalam miligram.
    // --------------------------------------------------------
    pub fn get_total_gold(env: Env, user: Address) -> u64 {
        let remittances: Vec<RemittanceRecord> = env
            .storage()
            .persistent()
            .get(&(REMITTANCES_KEY, user))
            .unwrap_or(Vec::new(&env));

        let mut total_mg: u64 = 0;
        for i in 0..remittances.len() {
            if let Some(r) = remittances.get(i) {
                total_mg += r.gold_amount_mg;
            }
        }
        total_mg
    }
}

mod test;
