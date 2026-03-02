<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Inventaire;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    private function siteId(Request $request): int
    {
        $user = $request->user();
        if ($user->isSuperAdmin() && $request->has('site_id')) {
            return (int) $request->site_id;
        }
        return (int) $user->site_id;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Article::orderBy('designation');
        if (!$request->user()->isSuperAdmin()) {
            $query->where('site_id', $request->user()->site_id);
        } elseif ($request->has('site_id')) {
            $query->where('site_id', $request->site_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $siteId = $this->siteId($request);
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

        $data['site_id']     = $siteId;
        $data['stock_actuel'] = $data['stock_initial'] ?? 0;
        $article = Article::create($data);

        $inventaire = Inventaire::getOrCreateForSite($siteId);
        $inventaire->mettreAJourLigne($article);

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

        if (isset($data['stock_initial'])) {
            $article->recalculerStock();
            $inventaire = Inventaire::getOrCreateForSite($article->site_id);
            $inventaire->mettreAJourLigne($article);
        }

        return response()->json($article->fresh());
    }

    public function destroy(Article $article): JsonResponse
    {
        $article->delete();
        return response()->json(null, 204);
    }
}
