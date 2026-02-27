<?php

use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EntreeController;
use App\Http\Controllers\Api\InventaireController;
use App\Http\Controllers\Api\SortieController;
use Illuminate\Support\Facades\Route;

// Dashboard
Route::get('/dashboard', [DashboardController::class, 'index']);

// Articles
Route::apiResource('articles', ArticleController::class);

// Entrées — recalcule l'inventaire automatiquement après store/update/destroy
Route::apiResource('entrees', EntreeController::class);

// Sorties — recalcule l'inventaire automatiquement après store/update/destroy
Route::apiResource('sorties', SortieController::class);

// Inventaire unique permanent
Route::get('/inventaire',             [InventaireController::class, 'show']);        // lire
Route::post('/inventaire/trouves',    [InventaireController::class, 'saveTrouves']); // sauvegarder stock_trouve
Route::post('/inventaire/recalculer', [InventaireController::class, 'recalculer']); // forcer recalcul
