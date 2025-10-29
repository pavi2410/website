import type { RenderFunctionInput } from "astro-opengraph-images";

export async function blogOgImage(input: RenderFunctionInput): Promise<React.ReactNode> {
  const { title, description, document } = input;

  // Extract metadata from the page's meta tags
  const publishDateMeta = document.querySelector('meta[property="article:published_time"]')?.getAttribute("content");
  const publishDate = publishDateMeta
    ? new Date(publishDateMeta).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "";

  // Extract tags from the page - look for tag links in the page
  const tagElements = document.querySelectorAll('a[href*="/blog/tag/"]');
  const tags = Array.from(tagElements).map(el => el.textContent?.trim() || "").filter(Boolean);

  // Tag color mapping based on the image
  const tagColors: Record<string, { bg: string; text: string }> = {
    css: { bg: "#4ade80", text: "#000000" },
    web: { bg: "#22d3ee", text: "#000000" },
    performance: { bg: "#fb7185", text: "#000000" },
    "syntax-highlighting": { bg: "#f472b6", text: "#000000" },
  };

  const getTagColor = (tag: string) => {
    return tagColors[tag] || { bg: "#a3a3a3", text: "#000000" };
  };

  return Promise.resolve(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        padding: "48px",
        fontFamily: "Inter",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: "72px",
          fontWeight: 800,
          lineHeight: "1.1",
          margin: "0",
          marginBottom: "auto",
          fontFamily: "Bricolage Grotesque",
        }}
      >
        {title}
      </h1>

      {/* Bottom section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Author and date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "28px",
          }}
        >
          <span
            style={{
              textDecoration: "underline",
              textDecorationStyle: "wavy",
              textDecorationColor: "#6366f1",
              textDecorationThickness: "2px",
            }}
          >
            Pavitra Golchha
          </span>
          {publishDate && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "28px",
              }}
            >
              <span style={{ opacity: 0.7 }}>•</span>
              <span style={{ opacity: 0.7 }}>Published on {publishDate}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: "600",
                opacity: 0.5,
                letterSpacing: "0.05em",
              }}
            >
              TAGS
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {tags.map((tag: string) => {
                const colors = getTagColor(tag);
                return (
                  <div
                    key={tag}
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "24px",
                      fontWeight: "400",
                    }}
                  >
                    {tag}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
