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
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId: string = (session.user as any).id || session.user.email;

    const databases = getServerDatabases();

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

    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      COLLECTION(),
      ID.unique(),
      {
        userId,
        userEmail: session.user.email,
        userName: session.user.name || '',
        status: 'PENDING',
      },
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
