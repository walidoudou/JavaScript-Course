// Exports nommés : la façon recommandée d'exposer plusieurs fonctions.
export const TAUX_TVA = 0.2;

export function totalLigne({ prixHT, quantite }) {
  return prixHT * quantite;
}

export function totalHT(articles) {
  return articles.reduce((somme, article) => somme + totalLigne(article), 0);
}

export function totalTTC(articles, taux = TAUX_TVA) {
  return totalHT(articles) * (1 + taux);
}
