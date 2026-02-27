<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Corrige les colonnes stock_trouve et ecart qui peuvent être NOT NULL sans default.
     * Utilise ALTER TABLE direct pour éviter toute dépendance externe.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE lignes_inventaire MODIFY COLUMN stock_trouve INT NOT NULL DEFAULT 0');
        DB::statement('ALTER TABLE lignes_inventaire MODIFY COLUMN ecart INT NOT NULL DEFAULT 0');

        // Met à jour les lignes existantes qui auraient NULL
        DB::statement('UPDATE lignes_inventaire SET stock_trouve = 0 WHERE stock_trouve IS NULL');
        DB::statement('UPDATE lignes_inventaire SET ecart = 0 WHERE ecart IS NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE lignes_inventaire MODIFY COLUMN stock_trouve INT NULL');
        DB::statement('ALTER TABLE lignes_inventaire MODIFY COLUMN ecart INT NULL');
    }
};
