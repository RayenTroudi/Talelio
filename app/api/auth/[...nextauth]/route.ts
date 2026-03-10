import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import { login } from "@/lib/auth"

export const authOptions = {
    providers:[
        CredentialsProvider({
        name:"credentials",
        credentials:{
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" }
        },

        async authorize(credentials){
            if (!credentials?.email || !credentials?.password) {
                return null
            }

            try{
                // Step 1: Authenticate with Appwrite and get user data (including labels)
                const { session, user } = await login(credentials.email, credentials.password)
                
                if (session && user) {
                    // Step 2: Check if user has 'admin' label
                    const hasAdminLabel = user.labels?.includes('admin');
                    const role: 'admin' | 'user' = hasAdminLabel ? 'admin' : 'user';
                    
                    console.log('=== NextAuth Authorization ===');
                    console.log('User ID:', session.userId);
                    console.log('Email:', credentials.email);
                    console.log('Labels:', user.labels);
                    console.log('Has Admin Label:', hasAdminLabel);
                    console.log('Final Role:', role);
                    console.log('============================');
                    
                    // Step 3: Return user object with role
                    return {
                        id: session.userId,
                        email: credentials.email,
                        name: user.name || credentials.email.split('@')[0],
                        role: role,
                    }
                }
                return null
            } catch(error){
                console.log("❌ Authentication error:", error)
                return null
            }
        }
    })],
    callbacks: {
        async jwt({ token, user }: any) {
            // Add role and id to JWT token on sign in
            if (user) {
                token.role = user.role
                token.id = user.id
                console.log('JWT Callback - Setting role:', user.role)
            }
            return token
        },
        async session({ session, token }: any) {
            // Add role and id to session object
            if (session?.user) {
                session.user.role = token.role
                session.user.id = token.id
                console.log('Session Callback - Role:', token.role)
            }
            return session
        }
    },
    session:{
        strategy:"jwt" as const
    },
    secret:process.env.NEXTAUTH_SECRET,
    pages:{
        signIn : "/SignIn"  
    }
}

const handler = NextAuth(authOptions)
export {handler as GET, handler as POST}


