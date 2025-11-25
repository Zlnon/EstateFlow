// src/lib/api.ts

// ⚠️ REPLACE 5026 with your actual .NET port from Swagger URL
const DOTNET_API_URL = 'http://localhost:5026/api'; 

// ⚠️ REPLACE 8000 with your Laravel port
const LARAVEL_API_URL = 'http://127.0.0.1:8000/api';

export interface Property {
  id: number;
  title: string;
  price: number;
  bedrooms: number;
  address: string;
  imageUrl?: string;
}

// Fetch from .NET (Read)
export const fetchProperties = async (): Promise<Property[]> => {
  const res = await fetch(`${DOTNET_API_URL}/Properties`);
  if (!res.ok) throw new Error('Failed to fetch properties');
  return res.json();
};

// Post to Laravel (Write)
export const createProperty = async (data: Omit<Property, 'id'>) => {
  const res = await fetch(`${LARAVEL_API_URL}/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create property');
  return res.json();
};