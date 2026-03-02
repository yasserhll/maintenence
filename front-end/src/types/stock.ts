export interface Article {
  id: number;
  reference: string | null;
  designation: string;
  marque: string | null;
  unite: string;
  emplacement: string | null;
  stock_initial: number;
  stock_min: number;
  prix_unitaire: number;
  stock_actuel: number;
}

export interface Entree {
  id: number;
  article_id: number;
  article?: Article;
  ref_bl: string | null;
  ref_article: string | null;
  fournisseur: string | null;
  quantite: number;
  date: string;
  observation: string | null;
}

export interface EntreePayload {
  article_id: number;
  quantite: number;
  date: string;
  ref_bl?: string | null;
  ref_article?: string | null;
  fournisseur?: string | null;
  observation?: string | null;
}

export interface Sortie {
  id: number;
  article_id: number;
  article?: Article;
  technicien: string | null;
  affectation: string | null;
  quantite: number;
  date: string;
}

export interface SortiePayload {
  article_id: number;
  quantite: number;
  date: string;
  technicien?: string | null;
  affectation?: string | null;
}

export interface LigneInventaire {
  id: number;
  inventaire_id: number;
  article_id: number;
  article?: Article;
  stock_theorique: number;
  stock_trouve: number | null;
  ecart: number | null;
  observation: string | null;
  total_entrees?: number;
  total_sorties?: number;
}

export interface Inventaire {
  id: number;
  site: string;
  date_creation: string;
  derniere_maj: string | null;
  lignes: LigneInventaire[];
}

export interface SaveTrouvesPayload {
  id: number;
  stock_trouve: number;
  observation?: string;
}

export interface DashboardData {
  total_articles: number;
  total_entrees_qty: number;
  total_sorties_qty: number;
  nb_alertes: number;
  alertes: {
    id: number;
    designation: string;
    reference: string | null;
    marque: string | null;
    stock_min: number;
    stock_actuel: number;
  }[];
  top5_sorties: {
    article_id: number;
    designation: string;
    marque: string | null;
    total_qty: number;
  }[];
  derniers_mouvements: {
    type: 'entree' | 'sortie';
    date: string;
    designation: string;
    quantite: number;
    detail: string | null;
  }[];
}
