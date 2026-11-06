// Statistiques génériques sur des listes de nombres.
// Fonctions pures : elles ne modifient jamais le tableau reçu et renvoient null
// pour une liste vide (« pas de donnée » n'est pas une erreur).

export function somme(valeurs) {
  return valeurs.reduce((total, v) => total + v, 0);
}

export function moyenne(valeurs) {
  return valeurs.length === 0 ? null : somme(valeurs) / valeurs.length;
}

/** Moyenne pondérée de paires { valeur, poids }. */
export function moyennePonderee(paires) {
  const poidsTotal = somme(paires.map((p) => p.poids));
  if (poidsTotal === 0) return null;
  return somme(paires.map((p) => p.valeur * p.poids)) / poidsTotal;
}

export function mediane(valeurs) {
  if (valeurs.length === 0) return null;
  const triees = valeurs.toSorted((a, b) => a - b); // ES2023 : copie triée, l'original est intact
  const milieu = Math.floor(triees.length / 2);
  return triees.length % 2 === 1
    ? triees[milieu]
    : (triees[milieu - 1] + triees[milieu]) / 2;
}

/** Écart type de la population : à quel point les valeurs s'éloignent de la moyenne. */
export function ecartType(valeurs) {
  const m = moyenne(valeurs);
  if (m === null) return null;
  return Math.sqrt(moyenne(valeurs.map((v) => (v - m) ** 2)));
}

/** Résumé complet d'une série. */
export function resume(valeurs) {
  return {
    effectif: valeurs.length,
    moyenne: moyenne(valeurs),
    mediane: mediane(valeurs),
    ecartType: ecartType(valeurs),
    min: valeurs.length ? Math.min(...valeurs) : null,
    max: valeurs.length ? Math.max(...valeurs) : null,
  };
}
