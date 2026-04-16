import { NextResponse } from 'next/server';
import { appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';
import { ID, Query, Permission, Role } from 'node-appwrite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const COLLECTION = () => appwriteConfig.promoRequestsCollectionId || 'promoCodeRequests';

/**
 * GET /api/promo/request
 * Returns the current user's most recent promo code request (or null).
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
      [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(1)]
    );

    return NextResponse.json({ promoRequest: result.documents[0] ?? null });
  } catch (error: any) {
    console.error('GET /api/promo/request error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch promo request' }, { status: 500 });
  }
}

/**
 * POST /api/promo/request
 * Creates a PENDING promo code request for the authenticated user.
 * Only one active (PENDING or APPROVED) request is allowed per user.
 * Optionally accepts a referredByPromoCode in the JSON body.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId: string = (session.user as any).id || session.user.email;

    let referredByPromoCode: string | null = null;
    let referredByUserId: string | null = null;

    try {
      const body = await request.json();
      if (body?.referredByPromoCode) {
        referredByPromoCode = String(body.referredByPromoCode).trim().toUpperCase();
      }
    } catch {
      // No body or non-JSON — treat as no referral code
    }

    const databases = getServerDatabases();

    if (referredByPromoCode) {
      const referrerResult = await databases.listDocuments(
        appwriteConfig.databaseId,
        COLLECTION(),
        [Query.equal('promoCode', referredByPromoCode), Query.equal('status', 'APPROVED'), Query.limit(1)]
      );
      if (referrerResult.total === 0) {
        return NextResponse.json({ error: 'رمز الإحالة غير صالح' }, { status: 400 });
      }
      const referrerDoc = referrerResult.documents[0];
      if (referrerDoc.userId === userId) {
        return NextResponse.json({ error: 'لا يمكنك استخدام رمز إحالتك الخاص' }, { status: 409 });
      }
      referredByUserId = referrerDoc.userId as string;
    }

    // Check for an existing non-denied request
    const existing = await databases.listDocuments(
      appwriteConfig.databaseId,
      COLLECTION(),
      [Query.equal('userId', userId), Query.limit(10)]
    );
    const active = existing.documents.filter((d: any) => d.status !== 'DENIED');
    if (active.length > 0) {
      return NextResponse.json(
        { error: 'لديك بالفعل طلب نشط', existing: active[0] },
        { status: 409 }
      );
    }

    const docData: Record<string, any> = {
      userId,
      userEmail: session.user.email,
      userName: session.user.name || '',
      status: 'PENDING',
    };
    if (referredByPromoCode) docData.referredByPromoCode = referredByPromoCode;
    if (referredByUserId)   docData.referredByUserId   = referredByUserId;

    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      COLLECTION(),
      ID.unique(),
      docData,
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );

    return NextResponse.json({ success: true, request: doc }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/promo/request error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create request' }, { status: 500 });
  }
}
