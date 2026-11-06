import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import path from "node:path";
import { Readable } from "node:stream";
import { describe, it } from "node:test";
import { promisify } from "node:util";
import {
  ajouterLigne,
  analyserFlux,
  creerRapport,
  creerStatistiques,
  extraireMots,
  formaterTexte,
} from "../src/analyseur.js";

const executer = promisify(execFile);
const CLI = path.join(import.meta.dirname, "..", "cli.js");
const EXEMPLE = path.join(import.meta.dirname, "..", "exemples", "phare.txt");

/** Lance la CLI en lui envoyant `entree` sur stdin. */
function executerAvecEntree(args, entree) {
  return new Promise((resoudre, rejeter) => {
    const enfant = spawn(process.execPath, [CLI, ...args]);
    let sortie = "";
    enfant.stdout
      .setEncoding("utf8")
      .on("data", (morceau) => (sortie += morceau));
    enfant.on("error", rejeter);
    enfant.on("close", (code) => resoudre({ code, sortie }));
    enfant.stdin.end(entree);
  });
}

describe("extraireMots", () => {
  it("découpe en mots en minuscules, ponctuation ignorée", () => {
    assert.deepEqual(extraireMots("Bonjour, le Monde ! 2026 ?"), [
      "bonjour",
      "le",
      "monde",
      "2026",
    ]);
  });

  it("garde les traits d'union et les apostrophes internes", () => {
    assert.deepEqual(extraireMots("Peut-être aujourd'hui"), [
      "peut-être",
      "aujourd'hui",
    ]);
  });

  it("retire les élisions, avec apostrophe droite ou typographique", () => {
    assert.deepEqual(extraireMots("L'été, c’est qu'il fait jusqu'à l'aube"), [
      "été",
      "est",
      "il",
      "fait",
      "à",
      "aube",
    ]);
  });

  it("reconnaît les lettres de tous les alphabets", () => {
    assert.deepEqual(extraireMots("Ελλάδα, Москва et 東京"), [
      "ελλάδα",
      "москва",
      "et",
      "東京",
    ]);
  });

  it("renvoie un tableau vide pour une ligne sans mot", () => {
    assert.deepEqual(extraireMots("  — ... !"), []);
  });
});

describe("statistiques", () => {
  it("compte lignes, lignes vides, caractères et fréquences", () => {
    const stats = creerStatistiques();
    for (const ligne of ["Le chat dort.", "", "Le chien dort 🐕"])
      ajouterLigne(stats, ligne);
    assert.equal(stats.lignes, 3);
    assert.equal(stats.lignesVides, 1);
    assert.equal(stats.caracteres, 13 + 0 + 15); // 🐕 compte pour un caractère (un point de code)
    assert.equal(stats.mots, 6);
    assert.deepEqual(Object.fromEntries(stats.frequences), {
      le: 2,
      chat: 1,
      dort: 2,
      chien: 1,
    });
  });

  it("lit un flux même quand une ligne est coupée entre deux morceaux", async () => {
    const flux = Readable.from([
      "première li",
      "gne\r\ndeuxième ligne\n",
      "troisième",
    ]);
    const stats = await analyserFlux(flux);
    assert.equal(stats.lignes, 3);
    assert.equal(stats.frequences.get("ligne"), 2);
    assert.equal(stats.frequences.get("li"), undefined);
  });

  it("gère un flux vide", async () => {
    const stats = await analyserFlux(Readable.from([]));
    assert.equal(stats.lignes, 0);
    assert.equal(creerRapport(stats).motLePlusLong, null);
  });
});

describe("rapport", () => {
  const stats = creerStatistiques();
  ajouterLigne(stats, "le vent et le phare, le vent et la mer");
  ajouterLigne(stats, "anticonstitutionnellement");

  it("trie par fréquence décroissante puis par ordre alphabétique", () => {
    const { frequences } = creerRapport(stats, { top: 3 });
    assert.deepEqual(frequences, [
      { mot: "le", nombre: 3 },
      { mot: "et", nombre: 2 },
      { mot: "vent", nombre: 2 },
    ]);
  });

  it("filtre par longueur minimale et mots vides", () => {
    assert.deepEqual(
      creerRapport(stats, { minLongueur: 4 }).frequences.map((f) => f.mot),
      ["vent", "anticonstitutionnellement", "phare"],
    );
    assert.deepEqual(
      creerRapport(stats, { sansMotsVides: true }).frequences.map((f) => f.mot),
      ["vent", "anticonstitutionnellement", "mer", "phare"],
    );
  });

  it("calcule les indicateurs globaux", () => {
    const rapport = creerRapport(stats);
    assert.equal(rapport.mots, 11);
    assert.equal(rapport.motsDistincts, 7);
    assert.equal(rapport.motLePlusLong, "anticonstitutionnellement");
    assert.equal(rapport.longueurMoyenne, 53 / 11); // 28 + 25 lettres
  });

  it("produit un texte lisible", () => {
    const texte = formaterTexte(creerRapport(stats, { top: 2 }), "test.txt");
    assert.match(texte, /^Analyse de test\.txt$/m);
    assert.match(texte, /^Mots {8}: 11 \(7 distincts\)$/m);
    assert.match(texte, /^1\. le  3  █{30}$/m);
  });
});

describe("CLI", () => {
  it("analyse le fichier d'exemple en JSON", async () => {
    const { stdout } = await executer(process.execPath, [
      CLI,
      EXEMPLE,
      "--format",
      "json",
      "-t",
      "2",
      "-s",
    ]);
    const rapport = JSON.parse(stdout);
    assert.equal(rapport.lignes, 16);
    assert.equal(rapport.lignesVides, 3);
    assert.equal(rapport.mots, 143);
    assert.deepEqual(rapport.frequences, [
      { mot: "gardien", nombre: 5 },
      { mot: "phare", nombre: 5 },
    ]);
  });

  it("lit l'entrée standard", async () => {
    const { code, sortie } = await executerAvecEntree(
      ["-f", "json"],
      "un deux\ndeux\n",
    );
    assert.equal(code, 0);
    assert.equal(JSON.parse(sortie).mots, 3);
  });

  it("signale un fichier introuvable (code 1) et une option invalide (code 2)", async () => {
    await assert.rejects(
      executer(process.execPath, [CLI, "absent.txt"]),
      (erreur) => {
        assert.equal(erreur.code, 1);
        assert.match(erreur.stderr, /absent\.txt : fichier introuvable/);
        return true;
      },
    );
    await assert.rejects(
      executer(process.execPath, [CLI, EXEMPLE, "--format", "xml"]),
      { code: 2 },
    );
  });
});
