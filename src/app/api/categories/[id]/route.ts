import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireApiUser, prismaErrorResponse, zodErrorResponse } from "@/lib/api";
import { categoryInputSchema } from "@/lib/validators";
import { slugify } from "@/lib/slug";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function findOwnedCategory(userId: string, categoryId: string) {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const category = await findOwnedCategory(auth.userId, id);

  if (!category) {
    return NextResponse.json({ error: "Kategorie nebyla nalezena." }, { status: 404 });
  }

  try {
    const body = (await request.json()) as unknown;
    const parsed = categoryInputSchema.safeParse(body);

    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        description: parsed.data.description,
      },
    });

    revalidatePath("/articles");
    revalidatePath("/");

    return NextResponse.json({
      item: {
        id: updatedCategory.id,
        name: updatedCategory.name,
      },
    });
  } catch (error) {
    return prismaErrorResponse(error, "Taková kategorie už existuje.");
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const category = await findOwnedCategory(auth.userId, id);

  if (!category) {
    return NextResponse.json({ error: "Kategorie nebyla nalezena." }, { status: 404 });
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });

  revalidatePath("/articles");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
