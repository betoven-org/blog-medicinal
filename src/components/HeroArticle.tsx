import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "./CategoryBadge";
import { formatDate } from "@/lib/formatDate";

type Props = {
  title: string;
  slug: string;
  coverUrl?: string | null;
  heroImage: {
    url?: string | null;
    alt?: string;
    sizes?: {
      hero?: { url?: string | null };
    };
  };
  category: { name: string; slug: string };
  author: { name: string };
  publishedAt?: string | null;
};

export function HeroArticle({
  title,
  slug,
  coverUrl,
  heroImage,
  category,
  author,
  publishedAt,
}: Props) {
  const imageUrl =
    coverUrl || heroImage?.sizes?.hero?.url || heroImage?.url || "/placeholder.svg";

  return (
    <Link href={`/posts/${slug}`} className="group block">
      <article className="relative h-[28rem] w-full overflow-hidden rounded-2xl bg-gray-900 md:h-[32rem]">
        <Image
          src={imageUrl}
          alt={heroImage?.alt || title}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <CategoryBadge name={category.name} />
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-white md:text-5xl">
            {title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-gray-300">
            <span>{author.name}</span>
            {publishedAt && (
              <>
                <span>·</span>
                <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
