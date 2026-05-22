import Link from "next/link";
import Image from "next/image";
import { getSiteSettings } from "@/lib/queries";
import { db } from "@/db";
import { productCategories } from "@/db/schema";
import { asc, sql } from "drizzle-orm";
import { CategoryMenu } from "./CategoryMenu";
import { MobileMenu } from "./MobileMenu";
import { SearchBar } from "./SearchBar";

function IconLock({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconWhatsApp({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.552 4.103 1.516 5.83L.057 23.117a.75.75 0 0 0 .92.92l5.356-1.447A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.718 9.718 0 0 1-4.964-1.36l-.356-.212-3.69.997.983-3.598-.232-.37A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  );
}

function IconFacebook({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconInstagram({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function IconYoutube({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

function ensureAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export async function Header() {
  const [settings, categoriesWithProducts] = await Promise.all([
    getSiteSettings(),
    db
      .select({
        id: productCategories.id,
        name: productCategories.name,
        slug: productCategories.slug,
      })
      .from(productCategories)
      .where(
        sql`${productCategories.parentId} IS NULL AND EXISTS (SELECT 1 FROM products WHERE products.product_category_id = ${productCategories.id} AND products.product_status = 'published')`
      )
      .orderBy(asc(productCategories.sortOrder), asc(productCategories.name)),
  ]);

  const s = settings as any;
  const logoUrl = s?.logo?.url ?? "/logo.svg";
  const siteName = s?.siteName ?? "Medicinal na Web";
  const whatsappNumber = s?.whatsapp || "5531999999999";
  const socials = {
    facebook: s?.facebook ? ensureAbsoluteUrl(s.facebook) : null,
    instagram: s?.instagram ? ensureAbsoluteUrl(s.instagram) : null,
    youtube: s?.youtube ? ensureAbsoluteUrl(s.youtube) : null,
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Linha 1: Logo + Busca + Sociais */}
      <div className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image src={logoUrl} alt={siteName} width={160} height={32} priority />
          </Link>

          {/* Busca global — oculta em mobile */}
          <div className="hidden min-w-0 flex-1 md:flex">
            <SearchBar />
          </div>

          {/* Botoes de acao — ocultos em mobile */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-md border border-[#0d61ac] px-3 py-1.5 text-sm font-medium text-[#0d61ac] transition-colors hover:bg-[#0d61ac]/5"
            >
              <IconLock size={14} />
              Area Restrita
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md bg-[#0d61ac] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#0a4f90]"
            >
              <IconWhatsApp size={14} />
              Fale Conosco
            </a>
          </div>

          {/* Sociais — ocultos em mobile e tablet */}
          <div className="hidden items-center gap-1 lg:flex">
            {socials.facebook && (
              <a
                href={socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
              >
                <IconFacebook size={20} />
              </a>
            )}
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
              >
                <IconInstagram size={20} />
              </a>
            )}
            {socials.youtube && (
              <a
                href={socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
              >
                <IconYoutube size={20} />
              </a>
            )}
          </div>

          {/* Hamburger — visivel so em mobile */}
          <div className="ml-auto md:hidden">
            <MobileMenu
              categories={categoriesWithProducts}
              socials={socials}
            />
          </div>
        </div>
      </div>

      {/* Linha 2: Menu de categorias — oculto em mobile */}
      <div className="hidden border-b md:block">
        <div className="mx-auto max-w-7xl px-4">
          <CategoryMenu categories={categoriesWithProducts} />
        </div>
      </div>
    </header>
  );
}
