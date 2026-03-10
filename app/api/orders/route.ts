import { NextResponse } from 'next/server';
import { appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';
import { ID, Query, Permission, Role } from 'node-appwrite';
import { getServerSession } from 'next-auth';

const ORDERS_COLLECTION_ID = appwriteConfig.ordersCollectionId || 'orders';

// GET: Fetch user's orders
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use server-side databases with API key authentication
    const databases = getServerDatabases();

    const orders = await databases.listDocuments(
      appwriteConfig.databaseId,
      ORDERS_COLLECTION_ID,
      [Query.equal('UserEmail', session.user.email), Query.orderDesc('$createdAt')]
    );

    return NextResponse.json({ orders: orders.documents });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST: Create new order
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      items,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = body;

    // Validate required fields
    if (!items || !shippingAddress || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required order information' },
        { status: 400 }
      );
    }

    // Use server-side databases with API key authentication
    const databases = getServerDatabases();

    // CRITICAL: Validate collection exists
    if (!appwriteConfig.ordersCollectionId) {
      console.error('❌ ORDERS_COLLECTION_ID not configured in environment variables');
      return NextResponse.json(
        { 
          error: 'Orders collection not configured. Please set up Appwrite orders collection.',
          details: 'Contact administrator to configure NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID'
        },
        { status: 503 }
      );
    }

    // Create order document matching YOUR Appwrite collection schema EXACTLY
    // Note: Using your exact field names (including typos to match your collection)
    const orderData = {
      UserEmail: session.user.email,           // PascalCase as per your collection
      UserName: session.user.name || 'Guest',  // PascalCase as per your collection
      shipingAdress: JSON.stringify({
        ...shippingAddress,
        items: items  // Store items WITH shipping address for now
      }),
      itemsPrice: parseFloat(itemsPrice),
      shipingPrice: parseFloat(shippingPrice || 0),
      totalPrice: parseFloat(totalPrice),
      status: 'pending',
      paymentmethod: 'cash_on_delivery',
      Ispaid: false,
    };

    console.log('📦 Creating order with data:', {
      UserEmail: orderData.UserEmail,
      totalPrice: orderData.totalPrice,
      itemCount: items.length,
      shippingCity: shippingAddress?.city
    });

    const order = await databases.createDocument(
      appwriteConfig.databaseId,
      ORDERS_COLLECTION_ID,
      ID.unique(),
      orderData,
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );

    console.log('✅ Order created successfully:', order.$id);

    return NextResponse.json({
      success: true,
      orderId: order.$id,
      message: 'Order placed successfully',
    });
  } catch (error: any) {
    console.error('❌ Error creating order:', {
      message: error.message,
      type: error.type,
      code: error.code,
      response: error.response
    });
    
    // Return specific error based on Appwrite error type
    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Orders collection not found in Appwrite. Please create it first.' },
        { status: 503 }
      );
    }
    
    if (error.type === 'document_invalid_structure') {
      return NextResponse.json(
        { 
          error: 'Order data structure mismatch', 
          details: 'The orders collection schema in Appwrite does not match the expected structure. Please verify collection attributes.'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
