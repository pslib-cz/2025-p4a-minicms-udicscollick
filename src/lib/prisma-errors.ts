import { Prisma } from "@/generated/prisma";

export function isMissingPrismaTableError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021"
  );
}
