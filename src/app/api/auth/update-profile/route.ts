import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUserFromToken } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validations';
import {
  createAuthError,
  createValidationError,
  createNotFoundError,
  createServerError,
} from '@/lib/errors';

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const currentUser = await getUserFromToken();
    if (!currentUser) {
      return createAuthError('Unauthorized');
    }

    const body = await req.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return createValidationError(
        validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      );
    }

    const { category, niche, template, onboarded, avatarUrl, trialEndsAt } = validation.data;

    const updateData: any = {};
    if (category !== undefined) updateData.category = category;
    if (niche !== undefined) updateData.niche = niche;
    if (template !== undefined) updateData.template = template;
    if (onboarded !== undefined) updateData.onboarded = onboarded;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (trialEndsAt !== undefined) updateData.trialEndsAt = new Date(trialEndsAt);

    const updatedUser = await User.findByIdAndUpdate(
      currentUser.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return createNotFoundError('User not found');
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        category: updatedUser.category,
        niche: updatedUser.niche,
        template: updatedUser.template,
        onboarded: updatedUser.onboarded === true,
        avatarUrl: updatedUser.avatarUrl,
        trialEndsAt: (updatedUser as any).trialEndsAt,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return createServerError('Internal server error');
  }
}