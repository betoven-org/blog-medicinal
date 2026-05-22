"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/AdminShell";
import FormField from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";
import AssinaturaSection from "@/components/admin/AssinaturaSection";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

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
  privacyPolicy: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  robotsDisallow: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  supabaseSyncEnabled: boolean;
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
  privacyPolicy: "",
  robotsIndex: true,
  robotsFollow: true,
  robotsDisallow: "/admin,/api",
  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseServiceRoleKey: "",
  supabaseSyncEnabled: false,
};

const TABS = [
  { key: "geral", label: "Geral" },
  { key: "redes", label: "Redes Sociais" },
  { key: "footer", label: "Footer" },
  { key: "newsletter", label: "Newsletter" },
  { key: "seo", label: "SEO" },
  { key: "paginas", label: "Paginas" },
  { key: "supabase", label: "Supabase" },
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
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncLabel, setSyncLabel] = useState("");
  const [syncResult, setSyncResult] = useState<Record<string, unknown> | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

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
          privacyPolicy: json.privacyPolicy || "",
          robotsIndex: json.robotsIndex ?? true,
          robotsFollow: json.robotsFollow ?? true,
          robotsDisallow: json.robotsDisallow || "/admin,/api",
          supabaseUrl: json.supabaseUrl || "",
          supabaseAnonKey: json.supabaseAnonKey || "",
          supabaseServiceRoleKey: json.supabaseServiceRoleKey || "",
          supabaseSyncEnabled: json.supabaseSyncEnabled ?? false,
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
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setSettings((prev) => ({ ...prev, [name]: newValue }));
    setSuccess(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    setSyncProgress(0);
    setSyncLabel("Iniciando...");
    try {
      const res = await fetch("/api/admin/supabase-sync", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro na sincronizacao.");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream nao disponivel");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const match = line.match(/^data: (.+)$/m);
          if (!match) continue;
          try {
            const event = JSON.parse(match[1]);
            if (event.progress >= 0) setSyncProgress(event.progress);
            if (event.label) setSyncLabel(event.label);
            if (event.step === "done") {
              setSyncResult(event.result);
              setLastSyncAt(new Date().toLocaleString("pt-BR"));
            }
            if (event.step === "error") {
              setSyncError(event.label);
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setSyncing(false);
    }
  };

  const [clearSuccess, setClearSuccess] = useState(false);

  const handleClearContent = async () => {
    setClearing(true);
    setSyncError(null);
    setSyncResult(null);
    setClearSuccess(false);
    try {
      const res = await fetch("/api/admin/supabase-sync", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao limpar dados.");
      setSyncResult(null);
      setLastSyncAt(null);
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 5000);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setClearing(false);
    }
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

            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Robots (Indexacao)</h3>
              <div className="space-y-4">
                <FormField
                  label="Permitir indexacao (index)"
                  name="robotsIndex"
                  type="checkbox"
                  value={settings.robotsIndex}
                  onChange={handleChange}
                  description="Quando desativado, o site inteiro sera bloqueado dos motores de busca."
                />
                <FormField
                  label="Permitir seguir links (follow)"
                  name="robotsFollow"
                  type="checkbox"
                  value={settings.robotsFollow}
                  onChange={handleChange}
                  description="Quando desativado, bots nao seguirao links nas paginas."
                />
                <FormField
                  label="Caminhos bloqueados (disallow)"
                  name="robotsDisallow"
                  value={settings.robotsDisallow}
                  onChange={handleChange}
                  placeholder="/admin,/api"
                  description="Caminhos separados por virgula que devem ser bloqueados no robots.txt"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Paginas */}
        {activeTab === "paginas" && (
          <div className="space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Politica de Privacidade
              </label>
              <p className="mb-3 text-xs text-gray-500">
                Cole o conteudo HTML da sua politica de privacidade. Ele sera exibido na pagina /politica-de-privacidade.
              </p>
              <textarea
                name="privacyPolicy"
                value={settings.privacyPolicy}
                onChange={handleChange}
                rows={20}
                placeholder="<h2>Politica de Privacidade</h2><p>Seu conteudo aqui...</p>"
                className="w-full rounded-md border bg-card px-3 py-2 font-mono text-xs shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              {settings.privacyPolicy && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-[#0d61ac] hover:underline">
                    Preview do conteudo
                  </summary>
                  <div
                    className="prose prose-sm mt-2 max-w-none rounded-md border bg-white p-4"
                    dangerouslySetInnerHTML={{ __html: settings.privacyPolicy }}
                  />
                </details>
              )}
            </div>
          </div>
        )}

        {/* Tab: Supabase */}
        {activeTab === "supabase" && (
          <div className="space-y-6">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                Configure a conexao com o Supabase do cliente para sincronizar conteudo
                (posts, autores e categorias). O Supabase e a fonte de verdade para conteudo
                -- nosso banco armazena uma copia sincronizada.
              </p>
            </div>

            <FormField
              label="URL do Supabase"
              name="supabaseUrl"
              value={settings.supabaseUrl}
              onChange={handleChange}
              placeholder="https://xyzcompany.supabase.co"
            />
            <FormField
              label="Anon Key"
              name="supabaseAnonKey"
              type="password"
              value={settings.supabaseAnonKey}
              onChange={handleChange}
              placeholder="eyJhbGciOi..."
            />
            <FormField
              label="Service Role Key"
              name="supabaseServiceRoleKey"
              type="password"
              value={settings.supabaseServiceRoleKey}
              onChange={handleChange}
              placeholder="eyJhbGciOi..."
              description="Necessario para sincronizacao completa"
            />
            <FormField
              label="Sincronizacao ativa"
              name="supabaseSyncEnabled"
              type="checkbox"
              value={settings.supabaseSyncEnabled}
              onChange={handleChange}
              description="Quando ativo, webhooks do Supabase serao processados automaticamente."
            />

            {/* Sync actions */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Acoes de Sincronizacao
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={syncing || !settings.supabaseUrl || !settings.supabaseServiceRoleKey}
                  className="inline-flex items-center gap-2 rounded-md bg-[#0d61ac] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0a4f8c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {syncing ? (
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
                      <path d="M197.67,186.37a8,8,0,0,1,0,11.29C196.58,198.73,170.82,224,128,224c-37.39,0-64.53-22.4-80-39.85V208a8,8,0,0,1-16,0V160a8,8,0,0,1,8-8H88a8,8,0,0,1,0,16H55.44C67.76,183.35,93,208,128,208c36,0,58.14-21.46,58.36-21.68A8,8,0,0,1,197.67,186.37ZM216,40a8,8,0,0,0-8,8V71.85C192.53,54.4,165.39,32,128,32,85.18,32,59.42,57.27,58.34,58.34a8,8,0,0,0,11.3,11.34C69.86,69.46,92,48,128,48c35,0,60.24,24.65,72.56,40H168a8,8,0,0,0,0,16h48a8,8,0,0,0,8-8V48A8,8,0,0,0,216,40Z" />
                    </svg>
                  )}
                  {syncing ? "Sincronizando..." : "Sincronizar agora"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={clearing}
                  className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {clearing ? (
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
                      <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                    </svg>
                  )}
                  {clearing ? "Limpando..." : "Limpar dados de conteudo"}
                </button>
              </div>

              {/* Sync progress */}
              {syncing && (
                <div className="mt-4 rounded-md border border-[#0d61ac]/20 bg-[#0d61ac]/5 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{syncLabel}</span>
                    <span className="text-xs font-semibold text-[#0d61ac]">{syncProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-[#0d61ac] transition-all duration-300"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Sync result */}
              {syncResult && !syncing && (
                <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                      <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                    </svg>
                    Sincronizacao concluida
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-green-700 sm:grid-cols-4">
                    {Object.entries(syncResult).map(([key, val]) => (
                      <div key={key} className="rounded-md bg-white/60 px-3 py-2">
                        <p className="text-xs text-green-600 capitalize">{key}</p>
                        <p className="font-semibold">
                          {typeof val === "object" && val !== null
                            ? `${(val as any).created || 0} novos, ${(val as any).updated || 0} atualizados`
                            : String(val)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sync error */}
              {syncError && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-800">
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
                    {syncError}
                  </div>
                </div>
              )}

              {/* Last sync */}
              {clearSuccess && (
                <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                      <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                    </svg>
                    Todos os dados de conteudo foram limpos com sucesso.
                  </div>
                </div>
              )}

              {lastSyncAt && (
                <p className="mt-3 text-xs text-gray-500">
                  Ultima sincronizacao: {lastSyncAt}
                </p>
              )}
            </div>

            <DeleteConfirm
              open={showClearConfirm}
              onClose={() => setShowClearConfirm(false)}
              onConfirm={handleClearContent}
              title="Limpar dados de conteudo?"
              description="Isso ira apagar todos os posts, autores e categorias do banco. Os dados serao re-sincronizados do Supabase na proxima sincronizacao."
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
