"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";

type PostRow = {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published";
  categoryName: string | null;
  authorName: string | null;
  createdAt: string;
};

export default function PostsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page") || "1");
  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "";

  const [data, setData] = useState<PostRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(currentSearch);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", "10");
      if (currentSearch) params.set("search", currentSearch);
      if (currentStatus) params.set("status", currentStatus);

      const res = await fetch(`/api/admin/posts?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao carregar posts");

      const json = await res.json();
      setData(json.docs);
      setTotalPages(json.totalPages);
    } catch {
      setData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSearch, currentStatus]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    }
    params.delete("page");
    router.push(`/admin/posts?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search });
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir post");
      fetchPosts();
    } catch {
      // silently handled — DataTable shows confirmation
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const columns = [
    {
      key: "title",
      label: "Titulo",
      render: (item: PostRow) => (
        <span className="font-medium text-gray-900">{item.title}</span>
      ),
    },
    {
      key: "categoryName",
      label: "Categoria",
      render: (item: PostRow) => item.categoryName || "---",
    },
    {
      key: "authorName",
      label: "Autor",
      render: (item: PostRow) => item.authorName || "---",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "createdAt",
      label: "Data",
      render: (item: PostRow) => formatDate(item.createdAt),
    },
  ];

  const baseUrl = (() => {
    const params = new URLSearchParams();
    if (currentSearch) params.set("search", currentSearch);
    if (currentStatus) params.set("status", currentStatus);
    const qs = params.toString();
    return qs ? `/admin/posts?${qs}` : "/admin/posts";
  })();

  return (
    <AdminShell title="Posts">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <form onSubmit={handleSearch} className="flex flex-1 max-w-md gap-2">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar posts..."
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm shadow-sm placeholder:text-gray-400 focus:border-[#0d61ac] focus:outline-none focus:ring-2 focus:ring-[#0d61ac]"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Buscar
            </button>
          </form>

          <select
            value={currentStatus}
            onChange={(e) => updateParams({ status: e.target.value })}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#0d61ac] focus:outline-none focus:ring-2 focus:ring-[#0d61ac]"
          >
            <option value="">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        <Link
          href="/admin/posts/novo"
          className="inline-flex items-center gap-2 rounded-md bg-[#0d61ac] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0a4f8c]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Post
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
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          totalPages={totalPages}
          currentPage={currentPage}
          baseUrl={baseUrl}
          onDelete={handleDelete}
          editUrl={(item) => `/admin/posts/${item.id}`}
        />
      )}
    </AdminShell>
  );
}
