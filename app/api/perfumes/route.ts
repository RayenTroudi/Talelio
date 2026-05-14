import { NextRequest, NextResponse } from 'next/server';
import { AppwritePerfumeService } from '@/lib/appwrite-perfume';
import { databases, storage, appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';
import { ID, Permission, Role } from 'node-appwrite';

// In-memory cache for the perfumes list (60-second TTL)
export let perfumesCache: { data: any; expiresAt: number } | null = null;
export function invalidatePerfumesCache() { perfumesCache = null; }
const CACHE_TTL_MS = 60_000;

// GET - Fetch all perfumes
export async function GET() {
  try {
    const now = Date.now();

    if (perfumesCache && perfumesCache.expiresAt > now) {
      return NextResponse.json(perfumesCache.data, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    const serverDatabases = getServerDatabases();
    const result = await serverDatabases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.perfumesCollectionId
    );

    const responseBody = {
      success: true,
      data: result.documents,
      total: result.total,
    };

    perfumesCache = { data: responseBody, expiresAt: now + CACHE_TTL_MS };

    return NextResponse.json(responseBody, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error: any) {
    console.error('Error fetching perfumes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error', details: error },
      { status: 500 }
    );
  }
}

// POST - Create new perfume
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Received data:', data);
    console.log('Received sizes:', data.sizes, 'Type:', typeof data.sizes, 'Is Array:', Array.isArray(data.sizes));
    console.log('Received topNotes:', data.topNotes, 'Type:', typeof data.topNotes, 'Is Array:', Array.isArray(data.topNotes));
    
    // Validate and normalize category
    // CRITICAL: Appwrite enum values are case-sensitive!
    const allowedCategories = ['Femme', 'Homme', 'Unisex', 'Coffret', 'Pac Misk'];
    const normalizedCategory = data.category || 'Unisex';
    
    console.log('📋 Category validation:');
    console.log('  - Received category:', data.category);
    console.log('  - Normalized category:', normalizedCategory);
    console.log('  - Is allowed:', allowedCategories.includes(normalizedCategory));
    
    // Create document data matching Appwrite collection schema
    // All array attributes must be sent as actual arrays, not JSON strings
    const documentData = {
      name: data.name || '',
      brand: data.brand || '',
      price: Number(data.price) || 0,
      category: normalizedCategory, // Use normalized category
      description: data.description || '',
      isInStock: data.isInStock ? 'true' : 'false', // String type
      sizes: Array.isArray(data.sizes) ? data.sizes : [], // Array of strings: ["30ml", "50ml"]
      topNotes: Array.isArray(data.topNotes) ? data.topNotes : [], // Array of strings
      middleNotes: Array.isArray(data.middleNotes) ? data.middleNotes : [], // Array of strings
      baseNotes: Array.isArray(data.baseNotes) ? data.baseNotes : [], // Array of strings
      // Images: Array of Appwrite file IDs
      // Store file IDs directly - frontend utilities will convert to preview URLs
      images: Array.isArray(data.productImages) && data.productImages.length > 0
        ? data.productImages.map((img: any) => {
            // If it's a string, use it directly (file ID)
            if (typeof img === 'string') return img;
            // If it's an object with url or id, extract it
            if (img.url && !img.url.startsWith('/')) return img.url; // File ID
            if (img.id && !img.id.startsWith('/')) return img.id; // File ID
            // Skip placeholders
            return null;
          }).filter((img: string | null): img is string => img !== null)
        : [], // Empty array if no valid images
    };
    
    console.log('Document data to send to Appwrite:', documentData);
    console.log('Images array:', documentData.images);
    console.log('Images type:', typeof documentData.images, 'Is Array:', Array.isArray(documentData.images));
    
    // Create document using server-side Appwrite client (with API key)
    // This bypasses client-side "users" role restrictions
    const serverDatabases = getServerDatabases();
    
    // Add explicit permissions to match collection settings
    const newDocument = await serverDatabases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.perfumesCollectionId,
      ID.unique(),
      documentData,
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );
    
    invalidatePerfumesCache();

    return NextResponse.json({
      success: true,
      data: newDocument
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating perfume:', error);
    console.error('Error message:', error.message);
    console.error('Error type:', error.type);
    console.error('Error code:', error.code);
    
    // Check if it's a category validation error
    if (error.message?.includes('category') || error.message?.includes('enum')) {
      console.error('🚨 CATEGORY VALIDATION ERROR!');
      console.error('This likely means Appwrite collection has restricted enum values.');
      console.error('Solution: Update Appwrite collection attribute to allow all categories.');
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Unknown error', 
        details: error,
        hint: error.message?.includes('category') 
          ? 'Category value may not be allowed in Appwrite collection. Check collection schema.'
          : undefined
      },
      { status: 500 }
    );
  }
}