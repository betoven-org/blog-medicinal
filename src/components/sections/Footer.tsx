import Link from "next/link";
import Image from "next/image";
import { getSiteSettings } from "@/lib/queries";
import { NewsletterForm } from "@/components/NewsletterForm";

/**
 * @title Footer
 * @description Rodape global com newsletter, redes sociais e copyright
 * @group Global
 */
export interface Props {
  /** @title Mostrar newsletter */
  /** @default true */
  showNewsletter?: boolean;

  /** @title Mostrar redes sociais */
  /** @default true */
  showSocial?: boolean;

  /** @title Mostrar politica de privacidade */
  /** @default true */
  showPrivacy?: boolean;
}

export default async function Footer({
  showNewsletter = true,
  showSocial = true,
  showPrivacy = true,
}: Props) {
  const settings = await getSiteSettings();
  if (!settings) return null;
  const s = settings as any;

  const logoUrl =
    typeof settings.logo === "object" && settings.logo?.url
      ? settings.logo.url
      : "/logo.svg";

  const socials = [
    { name: "Facebook", url: s.facebook, icon: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
    { name: "Instagram", url: s.instagram, icon: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" },
    { name: "YouTube", url: s.youtube, icon: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" },
  ].filter((s) => s.url);

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Logo + footer text */}
          <div>
            <Link href="/">
              <Image
                src={logoUrl}
                alt={s.siteName || "Logo"}
                width={140}
                height={28}
              />
            </Link>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-gray-600">
              {s.footerText || ""}
            </p>

            {/* Social */}
            {showSocial && socials.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300 hover:text-gray-900"
                    aria-label={social.name}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Newsletter */}
          {showNewsletter && (
            <div>
              <h3 className="mb-1 text-sm font-bold text-gray-900">
                {s.newsletterTitle || "Newsletter"}
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                {s.newsletterDescription ||
                  "Receba os melhores conteudos diretamente no seu e-mail."}
              </p>
              <NewsletterForm />
              <p className="mt-3 text-xs text-gray-500">
                {s.newsletterConsent ||
                  "Ao se inscrever, voce concorda em receber comunicacoes."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()}{" "}
            {s.copyrightText || s.siteName || ""}
          </p>
          {showPrivacy && (
            <Link
              href="/politica-de-privacidade"
              className="text-xs text-gray-500 transition-colors hover:text-gray-700"
            >
              Politica de Privacidade
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
