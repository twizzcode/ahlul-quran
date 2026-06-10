import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getOrganizationJsonLd, getSiteUrl, getWebsiteJsonLd } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Masjid Semilyar Tangan",
    template: "%s | Masjid Semilyar Tangan",
  },
  description:
    "Website resmi Masjid Semilyar Tangan untuk profil masjid, program, berita, artikel, dan donasi.",
  applicationName: "Masjid Semilyar Tangan",
  openGraph: {
    siteName: "Masjid Semilyar Tangan",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = [getOrganizationJsonLd(), getWebsiteJsonLd()];

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
