import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Luminote",
    template: "%s | Luminote"
  },
  description: "Independent photography portfolio and visual journal.",
  openGraph: {
    title: "Luminote",
    description: "Independent photography portfolio and visual journal.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className="font-body text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
