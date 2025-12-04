import mongoose from "mongoose";

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    return Response.json({
      status: "connected",
      message: "MongoDB connection successful",
    });
  } catch (err: any) {
    return Response.json({
      status: "error",
      message: err.message,
    });
  }
}
