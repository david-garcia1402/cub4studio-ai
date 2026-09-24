import type { Metadata } from "next";
import { Baloo_2, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cub4Studio AI — crie com o estúdio",
  description:
    "Tutorial, briefing e preview para landing page, criativo, foto ou reel. No final, fale com a cub4Studio no WhatsApp ou Instagram.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} ${baloo.variable} antialiased`}>{children}</body>
    </html>
  );
}
