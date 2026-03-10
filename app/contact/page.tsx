"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white" dir="rtl">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pt-32 pb-28 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.3),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(251,191,36,0.2),transparent_50%)]" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-16 text-center">
            <div className="inline-block mb-6">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light mb-8 tracking-tight">
              <span className="font-serif italic text-amber-400">تواصل معنا</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
              يسعدنا تلقي رسالتك. تواصل معنا بأي استفسار أو سؤال
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-24">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Contact Form */}
            <div className="bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 rounded-3xl p-10 md:p-12 shadow-xl border border-amber-100/50">
              <h2 className="text-4xl font-light text-gray-900 mb-10 text-right tracking-tight">
                إرسال رسالة
              </h2>

              {submitted && (
                <div className="mb-8 p-5 bg-green-50/80 border border-green-200 rounded-2xl text-right backdrop-blur-sm">
                  <p className="text-green-700 font-light tracking-wide">شكراً لك! تم إرسال رسالتك بنجاح.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="text-right">
                  <label htmlFor="name" className="block text-sm font-light text-gray-700 mb-3 tracking-wide">
                    الاسم
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-right placeholder:text-gray-400 placeholder:font-light bg-white shadow-sm"
                    placeholder="اسمك الكريم"
                  />
                </div>

                <div className="text-right">
                  <label htmlFor="email" className="block text-sm font-light text-gray-700 mb-3 tracking-wide">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-left placeholder:text-gray-400 placeholder:font-light bg-white shadow-sm"
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>

                <div className="text-right">
                  <label htmlFor="subject" className="block text-sm font-light text-gray-700 mb-3 tracking-wide">
                    الموضوع
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-right placeholder:text-gray-400 placeholder:font-light bg-white shadow-sm"
                    placeholder="كيف يمكننا مساعدتك؟"
                  />
                </div>

                <div className="text-right">
                  <label htmlFor="message" className="block text-sm font-light text-gray-700 mb-3 tracking-wide">
                    الرسالة
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none text-right placeholder:text-gray-400 placeholder:font-light bg-white shadow-sm"
                    placeholder="أخبرنا المزيد عن استفسارك..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-light py-5 px-8 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] shadow-xl hover:shadow-2xl tracking-wide text-base"
                >
                  إرسال الرسالة
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="text-right space-y-12">
              <div>
                <div className="inline-block mb-6">
                  <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                </div>
                <h2 className="text-4xl font-light text-gray-900 mb-8 tracking-tight">
                  معلومات التواصل
                </h2>
              </div>

              <div className="space-y-10">
                <div className="group">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200/50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-light text-gray-900">البريد الإلكتروني</h3>
                  </div>
                  <div className="pr-20">
                    <a href="mailto:contact@perfumebrand.com" className="text-gray-600 hover:text-amber-600 transition-colors duration-300 font-light text-lg block" dir="ltr">
                      contact@perfumebrand.com
                    </a>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200/50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-light text-gray-900">الهاتف</h3>
                  </div>
                  <div className="pr-20">
                    <a href="tel:+1234567890" className="text-gray-600 hover:text-amber-600 transition-colors duration-300 font-light text-lg block" dir="ltr">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200/50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-light text-gray-900">العنوان</h3>
                  </div>
                  <div className="pr-20">
                    <p className="text-gray-600 font-light text-lg leading-relaxed">
                      شارع العطور 123<br />
                      حي الأناقة<br />
                      نيويورك، NY 10001
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
