# Projet 2 — Carnet de notes (solution)

Solution du [projet 2 du chapitre 32](../README.md#projet-2--carnet-de-notes). Aucune dépendance : Node.js 22 ou plus (testé avec Node 24).

## Lancer

```bash
cd 32-projets/02-carnet-de-notes
node index.js     # classement, statistiques par matière, élèves par mention
npm test          # ou : node --test
```

## Structure

```text
02-carnet-de-notes/
├── donnees.js            classe d'exemple : élèves, notes par matière, coefficients
├── index.js              rapport dans le terminal (console.table, Intl.NumberFormat)
├── src/statistiques.js   moyenne, moyenne pondérée, médiane, écart type, résumé (génériques)
├── src/carnet.js         validation, bulletin, mention, classement, regroupements, majors
└── test/carnet.test.js   tests node:test
```

## Points à remarquer

- Toutes les fonctions sont **pures** : elles ne modifient pas leurs entrées (`toSorted`, spread) et ne font aucun affichage. Seul `index.js` touche à la console.
- Une liste vide donne `null` (« pas de note »), jamais `NaN` ni `0`, ce qui évite d'afficher une fausse moyenne.
- On garde la précision complète dans les calculs et on n'arrondit qu'à l'affichage avec `Intl.NumberFormat("fr-FR")`.
- Le classement gère les ex aequo (1, 2, 2, 4) et départage l'ordre d'affichage avec `localeCompare(…, "fr")`.
