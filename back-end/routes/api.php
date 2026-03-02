<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EntreeController;
use App\Http\Controllers\Api\InventaireController;
use App\Http\Controllers\Api\SortieController;
use Illuminate\Support\Facades\Route;

// ── Auth public ────────────────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

// ── Routes protégées Sanctum ──────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout',          [AuthController::class, 'logout']);
    Route::get('/me',               [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('articles', ArticleController::class);
    Route::apiResource('entrees',  EntreeController::class);
    Route::apiResource('sorties',  SortieController::class);

    Route::get('/inventaire',             [InventaireController::class, 'show']);
    Route::post('/inventaire/trouves',    [InventaireController::class, 'saveTrouves']);
    Route::post('/inventaire/recalculer', [InventaireController::class, 'recalculer']);

    // Admin — middleware class string, pas closure
    Route::middleware('admin')->group(function () {
        Route::get('/admin/sites',           [AdminController::class, 'listSites']);
        Route::post('/admin/sites',          [AdminController::class, 'createSite']);
        Route::put('/admin/sites/{site}',    [AdminController::class, 'updateSite']);
        Route::delete('/admin/sites/{site}', [AdminController::class, 'deleteSite']);

        Route::get('/admin/users',           [AdminController::class, 'listUsers']);
        Route::post('/admin/users',          [AdminController::class, 'createUser']);
        Route::put('/admin/users/{user}',    [AdminController::class, 'updateUser']);
        Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser']);
    });
});
