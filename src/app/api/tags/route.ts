import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireApiUser, prismaErrorResponse, zodErrorResponse } from "@/lib/api";
import { tagInputSchema } from "@/lib/validators";
import { slugify } from "@/lib/slug";

export async function GET() {
  const auth = await requireApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  const items = await prisma.tag.findMany({
    where: {
      userId: auth.userId,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          articles: true,
        },
      },
    },
  });

  return NextResponse.json({
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      usageCount: item._count.articles,
    })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  try {
    const body = (await request.json()) as unknown;
    const parsed = tagInputSchema.safeParse(body);

    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const item = await prisma.tag.create({
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        userId: auth.userId,
      },
    });

    revalidatePath("/articles");
    revalidatePath("/");

    return NextResponse.json(
      {
        item: {
          id: item.id,
          name: item.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return prismaErrorResponse(error, "Takový tag už existuje.");
  }
}
