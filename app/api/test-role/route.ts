import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        user: null 
      }, { status: 401 });
    }
    
    return NextResponse.json({
      userId: user.$id,
      email: user.email,
      name: user.name,
      labels: user.labels || [],
      hasAdminLabel: (user.labels || []).includes('admin'),
      message: (user.labels || []).includes('admin') 
        ? '✅ This user HAS the admin label' 
        : '❌ This user does NOT have the admin label'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      user: null 
    }, { status: 500 });
  }
}
