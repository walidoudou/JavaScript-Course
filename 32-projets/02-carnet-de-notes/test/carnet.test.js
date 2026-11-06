import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { coefficients, eleves } from "../donnees.js";
import {
  bulletin,
  classement,
  majorsParMatiere,
  mention,
  regrouperParMention,
  statistiquesParMatiere,
  validerNote,
} from "../src/carnet.js";
import {
  ecartType,
  mediane,
  moyenne,
  moyennePonderee,
  resume,
} from "../src/statistiques.js";

/** Les moyennes sont des flottants : on compare à 1e-9 près. */
function assertProche(reel, attendu) {
  assert.ok(Math.abs(reel - attendu) < 1e-9, `${reel} ≠ ${attendu}`);
}

describe("statistiques", () => {
  it("moyenne et médiane", () => {
    assert.equal(moyenne([12, 15, 18]), 15);
    assert.equal(mediane([18, 12, 15]), 15);
    assert.equal(mediane([4, 1, 3, 2]), 2.5);
  });

  it("renvoie null pour une liste vide", () => {
    assert.equal(moyenne([]), null);
    assert.equal(mediane([]), null);
    assert.equal(ecartType([]), null);
    assert.deepEqual(resume([]), {
      effectif: 0,
      moyenne: null,
      mediane: null,
      ecartType: null,
      min: null,
      max: null,
    });
  });

  it("ne modifie pas le tableau reçu", () => {
    const notes = [15, 9, 12];
    mediane(notes);
    assert.deepEqual(notes, [15, 9, 12]);
  });

  it("moyenne pondérée et écart type", () => {
    assert.equal(
      moyennePonderee([
        { valeur: 10, poids: 1 },
        { valeur: 16, poids: 2 },
      ]),
      14,
    );
    assert.equal(moyennePonderee([]), null);
    assert.equal(ecartType([2, 4, 4, 4, 5, 5, 7, 9]), 2);
  });
});

describe("validerNote et mention", () => {
  it("accepte 0 à 20, refuse le reste", () => {
    for (const note of [0, 10.5, 20]) validerNote(note);
    for (const note of [-1, 20.5, NaN, Infinity, "12", null]) {
      assert.throws(() => validerNote(note), RangeError);
    }
  });

  it("attribue la mention selon les seuils", () => {
    assert.equal(mention(16), "Très bien");
    assert.equal(mention(15.99), "Bien");
    assert.equal(mention(12), "Assez bien");
    assert.equal(mention(10), "Sans mention");
    assert.equal(mention(9.99), "Insuffisant");
    assert.equal(mention(null), null);
  });
});

describe("bulletin", () => {
  it("calcule les moyennes par matière et la moyenne générale pondérée", () => {
    const b = bulletin(
      { nom: "Test", notes: { maths: [12, 16], francais: [11] } },
      { maths: 3, francais: 1 },
    );
    assert.deepEqual(b.matieres, { maths: 14, francais: 11 });
    assert.equal(b.moyenne, (14 * 3 + 11) / 4);
    assert.equal(b.mention, "Assez bien");
  });

  it("ignore une matière sans note et donne le coefficient 1 à une matière inconnue", () => {
    const b = bulletin(
      { nom: "Test", notes: { maths: [], dessin: [18] } },
      { maths: 4 },
    );
    assert.deepEqual(b.matieres, { dessin: 18 });
    assert.equal(b.moyenne, 18);
  });

  it("donne une moyenne null à un élève sans aucune note", () => {
    const b = bulletin({ nom: "Nouveau", notes: {} }, coefficients);
    assert.equal(b.moyenne, null);
    assert.equal(b.mention, null);
  });

  it("signale une note invalide avec l'élève et la matière", () => {
    assert.throws(
      () => bulletin({ nom: "Léo", notes: { maths: [12, 21] } }, {}),
      /pour Léo en maths : 21/,
    );
  });

  it("donne le bon résultat sur les données d'exemple", () => {
    const amina = bulletin(eleves[0], coefficients);
    assertProche(amina.matieres.mathematiques, 51.5 / 3);
    assertProche(amina.moyenne, 16.17156862745098);
  });
});

describe("classement", () => {
  const bulletins = [
    { nom: "Zoé", moyenne: 12 },
    { nom: "Adam", moyenne: 15 },
    { nom: "Basile", moyenne: null },
    { nom: "Chloé", moyenne: 15 },
    { nom: "Éric", moyenne: 9 },
  ];

  it("trie par moyenne décroissante, puis par nom, avec des rangs ex aequo", () => {
    const resultat = classement(bulletins).map(({ nom, rang }) => [nom, rang]);
    assert.deepEqual(resultat, [
      ["Adam", 1],
      ["Chloé", 1],
      ["Zoé", 3],
      ["Éric", 4],
      ["Basile", null],
    ]);
  });

  it("ne modifie pas le tableau d'origine", () => {
    classement(bulletins);
    assert.equal(bulletins[0].nom, "Zoé");
    assert.equal("rang" in bulletins[0], false);
  });
});

describe("regroupements", () => {
  const bulletins = eleves.map((e) => bulletin(e, coefficients));

  it("regroupe les noms par mention, dans l'ordre des mentions", () => {
    const groupes = regrouperParMention(classement(bulletins));
    assert.deepEqual(Object.keys(groupes), [
      "Très bien",
      "Bien",
      "Assez bien",
      "Sans mention",
      "Insuffisant",
    ]);
    assert.deepEqual(groupes.Bien, [
      "Yanis Benali",
      "Chloé Bernard",
      "Inès Moreau",
    ]);
  });

  it("calcule les statistiques de chaque matière", () => {
    const stats = statistiquesParMatiere(bulletins);
    assert.equal(stats.sport.effectif, 6); // Hugo est dispensé
    assert.equal(stats.anglais.max, 18);
    assert.equal(stats.physique.min, 7.25);
  });

  it("trouve les majors, ex aequo compris", () => {
    const majors = majorsParMatiere(bulletins);
    assert.deepEqual(majors.francais, {
      moyenne: 16.75,
      noms: ["Chloé Bernard", "Inès Moreau"],
    });
    assert.deepEqual(majors.mathematiques.noms, ["Yanis Benali"]);
  });
});
