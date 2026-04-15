import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthToasterClientOnly } from "@/components/auth/auth-toaster-client-only";
import { DismissToastsOnNavigate } from "@/components/auth/dismiss-toasts-on-navigate";
import { ThemeProvider } from "@/components/theme-provider";
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
  description: 'Personal control for training and finances',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-text">
        <ThemeProvider>
          {children}
          <DismissToastsOnNavigate />
          <AuthToasterClientOnly />
        </ThemeProvider>
      </body>
    </html>
  );
}
