import { NextResponse } from 'next/server';
import { appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';
import { ID } from 'node-appwrite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const HISTORY_COLLECTION = () => appwriteConfig.paymentHistoryCollectionId || 'paymentHistory';
const PROMO_COLLECTION = () => appwriteConfig.promoRequestsCollectionId || 'promoCodeRequests';
const EARNINGS_COLLECTION = () => appwriteConfig.referralEarningsCollectionId || 'referralEarnings';

/**
 * POST /api/admin/payment-history/[id]
 * Restores a payment: marks promo request as unpaid and re-creates a single
 * earnings record for the full snapshot amount so the user's Total des gains
 * goes back to what it was before the payout.
 * Body: { promoRequestId }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id: historyId } = await params;
    const { promoRequestId } = await request.json();

    const databases = getServerDatabases();

    // Get the payment history snapshot
    const historyDoc = await databases.getDocument(
      appwriteConfig.databaseId,
      HISTORY_COLLECTION(),
      historyId
    );

    // Re-create a single earnings record for the full snapshot amount
    // so the user's Total des gains is restored to what it was before payout
    await databases.createDocument(
      appwriteConfig.databaseId,
      EARNINGS_COLLECTION(),
      ID.unique(),
      {
        orderId: `restored-${historyId}`,
        promoCodeId: promoRequestId || historyId,
        ownerUserId: historyDoc.ownerUserId,
        ownerEmail: historyDoc.ownerEmail || '',
        buyerUserId: historyDoc.ownerUserId, // synthetic — no real buyer for a restore
        buyerEmail: '',
        amount: historyDoc.amount,
        currency: 'TND',
      }
    );

    // Mark promo request as unpaid again
    if (promoRequestId) {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        PROMO_COLLECTION(),
        promoRequestId,
        { isPaid: false }
      );
    }

    // Delete the history record (restore = it's gone from history)
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      HISTORY_COLLECTION(),
      historyId
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/admin/payment-history/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to restore payment' }, { status: 500 });
  }
}
