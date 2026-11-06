import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";
import { promisify } from "node:util";
import {
  AMBIGUS,
  entierAleatoire,
  entropie,
  genererMotDePasse,
  JEUX,
  jeuxActifs,
  niveauRobustesse,
  respecteComposition,
} from "../src/generateur.js";

const executer = promisify(execFile);
const CLI = path.join(import.meta.dirname, "..", "cli.js");

describe("entierAleatoire", () => {
  it("reste dans [0, max[", () => {
    for (let i = 0; i < 1000; i++) {
      const n = entierAleatoire(7);
      assert.ok(Number.isInteger(n) && n >= 0 && n < 7);
    }
  });

  it("répartit les tirages de façon à peu près uniforme", () => {
    const compte = new Array(10).fill(0);
    for (let i = 0; i < 10_000; i++) compte[entierAleatoire(10)]++;
    // Écart type ≈ 30 : sortir de [800, 1200] est pratiquement impossible.
    for (const c of compte)
      assert.ok(c > 800 && c < 1200, `répartition suspecte : ${compte}`);
  });

  it("refuse un max invalide", () => {
    assert.throws(() => entierAleatoire(0), RangeError);
    assert.throws(() => entierAleatoire(2.5), RangeError);
  });
});

describe("genererMotDePasse", () => {
  it("respecte la longueur demandée (16 par défaut)", () => {
    assert.equal(genererMotDePasse().length, 16);
    assert.equal(genererMotDePasse({ longueur: 40 }).length, 40);
  });

  it("contient toujours au moins un caractère de chaque jeu actif", () => {
    const jeux = jeuxActifs();
    for (let i = 0; i < 500; i++) {
      assert.ok(respecteComposition(genererMotDePasse({ longueur: 8 }), jeux));
    }
  });

  it("n'utilise que les jeux demandés", () => {
    const mdp = genererMotDePasse({
      longueur: 64,
      symboles: false,
      majuscules: false,
    });
    assert.match(mdp, /^[a-z0-9]+$/);
  });

  it("exclut les caractères ambigus sur demande", () => {
    const mdp = genererMotDePasse({ longueur: 128, sansAmbigus: true });
    for (const c of AMBIGUS) assert.ok(!mdp.includes(c), `contient « ${c} »`);
  });

  it("produit des mots de passe différents", () => {
    const lot = new Set(Array.from({ length: 100 }, () => genererMotDePasse()));
    assert.equal(lot.size, 100);
  });

  it("refuse une longueur hors limites ou aucun jeu actif", () => {
    assert.throws(() => genererMotDePasse({ longueur: 4 }), RangeError);
    assert.throws(() => genererMotDePasse({ longueur: "12" }), RangeError);
    assert.throws(
      () =>
        genererMotDePasse({
          minuscules: false,
          majuscules: false,
          chiffres: false,
          symboles: false,
        }),
      /au moins un jeu/,
    );
  });
});

describe("entropie et robustesse", () => {
  it("calcule longueur × log2(alphabet)", () => {
    assert.equal(entropie(10, 1024), 100);
    const tailleTotale = Object.values(JEUX).join("").length;
    assert.equal(tailleTotale, 88);
    assert.equal(niveauRobustesse(entropie(16, tailleTotale)), "fort"); // ≈ 103 bits
    assert.equal(niveauRobustesse(entropie(8, tailleTotale)), "très faible"); // ≈ 52 bits
  });
});

describe("CLI", () => {
  it("génère le nombre de mots de passe demandé", async () => {
    const { stdout } = await executer(process.execPath, [
      CLI,
      "-l",
      "20",
      "-n",
      "3",
    ]);
    const lignes = stdout.trim().split("\n");
    assert.equal(lignes.length, 3);
    for (const ligne of lignes) assert.equal(ligne.length, 20);
  });

  it("affiche l'entropie sur stderr", async () => {
    const { stdout, stderr } = await executer(process.execPath, [
      CLI,
      "--sans-symboles",
      "-e",
    ]);
    assert.match(stdout, /^[a-zA-Z0-9]{16}\n$/);
    assert.match(
      stderr,
      /Entropie : 95\.3 bits \(62 caractères possibles\) → moyen/,
    );
  });

  it("sort avec le code 2 sur une option invalide", async () => {
    await assert.rejects(
      executer(process.execPath, [CLI, "--longueur", "abc"]),
      (erreur) => {
        assert.equal(erreur.code, 2);
        assert.match(erreur.stderr, /--longueur doit être un entier/);
        return true;
      },
    );
    await assert.rejects(executer(process.execPath, [CLI, "--inconnue"]), {
      code: 2,
    });
  });
});
