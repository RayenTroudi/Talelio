"use client";

import Link from "next/link";
import { useTranslation } from "@/app/components/LocaleProvider";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="relative bg-gradient-to-b from-white via-gold-50/20 to-gold-50/40 text-gray-600 mt-32 overflow-hidden border-t border-gold-200/50">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.08),transparent_60%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />

      {/* Main Content */}
      <div className="relative container mx-auto px-6 lg:px-16 py-20">

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 max-w-4xl mx-auto mb-16 mt-12">

          {/* Store */}
          <div className="text-center space-y-6">
            <h3 className="text-lg font-light text-gold-700 mb-8 tracking-wide">
              {t.footer.store}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gold-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  {t.footer.home}
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/femme"
                  className="text-gray-600 hover:text-gold-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  {t.footer.womenPerfumes}
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/homme"
                  className="text-gray-600 hover:text-gold-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  {t.footer.menPerfumes}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="text-center space-y-6">
            <h3 className="text-lg font-light text-gold-700 mb-8 tracking-wide">
              {t.footer.company}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-gold-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-gold-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  {t.footer.contact}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-gold-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-gold-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div className="text-center space-y-6">
            <h3 className="text-lg font-light text-gold-700 mb-8 tracking-wide">
              {t.footer.followUs}
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gold-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  {t.footer.instagram}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gold-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  {t.footer.facebook}
                </a>
              </li>
              <li>
                <Link
                  href="/account#referral-section"
                  className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-full bg-gold-500 hover:bg-gold-600 text-white text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  {t.footer.joinUs}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Decorative Line */}
        <div className="flex justify-center mb-10">
          <div className="h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-gold-300/50 to-transparent" />
        </div>

        {/* Copyright */}
        <div className="text-center pb-8">
          <p className="text-gray-500 text-sm tracking-wide font-light">
            &copy; {new Date().getFullYear()} {t.footer.copyright}
          </p>
          <p className="mt-2 text-gray-500 text-sm tracking-wide font-light">
            {t.footer.developedBy}
          </p>
        </div>
      </div>
    </footer>
  );
}
