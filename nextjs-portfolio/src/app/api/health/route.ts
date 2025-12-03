import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'Next.js API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    jwtSecretLoaded: !!process.env.JWT_SECRET,
    cloudinaryConfigured: !!process.env.CLOUDINARY_CLOUD_NAME,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
}