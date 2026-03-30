import type { Metadata } from "next";
import { Cairo, Tajawal, Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "./Providers";
import { StoreProvider } from "./Redux/StoreProvider";
import { Suspense } from "react";
import CartSidebar from "./components/CartSidebar";
import { LocaleProvider } from "./components/LocaleProvider";
import PageLoader from "./components/PageLoader";
import { getServerLocale } from "@/lib/get-locale";
import { getDir, getTranslations } from "@/lib/i18n";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "talelio",
  description: "اكتشف تشكيلة حصرية من العطور الفاخرة للرجال والنساء",
  icons: {
    icon: "/logo-removebg-preview.png",
    shortcut: "/logo-removebg-preview.png",
    apple: "/logo-removebg-preview.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const dir = getDir(locale);
  const t = getTranslations(locale);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${tajawal.variable} ${playfair.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <Script id="strip-bis-attrs" strategy="beforeInteractive">
          {`(function(){
            try {
              function removeBis(root) {
                root.querySelectorAll('[bis_skin_checked]').forEach(function(el){
                  el.removeAttribute('bis_skin_checked');
                });
              }
              removeBis(document);
              new MutationObserver(function(mutations){
                var dirty = false;
                mutations.forEach(function(m){
                  if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') dirty = true;
                  m.addedNodes.forEach(function(n){
                    if (n.nodeType === 1 && n.hasAttribute('bis_skin_checked')) dirty = true;
                  });
                });
                if (dirty) removeBis(document);
              }).observe(document.documentElement, {
                attributes: true,
                childList: true,
                subtree: true,
                attributeFilter: ['bis_skin_checked']
              });
            } catch(e){}
          })();`}
        </Script>
        <AuthProvider>
        <StoreProvider>
        <LocaleProvider initialLocale={locale}>
        <Suspense fallback={<PageLoader />}>
        {children}
        <CartSidebar />
        </Suspense>
        </LocaleProvider>
        </StoreProvider>

        </AuthProvider>

      </body>
    </html>
  );
}
