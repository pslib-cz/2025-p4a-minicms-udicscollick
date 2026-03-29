"use client";

import dayjs from "dayjs";
import "dayjs/locale/cs";
import { DatesProvider } from "@mantine/dates";
import { MantineProvider, createTheme } from "@mantine/core";

dayjs.locale("cs");

const theme = createTheme({
  primaryColor: "teal",
  fontFamily: "var(--font-sans)",
  defaultRadius: "md",
  headings: {
    fontFamily: "var(--font-sans)",
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <DatesProvider settings={{ locale: "cs", firstDayOfWeek: 1 }}>{children}</DatesProvider>
    </MantineProvider>
  );
}
