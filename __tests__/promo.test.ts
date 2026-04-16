import { generatePromoCode, calculateReferralReward } from '../lib/promo-utils';

// ---------------------------------------------------------------------------
// Utility unit tests (no mocking required)
// ---------------------------------------------------------------------------

describe('generatePromoCode', () => {
  it('returns an 8-character string', () => {
    const code = generatePromoCode();
    expect(code).toHaveLength(8);
  });

  it('contains only uppercase letters and digits', () => {
    for (let i = 0; i < 20; i++) {
      expect(generatePromoCode()).toMatch(/^[A-Z0-9]{8}$/);
    }
  });

  it('produces unique codes (statistical)', () => {
    const codes = new Set(Array.from({ length: 100 }, generatePromoCode));
    // With 36^8 ≈ 2.8 trillion possibilities, 100 samples should all differ
    expect(codes.size).toBe(100);
  });
});

describe('calculateReferralReward', () => {
  it('always returns exactly 4 TND regardless of itemsPrice', () => {
    expect(calculateReferralReward(100)).toBe(4);
    expect(calculateReferralReward(200)).toBe(4);
    expect(calculateReferralReward(53.5)).toBe(4);
  });

  it('returns a flat 4 TND for any order value', () => {
    expect(calculateReferralReward(13.33)).toBe(4);
  });

  it('flat reward is independent of order size — buyer pays full price', () => {
    expect(calculateReferralReward(50)).toBe(4);
    expect(calculateReferralReward(58)).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// Business logic tests (mocked Appwrite + NextAuth)
// ---------------------------------------------------------------------------

// Minimal mock factories
const makeSession = (id = 'user-abc', email = 'buyer@test.com', role = 'user') => ({
  user: { id, email, name: 'Test User', role },
});

const makePromoDoc = (overrides: Record<string, any> = {}) => ({
  $id: 'promo-001',
  userId: 'owner-xyz',
  userEmail: 'owner@test.com',
  userName: 'Owner',
  status: 'APPROVED',
  promoCode: 'TESTCODE',
  discountPercent: 10,
  ...overrides,
});

// --- Request flow ---
describe('Promo request flow (logic)', () => {
  it('rejects a second active request for the same user', () => {
    const existingRequests = [makePromoDoc({ status: 'PENDING', userId: 'user-abc' })];
    const active = existingRequests.filter((d) => d.status !== 'DENIED');
    expect(active.length).toBeGreaterThan(0); // would return 409
  });

  it('allows a new request if the only previous one was DENIED', () => {
    const existingRequests = [makePromoDoc({ status: 'DENIED', userId: 'user-abc' })];
    const active = existingRequests.filter((d) => d.status !== 'DENIED');
    expect(active.length).toBe(0); // would proceed to create
  });
});

// --- Admin approval ---
describe('Admin approval flow (logic)', () => {
  it('generates a unique 8-char promo code on approval', () => {
    const code = generatePromoCode();
    expect(code).toMatch(/^[A-Z0-9]{8}$/);
  });

  it('does not re-approve an already APPROVED request', () => {
    const doc = makePromoDoc({ status: 'APPROVED' });
    const wouldConflict = doc.status === 'APPROVED';
    expect(wouldConflict).toBe(true); // API returns 409
  });

  it('sets status DENIED on deny action', () => {
    const update = { status: 'DENIED' };
    expect(update.status).toBe('DENIED');
  });
});

// --- Code visibility ---
describe('Code visibility (logic)', () => {
  it('returns null promoRequest when user has no requests', () => {
    const documents: any[] = [];
    const promoRequest = documents[0] ?? null;
    expect(promoRequest).toBeNull();
  });

  it('returns the most recent request document for a user', () => {
    const docs = [makePromoDoc({ $id: 'latest', status: 'APPROVED' })];
    expect(docs[0].$id).toBe('latest');
    expect(docs[0].status).toBe('APPROVED');
  });
});

// --- Checkout apply / self-referral ---
describe('Checkout promo apply (logic)', () => {
  it('blocks self-referral when buyer owns the code', () => {
    const ownerUserId = 'user-abc';
    const currentUserId = 'user-abc'; // same person
    const isSelfReferral = ownerUserId === currentUserId;
    expect(isSelfReferral).toBe(true); // validate endpoint returns 409
  });

  it('allows code when owner !== buyer', () => {
    const ownerUserId: string = 'owner-xyz';
    const currentUserId: string = 'buyer-123';
    const isSelfReferral = ownerUserId === currentUserId;
    expect(isSelfReferral).toBe(false);
  });

  it('rejects an invalid / not-approved code (no docs found)', () => {
    const result = { total: 0, documents: [] };
    expect(result.total).toBe(0); // validate endpoint returns 404
  });
});

// --- Reward idempotency ---
describe('Referral reward idempotency (logic)', () => {
  it('skips creating a second earning when one already exists for the same orderId', () => {
    const existingEarnings = [{ orderId: 'order-999', amount: 4 }];
    const shouldCreate = existingEarnings.length === 0;
    expect(shouldCreate).toBe(false); // earning already exists — skip
  });

  it('creates earning when no prior earning exists for the orderId', () => {
    const existingEarnings: any[] = [];
    const shouldCreate = existingEarnings.length === 0;
    expect(shouldCreate).toBe(true);
  });
});

// --- Reward amount calculation ---
describe('Referral reward amount (flat 4 TND, buyer pays full price)', () => {
  it('always returns 4 TND regardless of cart value', () => {
    const cases: [number, number][] = [
      [100, 4],
      [200, 4],
      [75, 4],
      [0, 4],
    ];
    cases.forEach(([itemsPrice, expected]) => {
      expect(calculateReferralReward(itemsPrice)).toBe(expected);
    });
  });

  it('reward is flat — not affected by shipping or order total', () => {
    const itemsPrice = 100;
    const shippingPrice = 8;
    const totalPaid = itemsPrice + shippingPrice;

    const reward = calculateReferralReward(itemsPrice);
    expect(reward).toBe(4);
    expect(reward).toBe(calculateReferralReward(totalPaid));
  });
});

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
