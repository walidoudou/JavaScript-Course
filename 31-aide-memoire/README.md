# 31 — Aide-mémoire

> **Niveau** : Tous niveaux · **Durée** : à consulter au besoin · **Prérequis** : aucun (chaque entrée renvoie à son chapitre)

Cette fiche rassemble, sur une seule page, les API et les syntaxes dont on a besoin tous les jours. Elle **ne réexplique pas** : chaque tableau renvoie au chapitre où la notion est détaillée, avec ses pièges et ses exercices. Gardez-la ouverte pendant que vous codez, et utilisez la section [Ancienne façon → façon moderne](#ancienne-façon--façon-moderne) pour dépoussiérer du code existant.

## Objectifs

- Retrouver en quelques secondes la bonne méthode et son comportement exact (valeur renvoyée, mutation ou non)
- Distinguer d'un coup d'œil les méthodes de tableau mutantes et non mutantes
- Identifier la version moderne d'un idiome ancien et savoir depuis quand elle est disponible
- Savoir quel chapitre relire pour approfondir

## Sommaire

- [Comment lire cette fiche](#comment-lire-cette-fiche)
- [Syntaxe essentielle](#syntaxe-essentielle)
- [Types et conversions](#types-et-conversions)
- [Chaînes](#chaînes)
- [Nombres et Math](#nombres-et-math)
- [Tableaux](#tableaux)
- [Objets](#objets)
- [Map et Set](#map-et-set)
- [Itérateurs](#itérateurs)
- [Expressions régulières](#expressions-régulières)
- [Dates et Intl](#dates-et-intl)
- [Classes](#classes)
- [Erreurs](#erreurs)
- [Promesses et async/await](#promesses-et-asyncawait)
- [Timers](#timers)
- [fetch et URL](#fetch-et-url)
- [DOM](#dom)
- [Événements](#événements)
- [JSON et stockage](#json-et-stockage)
- [Modules](#modules)
- [Node.js](#nodejs)
- [console](#console)
- [Ancienne façon → façon moderne](#ancienne-façon--façon-moderne)
- [Pièges courants](#pièges-courants)
- [Bonnes pratiques](#bonnes-pratiques)
- [Résumé](#résumé)
- [Exercices](#exercices)
- [Pour aller plus loin](#pour-aller-plus-loin)

## Comment lire cette fiche

- `expression` → `résultat` : la valeur exacte produite par l'expression (vérifiée avec Node.js 24).
- **(ES2023)** : édition d'ECMAScript qui a introduit la fonctionnalité. Sans mention : disponible depuis ES2015 ou avant.
- **⚠️ mutant** : la méthode modifie l'objet sur lequel elle est appelée.
- Le numéro de chapitre (**→ 09**) indique où approfondir.
- Disponibilité des API récentes : vérifiez toujours [MDN](https://developer.mozilla.org/fr/) (encadré « Baseline ») ou [caniuse.com](https://caniuse.com/) avant de les utiliser dans un site public. Les mentions de disponibilité de cette page datent de novembre 2026.

## Syntaxe essentielle

Rappels détaillés : variables → [02](../02-variables/README.md), conditions → [04](../04-conditions/README.md), fonctions → [06](../06-fonctions/README.md), syntaxe moderne → [11](../11-syntaxe-moderne/README.md).

```js
// Variables : const par défaut, let si réassignation (jamais var)
const taux = 0.2;
let compteur = 0;
compteur += 1;

// Gabarits (template literals)
const nom = "Ada";
console.log(`Bonjour ${nom}, ${2 + 3} messages`); // Bonjour Ada, 5 messages

// Déstructuration, valeurs par défaut, renommage, reste
const { ville = "Paris", age: annees, ...autres } = { age: 36, langue: "fr", pays: "FR" };
const [premier, , troisieme = 0] = [10, 20];
console.log(ville, annees, autres, premier, troisieme); // Paris 36 { langue: 'fr', pays: 'FR' } 10 0

// Spread : copier, fusionner, passer des arguments
const fusion = { ...{ a: 1, b: 2 }, b: 3 };
console.log(fusion, Math.max(...[4, 9, 2])); // { a: 1, b: 3 } 9

// Chaînage optionnel et coalescence des nuls
const utilisateur = { profil: null };
console.log(utilisateur.profil?.email ?? "inconnu"); // inconnu
console.log(0 || 42, 0 ?? 42); // 42 0

// Affectations logiques (ES2021)
const options = { delai: 0 };
options.delai ||= 1000; // remplace toute valeur falsy (0 compris)
options.essais ??= 3; // ne remplace que null/undefined
console.log(options); // { delai: 1000, essais: 3 }

// Fonctions fléchées, paramètres par défaut et reste
const somme = (...nombres) => nombres.reduce((total, n) => total + n, 0);
const saluer = (qui = "vous") => `Salut ${qui}`;
console.log(somme(1, 2, 3), saluer()); // 6 Salut vous

// Séparateurs numériques (ES2021), exponentiation (ES2016)
console.log(1_000_000 + 2 ** 10); // 1001024
```

## Types et conversions

Détails → [03](../03-types-et-operateurs/README.md), [08](../08-nombres-et-math/README.md).

| Besoin | Expression | Résultat |
| --- | --- | --- |
| Type d'une valeur | `typeof "a"` → `"string"` | piège : `typeof null` → `"object"` |
| Tableau ? | `Array.isArray([1])` → `true` | `typeof []` vaut `"object"` |
| Chaîne → nombre | `Number("42.5")` → `42.5` | `Number("")` → `0`, `Number("12px")` → `NaN` |
| Chaîne → entier | `parseInt("12px", 10)` → `12` | toujours préciser la base |
| Chaîne → décimal | `parseFloat("3.14 m")` → `3.14` | |
| Nombre → chaîne | `String(42)` → `"42"` | aussi `(42).toString()` |
| Vers booléen | `Boolean("0")` → `true` | aussi `!!valeur` |
| Est `NaN` ? | `Number.isNaN(NaN)` → `true` | `NaN === NaN` → `false` |
| Est un entier ? | `Number.isInteger(5.0)` → `true` | |
| Égalité stricte | `"1" === 1` → `false` | toujours `===`, jamais `==` |
| Égalité « même valeur » | `Object.is(NaN, NaN)` → `true` | distingue aussi `0` et `-0` |

Valeurs **falsy** (toutes les autres sont truthy) : `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Attention : `"0"`, `"false"`, `[]` et `{}` sont truthy.

## Chaînes

Détails → [07](../07-chaines/README.md). Les chaînes sont **immuables** : toutes ces méthodes renvoient une nouvelle chaîne.

| Méthode | Rôle | Exemple |
| --- | --- | --- |
| `length` | nombre d'unités de code UTF-16 | `"café".length` → `4` |
| `at(i)` (ES2022) | caractère à l'index (négatif depuis la fin) | `"Bonjour".at(-1)` → `"r"` |
| `includes` | contient ? | `"JavaScript".includes("Script")` → `true` |
| `startsWith` / `endsWith` | commence / finit par ? | `"rapport.pdf".endsWith(".pdf")` → `true` |
| `indexOf` / `lastIndexOf` | position (`-1` si absent) | `"banane".indexOf("an")` → `1` |
| `slice(debut, fin)` | extraire (fin exclue, négatifs acceptés) | `"JavaScript".slice(4)` → `"Script"` |
| `toUpperCase` / `toLowerCase` | casse | `"Élan".toUpperCase()` → `"ÉLAN"` |
| `trim` / `trimStart` / `trimEnd` | retirer les blancs aux extrémités | `"  ok  ".trim()` → `"ok"` |
| `padStart` / `padEnd` | compléter jusqu'à une longueur | `"7".padStart(3, "0")` → `"007"` |
| `repeat` | répéter | `"ab".repeat(3)` → `"ababab"` |
| `replace` | remplacer la première occurrence (ou toutes avec `/g`) | `"a-b-c".replace("-", "+")` → `"a+b-c"` |
| `replaceAll` (ES2021) | remplacer toutes les occurrences | `"a-b-c".replaceAll("-", "+")` → `"a+b+c"` |
| `split` | découper en tableau | `"a,b,c".split(",")` → `["a", "b", "c"]` |
| `localeCompare` | comparer selon la langue | `"é".localeCompare("f", "fr")` → `-1` |
| `normalize` | forme Unicode canonique | `"e\u0301".normalize() === "é"` → `true` |
| `[...chaine]` | découper en points de code | `[..."😀a"].length` → `2` |
| `Intl.Segmenter` | compter les caractères visibles (graphèmes) | `[...new Intl.Segmenter("fr").segment("👍🏽!")].length` → `2` |
| `String.raw` | gabarit sans interprétation des `\` | ``String.raw`C:\dossier` `` → `"C:\\dossier"` |

## Nombres et Math

Détails → [08](../08-nombres-et-math/README.md).

| Besoin | Expression | Résultat / remarque |
| --- | --- | --- |
| Arrondir à l'entier | `Math.round(2.5)` → `3` | `Math.round(-2.5)` → `-2` |
| Partie entière inférieure / supérieure | `Math.floor(-1.5)` → `-2` | `Math.ceil(1.2)` → `2` |
| Tronquer | `Math.trunc(-1.7)` → `-1` | |
| n décimales (texte) | `(1.005).toFixed(2)` → `"1.00"` | piège des flottants : `1.005` vaut en réalité 1.00499… |
| Minimum / maximum d'un tableau | `Math.max(...[3, 8, 1])` → `8` | `Math.max()` → `-Infinity` |
| Valeur absolue, signe | `Math.abs(-4)` → `4` | `Math.sign(-4)` → `-1` |
| Puissance, racine | `2 ** 10` → `1024` | `Math.sqrt(81)` → `9` |
| Hypoténuse | `Math.hypot(3, 4)` → `5` | |
| Comparer des flottants | `0.1 + 0.2 === 0.3` → `false` | `Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON` → `true` |
| Somme exacte (ES2026) | `Math.sumPrecise([1e20, 0.1, -1e20])` vaut `0.1` | Chrome 147+, Firefox 137+, Safari 26.2+ ; pas dans Node.js 24 |
| Entier sûr maximal | `Number.MAX_SAFE_INTEGER` → `9007199254740991` | au-delà : `BigInt` |
| Grand entier | `2n ** 64n` → `18446744073709551616n` | ne se mélange pas avec `number` |
| Base 2, 16 | `(255).toString(16)` → `"ff"` | `parseInt("ff", 16)` → `255` |
| Entier aléatoire dans [min, max] | `Math.floor(Math.random() * (max - min + 1)) + min` | pour la sécurité : `crypto.getRandomValues` |
| Identifiant unique | `crypto.randomUUID()` | chaîne de 36 caractères, aléatoire |
| Prix localisé | `new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(1234.5)` → `"$1,234.50"` | en `fr-FR` : `1 234,50 €` avec espaces insécables |
| Pourcentage | `new Intl.NumberFormat("en-US", { style: "percent" }).format(0.256)` → `"26%"` | |
| Notation compacte | `new Intl.NumberFormat("en-US", { notation: "compact" }).format(1500)` → `"1.5K"` | |

## Tableaux

Détails → [09](../09-tableaux/README.md).

### Créer

| Besoin | Expression | Résultat |
| --- | --- | --- |
| Suite de nombres | `Array.from({ length: 4 }, (_, i) => i * 2)` → `[0, 2, 4, 6]` | |
| Tableau rempli | `new Array(3).fill(0)` → `[0, 0, 0]` | `fill` avec un objet partage **la même** référence |
| Depuis un itérable | `Array.from(new Set([1, 1, 2]))` → `[1, 2]` | aussi `[...iterable]` |
| Depuis un itérable asynchrone (ES2026) | `await Array.fromAsync([Promise.resolve(1), 2])` → `[1, 2]` | → [20](../20-async-await/README.md) |
| Taille | `["a", "b"].length` → `2` | |

### Méthodes non mutantes (renvoient une nouvelle valeur)

| Méthode | Rôle | Exemple |
| --- | --- | --- |
| `at(i)` (ES2022) | élément à l'index, négatif depuis la fin | `[1, 2, 3].at(-1)` → `3` |
| `map` | transformer chaque élément | `[1, 2, 3].map((n) => n * 10)` → `[10, 20, 30]` |
| `filter` | garder ceux qui passent le test | `[1, 2, 3, 4].filter((n) => n % 2 === 0)` → `[2, 4]` |
| `reduce` | réduire à une valeur | `[1, 2, 3].reduce((s, n) => s + n, 0)` → `6` |
| `find` / `findLast` (ES2023) | premier / dernier élément qui passe | `[5, 12, 8, 130].findLast((n) => n > 10)` → `130` |
| `findIndex` / `findLastIndex` (ES2023) | son index (`-1` si aucun) | `[5, 12, 8].findIndex((n) => n > 10)` → `1` |
| `includes` | contient ? (gère `NaN`) | `[1, NaN].includes(NaN)` → `true` |
| `indexOf` | index d'une valeur (`-1` si absente) | `["a", "b"].indexOf("b")` → `1` |
| `some` / `every` | au moins un / tous ? | `[1, 2, 3].every((n) => n > 0)` → `true` |
| `slice(debut, fin)` | extraire (fin exclue) | `[1, 2, 3, 4].slice(1, 3)` → `[2, 3]` |
| `concat` | concaténer | `[1].concat([2, 3])` → `[1, 2, 3]` |
| `flat(n)` (ES2019) | aplatir | `[1, [2, [3]]].flat(Infinity)` → `[1, 2, 3]` |
| `flatMap` (ES2019) | `map` puis `flat(1)` | `["a b", "c"].flatMap((s) => s.split(" "))` → `["a", "b", "c"]` |
| `join` | assembler en chaîne | `[1, 2, 3].join(" - ")` → `"1 - 2 - 3"` |
| `toSorted` (ES2023) | copie triée | `[3, 1, 2].toSorted()` → `[1, 2, 3]` |
| `toReversed` (ES2023) | copie inversée | `[1, 2, 3].toReversed()` → `[3, 2, 1]` |
| `toSpliced` (ES2023) | copie avec suppression/insertion | `[1, 2, 3].toSpliced(1, 1, "x")` → `[1, "x", 3]` |
| `with(i, v)` (ES2023) | copie avec un élément remplacé | `[1, 2, 3].with(0, 9)` → `[9, 2, 3]` |
| `Object.groupBy` (ES2024) | regrouper en objet | `Object.groupBy([1, 2, 3], (n) => (n % 2 ? "impair" : "pair")).impair` → `[1, 3]` |
| `Map.groupBy` (ES2024) | regrouper en `Map` | `Map.groupBy([1, 2, 3], (n) => n % 2).get(0)` → `[2]` |

### Méthodes mutantes (modifient le tableau)

| Méthode | Rôle | Renvoie | Équivalent non mutant |
| --- | --- | --- | --- |
| `push(x)` | ajoute à la fin | la nouvelle longueur : `[1, 2].push(3)` → `3` | `[...tab, x]` |
| `pop()` | retire le dernier | l'élément retiré : `[1, 2].pop()` → `2` | `tab.slice(0, -1)` |
| `unshift(x)` | ajoute au début | la nouvelle longueur | `[x, ...tab]` |
| `shift()` | retire le premier | l'élément retiré : `[1, 2].shift()` → `1` | `tab.slice(1)` |
| `splice(i, n, ...ajouts)` | supprime/insère | les éléments supprimés : `[1, 2, 3].splice(1, 1)` → `[2]` | `toSpliced` |
| `sort(comparateur)` | trie **en place** | le même tableau : `[10, 9, 1].sort()` → `[1, 10, 9]` (tri textuel !) | `toSorted` |
| `reverse()` | inverse en place | le même tableau | `toReversed` |
| `fill(v)` | remplit | le même tableau | `Array.from` |
| `tab[i] = v` | remplace | `v` | `with(i, v)` |

Trier des nombres : `[10, 9, 1].toSorted((a, b) => a - b)` → `[1, 9, 10]`. Trier des chaînes françaises : `["éclair", "eau", "zèbre"].toSorted((a, b) => a.localeCompare(b, "fr"))` → `["eau", "éclair", "zèbre"]`.

Recettes : dédoublonner `[...new Set([1, 2, 2, 3])]` → `[1, 2, 3]` ; dernier élément `[1, 2, 3].at(-1)` → `3` ; somme `[1, 2, 3].reduce((s, n) => s + n, 0)` → `6`.

## Objets

Détails → [10](../10-objets/README.md).

| Besoin | Expression | Résultat / remarque |
| --- | --- | --- |
| Clés, valeurs, paires | `Object.entries({ a: 1, b: 2 })` → `[["a", 1], ["b", 2]]` | aussi `Object.keys`, `Object.values` |
| Paires → objet (ES2019) | `Object.fromEntries([["a", 1]])` → `{ a: 1 }` | inverse d'`entries` |
| Transformer les valeurs | `Object.fromEntries(Object.entries({ a: 1, b: 2 }).map(([k, v]) => [k, v * 10]))` → `{ a: 10, b: 20 }` | |
| Propriété propre ? (ES2022) | `Object.hasOwn({ a: 1 }, "a")` → `true` | `"a" in obj` regarde aussi le prototype |
| Copie superficielle | `{ ...{ a: 1 } }` → `{ a: 1 }` | les objets imbriqués restent partagés |
| Copie profonde | `structuredClone({ d: new Date(0) }).d instanceof Date` → `true` | pas de fonctions ni de classes personnalisées |
| Fusion | `{ ...{ a: 1, b: 1 }, ...{ b: 2 } }` → `{ a: 1, b: 2 }` | le dernier gagne ; aussi `Object.assign(cible, …)` ⚠️ mutant |
| Supprimer une propriété | `delete obj.cle` ⚠️ mutant | sans muter : `const { cle, ...reste } = obj` |
| Clé dynamique | `{ ["id_" + 7]: true }` → `{ id_7: true }` | |
| Geler | `Object.isFrozen(Object.freeze({ a: {} }))` → `true` | gel **superficiel** : `a` reste modifiable |
| Accès sûr | `({ a: null }).a?.b` → `undefined` | |
| Comparer | `{ a: 1 } === { a: 1 }` → `false` | comparaison par référence |

## Map et Set

Détails → [12](../12-collections/README.md).

| Besoin | Expression | Résultat / remarque |
| --- | --- | --- |
| Créer une `Map` | `new Map([["fr", "Bonjour"], ["en", "Hello"]]).get("en")` → `"Hello"` | clés de n'importe quel type, ordre d'insertion |
| Taille, présence | `new Map([[1, "a"]]).has(1)` → `true` | `.size`, `.set(k, v)`, `.delete(k)`, `.clear()` |
| `Map` → objet | `Object.fromEntries(new Map([["a", 1]]))` → `{ a: 1 }` | objet → `Map` : `new Map(Object.entries(obj))` |
| Valeur par défaut (ES2026) | `carte.getOrInsert(cle, [])` | Chrome 145+, Firefox 144+, Safari 26.2+, Node.js 26 ; pas dans Node.js 24 |
| Dédoublonner | `[...new Set(["a", "b", "a"])]` → `["a", "b"]` | |
| Union (ES2025) | `[...new Set([1, 2]).union(new Set([2, 3]))]` → `[1, 2, 3]` | |
| Intersection (ES2025) | `[...new Set([1, 2, 3]).intersection(new Set([2, 3, 4]))]` → `[2, 3]` | |
| Différence (ES2025) | `[...new Set([1, 2, 3]).difference(new Set([2]))]` → `[1, 3]` | aussi `symmetricDifference` |
| Inclusion (ES2025) | `new Set([1]).isSubsetOf(new Set([1, 2]))` → `true` | aussi `isSupersetOf`, `isDisjointFrom` |
| Données liées à un objet, sans fuite | `new WeakMap()` | clés : objets uniquement, non itérable |

## Itérateurs

Détails → [13](../13-iterateurs-generateurs/README.md). Les *Iterator helpers* (ES2025) sont **paresseux** : rien n'est calculé avant `toArray()`, `for…of` ou un appel comme `reduce`.

| Méthode | Exemple | Résultat |
| --- | --- | --- |
| `Iterator.from(iterable)` | `Iterator.from(new Set([1, 2])).toArray()` → `[1, 2]` | |
| `map`, `filter` | `[1, 2, 3, 4].values().filter((n) => n % 2).map((n) => n * 10).toArray()` → `[10, 30]` | |
| `take`, `drop` | `[1, 2, 3, 4].values().drop(1).take(2).toArray()` → `[2, 3]` | |
| `reduce`, `some`, `every`, `find` | `new Set([1, 2, 3]).values().reduce((s, n) => s + n)` → `6` | |
| `flatMap` | `["a b", "c"].values().flatMap((s) => s.split(" ")).toArray()` → `["a", "b", "c"]` | |
| `Iterator.concat` (ES2026) | `Iterator.concat(a, b)` | Chrome 146+, Firefox 147+, Safari 26.4+, Node.js 26 |

```js
// Générateur infini + helpers : les 3 premiers carrés pairs
function* entiers() {
  for (let n = 1; ; n++) yield n;
}
console.log(entiers().map((n) => n * n).filter((n) => n % 2 === 0).take(3).toArray()); // [ 4, 16, 36 ]
```

## Expressions régulières

Détails → [14](../14-regex/README.md).

| Besoin | Expression | Résultat |
| --- | --- | --- |
| Tester | `/^\d{5}$/.test("75011")` → `true` | |
| Première correspondance | `"Réf. A-42".match(/\d+/)[0]` → `"42"` | `null` si aucune |
| Toutes les correspondances | `"a1 b22 c333".match(/\d+/g)` → `["1", "22", "333"]` | |
| Avec groupes | `[..."x=1, y=2".matchAll(/(\w)=(\d)/g)].map((m) => m[1] + m[2])` → `["x1", "y2"]` | |
| Groupes nommés | `"2026-11-06".match(/(?<annee>\d{4})-(?<mois>\d{2})/).groups.mois` → `"11"` | |
| Remplacer avec groupes | `"2026-11-06".replace(/(\d+)-(\d+)-(\d+)/, "$3/$2/$1")` → `"06/11/2026"` | aussi `$<nom>` |
| Remplacer avec une fonction | `"prix : 10 €".replace(/\d+/, (n) => n * 2)` → `"prix : 20 €"` | |
| Échapper une saisie (ES2025) | `new RegExp(RegExp.escape("1+1=2")).test("1+1=2")` → `true` | Chrome 136+, Firefox 134+, Safari 18.2+, Node.js 24 |
| Découper | `"a, b;c".split(/[,;]\s*/)` → `["a", "b", "c"]` | |

Drapeaux : `g` (toutes), `i` (casse), `m` (multiligne), `s` (`.` inclut `\n`), `u` / `v` (Unicode), `y` (collant), `d` (indices).

## Dates et Intl

Détails → [15](../15-dates/README.md).

| Besoin | Expression | Résultat / remarque |
| --- | --- | --- |
| Maintenant (timestamp ms) | `Date.now()` | nombre de millisecondes depuis le 1er janvier 1970 UTC |
| Date locale précise | `new Date(2026, 0, 31).getMonth()` → `0` | **mois de 0 à 11** |
| Depuis une chaîne ISO | `new Date("2026-11-06T09:30:00Z").toISOString()` → `"2026-11-06T09:30:00.000Z"` | toujours un format ISO 8601 |
| Jour de la semaine | `new Date("2026-11-06T12:00:00Z").getUTCDay()` → `5` | 0 = dimanche |
| Différence en jours | `(new Date("2026-12-25") - new Date("2026-11-06")) / 86_400_000` → `49` | |
| Formater | `new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeZone: "Europe/Paris" }).format(new Date("2026-11-06T12:00:00Z"))` → `"vendredi 6 novembre 2026"` | |
| Heure dans un fuseau | `new Intl.DateTimeFormat("fr-FR", { timeStyle: "short", timeZone: "America/New_York" }).format(new Date("2026-11-06T12:00:00Z"))` → `"07:00"` | |
| Relatif | `new Intl.RelativeTimeFormat("fr", { numeric: "auto" }).format(-1, "day")` → `"hier"` | |
| Liste | `new Intl.ListFormat("fr", { type: "conjunction" }).format(["thé", "café", "eau"])` → `"thé, café et eau"` | |
| Temporal (ES2027 prévu) | `Temporal.PlainDate.from("2026-11-06").add({ months: 1 }).toString()` vaut `"2026-12-06"` | Firefox 139+, Chrome/Edge 144+, Node.js 26 ; pas encore dans Safari stable : polyfill `temporal-polyfill` ou `@js-temporal/polyfill` |

Bonne pratique : stocker et échanger en UTC (ISO 8601), afficher dans le fuseau de l'utilisateur. Moment.js est en mode maintenance : préférez `Intl`, Temporal, ou date-fns / Day.js / Luxon.

## Classes

Détails → [16](../16-classes/README.md).

```js
class Compte {
  static #nombre = 0; // champ statique privé
  #solde = 0; // champ privé (ES2022)
  titulaire; // champ public

  constructor(titulaire) {
    this.titulaire = titulaire;
    Compte.#nombre++;
  }

  get solde() {
    return this.#solde;
  }

  deposer(montant) {
    if (montant <= 0) throw new RangeError("Montant invalide");
    this.#solde += montant;
    return this; // chaînage
  }

  static get nombre() {
    return Compte.#nombre;
  }

  static estUnCompte(objet) {
    return #solde in objet; // test de marque (ES2022)
  }
}

class CompteEpargne extends Compte {
  constructor(titulaire, taux) {
    super(titulaire); // obligatoire avant d'utiliser this
    this.taux = taux;
  }
}

const compte = new CompteEpargne("Ada", 0.03).deposer(100);
console.log(compte.solde, compte instanceof Compte, Compte.nombre); // 100 true 1
console.log(Compte.estUnCompte(compte), Compte.estUnCompte({ solde: 100 })); // true false
```

## Erreurs

Détails → [17](../17-erreurs/README.md).

| Besoin | Syntaxe |
| --- | --- |
| Lancer | `throw new TypeError("Âge invalide : 12a")` (toujours un objet `Error`) |
| Capturer | `try { … } catch (erreur) { … } finally { … }` ; `catch { … }` sans paramètre (ES2019) |
| Envelopper (ES2022) | `throw new Error("Lecture impossible", { cause: erreur })` |
| Est-ce une vraie erreur ? (ES2026) | `Error.isError(valeur)`, fiable même entre iframes ; pas encore dans Safari stable |
| Erreur personnalisée | `class ErreurValidation extends Error { name = "ErreurValidation"; }` |
| Plusieurs erreurs (ES2021) | `new AggregateError([e1, e2], "2 erreurs")` |
| Libération automatique (ES2027 prévu) | `using ressource = ouvrir();` avec `[Symbol.dispose]()` ; Chrome 134+, Firefox 141+, Node.js 24+ |
| Erreurs non gérées | navigateur : événements `error` et `unhandledrejection` ; Node : `process.on("uncaughtException")` |

## Promesses et async/await

Détails → [19](../19-promises/README.md), [20](../20-async-await/README.md).

| Besoin | Expression | Résultat |
| --- | --- | --- |
| Attendre une promesse | `await Promise.resolve(42)` → `42` | dans une fonction `async` ou au niveau supérieur d'un module |
| Tout en parallèle, échec au premier rejet | `await Promise.all([1, Promise.resolve(2)])` → `[1, 2]` | |
| Tout en parallèle, sans échec global (ES2020) | `(await Promise.allSettled([Promise.reject(new Error("x"))]))[0].status` → `"rejected"` | `{ status, value }` ou `{ status, reason }` |
| Le premier qui se termine | `await Promise.race([setTimeoutP(50, "lent"), setTimeoutP(10, "rapide")])` → `"rapide"` | |
| Le premier qui réussit (ES2021) | `await Promise.any([Promise.reject(new Error("x")), Promise.resolve("ok")])` → `"ok"` | `AggregateError` si tous échouent |
| Promesse « à résoudre plus tard » (ES2024) | `const { promise, resolve, reject } = Promise.withResolvers()` | |
| Démarrer une chaîne, même avec une fonction synchrone qui lance (ES2025) | `await Promise.try(() => JSON.parse("[1]"))` → `[1]` | une exception devient un rejet |
| Délai maximal | `fetch(url, { signal: AbortSignal.timeout(5000) })` | rejet `TimeoutError` après 5 s |
| Annuler | `const controleur = new AbortController(); … controleur.abort();` | passer `controleur.signal` |

```js
// Séquentiel vs parallèle
const attendre = (ms, valeur) => new Promise((resoudre) => setTimeout(resoudre, ms, valeur));

const debut = Date.now();
const [a, b] = await Promise.all([attendre(100, "A"), attendre(100, "B")]); // en parallèle : ~100 ms
console.log(a, b, Date.now() - debut < 190); // A B true

// ❌ await dans forEach n'attend pas ; ✅ for…of attend chaque itération
for (const ms of [30, 10]) {
  console.log(await attendre(ms, `fini après ${ms} ms`));
}
// fini après 30 ms
// fini après 10 ms
```

## Timers

Détails → [21](../21-timers/README.md).

| Besoin | Syntaxe | Remarque |
| --- | --- | --- |
| Exécuter plus tard | `const id = setTimeout(fonction, 1000)` | annuler : `clearTimeout(id)` |
| Répéter | `const id = setInterval(fonction, 1000)` | arrêter : `clearInterval(id)` |
| Attendre (Node) | `import { setTimeout as attendre } from "node:timers/promises"; await attendre(1000);` | |
| Attendre (partout) | `await new Promise((r) => setTimeout(r, 1000))` | |
| Après le code courant, avant tout timer | `queueMicrotask(fonction)` | |
| Avant le prochain affichage (navigateur) | `requestAnimationFrame(fonction)` | pour les animations |
| Mesurer une durée | `performance.now()` | précision sub-milliseconde |
| Regrouper des appels rapprochés | *debounce* / *throttle* | implémentations → [21](../21-timers/README.md) |

## fetch et URL

Détails → [22](../22-fetch-http/README.md).

<!-- no-run -->
```js
// GET + JSON, avec gestion d'erreur et délai maximal
const reponse = await fetch("https://api.exemple.fr/articles?page=2", {
  headers: { Accept: "application/json" },
  signal: AbortSignal.timeout(5000),
});
if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`); // fetch ne rejette PAS sur 404 ou 500
const articles = await reponse.json();

// POST JSON
await fetch("https://api.exemple.fr/articles", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ titre: "Nouveau" }),
});
```

| Besoin | Expression | Résultat |
| --- | --- | --- |
| Analyser une URL | `new URL("https://exemple.fr:8080/a/b?x=1#haut").pathname` → `"/a/b"` | aussi `hostname`, `port`, `search`, `hash`, `origin` |
| URL relative | `new URL("../img.png", "https://exemple.fr/blog/article").href` → `"https://exemple.fr/img.png"` | |
| Valider sans exception | `URL.canParse("pas une url")` → `false` | `URL.parse(texte)` renvoie `null` si invalide |
| Lire un paramètre | `new URL("https://exemple.fr/?q=café&p=2").searchParams.get("q")` → `"café"` | |
| Construire une requête | `new URLSearchParams({ q: "thé vert", page: 2 }).toString()` → `"q=th%C3%A9+vert&page=2"` | encode automatiquement |
| Encoder un composant | `encodeURIComponent("a&b=c")` → `"a%26b%3Dc"` | |

## DOM

Détails → [23](../23-dom/README.md). Code navigateur uniquement.

| Besoin | Syntaxe |
| --- | --- |
| Sélectionner un / tous | `document.querySelector(".carte")`, `document.querySelectorAll("li.actif")` (`NodeList` statique) |
| Ancêtre le plus proche | `element.closest("form")` ; correspondance : `element.matches(".actif")` |
| Texte (sûr) | `element.textContent = saisie` |
| HTML (⚠️ XSS si donnée externe) | `element.innerHTML = "<b>fixe</b>"` ; pour du HTML externe : `element.setHTML(html)` (Chrome 146+, Firefox 148+, pas Safari) ou une bibliothèque d'assainissement |
| Classes | `element.classList.add("a")`, `.remove`, `.toggle("ouvert", condition)`, `.contains` |
| Attributs `data-*` | `element.dataset.idProduit` ⇔ `data-id-produit` |
| Attributs | `element.getAttribute("href")`, `.setAttribute`, `.removeAttribute`, `.toggleAttribute("hidden")` |
| Styles | `element.style.setProperty("--couleur", "red")` ; calculé : `getComputedStyle(element).width` |
| Créer et insérer | `const li = document.createElement("li"); liste.append(li);` (aussi `prepend`, `before`, `after`, `replaceWith`) |
| Supprimer | `element.remove()` |
| Gabarit | `modele.content.cloneNode(true)` avec `<template id="modele">` |
| Dimensions, position | `element.getBoundingClientRect()` |
| Observer | `new IntersectionObserver(…)`, `new ResizeObserver(…)`, `new MutationObserver(…)` |

## Événements

Détails → [24](../24-evenements/README.md).

<!-- no-run -->
```js
const controleur = new AbortController();

// Écouter, avec options
bouton.addEventListener("click", gerer, { once: true });
window.addEventListener("scroll", suivre, { passive: true, signal: controleur.signal });
controleur.abort(); // retire tous les écouteurs liés à ce signal

// Délégation : un seul écouteur pour toute une liste, même pour les éléments ajoutés plus tard
liste.addEventListener("click", (evenement) => {
  const bouton = evenement.target.closest("button[data-id]");
  if (!bouton || !liste.contains(bouton)) return;
  supprimer(bouton.dataset.id);
});

// Formulaire
formulaire.addEventListener("submit", (evenement) => {
  evenement.preventDefault(); // empêche l'envoi et le rechargement
  const donnees = Object.fromEntries(new FormData(formulaire));
});

// Clavier : key = caractère produit ("a", "Enter"), code = touche physique ("KeyA")
document.addEventListener("keydown", (e) => e.key === "Escape" && fermer());
```

| Propriété / méthode | Rôle |
| --- | --- |
| `event.target` / `event.currentTarget` | élément d'origine / élément qui porte l'écouteur |
| `event.preventDefault()` | annule l'action par défaut (lien, envoi de formulaire) |
| `event.stopPropagation()` | arrête la remontée (à utiliser rarement) |
| `new CustomEvent("panier:ajout", { detail })` + `dispatchEvent` | événement personnalisé ; `EventTarget` fonctionne aussi dans Node.js |

## JSON et stockage

Détails → [25](../25-json-et-stockage/README.md).

| Besoin | Expression | Résultat / remarque |
| --- | --- | --- |
| Objet → JSON | `JSON.stringify({ a: 1, b: [true, null] })` → `'{"a":1,"b":[true,null]}'` | indentation : `JSON.stringify(valeur, null, 2)` |
| Valeurs perdues | `JSON.stringify({ f() {}, u: undefined, d: new Date(0) })` → `'{"d":"1970-01-01T00:00:00.000Z"}'` | fonctions et `undefined` disparaissent, `Date` devient une chaîne |
| JSON → objet | `JSON.parse('{"a":1}').a` → `1` | lance `SyntaxError` si invalide |
| Réhydrater des dates | `JSON.parse('{"d":"2026-11-06T00:00:00.000Z"}', (cle, v) => (cle === "d" ? new Date(v) : v)).d.getUTCFullYear()` → `2026` | *reviver* |
| Importer un fichier JSON (ES2025) | `import config from "./config.json" with { type: "json" };` | |
| Copie profonde | `structuredClone(objet)` | gère `Date`, `Map`, `Set`, cycles |
| Stockage local (navigateur) | `localStorage.setItem("prefs", JSON.stringify(prefs))` ; `JSON.parse(localStorage.getItem("prefs") ?? "{}")` | chaînes uniquement ; **jamais** de jetons d'authentification |

## Modules

Détails → [26](../26-modules/README.md).

<!-- no-run -->
```js
// Exporter
export const TVA = 0.2;
export function prixTtc(ht) { return ht * (1 + TVA); }
export default class Panier {}

// Importer
import Panier, { prixTtc, TVA as tauxTva } from "./panier.js"; // extension obligatoire
import * as outils from "./outils.js";
import { readFile } from "node:fs/promises"; // modules intégrés de Node : préfixe node:

// Import dynamique (chargement à la demande)
const { graphique } = await import("./graphique.js");

// Informations sur le module courant
console.log(import.meta.url, import.meta.dirname, import.meta.filename); // ces deux derniers : Node.js
```

Dans le navigateur : `<script type="module" src="app.js"></script>` (différé automatiquement). Dans Node.js : `"type": "module"` dans `package.json`, ou l'extension `.mjs`.

## Node.js

Détails → [27](../27-nodejs/README.md).

| Besoin | Syntaxe |
| --- | --- |
| Lire / écrire un fichier | `await readFile("a.txt", "utf8")`, `await writeFile("a.txt", texte)` depuis `node:fs/promises` |
| Lire un JSON | `JSON.parse(await readFile("config.json", "utf8"))` |
| Dossiers | `await mkdir("sortie/img", { recursive: true })`, `await readdir("src")`, `await rm("tmp", { recursive: true, force: true })` |
| Chemins | `path.join("src", "..", "docs", "a.md")` → `"docs/a.md"` ; `path.extname("photo.jpg")` → `".jpg"` ; `path.basename("/a/b.txt", ".txt")` → `"b"` |
| Dossier du fichier courant (ESM) | `import.meta.dirname` (remplace `__dirname`) |
| Arguments de la ligne de commande | `process.argv.slice(2)` ; analyse : `util.parseArgs` |
| Variables d'environnement | `process.env.PORT ?? "3000"` ; charger un fichier : `node --env-file=.env app.js` |
| Code de sortie | `process.exitCode = 1` (préférable à `process.exit(1)`) |
| Relancer à chaque modification | `node --watch app.js` |
| Lancer un script du package.json | `node --run test` (ou `npm run test`) |
| Lancer les tests | `node --test` avec `node:test` et `node:assert/strict` → [29](../29-tests/README.md) |

## console

Détails → [01](../01-introduction/README.md).

| Méthode | Usage |
| --- | --- |
| `console.log(a, b)` | afficher des valeurs |
| `console.error(e)` / `console.warn(m)` | sortie d'erreur / avertissement |
| `console.table(tableauDObjets)` | tableau lisible |
| `console.dir(objet, { depth: null })` | objet profond (Node.js) |
| `console.group("titre")` / `console.groupEnd()` | indenter un groupe de messages |
| `console.time("calcul")` / `console.timeEnd("calcul")` | chronométrer |
| `console.count("appel")` | compter les passages |
| `console.assert(condition, message)` | affiche si la condition est fausse (ne lance **pas** d'erreur) |
| `console.trace()` | affiche la pile d'appels |

## Ancienne façon → façon moderne

Ce que vous croiserez dans du code ancien (ou dans de vieux tutoriels), et ce qu'on écrit aujourd'hui. Toutes les versions modernes ci-dessous sont disponibles dans les navigateurs actuels et Node.js 24, sauf mention contraire.

### Langage et syntaxe

| Avant | Aujourd'hui | Depuis | → |
| --- | --- | --- | --- |
| `var x = 1;` | `const x = 1;` (`let` si réassignation) | ES2015 | [02](../02-variables/README.md) |
| `"Bonjour " + nom + " !"` | `` `Bonjour ${nom} !` `` | ES2015 | [07](../07-chaines/README.md) |
| `var self = this; function () { self.x }` | fonction fléchée `() => this.x` | ES2015 | [06](../06-fonctions/README.md) |
| `options = options \|\| {};` dans le corps | paramètre par défaut `function f(options = {})` | ES2015 | [06](../06-fonctions/README.md) |
| `var a = obj.a, b = obj.b;` | `const { a, b } = obj;` | ES2015 | [11](../11-syntaxe-moderne/README.md) |
| `arguments` / `Array.prototype.slice.call(arguments)` | paramètre du reste `(...args)` | ES2015 | [06](../06-fonctions/README.md) |
| `fn.apply(null, tableau)` | `fn(...tableau)` | ES2015 | [11](../11-syntaxe-moderne/README.md) |
| `Math.pow(2, 10)` | `2 ** 10` | ES2016 | [08](../08-nombres-et-math/README.md) |
| `a && a.b && a.b.c` | `a?.b?.c` | ES2020 | [04](../04-conditions/README.md) |
| `x !== null && x !== undefined ? x : defaut` (ou `x \|\| defaut` quand `0` et `""` sont valides) | `x ?? defaut` | ES2020 | [04](../04-conditions/README.md) |
| `if (o.x == null) o.x = defaut;` | `o.x ??= defaut;` | ES2021 | [11](../11-syntaxe-moderne/README.md) |
| `1000000` | `1_000_000` | ES2021 | [08](../08-nombres-et-math/README.md) |
| `try { … } catch (e) { /* e inutilisé */ }` | `try { … } catch { … }` | ES2019 | [17](../17-erreurs/README.md) |
| fonction constructeur + `prototype` | `class` (champs `#privés`, `static`) | ES2015 / ES2022 | [16](../16-classes/README.md) |
| `this._prive` (convention) | `this.#prive` | ES2022 | [16](../16-classes/README.md) |
| `try { … } finally { ressource.fermer(); }` | `using ressource = ouvrir();` | ES2027 prévu (Chrome 134+, Firefox 141+, Node.js 24+ ; pas Safari) | [17](../17-erreurs/README.md) |

### Chaînes, nombres, types

| Avant | Aujourd'hui | Depuis | → |
| --- | --- | --- | --- |
| `str.indexOf(s) !== -1` | `str.includes(s)` | ES2015 | [07](../07-chaines/README.md) |
| `str.substr(debut, longueur)` (obsolète) | `str.slice(debut, debut + longueur)` | — | [07](../07-chaines/README.md) |
| `str[str.length - 1]`, `str.charAt(str.length - 1)` | `str.at(-1)` | ES2022 | [07](../07-chaines/README.md) |
| `str.replace(/-/g, "+")` pour un texte fixe | `str.replaceAll("-", "+")` | ES2021 | [07](../07-chaines/README.md) |
| `trimLeft()` / `trimRight()` | `trimStart()` / `trimEnd()` | ES2019 | [07](../07-chaines/README.md) |
| `escape()` / `unescape()` | `encodeURIComponent()` / `decodeURIComponent()` | — | [22](../22-fetch-http/README.md) |
| fonction maison pour échapper une regex | `RegExp.escape(saisie)` | ES2025 | [14](../14-regex/README.md) |
| `btoa(String.fromCharCode(...octets))` | `octets.toBase64()` / `Uint8Array.fromBase64(texte)` | ES2026 (Chrome 140+, Firefox 133+, Safari 18.2+, Node.js 25+) | [07](../07-chaines/README.md) |
| `isNaN(x)` (convertit d'abord) | `Number.isNaN(x)` | ES2015 | [08](../08-nombres-et-math/README.md) |
| `parseInt(x)` sans base | `Number(x)` ou `parseInt(x, 10)` | — | [08](../08-nombres-et-math/README.md) |
| `Object.prototype.toString.call(x) === "[object Array]"` | `Array.isArray(x)` | ES5 | [09](../09-tableaux/README.md) |
| `x instanceof Error` pour normaliser une valeur capturée | `Error.isError(x)` | ES2026 (pas encore Safari stable) | [17](../17-erreurs/README.md) |
| `Math.random()` pour un jeton ou un identifiant | `crypto.randomUUID()`, `crypto.getRandomValues()` | — | [08](../08-nombres-et-math/README.md) |
| paquet `uuid` | `crypto.randomUUID()` | — | [08](../08-nombres-et-math/README.md) |
| additions en boucle de flottants | `Math.sumPrecise(nombres)` | ES2026 (pas dans Node.js 24) | [08](../08-nombres-et-math/README.md) |

### Tableaux, objets, collections

| Avant | Aujourd'hui | Depuis | → |
| --- | --- | --- | --- |
| `tab[tab.length - 1]` | `tab.at(-1)` | ES2022 | [09](../09-tableaux/README.md) |
| `tab.indexOf(x) !== -1` | `tab.includes(x)` | ES2016 | [09](../09-tableaux/README.md) |
| `tab.filter(test)[0]` | `tab.find(test)` | ES2015 | [09](../09-tableaux/README.md) |
| `tab.slice().reverse().find(test)` | `tab.findLast(test)` | ES2023 | [09](../09-tableaux/README.md) |
| `tab.slice().sort()` / `[...tab].sort()` | `tab.toSorted()` | ES2023 | [09](../09-tableaux/README.md) |
| `tab.slice().reverse()` | `tab.toReversed()` | ES2023 | [09](../09-tableaux/README.md) |
| copie puis `copie.splice(…)` | `tab.toSpliced(…)` | ES2023 | [09](../09-tableaux/README.md) |
| copie puis `copie[i] = v` | `tab.with(i, v)` | ES2023 | [09](../09-tableaux/README.md) |
| `[].concat.apply([], tab)` | `tab.flat()` | ES2019 | [09](../09-tableaux/README.md) |
| `reduce` qui construit des groupes à la main, `_.groupBy` | `Object.groupBy(tab, fn)` / `Map.groupBy` | ES2024 | [09](../09-tableaux/README.md) |
| `Array.prototype.slice.call(nodeList)` | `Array.from(nodeList)` ou `[...nodeList]` | ES2015 | [09](../09-tableaux/README.md) |
| boucle `for await` + `push` | `await Array.fromAsync(iterable)` | ES2026 | [20](../20-async-await/README.md) |
| `tab.filter((x, i) => tab.indexOf(x) === i)`, `_.uniq` | `[...new Set(tab)]` | ES2015 | [12](../12-collections/README.md) |
| `a.filter((x) => b.includes(x))` | `setA.intersection(setB)` (aussi `union`, `difference`…) | ES2025 | [12](../12-collections/README.md) |
| `if (!m.has(k)) m.set(k, []); m.get(k).push(v);` | `m.getOrInsert(k, []).push(v)` | ES2026 (Chrome 145+, Firefox 144+, Safari 26.2+, Node.js 26) | [12](../12-collections/README.md) |
| `obj.hasOwnProperty(cle)` | `Object.hasOwn(obj, cle)` | ES2022 | [10](../10-objets/README.md) |
| `Object.assign({}, a, b)` | `{ ...a, ...b }` | ES2018 | [10](../10-objets/README.md) |
| `Object.keys(o).forEach((k) => … o[k] …)` | `for (const [k, v] of Object.entries(o))` | ES2017 | [10](../10-objets/README.md) |
| `reduce` pour transformer des paires en objet | `Object.fromEntries(paires)` | ES2019 | [10](../10-objets/README.md) |
| `JSON.parse(JSON.stringify(x))`, `_.cloneDeep(x)` | `structuredClone(x)` | navigateurs 2022, Node.js 17+ | [10](../10-objets/README.md) |
| objet utilisé comme dictionnaire à clés quelconques | `Map` | ES2015 | [12](../12-collections/README.md) |
| tableau temporaire pour enchaîner sur un itérable | Iterator helpers (`iter.map().filter().take()`) | ES2025 | [13](../13-iterateurs-generateurs/README.md) |

### Asynchrone et réseau

| Avant | Aujourd'hui | Depuis | → |
| --- | --- | --- | --- |
| callbacks imbriqués (`fs.readFile(f, (err, data) => …)`) | `await readFile(f)` depuis `node:fs/promises` | ES2017 / Node.js 10+ | [20](../20-async-await/README.md) |
| longues chaînes `.then().then()` | `async` / `await` + `try/catch` | ES2017 | [20](../20-async-await/README.md) |
| `util.promisify` maison | versions `promises` des modules Node (`node:fs/promises`, `node:timers/promises`…) | Node.js 15+ | [27](../27-nodejs/README.md) |
| `Promise.all` + `.catch` sur chaque promesse | `Promise.allSettled` | ES2020 | [19](../19-promises/README.md) |
| `let resoudre; new Promise((r) => (resoudre = r))` | `Promise.withResolvers()` | ES2024 | [19](../19-promises/README.md) |
| `new Promise((r) => r(fn()))` | `Promise.try(fn)` | ES2025 | [19](../19-promises/README.md) |
| `setTimeout` + drapeau maison pour un délai maximal | `AbortSignal.timeout(ms)` | navigateurs 2022, Node.js 17.3+ | [20](../20-async-await/README.md) |
| `XMLHttpRequest`, `$.ajax` | `fetch` | navigateurs 2017, Node.js 18+ (stable depuis la 21) | [22](../22-fetch-http/README.md) |
| axios pour des besoins simples | `fetch` + petite fonction utilitaire | — | [22](../22-fetch-http/README.md) |
| découpage manuel de `location.search` | `new URL(location.href).searchParams` | — | [22](../22-fetch-http/README.md) |

### Navigateur

| Avant | Aujourd'hui | Depuis | → |
| --- | --- | --- | --- |
| `$(".x")`, `document.getElementsByClassName("x")` | `document.querySelectorAll(".x")` | — | [23](../23-dom/README.md) |
| `el.className += " actif"` | `el.classList.add("actif")` | — | [23](../23-dom/README.md) |
| `el.getAttribute("data-id")` | `el.dataset.id` | — | [23](../23-dom/README.md) |
| `parent.insertBefore(n, parent.firstChild)` | `parent.prepend(n)` | — | [23](../23-dom/README.md) |
| `el.parentNode.removeChild(el)` | `el.remove()` | — | [23](../23-dom/README.md) |
| `el.innerHTML = donneeUtilisateur` | `el.textContent = donnee`, ou `el.setHTML(html)` pour du HTML (Chrome 146+, Firefox 148+, pas Safari) | — | [23](../23-dom/README.md) |
| `el.onclick = …` | `el.addEventListener("click", …)` | — | [24](../24-evenements/README.md) |
| garder une référence pour `removeEventListener` | option `{ signal }` + `AbortController` | — | [24](../24-evenements/README.md) |
| `DOMContentLoaded` + script en fin de `<body>` | `<script type="module">` (différé) ou `defer` | — | [23](../23-dom/README.md) |
| `e.keyCode === 13` | `e.key === "Enter"` | — | [24](../24-evenements/README.md) |
| `scroll` + calculs de position pour détecter la visibilité | `IntersectionObserver` | — | [23](../23-dom/README.md) |
| jeton d'authentification dans `localStorage` | cookie `HttpOnly; Secure; SameSite` | — | [25](../25-json-et-stockage/README.md) |

### Modules, Node.js et outils

| Avant | Aujourd'hui | Depuis | → |
| --- | --- | --- | --- |
| `require()` / `module.exports` | `import` / `export` | ES2015, Node.js 12+ | [26](../26-modules/README.md) |
| IIFE pour isoler une portée | un module | ES2015 | [26](../26-modules/README.md) |
| `__dirname`, `__filename` | `import.meta.dirname`, `import.meta.filename` | Node.js 20.11+ | [26](../26-modules/README.md) |
| `require("./data.json")`, `fs.readFileSync` + `JSON.parse` | `import data from "./data.json" with { type: "json" }` | ES2025 | [26](../26-modules/README.md) |
| `require("fs")` | `import … from "node:fs/promises"` (préfixe `node:`) | Node.js 14.18+ | [27](../27-nodejs/README.md) |
| paquet `dotenv` | `node --env-file=.env` | Node.js 20.6+ | [27](../27-nodejs/README.md) |
| `nodemon` | `node --watch` | Node.js 22 (stable) | [27](../27-nodejs/README.md) |
| `minimist`, `yargs` pour une petite CLI | `util.parseArgs` | Node.js 20 (stable) | [27](../27-nodejs/README.md) |
| `ts-node` pour lancer un `.ts` simple | `node fichier.ts` (suppression des types) | Node.js 22.18+ / 23.6+ | [27](../27-nodejs/README.md) |
| Mocha / Jest pour des tests simples | `node:test` + `node:assert/strict` | Node.js 20 (stable) | [29](../29-tests/README.md) |
| `.eslintrc.json` | `eslint.config.js` (configuration « flat ») | ESLint 9 | [28](../28-outillage/README.md) |
| webpack pour un projet neuf | Vite | — | [28](../28-outillage/README.md) |
| Moment.js | `Intl.DateTimeFormat`, Temporal (avec polyfill) ou date-fns / Day.js / Luxon | — | [15](../15-dates/README.md) |
| syntaxe Closure dans JSDoc (`function(string)`, `@enum`) | syntaxe TypeScript (`(s: string) => void`, union de littéraux) | TypeScript 7 | [30](../30-commentaires-jsdoc/README.md) |

### Quelques transformations en code

```js
const commandes = [
  { id: 1, client: "ada", total: 120, statut: "payee" },
  { id: 2, client: "alan", total: 80, statut: "en_attente" },
  { id: 3, client: "ada", total: 45, statut: "payee" },
];

// ❌ Avant
var payees = commandes.filter(function (c) { return c.statut === "payee"; });
var triees = payees.slice().sort(function (a, b) { return b.total - a.total; });
var parClient = triees.reduce(function (acc, c) {
  if (!acc.hasOwnProperty(c.client)) acc[c.client] = [];
  acc[c.client].push(c.id);
  return acc;
}, {});
var derniere = commandes[commandes.length - 1];
console.log(JSON.stringify(parClient), derniere.id); // {"ada":[1,3]} 3

// ✅ Aujourd'hui
const groupes = Object.groupBy(
  commandes.filter((c) => c.statut === "payee").toSorted((a, b) => b.total - a.total),
  (c) => c.client,
);
const idsParClient = Object.fromEntries(Object.entries(groupes).map(([client, liste]) => [client, liste.map((c) => c.id)]));
console.log(JSON.stringify(idsParClient), commandes.at(-1).id); // {"ada":[1,3]} 3
```

```js
const reglages = { theme: "", volume: 0, langue: null };

// ❌ Avant : || écrase les valeurs falsy valides ("" et 0)
var theme = reglages.theme || "clair";
var volume = reglages.volume || 50;
var langue = reglages.langue || "fr";
console.log(theme, volume, langue); // clair 50 fr

// ✅ Aujourd'hui : ?? ne remplace que null et undefined
const volumeModerne = reglages.volume ?? 50;
const langueModerne = reglages.langue ?? "fr";
const copie = structuredClone(reglages); // au lieu de JSON.parse(JSON.stringify(reglages))
console.log(volumeModerne, langueModerne, Object.hasOwn(copie, "theme")); // 0 fr true
```

## Pièges courants

Les dix pièges qui reviennent le plus souvent, avec le chapitre qui les traite :

| Piège | Exemple | Bonne pratique | → |
| --- | --- | --- | --- |
| Arithmétique flottante | `0.1 + 0.2` → `0.30000000000000004` | calculer en centimes entiers, `toFixed` à l'affichage | [08](../08-nombres-et-math/README.md) |
| `sort` sans comparateur trie en texte | `[10, 9, 1].toSorted()` → `[1, 10, 9]` | `(a, b) => a - b` | [09](../09-tableaux/README.md) |
| `sort`, `reverse`, `splice` modifient le tableau | l'original change | `toSorted`, `toReversed`, `toSpliced` | [09](../09-tableaux/README.md) |
| Mois de 0 à 11 | `new Date(2026, 1, 1).getMonth()` → `1` (février) | chaînes ISO ou Temporal | [15](../15-dates/README.md) |
| `typeof null` | `typeof null` → `"object"` | `valeur === null` | [03](../03-types-et-operateurs/README.md) |
| `\|\|` au lieu de `??` | `0 \|\| 10` → `10` | `0 ?? 10` → `0` | [04](../04-conditions/README.md) |
| `fetch` ne rejette pas sur 404/500 | la promesse est tenue | tester `response.ok` | [22](../22-fetch-http/README.md) |
| `await` dans `forEach` | n'attend rien | `for…of` ou `Promise.all` | [20](../20-async-await/README.md) |
| Copie superficielle | `{ ...obj }` partage les objets imbriqués | `structuredClone` | [10](../10-objets/README.md) |
| `this` perdu dans un callback | `setTimeout(objet.methode, 0)` | fonction fléchée ou `bind` | [06](../06-fonctions/README.md) |
| `innerHTML` avec une donnée externe | faille XSS | `textContent` | [23](../23-dom/README.md) |

## Bonnes pratiques

- Préférez les méthodes **non mutantes** (`toSorted`, spread, `with`…) sauf besoin explicite de performance.
- Utilisez `const`, `===`, `??`, `?.`, et les gabarits de chaînes par défaut.
- Avant d'ajouter une dépendance (lodash, Moment, uuid, axios, dotenv…), vérifiez dans cette fiche si la plateforme ne le fait pas déjà.
- Pour toute API récente, vérifiez sa disponibilité (Baseline sur MDN) dans les navigateurs que vous ciblez, et prévoyez un repli ou un polyfill.
- En cas de doute sur un comportement, testez l'expression dans la console du navigateur ou le REPL de Node.js (`node`) : c'est plus rapide qu'une recherche.

## Résumé

- Cette fiche résume, les chapitres expliquent : suivez les liens **→ NN** pour comprendre une notion et ses pièges.
- Méthodes de tableau : distinguez les **mutantes** (`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`) des **non mutantes** (`map`, `filter`, `slice`, `toSorted`, `toReversed`, `toSpliced`, `with`…).
- Le JavaScript moderne remplace de nombreuses bibliothèques : `structuredClone`, `Object.groupBy`, méthodes de `Set`, `Intl`, `fetch`, `crypto.randomUUID`, `node --env-file`, `node --watch`, `node:test`.
- Les ajouts les plus récents (ES2026 et au-delà : `Math.sumPrecise`, `getOrInsert`, `Iterator.concat`, `using`, Temporal) ne sont pas encore partout : vérifiez avant d'utiliser.

## Exercices

### Exercice 1 — Moderniser une fonction (★☆☆)

Réécrivez ce code avec la syntaxe actuelle, sans changer son comportement.

<!-- no-run -->
```js
var TAUX = 0.2;
function resume(article, options) {
  options = options || {};
  var devise = options.devise !== undefined && options.devise !== null ? options.devise : "€";
  var etiquettes = article.etiquettes && article.etiquettes.length ? article.etiquettes : [];
  var prix = Math.round(article.prix * (1 + TAUX) * 100) / 100;
  return article.nom + " : " + prix + " " + devise + (etiquettes.indexOf("promo") !== -1 ? " (promo)" : "");
}
```

<details>
<summary>Solution</summary>

```js
const TAUX = 0.2;

function resume({ nom, prix, etiquettes = [] }, { devise = "€" } = {}) {
  const prixTtc = Math.round(prix * (1 + TAUX) * 100) / 100;
  const promo = etiquettes.includes("promo") ? " (promo)" : "";
  return `${nom} : ${prixTtc} ${devise}${promo}`;
}

console.log(resume({ nom: "Café", prix: 4.5, etiquettes: ["promo"] })); // Café : 5.4 € (promo)
console.log(resume({ nom: "Thé", prix: 3 }, { devise: "EUR" })); // Thé : 3.6 EUR
```

- `var` → `const` ; concaténation → gabarit.
- `options = options || {}` et le test `!== undefined && !== null` → paramètres par défaut déstructurés. Nuance : un paramètre par défaut ne s'applique qu'à `undefined`, pas à `null`. Si `null` doit aussi déclencher la valeur par défaut, écrivez `options.devise ?? "€"`.
- `etiquettes.indexOf(…) !== -1` → `includes`.

</details>

### Exercice 2 — Remplacer des bibliothèques (★★☆)

Ce code utilise lodash et uuid. Réécrivez-le avec les seules API natives.

<!-- no-run -->
```js
import _ from "lodash";
import { v4 as uuid } from "uuid";

const copie = _.cloneDeep(inventaire);
const categories = _.uniq(inventaire.map((p) => p.categorie));
const parCategorie = _.groupBy(inventaire, "categorie");
const plusCher = _.maxBy(inventaire, "prix");
const id = uuid();
```

<details>
<summary>Solution</summary>

```js
const inventaire = [
  { nom: "Clavier", categorie: "informatique", prix: 49 },
  { nom: "Lampe", categorie: "maison", prix: 25 },
  { nom: "Souris", categorie: "informatique", prix: 19 },
];

const copie = structuredClone(inventaire);
const categories = [...new Set(inventaire.map((p) => p.categorie))];
const parCategorie = Object.groupBy(inventaire, (p) => p.categorie);
const plusCher = inventaire.reduce((max, p) => (p.prix > max.prix ? p : max));
const id = crypto.randomUUID();

console.log(copie !== inventaire && copie[0].nom === "Clavier"); // true
console.log(categories); // [ 'informatique', 'maison' ]
console.log(parCategorie.informatique.length, plusCher.nom); // 2 Clavier
console.log(id.length); // 36
```

`Object.groupBy` attend une **fonction** (et non un nom de propriété comme lodash) et renvoie un objet sans prototype. Pour `maxBy`, `reduce` sans valeur initiale prend le premier élément comme point de départ (attention : il lance une `TypeError` sur un tableau vide).

</details>

### Exercice 3 — Ne plus muter (★★☆)

La fonction suivante modifie le tableau reçu, ce qui provoque un bogue chez l'appelant. Corrigez-la avec les méthodes ES2023, sans aucune copie explicite.

```js
function classement(scores) {
  scores.sort((a, b) => b.points - a.points);
  scores.splice(3);
  scores.reverse();
  return scores.map((s) => s.nom);
}

const scores = [
  { nom: "Ada", points: 30 },
  { nom: "Alan", points: 50 },
  { nom: "Grace", points: 40 },
  { nom: "Linus", points: 10 },
];
console.log(classement(scores)); // [ 'Ada', 'Grace', 'Alan' ]
// Le tableau de l'appelant a été modifié :
console.log(scores.length); // 3
```

<details>
<summary>Solution</summary>

```js
function classement(scores) {
  return scores
    .toSorted((a, b) => b.points - a.points)
    .toSpliced(3)
    .toReversed()
    .map((s) => s.nom);
}

const scores = [
  { nom: "Ada", points: 30 },
  { nom: "Alan", points: 50 },
  { nom: "Grace", points: 40 },
  { nom: "Linus", points: 10 },
];
console.log(classement(scores)); // [ 'Ada', 'Grace', 'Alan' ]
console.log(scores.length, scores[0].nom); // 4 Ada
```

Chaque méthode `to…` renvoie une nouvelle copie, ce qui permet aussi de chaîner. `slice(0, 3)` aurait également convenu à la place de `toSpliced(3)`.

</details>

### Exercice 4 — Des callbacks à async/await (★★★)

Réécrivez ce script Node.js avec `node:fs/promises`, `async`/`await` et `import.meta.dirname`. Il lit tous les fichiers `.json` d'un dossier et affiche le nombre d'entrées de chacun.

<!-- no-run -->
```js
const fs = require("fs");
const path = require("path");

fs.readdir(path.join(__dirname, "donnees"), function (err, fichiers) {
  if (err) return console.error(err);
  fichiers.filter(function (f) { return path.extname(f) === ".json"; }).forEach(function (f) {
    fs.readFile(path.join(__dirname, "donnees", f), "utf8", function (err, texte) {
      if (err) return console.error(err);
      console.log(f + " : " + JSON.parse(texte).length + " entrées");
    });
  });
});
```

<details>
<summary>Solution</summary>

```js
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dossier = path.join(import.meta.dirname, "donnees");

// Préparation de données d'exemple
await mkdir(dossier, { recursive: true });
await writeFile(path.join(dossier, "clients.json"), JSON.stringify([{ id: 1 }, { id: 2 }]));
await writeFile(path.join(dossier, "produits.json"), JSON.stringify([{ id: 1 }]));
await writeFile(path.join(dossier, "notes.txt"), "ignoré");

async function compterEntrees(repertoire) {
  const fichiers = (await readdir(repertoire)).filter((f) => path.extname(f) === ".json").toSorted();
  const resultats = await Promise.all(
    fichiers.map(async (fichier) => {
      const texte = await readFile(path.join(repertoire, fichier), "utf8");
      return `${fichier} : ${JSON.parse(texte).length} entrées`;
    }),
  );
  return resultats;
}

try {
  for (const ligne of await compterEntrees(dossier)) console.log(ligne);
} catch (erreur) {
  console.error(`Lecture impossible : ${erreur.message}`);
  process.exitCode = 1;
}
// clients.json : 2 entrées
// produits.json : 1 entrées
```

- Les fichiers sont lus **en parallèle** (`Promise.all`) comme dans l'original, mais l'affichage se fait dans un ordre stable (trié), alors que les callbacks affichaient dans l'ordre d'arrivée.
- Une seule gestion d'erreur (`try/catch`) remplace les tests `if (err)` répétés ; `process.exitCode = 1` signale l'échec au shell.
- `import.meta.dirname` (Node.js 20.11+) remplace `__dirname`, qui n'existe pas dans un module ES.

</details>

### Exercice 5 — Trouver l'API (★★★)

Pour chaque besoin, écrivez **une seule expression** avec une API native, puis vérifiez-la dans Node.js.

1. Le dernier élément de `[4, 8, 15]`.
2. Les éléments communs aux ensembles `{1, 2, 3}` et `{2, 3, 4}`, sous forme de tableau.
3. Le nombre de caractères visibles dans `"👨‍👩‍👧 ok"` (la famille compte pour un).
4. `"2026-11-06"` affiché `"vendredi 6 novembre 2026"`.
5. Savoir si `"https//exemple.fr"` est une URL valide, sans `try/catch`.
6. Une copie de `[3, 1, 2]` triée, l'original restant intact.

<details>
<summary>Solution</summary>

```js
const original = [3, 1, 2];

console.log([4, 8, 15].at(-1)); // 15
console.log([...new Set([1, 2, 3]).intersection(new Set([2, 3, 4]))]); // [ 2, 3 ]
console.log([...new Intl.Segmenter("fr").segment("👨‍👩‍👧 ok")].length); // 4
console.log(new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeZone: "UTC" }).format(new Date("2026-11-06"))); // vendredi 6 novembre 2026
console.log(URL.canParse("https//exemple.fr")); // false
console.log(original.toSorted(), original); // [ 1, 2, 3 ] [ 3, 1, 2 ]
```

- **3** : `"👨‍👩‍👧 ok".length` vaut 11 (unités UTF-16) et `[..."👨‍👩‍👧 ok"].length` vaut 8 (points de code : la famille en compte 5). Seul `Intl.Segmenter` compte les graphèmes, c'est-à-dire ce que l'utilisateur perçoit : la famille, l'espace, `o`, `k`.
- **4** : `new Date("2026-11-06")` est minuit **UTC** (format date seule) ; on formate donc en UTC pour ne pas risquer d'afficher le 5 novembre sur une machine située à l'ouest de Greenwich.
- **5** : il manque `:` après `https` ; `URL.canParse` (navigateurs 2023, Node.js 19.9+) évite le `try/catch` autour de `new URL`.

</details>

## Pour aller plus loin

- [MDN — Référence JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference) et [référence des API Web](https://developer.mozilla.org/fr/docs/Web/API)
- [Baseline (web.dev)](https://web.dev/baseline) : savoir quand une fonctionnalité est utilisable partout
- [caniuse.com](https://caniuse.com/) et [node.green](https://node.green/) : compatibilité navigateurs et Node.js
- [Propositions TC39 terminées](https://github.com/tc39/proposals/blob/main/finished-proposals.md) : ce qui est entré dans chaque édition d'ECMAScript
- [You Might Not Need Lodash](https://youmightnotneed.com/lodash) : équivalents natifs des fonctions de lodash

---

[← Commentaires et JSDoc](../30-commentaires-jsdoc/README.md) · [Sommaire](../README.md#sommaire) · [Projets →](../32-projets/README.md)
