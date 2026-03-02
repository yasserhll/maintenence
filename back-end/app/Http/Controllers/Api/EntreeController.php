<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Entree;
use App\Models\Inventaire;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EntreeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Entree::with('article')->orderByDesc('date')->orderByDesc('id');
        if (!$request->user()->isSuperAdmin()) {
            $query->where('entrees.site_id', $request->user()->site_id);
        } elseif ($request->has('site_id')) {
            $query->where('entrees.site_id', $request->site_id);
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
            'ref_bl'      => 'nullable|string|max:100',
            'ref_article' => 'nullable|string|max:100',
            'fournisseur' => 'nullable|string|max:255',
            'observation' => 'nullable|string',
        ]);

        $data['site_id'] = $siteId;
        $entree  = Entree::create($data);
        $article = $entree->article;
        $article->recalculerStock();

        $inventaire = Inventaire::getOrCreateForSite($siteId);
        $inventaire->mettreAJourLigne($article);

        return response()->json($entree->load('article'), 201);
    }

    public function show(Entree $entree): JsonResponse { return response()->json($entree->load('article')); }

    public function update(Request $request, Entree $entree): JsonResponse
    {
        $data = $request->validate([
            'article_id'  => 'sometimes|exists:articles,id',
            'quantite'    => 'sometimes|integer|min:1',
            'date'        => 'sometimes|date',
            'ref_bl'      => 'nullable|string|max:100',
            'ref_article' => 'nullable|string|max:100',
            'fournisseur' => 'nullable|string|max:255',
            'observation' => 'nullable|string',
        ]);

        $oldArticleId = $entree->article_id;
        $entree->update($data);

        if (isset($data['article_id']) && $data['article_id'] != $oldArticleId) {
            $old = Article::find($oldArticleId);
            if ($old) { $old->recalculerStock(); Inventaire::getOrCreateForSite($entree->site_id)->mettreAJourLigne($old); }
        }
        $article = $entree->fresh()->article;
        $article->recalculerStock();
        Inventaire::getOrCreateForSite($entree->site_id)->mettreAJourLigne($article);
        return response()->json($entree->load('article'));
    }

    public function destroy(Entree $entree): JsonResponse
    {
        $article = $entree->article;
        $siteId  = $entree->site_id;
        $entree->delete();
        $article->recalculerStock();
        Inventaire::getOrCreateForSite($siteId)->mettreAJourLigne($article);
        return response()->json(null, 204);
    }
}
