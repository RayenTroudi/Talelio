import { ID, Storage, Databases, Models, Permission, Role } from 'appwrite';

interface Note {
  name: string;
  image: File | null;
  imageUrl?: string;
}

interface PerfumeFormData {
  name: string;
  brand: string;
  price: number;
  sizes: number[];
  topNotes: Note[];
  middleNotes: Note[];
  baseNotes: Note[];
  productImages: File[];
  description?: string;
  isInStock: boolean;
}

interface PerfumeData {
  name: string;
  brand: string;
  price: number;
  sizes: number[];
  topNotes: Array<{
    name: string;
    imageId: string;
    imageUrl: string;
  }>;
  middleNotes: Array<{
    name: string;
    imageId: string;
    imageUrl: string;
  }>;
  baseNotes: Array<{
    name: string;
    imageId: string;
    imageUrl: string;
  }>;
  productImages: Array<{
    id: string;
    url: string;
    alt?: string;
  }>;
  description?: string;
  isInStock: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AppwritePerfumeDocument extends Models.Document, PerfumeData {}

export class AppwritePerfumeService {
  private storage: Storage;
  private databases: Databases;
  private databaseId: string;
  private collectionId: string;
  private bucketId: string;

  constructor(
    storage: Storage,
    databases: Databases,
    databaseId: string,
    collectionId: string,
    bucketId: string
  ) {
    this.storage = storage;
    this.databases = databases;
    this.databaseId = databaseId;
    this.collectionId = collectionId;
    this.bucketId = bucketId;
  }

  /**
   * Upload a file to Appwrite Storage
   */
  async uploadFile(file: File): Promise<Models.File> {
    const fileId = ID.unique();
    return await this.storage.createFile(
      this.bucketId, 
      fileId, 
      file,
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );
  }

  /**
   * Get file URL from Appwrite Storage
   */
  getFileUrl(fileId: string): string {
    return this.storage.getFileView(this.bucketId, fileId).toString();
  }

  /**
   * Upload multiple files and return their metadata
   */
  async uploadMultipleFiles(files: File[]): Promise<Array<{ id: string; url: string }>> {
    const uploadPromises = files.map(async (file) => {
      const uploadedFile = await this.uploadFile(file);
      return {
        id: uploadedFile.$id,
        url: this.getFileUrl(uploadedFile.$id),
      };
    });

    return await Promise.all(uploadPromises);
  }

  /**
   * Process and upload note images
   */
  async processNotes(notes: Note[]): Promise<Array<{
    name: string;
    imageId: string;
    imageUrl: string;
  }>> {
    const processedNotes = await Promise.all(
      notes.map(async (note) => {
        if (!note.image) {
          throw new Error(`Image required for note: ${note.name}`);
        }

        const uploadedFile = await this.uploadFile(note.image);
        return {
          name: note.name,
          imageId: uploadedFile.$id,
          imageUrl: this.getFileUrl(uploadedFile.$id),
        };
      })
    );

    return processedNotes;
  }

