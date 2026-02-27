<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventaire;
use App\Models\LigneInventaire;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventaireController extends Controller
{
    /**
     * Retourne l'inventaire unique du site avec toutes ses lignes.
     * Les stock_theorique sont toujours à jour (recalculés à chaque entrée/sortie).
     */
    public function show(): JsonResponse
    {
        $inventaire = Inventaire::getOrCreateForSite('Benguerir');

        // Si l'inventaire vient d'être créé (aucune ligne), on calcule une première fois
        if ($inventaire->lignes()->count() === 0) {
            $inventaire->recalculer();
        }

        $inventaire->load(['lignes.article' => function ($q) {
            $q->orderBy('designation');
        }]);

        return response()->json($inventaire);
    }

    /**
     * Sauvegarde les stock_trouve saisis manuellement par l'utilisateur.
     * Ne recalcule PAS le stock_theorique (déjà à jour).
     */
    public function saveTrouves(Request $request): JsonResponse
    {
        $request->validate([
            'lignes'                    => 'required|array',
            'lignes.*.id'               => 'required|exists:lignes_inventaire,id',
            'lignes.*.stock_trouve'     => 'required|integer|min:0',
            'lignes.*.observation'      => 'nullable|string',
        ]);

        foreach ($request->lignes as $item) {
            $ligne = LigneInventaire::find($item['id']);
            $ligne->stock_trouve = $item['stock_trouve'];
            $ligne->ecart        = $item['stock_trouve'] - $ligne->stock_theorique;
            $ligne->observation  = $item['observation'] ?? null;
            $ligne->save();
        }

        $inventaire = Inventaire::getOrCreateForSite('Benguerir');
        $inventaire->update(['derniere_maj' => now()]);

        return response()->json(['message' => 'Stock trouvé sauvegardé.']);
    }

    /**
     * Force un recalcul complet (si besoin manuel).
     */
    public function recalculer(): JsonResponse
    {
        $inventaire = Inventaire::getOrCreateForSite('Benguerir');
        $inventaire->recalculer();
        $inventaire->load('lignes.article');
        return response()->json($inventaire);
    }
}
