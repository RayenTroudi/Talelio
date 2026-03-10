/**
 * Configure Bucket Permissions
 * 
 * This script updates bucket permissions to allow proper access
 */

const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env' });

const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY,
  perfumeImagesBucketId: process.env.NEXT_PUBLIC_APPWRITE_PERFUME_IMAGES_BUCKET_ID,
};

const client = new sdk.Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const storage = new sdk.Storage(client);

async function configureBucketPermissions() {
  console.log('🔧 Configuring Bucket Permissions...\n');
  
  try {
    // Get current bucket
    const bucket = await storage.getBucket(config.perfumeImagesBucketId);
    console.log(`Current bucket: ${bucket.name} (${bucket.$id})`);
    
    // Update bucket with proper permissions
    const updatedBucket = await storage.updateBucket(
      config.perfumeImagesBucketId,
      bucket.name,
      [
        sdk.Permission.read(sdk.Role.any()),           // Anyone can read
        sdk.Permission.create(sdk.Role.users()),       // Authenticated users can create
        sdk.Permission.update(sdk.Role.users()),       // Authenticated users can update
        sdk.Permission.delete(sdk.Role.users()),       // Authenticated users can delete
      ],
      false,  // fileSecurity (false = bucket-level permissions)
      true,   // enabled
      undefined, // maxFileSize (keep existing)
      undefined, // allowedFileExtensions (keep existing)
      'none', // compression
      false,  // encryption
      true    // antivirus
    );
    
    console.log('\n✅ Bucket permissions configured successfully!');
    console.log('\nPermissions:');
    console.log('  ✓ Read: Anyone (public)');
    console.log('  ✓ Create: Authenticated users only');
    console.log('  ✓ Update: Authenticated users only');
    console.log('  ✓ Delete: Authenticated users only');
    console.log('\nFile Security: Bucket-level (recommended for public images)');
    
  } catch (error) {
    console.error('\n❌ Error configuring bucket:', error.message);
    
    if (error.code === 404) {
      console.log('\n⚠️ Bucket not found. Please check NEXT_PUBLIC_APPWRITE_PERFUME_IMAGES_BUCKET_ID in .env');
    }
    
    process.exit(1);
  }
}

async function main() {
  console.log('🖼️ Bucket Permission Configuration');
  console.log('=' .repeat(50));
  console.log('Bucket ID:', config.perfumeImagesBucketId);
  console.log('=' .repeat(50) + '\n');
  
  await configureBucketPermissions();
  
  console.log('\n✅ Configuration complete!');
  console.log('\nYou can now:');
  console.log('  1. Upload images through the admin dashboard');
  console.log('  2. Images will be publicly accessible');
  console.log('  3. Only authenticated users can upload/modify images');
}

main();
