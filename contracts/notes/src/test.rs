#![cfg(test)]

use super::*;
use soroban_sdk::{Address, Env, String};

// Helper: buat env + client untuk SavingsVaultContract
fn setup() -> (Env, SavingsVaultContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(SavingsVaultContract, ());
    let client = SavingsVaultContractClient::new(&env, &contract_id);
    (env, client)
}

// Helper: buat dummy Address untuk testing
fn mock_user(env: &Env) -> Address {
    Address::generate(env)
}

// ============================================================
// Test: get_savings_rule mengembalikan None jika belum diset
// ============================================================
#[test]
fn get_savings_rule_returns_none_initially() {
    let (env, client) = setup();
    let user = mock_user(&env);
    assert!(client.get_savings_rule(&user).is_none());
}

// ============================================================
// Test: set_savings_rule menyimpan aturan dengan benar
// ============================================================
#[test]
fn set_savings_rule_stores_correctly() {
    let (env, client) = setup();
    let user = mock_user(&env);

    let label = String::from_str(&env, "Sekolah Anak");
    let result = client.set_savings_rule(&user, &label, &1000u32);

    assert_eq!(result, String::from_str(&env, "Aturan tabungan berhasil disimpan"));

    let rule = client.get_savings_rule(&user).unwrap();
    assert_eq!(rule.label, label);
    assert_eq!(rule.savings_bps, 1000);
}

// ============================================================
// Test: set_savings_rule menolak bps di luar range
// ============================================================
#[test]
fn set_savings_rule_rejects_out_of_range() {
    let (env, client) = setup();
    let user = mock_user(&env);

    let label = String::from_str(&env, "Test");

    // bps 100 = 1%, terlalu kecil (minimum 500 = 5%)
    let result_low = client.set_savings_rule(&user, &label, &100u32);
    assert!(result_low.to_string().contains("500"));

    // bps 5000 = 50%, terlalu besar (maksimum 2000 = 20%)
    let result_high = client.set_savings_rule(&user, &label, &5000u32);
    assert!(result_high.to_string().contains("2000"));
}

// ============================================================
// Test: record_remittance mencatat kiriman dan split dengan benar
// ============================================================
#[test]
fn record_remittance_calculates_split_correctly() {
    let (env, client) = setup();
    let user = mock_user(&env);

    // Set aturan 10% ke emas
    let label = String::from_str(&env, "Beli Rumah");
    client.set_savings_rule(&user, &label, &1000u32); // 10%

    // Kirim 100 USDC (100_000_000 micro-USDC)
    // Harga emas: $3,312/oz = 3_312_000_000 micro-USD/oz
    let total_usdc = 100_000_000u64; // 100 USDC
    let gold_price = 3_312_000_000u64;

    let record = client.record_remittance(
        &user,
        &total_usdc,
        &gold_price,
        &String::from_str(&env, "Beli Rumah"),
    );

    // 90% ke keluarga
    let expected_recipient = total_usdc * 90 / 100;
    assert_eq!(record.recipient_amount, expected_recipient);

    // 10% jadi emas
    let gold_usdc = total_usdc - expected_recipient;
    assert!(gold_usdc > 0);

    // Pastikan gold_amount_mg > 0
    assert!(record.gold_amount_mg > 0);
}

// ============================================================
// Test: get_remittances mengembalikan seluruh riwayat
// ============================================================
#[test]
fn get_remittances_returns_all_records() {
    let (env, client) = setup();
    let user = mock_user(&env);

    // Belum ada kiriman
    assert_eq!(client.get_remittances(&user).len(), 0);

    let label = String::from_str(&env, "Dana Darurat");
    let gold_price = 3_312_000_000u64;

    // Kirim 2x
    client.record_remittance(&user, &10_000_000u64, &gold_price, &label);
    client.record_remittance(&user, &20_000_000u64, &gold_price, &label);

    let records = client.get_remittances(&user);
    assert_eq!(records.len(), 2);
}

// ============================================================
// Test: get_total_gold menjumlahkan emas dari semua kiriman
// ============================================================
#[test]
fn get_total_gold_accumulates_correctly() {
    let (env, client) = setup();
    let user = mock_user(&env);

    let label = String::from_str(&env, "Modal Usaha");
    let gold_price = 3_312_000_000u64;

    // Kirim 3x
    client.record_remittance(&user, &50_000_000u64, &gold_price, &label);
    client.record_remittance(&user, &50_000_000u64, &gold_price, &label);
    client.record_remittance(&user, &100_000_000u64, &gold_price, &label);

    let total_mg = client.get_total_gold(&user);
    assert!(total_mg > 0);

    // Verifikasi = jumlah per-record
    let records = client.get_remittances(&user);
    let sum: u64 = (0..records.len())
        .map(|i| records.get(i).unwrap().gold_amount_mg)
        .sum();
    assert_eq!(total_mg, sum);
}

// ============================================================
// Test: data user berbeda tidak bercampur
// ============================================================
#[test]
fn user_data_is_isolated() {
    let (env, client) = setup();
    let user_a = mock_user(&env);
    let user_b = mock_user(&env);

    let label = String::from_str(&env, "Sekolah");
    let gold_price = 3_312_000_000u64;

    client.record_remittance(&user_a, &10_000_000u64, &gold_price, &label);

    // User B tidak punya record
    assert_eq!(client.get_remittances(&user_b).len(), 0);
    assert_eq!(client.get_total_gold(&user_b), 0);
}
