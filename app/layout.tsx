import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luan Motos | Motos em Campina Grande",
  description: "Compra, venda, troca e financiamento de motos em Campina Grande/PB.",
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
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
