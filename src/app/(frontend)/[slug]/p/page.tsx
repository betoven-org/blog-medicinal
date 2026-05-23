import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { Metadata } from "next";
import {
  Leaf,
  Zap,
  ShieldCheck,
  Check,
  HeartPulse,
  Lock,
} from "lucide-react";

import { db } from "@brasa/core/db";
import { products, productCategories, media } from "@brasa/core/schema";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TipTapRenderer, markdownToHtml } from "@/components/TipTapRenderer";
import { ProductGallery } from "@/components/ProductGallery";
import { getSiteSettings } from "@/lib/queries";

// ── Types ───────────────────────────────────────────────────────────────────────

type Benefit = { title: string; subtitle: string };

type GalleryImage = { id: number; url: string; alt: string };

type PageProps = { params: Promise<{ slug: string }> };

// ── Metadata ────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const [product] = await db
    .select({
      name: products.name,
      description: products.description,
      seoTitle: products.seoTitle,
      seoDescription: products.seoDescription,
      imageUrl: media.url,
      imageAlt: media.alt,
    })
    .from(products)
    .leftJoin(media, eq(products.imageId, media.id))
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) return { title: "Produto nao encontrado" };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const title = product.seoTitle || product.name;
  const desc = product.seoDescription || product.description || undefined;

  return {
    title,
    description: desc,
    alternates: { canonical: `${baseUrl}/${slug}/p` },
    openGraph: {
      title,
      description: desc,
      type: "website",
      images: product.imageUrl
        ? [{ url: product.imageUrl, alt: product.imageAlt || product.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}

// ── Page ────────────────────────────────────────────────────────────────────────

export default async function ProductPage({ params }: PageProps) {
  const settings = await getSiteSettings();
  const whatsappNumber = (settings as any)?.whatsapp || "5531999999999";
  const { slug } = await params;

  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      seoTitle: products.seoTitle,
      seoDescription: products.seoDescription,
      content: products.content,
      composition: products.composition,
      usageInstructions: products.usageInstructions,
      whoCanUse: products.whoCanUse,
      benefits: products.benefits,
      differentials: products.differentials,
      galleryImages: products.galleryImages,
      status: products.status,
      brand: products.brand,
      isKit: products.isKit,
      imageUrl: media.url,
      imageAlt: media.alt,
      categoryId: productCategories.id,
      categoryName: productCategories.name,
      categorySlug: productCategories.slug,
    })
    .from(products)
    .leftJoin(
      productCategories,
      eq(products.productCategoryId, productCategories.id)
    )
    .leftJoin(media, eq(products.imageId, media.id))
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product || product.status !== "published") notFound();

  // Gallery images
  let galleryMedia: GalleryImage[] = [];
  const rawGallery = product.galleryImages as number[] | null;
  if (rawGallery && Array.isArray(rawGallery) && rawGallery.length > 0) {
    galleryMedia = await db
      .select({ id: media.id, url: media.url, alt: media.alt })
      .from(media)
      .where(inArray(media.id, rawGallery));
  }

  const benefits = (product.benefits as Benefit[] | null) ?? [];
  const differentials = (product.differentials as string[] | null) ?? [];
  const productContent = product.content as Record<string, any> | null;
  const contentHtml = productContent?._html as string | undefined;

  const benefitIcons = [
    <Leaf key="leaf" className="h-5 w-5 text-primary" aria-hidden="true" />,
    <Zap key="zap" className="h-5 w-5 text-primary" aria-hidden="true" />,
    <ShieldCheck key="shield" className="h-5 w-5 text-primary" aria-hidden="true" />,
  ];

  const defaultBenefits: Benefit[] = [
    { title: "Natural", subtitle: "Formulacao com ingredientes naturais" },
    { title: "Eficaz", subtitle: "Resultados comprovados clinicamente" },
    { title: "Seguro", subtitle: "Fabricado com controle de qualidade" },
  ];

  const displayBenefits = benefits.length > 0 ? benefits.slice(0, 3) : defaultBenefits;

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    ...(product.categoryName && product.categorySlug
      ? [{ label: product.categoryName, href: `/categorias/${product.categorySlug}` }]
      : []),
    { label: product.name },
  ];

  // JSON-LD
  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${slug}/p`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seoDescription || product.description || undefined,
    image: product.imageUrl ?? undefined,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: product.brand || "Medicinal na Web",
    },
    ...(product.categoryName ? { category: product.categoryName } : {}),
    ...(product.composition ? {
      additionalProperty: {
        "@type": "PropertyValue",
        name: "Composicao",
        value: product.composition,
      },
    } : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": productUrl,
    },
    inLanguage: "pt-BR",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* ── Secao principal ─────────────────────────────────────────────────── */}
      <section aria-label="Informacoes do produto">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Galeria */}
          <ProductGallery
            mainImage={product.imageUrl ?? null}
            mainImageAlt={product.imageAlt ?? product.name}
            gallery={galleryMedia}
            productName={product.name}
          />

          {/* Info */}
          <div className="flex flex-col">
            {/* Badge da categoria */}
            {product.categoryName && product.categorySlug && (
              <Link
                href={`/categorias/${product.categorySlug}`}
                className="mb-3 inline-flex w-fit"
              >
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
                  {product.categoryName}
                </span>
              </Link>
            )}

            <h1 className="text-2xl font-bold leading-tight text-gray-900 lg:text-3xl">
              {product.name}
            </h1>

            {product.description && (
              <div
                className="prose prose-sm mt-3 max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(product.description) }}
              />
            )}

            <div className="my-6 border-t border-border" />

            {/* Beneficios */}
            <div className="flex flex-col gap-4 sm:flex-row">
              {displayBenefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex flex-1 items-start gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    {benefitIcons[i]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {benefit.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {benefit.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Ficha tecnica */}
            {(product.categoryName || product.brand || product.isKit || product.composition) && (
              <div className="mt-6 rounded-lg border border-border bg-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Ficha do Produto</h3>
                <dl className="space-y-2.5 text-sm">
                  {product.categoryName && (
                    <div className="flex items-start justify-between gap-2">
                      <dt className="text-muted-foreground">Categoria</dt>
                      <dd className="text-right font-medium text-gray-800">{product.categoryName}</dd>
                    </div>
                  )}
                  {product.brand && (
                    <div className="flex items-start justify-between gap-2">
                      <dt className="text-muted-foreground">Marca</dt>
                      <dd className="text-right font-medium text-gray-800">{product.brand}</dd>
                    </div>
                  )}
                  {product.isKit && (
                    <div className="flex items-start justify-between gap-2">
                      <dt className="text-muted-foreground">Tipo</dt>
                      <dd className="text-right font-medium text-gray-800">Kit</dd>
                    </div>
                  )}
                  {product.composition && (
                    <div className="border-t border-border pt-2.5">
                      <dt className="mb-1 text-muted-foreground">Composicao</dt>
                      <dd className="whitespace-pre-line text-xs leading-relaxed text-gray-700 line-clamp-4">{product.composition}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Fale com o farmaceutico */}
            <div className="mt-4 rounded-xl border border-[#0d61ac]/20 bg-[#0d61ac]/5 p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0d61ac]/10">
                  <HeartPulse className="h-5 w-5 text-[#0d61ac]" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Fale com o farmaceutico</p>
                  <p className="text-xs text-muted-foreground">Tire suas duvidas antes de usar</p>
                </div>
              </div>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Ola! Gostaria de saber mais sobre: ${product.name} (Ref: ${product.id})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0d61ac] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a4f8c]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Falar pelo WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Secao de conteudo ───────────────────────────────────────────────── */}
      {(productContent ||
        differentials.length > 0 ||
        product.composition ||
        product.usageInstructions ||
        product.whoCanUse) && (
        <section
          aria-label="Detalhes do produto"
          className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]"
        >
          {/* Coluna esquerda: conteudo + diferenciais */}
          <div className="min-w-0">
            {(contentHtml || productContent) && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Para que serve?
                </h2>
                <div className="prose prose-gray max-w-none">
                  {contentHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: markdownToHtml(contentHtml) }} />
                  ) : (
                    <TipTapRenderer content={productContent} />
                  )}
                </div>
              </div>
            )}

            {differentials.length > 0 && (
              <div className={productContent ? "mt-10" : undefined}>
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Diferenciais do produto
                </h2>
                <ul className="space-y-3" role="list">
                  {differentials.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check
                          className="h-3 w-3 text-primary"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Coluna direita: cards tecnicos */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            {product.composition && (
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="mb-2 text-sm font-semibold text-gray-900">
                  Composicao
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {product.composition}
                </p>
              </div>
            )}

            {product.usageInstructions && (
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="mb-2 text-sm font-semibold text-gray-900">
                  Sugestao de uso
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {product.usageInstructions}
                </p>
              </div>
            )}

            {product.whoCanUse && (
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="mb-2 text-sm font-semibold text-gray-900">
                  Quem pode usar?
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {product.whoCanUse}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Trust bar ───────────────────────────────────────────────────────── */}
      <section
        aria-label="Por que confiar em nos"
        className="mb-8 mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3"
      >
        {(
          [
            {
              icon: (
                <ShieldCheck
                  className="h-6 w-6 text-muted-foreground"
                  aria-hidden="true"
                />
              ),
              title: "Qualidade garantida",
              subtitle: "Produtos certificados e controlados",
            },
            {
              icon: (
                <HeartPulse
                  className="h-6 w-6 text-muted-foreground"
                  aria-hidden="true"
                />
              ),
              title: "Atendimento especializado",
              subtitle: "Equipe de farmaceuticos disponiveis",
            },
            {
              icon: (
                <Lock
                  className="h-6 w-6 text-muted-foreground"
                  aria-hidden="true"
                />
              ),
              title: "Confianca e seguranca",
              subtitle: "Informacoes verificadas e confiaveis",
            },
          ] as { icon: React.ReactNode; title: string; subtitle: string }[]
        ).map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-4 rounded-lg border border-border bg-card p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
              {item.icon}
            </span>
            <div>
              <p className="font-semibold text-gray-900">{item.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
