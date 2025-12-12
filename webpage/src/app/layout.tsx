import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/context/ToastContext";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gegebaskı | Profesyonel 3D Baskı Hizmetleri",
  description: "Hızlı, kaliteli ve uygun fiyatlı 3D baskı çözümleri. FDM ve SLA baskı hizmetleri.",
};

import WhatsAppWidget from "@/components/WhatsAppWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <Providers>
          <ToastProvider>
            <Navbar />
            <main className="flex-grow pt-24">
              {children}
            </main>
            <WhatsAppWidget />
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
