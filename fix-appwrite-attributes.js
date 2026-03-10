/**
 * Fix Appwrite Attributes Script
 * 
 * This script adds the attributes that failed during initial setup
 * (attributes with default values must be optional in Appwrite)
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
};

const client = new sdk.Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new sdk.Databases(client);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fixPerfumesCollection() {
  console.log('\n📚 Fixing Perfumes Collection attributes...');
  
  try {
    // isInStock - make it optional with default
    await databases.createStringAttribute(
      config.databaseId,
      config.perfumesCollectionId,
      'isInStock',
      10,
      false, // Not required
      'true', // Default value
      false
    );
    console.log('  ✓ isInStock added (optional with default)');
  } catch (error) {
    if (error.code === 409) {
      console.log('  ⚠ isInStock already exists');
    } else {
      console.error('  ✗ Error:', error.message);
    }
  }
}

async function fixOrdersCollection() {
  console.log('\n📦 Fixing Orders Collection attributes...');
  
  const attributes = [
    { key: 'status', default: 'pending' },
    { key: 'paymentmethod', default: 'cash_on_delivery' },
  ];
  
  for (const attr of attributes) {
    try {
      await databases.createStringAttribute(
        config.databaseId,
        config.ordersCollectionId,
        attr.key,
        100,
        false, // Not required
        attr.default,
        false
      );
      console.log(`  ✓ ${attr.key} added (optional with default)`);
      await sleep(500);
    } catch (error) {
      if (error.code === 409) {
        console.log(`  ⚠ ${attr.key} already exists`);
      } else {
        console.error(`  ✗ Error creating ${attr.key}:`, error.message);
      }
    }
  }
  
  // Ispaid boolean attribute
  try {
    await databases.createBooleanAttribute(
      config.databaseId,
      config.ordersCollectionId,
      'Ispaid',
      false, // Not required
      false  // Default value
    );
    console.log('  ✓ Ispaid added (optional with default)');
  } catch (error) {
    if (error.code === 409) {
      console.log('  ⚠ Ispaid already exists');
    } else {
      console.error('  ✗ Error:', error.message);
    }
  }
}

async function fixUsersCollection() {
  console.log('\n👥 Fixing Users Collection attributes...');
  
  try {
    await databases.createStringAttribute(
      config.databaseId,
      config.usersCollectionId,
      'role',
      50,
      false, // Not required
      'user', // Default value
      false
    );
    console.log('  ✓ role added (optional with default)');
  } catch (error) {
    if (error.code === 409) {
      console.log('  ⚠ role already exists');
    } else {
      console.error('  ✗ Error:', error.message);
    }
  }
}

async function main() {
  console.log('🔧 Fixing Appwrite Attributes');
  console.log('=' .repeat(50));
  
  try {
    await fixPerfumesCollection();
    await fixOrdersCollection();
    await fixUsersCollection();
    
    console.log('\n✅ Attributes fixed!');
    console.log('\n⚠️ IMPORTANT: Wait 30 seconds for Appwrite to finish indexing.');
  } catch (error) {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  }
}

main();
