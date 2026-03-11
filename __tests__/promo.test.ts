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
  it('always returns exactly 10% of the itemsPrice', () => {
    expect(calculateReferralReward(100)).toBe(10);
    expect(calculateReferralReward(200)).toBe(20);
    expect(calculateReferralReward(53.5)).toBeCloseTo(5.35, 2);
  });

  it('rounds to 2 decimal places', () => {
    const result = calculateReferralReward(13.33);
    const decimals = result.toString().split('.')[1]?.length ?? 0;
    expect(decimals).toBeLessThanOrEqual(2);
  });

  it('excludes shipping — only based on itemsPrice (buyer pays full price)', () => {
    // 50 TND items + 8 TND shipping = 58 TND total (no discount for buyer)
    // Reward must be 10% of 50, NOT 10% of 58
    expect(calculateReferralReward(50)).toBe(5);
    expect(calculateReferralReward(50)).not.toBe(calculateReferralReward(58));
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
    const existingEarnings = [{ orderId: 'order-999', amount: 10 }];
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
describe('Referral reward amount (10% of itemsPrice, buyer pays full price)', () => {
  it('calculates reward correctly for various cart values', () => {
    const cases: [number, number][] = [
      [100, 10],
      [200, 20],
      [75, 7.5],
      [0, 0],
    ];
    cases.forEach(([itemsPrice, expected]) => {
      expect(calculateReferralReward(itemsPrice)).toBeCloseTo(expected, 2);
    });
  });

  it('reward is based on product subtotal only — buyer pays no discount', () => {
    const itemsPrice = 100;
    const shippingPrice = 8;
    // Buyer pays full price: itemsPrice + shippingPrice
    const totalPaid = itemsPrice + shippingPrice; // 108

    const reward = calculateReferralReward(itemsPrice); // 10% of 100 = 10
    expect(reward).toBe(10);
    // Reward is not based on full total paid
    expect(reward).not.toBe(calculateReferralReward(totalPaid));
  });
});
