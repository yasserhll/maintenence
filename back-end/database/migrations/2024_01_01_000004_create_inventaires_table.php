<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Une seule fiche d'inventaire permanente par site
        Schema::create('inventaires', function (Blueprint $table) {
            $table->id();
            $table->string('site')->default('Benguerir')->unique(); // un seul inventaire par site
            $table->date('date_creation');
            $table->timestamp('derniere_maj')->nullable();          // mis à jour auto à chaque entrée/sortie
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventaires');
    }
};
