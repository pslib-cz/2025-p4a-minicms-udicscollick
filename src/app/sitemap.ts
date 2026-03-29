import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";
import { ArticleStatus } from "@/generated/prisma";
import { isMissingPrismaTableError } from "@/lib/prisma-errors";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: Array<{ slug: string; updatedAt: Date }> = [];

  try {
    articles = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        publishDate: {
          lte: new Date(),
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    if (!isMissingPrismaTableError(error)) {
      throw error;
    }
  }

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
    },
    {
      url: absoluteUrl("/articles"),
      lastModified: new Date(),
    },
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: article.updatedAt,
    })),
  ];
}
