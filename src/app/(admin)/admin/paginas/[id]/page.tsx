"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import FormField from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";

type EditState = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  content: string;
};

type Page = {
  id: number;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  content: string;
  draft: EditState | null;
  createdAt: string;
  updatedAt: string;
};

type ColumnKey = "properties" | "preview" | "seo" | "changes";

function slugToPath(slug: string) {
  return slug === "home" ? "/" : `/${slug}`;
}

function Spinner({ small }: { small?: boolean }) {
  return (
    <svg
      className={`${small ? "h-3.5 w-3.5" : "h-8 w-8"} animate-spin text-[#0d61ac]`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ── Toolbar icons ──────────────────────────────────────────────────── */

function IconProperties() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84.84-2.872a2 2 0 0 1 .506-.854z" />
    </svg>
  );
}

function IconSeo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </svg>
  );
}

function IconPreview() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconChanges() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v14" />
      <path d="m5 10 7 7 7-7" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  );
}

const COLUMNS: { key: ColumnKey; label: string; icon: React.ReactNode }[] = [
  { key: "properties", label: "Propriedades", icon: <IconProperties /> },
  { key: "preview", label: "Preview", icon: <IconPreview /> },
  { key: "seo", label: "Page SEO", icon: <IconSeo /> },
  { key: "changes", label: "Alteracoes", icon: <IconChanges /> },
];

/* ── Content tabs ───────────────────────────────────────────────────── */

function ContentTabs({
  active,
  onSwitch,
}: {
  active: "code" | "preview";
  onSwitch: (tab: "code" | "preview") => void;
}) {
  return (
    <div className="flex gap-0.5 rounded-md bg-gray-100 p-0.5">
      <button
        type="button"
        onClick={() => onSwitch("code")}
        className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
          active === "code" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Codigo
      </button>
      <button
        type="button"
        onClick={() => onSwitch("preview")}
        className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
          active === "preview" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Preview
      </button>
    </div>
  );
}

/* ── Column header ──────────────────────────────────────────────────── */

function ColumnHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5">
      <span className="text-xs font-semibold text-gray-700">{title}</span>
      <button
        type="button"
        onClick={onClose}
        className="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label={`Fechar ${title}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function colWidth(count: number) {
  if (count <= 1) return "100%";
  if (count === 2) return "50%";
  if (count === 3) return "33.333%";
  return "25%";
}

const FIELD_LABELS: Record<string, string> = {
  title: "Titulo",
  metaTitle: "Meta Title",
  metaDescription: "Meta Description",
  ogTitle: "OG Title",
  ogDescription: "OG Description",
  ogImageUrl: "OG Image URL",
  content: "Conteudo",
};

const DIFF_FIELDS: (keyof EditState)[] = [
  "title", "metaTitle", "metaDescription",
  "ogTitle", "ogDescription", "ogImageUrl", "content",
];

function getChanges(page: Page): { field: string; label: string; published: string; draft: string }[] {
  if (!page.draft) return [];
  const result: { field: string; label: string; published: string; draft: string }[] = [];
  for (const key of DIFF_FIELDS) {
    const pub = (page[key] ?? "") as string;
    const dra = (page.draft[key] ?? "") as string;
    if (pub !== dra) {
      result.push({
        field: key,
        label: FIELD_LABELS[key] || key,
        published: pub,
        draft: dra,
      });
    }
  }
  return result;
}

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return str.slice(0, max) + "...";
}

/* ── Main ───────────────────────────────────────────────────────────── */

