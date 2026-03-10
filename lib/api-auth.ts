import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * API Route Authentication Helper
 * Validates authentication and role for API routes
 */

export interface AuthResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId?: string;
  email?: string;
  role?: 'admin' | 'user';
}

/**
 * Get authentication info from API request
 * 
 * @param request - NextRequest object
 * @returns AuthResult with user authentication details
 */
export async function getApiAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.id) {
      return {
        isAuthenticated: false,
        isAdmin: false,
      };
    }

    return {
      isAuthenticated: true,
      isAdmin: token.role === 'admin',
      userId: token.id as string,
      email: token.email as string,
      role: token.role as 'admin' | 'user',
    };
  } catch (error) {
    console.error('Error getting API auth:', error);
    return {
      isAuthenticated: false,
      isAdmin: false,
    };
  }
}

/**
 * Require authentication for API routes
 * Returns 401 if not authenticated
 * 
 * @param request - NextRequest object
 * @returns AuthResult or NextResponse with error
 */
export async function requireApiAuth(request: NextRequest): Promise<AuthResult | NextResponse> {
  const auth = await getApiAuth(request);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    );
  }

  return auth;
}

/**
 * Require admin role for API routes
 * Returns 401 if not authenticated, 403 if not admin
 * 
 * @param request - NextRequest object
 * @returns AuthResult or NextResponse with error
 */
export async function requireApiAdmin(request: NextRequest): Promise<AuthResult | NextResponse> {
  const authResult = await requireApiAuth(request);

  // If requireApiAuth returned an error response, return it
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // Check if user is admin
  if (!authResult.isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden. Admin access required.' },
      { status: 403 }
    );
  }

  return authResult;
}

/**
 * Helper to check if auth result is an error response
 * 
 * @param result - AuthResult or NextResponse
 * @returns boolean - true if error response, false if valid auth
 */
export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
