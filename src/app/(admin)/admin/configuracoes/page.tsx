"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/AdminShell";
import FormField from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";
import AssinaturaSection from "@/components/admin/AssinaturaSection";

type MediaRelation = {
  id: number;
  url: string;
} | null;

type Settings = {
  id?: number;
  siteName: string;
  siteDescription: string;
  logoId: number | null;
  faviconId: number | null;
  logo?: MediaRelation;
  favicon?: MediaRelation;
  facebook: string;
  instagram: string;
  youtube: string;
  footerText: string;
  copyrightText: string;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterConsent: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

const EMPTY_SETTINGS: Settings = {
  siteName: "",
  siteDescription: "",
  logoId: null,
  faviconId: null,
  facebook: "",
  instagram: "",
  youtube: "",
  footerText: "",
  copyrightText: "",
  newsletterTitle: "",
  newsletterDescription: "",
  newsletterConsent: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

const TABS = [
  { key: "geral", label: "Geral" },
  { key: "redes", label: "Redes Sociais" },
  { key: "footer", label: "Footer" },
  { key: "newsletter", label: "Newsletter" },
  { key: "seo", label: "SEO" },
  { key: "assinatura", label: "Assinatura" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("geral");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Erro ao carregar configuracoes.");
      const json = await res.json();
      if (json) {
        setSettings({
          ...EMPTY_SETTINGS,
          ...json,
          siteName: json.siteName || "",
          siteDescription: json.siteDescription || "",
          facebook: json.facebook || "",
          instagram: json.instagram || "",
          youtube: json.youtube || "",
          footerText: json.footerText || "",
          copyrightText: json.copyrightText || "",
          newsletterTitle: json.newsletterTitle || "",
          newsletterDescription: json.newsletterDescription || "",
          newsletterConsent: json.newsletterConsent || "",
          seoTitle: json.seoTitle || "",
          seoDescription: json.seoDescription || "",
          seoKeywords: json.seoKeywords || "",
        });
        setLogoPreview(json.logo?.url || null);
        setFaviconPreview(json.favicon?.url || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const { logo, favicon, id, ...payload } = settings;
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao salvar configuracoes.");
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Configuracoes do Site">
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="ml-3 text-sm text-gray-500">Carregando...</span>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Configuracoes do Site">
      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-[#0d61ac] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {/* Tab: Geral */}
        {activeTab === "geral" && (
          <div className="space-y-6">
            <FormField
              label="Nome do Site"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              placeholder="Ex: Medicinal na Web"
            />
            <FormField
              label="Descricao do Site"
              name="siteDescription"
              type="textarea"
              value={settings.siteDescription}
              onChange={handleChange}
              placeholder="Uma breve descricao do seu site..."
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Logo
              </label>
              <ImageUpload
                value={settings.logoId}
                previewUrl={logoPreview}
                onChange={(id, url) => {
                  setSettings((prev) => ({ ...prev, logoId: id }));
                  setLogoPreview(url);
                  setSuccess(false);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Favicon
              </label>
              <ImageUpload
                value={settings.faviconId}
                previewUrl={faviconPreview}
                onChange={(id, url) => {
                  setSettings((prev) => ({ ...prev, faviconId: id }));
                  setFaviconPreview(url);
                  setSuccess(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Tab: Redes Sociais */}
        {activeTab === "redes" && (
          <div className="space-y-6">
            <FormField
              label="Facebook URL"
              name="facebook"
              value={settings.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/sua-pagina"
            />
            <FormField
              label="Instagram URL"
              name="instagram"
              value={settings.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/seu-perfil"
            />
            <FormField
              label="YouTube URL"
              name="youtube"
              value={settings.youtube}
              onChange={handleChange}
              placeholder="https://youtube.com/@seu-canal"
            />
          </div>
        )}

        {/* Tab: Footer */}
        {activeTab === "footer" && (
          <div className="space-y-6">
            <FormField
              label="Texto do Footer"
              name="footerText"
              type="textarea"
              value={settings.footerText}
              onChange={handleChange}
              placeholder="Texto que aparece no rodape do site..."
            />
            <FormField
              label="Texto de Copyright"
              name="copyrightText"
              value={settings.copyrightText}
              onChange={handleChange}
              placeholder="Ex: 2024 Medicinal na Web. Todos os direitos reservados."
            />
          </div>
        )}

        {/* Tab: Newsletter */}
        {activeTab === "newsletter" && (
          <div className="space-y-6">
            <FormField
              label="Titulo"
              name="newsletterTitle"
              value={settings.newsletterTitle}
              onChange={handleChange}
              placeholder="Ex: Receba nossas novidades"
            />
            <FormField
              label="Descricao"
              name="newsletterDescription"
              type="textarea"
              value={settings.newsletterDescription}
              onChange={handleChange}
              placeholder="Texto que aparece acima do formulario de inscricao..."
            />
            <FormField
              label="Texto de Consentimento"
              name="newsletterConsent"
              type="textarea"
              value={settings.newsletterConsent}
              onChange={handleChange}
              placeholder="Ex: Ao se inscrever, voce concorda com nossa politica de privacidade."
            />
          </div>
        )}

        {/* Tab: SEO */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <FormField
              label="Titulo SEO"
              name="seoTitle"
              value={settings.seoTitle}
              onChange={handleChange}
              placeholder="Titulo que aparece nos motores de busca"
            />
            <FormField
              label="Descricao SEO"
              name="seoDescription"
              type="textarea"
              value={settings.seoDescription}
              onChange={handleChange}
              placeholder="Meta description para motores de busca..."
            />
            <FormField
              label="Palavras-chave"
              name="seoKeywords"
              value={settings.seoKeywords}
              onChange={handleChange}
              placeholder="saude, plantas medicinais, suplementos, nutricao"
              description="Separe as palavras-chave por virgula."
            />
          </div>
        )}

        {/* Tab: Assinatura */}
        {activeTab === "assinatura" && <AssinaturaSection />}

        {/* Actions */}
        {activeTab !== "assinatura" && (
        <div className="mt-8 flex items-center gap-4 border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-[#0d61ac] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0a4f8c] focus:outline-none focus:ring-2 focus:ring-[#0d61ac]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M219.31,72,184,36.69A15.86,15.86,0,0,0,172.69,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V83.31A15.86,15.86,0,0,0,219.31,72ZM168,208H88V152h80Zm40,0H184V152a16,16,0,0,0-16-16H88a16,16,0,0,0-16,16v56H48V48H172.69L208,83.31ZM160,72a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h56A8,8,0,0,1,160,72Z" />
              </svg>
            )}
            {saving ? "Salvando..." : "Salvar Configuracoes"}
          </button>

          {success && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
              </svg>
              Configuracoes salvas com sucesso!
            </div>
          )}

          {error && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 256 256"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-8,56a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,104a12,12,0,1,1,12-12A12,12,0,0,1,128,184Z" />
              </svg>
              {error}
            </div>
          )}
        </div>
        )}
      </div>
    </AdminShell>
  );
}
