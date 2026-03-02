<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Ajoute la colonne stock_actuel si elle n'existe pas
        DB::statement('ALTER TABLE articles ADD COLUMN IF NOT EXISTS stock_actuel INT NOT NULL DEFAULT 0');

        // Calcule et remplit le stock_actuel pour tous les articles existants
        DB::statement('
            UPDATE articles a
            SET a.stock_actuel = a.stock_initial
                + COALESCE((SELECT SUM(e.quantite) FROM entrees e WHERE e.article_id = a.id), 0)
                - COALESCE((SELECT SUM(s.quantite) FROM sorties s WHERE s.article_id = a.id), 0)
        ');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE articles DROP COLUMN IF EXISTS stock_actuel');
    }
};
