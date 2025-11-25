// src/lib/api.ts

const DOTNET_API_URL = "http://localhost:5026/api";

const LARAVEL_API_URL = "http://127.0.0.1:8000/api";

export interface Property {
  id: number;
  title: string;
  price: number;
  bedrooms: number;
  address: string;
  imageUrl?: string;
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
}

interface LoginResponse {
  authorization: {
    token: string;
    type: string;
  };
  user: {
    name: string;
    email: string;
  };
}

// Fetch from .NET (Read)
export const fetchProperties = async (): Promise<Property[]> => {
  const res = await fetch(`${DOTNET_API_URL}/Properties`);
  if (!res.ok) throw new Error("Failed to fetch properties");
  return res.json();
};

// Search properties with filters from .NET SearchApi
export const searchProperties = async (filters: SearchFilters): Promise<Property[]> => {
  const params = new URLSearchParams();

  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    params.append('minPrice', filters.minPrice.toString());
  }
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    params.append('maxPrice', filters.maxPrice.toString());
  }
  if (filters.minBedrooms !== undefined && filters.minBedrooms > 0) {
    params.append('minBedrooms', filters.minBedrooms.toString());
  }

  const queryString = params.toString();
  const url = queryString
    ? `${DOTNET_API_URL}/Properties?${queryString}`
    : `${DOTNET_API_URL}/Properties`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to search properties");
  return res.json();
};

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("estate_token");
  }
  return null;
};
// Post to Laravel (Write)
export const createProperty = async (formData: FormData) => {
  const token = getToken();
  const res = await fetch(`${LARAVEL_API_URL}/properties`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body:formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create property");
  }
  return res.json();
};

// Update property (POST with _method override for Laravel)
export const updateProperty = async (id: number, formData: FormData) => {
  const token = getToken();

  // Laravel/PHP doesn't parse FormData properly on PUT requests
  // Use POST with _method=PUT workaround
  formData.append('_method', 'PUT');

  const res = await fetch(`${LARAVEL_API_URL}/properties/${id}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update property");
  }
  return res.json();
};

// Delete property (DELETE to Laravel)
export const deleteProperty = async (id: number) => {
  const token = getToken();
  const res = await fetch(`${LARAVEL_API_URL}/properties/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete property");
  }
  return res.json();
};

// The shape of the response from Laravel

// Call Laravel to get a token
export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const res = await fetch(`${LARAVEL_API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
};
