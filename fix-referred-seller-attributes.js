/**
 * Adds referral-split attributes to existing Appwrite collections.
 *   PromoCodeRequests  → referredByPromoCode, referredByUserId
 *   ReferralEarnings   → itemsCount, earningType
 * Also converts ReferralEarnings.idx_orderId from unique → key index.
 *
 * Run with: node fix-referred-seller-attributes.js
 */
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const sdk = require('node-appwrite');

const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const DATABASE_ID  = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const PROMO_COL    = process.env.NEXT_PUBLIC_APPWRITE_PROMO_REQUESTS_COLLECTION_ID;
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

async function tryDelete(label, fn) {
  try {
    await fn();
    console.log(`  ✅ ${label}`);
  } catch (e) {
    if (e.code === 404 || e.message?.includes('not found')) {
      console.log(`  ⚠️  ${label} — not found, skipping`);
    } else {
      console.error(`  ❌ ${label} — ${e.message}`);
    }
  }
  await sleep(600);
}

async function main() {
  if (!DATABASE_ID || !PROMO_COL || !EARNINGS_COL) {
    console.error('❌ Missing env vars. Make sure .env.local has all Appwrite IDs.');
    process.exit(1);
  }

  console.log('\n📦 Patching PromoCodeRequests:', PROMO_COL);
  await tryCreate('referredByPromoCode attribute', () =>
    databases.createStringAttribute(DATABASE_ID, PROMO_COL, 'referredByPromoCode', 50, false)
  );
  await tryCreate('referredByUserId attribute', () =>
    databases.createStringAttribute(DATABASE_ID, PROMO_COL, 'referredByUserId', 255, false)
  );

  console.log('\n📦 Patching ReferralEarnings:', EARNINGS_COL);
  await tryCreate('itemsCount attribute', () =>
    databases.createIntegerAttribute(DATABASE_ID, EARNINGS_COL, 'itemsCount', false, 0, 999999)
  );
  await tryCreate('earningType attribute', () =>
    databases.createStringAttribute(DATABASE_ID, EARNINGS_COL, 'earningType', 10, false)
  );

  console.log('\nWaiting 6s for attributes to be ready...');
  await sleep(6000);

  console.log('\n🔧 Updating ReferralEarnings idx_orderId index (unique → key)...');
  await tryDelete('delete idx_orderId unique index', () =>
    databases.deleteIndex(DATABASE_ID, EARNINGS_COL, 'idx_orderId')
  );
  await sleep(1000);
  await tryCreate('idx_orderId key index (non-unique)', () =>
    databases.createIndex(DATABASE_ID, EARNINGS_COL, 'idx_orderId', 'key', ['orderId'])
  );
  await tryCreate('idx_earningType key index', () =>
    databases.createIndex(DATABASE_ID, EARNINGS_COL, 'idx_earningType', 'key', ['earningType'])
  );

  console.log('\n✅ Migration complete.');
}

main().catch(console.error);
