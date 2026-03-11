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

const Navbar = () => {
  const { loading, CartItems } = useSelector((state: any) => state.Cart);
  const dispatch = useDispatch();
  
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  
  const router = useRouter();
  const pathname = usePathname();
  
  const isInAdminArea = pathname?.startsWith('/admin');

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      dispatch(clearCart());
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/');
    }
  };

  const [open, setOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white/98 backdrop-blur-lg shadow-sm border-b border-gray-100/80 fixed top-0 left-0 z-50">
      <nav className="w-full px-6 lg:px-16 py-3 flex items-center justify-between max-w-[1600px] mx-auto">

        {/* Logo - Right Side */}
        <Link href="/" className="flex items-center gap-3 group order-3 md:order-1">
          <div className="relative transition-transform duration-500 group-hover:scale-105">
            <Image 
              src="/logo-removebg-preview.png" 
              width={140} 
              height={140} 
              alt="علامة العطور الفاخرة" 
              className="drop-shadow-lg"
              priority
            />
          </div>
        </Link>

        {/* Desktop Menu - Center */}
        <ul className="hidden md:flex items-center gap-12 text-gray-700 font-light tracking-wide order-2">
          <li>
            <Link 
              href="/" 
              className="relative text-base hover:text-gray-900 transition-all duration-300 group py-1"
            >
              الرئيسية
              <span className="absolute bottom-0 right-0 w-0 h-[1.5px] bg-gradient-to-l from-amber-400 to-amber-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link 
              href="/categories/femme" 
              className="relative text-base hover:text-gray-900 transition-all duration-300 group py-1"
            >
              عطور نسائية
              <span className="absolute bottom-0 right-0 w-0 h-[1.5px] bg-gradient-to-l from-amber-400 to-amber-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link 
              href="/categories/homme" 
              className="relative text-base hover:text-gray-900 transition-all duration-300 group py-1"
            >
              عطور رجالية
              <span className="absolute bottom-0 right-0 w-0 h-[1.5px] bg-gradient-to-l from-amber-400 to-amber-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
        </ul>

        {/* Hamburger Menu Button (Mobile) */}
        <button
          className="md:hidden flex flex-col gap-1.5 z-50 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 order-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${open ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Auth & Cart (desktop) - Left Side */}
        <div className="hidden md:flex items-center gap-5 order-3">
          {!isAuthenticated ? (
            <>
              <Link
                href="/SignIn"
                className="text-sm font-light text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 px-7 py-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/Register"
                className="text-sm font-light text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                إنشاء حساب
              </Link>
            </>
          ) : (
            <>
              {isInAdminArea ? (
                <>
                  <Link
                    href="/"
                    className="text-sm font-light text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    العودة للمتجر
                  </Link>
                  
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="relative group p-2 hover:bg-gray-50 rounded-xl transition-all duration-200"
                      aria-label="حسابي"
                    >
                      <HiOutlineUser 
                        size="24px" 
                        className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200" 
                      />
                    </button>
                    
                    {userDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                        <div className="py-1">
                          <Link
                            href="/account"
                            onClick={() => setUserDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            حسابي
                          </Link>
                          <button
                            onClick={() => { setUserDropdownOpen(false); handleLogout(); }}
                            className="w-full text-right px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
                          >
                            <TbLogout className="w-4 h-4" />
                            <span>تسجيل الخروج</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="relative group p-2 hover:bg-gray-50 rounded-xl transition-all duration-200"
                      aria-label="حسابي"
                    >
                      <HiOutlineUser 
                        size="24px" 
                        className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200" 
                      />
                    </button>
                    
                    {userDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                        <div className="py-1">
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                              لوحة الإدارة
                            </Link>
                          )}
                          <Link
                            href="/account"
                            onClick={() => setUserDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            حسابي
                          </Link>
                          <button
                            onClick={() => { setUserDropdownOpen(false); handleLogout(); }}
                            className="w-full text-right px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
                          >
                            <TbLogout className="w-4 h-4" />
                            <span>تسجيل الخروج</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          <div className="w-px h-6 bg-gray-200"></div>

          {isAuthenticated && (
            <Link 
              href="/my-orders" 
              className="relative group p-2 hover:bg-gray-50 rounded-xl transition-all duration-200"
              aria-label="طلباتي"
              title="طلباتي"
            >
              <HiOutlineClipboardDocumentList 
                size="24px" 
                className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200" 
              />
            </Link>
          )}

          {/* Commissions panel — only for non-admin approved referral users */}
          {isAuthenticated && !isAdmin && !isInAdminArea && (
            <CommissionsPanel userId={(user as any)?.id || user?.email || ""} />
          )}

          <Link 
            href="/Cart" 
            className="relative group p-2 hover:bg-gray-50 rounded-xl transition-all duration-200"
            aria-label="عربة التسوق"
          >
            <CiShoppingCart 
              size="26px" 
              className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200" 
            />
            {isClient && CartItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
                {loading ? CartItems.length : CartItems.reduce((a: any, c: any) => a + c.qty, 0)}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Orders Icon */}
        {isAuthenticated && (
          <Link 
            href="/my-orders" 
            className="md:hidden relative group p-2 hover:bg-gray-50 rounded-xl transition-all duration-200 order-2"
            aria-label="طلباتي"
          >
            <HiOutlineClipboardDocumentList 
              size="22px" 
              className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200" 
            />
          </Link>
        )}

        {/* Mobile Commissions icon */}
        {isAuthenticated && !isAdmin && !isInAdminArea && (
          <div className="md:hidden order-2">
            <CommissionsPanel userId={(user as any)?.id || user?.email || ""} />
          </div>
        )}

        {/* Mobile Profile Icon */}
        {isAuthenticated && (
          <Link 
            href="/account" 
            className="md:hidden relative group p-2 hover:bg-gray-50 rounded-xl transition-all duration-200 order-2"
            aria-label="حسابي"
          >
            <HiOutlineUser 
              size="22px" 
              className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200" 
            />
          </Link>
        )}

        {/* Mobile Cart Icon */}
        <Link 
          href="/Cart" 
          className="md:hidden relative group p-2 hover:bg-gray-50 rounded-xl transition-all duration-200 order-2"
          aria-label="عربة التسوق"
        >
          <CiShoppingCart 
            size="24px" 
            className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200" 
          />
          {isClient && CartItems.length > 0 && (
            <span className="absolute top-0 right-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
              {loading ? CartItems.length : CartItems.reduce((a: any, c: any) => a + c.qty, 0)}
            </span>
          )}
        </Link>

        {/* Mobile Menu */}
        <div className={`md:hidden fixed top-[72px] left-0 w-full bg-white/98 backdrop-blur-lg border-t border-gray-100 shadow-xl transition-all duration-300 ${open ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
          <ul className="flex flex-col p-6 gap-1 text-gray-700 font-light">
            <li>
              <Link 
                href="/" 
                onClick={() => setOpen(false)}
                className="block py-3.5 px-5 hover:bg-gray-50 rounded-xl transition-colors duration-200 text-sm"
              >
                الرئيسية
              </Link>
            </li>
            <li>
              <Link 
                href="/categories/femme" 
                onClick={() => setOpen(false)}
                className="block py-3.5 px-5 hover:bg-gray-50 rounded-xl transition-colors duration-200 text-sm"
              >
                عطور نسائية
              </Link>
            </li>
            <li>
              <Link 
                href="/categories/homme" 
                onClick={() => setOpen(false)}
                className="block py-3.5 px-5 hover:bg-gray-50 rounded-xl transition-colors duration-200 text-sm"
              >
                عطور رجالية
              </Link>
            </li>
            
            <div className="h-px bg-gray-200 my-3"></div>
            
            {!isAuthenticated ? (
              <>
                <li>
                  <Link 
                    href="/SignIn" 
                    onClick={() => setOpen(false)}
                    className="block py-3.5 px-5 bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-200 text-sm text-center font-medium shadow-sm hover:shadow-md"
                  >
                    تسجيل الدخول
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/Register" 
                    onClick={() => setOpen(false)}
                    className="block py-3.5 px-5 hover:bg-gray-50 rounded-xl transition-colors duration-200 text-sm"
                  >
                    إنشاء حساب
                  </Link>
                </li>
              </>
            ) : (
              <>
                {isInAdminArea ? (
                  <>
                    <li>
                      <Link 
                        href="/" 
                        onClick={() => setOpen(false)}
                        className="block py-3.5 px-5 hover:bg-gray-50 rounded-xl transition-colors duration-200 text-sm"
                      >
                        العودة للمتجر
                      </Link>
                    </li>
                    <li className="flex justify-center">
                      <button 
                        className="p-3 hover:bg-red-50 text-red-600 rounded-xl transition-colors duration-200" 
                        onClick={() => { setOpen(false); handleLogout(); }}
                        aria-label="تسجيل الخروج"
                      >
                        <TbLogout className="w-6 h-6" />
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    {isAdmin && (
                      <li>
                        <Link 
                          href="/admin" 
                          onClick={() => setOpen(false)}
                          className="block py-3.5 px-5 hover:bg-gray-50 rounded-xl transition-colors duration-200 text-sm"
                        >
                          لوحة الإدارة
                        </Link>
                      </li>
                    )}
                    <li className="flex justify-center">
                      <button 
                        className="p-3 hover:bg-red-50 text-red-600 rounded-xl transition-colors duration-200" 
                        onClick={() => { setOpen(false); handleLogout(); }}
                        aria-label="تسجيل الخروج"
                      >
                        <TbLogout className="w-6 h-6" />
                      </button>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
