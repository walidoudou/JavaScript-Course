// Règles du carnet de notes : bulletins, mentions, classement, regroupements.
import { moyenne, moyennePonderee, resume } from "./statistiques.js";

export const NOTE_MAX = 20;

export const MENTIONS = [
  { seuil: 16, libelle: "Très bien" },
  { seuil: 14, libelle: "Bien" },
  { seuil: 12, libelle: "Assez bien" },
  { seuil: 10, libelle: "Sans mention" },
  { seuil: 0, libelle: "Insuffisant" },
];

/** Lève une erreur explicite si la note n'est pas un nombre entre 0 et 20. */
export function validerNote(note, contexte = "") {
  if (
    typeof note !== "number" ||
    !Number.isFinite(note) ||
    note < 0 ||
    note > NOTE_MAX
  ) {
    throw new RangeError(
      `Note invalide${contexte} : ${JSON.stringify(note)} (attendu : 0 à ${NOTE_MAX})`,
    );
  }
}

/** Mention correspondant à une moyenne (null si aucune moyenne). */
export function mention(moy) {
  if (moy === null) return null;
  return MENTIONS.find(({ seuil }) => moy >= seuil).libelle;
}

/**
 * Bulletin d'un élève : moyenne par matière, moyenne générale pondérée, mention.
 * Une matière sans note est ignorée ; une matière absente des coefficients compte pour 1.
 * @param {{ nom: string, notes: Record<string, number[]> }} eleve
 * @param {Record<string, number>} coefficients
 */
export function bulletin(eleve, coefficients) {
  const matieres = {};
  for (const [matiere, notes] of Object.entries(eleve.notes)) {
    for (const note of notes)
      validerNote(note, ` pour ${eleve.nom} en ${matiere}`);
    const moy = moyenne(notes);
    if (moy !== null) matieres[matiere] = moy;
  }
  const moyenneGenerale = moyennePonderee(
    Object.entries(matieres).map(([matiere, valeur]) => ({
      valeur,
      poids: coefficients[matiere] ?? 1,
    })),
  );
  return {
    nom: eleve.nom,
    matieres,
    moyenne: moyenneGenerale,
    mention: mention(moyenneGenerale),
  };
}

/**
 * Classement par moyenne décroissante, avec ex aequo : 1, 2, 2, 4…
 * Les élèves sans moyenne sont placés à la fin, sans rang.
 * Renvoie un nouveau tableau : les bulletins reçus ne sont pas modifiés.
 */
export function classement(bulletins) {
  const tries = bulletins.toSorted(
    (a, b) =>
      (b.moyenne ?? -1) - (a.moyenne ?? -1) || a.nom.localeCompare(b.nom, "fr"),
  );
  const resultat = [];
  for (const [i, b] of tries.entries()) {
    const precedent = resultat[i - 1];
    let rang = i + 1;
    if (b.moyenne === null) rang = null;
    else if (precedent?.moyenne === b.moyenne) rang = precedent.rang; // ex aequo : même rang
    resultat.push({ ...b, rang });
  }
  return resultat;
}

/** Noms des élèves regroupés par mention, dans l'ordre des mentions. */
export function regrouperParMention(bulletins) {
  const groupes = Object.groupBy(bulletins, (b) => b.mention ?? "Sans note"); // ES2024
  return Object.fromEntries(
    [...MENTIONS.map((m) => m.libelle), "Sans note"]
      .filter((libelle) => groupes[libelle])
      .map((libelle) => [libelle, groupes[libelle].map((b) => b.nom)]),
  );
}

/** Pour chaque matière : statistiques de la classe sur les moyennes des élèves. */
export function statistiquesParMatiere(bulletins) {
  const parMatiere = new Map(); // matière → moyennes des élèves
  for (const { matieres } of bulletins) {
    for (const [matiere, moy] of Object.entries(matieres)) {
      if (!parMatiere.has(matiere)) parMatiere.set(matiere, []);
      parMatiere.get(matiere).push(moy);
    }
  }
  return Object.fromEntries(
    [...parMatiere].map(([matiere, moyennes]) => [matiere, resume(moyennes)]),
  );
}

/** Meilleur(s) élève(s) de chaque matière (plusieurs en cas d'égalité). */
export function majorsParMatiere(bulletins) {
  const majors = {};
  for (const { nom, matieres } of bulletins) {
    for (const [matiere, moy] of Object.entries(matieres)) {
      const actuel = majors[matiere];
      if (!actuel || moy > actuel.moyenne)
        majors[matiere] = { moyenne: moy, noms: [nom] };
      else if (moy === actuel.moyenne) actuel.noms.push(nom);
    }
  }
  return majors;
}
