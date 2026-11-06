#!/usr/bin/env node
// Point d'entrée en ligne de commande : lit les options, appelle le module, affiche.
import { parseArgs } from "node:util";
import {
  entropie,
  genererMotDePasse,
  jeuxActifs,
  niveauRobustesse,
  LONGUEUR_MAX,
  LONGUEUR_MIN,
} from "./src/generateur.js";

const AIDE = `Usage : node cli.js [options]

Options :
  -l, --longueur <n>   longueur du mot de passe (${LONGUEUR_MIN} à ${LONGUEUR_MAX}, défaut : 16)
  -n, --nombre <n>     nombre de mots de passe à générer (1 à 100, défaut : 1)
      --sans-minuscules
      --sans-majuscules
      --sans-chiffres
      --sans-symboles
      --sans-ambigus   exclut les caractères faciles à confondre (0 O 1 l I)
  -e, --entropie       affiche l'entropie estimée et le niveau de robustesse
  -h, --aide           affiche cette aide`;

const OPTIONS = {
  longueur: { type: "string", short: "l", default: "16" },
  nombre: { type: "string", short: "n", default: "1" },
  "sans-minuscules": { type: "boolean", default: false },
  "sans-majuscules": { type: "boolean", default: false },
  "sans-chiffres": { type: "boolean", default: false },
  "sans-symboles": { type: "boolean", default: false },
  "sans-ambigus": { type: "boolean", default: false },
  entropie: { type: "boolean", short: "e", default: false },
  aide: { type: "boolean", short: "h", default: false },
};

/** Convertit une option texte en entier dans [min, max], sinon lève une erreur lisible. */
function lireEntier(texte, nom, min, max) {
  const valeur = Number(texte);
  if (!Number.isInteger(valeur) || valeur < min || valeur > max) {
    throw new RangeError(
      `--${nom} doit être un entier entre ${min} et ${max} (reçu : « ${texte} »).`,
    );
  }
  return valeur;
}

function main(args) {
  const { values: v } = parseArgs({ args, options: OPTIONS }); // strict : option inconnue → erreur
  if (v.aide) {
    console.log(AIDE);
    return;
  }

  const options = {
    longueur: lireEntier(v.longueur, "longueur", LONGUEUR_MIN, LONGUEUR_MAX),
    minuscules: !v["sans-minuscules"],
    majuscules: !v["sans-majuscules"],
    chiffres: !v["sans-chiffres"],
    symboles: !v["sans-symboles"],
    sansAmbigus: v["sans-ambigus"],
  };
  const nombre = lireEntier(v.nombre, "nombre", 1, 100);

  for (let i = 0; i < nombre; i++) {
    console.log(genererMotDePasse(options)); // stdout : un mot de passe par ligne
  }

  if (v.entropie) {
    const taille = jeuxActifs(options).join("").length;
    const bits = entropie(options.longueur, taille);
    // stderr : l'information reste visible sans polluer une redirection (> fichier, | pbcopy).
    console.error(
      `Entropie : ${bits.toFixed(1)} bits (${taille} caractères possibles) → ${niveauRobustesse(bits)}`,
    );
  }
}

try {
  main(process.argv.slice(2));
} catch (erreur) {
  console.error(`Erreur : ${erreur.message}\n\n${AIDE}`);
  process.exitCode = 2; // convention : 2 = mauvaise utilisation de la commande
}
