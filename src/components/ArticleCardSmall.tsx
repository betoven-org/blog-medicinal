import Link from "next/link";
import { formatDate } from "@/lib/formatDate";

type Props = {
  title: string;
  slug: string;
  author?: { name: string };
  publishedAt?: string | null;
};

export function ArticleCardSmall({ title, slug, author, publishedAt }: Props) {
  return (
    <Link
      href={`/posts/${slug}`}
      className="group block border-b border-gray-100 py-3 last:border-0"
    >
      <h3 className="line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-[#0d61ac]">
        {title}
      </h3>
      <p className="mt-1 truncate text-xs text-gray-500">
        {author && <span>{author.name}</span>}
        {author && publishedAt && <span> · </span>}
        {publishedAt && (
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
        )}
      </p>
    </Link>
  );
}
