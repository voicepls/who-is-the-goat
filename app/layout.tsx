import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Who is the GOAT? Ronaldo vs Messi",
  description: "A live FIFA World Cup 2026 themed voting arena for football's eternal GOAT debate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
