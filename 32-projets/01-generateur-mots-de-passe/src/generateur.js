// Génération de mots de passe aléatoires sûrs.
// Toute la logique est ici ; cli.js ne fait que lire les options et afficher.

export const JEUX = {
  minuscules: "abcdefghijklmnopqrstuvwxyz",
  majuscules: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  chiffres: "0123456789",
  symboles: "!#$%&*+-=?@^_~()[]{}<>.,;:",
};

// Caractères faciles à confondre à l'écran ou à l'oral (0/O, 1/l/I).
export const AMBIGUS = "0O1lI";

export const LONGUEUR_MIN = 8;
export const LONGUEUR_MAX = 128;

const PLAGE = 2 ** 32; // nombre de valeurs possibles d'un Uint32

/**
 * Entier aléatoire uniforme dans [0, max[, tiré avec crypto.getRandomValues.
 * Math.random n'est pas conçu pour la sécurité : ses tirages sont prévisibles.
 * @param {number} max entier entre 1 et 2**32
 * @returns {number}
 */
export function entierAleatoire(max) {
  if (!Number.isInteger(max) || max < 1 || max > PLAGE) {
    throw new RangeError(
      `max doit être un entier entre 1 et 2**32 (reçu : ${max})`,
    );
  }
  // Un simple « valeur % max » favoriserait les petits restes (biais du modulo) :
  // on rejette les tirages situés au-delà du dernier multiple complet de max.
  const limite = PLAGE - (PLAGE % max);
  const tampon = new Uint32Array(1);
  do {
    crypto.getRandomValues(tampon);
  } while (tampon[0] >= limite);
  return tampon[0] % max;
}

/**
 * Liste des jeux de caractères actifs selon les options.
 * @returns {string[]}
 */
export function jeuxActifs({
  minuscules = true,
  majuscules = true,
  chiffres = true,
  symboles = true,
  sansAmbigus = false,
} = {}) {
  const choix = { minuscules, majuscules, chiffres, symboles };
  return Object.entries(JEUX)
    .filter(([nom]) => choix[nom])
    .map(([, jeu]) =>
      sansAmbigus ? [...jeu].filter((c) => !AMBIGUS.includes(c)).join("") : jeu,
    );
}

/** Vrai si le mot de passe contient au moins un caractère de chaque jeu. */
export function respecteComposition(motDePasse, jeux) {
  return jeux.every((jeu) => [...motDePasse].some((c) => jeu.includes(c)));
}

/**
 * Génère un mot de passe contenant au moins un caractère de chaque jeu actif.
 * @param {object} [options]
 * @param {number} [options.longueur=16]
 * @returns {string}
 */
export function genererMotDePasse({ longueur = 16, ...choix } = {}) {
  if (
    !Number.isInteger(longueur) ||
    longueur < LONGUEUR_MIN ||
    longueur > LONGUEUR_MAX
  ) {
    throw new RangeError(
      `La longueur doit être un entier entre ${LONGUEUR_MIN} et ${LONGUEUR_MAX} (reçu : ${longueur}).`,
    );
  }
  const jeux = jeuxActifs(choix);
  if (jeux.length === 0) {
    throw new Error("Activez au moins un jeu de caractères.");
  }
  const alphabet = jeux.join("");

  // Tirage uniforme sur tout l'alphabet, recommencé tant qu'un jeu manque.
  // Avec 8 caractères ou plus, il faut rarement plus de deux essais.
  let motDePasse;
  do {
    motDePasse = "";
    for (let i = 0; i < longueur; i++) {
      motDePasse += alphabet[entierAleatoire(alphabet.length)];
    }
  } while (!respecteComposition(motDePasse, jeux));
  return motDePasse;
}

/**
 * Entropie (en bits) d'un mot de passe tiré au hasard : longueur × log2(taille de l'alphabet).
 * Ne s'applique qu'à un tirage réellement aléatoire, pas à un mot de passe choisi par un humain.
 */
export function entropie(longueur, tailleAlphabet) {
  return longueur * Math.log2(tailleAlphabet);
}

/** Niveau de robustesse indicatif (seuils inspirés des recommandations de l'ANSSI). */
export function niveauRobustesse(bits) {
  if (bits < 64) return "très faible";
  if (bits < 80) return "faible";
  if (bits < 100) return "moyen";
  return "fort";
}
