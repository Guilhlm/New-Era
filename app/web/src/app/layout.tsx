import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { AuthToaster } from "@/components/auth/auth-toaster";
import { DismissToastsOnNavigate } from "@/components/auth/dismiss-toasts-on-navigate";
import { ThemeProvider } from "@/components/theme-provider";
import { THEME_STORAGE_KEY } from "@/lib/theme";
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-text">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==='light')document.documentElement.classList.add('light');}catch(e){}`,
          }}
        />
        <ThemeProvider>
          {children}
          <DismissToastsOnNavigate />
          <AuthToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
