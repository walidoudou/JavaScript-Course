// Tests d'intégration : on démarre le vrai serveur sur un port libre (port 0)
// avec un fichier de données dans un dossier temporaire, puis on l'interroge avec fetch.
import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { creerServeur } from "../src/app.js";
import { validerTache } from "../src/validation.js";

let dossier;

before(async () => {
  dossier = await mkdtemp(path.join(tmpdir(), "api-taches-"));
});

after(async () => {
  await rm(dossier, { recursive: true, force: true });
});

/** Démarre un serveur sur un port libre ; renvoie son URL de base et une fonction d'arrêt. */
async function demarrer(fichier) {
  const serveur = await creerServeur({ fichier });
  serveur.listen(0, "127.0.0.1"); // 0 : le système choisit un port libre
  await once(serveur, "listening");
  const { port } = serveur.address();
  return {
    base: `http://127.0.0.1:${port}`,
    arreter: async () => {
      serveur.close();
      await once(serveur, "close");
    },
  };
}

function envoyer(url, methode, corps) {
  return fetch(url, {
    method: methode,
    headers: { "Content-Type": "application/json" },
    body: typeof corps === "string" ? corps : JSON.stringify(corps),
  });
}

describe("API /taches", () => {
  let base;
  let arreter;
  let fichier;

  before(async () => {
    fichier = path.join(dossier, "taches.json");
    ({ base, arreter } = await demarrer(fichier));
  });

  after(() => arreter());

  it("GET /taches renvoie une liste vide au départ", async () => {
    const reponse = await fetch(`${base}/taches`);
    assert.equal(reponse.status, 200);
    assert.match(reponse.headers.get("content-type"), /^application\/json/);
    assert.deepEqual(await reponse.json(), []);
  });

  let creee;

  it("POST /taches crée une tâche (201 + Location)", async () => {
    const reponse = await envoyer(`${base}/taches`, "POST", {
      titre: "  Écrire les tests  ",
    });
    assert.equal(reponse.status, 201);
    creee = await reponse.json();
    assert.equal(reponse.headers.get("location"), `/taches/${creee.id}`);
    assert.equal(creee.titre, "Écrire les tests"); // espaces retirés
    assert.equal(creee.terminee, false);
    assert.match(creee.id, /^[0-9a-f-]{36}$/);
    assert.ok(!Number.isNaN(Date.parse(creee.creeLe)));
  });

  it("GET /taches/:id renvoie la tâche, 404 si elle n'existe pas", async () => {
    const reponse = await fetch(`${base}/taches/${creee.id}`);
    assert.equal(reponse.status, 200);
    assert.deepEqual(await reponse.json(), creee);

    const absente = await fetch(`${base}/taches/inconnue`);
    assert.equal(absente.status, 404);
    assert.deepEqual(await absente.json(), {
      erreur: "Tâche inconnue introuvable.",
    });
  });

  it("PATCH /taches/:id modifie partiellement la tâche", async () => {
    const reponse = await envoyer(`${base}/taches/${creee.id}`, "PATCH", {
      terminee: true,
    });
    assert.equal(reponse.status, 200);
    const modifiee = await reponse.json();
    assert.equal(modifiee.terminee, true);
    assert.equal(modifiee.titre, creee.titre);
    assert.ok(modifiee.modifieLe >= creee.modifieLe); // les dates ISO se comparent comme des chaînes
  });

  it("GET /taches?terminee=… filtre les tâches", async () => {
    await envoyer(`${base}/taches`, "POST", { titre: "Tâche active" });
    const terminees = await (
      await fetch(`${base}/taches?terminee=true`)
    ).json();
    const actives = await (await fetch(`${base}/taches?terminee=false`)).json();
    assert.deepEqual(
      terminees.map((t) => t.titre),
      ["Écrire les tests"],
    );
    assert.deepEqual(
      actives.map((t) => t.titre),
      ["Tâche active"],
    );
    assert.equal(
      (await fetch(`${base}/taches?terminee=peut-etre`)).status,
      400,
    );
  });

  it("refuse les données invalides (422) avec le détail des erreurs", async () => {
    const reponse = await envoyer(`${base}/taches`, "POST", {
      titre: "",
      priorite: 3,
    });
    assert.equal(reponse.status, 422);
    assert.deepEqual(await reponse.json(), {
      erreur: "Données invalides.",
      details: [
        { champ: "priorite", message: "Champ inconnu." },
        { champ: "titre", message: "Ne doit pas être vide." },
      ],
    });
    assert.equal(
      (await envoyer(`${base}/taches/${creee.id}`, "PATCH", {})).status,
      422,
    );
    assert.equal(
      (
        await envoyer(`${base}/taches/${creee.id}`, "PATCH", {
          terminee: "oui",
        })
      ).status,
      422,
    );
  });

  it("refuse un JSON mal formé (400) ou un autre type de contenu (415)", async () => {
    assert.equal(
      (await envoyer(`${base}/taches`, "POST", "{titre: oups")).status,
      400,
    );
    const texte = await fetch(`${base}/taches`, {
      method: "POST",
      body: "titre=Lire",
    });
    assert.equal(texte.status, 415);
  });

  it("refuse un corps trop volumineux (413)", async () => {
    const reponse = await envoyer(`${base}/taches`, "POST", {
      titre: "x".repeat(200_000),
    });
    assert.equal(reponse.status, 413);
  });

  it("répond 404 sur une route inconnue et 405 (+ Allow) sur une méthode non prévue", async () => {
    assert.equal((await fetch(`${base}/utilisateurs`)).status, 404);
    const reponse = await fetch(`${base}/taches`, { method: "PUT" });
    assert.equal(reponse.status, 405);
    assert.equal(reponse.headers.get("allow"), "GET, POST");
  });

  it("DELETE /taches/:id supprime (204), puis 404", async () => {
    const reponse = await fetch(`${base}/taches/${creee.id}`, {
      method: "DELETE",
    });
    assert.equal(reponse.status, 204);
    assert.equal(await reponse.text(), "");
    assert.equal((await fetch(`${base}/taches/${creee.id}`)).status, 404);
    assert.equal(
      (await fetch(`${base}/taches/${creee.id}`, { method: "DELETE" })).status,
      404,
    );
  });

  it("enregistre les tâches dans le fichier JSON", async () => {
    const contenu = JSON.parse(await readFile(fichier, "utf8"));
    assert.deepEqual(
      contenu.map((t) => t.titre),
      ["Tâche active"],
    );
  });
});

