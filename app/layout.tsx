import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Luminote",
    template: "%s | Luminote"
  },
  description: "摄影作品与视觉手记的轻盈归档。",
  openGraph: {
    title: "Luminote",
    description: "摄影作品与视觉手记的轻盈归档。",
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
