import Link from "next/link";
import Image from "next/image";
import { NewsletterForm } from "./NewsletterForm";
import { getSiteSettings } from "@/lib/queries";

export async function Footer() {
  const settings = await getSiteSettings();
  if (!settings) return null;
  const s = settings as any;
  const logoUrl =
    typeof settings.logo === "object" && settings.logo?.url
      ? settings.logo.url
      : "/logo.svg";

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <Link href="/">
              <Image
                src={logoUrl}
                alt={s.siteName || "Medicinal"}
                width={140}
                height={28}
              />
            </Link>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-gray-600">
              {s.footerText ||
                "Medicinal © 2026. Todos os direitos reservados."}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-bold text-gray-900">
              {s.newsletterTitle || "Newsletter"}
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              {s.newsletterDescription ||
                "Receba os melhores conteúdos diretamente no seu e-mail."}
            </p>
            <NewsletterForm />
            <p className="mt-3 text-xs text-gray-500">
              {s.newsletterConsent ||
                "Ao se inscrever, você concorda em receber comunicações."}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()}{" "}
            {s.copyrightText ||
              "Medicinal na Web. Todos os direitos reservados."}
          </p>
        </div>
      </div>
    </footer>
  );
}
