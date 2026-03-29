"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Anchor,
  Button,
  Group,
  MultiSelect,
  Paper,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { Controller, useForm, useWatch } from "react-hook-form";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { slugify } from "@/lib/slug";
import { articleFormSchema } from "@/lib/validators";
import { RichTextField } from "@/components/dashboard/rich-text-field";

type ArticleFormProps = {
  articleId?: string;
};

type ArticleFormValues = import("zod").infer<typeof articleFormSchema>;

type TaxonomyOption = {
  id: string;
  name: string;
};

const defaultValues: ArticleFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "<p></p>",
  coverImageUrl: "",
  status: "DRAFT",
  publishDate: "",
  categoryId: "",
  tagIds: [],
};

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function ArticleForm({ articleId }: ArticleFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<TaxonomyOption[]>([]);
  const [tags, setTags] = useState<TaxonomyOption[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(articleId));
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugEditedManually, setSlugEditedManually] = useState(Boolean(articleId));

  const {
    control,
    register,
    reset,
    setValue,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues,
  });

  const titleValue = useWatch({
    control,
    name: "title",
  });

  useEffect(() => {
    if (slugEditedManually) {
      return;
    }

    setValue("slug", slugify(titleValue ?? ""), {
      shouldValidate: true,
    });
  }, [setValue, slugEditedManually, titleValue]);

  useEffect(() => {
    let cancelled = false;

    async function loadBootstrap() {
      try {
        const [categoriesResponse, tagsResponse, articleResponse] = await Promise.all([
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/tags", { cache: "no-store" }),
          articleId ? fetch(`/api/articles/${articleId}`, { cache: "no-store" }) : Promise.resolve(null),
        ]);

        if (!categoriesResponse.ok || !tagsResponse.ok || (articleResponse && !articleResponse.ok)) {
          throw new Error("Nepodařilo se načíst data formuláře.");
        }

        const categoriesPayload = (await categoriesResponse.json()) as { items: TaxonomyOption[] };
        const tagsPayload = (await tagsResponse.json()) as { items: TaxonomyOption[] };

        if (cancelled) {
          return;
        }

        setCategories(categoriesPayload.items);
        setTags(tagsPayload.items);

        if (articleResponse) {
          const articlePayload = (await articleResponse.json()) as {
            item: {
              title: string;
              slug: string;
              excerpt: string;
              content: string;
              coverImageUrl: string | null;
              status: "DRAFT" | "PUBLISHED";
              publishDate: string | null;
              categoryId: string | null;
              tagIds: string[];
            };
          };

          if (cancelled) {
            return;
          }

          reset({
            title: articlePayload.item.title,
            slug: articlePayload.item.slug,
            excerpt: articlePayload.item.excerpt,
            content: articlePayload.item.content,
            coverImageUrl: articlePayload.item.coverImageUrl ?? "",
            status: articlePayload.item.status,
            publishDate: toDateTimeLocal(articlePayload.item.publishDate),
            categoryId: articlePayload.item.categoryId ?? "",
            tagIds: articlePayload.item.tagIds,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setSubmitError(error instanceof Error ? error.message : "Nepodařilo se načíst formulář.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadBootstrap();

    return () => {
      cancelled = true;
    };
  }, [articleId, reset]);

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories],
  );
  const tagOptions = useMemo(() => tags.map((tag) => ({ value: tag.id, label: tag.name })), [tags]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const response = await fetch(articleId ? `/api/articles/${articleId}` : "/api/articles", {
      method: articleId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as {
      error?: string;
      fieldErrors?: Record<string, string>;
    };

    if (!response.ok) {
      if (payload.fieldErrors) {
        Object.entries(payload.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof ArticleFormValues, { message });
        });
      }

      setSubmitError(payload.error ?? "Nepodařilo se uložit článek.");
      return;
    }

    router.push("/dashboard/articles");
    router.refresh();
  });

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton h={48} radius="md" />
        <Skeleton h={120} radius="xl" />
        <Skeleton h={240} radius="xl" />
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text className="eyebrow">Editor obsahu</Text>
          <Title order={1}>{articleId ? "Upravit článek" : "Nový článek"}</Title>
          <Text c="dimmed" mt={4}>
            Doplňte perex, obrázek a štítky, ať je článek připravený k vydání.
          </Text>
        </div>

        <Anchor component={Link} href="/dashboard/articles" className="dashboard-back-link">
          <IconArrowLeft size={16} />
          Zpět na seznam
        </Anchor>
      </Group>

      {submitError ? (
        <Alert color="red" variant="light">
          {submitError}
        </Alert>
      ) : null}

      <Paper p="xl" radius="xl" shadow="sm" withBorder>
        <form onSubmit={onSubmit}>
          <Stack gap="md">
            <TextInput
              label="Titulek"
              placeholder="Např. 48 hodin v Kodani bez auta"
              error={errors.title?.message}
              {...register("title")}
            />

            <TextInput
              label="Slug"
              placeholder="48-hodin-v-kodani-bez-auta"
              error={errors.slug?.message}
              {...register("slug", {
                onChange() {
                  setSlugEditedManually(true);
                },
              })}
            />

            <Textarea
              label="Perex"
              placeholder="Stručné shrnutí článku pro seznam a metadata."
              autosize
              minRows={3}
              error={errors.excerpt?.message}
              {...register("excerpt")}
            />

            <TextInput
              label="Cover image URL"
              placeholder="https://images.unsplash.com/..."
              error={errors.coverImageUrl?.message}
              {...register("coverImageUrl")}
            />

            <Group grow align="flex-start">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                label="Status"
                data={[
                      { value: "DRAFT", label: "Rozpracováno" },
                      { value: "PUBLISHED", label: "Publikováno" },
                    ]}
                    value={field.value}
                    onChange={(value) => field.onChange(value ?? "DRAFT")}
                    error={errors.status?.message}
                  />
                )}
              />

              <TextInput
                label="Datum publikace"
                type="datetime-local"
                error={errors.publishDate?.message}
                {...register("publishDate")}
              />
            </Group>

            <Group grow align="flex-start">
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    label="Kategorie"
                    placeholder="Vyberte kategorii"
                    data={categoryOptions}
                    searchable
                    clearable
                    value={field.value || null}
                    onChange={(value) => field.onChange(value ?? "")}
                    error={errors.categoryId?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="tagIds"
                render={({ field }) => (
                  <MultiSelect
                    label="Tagy"
                    placeholder="Vyberte tagy"
                    data={tagOptions}
                    searchable
                    clearable
                    value={field.value ?? []}
                    onChange={field.onChange}
                    error={errors.tagIds?.message}
                  />
                )}
              />
            </Group>

            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <RichTextField
                  label="Obsah"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.content?.message}
                />
              )}
            />

            <Group justify="flex-end">
              <Button
                component={Link}
                href="/dashboard/articles"
                variant="default"
                disabled={isSubmitting}
              >
                Zrušit
              </Button>
              <Button type="submit" color="teal" loading={isSubmitting} leftSection={<IconDeviceFloppy size={16} />}>
                Uložit článek
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
