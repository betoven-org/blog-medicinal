import Link from "next/link";
import { Roboto } from "next/font/google";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
  preload: true,
});

export default function NotFound() {
  return (
    <html lang="pt-BR" className={`${roboto.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-gray-900">
        <Header />
        <main className="mx-auto flex max-w-7xl w-full flex-1 flex-col items-center justify-center px-4 py-24 text-center">
          <span className="mb-8 text-[10rem] font-black leading-none text-gray-100 select-none">404</span>

          <h1 className="text-2xl font-bold text-gray-900">
            Pagina nao encontrada
          </h1>
          <p className="mt-3 max-w-md text-gray-500">
            O conteudo que voce procura pode ter sido removido, renomeado ou nunca existiu.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0d61ac] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0a4f8c]"
            >
              <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V168h32v48a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V160a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v48H48V120l80-80,80,80Z" />
              </svg>
              Voltar ao inicio
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac]"
            >
              <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V96H40ZM216,200H40V112H216v88Zm-16-72a8,8,0,0,1-8,8H64a8,8,0,0,1,0-16H192A8,8,0,0,1,200,128Zm0,32a8,8,0,0,1-8,8H64a8,8,0,0,1,0-16H192A8,8,0,0,1,200,160Z" />
              </svg>
              Ver todos os posts
            </Link>
            <Link
              href="/produtos"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac]"
            >
              <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44L128,120,47.66,76ZM40,90l80,43.78v85.79L40,175.82Zm96,129.57V133.82L216,90v85.78Z" />
              </svg>
              Ver produtos
            </Link>
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
