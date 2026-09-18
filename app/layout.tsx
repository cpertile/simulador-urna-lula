import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simulador de Urna Eletrônica",
  description: "Simulação satírica de votação na urna eletrônica.",
  openGraph: {
    title: "Simulador de Urna Eletrônica",
    description: "Simulação satírica de votação na urna eletrônica.",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulador de Urna Eletrônica",
    description: "Simulação satírica de votação na urna eletrônica.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
