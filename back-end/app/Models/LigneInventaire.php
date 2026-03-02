<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LigneInventaire extends Model
{
    protected $table    = 'lignes_inventaire';
    protected $fillable = [
        'site_id', 'inventaire_id', 'article_id',
        'stock_theorique', 'stock_trouve', 'ecart', 'observation',
    ];

    public function article(): BelongsTo    { return $this->belongsTo(Article::class); }
    public function inventaire(): BelongsTo { return $this->belongsTo(Inventaire::class); }
}