  /**
   * Create a new perfume document in Appwrite
   */
  async createPerfume(formData: PerfumeFormData): Promise<Models.Document> {
    try {
      // Upload product images
      const productImages = await this.uploadMultipleFiles(formData.productImages);
      
      // Process and upload note images
      const topNotes = await this.processNotes(formData.topNotes);
      const middleNotes = await this.processNotes(formData.middleNotes);
      const baseNotes = await this.processNotes(formData.baseNotes);

      // Prepare document data
      const documentData: PerfumeData = {
        name: formData.name,
        brand: formData.brand,
        price: formData.price,
        sizes: formData.sizes,
        topNotes,
        middleNotes,
        baseNotes,
        productImages: productImages.map((img, index) => ({
          id: img.id,
          url: img.url,
          alt: `${formData.name} - Image ${index + 1}`,
        })),
        description: formData.description || '',
        isInStock: formData.isInStock,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create document
      const documentId = ID.unique();
      return await this.databases.createDocument(
        this.databaseId,
        this.collectionId,
        documentId,
        documentData
      );
    } catch (error) {
      console.error('Error creating perfume:', error);
      throw error;
    }
  }

  /**
   * Get all perfumes
   */
  async getPerfumes(): Promise<Models.DocumentList<AppwritePerfumeDocument>> {
    return await this.databases.listDocuments<AppwritePerfumeDocument>(
      this.databaseId,
      this.collectionId
    );
  }

  /**
   * Get single perfume by ID
   */
  async getPerfume(perfumeId: string): Promise<AppwritePerfumeDocument> {
    return await this.databases.getDocument<AppwritePerfumeDocument>(
      this.databaseId,
      this.collectionId,
      perfumeId
    );
  }

  /**
   * Update perfume
   */
  async updatePerfume(
    perfumeId: string,
    formData: Partial<PerfumeFormData>
  ): Promise<Models.Document> {
    const updateData: Partial<PerfumeData> = {
      name: formData.name,
      brand: formData.brand,
      price: formData.price,
      sizes: formData.sizes,
      description: formData.description,
      isInStock: formData.isInStock,
      updatedAt: new Date().toISOString(),
    };

    // Handle file uploads if needed
    if (formData.productImages && formData.productImages.length > 0) {
      const productImages = await this.uploadMultipleFiles(formData.productImages);
      updateData.productImages = productImages.map((img, index) => ({
        id: img.id,
        url: img.url,
        alt: `${formData.name} - Image ${index + 1}`,
      }));
    }

    return await this.databases.updateDocument(
      this.databaseId,
      this.collectionId,
      perfumeId,
      updateData
    );
  }

  /**
   * Delete perfume and associated files (SAFE - with comprehensive cleanup)
   * This method ensures all associated resources are cleaned up:
   * 1. Product images
   * 2. Note images (top, middle, base)
   * 3. Database document
   */
  async deletePerfume(perfumeId: string): Promise<void> {
    try {
      console.log(`🗑️ Starting deletion process for perfume: ${perfumeId}`);
      
      // Step 1: Get perfume data to identify all files
      let perfume;
      try {
        perfume = await this.getPerfume(perfumeId);
        console.log(`📦 Found perfume: ${perfume.name}`);
        console.log(`📦 Perfume data structure:`, {
          hasProductImages: !!perfume.productImages,
          productImagesType: typeof perfume.productImages,
          productImagesIsArray: Array.isArray(perfume.productImages),
        });
      } catch (error: any) {
        console.error(`❌ Perfume not found: ${perfumeId}`);
        throw new Error(`Perfume not found with ID: ${perfumeId}`);
      }

      // Step 2: Collect all file IDs that need to be deleted
      // Handle both array and string (JSON) formats
      const parseArray = (data: any): any[] => {
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      const productImages = parseArray(perfume.productImages);
      const topNotes = parseArray(perfume.topNotes);
      const middleNotes = parseArray(perfume.middleNotes);
      const baseNotes = parseArray(perfume.baseNotes);

      const fileIds = [
        ...productImages.map((img: any) => img.id || img).filter(Boolean),
        ...topNotes.map((note: any) => note.imageId).filter(Boolean),
        ...middleNotes.map((note: any) => note.imageId).filter(Boolean),
        ...baseNotes.map((note: any) => note.imageId).filter(Boolean),
      ].filter(id => id && id !== ''); // Remove any empty IDs

      console.log(`🖼️ Found ${fileIds.length} files to delete`);

      // Step 3: Delete files in parallel (with error handling for each)
      if (fileIds.length > 0) {
        const deletePromises = fileIds.map(async (fileId) => {
          try {
            await this.storage.deleteFile(this.bucketId, fileId);
            console.log(`✅ Deleted file: ${fileId}`);
            return { success: true, fileId };
          } catch (err: any) {
            console.warn(`⚠️ Failed to delete file ${fileId}:`, err.message);
            // Don't throw - continue with other deletions
            return { success: false, fileId, error: err.message };
          }
        });

        const results = await Promise.all(deletePromises);
        const failedDeletes = results.filter(r => !r.success);
        
        if (failedDeletes.length > 0) {
          console.warn(`⚠️ ${failedDeletes.length} file(s) failed to delete (continuing anyway)`);
        }
      }

      // Step 4: Delete the database document
      try {
        await this.databases.deleteDocument(
          this.databaseId,
          this.collectionId,
          perfumeId
        );
        console.log(`✅ Deleted database document: ${perfumeId}`);
      } catch (error: any) {
        console.error(`❌ Failed to delete database document:`, error);
        throw new Error(`Failed to delete perfume document: ${error.message}`);
      }

      console.log(`✅ Successfully deleted perfume: ${perfume.name}`);
    } catch (error: any) {
      console.error('❌ Error in deletePerfume:', error);
      throw error;
    }
  }
}

/**
 * Transform Appwrite document to ProductCard format
 */
export function transformToProductCard(perfume: AppwritePerfumeDocument) {
  return {
    id: perfume.$id!,
    name: perfume.name,
    brand: perfume.brand,
    description: perfume.description,
    basePrice: perfume.price,
    images: perfume.productImages.map((img, index) => ({
      id: index + 1,
      src: img.url,
      alt: img.alt || `${perfume.name} - Image ${index + 1}`,
    })),
    sizes: perfume.sizes,
    topNotes: perfume.topNotes.map(note => ({
      name: note.name,
      image: note.imageUrl,
    })),
    middleNotes: perfume.middleNotes.map(note => ({
      name: note.name,
      image: note.imageUrl,
    })),
    baseNotes: perfume.baseNotes.map(note => ({
      name: note.name,
      image: note.imageUrl,
    })),
    rating: 5, // Default or calculate from reviews
    reviewCount: 0, // Default or get from reviews collection
    isInStock: perfume.isInStock,
    maxQuantity: 10, // Default
    isNew: false, // Calculate based on createdAt
    isOnSale: false, // Based on business logic
  };
}

export type { PerfumeFormData, AppwritePerfumeDocument };