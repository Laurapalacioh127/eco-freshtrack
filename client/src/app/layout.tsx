import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AxiosProvider } from "@/providers/AxiosProvider"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FreshTrack", 
  description: "Smart Food Inventory & Circular Anti-Waste Ecosystem", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es"> {/* CAMBIADO: antes decía "en" */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AxiosProvider>{children}</AxiosProvider> {/* NUEVO: envuelve a children */}
      </body>
    </html>
  );
}