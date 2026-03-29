import { unstable_cache } from "next/cache";
import { ArticleStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export const PUBLIC_PAGE_SIZE = 6;
export const DASHBOARD_PAGE_SIZE = 8;

type PublicArticleFilters = {
  page: number;
  query?: string;
  categoryId?: string;
  tagId?: string;
};

const getCachedPublicArticles = unstable_cache(
  async ({ page, query, categoryId, tagId }: PublicArticleFilters) => {
    const where = {
      status: ArticleStatus.PUBLISHED,
      publishDate: {
        lte: new Date(),
      },
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { excerpt: { contains: query } },
              { contentHtml: { contains: query } },
            ],
          }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(tagId
        ? {
            tags: {
              some: {
                tagId,
              },
            },
          }
        : {}),
    };

    const [items, totalItems] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          publishDate: "desc",
        },
        skip: (page - 1) * PUBLIC_PAGE_SIZE,
        take: PUBLIC_PAGE_SIZE,
      }),
      prisma.article.count({ where }),
    ]);

    return {
      items,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / PUBLIC_PAGE_SIZE)),
    };
  },
  ["public-articles"],
  {
    revalidate: 300,
  },
);

const getCachedPublishedArticle = unstable_cache(
  async (slug: string) => {
    return prisma.article.findFirst({
      where: {
        slug,
        status: ArticleStatus.PUBLISHED,
        publishDate: {
          lte: new Date(),
        },
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  },
  ["published-article"],
  {
    revalidate: 300,
  },
);

const getCachedPublicTaxonomy = unstable_cache(
  async () => {
    const [categories, tags] = await Promise.all([
      prisma.category.findMany({
        where: {
          articles: {
            some: {
              status: ArticleStatus.PUBLISHED,
              publishDate: {
                lte: new Date(),
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.tag.findMany({
        where: {
          articles: {
            some: {
              article: {
                status: ArticleStatus.PUBLISHED,
                publishDate: {
                  lte: new Date(),
                },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    return { categories, tags };
  },
  ["public-taxonomy"],
  {
    revalidate: 300,
  },
);

export function getPublicArticles(filters: PublicArticleFilters) {
  return getCachedPublicArticles(filters);
}

export function getPublishedArticleBySlug(slug: string) {
  return getCachedPublishedArticle(slug);
}

export function getPublicTaxonomy() {
  return getCachedPublicTaxonomy();
}

export async function getHomePageData() {
  const featured = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      publishDate: {
        lte: new Date(),
      },
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      publishDate: "desc",
    },
    take: 6,
  });

  return {
    hero: featured[0] ?? null,
    secondary: featured.slice(1),
  };
}
