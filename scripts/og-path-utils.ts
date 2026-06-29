const FORMAT = "png";

export function pagePathToOgPngPath(pathname: string, format = FORMAT): string {
  if (pathname === "/404/" || pathname === "/404") {
    return `/404.${format}`;
  }

  if (pathname === "/500/" || pathname === "/500") {
    return `/500.${format}`;
  }

  if (pathname.endsWith("/")) {
    return `${pathname}index.${format}`;
  }

  return `${pathname}.${format}`;
}

export function ogPngPathToPagePath(pngPath: string, format = FORMAT): string | null {
  if (!pngPath.endsWith(`.${format}`)) {
    return null;
  }

  if (pngPath.startsWith("/_") || pngPath.includes("/_astro/")) {
    return null;
  }

  const assetName = pngPath.slice(1);
  if (assetName === `404.${format}` || assetName === `500.${format}`) {
    return null;
  }

  if (assetName === `index.${format}`) {
    return "/";
  }

  if (assetName.endsWith(`/index.${format}`)) {
    return `/${assetName.slice(0, -(`/index.${format}`).length)}/`;
  }

  if (assetName.endsWith(`.${format}`)) {
    return `/${assetName.slice(0, -`.${format}`.length)}`;
  }

  return null;
}
