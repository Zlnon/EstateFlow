"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { fetchProperties, searchProperties, Property, deleteProperty, SearchFilters } from "@/lib/api";

const queryClient = new QueryClient();

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <EstateDashboard />
    </QueryClientProvider>
  );
}

function EstateDashboard() {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Search filters (immediate - for UI updates)
  const [filters, setFilters] = useState<SearchFilters>({
    minPrice: undefined,
    maxPrice: undefined,
    minBedrooms: undefined,
  });

  // Debounced filters (delayed - for API calls)
  const [debouncedFilters, setDebouncedFilters] = useState<SearchFilters>(filters);

  // Debounce filter changes (wait 500ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  // Fetching data from .NET (uses debounced filters)
  const {
    data: properties,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["properties", debouncedFilters],
    queryFn: () => searchProperties(debouncedFilters),
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

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await deleteProperty(id);
      setDeleteId(null);
      refetch(); // Refresh the list
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete property");
    } finally {
      setIsDeleting(false);
    }
  };

  if (error)
    return <div className="p-10 text-red-500">Error: {error.message}</div>;

  const handleSearch = () => {
    refetch();
  };

  const handleClearFilters = () => {
    setFilters({
      minPrice: undefined,
      maxPrice: undefined,
      minBedrooms: undefined,
    });
  };

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

      {/* Search and Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Search Properties</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price ($)
              </label>
              <input
                type="number"
                placeholder="e.g. 100000"
                className="w-full p-2 border rounded text-black"
                value={filters.minPrice || ""}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price ($)
              </label>
              <input
                type="number"
                placeholder="e.g. 500000"
                className="w-full p-2 border rounded text-black"
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Bedrooms
              </label>
              <input
                type="number"
                placeholder="e.g. 2"
                min="0"
                className="w-full p-2 border rounded text-black"
                value={filters.minBedrooms || ""}
                onChange={(e) =>
                  setFilters({ ...filters, minBedrooms: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            className="flex-1 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium"
          >
            🔍 Search
          </button>
          <button
            onClick={handleClearFilters}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeleton - show 6 placeholder cards
          [...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              {/* Image skeleton */}
              <div className="w-full h-48 bg-gray-300"></div>

              <div className="p-6">
                {/* Title skeleton */}
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>

                {/* Address skeleton */}
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>

                {/* Price and bedrooms skeleton */}
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
              </div>
            </div>
          ))
        ) : properties && properties.length > 0 ? (
          properties.map((property: Property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {property.imageUrl && (
              <div className="w-full h-48 relative overflow-hidden bg-gray-200">
                <Image
                  src={property.imageUrl}
                  alt={property.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="p-6">
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

              {/* Edit/Delete buttons - Only visible to logged-in users */}
              {user && (
                <div className="mt-4 flex gap-2 border-t pt-4">
                  <button
                    onClick={() => router.push(`/edit-property/${property.id}`)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(property.id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          ))
        ) : (
          // No results message
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 text-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="font-semibold">No properties found</p>
              <p className="text-sm mt-2">Try adjusting your search filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
