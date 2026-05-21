import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
      <span className="text-8xl font-black text-gray-200">404</span>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        Pagina nao encontrada
      </h1>
      <p className="mt-2 text-gray-500">
        O conteudo que voce procura pode ter sido removido ou nao existe.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-[#0d61ac] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0a4f8c]"
        >
          Voltar ao inicio
        </Link>
        <Link
          href="/blog"
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac]"
        >
          Ver todos os posts
        </Link>
      </div>
    </div>
  );
}
