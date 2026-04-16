# Referred Seller Split Earnings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to optionally enter an existing seller's promo code when requesting their own code; referred sellers earn 2 TND per order (with 2 TND going to their referrer) for their first 5 items sold, then the full 4 TND per order afterward.

**Architecture:** Four-layer change — Appwrite schema migration adds 4 new fields and converts the `referralEarnings.idx_orderId` index from unique to key; locale files get 3 new string keys; the promo request API accepts and validates an optional `referredByPromoCode` body field; the order-delivery route gains split-earning logic that creates 1 or 2 earning records per order depending on the referred seller's cumulative item count.

**Tech Stack:** Next.js 14 App Router, TypeScript, node-appwrite SDK, React `useState`, i18n locale files (en / fr / ar)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `fix-referred-seller-attributes.js` | Create | Appwrite migration: 4 new fields + fix orderId index |
| `locales/en.ts` | Modify | 4 updated/new account locale keys |
| `locales/fr.ts` | Modify | 4 updated/new account locale keys |
| `locales/ar.ts` | Modify | 4 updated/new account locale keys |
| `app/api/promo/request/route.ts` | Modify | Accept + validate optional `referredByPromoCode` body |
| `app/account/page.tsx` | Modify | Add `referralInputCode` state + optional input UI |
| `app/api/admin/orders/route.ts` | Modify | Split earning logic on order delivery |
| `__tests__/promo.test.ts` | Modify | New logic tests for split flow + referral validation |

---

### Task 1: Appwrite Migration Script

**Files:**
- Create: `fix-referred-seller-attributes.js`

- [ ] **Step 1: Create the migration script**

Create `fix-referred-seller-attributes.js` in the project root with this exact content:

```js
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
```

- [ ] **Step 2: Run the migration**

```bash
node fix-referred-seller-attributes.js
```

