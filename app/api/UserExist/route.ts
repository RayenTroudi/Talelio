import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        
        if (!email) {
            return NextResponse.json(
                { error: "Email is required" }, 
                { status: 400 }
            );
        }

        // Since Appwrite handles user creation and will return appropriate errors
        // if a user already exists, we'll simplify this and let the Register route
        // handle the actual duplicate user detection
        
        // For now, return that user doesn't exist so registration can proceed
        // The actual duplicate check will happen in the Register route
        return NextResponse.json({ user: null });
        
    } catch (error: any) {
        console.error("Error in UserExist route:", error);
        return NextResponse.json(
            { error: "Internal server error" }, 
            { status: 500 }
        );
    }
}