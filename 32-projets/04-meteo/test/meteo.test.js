import assert from "node:assert/strict";
import { describe, it } from "node:test";
// Réponses réelles d'Open-Meteo enregistrées le 6 novembre 2026 (champ « postcodes » retiré).
import geocodageParis from "./donnees/geocodage-paris.json" with { type: "json" };
import previsionsLyon from "./donnees/previsions-lyon.json" with { type: "json" };
import {
  chercherLieux,
  derniereSeulement,
  ErreurMeteo,
  obtenirJson,
  obtenirPrevisions,
} from "../src/api.js";
import {
  decrireCode,
  formaterJour,
  formaterTemperature,
  libelleLieu,
  transformerLieux,
  transformerPrevisions,
  urlGeocodage,
  urlPrevisions,
} from "../src/meteo.js";

const LYON = { latitude: 45.74906, longitude: 4.84789 };

/** Faux fetch qui renvoie toujours la même réponse et mémorise les URL demandées. */
function fauxFetch(corps, init = { status: 200 }) {
  const appels = [];
  const fetch = async (url, options) => {
    appels.push({ url, options });
    const texte = typeof corps === "string" ? corps : JSON.stringify(corps);
    return new Response(texte, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  };
  return { fetch, appels };
}

/** Faux fetch qui ne répond jamais, mais réagit à l'annulation comme le vrai. */
function fetchBloque(url, { signal }) {
  return new Promise((_, rejeter) => {
    signal.addEventListener("abort", () => rejeter(signal.reason), {
      once: true,
    });
  });
}

describe("construction des URL", () => {
  it("encode le nom de la ville", () => {
    const url = new URL(urlGeocodage("Saint-Étienne du Rouvray"));
    assert.equal(
      url.origin + url.pathname,
      "https://geocoding-api.open-meteo.com/v1/search",
    );
    assert.equal(url.searchParams.get("name"), "Saint-Étienne du Rouvray");
    assert.equal(url.searchParams.get("language"), "fr");
    assert.equal(url.searchParams.get("count"), "5");
  });

  it("demande les variables actuelles et quotidiennes dans le fuseau du lieu", () => {
    const url = new URL(urlPrevisions(LYON));
    assert.equal(url.searchParams.get("latitude"), "45.74906");
    assert.equal(url.searchParams.get("timezone"), "auto");
    assert.match(url.searchParams.get("current"), /temperature_2m/);
    assert.match(url.searchParams.get("daily"), /weather_code/);
  });
});

describe("transformation des réponses", () => {
  it("transforme les résultats du géocodage", () => {
    const lieux = transformerLieux(geocodageParis);
    assert.equal(lieux.length, 3);
    assert.deepEqual(lieux[1], {
      id: 4717560,
      nom: "Paris",
      region: "Texas",
      pays: "États-Unis",
      latitude: 33.66094,
      longitude: -95.55551,
    });
    assert.equal(libelleLieu(lieux[0]), "Paris, Île-de-France, France");
  });

  it("renvoie une liste vide quand l'API n'a rien trouvé", () => {
    assert.deepEqual(transformerLieux({ generationtime_ms: 0.15 }), []);
  });

  it("transforme les prévisions", () => {
    const { actuel, jours } = transformerPrevisions(previsionsLyon);
    assert.deepEqual(actuel, {
      heure: "09:15",
      temperature: "9 °C",
      ressentie: "8 °C",
      humidite: "92 %",
      vent: "1 km/h",
      estJour: true,
      description: "Couvert",
      icone: "☁️",
    });
    assert.equal(jours.length, 7);
    assert.deepEqual(jours[0], {
      date: "2026-11-06",
      min: "7 °C",
      max: "14 °C",
      pluie: 70,
      description: "Averses faibles",
      icone: "🌦️",
    });
  });

  it("refuse une réponse qui n'a pas la forme attendue", () => {
    assert.throws(() => transformerPrevisions({ error: true }), TypeError);
    assert.throws(() => transformerPrevisions(null), TypeError);
  });
});

describe("formatage", () => {
  it("décrit les codes WMO, même inconnus", () => {
    assert.deepEqual(decrireCode(0), {
      description: "Ciel dégagé",
      icone: "☀️",
    });
    assert.equal(decrireCode(1234).description, "Conditions inconnues");
  });

  it("arrondit les températures sans afficher « -0 »", () => {
    assert.equal(formaterTemperature(-0.4), "0 °C");
    assert.equal(formaterTemperature(-2.6), "-3 °C");
  });

  it("formate une date AAAA-MM-JJ sans décalage de fuseau", () => {
    assert.equal(formaterJour("2026-11-06"), "vendredi 6 novembre");
  });
});

describe("accès réseau (fetch simulé)", () => {
  it("enchaîne requête et transformation", async () => {
    const { fetch, appels } = fauxFetch(geocodageParis);
    const lieux = await chercherLieux("Paris", { fetch });
    assert.equal(lieux[0].pays, "France");
    assert.match(appels[0].url, /name=Paris/);
    assert.ok(appels[0].options.signal instanceof AbortSignal);
  });

  it("transforme une erreur HTTP en ErreurMeteo avec la raison donnée par l'API", async () => {
    const { fetch } = fauxFetch(
      { error: true, reason: "Latitude must be in range of -90 to 90°." },
      { status: 400 },
    );
    await assert.rejects(
      obtenirPrevisions({ latitude: 200, longitude: 0 }, { fetch }),
      {
        name: "ErreurMeteo",
        message:
          "Le service météo a répondu 400 : Latitude must be in range of -90 to 90°.",
      },
    );
  });

  it("gère une erreur HTTP sans corps JSON", async () => {
    const { fetch } = fauxFetch("<h1>Bad Gateway</h1>", { status: 502 });
    await assert.rejects(obtenirJson("https://exemple.test", { fetch }), {
      message: "Le service météo a répondu 502.",
    });
  });

  it("distingue les erreurs réseau et les réponses illisibles", async () => {
    const reseauKo = async () => {
      throw new TypeError("fetch failed");
    };
    await assert.rejects(
      obtenirJson("https://exemple.test", { fetch: reseauKo }),
      /Connexion impossible/,
    );
    const { fetch } = fauxFetch("pas du json");
    await assert.rejects(
      obtenirJson("https://exemple.test", { fetch }),
      ErreurMeteo,
    );
  });

  it("abandonne après le délai", async () => {
    await assert.rejects(
      obtenirJson("https://exemple.test", { fetch: fetchBloque, delai: 20 }),
      /trop de temps/,
    );
  });

  it("laisse passer une annulation volontaire (AbortError)", async () => {
    const controleur = new AbortController();
    const promesse = obtenirJson("https://exemple.test", {
      fetch: fetchBloque,
      signal: controleur.signal,
    });
    controleur.abort();
    await assert.rejects(promesse, { name: "AbortError" });
  });
});

describe("derniereSeulement", () => {
  it("annule l'appel précédent quand un nouveau commence", async () => {
    const charger = derniereSeulement((signal, ville) =>
      obtenirJson(`https://exemple.test/${ville}`, {
        signal,
        // La première requête ne répond jamais ; la seconde répond tout de suite.
        fetch: ville === "Lyon" ? fetchBloque : fauxFetch({ ville }).fetch,
      }),
    );
    const premiere = charger("Lyon");
    const seconde = charger("Lille");
    await assert.rejects(premiere, { name: "AbortError" });
    assert.deepEqual(await seconde, { ville: "Lille" });
  });
});
