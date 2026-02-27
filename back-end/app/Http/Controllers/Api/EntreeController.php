<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entree;
use App\Models\Inventaire;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EntreeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Entree::with('article')->orderByDesc('date')->orderByDesc('id')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'article_id'  => 'required|exists:articles,id',
            'quantite'    => 'required|integer|min:1',
            'date'        => 'required|date',
            'ref_bl'      => 'nullable|string|max:100',
            'ref_article' => 'nullable|string|max:100',
            'fournisseur' => 'nullable|string|max:255',
            'observation' => 'nullable|string',
        ]);

        $entree = Entree::create($data);

        // ─── Mise à jour automatique de l'inventaire ──────────────
        $inventaire = Inventaire::getOrCreateForSite('Benguerir');
        $inventaire->recalculer();
        // ──────────────────────────────────────────────────────────

        return response()->json($entree->load('article'), 201);
    }

    public function show(Entree $entree): JsonResponse
    {
        return response()->json($entree->load('article'));
    }

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

        $entree->update($data);

        $inventaire = Inventaire::getOrCreateForSite('Benguerir');
        $inventaire->recalculer();

        return response()->json($entree->load('article'));
    }

    public function destroy(Entree $entree): JsonResponse
    {
        $entree->delete();

        $inventaire = Inventaire::getOrCreateForSite('Benguerir');
        $inventaire->recalculer();

        return response()->json(null, 204);
    }
}
