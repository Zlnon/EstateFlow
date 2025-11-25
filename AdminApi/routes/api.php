<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;

// --- PUBLIC ROUTES (No Key Needed) ---
Route::post("/register", [AuthController::class, "register"]);
Route::post("/login", [AuthController::class, "login"])->name("login");

// --- PROTECTED ROUTES (Need Valid Token) ---
Route::group(["middleware" => "auth:api"], function () {
    // Auth Management
    Route::post("/logout", [AuthController::class, "logout"]);
    Route::post("/me", [AuthController::class, "me"]);

    // Property Management (All Secured!)
    // Update routes must come before create to avoid conflicts
    Route::post("/properties/{id}", [PropertyController::class, "update"]); // For FormData with _method=PUT
    Route::put("/properties/{id}", [PropertyController::class, "update"]);
    Route::patch("/properties/{id}", [PropertyController::class, "update"]);
    Route::delete("/properties/{id}", [PropertyController::class, "destroy"]);
    Route::post("/properties", [PropertyController::class, "store"]); // Create new property
});
