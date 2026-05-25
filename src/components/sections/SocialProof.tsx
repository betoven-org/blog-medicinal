/**
 * @title Prova Social
 * @description Badges de prova social com avaliações de plataformas externas
 * @group Marketing
 */

export interface SocialProofItem {
  /** @title Plataforma */
  /** @options google,facebook,instagram,trustpilot */
  platform: "google" | "facebook" | "instagram" | "trustpilot";
  /** @title Nota */
  rating: number;
  /** @title Total de avaliacoes */
  totalReviews: string;
  /** @title URL da pagina */
  /** @format url */
  url?: string;
}

export interface Props {
  /** @title Titulo */
  title?: string;
  /** @title Itens */
  items: SocialProofItem[];
  /** @title Estilo */
  /** @options compact,detailed */
  /** @default compact */
  style?: "compact" | "detailed";
}

function Stars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex text-yellow-400" aria-label={`${rating} de 5 estrelas`}>
      {"★".repeat(fullStars)}
      {hasHalf && "½"}
      {"☆".repeat(emptyStars)}
    </span>
  );
}

const platformLabels: Record<string, string> = {
  google: "Google",
  facebook: "Facebook",
  instagram: "Instagram",
  trustpilot: "Trustpilot",
};

export default function SocialProof({ title, items, style = "compact" }: Props) {
  const Wrapper = ({ children, url }: { children: React.ReactNode; url?: string }) =>
    url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
        {children}
      </a>
    ) : (
      <>{children}</>
    );

  return (
    <section className="w-full">
      {title && <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>}

      <div className={`flex flex-wrap justify-center ${style === "compact" ? "gap-4" : "gap-6"}`}>
        {items.map((item, i) => (
          <Wrapper key={i} url={item.url}>
            <div
              className={`flex items-center gap-3 ${
                style === "detailed"
                  ? "flex-col p-6 bg-white border border-gray-100 rounded-xl shadow-sm min-w-[180px]"
                  : "px-4 py-2 bg-gray-50 rounded-lg"
              }`}
            >
              <span className="font-semibold text-sm text-gray-700">
                {platformLabels[item.platform]}
              </span>
              <Stars rating={item.rating} />
              <span className="text-xs text-gray-500">
                {style === "detailed"
                  ? `${item.rating}/5 — ${item.totalReviews} avaliações`
                  : `${item.rating} (${item.totalReviews})`}
              </span>
            </div>
          </Wrapper>
        ))}
      </div>
    </section>
  );
}
