export const siteConfig = {
  name: "Toulky",
  shortName: "Toulky",
  description:
    "Praktické cestovatelské tipy, víkendové itineráře a inspirace pro města, hory i pomalé roadtripy.",
};

export function getSiteUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalizedPath, `${getSiteUrl()}/`).toString();
}
