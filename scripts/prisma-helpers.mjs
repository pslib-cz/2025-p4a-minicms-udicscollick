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

export function resolveSchemaPath() {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (isPostgresUrl(databaseUrl)) {
    return POSTGRES_SCHEMA;
  }

  return SQLITE_SCHEMA;
}

export function runLocalBinary(binaryName, args) {
  const binary = process.platform === "win32" ? `${binaryName}.cmd` : binaryName;
  const result = spawnSync(binary, args, {
    stdio: "inherit",
    env: process.env,
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
