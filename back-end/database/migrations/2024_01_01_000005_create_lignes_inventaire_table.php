<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lignes_inventaire', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventaire_id')->constrained('inventaires')->onDelete('cascade');
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->integer('stock_theorique')->default(0);  // calculé auto (stockInit + entrées - sorties)
            $table->integer('stock_trouve')->nullable();     // saisi manuellement une seule fois
            $table->integer('ecart')->nullable();            // stock_trouve - stock_theorique
            $table->text('observation')->nullable();
            $table->timestamps();

            $table->unique(['inventaire_id', 'article_id']); // une ligne par article
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lignes_inventaire');
    }
};
