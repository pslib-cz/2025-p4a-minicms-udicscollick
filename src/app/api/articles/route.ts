import { NextRequest, NextResponse } from "next/server";
import { articleInputSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { parsePageParam } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/sanitize";
import { requireApiUser, prismaErrorResponse, zodErrorResponse } from "@/lib/api";
import { DASHBOARD_PAGE_SIZE } from "@/lib/content";
import { slugify } from "@/lib/slug";
import { revalidateArticlePaths } from "@/lib/revalidate";

async function validateTaxonomyOwnership(userId: string, categoryId: string | null, tagIds: string[]) {
  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Vybraná kategorie nepatří přihlášenému uživateli." }, { status: 403 });
    }
  }

  if (tagIds.length > 0) {
    const tags = await prisma.tag.findMany({
      where: {
        userId,
        id: {
          in: tagIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (tags.length !== tagIds.length) {
      return NextResponse.json({ error: "Jeden nebo více vybraných tagů nepatří přihlášenému uživateli." }, { status: 403 });
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const auth = await requireApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  const page = parsePageParam(request.nextUrl.searchParams.get("page") ?? undefined, 1);

  const where = {
    authorId: auth.userId,
  };

  const [items, totalItems] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: {
          select: {
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
        updatedAt: "desc",
      },
      skip: (page - 1) * DASHBOARD_PAGE_SIZE,
      take: DASHBOARD_PAGE_SIZE,
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({
    items,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / DASHBOARD_PAGE_SIZE)),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  try {
    const body = (await request.json()) as unknown;
    const parsed = articleInputSchema.safeParse(body);

    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const slug = slugify(parsed.data.slug || parsed.data.title);
    const tagIds = [...new Set(parsed.data.tagIds)];
    const sanitizedContent = sanitizeRichText(parsed.data.content);

    const taxonomyError = await validateTaxonomyOwnership(auth.userId, parsed.data.categoryId, tagIds);

    if (taxonomyError) {
      return taxonomyError;
    }

    const existingArticle = await prisma.article.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existingArticle) {
      return NextResponse.json(
        {
          error: "Zvolený slug už používá jiný článek.",
          fieldErrors: {
            slug: "Slug musí být unikátní.",
          },
        },
        { status: 409 },
      );
    }

    const article = await prisma.$transaction(async (transaction) => {
      const createdArticle = await transaction.article.create({
        data: {
          title: parsed.data.title,
          slug,
          excerpt: parsed.data.excerpt,
          contentHtml: sanitizedContent,
          coverImageUrl: parsed.data.coverImageUrl,
          status: parsed.data.status,
          publishDate: parsed.data.publishDate ? new Date(parsed.data.publishDate) : null,
          authorId: auth.userId,
          categoryId: parsed.data.categoryId,
        },
      });

      if (tagIds.length > 0) {
        await transaction.articleTag.createMany({
          data: tagIds.map((tagId) => ({
            articleId: createdArticle.id,
            tagId,
          })),
        });
      }

      return createdArticle;
    });

    revalidateArticlePaths(article.slug);

    return NextResponse.json(
      {
        item: {
          id: article.id,
          slug: article.slug,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return prismaErrorResponse(error, "Takový článek už existuje.");
  }
}
