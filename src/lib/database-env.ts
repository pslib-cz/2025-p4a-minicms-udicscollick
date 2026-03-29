function pickFirstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    if (value?.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

export function normalizeDatabaseEnv(env: NodeJS.ProcessEnv = process.env) {
  const databaseUrl = pickFirstNonEmpty(
    env.DATABASE_URL,
    env.POSTGRES_PRISMA_URL,
    env.POSTGRES_URL,
    env.POSTGRES_URL_NON_POOLING,
  );

  const directUrl = pickFirstNonEmpty(
    env.DIRECT_URL,
    env.POSTGRES_URL_NON_POOLING,
    env.POSTGRES_URL,
  );

  if (databaseUrl && !env.DATABASE_URL) {
    env.DATABASE_URL = databaseUrl;
  }

  if (directUrl && !env.DIRECT_URL) {
    env.DIRECT_URL = directUrl;
  }

  return env;
}
