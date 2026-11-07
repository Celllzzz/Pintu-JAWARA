import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { PwaRegister } from "@/components/layout/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pintu JAWARA — BRMP Banten",
    template: "%s | Pintu JAWARA",
  },
  description: "Pusat Informasi Terpadu — Balai Besar Penerapan Modernisasi Pertanian (BRMP) Banten, Kementerian Pertanian",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Pintu JAWARA — BRMP Banten",
    title: "Pintu JAWARA — Pusat Informasi Terpadu",
    description: "Layanan permohonan informasi publik, benih & bibit sumber UPBS, magang, pengujian lab, dan konsultasi pertanian BRMP Banten.",
  },
  twitter: {
    card: "summary",
    title: "Pintu JAWARA — BRMP Banten",
    description: "Pusat Informasi Terpadu — BRMP Banten, Kementerian Pertanian",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e4f28",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        <PwaRegister />
        <OfflineBanner />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
