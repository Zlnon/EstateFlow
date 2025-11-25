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

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("estate_token");
  }
  return null;
};
// Post to Laravel (Write)
export const createProperty = async (data: Omit<Property, "id">) => {
  const token = getToken();
  const res = await fetch(`${LARAVEL_API_URL}/properties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create property");
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
