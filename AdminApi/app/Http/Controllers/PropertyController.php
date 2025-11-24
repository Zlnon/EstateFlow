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
        // 1. Validate the incoming data
        $validated = $request->validate([
            'Title' => 'required|string|max:100',
            'Price' => 'required|numeric',
            'Bedrooms' => 'required|integer',
            'Address' => 'required|string',
        ]);

        // 2. Add the timestamp (since .NET expects ListedAt)
        $validated['ListedAt'] = Carbon::now();

        // 3. Save to Azure SQL using Eloquent
        $property = Property::create($validated);

        return response()->json([
            'message' => 'Property created via Laravel!',
            'data' => $property
        ], 201);
    }
}