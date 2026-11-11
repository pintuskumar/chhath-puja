import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_Devanagari, Inter, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ClientBoot } from "@/components/ClientBoot";
import { SkipLink } from "@/components/layout/SkipLink";
import { SITE_URL, asset } from "@/lib/paths";

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hindi",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-en", display: "swap" });
const display = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL.replace(/\/?$/, "/")),
  title: {
    default: "छठ महापर्व — चार दिन, अनगिनत भावनाएँ, एक अटूट आस्था",
    template: "%s · छठ महापर्व",
  },
  description:
    "छठ महापर्व के चारों दिन — नहाय-खाय, खरना, संध्या अर्घ्य और उषा अर्घ्य — को 3D और 2D दृश्यों में देखिए, समझिए और महसूस कीजिए। An immersive bilingual (Hindi/English) guide to Chhath Puja.",
  keywords: ["छठ पूजा", "छठ महापर्व", "Chhath Puja", "नहाय-खाय", "खरना", "संध्या अर्घ्य", "उषा अर्घ्य", "ठेकुआ", "Bihar"],
  icons: { icon: asset("/favicon.svg") },
  openGraph: {
    type: "website",
    locale: "hi_IN",
    alternateLocale: ["en_IN"],
    siteName: "छठ महापर्व",
    title: "छठ महापर्व — आस्था, प्रकृति और परंपरा की अद्भुत यात्रा",
    description: "देखिए, समझिए और महसूस कीजिए छठ महापर्व की हर परंपरा।",
  },
  alternates: { canonical: "./" },
};

export const viewport: Viewport = {
  themeColor: "#101D38",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hi" className={`${devanagari.variable} ${inter.variable} ${display.variable}`} data-motion="full">
      <body>
        <ClientBoot />
        <SkipLink />
        <Header />
        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
