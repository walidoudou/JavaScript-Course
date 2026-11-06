# Cours complet de JavaScript

Un parcours en français pour apprendre le JavaScript moderne, des premières lignes de code jusqu'aux applications complètes, dans le navigateur comme avec Node.js.

- **32 chapitres** progressifs, chacun avec objectifs, exemples commentés, pièges courants, résumé et exercices corrigés.
- **À jour** : ECMAScript 2026, Node.js 26 LTS, API web actuelles (état de novembre 2026). Les nouveautés indiquent leur version et leur disponibilité.
- **Des exemples vérifiés** : chaque bloc de code exécutable est lancé automatiquement avec Node.js, et les résultats affichés en commentaire correspondent à l'exécution réelle.
- **6 projets guidés** avec solutions complètes et testées pour mettre tout cela en pratique.

## Démarrage rapide

1. Installez la version LTS de [Node.js](https://nodejs.org/fr) (26 au moment de cette mise à jour) et un éditeur comme [Visual Studio Code](https://code.visualstudio.com/).
2. Récupérez le cours :

   ```bash
   git clone https://github.com/walidoudou/JavaScript-Course.git
   ```

3. Ouvrez le [chapitre 01 — Introduction](01-introduction/README.md) et suivez le guide : il explique comment exécuter les exemples dans le navigateur ou avec Node.

## Sommaire

### Partie 1 — Les bases

| N° | Chapitre | Au programme | Durée |
| -- | -------- | ------------ | ----- |
| 01 | [Introduction et environnement](01-introduction/README.md) | ECMAScript et ses versions, installer Node.js, premier programme, la console, mode strict | ~2 h |
| 02 | [Variables](02-variables/README.md) | `let`, `const`, `var`, portées, TDZ, hoisting, nommage | ~2 h 30 |
| 03 | [Types et opérateurs](03-types-et-operateurs/README.md) | Types primitifs, `typeof`, conversions, égalités, opérateurs, précédence | ~3 h |
| 04 | [Conditions](04-conditions/README.md) | `if`, `switch`, ternaire, truthy/falsy, `&&`, `\|\|`, `??`, `?.`, clauses de garde | ~2 h 30 |
| 05 | [Boucles](05-boucles/README.md) | `for`, `while`, `for…of`, `for…in`, `break`/`continue`, choisir la bonne boucle | ~2 h 30 |
| 06 | [Fonctions](06-fonctions/README.md) | Déclarations, fléchées, paramètres, closures, `this`, ordre supérieur, composition | ~4 h |

### Partie 2 — Données et bibliothèque standard

| N° | Chapitre | Au programme | Durée |
| -- | -------- | ------------ | ----- |
| 07 | [Chaînes de caractères](07-chaines/README.md) | Méthodes, Unicode et émojis, template literals, comparaison, recettes | ~3 h |
| 08 | [Nombres et Math](08-nombres-et-math/README.md) | Virgule flottante, parsing, `Intl.NumberFormat`, `Math`, aléatoire, `BigInt`, argent | ~3 h |
| 09 | [Tableaux](09-tableaux/README.md) | Méthodes mutantes ou non, `map`/`filter`/`reduce`, tri, `Object.groupBy`, recettes | ~4 h |
| 10 | [Objets](10-objets/README.md) | Propriétés, copies et `structuredClone`, immutabilité, descripteurs, prototypes, `Proxy` | ~4 h |
| 11 | [Syntaxe moderne](11-syntaxe-moderne/README.md) | Déstructuration, spread/rest, tagged templates, nouveautés ES2015 → ES2026 | ~3 h |
| 12 | [Collections : Map, Set et Weak*](12-collections/README.md) | `Map`, `Set` et ses opérations ensemblistes, `WeakMap`, `WeakRef` | ~2 h 30 |
| 13 | [Itérateurs et générateurs](13-iterateurs-generateurs/README.md) | Protocole d'itération, `function*`, itération asynchrone, Iterator helpers | ~3 h |
| 14 | [Expressions régulières](14-regex/README.md) | Syntaxe, drapeaux, groupes nommés, `matchAll`, `RegExp.escape`, recettes testées | ~4 h |
| 15 | [Dates et heures](15-dates/README.md) | `Date` et ses pièges, `Intl.DateTimeFormat`, fuseaux horaires, Temporal | ~3 h |

### Partie 3 — Programmation orientée objet et robustesse

| N° | Chapitre | Au programme | Durée |
| -- | -------- | ------------ | ----- |
| 16 | [Classes](16-classes/README.md) | Champs privés, `static`, héritage, sous le capot, composition, patterns | ~3 h |
| 17 | [Erreurs](17-erreurs/README.md) | `try/catch`, erreurs personnalisées, `cause`, erreurs asynchrones, débogage, `using` | ~3 h |

### Partie 4 — Programmation asynchrone

| N° | Chapitre | Au programme | Durée |
| -- | -------- | ------------ | ----- |
| 18 | [Comprendre l'asynchrone](18-asynchrone/README.md) | Boucle d'événements, tâches et microtâches, callbacks, ordre d'exécution | ~3 h |
| 19 | [Promesses](19-promises/README.md) | `then`/`catch`, chaînage, `Promise.all`/`allSettled`/`race`/`any`, `withResolvers` | ~3 h |
| 20 | [Async/await](20-async-await/README.md) | Séquentiel ou parallèle, annulation avec `AbortController`, retry, concurrence limitée | ~4 h |
| 21 | [Timers](21-timers/README.md) | `setTimeout`, `setInterval`, `requestAnimationFrame`, debounce et throttle | ~3 h |
| 22 | [Requêtes HTTP avec fetch](22-fetch-http/README.md) | HTTP, `fetch`, erreurs, timeouts, streams, CORS, authentification | ~4 h |

### Partie 5 — Le navigateur

| N° | Chapitre | Au programme | Durée |
| -- | -------- | ------------ | ----- |
| 23 | [Le DOM](23-dom/README.md) | Sélectionner, créer et modifier des éléments, XSS, observateurs, accessibilité | ~4 h |
| 24 | [Événements et formulaires](24-evenements/README.md) | Propagation, délégation, clavier et pointeur, validation, `CustomEvent` | ~4 h |
| 25 | [JSON et stockage](25-json-et-stockage/README.md) | `JSON.stringify`/`parse` en détail, `localStorage`, cookies, IndexedDB | ~4 h |

### Partie 6 — Organiser, outiller, tester

| N° | Chapitre | Au programme | Durée |
| -- | -------- | ------------ | ----- |
| 26 | [Modules](26-modules/README.md) | ESM dans le navigateur et dans Node, `import()`, import maps, bundlers | ~3 h |
| 27 | [Node.js](27-nodejs/README.md) | `process`, fichiers, streams, serveur HTTP, construire une CLI | ~4 h |
| 28 | [Outillage](28-outillage/README.md) | npm et `package.json`, Vite, ESLint, Prettier, TypeScript, intégration continue | ~3 h |
| 29 | [Tests](29-tests/README.md) | `node:test`, Vitest, mocks, tests asynchrones, TDD | ~3 h 30 |
| 30 | [Commentaires et JSDoc](30-commentaires-jsdoc/README.md) | Bien commenter, documenter et typer son code avec JSDoc | ~2 h 30 |

### Partie 7 — Mettre en pratique

| N° | Chapitre | Au programme | Durée |
| -- | -------- | ------------ | ----- |
| 31 | [Aide-mémoire](31-aide-memoire/README.md) | Les API essentielles en un coup d'œil, et « ancienne façon → façon moderne » | — |
| 32 | [Projets guidés](32-projets/README.md) | Six projets complets, du générateur de mots de passe à l'API REST | ~20 h |

## Parcours conseillés

- **Vous débutez en programmation** : suivez les chapitres dans l'ordre. Faites tous les exercices des parties 1 et 2 avant d'avancer, puis les projets 1 et 2.
- **Vous connaissez déjà un autre langage** : survolez 01 à 06 (lisez les sections « Pièges courants »), puis concentrez-vous sur 03, 06, 10, 11 et toute la partie 4, qui font la spécificité de JavaScript.
- **Objectif développement web (front-end)** : parties 1 à 4, puis 23 → 26, 28 et 29. Projets 3 et 4.
- **Objectif Node.js (back-end)** : parties 1 à 4, puis 25 (JSON), 26 → 29. Projets 1, 5 et 6.

Comptez environ 100 heures pour les chapitres, exercices compris, et une vingtaine d'heures pour les projets. Chaque chapitre indique en tête son niveau, sa durée indicative et ses prérequis.

## Comment travailler avec ce cours

1. **Tapez le code** plutôt que de le copier : c'est en écrivant qu'on retient.
2. **Modifiez les exemples** : changez une valeur, cassez quelque chose, observez le message d'erreur.
3. **Faites les exercices** avant d'ouvrir les solutions. Bloqué ? Relisez la section concernée, puis regardez l'indice ou la solution.
4. **Construisez les projets** : ils relient les notions entre elles, comme dans un vrai développement.
5. **Gardez [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript) ouvert** : c'est la référence. Chaque chapitre y renvoie.

### Conventions

- Les résultats sont donnés en commentaire : `console.log(1 + 2); // 3`.
- `// ❌` signale ce qu'il ne faut pas faire, `// ✅` la bonne approche.
- Les fonctionnalités récentes indiquent leur version (`ES2023`, `ES2026`…) et leur disponibilité.
- Sauf mention contraire, chaque bloc de code est autonome : il peut être collé tel quel dans un fichier `.mjs` et exécuté avec `node`.

## Vérifier les exemples

Le dépôt contient un script qui exécute tous les exemples du cours :

```bash
node scripts/verifier-exemples.mjs
```

## Contribuer

Une erreur, une explication peu claire, une idée d'exercice ? Les contributions sont les bienvenues : ouvrez une issue ou une pull request. Le guide [CONTRIBUTING.md](CONTRIBUTING.md) décrit la structure d'un chapitre et les conventions à respecter.

## Ressources

- [MDN Web Docs](https://developer.mozilla.org/fr/docs/Web/JavaScript) : la documentation de référence, en grande partie traduite en français.
- [javascript.info](https://fr.javascript.info/) : un tutoriel moderne et détaillé.
- [Spécification ECMAScript](https://tc39.es/ecma262/) et [propositions TC39](https://github.com/tc39/proposals) : pour savoir ce qui arrive dans le langage.
- [Documentation Node.js](https://nodejs.org/docs/latest/api/) : la référence de toutes les API de Node.
- [Can I use](https://caniuse.com/) et [Baseline](https://web.dev/baseline) : la compatibilité des fonctionnalités dans les navigateurs.

## Licence

Ce cours est distribué sous une licence inspirée de la licence MIT, adaptée au matériel pédagogique : libre pour apprendre, enseigner et partager, sans usage commercial sans autorisation. Voir [LICENSE.md](LICENSE.md).

---

**Dernière mise à jour** : novembre 2026 · **Version** : 2.0.0
