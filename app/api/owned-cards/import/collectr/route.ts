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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

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

    console.log("Collectr CSV headers:", headers);

    return NextResponse.json({ headers }, { status: 200 });
  } catch (error) {
    console.error("Failed to import Collectr CSV:", error);
    return NextResponse.json(
      { error: "Failed to process CSV file" },
      { status: 500 },
    );
  }
}
