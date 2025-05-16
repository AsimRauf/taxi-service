import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  console.error('❌ No MongoDB URI found in environment variables');
  console.error('Current environment variables:', process.env);
  throw new Error(
    'Please define the MONGODB_URI environment variable. ' +
    'Make sure your .env file is in the correct location and contains MONGODB_URI.'
  );
}

const MONGODB_URI = process.env.MONGODB_URI;

let cachedConnection: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cachedConnection) {
    console.log('📊 Using cached database connection');
    return cachedConnection;
  }

  console.log('🔄 Connecting to MongoDB...');
  
  try {
    const opts = {
      bufferCommands: false,
    };

    const connection = await mongoose.connect(MONGODB_URI, opts);
    console.log('✅ Connected to MongoDB');
    
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}
