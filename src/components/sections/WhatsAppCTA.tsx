import { db } from "@brasa/core/db";
import { siteSettings } from "@brasa/core/schema";

/**
 * @title CTA WhatsApp
 * @description Banner de contato com farmaceutico via WhatsApp
 * @group Home
 */
export interface Props {
  /** @title Titulo */
  /** @default Fale com um Farmaceutico */
  title?: string;

  /** @title Descricao */
  /** @default Tire suas duvidas sobre manipulados, suplementos e tratamentos personalizados com nossa equipe. */
  description?: string;

  /** @title Texto do botao */
  /** @default Iniciar conversa */
  buttonText?: string;

  /** @title Mensagem padrao do WhatsApp */
  /** @default Ola! Gostaria de saber mais sobre os produtos manipulados. */
  defaultMessage?: string;

  /** @title Estilo */
  /** @options light,dark,brand */
  /** @default brand */
  style?: "light" | "dark" | "brand";
}

const whatsappIcon = (size: number) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function buildWhatsAppUrl(raw: string, message: string): string {
  const digits = raw.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

const styleMap = {
  brand: {
    banner: "bg-[#0d61ac] text-white",
    button: "bg-white text-[#0d61ac] hover:bg-gray-100",
  },
  dark: {
    banner: "bg-gray-900 text-white",
    button: "bg-[#0d61ac] text-white hover:bg-[#0b5499]",
  },
  light: {
    banner: "bg-gray-50 border border-gray-200 text-gray-900",
    button: "bg-[#0d61ac] text-white hover:bg-[#0b5499]",
  },
};

export default async function WhatsAppCTA({
  title = "Fale com um Farmaceutico",
  description = "Tire suas duvidas sobre manipulados, suplementos e tratamentos personalizados com nossa equipe.",
  buttonText = "Iniciar conversa",
  defaultMessage = "Ola! Gostaria de saber mais sobre os produtos manipulados.",
  style = "brand",
}: Props) {
  const settings = await db.select().from(siteSettings).limit(1);
  const whatsapp = settings[0]?.whatsapp ?? null;

  if (!whatsapp) return null;

  const href = buildWhatsAppUrl(whatsapp, defaultMessage);
  const { banner, button } = styleMap[style];

  return (
    <section aria-label="Contato via WhatsApp">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div
          className={`${banner} rounded-xl px-8 py-8 lg:py-10 flex flex-col lg:flex-row items-center justify-between gap-6`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {whatsappIcon(32)}
              <h2 className="text-xl lg:text-2xl font-bold">{title}</h2>
            </div>
            <p className="text-sm opacity-80 mt-2 max-w-lg">{description}</p>
          </div>

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${button} inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-base shadow-sm transition-colors shrink-0`}
          >
            {whatsappIcon(16)}
            {buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}
