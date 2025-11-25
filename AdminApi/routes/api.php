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

    // Business Logic (Now Secured!)
    Route::post("/properties", [PropertyController::class, "store"]);
});
