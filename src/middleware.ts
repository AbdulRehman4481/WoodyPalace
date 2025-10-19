import { withAuth } from 'next-auth/middleware';

export default withAuth(
  {
    callbacks: {
      authorized: ({ token }) => {
        // Check if user is authenticated and is an admin
        if (!token) return false;
        return token.role === 'ADMIN';
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/products/:path*',
    '/orders/:path*',
    '/customers/:path*',
    '/categories/:path*',
    '/analytics/:path*',
    '/api/((?!auth|upload).*)/:path*',
  ],
};
