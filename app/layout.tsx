import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finde den Holzdieb · Gottlieb Arcade",
  description: "Sechs Bündel Buche, drei Verdächtige und ein Geheimnis: Dein erster Detektivfall auf Gottliebs Holzhof.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
