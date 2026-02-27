<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Entree extends Model
{
    protected $fillable = [
        'article_id', 'ref_bl', 'ref_article',
        'fournisseur', 'quantite', 'date', 'observation',
    ];

    protected $casts = ['date' => 'date:Y-m-d'];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
