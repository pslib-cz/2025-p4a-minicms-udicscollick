import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireApiUser, prismaErrorResponse, zodErrorResponse } from "@/lib/api";
import { tagInputSchema } from "@/lib/validators";
import { slugify } from "@/lib/slug";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function findOwnedTag(userId: string, tagId: string) {
  return prisma.tag.findFirst({
    where: {
      id: tagId,
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
  const tag = await findOwnedTag(auth.userId, id);

  if (!tag) {
    return NextResponse.json({ error: "Tag nebyl nalezen." }, { status: 404 });
  }

  try {
    const body = (await request.json()) as unknown;
    const parsed = tagInputSchema.safeParse(body);

    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const updatedTag = await prisma.tag.update({
      where: {
        id,
      },
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
      },
    });

    revalidatePath("/articles");
    revalidatePath("/");

    return NextResponse.json({
      item: {
        id: updatedTag.id,
        name: updatedTag.name,
      },
    });
  } catch (error) {
    return prismaErrorResponse(error, "Takový tag už existuje.");
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const tag = await findOwnedTag(auth.userId, id);

  if (!tag) {
    return NextResponse.json({ error: "Tag nebyl nalezen." }, { status: 404 });
  }

  await prisma.tag.delete({
    where: {
      id,
    },
  });

  revalidatePath("/articles");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
