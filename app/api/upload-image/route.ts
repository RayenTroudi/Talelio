import { NextRequest, NextResponse } from 'next/server';
import { getServerStorage } from '@/lib/appwrite-config';
import { ID, Permission, Role } from 'node-appwrite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * POST: Upload image to Appwrite Storage (Server-side with API key)
 * This bypasses client-side "users" role restrictions by using admin API key
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    // @ts-ignore
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    // @ts-ignore
    const isAdmin = session.user?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucketId = formData.get('bucketId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!bucketId) {
      return NextResponse.json(
        { error: 'No bucketId provided' },
        { status: 400 }
      );
    }

    console.log('📤 Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type, 'to bucket:', bucketId);

    // Convert the File to a format node-appwrite can handle
    // node-appwrite doesn't work well with Web API File objects
    // We need to create a file representation it can understand
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a FormData-like structure that node-appwrite expects
    // By wrapping the buffer in a Blob and adding File properties
    const fileForUpload = new File([buffer], file.name, { 
      type: file.type,
      lastModified: Date.now() 
    });

    // Use server-side storage with API key authentication
    const storage = getServerStorage();
    const fileId = ID.unique();

    // Upload file with explicit permissions
    const uploadedFile = await storage.createFile(
      bucketId,
      fileId,
      fileForUpload,
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );

    console.log('✅ File uploaded successfully:', uploadedFile.$id);

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.$id,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error('❌ Error uploading file:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to upload file',
        details: error 
      },
      { status: 500 }
    );
  }
}
