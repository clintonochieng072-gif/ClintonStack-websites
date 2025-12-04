import Category from "@/lib/models/Category";
import { connectDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  await connectDb();
  const categories = await Category.find().sort({ createdAt: -1 });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  await connectDb();
  const user = await getUserFromToken();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name)
    return NextResponse.json({ error: "Name required" }, { status: 400 });

  const category = await Category.create({ name });
  return NextResponse.json(category);
}

export async function DELETE(req: Request) {
  await connectDb();
  const user = await getUserFromToken();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await Category.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
