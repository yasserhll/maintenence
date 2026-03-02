<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    // ─── Sites ────────────────────────────────────────────────────────────────

    public function listSites(): JsonResponse
    {
        $sites = Site::withCount('users')->orderBy('nom')->get();
        return response()->json($sites);
    }

    public function createSite(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'         => 'required|string|max:100|unique:sites,nom',
            'description' => 'nullable|string|max:255',
        ]);

        $data['slug'] = \Str::slug($data['nom']);
        $site = Site::create($data);
        return response()->json($site, 201);
    }

    public function updateSite(Request $request, Site $site): JsonResponse
    {
        $data = $request->validate([
            'nom'         => ['required', 'string', 'max:100', Rule::unique('sites')->ignore($site->id)],
            'description' => 'nullable|string|max:255',
            'actif'       => 'boolean',
        ]);
        $data['slug'] = \Str::slug($data['nom']);
        $site->update($data);
        return response()->json($site);
    }

    public function deleteSite(Site $site): JsonResponse
    {
        if ($site->users()->count() > 0) {
            return response()->json(['message' => 'Impossible de supprimer un site qui a des utilisateurs.'], 422);
        }
        $site->delete();
        return response()->json(null, 204);
    }

    // ─── Utilisateurs ─────────────────────────────────────────────────────────

    public function listUsers(): JsonResponse
    {
        $users = User::with('site')->orderBy('name')->get()->map(fn($u) => [
            'id'      => $u->id,
            'name'    => $u->name,
            'email'   => $u->email,
            'role'    => $u->role,
            'site_id' => $u->site_id,
            'site'    => $u->site ? ['id' => $u->site->id, 'nom' => $u->site->nom] : null,
        ]);
        return response()->json($users);
    }

    public function createUser(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role'     => ['required', Rule::in(['admin', 'user'])],
            'site_id'  => 'required|exists:sites,id',
        ]);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);
        $user->load('site');

        return response()->json([
            'id'      => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
            'role'    => $user->role,
            'site_id' => $user->site_id,
            'site'    => $user->site ? ['id' => $user->site->id, 'nom' => $user->site->nom] : null,
        ], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'sometimes|string|max:100',
            'email'    => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8',
            'role'     => ['sometimes', Rule::in(['admin', 'user'])],
            'site_id'  => 'sometimes|exists:sites,id',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        $user->load('site');

        return response()->json([
            'id'      => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
            'role'    => $user->role,
            'site_id' => $user->site_id,
            'site'    => $user->site ? ['id' => $user->site->id, 'nom' => $user->site->nom] : null,
        ]);
    }

    public function deleteUser(User $user): JsonResponse
    {
        if ($user->role === 'superadmin') {
            return response()->json(['message' => 'Impossible de supprimer le superadmin.'], 422);
        }
        $user->tokens()->delete();
        $user->delete();
        return response()->json(null, 204);
    }
}
