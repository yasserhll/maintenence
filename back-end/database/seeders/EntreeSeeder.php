<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Entree;
use Illuminate\Database\Seeder;

class EntreeSeeder extends Seeder
{
    public function run(): void
    {
        // Map article designation -> id
        $map = Article::pluck('id', 'designation')->toArray();

        $entrees = [
            ['designation' => 'Filtre a huile', 'ref_bl' => '', 'ref_article' => '1R-1808', 'fournisseur' => '', 'quantite' => 1, 'date' => '2026-01-23', 'observation' => ''],
            ['designation' => 'Filtre a carburant', 'ref_bl' => '', 'ref_article' => '1R-0762', 'fournisseur' => '', 'quantite' => 1, 'date' => '2026-01-23', 'observation' => ''],
            ['designation' => 'Filtre separateur', 'ref_bl' => '', 'ref_article' => '326-1644', 'fournisseur' => '', 'quantite' => 1, 'date' => '2026-01-23', 'observation' => ''],
            ['designation' => 'COURROIE MOTEUR', 'ref_bl' => '', 'ref_article' => '7PK 1035', 'fournisseur' => '', 'quantite' => 1, 'date' => '2026-01-29', 'observation' => ''],
            ['designation' => 'FLAPS H131 15.5/17.5/16.00/18.00-25', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 5, 'date' => '2026-01-30', 'observation' => ''],
            ['designation' => 'LAME NIVELEUSE 15 TROUS', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 2, 'date' => '2026-01-30', 'observation' => ''],
            ['designation' => 'Filtre a huile', 'ref_bl' => '', 'ref_article' => '1R-1808', 'fournisseur' => '', 'quantite' => 1, 'date' => '2026-01-30', 'observation' => ''],
            ['designation' => 'Filtre a carburant', 'ref_bl' => '', 'ref_article' => '1R-0762', 'fournisseur' => '', 'quantite' => 1, 'date' => '2026-01-30', 'observation' => ''],
            ['designation' => 'Filtre separateur', 'ref_bl' => '', 'ref_article' => '326-1644', 'fournisseur' => '', 'quantite' => 1, 'date' => '2026-01-30', 'observation' => ''],
            ['designation' => 'Filtre a carburant', 'ref_bl' => '', 'ref_article' => 'P553771', 'fournisseur' => '', 'quantite' => 2, 'date' => '2026-01-30', 'observation' => ''],
            ['designation' => 'Filtre a huile', 'ref_bl' => '', 'ref_article' => 'P550105', 'fournisseur' => '', 'quantite' => 2, 'date' => '2026-01-30', 'observation' => ''],
            ['designation' => 'SABOTS 350', 'ref_bl' => '', 'ref_article' => 'N381-41089', 'fournisseur' => '', 'quantite' => 5, 'date' => '2026-01-30', 'observation' => ''],
            ['designation' => 'FLAPS H131 15.5/17.5/16.00/18.00-25', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 24, 'date' => '2026-02-04', 'observation' => ''],
            ['designation' => 'Filtre d\'air', 'ref_bl' => '', 'ref_article' => 'MAN INT', 'fournisseur' => '', 'quantite' => 12, 'date' => '2026-02-09', 'observation' => ''],
            ['designation' => 'GYROPHARE', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 15, 'date' => '2026-02-11', 'observation' => ''],
            ['designation' => 'FLEXIBLES DE GRAISSAGE', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 7, 'date' => '2026-02-11', 'observation' => ''],
            ['designation' => 'FEUX ARRIER', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 2, 'date' => '2026-02-11', 'observation' => ''],
            ['designation' => 'KLAXONS ARRIERE', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 0, 'date' => '2026-02-11', 'observation' => ''],
            ['designation' => 'ALARME MARCHE ARRIERE', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 26, 'date' => '2026-02-11', 'observation' => ''],
            ['designation' => 'BATTERIERS', 'ref_bl' => '', 'ref_article' => '12V 70AH', 'fournisseur' => '', 'quantite' => 2, 'date' => '2026-02-13', 'observation' => ''],
            ['designation' => 'FEU ARRIERE', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 2, 'date' => '2026-02-13', 'observation' => ''],
            ['designation' => 'SABOTS 480', 'ref_bl' => '', 'ref_article' => 'VOLVO 66ARXE', 'fournisseur' => '', 'quantite' => 12, 'date' => '2026-02-14', 'observation' => ''],
            ['designation' => 'SABOTS 350', 'ref_bl' => '', 'ref_article' => 'FC350RC', 'fournisseur' => '', 'quantite' => 2, 'date' => '2026-02-17', 'observation' => ''],
            ['designation' => 'SAC CHIFFON', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 6, 'date' => '2026-02-18', 'observation' => ''],
            ['designation' => 'BATTERIERS', 'ref_bl' => '', 'ref_article' => 'M15 12V', 'fournisseur' => '', 'quantite' => 2, 'date' => '2026-02-18', 'observation' => ''],
            ['designation' => 'ROULEAUX DE SOULOFFAN', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 2, 'date' => '2026-02-18', 'observation' => ''],
            ['designation' => 'COLLIER EN PLASTIQUE', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 5, 'date' => '2026-02-18', 'observation' => ''],
            ['designation' => 'COLLIER EN PLASTIQUE', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 5, 'date' => '2026-02-18', 'observation' => ''],
            ['designation' => 'SABOTS 350', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 5, 'date' => '2026-02-18', 'observation' => ''],
            ['designation' => 'LAMPE R5W', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 100, 'date' => '2026-02-23', 'observation' => ''],
            ['designation' => 'FLEXIBLE DE SOUFLAGE CABINE', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 10, 'date' => '2026-02-23', 'observation' => ''],
            ['designation' => 'EMPLAITRE BIAS N04', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 60, 'date' => '2026-02-23', 'observation' => ''],
            ['designation' => 'EMPLATRE BIAS FRU 2', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 90, 'date' => '2026-02-23', 'observation' => ''],
            ['designation' => 'EMPLATRE BIAS RAD 120 TL', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 80, 'date' => '2026-02-23', 'observation' => ''],
            ['designation' => 'EMPLAITRE BIAS N05', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 60, 'date' => '2026-02-23', 'observation' => ''],
            ['designation' => 'COLLE DE REPARATION PNEUS', 'ref_bl' => '', 'ref_article' => '', 'fournisseur' => '', 'quantite' => 3, 'date' => '2026-02-23', 'observation' => ''],
        ];

        foreach ($entrees as $data) {
            $articleId = $map[$data['designation']] ?? null;
            if (!$articleId) continue;
            Entree::create([
                'article_id'  => $articleId,
                'ref_bl'      => $data['ref_bl'],
                'ref_article' => $data['ref_article'],
                'fournisseur' => $data['fournisseur'],
                'quantite'    => $data['quantite'],
                'date'        => $data['date'],
                'observation' => $data['observation'],
            ]);
        }
    }
}