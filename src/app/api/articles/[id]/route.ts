import { NextRequest, NextResponse } from "next/server";
import { ArticleStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { articleInputSchema, articleStatusSchema } from "@/lib/validators";
import { requireApiUser, prismaErrorResponse, zodErrorResponse } from "@/lib/api";
import { sanitizeRichText } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";
import { revalidateArticlePaths } from "@/lib/revalidate";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getOwnedArticle(userId: string, articleId: string) {
  return prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: userId,
    },
    include: {
      tags: {
        select: {
          tagId: true,
        },
      },
    },
  });
}

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
      return NextResponse.json({ error: "Vybrané tagy nepatří přihlášenému uživateli." }, { status: 403 });
    }
  }

  return null;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const article = await getOwnedArticle(auth.userId, id);

  if (!article) {
    return NextResponse.json({ error: "Článek nebyl nalezen." }, { status: 404 });
  }

  return NextResponse.json({
    item: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.contentHtml,
      coverImageUrl: article.coverImageUrl,
      status: article.status,
      publishDate: article.publishDate?.toISOString() ?? null,
      categoryId: article.categoryId,
      tagIds: article.tags.map((tag) => tag.tagId),
    },
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const existingArticle = await getOwnedArticle(auth.userId, id);

  if (!existingArticle) {
    return NextResponse.json({ error: "Článek nebyl nalezen." }, { status: 404 });
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

    const conflictingArticle = await prisma.article.findFirst({
      where: {
        slug,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
      },
    });

    if (conflictingArticle) {
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

    const updatedArticle = await prisma.$transaction(async (transaction) => {
      const article = await transaction.article.update({
        where: {
          id,
        },
        data: {
          title: parsed.data.title,
          slug,
          excerpt: parsed.data.excerpt,
          contentHtml: sanitizedContent,
          coverImageUrl: parsed.data.coverImageUrl,
          status: parsed.data.status,
          publishDate: parsed.data.publishDate ? new Date(parsed.data.publishDate) : null,
          categoryId: parsed.data.categoryId,
        },
      });

      await transaction.articleTag.deleteMany({
        where: {
          articleId: id,
        },
      });

      if (tagIds.length > 0) {
        await transaction.articleTag.createMany({
          data: tagIds.map((tagId) => ({
            articleId: id,
            tagId,
          })),
        });
      }

      return article;
    });

    revalidateArticlePaths(existingArticle.slug);

    if (existingArticle.slug !== updatedArticle.slug) {
      revalidateArticlePaths(updatedArticle.slug);
    }

    return NextResponse.json({
      item: {
        id: updatedArticle.id,
        slug: updatedArticle.slug,
      },
    });
  } catch (error) {
    return prismaErrorResponse(error, "Takový článek už existuje.");
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const article = await getOwnedArticle(auth.userId, id);

  if (!article) {
    return NextResponse.json({ error: "Článek nebyl nalezen." }, { status: 404 });
  }

  const body = (await request.json()) as unknown;
  const parsed = articleStatusSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const nextStatus = parsed.data.status;

  const updatedArticle = await prisma.article.update({
    where: {
      id,
    },
    data: {
      status: nextStatus,
      publishDate:
        nextStatus === ArticleStatus.PUBLISHED
          ? article.publishDate ?? new Date()
          : article.publishDate,
    },
  });

  revalidateArticlePaths(updatedArticle.slug);

  return NextResponse.json({
    item: {
      id: updatedArticle.id,
      status: updatedArticle.status,
    },
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const article = await getOwnedArticle(auth.userId, id);

  if (!article) {
    return NextResponse.json({ error: "Článek nebyl nalezen." }, { status: 404 });
  }

  await prisma.article.delete({
    where: {
      id,
    },
  });

  revalidateArticlePaths(article.slug);

  return NextResponse.json({ ok: true });
}
