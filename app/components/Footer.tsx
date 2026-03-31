"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/app/components/LocaleProvider";

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative bg-[#080808] text-gray-400 overflow-hidden">
      {/* Gold accent border top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-10">

        {/* Top section: brand + links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 md:mb-16">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
            <Link href="/" className="inline-block">
              <Image
                src="/logo-removebg-preview.png"
                width={120}
                height={120}
                alt={t.nav.logoAlt}
                className="brightness-0 invert opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
            </Link>
            <p className="text-gray-600 text-sm font-light leading-relaxed max-w-xs">
              {t.metadata.description}
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-4 mt-2">
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-600 hover:text-gold-400 hover:border-gold-500/40 transition-all duration-300"
              >
                <InstagramIcon />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-600 hover:text-gold-400 hover:border-gold-500/40 transition-all duration-300"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          {/* Store links */}
          <div className="md:col-span-1">
            <h4 className="text-white/70 text-xs tracking-[0.25em] uppercase font-light mb-6">
              {t.footer.store}
            </h4>
            <ul className="space-y-3.5">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gold-400 transition-colors duration-300 text-sm font-light">
                  {t.footer.home}
                </Link>
              </li>
              <li>
                <Link href="/categories/femme" className="text-gray-600 hover:text-gold-400 transition-colors duration-300 text-sm font-light">
                  {t.footer.womenPerfumes}
                </Link>
              </li>
              <li>
                <Link href="/categories/homme" className="text-gray-600 hover:text-gold-400 transition-colors duration-300 text-sm font-light">
                  {t.footer.menPerfumes}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div className="md:col-span-1">
            <h4 className="text-white/70 text-xs tracking-[0.25em] uppercase font-light mb-6">
              {t.footer.company}
            </h4>
            <ul className="space-y-3.5">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gold-400 transition-colors duration-300 text-sm font-light">
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gold-400 transition-colors duration-300 text-sm font-light">
                  {t.footer.contact}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gold-400 transition-colors duration-300 text-sm font-light">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gold-400 transition-colors duration-300 text-sm font-light">
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>

          {/* Join us */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white/70 text-xs tracking-[0.25em] uppercase font-light mb-6">
              {t.footer.followUs}
            </h4>
            <p className="text-gray-600 text-sm font-light leading-relaxed mb-6">
              {t.footer.joinDesc}
            </p>
            <Link
              href="/account#referral-section"
              className="group inline-flex items-center gap-2.5 border border-gold-500/40 hover:border-gold-500 text-gold-400 hover:text-gold-300 px-5 py-2.5 text-xs tracking-[0.15em] uppercase font-light transition-all duration-300"
            >
              <span>{t.footer.joinUs}</span>
              <svg
                className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-light">
          <p className="text-gray-700 tracking-wide">
            &copy; {new Date().getFullYear()} {t.footer.copyright}
          </p>
          <p className="text-gray-700 tracking-wide">
            {t.footer.developedBy.split("Rayen Troudi")[0]}
            <a
              href="https://www.rayentroudi.work/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-400 hover:text-amber-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded transition-colors duration-200"
            >
              Rayen Troudi
            </a>
            {t.footer.developedBy.split("Rayen Troudi")[1]}
          </p>
        </div>
      </div>
    </footer>
  );
}
