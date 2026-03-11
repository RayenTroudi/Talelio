import { NextResponse } from 'next/server';
import { appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';
import { Query } from 'node-appwrite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const COLLECTION = () => appwriteConfig.referralEarningsCollectionId || 'referralEarnings';

/**
 * GET /api/promo/earnings
 * Returns the authenticated user's referral earnings records + total.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId: string = (session.user as any).id || session.user.email;

    const databases = getServerDatabases();
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      COLLECTION(),
      [Query.equal('ownerUserId', userId), Query.orderDesc('$createdAt'), Query.limit(500)]
    );

    const total = result.documents.reduce((sum: number, doc: any) => sum + (doc.amount || 0), 0);

    return NextResponse.json({
      total: parseFloat(total.toFixed(2)),
      count: result.total,
      records: result.documents.map((doc: any) => ({
        $id: doc.$id,
        $createdAt: doc.$createdAt,
        orderId: doc.orderId,
        buyerEmail: doc.buyerEmail,
        amount: doc.amount,
        currency: doc.currency || 'TND',
      })),
    });
  } catch (error: any) {
    console.error('GET /api/promo/earnings error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch earnings' }, { status: 500 });
  }
}
