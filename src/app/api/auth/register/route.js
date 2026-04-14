import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, phone, college, branch, year } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      college: college || '',
      branch: branch || 'CSE',
      year: parseInt(year) || 1,
      role: 'student', // Default role for new signups
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create account. Please try again.' }, { status: 500 });
  }
}
