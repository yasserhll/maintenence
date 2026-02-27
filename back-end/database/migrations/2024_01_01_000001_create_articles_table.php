<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->nullable();
            $table->string('designation');
            $table->string('marque')->nullable();
            $table->string('unite')->default('Pièce');
            $table->string('emplacement')->nullable();
            $table->integer('stock_initial')->default(0);
            $table->integer('stock_min')->default(0);
            $table->decimal('prix_unitaire', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
