<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'site_id'];
    protected $hidden   = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password'          => 'hashed',
            'email_verified_at' => 'datetime',
        ];
    }

    public function site() { return $this->belongsTo(Site::class); }

    public function isSuperAdmin(): bool { return $this->role === 'superadmin'; }
    public function isAdmin(): bool      { return in_array($this->role, ['superadmin', 'admin']); }

    /** Retourne le site_id à utiliser pour filtrer les données */
    public function siteIdForQuery(): ?int
    {
        return $this->isSuperAdmin() ? null : $this->site_id;
    }
}
