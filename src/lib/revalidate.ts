import { revalidatePath } from "next/cache";

export function revalidateArticlePaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/dashboard/articles");

  if (slug) {
    revalidatePath(`/articles/${slug}`);
  }
}
