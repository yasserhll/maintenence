<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Inventaire;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Article::orderBy('designation')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'designation'   => 'required|string|max:255',
            'reference'     => 'nullable|string|max:100',
            'marque'        => 'nullable|string|max:100',
            'unite'         => 'nullable|string|max:50',
            'emplacement'   => 'nullable|string|max:100',
            'stock_initial' => 'integer|min:0',
            'stock_min'     => 'integer|min:0',
            'prix_unitaire' => 'numeric|min:0',
        ]);

        $article = Article::create($data);

        // Ajouter la ligne dans l'inventaire automatiquement
        $inventaire = Inventaire::getOrCreateForSite('Benguerir');
        $inventaire->recalculer();

        return response()->json($article, 201);
    }

    public function show(Article $article): JsonResponse
    {
        return response()->json($article);
    }

    public function update(Request $request, Article $article): JsonResponse
    {
        $data = $request->validate([
            'designation'   => 'sometimes|required|string|max:255',
            'reference'     => 'nullable|string|max:100',
            'marque'        => 'nullable|string|max:100',
            'unite'         => 'nullable|string|max:50',
            'emplacement'   => 'nullable|string|max:100',
            'stock_initial' => 'integer|min:0',
            'stock_min'     => 'integer|min:0',
            'prix_unitaire' => 'numeric|min:0',
        ]);

        $article->update($data);

        // Si stock_initial change, recalculer l'inventaire
        if (isset($data['stock_initial'])) {
            $inventaire = Inventaire::getOrCreateForSite('Benguerir');
            $inventaire->recalculer();
        }

        return response()->json($article);
    }

    public function destroy(Article $article): JsonResponse
    {
        $article->delete();
        return response()->json(null, 204);
    }
}
