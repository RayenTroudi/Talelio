import { signOut } from 'next-auth/react';
import { account } from './appwrite-config';
import Cookies from 'js-cookie';

/**
 * Unified logout function that:
 * 1. Deletes Appwrite session
 * 2. Signs out from NextAuth
 * 3. Clears cart from cookies
 * 4. Redirects to home page
 * 
 * This ensures complete cleanup across all authentication layers
 */
export async function logout() {
  try {
    // Step 1: Delete Appwrite session (if exists)
    try {
      await account.deleteSession('current');
      console.log('✓ Appwrite session deleted');
    } catch (error: any) {
      // Session might not exist or already deleted
      if (error.code !== 401) {
        console.warn('Appwrite session deletion warning:', error.message);
      }
    }

    // Step 2: Clear cart from cookies
    try {
      Cookies.remove('cart');
      console.log('✓ Cart cleared');
    } catch (error) {
      console.warn('Cart clear warning:', error);
    }

    // Step 3: Sign out from NextAuth and redirect
    // This also clears the NextAuth session cookie
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    });

    console.log('✓ Logout complete');
  } catch (error) {
    console.error('Logout error:', error);
    
    // Fallback: Force sign out and redirect even if errors occurred
    try {
      await signOut({ callbackUrl: '/', redirect: true });
    } catch (fallbackError) {
      // Last resort: Manual redirect
      window.location.href = '/';
    }
  }
}

/**
 * Check if user is authenticated (has valid session)
 */
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const user = await account.get();
    return !!user;
  } catch (error) {
    return false;
  }
}
