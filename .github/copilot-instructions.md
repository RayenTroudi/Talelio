# Perfume Store - AI Coding Agent Instructions

## Architecture Overview

This is a **Next.js 16 (App Router)** e-commerce perfume store with TypeScript, using **Appwrite** as the backend (database, authentication, and storage) and Redux Toolkit for cart state management. Internationalization supports Arabic, English, and French.

### Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Backend / Database**: [Appwrite](https://appwrite.io/) — users, products (perfumes), orders, promo codes, referral earnings all stored in Appwrite Databases
- **Authentication**: NextAuth v4 with CredentialsProvider → delegates to Appwrite Account (`lib/auth.ts`). User roles (`admin` / `user`) are stored as Appwrite **labels**.
- **State Management**: Redux Toolkit — cart state persisted to cookies via `js-cookie`
- **Styling**: Tailwind CSS v4 with custom shadcn-inspired components in `components/ui/`
- **Image Storage**: Appwrite Storage buckets; images are proxied server-side via `/api/images/`
- **Internationalisation**: Cookie-based locale (`ar` / `en` / `fr`), translation files in `locales/`
- **Animation**: Framer Motion, Vanta.js (Three.js) for background effects

### Key Architectural Decisions
- **Client/Server Split**: Most components are client-side (`"use client"`) due to Redux/NextAuth requirements
- **State Management**: Redux Toolkit handles cart state, persisted to cookies via `js-cookie`
- **Authentication**: NextAuth v4 with CredentialsProvider; credentials are verified against Appwrite Account; admin role checked via Appwrite user labels
- **Product Data**: Dynamic — fetched from Appwrite Databases (Perfumes collection) via `/api/perfumes`
- **Styling**: Tailwind CSS v4 with custom components in `components/ui/` (shadcn-inspired)
- **Route Protection**: `middleware.ts` guards `/admin` (requires `role === 'admin'`) and `/account` (requires authentication)

## Data Flow Patterns

### Cart Management
Cart state lives in Redux (`app/Redux/slices/CartSlice.ts`) and syncs to cookies on every action:
```tsx
// Adding to cart always updates cookies
dispatch(addToCart({...item, qty}))
// CartSlice automatically: calculates prices → updates state → saves to Cookies
```

**Important**:
- Cart calculations include `itemsPrice` and `shippingPrice` (always free). All use `addDecimals()` for consistent 2-decimal formatting.
- Promo/referral codes (`appliedPromoCode`, `promoCodeId` in Redux) implement a **referral-tracking system**: they record which affiliate referred the buyer and the referral earner may be credited separately in Appwrite. Currently **no buyer-side discount is applied**. Do not introduce buyer discounts unless the pricing logic in `CartSlice.ts` is explicitly updated.

Cart actions: `addToCart`, `removeFromCart`, `saveShippingAddress`, `toggleCartSidebar`, `setPromoCode`, `clearPromoCode`, `clearCart`, `hideloading`.

### Checkout Flow
Sequential pages with Redux state:
1. `/Cart` — Review items (CartSidebar is available on all pages too)
2. `/Shipping` — Save address via `saveShippingAddress()`
3. `/PlaceOrder` — Final review (guarded by shipping address); submits order to Appwrite

**Note**: Payment processing removed — this is a cash-on-delivery/manual confirmation flow.
Each step validates the previous step's data in `useEffect` and redirects if missing.

### Product Fetching
```tsx
// Components fetch from API route that reads from Appwrite Databases
const response = await fetch(`/api/perfumes`)
// API route: app/api/perfumes/route.ts → returns perfumes from Appwrite collection
// Individual product: app/api/perfumes/[id]/route.ts
```

### Image Serving
Images are stored in Appwrite Storage buckets and served through a Next.js proxy:
```tsx
// Proxy route: app/api/images/route.ts
// Fetches from Appwrite Storage server-side using APPWRITE_API_KEY
// Configured image domains in next.config.ts include cloud.appwrite.io
```

