import { OwnedCard, PokemonCard, Set } from "@/database";

import { COLLECTR_SET_MAP } from "@/lib/constants";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

const REQUIRED_HEADERS = [
  "Set",
  "Product Name",
  "Card Number",
  "Card Condition",
  "Quantity",
  "Market Price",
] as const;

function parseCsvHeaders(csvText: string): string[] {
  const firstDataLine = csvText
    .split(/\r?\n/)
    .find((line) => line.trim().length > 0);

  if (!firstDataLine) {
    return [];
  }

  return firstDataLine
    .split(",")
    .map((header) => header.trim().replace(/^"|"$/g, ""));
}

function parseCardNumber(value: string): string {
  const normalizedValue = value.trim();
  const firstSegment = normalizedValue.includes("/")
    ? (normalizedValue.split("/")[0] ?? "")
    : normalizedValue;
  const cleanedFirstSegment = firstSegment.trim();

  if (/[A-Za-z]/.test(cleanedFirstSegment)) {
    return cleanedFirstSegment;
  }

  const numericPart = cleanedFirstSegment.match(/\d+/)?.[0] ?? "";

  if (!numericPart) {
    return "";
  }

  return numericPart.replace(/^0+/, "") || "0";
}

function parseQuantity(value: string): number {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function parsePrice(value: string): number {
  const normalized = value.replace(/[$,\s]/g, "").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const deleteAllInventoryFirst =
      String(formData.get("deleteAllInventoryFirst") ?? "false") === "true";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "CSV file is required" },
        { status: 400 },
      );
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are supported" },
        { status: 400 },
      );
    }

    const csvText = await file.text();
    const headers = parseCsvHeaders(csvText);

    if (headers.length === 0) {
      return NextResponse.json(
        { error: "Could not read CSV headers from file" },
        { status: 400 },
      );
    }

    const missingHeaders = REQUIRED_HEADERS.filter(
      (required) => !headers.includes(required),
    );

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          error: `CSV is missing required columns: ${missingHeaders.join(", ")}`,
          missingHeaders,
        },
        { status: 400 },
      );
    }

    const nonEmptyLines = csvText
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);
    const dataRows = nonEmptyLines.slice(1);
    const setColumnIndex = headers.indexOf("Set");
    const productNameColumnIndex = headers.indexOf("Product Name");
    const cardNumberColumnIndex = headers.indexOf("Card Number");
    const cardConditionColumnIndex = headers.indexOf("Card Condition");
    const quantityColumnIndex = headers.indexOf("Quantity");
    const marketPriceColumnIndex = headers.indexOf("Market Price");
    const unmatchedRows: Array<{
      rowNumber: number;
      set: string;
      productName: string;
      cardNumber: string;
      cardId: string;
      row: string[];
    }> = [];
    let addedCount = 0;

    await connectDB();

    if (deleteAllInventoryFirst) {
      await OwnedCard.deleteMany({});
    }

    for (const [index, rowText] of dataRows.entries()) {
      const row = rowText
        .split(",")
        .map((cell) => cell.trim().replace(/^"|"$/g, ""));
      const setValue = row[setColumnIndex] ?? "";
      const productNameValue = row[productNameColumnIndex] ?? "";
      const cardNumberValue = row[cardNumberColumnIndex] ?? "";
      const cardConditionValue =
        row[cardConditionColumnIndex]?.trim() || "Mint";
      const quantityValue = parseQuantity(row[quantityColumnIndex] ?? "");
      const marketPriceValue = parsePrice(row[marketPriceColumnIndex] ?? "");
      const cardNumberFirstPart = parseCardNumber(cardNumberValue);
      const mappedSetName = COLLECTR_SET_MAP[setValue] ?? setValue;
      const matchingSet = await Set.findOne({ name: mappedSetName })
        .select({ _id: 0, id: 1 })
        .lean();
      const cardId = `${matchingSet?.id ?? null}-${cardNumberFirstPart}`;
      const matchingPokemonCard = await PokemonCard.findOne({ id: cardId })
        .select({ _id: 0, id: 1, name: 1, number: 1, setId: 1 })
        .lean();

      if (!matchingPokemonCard) {
        unmatchedRows.push({
          rowNumber: index + 2,
          set: setValue,
          productName: productNameValue,
          cardNumber: cardNumberValue,
          cardId,
          row,
        });
      }

      if (matchingSet && matchingPokemonCard) {
        await OwnedCard.findOneAndUpdate(
          { cardId },
          {
            $inc: {
              quantity: quantityValue,
            },
            $set: {
              price: marketPriceValue,
              cardCondition: cardConditionValue,
            },
          },
          {
            upsert: true,
            returnDocument: "after",
            setDefaultsOnInsert: true,
          },
        );
        addedCount += 1;
      }
    }

    return NextResponse.json({ addedCount, unmatchedRows }, { status: 200 });
  } catch (error) {
    console.error("Failed to import Collectr CSV:", error);
    return NextResponse.json(
      { error: "Failed to process CSV file" },
      { status: 500 },
    );
  }
}
