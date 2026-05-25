import { Suspense } from "react";
import { Roboto } from "next/font/google";
import { NavigationProgress } from "@/components/NavigationProgress";
import { UmamiScript } from "@/components/UmamiScript";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import "../globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
  preload: true,
});

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${roboto.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://framerusercontent.com" />
        <link rel="dns-prefetch" href="https://framerusercontent.com" />
        <link rel="preconnect" href="https://medicinalnaweb.vteximg.com.br" />
        <link rel="dns-prefetch" href="https://medicinalnaweb.vteximg.com.br" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title="Medicinal na Web" href="/feed.xml" />
      </head>
      <body className="flex min-h-screen flex-col bg-white font-sans text-gray-900">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Header />
        {children}
        <Footer />
        <Suspense fallback={null}>
          <UmamiScript />
        </Suspense>
      </body>
    </html>
  );
}
