import type { Metadata } from "next";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pundi — Celengan Emas Otomatis & Kirim Uang",
  description:
    "Kirim uang ke keluarga, otomatis menabung emas. Untuk Pekerja Migran Indonesia.",
  keywords: ["kirim uang", "tabungan emas", "PMI", "remitansi", "Stellar", "XAUm", "Pundi"],
  openGraph: {
    title: "Pundi — Kirim & Tabung Emas Otomatis",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
