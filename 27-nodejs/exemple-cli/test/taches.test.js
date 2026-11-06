// Lancer avec : node --test (ou node --run test)
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, describe, test } from "node:test";
import { promisify } from "node:util";
import { aAfficher, ajouter, ErreurUtilisateur, lireId, supprimer, terminer } from "../src/taches.js";

describe("logique des tâches", () => {
  const date = new Date("2026-11-06T10:00:00Z");

  test("ajouter attribue des identifiants croissants", () => {
    let { taches } = ajouter([], "Pain", "normale", date);
    ({ taches } = ajouter(taches, "  Lait  ", "haute", date));
    assert.deepEqual(
      taches.map((t) => [t.id, t.texte, t.priorite]),
      [
        [1, "Pain", "normale"],
        [2, "Lait", "haute"],
      ],
    );
    assert.equal(taches[0].creeeLe, "2026-11-06T10:00:00.000Z");
  });

  test("ajouter refuse un texte vide ou une priorité inconnue", () => {
    assert.throws(() => ajouter([], "   "), ErreurUtilisateur);
    assert.throws(() => ajouter([], "Pain", "urgente"), /Priorité inconnue/);
  });

  test("terminer et supprimer ne modifient pas le tableau d'origine", () => {
    const { taches } = ajouter([], "Pain");
    const apres = terminer(taches, 1).taches;
    assert.equal(apres[0].faite, true);
    assert.equal(taches[0].faite, false);
    assert.deepEqual(supprimer(taches, 1).taches, []);
    assert.throws(() => terminer(taches, 99), /Aucune tâche n° 99/);
  });

  test("aAfficher trie par priorité et masque les tâches faites", () => {
    let taches = [];
    for (const [texte, priorite] of [["a", "basse"], ["b", "haute"], ["c", "normale"], ["d", "haute"]]) {
      ({ taches } = ajouter(taches, texte, priorite));
    }
    taches = terminer(taches, 4).taches;
    assert.deepEqual(aAfficher(taches).map((t) => t.texte), ["b", "c", "a"]);
    assert.deepEqual(aAfficher(taches, { toutes: true }).map((t) => t.texte), ["b", "d", "c", "a"]);
  });

  test("lireId n'accepte que des entiers positifs", () => {
    assert.equal(lireId("3"), 3);
    for (const mauvais of ["0", "-1", "2.5", "abc", undefined]) assert.throws(() => lireId(mauvais), ErreurUtilisateur);
  });
});

describe("commande taches (bout en bout)", async () => {
  const executerFichier = promisify(execFile);
  const dossier = await mkdtemp(path.join(os.tmpdir(), "taches-"));
  const fichier = path.join(dossier, "taches.json");
  const bin = path.join(import.meta.dirname, "..", "bin", "taches.js");
  const lancer = (args, options = {}) =>
    executerFichier(process.execPath, [bin, ...args], { env: { ...process.env, TACHES_FICHIER: fichier }, ...options });

  after(() => rm(dossier, { recursive: true, force: true }));

  test("ajouter, lister, terminer", async () => {
    await lancer(["ajouter", "Acheter", "du", "pain"]);
    await lancer(["ajouter", "Réviser", "--priorite", "haute"]);
    await lancer(["terminer", "1"]);
    const { stdout } = await lancer(["lister", "--json"]);
    assert.deepEqual(JSON.parse(stdout).map((t) => t.texte), ["Réviser"]);
    const enregistre = JSON.parse(await readFile(fichier, "utf8"));
    assert.equal(enregistre.length, 2);
  });

  test("importer lit l'entrée standard ligne par ligne", async () => {
    const enfant = lancer(["importer"]);
    enfant.child.stdin.end("Appeler Léa\n\nPayer le loyer\n");
    const { stdout } = await enfant;
    assert.match(stdout, /2 tâche\(s\) importée\(s\)/);
  });

  test("codes de sortie : 2 pour une mauvaise utilisation, 1 pour une erreur", async () => {
    await assert.rejects(lancer(["--inconnue"]), (e) => e.code === 2 && /Unknown option/.test(e.stderr));
    await assert.rejects(lancer(["voler"]), (e) => e.code === 2);
    await assert.rejects(lancer(["terminer", "999"]), (e) => e.code === 1 && /Aucune tâche n° 999/.test(e.stderr));
  });
});
