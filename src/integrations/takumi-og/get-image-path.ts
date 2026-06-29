export function getImagePath({
  url,
  site,
  format = "png",
}: {
  url: URL;
  site: URL | string | undefined;
  format?: string;
}): string {
  const base = import.meta.env.DEV ? url.origin : String(site);

  if (!base) {
    throw new Error(
      "`site` must be set in your Astro configuration: https://docs.astro.build/en/reference/configuration-reference/#site",
    );
  }

  const imagePath = url.pathname.endsWith("/")
    ? `${url.pathname}index.${format}`
    : `${url.pathname}.${format}`;

  if (imagePath === `/404/index.${format}`) {
    return new URL(`404.${format}`, base).href;
  }

  if (imagePath === `/500/index.${format}`) {
    return new URL(`500.${format}`, base).href;
  }

  return new URL(imagePath, base).href;
}
