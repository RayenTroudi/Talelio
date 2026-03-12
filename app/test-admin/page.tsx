"use client";

import { useState } from "react";
import { account } from "@/lib/appwrite-config";
import { ID } from "appwrite";

export default function CreateAdminUser() {
  const [email, setEmail] = useState("admin@perfumestore.com");
  const [password, setPassword] = useState("admin123456");
  const [name, setName] = useState("Admin User");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createAdminUser = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      // Create user account
      const user = await account.create(ID.unique(), email, password, name);
      setMessage(`✅ Admin user created successfully! User ID: ${user.$id}`);
      
      console.log("Admin user created:", user);
    } catch (error: any) {
      if (error.code === 409) {
        setMessage("⚠️ User with this email already exists. Try signing in instead.");
      } else {
        setMessage(`❌ Error creating user: ${error.message}`);
      }
      console.error("Error creating admin user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white border border-gray-300 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Create Admin User</h2>
      <p className="text-sm text-gray-600 mb-4">
        Use this to create your first admin user for testing.
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
        
        <button
          onClick={createAdminUser}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isLoading 
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isLoading ? "Creating User..." : "Create Admin User"}
        </button>
        
        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.includes("✅") 
              ? "bg-green-100 text-green-800" 
              : message.includes("⚠️")
              ? "bg-gold-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}>
            {message}
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Note:</strong> After creating the user, you can sign in with these credentials.</p>
          <p><strong>Default:</strong> admin@perfumestore.com / admin123456</p>
        </div>
      </div>
    </div>
  );
}