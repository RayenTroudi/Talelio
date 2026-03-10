import { storage, appwriteConfig } from './appwrite-config';

// Default fallback image - a data URL for a neutral image placeholder
export const DEFAULT_FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

// Image serving strategy:
// - 'proxy': Use Next.js API route proxy (recommended for production - handles auth automatically)
// - 'direct': Use direct Appwrite URLs (requires public bucket permissions)
const IMAGE_STRATEGY = process.env.NEXT_PUBLIC_IMAGE_STRATEGY || 'proxy';

/**
 * Get Appwrite image URL from file ID
 * Returns null if fileId is invalid - use getImageUrlWithFallback for guaranteed string
 * 
 * Note: Width/height parameters removed due to Appwrite free tier limitations.
 * Images are served in their original size. Use CSS for client-side resizing.
 * 
 * @param fileId - Appwrite file ID
 * @returns Image URL or null if fileId is invalid
 */
export function getImageUrl(
  fileId: string | null | undefined,
  width?: number,  // Kept for backwards compatibility but not used
  height?: number  // Kept for backwards compatibility but not used
): string | null {
  if (!fileId || fileId.trim() === '') {
    return null;
  }

  // Skip if it's already a full URL
  if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
    return fileId;
  }

  // If it's a local path (including placeholders), return null
  if (fileId.startsWith('/')) {
    return null;
  }

  try {
    const bucketId = appwriteConfig.perfumeImagesBucketId;
    
    if (!bucketId) {
      console.error('Appwrite perfume images bucket ID is not configured');
      return null;
    }

    if (IMAGE_STRATEGY === 'proxy') {
      // Use Next.js API proxy route for authenticated access
      // This prevents 403 errors by using server-side authentication
      // Note: No width/height params - serving original images (free tier compatible)
      return `/api/images/${fileId}`;
    } else {
      // Use direct Appwrite URLs (requires public bucket permissions)
      // Only recommended if you've verified bucket has "Role: Any → Read" permission
      // Note: getFileView() used instead of getFilePreview() to avoid transformation limits
      const url = storage.getFileView(
        bucketId,
        fileId
      );
      return url.toString();
    }
  } catch (error) {
    console.error('Error generating image URL for fileId:', fileId, error);
    return null;
  }
}

/**
 * Get Appwrite image URL with guaranteed fallback
 * Always returns a valid string URL - never null, never throws
 * CRITICAL: This function MUST be safe - UI actions like DELETE depend on it never failing
 * 
 * Note: Width/height parameters kept for backwards compatibility but not used
 * (Appwrite free tier doesn't support image transformations)
 * 
 * @param fileId - Appwrite file ID
 * @returns Image URL (falls back to default placeholder if invalid)
 */
export function getImageUrlWithFallback(
  fileId: string | null | undefined,
  width?: number,  // Kept for backwards compatibility
  height?: number  // Kept for backwards compatibility
): string {
  // CRITICAL: Wrap in try-catch to ensure this NEVER throws
  // If this function throws, it could block UI actions like DELETE
  try {
    const url = getImageUrl(fileId);
    return url ?? DEFAULT_FALLBACK_IMAGE;
  } catch (error) {
    // If anything goes wrong, always return fallback
    // Log the error but NEVER throw - this ensures UI actions continue to work
    console.warn('getImageUrlWithFallback error (using fallback):', error);
    return DEFAULT_FALLBACK_IMAGE;
  }
}

/**
 * Get multiple image URLs from array of file IDs
 * Filters out null values - returns only valid URLs
 * @param fileIds - Array of Appwrite file IDs
 * @param width - Image width
 * @param height - Image height
 * @returns Array of valid image URLs (null values filtered out)
 */
export function getImageUrls(
  fileIds: string[] | null | undefined,
  width: number = 400,
  height: number = 400
): string[] {
  if (!fileIds || !Array.isArray(fileIds)) {
    return [];
  }

  return fileIds
    .map(fileId => getImageUrl(fileId, width, height))
    .filter((url): url is string => url !== null);
}

/**
 * Get multiple image URLs with guaranteed fallback for first image
 * Ensures at least one image URL is returned (uses fallback if needed)
 * @param fileIds - Array of Appwrite file IDs
 * @param width - Image width
 * @param height - Image height
 * @returns Array of image URLs (at least one guaranteed)
 */
export function getImageUrlsWithFallback(
  fileIds: string[] | null | undefined,
  width: number = 400,
  height: number = 400
): string[] {
  const urls = getImageUrls(fileIds, width, height);
  
  // If no valid URLs, return fallback
  if (urls.length === 0) {
    return [DEFAULT_FALLBACK_IMAGE];
  }
  
  return urls;
}

/**
 * Parse images field from Appwrite document
 * Handles both array and JSON string formats
 * @returns Array of file IDs (strings only, no nulls)
 */
export function parseProductImages(images: any): string[] {
  if (!images) return [];

  // If it's already an array
  if (Array.isArray(images)) {
    return images.filter(img => typeof img === 'string' && img.trim() !== '');
  }

  // If it's a JSON string, try to parse
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        return parsed
          .map(item => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object' && item.url) return item.url;
            if (item && typeof item === 'object' && item.id) return item.id;
            return null;
          })
          .filter((img): img is string => img !== null && img.trim() !== '');
      }
    } catch (error) {
      console.error('Error parsing images JSON:', error);
    }
  }

  return [];
}

/**
 * Safe product image mapper for UI components
 * Converts database images to valid UI image objects with guaranteed valid URLs
 * @param images - Raw images from database (array of file IDs or URLs)
 * @param productName - Product name for alt text
 * @param width - Image width
 * @param height - Image height
 * @returns Array of ProductImage objects with valid URLs
 */
export function mapProductImagesToUI(
  images: string[] | null | undefined,
  productName: string,
  width: number = 800,
  height: number = 800
): Array<{ id: number; src: string; alt: string }> {
  const parsedImages = parseProductImages(images);
  const imageUrls = getImageUrlsWithFallback(parsedImages, width, height);
  
  return imageUrls.map((src, index) => ({
    id: index + 1,
    src,
    alt: `${productName} - View ${index + 1}`
  }));
}

/**
 * Get first product image URL with fallback
 * Useful for thumbnails and product cards
 * @param images - Raw images from database
 * @param width - Image width
 * @param height - Image height
 * @returns Valid image URL (never null)
 */
export function getFirstProductImage(
  images: string[] | null | undefined,
  width: number = 400,
  height: number = 400
): string {
  const parsedImages = parseProductImages(images);
  
  if (parsedImages.length === 0) {
    return DEFAULT_FALLBACK_IMAGE;
  }
  
  return getImageUrlWithFallback(parsedImages[0], width, height);
}
