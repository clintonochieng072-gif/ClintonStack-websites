import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUserFromToken } from '@/lib/auth';

const isAdmin = (user: any) => user.email === 'clintonochieng072@gmail.com';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '10');

    await dbConnect();

    // If email is provided, search for specific user
    if (email) {
      const foundUser = await User.findOne({ email: email.toLowerCase() })
        .select('username email has_paid is_first_login isLocked status createdAt lastLogin')
        .lean();

      if (!foundUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        user: {
          id: foundUser._id,
          name: foundUser.username,
          email: foundUser.email,
          has_paid: foundUser.has_paid,
          is_first_login: foundUser.is_first_login,
          isLocked: foundUser.isLocked,
          status: foundUser.status,
          createdAt: foundUser.createdAt,
          lastLogin: foundUser.lastLogin,
        },
      });
    }

    // If no email, return paginated list of all users
    const skip = (page - 1) * size;

    const totalUsers = await User.countDocuments();
    const users = await User.find({})
      .select('username email has_paid is_first_login isLocked status createdAt lastLogin')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean();

    return NextResponse.json({
      users: users.map(user => ({
        id: user._id,
        name: user.username,
        email: user.email,
        has_paid: user.has_paid,
        is_first_login: user.is_first_login,
        isLocked: user.isLocked,
        status: user.status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      })),
      pagination: {
        page,
        size,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / size),
      },
    });
  } catch (err) {
    console.error('Search user error:', err);
    return NextResponse.json({ error: 'Error searching user' }, { status: 500 });
  }
}