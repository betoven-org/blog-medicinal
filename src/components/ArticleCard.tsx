import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "./CategoryBadge";
import { formatDate } from "@/lib/formatDate";

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
  category: { name: string; slug: string };
  author: { name: string };
  publishedAt?: string | null;
};

export function ArticleCard({
  title,
  slug,
  excerpt,
  heroImage,
  category,
  author,
  publishedAt,
}: Props) {
  const imageUrl =
    heroImage?.sizes?.card?.url || heroImage?.url || "/placeholder.svg";

  return (
    <article className="group">
      <Link href={`/posts/${slug}`} className="block">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={imageUrl}
            alt={heroImage?.alt || title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="mt-4">
          <CategoryBadge name={category.name} />
          <h3 className="mt-2 line-clamp-2 text-base font-semibold text-gray-900 transition-colors group-hover:text-[#0d61ac]">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">{excerpt}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <span>{author.name}</span>
            {publishedAt && (
              <>
                <span>·</span>
                <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
