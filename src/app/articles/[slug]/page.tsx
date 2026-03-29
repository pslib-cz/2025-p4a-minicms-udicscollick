import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public/public-shell";
import { getPublishedArticleBySlug } from "@/lib/content";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

type ArticleDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return {
      title: "Článek nenalezen",
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: absoluteUrl(`/articles/${article.slug}`),
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: absoluteUrl(`/articles/${article.slug}`),
      siteName: siteConfig.name,
      type: "article",
      authors: [article.author.name],
      publishedTime: article.publishDate?.toISOString(),
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <PublicShell>
      <main className="page-stack">
        <article className="article-detail">
          <div className="article-detail-header">
            <p className="eyebrow">Detail článku</p>
            <h1>{article.title}</h1>
            <div className="detail-meta">
              <span>{formatDate(article.publishDate)}</span>
              <span>{article.author.name}</span>
              {article.category ? (
                <Link href={`/articles?category=${article.category.id}`} className="text-link">
                  {article.category.name}
                </Link>
              ) : null}
            </div>
          </div>

          <Image
            src={article.coverImageUrl || "/travel-placeholder.svg"}
            alt={article.title}
            width={1400}
            height={760}
            priority
            className="article-detail-cover"
          />

          <div className="article-detail-content">
            <p className="hero-copy-text">{article.excerpt}</p>

            <div className="tag-row" style={{ marginTop: "1rem" }}>
              {article.tags.map(({ tag }) => (
                <Link key={tag.id} href={`/articles?tag=${tag.id}`} className="tag-pill">
                  {tag.name}
                </Link>
              ))}
            </div>

            <div className="article-prose" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />

            <div className="tag-row" style={{ marginTop: "2rem" }}>
              <Link href="/articles" className="button-secondary">
                Zpět na archiv
              </Link>
            </div>
          </div>
        </article>
      </main>
    </PublicShell>
  );
}
