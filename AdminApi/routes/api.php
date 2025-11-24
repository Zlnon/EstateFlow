<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PropertyController;

// This is the default user route (you can keep or remove it)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// --- ADD THIS ---
Route::post('/properties', [PropertyController::class, 'store']);