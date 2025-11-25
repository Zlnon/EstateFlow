<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Property;
use Carbon\Carbon;

class PropertyController extends Controller
{
    // POST /api/properties
    public function store(Request $request)
    {
        // 1. Validate the incoming data (accept camelCase from frontend)
        $validated = $request->validate([
            "title" => "required|string|max:100",
            "price" => "required|numeric",
            "bedrooms" => "required|integer",
            "address" => "required|string",
            "imageUrl" => "nullable|string",
        ]);

        // 2. Transform camelCase to PascalCase for database
        $propertyData = [
            "Title" => $validated["title"],
            "Price" => $validated["price"],
            "Bedrooms" => $validated["bedrooms"],
            "Address" => $validated["address"],
            "ImageUrl" =>
                $validated["imageUrl"] ??
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
            "ListedAt" => Carbon::now(),
        ];

        // 3. Save to Azure SQL using Eloquent
        $property = Property::create($propertyData);

        return response()->json(
            [
                "message" => "Property created via Laravel!",
                "data" => $property,
            ],
            201,
        );
    }
}
