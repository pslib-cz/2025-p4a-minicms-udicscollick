import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";
import { ArticleStatus } from "@/generated/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article.findMany({
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
