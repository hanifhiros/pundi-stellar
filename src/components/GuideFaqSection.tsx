"use client";

import { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  Coins,
  ShieldCheck,
  Zap,
} from "lucide-react";

const STEPS = [
  {
    no: "1",
    title: "PMI Kirim dari Luar Negeri",
    desc: "Kirim SGD, HKD, MYR, atau KRW lewat aplikasi Pundi dengan biaya ~1% (jauh lebih murah dari remitansi konvensional 5-6%).",
    icon: "💸",
    badge: "Hemat & Mudah",
  },
  {
    no: "2",
    title: "Settle Kilat di Stellar",
    desc: "Dana dikonversi otomatis menjadi USDC di blockchain Stellar dalam hitungan detik (~5 detik) tanpa risiko fluktuasi.",
    icon: "⚡",
    badge: "Kecepatan 5 Detik",
  },
  {
    no: "3",
    title: "Split Otomatis 90% & 10%",
    desc: "Smart Contract Soroban membagi kiriman secara atomik: 90% diteruskan ke keluarga, 10% langsung dibelikan emas fisik XAUm.",
    icon: "✂️",
    badge: "Tanpa Disiplin Ekstra",
  },
  {
    no: "4",
    title: "Keluarga Terima Rupiah Utuh",
    desc: "Keluarga langsung menerima Rupiah di rekening bank atau DANA/GoPay via BI-FAST, sementara tabungan emas aman di brankas PMI.",
    icon: "🏦",
    badge: "Sampai di Rekening",
  },
];

const FAQS = [
  {
    q: "Apakah keluarga di rumah tetap terima rupiah?",
    a: "Ya! Porsi yang dikirim ke keluarga (misalnya 90%) tetap sampai dalam bentuk Rupiah di DANA, GoPay, atau rekening bank (BCA, BRI, Mandiri dll). Hanya bagian yang Anda sisihkan (misalnya 10%) yang otomatis menjadi tabungan emas murni.",
  },
  {
    q: "Apakah tabungan emas ini halal dan syariah?",
    a: "Ya. Tabungan berupa emas fisik asli 1:1 bersertifikasi LBMA 99.99% yang disimpan di brankas teregulasi (Matrixdock) dan diaudit berkala oleh Bureau Veritas. Tidak ada unsur riba, bunga, atau spekulasi.",
  },
  {
    q: "Kalau keluarga butuh uang mendadak, apakah emas bisa ditarik?",
    a: "Bisa kapan saja! Tidak ada jangka waktu penguncian dan tidak ada biaya penalti. Anda dapat mencairkan emas kembali menjadi Rupiah kapan pun dibutuhkan.",
  },
  {
    q: "Apakah saya atau orang tua saya perlu paham crypto / blockchain?",
    a: "Tidak sama sekali! Semua teknologi blockchain disembunyikan di balik layar. Anda dan keluarga hanya melihat nominal Rupiah yang sampai dan saldo gram emas yang terkumpul.",
  },
  {
    q: "Berapa biaya pengiriman lewat Pundi?",
    a: "Buka akun sepenuhnya gratis. Biaya pengiriman Pundi hanya sekitar ~1% karena menggunakan jaringan efisien Stellar, jauh lebih hemat dibanding jasa remitansi tradisional yang memotong 5% hingga 6.36%.",
  },
];

export function GuideFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-8">
      {/* 4 Step Flow */}
      <div className="pundi-card-premium space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-slate-900 leading-tight">
              Cara Kerja Pundi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bagaimana uang sampai ke keluarga sekaligus menumbuhkan emas otomatis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STEPS.map((s) => (
            <div
              key={s.no}
              className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 hover:bg-amber-50/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black flex items-center justify-center font-display">
                    {s.no}
                  </span>
                  <span className="text-xl">{s.icon}</span>
                </div>
                <span className="badge-gold-subtle text-[10px]">
                  {s.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 pt-1 font-display">
                {s.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Value Proposition Note */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/90 border border-amber-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs text-2xl">
            🪙
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-amber-950 font-display">
              Kenapa Menabung Emas Saat Kirim Uang?
            </h4>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              "Momen terbaik untuk menabung bukan saat orang punya niat di akhir bulan. Momen terbaik adalah saat uang sedang transit — sebelum ia terasa sebagai uang konsumsi."
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="pundi-card-premium space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-slate-900 leading-tight">
              Tanya Jawab (FAQ)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jawaban lengkap untuk pertanyaan umum keluarga dan PMI
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? "bg-amber-50/50 border-amber-300 ring-1 ring-amber-300/30"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-900 font-display leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? "rotate-180 text-amber-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-amber-200/60 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
