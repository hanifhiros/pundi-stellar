<h1 align="center">🪙 Pundi</h1>

<h3 align="center">Kirim Uang ke Keluarga, Otomatis Menabung Emas di Stellar Soroban</h3>

<p align="center">
  Aplikasi remitansi untuk keluarga <strong>Pekerja Migran Indonesia (PMI)</strong> yang secara otomatis menyisihkan sebagian kecil dari setiap kiriman menjadi <strong>tabungan emas murni fisik (LBMA 99.99%)</strong> di blockchain Stellar Soroban.
</p>

<p align="center">
  <a href="https://stellar.org"><img src="https://img.shields.io/badge/Stellar-7D00FF?style=for-the-badge&logo=stellar&logoColor=white" alt="Stellar" /></a>
  <a href="https://developers.stellar.org/docs/build/smart-contracts"><img src="https://img.shields.io/badge/Soroban-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Soroban" /></a>
  <a href="https://www.rust-lang.org/"><img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://developers.stellar.org/docs/networks"><img src="https://img.shields.io/badge/Network-Testnet-14B6A6?style=for-the-badge&logo=stellar&logoColor=white" alt="Testnet" /></a>
  <a href="https://www.matrixdock.com/products/xaum"><img src="https://img.shields.io/badge/Gold-LBMA%2099.99%25-FFD700?style=for-the-badge" alt="Gold" /></a>
</p>

<p align="center">
  <a href="#tentang-pundi">Tentang Pundi</a> ·
  <a href="#masalah-yang-diselesaikan">Masalah</a> ·
  <a href="#arsitektur--cara-kerja">Cara Kerja</a> ·
  <a href="#smart-contract">Smart Contract</a> ·
  <a href="#fitur-utama">Fitur</a> ·
  <a href="#quick-start">Menjalankan Lokal</a> ·
  <a href="#pengujian">Pengujian Contract</a>
</p>

---

## 📌 Tentang Pundi

> **Definisi Satu Kalimat:**  
> **Pundi** adalah aplikasi kirim uang untuk Pekerja Migran Indonesia (PMI) yang secara otomatis menyisihkan sebagian kecil dari setiap kiriman menjadi tabungan emas fisik murni — sisanya diteruskan menjadi Rupiah utuh ke keluarga di kampung halaman.

Semua kompleksitas blockchain disembunyikan di balik layar. Pengguna hanya melihat dua hal: **Rupiah** yang diterima keluarga dan **gram emas** yang terkumpul.

---

## 🎯 Masalah yang Diselesaikan

1. **Kiriman Mahal:** Remitansi konvensional memotong biaya tersembunyi 5% hingga 6.36%. Di Pundi, biaya hanya **~1%** berkat efisiensi jaringan Stellar.
2. **Kiriman Menguap:** Mayoritas kiriman habis untuk konsumsi harian. Setelah bertahun-tahun bekerja di luar negeri, banyak PMI pulang tanpa tabungan.
3. **Tabungan Otomatis:** *"Momen terbaik untuk menabung bukan saat orang berniat di akhir bulan, melainkan saat uang sedang transit — sebelum terasa sebagai uang konsumsi."*

---

## ⚡ Arsitektur & Cara Kerja

```
[ PMI di Luar Negeri ] (SGD / HKD / MYR / KRW / USD)
         │
         ▼
[ Pundi App (Next.js + Tailwind) ]
         │  (Otorisasi via Freighter Wallet)
         ▼
[ Stellar Soroban — SavingsVaultContract ]
   ├─► 90% (Settle USDC) ──► [ Anchor IDR ] ──► Rekening Bank / DANA / GoPay Keluarga (Rupiah)
   └─► 10% (Settle USDC) ──► [ Stellar DEX ] ──► Token Emas XAUm (Matrixdock LBMA 99.99%)
```

### 4 Langkah Alur Pengiriman:
1. **PMI Kirim Dana:** Pilih negara kerja (Singapura, Hong Kong, Malaysia, Korea Selatan, dll.) dan masukkan nominal.
2. **Settle Kilat:** Dana dikonversi menjadi USDC di Stellar dalam waktu ~5 detik.
3. **Split Otomatis (Smart Contract):** Sesuai aturan (default 90% keluarga, 10% emas), kontrak mengeksekusi split secara atomik.
4. **Pencairan Rupiah & Simpan Emas:** Keluarga menerima Rupiah via BI-FAST, sedangkan emas fisik murni bertambah di brankas PMI.

---

## 📜 On-Chain Smart Contract

Kontrak **SavingsVaultContract** dibangun dengan Rust & Soroban SDK dan telah di-deploy di Stellar Testnet:

