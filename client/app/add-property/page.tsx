'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProperty } from '@/lib/api';

export default function AddPropertyPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    Title: '',
    Price: 0,
    Bedrooms: 1,
    Address: '',
    ImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6' // Default placeholder
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Calls Laravel (Protected Route)
      await createProperty({
        title: formData.Title,
        price: Number(formData.Price),
        bedrooms: Number(formData.Bedrooms),
        address: formData.Address,
        imageUrl: formData.ImageUrl,
      });
      
      // Success! Go back to dashboard to see it via .NET
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-start">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mt-10">
        <h1 className="text-2xl font-bold mb-6 text-blue-800">Add New Listing</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">Title</label>
            <input 
              type="text" 
              required
              className="w-full p-2 border rounded mt-1 text-black"
              value={formData.Title}
              onChange={e => setFormData({...formData, Title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">Price ($)</label>
              <input 
                type="number" 
                required
                className="w-full p-2 border rounded mt-1 text-black"
                value={formData.Price}
                onChange={e => setFormData({...formData, Price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Bedrooms</label>
              <input 
                type="number" 
                required
                className="w-full p-2 border rounded mt-1 text-black"
                value={formData.Bedrooms}
                onChange={e => setFormData({...formData, Bedrooms: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Address</label>
            <input 
              type="text" 
              required
              className="w-full p-2 border rounded mt-1 text-black"
              value={formData.Address}
              onChange={e => setFormData({...formData, Address: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="w-1/2 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="w-1/2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Saving...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}