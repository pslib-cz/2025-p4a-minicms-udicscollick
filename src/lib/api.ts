import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import { getAuthSession } from "@/lib/auth";

export async function requireApiUser() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      error: NextResponse.json({ error: "Přístup odepřen. Přihlaste se." }, { status: 401 }),
    };
  }

  return { userId };
}

export function zodErrorResponse(error: ZodError) {
  const fieldErrors = error.issues.reduce<Record<string, string>>((accumulator, issue) => {
    const key = String(issue.path[0] ?? "form");

    if (!accumulator[key]) {
      accumulator[key] = issue.message;
    }

    return accumulator;
  }, {});

  return NextResponse.json(
    {
      error: "Odeslaná data nejsou platná.",
      fieldErrors,
    },
    { status: 400 },
  );
}

export function prismaErrorResponse(error: unknown, duplicateMessage: string) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return NextResponse.json({ error: duplicateMessage }, { status: 409 });
  }

  console.error(error);
  return NextResponse.json({ error: "Na serveru došlo k chybě." }, { status: 500 });
}
