/**
 * Appwrite Setup Script
 * 
 * This script creates all necessary collections, attributes, and storage buckets
 * for the Perfume Store application.
 * 
 * Run with: node setup-appwrite.js
 */

const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env' });

// Configuration from .env
const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  perfumeImagesBucketId: process.env.NEXT_PUBLIC_APPWRITE_PERFUME_IMAGES_BUCKET_ID,
};

// Validate configuration
if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId) {
  console.error('❌ Missing required environment variables!');
  console.error('Please ensure .env file contains:');
  console.error('  - NEXT_PUBLIC_APPWRITE_ENDPOINT');
  console.error('  - NEXT_PUBLIC_APPWRITE_PROJECT_ID');
  console.error('  - APPWRITE_API_KEY');
  console.error('  - NEXT_PUBLIC_APPWRITE_DATABASE_ID');
  process.exit(1);
}

// Initialize Appwrite client
const client = new sdk.Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new sdk.Databases(client);
const storage = new sdk.Storage(client);

// Collection IDs
let perfumesCollectionId = '';
let ordersCollectionId = '';
let usersCollectionId = '';
let noteImagesBucketId = '';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createPerfumesCollection() {
  console.log('\n📚 Creating Perfumes Collection...');
  
  try {
    // Create collection
    const collection = await databases.createCollection(
      config.databaseId,
      sdk.ID.unique(),
      'perfumes',
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
        sdk.Permission.delete(sdk.Role.users()),
      ]
    );
    
    perfumesCollectionId = collection.$id;
    console.log(`✅ Perfumes collection created: ${perfumesCollectionId}`);
    
    // Wait a bit for collection to be ready
    await sleep(1000);
    
    // Create attributes
    const attributes = [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'brand', type: 'string', size: 100, required: true },
      { key: 'price', type: 'double', required: true },
      { key: 'category', type: 'string', size: 50, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'isInStock', type: 'string', size: 10, required: true, default: 'true' },
      { key: 'sizes', type: 'string', size: 500, required: true, array: true },
      { key: 'images', type: 'string', size: 100, required: true, array: true },
      { key: 'topNotes', type: 'string', size: 100, required: false, array: true },
      { key: 'middleNotes', type: 'string', size: 100, required: false, array: true },
      { key: 'baseNotes', type: 'string', size: 100, required: false, array: true },
    ];
    
    console.log('Adding attributes...');
    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            config.databaseId,
            perfumesCollectionId,
            attr.key,
            attr.size,
            attr.required,
            attr.default,
            attr.array || false
          );
        } else if (attr.type === 'double') {
          await databases.createFloatAttribute(
            config.databaseId,
            perfumesCollectionId,
            attr.key,
            attr.required,
            undefined,
            undefined,
            attr.default
          );
        }
        console.log(`  ✓ ${attr.key}`);
        await sleep(500); // Wait between attribute creation
      } catch (error) {
        if (error.code === 409) {
          console.log(`  ⚠ ${attr.key} already exists`);
        } else {
          console.error(`  ✗ Error creating ${attr.key}:`, error.message);
        }
      }
    }
    
    console.log('✅ Perfumes collection setup complete');
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠ Perfumes collection already exists');
      // Try to get existing collection ID if possible
    } else {
      console.error('❌ Error creating perfumes collection:', error.message);
    }
  }
}

async function createOrdersCollection() {
  console.log('\n📦 Creating Orders Collection...');
  
  try {
    // Create collection
    const collection = await databases.createCollection(
      config.databaseId,
      sdk.ID.unique(),
      'orders',
      [
        sdk.Permission.read(sdk.Role.users()),
        sdk.Permission.create(sdk.Role.users()),
      ]
    );
    
    ordersCollectionId = collection.$id;
    console.log(`✅ Orders collection created: ${ordersCollectionId}`);
    
    await sleep(1000);
    
    // Create attributes matching the API route exactly
    const attributes = [
      { key: 'UserEmail', type: 'string', size: 255, required: true },
      { key: 'UserName', type: 'string', size: 255, required: true },
      { key: 'shipingAdress', type: 'string', size: 10000, required: true }, // Note: typo is intentional
      { key: 'itemsPrice', type: 'double', required: true },
      { key: 'shipingPrice', type: 'double', required: true }, // Note: typo is intentional
      { key: 'totalPrice', type: 'double', required: true },
      { key: 'status', type: 'string', size: 50, required: true, default: 'pending' },
      { key: 'paymentmethod', type: 'string', size: 100, required: true, default: 'cash_on_delivery' },
      { key: 'Ispaid', type: 'boolean', required: true, default: false },
    ];
    
    console.log('Adding attributes...');
    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            config.databaseId,
            ordersCollectionId,
            attr.key,
            attr.size,
            attr.required,
            attr.default,
            false
          );
        } else if (attr.type === 'double') {
          await databases.createFloatAttribute(
            config.databaseId,
            ordersCollectionId,
            attr.key,
            attr.required,
            undefined,
            undefined,
            attr.default
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            config.databaseId,
            ordersCollectionId,
            attr.key,
            attr.required,
            attr.default
          );
        }
        console.log(`  ✓ ${attr.key}`);
        await sleep(500);
      } catch (error) {
        if (error.code === 409) {
          console.log(`  ⚠ ${attr.key} already exists`);
        } else {
          console.error(`  ✗ Error creating ${attr.key}:`, error.message);
        }
      }
    }
    
    console.log('✅ Orders collection setup complete');
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠ Orders collection already exists');
    } else {
      console.error('❌ Error creating orders collection:', error.message);
    }
  }
}

