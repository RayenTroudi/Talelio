export type products = {
"id":number,
"Name": string,
"Brand": string,
"Year": string,
"rating": string,
"Country": string,
"Image": string,
"Gender": string,
"Price": number,
"countInStock" : number
}

export interface FeatureItemProps {
  iconPath: string;
  text: string;
}

export interface CategoryColumnProps {
  title: string;
  links: string[]; // links is an array of strings
}

// ============================================
// Product Image Types
// ============================================

/**
 * UI-safe product image
 * UI components always receive valid URLs (never null)
 */
export interface ProductImageUI {
  id: number;
  src: string; // Always a valid URL string (Appwrite URL or fallback)
  alt: string;
}

/**
 * Database layer image
 * Can be Appwrite file ID, full URL, or null
 */
export type ProductImageDB = string | null;

/**
 * Appwrite product image
 * Represents an image stored in Appwrite Storage
 */
export interface AppwriteProductImage {
  id: string; // Appwrite file ID
  url: string; // Full Appwrite Storage URL
  alt?: string; // Optional alt text
}

// ============================================
// Appwrite Product Types
// ============================================

/**
 * Complete Appwrite Perfume Document
 * Matches the Appwrite database schema exactly
 */
export interface AppwritePerfumeDocument {
  $id: string; // Appwrite document ID
  $createdAt: string;
  $updatedAt: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  description: string;
  isInStock: string; // "true" or "false" as string
  sizes: string[]; // ["30ml", "50ml", "100ml"]
  images: string[]; // Array of Appwrite file IDs
  topNotes: string[]; // Array of note names
  middleNotes: string[];
  baseNotes: string[];
}
