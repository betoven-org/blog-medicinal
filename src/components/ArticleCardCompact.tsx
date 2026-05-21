import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "./CategoryBadge";

type Props = {
  title: string;
  slug: string;
  heroImage: {
    url?: string | null;
    alt?: string;
    sizes?: {
      card?: { url?: string | null };
    };
  };
  category: { name: string; slug: string };
};

export function ArticleCardCompact({ title, slug, heroImage, category }: Props) {
  const imageUrl =
    heroImage?.sizes?.card?.url || heroImage?.url || "/placeholder.svg";

  return (
    <article className="group">
      <Link href={`/posts/${slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={imageUrl}
            alt={heroImage?.alt || title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="mt-3">
          <CategoryBadge name={category.name} />
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-700">
            {title}
          </h3>
        </div>
      </Link>
    </article>
  );
}
