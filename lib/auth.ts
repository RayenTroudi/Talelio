import { account, getServerClient } from './appwrite-config';
import { Models } from 'appwrite';

/**
 * User role type definition
 */
export type UserRole = 'admin' | 'user';

/**
 * Creates an email/password session using Appwrite
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise with session and user data (including labels)
 * @throws Error if login fails
 */
export async function login(email: string, password: string): Promise<{ session: Models.Session, user: Models.User<Models.Preferences> }> {
  try {
    // Check if we're on the server or client
    const isServer = typeof window === 'undefined';
    
    if (isServer) {
      // Server-side login using node-appwrite
      const { Client: ServerClient, Account: ServerAccount, Users } = await import('node-appwrite');
      
      const client = new ServerClient()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
      
      const serverAccount = new ServerAccount(client);
      
      // Create session
      const session = await serverAccount.createEmailPasswordSession(email, password);
      
      console.log('✅ Login successful for user:', session.userId);
      
      // Get user data using Users API with server credentials (has API key)
      const serverClient = getServerClient();
      const users = new Users(serverClient);
      
      // Get user data including labels using API key authentication
      const user = await users.get(session.userId);
      
      console.log('✅ User data retrieved, labels:', user.labels);
      
      return { session, user };
    } else {
      // Client-side login using browser SDK
      const session = await account.createEmailPasswordSession(email, password);
      
      console.log('✅ Login successful for user:', session.userId);
      
      // Get user data including labels
      const user = await account.get();
      
      console.log('✅ User data retrieved, labels:', user.labels);
      
      return { session, user };
    }
  } catch (error: any) {
    console.error('❌ Login error:', error.message);
    throw new Error(error.message || 'Failed to login');
  }
}

/**
 * Determines if a user is an admin based on their user ID
 * @deprecated Use getUserRole() instead for role-based checks
 * @param userId - The Appwrite user ID to check
 * @returns boolean - true if user is admin, false otherwise
 */
export function isAdminUser(userId: string): boolean {
  const adminUserId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
  
  if (!adminUserId) {
    console.warn('⚠️ NEXT_PUBLIC_ADMIN_USER_ID not set in environment variables');
    return false;
  }
  
  return userId === adminUserId;
}

/**
 * Deletes the current session and logs out the user
 * @throws Error if logout fails
 */
export async function logout(): Promise<void> {
  try {
    await account.deleteSession('current');
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(error.message || 'Failed to logout');
  }
}

/**
 * Returns the currently authenticated user
 * @returns Promise<Models.User<Models.Preferences> | null> - Current user or null if not logged in
 */
export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  try {
    const user = await account.get();
    return user;
  } catch (error: any) {
    // User is not authenticated
    console.debug('No authenticated user found:', error.message);
    return null;
  }
}

/**
 * Checks if a user is currently authenticated
 * @returns Promise<boolean> - True if user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Gets the current session information
 * @returns Promise<Models.Session | null> - Current session or null if not logged in
 */
export async function getCurrentSession(): Promise<Models.Session | null> {
  try {
    const session = await account.getSession('current');
    return session;
  } catch (error: any) {
    // No active session
    console.debug('No active session found:', error.message);
    return null;
  }
}

/**
 * Gets user role from Appwrite labels
 * @param userId - User ID to check role for
 * @returns Promise<string> - User role ('admin' or 'user')
 */
export async function getUserRole(userId?: string): Promise<string> {
  try {
    let user: Models.User<Models.Preferences> | null;
    
    if (userId) {
      // If userId provided, we'd need admin access to fetch it
      // For now, get current user
      user = await getCurrentUser();
    } else {
      user = await getCurrentUser();
    }
    
    if (!user) {
      console.log('getUserRole: No user found, defaulting to "user"')
      return 'user';
    }
    
    // Check labels for role
    const labels = user.labels || [];
    
    console.log('=== getUserRole Debug ===')
    console.log('User ID:', user.$id)
    console.log('User Email:', user.email)
    console.log('User Labels:', labels)
    console.log('=======================')
    
    if (labels.includes('admin')) {
      console.log('✅ User is ADMIN')
      return 'admin';
    }
    
    console.log('ℹ️ User is regular USER')
    return 'user';
  } catch (error: any) {
    console.error('Error getting user role:', error);
    return 'user'; // Default to regular user on error
  }
}

/**
 * Checks if current user is an admin
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}