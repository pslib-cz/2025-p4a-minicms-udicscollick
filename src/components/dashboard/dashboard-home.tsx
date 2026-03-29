"use client";

import Link from "next/link";
import { Button, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconArticle, IconCategory, IconHash, IconSparkles } from "@tabler/icons-react";

const cards = [
  {
    title: "Články",
    description: "Vytvářejte, publikujte a upravujte cestovatelské tipy včetně perexu a rich text obsahu.",
    href: "/dashboard/articles",
    icon: IconArticle,
  },
  {
    title: "Kategorie",
    description: "Udržujte přehledné tematické členění článků podle typu cesty, destinace nebo stylu výletu.",
    href: "/dashboard/categories",
    icon: IconCategory,
  },
  {
    title: "Tagy",
    description: "Přidávejte štítky, podle kterých se čtenář snadno zorientuje mezi podobnými tématy.",
    href: "/dashboard/tags",
    icon: IconHash,
  },
];

export function DashboardHome() {
  return (
    <Stack gap="xl">
      <Paper p="xl" radius="xl" className="dashboard-hero">
        <Stack gap="md">
          <ThemeIcon size={56} radius="xl" color="teal" variant="light">
            <IconSparkles size={28} />
          </ThemeIcon>
          <div>
            <Title order={1}>Přehled redakce</Title>
            <Text c="dimmed" mt="xs">
              Rozpracované texty, připravené publikace i obsahové členění máte pohromadě na jednom místě.
            </Text>
          </div>
        </Stack>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {cards.map((card) => (
          <Paper key={card.title} p="lg" radius="xl" shadow="sm" withBorder>
            <Stack gap="md">
              <ThemeIcon size={46} radius="lg" color="teal" variant="light">
                <card.icon size={24} />
              </ThemeIcon>
              <div>
                <Title order={3}>{card.title}</Title>
                <Text c="dimmed" mt="xs">
                  {card.description}
                </Text>
              </div>
              <Button component={Link} href={card.href} variant="light" color="teal">
                Spravovat
              </Button>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
