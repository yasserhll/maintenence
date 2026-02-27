<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventaire extends Model
{
    protected $fillable = ['site', 'date_creation', 'derniere_maj'];

    protected $casts = [
        'date_creation' => 'date:Y-m-d',
        'derniere_maj'  => 'datetime',
    ];

    public function lignes(): HasMany
    {
        return $this->hasMany(LigneInventaire::class);
    }

    /**
     * Récupère ou crée l'inventaire unique pour un site.
     */
    public static function getOrCreateForSite(string $site = 'Benguerir'): self
    {
        return self::firstOrCreate(
            ['site' => $site],
            ['date_creation' => now()->toDateString(), 'derniere_maj' => now()]
        );
    }

    /**
     * Recalcule le stock_theorique de toutes les lignes
     * et ajoute les nouveaux articles s'il en manque.
     * Appelé automatiquement après chaque entrée/sortie.
     */
    public function recalculer(): void
    {
        $articles = Article::with(['entrees', 'sorties'])->get();

        foreach ($articles as $article) {
            $theorique = $article->stock_initial
                + $article->entrees->sum('quantite')
                - $article->sorties->sum('quantite');

            $ligne = $this->lignes()->where('article_id', $article->id)->first();

            if ($ligne) {
                $ligne->stock_theorique = $theorique;
                // Recalcule l'écart seulement si stock_trouve a été saisi (> 0 ou explicitement défini)
                if ($ligne->getRawOriginal('stock_trouve') !== null && $ligne->stock_trouve !== null) {
                    $ligne->ecart = $ligne->stock_trouve - $theorique;
                }
                $ligne->save();
            } else {
                // Utilise updateOrCreate pour éviter les doublons et gérer les colonnes NOT NULL
                $this->lignes()->updateOrCreate(
                    ['article_id' => $article->id],
                    [
                        'stock_theorique' => $theorique,
                        'stock_trouve'    => 0,   // valeur neutre compatible NOT NULL
                        'ecart'           => 0,
                    ]
                );
            }
        }

        $this->update(['derniere_maj' => now()]);
    }
}
