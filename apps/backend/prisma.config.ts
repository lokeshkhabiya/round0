import path from "path";
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";
import { fileURLToPath } from "url";

const projectDir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(projectDir, ".env") });

export default defineConfig({
  schema: path.join(projectDir, "prisma", "schema.prisma"),
  migrations: {
    path: path.join(projectDir, "prisma", "migrations"),
  },
  datasource: {
    url: env("DIRECT_URL"), // Use direct URL for migrations
  },
});