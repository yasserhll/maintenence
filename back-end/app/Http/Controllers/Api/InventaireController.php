<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventaire;
use App\Models\LigneInventaire;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventaireController extends Controller
{
    private function getSiteId(Request $request): int
    {
        if (!$request->user()->isSuperAdmin()) return (int)$request->user()->site_id;
        return (int)$request->input('site_id', $request->user()->site_id ?? 1);
    }

    public function show(Request $request): JsonResponse
    {
        $siteId = $this->getSiteId($request);
        $inventaire = Inventaire::getOrCreateForSite($siteId);

        if ($inventaire->lignes()->count() === 0) {
            $inventaire->recalculer($siteId);
        }

        $lignes = $inventaire->lignes()->with('article')->get()->map(function ($ligne) {
            $article = $ligne->article;
            if ($article) {
                $ligne->total_entrees = (int) DB::table('entrees')->where('article_id', $article->id)->sum('quantite');
                $ligne->total_sorties = (int) DB::table('sorties')->where('article_id', $article->id)->sum('quantite');
            } else {
                $ligne->total_entrees = 0;
                $ligne->total_sorties = 0;
            }
            return $ligne;
        });

        return response()->json([
            'id' => $inventaire->id, 'site' => $inventaire->site,
            'date_creation' => $inventaire->date_creation,
            'derniere_maj' => $inventaire->derniere_maj,
            'lignes' => $lignes,
        ]);
    }

    public function saveTrouves(Request $request): JsonResponse
    {
        $request->validate([
            'lignes' => 'required|array',
            'lignes.*.id' => 'required|exists:lignes_inventaire,id',
            'lignes.*.stock_trouve' => 'required|integer|min:0',
            'lignes.*.observation' => 'nullable|string',
        ]);

        foreach ($request->lignes as $item) {
            $ligne = LigneInventaire::find($item['id']);
            $ligne->stock_trouve = $item['stock_trouve'];
            $ligne->ecart        = $item['stock_trouve'] - $ligne->stock_theorique;
            $ligne->observation  = $item['observation'] ?? null;
            $ligne->save();
        }

        $siteId = $this->getSiteId($request);
        Inventaire::getOrCreateForSite($siteId)->update(['derniere_maj' => now()]);
        return response()->json(['message' => 'Stock trouvé sauvegardé.']);
    }

    public function recalculer(Request $request): JsonResponse
    {
        $siteId = $this->getSiteId($request);
        $inventaire = Inventaire::getOrCreateForSite($siteId);
        $inventaire->recalculer($siteId);
        return $this->show($request);
    }
}
