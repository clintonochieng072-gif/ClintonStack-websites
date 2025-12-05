import mongoose from "mongoose";

// Skip database connection during build time
const isBuildTime =
  process.env.NODE_ENV === "production" && !process.env.VERCEL;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const isDummyUri = MONGODB_URI === "mongodb://dummy";

  // Return mock connection during build time or with dummy URI
  if (isBuildTime || isDummyUri) {
    return { connection: { readyState: 1 } }; // Mock connection
  }

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  // For Vercel serverless functions, don't cache connections across function calls
  if (process.env.VERCEL) {
    try {
      const conn = await mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 1, // Limit connection pool for serverless
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      });
      return conn;
    } catch (e) {
      console.error('MongoDB connection error in Vercel:', e);
      throw e;
    }
  }

  // Traditional caching for development/local
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
