import { NextResponse } from 'next/server';
import { appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';
import { Query } from 'node-appwrite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const ORDERS_COLLECTION_ID = appwriteConfig.ordersCollectionId || 'orders';

/**
 * GET: Fetch ALL orders (Admin only)
 * This endpoint is separate from /api/orders which only fetches user's own orders
 */
export async function GET(request: Request) {
  try {
    // @ts-ignore - authOptions is compatible
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    // @ts-ignore - role exists on user object
    const isAdmin = session.user?.role === 'admin';
    
    console.log('Admin Orders API - User:', session.user?.email, 'Role:', session.user?.role, 'isAdmin:', isAdmin);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Use server-side databases with API key authentication
    const databases = getServerDatabases();

    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build queries
    const queries = [
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset(offset),
    ];

    // Add status filter if provided
    if (status && status !== 'all') {
      queries.push(Query.equal('status', status));
    }

    // Fetch all orders
    const orders = await databases.listDocuments(
      appwriteConfig.databaseId,
      ORDERS_COLLECTION_ID,
      queries
    );

    console.log(`📦 Admin fetched ${orders.documents.length} orders`);

    return NextResponse.json({ 
      orders: orders.documents,
      total: orders.total 
    });
  } catch (error: any) {
    console.error('❌ Error fetching admin orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update order status (Admin only)
 */
export async function PATCH(request: Request) {
  try {
    // @ts-ignore - authOptions is compatible
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // @ts-ignore
    const isAdmin = session.user?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    // Update order status
    const updatedOrder = await databases.updateDocument(
      appwriteConfig.databaseId,
      ORDERS_COLLECTION_ID,
      orderId,
      { status }
    );

    console.log(`✅ Order ${orderId} status updated to: ${status}`);

    // When an order is cancelled, remove any referral commission earned from it
    if (status === 'cancelled') {
      try {
        const earningsCol = appwriteConfig.referralEarningsCollectionId || 'referralEarnings';
        const existing = await databases.listDocuments(
          appwriteConfig.databaseId,
          earningsCol,
          [Query.equal('orderId', orderId), Query.limit(5)]
        );
        for (const doc of existing.documents) {
          await databases.deleteDocument(appwriteConfig.databaseId, earningsCol, doc.$id);
          console.log(`🗑️ Deleted referral earning ${doc.$id} for cancelled order ${orderId}`);
        }
      } catch (err: any) {
        // Non-fatal — log but don't fail the status update
        console.error('⚠️ Failed to remove referral earnings for cancelled order:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });
  } catch (error: any) {
    console.error('❌ Error updating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
