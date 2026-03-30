"use client";

import { useState, useEffect, useRef } from "react";
import { CiShoppingCart } from "react-icons/ci";
import { TbLogout } from "react-icons/tb";
import { HiOutlineClipboardDocumentList, HiOutlineUser } from "react-icons/hi2";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@/app/context/AuthContext";
import { logout } from "@/lib/logout";
import { clearCart } from "@/app/Redux/slices/CartSlice";
import CommissionsPanel from "@/app/components/CommissionsPanel";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useTranslation } from "@/app/components/LocaleProvider";

const Navbar = () => {
  const { loading, CartItems } = useSelector((state: any) => state.Cart);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isInAdminArea = pathname?.startsWith("/admin");

  const [isClient, setIsClient] = useState(false);
  const [open, setOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogout = async () => {
    try {
      dispatch(clearCart());
      await logout();
    } catch {
      router.push("/");
    }
  };

  const cartCount = isClient
    ? loading
      ? CartItems.length
      : CartItems.reduce((a: any, c: any) => a + c.qty, 0)
    : 0;

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname?.startsWith(path);

  return (
    <header
      className={`w-full fixed top-0 left-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white shadow-[0_1px_12px_rgba(0,0,0,0.07)]"
          : "bg-white/96 backdrop-blur-lg"
      }`}
    >
      <nav className="relative w-full px-5 sm:px-8 lg:px-16 flex items-center justify-between max-w-[1600px] mx-auto h-[68px]">

        {/* ── Logo: absolute-centered on mobile, normal on desktop ── */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:order-1 group flex-shrink-0"
        >
          <Image
            src="/logo-removebg-preview.png"
            width={108}
            height={108}
            alt={t.nav.logoAlt}
            className="transition-opacity duration-300 group-hover:opacity-75"
            priority
          />
        </Link>

        {/* ── Desktop nav links ── */}
        <ul className="hidden md:flex items-center gap-10 order-2">
          {(
            [
              { href: "/", label: t.nav.home },
              { href: "/categories/femme", label: t.nav.womenPerfumes },
              { href: "/categories/homme", label: t.nav.menPerfumes },
            ] as const
          ).map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`relative text-[12.5px] tracking-[0.14em] uppercase font-light py-1 transition-colors duration-300 group ${
                  isActive(href)
                    ? "text-gold-600"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {label}
                {/* Center-expanding underline */}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-gold-400 transition-all duration-300 ${
                    isActive(href) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Desktop right actions ── */}
        <div className="hidden md:flex items-center gap-2.5 order-3">

          {!isAuthenticated ? (
            <>
              <Link
                href="/Register"
                className="text-[12.5px] font-light text-stone-400 hover:text-stone-700 tracking-wide transition-colors duration-200 px-2"
              >
                {t.nav.register}
              </Link>
              <Link
                href="/SignIn"
                className="text-[12px] font-light text-white bg-stone-900 hover:bg-gold-600 px-5 py-2 tracking-[0.1em] uppercase transition-all duration-300"
              >
                {t.nav.signIn}
              </Link>
            </>
          ) : (
            <>
              {isInAdminArea && (
                <Link
                  href="/"
                  className="text-[12.5px] font-light text-stone-400 hover:text-stone-700 tracking-wide transition-colors duration-200 px-2"
                >
                  {t.nav.backToStore}
                </Link>
              )}

              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 group pl-1"
                  aria-label={t.nav.myAccount}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 ${
                      userDropdownOpen
                        ? "border-gold-400 bg-gold-50"
                        : "border-stone-200 bg-stone-50 group-hover:border-gold-300 group-hover:bg-gold-50/50"
                    }`}
                  >
                    <HiOutlineUser
                      size="15px"
                      className={`transition-colors duration-200 ${
                        userDropdownOpen ? "text-gold-600" : "text-stone-500 group-hover:text-gold-600"
                      }`}
                    />
                  </div>
                  <svg
                    className={`w-2.5 h-2.5 text-stone-300 transition-transform duration-200 ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown panel */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-52 bg-white border border-stone-100 shadow-2xl shadow-stone-200/40 overflow-hidden z-50">
                    {/* Label row */}
                    <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-100">
                      <p className="text-[10px] tracking-[0.18em] uppercase text-stone-400 font-light">
                        {t.nav.myAccount}
                      </p>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-stone-600 hover:text-gold-700 hover:bg-gold-50/60 transition-colors duration-150"
                        >
                          <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {t.nav.adminPanel}
                        </Link>
                      )}
                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-stone-600 hover:text-gold-700 hover:bg-gold-50/60 transition-colors duration-150"
                      >
                        <HiOutlineUser size="14px" className="text-stone-400" />
                        {t.nav.myAccount}
                      </Link>
                      <Link
                        href="/my-orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-stone-600 hover:text-gold-700 hover:bg-gold-50/60 transition-colors duration-150"
                      >
                        <HiOutlineClipboardDocumentList size="14px" className="text-stone-400" />
                        {t.nav.myOrders}
                      </Link>

                      <div className="h-px bg-stone-100 my-1 mx-3" />

                      <button
                        onClick={() => { setUserDropdownOpen(false); handleLogout(); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-[12.5px] text-red-400 hover:text-red-600 hover:bg-red-50/60 transition-colors duration-150"
                      >
                        <TbLogout className="w-3.5 h-3.5" />
                        {t.nav.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Commissions */}
          {isAuthenticated && !isAdmin && !isInAdminArea && (
            <CommissionsPanel userId={(user as any)?.id || user?.email || ""} />
          )}

          {/* Divider */}
          <div className="w-px h-4 bg-stone-200 mx-1" />

          <LanguageSwitcher />

          {/* Divider */}
          <div className="w-px h-4 bg-stone-200 mx-1" />

          {/* Cart icon */}
          <Link
            href="/Cart"
            aria-label={t.nav.cart}
            className="relative group p-2"
          >
            <CiShoppingCart
              size="22px"
              className="text-stone-600 group-hover:text-gold-600 transition-colors duration-300"
            />
            {isClient && cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-gold-500 text-white text-[8px] font-semibold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 leading-none">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* ── Mobile: Hamburger (left) ── */}
        <button
          className="md:hidden relative z-10 p-2 order-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="w-5 flex flex-col gap-[5px]">
            <span
              className={`block h-[1.5px] bg-stone-800 transition-all duration-300 origin-center ${
                open ? "rotate-45 translate-y-[6.5px] w-5" : "w-5"
              }`}
            />
            <span
              className={`block h-[1.5px] bg-stone-800 transition-all duration-300 ml-auto ${
                open ? "opacity-0 w-0" : "w-3"
              }`}
            />
            <span
              className={`block h-[1.5px] bg-stone-800 transition-all duration-300 origin-center ${
                open ? "-rotate-45 -translate-y-[6.5px] w-5" : "w-5"
              }`}
            />
          </div>
        </button>

        {/* ── Mobile: Language + Cart (right) ── */}
        <div className="md:hidden flex items-center gap-0.5 order-3 relative z-10">
          <LanguageSwitcher />
          <Link href="/Cart" className="relative p-2.5" aria-label={t.nav.cart}>
            <CiShoppingCart size="22px" className="text-stone-800" />
            {isClient && cartCount > 0 && (
              <span className="absolute top-1.5 right-1 bg-gold-500 text-white text-[8px] font-semibold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* ── Mobile drawer ── */}
        <div
          className={`md:hidden fixed inset-x-0 top-[68px] bg-white border-t border-stone-100 shadow-2xl transition-all duration-350 overflow-y-auto
            ${open
              ? "opacity-100 translate-y-0 max-h-[calc(100svh-68px)] pointer-events-auto"
              : "opacity-0 -translate-y-2 max-h-0 pointer-events-none overflow-hidden"
            }`}
        >
          {/* Nav links */}
          <div className="px-5 pt-5 pb-2">
            <ul className="space-y-0.5">
              {[
                { href: "/", label: t.nav.home },
                { href: "/categories/femme", label: t.nav.womenPerfumes },
                { href: "/categories/homme", label: t.nav.menPerfumes },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 py-3 px-3 text-[13px] tracking-wide transition-colors duration-200 rounded-lg ${
                      isActive(href)
                        ? "text-gold-600 bg-gold-50/60 font-light"
                        : "text-stone-600 hover:bg-stone-50 font-light"
                    }`}
                  >
                    {isActive(href) && (
                      <div className="w-1 h-1 rounded-full bg-gold-500 flex-shrink-0" />
                    )}
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px bg-stone-100 mx-5 my-3" />

          {/* Auth */}
          <div className="px-5 pb-8">
            {!isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  href="/SignIn"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center py-3 text-[12px] font-light tracking-[0.12em] uppercase bg-stone-900 text-white hover:bg-gold-600 transition-colors duration-300"
                >
                  {t.nav.signIn}
                </Link>
                <Link
                  href="/Register"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center py-3 text-[13px] font-light text-stone-400 hover:text-stone-700 transition-colors duration-200"
                >
                  {t.nav.register}
                </Link>
              </div>
            ) : (
              <ul className="space-y-0.5">
                {isInAdminArea && (
                  <li>
                    <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 py-3 px-3 text-[13px] text-stone-600 hover:bg-stone-50 rounded-lg transition-colors font-light">
                      {t.nav.backToStore}
                    </Link>
                  </li>
                )}
                {isAdmin && (
                  <li>
                    <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 py-3 px-3 text-[13px] text-stone-600 hover:bg-stone-50 rounded-lg transition-colors font-light">
                      {t.nav.adminPanel}
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-3 py-3 px-3 text-[13px] text-stone-600 hover:bg-stone-50 rounded-lg transition-colors font-light">
                    <HiOutlineUser size="15px" className="text-stone-400" />
                    {t.nav.myAccount}
                  </Link>
                </li>
                <li>
                  <Link href="/my-orders" onClick={() => setOpen(false)} className="flex items-center gap-3 py-3 px-3 text-[13px] text-stone-600 hover:bg-stone-50 rounded-lg transition-colors font-light">
                    <HiOutlineClipboardDocumentList size="15px" className="text-stone-400" />
                    {t.nav.myOrders}
                  </Link>
                </li>
                {!isAdmin && !isInAdminArea && (
                  <li className="px-3 py-2">
                    <CommissionsPanel userId={(user as any)?.id || user?.email || ""} />
                  </li>
                )}
                <div className="h-px bg-stone-100 my-2" />
                <li>
                  <button
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className="flex items-center gap-3 w-full py-3 px-3 text-[13px] text-red-400 hover:bg-red-50 rounded-lg transition-colors font-light"
                  >
                    <TbLogout className="w-4 h-4" />
                    {t.nav.logout}
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
