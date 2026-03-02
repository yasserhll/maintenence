<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Site extends Model
{
    protected $fillable = ['nom', 'slug', 'description', 'actif'];

    public function users(): HasMany    { return $this->hasMany(User::class); }
    public function articles(): HasMany { return $this->hasMany(Article::class); }
    public function entrees(): HasMany  { return $this->hasMany(Entree::class); }
    public function sorties(): HasMany  { return $this->hasMany(Sortie::class); }
}
