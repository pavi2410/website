import type { RenderFunctionInput } from "@/integrations/takumi-og";

export async function blogOgImage(input: RenderFunctionInput): Promise<React.ReactNode> {
  const { title, description, document } = input;

  const publishDateMeta = document.querySelector('meta[property="article:published_time"]')?.getAttribute("content");
  const publishDate = publishDateMeta
    ? new Date(publishDateMeta).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "";

  const tagElements = document.querySelectorAll('a[href*="/blog/tag/"]');
  const tags = Array.from(tagElements).map(el => el.textContent?.trim() || "").filter(Boolean);

  const tagColors: Record<string, { bg: string; text: string }> = {
    css: { bg: "#4ade80", text: "#000000" },
    web: { bg: "#22d3ee", text: "#000000" },
    performance: { bg: "#fb7185", text: "#000000" },
    "syntax-highlighting": { bg: "#f472b6", text: "#000000" },
  };

  const getTagColor = (tag: string) => {
    return tagColors[tag] || { bg: "#e5e5e5", text: "#404040" };
  };

  const normalizeTag = (tag: string) => tag.replace(/^#/, "");
  const isArticle = Boolean(publishDate || tags.length > 0);

  const titleLength = title.length;
  const titleFontSize =
    titleLength > 120 ? "36px" : titleLength > 90 ? "42px" : titleLength > 60 ? "48px" : isArticle ? "52px" : "48px";

  const contentHeavy = titleLength > 110 || tags.length > 9;
  const tagFontSize = tags.length > 6 ? "20px" : tags.length > 4 ? "22px" : "24px";
  const tagPadding = tags.length > 6 ? "7px 14px" : "8px 16px";

  return Promise.resolve(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#fafafa",
        color: "#0a0a0a",
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          width: "6px",
          flexShrink: 0,
          backgroundColor: "#6366f1",
        }}
      />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: contentHeavy ? "flex-start" : "center",
          padding: contentHeavy ? "36px 44px 32px" : "40px 44px",
          gap: "24px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h1
            style={{
              fontSize: titleFontSize,
              fontWeight: 800,
              lineHeight: "1.12",
              margin: "0",
              fontFamily: "Bricolage Grotesque",
            }}
          >
            {title}
          </h1>

          {!isArticle && description && (
            <p
              style={{
                fontSize: "26px",
                lineHeight: "1.35",
                color: "#525252",
                margin: "0",
              }}
            >
              {description}
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tags.length > 0 ? "14px" : "0",
            borderTop: "2px solid #e5e5e5",
            paddingTop: "20px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
              fontSize: "28px",
              lineHeight: "1.2",
            }}
          >
            <span
              style={{
                textDecoration: "underline",
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
                  gap: "8px",
                  fontSize: "28px",
                }}
              >
                <span style={{ color: "#737373" }}>•</span>
                <span style={{ color: "#737373" }}>{publishDate}</span>
              </div>
            )}
          </div>

          {tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                alignContent: "flex-start",
              }}
            >
              {tags.map((tag: string) => {
                const normalizedTag = normalizeTag(tag);
                const colors = getTagColor(normalizedTag);
                return (
                  <div
                    key={tag}
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      padding: tagPadding,
                      borderRadius: "9999px",
                      fontSize: tagFontSize,
                      fontWeight: "600",
                      lineHeight: "1",
                    }}
                  >
                    {normalizedTag}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
