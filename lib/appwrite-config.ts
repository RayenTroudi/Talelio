import { Client, Account, Databases, Storage , ID} from 'appwrite';
// Import server SDK for server-side operations (has .setKey() method)
import * as AppwriteNode from 'node-appwrite';

// Appwrite configuration
// All values must be set in .env.local - see .env.example for template
export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  
  // Collections
  perfumesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PERFUMES_COLLECTION_ID || '',
  ordersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID || '',
  usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '',
  
  // Storage
  perfumeImagesBucketId: process.env.NEXT_PUBLIC_APPWRITE_PERFUME_IMAGES_BUCKET_ID || '',
  noteImagesBucketId: process.env.NEXT_PUBLIC_APPWRITE_NOTE_IMAGES_BUCKET_ID || '',
  
  // Server-side API key (for server routes only - never exposed to client)
  // CRITICAL: This enables server-side image access even with private buckets
  apiKey: process.env.APPWRITE_API_KEY || '',
};

// Validate required environment variables
if (typeof window === 'undefined') {
  const required = [
    'NEXT_PUBLIC_APPWRITE_ENDPOINT',
    'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
    'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
    'NEXT_PUBLIC_APPWRITE_PERFUMES_COLLECTION_ID',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing required environment variables:\n${missing.join('\n')}\n\n` +
      `Please copy .env.example to .env.local and fill in your Appwrite credentials.`
    );
  }
}

// Initialize Appwrite client (browser/client-side)
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Server-side client getter (for API routes only)
// Uses node-appwrite SDK which supports .setKey() method for API key authentication
export function getServerClient() {
  if (typeof window !== 'undefined') {
    throw new Error('getServerClient() can only be called server-side');
  }
  
  // Use node-appwrite SDK for server-side operations
  const serverClient = new AppwriteNode.Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);
  
  // CRITICAL: Add API key for server-side authentication
  // This allows access to private storage buckets
  if (appwriteConfig.apiKey) {
    serverClient.setKey(appwriteConfig.apiKey);
    console.log('✅ Server client configured with API key');
  } else {
    console.warn('⚠️  No API key configured - storage access may fail with 403 errors');
    console.warn('   Add APPWRITE_API_KEY to .env.local or make storage bucket public');
  }
  
  return serverClient;
}

// Server-side storage instance (for API routes)
export function getServerStorage() {
  const client = getServerClient();
  return new AppwriteNode.Storage(client);
}

// Server-side databases instance (for API routes)
export function getServerDatabases() {
  const client = getServerClient();
  return new AppwriteNode.Databases(client);
}

export { client };

/**
 * Generate Appwrite file preview URL
 * @param fileId - The Appwrite file ID
 * @param bucketId - The Appwrite bucket ID (defaults to perfume images bucket)
 * @returns Full URL to access the file or null if fileId is invalid
 */
export function getAppwriteFileUrl(fileId: string, bucketId?: string): string | null {
  if (!fileId || fileId.trim() === '') return null;
  
  // If it's a local path or placeholder, return null
  if (fileId.startsWith('/') || fileId.includes('placeholder')) return null;
  
  const bucket = bucketId || appwriteConfig.perfumeImagesBucketId;
  
  if (!bucket) {
    console.error('Appwrite bucket ID is not configured');
    return null;
  }
  
  // Construct Appwrite file view URL
  // Format: https://{endpoint}/storage/buckets/{bucketId}/files/{fileId}/view?project={projectId}
  return `${appwriteConfig.endpoint}/storage/buckets/${bucket}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
}

/**
 * Generate Appwrite file preview URL with dimensions
 * @param fileId - The Appwrite file ID
 * @param width - Image width
 * @param height - Image height
 * @param bucketId - The Appwrite bucket ID
 * @returns Full URL to access the file preview or null if fileId is invalid
 */
export function getAppwriteFilePreview(
  fileId: string, 
  width: number = 400, 
  height: number = 400,
  bucketId?: string
): string | null {
  if (!fileId || fileId.trim() === '') return null;
  
  // If it's a local path or placeholder, return null
  if (fileId.startsWith('/') || fileId.includes('placeholder')) return null;
  
  const bucket = bucketId || appwriteConfig.perfumeImagesBucketId;
  
  if (!bucket) {
    console.error('Appwrite bucket ID is not configured');
    return null;
  }
  
  // Construct Appwrite file preview URL with dimensions
  return `${appwriteConfig.endpoint}/storage/buckets/${bucket}/files/${fileId}/preview?project=${appwriteConfig.projectId}&width=${width}&height=${height}`;
}

// Appwrite database schema for perfumes collection
export const perfumeSchema = {
  // String attributes
  name: { type: 'string', size: 255, required: true },
  brand: { type: 'string', size: 100, required: true },
  description: { type: 'string', size: 1000, required: false },
  
  // Numeric attributes
  price: { type: 'double', required: true },
  
  // Boolean attributes
  isInStock: { type: 'boolean', required: true, default: true },
  
  // Array attributes (stored as JSON)
  sizes: { type: 'string', size: 50, required: true }, // JSON array of numbers
  
  // JSON attributes for complex data
  topNotes: { type: 'string', size: 2000, required: true }, // JSON array
  middleNotes: { type: 'string', size: 2000, required: true }, // JSON array
  baseNotes: { type: 'string', size: 2000, required: true }, // JSON array
  productImages: { type: 'string', size: 2000, required: true }, // JSON array
  
  // Timestamps
  createdAt: { type: 'datetime', required: true },
  updatedAt: { type: 'datetime', required: true },
};

// Helper function to validate environment variables
export function validateAppwriteConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
    'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
    'NEXT_PUBLIC_APPWRITE_PERFUMES_COLLECTION_ID',
    'NEXT_PUBLIC_APPWRITE_PERFUME_IMAGES_BUCKET_ID',
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required Appwrite environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all Appwrite variables are set.'
    );
  }
}

// Usage example:
// validateAppwriteConfig(); // Call this in your app startup