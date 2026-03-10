import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pt-32 pb-28 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.3),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(251,191,36,0.2),transparent_50%)]" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-16 text-center">
            <div className="mb-10 flex justify-center animate-fade-in">
              <Image
                src="/logo-removebg-preview.png"
                width={180}
                height={180}
                alt="شعار العلامة التجارية"
                className="drop-shadow-2xl"
              />
            </div>
            
            <div className="inline-block mb-6">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light mb-8 tracking-tight">
              <span className="font-serif italic text-amber-400">قصتنا</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              رحلة من الشغف والحرفية والسعي لتحقيق التميز العطري
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-6 lg:px-16 py-24">
          {/* Brand Philosophy */}
          <div className="mb-24 text-right">
            <div className="text-center mb-16">
              <div className="inline-block mb-6">
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
              </div>
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
                فن صناعة العطور
              </h2>
            </div>
            <div className="max-w-4xl mx-auto text-gray-700 leading-loose space-y-8 text-lg font-light">
              <p>
                كل عطر يحكي قصة، وقصتنا تبدأ بالتزام راسخ بالجودة والأناقة والأصالة. عطورنا ليست مجرد روائح - إنها تجارب مصممة بدقة لإثارة المشاعر وإلهام الثقة وترك انطباع لا يُنسى.
              </p>
              <p>
                مستوحاة من أجود المكونات الطبيعية والتقنيات التقليدية العريقة، نمزج بين التقليد والابتكار لخلق عطور تتجاوز الموضة وتصمد أمام اختبار الزمن.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
