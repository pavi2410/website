import { JSDOM } from "jsdom";
import { render } from "takumi-js";
import { blogOgImage } from "../src/og-image.tsx";
import { extract, sanitizeHtml } from "../src/integrations/takumi-og/extract.ts";
import { ogImageOptions } from "./og-image-options.ts";

export async function renderOgImageForPage({
  html,
  pathname,
  dir,
}: {
  html: string;
  pathname: string;
  dir: string;
}): Promise<Uint8Array> {
  const document = new JSDOM(sanitizeHtml(html)).window.document;
  const pageDetails = extract(document);
  const reactNode = await blogOgImage({
    pathname,
    ...pageDetails,
    dir: new URL(`file://${dir.replace(/\\/g, "/")}/`),
    document,
  });

  return render(reactNode, {
    width: ogImageOptions.width,
    height: ogImageOptions.height,
    format: ogImageOptions.format,
    drawDebugBorder: ogImageOptions.drawDebugBorder,
    fonts: ogImageOptions.fonts,
  });
}
