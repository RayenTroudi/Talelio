"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Wraps pages that require authentication
 * 
 * Usage:
 * <ProtectedRoute>
 *   <YourPage />
 * </ProtectedRoute>
 * 
 * For admin-only pages:
 * <ProtectedRoute requireAdmin>
 *   <AdminPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  redirectTo 
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated -> redirect to signin
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/SignIn?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Authenticated but not admin, and admin required -> redirect to account
    if (requireAdmin && !isAdmin) {
      router.push(redirectTo || '/account');
      return;
    }
  }, [isAuthenticated, isAdmin, isLoading, requireAdmin, redirectTo, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gold-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Admin required but user is not admin
  if (requireAdmin && !isAdmin) {
    return null;
  }

  // All checks passed, render children
  return <>{children}</>;
}
