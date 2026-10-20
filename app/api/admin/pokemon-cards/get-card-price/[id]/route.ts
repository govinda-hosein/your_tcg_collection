import { TCG_DATA_TO_TCG_DEX_SET_MAP, USD_TO_TTD } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

import { tcgdex } from "@/lib/tcgdex";

// The SDK's typings don't declare `pricing` on cards, but the API returns it.
type TcgplayerVariantPrice = { marketPrice?: number };

type CardPricing = {
  tcgplayer?: {
    normal?: TcgplayerVariantPrice;
    holofoil?: TcgplayerVariantPrice;
  };
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Split on the last "-" so custom set ids that contain hyphens still work.
  const separatorIndex = id.lastIndexOf("-");
  if (separatorIndex <= 0 || separatorIndex === id.length - 1) {
    return NextResponse.json(
      { error: "id must be in the form <setId>-<number>" },
      { status: 400 },
    );
  }

  // Build TCGdex card ID.
  const setId = id.slice(0, separatorIndex);
  const rawNumber = id.slice(separatorIndex + 1);
  const number = /^\d+$/.test(rawNumber)
    ? rawNumber.padStart(3, "0")
    : rawNumber;
  const tcgDexSetId = TCG_DATA_TO_TCG_DEX_SET_MAP[setId] ?? setId;
  const tcgDexCardId = tcgDexSetId + "-" + number;

  // Fetch card from TCGdex.
  const card = await tcgdex.card.get(tcgDexCardId);
  if (!card) {
    return NextResponse.json(
      { error: `Card not found in TCGdex: ${tcgDexCardId}` },
      { status: 404 },
    );
  }

  // Determine pricing
  const pricing = (card as { pricing?: CardPricing }).pricing;
  const marketPrice =
    pricing?.tcgplayer?.normal?.marketPrice ??
    pricing?.tcgplayer?.holofoil?.marketPrice;
  if (typeof marketPrice !== "number") {
    return NextResponse.json(
      { error: `No TCGplayer market price found for card: ${tcgDexCardId}` },
      { status: 404 },
    );
  }

  const marketPriceTTD = Math.ceil(marketPrice * USD_TO_TTD);

  return NextResponse.json({
    marketPriceTTD,
  });
}
