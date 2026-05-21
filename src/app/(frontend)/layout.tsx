import { Roboto } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "../globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${roboto.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className="flex min-h-screen flex-col bg-white font-sans text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
