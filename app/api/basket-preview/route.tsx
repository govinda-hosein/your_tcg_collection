import { OwnedCard } from "@/database";
import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import { decodeBasketParam } from "@/lib/basket";
import connectDB from "@/lib/mongodb";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || "Your TCG Collection";

function getCardText(count: number): string {
  return `${count} card${count === 1 ? "" : "s"}`;
}

export async function GET(request: NextRequest) {
  const basketParam = request.nextUrl.searchParams.get("basket") ?? "";
  const decoded = decodeBasketParam(basketParam);
  const distinctCards = decoded.length;
  const totalQuantity = decoded.reduce((sum, item) => sum + item.quantity, 0);

  let previewCards: Array<{ name: string; image: string }> = [];

  if (distinctCards > 0) {
    try {
      await connectDB();
      const requestedIds = decoded.map((item) => item.cardId);

      const ownedCards = await OwnedCard.find({ cardId: { $in: requestedIds } })
        .populate({
          path: "card",
          select: "name images",
        })
        .lean<OwnedCardViewModel[]>();

      const cardById = new Map(
        ownedCards.map((card) => [
          card.cardId,
          {
            name: card.card?.name ?? "Unknown Card",
            image: card.card?.images?.large ?? card.card?.images?.small ?? "",
          },
        ]),
      );

      previewCards = decoded
        .map((item) => cardById.get(item.cardId))
        .filter((card): card is { name: string; image: string } =>
          Boolean(card?.image),
        )
        .slice(0, 2);
    } catch (error) {
      console.error("Failed to build basket preview image:", error);
    }
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "44px 52px",
        color: "#1f140d",
        background:
          "linear-gradient(140deg, #f9f2df 0%, #f4d58d 45%, #d86c30 100%)",
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
            "radial-gradient(circle at 10% 5%, rgba(255,255,255,0.5), transparent 30%), radial-gradient(circle at 90% 90%, rgba(63, 29, 14, 0.22), transparent 45%)",
        }}
      />

      <div
        style={{ display: "flex", flexDirection: "column", gap: 12, zIndex: 1 }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: 0.4,
            opacity: 0.9,
          }}
        >
          {siteTitle}
        </div>
        <div style={{ display: "flex", fontSize: 26, opacity: 0.85 }}>
          Shared Basket Preview
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 62,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          {getCardText(distinctCards)}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#4b2a16" }}>
          {totalQuantity} total quantity
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 22,
          alignItems: "stretch",
          zIndex: 1,
        }}
      >
        {previewCards.length > 0 &&
          previewCards.map((card) => (
            <div
              key={card.name}
              style={{
                display: "flex",
                flexDirection: "column",
                width: 220,
                height: 330,
                borderRadius: 18,
                overflow: "hidden",
                border: "3px solid rgba(31, 20, 13, 0.25)",
                boxShadow: "0 16px 35px rgba(0,0,0,0.25)",
                background: "rgba(255,255,255,0.2)",
              }}
            >
              <img
                src={card.image}
                alt={card.name}
                width={220}
                height={330}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
