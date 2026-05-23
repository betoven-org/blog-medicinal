"use client";

import { useState, useMemo } from "react";
import type { BrasaManifest, SectionBlock, SectionSchema } from "@brasa/core/manifest";
import SectionEditor from "./SectionEditor";

// ── Types ─────────────────────────────────────────────────────────────────────

type PageBuilderProps = {
  manifest: BrasaManifest;
  value: SectionBlock[];
  onChange: (blocks: SectionBlock[]) => void;
};

// ── SVG icons ─────────────────────────────────────────────────────────────────

function IconChevronUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconGrip() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// ── Section picker modal ──────────────────────────────────────────────────────

type SectionPickerProps = {
  sections: SectionSchema[];
  onSelect: (schema: SectionSchema) => void;
  onClose: () => void;
};

function SectionPicker({ sections, onSelect, onClose }: SectionPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return sections;
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.group?.toLowerCase().includes(q)
    );
  }, [sections, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, SectionSchema[]>();
    for (const section of filtered) {
      const group = section.group ?? "Outros";
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(section);
    }
    return map;
  }, [filtered]);

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Adicionar secao"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">Adicionar secao</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <IconX />
          </button>
        </div>

        {/* search */}
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-gray-400">
              <IconSearch />
            </span>
            <input
              type="search"
              autoFocus
              placeholder="Buscar secoes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:border-[#0d61ac] focus:outline-none focus:ring-1 focus:ring-[#0d61ac]"
            />
          </div>
        </div>

        {/* list */}
        <div className="max-h-[420px] overflow-y-auto px-2 py-2">
          {grouped.size === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Nenhuma secao encontrada.
            </p>
          ) : (
            Array.from(grouped.entries()).map(([group, items]) => (
              <div key={group} className="mb-1">
                <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {group}
                </p>
                {items.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => onSelect(section)}
                    className="flex w-full flex-col rounded-md px-3 py-2.5 text-left hover:bg-[#0d61ac]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d61ac]"
                  >
                    <span className="text-sm font-medium text-gray-800">
                      {section.title}
                    </span>
                    {section.description && (
                      <span className="mt-0.5 text-xs text-gray-400">
                        {section.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Block list item ───────────────────────────────────────────────────────────

type BlockItemProps = {
  block: SectionBlock;
  title: string;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
};

function BlockItem({
  block,
  title,
  isFirst,
  isLast,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}: BlockItemProps) {
  return (
    <div
      className={`group flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors ${
        isSelected
          ? "border-[#0d61ac] bg-[#0d61ac]/5"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* grip */}
      <span className="flex-shrink-0 text-gray-300">
        <IconGrip />
      </span>

      {/* title */}
      <span
        className={`min-w-0 flex-1 truncate text-sm font-medium ${
          isSelected ? "text-[#0d61ac]" : "text-gray-700"
        }`}
      >
        {title}
      </span>

      {/* actions — always visible on selected, on hover otherwise */}
      <div
        className={`flex flex-shrink-0 items-center gap-0.5 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label={`Mover ${title} para cima`}
          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <IconChevronUp />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label={`Mover ${title} para baixo`}
          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <IconChevronDown />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Remover ${title}`}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

// ── PageBuilder ───────────────────────────────────────────────────────────────

export default function PageBuilder({ manifest, value, onChange }: PageBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    value[0]?.id ?? null
  );
  const [showPicker, setShowPicker] = useState(false);

  // Build a lookup map from section key -> SectionSchema
  const schemaMap = useMemo(() => {
    const map = new Map<string, SectionSchema>();
    for (const s of manifest.sections) map.set(s.key, s);
    return map;
  }, [manifest.sections]);

  const selectedBlock = value.find((b) => b.id === selectedId) ?? null;
  const selectedSchema = selectedBlock ? schemaMap.get(selectedBlock.component) : null;

  // ── Mutations ──────────────────────────────────────────────────────────────

  const moveBlock = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const deleteBlock = (id: string) => {
    const next = value.filter((b) => b.id !== id);
    onChange(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id ?? null);
    }
  };

  const addBlock = (schema: SectionSchema) => {
    const newBlock: SectionBlock = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Math.random()),
      component: schema.key,
      props: Object.fromEntries(
        Object.entries(schema.props).map(([k, f]) => [k, f.default ?? undefined])
      ),
    };
    const next = [...value, newBlock];
    onChange(next);
    setSelectedId(newBlock.id);
    setShowPicker(false);
  };

  const updateProps = (props: Record<string, unknown>) => {
    if (!selectedBlock) return;
    onChange(
      value.map((b) => (b.id === selectedBlock.id ? { ...b, props } : b))
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[300px_1fr]">
        {/* ── Left panel: block list ─────────────────────────────────────── */}
        <aside className="flex flex-col border-r border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Secoes
            </h2>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
              {value.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {value.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">
                Nenhuma secao adicionada.
              </p>
            ) : (
              <ul className="space-y-1.5 p-3" role="list">
                {value.map((block, index) => {
                  const schema = schemaMap.get(block.component);
                  return (
                    <li key={block.id}>
                      <BlockItem
                        block={block}
                        title={schema?.title ?? block.component}
                        isFirst={index === 0}
                        isLast={index === value.length - 1}
                        isSelected={selectedId === block.id}
                        onSelect={() => setSelectedId(block.id)}
                        onMoveUp={() => moveBlock(index, "up")}
                        onMoveDown={() => moveBlock(index, "down")}
                        onDelete={() => deleteBlock(block.id)}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Add section button */}
          <div className="border-t border-gray-200 p-3">
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-gray-400 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac]"
            >
              <IconPlus />
              Adicionar secao
            </button>
          </div>
        </aside>

        {/* ── Right panel: section editor ───────────────────────────────── */}
        <main className="flex flex-col overflow-y-auto">
          {selectedBlock && selectedSchema ? (
            <div className="flex flex-col gap-0">
              {/* Editor header */}
              <div className="border-b border-gray-200 bg-white px-6 py-4">
                <h2 className="text-sm font-semibold text-gray-800">
                  {selectedSchema.title}
                </h2>
                {selectedSchema.description && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {selectedSchema.description}
                  </p>
                )}
              </div>

              {/* Editor form */}
              <div className="px-6 py-5">
                <SectionEditor
                  schema={selectedSchema.props}
                  values={selectedBlock.props}
                  onChange={updateProps}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-gray-400">
                {value.length === 0
                  ? "Adicione uma secao para comecar."
                  : "Selecione uma secao para editar."}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Section picker modal */}
      {showPicker && (
        <SectionPicker
          sections={manifest.sections}
          onSelect={addBlock}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
