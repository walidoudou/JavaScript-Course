# Projet 6 — API REST de tâches (solution)

Solution du [projet 6 du chapitre 32](../README.md#projet-6--api-rest-de-tâches). Uniquement `node:http` et `node:fs/promises` : aucune dépendance, Node.js 22 ou plus (testé avec Node 24).

## Lancer

```bash
cd 32-projets/06-api-rest
npm start                      # http://localhost:3000/taches, données dans donnees/taches.json
npm run dev                    # idem, redémarre à chaque modification (node --watch)
PORT=4000 FICHIER_DONNEES=/tmp/taches.json node serveur.js
npm test                       # tests d'intégration (node --test)
```

Dans un autre terminal :

```bash
curl -i -X POST http://localhost:3000/taches -H "Content-Type: application/json" -d '{"titre":"Lire le chapitre 22"}'
curl http://localhost:3000/taches
curl -X PATCH http://localhost:3000/taches/<id> -H "Content-Type: application/json" -d '{"terminee":true}'
curl "http://localhost:3000/taches?terminee=true"
curl -i -X DELETE http://localhost:3000/taches/<id>
```

## Routes

| Méthode et route      | Corps                        | Succès                    | Erreurs possibles   |
| --------------------- | ---------------------------- | ------------------------- | ------------------- |
| `GET /taches`         | —                            | 200 + tableau             | 400 (filtre)        |
| `POST /taches`        | `{ "titre", "terminee"? }`   | 201 + tâche + `Location`  | 400, 413, 415, 422  |
| `GET /taches/:id`     | —                            | 200 + tâche               | 404                 |
| `PATCH /taches/:id`   | `{ "titre"?, "terminee"? }`  | 200 + tâche               | 400, 404, 413, 415, 422 |
| `DELETE /taches/:id`  | —                            | 204 (sans corps)          | 404                 |

Toute autre méthode sur ces routes donne `405` avec l'en-tête `Allow` ; toute autre URL donne `404`. Les erreurs ont toujours la forme `{ "erreur": "…", "details"?: [{ "champ", "message" }] }`.

## Structure

```text
06-api-rest/
├── serveur.js          point d'entrée : configuration, journal des requêtes, arrêt propre
├── src/app.js          routage, lecture du corps JSON, réponses, gestion centrale des erreurs
├── src/validation.js   validation des données reçues
├── src/depot.js        persistance dans un fichier JSON (écritures en file d'attente, atomiques)
└── test/api.test.js    tests d'intégration : vrai serveur sur un port libre, fetch, dossier temporaire
```

## Points à remarquer

- Les actions lèvent des `ErreurHttp(statut, message)` ; un seul `catch` les transforme en réponses JSON. Une erreur imprévue donne un `500` neutre, et le détail part dans la console.
- Le corps de la requête est limité à 100 Kio (`413`) : sans limite, un client pourrait saturer la mémoire du serveur.
- Le dépôt écrit dans un fichier temporaire puis le renomme (opération atomique), et met les écritures en file d'attente : 25 créations simultanées donnent bien 25 tâches.
- Un fichier de données corrompu empêche le démarrage au lieu d'être écrasé.
- Les tests démarrent le serveur avec `listen(0)` (port libre choisi par le système) et un fichier dans un dossier temporaire : ils ne touchent jamais aux vraies données.
