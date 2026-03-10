import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

/**
 * AUTH OPTIONS - Import from your NextAuth route
 * Note: This should be the same authOptions used in your [...nextauth]/route.ts
 * For now, we'll use getServerSession with no options and rely on env vars
 */

/**
 * Server-side authentication utility
 * Gets the current session server-side (for server components and API routes)
 * 
 * @returns Session object or null if not authenticated
 */
export async function getServerAuth() {
  try {
    const session = await getServerSession();
    return session;
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

/**
 * Require authentication for server components
 * Redirects to /SignIn if not authenticated
 * 
 * @param redirectPath - Optional path to redirect to after login
 * @returns Session object
 */
export async function requireAuth(redirectPath?: string) {
  const session = await getServerAuth();
  
  if (!session || !session.user) {
    const params = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
    redirect(`/SignIn${params}`);
  }
  
  return session;
}

/**
 * Require admin role for server components
 * Redirects to /account if not admin, /SignIn if not authenticated
 * 
 * @param redirectPath - Optional path to redirect to after login
 * @returns Session object with admin user
 */
export async function requireAdmin(redirectPath?: string) {
  const session = await requireAuth(redirectPath);
  
  // Check if user has admin role
  if (session.user.role !== 'admin') {
    console.warn('⚠️ Non-admin user attempted to access admin resource');
    redirect('/account');
  }
  
  return session;
}

/**
 * Require user role for server components
 * Redirects to /admin if user is admin, /SignIn if not authenticated
 * 
 * @param redirectPath - Optional path to redirect to after login
 * @returns Session object with regular user
 */
export async function requireUser(redirectPath?: string) {
  const session = await requireAuth(redirectPath);
  
  // If user is admin, redirect to admin dashboard
  if (session.user.role === 'admin') {
    redirect('/admin');
  }
  
  return session;
}

/**
 * Check if current user is admin (without redirecting)
 * 
 * @returns boolean - true if admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerAuth();
  return session?.user?.role === 'admin';
}

/**
 * Check if current user is authenticated (without redirecting)
 * 
 * @returns boolean - true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerAuth();
  return !!session?.user;
}
