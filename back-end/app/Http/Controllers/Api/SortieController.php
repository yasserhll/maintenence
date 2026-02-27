<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventaire;
use App\Models\Sortie;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SortieController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Sortie::with('article')->orderByDesc('date')->orderByDesc('id')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'article_id'  => 'required|exists:articles,id',
            'quantite'    => 'required|integer|min:1',
            'date'        => 'required|date',
            'technicien'  => 'nullable|string|max:255',
            'affectation' => 'nullable|string|max:255',
        ]);

        $sortie = Sortie::create($data);

        // ─── Mise à jour automatique de l'inventaire ──────────────
        $inventaire = Inventaire::getOrCreateForSite('Benguerir');
        $inventaire->recalculer();
        // ──────────────────────────────────────────────────────────

        return response()->json($sortie->load('article'), 201);
    }

    public function show(Sortie $sortie): JsonResponse
    {
        return response()->json($sortie->load('article'));
    }

    public function update(Request $request, Sortie $sortie): JsonResponse
    {
        $data = $request->validate([
            'article_id'  => 'sometimes|exists:articles,id',
            'quantite'    => 'sometimes|integer|min:1',
            'date'        => 'sometimes|date',
            'technicien'  => 'nullable|string|max:255',
            'affectation' => 'nullable|string|max:255',
        ]);

        $sortie->update($data);

        $inventaire = Inventaire::getOrCreateForSite('Benguerir');
        $inventaire->recalculer();

        return response()->json($sortie->load('article'));
    }

    public function destroy(Sortie $sortie): JsonResponse
    {
        $sortie->delete();

        $inventaire = Inventaire::getOrCreateForSite('Benguerir');
        $inventaire->recalculer();

        return response()->json(null, 204);
    }
}
