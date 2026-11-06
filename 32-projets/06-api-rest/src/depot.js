// Dépôt de tâches persisté dans un fichier JSON.
// ponytail: tout le fichier est réécrit à chaque modification ; parfait jusqu'à quelques
// milliers de tâches. Au-delà, passez à une vraie base (node:sqlite, PostgreSQL…).
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * @typedef {{ id: string, titre: string, terminee: boolean, creeLe: string, modifieLe: string }} Tache
 */

/** Charge le fichier (ou part d'une liste vide s'il n'existe pas) et renvoie le dépôt. */
export async function ouvrirDepot(fichier) {
  /** @type {Tache[]} */
  let taches = [];
  try {
    taches = JSON.parse(await readFile(fichier, "utf8"));
  } catch (erreur) {
    // Fichier absent : premier démarrage. Toute autre erreur (JSON corrompu, droits…) est
    // remontée : mieux vaut refuser de démarrer que d'écraser les données existantes.
    if (erreur.code !== "ENOENT")
      throw new Error(`Impossible de lire ${fichier}`, { cause: erreur });
  }
  await mkdir(path.dirname(fichier), { recursive: true });

  let derniereEcriture = Promise.resolve();

  /**
   * Les écritures sont mises en file d'attente : deux requêtes simultanées ne peuvent pas
   * écrire le fichier en même temps. On écrit dans un fichier temporaire puis on le renomme :
   * le renommage est atomique, le fichier n'est donc jamais à moitié écrit.
   */
  function enregistrer() {
    const ecrire = async () => {
      const temporaire = `${fichier}.tmp`;
      await writeFile(temporaire, JSON.stringify(taches, null, 2));
      await rename(temporaire, fichier);
    };
    const ecriture = derniereEcriture.then(ecrire);
    // derniereEcriture ne rejette jamais : un échec d'écriture ne bloque pas les suivantes.
    derniereEcriture = ecriture.catch(() => {});
    return ecriture;
  }

  return {
    lister() {
      return taches;
    },

    trouver(id) {
      return taches.find((t) => t.id === id) ?? null;
    },

    async ajouter({ titre, terminee = false }) {
      const maintenant = new Date().toISOString();
      const tache = {
        id: crypto.randomUUID(),
        titre,
        terminee,
        creeLe: maintenant,
        modifieLe: maintenant,
      };
      taches = [...taches, tache];
      await enregistrer();
      return tache;
    },

    /** Applique des changements partiels ; renvoie la tâche modifiée, ou null si elle n'existe pas. */
    async modifier(id, changements) {
      const existante = this.trouver(id);
      if (!existante) return null;
      const modifiee = {
        ...existante,
        ...changements,
        modifieLe: new Date().toISOString(),
      };
      taches = taches.map((t) => (t.id === id ? modifiee : t));
      await enregistrer();
      return modifiee;
    },

    /** Renvoie true si la tâche existait. */
    async supprimer(id) {
      const avant = taches.length;
      taches = taches.filter((t) => t.id !== id);
      if (taches.length === avant) return false;
      await enregistrer();
      return true;
    },
  };
}
