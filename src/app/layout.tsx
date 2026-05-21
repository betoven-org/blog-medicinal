import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Medicinal na Web | Portal de Saúde e Bem-estar",
    template: "%s | Medicinal na Web",
  },
  description:
    "Portal de saúde, suplementos naturais, fitoterapia e bem-estar. Conteúdo educativo sobre nutrição, vitaminas e vida saudável.",
  keywords: [
    "saúde",
    "suplementos",
    "fitoterapia",
    "bem-estar",
    "nutrição",
    "vitaminas",
    "medicinal",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Medicinal na Web",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
