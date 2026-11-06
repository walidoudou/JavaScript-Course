// Logique métier pure : aucune entrée/sortie, donc facile à tester.

export const PRIORITES = ["basse", "normale", "haute"];

/** Erreur prévue (saisie invalide, tâche introuvable…) : on affiche le message sans la pile. */
export class ErreurUtilisateur extends Error {
  name = "ErreurUtilisateur";
}

export function ajouter(taches, texte, priorite = "normale", maintenant = new Date()) {
  const propre = texte.trim();
  if (!propre) throw new ErreurUtilisateur("Le texte de la tâche est vide.");
  if (!PRIORITES.includes(priorite)) {
    throw new ErreurUtilisateur(`Priorité inconnue : « ${priorite} » (attendu : ${PRIORITES.join(", ")}).`);
  }
  const id = Math.max(0, ...taches.map((t) => t.id)) + 1;
  const tache = { id, texte: propre, priorite, faite: false, creeeLe: maintenant.toISOString() };
  return { taches: [...taches, tache], tache };
}

function indexDe(taches, id) {
  const index = taches.findIndex((t) => t.id === id);
  if (index === -1) throw new ErreurUtilisateur(`Aucune tâche n° ${id}.`);
  return index;
}

export function terminer(taches, id) {
  const index = indexDe(taches, id);
  const tache = { ...taches[index], faite: true };
  return { taches: taches.with(index, tache), tache };
}

export function supprimer(taches, id) {
  const index = indexDe(taches, id);
  return { taches: taches.toSpliced(index, 1), tache: taches[index] };
}

/** Tâches à afficher : non faites par défaut, les plus prioritaires d'abord. */
export function aAfficher(taches, { toutes = false } = {}) {
  return taches
    .filter((t) => toutes || !t.faite)
    .toSorted((a, b) => PRIORITES.indexOf(b.priorite) - PRIORITES.indexOf(a.priorite) || a.id - b.id);
}

/** Convertit un argument en identifiant entier positif. */
export function lireId(texte) {
  const id = Number(texte);
  if (!Number.isInteger(id) || id <= 0) throw new ErreurUtilisateur(`Identifiant invalide : « ${texte ?? ""} ».`);
  return id;
}
