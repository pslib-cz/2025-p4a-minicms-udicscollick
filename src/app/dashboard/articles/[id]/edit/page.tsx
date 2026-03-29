import { ArticleForm } from "@/components/dashboard/article-form";

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;

  return <ArticleForm articleId={id} />;
}
