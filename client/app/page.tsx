"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { fetchProperties, Property } from "@/lib/api";

const queryClient = new QueryClient();

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <EstateDashboard />
    </QueryClientProvider>
  );
}

function EstateDashboard() {
  // Fetching data from .NET
  const {
    data: properties,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
  });

  // Check if logged in (Client-side check)
  const [user, setUser] = useState<{ name: string } | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("estate_user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem("estate_token");
    localStorage.removeItem("estate_user");
    setUser(null);
    window.location.reload();
  };

  if (isLoading)
    return <div className="p-10 text-xl">Loading EstateFlow...</div>;
  if (error)
    return <div className="p-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800">
          🏢 EstateFlow Dashboard
        </h1>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Welcome, <b>{user.name}</b>
            </span>
            <Link
              href="/add-property"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Add Property
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Agent Login
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((property: Property) => (
          <div key={property.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">
              {property.title}
            </h2>
            <p className="text-gray-600 mt-2">{property.address}</p>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-blue-600 font-bold text-lg">
                ${property.price.toLocaleString()}
              </span>
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                🛏️ {property.bedrooms} Beds
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
