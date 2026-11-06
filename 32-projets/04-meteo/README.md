# Projet 4 — Application météo (solution)

Solution du [projet 4 du chapitre 32](../README.md#projet-4--application-météo). Elle utilise l'API gratuite [Open-Meteo](https://open-meteo.com/), sans clé : géocodage (`geocoding-api.open-meteo.com/v1/search`) puis prévisions (`api.open-meteo.com/v1/forecast`). Aucune dépendance.

## Lancer

```bash
cd 32-projets/04-meteo
npm start          # puis ouvrez http://localhost:8081/
npm test           # tests sans réseau : réponses enregistrées + fetch simulé
npm run check      # vérification de la syntaxe des modules (node --check)
```

L'usage gratuit d'Open-Meteo est réservé aux projets non commerciaux, avec des quotas par adresse IP (10 000 appels par jour au moment de la rédaction, en novembre 2026) ; les données sont sous licence CC BY 4.0, d'où le crédit en bas de page.

## Structure

```text
04-meteo/
├── index.html            formulaire, zone de statut, résultat, <template> d'un jour
├── style.css
├── src/meteo.js          pur : URL, transformation des réponses, codes WMO, formatage
├── src/api.js            réseau : obtenirJson (erreurs, délai), chercherLieux, obtenirPrevisions, derniereSeulement
├── src/main.js           interface : états chargement / erreur / résultat, homonymes
└── test/
    ├── meteo.test.js
    └── donnees/          réponses réelles d'Open-Meteo enregistrées (Paris, Lyon)
```

## Points à remarquer

- **Trois familles d'erreurs** : réseau (`fetch` rejette), HTTP (`response.ok` est faux : `fetch` ne rejette pas sur un 400 ou un 500), contenu (JSON illisible ou de forme inattendue). Chacune donne un message compréhensible.
- **Annulation** : `derniereSeulement` annule la requête précédente avec un `AbortController` ; une réponse lente ne peut plus écraser une recherche plus récente. Les `AbortError` sont ignorées sans message.
- **Délai** : `AbortSignal.timeout` combiné au signal d'annulation avec `AbortSignal.any`.
- **Tests sans réseau** : `fetch` est injectable ; les tests utilisent de vraies réponses enregistrées, importées avec `with { type: "json" }` (ES2025).
- Une date `AAAA-MM-JJ` est interprétée comme minuit UTC : `formaterJour` formate donc avec `timeZone: "UTC"` pour ne jamais afficher la veille.
