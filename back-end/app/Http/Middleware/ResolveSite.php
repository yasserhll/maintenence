<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ResolveSite
{
    public function handle(Request $request, Closure $next)
    {
        // Injecte le site_id de l'user courant dans la requête
        // Les controllers l'utilisent via $request->user()->site_id
        return $next($request);
    }
}
