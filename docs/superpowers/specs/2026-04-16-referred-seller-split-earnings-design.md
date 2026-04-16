# Referred Seller Split Earnings — Design Spec
**Date:** 2026-04-16

## Overview

When a user requests a promo code they can optionally enter another approved seller's promo code as a "referral". If accepted:

- For their **first 5 items sold** (summed across all orders): they earn **2 TND** per order and the referrer earns **2 TND** per order.
- Once they have sold **5 or more items** in total: they earn the full **4 TND** per order and the referrer earns nothing.

## Data Model Changes

### `promoCodeRequests` collection — 2 new optional fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `referredByPromoCode` | string (50) | no | The promo code the user entered when requesting |
| `referredByUserId` | string (255) | no | Resolved userId of that code's owner, stored at request time |

### `referralEarnings` collection — 2 new optional fields + index change

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `itemsCount` | integer | no | Number of items in the triggering order |
| `earningType` | string (10) | no | `'direct'` (seller's own earning) or `'meta'` (referrer's bonus) |

**Index change:** The unique index on `orderId` is **dropped**. Idempotency is enforced manually by querying `orderId + ownerUserId` before inserting. This allows two earning records per order during the split phase (one for seller, one for referrer).

### Orders collection — no changes

Item counts are already stored inside the `shipingAdress` JSON blob as `items[].quantity`. No new fields needed.

## UI — Account Page (`app/account/page.tsx`)

In the referral section (`#referral-section`), when the user has no existing request (or their previous request was DENIED), add an optional text input **above** the "Demander un code promo" button:

- Label: locale key `account.referredByLabel` ("Code de parrainage (optionnel)" / "Referral Code (optional)" / equivalent in AR)
- Placeholder: reuses existing `shipping.promoPlaceholder` locale key
- Input value stored in local state `referralInputCode`
- No client-side validation — server handles errors
- On submit, `referralInputCode` (trimmed, uppercased) is sent in the POST body as `referredByPromoCode`
- On server error (invalid code), the existing toast error flow shows the message

The input appears in exactly two UI states: "no request yet" and "DENIED re-request".

## API — POST `/api/promo/request`

**New behaviour when `referredByPromoCode` is present in body:**

1. Query `promoCodeRequests` for an APPROVED document with that `promoCode` value.
2. If not found → return `400` with locale-appropriate error ("Code de parrainage invalide").
3. If the code belongs to the requesting user → return `409` (self-referral).
4. If valid → store `referredByPromoCode` and `referredByUserId` (owner's userId) on the new PENDING document.

If `referredByPromoCode` is absent or empty → existing behaviour unchanged.

## Reward Logic — PATCH `/api/admin/orders` (status → `delivered`)

```
1. Fetch promo doc (seller's promoCodeRequests record)
2. Parse shipingAdress JSON → sum items[i].quantity → thisOrderItems
3. Self-referral guard (unchanged)
4. Idempotency check: query earnings where orderId = X AND ownerUserId = sellerUserId
   → if any exist, skip entirely

5. Is seller a referred user? (promoDoc.referredByUserId is set)

   NO  → create 1 earning: seller gets 4 TND, type='direct', itemsCount=thisOrderItems
         (unchanged from current behaviour)

   YES →
     a. Sum itemsCount from all existing earnings where
        ownerUserId = sellerUserId AND earningType = 'direct'
        → itemsSoldBefore

     b. If itemsSoldBefore < 5:
          - Create earning A: ownerUserId=seller,   amount=2, type='direct', itemsCount=thisOrderItems
          - Create earning B: ownerUserId=referrer, amount=2, type='meta',   itemsCount=thisOrderItems
          (earning B gets its own idempotency check: orderId + referrerUserId)

     c. If itemsSoldBefore >= 5:
          - Create earning: ownerUserId=seller, amount=4, type='direct', itemsCount=thisOrderItems
```

**Cancellation** (status → `cancelled`): existing logic deletes all earnings by `orderId` with `Query.limit(5)` — already handles up to 2 records per order, no changes needed.

## Migration Script

A new script `fix-referred-seller-attributes.js` adds the four new fields to Appwrite:
- `referredByPromoCode` and `referredByUserId` on `promoCodeRequests`
- `itemsCount` and `earningType` on `referralEarnings`

The unique `orderId` index on `referralEarnings` must be manually deleted in the Appwrite Console (or via the SDK in the script) and replaced with a non-unique key index.

## Locale Keys — 3 new keys needed (en / fr / ar)

| Key | EN | FR | AR |
|-----|----|----|----|
| `account.referredByLabel` | Referral Code (optional) | Code de parrainage (optionnel) | رمز الإحالة (اختياري) |
| `account.referredByInvalid` | Invalid referral code | Code de parrainage invalide | رمز الإحالة غير صالح |
| `account.referredBySelf` | You cannot use your own code | Vous ne pouvez pas utiliser votre propre code | لا يمكنك استخدام رمزك الخاص |

## Files to Create / Modify

| File | Change |
|------|--------|
| `app/account/page.tsx` | Add `referralInputCode` state + optional input UI |
| `app/api/promo/request/route.ts` | Accept + validate `referredByPromoCode` body field |
| `app/api/admin/orders/route.ts` | Split earning logic on delivery |
| `lib/promo-utils.ts` | No change to `calculateReferralReward` (still returns 4) |
| `locales/en.ts` | 3 new keys |
| `locales/fr.ts` | 3 new keys |
| `locales/ar.ts` | 3 new keys |
| `fix-referred-seller-attributes.js` | New migration script |
| `__tests__/promo.test.ts` | New tests for split logic + referred user flow |

## Business Rules Summary

1. Referral code entry is optional — skipping it produces a normal 4 TND seller.
2. The 5-item threshold is cumulative across all delivered orders for that seller.
3. An order that pushes a seller past 5 items still gets the split (threshold is checked *before* the current order is counted).
4. Meta earnings (referrer's 2 TND) stop automatically once the seller's prior item count reaches 5.
5. Cancellation deletes all earnings for that order regardless of type.
6. A referred seller cannot use their referrer's code as a referral (self-referral guard applies at both validate and request time).
