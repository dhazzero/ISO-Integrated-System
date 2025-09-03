import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, UserRole } from '@/lib/types';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const users = await db.collection<User>('users').find({}, {
      projection: { password: 0 }
    }).toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'Gagal mengambil data pengguna' }, { status: 500 });
  }
}

const userSchema = z.object({
  name: z.string().min(1, { message: "Nama diperlukan" }),
  userId: z.string().min(1, { message: "User ID diperlukan" }),
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  role: z.nativeEnum(UserRole),
  departmentId: z.string().optional().nullable(),
  supervisorId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const validation = userSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid", errors: validation.error.errors }, { status: 400 });
    }

    const { name, userId, email, password, role, departmentId, supervisorId } = validation.data;

    // Cek duplikasi
    const existingUser = await db.collection('users').findOne({ $or: [{ userId }, { email }] });
    if (existingUser) {
      return NextResponse.json({ message: 'User ID atau email sudah digunakan' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: Omit<User, '_id'> = {
      name,
      userId,
      email,
      password: hashedPassword,
      role,
      departmentId: departmentId ? new ObjectId(departmentId) : null,
      supervisorId: supervisorId ? new ObjectId(supervisorId) : null,
      status: 'active', // Default status
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);

    // Mengambil kembali user yang baru dibuat tanpa password untuk dikembalikan
    const createdUser = await db.collection('users').findOne({ _id: result.insertedId }, {
      projection: { password: 0 }
    });

    return NextResponse.json(createdUser, { status: 201 });

  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ message: 'Gagal membuat pengguna baru' }, { status: 500 });
  }
}
