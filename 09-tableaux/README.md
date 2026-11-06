# 09 — Tableaux

> **Niveau** : Débutant à intermédiaire · **Durée** : ~4 h · **Prérequis** : [Boucles](../05-boucles/README.md), [Fonctions](../06-fonctions/README.md)

Une liste de produits, les lignes d'un fichier, les résultats d'une API, les cases d'une grille : presque tous les programmes manipulent des listes. Le tableau (`Array`) est la structure de données que vous utiliserez le plus en JavaScript. Ce chapitre fait le tour de ses méthodes, explique lesquelles modifient le tableau et lesquelles en créent un nouveau, montre comment trier et regrouper correctement, et se termine par des recettes prêtes à l'emploi.

## Objectifs

- Créer des tableaux sans tomber dans les pièges de `new Array(n)` et de `fill`
- Distinguer les méthodes **mutantes** des méthodes **non mutantes**, et choisir la bonne
- Rechercher, transformer et agréger des données avec `find`, `map`, `filter`, `reduce`, `flatMap`…
- Trier des nombres, des chaînes accentuées et des objets selon plusieurs critères
- Regrouper des données avec `Object.groupBy` et `Map.groupBy`
- Repérer un algorithme en O(n²) et le rendre linéaire avec un `Set` ou une `Map`
- Réutiliser des recettes éprouvées : dédoublonner, découper en paquets, mélanger, etc.

## Sommaire

