import { copyFile, access, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const indexPath = join(distDir, "index.html");
const fallbackPath = join(distDir, "404.html");
const noJekyllPath = join(distDir, ".nojekyll");

try {
  await access(indexPath, constants.R_OK);
  await copyFile(indexPath, fallbackPath);
  await writeFile(noJekyllPath, "", "utf8");
  console.log("Created SPA fallback and .nojekyll marker.");
} catch (error) {
  console.warn("Skipped SPA fallback creation:", error instanceof Error ? error.message : String(error));
}
