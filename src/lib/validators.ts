import { z } from "zod";
import { ArticleStatus } from "@/generated/prisma";
import { getPlainTextFromHtml } from "@/lib/utils";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Zadejte platný e-mail."),
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků."),
});

export const slugSchema = z
  .string()
  .trim()
  .min(3, "Slug musí mít alespoň 3 znaky.")
  .max(120, "Slug je příliš dlouhý.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug může obsahovat jen malá písmena, čísla a pomlčky.");

const articleBaseSchema = z
  .object({
    title: z.string().trim().min(5, "Titulek musí mít alespoň 5 znaků.").max(120),
    slug: slugSchema,
    excerpt: z.string().trim().min(20, "Perex musí mít alespoň 20 znaků.").max(240),
    content: z.string().trim().min(20, "Obsah nesmí být prázdný."),
    coverImageUrl: z.union([z.string().trim().url("Zadejte platnou URL."), z.literal(""), z.undefined()]),
    status: z.nativeEnum(ArticleStatus),
    publishDate: z.union([z.string(), z.null(), z.undefined()]),
    categoryId: z.union([z.string().trim().min(1), z.literal(""), z.null(), z.undefined()]),
    tagIds: z.array(z.string().trim().min(1)).max(10, "Můžete vybrat maximálně 10 tagů."),
  })
  .superRefine((value, ctx) => {
    const plainText = getPlainTextFromHtml(value.content);

    if (plainText.length < 60) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Obsah musí mít alespoň 60 znaků skutečného textu.",
        path: ["content"],
      });
    }

    if (value.status === ArticleStatus.PUBLISHED && !value.publishDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Publikovaný článek musí mít datum publikace.",
        path: ["publishDate"],
      });
    }

    if (value.publishDate) {
      const parsedDate = new Date(value.publishDate);

      if (Number.isNaN(parsedDate.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Datum publikace není platné.",
          path: ["publishDate"],
        });
      }
    }
  });

export const articleFormSchema = articleBaseSchema;

export const articleInputSchema = articleBaseSchema.transform((value) => ({
  ...value,
  coverImageUrl: value.coverImageUrl || null,
  publishDate: value.publishDate ? new Date(value.publishDate).toISOString() : null,
  categoryId: value.categoryId || null,
}));

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, "Název musí mít alespoň 2 znaky.").max(60),
  description: z
    .union([z.string().trim().max(160, "Popis může mít maximálně 160 znaků."), z.literal(""), z.undefined()])
    .transform((value) => value || null),
});

export const tagInputSchema = z.object({
  name: z.string().trim().min(2, "Název musí mít alespoň 2 znaky.").max(40),
});

export const articleStatusSchema = z.object({
  status: z.nativeEnum(ArticleStatus),
});