- [Ce qu'est un tableau](#ce-quest-un-tableau)
- [Créer un tableau](#créer-un-tableau)
- [Lire et écrire des éléments](#lire-et-écrire-des-éléments)
- [Ajouter et supprimer des éléments](#ajouter-et-supprimer-des-éléments)
- [Méthodes mutantes et non mutantes](#méthodes-mutantes-et-non-mutantes)
- [Parcourir un tableau](#parcourir-un-tableau)
- [Rechercher](#rechercher)
- [Transformer un tableau](#transformer-un-tableau)
- [Trier](#trier)
- [Regrouper](#regrouper)
- [Conversions, copies et spread](#conversions-copies-et-spread)
- [Déstructuration, les bases](#déstructuration-les-bases)
- [Tableaux creux](#tableaux-creux)
- [Tableaux multidimensionnels](#tableaux-multidimensionnels)
- [Tableaux et code asynchrone](#tableaux-et-code-asynchrone)
- [Tableaux typés (aperçu)](#tableaux-typés-aperçu)
- [Chaîner les méthodes lisiblement](#chaîner-les-méthodes-lisiblement)
- [Complexité et performance](#complexité-et-performance)
- [Recettes](#recettes)
- [Pièges courants](#pièges-courants)
- [Bonnes pratiques](#bonnes-pratiques)
- [Résumé](#résumé)
- [Exercices](#exercices)
- [Pour aller plus loin](#pour-aller-plus-loin)

## Ce qu'est un tableau

Un tableau est une **liste ordonnée** de valeurs. Chaque valeur occupe une position numérotée, son **indice**, qui commence à `0`. La propriété `length` donne le nombre d'éléments.

```js
const jours = ["lundi", "mardi", "mercredi"];

console.log(jours[0]); // lundi
console.log(jours.length); // 3
console.log(typeof jours); // object
console.log(Array.isArray(jours)); // true
```

Trois caractéristiques à retenir :

- **Un tableau est un objet.** `typeof` renvoie `"object"` : les indices sont des clés (`"0"`, `"1"`…) et `length` est mise à jour automatiquement. Pour savoir si une valeur est un tableau, utilisez `Array.isArray`.
- **Sa taille est dynamique.** On ajoute et on retire des éléments à volonté, sans déclarer de taille.
- **Il peut mélanger les types** (`[1, "deux", { trois: 3 }]`), mais un tableau dont tous les éléments ont la même forme est plus simple à manipuler, et mieux optimisé par les moteurs.

Pourquoi `Array.isArray` plutôt que `instanceof Array` ? Parce qu'un tableau créé dans un autre « royaume » (une `<iframe>`, un contexte `vm` de Node) a son propre constructeur `Array` :

```js
import vm from "node:vm";

const venuDAilleurs = vm.runInNewContext("[1, 2, 3]");

console.log(venuDAilleurs instanceof Array); // false
console.log(Array.isArray(venuDAilleurs)); // true
```

## Créer un tableau

### Le littéral, dans 99 % des cas

```js
const vide = [];
const notes = [12, 15, 9];
const panier = [
  { nom: "Clavier", prix: 49 },
  { nom: "Souris", prix: 19 }, // la virgule finale est autorisée
];

console.log(vide.length, notes.length, panier.length); // 0 3 2
```

### `Array.of` et le piège de `new Array(n)`

Le constructeur `Array` se comporte différemment selon le nombre d'arguments : avec un seul nombre, il crée un tableau **vide de cette longueur** (des « trous », voir [Tableaux creux](#tableaux-creux)) au lieu d'un tableau contenant ce nombre. `Array.of` (ES2015) n'a pas cette ambiguïté.

```js
console.log(new Array(3)); // [ <3 empty items> ]
console.log(new Array(3, 4)); // [ 3, 4 ]
console.log(Array.of(3)); // [ 3 ]
console.log(Array.of(3, 4)); // [ 3, 4 ]
```

### `Array.from` : convertir et générer

`Array.from(source, fonctionDeTransformation)` (ES2015) crée un tableau à partir de n'importe quel **itérable** (chaîne, `Set`, `Map`, `NodeList`…) ou de tout objet **« semblable à un tableau »** (qui possède une propriété `length`). Le second argument, facultatif, transforme chaque élément au passage.

```js
console.log(Array.from("héllo")); // [ 'h', 'é', 'l', 'l', 'o' ]
console.log(Array.from(new Set(["a", "b", "a"]))); // [ 'a', 'b' ]
console.log(Array.from({ length: 2, 0: "x", 1: "y" })); // [ 'x', 'y' ]

// Générer une séquence : seul `length` compte, l'élément (_) vaut undefined
console.log(Array.from({ length: 5 }, (_, i) => i * i)); // [ 0, 1, 4, 9, 16 ]
console.log(Array.from({ length: 3 }, () => "?")); // [ '?', '?', '?' ]
```

### `fill` et le piège de la référence partagée

`fill(valeur)` remplit un tableau existant avec **la même valeur**. Pour un nombre ou une chaîne, c'est parfait. Pour un objet ou un tableau, chaque case reçoit **la même référence** :

```js
console.log(new Array(4).fill(0)); // [ 0, 0, 0, 0 ]

// ❌ Les trois cases désignent le MÊME tableau
const lignes = new Array(3).fill([]);
lignes[0].push("x");
console.log(lignes); // [ [ 'x' ], [ 'x' ], [ 'x' ] ]

// ✅ La fonction est appelée pour chaque case : trois tableaux distincts
const lignesOk = Array.from({ length: 3 }, () => []);
lignesOk[0].push("x");
console.log(lignesOk); // [ [ 'x' ], [], [] ]
```

### Quelle façon choisir

| Besoin | Écriture |
| --- | --- |
| Valeurs connues à l'avance | `["a", "b", "c"]` |
| N cases avec la même valeur primitive | `new Array(n).fill(0)` ou `Array.from({ length: n }, () => 0)` |
| N cases avec un objet distinct par case | `Array.from({ length: n }, () => ({}))` |
| Séquence calculée (0, 1, 2…) | `Array.from({ length: n }, (_, i) => i)` |
| Convertir un itérable ou un « semblable à un tableau » | `Array.from(source)` ou `[...source]` |
| Copier ou concaténer | `[...a]`, `[...a, ...b]` |

## Lire et écrire des éléments

### Accès par indice et `at`

```js
const notes = [12, 15, 9, 18];

console.log(notes[0]); // 12
console.log(notes[10]); // undefined (hors limites : pas d'erreur)
console.log(notes[notes.length - 1]); // 18 (dernier élément, ancienne écriture)
console.log(notes.at(-1)); // 18
console.log(notes.at(-2)); // 9
console.log(notes[-1]); // undefined
```

`at(indice)` (ES2022) accepte les indices **négatifs**, comptés depuis la fin. Avec les crochets, `-1` n'est pas un indice mais une clé `"-1"` qui n'existe pas : d'où `undefined`.

### Modifier un élément et la propriété `length`

```js
const notes = [12, 15, 9];
notes[1] = 16;
console.log(notes); // [ 12, 16, 9 ]

// Écrire loin après la fin crée des trous
notes[5] = 20;
console.log(notes); // [ 12, 16, 9, <2 empty items>, 20 ]
console.log(notes.length); // 6

// `length` est modifiable : la réduire tronque le tableau
notes.length = 2;
console.log(notes); // [ 12, 16 ]
```

`length` vaut toujours « plus grand indice + 1 », pas forcément le nombre de valeurs réellement présentes.

### Vider un tableau : `length = 0` ou nouveau tableau

```js
const original = ["a", "b"];
const autreReference = original;

original.length = 0; // vide le tableau lui-même
console.log(autreReference); // []

let liste = ["a", "b"];
const copieReference = liste;
liste = []; // crée un NOUVEAU tableau ; l'ancien existe toujours
console.log(copieReference); // [ 'a', 'b' ]
```

Choisissez selon l'intention : `length = 0` vide le tableau pour tous ceux qui le référencent ; réassigner (`let` obligatoire) ne touche pas l'ancien tableau. Rappel : `const` empêche la réassignation, pas la modification du contenu (voir [Variables](../02-variables/README.md)).

## Ajouter et supprimer des éléments

### Aux extrémités : `push`, `pop`, `unshift`, `shift`

| Méthode | Effet | Retourne |
| --- | --- | --- |
| `push(...elements)` | ajoute à la fin | la nouvelle longueur |
| `pop()` | retire le dernier | l'élément retiré (`undefined` si vide) |
| `unshift(...elements)` | ajoute au début | la nouvelle longueur |
| `shift()` | retire le premier | l'élément retiré (`undefined` si vide) |

```js
const file = ["Alice", "Bruno"];

console.log(file.push("Chloé")); // 3
console.log(file.push("David", "Emma")); // 5
console.log(file.pop()); // Emma
console.log(file.unshift("Zoé")); // 5
console.log(file.shift()); // Zoé
console.log(file); // [ 'Alice', 'Bruno', 'Chloé', 'David' ]
```

`push` + `pop` forment une **pile** (le dernier arrivé sort le premier : historique d'annulation, parcours en profondeur). `push` + `shift` forment une **file** (le premier arrivé sort le premier : file d'attente). Attention : `shift` et `unshift` doivent décaler tous les éléments, leur coût grandit avec la taille du tableau (voir [Complexité et performance](#complexité-et-performance)).

### Au milieu : `splice`

`splice(debut, nombreASupprimer, ...aInserer)` est le couteau suisse des modifications : il supprime, insère ou remplace, **modifie le tableau** et retourne le tableau des éléments supprimés.

```js
const mois = ["jan", "fév", "avr", "mai"];

// Insérer "mars" à l'indice 2 sans rien supprimer
mois.splice(2, 0, "mars");
console.log(mois); // [ 'jan', 'fév', 'mars', 'avr', 'mai' ]

// Supprimer 2 éléments à partir de l'indice 3
const retires = mois.splice(3, 2);
console.log(retires); // [ 'avr', 'mai' ]
console.log(mois); // [ 'jan', 'fév', 'mars' ]

// Remplacer 1 élément à l'indice 0
mois.splice(0, 1, "janvier");
console.log(mois); // [ 'janvier', 'fév', 'mars' ]

// Indice négatif : compté depuis la fin ; sans 2e argument, supprime jusqu'au bout
mois.splice(-1);
console.log(mois); // [ 'janvier', 'fév' ]
```

### Supprimer un élément par sa valeur

```js
const taches = ["courses", "sport", "lecture"];

// Version mutante : trouver l'indice, vérifier, puis splice
const indice = taches.indexOf("sport");
if (indice !== -1) taches.splice(indice, 1);
console.log(taches); // [ 'courses', 'lecture' ]

// Version non mutante : filter crée un nouveau tableau
const sansLecture = taches.filter((tache) => tache !== "lecture");
console.log(sansLecture); // [ 'courses' ]
```

> [!WARNING]
> Ne faites jamais `tableau.splice(tableau.indexOf(x), 1)` sans vérifier l'indice : si `x` est absent, `indexOf` renvoie `-1`, et `splice(-1, 1)` supprime… le dernier élément.

Et n'utilisez pas `delete tableau[i]` : il retire la valeur mais laisse un trou, sans décaler les éléments ni changer `length`.

## Méthodes mutantes et non mutantes

Certaines méthodes **modifient le tableau sur lequel on les appelle** (elles le « mutent »), d'autres **en créent un nouveau** et laissent l'original intact. Confondre les deux est l'une des sources de bugs les plus fréquentes, parce qu'un tableau est manipulé par **référence** : si une fonction mute un tableau reçu en argument, l'appelant voit le changement.

```js
function classer(notes) {
  return notes.sort((a, b) => a - b); // ❌ sort trie le tableau de l'appelant
}

const notesEleve = [14, 9, 17];
const classees = classer(notesEleve);

console.log(notesEleve); // [ 9, 14, 17 ] ← modifié !
console.log(classees === notesEleve); // true : c'est le même tableau
```

```js
function classer(notes) {
  return notes.toSorted((a, b) => a - b); // ✅ nouveau tableau (ES2023)
}

const notesEleve = [14, 9, 17];
const classees = classer(notesEleve);

console.log(notesEleve); // [ 14, 9, 17 ]
console.log(classees); // [ 9, 14, 17 ]
```

### Tableau récapitulatif

| Méthode | Rôle | Retourne | Mute ? |
| --- | --- | --- | --- |
| `push`, `unshift` | ajouter à la fin, au début | nouvelle longueur | **oui** |
| `pop`, `shift` | retirer le dernier, le premier | élément retiré | **oui** |
| `splice` | supprimer, insérer, remplacer | éléments supprimés | **oui** |
| `sort` | trier | **le même tableau** | **oui** |
| `reverse` | inverser | **le même tableau** | **oui** |
| `fill` | remplir | le même tableau | **oui** |
| `copyWithin` | copier une portion ailleurs dans le tableau | le même tableau | **oui** |
| `tab[i] = v`, `tab.length = n` | écrire, tronquer | — | **oui** |
| `toSorted` (ES2023) | trier | nouveau tableau | non |
| `toReversed` (ES2023) | inverser | nouveau tableau | non |
| `toSpliced` (ES2023) | supprimer, insérer, remplacer | nouveau tableau | non |
| `with` (ES2023) | remplacer un élément | nouveau tableau | non |
| `slice` | extraire une portion | nouveau tableau | non |
| `concat` | concaténer | nouveau tableau | non |
| `map`, `filter` | transformer, filtrer | nouveau tableau | non |
| `flat`, `flatMap` (ES2019) | aplatir | nouveau tableau | non |
| `reduce`, `reduceRight` | agréger | une valeur | non |
| `join` | assembler en chaîne | chaîne | non |
| `at` (ES2022) | lire un élément | élément | non |
| `indexOf`, `lastIndexOf`, `includes` (ES2016) | chercher une valeur | indice / booléen | non |
| `find`, `findIndex`, `findLast`, `findLastIndex` (ES2023) | chercher par condition | élément / indice | non |
| `some`, `every` | tester | booléen | non |
| `forEach` | parcourir | `undefined` | non (sauf si le rappel mute) |
| `keys`, `values`, `entries` | itérer | itérateur | non |

Et la correspondance entre les deux familles :

| Mutante | Équivalent non mutant |
| --- | --- |
| `tab.push(x)` | `[...tab, x]` |
| `tab.unshift(x)` | `[x, ...tab]` |
| `tab.pop()` | `tab.slice(0, -1)` (et `tab.at(-1)` pour la valeur) |
| `tab.shift()` | `tab.slice(1)` (et `tab[0]` pour la valeur) |
| `tab.splice(i, n, ...x)` | `tab.toSpliced(i, n, ...x)` |
| `tab.sort(f)` | `tab.toSorted(f)` |
| `tab.reverse()` | `tab.toReversed()` |
| `tab[i] = v` | `tab.with(i, v)` |

### `toSorted`, `toReversed`, `toSpliced` et `with` (ES2023)

Ces quatre méthodes sont les versions « copiantes » de `sort`, `reverse`, `splice` et de l'affectation par indice. Elles sont disponibles dans tous les navigateurs depuis 2023 (Baseline 2023) et dans Node.js 20 et suivants.

```js
const original = [3, 1, 2];

console.log(original.toSorted()); // [ 1, 2, 3 ]
console.log(original.toReversed()); // [ 2, 1, 3 ]
console.log(original.toSpliced(1, 1, "x", "y")); // [ 3, 'x', 'y', 2 ]
console.log(original.with(0, 99)); // [ 99, 1, 2 ]
console.log(original.with(-1, 0)); // [ 3, 1, 0 ]
console.log(original); // [ 3, 1, 2 ] : intact

try {
  original.with(5, 0);
} catch (erreur) {
  console.log(erreur.name); // RangeError
}
```

Dans du code plus ancien, vous verrez la même intention écrite avec une copie préalable : `[...tab].sort(f)` ou `tab.slice().reverse()`.

> [!IMPORTANT]
> « Non mutant » ne veut pas dire « copie profonde ». Le nouveau tableau contient **les mêmes objets** que l'original : modifier `copie[0].prix` modifie aussi `original[0].prix`. Pour copier en profondeur, voir [Conversions, copies et spread](#conversions-copies-et-spread).

```js
const produits = [{ nom: "Stylo", prix: 2 }];
const copie = produits.toSorted();

copie[0].prix = 3;
console.log(produits[0].prix); // 3
```

## Parcourir un tableau

Les boucles sont détaillées au chapitre [Boucles](../05-boucles/README.md) ; voici ce qui est propre aux tableaux.

```js
const fruits = ["pomme", "kiwi", "mangue"];

// for…of : le plus lisible, compatible avec break, continue et await
for (const fruit of fruits) {
  console.log(fruit);
}

// entries() : l'indice et la valeur
for (const [indice, fruit] of fruits.entries()) {
  console.log(`${indice + 1}. ${fruit}`);
}

// forEach : un rappel par élément
fruits.forEach((fruit, indice) => {
  console.log(indice, fruit);
});
// Affiche successivement :
// pomme / kiwi / mangue
// 1. pomme / 2. kiwi / 3. mangue
// 0 pomme / 1 kiwi / 2 mangue
```

`forEach` a trois limites : on ne peut pas l'interrompre (un `return` dans le rappel passe seulement à l'élément suivant ; `break` est une erreur de syntaxe), il retourne toujours `undefined`, et il **n'attend pas** les rappels `async` (voir [Tableaux et code asynchrone](#tableaux-et-code-asynchrone)).

| Besoin | Choix |
| --- | --- |
| Parcourir simplement, éventuellement s'arrêter | `for…of` |
| Besoin de l'indice | `for (const [i, x] of tab.entries())` |
| Parcours à l'envers, par pas de 2, indices fins | `for (let i = …; …; …)` |
| Produire un nouveau tableau ou une valeur | `map`, `filter`, `reduce`… plutôt qu'une boucle |
| Attendre une opération asynchrone à chaque tour | `for…of` avec `await` |

## Rechercher

Choisissez la méthode d'après **la question posée** :

| Question | Méthode | Si rien n'est trouvé |
| --- | --- | --- |
| La valeur `x` est-elle présente ? | `includes(x)` | `false` |
| À quel indice se trouve `x` ? | `indexOf(x)`, `lastIndexOf(x)` | `-1` |
| Quel est le premier élément qui vérifie une condition ? | `find(predicat)` | `undefined` |
| À quel indice ? | `findIndex(predicat)` | `-1` |
| Le dernier élément qui vérifie une condition, et son indice ? | `findLast`, `findLastIndex` (ES2023) | `undefined`, `-1` |
| Au moins un élément vérifie-t-il la condition ? | `some(predicat)` | `false` |
| Tous les éléments la vérifient-ils ? | `every(predicat)` | — |

### Chercher une valeur : `includes` et `indexOf`

```js
const couleurs = ["rouge", "vert", "bleu", "vert"];

console.log(couleurs.includes("bleu")); // true
console.log(couleurs.indexOf("vert")); // 1
console.log(couleurs.lastIndexOf("vert")); // 3
console.log(couleurs.indexOf("vert", 2)); // 3 (recherche à partir de l'indice 2)
console.log(couleurs.indexOf("jaune")); // -1
```

Les deux comparent avec l'égalité stricte (`===`), à une différence près : `includes` sait trouver `NaN`, pas `indexOf`.

```js
const mesures = [3, NaN, 7];

console.log(mesures.indexOf(NaN)); // -1
console.log(mesures.includes(NaN)); // true
console.log([1, 2, 3].includes("2")); // false (pas de conversion de type)
console.log([{ id: 1 }].includes({ id: 1 })); // false (un autre objet, une autre référence)
```

Pour une simple question de présence, préférez `includes` à `indexOf(x) !== -1` : l'intention est plus claire.

### Chercher par condition : `find` et ses variantes

```js
const utilisateurs = [
  { id: 1, nom: "Alice", age: 28, actif: true },
  { id: 2, nom: "Bruno", age: 35, actif: false },
  { id: 3, nom: "Chloé", age: 42, actif: true },
];

console.log(utilisateurs.find((u) => u.age > 30)); // { id: 2, nom: 'Bruno', age: 35, actif: false }
console.log(utilisateurs.findIndex((u) => u.nom === "Chloé")); // 2
console.log(utilisateurs.findLast((u) => u.actif).nom); // Chloé
console.log(utilisateurs.findLastIndex((u) => u.age < 30)); // 0
console.log(utilisateurs.find((u) => u.age > 100)); // undefined
```

`find` s'arrête au premier élément trouvé. Comme il peut retourner `undefined`, protégez l'accès qui suit avec `?.` : `utilisateurs.find(…)?.nom`.

### Tester : `some` et `every`

```js
const notes = [12, 8, 15, 19];

console.log(notes.some((note) => note < 10)); // true : au moins une note sous 10
console.log(notes.every((note) => note >= 10)); // false : pas toutes
console.log([].every((note) => note >= 10)); // true (!)
console.log([].some((note) => note >= 10)); // false
```

`some` s'arrête dès qu'il trouve un élément qui convient, `every` dès qu'il en trouve un qui ne convient pas. Sur un tableau **vide**, `every` renvoie `true` (rien ne contredit la condition) : pensez-y avant d'écrire `if (taches.every((t) => t.terminee)) afficherBravo()`.

## Transformer un tableau

`map`, `filter` et `reduce` sont les trois méthodes qui remplacent la plupart des boucles. Leurs rappels reçoivent tous `(element, indice, tableau)` ; on n'utilise souvent que le premier argument.

### `map` : transformer chaque élément

`map` retourne un nouveau tableau **de même longueur**, où chaque élément est le résultat du rappel.

```js
const prixHT = [10, 25, 4.5];
const prixTTC = prixHT.map((prix) => Math.round(prix * 1.2 * 100) / 100);
console.log(prixTTC); // [ 12, 30, 5.4 ]

const utilisateurs = [
  { prenom: "Alice", nom: "Martin" },
  { prenom: "Bruno", nom: "Durand" },
];
console.log(utilisateurs.map((u) => `${u.prenom} ${u.nom}`)); // [ 'Alice Martin', 'Bruno Durand' ]

// Retourner un objet depuis une fléchée : parenthèses obligatoires
const avecInitiales = utilisateurs.map((u) => ({ ...u, initiales: u.prenom[0] + u.nom[0] }));
console.log(avecInitiales[0]); // { prenom: 'Alice', nom: 'Martin', initiales: 'AM' }
```

Sans les parenthèses, `(u) => { ...u }` serait lu comme un bloc d'instructions, pas comme un objet.

> [!WARNING]
> `["1", "2", "3"].map(parseInt)` donne `[ 1, NaN, NaN ]`. `map` passe **trois** arguments au rappel, et `parseInt` interprète le deuxième (l'indice) comme une base : `parseInt("2", 1)` et `parseInt("3", 2)` sont invalides. Écrivez `map(Number)` ou `map((s) => Number.parseInt(s, 10))`.

```js
console.log(["1", "2", "3"].map(parseInt)); // [ 1, NaN, NaN ]
console.log(["1", "2", "3"].map(Number)); // [ 1, 2, 3 ]
```

N'utilisez pas `map` pour de simples effets de bord (afficher, envoyer) : vous créeriez un tableau inutile. C'est le rôle de `for…of` ou `forEach`.

### `filter` : garder certains éléments

`filter` retourne un nouveau tableau avec les éléments pour lesquels le rappel renvoie une valeur vraie.

```js
const commandes = [
  { id: 1, montant: 120, payee: true },
  { id: 2, montant: 45, payee: false },
  { id: 3, montant: 300, payee: true },
];

const payees = commandes.filter((c) => c.payee);
console.log(payees.map((c) => c.id)); // [ 1, 3 ]

const grosses = commandes.filter((c) => c.montant >= 100 && c.payee);
console.log(grosses.length); // 2
```

L'astuce `filter(Boolean)` retire toutes les valeurs « falsy », y compris `0` et `""`, ce qui n'est pas toujours voulu :

```js
const valeurs = [0, 1, "", "a", null, undefined, false];

console.log(valeurs.filter(Boolean)); // [ 1, 'a' ]
console.log(valeurs.filter((v) => v != null)); // [ 0, 1, '', 'a', false ] (retire seulement null et undefined)
```

### `reduce` : agréger en une seule valeur

`reduce(rappel, valeurInitiale)` parcourt le tableau en transportant un **accumulateur** : à chaque tour, le rappel reçoit l'accumulateur et l'élément courant, et retourne le nouvel accumulateur.

```js
const montants = [5, 10, 20];
const total = montants.reduce((somme, montant) => somme + montant, 0);
console.log(total); // 35
```

| Tour | `somme` (accumulateur) | `montant` | Valeur retournée |
| --- | --- | --- | --- |
| 1 | `0` (valeur initiale) | `5` | `5` |
| 2 | `5` | `10` | `15` |
| 3 | `15` | `20` | `35` |

L'accumulateur peut être de n'importe quel type : un nombre, une chaîne, un objet, un tableau.

```js
const panier = [
  { nom: "Ordinateur", prix: 1200, quantite: 1 },
  { nom: "Câble", prix: 15, quantite: 3 },
  { nom: "Sac", prix: 60, quantite: 2 },
];

// Total du panier
const total = panier.reduce((somme, ligne) => somme + ligne.prix * ligne.quantite, 0);
console.log(total); // 1365

// Ligne la plus chère
const plusChere = panier.reduce((max, ligne) =>
  ligne.prix * ligne.quantite > max.prix * max.quantite ? ligne : max,
);
console.log(plusChere.nom); // Ordinateur

// Compter les mots
const mots = ["chat", "chien", "chat", "poisson", "chat"];
const occurrences = mots.reduce((compte, mot) => {
  compte[mot] = (compte[mot] ?? 0) + 1;
  return compte;
}, {});
console.log(occurrences); // { chat: 3, chien: 1, poisson: 1 }
```

> [!WARNING]
> Donnez **toujours** une valeur initiale, sauf cas particulier comme la recherche du maximum ci-dessus sur un tableau dont vous savez qu'il n'est pas vide. Sans elle, `reduce` prend le premier élément comme accumulateur… et lève une erreur sur un tableau vide.

```js
try {
  [].reduce((somme, n) => somme + n);
} catch (erreur) {
  console.log(erreur.message); // Reduce of empty array with no initial value
}

console.log([].reduce((somme, n) => somme + n, 0)); // 0
```

`reduce` est puissant mais pas toujours lisible. Si vous écrivez un `reduce` qui fait un `map` puis un `filter`, écrivez plutôt `map` puis `filter`. Pour compter ou regrouper, [`Object.groupBy`](#regrouper) ou une simple boucle `for…of` sont souvent plus clairs. `reduceRight` fait la même chose en partant de la fin.

### `flat` et `flatMap` (ES2019) : aplatir

```js
const imbrique = [1, [2, [3, [4]]]];

console.log(imbrique.flat()); // [ 1, 2, [ 3, [ 4 ] ] ] (un niveau par défaut)
console.log(imbrique.flat(2)); // [ 1, 2, 3, [ 4 ] ]
console.log(imbrique.flat(Infinity)); // [ 1, 2, 3, 4 ]
```

`flatMap(rappel)` équivaut à `map(rappel).flat()` en une seule passe. Il sert quand chaque élément produit **zéro, un ou plusieurs** résultats :

```js
const commandes = [
  { client: "Ana", articles: ["livre", "stylo"] },
  { client: "Léo", articles: [] },
  { client: "Mia", articles: ["sac"] },
];
console.log(commandes.flatMap((c) => c.articles)); // [ 'livre', 'stylo', 'sac' ]

const phrases = ["Bonjour le monde", "Salut"];
console.log(phrases.flatMap((p) => p.split(" "))); // [ 'Bonjour', 'le', 'monde', 'Salut' ]

// Filtrer et transformer en une passe : [] pour ignorer, [valeur] pour garder
const saisies = ["4", "abc", "15"];
const doubles = saisies.flatMap((s) => {
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) ? [] : [n * 2];
});
console.log(doubles); // [ 8, 30 ]
```

### `slice`, `concat` et `join`

```js
const lettres = ["a", "b", "c", "d", "e"];

console.log(lettres.slice(1, 3)); // [ 'b', 'c' ] (de l'indice 1 inclus à 3 exclu)
console.log(lettres.slice(-2)); // [ 'd', 'e' ] (les deux derniers)
console.log(lettres.slice(2)); // [ 'c', 'd', 'e' ]

console.log([1, 2].concat(3, [4, 5], [[6]])); // [ 1, 2, 3, 4, 5, [ 6 ] ]

console.log(lettres.join("")); // abcde
console.log(lettres.join(" - ")); // a - b - c - d - e
console.log(String([1, [2, 3]])); // 1,2,3 (conversion implicite : join(","))
console.log([null, undefined, 1].join("-")); // --1
```

`slice` et `splice` se ressemblent mais n'ont rien à voir :

| | `slice(debut, fin)` | `splice(debut, nombre, ...ajouts)` |
| --- | --- | --- |
| Modifie le tableau | non | **oui** |
| Second argument | indice de **fin** (exclu) | **nombre** d'éléments à supprimer |
| Retourne | la portion extraite | les éléments supprimés |

## Trier

### Le piège du tri par défaut

Sans comparateur, `sort` **convertit les éléments en chaînes** et les compare caractère par caractère (selon les codes UTF-16). Pour des nombres, le résultat est faux :

```js
console.log([10, 9, 1, 100].toSorted()); // [ 1, 10, 100, 9 ]
console.log([10, 9, 1, 100].toSorted((a, b) => a - b)); // [ 1, 9, 10, 100 ]
console.log([10, 9, 1, 100].toSorted((a, b) => b - a)); // [ 100, 10, 9, 1 ]
```

Les exemples de cette section utilisent `toSorted` ; tout s'applique à l'identique à `sort`, qui trie sur place.

### Le contrat du comparateur

Le comparateur `(a, b) => nombre` indique l'ordre de deux éléments :

- un nombre **négatif** : `a` doit venir avant `b` ;
- un nombre **positif** : `b` doit venir avant `a` ;
- `0` : ordre indifférent (leur ordre d'origine est conservé).

`a - b` respecte ce contrat pour des nombres. Un comparateur qui retourne un **booléen** ne le respecte pas (`false` vaut 0, `true` vaut 1, jamais de négatif) et donne des résultats faux :

```js
console.log([3, 1, 2].toSorted((a, b) => a > b)); // [ 3, 1, 2 ] ❌ rien n'est trié
console.log([3, 1, 2].toSorted((a, b) => a - b)); // [ 1, 2, 3 ] ✅
```

Les valeurs `undefined` sont toujours placées à la fin, sans passer par le comparateur :

```js
console.log([3, undefined, 1].toSorted((a, b) => a - b)); // [ 1, 3, undefined ]
```

### Trier des chaînes : `localeCompare` et `Intl.Collator`

Le tri par défaut place les majuscules avant les minuscules et les lettres accentuées après le `z`. Pour un ordre conforme à la langue, utilisez `localeCompare` :

```js
const prenoms = ["zoé", "Émile", "adam", "Bruno"];

console.log(prenoms.toSorted()); // [ 'Bruno', 'adam', 'zoé', 'Émile' ]
console.log(prenoms.toSorted((a, b) => a.localeCompare(b, "fr"))); // [ 'adam', 'Bruno', 'Émile', 'zoé' ]
```

Pour trier beaucoup de chaînes, ou pour des options comme le **tri numérique** (« photo2 » avant « photo10 »), créez un `Intl.Collator` une fois et passez sa méthode `compare` :

```js
const fichiers = ["photo10.jpg", "photo2.jpg", "Photo1.jpg"];

console.log(fichiers.toSorted()); // [ 'Photo1.jpg', 'photo10.jpg', 'photo2.jpg' ]

const collateur = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });
console.log(fichiers.toSorted(collateur.compare)); // [ 'Photo1.jpg', 'photo2.jpg', 'photo10.jpg' ]
console.log(collateur.compare("École", "ecole")); // 0 (accents et casse ignorés)
```

Les comparaisons de chaînes sont détaillées au chapitre [Chaînes de caractères](../07-chaines/README.md).

### Trier des objets, sur plusieurs critères

On compare la propriété voulue. Pour plusieurs critères, on enchaîne les comparaisons avec `||` : si la première donne `0` (égalité), on passe à la suivante.

```js
const eleves = [
  { nom: "Lina", classe: "B", moyenne: 14 },
  { nom: "Hugo", classe: "A", moyenne: 12 },
  { nom: "Emma", classe: "B", moyenne: 16 },
  { nom: "Noah", classe: "A", moyenne: 12 },
  { nom: "Adèle", classe: "A", moyenne: 15 },
];

// Par classe (A → Z), puis par moyenne décroissante, puis par nom
const classement = eleves.toSorted(
  (a, b) =>
    a.classe.localeCompare(b.classe) ||
    b.moyenne - a.moyenne ||
    a.nom.localeCompare(b.nom, "fr"),
);

console.log(classement.map((e) => `${e.classe} ${e.moyenne} ${e.nom}`));
// [ 'A 15 Adèle', 'A 12 Hugo', 'A 12 Noah', 'B 16 Emma', 'B 14 Lina' ]
```

### La stabilité du tri (ES2019)

Depuis ES2019, le tri est **stable** : deux éléments jugés égaux par le comparateur gardent leur ordre d'origine. On peut donc trier en plusieurs passes, du critère secondaire au critère principal :

```js
const taches = [
  { titre: "Facture", priorite: 2 },
  { titre: "Appel", priorite: 1 },
  { titre: "Budget", priorite: 2 },
  { titre: "Courrier", priorite: 1 },
];

const parTitre = taches.toSorted((a, b) => a.titre.localeCompare(b.titre, "fr"));
const parPriorite = parTitre.toSorted((a, b) => a.priorite - b.priorite);

console.log(parPriorite.map((t) => `${t.priorite} ${t.titre}`));
// [ '1 Appel', '1 Courrier', '2 Budget', '2 Facture' ]
```

### Trier des dates

Un objet `Date` se convertit en nombre (son horodatage) dans une soustraction ; des dates ISO 8601 de même format se trient comme des chaînes.

```js
const evenements = [
  { nom: "Salon", date: new Date("2026-12-03") },
  { nom: "Atelier", date: new Date("2026-11-20") },
];
const chronologique = evenements.toSorted((a, b) => a.date - b.date);
console.log(chronologique.map((e) => e.nom)); // [ 'Atelier', 'Salon' ]

const isos = ["2026-12-03", "2025-01-15", "2026-02-28"];
console.log(isos.toSorted()); // [ '2025-01-15', '2026-02-28', '2026-12-03' ]
```

Pour mélanger un tableau, n'utilisez pas `sort(() => Math.random() - 0.5)` : le résultat est biaisé. Voir la recette [Mélanger un tableau](#mélanger-un-tableau-fisher-yates).

## Regrouper

### `Object.groupBy` (ES2024)

`Object.groupBy(elements, fonctionCle)` range chaque élément dans un groupe dont le nom est la valeur retournée par la fonction. Le résultat est un objet dont chaque propriété est un tableau.

```js
const inventaire = [
  { nom: "pomme", type: "fruit", quantite: 5 },
  { nom: "carotte", type: "légume", quantite: 0 },
  { nom: "banane", type: "fruit", quantite: 12 },
  { nom: "poireau", type: "légume", quantite: 8 },
];

const parType = Object.groupBy(inventaire, (produit) => produit.type);

console.log(Object.keys(parType)); // [ 'fruit', 'légume' ]
console.log(parType.fruit.map((p) => p.nom)); // [ 'pomme', 'banane' ]

// La clé peut être calculée
const parStock = Object.groupBy(inventaire, ({ quantite }) =>
  quantite === 0 ? "rupture" : quantite < 10 ? "faible" : "ok",
);
console.log(Object.keys(parStock)); // [ 'faible', 'rupture', 'ok' ]
console.log(parStock.rupture[0].nom); // carotte
```

Les groupes apparaissent dans l'ordre où leur premier élément a été rencontré. L'objet retourné n'a **pas de prototype** : `console.log` l'affiche avec la mention `[Object: null prototype]`, et il n'hérite pas de méthodes comme `hasOwnProperty` (utilisez `Object.hasOwn`). C'est voulu : un groupe nommé `"constructor"` ou `"__proto__"` ne pose ainsi aucun problème (voir [Objets](../10-objets/README.md)).

```js
const mots = ["pomme", "kiwi", "ananas"];
console.log(Object.groupBy(mots, (m) => (m.length > 4 ? "long" : "court")));
// [Object: null prototype] {
//   long: [ 'pomme', 'ananas' ],
//   court: [ 'kiwi' ]
// }
```

### `Map.groupBy` (ES2024) : des clés de n'importe quel type

Les clés d'un objet sont toujours des chaînes (ou des symboles). `Map.groupBy` produit une [`Map`](../12-collections/README.md), dont les clés gardent leur type : booléens, nombres, objets…

```js
const notes = [8, 12, 15, 9, 18];
const parReussite = Map.groupBy(notes, (note) => note >= 10);

console.log(parReussite); // Map(2) { false => [ 8, 9 ], true => [ 12, 15, 18 ] }
console.log(parReussite.get(true)); // [ 12, 15, 18 ]
console.log(Object.groupBy(notes, (note) => note >= 10).true); // [ 12, 15, 18 ] (clé convertie en "true")
```

`Object.groupBy` et `Map.groupBy` sont disponibles dans tous les navigateurs depuis 2024 (Baseline 2024) et dans Node.js 21 et suivants. Pour un environnement plus ancien, une boucle suffit :

```js
function grouperPar(elements, fonctionCle) {
  const groupes = Object.create(null);
  for (const element of elements) {
    const cle = fonctionCle(element);
    (groupes[cle] ??= []).push(element);
  }
  return groupes;
}

const villes = ["Lyon", "Lille", "Paris", "Pau", "Nice"];
console.log(grouperPar(villes, (v) => v[0]));
// [Object: null prototype] {
//   L: [ 'Lyon', 'Lille' ],
//   P: [ 'Paris', 'Pau' ],
//   N: [ 'Nice' ]
// }
```

### Agréger chaque groupe

Après le regroupement, on calcule souvent un total ou un effectif par groupe. `Object.entries` et `Object.fromEntries` (voir [Objets](../10-objets/README.md)) font le pont :

```js
const ventes = [
  { region: "Nord", montant: 120 },
  { region: "Sud", montant: 80 },
  { region: "Nord", montant: 45 },
  { region: "Est", montant: 200 },
];

const parRegion = Object.groupBy(ventes, (v) => v.region);
const totaux = Object.fromEntries(
  Object.entries(parRegion).map(([region, lignes]) => [
    region,
    lignes.reduce((somme, l) => somme + l.montant, 0),
  ]),
);

console.log(totaux); // { Nord: 165, Sud: 80, Est: 200 }
```

## Conversions, copies et spread

### Entre chaînes et tableaux

```js
console.log("a,b,c".split(",")); // [ 'a', 'b', 'c' ]
console.log(["2026", "11", "06"].join("-")); // 2026-11-06

// split("") découpe en unités de code UTF-16 : les émojis sont coupés en deux
console.log("a😀b".split("").length); // 4
console.log([..."a😀b"]); // [ 'a', '😀', 'b' ]
console.log(Array.from("a😀b").length); // 3
```

Le spread et `Array.from` découpent par **points de code**, ce qui suffit dans la plupart des cas. Pour les émojis composés (drapeaux, familles, couleurs de peau), il faut `Intl.Segmenter` (voir [Chaînes de caractères](../07-chaines/README.md)).

### Entre collections et tableaux

```js
const ensemble = new Set(["rouge", "vert", "rouge"]);
console.log([...ensemble]); // [ 'rouge', 'vert' ]

const capitales = new Map([["France", "Paris"], ["Italie", "Rome"]]);
console.log([...capitales.keys()]); // [ 'France', 'Italie' ]
console.log([...capitales]); // [ [ 'France', 'Paris' ], [ 'Italie', 'Rome' ] ]

const stock = { pommes: 3, poires: 0 };
console.log(Object.entries(stock)); // [ [ 'pommes', 3 ], [ 'poires', 0 ] ]
console.log(Object.fromEntries([["a", 1], ["b", 2]])); // { a: 1, b: 2 }
```

Les objets « semblables à des tableaux » (`arguments`, `NodeList` du DOM, `{ length: … }`) ont des indices et une `length` mais pas les méthodes de tableau : convertissez-les avec `Array.from` (ou le spread pour les itérables).

### Le spread dans les appels de fonction

```js
const temperatures = [12, 18, 9, 21];

console.log(Math.max(...temperatures)); // 21
console.log(Math.min(...temperatures)); // 9
console.log(Math.max(...[])); // -Infinity (tableau vide)
```

Chaque élément devient un argument. Au-delà d'environ 100 000 éléments dans V8 (la limite dépend du moteur), l'appel échoue avec `RangeError: Maximum call stack size exceeded` : pour de très grands tableaux, utilisez `reduce` ou une boucle.

```js
const grand = Array.from({ length: 500_000 }, (_, i) => i);

try {
  Math.max(...grand);
} catch (erreur) {
  console.log(erreur.name); // RangeError
}

const maximum = grand.reduce((max, n) => (n > max ? n : max), -Infinity);
console.log(maximum); // 499999
```

### Copies superficielles et profondes

Toutes les copies « simples » (`[...tab]`, `tab.slice()`, `Array.from(tab)`, `toSorted()`…) sont **superficielles** : le nouveau tableau contient les mêmes objets. `structuredClone` copie en profondeur (détails et limites au chapitre [Objets](../10-objets/README.md)).

```js
const equipe = [{ nom: "Ana", score: 10 }];

const copieSuperficielle = [...equipe];
const copieProfonde = structuredClone(equipe);

equipe[0].score = 99;
console.log(copieSuperficielle[0].score); // 99 : objet partagé
console.log(copieProfonde[0].score); // 10 : objet indépendant
console.log(copieSuperficielle === equipe); // false : le tableau, lui, est neuf
```

### Comparer deux tableaux

`===` compare les **références**, pas le contenu : deux tableaux distincts ne sont jamais égaux.

```js
import { isDeepStrictEqual } from "node:util";

console.log([1, 2] === [1, 2]); // false

const memesElements = (a, b) =>
  a.length === b.length && a.every((x, i) => Object.is(x, b[i]));
console.log(memesElements([1, 2, NaN], [1, 2, NaN])); // true
console.log(memesElements([1, 2], [2, 1])); // false

// Dans Node.js, comparaison profonde (objets imbriqués compris)
console.log(isDeepStrictEqual([{ a: 1 }], [{ a: 1 }])); // true
```

## Déstructuration, les bases

La déstructuration extrait des éléments dans des variables, **par position** :

```js
const coordonnees = [48.85, 2.35, 35];

const [latitude, longitude] = coordonnees;
console.log(latitude, longitude); // 48.85 2.35

const [, , altitude] = coordonnees; // on saute les deux premiers
console.log(altitude); // 35

const [premier, ...reste] = [1, 2, 3, 4];
console.log(premier, reste); // 1 [ 2, 3, 4 ]

const [x = 0, y = 0] = [5]; // valeurs par défaut
console.log(x, y); // 5 0

let gauche = "A";
let droite = "B";
[gauche, droite] = [droite, gauche]; // échange sans variable temporaire
console.log(gauche, droite); // B A
```

Elle est très pratique pour une fonction qui retourne plusieurs valeurs (`const [min, max] = bornes(notes)`) et avec `entries()`. Toutes les formes (imbrication, objets, paramètres) sont au chapitre [Syntaxe moderne](../11-syntaxe-moderne/README.md).

## Tableaux creux

Un tableau **creux** (*sparse array*) contient des cases qui n'existent pas, ce qui est différent d'une case contenant `undefined`. On en crée sans le vouloir avec `new Array(n)`, `delete tab[i]`, une écriture loin après la fin, ou une virgule en trop dans un littéral.

```js
const creux = [1, , 3];

console.log(creux); // [ 1, <1 empty item>, 3 ]
console.log(creux.length); // 3
console.log(1 in creux); // false : la case 1 n'existe pas
console.log(1 in [1, undefined, 3]); // true : la case existe et vaut undefined
```

Le problème : les méthodes ne traitent pas les trous de la même façon.

```js
const creux = [1, , 3];

let appels = 0;
creux.forEach(() => appels++);
console.log(appels); // 2 : forEach saute le trou

console.log(creux.map((x) => x * 2)); // [ 2, <1 empty item>, 6 ] : map conserve le trou
console.log([...creux]); // [ 1, undefined, 3 ] : le spread le remplit
console.log(creux.includes(undefined)); // true
console.log(creux.indexOf(undefined)); // -1
console.log(new Array(3).map((_, i) => i)); // [ <3 empty items> ] : rien n'est généré !
```

`forEach`, `map`, `filter`, `reduce`, `some`, `every` et `indexOf` sautent les trous ; `for…of`, le spread, `Array.from`, `includes`, `find` et les méthodes ES2023 (`toSorted`…) les voient comme `undefined`. Le plus simple est de ne jamais en créer : utilisez `Array.from({ length: n }, …)` ou `fill`. Les moteurs optimisent d'ailleurs moins bien les tableaux à trous.

## Tableaux multidimensionnels

Une grille, une matrice ou un plateau de jeu se représentent par un tableau de tableaux. On accède à une case par `grille[ligne][colonne]`.

```js
const lignes = 3;
const colonnes = 4;
const grille = Array.from({ length: lignes }, () => new Array(colonnes).fill(0));

grille[1][2] = 5;
console.log(grille); // [ [ 0, 0, 0, 0 ], [ 0, 0, 5, 0 ], [ 0, 0, 0, 0 ] ]
console.log(grille[1][2]); // 5
console.log(grille.flat().reduce((a, b) => a + b, 0)); // 5
```

Créez chaque ligne avec `Array.from(…, () => …)` : `new Array(3).fill(new Array(4).fill(0))` donnerait trois fois **la même ligne** (voir [`fill`](#fill-et-le-piège-de-la-référence-partagée)).

```js
// Morpion : une ligne gagnante ?
const plateau = [
  ["X", "O", "X"],
  ["O", "O", "O"],
  ["X", "", ""],
];

const ligneGagnante = plateau.findIndex(
  (ligne) => ligne[0] !== "" && ligne.every((c) => c === ligne[0]),
);
console.log(ligneGagnante); // 1

// Transposer : les lignes deviennent les colonnes
const matrice = [
  [1, 2, 3],
  [4, 5, 6],
];
const transposee = matrice[0].map((_, c) => matrice.map((ligne) => ligne[c]));
console.log(transposee); // [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]

// Copier une grille : une copie superficielle ne suffit pas
const copie = structuredClone(plateau); // ou plateau.map((ligne) => [...ligne])
copie[2][1] = "O";
console.log(plateau[2][1] === ""); // true : l'original est intact
```

Dans la console d'un navigateur ou de Node, `console.table(grille)` affiche un tableau à deux dimensions sous forme de grille lisible.

## Tableaux et code asynchrone

Les méthodes de tableau ne savent pas attendre. Un rappel `async` retourne une **promesse** ; `map` produit donc un tableau de promesses, qu'il faut attendre avec `Promise.all` (voir [Promesses](../19-promises/README.md)) :

```js
const attendre = (ms) => new Promise((resoudre) => setTimeout(resoudre, ms));

async function chargerUtilisateur(id) {
  await attendre(10); // simule un appel réseau
  return { id, nom: `Utilisateur ${id}` };
}

const ids = [1, 2, 3];
const promesses = ids.map((id) => chargerUtilisateur(id));
console.log(promesses[0] instanceof Promise); // true

const utilisateurs = await Promise.all(promesses); // en parallèle
console.log(utilisateurs.map((u) => u.nom)); // [ 'Utilisateur 1', 'Utilisateur 2', 'Utilisateur 3' ]
```

`forEach` n'attend pas ses rappels `async` : le code qui suit s'exécute avant la fin des traitements. Pour un traitement **séquentiel**, utilisez `for…of` avec `await`.

`Array.fromAsync` (ES2026) est l'équivalent asynchrone d'`Array.from` : il construit un tableau à partir d'un **itérable asynchrone** (un flux, une pagination d'API) en attendant chaque valeur l'une après l'autre. Il est disponible dans tous les navigateurs depuis janvier 2024 et dans Node.js 22 et suivants.

```js
async function* paginer() {
  // simule trois pages renvoyées par une API
  yield ["Alice", "Bruno"];
  yield ["Chloé"];
  yield ["David", "Emma"];
}

const pages = await Array.fromAsync(paginer());
console.log(pages.flat()); // [ 'Alice', 'Bruno', 'Chloé', 'David', 'Emma' ]
```

Les boucles asynchrones, `for await…of`, l'exécution en parallèle avec limite de concurrence et les pièges associés sont au chapitre [async/await](../20-async-await/README.md).

## Tableaux typés (aperçu)

Les **tableaux typés** (`Uint8Array`, `Int32Array`, `Float64Array`…) stockent des nombres d'un type machine précis dans un bloc de mémoire contigu (un `ArrayBuffer`). Leur taille est fixe et ils ne contiennent que des nombres. On les rencontre dès qu'on manipule des données binaires : fichiers, images (`<canvas>`), audio, WebGL/WebGPU, réponses `fetch` lues avec `arrayBuffer()`, cryptographie.

```js
const octets = new Uint8Array([72, 101, 108, 108, 111]);

console.log(octets); // Uint8Array(5) [ 72, 101, 108, 108, 111 ]
console.log(new TextDecoder().decode(octets)); // Hello
console.log(Array.isArray(octets)); // false

// Chaque case est un entier de 0 à 255 : les valeurs hors limites « bouclent »
const pixel = new Uint8Array(3);
pixel[0] = 300;
pixel[1] = -1;
console.log(pixel); // Uint8Array(3) [ 44, 255, 0 ]

// Uint8ClampedArray « écrête » au lieu de boucler (utilisé par <canvas>)
console.log(new Uint8ClampedArray([300, -1])); // Uint8ClampedArray(2) [ 255, 0 ]

// Ils ont la plupart des méthodes de tableau ; sort y est numérique par défaut
console.log(new Int16Array([10, 9, 1, 100]).sort()); // Int16Array(4) [ 1, 9, 10, 100 ]
console.log(Array.from(octets.subarray(0, 2))); // [ 72, 101 ] : retour à un tableau classique
```

Nouveautés récentes : `Float16Array` (ES2025) pour les nombres flottants sur 16 bits (utile en apprentissage automatique et en graphisme), et la conversion `Uint8Array` ↔ base64/hexadécimal (ES2026, voir [Chaînes de caractères](../07-chaines/README.md)).

## Chaîner les méthodes lisiblement

Les méthodes non mutantes retournent un tableau : on peut les enchaîner pour décrire un traitement comme une suite d'étapes.

```js
const commandes = [
  { client: "Ana", montant: 120, statut: "payee" },
  { client: "Léo", montant: 45, statut: "annulee" },
  { client: "Mia", montant: 300, statut: "payee" },
  { client: "Tom", montant: 80, statut: "payee" },
];

// ✅ une étape par ligne, chaque rappel fait une seule chose
const meilleursClients = commandes
  .filter((c) => c.statut === "payee")
  .toSorted((a, b) => b.montant - a.montant)
  .slice(0, 2)
  .map((c) => c.client);

console.log(meilleursClients); // [ 'Mia', 'Ana' ]
```

Quelques règles pour que la chaîne reste lisible :

- **Une étape par ligne**, dans l'ordre logique : filtrer, trier, couper, transformer.
- **Des rappels courts et sans effet de bord.** Si un rappel dépasse quelques lignes, sortez-le dans une fonction nommée : `.filter(estPayee)` se lit comme une phrase.
- **Nommez les résultats intermédiaires** quand la chaîne dépasse quatre ou cinq étapes.
- **Filtrez avant de transformer ou de trier** : on travaille sur moins d'éléments.

Chaque étape crée un tableau intermédiaire et parcourt toutes ses données. C'est négligeable dans l'immense majorité des cas. Quand on ne veut que **les premiers résultats** d'un très grand ensemble, les **Iterator helpers** (ES2025, Node.js 22+ et navigateurs récents) évaluent paresseusement : ils traitent les éléments un par un et s'arrêtent dès que possible.

```js
const nombres = Array.from({ length: 1_000_000 }, (_, i) => i);
let appels = 0;

const premiersCarresPairs = nombres
  .values() // un itérateur au lieu d'un tableau
  .map((n) => {
    appels++;
    return n * n;
  })
  .filter((n) => n % 2 === 0)
  .take(3)
  .toArray();

console.log(premiersCarresPairs); // [ 0, 4, 16 ]
console.log(appels); // 5 (au lieu d'un million avec Array.prototype.map)
```

Les itérateurs et leurs helpers sont détaillés au chapitre [Itérateurs et générateurs](../13-iterateurs-generateurs/README.md).

## Complexité et performance

La **complexité** décrit comment le temps d'une opération grandit avec la taille `n` du tableau. Inutile d'être expert : il suffit de connaître quelques ordres de grandeur pour éviter les ralentissements qui apparaissent avec des données réelles.

| Opération | Coût | Commentaire |
| --- | --- | --- |
| `tab[i]`, `tab.at(i)`, `tab.length` | O(1) | constant, quelle que soit la taille |
| `push`, `pop` | O(1) | (amorti) |
| `shift`, `unshift`, `splice` au début ou au milieu | O(n) | tous les éléments suivants sont décalés |
| `includes`, `indexOf`, `find`, `some`, `every` | O(n) | parcours, éventuellement interrompu |
| `map`, `filter`, `reduce`, `forEach`, `slice`, spread | O(n) | un parcours complet |
| `sort`, `toSorted` | O(n log n) | |
| `Set.has`, `Map.get` (pour comparaison) | O(1) en moyenne | voir [Collections](../12-collections/README.md) |

### Le piège du O(n²)

Le ralentissement classique vient d'une recherche linéaire (`includes`, `find`, `indexOf`) **à l'intérieur** d'un parcours : pour `n` éléments, on fait `n × n` comparaisons. Avec 10 éléments, personne ne le remarque ; avec 50 000, l'application se fige.

```js
const inscrits = Array.from({ length: 20_000 }, (_, i) => `user${i}@exemple.fr`);
const presents = inscrits.filter((_, i) => i % 3 === 0);

// ❌ O(n × m) : includes reparcourt `presents` pour chaque inscrit
let debut = performance.now();
const absentsLents = inscrits.filter((email) => !presents.includes(email));
const dureeLente = performance.now() - debut;

// ✅ O(n + m) : un Set répond en temps constant
debut = performance.now();
const ensemblePresents = new Set(presents);
const absentsRapides = inscrits.filter((email) => !ensemblePresents.has(email));
const dureeRapide = performance.now() - debut;

console.log(absentsLents.length === absentsRapides.length); // true
console.log(dureeLente > dureeRapide * 10); // true
// Mesuré sur un ordinateur portable récent : environ 700 ms contre 2 ms
```

La même idée s'applique aux objets : pour retrouver des éléments par identifiant, construisez une fois un index (`Map` ou objet) au lieu d'appeler `find` dans une boucle.

```js
const produits = [
  { id: "p1", nom: "Lampe" },
  { id: "p2", nom: "Table" },
];
const lignes = [{ produitId: "p2", quantite: 1 }, { produitId: "p1", quantite: 4 }];

// ❌ un find par ligne : O(lignes × produits)
// const nom = produits.find((p) => p.id === ligne.produitId).nom;

// ✅ un index construit une fois : O(lignes + produits)
const produitsParId = new Map(produits.map((p) => [p.id, p]));
console.log(lignes.map((l) => `${l.quantite} × ${produitsParId.get(l.produitId).nom}`)); // [ '1 × Table', '4 × Lampe' ]
```

### Le piège du `reduce` qui recopie

Recréer l'accumulateur à chaque tour avec le spread recopie tout ce qui a déjà été accumulé : c'est encore du O(n²), caché derrière une écriture élégante.

```js
const utilisateurs = Array.from({ length: 5 }, (_, i) => ({ id: i, nom: `U${i}` }));

// ❌ recopie l'objet entier à chaque tour
const indexLent = utilisateurs.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});

// ✅ une seule construction
const indexRapide = Object.fromEntries(utilisateurs.map((u) => [u.id, u]));

// ✅ ou un accumulateur modifié sur place (il est local au reduce : aucun risque)
const indexReduce = utilisateurs.reduce((acc, u) => {
  acc[u.id] = u;
  return acc;
}, {});

const tailles = [indexLent, indexRapide, indexReduce].map((index) => Object.keys(index).length);
console.log(tailles); // [ 5, 5, 5 ]
```

Enfin, ne faites pas de `shift()` dans une boucle sur un gros tableau (chaque appel décale tout) : parcourez avec un indice, ou inversez le tableau une fois et utilisez `pop()`.

> [!TIP]
> Mesurez avant d'optimiser (`performance.now()`, l'onglet *Performance* des DevTools). Une chaîne `filter`/`map` sur quelques milliers d'éléments prend une fraction de milliseconde : la lisibilité prime. Les seuls réflexes à avoir d'office sont ceux de cette section.

## Recettes

Chaque recette est autonome : copiez la fonction dont vous avez besoin.

### Dédoublonner

```js
// Valeurs primitives : un Set ne garde que des valeurs uniques (ordre conservé)
const tags = ["js", "css", "js", "html", "css"];
console.log([...new Set(tags)]); // [ 'js', 'css', 'html' ]

// Objets, d'après une clé : on garde la première occurrence
function dedoublonnerPar(elements, fonctionCle) {
  const vues = new Set();
  return elements.filter((element) => {
    const cle = fonctionCle(element);
    if (vues.has(cle)) return false;
    vues.add(cle);
    return true;
  });
}

const contacts = [
  { email: "ana@ex.fr", nom: "Ana" },
  { email: "leo@ex.fr", nom: "Léo" },
  { email: "ANA@ex.fr", nom: "Ana (doublon)" },
];
console.log(dedoublonnerPar(contacts, (c) => c.email.toLowerCase()).map((c) => c.nom)); // [ 'Ana', 'Léo' ]
```

### Découper en paquets

```js
function decouper(elements, taille) {
  if (!Number.isInteger(taille) || taille < 1) {
    throw new RangeError("La taille doit être un entier supérieur ou égal à 1");
  }
  const paquets = [];
  for (let i = 0; i < elements.length; i += taille) {
    paquets.push(elements.slice(i, i + taille));
  }
  return paquets;
}

console.log(decouper([1, 2, 3, 4, 5], 2)); // [ [ 1, 2 ], [ 3, 4 ], [ 5 ] ]
console.log(decouper([], 3)); // []
```

Utile pour paginer un affichage ou envoyer des requêtes par lots.

### Générer un intervalle (range)

```js
function intervalle(debut, fin, pas = 1) {
  if (pas === 0) throw new RangeError("Le pas ne peut pas être nul");
  const longueur = Math.max(Math.ceil((fin - debut) / pas), 0);
  return Array.from({ length: longueur }, (_, i) => debut + i * pas);
}

console.log(intervalle(0, 5)); // [ 0, 1, 2, 3, 4 ]
console.log(intervalle(1, 10, 3)); // [ 1, 4, 7 ]
console.log(intervalle(5, 0, -2)); // [ 5, 3, 1 ]
console.log(intervalle(3, 3)); // []
```

Comme `slice`, la borne de fin est exclue.

### Associer deux tableaux (zip)

```js
function associer(a, b) {
  const longueur = Math.min(a.length, b.length);
  return Array.from({ length: longueur }, (_, i) => [a[i], b[i]]);
}

const noms = ["Ana", "Léo", "Mia"];
const scores = [12, 18, 15];
console.log(associer(noms, scores)); // [ [ 'Ana', 12 ], [ 'Léo', 18 ], [ 'Mia', 15 ] ]
console.log(Object.fromEntries(associer(noms, scores))); // { Ana: 12, 'Léo': 18, Mia: 15 }
```

Notez l'affichage `'Léo'` entre guillemets dans le second résultat : Node met entre guillemets les clés qui ne sont pas de simples identifiants ASCII. `Iterator.zip`, prévu pour ES2027, fera la même chose sur des itérateurs (voir [Itérateurs et générateurs](../13-iterateurs-generateurs/README.md)).

### Mélanger un tableau (Fisher-Yates)

L'algorithme de Fisher-Yates parcourt le tableau depuis la fin et échange chaque case avec une case choisie au hasard parmi celles qui restent. Chaque permutation a la même probabilité.

```js
function melanger(elements) {
  const copie = [...elements];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0 ≤ j ≤ i
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

const cartes = ["As", "Roi", "Dame", "Valet"];
const melange = melanger(cartes);

console.log(melange.length); // 4
console.log(melange.toSorted().join() === cartes.toSorted().join()); // true : mêmes cartes
console.log(cartes); // [ 'As', 'Roi', 'Dame', 'Valet' ] : original intact
```

`tab.sort(() => Math.random() - 0.5)` est ❌ **biaisé** : le comparateur n'est pas cohérent et certaines permutations sortent bien plus souvent que d'autres. Pour un tirage à valeur de sécurité (mot de passe, loterie), remplacez `Math.random` par `crypto.getRandomValues` (voir [Nombres et Math](../08-nombres-et-math/README.md)).

### Tirer un élément au hasard

```js
const citations = ["Carpe diem", "Festina lente", "Alea jacta est"];
const auHasard = citations[Math.floor(Math.random() * citations.length)];

console.log(citations.includes(auHasard)); // true
```

### Somme, moyenne, minimum, maximum

```js
const somme = (nombres) => nombres.reduce((total, n) => total + n, 0);
const moyenne = (nombres) => (nombres.length === 0 ? NaN : somme(nombres) / nombres.length);

const notes = [12, 15, 9, 18];
console.log(somme(notes)); // 54
console.log(moyenne(notes)); // 13.5
console.log(moyenne([])); // NaN : à traiter explicitement plutôt que diviser par zéro en silence
console.log(Math.min(...notes), Math.max(...notes)); // 9 18

// Les flottants accumulent des erreurs d'arrondi
console.log(somme([0.1, 0.2, 0.3])); // 0.6000000000000001
```

Pour les montants, calculez en centimes entiers. `Math.sumPrecise` (ES2026) additionne sans erreur d'accumulation. Il fonctionne dans les navigateurs récents depuis avril 2026 (Baseline 2026) mais pas dans Node.js 24 (vérifiez sur MDN pour votre environnement) :

<!-- no-run -->
```js
console.log(Math.sumPrecise([0.1, 0.2, 0.3])); // 0.6
```

### Intersection, différence, union

```js
const a = ["js", "css", "html", "sql"];
const b = ["css", "sql", "python"];

const ensembleB = new Set(b);
console.log(a.filter((x) => ensembleB.has(x))); // [ 'css', 'sql' ] (intersection)
console.log(a.filter((x) => !ensembleB.has(x))); // [ 'js', 'html' ] (différence a − b)
console.log([...new Set([...a, ...b])]); // [ 'js', 'css', 'html', 'sql', 'python' ] (union)

// Avec les méthodes de Set (ES2025)
console.log([...new Set(a).intersection(ensembleB)]); // [ 'css', 'sql' ]
```

Les méthodes ensemblistes de `Set` (`union`, `intersection`, `difference`, `symmetricDifference`…) sont au chapitre [Collections](../12-collections/README.md).

### Partitionner

Séparer les éléments qui vérifient une condition de ceux qui ne la vérifient pas :

```js
const notes = [8, 12, 15, 9, 18];
const { recus = [], ajournes = [] } = Object.groupBy(notes, (n) =>
  n >= 10 ? "recus" : "ajournes",
);

console.log(recus); // [ 12, 15, 18 ]
console.log(ajournes); // [ 8, 9 ]
```

Les valeurs par défaut `= []` protègent du cas où un groupe est vide (la clé est alors absente).

### Déplacer un élément

```js
function deplacer(elements, depuis, vers) {
  const element = elements[depuis];
  return elements.toSpliced(depuis, 1).toSpliced(vers, 0, element);
}

const playlist = ["Intro", "Refrain", "Couplet", "Final"];
console.log(deplacer(playlist, 2, 1)); // [ 'Intro', 'Couplet', 'Refrain', 'Final' ]
```

### Compter les occurrences

```js
function compter(elements) {
  const compteur = new Map();
  for (const element of elements) {
    compteur.set(element, (compteur.get(element) ?? 0) + 1);
  }
  return compteur;
}

const votes = ["Oui", "Non", "Oui", "Blanc", "Oui"];
const resultats = compter(votes);
console.log(resultats); // Map(3) { 'Oui' => 3, 'Non' => 1, 'Blanc' => 1 }

// Le plus fréquent
const [gagnant] = [...resultats].toSorted((x, y) => y[1] - x[1])[0];
console.log(gagnant); // Oui
```

## Pièges courants

- **Trier des nombres sans comparateur** : `[10, 9, 1].sort()` donne `[ 1, 10, 9 ]`. Écrivez `sort((a, b) => a - b)`.
- **Oublier que `sort`, `reverse` et `splice` modifient le tableau** (et que `sort`/`reverse` retournent ce même tableau). Utilisez `toSorted`, `toReversed`, `toSpliced` quand l'original doit rester intact.
- **Remplir avec un objet** : `new Array(3).fill([])` partage le même tableau entre les cases. Utilisez `Array.from({ length: 3 }, () => [])`.
- **`new Array(n).map(…)`** ne fait rien : les trous sont sautés. Utilisez `Array.from({ length: n }, …)`.
- **`map(parseInt)`** : l'indice devient la base. Utilisez `map(Number)`.
- **`reduce` sans valeur initiale** : erreur sur un tableau vide, résultat surprenant si l'accumulateur n'a pas le type des éléments.
- **`splice(indexOf(x), 1)` sans vérifier `-1`** : supprime le dernier élément.
- **Comparer des tableaux ou chercher un objet avec `===`, `includes` ou `indexOf`** : ce sont les références qui sont comparées. Cherchez par identifiant avec `find` ou `some`.
- **`every` sur un tableau vide renvoie `true`.**
- **`filter(Boolean)` supprime aussi `0` et `""`.**
- **Modifier un tableau pendant qu'on le parcourt** : les indices se décalent et des éléments sont sautés.

  ```js
  const nombres = [1, 2, 2, 3];
  nombres.forEach((n, i) => {
    if (n === 2) nombres.splice(i, 1); // ❌
  });
  console.log(nombres); // [ 1, 2, 3 ] : un 2 a survécu

  console.log([1, 2, 2, 3].filter((n) => n !== 2)); // [ 1, 3 ] ✅
  ```

- **`await` dans `forEach`** : rien n'est attendu. Utilisez `for…of` ou `Promise.all(tab.map(…))`.
- **`Math.max(...grandTableau)`** au-delà d'environ 100 000 éléments : `RangeError`.
- **`tab[-1]`** ne lit pas le dernier élément. Utilisez `tab.at(-1)`.

## Bonnes pratiques

- Préférez les **méthodes non mutantes** (`map`, `filter`, `toSorted`, spread…) pour les données partagées ; réservez les mutations aux tableaux locaux que vous venez de créer.
- Choisissez la méthode qui **dit votre intention** : `includes` pour « est-ce présent ? », `some` pour « au moins un ? », `find` pour « lequel ? », `filter` pour « lesquels ? ».
- Gardez des **tableaux homogènes** : des éléments de même type et de même forme.
- Écrivez des **comparateurs explicites** (`a - b`, `localeCompare`, `Intl.Collator`) et profitez de la stabilité du tri.
- Utilisez `Object.groupBy` / `Map.groupBy` plutôt qu'un `reduce` maison pour regrouper.
- Dès qu'une recherche se répète dans une boucle, construisez un **`Set` ou une `Map`**.
- Gardez les chaînes de méthodes **courtes et lisibles** : une étape par ligne, des fonctions nommées pour les rappels longs.
- Utilisez `at(-1)`, `Array.isArray`, `Array.from({ length: n }, …)` : les écritures modernes sont aussi les plus sûres.

## Résumé

- Un tableau est une liste ordonnée indexée à partir de 0 ; `length` vaut le plus grand indice + 1 ; `Array.isArray` est le seul test fiable.
- Créez avec un littéral, `Array.from` (conversion, génération) ou `Array.of` ; évitez `new Array(n)` et `fill` avec des objets.
- `push`/`pop`/`shift`/`unshift`/`splice`/`sort`/`reverse`/`fill` **modifient** le tableau ; `toSorted`/`toReversed`/`toSpliced`/`with` (ES2023), `map`, `filter`, `slice`, `concat` en **créent un nouveau** (copie superficielle).
- Recherche : `includes` (gère `NaN`), `indexOf`, `find`/`findIndex`, `findLast`/`findLastIndex` (ES2023), `some`, `every`.
- Transformation : `map` (même longueur), `filter` (sous-ensemble), `reduce` (une valeur, toujours avec une valeur initiale), `flat`/`flatMap` (aplatir).
- Le tri par défaut compare des chaînes : donnez un comparateur ; `localeCompare` ou `Intl.Collator` pour le texte ; le tri est stable depuis ES2019.
- `Object.groupBy` et `Map.groupBy` (ES2024) regroupent en une ligne.
- Une recherche linéaire dans une boucle donne du O(n²) : passez par un `Set` ou une `Map`.

## Exercices

### Exercice 1 — Bulletin de notes (★☆☆)

À partir de `const notes = [12, 8.5, 15, 19, 7, 10];`, calculez et affichez : la note la plus basse, la plus haute, la moyenne arrondie à deux décimales, et le nombre de notes supérieures ou égales à 10.

<details>
<summary>Solution</summary>

```js
const notes = [12, 8.5, 15, 19, 7, 10];

const minimum = Math.min(...notes);
const maximum = Math.max(...notes);
const moyenne = notes.reduce((somme, n) => somme + n, 0) / notes.length;
const moyenneArrondie = Math.round(moyenne * 100) / 100;
const nombreRecus = notes.filter((n) => n >= 10).length;

console.log(minimum); // 7
console.log(maximum); // 19
console.log(moyenneArrondie); // 11.92
console.log(nombreRecus); // 4
```

`Math.min`/`Math.max` avec le spread conviennent pour un petit tableau. La moyenne est la somme (obtenue par `reduce` avec la valeur initiale `0`) divisée par le nombre de notes. Pour compter, on filtre puis on lit `length`.

</details>

### Exercice 2 — Le tri qui ne trie pas (★☆☆)

Cette fonction doit retourner les prix du plus cher au moins cher **sans modifier** le tableau reçu. Elle contient deux bugs : trouvez-les et corrigez-les.

```js
function trierPrixDecroissants(prix) {
  return prix.sort().reverse();
}

const catalogue = [5, 25, 100, 8];
console.log(trierPrixDecroissants(catalogue)); // attendu : [ 100, 25, 8, 5 ]
console.log(catalogue); // attendu : [ 5, 25, 100, 8 ]
```

<details>
<summary>Solution</summary>

1. `sort()` sans comparateur trie des **chaînes** : `"100" < "25" < "5" < "8"`, d'où un résultat faux une fois inversé (`[ 8, 5, 25, 100 ]`).
2. `sort` et `reverse` **modifient** le tableau `catalogue` de l'appelant.

```js
function trierPrixDecroissants(prix) {
  return prix.toSorted((a, b) => b - a);
}

const catalogue = [5, 25, 100, 8];
console.log(trierPrixDecroissants(catalogue)); // [ 100, 25, 8, 5 ]
console.log(catalogue); // [ 5, 25, 100, 8 ]
```

Le comparateur `b - a` trie directement dans l'ordre décroissant : plus besoin de `reverse`.

</details>

### Exercice 3 — Le panier (★★☆)

```js
const panier = [
  { nom: "Clavier", prixCentimes: 4990, quantite: 1 },
  { nom: "Souris", prixCentimes: 1990, quantite: 2 },
  { nom: "Câble USB-C", prixCentimes: 899, quantite: 3 },
  { nom: "Écran", prixCentimes: 18900, quantite: 0 },
];
console.log(panier.length); // 4
```

1. Retirez les lignes dont la quantité vaut 0.
2. Calculez le total en euros, sous forme de chaîne à deux décimales (`"116.67"`).
3. Listez les noms des articles dont le **total de ligne** dépasse 30 €.
4. Trouvez le nom de l'article dont le total de ligne est le plus élevé.

<details>
<summary>Solution</summary>

```js
const panier = [
  { nom: "Clavier", prixCentimes: 4990, quantite: 1 },
  { nom: "Souris", prixCentimes: 1990, quantite: 2 },
  { nom: "Câble USB-C", prixCentimes: 899, quantite: 3 },
  { nom: "Écran", prixCentimes: 18900, quantite: 0 },
];

const totalLigne = (ligne) => ligne.prixCentimes * ligne.quantite;

const lignes = panier.filter((ligne) => ligne.quantite > 0);
console.log(lignes.length); // 3

const totalCentimes = lignes.reduce((somme, ligne) => somme + totalLigne(ligne), 0);
console.log((totalCentimes / 100).toFixed(2)); // 116.67

const chers = lignes.filter((ligne) => totalLigne(ligne) > 3000).map((ligne) => ligne.nom);
console.log(chers); // [ 'Clavier', 'Souris' ]

const plusGrosse = lignes.reduce((max, ligne) =>
  totalLigne(ligne) > totalLigne(max) ? ligne : max,
);
console.log(plusGrosse.nom); // Clavier
```

Les prix sont en **centimes entiers** pour éviter les erreurs d'arrondi des flottants ; on ne divise par 100 qu'à l'affichage. La petite fonction `totalLigne` évite de répéter le calcul. Le dernier `reduce` n'a pas de valeur initiale : c'est acceptable ici parce que `lignes` n'est pas vide (sinon, testez sa longueur avant).

</details>

### Exercice 4 — Chiffre d'affaires par client (★★☆)

```js
const commandes = [
  { client: "Ana", montant: 30 },
  { client: "Léo", montant: 15 },
  { client: "Ana", montant: 12 },
  { client: "Mia", montant: 50 },
  { client: "Léo", montant: 40 },
];
console.log(commandes.length); // 5
```

Produisez un tableau de paires `[client, total]` trié du plus gros total au plus petit : `[ [ 'Léo', 55 ], [ 'Mia', 50 ], [ 'Ana', 42 ] ]`.

<details>
<summary>Solution</summary>

```js
const commandes = [
  { client: "Ana", montant: 30 },
  { client: "Léo", montant: 15 },
  { client: "Ana", montant: 12 },
  { client: "Mia", montant: 50 },
  { client: "Léo", montant: 40 },
];

const parClient = Object.groupBy(commandes, (c) => c.client);

const classement = Object.entries(parClient)
  .map(([client, liste]) => [client, liste.reduce((somme, c) => somme + c.montant, 0)])
  .toSorted((a, b) => b[1] - a[1]);

console.log(classement); // [ [ 'Léo', 55 ], [ 'Mia', 50 ], [ 'Ana', 42 ] ]
```

Trois étapes : regrouper (`Object.groupBy`), agréger chaque groupe (`map` + `reduce` sur les paires d'`Object.entries`), trier sur le total (`b[1] - a[1]`). Variante sans regroupement préalable : une `Map` qu'on remplit dans une boucle (`totaux.set(c.client, (totaux.get(c.client) ?? 0) + c.montant)`), puis `[...totaux].toSorted(…)`.

</details>

### Exercice 5 — Paquets et intervalles (★★☆)

Sans regarder les recettes, écrivez :

- `decouper(elements, taille)` qui retourne des paquets de `taille` éléments (le dernier peut être plus petit) et lève une `RangeError` si `taille` n'est pas un entier ≥ 1 ;
- `intervalle(debut, fin)` qui retourne les entiers de `debut` (inclus) à `fin` (exclu), et un tableau vide si `fin <= debut`.

Testez-les avec `node:assert/strict`.

<details>
<summary>Solution</summary>

```js
import assert from "node:assert/strict";

function decouper(elements, taille) {
  if (!Number.isInteger(taille) || taille < 1) {
    throw new RangeError("La taille doit être un entier supérieur ou égal à 1");
  }
  return Array.from({ length: Math.ceil(elements.length / taille) }, (_, i) =>
    elements.slice(i * taille, (i + 1) * taille),
  );
}

function intervalle(debut, fin) {
  return Array.from({ length: Math.max(fin - debut, 0) }, (_, i) => debut + i);
}

assert.deepEqual(decouper([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
assert.deepEqual(decouper([1, 2], 5), [[1, 2]]);
assert.deepEqual(decouper([], 3), []);
assert.throws(() => decouper([1], 0), RangeError);
assert.throws(() => decouper([1], 1.5), RangeError);

assert.deepEqual(intervalle(2, 6), [2, 3, 4, 5]);
assert.deepEqual(intervalle(3, 3), []);
assert.deepEqual(intervalle(5, 1), []);

console.log("Tous les tests passent"); // Tous les tests passent
```

Cette version de `decouper` calcule d'abord le nombre de paquets (`Math.ceil(longueur / taille)`) puis génère chaque paquet avec `slice` : aucune mutation. Dans `intervalle`, `Math.max(…, 0)` évite une longueur négative, que `Array.from` refuserait (`RangeError: Invalid array length`).

</details>

### Exercice 6 — Classement sportif (★★★)

```js
const equipes = [
  { nom: "Lyon", points: 20, difference: 5 },
  { nom: "Brest", points: 23, difference: 8 },
  { nom: "Angers", points: 20, difference: 5 },
  { nom: "Nice", points: 20, difference: 9 },
  { nom: "Metz", points: 15, difference: -2 },
];
console.log(equipes.length); // 5
```

Triez par points décroissants, puis par différence de buts décroissante, puis par nom (ordre alphabétique français). Attribuez ensuite un rang : deux équipes à égalité de points **et** de différence partagent le même rang, et le rang suivant saute d'autant (1, 2, 3, 3, 5). Affichez `"1. Brest (23 pts)"`, etc., sans modifier `equipes`.

<details>
<summary>Solution</summary>

```js
const equipes = [
  { nom: "Lyon", points: 20, difference: 5 },
  { nom: "Brest", points: 23, difference: 8 },
  { nom: "Angers", points: 20, difference: 5 },
  { nom: "Nice", points: 20, difference: 9 },
  { nom: "Metz", points: 15, difference: -2 },
];

const collateur = new Intl.Collator("fr");

const triees = equipes.toSorted(
  (a, b) =>
    b.points - a.points ||
    b.difference - a.difference ||
    collateur.compare(a.nom, b.nom),
);

const exAequo = (a, b) => a.points === b.points && a.difference === b.difference;

const classement = triees.map((equipe, i) => {
  // Le rang est la position de la première équipe à égalité
  const premiere = triees.findIndex((autre) => exAequo(autre, equipe));
  return { ...equipe, rang: premiere + 1 };
});

for (const { rang, nom, points } of classement) {
  console.log(`${rang}. ${nom} (${points} pts)`);
}
// 1. Brest (23 pts)
// 2. Nice (20 pts)
// 3. Angers (20 pts)
// 3. Lyon (20 pts)
// 5. Metz (15 pts)

console.log(equipes[0].nom); // Lyon : l'original n'a pas bougé
```

Le comparateur enchaîne trois critères avec `||`. Pour le rang « olympique », on cherche l'indice de la première équipe à égalité : le tableau étant trié, les ex æquo sont contigus. Le `findIndex` dans le `map` donne du O(n²), sans conséquence pour vingt équipes ; pour un très grand classement, on comparerait plutôt chaque équipe à la précédente dans une boucle en gardant le rang courant.

</details>

### Exercice 7 — Feuille de présence (★★★)

Écrivez `analyserPresence(inscrits, presents)` qui retourne `{ absents, doublons }` :

- `absents` : les inscrits qui ne figurent pas parmi les présents ;
- `doublons` : les adresses présentes plusieurs fois dans `inscrits` (chacune une seule fois).

Les adresses doivent être comparées sans tenir compte de la casse ni des espaces autour. La fonction doit rester rapide avec 100 000 inscrits : pas de `includes` ni de `indexOf` dans une boucle.

<details>
<summary>Solution</summary>

```js
const normaliser = (email) => email.trim().toLowerCase();

function analyserPresence(inscrits, presents) {
  const ensemblePresents = new Set(presents.map(normaliser));
  const vus = new Set();
  const doublons = new Set();

  for (const email of inscrits.map(normaliser)) {
    if (vus.has(email)) doublons.add(email);
    vus.add(email);
  }

  const absents = [...vus].filter((email) => !ensemblePresents.has(email));
  return { absents, doublons: [...doublons] };
}

const inscrits = ["ana@ex.fr", "LEO@ex.fr", "mia@ex.fr", " ana@ex.fr ", "tom@ex.fr"];
const presents = ["leo@ex.fr", "Tom@ex.fr "];

console.log(analyserPresence(inscrits, presents)); // { absents: [ 'ana@ex.fr', 'mia@ex.fr' ], doublons: [ 'ana@ex.fr' ] }

// Test de charge : reste linéaire
const beaucoup = Array.from({ length: 100_000 }, (_, i) => `u${i}@ex.fr`);
const debut = performance.now();
const resultat = analyserPresence(beaucoup, beaucoup.slice(0, 50_000));
console.log(resultat.absents.length); // 50000
console.log(performance.now() - debut < 1000); // true
```

Chaque test d'appartenance passe par un `Set` (temps constant) : la fonction fait un nombre d'opérations proportionnel à `inscrits.length + presents.length`. Le `Set` `vus` sert à la fois à détecter les doublons et à produire une liste d'absents sans répétition ; le `Set` `doublons` évite de signaler trois fois une adresse inscrite trois fois.

</details>

## Pour aller plus loin

- [MDN — Array](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array) : référence complète, avec la section sur les méthodes copiantes et mutantes
- [MDN — Array.prototype.sort](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) : comparateurs, stabilité, tableaux creux
- [MDN — Object.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy) et [Map.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy)
- [MDN — Intl.Collator](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator) : comparer des chaînes selon la langue
- [MDN — Tableaux typés](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Typed_arrays)
- [MDN — Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator) : les Iterator helpers (évaluation paresseuse)
- [MDN — Array.fromAsync](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync)

---

[← Nombres et Math](../08-nombres-et-math/README.md) · [Sommaire](../README.md#sommaire) · [Objets →](../10-objets/README.md)
