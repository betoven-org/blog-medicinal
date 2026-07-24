/**
 * @title Video
 * @description Embed responsivo de video do YouTube ou Vimeo
 * @group Conteudo
 */

export interface Props {
  // --- Conteudo ---

  /** @title Titulo */
  title?: string;
  /** @title Descricao */
  /** @format textarea */
  description?: string;

  // --- Video ---

  /** @title URL do video */
  /** @format url */
  videoUrl: string;
  /** @title Proporcao */
  /** @options 16:9,4:3,1:1 */
  /** @default 16:9 */
  aspectRatio?: "16:9" | "4:3" | "1:1";
}

function getEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return url;
}

export default function VideoEmbed({
  title,
  description,
  videoUrl,
  aspectRatio = "16:9",
}: Props) {
  const embedUrl = getEmbedUrl(videoUrl);

  const aspectClasses: Record<string, string> = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
  };

  return (
    <section className="w-full py-12 md:py-16 bg-white">
      <div className="mx-auto max-w-4xl px-4">
        {title && (
          <h2 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
            {title}
          </h2>
        )}

        {description && (
          <p className="mb-6 text-gray-600">{description}</p>
        )}

        <div className={`relative w-full overflow-hidden rounded-lg ${aspectClasses[aspectRatio]}`}>
          <iframe
            src={embedUrl}
            title={title || "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}
