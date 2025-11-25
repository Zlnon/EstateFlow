<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // 1. REGISTER (Create User + Issue Token)
    public function register(Request $request)
    {
        $request->validate([
            "name" => "required|string|max:255",
            "email" => "required|string|email|max:255|unique:users",
            "password" => "required|string|min:6",
        ]);

        $user = User::create([
            "name" => $request->name,
            "email" => $request->email,
            "password" => Hash::make($request->password),
        ]);

        // Immediately log them in and get a token
        $token = Auth::guard("api")->login($user);

        return response()->json(
            [
                "message" => "User created successfully",
                "user" => $user,
                "authorization" => [
                    "token" => $token,
                    "type" => "bearer",
                ],
            ],
            201,
        );
    }

    // 2. LOGIN (Exchange Credentials for Token)
    public function login(Request $request)
    {
        $request->validate([
            "email" => "required|string|email",
            "password" => "required|string",
        ]);

        $credentials = $request->only("email", "password");

        // Check credentials using the 'api' guard (JWT)
        $token = Auth::guard("api")->attempt($credentials);

        if (!$token) {
            return response()->json(
                [
                    "status" => "error",
                    "message" => "Unauthorized",
                ],
                401,
            );
        }

        $user = Auth::guard("api")->user();

        return response()->json([
            "status" => "success",
            "user" => $user,
            "authorization" => [
                "token" => $token,
                "type" => "bearer",
            ],
        ]);
    }

    // 3. ME (Who am I?) getUser 
    public function me()
    {
        return response()->json(Auth::guard("api")->user());
    }

    // 4. LOGOUT (Invalidate Token)
    public function logout()
    {
        Auth::guard("api")->logout();
        return response()->json([
            "status" => "success",
            "message" => "Successfully logged out",
        ]);
    }
}
