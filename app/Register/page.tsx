"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from 'next-auth/react';
import { useTranslation } from "@/app/components/LocaleProvider";

const Register = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()

  const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      setError(t.register.errors.required);
      return;
    }

    if (name.length < 2) {
      setError(t.register.errors.shortName);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t.register.errors.invalidEmail);
      return;
    }

    if (password.length < 6) {
      setError(t.register.errors.shortPassword);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.register.errors.passwordMismatch);
      return;
    }

    setIsLoading(true);

    try {
      const ExistUserresponse = await fetch("api/UserExist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!ExistUserresponse.ok) {
        throw new Error('Failed to check user existence');
      }

      const { user } = await ExistUserresponse.json();
      if (user) {
        setError(t.register.errors.emailExists);
        return;
      }

      const response = await fetch("api/Register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(t.register.successMsg);

        // Auto sign in the user
        const signInResponse = await signIn("credentials", {
          email,
          password,
          redirect: false
        });

        if (signInResponse?.ok) {
          // Clear form
          const form = e.target as HTMLFormElement;
          form.reset();
          setName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");

          // Redirect to homepage
          setTimeout(() => {
            router.push("/")
          }, 1000);
        } else {
          // If auto sign-in fails, redirect to sign-in page
          setTimeout(() => {
            router.push("/SignIn")
          }, 2000);
        }
      } else {
        // Handle specific error types
        if (response.status === 409) {
          setError(t.register.errors.emailExistsLogin);
        } else {
          setError(result.message || t.register.errors.generic);
        }
      }
    } catch (error: any) {
      console.log("Error During Registration:", error);
      setError(t.register.errors.unexpected);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Decorative element */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        </div>

        <h1 className="text-4xl font-light mb-12 text-center text-gray-900 tracking-tight">{t.register.title}</h1>

        <form className="flex flex-col gap-6" onSubmit={HandleSubmit}>
          <div>
            <input
              type="text"
              placeholder={t.register.fullName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className={`w-full p-4 border border-gray-200 rounded-2xl text-right font-light placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              minLength={2}
            />
          </div>

          <div>
            <input
              type="email"
              placeholder={t.register.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={`w-full p-4 border border-gray-200 rounded-2xl text-right font-light placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              dir="ltr"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder={t.register.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={`w-full p-4 border border-gray-200 rounded-2xl text-right font-light placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              minLength={6}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder={t.register.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className={`w-full p-4 border border-gray-200 rounded-2xl text-right font-light placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-light text-lg px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg mt-2 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 cursor-pointer hover:shadow-xl hover:scale-[1.02]'
            }`}
          >
            {isLoading ? t.register.creating : t.register.createBtn}
          </button>

          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-right font-light'>
              <span className="block">{error}</span>
              {error.includes("يوجد حساب") && (
                <div className="mt-3">
                  <Link href="/SignIn" className="text-red-800 underline hover:text-red-900 font-normal">
                    {t.register.goToSignIn}
                  </Link>
                </div>
              )}
            </div>
          )}

          {success && (
            <div className='bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl text-right font-light'>
              <span className="block">{success}</span>
            </div>
          )}

          <Link href="/SignIn" className="text-sm mt-4 text-center text-gray-600 hover:text-gray-900 font-light transition-colors">
            {t.register.hasAccount} <span className="underline text-amber-600 hover:text-amber-700">{t.register.signInLink}</span>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Register;
