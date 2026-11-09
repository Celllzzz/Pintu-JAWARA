import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { PwaRegister } from "@/components/layout/PwaRegister";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pintu-jawara.vercel.app"),
  title: {
    default: "Pintu JAWARA - BRMP Banten",
    template: "%s | Pintu JAWARA",
  },
  description: "Pusat Informasi Terpadu - Balai Penerapan Modernisasi Pertanian (BRMP) Banten, Kementerian Pertanian. Layanan permohonan informasi publik, benih & bibit sumber UPBS, magang, pengujian lab, dan konsultasi pertanian.",
  keywords: [
    "Pintu JAWARA",
    "BRMP Banten",
    "Kementerian Pertanian",
    "Benih Sumber Padi",
    "Bibit Ayam KUB",
    "Layanan Pertanian Banten",
    "Pelayanan Publik Banten",
    "UPBS Banten",
    "Informasi Pertanian",
    "Sertifikasi Benih",
    "Magang Pertanian Banten",
    "Pengujian Laboratorium Pertanian"
  ],
  authors: [{ name: "BRMP Banten Kementerian Pertanian", url: "https://pintu-jawara.vercel.app" }],
  creator: "BRMP Banten",
  publisher: "Balai Penerapan Modernisasi Pertanian Banten",
  alternates: {
    canonical: "/",
  },
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
    url: "https://pintu-jawara.vercel.app",
    siteName: "Pintu JAWARA - BRMP Banten",
    title: "Pintu JAWARA - Pusat Informasi Terpadu BRMP Banten",
    description: "Layanan permohonan informasi publik, benih & bibit sumber UPBS, magang, pengujian lab, dan konsultasi pertanian BRMP Banten.",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Pintu JAWARA - BRMP Banten",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Pintu JAWARA - BRMP Banten",
    description: "Pusat Informasi Terpadu - BRMP Banten, Kementerian Pertanian",
    images: ["/icons/icon-512x512.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "GovernmentOrganization",
      "@id": "https://pintu-jawara.vercel.app/#organization",
      "name": "BRMP Banten - Balai Penerapan Standar Instrumen Pertanian Banten",
      "alternateName": [
        "BRMP Banten",
        "Pintu JAWARA",
        "Balai Penerapan Modernisasi Pertanian Banten",
        "BPSIP Banten"
      ],
      "url": "https://pintu-jawara.vercel.app",
      "logo": "https://pintu-jawara.vercel.app/icons/icon-512x512.png",
      "email": "brmp.banten@pertanian.go.id",
      "telephone": "+62-851-1121-6203",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+62-851-1121-6203",
          "contactType": "customer service",
          "availableLanguage": ["id"]
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Jl. Ciptayasa KM 01",
        "addressLocality": "Ciruas, Kabupaten Serang",
        "addressRegion": "Banten",
        "postalCode": "42182",
        "addressCountry": "ID"
      }
    },
    {
      "@type": "GovernmentService",
      "@id": "https://pintu-jawara.vercel.app/#service",
      "name": "Pintu JAWARA - Pusat Informasi Terpadu BRMP Banten",
      "provider": {
        "@id": "https://pintu-jawara.vercel.app/#organization"
      },
      "serviceType": "Pelayanan Publik Pertanian",
      "areaServed": {
        "@type": "AdministrativeArea",
        "name": "Banten"
      },
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": "https://pintu-jawara.vercel.app/ajukan"
      }
    }
  ]
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
    <html lang="id" className={`h-full antialiased ${plusJakartaSans.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        <PwaRegister />
        <OfflineBanner />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
