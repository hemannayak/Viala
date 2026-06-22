import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { RootLayoutClient } from "@/components/layout/root-layout-client";
import { ConfigValidator } from "@/lib/config-validator";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "VIALA | Make Every Medicine Matter",
  description: "The platform that helps healthcare organizations prevent medicine waste and recover value before expiry.",
};

// Build trigger to force Vercel deployment of the latest main branch
// Validate configuration on startup
if (typeof window === 'undefined') {
  const g = globalThis as typeof globalThis & { __vialaConfigLogged?: boolean }
  if (!g.__vialaConfigLogged) {
    g.__vialaConfigLogged = true
    ConfigValidator.logConfigurationStatus();
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable} antialiased`} suppressHydrationWarning>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}