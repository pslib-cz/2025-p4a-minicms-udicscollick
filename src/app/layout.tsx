import type { Metadata } from "next";
import { Newsreader, Space_Grotesk } from "next/font/google";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/tiptap/styles.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { absoluteUrl, siteConfig } from "@/lib/site";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: `${siteConfig.name} | Cestovatelské tipy`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: `${siteConfig.name} | Cestovatelské tipy`,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    locale: "cs_CZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${spaceGrotesk.variable} ${newsreader.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
