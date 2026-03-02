<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Inventaire extends Model
{
    protected $fillable = ['site_id', 'site', 'date_creation', 'derniere_maj'];
    protected $casts = ['date_creation' => 'date:Y-m-d', 'derniere_maj' => 'datetime'];

    public function lignes(): HasMany { return $this->hasMany(LigneInventaire::class); }

    public static function getOrCreateForSite(int $siteId): self
    {
        $site = Site::find($siteId);
        return self::firstOrCreate(
            ['site_id' => $siteId],
            ['site' => $site?->nom ?? 'Site', 'date_creation' => now()->toDateString(), 'derniere_maj' => now()]
        );
    }

    public function mettreAJourLigne(Article $article): void
    {
        $theorique = (int)$article->stock_actuel;
        $ligne = $this->lignes()->where('article_id', $article->id)->first();

        if ($ligne) {
            $ligne->stock_theorique = $theorique;
            if ($ligne->stock_trouve !== null && $ligne->stock_trouve > 0) {
                $ligne->ecart = $ligne->stock_trouve - $theorique;
            }
            $ligne->save();
        } else {
            $this->lignes()->create([
                'site_id'         => $this->site_id,
                'article_id'      => $article->id,
                'stock_theorique' => $theorique,
                'stock_trouve'    => 0,
                'ecart'           => 0,
            ]);
        }
        $this->update(['derniere_maj' => now()]);
    }

    public function recalculer(?int $siteId = null): void
    {
        $sid = $siteId ?? $this->site_id;

        DB::statement("
            UPDATE articles a
            SET a.stock_actuel = a.stock_initial
                + COALESCE((SELECT SUM(e.quantite) FROM entrees e WHERE e.article_id = a.id), 0)
                - COALESCE((SELECT SUM(s.quantite) FROM sorties s WHERE s.article_id = a.id), 0)
            WHERE a.site_id = {$sid}
        ");

        $articles = Article::where('site_id', $sid)->get();
        foreach ($articles as $article) {
            $this->mettreAJourLigne($article);
        }
        $this->update(['derniere_maj' => now()]);
    }
}
