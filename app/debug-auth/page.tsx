"use client";

import { useState } from "react";
import { account } from "@/lib/appwrite-config";

export default function AuthDebugger() {
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testLogin = async () => {
    if (!testEmail || !testPassword) {
      setMessage("❌ Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setMessage("🔄 Testing login...");

    try {
      // Try to create a session directly with Appwrite
      const session = await account.createEmailPasswordSession(testEmail, testPassword);
      setMessage(`✅ Login successful! Session ID: ${session.$id}`);
      
      // Get user info
      const user = await account.get();
      setMessage(prev => prev + `\n👤 User: ${user.name} (${user.email})`);
      
      // Clean up - delete the test session
      await account.deleteSession(session.$id);
      setMessage(prev => prev + "\n🧹 Test session cleaned up");
      
    } catch (error: any) {
      if (error.code === 401) {
        setMessage("❌ Invalid credentials - user doesn't exist or wrong password");
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
      console.error("Login test error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkCurrentSession = async () => {
    setIsLoading(true);
    setMessage("🔍 Checking current session...");

    try {
      const user = await account.get();
      setMessage(`✅ Current user: ${user.name} (${user.email})`);
    } catch (error: any) {
      setMessage("ℹ️ No active session");
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedCredentials = [
    { email: "admin@perfumestore.com", password: "admin123456" },
    { email: "test@example.com", password: "123456" },
    { email: "user@test.com", password: "password" }
  ];

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white border border-gray-300 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🔐 Authentication Debugger</h2>
      
      <div className="space-y-6">
        {/* Current Session Check */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Check Current Session</h3>
          <button
            onClick={checkCurrentSession}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Check Session
          </button>
        </div>

        {/* Test Login */}
        <div className="bg-gold-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Login Credentials</h3>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder="Password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
              disabled={isLoading}
            />
            <button
              onClick={testLogin}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
            >
              {isLoading ? "Testing..." : "Test Login"}
            </button>
          </div>
        </div>

        {/* Suggested Credentials */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Try These Common Credentials:</h3>
          <div className="space-y-2">
            {suggestedCredentials.map((cred, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                <div className="text-sm">
                  <div><strong>Email:</strong> {cred.email}</div>
                  <div><strong>Password:</strong> {cred.password}</div>
                </div>
                <button
                  onClick={() => {
                    setTestEmail(cred.email);
                    setTestPassword(cred.password);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Use These
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {message && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-sm whitespace-pre-wrap">{message}</pre>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-purple-50 p-4 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">📋 Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>First, check if you have an active session</li>
            <li>Try the suggested credentials above</li>
            <li>If none work, you may need to create a user first</li>
            <li>Use working credentials in your SignIn page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}