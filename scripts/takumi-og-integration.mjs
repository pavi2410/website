import { spawn } from "node:child_process";
import * as fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function astroTakumiOg() {
  return {
    name: "astro-takumi-og",
    hooks: {
      "astro:build:done": async ({ logger, pages, dir }) => {
        logger.info("Generating Open Graph images using Takumi");

        const manifestPath = path.join(os.tmpdir(), `astro-og-${process.pid}-${Date.now()}.json`);
        await fsPromises.writeFile(
          manifestPath,
          JSON.stringify({
            dir: fileURLToPath(dir),
            pages: pages.map((page) => ({ pathname: page.pathname })),
          }),
        );

        const scriptPath = fileURLToPath(new URL("./generate-og-images.ts", import.meta.url));
        const projectRoot = fileURLToPath(new URL("..", import.meta.url));

        await new Promise((resolve, reject) => {
          const child = spawn("bun", [scriptPath, manifestPath], {
            cwd: projectRoot,
            stdio: "inherit",
          });

          child.on("error", reject);
          child.on("exit", (code) => {
            if (code === 0) {
              resolve(undefined);
              return;
            }

            reject(new Error(`OG image generation failed with exit code ${code ?? "unknown"}`));
          });
        });
      },
    },
  };
}
