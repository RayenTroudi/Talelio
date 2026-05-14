import { NextRequest, NextResponse } from 'next/server';
import { getServerStorage, appwriteConfig } from '@/lib/appwrite-config';

// In-memory cache: fileId → ArrayBuffer
// Lives for the lifetime of the Node.js process (survives across requests)
const imageCache = new Map<string, { buffer: ArrayBuffer; contentType: string }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    if (!fileId || fileId.trim() === '') {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Serve from in-memory cache if available
    const cached = imageCache.get(fileId);
    if (cached) {
      return new NextResponse(cached.buffer, {
        status: 200,
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Cache': 'HIT',
        },
      });
    }

    const serverStorage = getServerStorage();
    const fileBuffer = await serverStorage.getFileDownload(
      appwriteConfig.perfumeImagesBucketId,
      fileId
    );

    // Detect content type from magic bytes
    const bytes = new Uint8Array(fileBuffer.slice(0, 4));
    let contentType = 'image/jpeg';
    if (bytes[0] === 0x89 && bytes[1] === 0x50) contentType = 'image/png';
    else if (bytes[0] === 0x47 && bytes[1] === 0x49) contentType = 'image/gif';
    else if (bytes[0] === 0x52 && bytes[1] === 0x49) contentType = 'image/webp';

    // Store in cache
    imageCache.set(fileId, { buffer: fileBuffer, contentType });

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'MISS',
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
