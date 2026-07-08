/**
 * Generate a unique 8-character uppercase alphanumeric promo code.
 */
export function generatePromoCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

import { DEFAULT_COMMISSION_RATE } from './settings';

/**
 * Calculate the referral reward for the promo code owner.
 * Flat rate per order, regardless of order value (admin-configurable —
 * see lib/settings.ts). The buyer pays full price — this reward is paid
 * separately to the owner.
 */
export function calculateReferralReward(_itemsPrice: number): number {
  return DEFAULT_COMMISSION_RATE;
}
