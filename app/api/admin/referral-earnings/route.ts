import { NextResponse } from 'next/server';
import { appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';
import { Query } from 'node-appwrite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const COLLECTION = () => appwriteConfig.referralEarningsCollectionId || 'referralEarnings';

/**
 * GET /api/admin/referral-earnings?ownerUserId=xxx
 * Returns total earnings for a referral code owner. Admin only.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const ownerUserId = searchParams.get('ownerUserId');
    if (!ownerUserId) {
      return NextResponse.json({ error: 'ownerUserId is required' }, { status: 400 });
    }

    const databases = getServerDatabases();
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      COLLECTION(),
      [Query.equal('ownerUserId', ownerUserId), Query.limit(500)]
    );

    const total = result.documents.reduce((sum: number, doc: any) => sum + (doc.amount || 0), 0);

    return NextResponse.json({
      total: parseFloat(total.toFixed(2)),
      count: result.total,
    });
  } catch (error: any) {
    console.error('GET /api/admin/referral-earnings error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch earnings' }, { status: 500 });
  }
}
