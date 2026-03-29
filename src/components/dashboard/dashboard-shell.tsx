"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  AppShell,
  Avatar,
  Burger,
  Button,
  Group,
  NavLink,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArticle,
  IconCategory,
  IconDashboard,
  IconHash,
  IconLogout,
} from "@tabler/icons-react";

type DashboardShellProps = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  children: React.ReactNode;
};

const navItems = [
  { href: "/dashboard", label: "Přehled", icon: IconDashboard },
  { href: "/dashboard/articles", label: "Články", icon: IconArticle },
  { href: "/dashboard/categories", label: "Kategorie", icon: IconCategory },
  { href: "/dashboard/tags", label: "Tagy", icon: IconHash },
];

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [opened, { toggle }] = useDisclosure();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <AppShell
      navbar={{
        width: 290,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="lg"
      header={{ height: 72 }}
      className="dashboard-shell"
    >
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <div>
              <Text fw={700}>Redakce</Text>
              <Text size="sm" c="dimmed">
                Obsah a publikace
              </Text>
            </div>
          </Group>

          <Button
            variant="light"
            color="dark"
            leftSection={<IconLogout size={16} />}
            loading={isSigningOut}
            onClick={handleSignOut}
          >
            Odhlásit
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack justify="space-between" h="100%">
          <div>
            <Group mb="xl">
              <Avatar src={user.image ?? undefined} color="teal" radius="xl">
                {user.name?.slice(0, 1) ?? "U"}
              </Avatar>
              <div>
                <Title order={4}>{user.name}</Title>
                <Text size="sm" c="dimmed">
                  {user.email}
                </Text>
              </div>
            </Group>

            <Stack gap="xs">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  leftSection={<item.icon size={16} />}
                  active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                  variant="filled"
                  color="teal"
                />
              ))}
            </Stack>
          </div>

          <Button component={Link} href="/" variant="subtle" color="dark">
            Zobrazit web
          </Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
