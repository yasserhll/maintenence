<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Entree;
use App\Models\Sortie;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $articles        = Article::all();
        $totalEntreesQty = Entree::sum('quantite');
        $totalSortiesQty = Sortie::sum('quantite');

        $alertes = $articles
            ->filter(fn(Article $a) => $a->stock_min > 0 && $a->stock_actuel <= $a->stock_min)
            ->values()
            ->map(fn(Article $a) => [
                'id'           => $a->id,
                'designation'  => $a->designation,
                'reference'    => $a->reference,
                'marque'       => $a->marque,
                'stock_min'    => $a->stock_min,
                'stock_actuel' => $a->stock_actuel,
            ]);

        $top5 = Sortie::selectRaw('article_id, SUM(quantite) as total_qty')
            ->groupBy('article_id')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->with('article')
            ->get()
            ->map(fn($s) => [
                'article_id'  => $s->article_id,
                'designation' => $s->article?->designation,
                'marque'      => $s->article?->marque,
                'total_qty'   => $s->total_qty,
            ]);

        $dernEntrees = Entree::with('article')->orderByDesc('date')->orderByDesc('id')->limit(10)->get()
            ->map(fn(Entree $e) => ['type' => 'entree', 'date' => $e->date, 'designation' => $e->article?->designation, 'quantite' => $e->quantite, 'detail' => $e->fournisseur]);

        $dernSorties = Sortie::with('article')->orderByDesc('date')->orderByDesc('id')->limit(10)->get()
            ->map(fn(Sortie $s) => ['type' => 'sortie', 'date' => $s->date, 'designation' => $s->article?->designation, 'quantite' => $s->quantite, 'detail' => $s->affectation]);

        $derniers = collect([...$dernEntrees, ...$dernSorties])
            ->sortByDesc('date')->values()->take(10);

        return response()->json([
            'total_articles'      => $articles->count(),
            'total_entrees_qty'   => (int) $totalEntreesQty,
            'total_sorties_qty'   => (int) $totalSortiesQty,
            'nb_alertes'          => $alertes->count(),
            'alertes'             => $alertes,
            'top5_sorties'        => $top5,
            'derniers_mouvements' => $derniers,
        ]);
    }
}
