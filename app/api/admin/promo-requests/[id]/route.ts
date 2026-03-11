import { NextResponse } from 'next/server';
import { appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';
import { Query } from 'node-appwrite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generatePromoCode } from '@/lib/promo-utils';

const COLLECTION = () => appwriteConfig.promoRequestsCollectionId || 'promoCodeRequests';

/**
 * PATCH /api/admin/promo-requests/[id]
 * Body: { action: 'approve' | 'deny' }
 * Approve or deny a promo code request. Admin only.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action } = await request.json() as { action: 'approve' | 'deny' | 'markPaid' | 'markUnpaid' };
    if (!['approve', 'deny', 'markPaid', 'markUnpaid'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const databases = getServerDatabases();
    const { id: docId } = await params;

    // Fetch the existing request
    const doc = await databases.getDocument(
      appwriteConfig.databaseId,
      COLLECTION(),
      docId
    );

    // Handle payment status toggle
    if (action === 'markPaid' || action === 'markUnpaid') {
      if (doc.status !== 'APPROVED') {
        return NextResponse.json({ error: 'يجب أن يكون الطلب موافقاً عليه أولاً' }, { status: 409 });
      }
      const updated = await databases.updateDocument(
        appwriteConfig.databaseId,
        COLLECTION(),
        docId,
        { isPaid: action === 'markPaid' }
      );
      return NextResponse.json({ success: true, request: updated });
    }

    if (action === 'deny') {
      const updated = await databases.updateDocument(
        appwriteConfig.databaseId,
        COLLECTION(),
        docId,
        { status: 'DENIED' }
      );
      return NextResponse.json({ success: true, request: updated });
    }

    // action === 'approve' — generate a unique promo code
    if (doc.status === 'APPROVED') {
      return NextResponse.json({ error: 'تم الموافقة على هذا الطلب مسبقاً' }, { status: 409 });
    }

    let promoCode = generatePromoCode();
    let attempts = 0;
    while (attempts < 5) {
      const collision = await databases.listDocuments(
        appwriteConfig.databaseId,
        COLLECTION(),
        [Query.equal('promoCode', promoCode), Query.limit(1)]
      );
      if (collision.total === 0) break;
      promoCode = generatePromoCode();
      attempts++;
    }

    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      COLLECTION(),
      docId,
      { status: 'APPROVED', promoCode }
    );

    return NextResponse.json({ success: true, request: updated, promoCode });
  } catch (error: any) {
    console.error('PATCH /api/admin/promo-requests/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update promo request' }, { status: 500 });
  }
}
