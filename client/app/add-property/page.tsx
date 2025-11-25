'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createProperty } from '@/lib/api';

export default function AddPropertyPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    Title: '',
    Price: 0,
    Bedrooms: 1,
    Address: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!imageFile) throw new Error("Please select an image");

      // Create FormData (Package for shipping)
      const data = new FormData();
      data.append('title', formData.Title);
      data.append('price', formData.Price.toString());
      data.append('bedrooms', formData.Bedrooms.toString());
      data.append('address', formData.Address);
      data.append('image', imageFile); // Attach the actual file

      await createProperty(data);
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

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Property Images</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative w-full h-48 mx-auto rounded-lg overflow-hidden">
                    <Image 
                      src={imagePreview} 
                      alt="Preview" 
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg 
                    className="mx-auto h-12 w-12 text-gray-400" 
                    stroke="currentColor" 
                    fill="none" 
                    viewBox="0 0 48 48"
                  >
                    <path 
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                  <div>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
            </div>
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