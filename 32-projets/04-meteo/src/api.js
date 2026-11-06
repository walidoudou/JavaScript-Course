// Accès réseau : fetch + gestion d'erreurs + annulation.
// fetch est injectable ({ fetch }) pour tester sans réseau.
import {
  transformerLieux,
  transformerPrevisions,
  urlGeocodage,
  urlPrevisions,
} from "./meteo.js";

/** Erreur « présentable » : son message peut être montré tel quel à l'utilisateur. */
export class ErreurMeteo extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "ErreurMeteo";
  }
}

/**
 * GET JSON avec trois familles d'erreurs bien distinctes :
 * réseau (fetch rejette), HTTP (fetch résout avec un statut ≥ 400), contenu (JSON illisible).
 * Une annulation volontaire (AbortError) est relancée telle quelle.
 */
export async function obtenirJson(
  url,
  { signal, delai = 10_000, fetch = globalThis.fetch } = {},
) {
  const minuteur = AbortSignal.timeout(delai);
  // AbortSignal.any : la requête s'arrête au premier des deux signaux (annulation ou délai).
  const signalFinal = signal ? AbortSignal.any([signal, minuteur]) : minuteur;

  let reponse;
  try {
    reponse = await fetch(url, {
      signal: signalFinal,
      headers: { Accept: "application/json" },
    });
  } catch (erreur) {
    if (erreur.name === "AbortError") throw erreur;
    if (erreur.name === "TimeoutError") {
      throw new ErreurMeteo("Le service météo met trop de temps à répondre.", {
        cause: erreur,
      });
    }
    throw new ErreurMeteo(
      "Connexion impossible. Vérifiez votre accès à Internet.",
      { cause: erreur },
    );
  }

  if (!reponse.ok) {
    // Open-Meteo détaille ses erreurs : { "error": true, "reason": "…" }
    const raison = await reponse.json().then(
      (corps) => corps?.reason,
      () => undefined,
    );
    throw new ErreurMeteo(
      `Le service météo a répondu ${reponse.status}${raison ? ` : ${raison}` : "."}`,
    );
  }

  try {
    return await reponse.json();
  } catch (erreur) {
    if (erreur.name === "AbortError") throw erreur;
    throw new ErreurMeteo("Réponse illisible du service météo.", {
      cause: erreur,
    });
  }
}

export async function chercherLieux(nom, options) {
  return transformerLieux(await obtenirJson(urlGeocodage(nom), options));
}

export async function obtenirPrevisions(lieu, options) {
  return transformerPrevisions(await obtenirJson(urlPrevisions(lieu), options));
}

/**
 * Enveloppe une fonction asynchrone qui reçoit un AbortSignal en premier argument :
 * chaque nouvel appel annule le précédent. Ainsi, si l'utilisateur lance deux recherches
 * rapprochées, la réponse lente de la première ne peut pas écraser celle de la seconde.
 */
export function derniereSeulement(fonction) {
  let controleur;
  return (...args) => {
    controleur?.abort();
    controleur = new AbortController();
    return fonction(controleur.signal, ...args);
  };
}
