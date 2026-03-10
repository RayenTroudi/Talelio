import { NextRequest, NextResponse } from 'next/server';
import { getServerStorage, appwriteConfig } from '@/lib/appwrite-config';

/**
 * API Route to proxy Appwrite Storage images
 * This provides a reliable way to serve images through Next.js with server-side auth
 * Benefits: Server-side authentication, caching, error handling, consistent URLs
 * 
 * IMPORTANT: Provide APPWRITE_API_KEY in .env.local for server-side authentication
 * 
 * Note: Using getFileDownload() to retrieve raw file bytes from Appwrite Storage.
 * This works with Appwrite free tier (no image transformations).
 * Images are served in their original uploaded size and format.
 * 
 * GET /api/images/[fileId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    
    if (!fileId || fileId.trim() === '') {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    console.log(`📸 Fetching image for fileId: ${fileId}`);

    // Use server-side storage client with authentication
    const serverStorage = getServerStorage();

    // Get the file directly as a buffer using node-appwrite SDK
    // This avoids the URL parsing issue and works with API key authentication
    const fileBuffer = await serverStorage.getFileDownload(
      appwriteConfig.perfumeImagesBucketId,
      fileId
    );

    console.log(`✅ Successfully fetched image: ${fileId}, size: ${fileBuffer.byteLength} bytes`);

    // Determine content type (default to jpeg if unknown)
    // In production, you might want to store this in the database
    const contentType = 'image/jpeg';
    
    // Return the image with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error: any) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
