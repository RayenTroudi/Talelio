import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Debug endpoint to check current session and role
 * Visit: /api/debug-session
 */
export async function GET() {
  try {
    // @ts-ignore
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'No active session. Please sign in.',
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: (session.user as any)?.id,
        email: session.user?.email,
        name: session.user?.name,
        role: (session.user as any)?.role,
      },
      isAdmin: (session.user as any)?.role === 'admin',
      message: (session.user as any)?.role === 'admin' 
        ? '✅ You have admin access!' 
        : '❌ You need admin role. Add "admin" label in Appwrite or set NEXT_PUBLIC_ADMIN_USER_ID',
      instructions: {
        method1: 'Go to Appwrite Console → Auth → Users → Select your user → Add label: "admin"',
        method2: `Add to .env.local: NEXT_PUBLIC_ADMIN_USER_ID=${(session.user as any)?.id}`,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
