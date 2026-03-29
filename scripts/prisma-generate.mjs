import { isPostgresSchema, resolveSchemaPath, runLocalBinary } from "./prisma-helpers.mjs";

const schemaPath = resolveSchemaPath();

console.log(
  `[prisma] Generating client for ${isPostgresSchema(schemaPath) ? "PostgreSQL" : "SQLite"} using ${schemaPath}`,
);

runLocalBinary("npx", ["prisma", "generate", "--schema", schemaPath]);
