<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Models\Property;
use Carbon\Carbon;

class PropertyController extends Controller
{
    // POST /api/properties
    public function store(Request $request)
    {
        try {
            // 1. Validate the incoming data (accept camelCase from frontend)
            $validated = $request->validate([
                "title" => "required|string|max:100",
                "price" => "required|numeric",
                "bedrooms" => "required|integer",
                "address" => "required|string",
                "image" => "required|image|mimes:jpeg,png,jpg,gif,svg|max:5120",
            ]);

            $imageUrl = null;
            $path = null;

            // 2. Upload to Azure Blob Storage
            if ($request->hasFile('image')) {
                try {
                    Log::info('Starting Azure upload...');
                    $file = $request->file('image');
                    
                    // Generate a unique filename
                    $filename = time() . '_' . $file->getClientOriginalName();
                    
                    // Use the 'azure' disk configured in filesystems.php
                    // This handles the put/upload logic automatically
                    // storeAs(folder, filename, disk)
                    $path = $file->storeAs('properties', $filename, 'azure');
                    
                    if (!$path) {
                        throw new \Exception("File upload returned false - upload may have failed");
                    }
                    
                    Log::info('File stored successfully at path: ' . $path);
                    
                    // Generate the full public URL automatically using the driver
                    $imageUrl = Storage::disk('azure')->url($path);
                    
                    // Fallback: If the driver returns a relative path or throws error, construct manually
                    if (!$imageUrl || !filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                         $accountName = env('AZURE_STORAGE_NAME');
                         $container = env('AZURE_STORAGE_CONTAINER');
                         $imageUrl = "https://{$accountName}.blob.core.windows.net/{$container}/{$path}";
                    }

                    Log::info('Final image URL: ' . $imageUrl);

                } catch (\Exception $e) {
                    Log::error('Azure upload error: ' . $e->getMessage());
                    Log::error($e->getTraceAsString());
                    return response()->json([
                        "message" => "Failed to upload image to Azure: " . $e->getMessage(),
                    ], 500);
                }
            }

            // 3. Transform camelCase/Input to PascalCase for database
            // Note: Frontend sends lowercase keys for text fields usually, but let's respect $validated keys
            $propertyData = [
                "Title" => $validated["title"],
                "Price" => $validated["price"],
                "Bedrooms" => $validated["bedrooms"],
                "Address" => $validated["address"],
                "ImageUrl" => $imageUrl,
                "ListedAt" => Carbon::now(),
            ];

            // 4. Save to Azure SQL using Eloquent
            try {
                $property = Property::create($propertyData);
            } catch (\Exception $e) {
                // Clean up the uploaded file if DB save fails (optional good practice)
                if ($path) {
                    Storage::disk('azure')->delete($path);
                }
                
                return response()->json([
                    "message" => "Failed to save property to database: " . $e->getMessage(),
                ], 500);
            }

            return response()->json([
                "message" => "Property created via Laravel!",
                "data" => $property,
                "debug" => [
                    "imageUrl" => $imageUrl,
                    "path" => $path,
                ],
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                "message" => "Validation failed",
                "errors" => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Failed to create property: " . $e->getMessage(),
            ], 500);
        }
    }

    // PUT/PATCH /api/properties/{id}
    public function update(Request $request, $id)
    {
        try {
            // Find the property
            $property = Property::find($id);

            if (!$property) {
                return response()->json([
                    "message" => "Property not found",
                ], 404);
            }

            // Validate incoming data (image is optional for update)
            $validated = $request->validate([
                "title" => "sometimes|required|string|max:100",
                "price" => "sometimes|required|numeric",
                "bedrooms" => "sometimes|required|integer",
                "address" => "sometimes|required|string",
                "image" => "sometimes|image|mimes:jpeg,png,jpg,gif,svg|max:5120",
            ]);

            $imageUrl = $property->ImageUrl;
            $oldImagePath = null;

            // Handle image update if new image is provided
            if ($request->hasFile('image')) {
                try {
                    Log::info('Updating property image...');
                    $file = $request->file('image');

                    // Generate unique filename
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs('properties', $filename, 'azure');

                    if (!$path) {
                        throw new \Exception("File upload returned false");
                    }

                    // Generate new image URL
                    $imageUrl = Storage::disk('azure')->url($path);

                    if (!$imageUrl || !filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                        $accountName = env('AZURE_STORAGE_NAME');
                        $container = env('AZURE_STORAGE_CONTAINER');
                        $imageUrl = "https://{$accountName}.blob.core.windows.net/{$container}/{$path}";
                    }

                    // Extract old image path from URL for deletion
                    if ($property->ImageUrl) {
                        $oldImagePath = $this->extractPathFromUrl($property->ImageUrl);
                    }

                    Log::info('New image uploaded: ' . $imageUrl);
                } catch (\Exception $e) {
                    Log::error('Image update error: ' . $e->getMessage());
                    return response()->json([
                        "message" => "Failed to upload new image: " . $e->getMessage(),
                    ], 500);
                }
            }

            // Update property data
            $updateData = [];
            if (isset($validated['title'])) $updateData['Title'] = $validated['title'];
            if (isset($validated['price'])) $updateData['Price'] = $validated['price'];
            if (isset($validated['bedrooms'])) $updateData['Bedrooms'] = $validated['bedrooms'];
            if (isset($validated['address'])) $updateData['Address'] = $validated['address'];
            if ($request->hasFile('image')) $updateData['ImageUrl'] = $imageUrl;

            $property->update($updateData);

            // Delete old image after successful update
            if ($oldImagePath && $request->hasFile('image')) {
                try {
                    Storage::disk('azure')->delete($oldImagePath);
                    Log::info('Old image deleted: ' . $oldImagePath);
                } catch (\Exception $e) {
                    Log::warning('Failed to delete old image: ' . $e->getMessage());
                }
            }

            return response()->json([
                "message" => "Property updated successfully!",
                "data" => $property->fresh(),
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                "message" => "Validation failed",
                "errors" => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Failed to update property: " . $e->getMessage(),
            ], 500);
        }
    }

    // DELETE /api/properties/{id}
    public function destroy($id)
    {
        try {
            $property = Property::find($id);

            if (!$property) {
                return response()->json([
                    "message" => "Property not found",
                ], 404);
            }

            // Extract image path from URL
            $imagePath = $this->extractPathFromUrl($property->ImageUrl);

            // Delete property from database
            $property->delete();

            // Delete image from Azure Blob Storage
            if ($imagePath) {
                try {
                    Storage::disk('azure')->delete($imagePath);
                    Log::info('Image deleted from Azure: ' . $imagePath);
                } catch (\Exception $e) {
                    Log::warning('Failed to delete image from Azure: ' . $e->getMessage());
                }
            }

            return response()->json([
                "message" => "Property deleted successfully!",
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                "message" => "Failed to delete property: " . $e->getMessage(),
            ], 500);
        }
    }

    // Helper: Extract path from Azure URL
    private function extractPathFromUrl($url)
    {
        if (!$url) return null;

        // Extract path after container name
        // Example: https://account.blob.core.windows.net/container/properties/file.jpg
        $container = env('AZURE_STORAGE_CONTAINER');
        $pattern = '/' . preg_quote($container, '/') . '\/(.+?)(\?|$)/';

        if (preg_match($pattern, $url, $matches)) {
            return $matches[1]; // Returns: properties/file.jpg
        }

        return null;
    }
}