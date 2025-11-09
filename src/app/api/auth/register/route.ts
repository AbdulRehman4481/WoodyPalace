import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { createAdminUserSchema } from '@/lib/validations';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = createAdminUserSchema.parse(body);

    // Check if email already exists
    const existingUser = await db.adminUser.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return createValidationErrorResponse({
        email: ['Email already exists'],
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Create admin user
    const user = await db.adminUser.create({
      data: {
        email: validatedData.email,
        passwordHash,
        name: validatedData.name,
        role: validatedData.role || 'ADMIN',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return createSuccessResponse(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      'Account created successfully'
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any;
      const fieldErrors: Record<string, string[]> = {};
      
      zodError.errors?.forEach((err: any) => {
        const field = err.path[0] || 'general';
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(err.message);
      });

      return createValidationErrorResponse(fieldErrors);
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create account',
      500
    );
  }
}

