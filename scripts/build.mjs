import { isPostgresSchema, resolveSchemaPath, runLocalBinary } from "./prisma-helpers.mjs";

const schemaPath = resolveSchemaPath();

runLocalBinary("npx", ["prisma", "generate", "--schema", schemaPath]);

if (isPostgresSchema(schemaPath)) {
  runLocalBinary("npx", ["prisma", "migrate", "deploy", "--schema", schemaPath]);
}

runLocalBinary("npx", ["next", "build"]);
