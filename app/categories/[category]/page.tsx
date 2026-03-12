import { getPerfumesByCategory, AppwritePerfume } from '@/lib/appwrite-queries';
import { getFirstProductImage } from '@/lib/image-utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getServerLocale } from '@/lib/get-locale';
import { getTranslations } from '@/lib/i18n';

// Valid categories - URL slugs (lowercase, hyphenated)
const VALID_CATEGORIES = ['femme', 'homme'];

// Map URL slugs to database category names
const CATEGORY_MAP: Record<string, string> = {
  'femme': 'Femme',
  'homme': 'Homme',
};

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({
    category: category.toLowerCase(),
  }));
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const locale = await getServerLocale();
  const t = getTranslations(locale);

  // Map URL slugs to locale-aware display names
  const CATEGORY_DISPLAY: Record<string, string> = {
    'femme': t.categories.women.name,
    'homme': t.categories.men.name,
  };
  
  // Safely handle category param
  if (!params?.category || typeof params.category !== 'string') {
    notFound();
  }

  // Normalize category for comparison (lowercase)
  let categoryParam = params.category.toLowerCase().trim();
  
  // Validate category slug
  if (!VALID_CATEGORIES.includes(categoryParam)) {
    console.log(`❌ Invalid category slug: "${categoryParam}"`);
    console.log(`✅ Valid slugs:`, VALID_CATEGORIES);
    notFound();
  }

  // Get database category name from slug
  const dbCategoryName = CATEGORY_MAP[categoryParam];
  const categoryDisplay = CATEGORY_DISPLAY[categoryParam] || dbCategoryName;
  
  console.log(`📂 Category routing:`);
  console.log(`  - URL slug: "${categoryParam}"`);
  console.log(`  - Database name: "${dbCategoryName}"`);
  console.log(`  - Display name: "${categoryDisplay}"`);

  let products: AppwritePerfume[] = [];
  let error = null;

  try {
    console.log(`🔍 Querying products with category: "${dbCategoryName}"`);
    products = await getPerfumesByCategory(dbCategoryName);
    console.log(`✅ Found ${products.length} products`);
  } catch (err) {
    console.error('❌ Error loading products:', err);
    error = err;
    products = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gold-50/20 to-white">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-right flex-1">
              <div className="flex items-center justify-end gap-4 mb-4">
                <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-gold-500/50 to-transparent"></div>
                <div className="w-2 h-2 rounded-full bg-gold-500/50"></div>
              </div>
              <h1 className="text-5xl md:text-6xl font-light mb-4 tracking-wide">
                {categoryDisplay}
              </h1>
              <p className="text-gray-300 text-lg font-light tracking-wide">
                {products.length}
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-light tracking-wide rounded-xl px-6 py-3">
                {t.categoryPage.backHome}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {error !== null && (
          <div className="bg-gradient-to-r from-red-50 to-red-50/50 border border-red-300/50 text-red-700 px-6 py-4 rounded-2xl mb-8 text-right shadow-lg">
            <p className="font-light text-lg">{t.categoryPage.loadError}</p>
            <p className="text-sm mt-2 font-light">{t.categoryPage.loadErrorDesc}</p>
          </div>
        )}

        {error === null && products.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gold-50 to-gold-100 mb-8 shadow-xl">
              <svg
                className="w-12 h-12 text-gold-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-light text-stone-900 mb-4 tracking-wide">
              {t.categoryPage.noProducts}
            </h3>
            <p className="text-stone-600 font-light mb-10 max-w-md mx-auto text-lg leading-relaxed">
              {t.productGrid.noProducts}. {t.productGrid.checkLater}
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 font-light text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                {t.categoryPage.backHome}
              </Button>
            </Link>
          </div>
        )}

        {error === null && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.$id} product={product} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Product Card Component
 * Displays individual product information
 */
function ProductCard({ product, t }: { product: AppwritePerfume; t: any }) {
  const inStock = product.isInStock === 'true';
  
  // Get product image with automatic fallback
  const imageUrl = getFirstProductImage(product.images, 400, 400);

  return (
    <a 
      href={`/products/${product.$id}`}
      className="block bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-gold-200/30 hover:border-gold-300/50 transform hover:-translate-y-2"
    >
      {/* Product Image */}
      <div className="aspect-square relative bg-gradient-to-br from-gold-50/30 to-stone-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Shine effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {!inStock && (
          <div className="absolute top-4 left-4 bg-red-500/95 backdrop-blur-sm text-white text-xs font-light px-4 py-2 rounded-full shadow-xl">
            {t.categoryPage.outOfStock}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 text-right">
        {/* Decorative line */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <div className="h-px w-12 bg-gradient-to-l from-gold-500/50 to-transparent"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gold-500/50"></div>
        </div>

        <h3 className="text-xl font-light text-stone-900 mb-2 line-clamp-1 group-hover:text-gold-600 transition-colors tracking-wide">
          {product.name}
        </h3>
        <p className="text-sm text-gold-500 mb-4 uppercase tracking-wider font-light italic">{product.brand}</p>
        
        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5 justify-end">
            {product.sizes.map((size: string, index: number) => (
              <span
                key={index}
                className="text-xs bg-gold-50 text-gold-700 px-3 py-1.5 rounded-lg border border-gold-200/50 font-light"
              >
                {size}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <span className="text-gold-600 text-sm font-light group-hover:-translate-x-1 transition-transform duration-300 inline-block tracking-wide">
            {t.categoryPage.viewProduct}
          </span>
          <p className="text-2xl font-light text-stone-900">
            {product.price.toFixed(2)} <span className="text-base text-stone-500">{t.productDetail.currency}</span>
          </p>
        </div>
      </div>
    </a>
  );
}
