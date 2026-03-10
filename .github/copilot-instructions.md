# Perfume Store - AI Coding Agent Instructions

## Architecture Overview

This is a **Next.js 16 (App Router)** e-commerce perfume store with TypeScript, using MongoDB for user authentication and Redux Toolkit for state management. Products are served from a static data file (`lib/AllProducts.ts`), not from a database.

### Key Architectural Decisions
- **Client/Server Split**: Most components are client-side (`"use client"`) due to Redux/NextAuth requirements
- **State Management**: Redux Toolkit handles cart state, persisted to cookies via `js-cookie`
- **Authentication**: NextAuth v4 with CredentialsProvider + bcrypt for password hashing
- **Product Data**: Static TypeScript array in `lib/AllProducts.ts` - **no product database**
- **Styling**: Tailwind CSS v4 with custom components in `components/ui/` (shadcn-inspired)

## Data Flow Patterns

### Cart Management
Cart state lives in Redux (`app/Redux/slices/CartSlice.ts`) and syncs to cookies on every action:
```tsx
// Adding to cart always updates cookies
dispatch(addToCart({...item, qty}))
// CartSlice automatically: calculates prices → updates state → saves to Cookies
```

**Important**: Cart calculations include `itemsPrice`, `shippingPrice` (free >$100), `taxPrice` (15%), and `totalPrice`. All use `addDecimals()` helper for consistent formatting.

### Checkout Flow
Sequential pages with Redux state:
1. `/Cart` - Review items
2. `/Shipping` - Save address via `saveShippingAddress()`
3. `/PlaceOrder` - Final review (guarded by shipping address)

**Note**: Payment processing removed - this is a cash-on-delivery/manual confirmation flow.
Each step validates the previous step's data in `useEffect` and redirects if missing.

### Product Fetching
```tsx
// Components fetch from API route that serves static data
const response = await fetch(`/api/AllProducts`)
// API route: app/api/AllProducts/route.ts → returns AllProducts array
```

## Authentication Patterns

### NextAuth Configuration
Location: `app/api/auth/[...nextauth]/route.ts`
```tsx
// Strategy: JWT (no session database)
// SignIn page: /SignIn
// Credentials: email + bcrypt password check against MongoDB users
```

### Session Usage
```tsx
const { data: session } = useSession() // Get current user
// session?.user?.name available in components wrapped by AuthProvider
```

## Component Conventions

### Provider Nesting (layout.tsx)
```tsx
<AuthProvider> {/* NextAuth SessionProvider */}
  <StoreProvider> {/* Redux store */}
    <Suspense>
      {children}
    </Suspense>
  </StoreProvider>
</AuthProvider>
```

### AddToCart Pattern
Reusable `AddToCart` component props:
- `item`: Product object with `countInStock`
- `showqty`: Boolean to show quantity selector
- `increasePerClick`: Boolean to increment existing cart quantity vs replace

### Search Implementation
Uses Next.js URL search params pattern:
```tsx
const searchParams = useSearchParams()
const { replace } = useRouter()
// Update URL: replace(`${pathname}?${params.toString()}`)
// Read: searchParams.get("query")?.toString()
```

## Environment Requirements

Required `.env.local` variables:
- `MONGO_URI` - MongoDB connection string (used in `lib/mongodb.ts`)
- `NEXTAUTH_SECRET` - NextAuth JWT secret
- `NODE_ENV` - Controls Redux DevTools (production disables)

## File Structure Patterns

### API Routes
- `app/api/AllProducts/route.ts` - GET static product array
- `app/api/Register/route.ts` - POST new user (bcrypt + MongoDB)
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handlers
- `app/api/UserExist/route.ts` - Check email uniqueness

### Redux Organization
- `app/Redux/store.ts` - Configure store with Cart slice
- `app/Redux/slices/CartSlice.ts` - All cart actions (add/remove/shipping/payment)
- `app/Redux/StoreProvider.tsx` - Client component wrapping Provider

### Type Definitions
Central types in `types.ts`:
```tsx
type products = { id, Name, Brand, Year, rating, Country, Image, Gender, Price, countInStock }
```

## Development Workflow

### Run Development Server
```bash
npm run dev
# Runs on http://localhost:3000
```

### Key TypeScript Notes
- `next.config.ts` has `ignoreBuildErrors: true` - fix types properly in production
- `@/*` path alias resolves to project root
- Missing `.d.ts` imports? Check `app/css.d.ts` for CSS module types

### Image Handling
```tsx
// External domains configured in next.config.ts:
domains: ["d2k6fvhyk5xgx.cloudfront.net", "m.media-amazon.com"]
// Local images: public/images/logo.png
```

## Common Patterns to Follow

### Hydration for Client State
```tsx
const [isClient, setIsClient] = useState(false)
useEffect(() => setIsClient(true), [])
// Prevent hydration errors when using browser-only state (cookies, localStorage)
```

### Pagination
Pagination pattern (formerly used in ProductCard component):
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

- **No Product CRUD**: Products are static data - don't create database operations for products
- **MongoDB Only for Users**: Authentication is the only DB interaction
- **Cookie-based Cart**: Cart persists via cookies, not database or localStorage
- **No TypeScript Errors in Production**: Remove `ignoreBuildErrors` before deploying
- **Checkout Guards**: Each checkout step redirects if previous steps incomplete

## UI Component Library

Uses custom shadcn-style components in `components/ui/`:
- `button.tsx`, `card.tsx`, `input.tsx`, `input-group.tsx`
- `carousel.tsx` (Embla Carousel with autoplay)
- `pagination.tsx`, `separator.tsx`
- Styled with `class-variance-authority` + `tailwind-merge`

When adding UI components, follow the existing pattern with CVA variants.
