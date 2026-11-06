// Logique de la liste de tâches, sans DOM ni stockage : testable dans Node.
// Chaque fonction reçoit un tableau de tâches et en renvoie un NOUVEAU (jamais de mutation),
// ce qui rend l'état prévisible et facile à sauvegarder.

export const FILTRES = ["toutes", "actives", "terminees"];
export const TITRE_MAX = 200;

/**
 * @typedef {{ id: string, titre: string, terminee: boolean, creeLe: number }} Tache
 */

/** Nettoie un titre saisi ; lève une erreur lisible s'il est vide ou trop long. */
export function normaliserTitre(titre) {
  const propre = String(titre).trim().replace(/\s+/g, " ");
  if (propre === "") throw new Error("Le titre de la tâche est vide.");
  if (propre.length > TITRE_MAX)
    throw new Error(`Le titre dépasse ${TITRE_MAX} caractères.`);
  return propre;
}

/**
 * Crée une tâche. id et date sont injectables pour rendre les tests déterministes.
 * @returns {Tache}
 */
export function creerTache(
  titre,
  { id = crypto.randomUUID(), maintenant = Date.now() } = {},
) {
  return {
    id,
    titre: normaliserTitre(titre),
    terminee: false,
    creeLe: maintenant,
  };
}

/** @returns {Tache[]} */
export function ajouterTache(taches, titre, options) {
  return [...taches, creerTache(titre, options)];
}

export function basculerTache(taches, id) {
  return taches.map((t) => (t.id === id ? { ...t, terminee: !t.terminee } : t));
}

/** Tout cocher ; ou tout décocher si tout est déjà coché. */
export function basculerToutes(taches) {
  const toutesTerminees = taches.every((t) => t.terminee);
  return taches.map((t) => ({ ...t, terminee: !toutesTerminees }));
}

export function supprimerTache(taches, id) {
  return taches.filter((t) => t.id !== id);
}

export function supprimerTerminees(taches) {
  return taches.filter((t) => !t.terminee);
}

export function filtrerTaches(taches, filtre) {
  switch (filtre) {
    case "actives":
      return taches.filter((t) => !t.terminee);
    case "terminees":
      return taches.filter((t) => t.terminee);
    default:
      return taches;
  }
}

export function compter(taches) {
  const terminees = taches.filter((t) => t.terminee).length;
  return {
    total: taches.length,
    actives: taches.length - terminees,
    terminees,
  };
}

/** Lit le filtre depuis le fragment d'URL (#/actives) ; « toutes » par défaut. */
export function filtreDepuisHash(hash) {
  const nom = hash.replace(/^#\/?/, "");
  return FILTRES.includes(nom) ? nom : "toutes";
}
