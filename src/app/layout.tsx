import type { Metadata, Viewport } from "next";
import { Baloo_2, Outfit } from "next/font/google";
import { STUDIO } from "@/lib/studio";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  display: "swap",
});

const title = "cub4Studio AI — crie com o estúdio";
const description =
  "Tutorial, briefing e preview para landing page, criativo, foto ou reel. No final, fale com a cub4Studio no WhatsApp ou Instagram.";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s · cub4Studio",
  },
  description,
  applicationName: "cub4Studio AI",
  keywords: ["cub4Studio", "landing page", "criativos", "reel", "foto de marca", "automação", "estúdio de criação"],
  openGraph: {
    title,
    description,
    siteName: STUDIO.name,
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: STUDIO.background,
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className={`${outfit.variable} ${baloo.variable} antialiased`}>{children}</body>
    </html>
  );
}
