import type { Metadata } from "next";
import { AppProviders } from "@/providers/AppProviders";
import { WalletButton } from "@/components/WalletButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pundi — Kirim Uang, Otomatis Tabung Emas",
  description:
    "Aplikasi kirim uang untuk keluarga Pekerja Migran Indonesia yang secara otomatis menyisihkan sebagian kecil menjadi tabungan emas fisik murni (LBMA 99.99%) di Stellar Soroban.",
  keywords: ["kirim uang", "tabungan emas", "PMI", "remitansi", "Stellar", "XAUm", "Pundi"],
  openGraph: {
    title: "Pundi — Kirim Uang, Otomatis Tabung Emas",
    description: "Kirim uang ke keluarga, otomatis menabung emas tanpa disiplin ekstra.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FAFAF7] text-slate-900 flex flex-col">
        <AppProviders>
          {/* ── Top Header ── */}
          <header className="pundi-header">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl shadow-sm">
                  🪙
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
                      Pundi
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Kirim · Tabung · Tumbuh
                  </p>
                </div>
              </div>

              {/* Right: Wallet Button */}
              <div className="flex items-center gap-4">
                <WalletButton />
              </div>
            </div>
          </header>

          {/* ── Main Canvas ── */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
            {children}
          </main>

          {/* ── Footer ── */}
          <footer className="border-t border-slate-200 bg-white py-8 text-center">
            <div className="max-w-5xl mx-auto px-6 space-y-2">
              <p className="text-xs text-slate-500 font-medium">
                Emas XAUm dikelola oleh{" "}
                <a
                  href="https://www.matrixdock.com/products/xaum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 font-bold hover:underline focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                >
                  Matrixdock
                </a>{" "}
                · Fisik LBMA 99.99% · Aman & Terverifikasi
              </p>
              <p className="text-[11px] text-slate-400">
                Uang sampai seketika · Tabungan otomatis tersimpan dengan aman
              </p>
            </div>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
