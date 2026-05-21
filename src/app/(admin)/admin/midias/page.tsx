"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import AdminShell from "@/components/admin/AdminShell";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

type MediaItem = {
  id: number;
  filename: string;
  alt?: string;
  url: string;
  filesize?: number;
  width?: number;
  height?: number;
  mimeType?: string;
};

type ApiResponse = {
  docs: MediaItem[];
  totalPages: number;
  page: number;
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return "--";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MidiasPage() {
  const [data, setData] = useState<MediaItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media?page=${page}`);
      if (!res.ok) throw new Error("Erro ao carregar midias.");
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
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || `Erro ao enviar ${files[i].name}.`);
        }
      }

      fetchMedia(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar arquivo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      const res = await fetch(`/api/admin/media/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error || "Erro ao excluir midia.");
        return;
      }

      if (selectedItem?.id === deleteId) {
        setSelectedItem(null);
      }

      fetchMedia(currentPage);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir midia.");
    }
  };

  return (
    <AdminShell title="Midias">
      {/* Upload area */}
      <div className="mb-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-[#0d61ac] hover:bg-blue-50/30"
        >
          {uploading ? (
            <div className="flex items-center gap-3">
              <svg
                className="h-6 w-6 animate-spin text-[#0d61ac]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-medium text-gray-600">Enviando...</span>
            </div>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 256 256"
                fill="currentColor"
                className="mb-2 text-gray-400"
                aria-hidden="true"
              >
                <path d="M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H80a8,8,0,0,1,0,16H32v64H224V136H176a8,8,0,0,1,0-16h48A16,16,0,0,1,240,136ZM85.66,77.66,120,43.31V128a8,8,0,0,0,16,0V43.31l34.34,34.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,77.66ZM200,168a12,12,0,1,0-12,12A12,12,0,0,0,200,168Z" />
              </svg>
              <p className="text-sm font-medium text-gray-600">
                Clique para enviar imagens
              </p>
              <p className="mt-1 text-xs text-gray-400">
                PNG, JPG, GIF, WebP
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

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
      ) : data.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 256 256"
            fill="currentColor"
            className="mx-auto mb-4 text-gray-300"
            aria-hidden="true"
          >
            <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,200V172l52-52,80,80H40Zm176,0H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z" />
          </svg>
          <p className="text-sm text-gray-500">Nenhuma midia encontrada.</p>
          <p className="mt-1 text-xs text-gray-400">
            Envie imagens usando a area acima.
          </p>
        </div>
      ) : (
        <>
          {/* Gallery grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.map((item) => (
              <div
                key={item.id}
                className={`group relative cursor-pointer overflow-hidden rounded-lg border bg-white transition-all hover:shadow-md ${
                  selectedItem?.id === item.id
                    ? "border-[#0d61ac] ring-2 ring-[#0d61ac]/20"
                    : "border-gray-200"
                }`}
                onClick={() =>
                  setSelectedItem(selectedItem?.id === item.id ? null : item)
                }
              >
                <div className="relative aspect-square">
                  <Image
                    src={item.url}
                    alt={item.alt || item.filename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-gray-700">
                    {item.filename}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {formatFileSize(item.filesize)}
                    {item.width && item.height
                      ? ` - ${item.width}x${item.height}`
                      : ""}
                  </p>
                </div>

                {/* Delete button overlay */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(item.id);
                  }}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Excluir ${item.filename}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 256 256"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Selected item details */}
          {selectedItem && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start gap-4">
                <Image
                  src={selectedItem.url}
                  alt={selectedItem.alt || selectedItem.filename}
                  width={120}
                  height={120}
                  className="h-24 w-24 rounded-md border border-gray-200 object-cover"
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedItem.filename}
                  </p>
                  {selectedItem.alt && (
                    <p className="text-xs text-gray-500">
                      Alt: {selectedItem.alt}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Tamanho: {formatFileSize(selectedItem.filesize)}
                  </p>
                  {selectedItem.width && selectedItem.height && (
                    <p className="text-xs text-gray-400">
                      Dimensoes: {selectedItem.width}x{selectedItem.height}px
                    </p>
                  )}
                  {selectedItem.mimeType && (
                    <p className="text-xs text-gray-400">
                      Tipo: {selectedItem.mimeType}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 break-all">
                    URL: {selectedItem.url}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteId(selectedItem.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 256 256"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                  </svg>
                  Excluir
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Pagina {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => fetchMedia(currentPage - 1)}
                  className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => fetchMedia(currentPage + 1)}
                  className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Proximo
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <DeleteConfirm
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir midia?"
        description="Esta acao nao pode ser desfeita. A midia sera permanentemente removida."
      />
    </AdminShell>
  );
}
