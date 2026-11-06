import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLE, chargerTaches, sauvegarderTaches } from "../src/stockage.js";
import {
  ajouterTache,
  basculerTache,
  basculerToutes,
  compter,
  creerTache,
  filtrerTaches,
  filtreDepuisHash,
  normaliserTitre,
  supprimerTache,
  supprimerTerminees,
} from "../src/taches.js";

// Tâches de départ figées : si une fonction les mutait, Object.freeze lèverait une erreur
// (les modules ES sont en mode strict).
const depart = Object.freeze([
  Object.freeze({
    id: "a",
    titre: "Acheter du pain",
    terminee: false,
    creeLe: 1,
  }),
  Object.freeze({
    id: "b",
    titre: "Réviser les promesses",
    terminee: true,
    creeLe: 2,
  }),
  Object.freeze({
    id: "c",
    titre: "Arroser les plantes",
    terminee: false,
    creeLe: 3,
  }),
]);

describe("création", () => {
  it("normalise le titre", () => {
    assert.equal(
      normaliserTitre("  Faire   les courses \n"),
      "Faire les courses",
    );
  });

  it("refuse un titre vide ou trop long", () => {
    assert.throws(() => normaliserTitre("   "), /vide/);
    assert.throws(() => normaliserTitre("x".repeat(201)), /200 caractères/);
  });

  it("crée une tâche active avec un identifiant unique", () => {
    const t = creerTache("Lire", { id: "id-1", maintenant: 42 });
    assert.deepEqual(t, {
      id: "id-1",
      titre: "Lire",
      terminee: false,
      creeLe: 42,
    });
    assert.notEqual(creerTache("x").id, creerTache("x").id); // crypto.randomUUID()
  });

  it("ajoute en fin de liste sans modifier la liste d'origine", () => {
    const apres = ajouterTache(depart, "Nouvelle", { id: "d", maintenant: 4 });
    assert.equal(apres.length, 4);
    assert.equal(apres.at(-1).titre, "Nouvelle");
    assert.equal(depart.length, 3);
  });
});

describe("modifications", () => {
  it("bascule une seule tâche", () => {
    const apres = basculerTache(depart, "a");
    assert.equal(apres[0].terminee, true);
    assert.equal(apres[1], depart[1]); // les autres tâches sont réutilisées telles quelles
  });

  it("tout cocher, puis tout décocher", () => {
    const toutCoche = basculerToutes(depart);
    assert.ok(toutCoche.every((t) => t.terminee));
    assert.ok(basculerToutes(toutCoche).every((t) => !t.terminee));
  });

  it("supprime une tâche ou toutes les terminées", () => {
    assert.deepEqual(
      supprimerTache(depart, "b").map((t) => t.id),
      ["a", "c"],
    );
    assert.deepEqual(
      supprimerTerminees(depart).map((t) => t.id),
      ["a", "c"],
    );
  });
});

describe("filtres et compteur", () => {
  it("filtre selon le filtre choisi", () => {
    assert.equal(filtrerTaches(depart, "toutes").length, 3);
    assert.deepEqual(
      filtrerTaches(depart, "actives").map((t) => t.id),
      ["a", "c"],
    );
    assert.deepEqual(
      filtrerTaches(depart, "terminees").map((t) => t.id),
      ["b"],
    );
  });

  it("compte les tâches", () => {
    assert.deepEqual(compter(depart), { total: 3, actives: 2, terminees: 1 });
    assert.deepEqual(compter([]), { total: 0, actives: 0, terminees: 0 });
  });

  it("lit le filtre depuis l'URL", () => {
    assert.equal(filtreDepuisHash("#/actives"), "actives");
    assert.equal(filtreDepuisHash("#terminees"), "terminees");
    assert.equal(filtreDepuisHash(""), "toutes");
    assert.equal(filtreDepuisHash("#/nimporte"), "toutes");
  });
});

/** Faux localStorage : la même interface, en mémoire. */
function creerStockage(initial = {}) {
  const donnees = new Map(Object.entries(initial));
  return {
    getItem: (cle) => donnees.get(cle) ?? null,
    setItem: (cle, valeur) => donnees.set(cle, String(valeur)),
  };
}

describe("stockage", () => {
  it("relit ce qui a été sauvegardé", () => {
    const stockage = creerStockage();
    assert.equal(sauvegarderTaches(depart, stockage), true);
    assert.deepEqual(chargerTaches(stockage), depart);
  });

  it("renvoie [] si rien n'est enregistré ou si le JSON est corrompu", () => {
    assert.deepEqual(chargerTaches(creerStockage()), []);
    assert.deepEqual(
      chargerTaches(creerStockage({ [CLE]: "{pas du json" })),
      [],
    );
    assert.deepEqual(
      chargerTaches(creerStockage({ [CLE]: '{"pas":"un tableau"}' })),
      [],
    );
  });

  it("écarte les entrées qui n'ont pas la forme d'une tâche", () => {
    const brut = JSON.stringify([depart[0], { id: 1 }, null, "texte"]);
    assert.deepEqual(chargerTaches(creerStockage({ [CLE]: brut })), [
      depart[0],
    ]);
  });

  it("renvoie false si l'écriture échoue (quota dépassé)", () => {
    const plein = {
      setItem() {
        throw new DOMException("Quota dépassé", "QuotaExceededError");
      },
    };
    assert.equal(sauvegarderTaches(depart, plein), false);
  });
});
