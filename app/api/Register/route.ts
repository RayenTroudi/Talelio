import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/appwrite-config";
import { Users, ID } from "node-appwrite";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, role } = await req.json();
        
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "All fields are required" }, 
                { status: 400 }
            );
        }

        // Security: Only allow 'user' role during registration
        // Admin role can only be assigned manually through Appwrite Console
        // or via a separate admin-only endpoint
        const userRole: 'user' | 'admin' = 'user';
        
        console.log('📝 Registering new user:', { name, email, role: userRole });

        // Create user account in Appwrite Auth using server client
        const serverClient = getServerClient();
        const users = new Users(serverClient);
        
        try {
            // Create user with node-appwrite Users service
            const user = await users.create(
                ID.unique(),
                email,
                undefined, // phone (optional)
                password,
                name
            );
            console.log('✅ User created in Appwrite:', user.$id);
            
            // Set user role using labels (requires Appwrite API key)
            try {
                await users.updateLabels(user.$id, [userRole]);
                console.log('✅ User labels set successfully:', [userRole]);
            } catch (labelError: any) {
                console.warn('⚠️ Could not set user labels:', labelError.message);
                console.warn('⚠️ Please set role manually in Appwrite Console: Auth → Users → ' + user.$id);
                // Continue anyway - role can be set manually in Appwrite Console
            }

            return NextResponse.json(
                { 
                    message: "User registered successfully. You can now sign in.", 
                    userId: user.$id, 
                    role: userRole 
                }, 
                { status: 201 }
            );
        } catch (appwriteError: any) {
            console.error("❌ Appwrite error:", appwriteError);
            
            // Handle specific Appwrite errors
            if (appwriteError.code === 409) {
                return NextResponse.json(
                    { message: "User with this email already exists" }, 
                    { status: 409 }
                );
            }
            
            throw appwriteError;
        }
        
    } catch (error: any) {
        console.error("❌ Registration error:", error);
        
        return NextResponse.json(
            { message: error.message || "An error occurred while registering user" }, 
            { status: 500 }
        );
    }
}