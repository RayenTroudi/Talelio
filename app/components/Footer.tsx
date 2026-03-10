import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-white via-amber-50/20 to-amber-50/40 text-gray-600 mt-32 overflow-hidden border-t border-amber-200/50">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,191,36,0.08),transparent_60%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      
      {/* Main Content */}
      <div className="relative container mx-auto px-6 lg:px-16 py-20">

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 max-w-4xl mx-auto mb-16 mt-12">
          
          {/* المتجر */}
          <div className="text-center space-y-6">
            <h3 className="text-lg font-light text-amber-700 mb-8 tracking-wide">
              المتجر
            </h3>
            <ul className="space-y-4">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-amber-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link 
                  href="/categories/femme" 
                  className="text-gray-600 hover:text-amber-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  عطور نسائية
                </Link>
              </li>
              <li>
                <Link 
                  href="/categories/homme" 
                  className="text-gray-600 hover:text-amber-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  عطور رجالية
                </Link>
              </li>
            </ul>
          </div>

          {/* الشركة */}
          <div className="text-center space-y-6">
            <h3 className="text-lg font-light text-amber-700 mb-8 tracking-wide">
              الشركة
            </h3>
            <ul className="space-y-4">
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-600 hover:text-amber-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  من نحن
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-amber-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-gray-600 hover:text-amber-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-gray-600 hover:text-amber-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  الشروط والأحكام
                </Link>
              </li>
            </ul>
          </div>

          {/* تابعنا */}
          <div className="text-center space-y-6">
            <h3 className="text-lg font-light text-amber-700 mb-8 tracking-wide">
              تابعنا
            </h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-amber-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  انستغرام
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-amber-700 transition-all duration-300 text-sm font-light inline-block"
                >
                  فيسبوك
                </a>
              </li>
            
            </ul>
          </div>
        </div>

        {/* Decorative Line */}
        <div className="flex justify-center mb-10">
          <div className="h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
        </div>

        {/* Copyright */}
        <div className="text-center pb-8">
          <p className="text-gray-500 text-sm tracking-wide font-light">
            &copy; {new Date().getFullYear()} متجر العطور الفاخرة • جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}