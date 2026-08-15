"use client";

import { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Zap,
  Coins,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  Lock,
} from "lucide-react";

const STEPS = [
  {
    no: "1",
    title: "PMI Kirim dari Luar Negeri",
    desc: "Kirim SGD, HKD, MYR, atau KRW lewat aplikasi Pundi dengan biaya ~1% (jauh lebih murah dari cara konvensional 5-6%).",
    icon: "💸",
    badge: "Mudah & Murah",
  },
  {
    no: "2",
    title: "Settle Kilat di Stellar",
    desc: "Dana dikonversi otomatis menjadi USDC di jaringan blockchain Stellar hanya dalam hitungan detik (~5 detik).",
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
    desc: "Keluarga di kampung langsung menerima Rupiah di rekening bank atau DANA/GoPay via BI-FAST, sementara emas aman di brankas PMI.",
    icon: "🏦",
    badge: "Sampai di Rekening",
  },
];

const FAQS = [
  {
    q: "Apakah keluarga di rumah tetap terima rupiah?",
    a: "Ya! Bagian yang dikirim ke keluarga (misalnya 90%) tetap sampai dalam bentuk Rupiah di DANA, GoPay, atau rekening bank (BCA, BRI, Mandiri dll). Hanya porsi yang Anda sisihkan (misalnya 10%) yang otomatis menjadi tabungan emas murni.",
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
      <div className="card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              Cara Kerja Pundi
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Bagaimana uang Anda sampai ke keluarga sekaligus menumbuhkan emas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STEPS.map((s) => (
            <div
              key={s.no}
              className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/80 space-y-2 hover:bg-amber-50/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black flex items-center justify-center">
                    {s.no}
                  </span>
                  <span className="text-xl">{s.icon}</span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  {s.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 pt-1">
                {s.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Why Gold Value Proposition */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100/80 via-amber-50 to-amber-100/80 border border-amber-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Coins className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-amber-950">
              Kenapa Menabung Emas Saat Kirim Uang?
            </h4>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              "Momen terbaik untuk menabung bukan saat orang punya niat menabung di akhir bulan. Momen terbaik adalah saat uang sedang transit — sebelum ia terasa seperti uang konsumsi."
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              Tanya Jawab (FAQ)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
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
                    ? "bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/30"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3"
                >
                  <span className="text-sm font-bold text-gray-900 leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                      isOpen ? "rotate-180 text-amber-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-amber-200/50">
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
