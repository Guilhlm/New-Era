import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthToaster } from "@/components/auth/auth-toaster";
import { DismissToastsOnNavigate } from "@/components/auth/dismiss-toasts-on-navigate";
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
  title: 'New-era',
  description: 'Controle pessoal de academia e finanças',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-text">
        {children}
        <DismissToastsOnNavigate />
        <AuthToaster />
      </body>
    </html>
  );
}