## Authentication Patterns

### NextAuth + Appwrite Configuration
Location: `app/api/auth/[...nextauth]/route.ts`
```tsx
// Strategy: JWT (no session database)
// SignIn page: /SignIn
// Credentials: email + password → verified by Appwrite Account createEmailPasswordSession()
// Role: read from Appwrite user labels ('admin' or 'user'), stored in JWT token
```

### Session Usage
```tsx
const { data: session } = useSession() // Get current user
// session?.user?.name, session?.user?.role available in components wrapped by AuthProvider
// role is 'admin' | 'user'
```

### Role-Based Access
- Admin users have the label `admin` in Appwrite Console (Auth → Users → Labels)
- Route `/admin/*` requires `token.role === 'admin'` (enforced in `middleware.ts`)
- Route `/account/*` requires any authenticated session

## Component Conventions

### Provider Nesting (layout.tsx)
```tsx
<AuthProvider>         {/* NextAuth SessionProvider */}
  <StoreProvider>      {/* Redux store */}
    <LocaleProvider initialLocale={locale}> {/* i18n context */}
      <Suspense>
        {children}
        <CartSidebar /> {/* Slide-in cart panel, controlled via Redux showSidebar */}
      </Suspense>
    </LocaleProvider>
  </StoreProvider>
</AuthProvider>
```

### Internationalisation Pattern
```tsx
import { getServerLocale } from "@/lib/get-locale"
import { getTranslations, getDir } from "@/lib/i18n"
const locale = await getServerLocale()   // reads locale cookie server-side
const t = getTranslations(locale)        // typed translation object
const dir = getDir(locale)               // 'rtl' for 'ar', 'ltr' otherwise
```
Translation files: `locales/ar.ts`, `locales/en.ts`, `locales/fr.ts`.

### Search Implementation
Uses Next.js URL search params pattern:
```tsx
const searchParams = useSearchParams()
const { replace } = useRouter()
// Update URL: replace(`${pathname}?${params.toString()}`)
// Read: searchParams.get("query")?.toString()
```

## Environment Requirements

Required `.env.local` variables (see `.env.example` for the full template):
- `NEXTAUTH_SECRET` — NextAuth JWT secret
- `NEXTAUTH_URL` — Application URL (e.g. `http://localhost:3000`)
- `NEXT_PUBLIC_APPWRITE_ENDPOINT` — Appwrite endpoint (e.g. `https://cloud.appwrite.io/v1`)
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` — Appwrite project ID
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID` — Appwrite database ID
- `NEXT_PUBLIC_APPWRITE_PERFUMES_COLLECTION_ID` — Perfumes collection ID
- `NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID` — Users collection ID
- `NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID` — Orders collection ID
- `NEXT_PUBLIC_APPWRITE_PERFUME_IMAGES_BUCKET_ID` — Storage bucket for product images
- `NEXT_PUBLIC_APPWRITE_NOTE_IMAGES_BUCKET_ID` — Storage bucket for note images
- `APPWRITE_API_KEY` — Server-side API key (never exposed to client; used for private bucket access)
- `CRON_SECRET` — Secret for Vercel Cron keep-alive endpoint

## File Structure Patterns

### API Routes
- `app/api/perfumes/route.ts` — GET all perfumes from Appwrite
- `app/api/perfumes/[id]/route.ts` — GET single perfume by Appwrite document ID
- `app/api/orders/route.ts` — POST new order to Appwrite
- `app/api/Register/route.ts` — POST new user (creates Appwrite Account user, sets `user` label)
- `app/api/UserExist/route.ts` — Check email uniqueness
- `app/api/auth/[...nextauth]/route.ts` — NextAuth handlers (delegates to Appwrite)
- `app/api/images/route.ts` — Proxies Appwrite Storage images server-side
- `app/api/upload-image/route.ts` — Uploads images to Appwrite Storage (admin only)
- `app/api/cron/route.ts` — Vercel Cron keep-alive endpoint

