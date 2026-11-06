#!/usr/bin/env node
// Petit serveur de fichiers statiques pour tester les projets web en local :
// un navigateur refuse de charger des modules ES depuis une page ouverte en file://.
// Usage : node serveur-statique.js [dossier] [port]   (défauts : dossier courant, 8080)
// Le fonctionnement de node:http est expliqué dans le projet 6 et au chapitre 27.
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const racine = path.resolve(process.argv[2] ?? ".");
const port = Number(process.argv[3] ?? process.env.PORT ?? 8080);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function repondre(res, statut, texte) {
  res.writeHead(statut, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(texte);
}

const serveur = createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, "http://localhost");
    let fichier = path.join(racine, decodeURIComponent(pathname));
    // path.join résout les « .. » : on refuse tout chemin qui sortirait du dossier servi.
    if (fichier !== racine && !fichier.startsWith(racine + path.sep))
      return repondre(res, 403, "Interdit");
    if ((await stat(fichier)).isDirectory())
      fichier = path.join(fichier, "index.html");
    const contenu = await readFile(fichier);
    res.writeHead(200, {
      "Content-Type":
        TYPES[path.extname(fichier)] ?? "application/octet-stream",
      "Cache-Control": "no-store", // en développement : toujours la dernière version
    });
    res.end(contenu);
  } catch (erreur) {
    if (erreur.code === "ENOENT" || erreur.code === "ENOTDIR")
      repondre(res, 404, "Introuvable");
    else if (erreur instanceof URIError) repondre(res, 400, "Requête invalide");
    else repondre(res, 500, "Erreur interne");
  }
});

// 127.0.0.1 : le serveur n'est accessible que depuis cette machine.
serveur.listen(port, "127.0.0.1", () => {
  console.log(
    `Fichiers de ${racine} servis sur http://localhost:${port}/ (Ctrl+C pour arrêter)`,
  );
});
