<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sortie extends Model
{
    protected $fillable = [
        'site_id', 'article_id', 'technicien', 'affectation', 'quantite', 'date',
    ];
    protected $casts = ['date' => 'date:Y-m-d'];
    public function article(): BelongsTo { return $this->belongsTo(Article::class); }
    public function site(): BelongsTo   { return $this->belongsTo(Site::class); }
}
