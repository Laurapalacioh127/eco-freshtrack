import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { AxiosProvider } from "@/providers/AxiosProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
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
    <html lang="es">
      <body className={`${inter.variable} ${bricolage.variable} antialiased`}>
        <ToastProvider>
          <AxiosProvider>
            <AuthProvider>{children}</AuthProvider>
          </AxiosProvider>
        </ToastProvider>
      </body>
    </html>
  );
}