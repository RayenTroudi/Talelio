"use client";

import { signIn } from 'next-auth/react';
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from "@/app/components/LocaleProvider";


const SignIn = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("")
  const [password, setPasword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for redirect param and error param
  const redirectUrl = searchParams.get('redirect')
  const authError = searchParams.get('error')

  useEffect(() => {
    // Show error message if user was redirected due to auth error
    if (authError === 'unauthenticated') {
      setError(t.signIn.errors.unauthenticated)
    } else if (authError === 'server_error') {
      setError(t.signIn.errors.generic)
    }
  }, [authError])

  const HandleSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setError("")
      setSuccess("")

      // Form validation
      if (!email || !password) {
        setError(t.signIn.errors.required)
        return
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        setError(t.signIn.errors.invalidEmail)
        return
      }

      setIsLoading(true)

      try {
        console.log('🔐 Attempting sign in...')

        const response = await signIn("credentials", {
          email,
          password,
          redirect:false
        })

        if(response?.error){
          console.log('❌ Sign in failed:', response.error)
          setError(t.signIn.errors.invalidCredentials)
          setIsLoading(false)
          return
        }

        console.log('✅ Sign in successful')
        setSuccess(t.signIn.successMsg)

        // Wait for NextAuth to update the session
        await new Promise(resolve => setTimeout(resolve, 500))

        // Get session to determine redirect based on role
        const sessionResponse = await fetch('/api/auth/session')
        const session = await sessionResponse.json()

        console.log('📋 Session data:', session)
        console.log('👤 User role:', session?.user?.role)

        // Redirect based on user role
        let destination = redirectUrl || '/'

        // If no specific redirect URL and user is admin, go to admin panel
        if (!redirectUrl && session?.user?.role === 'admin') {
          destination = '/admin'
        }

        console.log('✅ Redirecting to:', destination)

        // Perform redirect
        router.replace(destination)

      } catch (error) {
        console.log('❌ Unexpected error:', error)
        setError(t.signIn.errors.generic)
        setIsLoading(false)
      }
  }
  return (
    <div className='min-h-screen bg-white flex items-center justify-center py-12 px-4'>
        <div className='w-full max-w-md'>
                {/* Decorative element */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                </div>

                <h1 className='text-4xl font-light mb-12 text-center text-gray-900 tracking-tight'>{t.signIn.title}</h1>

                <form className='flex flex-col gap-6' onSubmit={HandleSubmit}>
                    <div>
                      <input
                        type="email"
                        placeholder={t.signIn.email}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className={`w-full p-4 border border-gray-200 rounded-2xl text-right font-light placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                      />
                    </div>

                    <div>
                      <input
                        type="password"
                        placeholder={t.signIn.password}
                        value={password}
                        onChange={(e) => setPasword(e.target.value)}
                        disabled={isLoading}
                        className={`w-full p-4 border border-gray-200 rounded-2xl text-right font-light placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
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
                        {isLoading ? t.signIn.signingIn : t.signIn.signInBtn}
                    </button>

                    {error && (
                      <div className='bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-right font-light'>
                        <span className="block">{error}</span>
                      </div>
                    )}

                    {success && (
                      <div className='bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl text-right font-light'>
                        <span className="block">{success}</span>
                      </div>
                    )}

                    <Link href='/Register' className='text-sm mt-4 text-center text-gray-600 hover:text-gray-900 font-light transition-colors'>
                      {t.signIn.noAccount} <span className='underline text-amber-600 hover:text-amber-700'>{t.signIn.registerLink}</span>
                    </Link>
                </form>
        </div>
    </div>
  )
}

export default SignIn
