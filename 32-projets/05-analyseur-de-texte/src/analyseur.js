// Analyse d'un texte ligne par ligne : on ne garde jamais tout le fichier en mémoire,
// seulement des compteurs et la table des fréquences. Un fichier de plusieurs Go passe donc.
import { createInterface } from "node:readline";

// Un mot : lettres ou chiffres de n'importe quel alphabet (\p{L}, \p{N} + drapeau u),
// avec traits d'union et apostrophes internes (« peut-être », « aujourd'hui »).
const MOT = /[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu;

// Élisions du français : « l'été » compte comme « été », « qu'il » comme « il ».
const ELISION = /^(?:[cdjlmnst]|qu|jusqu|lorsqu|puisqu)['’]/u;

export const MOTS_VIDES = new Set(
  (
    "a à au aux avec ce ces cet cette dans de des du elle en est et il ils je la le les leur " +
    "lui ma mais me même mes mon ne nous on ou où par pas pour qu que qui sa se ses son sont " +
    "sur ta te tes toi ton tu un une vos votre vous y été être"
  ).split(" "),
);

/** Mots d'une ligne, en minuscules, élisions retirées. */
export function extraireMots(ligne, locale = "fr") {
  return (ligne.match(MOT) ?? []).map((mot) =>
    mot.toLocaleLowerCase(locale).replaceAll("’", "'").replace(ELISION, ""),
  );
}

export function creerStatistiques() {
  return {
    lignes: 0,
    lignesVides: 0,
    caracteres: 0,
    mots: 0,
    lettres: 0,
    frequences: new Map(),
  };
}

/**
 * Ajoute une ligne aux statistiques. L'accumulateur est modifié sur place :
 * en recréer un à chaque ligne coûterait cher sur un gros fichier.
 */
export function ajouterLigne(stats, ligne) {
  stats.lignes++;
  if (ligne.trim() === "") stats.lignesVides++;
  stats.caracteres += [...ligne].length; // points de code, comme « wc -m » (fins de ligne exclues)
  for (const mot of extraireMots(ligne)) {
    stats.mots++;
    stats.lettres += [...mot].length;
    stats.frequences.set(mot, (stats.frequences.get(mot) ?? 0) + 1);
  }
  return stats;
}

/** Lit un flux (fichier, stdin…) ligne par ligne et renvoie les statistiques. */
export async function analyserFlux(flux) {
  const lignes = createInterface({ input: flux, crlfDelay: Infinity }); // \r\n compte pour une seule fin de ligne
  const stats = creerStatistiques();
  for await (const ligne of lignes) ajouterLigne(stats, ligne);
  return stats;
}

/** Statistiques brutes → rapport sérialisable (JSON) et trié. */
export function creerRapport(
  stats,
  { top = 10, minLongueur = 1, sansMotsVides = false } = {},
) {
  const retenus = [...stats.frequences].filter(
    ([mot]) =>
      [...mot].length >= minLongueur && !(sansMotsVides && MOTS_VIDES.has(mot)),
  );
  const parFrequence = (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr");
  const motLePlusLong = [...stats.frequences.keys()].reduce(
    (long, mot) => ([...mot].length > [...long].length ? mot : long),
    "",
  );
  return {
    lignes: stats.lignes,
    lignesVides: stats.lignesVides,
    caracteres: stats.caracteres,
    mots: stats.mots,
    motsDistincts: stats.frequences.size,
    longueurMoyenne: stats.mots === 0 ? 0 : stats.lettres / stats.mots,
    motLePlusLong: motLePlusLong || null,
    frequences: retenus
      .toSorted(parFrequence)
      .slice(0, top)
      .map(([mot, nombre]) => ({ mot, nombre })),
  };
}

const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

/** Rapport → texte lisible, avec un histogramme des fréquences. */
export function formaterTexte(rapport, titre = "") {
  const lignes = [
    titre && `Analyse de ${titre}`,
    `Lignes      : ${nombre.format(rapport.lignes)} (dont ${nombre.format(rapport.lignesVides)} vides)`,
    `Mots        : ${nombre.format(rapport.mots)} (${nombre.format(rapport.motsDistincts)} distincts)`,
    `Caractères  : ${nombre.format(rapport.caracteres)}`,
    `Longueur moyenne d'un mot : ${nombre.format(rapport.longueurMoyenne)} lettres`,
  ].filter(Boolean);
  if (rapport.motLePlusLong)
    lignes.push(`Mot le plus long : « ${rapport.motLePlusLong} »`);

  if (rapport.frequences.length > 0) {
    const max = rapport.frequences[0].nombre;
    const largeurMot = Math.max(...rapport.frequences.map((f) => f.mot.length));
    const largeurRang = String(rapport.frequences.length).length;
    const largeurNombre = String(max).length;
    lignes.push("", "Mots les plus fréquents :");
    rapport.frequences.forEach(({ mot, nombre: n }, i) => {
      const barre = "█".repeat(Math.max(1, Math.round((n / max) * 30)));
      lignes.push(
        `${String(i + 1).padStart(largeurRang)}. ${mot.padEnd(largeurMot)}  ${String(n).padStart(largeurNombre)}  ${barre}`,
      );
    });
  }
  return lignes.join("\n");
}
