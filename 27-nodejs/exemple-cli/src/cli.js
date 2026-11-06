// Analyse des arguments et exécution d'une commande. Renvoie le code de sortie :
// 0 = succès, 1 = erreur pendant l'exécution, 2 = mauvaise utilisation.
import readline from "node:readline";
import { parseArgs } from "node:util";
import paquet from "../package.json" with { type: "json" };
import { erreur, formaterListe, formaterTache, succes } from "./affichage.js";
import { charger, cheminParDefaut, enregistrer } from "./stockage.js";
import { aAfficher, ajouter, ErreurUtilisateur, lireId, supprimer, terminer } from "./taches.js";

const AIDE = `Utilisation : taches <commande> [options]

Commandes :
  ajouter <texte…>     ajoute une tâche
  lister               affiche les tâches à faire
  terminer <id>        marque une tâche comme faite
  supprimer <id>       supprime une tâche
  importer             ajoute une tâche par ligne lue sur l'entrée standard

Options :
  -p, --priorite <p>   basse, normale (défaut) ou haute
  -a, --toutes         lister aussi les tâches faites
      --json           sortie JSON (pour d'autres programmes)
  -f, --fichier <f>    fichier de données (défaut : $TACHES_FICHIER ou ~/.taches.json)
  -h, --aide           affiche cette aide
  -v, --version        affiche la version`;

const options = {
  priorite: { type: "string", short: "p", default: "normale" },
  toutes: { type: "boolean", short: "a", default: false },
  json: { type: "boolean", default: false },
  fichier: { type: "string", short: "f" },
  aide: { type: "boolean", short: "h", default: false },
  version: { type: "boolean", short: "v", default: false },
};

export async function executer(argv, { env = process.env, entree = process.stdin } = {}) {
  let valeurs, positionnels;
  try {
    ({ values: valeurs, positionals: positionnels } = parseArgs({ args: argv, options, allowPositionals: true }));
  } catch (e) {
    console.error(erreur(e.message));
    console.error("Lancez « taches --aide » pour la liste des options.");
    return 2;
  }

  if (valeurs.version) {
    console.log(paquet.version);
    return 0;
  }
  const [commande, ...args] = positionnels;
  if (valeurs.aide || !commande) {
    console.log(AIDE);
    return valeurs.aide ? 0 : 2;
  }

  const fichier = valeurs.fichier ?? cheminParDefaut(env);
  try {
    const taches = await charger(fichier);
    switch (commande) {
      case "lister": {
        const liste = aAfficher(taches, { toutes: valeurs.toutes });
        console.log(valeurs.json ? JSON.stringify(liste, null, 2) : formaterListe(liste));
        return 0;
      }
      case "ajouter": {
        const resultat = ajouter(taches, args.join(" "), valeurs.priorite);
        await enregistrer(fichier, resultat.taches);
        console.log(succes(`Ajoutée : ${formaterTache(resultat.tache)}`));
        return 0;
      }
      case "terminer":
      case "supprimer": {
        const action = commande === "terminer" ? terminer : supprimer;
        const resultat = action(taches, lireId(args[0]));
        await enregistrer(fichier, resultat.taches);
        console.log(succes(`${commande === "terminer" ? "Terminée" : "Supprimée"} : ${resultat.tache.texte}`));
        return 0;
      }
      case "importer": {
        if (entree.isTTY) throw new ErreurUtilisateur("Envoyez les tâches sur l'entrée standard : cat liste.txt | taches importer");
        let resultat = { taches };
        let nombre = 0;
        // Lecture ligne à ligne, même pour un très gros fichier
        for await (const ligne of readline.createInterface({ input: entree, crlfDelay: Infinity })) {
          if (!ligne.trim()) continue;
          resultat = ajouter(resultat.taches, ligne, valeurs.priorite);
          nombre++;
        }
        await enregistrer(fichier, resultat.taches);
        console.log(succes(`${nombre} tâche(s) importée(s).`));
        return 0;
      }
      default:
        console.error(erreur(`commande inconnue : « ${commande} ».`));
        console.error("Lancez « taches --aide » pour la liste des commandes.");
        return 2;
    }
  } catch (e) {
    if (!(e instanceof ErreurUtilisateur)) throw e; // bogue : on garde la pile d'appels
    console.error(erreur(e.message));
    return 1;
  }
}
