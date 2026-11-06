// API REST de tâches en node:http pur : routage, JSON, codes de statut, erreurs.
import { createServer } from "node:http";
import { ouvrirDepot } from "./depot.js";
import { validerTache } from "./validation.js";

const TAILLE_MAX = 100 * 1024; // 100 Kio : largement assez pour une tâche

/** Erreur qui connaît son code HTTP : le gestionnaire central la transforme en réponse JSON. */
export class ErreurHttp extends Error {
  constructor(statut, message, details) {
    super(message);
    this.statut = statut;
    this.details = details;
  }
}

function envoyerJson(res, statut, donnees, entetes = {}) {
  const corps = JSON.stringify(donnees);
  res.writeHead(statut, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(corps), // en octets, pas en caractères
    ...entetes,
  });
  res.end(corps);
}

/** Lit et analyse le corps JSON d'une requête, avec une taille maximale. */
async function lireJson(req) {
  if (!req.headers["content-type"]?.startsWith("application/json")) {
    throw new ErreurHttp(
      415,
      "Le corps doit être du JSON (en-tête Content-Type: application/json).",
    );
  }
  const morceaux = [];
  let taille = 0;
  for await (const morceau of req) {
    taille += morceau.length;
    if (taille > TAILLE_MAX)
      throw new ErreurHttp(
        413,
        `Corps trop volumineux (${TAILLE_MAX} octets maximum).`,
      );
    morceaux.push(morceau);
  }
  try {
    return JSON.parse(Buffer.concat(morceaux).toString("utf8"));
  } catch {
    throw new ErreurHttp(400, "JSON invalide.");
  }
}

function valider(corps, options) {
  const { valeur, erreurs } = validerTache(corps, options);
  if (erreurs.length > 0)
    throw new ErreurHttp(422, "Données invalides.", erreurs);
  return valeur;
}

function trouverOu404(depot, id) {
  const tache = depot.trouver(id);
  if (!tache) throw new ErreurHttp(404, `Tâche ${id} introuvable.`);
  return tache;
}

// --- Actions ----------------------------------------------------------------

function lister({ res, url, depot }) {
  const filtre = url.searchParams.get("terminee"); // GET /taches?terminee=true
  if (filtre !== null && filtre !== "true" && filtre !== "false") {
    throw new ErreurHttp(400, "Le paramètre terminee vaut true ou false.");
  }
  const taches = depot.lister();
  envoyerJson(
    res,
    200,
    filtre === null
      ? taches
      : taches.filter((t) => String(t.terminee) === filtre),
  );
}

async function creer({ req, res, depot }) {
  const tache = await depot.ajouter(valider(await lireJson(req)));
  envoyerJson(res, 201, tache, { Location: `/taches/${tache.id}` });
}

function lire({ res, id, depot }) {
  envoyerJson(res, 200, trouverOu404(depot, id));
}

async function modifier({ req, res, id, depot }) {
  trouverOu404(depot, id); // 404 avant de lire le corps : inutile de valider pour une tâche absente
  const changements = valider(await lireJson(req), { partiel: true });
  envoyerJson(res, 200, await depot.modifier(id, changements));
}

async function supprimer({ res, id, depot }) {
  if (!(await depot.supprimer(id)))
    throw new ErreurHttp(404, `Tâche ${id} introuvable.`);
  res.writeHead(204).end(); // 204 No Content : succès, sans corps
}

// Table de routage : un motif d'URL → les méthodes acceptées.
const ROUTES = [
  { motif: /^\/taches\/?$/, methodes: { GET: lister, POST: creer } },
  {
    motif: /^\/taches\/([\w-]+)$/,
    methodes: { GET: lire, PATCH: modifier, DELETE: supprimer },
  },
];

/** Gestionnaire de requêtes (req, res) relié à un dépôt. */
export function creerGestionnaire(depot) {
  return async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost"); // req.url ne contient que le chemin et la requête
      const route = ROUTES.find(({ motif }) => motif.test(url.pathname));
      if (!route) throw new ErreurHttp(404, "Route introuvable.");
      const action = route.methodes[req.method];
      if (!action) {
        res.setHeader("Allow", Object.keys(route.methodes).join(", "));
        throw new ErreurHttp(
          405,
          `Méthode ${req.method} non autorisée sur ${url.pathname}.`,
        );
      }
      const [, id] = url.pathname.match(route.motif);
      await action({ req, res, url, id, depot });
    } catch (erreur) {
      if (res.headersSent) return res.destroy(); // trop tard pour une réponse d'erreur propre
      if (erreur instanceof ErreurHttp) {
        // 413 : on n'a pas lu tout le corps, la connexion ne peut pas être réutilisée.
        const entetes = erreur.statut === 413 ? { Connection: "close" } : {};
        envoyerJson(
          res,
          erreur.statut,
          { erreur: erreur.message, details: erreur.details },
          entetes,
        );
      } else {
        console.error(erreur); // bogue : détail pour le développeur, message neutre pour le client
        envoyerJson(res, 500, { erreur: "Erreur interne du serveur." });
      }
    }
  };
}

/** Crée le serveur HTTP (sans le démarrer) avec un dépôt stocké dans `fichier`. */
export async function creerServeur({ fichier }) {
  const depot = await ouvrirDepot(fichier);
  return createServer(creerGestionnaire(depot));
}
