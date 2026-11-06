#!/usr/bin/env node
// Point d'entrée : démarre l'API. Configuration par variables d'environnement :
//   PORT=4000 node serveur.js
//   FICHIER_DONNEES=/chemin/taches.json node serveur.js
import path from "node:path";
import { creerServeur } from "./src/app.js";

const port = Number(process.env.PORT ?? 3000);
const fichier =
  process.env.FICHIER_DONNEES ??
  path.join(import.meta.dirname, "donnees", "taches.json");

const serveur = await creerServeur({ fichier });

// Journal : une ligne par requête, écrite quand la réponse est partie.
serveur.on("request", (req, res) => {
  const debut = performance.now();
  res.on("finish", () => {
    const duree = (performance.now() - debut).toFixed(1);
    console.log(`${req.method} ${req.url} → ${res.statusCode} (${duree} ms)`);
  });
});

serveur.listen(port, () => {
  console.log(
    `API de tâches sur http://localhost:${port}/taches (données : ${fichier})`,
  );
});

// Arrêt propre (Ctrl+C, docker stop…) : on termine les requêtes en cours avant de quitter.
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    console.log("\nArrêt du serveur…");
    serveur.close(() => process.exit(0));
  });
}
