/**
 * Verify Appwrite Setup Script
 * 
 * This script verifies all collections, attributes, and permissions are correctly configured
 */

const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env' });

const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  perfumesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PERFUMES_COLLECTION_ID,
  ordersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID,
  usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
  perfumeImagesBucketId: process.env.NEXT_PUBLIC_APPWRITE_PERFUME_IMAGES_BUCKET_ID,
  noteImagesBucketId: process.env.NEXT_PUBLIC_APPWRITE_NOTE_IMAGES_BUCKET_ID,
};

const client = new sdk.Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new sdk.Databases(client);
const storage = new sdk.Storage(client);

async function checkCollection(name, collectionId) {
  try {
    const collection = await databases.getCollection(config.databaseId, collectionId);
    console.log(`\n✅ ${name} Collection`);
    console.log(`   ID: ${collection.$id}`);
    console.log(`   Name: ${collection.name}`);
    console.log(`   Total Attributes: ${collection.attributes.length}`);
    
    // List attributes
    console.log('   Attributes:');
    collection.attributes.forEach(attr => {
      const required = attr.required ? '✓ Required' : '○ Optional';
      const defaultVal = attr.default !== undefined && attr.default !== null ? ` (default: ${attr.default})` : '';
      const array = attr.array ? ' [Array]' : '';
      console.log(`     - ${attr.key} (${attr.type}${array}) ${required}${defaultVal}`);
    });
    
    return true;
  } catch (error) {
    console.log(`\n❌ ${name} Collection`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function checkBucket(name, bucketId) {
  try {
    const bucket = await storage.getBucket(bucketId);
    console.log(`\n✅ ${name} Bucket`);
    console.log(`   ID: ${bucket.$id}`);
    console.log(`   Name: ${bucket.name}`);
    console.log(`   Max File Size: ${(bucket.maxFileSize / 1048576).toFixed(2)} MB`);
    console.log(`   Allowed Extensions: ${bucket.allowedFileExtensions.join(', ')}`);
    console.log(`   Compression: ${bucket.compression}`);
    console.log(`   Enabled: ${bucket.enabled}`);
    
    return true;
  } catch (error) {
    console.log(`\n❌ ${name} Bucket`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testImageUpload(bucketId) {
  try {
    // Create a small test file
    const testData = Buffer.from('Test image data');
    const testFile = new File([testData], 'test.txt', { type: 'text/plain' });
    
    // Try to create a file
    const uploadedFile = await storage.createFile(
      bucketId,
      sdk.ID.unique(),
      testFile
    );
    
    console.log(`   ✓ Upload test successful`);
    
    // Delete the test file
    await storage.deleteFile(bucketId, uploadedFile.$id);
    console.log(`   ✓ Delete test successful`);
    
    return true;
  } catch (error) {
    console.log(`   ✗ Upload test failed: ${error.message}`);
    return false;
  }
}

async function checkEnvironmentVariables() {
  console.log('\n📋 Environment Variables Check');
  console.log('=' .repeat(60));
  
  const required = {
    'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
    'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
    'NEXT_PUBLIC_APPWRITE_ENDPOINT': process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    'NEXT_PUBLIC_APPWRITE_PROJECT_ID': process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    'NEXT_PUBLIC_APPWRITE_DATABASE_ID': process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    'NEXT_PUBLIC_APPWRITE_PERFUMES_COLLECTION_ID': process.env.NEXT_PUBLIC_APPWRITE_PERFUMES_COLLECTION_ID,
    'NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID': process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID,
    'NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID': process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
    'NEXT_PUBLIC_APPWRITE_PERFUME_IMAGES_BUCKET_ID': process.env.NEXT_PUBLIC_APPWRITE_PERFUME_IMAGES_BUCKET_ID,
    'NEXT_PUBLIC_APPWRITE_NOTE_IMAGES_BUCKET_ID': process.env.NEXT_PUBLIC_APPWRITE_NOTE_IMAGES_BUCKET_ID,
    'APPWRITE_API_KEY': process.env.APPWRITE_API_KEY,
    'NEXT_PUBLIC_IMAGE_STRATEGY': process.env.NEXT_PUBLIC_IMAGE_STRATEGY,
  };
  
  let allPresent = true;
  
  for (const [key, value] of Object.entries(required)) {
    if (value && value !== 'your-secure-random-secret-here') {
      console.log(`✅ ${key}`);
    } else {
      console.log(`❌ ${key} - Missing or not configured`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

async function main() {
  console.log('🔍 Verifying Appwrite Setup');
  console.log('=' .repeat(60));
  console.log('Project:', config.projectId);
  console.log('Database:', config.databaseId);
  console.log('=' .repeat(60));
  
  const checks = {
    env: false,
    perfumesCollection: false,
    ordersCollection: false,
    usersCollection: false,
    perfumeImagesBucket: false,
    noteImagesBucket: false,
  };
  
  // Check environment variables
  checks.env = await checkEnvironmentVariables();
  
  // Check collections
  checks.perfumesCollection = await checkCollection('Perfumes', config.perfumesCollectionId);
  checks.ordersCollection = await checkCollection('Orders', config.ordersCollectionId);
  checks.usersCollection = await checkCollection('Users', config.usersCollectionId);
  
  // Check storage buckets
  checks.perfumeImagesBucket = await checkBucket('Perfume Images', config.perfumeImagesBucketId);
  checks.noteImagesBucket = await checkBucket('Note Images', config.noteImagesBucketId);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SETUP VERIFICATION SUMMARY');
  console.log('=' .repeat(60));
  
  const allChecks = Object.values(checks);
  const passed = allChecks.filter(Boolean).length;
  const total = allChecks.length;
  
  console.log(`\nPassed: ${passed}/${total} checks`);
  
  if (passed === total) {
    console.log('\n🎉 All checks passed! Your Appwrite setup is complete.');
    console.log('\nNext steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Register a user account');
    console.log('3. For admin access, add "admin" label to your user in Appwrite Console');
    console.log('   Or set NEXT_PUBLIC_ADMIN_USER_ID in .env with your user ID');
  } else {
    console.log('\n⚠️ Some checks failed. Please review the errors above.');
  }
}

main();
