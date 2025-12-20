import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUserFromToken } from '@/lib/auth';
import {
  createForbiddenError,
  createBadRequestError,
  createNotFoundError,
  createServerError,
} from '@/lib/errors';

const isAdmin = (user: any) => user.email === 'clintonochieng072@gmail.com';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = await getUserFromToken();
    if (!user || !isAdmin(user)) {
      return createForbiddenError('Access denied. Admin only.');
    }

    const body = await request.json();
    const { action } = body;

    if (!['disable', 'reactivate', 'update_status'].includes(action)) {
      return createBadRequestError('Invalid action');
    }

    await dbConnect();

    const { userId } = await params;
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return createNotFoundError('User not found');
    }

    switch (action) {
      case 'disable':
        targetUser.isLocked = true;
        targetUser.status = 'disabled';
        break;
      case 'reactivate':
        targetUser.isLocked = false;
        targetUser.status = 'active';
        break;
      case 'update_status':
        if (body.status) {
          targetUser.status = body.status;
        }
        break;
    }

    await targetUser.save();

    return NextResponse.json({
      success: true,
      user: {
        id: targetUser._id,
        username: targetUser.username,
        email: targetUser.email,
        isLocked: targetUser.isLocked,
        status: targetUser.status,
      },
    });
  } catch (err) {
    console.error('User management error:', err);
    return createServerError('Error updating user');
  }
}