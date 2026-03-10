import { NextRequest, NextResponse } from 'next/server';
import { AppwritePerfumeService } from '@/lib/appwrite-perfume';
import { databases, storage, appwriteConfig, getServerDatabases, getServerStorage } from '@/lib/appwrite-config';

// GET - Fetch single perfume
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Use server-side clients
    const serverDatabases = getServerDatabases();
    const serverStorage = getServerStorage();
    
    const perfumeService = new AppwritePerfumeService(
      serverStorage,
      serverDatabases as any,
      appwriteConfig.databaseId,
      appwriteConfig.perfumesCollectionId,
      appwriteConfig.perfumeImagesBucketId
    );
    
    const perfume = await perfumeService.getPerfume(id);
    
    return NextResponse.json({
      success: true,
      data: perfume
    });
  } catch (error: any) {
    console.error('Error fetching perfume:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('not found') ? 404 : 500 }
    );
  }
}

// PUT - Update perfume
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    console.log('Updating perfume:', id);
    console.log('Update data:', data);
    
    // Create document data matching Appwrite collection schema
    const documentData: any = {
      name: data.name || '',
      brand: data.brand || '',
      price: Number(data.price) || 0,
      category: data.category || 'Unisex',
      description: data.description || '',
      isInStock: data.isInStock === true || data.isInStock === 'true' ? 'true' : 'false',
      sizes: Array.isArray(data.sizes) ? data.sizes : [],
      topNotes: Array.isArray(data.topNotes) ? data.topNotes : [],
      middleNotes: Array.isArray(data.middleNotes) ? data.middleNotes : [],
      baseNotes: Array.isArray(data.baseNotes) ? data.baseNotes : [],
    };
    
    // Handle image updates if provided (string format for Appwrite)
    if (data.images !== undefined) {
      documentData.images = data.images; // Direct string assignment
    } else if (data.productImages && Array.isArray(data.productImages)) {
      // Legacy support for array format
      documentData.images = data.productImages.map((img: any) => {
        if (typeof img === 'string') return img;
        if (img.url && !img.url.startsWith('/')) return img.url;
        if (img.id && !img.id.startsWith('/')) return img.id;
        return null;
      }).filter((img: string | null): img is string => img !== null).join(',');
    }
    
    console.log('Document data for Appwrite:', documentData);
    
    // Update document using server-side Appwrite client
    const serverDatabases = getServerDatabases();
    const updatedDocument = await serverDatabases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.perfumesCollectionId,
      id,
      documentData
    );
    
    return NextResponse.json({
      success: true,
      data: updatedDocument
    });
  } catch (error: any) {
    console.error('Error updating perfume:', error);
    console.error('Full error details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error', details: error },
      { status: error.message?.includes('not found') ? 404 : 500 }
    );
  }
}

// DELETE - Delete perfume with comprehensive cleanup
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log(`🗑️ DELETE request received for perfume ID: ${id}`);
    
    // Validate ID
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Perfume ID is required' },
        { status: 400 }
      );
    }
    
    // Initialize perfume service with server-side clients
    const serverDatabases = getServerDatabases();
    const serverStorage = getServerStorage();
    
    const perfumeService = new AppwritePerfumeService(
      serverStorage,
      serverDatabases as any,
      appwriteConfig.databaseId,
      appwriteConfig.perfumesCollectionId,
      appwriteConfig.perfumeImagesBucketId
    );
    
    // Delete perfume and all associated files
    await perfumeService.deletePerfume(id);
    
    console.log(`✅ Successfully deleted perfume: ${id}`);
    
    return NextResponse.json({
      success: true,
      message: 'Perfume and all associated files deleted successfully',
      deletedId: id
    });
  } catch (error: any) {
    console.error('❌ Error in DELETE route:', error);
    
    // Handle specific error cases
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Perfume not found. It may have already been deleted.',
          details: error.message 
        },
        { status: 404 }
      );
    }
    
    // Handle permission errors
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Permission denied. Please check your authentication.',
          details: error.message 
        },
        { status: 403 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete perfume',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}