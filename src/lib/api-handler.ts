import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { createUnauthorizedResponse, createErrorResponse } from './api-response';

export type ApiHandler = (
  req: NextRequest,
  context: { params: any }
) => Promise<NextResponse>;

export function withAuth(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context: { params: any }) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return createUnauthorizedResponse();
      }

      return await handler(req, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return createErrorResponse('Authentication failed');
    }
  };
}

export function withAdminAuth(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context: { params: any }) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return createUnauthorizedResponse();
      }

      if (session.user.role !== 'ADMIN') {
        return createErrorResponse('Admin access required', 403);
      }

      return await handler(req, context);
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      return createErrorResponse('Authentication failed');
    }
  };
}

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context: { params: any }) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('API handler error:', error);
      
      if (error instanceof Error) {
        return createErrorResponse(error.message);
      }
      
      return createErrorResponse('Internal server error');
    }
  };
}
