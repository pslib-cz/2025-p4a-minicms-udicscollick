import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArticleCard } from "@/components/public/article-card";
import { PublicShell } from "@/components/public/public-shell";
import { getHomePageData } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Domů",
  alternates: {
    canonical: absoluteUrl("/"),
  },
};

export default async function Home() {
  const { hero, secondary } = await getHomePageData();

  return (
    <PublicShell>
      <main className="page-stack">
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Cestování po svém</p>
            <h1>Tipy na města, hory i pomalé cesty, které dávají smysl i mimo hlavní sezonu.</h1>
            <p className="hero-copy-text">
              Krátké itineráře, ověřené zastávky a nápady na výlety, které se dají opravdu podniknout. Bez zbytečné
              omáčky, s důrazem na tempo, trasu a praktický detail.
            </p>

            <div className="hero-actions">
              <Link href="/articles" className="button-primary">
                Číst články
              </Link>
              <Link href="/#latest" className="button-secondary">
                Nejnovější tipy
              </Link>
            </div>
          </div>

          {hero ? (
            <article className="hero-feature">
              <Image
                src={hero.coverImageUrl || "/travel-placeholder.svg"}
                alt={hero.title}
                width={1200}
                height={860}
                priority
                className="hero-feature-image"
              />
              <div className="hero-feature-body">
                <p className="eyebrow">Nově na webu</p>
                <h2>
                  <Link href={`/articles/${hero.slug}`}>{hero.title}</Link>
                </h2>
                <p>{hero.excerpt}</p>
                <div className="hero-feature-meta">
                  <span>{formatDate(hero.publishDate)}</span>
                  <span>{hero.author.name}</span>
                  {hero.category ? <span>{hero.category.name}</span> : null}
                </div>
              </div>
            </article>
          ) : null}
        </section>

        <section className="info-strip">
          <div>
            <span>Města na víkend</span>
            <p>Krátké trasy po čtvrtích, kavárnách a místech, která dávají smysl i během dvou dnů.</p>
          </div>
          <div>
            <span>Hory bez chaosu</span>
            <p>Praktické tipy na výšlapy, návrhy tras a logistiku, která nezabere půlku víkendu.</p>
          </div>
          <div>
            <span>Pomalé cesty</span>
            <p>Roadtripy, zastávky po cestě a nápady na volnější tempo bez honby za checklistem.</p>
          </div>
        </section>

        <section id="latest" className="content-strip">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Právě čteme</p>
              <h2>Nejnovější články</h2>
            </div>
            <Link href="/articles" className="text-link">
              Zobrazit vše
            </Link>
          </div>

          <div className="article-grid">
            {secondary.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