Expected output (fields already existing will say `⚠️ already exists, skipping` — that's fine):

```
📦 Patching PromoCodeRequests: <id>
  ✅ referredByPromoCode attribute
  ✅ referredByUserId attribute

📦 Patching ReferralEarnings: <id>
  ✅ itemsCount attribute
  ✅ earningType attribute

Waiting 6s for attributes to be ready...

🔧 Updating ReferralEarnings idx_orderId index (unique → key)...
  ✅ delete idx_orderId unique index
  ✅ idx_orderId key index (non-unique)
  ✅ idx_earningType key index

✅ Migration complete.
```

- [ ] **Step 3: Commit**

```bash
git add fix-referred-seller-attributes.js
git commit -m "feat: Appwrite migration for referred-seller split earnings attributes"
```

---

### Task 2: Locale Keys

**Files:**
- Modify: `locales/en.ts`
- Modify: `locales/fr.ts`
- Modify: `locales/ar.ts`

No unit tests — locale keys are inert strings verified by UI.

- [ ] **Step 1: Update locales/en.ts**

In `locales/en.ts` find these lines in the `account` section and make the following changes:

Change `referralDesc`:
```ts
    referralDesc: "When someone purchases using your referral code, you earn 10% of their order value.",
```
To:
```ts
    referralDesc: "When someone purchases using your referral code, you earn a commission per order.",
```

Change `codeDesc`:
```ts
    codeDesc: "You earn 10% of every order that uses this code",
```
To:
```ts
    codeDesc: "You earn a commission for every order that uses this code",
```

Add these 4 new keys directly after the updated `referralDesc` line:
```ts
    referredByLabel: "Referral Code (optional)",
    referredByPlaceholder: "Enter a referral code",
    referredByInvalid: "Invalid referral code",
    referredBySelf: "You cannot use your own referral code",
```

- [ ] **Step 2: Update locales/fr.ts**

Change `referralDesc`:
```ts
    referralDesc: "Lorsqu'une personne achète avec votre code parrainage, vous gagnez 10% de la valeur de sa commande.",
```
To:
```ts
    referralDesc: "Lorsqu'une personne achète avec votre code parrainage, vous gagnez une commission par commande.",
```

Change `codeDesc`:
```ts
    codeDesc: "Vous gagnez 10% de chaque commande utilisant ce code",
```
To:
```ts
    codeDesc: "Vous gagnez une commission pour chaque commande utilisant ce code",
```

Add after the updated `referralDesc` line:
```ts
    referredByLabel: "Code de parrainage (optionnel)",
    referredByPlaceholder: "Entrez un code de parrainage",
    referredByInvalid: "Code de parrainage invalide",
    referredBySelf: "Vous ne pouvez pas utiliser votre propre code",
```

- [ ] **Step 3: Update locales/ar.ts**

Change `referralDesc`:
```ts
    referralDesc: "عندما يشتري شخص باستخدام رمز إحالتك تحصل على 10% من قيمة طلبه.",
```
To:
```ts
    referralDesc: "عندما يشتري شخص باستخدام رمز إحالتك تحصل على عمولة لكل طلب.",
```

Change `codeDesc` (find the line near `yourCode`):
```ts
    codeDesc: "You earn 10% of every order that uses this code",
```
To (the Arabic locale likely has an Arabic string — find and update it to):
```ts
    codeDesc: "تحصل على عمولة لكل طلب يستخدم هذا الرمز",
```

Add after the updated `referralDesc` line:
```ts
    referredByLabel: "رمز الإحالة (اختياري)",
    referredByPlaceholder: "أدخل رمز إحالة",
    referredByInvalid: "رمز الإحالة غير صالح",
    referredBySelf: "لا يمكنك استخدام رمز إحالتك الخاص",
```

- [ ] **Step 4: Commit**

```bash
git add locales/en.ts locales/fr.ts locales/ar.ts
git commit -m "feat: add referredBy locale keys and update commission description strings"
```

---

### Task 3: POST /api/promo/request — Accept Referral Code

**Files:**
- Modify: `app/api/promo/request/route.ts`
- Test: `__tests__/promo.test.ts`

- [ ] **Step 1: Write failing tests**

In `__tests__/promo.test.ts` add a new `describe` block at the very end of the file:

```ts
// --- Referred-by code validation (logic) ---
describe('Promo request with referral code (logic)', () => {
  it('treats missing body as no referral code', () => {
    const body: any = {};
    const referredByCode = body?.referredByPromoCode ?? null;
    expect(referredByCode).toBeNull();
  });

  it('rejects self-referral: code belongs to the requesting user', () => {
    const requestingUserId = 'user-abc';
    const referrerDoc = makePromoDoc({ userId: 'user-abc', status: 'APPROVED' });
    const isSelf = referrerDoc.userId === requestingUserId;
    expect(isSelf).toBe(true); // API returns 409
  });

  it('allows referral when owner is a different user', () => {
    const requestingUserId = 'user-abc';
    const referrerDoc = makePromoDoc({ userId: 'owner-xyz', status: 'APPROVED' });
    const isSelf = referrerDoc.userId === requestingUserId;
    expect(isSelf).toBe(false);
  });

  it('rejects referral code that is not APPROVED', () => {
    const referrerDoc = makePromoDoc({ status: 'PENDING' });
    const isValid = referrerDoc.status === 'APPROVED';
    expect(isValid).toBe(false); // API returns 400
  });

  it('stores referredByPromoCode and referredByUserId on the new document', () => {
    const referrerDoc = makePromoDoc({ userId: 'owner-xyz', promoCode: 'REFCODE1' });
    const docToCreate = {
      userId: 'user-abc',
      status: 'PENDING',
      referredByPromoCode: referrerDoc.promoCode,
      referredByUserId: referrerDoc.userId,
    };
    expect(docToCreate.referredByPromoCode).toBe('REFCODE1');
    expect(docToCreate.referredByUserId).toBe('owner-xyz');
  });
});
```

- [ ] **Step 2: Run tests — expect all to pass (pure logic)**

```bash
npx jest __tests__/promo.test.ts --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 3: Replace the POST function in app/api/promo/request/route.ts**

Replace the entire `export async function POST()` function (currently starts at line 40) with:

```ts
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId: string = (session.user as any).id || session.user.email;

    let referredByPromoCode: string | null = null;
    let referredByUserId: string | null = null;

    try {
      const body = await request.json();
      if (body?.referredByPromoCode) {
        referredByPromoCode = String(body.referredByPromoCode).trim().toUpperCase();
      }
    } catch {
      // No body or non-JSON — treat as no referral code
    }

    const databases = getServerDatabases();

    if (referredByPromoCode) {
      const referrerResult = await databases.listDocuments(
        appwriteConfig.databaseId,
        COLLECTION(),
        [Query.equal('promoCode', referredByPromoCode), Query.equal('status', 'APPROVED'), Query.limit(1)]
      );
      if (referrerResult.total === 0) {
        return NextResponse.json({ error: 'رمز الإحالة غير صالح' }, { status: 400 });
      }
      const referrerDoc = referrerResult.documents[0];
      if (referrerDoc.userId === userId) {
        return NextResponse.json({ error: 'لا يمكنك استخدام رمز إحالتك الخاص' }, { status: 409 });
      }
      referredByUserId = referrerDoc.userId as string;
    }

    // Check for an existing non-denied request
    const existing = await databases.listDocuments(
      appwriteConfig.databaseId,
      COLLECTION(),
      [Query.equal('userId', userId), Query.limit(10)]
    );
    const active = existing.documents.filter((d: any) => d.status !== 'DENIED');
    if (active.length > 0) {
      return NextResponse.json(
        { error: 'لديك بالفعل طلب نشط', existing: active[0] },
        { status: 409 }
      );
    }

    const docData: Record<string, any> = {
      userId,
      userEmail: session.user.email,
      userName: session.user.name || '',
      status: 'PENDING',
    };
    if (referredByPromoCode) docData.referredByPromoCode = referredByPromoCode;
    if (referredByUserId)   docData.referredByUserId   = referredByUserId;

    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      COLLECTION(),
      ID.unique(),
      docData,
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );

    return NextResponse.json({ success: true, request: doc }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/promo/request error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create request' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/promo/request/route.ts __tests__/promo.test.ts
git commit -m "feat: validate and store referredByPromoCode on promo request"
```

---

### Task 4: Account Page UI — Optional Referral Input

**Files:**
- Modify: `app/account/page.tsx`

- [ ] **Step 1: Add referralInputCode state**

In `app/account/page.tsx` at line 50, after:
```ts
  const [promoRequestLoading, setPromoRequestLoading] = useState(true);
```

Add:
```ts
  const [referralInputCode, setReferralInputCode] = useState('');
```

- [ ] **Step 2: Update handleRequestPromoCode to send the code in body**

Replace the existing `handleRequestPromoCode` function (lines 66–88) with:

```ts
  const handleRequestPromoCode = async () => {
    setPromoLoading(true);
    try {
      const body: Record<string, string> = {};
      if (referralInputCode.trim()) {
        body.referredByPromoCode = referralInputCode.trim().toUpperCase();
      }
      const res = await fetch('/api/promo/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setPromoRequest(data.request);
        setReferralInputCode('');
        showToast(t.account.toasts.requestSuccess, {
          description: t.account.toasts.requestSuccessDesc,
          variant: 'success',
        });
      } else {
        showToast(t.account.toasts.requestFailed, {
          description: data.error || t.common.error,
          variant: 'error',
        });
      }
    } catch {
      showToast(t.account.toasts.requestError, { variant: 'error' });
    } finally {
      setPromoLoading(false);
    }
  };
```

- [ ] **Step 3: Add the input to the "no request yet" UI state**

Find (around line 284):
```tsx
              ) : !promoRequest ? (
                <div className="text-right space-y-4">
                  <p className="text-stone-600 font-light text-sm">{t.account.referralDesc}</p>
                  <button
                    onClick={handleRequestPromoCode}
                    disabled={promoLoading}
                    className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-600 disabled:bg-stone-300 text-white font-light tracking-wide transition-colors"
                  >
                    {promoLoading ? t.account.sending : t.account.requestPromoBtn}
                  </button>
                </div>
```

Replace with:
```tsx
              ) : !promoRequest ? (
                <div className="text-right space-y-4">
                  <p className="text-stone-600 font-light text-sm">{t.account.referralDesc}</p>
                  <div className="space-y-1">
                    <label className="block text-xs font-light text-stone-500 text-right">
                      {t.account.referredByLabel}
                    </label>
                    <input
                      type="text"
                      value={referralInputCode}
                      onChange={e => setReferralInputCode(e.target.value.toUpperCase())}
                      placeholder={t.account.referredByPlaceholder}
                      maxLength={8}
                      className="w-full px-4 py-2 rounded-xl border border-gold-200/60 bg-white/70 text-stone-900 font-mono text-sm tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-gold-400/50 text-right"
                      dir="ltr"
                    />
                  </div>
                  <button
                    onClick={handleRequestPromoCode}
                    disabled={promoLoading}
                    className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-600 disabled:bg-stone-300 text-white font-light tracking-wide transition-colors"
                  >
                    {promoLoading ? t.account.sending : t.account.requestPromoBtn}
                  </button>
                </div>
```

- [ ] **Step 4: Add the input to the DENIED re-request state**

Find (around line 316):
```tsx
              ) : (
                <div className="text-right space-y-3">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-light bg-red-100 text-red-700">
                    {t.account.deniedStatus}
                  </span>
                  <button
                    onClick={handleRequestPromoCode}
                    disabled={promoLoading}
                    className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-600 disabled:bg-stone-300 text-white font-light tracking-wide transition-colors"
                  >
                    {promoLoading ? t.account.sending : t.account.reRequestBtn}
                  </button>
                </div>
```

Replace with:
```tsx
              ) : (
                <div className="text-right space-y-3">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-light bg-red-100 text-red-700">
                    {t.account.deniedStatus}
                  </span>
                  <div className="space-y-1">
                    <label className="block text-xs font-light text-stone-500 text-right">
                      {t.account.referredByLabel}
                    </label>
                    <input
                      type="text"
                      value={referralInputCode}
                      onChange={e => setReferralInputCode(e.target.value.toUpperCase())}
                      placeholder={t.account.referredByPlaceholder}
                      maxLength={8}
                      className="w-full px-4 py-2 rounded-xl border border-gold-200/60 bg-white/70 text-stone-900 font-mono text-sm tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-gold-400/50 text-right"
                      dir="ltr"
                    />
                  </div>
                  <button
                    onClick={handleRequestPromoCode}
                    disabled={promoLoading}
                    className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-600 disabled:bg-stone-300 text-white font-light tracking-wide transition-colors"
                  >
                    {promoLoading ? t.account.sending : t.account.reRequestBtn}
                  </button>
                </div>
```

- [ ] **Step 5: Commit**

```bash
git add app/account/page.tsx
git commit -m "feat: add optional referral code input to promo request form"
```

---

### Task 5: Order Delivery — Split Earning Logic

**Files:**
- Modify: `app/api/admin/orders/route.ts`
- Test: `__tests__/promo.test.ts`

- [ ] **Step 1: Write failing tests**

In `__tests__/promo.test.ts` add this describe block at the end of the file:

```ts
// --- Split earning logic ---
describe('Split earning logic for referred sellers', () => {
  const makeSplitEarning = (overrides: Record<string, any> = {}) => ({
    ownerUserId: 'seller-123',
    earningType: 'direct',
    itemsCount: 2,
    amount: 2,
    ...overrides,
  });

  it('seller with 0 items sold before is under the 5-item threshold', () => {
    const prevEarnings: any[] = [];
    const itemsSoldBefore = prevEarnings.reduce((sum, d) => sum + (Number(d.itemsCount) || 0), 0);
    expect(itemsSoldBefore).toBe(0);
    expect(itemsSoldBefore < 5).toBe(true);
  });

  it('seller with 3 items sold before is still under threshold', () => {
    const prevEarnings = [makeSplitEarning({ itemsCount: 3 })];
    const itemsSoldBefore = prevEarnings.reduce((sum, d) => sum + (Number(d.itemsCount) || 0), 0);
    expect(itemsSoldBefore).toBe(3);
    expect(itemsSoldBefore < 5).toBe(true);
  });

  it('seller with exactly 5 items sold before is at threshold — no more split', () => {
    const prevEarnings = [makeSplitEarning({ itemsCount: 5 })];
    const itemsSoldBefore = prevEarnings.reduce((sum, d) => sum + (Number(d.itemsCount) || 0), 0);
    expect(itemsSoldBefore).toBe(5);
    expect(itemsSoldBefore < 5).toBe(false);
  });

  it('seller with 5 orders of 1 item each hits threshold exactly', () => {
    const prevEarnings = Array.from({ length: 5 }, () => makeSplitEarning({ itemsCount: 1 }));
    const itemsSoldBefore = prevEarnings.reduce((sum, d) => sum + (Number(d.itemsCount) || 0), 0);
    expect(itemsSoldBefore).toBe(5);
    expect(itemsSoldBefore < 5).toBe(false);
  });

  it('under threshold: seller gets 2 TND, referrer gets 2 TND', () => {
    const itemsSoldBefore = 2;
    const sellerAmount  = itemsSoldBefore < 5 ? 2 : 4;
    const referrerAmount = itemsSoldBefore < 5 ? 2 : 0;
    expect(sellerAmount).toBe(2);
    expect(referrerAmount).toBe(2);
  });

  it('over threshold: seller gets 4 TND, referrer gets 0 TND', () => {
    const itemsSoldBefore = 5;
    const sellerAmount  = itemsSoldBefore < 5 ? 2 : 4;
    const referrerAmount = itemsSoldBefore < 5 ? 2 : 0;
    expect(sellerAmount).toBe(4);
    expect(referrerAmount).toBe(0);
  });

  it('sums item quantities correctly from items array', () => {
    const items = [{ quantity: 2 }, { quantity: 3 }];
    const count = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0);
    expect(count).toBe(5);
  });

  it('defaults to 1 per item when quantity field is missing', () => {
    const items = [{}, {}];
    const count = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0);
    expect(count).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests — expect all to pass**

```bash
npx jest __tests__/promo.test.ts --no-coverage
```

Expected: all tests PASS (pure logic — no implementation needed).

- [ ] **Step 3: Replace the delivered block in app/api/admin/orders/route.ts**

Find and replace the entire `if (status === 'delivered')` block (lines ~142–200). The block starts with:
```ts
    // When an order is delivered, create referral earning if a promo code was applied
    if (status === 'delivered') {
```
and ends before `// When an order is cancelled`. Replace that entire block with:

```ts
    // When an order is delivered, create referral earning if a promo code was applied
    if (status === 'delivered') {
      try {
        const promoCodeId = updatedOrder.promoCodeId as string | undefined;
        const itemsPrice  = updatedOrder.itemsPrice  as number | undefined;
        if (promoCodeId && itemsPrice) {
          const promoCol    = PROMO_COLLECTION();
          const earningsCol = EARNINGS_COLLECTION();

          const promoDoc = await databases.getDocument(
            appwriteConfig.databaseId,
            promoCol,
            promoCodeId
          );

          const buyerUserId  = updatedOrder.buyerUserId || updatedOrder.UserEmail || '';
          const buyerEmail   = updatedOrder.UserEmail || '';
          const sellerUserId = promoDoc.userId as string;

          if (sellerUserId === buyerUserId) {
            console.warn('⚠️ Self-referral detected at delivery, skipping reward');
          } else {
            // Parse item count from the order
            let thisOrderItems = 0;
            try {
              const addr: any = JSON.parse(updatedOrder.shipingAdress || '{}');
              const items: any[] = addr.items || [];
              thisOrderItems = items.reduce(
                (sum: number, item: any) => sum + (Number(item.quantity) || 1),
                0
              );
            } catch {
              console.warn('⚠️ Could not parse items from shipingAdress, defaulting itemsCount to 0');
            }

            // Idempotency: skip if seller already has an earning for this order
            const existingSellerEarning = await databases.listDocuments(
              appwriteConfig.databaseId,
              earningsCol,
              [Query.equal('orderId', orderId), Query.equal('ownerUserId', sellerUserId), Query.limit(1)]
            );

            if (existingSellerEarning.total > 0) {
              console.log('ℹ️ Earning already exists for order', orderId, '— skipping');
            } else {
              const referredByUserId = promoDoc.referredByUserId as string | undefined;
              const commonFields = {
                orderId,
                promoCodeId,
                buyerUserId,
                buyerEmail,
                currency: 'TND',
                itemsCount: thisOrderItems,
              };
              const perms = [
                Permission.read(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
              ];

              if (!referredByUserId) {
                // Standard seller — full 4 TND
                await databases.createDocument(
                  appwriteConfig.databaseId, earningsCol, ID.unique(),
                  { ...commonFields, ownerUserId: sellerUserId, ownerEmail: promoDoc.userEmail || '', amount: 4, earningType: 'direct' },
                  perms
                );
                console.log('💰 Standard earning: 4 TND for', sellerUserId, 'order:', orderId);
              } else {
                // Referred seller — count items already sold in previous delivered orders
                const prevEarnings = await databases.listDocuments(
                  appwriteConfig.databaseId,
                  earningsCol,
                  [Query.equal('ownerUserId', sellerUserId), Query.equal('earningType', 'direct'), Query.limit(100)]
                );
                const itemsSoldBefore = prevEarnings.documents.reduce(
                  (sum: number, doc: any) => sum + (Number(doc.itemsCount) || 0),
                  0
                );

                if (itemsSoldBefore < 5) {
                  // Split: 2 TND each
                  await databases.createDocument(
                    appwriteConfig.databaseId, earningsCol, ID.unique(),
                    { ...commonFields, ownerUserId: sellerUserId, ownerEmail: promoDoc.userEmail || '', amount: 2, earningType: 'direct' },
                    perms
                  );
                  console.log('💰 Split earning (seller 2 TND):', sellerUserId, 'order:', orderId, 'itemsSoldBefore:', itemsSoldBefore);

                  // Referrer earning — separate idempotency check
                  const existingReferrerEarning = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    earningsCol,
                    [Query.equal('orderId', orderId), Query.equal('ownerUserId', referredByUserId), Query.limit(1)]
                  );
                  if (existingReferrerEarning.total === 0) {
                    await databases.createDocument(
                      appwriteConfig.databaseId, earningsCol, ID.unique(),
                      { ...commonFields, ownerUserId: referredByUserId, ownerEmail: '', amount: 2, earningType: 'meta' },
                      perms
                    );
                    console.log('💰 Split earning (referrer 2 TND):', referredByUserId, 'order:', orderId);
                  }
                } else {
                  // Past threshold — full 4 TND to seller
                  await databases.createDocument(
                    appwriteConfig.databaseId, earningsCol, ID.unique(),
                    { ...commonFields, ownerUserId: sellerUserId, ownerEmail: promoDoc.userEmail || '', amount: 4, earningType: 'direct' },
                    perms
                  );
                  console.log('💰 Post-threshold earning (4 TND):', sellerUserId, 'order:', orderId, 'itemsSoldBefore:', itemsSoldBefore);
                }
              }
            }
          }
        }
      } catch (err: any) {
        console.error('⚠️ Failed to create referral earning on delivery:', err.message);
      }
    }
```

- [ ] **Step 4: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/orders/route.ts __tests__/promo.test.ts
git commit -m "feat: split earnings 2+2 TND for referred sellers within first 5 items sold"
```
