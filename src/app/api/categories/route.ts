import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser, prismaErrorResponse, zodErrorResponse } from "@/lib/api";
import { categoryInputSchema } from "@/lib/validators";
import { slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";

export async function GET() {
  const auth = await requireApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  const items = await prisma.category.findMany({
    where: {
      userId: auth.userId,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      description: true,
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
      description: item.description,
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
    const parsed = categoryInputSchema.safeParse(body);

    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const item = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        description: parsed.data.description,
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
    return prismaErrorResponse(error, "Taková kategorie už existuje.");
  }
}
