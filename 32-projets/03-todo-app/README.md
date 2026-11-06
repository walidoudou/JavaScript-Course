# Projet 3 — Liste de tâches (solution)

Solution du [projet 3 du chapitre 32](../README.md#projet-3--liste-de-tâches-dans-le-navigateur). Aucune dépendance, aucun outil de build : du HTML, du CSS et des modules ES.

## Lancer

Un navigateur refuse de charger des modules ES depuis une page ouverte en `file://` : il faut un petit serveur local. Le dépôt en fournit un, sans dépendance (`../serveur-statique.js`).

```bash
cd 32-projets/03-todo-app
npm start          # puis ouvrez http://localhost:8080/
npm test           # tests de la logique et du stockage (node --test)
npm run check      # vérification de la syntaxe des modules (node --check)
```

Toute autre solution de serveur statique convient aussi (extension Live Server de VS Code, `python3 -m http.server`…).

## Structure

```text
03-todo-app/
├── index.html          structure de la page + <template> d'une tâche
├── style.css           mise en forme (thème clair/sombre automatique)
├── src/taches.js       logique pure : créer, basculer, supprimer, filtrer, compter
├── src/stockage.js     lecture/écriture JSON dans localStorage (stockage injectable)
├── src/main.js         DOM et événements : formulaire, délégation, filtres (#/actives), onglets synchronisés
└── test/taches.test.js tests node:test (avec un faux localStorage)
```

## Points à remarquer

- `taches.js` ne connaît ni le DOM ni `localStorage` : il se teste dans Node, sans navigateur.
- Chaque action produit un **nouveau** tableau ; `main.js` enregistre puis réaffiche tout. Simple et suffisant pour quelques centaines de tâches.
- Les titres sont insérés avec `textContent` : un titre comme `<img src=x onerror=alert(1)>` s'affiche tel quel au lieu de s'exécuter.
- Deux écouteurs sur la liste (`change` et `click`) gèrent toutes les tâches grâce à la délégation d'événements.
- Les filtres sont des liens `#/actives`, `#/terminees` : l'URL est partageable et le bouton « Précédent » fonctionne.
- L'événement `storage` synchronise les onglets ouverts sur la même page.
