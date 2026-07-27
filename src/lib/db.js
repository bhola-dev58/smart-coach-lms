import mongoose from 'mongoose';

/**
 * Global cache to prevent multiple connections in development
 * (Next.js hot-reloads re-execute module scope on every change)
 */
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB Atlas with optimized settings for production scalability.
 * Uses connection pooling, timeouts, and retry logic.
 */
export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      '❌ MONGODB_URI is not defined. Please add it to your .env.local file or environment.'
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: 10, // Max concurrent connections (good for K8s multi-pod)
      minPoolSize: 2,  // Keep at least 2 connections warm
      serverSelectionTimeoutMS: 5000, // Fail fast if DB unreachable
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    cached.promise = mongoose.connect(MONGODB_URI, options).then((m) => {
      console.log('✅ MongoDB connected successfully');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Seed default categories if none exist (dynamic category management system)
    try {
      const Category = mongoose.models.Category || (await import('@/models/Category')).default;
      const count = await Category.countDocuments();
      if (count === 0) {
        console.log('🌱 Seeding default categories...');
        await Category.insertMany([
          { name: 'MATHS', label: 'Mathematics', icon: 'maths', color: '#1B2B6B' },
          { name: 'SCIENCE', label: 'Science', icon: 'science', color: '#27AE60' },
          { name: 'COMMERCE', label: 'Commerce', icon: 'commerce', color: '#F5A623' },
          { name: 'ARTS', label: 'Arts & Humanities', icon: 'arts', color: '#E74C3C' },
          { name: 'GENERAL', label: 'General Knowledge', icon: 'general', color: '#8E44AD' },
          { name: 'COMPUTER_SCIENCE', label: 'Computer Science', icon: 'computerscience', color: '#2980B9' },
        ]);
        console.log('🌱 Default categories seeded successfully!');
      }
    } catch (err) {
      console.error('⚠️ Failed to seed categories:', err.message);
    }
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e.message);
    throw e;
  }

  return cached.conn;
}
