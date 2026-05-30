import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Geist, Inter, Geist_Mono } from "next/font/google";

import { AuthProvider } from "@/shared/providers/auth-provider";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { QueryProvider } from "@/shared/providers/query-provider";

import { SessionExpiredDialog } from "@/features/auth/components/session-expired-dialog";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AquaGás | Gestão Integrada",
  description: "Painel de gestão AquaGás Distribuidora",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              {children}
              <SessionExpiredDialog />
            </AuthProvider>
          </QueryProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
