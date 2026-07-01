import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { Outfit, Space_Grotesk } from "next/font/google";
import MotionProvider from "@/components/MotionProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
import StickyAdBanner from "@/components/StickyAdBanner";
import StructuredData from "@/components/StructuredData";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Who is the GOAT? Ronaldo vs Messi · Live Vote",
    template: "%s | GOAT Vote",
  },
  description:
    "Live fan vote — Cristiano Ronaldo vs Lionel Messi. Cast your vote for football's greatest of all time during FIFA World Cup 2026. Updated in real time.",

  keywords: [
    "Ronaldo vs Messi",
    "who is the GOAT",
    "Cristiano Ronaldo",
    "Lionel Messi",
    "CR7",
    "Leo Messi",
    "football GOAT",
    "FIFA World Cup 2026",
    "GOAT debate",
    "best footballer ever",
  ],

  authors: [{ name: "GOAT Vote", url: SITE_URL }],
  creator: "GOAT Vote",
  publisher: "GOAT Vote",

  alternates: { canonical: "/" },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "GOAT Vote",
    title: "Who is the GOAT? Ronaldo vs Messi · Live Vote",
    description:
      "Live fan vote — Ronaldo vs Messi during FIFA World Cup 2026. Where does your allegiance lie?",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Who is the GOAT? Ronaldo vs Messi — Cast your live vote",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Who is the GOAT? Ronaldo vs Messi · Live Vote",
    description:
      "Live fan vote for football's greatest during FIFA World Cup 2026. Cast your vote now!",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${outfit.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <MotionProvider>
          {children}
          <StickyAdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER} />
        </MotionProvider>

        <Suspense fallback={null}>
          <StructuredData />
        </Suspense>

        {adsenseClient && (
          <Script
            id="adsbygoogle-init"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        )}

        {process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_URL && (
          <Script
            id="adsterra-popunder"
            strategy="lazyOnload"
            src={process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_URL}
          />
        )}

        {process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_URL && (
          <Script
            id="adsterra-social-bar"
            strategy="lazyOnload"
            src={process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_URL}
          />
        )}
      </body>
    </html>
  );
}
