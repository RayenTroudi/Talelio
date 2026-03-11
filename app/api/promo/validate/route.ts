import { NextResponse } from 'next/server';
import { appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';
import { Query } from 'node-appwrite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const COLLECTION = () => appwriteConfig.promoRequestsCollectionId || 'promoCodeRequests';

/**
 * GET /api/promo/validate?code=XXXXXX
 * Validates an approved referral code.
 * - Confirms code exists and is APPROVED
 * - Enforces self-referral prevention
 * - No discount is applied to the buyer; the code owner earns 10% of the order subtotal.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول لاستخدام رمز الإحالة' }, { status: 401 });
    }
    const currentUserId: string = (session.user as any).id || session.user.email;

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ error: 'يرجى إدخال رمز الإحالة' }, { status: 400 });
    }

    const databases = getServerDatabases();
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      COLLECTION(),
      [
        Query.equal('promoCode', code),
        Query.equal('status', 'APPROVED'),
        Query.limit(1),
      ]
    );

    if (result.total === 0) {
      return NextResponse.json({ error: 'رمز الإحالة غير صالح أو غير موجود' }, { status: 404 });
    }

    const promoDoc = result.documents[0];

    // Self-referral prevention
    if (promoDoc.userId === currentUserId) {
      return NextResponse.json({ error: 'لا يمكنك استخدام رمز إحالتك الخاص' }, { status: 409 });
    }

    return NextResponse.json({
      valid: true,
      promoCodeId: promoDoc.$id,
      code: promoDoc.promoCode,
    });
  } catch (error: any) {
    console.error('GET /api/promo/validate error:', error);
    return NextResponse.json({ error: error.message || 'Failed to validate referral code' }, { status: 500 });
  }
}
