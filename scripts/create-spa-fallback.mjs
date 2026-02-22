import { copyFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const indexPath = join(distDir, "index.html");
const fallbackPath = join(distDir, "404.html");

try {
  await access(indexPath, constants.R_OK);
  await copyFile(indexPath, fallbackPath);
  console.log("Created SPA fallback: dist/404.html");
} catch (error) {
  console.warn("Skipped SPA fallback creation:", error instanceof Error ? error.message : String(error));
}

