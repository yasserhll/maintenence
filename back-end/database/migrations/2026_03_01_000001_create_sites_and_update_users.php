<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration {
    public function up(): void
    {
        // Table des sites (emplacements)
        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->string('nom')->unique();         // 'Benguerir', 'Lotta', 'Yosofia'
            $table->string('slug')->unique();         // 'benguerir', 'lotta', 'yosofia'
            $table->string('description')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });

        // Ajouter role + site_id sur users
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['superadmin', 'admin', 'user'])->default('user')->after('email');
            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete()->after('role');
        });

        // Ajouter site_id sur toutes les tables de données
        foreach (['articles', 'entrees', 'sorties', 'inventaires'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->foreignId('site_id')->nullable()->constrained('sites')->cascadeOnDelete()->after('id');
            });
        }
        Schema::table('lignes_inventaire', function (Blueprint $table) {
            $table->foreignId('site_id')->nullable()->constrained('sites')->cascadeOnDelete()->after('id');
        });

        // Créer les 3 sites de base
        $benguerir = DB::table('sites')->insertGetId(['nom' => 'Benguerir', 'slug' => 'benguerir', 'created_at' => now(), 'updated_at' => now()]);
        $lotta     = DB::table('sites')->insertGetId(['nom' => 'Lotta',     'slug' => 'lotta',     'created_at' => now(), 'updated_at' => now()]);
        $yosofia   = DB::table('sites')->insertGetId(['nom' => 'Yosofia',   'slug' => 'yosofia',   'created_at' => now(), 'updated_at' => now()]);

        // Rattacher les données existantes à Benguerir (site par défaut)
        foreach (['articles', 'entrees', 'sorties', 'inventaires', 'lignes_inventaire'] as $table) {
            DB::table($table)->whereNull('site_id')->update(['site_id' => $benguerir]);
        }

        // Créer le compte superadmin
        DB::table('users')->insert([
            'name'       => 'Super Admin',
            'email'      => 'admin@gmao.local',
            'password'   => Hash::make('Admin@2025!'),
            'role'       => 'superadmin',
            'site_id'    => null,  // superadmin voit tout
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        foreach (['lignes_inventaire', 'articles', 'entrees', 'sorties', 'inventaires'] as $table) {
            Schema::table($table, function (Blueprint $t) { $t->dropForeign(['site_id']); $t->dropColumn('site_id'); });
        }
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['site_id']);
            $table->dropColumn(['role', 'site_id']);
        });
        Schema::dropIfExists('sites');
    }
};
