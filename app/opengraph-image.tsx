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
      </div>
    </div>,
    size,
  );
}
