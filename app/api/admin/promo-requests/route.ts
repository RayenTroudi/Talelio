import { NextResponse } from 'next/server';
import { appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';
import { Query } from 'node-appwrite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const COLLECTION = () => appwriteConfig.promoRequestsCollectionId || 'promoCodeRequests';

/**
 * GET /api/admin/promo-requests
 * Returns all promo code requests. Admin only.
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
    const status = searchParams.get('status');

    const databases = getServerDatabases();
    const queries = [Query.orderDesc('$createdAt'), Query.limit(100)];
    if (status) {
      queries.push(Query.equal('status', status));
    }

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      COLLECTION(),
      queries
    );

    return NextResponse.json({ requests: result.documents, total: result.total });
  } catch (error: any) {
    console.error('GET /api/admin/promo-requests error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch promo requests' }, { status: 500 });
  }
}
