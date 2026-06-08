import { NextResponse } from 'next/server';
import { appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';
import { Query, ID } from 'node-appwrite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const COLLECTION = () => appwriteConfig.paymentHistoryCollectionId || 'paymentHistory';

/**
 * GET /api/admin/payment-history?ownerUserId=xxx
 * Returns payment history records for a user, or all if no ownerUserId.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const ownerUserId = searchParams.get('ownerUserId');

    const databases = getServerDatabases();
    const queries = [Query.orderDesc('$createdAt'), Query.limit(200)];
    if (ownerUserId) queries.push(Query.equal('ownerUserId', ownerUserId));

    const result = await databases.listDocuments(appwriteConfig.databaseId, COLLECTION(), queries);

    return NextResponse.json({ records: result.documents, total: result.total });
  } catch (error: any) {
    console.error('GET /api/admin/payment-history error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch payment history' }, { status: 500 });
  }
}

/**
 * POST /api/admin/payment-history
 * Body: { ownerUserId, ownerEmail, userName, promoCode, amount, currency, earningRecordIds }
 * Creates a payment history snapshot (called when marking paid).
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { ownerUserId, ownerEmail, userName, promoCode, amount, currency, earningRecordIds } = body;

    if (!ownerUserId || amount == null) {
      return NextResponse.json({ error: 'ownerUserId and amount are required' }, { status: 400 });
    }

    const databases = getServerDatabases();
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      COLLECTION(),
      ID.unique(),
      {
        ownerUserId,
        ownerEmail: ownerEmail || '',
        userName: userName || '',
        promoCode: promoCode || '',
        amount: parseFloat(amount.toFixed(2)),
        earningRecordIds: JSON.stringify(earningRecordIds || []),
        restoredAt: null,
      }
    );

    return NextResponse.json({ success: true, record: doc });
  } catch (error: any) {
    console.error('POST /api/admin/payment-history error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payment history' }, { status: 500 });
  }
}
