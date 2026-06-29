import fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";
import { extract, sanitizeHtml } from "../src/integrations/takumi-og/extract.ts";
import { renderOgImageForPage } from "./og-image-render.ts";
import { ogImageOptions } from "./og-image-options.ts";

interface Manifest {
  dir: string;
  pages: Array<{ pathname: string }>;
}

function getFilePath({ dir, page }: { dir: string; page: string }): string {
  let target = path.join(dir, page, "index.html");
  if (!fs.existsSync(target)) {
    target = path.join(dir, page.slice(0, -1) + ".html");
  }
  return target;
}

const manifestPath = process.argv[2];
if (!manifestPath) {
  throw new Error("Missing manifest path argument");
}

const manifest = JSON.parse(await fsPromises.readFile(manifestPath, "utf8")) as Manifest;
const options = { ...ogImageOptions };

for (const page of manifest.pages) {
  const htmlFile = getFilePath({ dir: manifest.dir, page: page.pathname });
  const html = (await fsPromises.readFile(htmlFile)).toString();
  const imageBuffer = await renderOgImageForPage({
    html,
    pathname: page.pathname,
    dir: manifest.dir,
  });

  const imageFile = htmlFile.replace(/\.html$/, `.${options.format}`);
  await fsPromises.writeFile(imageFile, imageBuffer);

  const relativeImageFile = path.relative(manifest.dir, imageFile).replace(/\\/g, "/");
  const document = new JSDOM(sanitizeHtml(html)).window.document;
  const pageDetails = extract(document);
  const imageUrl = new URL(pageDetails.image).pathname.slice(1);

  if (imageUrl !== relativeImageFile) {
    throw new Error(
      `The og:image property in ${htmlFile} (${imageUrl}) does not match the generated image (${relativeImageFile}).`,
    );
  }

  console.log(`Generated ${relativeImageFile} for ${htmlFile}`);
}

await fsPromises.unlink(manifestPath);
