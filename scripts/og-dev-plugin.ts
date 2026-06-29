import type { Plugin } from "vite";
import { ogPngPathToPagePath } from "./og-path-utils.ts";
import { renderOgImageForPage } from "./og-image-render.ts";

export function ogDevPlugin(): Plugin {
  return {
    name: "astro-takumi-og-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "";
        const pagePath = ogPngPathToPagePath(pathname);

        if (!pagePath) {
          next();
          return;
        }

        try {
          const host = req.headers.host ?? "localhost:4321";
          const htmlResponse = await fetch(`http://${host}${pagePath}`, {
            headers: { accept: "text/html" },
          });

          if (!htmlResponse.ok) {
            next();
            return;
          }

          const html = await htmlResponse.text();
          const buffer = await renderOgImageForPage({
            html,
            pathname: pagePath,
            dir: server.config.root,
          });

          res.statusCode = 200;
          res.setHeader("Content-Type", "image/png");
          res.setHeader("Cache-Control", "no-store");
          res.end(Buffer.from(buffer));
        } catch (error) {
          console.error("[astro-takumi-og] Failed to render dev OG image:", error);
          next();
        }
      });
    },
  };
}
