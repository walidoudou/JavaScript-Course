#!/usr/bin/env node
// Analyseur de texte en ligne de commande.
// Exemples : node cli.js exemples/texte.txt --top 5
//            cat article.txt | node cli.js --format json
import { createReadStream } from "node:fs";
import { parseArgs } from "node:util";
import { analyserFlux, creerRapport, formaterTexte } from "./src/analyseur.js";

const AIDE = `Usage : node cli.js [fichier] [options]
Sans fichier (ou avec « - »), le texte est lu sur l'entrée standard.

Options :
  -f, --format <texte|json>  format du rapport (défaut : texte)
  -t, --top <n>              nombre de mots les plus fréquents (défaut : 10)
  -m, --min-longueur <n>     ignore les mots plus courts dans le classement (défaut : 1)
  -s, --sans-mots-vides      ignore les mots grammaticaux (le, de, et…) dans le classement
  -h, --aide                 affiche cette aide`;

/** Erreur destinée à l'utilisateur, avec son code de sortie : 2 = mauvaise utilisation, 1 = échec. */
class ErreurCli extends Error {
  constructor(message, codeSortie = 2) {
    super(message);
    this.codeSortie = codeSortie;
  }
}

const MESSAGES_FICHIER = {
  ENOENT: "fichier introuvable",
  EISDIR: "c'est un dossier, pas un fichier",
  EACCES: "lecture non autorisée",
};

function lireEntier(texte, nom) {
  const valeur = Number(texte);
  if (!Number.isInteger(valeur) || valeur < 1) {
    throw new ErreurCli(
      `--${nom} doit être un entier supérieur ou égal à 1 (reçu : « ${texte} »).`,
    );
  }
  return valeur;
}

function lireOptions(args) {
  let resultat;
  try {
    resultat = parseArgs({
      args,
      allowPositionals: true,
      options: {
        format: { type: "string", short: "f", default: "texte" },
        top: { type: "string", short: "t", default: "10" },
        "min-longueur": { type: "string", short: "m", default: "1" },
        "sans-mots-vides": { type: "boolean", short: "s", default: false },
        aide: { type: "boolean", short: "h", default: false },
      },
    });
  } catch (erreur) {
    throw new ErreurCli(erreur.message); // option inconnue, valeur manquante…
  }
  const { values: v, positionals } = resultat;
  if (positionals.length > 1) throw new ErreurCli("Un seul fichier à la fois.");
  if (!["texte", "json"].includes(v.format))
    throw new ErreurCli(`Format inconnu : « ${v.format} ».`);
  return {
    aide: v.aide,
    fichier: positionals[0] ?? "-",
    format: v.format,
    top: lireEntier(v.top, "top"),
    minLongueur: lireEntier(v["min-longueur"], "min-longueur"),
    sansMotsVides: v["sans-mots-vides"],
  };
}

async function main() {
  const options = lireOptions(process.argv.slice(2));
  if (options.aide) return console.log(AIDE);

  const lectureStdin = options.fichier === "-";
  if (lectureStdin && process.stdin.isTTY) {
    throw new ErreurCli(
      "Indiquez un fichier, ou envoyez du texte sur l'entrée standard.",
    );
  }
  const flux = lectureStdin ? process.stdin : createReadStream(options.fichier);
  let stats;
  try {
    stats = await analyserFlux(flux); // les erreurs de lecture du fichier arrivent ici
  } catch (erreur) {
    if (!MESSAGES_FICHIER[erreur.code]) throw erreur;
    throw new ErreurCli(
      `${options.fichier} : ${MESSAGES_FICHIER[erreur.code]}.`,
      1,
    );
  }
  const rapport = creerRapport(stats, options);

  if (options.format === "json") console.log(JSON.stringify(rapport, null, 2));
  else
    console.log(
      formaterTexte(
        rapport,
        lectureStdin ? "l'entrée standard" : options.fichier,
      ),
    );
}

try {
  await main();
} catch (erreur) {
  if (!(erreur instanceof ErreurCli)) throw erreur; // erreur imprévue : on garde la trace complète
  console.error(`Erreur : ${erreur.message}`);
  if (erreur.codeSortie === 2) console.error(`\n${AIDE}`);
  process.exitCode = erreur.codeSortie;
}
