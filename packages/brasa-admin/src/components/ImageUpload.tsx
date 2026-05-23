"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import Spinner from "./Spinner";

type Props = {
  value: number | null;
  onChange: (mediaId: number | null, mediaUrl: string | null) => void;
  previewUrl?: string | null;
};

export default function ImageUpload({ value, onChange, previewUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao fazer upload");
      }

      const record = await res.json();
      setPreview(record.url);
      onChange(record.id, record.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (value && preview) {
    return (
      <div className="space-y-2">
        <div className="relative overflow-hidden rounded-lg border">
          <img
            src={preview}
            alt="Preview da imagem"
            className="h-48 w-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-white shadow-sm transition-colors hover:bg-destructive/90"
          >
            Remover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
          uploading
            ? "border-primary bg-primary/5"
            : "border-input hover:border-primary hover:bg-muted/50"
        }`}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        {uploading ? (
          <>
            <Spinner className="mb-2 size-8" />
            <p className="text-sm font-medium text-primary">Enviando...</p>
          </>
        ) : (
          <>
            <Upload className="mb-2 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">Clique para enviar</span>{" "}
              ou arraste uma imagem
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">PNG, JPG, WebP</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
