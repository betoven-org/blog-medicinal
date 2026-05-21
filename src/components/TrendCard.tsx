import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  slug: string;
  excerpt: string;
  heroImage: {
    url?: string | null;
    alt?: string;
    sizes?: {
      card?: { url?: string | null };
    };
  };
};

export function TrendCard({ title, slug, excerpt, heroImage }: Props) {
  const imageUrl =
    heroImage?.sizes?.card?.url || heroImage?.url || "/placeholder.svg";

  return (
    <article className="group">
      <Link href={`/posts/${slug}`} className="flex gap-4">
        <div className="relative w-2/5 shrink-0 overflow-hidden rounded-xl bg-gray-100" style={{ aspectRatio: "4/3" }}>
          <Image
            src={imageUrl}
            alt={heroImage?.alt || title}
            fill
            sizes="(max-width: 640px) 40vw, 240px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center gap-1">
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900 transition-colors group-hover:text-blue-700">
            {title}
          </h3>
          <p className="line-clamp-3 text-sm text-gray-500">{excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
