<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Article extends Model
{
    protected $fillable = [
        'site_id', 'reference', 'designation', 'marque', 'unite',
        'emplacement', 'stock_initial', 'stock_min', 'prix_unitaire',
    ];

    protected $appends = [];

    public function site(): BelongsTo    { return $this->belongsTo(Site::class); }
    public function entrees(): HasMany   { return $this->hasMany(Entree::class); }
    public function sorties(): HasMany   { return $this->hasMany(Sortie::class); }

    public function recalculerStock(): void
    {
        $totalEntrees = $this->entrees()->sum('quantite');
        $totalSorties = $this->sorties()->sum('quantite');
        $this->stock_actuel = (int)$this->stock_initial + (int)$totalEntrees - (int)$totalSorties;
        $this->saveQuietly();
    }
}