### Appwrite Library Files
- `lib/appwrite-config.ts` — Appwrite client/server setup, `getServerClient()`, `getServerDatabases()`, `getServerStorage()`, URL helpers
- `lib/appwrite-perfume.ts` — `AppwritePerfumeService` class (CRUD for perfume documents)
- `lib/appwrite-queries.ts` — Reusable Appwrite query helpers
- `lib/auth.ts` — `login()`, `logout()`, `getCurrentUser()`, `getUserRole()`, `isAdmin()`
- `lib/server-auth.ts` — Server-side auth helpers

### Redux Organization
- `app/Redux/store.ts` — Configure store with Cart slice
- `app/Redux/slices/CartSlice.ts` — All cart actions (add/remove/shipping/promo/clear)
- `app/Redux/StoreProvider.tsx` — Client component wrapping Redux Provider

### Type Definitions
Central types in `types.ts`:
```tsx
// Static product type — defined in types.ts but not currently imported by Appwrite-based components.
// If you find it unused in a cleanup pass, it can be safely removed; prefer AppwritePerfumeDocument for all new code.
type products = { id, Name, Brand, Year, rating, Country, Image, Gender, Price, countInStock }

// Appwrite product type (used for dynamic products)
interface AppwritePerfumeDocument {
  $id: string; name; brand; price; category; description;
  isInStock: string; sizes: string[]; images: string[];
  topNotes: string[]; middleNotes: string[]; baseNotes: string[];
}
```

## Development Workflow

### Run Development Server
```bash
npm run dev
# Runs on http://localhost:3000
```

### Run Tests
```bash
npm test
# Uses Jest with ts-jest
```

### Key TypeScript Notes
- `next.config.ts` currently has `ignoreBuildErrors: true` — this suppresses TypeScript build errors. To find all outstanding type errors, temporarily set it to `false` and run `npm run build` locally before deploying to production
- `@/*` path alias resolves to project root
- Missing `.d.ts` imports? Check `app/css.d.ts` for CSS module types

### Image Handling
```tsx
// Appwrite Storage images are proxied through /api/images/
// next.config.ts remotePatterns include: cloud.appwrite.io, fra.cloud.appwrite.io
// Local images served from public/
```

## Common Patterns to Follow

### Hydration for Client State
```tsx
const [isClient, setIsClient] = useState(false)
useEffect(() => setIsClient(true), [])
// Prevent hydration errors when using browser-only state (cookies, localStorage)
```

### Pagination
```tsx
const LastItemIndex = currentpage * itemperpage
const FirstItemIndex = LastItemIndex - itemperpage
const CurrentItems = products.slice(FirstItemIndex, LastItemIndex)
```

### Navbar Cart Badge
```tsx
{loading ? CartItems.length : CartItems.reduce((a, c) => a + c.qty, 0)}
// Shows total quantity across all items, not just item count
```

## Important Constraints

- **Appwrite for All Data**: Users, products, orders, and promo codes all live in Appwrite Databases — do not add MongoDB
- **No Static Product Data**: Products are fetched dynamically from Appwrite; `lib/AllProducts.ts` is no longer the source of truth
- **Cookie-based Cart**: Cart persists via cookies, not database or localStorage
- **Server-side API Key**: `APPWRITE_API_KEY` is only used in server API routes (never in client-side code)
- **No TypeScript Errors in Production**: Remove `ignoreBuildErrors` before deploying
- **Checkout Guards**: Each checkout step redirects if previous steps are incomplete
- **Admin Role via Labels**: Assign admin access by adding the `admin` label to a user in Appwrite Console, not via code

## UI Component Library

Uses custom shadcn-style components in `components/ui/`:
- `button.tsx`, `card.tsx`, `input.tsx`, `input-group.tsx`
- `carousel.tsx` (Embla Carousel with autoplay)
- `pagination.tsx`, `separator.tsx`
- Styled with `class-variance-authority` + `tailwind-merge`

When adding UI components, follow the existing pattern with CVA variants.
