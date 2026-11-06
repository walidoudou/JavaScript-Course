// Lecture et écriture du fichier JSON des tâches.
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ErreurUtilisateur } from "./taches.js";

export function cheminParDefaut(env = process.env) {
  return env.TACHES_FICHIER || path.join(os.homedir(), ".taches.json");
}

export async function charger(fichier) {
  let texte;
  try {
    texte = await readFile(fichier, "utf8");
  } catch (erreur) {
    if (erreur.code === "ENOENT") return []; // premier lancement : pas encore de fichier
    throw erreur;
  }
  try {
    const taches = JSON.parse(texte);
    if (!Array.isArray(taches)) throw new TypeError("un tableau était attendu");
    return taches;
  } catch (erreur) {
    throw new ErreurUtilisateur(`Fichier de tâches illisible : ${fichier} (${erreur.message}).`, { cause: erreur });
  }
}

export async function enregistrer(fichier, taches) {
  await mkdir(path.dirname(fichier), { recursive: true });
  // Écriture atomique : on écrit à côté puis on renomme. Si le processus est
  // interrompu, l'ancien fichier reste intact au lieu d'être à moitié écrit.
  const temporaire = `${fichier}.${process.pid}.tmp`;
  await writeFile(temporaire, `${JSON.stringify(taches, null, 2)}\n`);
  await rename(temporaire, fichier);
}
