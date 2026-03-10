"use client";

import { useAuth } from "@/app/context/AuthContext";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import Link from "next/link";

function AdminDashboardContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/perfumes" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">Products</h2>
          <p className="text-gray-500">Manage perfumes</p>
        </Link>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Orders</h2>
          <p className="text-gray-500">Coming soon</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-gray-500">Coming soon</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
