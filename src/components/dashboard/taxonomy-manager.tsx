"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { categoryInputSchema, tagInputSchema } from "@/lib/validators";

type TaxonomyManagerProps = {
  entity: "categories" | "tags";
};

type CategoryFormValues = import("zod").input<typeof categoryInputSchema>;
type TagFormValues = import("zod").input<typeof tagInputSchema>;

type TaxonomyItem = {
  id: string;
  name: string;
  description?: string | null;
  usageCount: number;
};

async function fetchTaxonomy(entity: "categories" | "tags") {
  const response = await fetch(`/api/${entity}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error();
  }

  return (await response.json()) as { items: TaxonomyItem[] };
}

export function TaxonomyManager({ entity }: TaxonomyManagerProps) {
  const isCategory = entity === "categories";
  const labels = useMemo(
    () =>
      isCategory
        ? {
            title: "Kategorie",
            singular: "kategorii",
            helper: "Hlavní tematické členění, podle kterého zůstane obsah přehledný a snadno čitelný.",
            createdSuccess: "Kategorie byla vytvořena.",
            updatedSuccess: "Kategorie byla upravena.",
          }
        : {
            title: "Tagy",
            singular: "tag",
            helper: "Jemnější štítky pro motivy, tempo cesty nebo konkrétní typ zážitku.",
            createdSuccess: "Tag byl vytvořen.",
            updatedSuccess: "Tag byl upraven.",
          },
    [isCategory],
  );

  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [editingItem, setEditingItem] = useState<TaxonomyItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues | TagFormValues>({
    resolver: zodResolver(isCategory ? categoryInputSchema : tagInputSchema),
    defaultValues: isCategory ? { name: "", description: "" } : { name: "" },
  });

  async function loadItems() {
    try {
      const payload = await fetchTaxonomy(entity);
      setItems(payload.items);
    } catch {
      setErrorMessage(`Nepodařilo se načíst ${labels.title.toLowerCase()}.`);
    }
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const payload = await fetchTaxonomy(entity);

        if (!active) {
          return;
        }

        setItems(payload.items);
      } catch {
        if (active) {
          setErrorMessage(`Nepodařilo se načíst ${labels.title.toLowerCase()}.`);
        }
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [entity, labels.title]);

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const response = await fetch(editingItem ? `/api/${entity}/${editingItem.id}` : `/api/${entity}`, {
      method: editingItem ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setErrorMessage(payload.error ?? `Nepodařilo se uložit ${labels.singular}.`);
      return;
    }

    reset(isCategory ? { name: "", description: "" } : { name: "" });
    setEditingItem(null);
    setSuccessMessage(editingItem ? labels.updatedSuccess : labels.createdSuccess);
    await loadItems();
  });

  function handleEdit(item: TaxonomyItem) {
    setEditingItem(item);
    reset(isCategory ? { name: item.name, description: item.description ?? "" } : { name: item.name });
    setSuccessMessage(null);
    setErrorMessage(null);
  }

  function handleCancelEdit() {
    setEditingItem(null);
    reset(isCategory ? { name: "", description: "" } : { name: "" });
  }

  async function handleDelete(itemId: string) {
    const confirmed = window.confirm(`Opravdu chcete ${labels.singular} smazat?`);

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/${entity}/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setErrorMessage(`Nepodařilo se smazat ${labels.singular}.`);
      return;
    }

    await loadItems();
  }

  return (
    <Stack gap="lg">
      <div>
        <Text className="eyebrow">Obsahové členění</Text>
        <Title order={1}>{labels.title}</Title>
        <Text c="dimmed" mt={4}>
          {labels.helper}
        </Text>
      </div>

      {errorMessage ? (
        <Alert color="red" variant="light">
          {errorMessage}
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert color="teal" variant="light">
          {successMessage}
        </Alert>
      ) : null}

      <Paper p="xl" radius="xl" shadow="sm" withBorder>
        <form onSubmit={onSubmit}>
          <Stack gap="md">
            <TextInput
              label="Název"
              placeholder={isCategory ? "Např. Víkend v Evropě" : "Např. roadtrip"}
              error={errors.name?.message}
              {...register("name")}
            />

            {isCategory ? (
              <Textarea
                label="Popis"
                placeholder="Krátké shrnutí kategorie."
                autosize
                minRows={3}
                error={"description" in errors ? errors.description?.message : undefined}
                {...register("description")}
              />
            ) : null}

            <Group justify="flex-end">
              {editingItem ? (
                <Button variant="default" onClick={handleCancelEdit}>
                  Zrušit editaci
                </Button>
              ) : null}
              <Button type="submit" color="teal" loading={isSubmitting}>
                {editingItem ? "Uložit změny" : `Přidat ${labels.singular}`}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>

      <Stack gap="md">
        {items.map((item) => (
          <Paper key={item.id} p="lg" radius="xl" shadow="sm" withBorder>
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={3}>{item.name}</Title>
                {isCategory && item.description ? (
                  <Text c="dimmed" mt="xs">
                    {item.description}
                  </Text>
                ) : null}
                <Text size="sm" c="dimmed" mt="sm">
                  Použití v článcích: {item.usageCount}
                </Text>
              </div>

              <Group gap="xs">
                <ActionIcon variant="light" color="blue" size="lg" onClick={() => handleEdit(item)}>
                  <IconPencil size={18} />
                </ActionIcon>
                <ActionIcon variant="light" color="red" size="lg" onClick={() => void handleDelete(item.id)}>
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
