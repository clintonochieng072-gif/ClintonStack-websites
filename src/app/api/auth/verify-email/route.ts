import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { createBadRequestError, createNotFoundError } from '@/lib/errors';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return createBadRequestError('Verification token is required');
    }

    await dbConnect();

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== 'email_verification') {
      return createBadRequestError('Invalid token type');
    }

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return createNotFoundError('User not found');
    }

    if (user.email !== decoded.email) {
      return createBadRequestError('Email mismatch');
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' });
    }

    // Update user
    user.emailVerified = true;
    await user.save();

    // Redirect to login or dashboard
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('message', 'Email verified successfully. Please login.');

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Email verification error:', error);
    return createBadRequestError('Invalid or expired token');
  }
}