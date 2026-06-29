import type { PageDetails } from "./types.js";

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<style([\S\s]*?)>([\S\s]*?)<\/style>/gim, "")
    .replace(/<script([\S\s]*?)>([\S\s]*?)<\/script>/gim, "");
}

export function extract(document: Document): PageDetails {
  const title = document.querySelector("meta[property='og:title']")?.getAttribute("content");
  const description = document.querySelector("meta[property='og:description']")?.getAttribute("content");
  const url = document.querySelector("meta[property='og:url']")?.getAttribute("content");
  const type = document.querySelector("meta[property='og:type']")?.getAttribute("content");
  const image = document.querySelector("meta[property='og:image']")?.getAttribute("content");
  const errors: string[] = [];

  if (!title) errors.push("og:title");
  if (!url) errors.push("og:url");
  if (!type) errors.push("og:type");
  if (!image) errors.push("og:image");

  if (errors.length > 0) {
    const html = errors.map((error) => `<meta property="${error}" content="some value"/>`);
    throw new Error(
      `Missing required meta tags: ${errors.join(", ")}. Add the following to your page:\n${html.join("\n")}`,
    );
  }

  const returnVal: PageDetails = {
    title: title!,
    url: url!,
    type: type!,
    image: image!,
  };

  if (description && description !== title) {
    returnVal.description = description;
  }

  return returnVal;
}
