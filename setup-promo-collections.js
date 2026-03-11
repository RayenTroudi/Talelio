/**
 * Run once to create PromoCodeRequests and ReferralEarnings collections in Appwrite.
 * Usage: node setup-promo-collections.js
 *
 * After running, add the printed collection IDs to your .env.local:
 *   NEXT_PUBLIC_APPWRITE_PROMO_REQUESTS_COLLECTION_ID=<id>
 *   NEXT_PUBLIC_APPWRITE_REFERRAL_EARNINGS_COLLECTION_ID=<id>
 */
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' }); // fallback to .env

const sdk = require('node-appwrite');

const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function main() {
  console.log('Setting up promo collections...\n');

  // --- PromoCodeRequests ---
  let promoCol;
  try {
    promoCol = await databases.createCollection(
      DATABASE_ID,
      sdk.ID.unique(),
      'PromoCodeRequests',
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ]
    );
    console.log('Created PromoCodeRequests collection:', promoCol.$id);
  } catch (e) {
    console.error('Failed to create PromoCodeRequests:', e.message);
    process.exit(1);
  }

  const promoAttrs = [
    () => databases.createStringAttribute(DATABASE_ID, promoCol.$id, 'userId', 255, true),
    () => databases.createStringAttribute(DATABASE_ID, promoCol.$id, 'userEmail', 255, true),
    () => databases.createStringAttribute(DATABASE_ID, promoCol.$id, 'userName', 255, false, ''),
    () => databases.createStringAttribute(DATABASE_ID, promoCol.$id, 'status', 50, true, 'PENDING'),
    () => databases.createStringAttribute(DATABASE_ID, promoCol.$id, 'promoCode', 50, false, null, false),
  ];

  for (const create of promoAttrs) {
    try { await create(); } catch (e) { console.warn('Attribute warning:', e.message); }
    await sleep(500);
  }

  // Indexes for PromoCodeRequests
  await sleep(1000);
  try {
    await databases.createIndex(DATABASE_ID, promoCol.$id, 'idx_userId', 'key', ['userId']);
    await sleep(300);
    await databases.createIndex(DATABASE_ID, promoCol.$id, 'idx_promoCode', 'unique', ['promoCode']);
    await sleep(300);
    await databases.createIndex(DATABASE_ID, promoCol.$id, 'idx_status', 'key', ['status']);
  } catch (e) {
    console.warn('Index warning:', e.message);
  }

  // --- ReferralEarnings ---
  let earningsCol;
  try {
    earningsCol = await databases.createCollection(
      DATABASE_ID,
      sdk.ID.unique(),
      'ReferralEarnings',
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ]
    );
    console.log('Created ReferralEarnings collection:', earningsCol.$id);
  } catch (e) {
    console.error('Failed to create ReferralEarnings:', e.message);
    process.exit(1);
  }

  const earningsAttrs = [
    () => databases.createStringAttribute(DATABASE_ID, earningsCol.$id, 'orderId', 255, true),
    () => databases.createStringAttribute(DATABASE_ID, earningsCol.$id, 'promoCodeId', 255, true),
    () => databases.createStringAttribute(DATABASE_ID, earningsCol.$id, 'ownerUserId', 255, true),
    () => databases.createStringAttribute(DATABASE_ID, earningsCol.$id, 'ownerEmail', 255, false, ''),
    () => databases.createStringAttribute(DATABASE_ID, earningsCol.$id, 'buyerUserId', 255, true),
    () => databases.createStringAttribute(DATABASE_ID, earningsCol.$id, 'buyerEmail', 255, false, ''),
    () => databases.createFloatAttribute(DATABASE_ID, earningsCol.$id, 'amount', true, 0, 999999),
    () => databases.createStringAttribute(DATABASE_ID, earningsCol.$id, 'currency', 10, true, 'TND'),
  ];

  for (const create of earningsAttrs) {
    try { await create(); } catch (e) { console.warn('Attribute warning:', e.message); }
    await sleep(500);
  }

  // Indexes for ReferralEarnings
  await sleep(1000);
  try {
    await databases.createIndex(DATABASE_ID, earningsCol.$id, 'idx_orderId', 'unique', ['orderId']);
    await sleep(300);
    await databases.createIndex(DATABASE_ID, earningsCol.$id, 'idx_ownerUserId', 'key', ['ownerUserId']);
  } catch (e) {
    console.warn('Index warning:', e.message);
  }

  console.log('\n✅ Setup complete. Add these to your .env.local:');
  console.log(`NEXT_PUBLIC_APPWRITE_PROMO_REQUESTS_COLLECTION_ID=${promoCol.$id}`);
  console.log(`NEXT_PUBLIC_APPWRITE_REFERRAL_EARNINGS_COLLECTION_ID=${earningsCol.$id}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
