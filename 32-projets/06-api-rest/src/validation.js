// Validation des données reçues : tout ce qui vient du réseau est suspect.
export const TITRE_MAX = 200;
const CHAMPS = ["titre", "terminee"];

/**
 * Valide le corps d'une création (partiel = false) ou d'une modification (partiel = true).
 * @returns {{ valeur: object, erreurs: { champ: string, message: string }[] }}
 */
export function validerTache(corps, { partiel = false } = {}) {
  const erreurs = [];
  if (typeof corps !== "object" || corps === null || Array.isArray(corps)) {
    return {
      valeur: {},
      erreurs: [{ champ: "(corps)", message: "Un objet JSON est attendu." }],
    };
  }

  for (const champ of Object.keys(corps)) {
    if (!CHAMPS.includes(champ))
      erreurs.push({ champ, message: "Champ inconnu." });
  }

  const valeur = {};
  if (corps.titre !== undefined) {
    const titre = typeof corps.titre === "string" ? corps.titre.trim() : null;
    if (titre === null)
      erreurs.push({ champ: "titre", message: "Doit être une chaîne." });
    else if (titre === "")
      erreurs.push({ champ: "titre", message: "Ne doit pas être vide." });
    else if (titre.length > TITRE_MAX)
      erreurs.push({
        champ: "titre",
        message: `${TITRE_MAX} caractères maximum.`,
      });
    else valeur.titre = titre;
  } else if (!partiel) {
    erreurs.push({ champ: "titre", message: "Obligatoire." });
  }

  if (corps.terminee !== undefined) {
    if (typeof corps.terminee === "boolean") valeur.terminee = corps.terminee;
    else
      erreurs.push({ champ: "terminee", message: "Doit être true ou false." });
  }

  if (partiel && erreurs.length === 0 && Object.keys(valeur).length === 0) {
    erreurs.push({
      champ: "(corps)",
      message: `Au moins un champ à modifier : ${CHAMPS.join(", ")}.`,
    });
  }
  return { valeur, erreurs };
}
