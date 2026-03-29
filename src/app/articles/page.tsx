import type { Metadata } from "next";
import { ArticleCard } from "@/components/public/article-card";
import { ArticleFilters } from "@/components/public/article-filters";
import { Pagination } from "@/components/public/pagination";
import { PublicShell } from "@/components/public/public-shell";
import { getPublicArticles, getPublicTaxonomy } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";
import { ensureArray, parsePageParam } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Články",
  description: "Archiv cestovatelských tipů, víkendových itinerářů a nápadů na města, hory i pomalé cesty.",
  alternates: {
    canonical: absoluteUrl("/articles"),
  },
};

type ArticlesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = ensureArray(resolvedSearchParams.q)[0]?.trim() ?? "";
  const categoryId = ensureArray(resolvedSearchParams.category)[0];
  const tagId = ensureArray(resolvedSearchParams.tag)[0];
  const page = parsePageParam(ensureArray(resolvedSearchParams.page)[0], 1);

  const [articles, taxonomy] = await Promise.all([
    getPublicArticles({
      page,
      query,
      categoryId,
      tagId,
    }),
    getPublicTaxonomy(),
  ]);

  return (
    <PublicShell>
      <main className="page-stack">
        <div className="article-list-header">
          <div>
            <p className="eyebrow">Archiv</p>
            <h1>Cestovatelské tipy a itineráře</h1>
            <p className="hero-copy-text">
              Vyberte si město, hory nebo klidnější roadtrip a najděte trasu, která sedne délce cesty i tempu výletu.
            </p>
          </div>
        </div>

        <section className="filter-panel">
          <ArticleFilters
            query={query}
            categoryId={categoryId}
            tagId={tagId}
            categories={taxonomy.categories}
            tags={taxonomy.tags}
          />
        </section>

        {articles.items.length === 0 ? (
          <section className="empty-state">
            <h2>Žádné výsledky</h2>
            <p>Pro zadanou kombinaci vyhledávání a filtrů jsme nenašli žádný publikovaný článek.</p>
          </section>
        ) : (
          <section className="article-grid">
            {articles.items.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </section>
        )}

        <Pagination
          currentPage={page}
          totalPages={articles.totalPages}
          basePath="/articles"
          query={{
            q: query || undefined,
            category: categoryId,
            tag: tagId,
          }}
        />
      </main>
    </PublicShell>
  );
}
