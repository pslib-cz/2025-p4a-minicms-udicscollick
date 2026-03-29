import { spawnSync } from "node:child_process";
import process from "node:process";

const SQLITE_SCHEMA = "prisma/sqlite/schema.prisma";
const POSTGRES_SCHEMA = "prisma/postgres/schema.prisma";

function isPostgresUrl(databaseUrl) {
  return (
    databaseUrl.startsWith("postgres://") ||
    databaseUrl.startsWith("postgresql://") ||
    databaseUrl.startsWith("prisma://")
  );
}

function pickFirstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function getNormalizedEnv() {
  const env = { ...process.env };

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

  if (databaseUrl) {
    env.DATABASE_URL = databaseUrl;
  }

  if (directUrl) {
    env.DIRECT_URL = directUrl;
  }

  return env;
}

export function resolveSchemaPath() {
  const databaseUrl = getNormalizedEnv().DATABASE_URL ?? "";

  if (isPostgresUrl(databaseUrl)) {
    return POSTGRES_SCHEMA;
  }

  return SQLITE_SCHEMA;
}

export function runLocalBinary(binaryName, args) {
  const binary = process.platform === "win32" ? `${binaryName}.cmd` : binaryName;
  const result = spawnSync(binary, args, {
    stdio: "inherit",
    env: getNormalizedEnv(),
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
}

export function isPostgresSchema(schemaPath) {
  return schemaPath === POSTGRES_SCHEMA;
}
