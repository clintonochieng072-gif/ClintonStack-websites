import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Property from "@/lib/models/Property";

export async function GET(req: Request) {
  await connectDb();

  try {
    const { searchParams } = new URL(req.url);

    const keyword = searchParams.get("keyword") || "";
    const category = searchParams.get("category") || "";
    const minPriceStr = searchParams.get("minPrice") || "";
    const maxPriceStr = searchParams.get("maxPrice") || "";
    const propertyType = searchParams.get("propertyType") || "";
    const location = searchParams.get("location") || "";
    const bedrooms = searchParams.get("bedrooms") || "";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    const query: any = {
      isPublished: true, // Only show published properties
    };

    // Text search on title, description, and location
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Property type filter
    if (propertyType) {
      query.propertyType = propertyType;
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Bedrooms filter
    if (bedrooms) {
      const bedroomCount = parseInt(bedrooms);
      if (!isNaN(bedroomCount)) {
        query.bedrooms = bedroomCount;
      }
    }

    // Price range filter
    if (minPriceStr || maxPriceStr) {
      query.price = {};
      if (minPriceStr) {
        const minPrice = parseFloat(minPriceStr.replace(/[$,]/g, ""));
        if (!isNaN(minPrice)) {
          query.price.$gte = minPrice;
        }
      }
      if (maxPriceStr) {
        const maxPrice = parseFloat(maxPriceStr.replace(/[$,]/g, ""));
        if (!isNaN(maxPrice)) {
          query.price.$lte = maxPrice;
        }
      }
    }

    // Execute query with pagination
    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate("userId", "name username")
      .populate("siteId", "name slug")
      .lean();

    // Get total count for pagination
    const total = await Property.countDocuments(query);

    return NextResponse.json({
      properties,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Properties search error:", error);
    return NextResponse.json(
      { error: "Failed to search properties" },
      { status: 500 }
    );
  }
}
