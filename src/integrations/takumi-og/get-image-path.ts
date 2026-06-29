export function getImagePath({
  url,
  site,
  format = "png",
}: {
  url: URL;
  site: URL | string | undefined;
  format?: string;
}): string {
  if (!site) {
    throw new Error(
      "`site` must be set in your Astro configuration: https://docs.astro.build/en/reference/configuration-reference/#site",
    );
  }

  let target = url.pathname;

  if (target.endsWith("/")) {
    target = target + `index.${format}`;
  } else {
    target = target + `.${format}`;
  }

  if (target === `/404/index.${format}`) {
    return site.toString() + `404.${format}`;
  }

  if (target === `/500/index.${format}`) {
    return site.toString() + `500.${format}`;
  }

  target = target.slice(1);
  return site.toString() + target;
}
