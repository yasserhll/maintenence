<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Article extends Model
{
    protected $fillable = [
        'reference', 'designation', 'marque', 'unite',
        'emplacement', 'stock_initial', 'stock_min', 'prix_unitaire',
    ];

    protected $appends = ['stock_actuel'];

    public function entrees(): HasMany
    {
        return $this->hasMany(Entree::class);
    }

    public function sorties(): HasMany
    {
        return $this->hasMany(Sortie::class);
    }

    public function getStockActuelAttribute(): int
    {
        $totalEntrees = $this->entrees()->sum('quantite');
        $totalSorties = $this->sorties()->sum('quantite');
        return (int) $this->stock_initial + $totalEntrees - $totalSorties;
    }
}
