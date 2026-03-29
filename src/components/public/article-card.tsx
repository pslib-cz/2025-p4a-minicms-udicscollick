import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type ArticleCardProps = {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    coverImageUrl: string | null;
    publishDate: Date | string | null;
    author: {
      name: string;
    };
    category: {
      id: string;
      name: string;
    } | null;
    tags: Array<{
      tag: {
        id: string;
        name: string;
      };
    }>;
  };
};

export function ArticleCard({ article }: ArticleCardProps) {
  const imageSrc = article.coverImageUrl || "/travel-placeholder.svg";

  return (
    <article className="article-card">
      <Link href={`/articles/${article.slug}`} className="article-card-image-link">
        <Image
          src={imageSrc}
          alt={article.title}
          width={960}
          height={640}
          className="article-card-image"
        />
      </Link>

      <div className="article-card-body">
        <div className="article-card-meta">
          <span>{formatDate(article.publishDate)}</span>
          <span>{article.author.name}</span>
          {article.category ? <span>{article.category.name}</span> : null}
        </div>

        <h3 className="article-card-title">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>

        <p className="article-card-excerpt">{article.excerpt}</p>

        <div className="article-card-footer">
          <div className="tag-row">
            {article.tags.slice(0, 3).map(({ tag }) => (
              <Link key={tag.id} href={`/articles?tag=${tag.id}`} className="tag-pill">
                {tag.name}
              </Link>
            ))}
          </div>

          <Link href={`/articles/${article.slug}`} className="text-link">
            Číst detail
          </Link>
        </div>
      </div>
    </article>
  );
}
