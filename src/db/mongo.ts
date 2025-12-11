import mongoose from "mongoose";

// MongoDB connection for document storage
export async function connectMongo() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return; // Already connected
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function disconnectMongo() {
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

// Export mongoose for use in models
export { mongoose };
