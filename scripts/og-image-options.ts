import fs from "node:fs";

export const ogImageOptions = {
  fonts: [
    {
      name: "Inter",
      weight: 400,
      style: "normal",
      data: fs.readFileSync("node_modules/@fontsource/inter/files/inter-latin-400-normal.woff"),
    },
    {
      name: "Inter",
      weight: 700,
      style: "normal",
      data: fs.readFileSync("node_modules/@fontsource/inter/files/inter-latin-700-normal.woff"),
    },
    {
      name: "Bricolage Grotesque",
      weight: 800,
      style: "normal",
      data: fs.readFileSync(
        "node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff",
      ),
    },
  ],
  width: 1200,
  height: 630,
  format: "png" as const,
  drawDebugBorder: false,
  verbose: false,
};
