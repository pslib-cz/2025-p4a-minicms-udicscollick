"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Pagination,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { formatDate } from "@/lib/utils";

type DashboardArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "DRAFT" | "PUBLISHED";
  publishDate: string | null;
  updatedAt: string;
  category: {
    name: string;
  } | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
    };
  }>;
};

type ArticleListResponse = {
  items: DashboardArticle[];
  totalPages: number;
};

async function fetchArticlesPage(page: number) {
  const response = await fetch(`/api/articles?page=${page}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Nepodařilo se načíst seznam článků.");
  }

  return (await response.json()) as ArticleListResponse;
}

export function DashboardArticlesManager() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<DashboardArticle[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadArticles(nextPage = page) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload = await fetchArticlesPage(nextPage);
      setItems(payload.items);
      setTotalPages(payload.totalPages);
      setPage(nextPage);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nepodařilo se načíst články.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      setIsLoading(true);

      try {
        const payload = await fetchArticlesPage(1);

        if (!active) {
          return;
        }

        setItems(payload.items);
        setTotalPages(payload.totalPages);
        setPage(1);
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : "Nepodařilo se načíst články.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  async function handleDelete(articleId: string) {
    const confirmed = window.confirm("Opravdu chcete článek smazat?");

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/articles/${articleId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setErrorMessage("Nepodařilo se článek smazat.");
      return;
    }

    await loadArticles(page);
    router.refresh();
  }

  async function handleStatusToggle(article: DashboardArticle) {
    const nextStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const response = await fetch(`/api/articles/${article.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!response.ok) {
      setErrorMessage("Nepodařilo se změnit status článku.");
      return;
    }

    await loadArticles(page);
    router.refresh();
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text className="eyebrow">Články</Text>
          <Title order={1}>Všechny články</Title>
          <Text c="dimmed" mt={4}>
            Rozpracované i publikované texty máte po ruce v jednom přehledu.
          </Text>
        </div>

        <Button component={Link} href="/dashboard/articles/new" leftSection={<IconPlus size={16} />} color="teal">
          Nový článek
        </Button>
      </Group>

      {errorMessage ? (
        <Paper p="md" radius="lg" withBorder>
          <Text c="red">{errorMessage}</Text>
        </Paper>
      ) : null}

      {isLoading ? (
        <Group justify="center" py="xl">
          <Loader color="teal" />
        </Group>
      ) : items.length === 0 ? (
        <Paper p="xl" radius="xl" withBorder>
          <Title order={3}>První článek ještě čeká na sepsání</Title>
          <Text c="dimmed" mt="sm">
            Začněte novým textem a připravte si další vydání přesně podle svého tempa.
          </Text>
        </Paper>
      ) : (
        <>
          <Stack gap="md">
            {items.map((article) => (
              <Paper key={article.id} p="lg" radius="xl" shadow="sm" withBorder>
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Group gap="xs" mb="xs">
                        <Badge color={article.status === "PUBLISHED" ? "teal" : "gray"} variant="light">
                          {article.status === "PUBLISHED" ? "Publikováno" : "Rozpracováno"}
                        </Badge>
                        {article.category ? (
                          <Badge color="orange" variant="light">
                            {article.category.name}
                          </Badge>
                        ) : null}
                      </Group>
                      <Title order={3}>{article.title}</Title>
                      <Text c="dimmed" mt={4}>
                        {article.excerpt}
                      </Text>
                    </div>

                    <Group gap="xs">
                      <Button
                        variant="light"
                        color={article.status === "PUBLISHED" ? "gray" : "teal"}
                        onClick={() => void handleStatusToggle(article)}
                      >
                        {article.status === "PUBLISHED" ? "Stáhnout z webu" : "Publikovat"}
                      </Button>
                      <ActionIcon
                        component={Link}
                        href={`/dashboard/articles/${article.id}/edit`}
                        variant="light"
                        color="blue"
                        size="lg"
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        size="lg"
                        onClick={() => void handleDelete(article.id)}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Group justify="space-between">
                    <Group gap="xs">
                      {article.tags.map(({ tag }) => (
                        <Badge key={tag.id} variant="dot" color="dark">
                          {tag.name}
                        </Badge>
                      ))}
                    </Group>
                    <Text size="sm" c="dimmed">
                      Publikováno: {formatDate(article.publishDate)} | Upraveno: {formatDate(article.updatedAt)}
                    </Text>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </Stack>

          <Group justify="center">
            <Pagination total={totalPages} value={page} onChange={(nextPage) => void loadArticles(nextPage)} />
          </Group>
        </>
      )}
    </Stack>
  );
}
