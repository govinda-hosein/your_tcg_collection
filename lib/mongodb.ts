import mongoose from "mongoose";

/**
 * MongoDB Connection Module
 *
 * This module manages a cached MongoDB connection using Mongoose.
 * Connection caching prevents multiple connections during Next.js development
 * hot-reloads and optimizes performance in serverless environments.
 */

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Validate that the MongoDB URI is defined
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

/**
 * Type definition for the cached MongoDB connection
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Extend the global type to include our mongoose cache
 * This prevents TypeScript errors when accessing global.mongoose
 */
declare global {
  var mongoose: MongooseCache | undefined;
}

/**
 * Global cache for the MongoDB connection
 * In development, Next.js hot-reloads can create multiple connections.
 * Using a global variable ensures the connection is preserved across hot-reloads.
 */
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes and returns a cached MongoDB connection
 *
 * @returns {Promise<typeof mongoose>} A promise that resolves to the Mongoose instance
 *
 * @example
 * ```typescript
 * import connectDB from '@/lib/mongodb';
 *
 * async function handler() {
 *   await connectDB();
 *   // Now you can use Mongoose models
 * }
 * ```
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return the existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no existing promise, create a new connection
  if (!cached.promise) {
    const options = {
      bufferCommands: false, // Disable Mongoose buffering
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      serverSelectionTimeoutMS: 10000, // Timeout for selecting a server
    };

    // Create the connection promise
    cached.promise = mongoose
      .connect(MONGODB_URI as string, options)
      .then((mongooseInstance) => {
        console.log("✅ MongoDB connected successfully");
        return mongooseInstance;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error);
        // Reset the promise on error so the next call will retry
        cached.promise = null;
        throw error;
      });
  }

  try {
    // Wait for the connection to be established
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise if connection fails
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
