<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Inventaire;
use App\Models\Sortie;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SortieController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Sortie::with('article')->orderByDesc('date')->orderByDesc('id');
        if (!$request->user()->isSuperAdmin()) {
            $query->where('sorties.site_id', $request->user()->site_id);
        } elseif ($request->has('site_id')) {
            $query->where('sorties.site_id', $request->site_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $siteId = $request->user()->isSuperAdmin()
            ? (int)$request->input('site_id', $request->user()->site_id)
            : (int)$request->user()->site_id;

        $data = $request->validate([
            'article_id'  => 'required|exists:articles,id',
            'quantite'    => 'required|integer|min:1',
            'date'        => 'required|date',
            'technicien'  => 'nullable|string|max:255',
            'affectation' => 'nullable|string|max:255',
        ]);

        $data['site_id'] = $siteId;
        $sortie  = Sortie::create($data);
        $article = $sortie->article;
        $article->recalculerStock();
        Inventaire::getOrCreateForSite($siteId)->mettreAJourLigne($article);
        return response()->json($sortie->load('article'), 201);
    }

    public function show(Sortie $sortie): JsonResponse { return response()->json($sortie->load('article')); }

    public function update(Request $request, Sortie $sortie): JsonResponse
    {
        $data = $request->validate([
            'article_id'  => 'sometimes|exists:articles,id',
            'quantite'    => 'sometimes|integer|min:1',
            'date'        => 'sometimes|date',
            'technicien'  => 'nullable|string|max:255',
            'affectation' => 'nullable|string|max:255',
        ]);

        $oldArticleId = $sortie->article_id;
        $sortie->update($data);

        if (isset($data['article_id']) && $data['article_id'] != $oldArticleId) {
            $old = Article::find($oldArticleId);
            if ($old) { $old->recalculerStock(); Inventaire::getOrCreateForSite($sortie->site_id)->mettreAJourLigne($old); }
        }
        $article = $sortie->fresh()->article;
        $article->recalculerStock();
        Inventaire::getOrCreateForSite($sortie->site_id)->mettreAJourLigne($article);
        return response()->json($sortie->load('article'));
    }

    public function destroy(Sortie $sortie): JsonResponse
    {
        $article = $sortie->article;
        $siteId  = $sortie->site_id;
        $sortie->delete();
        $article->recalculerStock();
        Inventaire::getOrCreateForSite($siteId)->mettreAJourLigne($article);
        return response()->json(null, 204);
    }
}
