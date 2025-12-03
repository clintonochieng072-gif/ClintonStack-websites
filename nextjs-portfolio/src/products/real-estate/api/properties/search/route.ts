import { NextResponse } from "next/server";

// Mock data since no Property model exists yet
const mockProperties: any[] = [];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const minPriceStr = searchParams.get("minPrice") || "0";

  let results = mockProperties;

  if (keyword) {
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(keyword.toLowerCase()) ||
        p.location.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  if (category) {
    results = results.filter((p) => p.category === category);
  }

  const minPrice = parseFloat(minPriceStr.replace(/[$,]/g, ""));
  if (minPrice > 0) {
    results = results.filter((p) => {
      const price = parseFloat(p.price.replace(/[$,]/g, ""));
      return price >= minPrice;
    });
  }

  return NextResponse.json(results);
}