| Parameter | Detail |
|---|---|
| **Contract ID** | `CAJVFVM4DT6ZR634PU3MRFGP5FHDE5AAHCZXR4F54KWKZV25YQ7LYB2Z` |
| **Network** | Stellar Soroban Testnet |
| **RPC Endpoint** | `https://soroban-testnet.stellar.org` |
| **Passphrase** | `Test SDF Network ; September 2015` |
| **Stellar Expert** | [Lihat Kontrak di Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAJVFVM4DT6ZR634PU3MRFGP5FHDE5AAHCZXR4F54KWKZV25YQ7LYB2Z) |

### Fungsi Kontrak (`lib.rs`):
- `set_savings_rule(user, label, savings_bps)`: Menyimpan target tujuan tabungan (misal: "Sekolah Anak") dan persentase sisihan (500–2000 bps / 5%–20%).
- `get_savings_rule(user)`: Mengambil aturan tabungan aktif milik wallet pengguna.
- `record_remittance(sender, total_usdc, gold_price_usd, label)`: Mencatat transaksi remitansi, menghitung pembagian keluarga & emas secara atomik.
- `get_remittances(user)`: Menampilkan seluruh riwayat transaksi on-chain pengguna.
- `get_total_gold(user)`: Menghitung total akumulasi saldo emas (dalam miligram).

---

## ✨ Fitur Antarmuka (UX Ramah Orang Tua / Awam)

- 💸 **Layar Kirim Uang:**
  - Pilihan mata uang negara kerja lengkap dengan bendera negara (SGD, HKD, MYR, KRW, USD).
  - Estimasi transparan langsung (*Live Transparent Split*): rincian Rupiah keluarga, gram emas, dan biaya ~1%.
  - Tombol nominal cepat dan bukti transaksi on-chain dengan link Stellar Expert.
- 🎯 **Layar Aturan Nabung:**
  - Pilihan tujuan tabungan preset (*Sekolah Anak*, *Beli Rumah*, *Dana Darurat*, *Modal Usaha*, *Umrah / Haji*, *Kesehatan*) + opsi tulis sendiri.
  - Pilihan persentase sisihan (5%, 10%, 15%, 20%) disertai contoh konversi Rupiah yang mudah dimengerti.
- 🪙 **Layar Dashboard & Brankas Emas:**
  - Total saldo emas fisik (gram & estimasi nilai Rupiah terkini).
  - Tautan audit cadangan fisik emas **LBMA 99.99% di Matrixdock**.
  - Fitur **Tarik Tabungan (Kapan Saja)** tanpa biaya penalti untuk ketenangan pikiran keluarga.
  - Daftar riwayat transaksi on-chain.
- ❓ **Layar Panduan & Tanya Jawab (FAQ):**
  - Edukasi 4 langkah kerja Soroban.
  - Jawaban lengkap seputar kehalalan/syariah (emas fisik 1:1 tanpa bunga), non-crypto UX, dan keamanan dana.

---

## 🚀 Menjalankan Project Secara Lokal

### Prasyarat
- **Node.js:** v18.0+ atau v20.0+
- **Rust & Cargo:** (untuk menguji atau mem-build smart contract)
- **Browser Extension:** [Freighter Wallet](https://www.freighter.app/) (Diatur ke mode `Testnet`)

### Langkah Instalasi
```bash
# 1. Clone repository
git clone https://github.com/hanifhiros/inventory-dapps.git
cd inventory-dapps

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev

# 4. Buka di browser
# http://localhost:3000
```

---

## 🧪 Pengujian Smart Contract (Rust Unit Tests)

Smart contract dilengkapi dengan 6 automated unit tests di Soroban SDK:

```bash
cd contracts/notes
cargo test
```

### Hasil Test:
```text
running 6 tests
test test::get_savings_rule_returns_none_initially ... ok
test test::set_savings_rule_stores_correctly ... ok
test test::set_savings_rule_rejects_out_of_range ... ok
test test::record_remittance_calculates_split_correctly ... ok
test test::get_remittances_returns_all_records ... ok
test test::get_total_gold_accumulates_correctly ... ok
test test::user_data_is_isolated ... ok

test result: ok. 6 passed; 0 failed; 0 ignored
```

---

## 🛡️ Transparansi & Keamanan

- **Audit Cadangan Emas:** Emas XAUm dikelola oleh **Matrixdock** (emas fisik LBMA 99.99% yang disimpan di brankas teregulasi di Singapura & Hong Kong dan diaudit berkala oleh Bureau Veritas).
- **Stellar Soroban:** Seluruh catatan transaksi dan aturan tabungan bersifat transparan, tidak dapat diubah sepihak (*immutable*), dan dapat diverifikasi siapa saja di Stellar Explorer.

---

## 📄 Lisensi
MIT License © 2026 Pundi — Kirim & Tabung Emas untuk PMI.