export default function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const [page, setPage] = useState<Page | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  const [openColumns, setOpenColumns] = useState<Set<ColumnKey>>(new Set(["properties", "seo"]));
  const [contentTab, setContentTab] = useState<"code" | "preview">("code");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function toggleColumn(key: ColumnKey) {
    setOpenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  useEffect(() => {
    fetch(`/api/admin/pages/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar pagina");
        return res.json();
      })
      .then((data: Page) => {
        setPage(data);
        const initial: EditState = data.draft ?? {
          title: data.title,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          ogTitle: data.ogTitle,
          ogDescription: data.ogDescription,
          ogImageUrl: data.ogImageUrl,
          content: data.content,
        };
        setEditState(initial);
        setSavedSnapshot(JSON.stringify(initial));
        setOgImagePreview(initial.ogImageUrl || null);
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const save = useCallback(async (state: EditState) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      const updated: Page = await res.json();
      setPage(updated);
      setSavedSnapshot(JSON.stringify(state));
      setLastSaved(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setEditState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [name]: value };
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(next), 1500);
      return next;
    });
  }

  async function handlePublish() {
    if (!editState || !page) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await save(editState);
    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/pages/${id}/publish`, { method: "POST" });
      if (!res.ok) throw new Error("Erro ao publicar");
      const updated: Page = await res.json();
      setPage(updated);
      setSavedSnapshot(JSON.stringify(editState));
      toast.success("Pagina publicada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao publicar");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <AdminShell title="Editar pagina" headerExtra={null}>
        <div className="flex items-center justify-center py-12">
          <Spinner />
          <span className="ml-3 text-sm text-gray-500">Carregando...</span>
        </div>
      </AdminShell>
    );
  }

  if (fetchError || !page || !editState) {
    return (
      <AdminShell title="Editar pagina" headerExtra={null}>
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-8,56a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,104a12,12,0,1,1,12-12A12,12,0,0,1,128,184Z" />
          </svg>
          {fetchError ?? "Pagina nao encontrada"}
        </div>
      </AdminShell>
    );
  }

  const hasDraft = page.draft !== null;
  const hasContent = !!(editState?.content || page.content);
  const previewUrl = hasContent ? `/api/admin/pages/${id}/preview` : slugToPath(page.slug);
  const isBusy = saving || publishing;

  // Draft count: number of fields changed vs published
  const draftCount = hasDraft ? countChanges(page) : 0;

  // Header extra
  const publishButton = (
    <div className="flex items-center gap-2">
      {saving && <span className="flex items-center gap-1.5 text-xs text-gray-400"><Spinner small /></span>}
      {/* Staging indicator — links to /admin/publicar */}
      <a
        href="/admin/publicar"
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50"
      >
        <span>staging</span>
        {hasDraft && (
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#0d61ac] px-1 text-[10px] font-bold text-white leading-none">
            {draftCount}
          </span>
        )}
      </a>

      {/* Publish button */}
      <button
        type="button"
        onClick={handlePublish}
        disabled={isBusy || !hasDraft}
        className="rounded-md border border-[#0d61ac] bg-white px-4 py-1.5 text-xs font-semibold text-[#0d61ac] shadow-sm transition-colors hover:bg-[#0d61ac]/5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {publishing ? "Publicando..." : "Publicar"}
      </button>
    </div>
  );

  return (
    <AdminShell title={`${page.title}`} headerExtra={publishButton}>
      <div className="-mx-2 -mt-2 lg:-mx-4 lg:-mt-4 flex gap-1 pr-12" style={{ minHeight: "calc(100vh - 5.5rem)" }}>
        {/* ── Properties column ──────────────────────────────────── */}
        {openColumns.has("properties") && (
          <div className="flex flex-col border border-gray-200 bg-white rounded-t-lg" style={{ width: colWidth(openColumns.size) }}>
            <ColumnHeader title="Propriedades" onClose={() => toggleColumn("properties")} />
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-5">
                <FormField label="Titulo" name="title" value={editState.title} onChange={handleChange} required />

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-500">Slug</label>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    {slugToPath(page.slug)}
                  </div>
                </div>

                {hasContent ? (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Conteudo</label>
                      <ContentTabs active={contentTab} onSwitch={setContentTab} />
                    </div>
                    {contentTab === "code" ? (
                      <textarea
                        name="content"
                        value={editState.content ?? ""}
                        onChange={handleChange}
                        rows={20}
                        className="w-full resize-y rounded-md border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-xs leading-relaxed text-gray-800 shadow-sm transition-colors focus:border-[#0d61ac] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d61ac]/20"
                        spellCheck={false}
                        placeholder={"<h1>Titulo</h1>\n<p>Conteudo...</p>"}
                      />
                    ) : editState.content ? (
                      <div className="prose prose-sm max-w-none rounded-md border border-gray-200 bg-gray-50 px-6 py-5 text-gray-800" dangerouslySetInnerHTML={{ __html: editState.content }} />
                    ) : (
                      <div className="flex items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 py-16 text-sm text-gray-400">Nenhum conteudo</div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">O conteudo desta pagina e gerenciado por componentes. Use o Preview para visualizar.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Preview column ─────────────────────────────────────── */}
        {openColumns.has("preview") && (
          <div className="flex flex-col border border-gray-200 bg-white rounded-t-lg overflow-hidden" style={{ width: colWidth(openColumns.size) }}>
            <ColumnHeader title="Preview" onClose={() => toggleColumn("preview")} />
            <div className="flex-1 relative bg-gray-100 flex flex-col min-h-0">
              <div className="flex items-center gap-1.5 border-b border-gray-200 bg-gray-50 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span className="ml-2 flex-1 rounded bg-white px-2 py-0.5 text-[11px] text-gray-400 font-mono border border-gray-200">
                  {typeof window !== "undefined" ? window.location.origin : ""}{slugToPath(page.slug)}
                </span>
                <button
                  type="button"
                  onClick={() => { if (iframeRef.current) iframeRef.current.src = previewUrl; }}
                  className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                  title="Recarregar"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                </button>
              </div>
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="flex-1 w-full border-0"
                style={{ minHeight: "500px" }}
                title={`Preview: ${page.title}`}
              />
            </div>
          </div>
        )}

        {/* ── SEO column ─────────────────────────────────────────── */}
        {openColumns.has("seo") && (
          <div className="flex flex-col border border-gray-200 bg-white rounded-t-lg" style={{ width: colWidth(openColumns.size) }}>
            <ColumnHeader title="Page SEO" onClose={() => toggleColumn("seo")} />
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-5">
                {/* Google preview */}
                <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">Google</p>
                  <p className="text-sm font-medium text-[#1a0dab] leading-tight truncate">
                    {editState.metaTitle || editState.title || "Titulo"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-green-700 font-mono truncate">
                    {typeof window !== "undefined" ? window.location.origin : ""}{slugToPath(page.slug)}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500 line-clamp-2">
                    {editState.metaDescription || "Sem descricao"}
                  </p>
                </div>

                <FormField label="Meta Title" name="metaTitle" value={editState.metaTitle ?? ""} onChange={handleChange} placeholder="Titulo no Google" description={`${(editState.metaTitle ?? "").length}/60`} />
                <FormField label="Meta Description" name="metaDescription" type="textarea" value={editState.metaDescription ?? ""} onChange={handleChange} placeholder="Descricao no Google" description={`${(editState.metaDescription ?? "").length}/160`} />

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Open Graph</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>

                <FormField label="OG Title" name="ogTitle" value={editState.ogTitle ?? ""} onChange={handleChange} placeholder="Titulo redes sociais" />
                <FormField label="OG Description" name="ogDescription" type="textarea" value={editState.ogDescription ?? ""} onChange={handleChange} placeholder="Descricao redes sociais" />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">OG Image</label>
                  <ImageUpload
                    value={null}
                    previewUrl={ogImagePreview}
                    onChange={(_id, url) => {
                      setEditState((prev) => {
                        if (!prev) return prev;
                        const next = { ...prev, ogImageUrl: url || "" };
                        if (debounceRef.current) clearTimeout(debounceRef.current);
                        debounceRef.current = setTimeout(() => save(next), 1500);
                        return next;
                      });
                      setOgImagePreview(url);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Changes column ────────────────────────────────────── */}
        {openColumns.has("changes") && (
          <div className="flex flex-col border border-gray-200 bg-white rounded-t-lg" style={{ width: colWidth(openColumns.size) }}>
            <ColumnHeader title={`Alteracoes${draftCount > 0 ? ` (${draftCount})` : ""}`} onClose={() => toggleColumn("changes")} />
            <div className="flex-1 overflow-y-auto p-5">
              {!hasDraft ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="mt-3 text-sm font-medium text-gray-500">Nenhuma alteracao pendente</p>
                  <p className="mt-1 text-xs text-gray-400">Todas as alteracoes foram publicadas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">
                    {draftCount} campo{draftCount !== 1 ? "s" : ""} alterado{draftCount !== 1 ? "s" : ""} desde a ultima publicacao.
                  </p>

                  {getChanges(page).map((change) => (
                    <div key={change.field} className="rounded-lg border border-gray-200 overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0d61ac]" aria-hidden="true">
                          <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84.84-2.872a2 2 0 0 1 .506-.854z" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-700">{change.label}</span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {/* Published (old) */}
                        <div className="px-3 py-2">
                          <span className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-red-500">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Publicado
                          </span>
                          {change.field === "content" ? (
                            <pre className="mt-1 whitespace-pre-wrap break-words rounded bg-red-50 p-2 font-mono text-[11px] leading-relaxed text-red-800 max-h-40 overflow-y-auto">
                              {change.published ? truncate(change.published, 500) : <span className="italic text-gray-400">(vazio)</span>}
                            </pre>
                          ) : (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1.5 text-xs text-red-800 break-words">
                              {change.published || <span className="italic text-gray-400">(vazio)</span>}
                            </p>
                          )}
                        </div>
                        {/* Draft (new) */}
                        <div className="px-3 py-2">
                          <span className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-green-600">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Rascunho
                          </span>
                          {change.field === "content" ? (
                            <pre className="mt-1 whitespace-pre-wrap break-words rounded bg-green-50 p-2 font-mono text-[11px] leading-relaxed text-green-800 max-h-40 overflow-y-auto">
                              {change.draft ? truncate(change.draft, 500) : <span className="italic text-gray-400">(vazio)</span>}
                            </pre>
                          ) : (
                            <p className="mt-1 rounded bg-green-50 px-2 py-1.5 text-xs text-green-800 break-words">
                              {change.draft || <span className="italic text-gray-400">(vazio)</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Publish from changes panel */}
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isBusy}
                    className="mt-2 w-full rounded-md bg-[#0d61ac] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0a4f8c] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {publishing ? "Publicando..." : `Publicar ${draftCount} alterac${draftCount !== 1 ? "oes" : "ao"}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state when all closed */}
        {openColumns.size === 0 && (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-sm">Nenhum painel aberto</p>
              <p className="mt-1 text-xs">Use a barra lateral para abrir paineis</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Right toolbar (fixed to viewport right edge) ─────────── */}
      <div className="fixed right-0 top-14 bottom-0 z-20 flex w-12 flex-col items-center justify-center gap-1 border-l border-gray-200 bg-white">
        {COLUMNS.map((col) => {
          const isActive = openColumns.has(col.key);
          const showBadge = col.key === "changes" && draftCount > 0;
          return (
            <div key={col.key} className="group relative">
              <button
                type="button"
                onClick={() => toggleColumn(col.key)}
                className={[
                  "relative flex h-9 w-9 items-center justify-center rounded-md transition-all duration-150",
                  isActive
                    ? "bg-[#0d61ac]/5 text-[#0d61ac]"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
                ].join(" ")}
                aria-label={col.label}
                aria-pressed={isActive}
              >
                {col.icon}
                {showBadge && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0d61ac] px-0.5 text-[9px] font-bold text-white leading-none">
                    {draftCount}
                  </span>
                )}
              </button>
              <div className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {col.label}
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}

function countChanges(page: Page): number {
  if (!page.draft) return 0;
  const draft = page.draft;
  const keys: (keyof EditState)[] = ["title", "metaTitle", "metaDescription", "ogTitle", "ogDescription", "ogImageUrl", "content"];
  return keys.filter((k) => (draft[k] ?? "") !== (page[k] ?? "")).length;
}
