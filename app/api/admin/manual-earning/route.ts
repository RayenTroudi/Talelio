import { NextResponse } from 'next/server';
import { appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';
import { ID } from 'node-appwrite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const EARNINGS_COLLECTION = () => appwriteConfig.referralEarningsCollectionId || 'referralEarnings';

/**
 * POST /api/admin/manual-earning
 * Body: { ownerUserId, ownerEmail, promoRequestId, amount, note }
 * Adds a manual earning entry for a referral code owner.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { ownerUserId, ownerEmail, promoRequestId, amount, note } = await request.json();

    if (!ownerUserId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'ownerUserId and a positive amount are required' }, { status: 400 });
    }

    const databases = getServerDatabases();

    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      EARNINGS_COLLECTION(),
      ID.unique(),
      {
        orderId: `manual-${Date.now()}`,
        promoCodeId: promoRequestId || ownerUserId,
        ownerUserId,
        ownerEmail: ownerEmail || '',
        buyerUserId: ownerUserId,
        buyerEmail: note ? `[Manuel] ${note}` : '[Ajout manuel]',
        amount: parseFloat(parseFloat(amount).toFixed(2)),
        currency: 'TND',
      }
    );

    return NextResponse.json({ success: true, record: doc });
  } catch (error: any) {
    console.error('POST /api/admin/manual-earning error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add earning' }, { status: 500 });
  }
}
