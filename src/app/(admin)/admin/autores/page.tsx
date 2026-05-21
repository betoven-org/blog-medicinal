"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminShell from "@/components/admin/AdminShell";
import DataTable from "@/components/admin/DataTable";

type Author = {
  id: number;
  name: string;
  slug: string;
  avatar?: {
    url?: string;
  } | null;
};

type ApiResponse = {
  docs: Author[];
  totalPages: number;
  page: number;
};

export default function AutoresPage() {
  const router = useRouter();
  const [data, setData] = useState<Author[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthors = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/authors?page=${page}`);
      if (!res.ok) throw new Error("Erro ao carregar autores.");
      const json: ApiResponse = await res.json();
      setData(json.docs);
      setTotalPages(json.totalPages);
      setCurrentPage(json.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/authors/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error || "Erro ao excluir autor.");
        return;
      }

      fetchAuthors(currentPage);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir autor.");
    }
  };

  const columns = [
    {
      key: "avatar",
      label: "Avatar",
      render: (item: Author) =>
        item.avatar?.url ? (
          <Image
            src={item.avatar.url}
            alt={item.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-500">
            {item.name.charAt(0).toUpperCase()}
          </div>
        ),
    },
    { key: "name", label: "Nome" },
    { key: "slug", label: "Slug" },
  ];

  return (
    <AdminShell title="Autores">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Gerencie os autores do blog.
        </p>
        <Link
          href="/admin/autores/novo"
          className="inline-flex items-center gap-2 rounded-md bg-[#0d61ac] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0a4f8c]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 256 256"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
          </svg>
          Novo Autor
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg
            className="h-8 w-8 animate-spin text-[#0d61ac]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="ml-3 text-sm text-gray-500">Carregando...</span>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          totalPages={totalPages}
          currentPage={currentPage}
          baseUrl="/admin/autores"
          onDelete={handleDelete}
          editUrl={(item) => `/admin/autores/${item.id}`}
        />
      )}
    </AdminShell>
  );
}