describe("persistance", () => {
  it("retrouve les tâches après un redémarrage", async () => {
    const fichier = path.join(dossier, "redemarrage.json");
    let { base, arreter } = await demarrer(fichier);
    await envoyer(`${base}/taches`, "POST", {
      titre: "Survivre au redémarrage",
    });
    await arreter();

    ({ base, arreter } = await demarrer(fichier));
    const taches = await (await fetch(`${base}/taches`)).json();
    assert.deepEqual(
      taches.map((t) => t.titre),
      ["Survivre au redémarrage"],
    );
    await arreter();
  });

  it("ne perd aucune écriture lors de requêtes simultanées", async () => {
    const fichier = path.join(dossier, "simultane.json");
    const { base, arreter } = await demarrer(fichier);
    const reponses = await Promise.all(
      Array.from({ length: 25 }, (_, i) =>
        envoyer(`${base}/taches`, "POST", { titre: `Tâche ${i}` }),
      ),
    );
    assert.ok(reponses.every((r) => r.status === 201));
    await arreter();
    assert.equal(JSON.parse(await readFile(fichier, "utf8")).length, 25);
  });

  it("refuse de démarrer sur un fichier corrompu plutôt que de l'écraser", async () => {
    const fichier = path.join(dossier, "corrompu.json");
    await writeFile(fichier, "{ pas du JSON");
    await assert.rejects(creerServeur({ fichier }), /Impossible de lire/);
    assert.equal(await readFile(fichier, "utf8"), "{ pas du JSON");
  });
});

describe("validerTache", () => {
  it("valide une création complète", () => {
    assert.deepEqual(validerTache({ titre: "Lire", terminee: true }), {
      valeur: { titre: "Lire", terminee: true },
      erreurs: [],
    });
  });

  it("exige un titre à la création, pas à la modification", () => {
    assert.equal(validerTache({}).erreurs[0].champ, "titre");
    assert.deepEqual(
      validerTache({ terminee: false }, { partiel: true }).erreurs,
      [],
    );
  });

  it("refuse ce qui n'est pas un objet", () => {
    for (const corps of [null, [], "texte", 42]) {
      assert.equal(validerTache(corps).erreurs[0].champ, "(corps)");
    }
  });

  it("refuse un titre trop long ou d'un mauvais type", () => {
    assert.match(
      validerTache({ titre: "x".repeat(201) }).erreurs[0].message,
      /200 caractères/,
    );
    assert.match(validerTache({ titre: 12 }).erreurs[0].message, /chaîne/);
  });
});
