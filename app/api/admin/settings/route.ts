import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCommissionRate, setCommissionRate } from '@/lib/settings';

async function requireAdmin() {
  // @ts-ignore - authOptions is compatible
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  // @ts-ignore - role exists on user object
  if (session.user?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 }) };
  }
  return { error: null };
}

/**
 * GET: Fetch the referral commission rate (Admin only)
 */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const commissionRate = await getCommissionRate();
    return NextResponse.json({ commissionRate });
  } catch (error: any) {
    console.error('❌ Error fetching settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * PATCH: Update the referral commission rate (Admin only)
 */
export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const commissionRate = Number(body.commissionRate);

    if (!Number.isFinite(commissionRate) || commissionRate <= 0) {
      return NextResponse.json({ error: 'commissionRate must be a positive number' }, { status: 400 });
    }

    const saved = await setCommissionRate(commissionRate);
    console.log(`✅ Referral commission rate updated to ${saved} TND`);

    return NextResponse.json({ success: true, commissionRate: saved });
  } catch (error: any) {
    console.error('❌ Error updating settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
