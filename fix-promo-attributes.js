/**
 * Patches the existing PromoCodeRequests and ReferralEarnings collections
 * by adding any attributes that failed during initial setup.
 *
 * Run with: node fix-promo-attributes.js
 */
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const sdk = require('node-appwrite');

const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const PROMO_COL = process.env.NEXT_PUBLIC_APPWRITE_PROMO_REQUESTS_COLLECTION_ID;
const EARNINGS_COL = process.env.NEXT_PUBLIC_APPWRITE_REFERRAL_EARNINGS_COLLECTION_ID;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tryCreate(label, fn) {
  try {
    await fn();
    console.log(`  ✅ ${label}`);
  } catch (e) {
    if (e.code === 409 || e.message?.includes('already exists')) {
      console.log(`  ⚠️  ${label} — already exists, skipping`);
    } else {
      console.error(`  ❌ ${label} — ${e.message}`);
    }
  }
  await sleep(600);
}

async function main() {
  if (!DATABASE_ID || !PROMO_COL || !EARNINGS_COL) {
    console.error('❌ Missing env vars. Make sure .env has all Appwrite IDs.');
    process.exit(1);
  }

  console.log('Patching PromoCodeRequests collection:', PROMO_COL);

  // status: required but NO default (Appwrite rejects required+default together)
  await tryCreate('status attribute', () =>
    databases.createStringAttribute(DATABASE_ID, PROMO_COL, 'status', 50, true)
  );

  // promoCode: optional, no encryption (free plan limitation)
  await tryCreate('promoCode attribute', () =>
    databases.createStringAttribute(DATABASE_ID, PROMO_COL, 'promoCode', 50, false)
  );

  // userId, userEmail, userName — may already exist, harmless if they do
  await tryCreate('userId attribute', () =>
    databases.createStringAttribute(DATABASE_ID, PROMO_COL, 'userId', 255, true)
  );
  await tryCreate('userEmail attribute', () =>
    databases.createStringAttribute(DATABASE_ID, PROMO_COL, 'userEmail', 255, true)
  );
  await tryCreate('userName attribute', () =>
    databases.createStringAttribute(DATABASE_ID, PROMO_COL, 'userName', 255, false)
  );

  // Wait for attributes to become available before creating indexes
  console.log('\nWaiting 5s for attributes to be ready...');
  await sleep(5000);

  await tryCreate('idx_userId index', () =>
    databases.createIndex(DATABASE_ID, PROMO_COL, 'idx_userId', 'key', ['userId'])
  );
  await tryCreate('idx_status index', () =>
    databases.createIndex(DATABASE_ID, PROMO_COL, 'idx_status', 'key', ['status'])
  );
  await tryCreate('idx_promoCode index', () =>
    databases.createIndex(DATABASE_ID, PROMO_COL, 'idx_promoCode', 'unique', ['promoCode'])
  );

  console.log('\nPatching ReferralEarnings collection:', EARNINGS_COL);
  await tryCreate('orderId attribute', () =>
    databases.createStringAttribute(DATABASE_ID, EARNINGS_COL, 'orderId', 255, true)
  );
  await tryCreate('promoCodeId attribute', () =>
    databases.createStringAttribute(DATABASE_ID, EARNINGS_COL, 'promoCodeId', 255, true)
  );
  await tryCreate('ownerUserId attribute', () =>
    databases.createStringAttribute(DATABASE_ID, EARNINGS_COL, 'ownerUserId', 255, true)
  );
  await tryCreate('ownerEmail attribute', () =>
    databases.createStringAttribute(DATABASE_ID, EARNINGS_COL, 'ownerEmail', 255, false)
  );
  await tryCreate('buyerUserId attribute', () =>
    databases.createStringAttribute(DATABASE_ID, EARNINGS_COL, 'buyerUserId', 255, true)
  );
  await tryCreate('buyerEmail attribute', () =>
    databases.createStringAttribute(DATABASE_ID, EARNINGS_COL, 'buyerEmail', 255, false)
  );
  await tryCreate('amount (float) attribute', () =>
    databases.createFloatAttribute(DATABASE_ID, EARNINGS_COL, 'amount', true)
  );
  await tryCreate('currency attribute', () =>
    databases.createStringAttribute(DATABASE_ID, EARNINGS_COL, 'currency', 10, false)
  );

  console.log('\nWaiting 5s for attributes to be ready...');
  await sleep(5000);

  await tryCreate('idx_orderId index', () =>
    databases.createIndex(DATABASE_ID, EARNINGS_COL, 'idx_orderId', 'unique', ['orderId'])
  );
  await tryCreate('idx_ownerUserId index', () =>
    databases.createIndex(DATABASE_ID, EARNINGS_COL, 'idx_ownerUserId', 'key', ['ownerUserId'])
  );

  console.log('\n✅ Patch complete.');
}

main().catch(console.error);
