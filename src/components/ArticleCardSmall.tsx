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
      <h3 className="line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-blue-700">
        {title}
      </h3>
      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
        {author && <span>{author.name}</span>}
        {author && publishedAt && <span>·</span>}
        {publishedAt && (
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
        )}
      </div>
    </Link>
  );
}
