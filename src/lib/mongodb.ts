import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

interface GlobalMongoose {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  }
}

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as GlobalMongoose).mongoose || { conn: null, promise: null }

if (!cached) {
  cached = ((global as GlobalMongoose).mongoose = { conn: null, promise: null })
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    if (MONGODB_URI) {
      cached.promise = mongoose.connect(MONGODB_URI, opts)
    } else {
      throw new Error('MONGODB_URI is undefined')
    }
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
