import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const title = process.env.NEXT_PUBLIC_SITE_TITLE || "Your TCG Collection";
const description =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  "Track and explore your trading card collection";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        background:
          "linear-gradient(135deg, #f7f0d8 0%, #f3dd9f 42%, #d96f32 100%)",
        color: "#26170c",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.45), transparent 40%), radial-gradient(circle at bottom right, rgba(94, 45, 18, 0.18), transparent 35%)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          padding: "56px 64px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#6b3b1e",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(255,255,255,0.55)",
              border: "2px solid rgba(107, 59, 30, 0.16)",
              fontSize: 30,
            }}
          >
            T
          </div>
          Trading Card Collection
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 78,
              lineHeight: 0.95,
              fontWeight: 800,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              lineHeight: 1.25,
              color: "#4c2d17",
              maxWidth: 860,
            }}
          >
            {description}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {[
            "Track owned cards",
            "Filter by rarity",
            "Search your collection",
          ].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 20px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.58)",
                border: "2px solid rgba(107, 59, 30, 0.14)",
                fontSize: 24,
                color: "#6b3b1e",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>,
    size,
  );
}
