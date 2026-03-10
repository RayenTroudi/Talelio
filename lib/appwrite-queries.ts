import { databases, appwriteConfig } from './appwrite-config';
import { Query, Models } from 'appwrite';

/**
 * Appwrite Product Interface
 * Matches the database schema
 */
export interface AppwritePerfume extends Models.Document {
  name: string;
  brand: string;
  price: number;
  category: string;
  description: string;
  isInStock: string; // "true" or "false" as string in Appwrite
  sizes: string[]; // Array of strings like ["30ml", "50ml"]
  topNotes: string[]; // Array of note names
  middleNotes: string[];
  baseNotes: string[];
  images: string[]; // Array of image URLs
}

/**
 * Fetch all perfumes from Appwrite
 */
export async function getAllPerfumes(): Promise<AppwritePerfume[]> {
  try {
    const response = await databases.listDocuments<AppwritePerfume>(
      appwriteConfig.databaseId,
      appwriteConfig.perfumesCollectionId
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching all perfumes:', error);
    throw error;
  }
}

/**
 * Fetch perfumes filtered by category
 * @param category - The category to filter by (e.g., "Femme", "Homme", "Unisex")
 */
export async function getPerfumesByCategory(category: string): Promise<AppwritePerfume[]> {
  try {
    const response = await databases.listDocuments<AppwritePerfume>(
      appwriteConfig.databaseId,
      appwriteConfig.perfumesCollectionId,
      [
        Query.equal('category', category)
      ]
    );
    return response.documents;
  } catch (error) {
    console.error(`Error fetching perfumes for category ${category}:`, error);
    throw error;
  }
}

/**
 * Fetch a single perfume by ID
 * @param id - The document ID
 */
export async function getPerfumeById(id: string): Promise<AppwritePerfume> {
  try {
    const response = await databases.getDocument<AppwritePerfume>(
      appwriteConfig.databaseId,
      appwriteConfig.perfumesCollectionId,
      id
    );
    return response;
  } catch (error) {
    console.error(`Error fetching perfume with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Search perfumes by name or brand
 * @param query - Search query string
 */
export async function searchPerfumes(query: string): Promise<AppwritePerfume[]> {
  try {
    const response = await databases.listDocuments<AppwritePerfume>(
      appwriteConfig.databaseId,
      appwriteConfig.perfumesCollectionId,
      [
        Query.or([
          Query.search('name', query),
          Query.search('brand', query)
        ])
      ]
    );
    return response.documents;
  } catch (error) {
    console.error(`Error searching perfumes with query "${query}":`, error);
    throw error;
  }
}