async function createUsersCollection() {
  console.log('\n👥 Creating Users Collection...');
  
  try {
    // Create collection
    const collection = await databases.createCollection(
      config.databaseId,
      sdk.ID.unique(),
      'users',
      [
        sdk.Permission.read(sdk.Role.users()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
      ]
    );
    
    usersCollectionId = collection.$id;
    console.log(`✅ Users collection created: ${usersCollectionId}`);
    
    await sleep(1000);
    
    // Create attributes
    const attributes = [
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'role', type: 'string', size: 50, required: true, default: 'user' },
    ];
    
    console.log('Adding attributes...');
    for (const attr of attributes) {
      try {
        await databases.createStringAttribute(
          config.databaseId,
          usersCollectionId,
          attr.key,
          attr.size,
          attr.required,
          attr.default,
          false
        );
        console.log(`  ✓ ${attr.key}`);
        await sleep(500);
      } catch (error) {
        if (error.code === 409) {
          console.log(`  ⚠ ${attr.key} already exists`);
        } else {
          console.error(`  ✗ Error creating ${attr.key}:`, error.message);
        }
      }
    }
    
    // Create email index for faster queries
    try {
      await databases.createIndex(
        config.databaseId,
        usersCollectionId,
        'email_index',
        'key',
        ['email'],
        ['asc']
      );
      console.log('  ✓ email_index created');
    } catch (error) {
      if (error.code === 409) {
        console.log('  ⚠ email_index already exists');
      } else {
        console.error('  ✗ Error creating index:', error.message);
      }
    }
    
    console.log('✅ Users collection setup complete');
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠ Users collection already exists');
    } else {
      console.error('❌ Error creating users collection:', error.message);
    }
  }
}

async function createNoteImagesBucket() {
  console.log('\n🖼️ Creating Note Images Bucket...');
  
  try {
    const bucket = await storage.createBucket(
      sdk.ID.unique(),
      'note-images',
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
        sdk.Permission.delete(sdk.Role.users()),
      ],
      false, // fileSecurity
      true,  // enabled
      10485760, // maxFileSize: 10MB
      ['jpg', 'jpeg', 'png', 'webp', 'gif'], // allowedFileExtensions
      'none', // compression
      false,  // encryption
      true    // antivirus
    );
    
    noteImagesBucketId = bucket.$id;
    console.log(`✅ Note images bucket created: ${noteImagesBucketId}`);
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠ Note images bucket already exists');
    } else {
      console.error('❌ Error creating note images bucket:', error.message);
    }
  }
}

async function checkPerfumeImagesBucket() {
  console.log('\n🖼️ Checking Perfume Images Bucket...');
  
  if (!config.perfumeImagesBucketId) {
    console.log('Creating new perfume images bucket...');
    try {
      const bucket = await storage.createBucket(
        sdk.ID.unique(),
        'perfume-images',
        [
          sdk.Permission.read(sdk.Role.any()),
          sdk.Permission.create(sdk.Role.users()),
          sdk.Permission.update(sdk.Role.users()),
          sdk.Permission.delete(sdk.Role.users()),
        ],
        false,
        true,
        10485760,
        ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        'none',
        false,
        true
      );
      
      console.log(`✅ Perfume images bucket created: ${bucket.$id}`);
      console.log('⚠️ UPDATE YOUR .env FILE WITH:', `NEXT_PUBLIC_APPWRITE_PERFUME_IMAGES_BUCKET_ID=${bucket.$id}`);
    } catch (error) {
      console.error('❌ Error creating perfume images bucket:', error.message);
    }
  } else {
    try {
      await storage.getBucket(config.perfumeImagesBucketId);
      console.log(`✅ Perfume images bucket exists: ${config.perfumeImagesBucketId}`);
    } catch (error) {
      console.error('❌ Perfume images bucket not found. Please check the ID in .env');
    }
  }
}

async function updateEnvFile() {
  console.log('\n📝 Environment Variable Summary');
  console.log('================================');
  console.log('Add these to your .env file:\n');
  
  if (perfumesCollectionId) {
    console.log(`NEXT_PUBLIC_APPWRITE_PERFUMES_COLLECTION_ID=${perfumesCollectionId}`);
  }
  if (ordersCollectionId) {
    console.log(`NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID=${ordersCollectionId}`);
  }
  if (usersCollectionId) {
    console.log(`NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=${usersCollectionId}`);
  }
  if (noteImagesBucketId) {
    console.log(`NEXT_PUBLIC_APPWRITE_NOTE_IMAGES_BUCKET_ID=${noteImagesBucketId}`);
  }
  
  console.log('\n📋 Copy the above lines to your .env file!');
}

async function main() {
  console.log('🚀 Starting Appwrite Setup');
  console.log('=' .repeat(50));
  console.log('Endpoint:', config.endpoint);
  console.log('Project:', config.projectId);
  console.log('Database:', config.databaseId);
  console.log('=' .repeat(50));
  
  try {
    await checkPerfumeImagesBucket();
    await createNoteImagesBucket();
    await createPerfumesCollection();
    await createOrdersCollection();
    await createUsersCollection();
    await updateEnvFile();
    
    console.log('\n✅ Setup complete!');
    console.log('\n⚠️ IMPORTANT: Wait 30-60 seconds for Appwrite to finish indexing.');
    console.log('Then restart your dev server: npm run dev');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
