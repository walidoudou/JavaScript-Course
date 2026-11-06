// Persistance dans localStorage, avec un objet de stockage injectable pour les tests.
// localStorage ne stocke que des chaînes : on passe par JSON, et on se méfie de ce qu'on relit
// (données d'une ancienne version, modifiées à la main dans les DevTools…).

// La version dans la clé permet de changer de format plus tard sans relire l'ancien.
export const CLE = "todo-app:taches:v1";

function estTache(t) {
  return (
    typeof t?.id === "string" &&
    typeof t.titre === "string" &&
    typeof t.terminee === "boolean" &&
    typeof t.creeLe === "number"
  );
}

/** Renvoie les tâches enregistrées, ou [] si rien n'est enregistré ou si les données sont illisibles. */
export function chargerTaches(stockage = globalThis.localStorage) {
  try {
    const brut = stockage.getItem(CLE);
    if (brut === null) return [];
    const donnees = JSON.parse(brut);
    return Array.isArray(donnees) ? donnees.filter(estTache) : [];
  } catch {
    return []; // JSON corrompu, ou stockage inaccessible (cookies bloqués, par exemple)
  }
}

/** Enregistre les tâches ; renvoie false si c'est impossible (quota dépassé, stockage bloqué). */
export function sauvegarderTaches(taches, stockage = globalThis.localStorage) {
  try {
    stockage.setItem(CLE, JSON.stringify(taches));
    return true;
  } catch {
    return false;
  }
}
