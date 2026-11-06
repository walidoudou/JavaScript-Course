# 11 — Syntaxe moderne

> **Niveau** : Intermédiaire · **Durée** : ~3 h · **Prérequis** : [Fonctions](../06-fonctions/README.md), [Tableaux](../09-tableaux/README.md), [Objets](../10-objets/README.md)

Depuis ES2015, JavaScript a gagné une syntaxe beaucoup plus expressive : déstructuration, spread et rest, templates étiquetés, raccourcis d'objets, nouveaux opérateurs. Ce chapitre est la référence du cours pour ces constructions. Il se termine par un panorama des éditions ES2015 → ES2026, un aperçu de ce qui arrive, et une question pratique : un projet a-t-il encore besoin d'être transpilé en 2026 ?

## Objectifs

- Extraire des données de tableaux, d'objets et de paramètres avec la déstructuration, y compris imbriquée et avec valeurs par défaut
- Distinguer spread et rest, et les utiliser pour copier, fusionner et mettre à jour des données sans mutation
- Écrire des templates étiquetés (_tagged templates_) : échappement HTML, requêtes paramétrées, `String.raw`
- Utiliser les raccourcis d'objets, les clés calculées, les paramètres par défaut et les opérateurs récents (`??=`, `**`, séparateurs numériques)
- Situer une fonctionnalité dans son édition ECMAScript et savoir où elle est étudiée dans le cours
- Savoir ce qui arrive (stage 4 et stage 3) et décider si un projet a encore besoin de transpilation

## Sommaire

- [Sucre syntaxique : ce que le terme cache](#sucre-syntaxique--ce-que-le-terme-cache)
- [Déstructuration](#déstructuration)
- [Spread et rest](#spread-et-rest)
- [Template literals avancés et tagged templates](#template-literals-avancés-et-tagged-templates)
- [Littéraux d'objets améliorés](#littéraux-dobjets-améliorés)
- [Paramètres par défaut](#paramètres-par-défaut)
- [Opérateurs et littéraux récents](#opérateurs-et-littéraux-récents)
- [Petites nouveautés de syntaxe](#petites-nouveautés-de-syntaxe)
- [Quoi de neuf, version par version](#quoi-de-neuf-version-par-version)
- [Ce qui arrive](#ce-qui-arrive)
- [Transpilation aujourd'hui](#transpilation-aujourdhui)
- [Pièges courants](#pièges-courants)
- [Bonnes pratiques](#bonnes-pratiques)
- [Résumé](#résumé)
- [Exercices](#exercices)
- [Pour aller plus loin](#pour-aller-plus-loin)

## Sucre syntaxique : ce que le terme cache

On présente souvent la syntaxe moderne comme du « sucre syntaxique » : une écriture plus courte pour quelque chose qui était déjà possible. C'est vrai pour une partie d'entre elle. Comparez ces deux versions d'une même fonction :

```js
// Avant ES2015
function creerProfilAncien(options) {
  var nom = options.nom;
  var role = options.role !== undefined ? options.role : "lecteur";
  var tags = Array.prototype.slice.call(arguments, 1);
  return { nom: nom, role: role, tags: tags, resume: nom + " (" + role + ")" };
}

// Aujourd'hui
function creerProfil({ nom, role = "lecteur" }, ...tags) {
  return { nom, role, tags, resume: `${nom} (${role})` };
}

console.log(creerProfilAncien({ nom: "Ana" }, "js", "css").resume); // Ana (lecteur)
console.log(creerProfil({ nom: "Ana" }, "js", "css").resume); // Ana (lecteur)
```

Mais tout n'est pas un simple raccourci. Le spread d'objet ne se comporte pas comme `Object.assign` (il ne déclenche pas les setters), les fonctions fléchées n'ont pas leur propre `this`, `let` dans une boucle crée une nouvelle liaison à chaque tour, et les champs privés des classes n'ont aucun équivalent en ES5. Retenez donc l'idée suivante : **une nouvelle syntaxe peut aussi apporter une nouvelle sémantique**. C'est pourquoi ce chapitre explique, pour chaque construction, ce qu'elle fait exactement.

## Déstructuration

La déstructuration (ES2015) extrait des valeurs d'un tableau ou d'un objet et les range dans des variables. À gauche du `=`, on écrit un **motif** qui reproduit la forme de la donnée.

### Déstructurer un tableau

La position compte : la première variable reçoit le premier élément, et ainsi de suite.

```js
const coordonnees = [48.85, 2.35, 35];

const [latitude, longitude] = coordonnees;
console.log(latitude, longitude); // 48.85 2.35

const [, , altitude] = coordonnees; // une virgule par position sautée
console.log(altitude); // 35

const [x, y, z, precision] = coordonnees;
console.log(precision); // undefined
```

La déstructuration de tableau s'appuie sur le protocole d'itération ([chapitre 13](../13-iterateurs-generateurs/README.md)) : elle fonctionne avec **n'importe quel itérable** (chaîne, `Set`, `Map`, générateur…), pas seulement avec les tableaux.

```js
const [initiale] = "Zoé";
console.log(initiale); // Z

const [premierTag, deuxiemeTag] = new Set(["js", "css", "html"]);
console.log(premierTag, deuxiemeTag); // js css

const [[cle, valeur]] = new Map([["theme", "sombre"]]);
console.log(cle, valeur); // theme sombre
```

### Valeurs par défaut

Une valeur par défaut s'applique **uniquement quand l'élément vaut `undefined`** (absent ou explicitement `undefined`). `null` est une valeur comme une autre et ne déclenche pas le défaut.

```js
const [a = 1, b = 2, c = 3] = [10, undefined, null];
console.log(a, b, c); // 10 2 null
```

L'expression par défaut n'est évaluée que si elle sert, et elle peut utiliser les variables déclarées avant elle dans le motif :

```js
function calculerDefaut() {
  console.log("défaut calculé");
  return 0;
}

const [n = calculerDefaut()] = [5]; // n'affiche rien : 5 est fourni
console.log(n); // 5

const [largeur = 100, hauteur = largeur / 2] = [];
console.log(largeur, hauteur); // 100 50
```

### Récupérer le reste

Le motif `...nom` en dernière position rassemble les éléments restants dans un **vrai tableau** (éventuellement vide).

```js
const [gagnant, ...autres] = ["Ana", "Bilal", "Chloé", "Dmitri"];
console.log(gagnant); // Ana
console.log(autres); // ["Bilal", "Chloé", "Dmitri"]

const [seul, ...rien] = ["Ana"];
console.log(rien); // []
```

### Échanger deux variables

Plus besoin de variable temporaire :

```js
let gauche = "A";
let droite = "B";
[gauche, droite] = [droite, gauche];
console.log(gauche, droite); // B A
```

> [!WARNING]
> Une ligne qui commence par `[` est collée à la ligne précédente si celle-ci ne se termine pas par un point-virgule (voir [Pièges courants](#pièges-courants)). C'est une bonne raison de toujours écrire les `;`.

### Déstructurer un objet

Pour un objet, c'est le **nom de la propriété** qui compte, pas l'ordre.

```js
const utilisateur = { nom: "Inès", age: 31, ville: "Lyon" };

const { ville, nom } = utilisateur;
console.log(nom, ville); // Inès Lyon

const { pays } = utilisateur; // propriété absente
console.log(pays); // undefined
```

On peut renommer (`propriete: variable`), donner une valeur par défaut, ou les deux :

```js
const utilisateur = { nom: "Inès", age: 31 };

const { nom: prenom } = utilisateur; // « la propriété nom va dans la variable prenom »
console.log(prenom); // Inès

const { pays = "France" } = utilisateur;
console.log(pays); // France

const { role: fonction = "membre" } = utilisateur;
console.log(fonction); // membre
```

Le reste d'objet (ES2018) copie les propriétés non citées dans un nouvel objet. C'est la manière idiomatique d'**exclure** une propriété sans modifier l'original :

```js
const compte = { id: 7, email: "ana@exemple.fr", motDePasseHache: "…", role: "admin" };

const { motDePasseHache, ...compteSansSecret } = compte;
console.log(compteSansSecret); // { id: 7, email: "ana@exemple.fr", role: "admin" }
console.log(Object.keys(compte).length); // 4
```

Une clé calculée permet de choisir la propriété à l'exécution ; le renommage est alors obligatoire :

```js
const produit = { nom: "Lampe", prix: 39, stock: 12 };
const champ = "prix";

const { [champ]: valeurDuChamp } = produit;
console.log(valeurDuChamp); // 39
```

Les primitives sont converties en objet le temps de la lecture, ce qui permet par exemple :

```js
const { length } = "Bonjour";
console.log(length); // 7
```

En revanche, déstructurer `null` ou `undefined` lève une `TypeError` :

```js
try {
  const { nom } = null;
} catch (erreur) {
  console.log(erreur.message); // Cannot destructure property 'nom' of 'null' as it is null.
}
```

### Déstructuration imbriquée

Un motif peut contenir d'autres motifs. Le nom placé avant `:` sert alors de **chemin**, il ne crée pas de variable.

```js
const commande = {
  id: "C-1042",
  client: { nom: "Hugo", adresse: { ville: "Nantes", codePostal: "44000" } },
  lignes: [
    { produit: "Clavier", quantite: 1 },
    { produit: "Souris", quantite: 2 },
  ],
};

const {
  client: {
    nom: nomClient,
    adresse: { ville },
  },
  lignes: [premiereLigne, ...autresLignes],
} = commande;

console.log(nomClient, ville); // Hugo Nantes
console.log(premiereLigne.produit, autresLignes.length); // Clavier 1
console.log(typeof client); // undefined
```

Si un niveau intermédiaire peut manquer, donnez-lui un objet vide par défaut ; sinon la lecture de `ville` sur `undefined` échoue :

```js
const clientSansAdresse = { nom: "Léa" };

const { adresse: { ville } = {} } = clientSansAdresse;
console.log(ville); // undefined

// Au-delà de deux niveaux, le chaînage optionnel est souvent plus lisible :
const codePostal = clientSansAdresse.adresse?.codePostal ?? "inconnu";
console.log(codePostal); // inconnu
```

### Dans les paramètres de fonction

C'est l'usage le plus courant : un **objet d'options** déstructuré directement dans la signature.

```js
function creerBouton({ libelle, type = "button", desactive = false } = {}) {
  const attributs = desactive ? " disabled" : "";
  return `<button type="${type}"${attributs}>${libelle ?? "OK"}</button>`;
}

console.log(creerBouton({ libelle: "Envoyer", type: "submit" })); // <button type="submit">Envoyer</button>
console.log(creerBouton({ libelle: "Patienter", desactive: true })); // <button type="button" disabled>Patienter</button>
console.log(creerBouton()); // <button type="button">OK</button>
```

Le `= {}` final rend l'argument facultatif : sans lui, `creerBouton()` tenterait de déstructurer `undefined` et lèverait une `TypeError`.

Pourquoi préférer un objet d'options à des paramètres positionnels ?

```js
// ❌ Que signifient false et true ? Il faut ouvrir la définition pour le savoir.
// creerFenetre("Aide", 400, 300, false, true);

// ✅ Chaque argument est nommé, l'ordre n'a pas d'importance, on n'écrit que ce qui change.
function creerFenetre({ titre, largeur = 800, hauteur = 600, modale = false, redimensionnable = true }) {
  return `${titre} ${largeur}x${hauteur} modale=${modale} redimensionnable=${redimensionnable}`;
}

console.log(creerFenetre({ titre: "Aide", largeur: 400, hauteur: 300 })); // Aide 400x300 modale=false redimensionnable=true
```

La déstructuration sert aussi à **renvoyer plusieurs valeurs** : un objet quand les valeurs ont un nom, un tableau quand l'ordre suffit et que l'appelant doit pouvoir choisir ses noms.

```js
function statistiques(nombres) {
  const total = nombres.reduce((somme, n) => somme + n, 0);
  return { min: Math.min(...nombres), max: Math.max(...nombres), moyenne: total / nombres.length };
}

const { min, max, moyenne } = statistiques([4, 8, 15, 16, 23, 42]);
console.log(min, max, moyenne); // 4 42 18

function separer(liste, predicat) {
  return [liste.filter(predicat), liste.filter((x) => !predicat(x))];
}

const [pairs, impairs] = separer([1, 2, 3, 4, 5], (n) => n % 2 === 0);
console.log(pairs, impairs); // [2, 4] [1, 3, 5]
```

### Dans les boucles et les callbacks

```js
const stock = { pommes: 12, poires: 0, kiwis: 7 };

for (const [fruit, quantite] of Object.entries(stock)) {
  if (quantite === 0) console.log(`Rupture : ${fruit}`); // Rupture : poires
}

const equipe = [
  { nom: "Ana", poste: "dev", anciennete: 4 },
  { nom: "Bilal", poste: "design", anciennete: 2 },
];

for (const { nom, poste } of equipe) {
  console.log(`${nom} — ${poste}`);
}
// Ana — dev
// Bilal — design

const noms = equipe.map(({ nom }) => nom);
console.log(noms); // ["Ana", "Bilal"]
```

### Affecter sans déclarer

Sans `const` ni `let`, une déstructuration d'objet doit être **entourée de parenthèses** : sinon, l'accolade ouvrante est lue comme un bloc de code.

```js
let largeur;
let hauteur;

({ largeur, hauteur } = { largeur: 800, hauteur: 600 });
console.log(largeur, hauteur); // 800 600

// La cible peut être n'importe quelle référence, par exemple une propriété :
const plage = {};
[plage.min, plage.max] = [0, 100];
console.log(plage); // { min: 0, max: 100 }
```

### Avec les expressions régulières

Le résultat de `exec` (ou `match` sans drapeau `g`) est un tableau : on le déstructure volontiers. Les détails des regex sont au [chapitre 14](../14-regex/README.md).

```js
const [, annee, mois, jour] = /^(\d{4})-(\d{2})-(\d{2})$/.exec("2026-11-06");
console.log(jour, mois, annee); // 06 11 2026

const {
  groups: { heures, minutes },
} = /(?<heures>\d{2})h(?<minutes>\d{2})/.exec("Départ à 14h35");
console.log(heures, minutes); // 14 35

// exec renvoie null sans correspondance : prévoyez un repli
const [, code] = /CODE-(\d+)/.exec("aucun code ici") ?? [];
console.log(code); // undefined
```

## Spread et rest

Les trois points `...` portent deux noms selon l'endroit où ils apparaissent :

| Position | Nom | Effet | Depuis |
| --- | --- | --- | --- |
| Dans un tableau littéral `[...x]` | spread | étale les éléments d'un itérable | ES2015 |
| Dans un appel `f(...x)` | spread | passe les éléments comme arguments séparés | ES2015 |
| Dans un objet littéral `{ ...x }` | spread | copie les propriétés propres énumérables | ES2018 |
| Dans les paramètres `function f(...x)` | rest | rassemble les arguments restants dans un tableau | ES2015 |
| Dans une déstructuration `[a, ...x]` / `{ a, ...x }` | rest | rassemble ce qui n'a pas été extrait | ES2015 / ES2018 |

Moyen mnémotechnique : là où l'on **produit** une valeur, `...` étale (spread) ; là où l'on **reçoit** des valeurs, `...` rassemble (rest).

### Spread dans les tableaux

```js
const fruits = ["pomme", "poire"];
const legumes = ["carotte"];

const copie = [...fruits];
const panier = [...fruits, "kiwi", ...legumes];
console.log(panier); // ["pomme", "poire", "kiwi", "carotte"]
console.log(copie === fruits); // false

// N'importe quel itérable peut être étalé
console.log([...new Set([3, 1, 3, 2, 1])]); // [3, 1, 2]
console.log([..."été"]); // ["é", "t", "é"]
console.log([...new Map([["a", 1]]).keys()]); // ["a"]
```

L'étalement d'une chaîne la découpe en **points de code**, pas en unités UTF-16 : c'est mieux que `split("")`, mais un émoji composé reste découpé en plusieurs morceaux. Pour les « caractères perçus », utilisez `Intl.Segmenter` ([chapitre 7](../07-chaines/README.md)).

```js
const pouce = "👍🏽";
console.log(pouce.length); // 4
console.log([...pouce].length); // 2
```

La copie est **superficielle** : les objets contenus sont partagés entre l'original et la copie.

```js
const original = [{ nom: "Ana" }];
const copie = [...original];

copie[0].nom = "Zoé";
console.log(original[0].nom); // Zoé

const copieProfonde = structuredClone(original); // voir le chapitre 10
copieProfonde[0].nom = "Léa";
console.log(original[0].nom); // Zoé
```

### Spread dans les appels

Le spread remplace `fn.apply(null, tableau)` et fonctionne aussi avec `new` :

```js
const temperatures = [12, 18, 9, 21];

console.log(Math.max(...temperatures)); // 21
console.log(Math.max(0, ...temperatures, 30)); // 30

const parties = [2026, 10, 6]; // mois de 0 à 11 : 10 = novembre
const date = new Date(...parties);
console.log(date.getMonth()); // 10
```

Chaque élément devient un argument, et le nombre d'arguments est limité par la pile d'appels. Avec des centaines de milliers d'éléments, l'appel échoue (la limite exacte dépend du moteur) : préférez alors une boucle ou `reduce`.

```js
const mesures = Array.from({ length: 500_000 }, (_, i) => i);

try {
  Math.max(...mesures);
} catch (erreur) {
  console.log(erreur.name); // RangeError
}

const maximum = mesures.reduce((max, n) => (n > max ? n : max), -Infinity);
console.log(maximum); // 499999
```

### Spread dans les objets

Le spread d'objet (ES2018) crée un **nouvel objet** et y copie les propriétés propres énumérables des objets étalés. En cas de conflit, **la dernière occurrence gagne** : placez donc les valeurs par défaut en premier.

```js
const parDefaut = { theme: "clair", langue: "fr", notifications: true };
const choixUtilisateur = { theme: "sombre" };

const reglages = { ...parDefaut, ...choixUtilisateur };
console.log(reglages); // { theme: "sombre", langue: "fr", notifications: true }

const forces = { ...choixUtilisateur, ...parDefaut }; // ❌ ordre inversé : les défauts écrasent le choix
console.log(forces.theme); // clair
```

Étaler `null`, `undefined`, `false` ou un nombre ne produit aucune propriété. On en tire un idiome pour les **propriétés conditionnelles** :

```js
function creerFacture(total, remise) {
  return { total, ...(remise > 0 && { remise }) };
}

console.log(creerFacture(120, 10)); // { total: 120, remise: 10 }
console.log(creerFacture(120, 0)); // { total: 120 }
```

Le cas d'usage roi est la **mise à jour immuable** : on construit un nouvel état au lieu de modifier l'ancien (c'est le modèle de React, Redux, des signaux…). Il faut recopier chaque niveau que l'on modifie.

```js
const etat = {
  utilisateur: { nom: "Ana", points: 10 },
  panier: ["livre"],
  filtres: { tri: "prix" },
};

const nouvelEtat = {
  ...etat,
  utilisateur: { ...etat.utilisateur, points: etat.utilisateur.points + 5 },
  panier: [...etat.panier, "stylo"],
};

console.log(etat.utilisateur.points, nouvelEtat.utilisateur.points); // 10 15
console.log(etat.panier.length, nouvelEtat.panier.length); // 1 2
console.log(etat.filtres === nouvelEtat.filtres); // true
```

La dernière ligne montre le principe : ce qui n'a pas changé est **partagé**, ce qui a changé est neuf. Comparer deux états revient alors à comparer des références.

Ce que le spread d'objet copie, et ce qu'il ne copie pas :

| Copié | Non copié |
| --- | --- |
| propriétés propres énumérables (clés chaînes et symboles) | propriétés héritées (le prototype, donc les méthodes d'une classe) |
| la **valeur** renvoyée par un getter (le getter est exécuté) | les getters et setters eux-mêmes |
| | propriétés non énumérables |

```js
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  norme() {
    return Math.hypot(this.x, this.y);
  }
}

const p = new Point(3, 4);
const copie = { ...p };

console.log(copie); // { x: 3, y: 4 }
console.log(copie instanceof Point, typeof copie.norme); // false undefined
```

Différence avec `Object.assign` : ce dernier **modifie** son premier argument et passe par ses setters, alors que le spread définit des propriétés sur un objet neuf.

```js
const cible = {
  set nom(valeur) {
    console.log(`setter appelé avec ${valeur}`);
  },
};

Object.assign(cible, { nom: "Ana" }); // setter appelé avec Ana

const copie = { ...cible, nom: "Ana" }; // aucun setter appelé
console.log(Object.getOwnPropertyDescriptor(copie, "nom").value); // Ana
```

### Rest dans les paramètres

Le paramètre rest rassemble les arguments restants dans un vrai tableau. Il remplace l'objet historique `arguments`, qui n'est pas un tableau et n'existe pas dans les fonctions fléchées ([chapitre 6](../06-fonctions/README.md)).

```js
function journaliser(niveau, ...messages) {
  console.log(`[${niveau}]`, messages.join(" "));
}

journaliser("INFO", "Serveur", "démarré", "sur le port", 3000); // [INFO] Serveur démarré sur le port 3000

const somme = (...nombres) => nombres.reduce((total, n) => total + n, 0);
console.log(somme(), somme(1, 2, 3)); // 0 6
```

Le paramètre rest doit être le dernier, ne peut pas avoir de valeur par défaut et n'est pas compté par `fonction.length` (les paramètres à valeur par défaut non plus) :

```js
function exemple(a, b = 2, ...c) {}
console.log(exemple.length); // 1
```

## Template literals avancés et tagged templates

### Rappel

Les bases des template literals (interpolation, chaînes sur plusieurs lignes) sont au [chapitre 7](../07-chaines/README.md). Rappelons qu'on peut interpoler **n'importe quelle expression**, y compris un autre template :

```js
const articles = [
  { nom: "Café", prix: 2.5 },
  { nom: "Croissant", prix: 1.2 },
];

const liste = `<ul>
${articles.map((article) => `  <li>${article.nom} : ${article.prix.toFixed(2)} €</li>`).join("\n")}
</ul>`;

console.log(liste);
// <ul>
//   <li>Café : 2.50 €</li>
//   <li>Croissant : 1.20 €</li>
// </ul>
```

Attention : dans un template sur plusieurs lignes, **l'indentation du code source fait partie de la chaîne**. Le tag `dedent` construit plus bas résout ce problème.

### Le principe d'un template étiqueté

Placer une fonction juste devant un template (sans parenthèses) l'**étiquette** : au lieu de construire la chaîne, JavaScript appelle la fonction avec deux choses :

1. un tableau des **morceaux littéraux** (toujours un de plus que le nombre de valeurs) ;
2. les **valeurs** interpolées, en arguments séparés (on les récupère avec un paramètre rest).

```js
function inspecter(chaines, ...valeurs) {
  console.log(chaines); // ["Total : ", " € pour ", " articles"]
  console.log(valeurs); // [42, 3]
  return { morceaux: chaines.length, valeurs: valeurs.length };
}

const resultat = inspecter`Total : ${42} € pour ${3} articles`;
console.log(resultat); // { morceaux: 3, valeurs: 2 }
```

La fonction peut renvoyer **n'importe quoi** : une chaîne transformée, un objet, un élément de DOM… Pour reconstruire une chaîne, on alterne morceaux et valeurs. Attention à tester la **position** et non la valeur, sinon `0` ou `""` disparaissent :

```js
// ❌ teste la valeur : 0 est considéré comme absent
function surlignerFaux(chaines, ...valeurs) {
  return chaines.reduce(
    (acc, chaine, i) => `${acc}${chaine}${valeurs[i] ? `<mark>${valeurs[i]}</mark>` : ""}`,
    "",
  );
}

// ✅ teste la position
function surligner(chaines, ...valeurs) {
  return chaines.reduce(
    (acc, chaine, i) => `${acc}${chaine}${i < valeurs.length ? `<mark>${valeurs[i]}</mark>` : ""}`,
    "",
  );
}

const placesRestantes = 0;
console.log(surlignerFaux`Il reste ${placesRestantes} places`); // Il reste  places
console.log(surligner`Il reste ${placesRestantes} places`); // Il reste <mark>0</mark> places
```

Une écriture plus compacte de la même alternance utilise `reduce` sans valeur initiale : l'accumulateur commence au premier morceau, et l'index `i` désigne alors le morceau suivant, donc la valeur `valeurs[i - 1]`.

```js
function assembler(chaines, ...valeurs) {
  return chaines.reduce((acc, chaine, i) => acc + String(valeurs[i - 1]).toUpperCase() + chaine);
}

console.log(assembler`Bonjour ${"ana"}, vous avez ${3} messages`); // Bonjour ANA, vous avez 3 messages
```

### `String.raw` et la propriété `raw`

Le tableau des morceaux possède une propriété `raw` qui contient le texte **brut**, avec les barres obliques inverses non interprétées. Le tag standard `String.raw` s'en sert pour produire une chaîne sans échappements, pratique pour les chemins Windows ou les regex :

```js
console.log(String.raw`C:\Users\ana\notes.txt`); // C:\Users\ana\notes.txt

const motif = new RegExp(String.raw`^\d+\.\d{2}$`); // au lieu de "^\\d+\\.\\d{2}$"
console.log(motif.test("19.99")); // true

function bruts(chaines) {
  return chaines.raw;
}
console.log(bruts`ligne 1\nligne 2`); // ["ligne 1\\nligne 2"]
```

Deux propriétés méconnues des templates étiquetés :

- **Échappements invalides tolérés** (ES2018) : `\unicode` est une erreur de syntaxe dans un template ordinaire, mais accepté dans un template étiqueté ; la version interprétée vaut alors `undefined` et seule la version brute est disponible. Cela permet d'écrire du LaTeX ou des chemins dans un tag.
- **Tableau figé et réutilisé** : pour un même emplacement dans le code, le moteur passe **le même tableau** (gelé) à chaque évaluation. Des bibliothèques comme `lit` s'en servent comme clé de cache pour ne pas réanalyser le gabarit.

```js
function versionInterpretee(chaines) {
  return [chaines[0], chaines.raw[0]];
}
console.log(versionInterpretee`\unicode`); // [undefined, "\\unicode"]

const vus = new Set();
function memoriser(chaines) {
  vus.add(chaines);
}
for (let i = 0; i < 3; i++) memoriser`toujours le même emplacement ${i}`;

console.log(vus.size); // 1
console.log(Object.isFrozen([...vus][0])); // true
```

### Cas d'usage : échapper le HTML

Insérer une donnée utilisateur dans du HTML sans l'échapper ouvre la porte aux failles XSS ([chapitre 23](../23-dom/README.md)). Un tag peut échapper **automatiquement** chaque valeur interpolée, tout en laissant intact le HTML écrit par le développeur :

```js
const entites = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const echapper = (valeur) => String(valeur).replace(/[&<>"']/g, (caractere) => entites[caractere]);

function html(chaines, ...valeurs) {
  return chaines.reduce((acc, chaine, i) => acc + echapper(valeurs[i - 1]) + chaine);
}

const commentaire = '<img src=x onerror="alert(1)">';
console.log(html`<p class="commentaire">${commentaire}</p>`); // <p class="commentaire">&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>
```

Ce tag protège le contenu textuel et les attributs entre guillemets, mais pas tous les contextes (une URL `javascript:` dans un `href`, du code dans un `<script>`…). Dans une vraie application, préférez `textContent`, un framework qui échappe par défaut, ou une bibliothèque de nettoyage.

### Cas d'usage : requêtes SQL paramétrées

Concaténer des valeurs dans une requête SQL permet l'injection SQL. Un tag peut transformer chaque valeur en **paramètre** (`$1`, `$2`…) que le pilote de base de données transmettra séparément :

```js
function sql(chaines, ...valeurs) {
  return {
    texte: chaines.reduce((acc, chaine, i) => `${acc}$${i}${chaine}`),
    valeurs,
  };
}

const email = "ana@exemple.fr' OR '1'='1";
const requete = sql`SELECT * FROM utilisateurs WHERE email = ${email} AND actif = ${true}`;

console.log(requete.texte); // SELECT * FROM utilisateurs WHERE email = $1 AND actif = $2
console.log(requete.valeurs); // ["ana@exemple.fr' OR '1'='1", true]
```

Plusieurs pilotes et ORM pour Node.js exposent un tag `sql` construit sur ce principe : l'écriture reste naturelle et l'injection devient impossible par construction.

### Cas d'usage : retirer l'indentation

```js
function dedent(chaines, ...valeurs) {
  const texte = chaines.reduce((acc, chaine, i) => acc + valeurs[i - 1] + chaine);
  const lignes = texte.replace(/^\n/, "").replace(/\n\s*$/, "").split("\n");
  const marge = Math.min(...lignes.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lignes.map((ligne) => ligne.slice(marge)).join("\n");
}

function aide(commande) {
  return dedent`
    Usage : ${commande} <fichier>
      --verbose   affiche les détails
  `;
}

console.log(aide("compter"));
// Usage : compter <fichier>
//   --verbose   affiche les détails
```

Une méthode standard `String.dedent` est en cours de conception (stage 2 en novembre 2026). D'autres tags très répandus : `html` de `lit`, `css` de styled-components, `gql` pour GraphQL.

## Littéraux d'objets améliorés

### Propriétés raccourcies

Quand une variable porte déjà le nom de la propriété, on l'écrit une seule fois (ES2015) :

```js
const nom = "Ana";
const age = 31;

const personne = { nom, age }; // équivaut à { nom: nom, age: age }
console.log(personne); // { nom: "Ana", age: 31 }

// Astuce de débogage : afficher plusieurs variables avec leur nom
const total = 120;
const remise = 15;
console.log({ total, remise }); // { total: 120, remise: 15 }
```

### Méthodes concises

```js
const compteur = {
  valeur: 0,
  incrementer(pas = 1) {
    this.valeur += pas;
    return this; // permet le chaînage
  },
};

console.log(compteur.incrementer().incrementer(5).valeur); // 6
```

Une méthode concise n'est pas tout à fait une propriété `function` : elle **ne peut pas être appelée avec `new`** et elle peut utiliser **`super`** pour appeler la méthode du prototype ([chapitre 10](../10-objets/README.md)) :

```js
const animal = {
  decrire() {
    return "Je suis un animal";
  },
};

const chat = {
  decrire() {
    return `${super.decrire()}, plus précisément un chat`;
  },
};
Object.setPrototypeOf(chat, animal);

console.log(chat.decrire()); // Je suis un animal, plus précisément un chat

try {
  new chat.decrire();
} catch (erreur) {
  console.log(erreur.name); // TypeError
}
```

N'utilisez pas de fonction fléchée comme méthode si elle a besoin de `this` : une fléchée prend le `this` du contexte englobant ([chapitre 6](../06-fonctions/README.md)).

### Clés calculées

Entre crochets, n'importe quelle expression devient un nom de propriété (ES2015) :

```js
const langue = "fr";
const formulaire = {
  ["email"]: "ana@exemple.fr",
  [`libelle_${langue}`]: "Adresse e-mail",
};
console.log(formulaire); // { email: "ana@exemple.fr", libelle_fr: "Adresse e-mail" }

// Très utile avec le spread pour mettre à jour un champ choisi dynamiquement
function mettreAJour(etat, champ, valeur) {
  return { ...etat, [champ]: valeur };
}
console.log(mettreAJour({ nom: "", ville: "" }, "ville", "Lille")); // { nom: "", ville: "Lille" }
```

Les clés calculées acceptent aussi les symboles, par exemple `[Symbol.iterator]() { … }` pour rendre un objet itérable ([chapitre 13](../13-iterateurs-generateurs/README.md)).

## Paramètres par défaut

Un paramètre par défaut (ES2015) s'applique quand l'argument est **absent ou `undefined`** — pas quand il vaut `null`.

```js
function saluer(nom = "invité", salutation = "Bonjour") {
  return `${salutation}, ${nom} !`;
}

console.log(saluer()); // Bonjour, invité !
console.log(saluer("Ana")); // Bonjour, Ana !
console.log(saluer(undefined, "Salut")); // Salut, invité !
console.log(saluer(null)); // Bonjour, null !
```

L'ancienne technique `x = x || defaut` est fausse dès que `0`, `""` ou `false` sont des valeurs légitimes :

```js
function volumeAncien(niveau) {
  niveau = niveau || 50; // ❌ 0 est remplacé par 50
  return niveau;
}

function volume(niveau = 50) {
  return niveau; // ✅
}

console.log(volumeAncien(0), volume(0)); // 50 0
```

La valeur par défaut est **évaluée à chaque appel** (contrairement à Python, un tableau par défaut n'est pas partagé entre les appels), et elle peut utiliser les paramètres précédents :

```js
function ajouter(element, liste = []) {
  liste.push(element);
  return liste;
}
console.log(ajouter("a"), ajouter("b")); // ["a"] ["b"]

function rectangle(largeur, hauteur = largeur) {
  return largeur * hauteur;
}
console.log(rectangle(4), rectangle(4, 2)); // 16 8
```

On peut même rendre un paramètre **obligatoire** en appelant une fonction qui lève une erreur :

```js
function requis(nom) {
  throw new TypeError(`Le paramètre « ${nom} » est obligatoire`);
}

function creerCompte(email = requis("email"), role = "membre") {
  return { email, role };
}

console.log(creerCompte("ana@exemple.fr")); // { email: "ana@exemple.fr", role: "membre" }

try {
  creerCompte();
} catch (erreur) {
  console.log(erreur.message); // Le paramètre « email » est obligatoire
}
```

## Opérateurs et littéraux récents

### Chaînage optionnel et coalescence des nuls (ES2020)

`?.` interrompt l'accès et renvoie `undefined` si ce qui le précède vaut `null` ou `undefined` ; `??` fournit une valeur de repli **uniquement** pour `null` et `undefined`. Ils sont détaillés au [chapitre 4](../04-conditions/README.md).

```js
const reponse = { donnees: { utilisateur: { nom: "Ana", preferences: null } } };

console.log(reponse.donnees?.utilisateur?.nom); // Ana
console.log(reponse.donnees?.commandes?.[0]?.id); // undefined
console.log(reponse.donnees.utilisateur.notifier?.("bonjour")); // undefined
console.log(reponse.donnees.utilisateur.preferences?.theme ?? "clair"); // clair
console.log(0 ?? 42, 0 || 42); // 0 42
```

### Affectations logiques (ES2021)

| Opérateur | Équivaut à | Affecte quand `a` est… |
| --- | --- | --- |
| `a \|\|= b` | `a \|\| (a = b)` | falsy (`0`, `""`, `null`…) |
| `a &&= b` | `a && (a = b)` | truthy |
| `a ??= b` | `a ?? (a = b)` | `null` ou `undefined` |

```js
const options = { titre: "", delai: 0, cache: null, auteur: "  Ana  " };

options.titre ||= "Sans titre"; // "" est falsy : remplacé
options.delai ??= 1000; // 0 n'est pas nul : conservé
options.cache ??= new Map(); // initialisation paresseuse
options.auteur &&= options.auteur.trim(); // transforme seulement si présent

console.log(options); // { titre: "Sans titre", delai: 0, cache: Map(0) {}, auteur: "Ana" }
```

Notez l'équivalence exacte : `a ||= b` vaut `a || (a = b)`, **pas** `a = a || b`. Si aucune affectation n'est nécessaire, aucune n'a lieu : un setter n'est pas appelé, et un objet gelé ne provoque pas d'erreur.

```js
const config = Object.freeze({ port: 8080 });

config.port ??= 3000; // aucune affectation : pas d'erreur, même en mode strict
console.log(config.port); // 8080

try {
  config.port = config.port ?? 3000; // affectation forcée sur un objet gelé
} catch (erreur) {
  console.log(erreur.name); // TypeError
}
```

### Exponentiation (ES2016)

```js
console.log(2 ** 10); // 1024
console.log(2 ** 3 ** 2); // 512
console.log((-2) ** 2); // 4
console.log(2n ** 64n); // 18446744073709551616n

let capital = 1000;
capital *= 1.05 ** 2;
console.log(capital); // 1102.5
```

`**` est associatif **à droite** (`2 ** 3 ** 2` vaut `2 ** 9`). Et `-2 ** 2` est une **erreur de syntaxe** : le langage refuse de deviner si vous vouliez `(-2) ** 2` ou `-(2 ** 2)`.

### Séparateurs numériques (ES2021)

Le caractère `_` peut séparer les chiffres d'un littéral numérique pour le rendre lisible. Il n'a aucun effet sur la valeur.

```js
const population = 68_400_000;
const octetsParGo = 1_073_741_824;
const couleur = 0xff_88_00;
const masque = 0b1111_0000;

console.log(population, octetsParGo); // 68400000 1073741824
console.log(couleur, masque); // 16746496 240

// Les séparateurs n'existent que dans le code source, pas dans les conversions
console.log(Number("1_000"), parseInt("1_000", 10)); // NaN 1
```

Interdit : au début (`_1` est un identifiant), à la fin, en double (`1__0`), juste après un `0` initial, ou à côté du point et de l'exposant (`1_.5`, `1_e3`).

### Littéraux binaires, octaux et BigInt

```js
console.log(0b1010, 0o755, 0x1f); // 10 493 31
console.log(9007199254740993n + 1n); // 9007199254740994n
```

`0b` et `0o` datent d'ES2015 ; l'ancienne notation octale `0755` est interdite en mode strict. Les `BigInt` (suffixe `n`, ES2020) sont présentés au [chapitre 8](../08-nombres-et-math/README.md).

## Petites nouveautés de syntaxe

### `catch` sans paramètre (ES2019)

Quand l'erreur elle-même ne vous intéresse pas, le paramètre de `catch` est facultatif ([chapitre 17](../17-erreurs/README.md)) :

```js
function estJsonValide(texte) {
  try {
    JSON.parse(texte);
    return true;
  } catch {
    return false;
  }
}

console.log(estJsonValide('{"ok":true}'), estJsonValide("{ok}")); // true false
```

### Hashbang (ES2023)

Une première ligne `#!` indique au système quel interpréteur utiliser pour un script exécutable. Node l'acceptait depuis longtemps ; ES2023 l'a standardisée, si bien que les moteurs et les outils la traitent tous comme un commentaire.

```js
#!/usr/bin/env node
console.log("Ce fichier peut être lancé directement avec ./outil.js");
```

```bash
chmod +x outil.js
./outil.js
```

### Virgules finales

Une virgule après le dernier élément est autorisée dans les tableaux et objets (ES5), ainsi que dans les listes de paramètres et d'arguments (ES2017). Prettier l'ajoute systématiquement sur les listes multilignes : ajouter un élément ne modifie alors qu'une ligne dans le diff Git.

```js
const etapes = [
  "commande",
  "paiement",
  "livraison", // virgule finale autorisée
];

function creer(nom, options,) {
  return { nom, ...options };
}

console.log(creer("test", { actif: true },)); // { nom: "test", actif: true }
console.log(etapes.length); // 3
```

Deux limites : pas de virgule après un élément rest (`[a, ...b,]` est une erreur), et pas de virgule finale en JSON. Ne confondez pas non plus avec une **élision** : `[1, , 3]` crée un tableau à trou de longueur 3.

### Fonctions fléchées

Rappel ([chapitre 6](../06-fonctions/README.md)) : pour renvoyer un objet littéral depuis une fléchée à corps expression, entourez-le de parenthèses, sinon l'accolade ouvre un bloc.

```js
const creerPoint = (x, y) => ({ x, y });
console.log(creerPoint(1, 2)); // { x: 1, y: 2 }
```

### Le reste de la syntaxe moderne

Plusieurs grandes constructions modernes ont leur propre chapitre :

| Syntaxe | Exemple | Chapitre |
| --- | --- | --- |
| `let` / `const`, portée de bloc | `const total = 0;` | [02 — Variables](../02-variables/README.md) |
| `for…of` | `for (const x of liste)` | [05 — Boucles](../05-boucles/README.md) |
| Générateurs, `for await…of` | `function* ids() { yield 1; }` | [13 — Itérateurs et générateurs](../13-iterateurs-generateurs/README.md) |
| Classes, champs privés, `static` | `class Compte { #solde = 0; }` | [16 — Classes](../16-classes/README.md) |
| `using`, `await using` | `using fichier = ouvrir();` | [17 — Erreurs](../17-erreurs/README.md) |
| `async` / `await`, top-level await | `const donnees = await charger();` | [20 — Async/await](../20-async-await/README.md) |
| `import` / `export`, `import()` | `import { somme } from "./math.js";` | [26 — Modules](../26-modules/README.md) |

On lit souvent que les classes sont « du sucre syntaxique sur les prototypes ». C'est vrai pour la mécanique d'héritage, mais faux pour le reste : champs privés `#`, appel interdit sans `new`, zone morte temporelle, `super`… Le [chapitre 16](../16-classes/README.md) détaille ces différences.

## Quoi de neuf, version par version

Depuis ES2015, une nouvelle édition d'ECMAScript paraît chaque année en juin. Une proposition y entre quand elle atteint le **stage 4** du processus TC39 (au moins deux implémentations, tests écrits) avant le gel de l'édition, au début de l'année. Le nom de l'édition est donc une année, et « ES6 » est l'ancien nom d'ES2015. Le processus et les stages sont présentés au [chapitre 1](../01-introduction/README.md).

| Édition | Syntaxe | Bibliothèque standard | Où l'étudier |
| --- | --- | --- | --- |
| **ES2015** (ES6) | `let`/`const`, fonctions fléchées, classes, template literals, déstructuration, paramètres par défaut, rest/spread (tableaux, appels), `for…of`, générateurs, modules, propriétés raccourcies, méthodes concises, clés calculées, `0b`/`0o`, `new.target` | `Promise`, `Map`, `Set`, `WeakMap`, `WeakSet`, `Symbol`, `Proxy`, `Reflect`, tableaux typés, `Array.from`/`of`, `find`/`findIndex`, `Object.assign`, `Object.is`, `includes`/`startsWith`/`endsWith`/`repeat` sur les chaînes, `Number.isInteger`/`EPSILON`, drapeaux RegExp `u` et `y` | [02](../02-variables/README.md), [06](../06-fonctions/README.md), ce chapitre, [12](../12-collections/README.md), [13](../13-iterateurs-generateurs/README.md), [16](../16-classes/README.md), [19](../19-promises/README.md), [26](../26-modules/README.md) |
| **ES2016** | opérateur `**` | `Array.prototype.includes` | [03](../03-types-et-operateurs/README.md), [09](../09-tableaux/README.md) |
| **ES2017** | `async`/`await`, virgule finale dans les paramètres | `Object.values`/`entries`/`getOwnPropertyDescriptors`, `padStart`/`padEnd`, `SharedArrayBuffer`, `Atomics` | [07](../07-chaines/README.md), [10](../10-objets/README.md), [20](../20-async-await/README.md) |
| **ES2018** | rest/spread d'objets, `for await…of`, générateurs asynchrones, échappements libres dans les templates étiquetés | `Promise.prototype.finally` ; RegExp : groupes nommés, lookbehind, drapeau `s`, `\p{…}` | ce chapitre, [13](../13-iterateurs-generateurs/README.md), [14](../14-regex/README.md), [19](../19-promises/README.md) |
| **ES2019** | `catch` sans paramètre | `flat`/`flatMap`, `Object.fromEntries`, `trimStart`/`trimEnd`, `Symbol.prototype.description`, tri stable garanti, `JSON.stringify` bien formé | [07](../07-chaines/README.md), [09](../09-tableaux/README.md), [10](../10-objets/README.md), [17](../17-erreurs/README.md) |
| **ES2020** | `?.`, `??`, `import()`, `import.meta`, `export * as ns from` | `BigInt`, `Promise.allSettled`, `globalThis`, `matchAll`, ordre de `for…in` spécifié | [04](../04-conditions/README.md), [08](../08-nombres-et-math/README.md), [19](../19-promises/README.md), [26](../26-modules/README.md) |
| **ES2021** | `&&=`, `\|\|=`, `??=`, séparateurs numériques | `replaceAll`, `Promise.any`/`AggregateError`, `WeakRef`/`FinalizationRegistry` | ce chapitre, [07](../07-chaines/README.md), [12](../12-collections/README.md), [19](../19-promises/README.md) |
| **ES2022** | champs de classe publics et privés, méthodes privées, blocs `static`, `#x in obj`, top-level await | `.at()`, `Object.hasOwn`, option `cause` des erreurs, drapeau RegExp `d` | [09](../09-tableaux/README.md), [16](../16-classes/README.md), [17](../17-erreurs/README.md), [20](../20-async-await/README.md) |
| **ES2023** | hashbang `#!` | `findLast`/`findLastIndex`, `toSorted`/`toReversed`/`toSpliced`/`with`, symboles comme clés de `WeakMap` | [09](../09-tableaux/README.md), [12](../12-collections/README.md) |
| **ES2024** | drapeau RegExp `v` | `Object.groupBy`/`Map.groupBy`, `Promise.withResolvers`, `ArrayBuffer` redimensionnable et `transfer()`, `isWellFormed`/`toWellFormed`, `Atomics.waitAsync` | [07](../07-chaines/README.md), [09](../09-tableaux/README.md), [12](../12-collections/README.md), [14](../14-regex/README.md), [19](../19-promises/README.md) |
| **ES2025** | import attributes et modules JSON (`with { type: "json" }`), modificateurs RegExp `(?i:…)`, groupes nommés dupliqués | Iterator helpers (`Iterator.from`, `.map`, `.filter`, `.take`…), méthodes ensemblistes de `Set`, `Promise.try`, `RegExp.escape`, `Float16Array`/`Math.f16round` | [12](../12-collections/README.md), [13](../13-iterateurs-generateurs/README.md), [14](../14-regex/README.md), [19](../19-promises/README.md), [26](../26-modules/README.md) |
| **ES2026** | — | `getOrInsert`/`getOrInsertComputed` sur `Map` et `WeakMap`, `Iterator.concat`, `Uint8Array` ↔ base64/hex, `Math.sumPrecise`, `Error.isError`, `Array.fromAsync`, accès au texte source dans `JSON.parse` (`JSON.rawJSON`) | [07](../07-chaines/README.md), [08](../08-nombres-et-math/README.md), [12](../12-collections/README.md), [13](../13-iterateurs-generateurs/README.md), [17](../17-erreurs/README.md), [20](../20-async-await/README.md), [25](../25-json-et-stockage/README.md) |

### Les nouveautés récentes sont-elles utilisables ?

Jusqu'à ES2023, tout est disponible dans les navigateurs à jour et dans les versions de Node encore maintenues (22, 24 et 26). Pour les éditions récentes, la situation en **novembre 2026** est la suivante (sources : MDN et web-features ; « Baseline 2025 » signifie disponible dans tous les navigateurs principaux depuis 2025, « largement disponible » signifie depuis plus de 30 mois) :

| Fonctionnalité | Édition | Navigateurs | Node.js |
| --- | --- | --- | --- |
| `Object.groupBy`, `Map.groupBy` | ES2024 | largement disponible | 21+ |
| `Promise.withResolvers` | ES2024 | largement disponible | 22+ |
| Méthodes de `Set` (`union`…) | ES2025 | Baseline 2024 | 22+ |
| Iterator helpers | ES2025 | Baseline 2025 | 22+ |
| `Promise.try` | ES2025 | Baseline 2025 | 23+ |
| `RegExp.escape`, `Float16Array` | ES2025 | Baseline 2025 | 24+ |
| `Array.fromAsync` | ES2026 | largement disponible | 22+ |
| `Uint8Array.fromBase64` et associées | ES2026 | Baseline 2025 | 25+ |
| `Map.prototype.getOrInsert` | ES2026 | Baseline 2026 | 26+ |
| `Iterator.concat` | ES2026 | Baseline 2026 | 26+ |
| `Math.sumPrecise` | ES2026 | Baseline 2026 | pas encore |
| `Error.isError` | ES2026 | pas encore dans Safari stable | 24.3+ |

En pratique : visez **Node 26** (LTS active depuis octobre 2026) pour profiter de tout ES2026 côté serveur, et vérifiez la compatibilité sur MDN avant d'utiliser une API de 2025-2026 côté navigateur.

## Ce qui arrive

État des propositions TC39 en **novembre 2026** (source : le dépôt [tc39/proposals](https://github.com/tc39/proposals)). Ces informations évoluent vite : revérifiez-les avant de vous y fier.

### Stage 4 : déjà acquis pour ES2027

Ces propositions sont terminées et figureront dans ES2027 (juin 2027). Plusieurs sont déjà utilisables.

| Proposition | Ce qu'elle apporte | Disponibilité (nov. 2026) |
| --- | --- | --- |
| Explicit Resource Management | `using`, `await using`, `DisposableStack`, `Symbol.dispose` : libération automatique des ressources ([chapitre 17](../17-erreurs/README.md)) | Chrome 134+, Firefox 141+, Node 24+ ; pas encore dans Safari stable |
| Temporal | API de dates et heures moderne qui remplace `Date` ([chapitre 15](../15-dates/README.md)) | Chrome 144+, Firefox 139+, Node 26+ ; pas encore dans Safari stable (polyfill : `temporal-polyfill`) |
| Joint iteration | `Iterator.zip`, `Iterator.zipKeyed` ([chapitre 13](../13-iterateurs-generateurs/README.md)) | Chrome 153+, Firefox 148+ |
| Iterator chunking | `.chunks(n)`, `.windows(n)` sur les itérateurs | Firefox 154+ |
| Iterator includes / join | `.includes(valeur)`, `.join(separateur)` sur les itérateurs | `join` : Chrome 153+ ; `includes` : Chrome 154+ ; les deux : Firefox 154+ |
| `Atomics.pause` | indication au processeur dans les boucles d'attente active (code multithread) | Chrome 133+, Firefox 137+, Safari 18.4+, Node 24+ |

```js
// Déjà exécutable dans Node 24+ : la ressource est libérée à la sortie du bloc
function ouvrir(nom) {
  console.log(`ouverture de ${nom}`);
  return { nom, [Symbol.dispose]: () => console.log(`fermeture de ${nom}`) };
}

{
  using journal = ouvrir("journal.txt");
  console.log(`écriture dans ${journal.nom}`);
}
// ouverture de journal.txt
// écriture dans journal.txt
// fermeture de journal.txt
```

### Stage 3 : la spécification est prête, les implémentations arrivent

| Proposition | Exemple |
| --- | --- |
| Évaluation différée des modules | `import defer * as outils from "./outils.js";` : le module n'est exécuté qu'au premier accès à `outils` |
| Imports de phase source | `import source module from "./calcul.wasm";` (surtout pour WebAssembly) |
| Import de texte | `import gabarit from "./gabarit.txt" with { type: "text" };` |
| Dictionnaire de promesses | `const { profil, commandes } = await Promise.allKeyed({ profil: p1, commandes: p2 });` |
| Accesseur `Error.prototype.stack` | standardise la propriété `stack`, déjà présente partout mais jamais spécifiée |
| Frontières de tampon RegExp | `\A`, `\z`, `\Z` pour « début » et « fin » absolus du texte |

### Plus loin dans le processus

- **Décorateurs** (`@journaliser méthode() {}`) et **Decorator Metadata** : actuellement au **stage 2.7** (après un passage au stage 3 de 2022 à mai 2026). Aucune prise en charge native dans les navigateurs ; ils restent utilisables via TypeScript ou Babel. Voir le [chapitre 16](../16-classes/README.md).
- **Stage 2.7** : `ShadowRealm` (environnement d'exécution isolé), `ArrayBuffer` immuables.
- **Stage 2** : opérateur pipeline `|>`, Async Iterator helpers, `String.dedent`, `Math.clamp`, `Iterator.range`, Async Context.
- **Stage 1** : _pattern matching_ (`match (valeur) { … }`), annotations de types (syntaxe de types ignorée à l'exécution), signaux. Records & Tuples a été retiré en 2025 au profit de la proposition « Composites ».

## Transpilation aujourd'hui

Transpiler, c'est réécrire du JavaScript moderne en JavaScript plus ancien que des environnements plus vieux comprennent. Il faut distinguer deux besoins :

- la **syntaxe** (`?.`, classes, `using`…) : un ancien moteur ne sait pas la lire ; seul un transpileur peut la réécrire ;
- les **API** (`Set.prototype.union`, `Iterator.concat`…) : un ancien moteur ne les possède pas ; il faut un **polyfill** qui les ajoute à l'exécution (par exemple `core-js`, ou un polyfill dédié comme `temporal-polyfill`).

En 2026, la quasi-totalité de la syntaxe ES2015-ES2023 fonctionne dans tous les navigateurs à jour et dans toutes les versions de Node maintenues. La transpilation sert donc surtout à autre chose que la compatibilité :

| Besoin | Outils typiques |
| --- | --- |
| Écrire en **TypeScript** ou en **JSX** | `tsc`, esbuild, SWC, Oxc, Babel ; les versions LTS de Node exécutent aussi directement du TypeScript en retirant les types ([chapitre 27](../27-nodejs/README.md)) |
| Utiliser une syntaxe **pas encore standard** (décorateurs) | TypeScript, Babel |
| Cibler des **navigateurs anciens** (appareils non mis à jour, webviews) | Babel + `@babel/preset-env`, ou l'option `target` d'esbuild/Vite, plus des polyfills |
| Réduire la taille du code livré (minification) | esbuild, Oxc, Terser |

L'outil de référence pour décider est **Baseline** : un ensemble de fonctionnalités disponibles dans tous les navigateurs principaux. Les outils savent le cibler directement :

- **Vite 8** utilise par défaut la cible `'baseline-widely-available'` (Chrome 111, Edge 111, Firefox 114, Safari 16.4) et transforme la syntaxe avec Oxc ; il **n'ajoute pas** de polyfills d'API ([chapitre 28](../28-outillage/README.md)).
- **browserslist** (utilisé par Babel, Autoprefixer, Lightning CSS…) accepte des requêtes comme `baseline widely available` ou `baseline 2024`. Sa requête `defaults` vaut `> 0.5%, last 2 versions, Firefox ESR, not dead`.

```bash
# Quelles versions de navigateurs correspondent à une requête ?
npx browserslist "baseline widely available"
```

Côté **serveur**, la question est encore plus simple : vous choisissez la version de Node. Un projet qui exige Node 24 ou 26 (champ `engines` du `package.json`) n'a besoin d'aucune transpilation de syntaxe, seulement éventuellement du retrait des types TypeScript.

> [!TIP]
> Avant d'ajouter Babel à un projet, posez-vous la question : quelles cibles dois-je réellement prendre en charge ? Si la réponse est « les navigateurs Baseline » ou « Node LTS », un bundler moderne configuré avec la bonne cible suffit, et il est bien plus rapide.

## Pièges courants

**Déstructurer `null` ou `undefined`.** `const { nom } = reponse.utilisateur;` plante si `utilisateur` est absent. Donnez une valeur par défaut au niveau concerné (`{ utilisateur: { nom } = {} } = reponse`) ou lisez avec `?.`.

**Croire que le défaut couvre `null`.** Les valeurs par défaut (déstructuration et paramètres) ne s'appliquent qu'à `undefined`. Une API qui renvoie `null` pour « absent » doit être normalisée avec `??`.

```js
const { titre = "Sans titre" } = { titre: null };
console.log(titre); // null

const titreSur = ({ titre: null }).titre ?? "Sans titre";
console.log(titreSur); // Sans titre
```

**Oublier les parenthèses autour d'une affectation par déstructuration d'objet.** `{ a, b } = objet;` est une erreur de syntaxe : il faut `({ a, b } = objet);`.

**Le point-virgule manquant avant `[` ou `(`.** Sans point-virgule, la ligne suivante est collée à la précédente :

<!-- no-run -->
```js
let a = 1
let b = 2
[a, b] = [b, a] // lu comme : let b = 2[a, b] = [b, a]  →  ReferenceError
```

**Copie superficielle prise pour une copie profonde.** `[...tableau]` et `{ ...objet }` ne copient que le premier niveau. Les objets imbriqués restent partagés : recopiez chaque niveau modifié ou utilisez `structuredClone`.

**Spread d'une instance de classe.** `{ ...instance }` perd le prototype, donc les méthodes et les getters définis dans la classe. Pour cloner une instance, écrivez une méthode dédiée.

**Mauvais ordre de fusion.** Dans `{ ...a, ...b }`, `b` gagne. Les valeurs par défaut se placent en premier.

**Mélanger `??` avec `||` ou `&&` sans parenthèses.** `a || b ?? c` est une erreur de syntaxe ; écrivez `(a || b) ?? c`.

**`-x ** 2`.** Erreur de syntaxe : écrivez `(-x) ** 2` ou `-(x ** 2)` selon votre intention.

**Tag qui « perd » les valeurs falsy.** Un tag qui teste `valeurs[i] ? … : ""` fait disparaître `0` et `""`. Testez l'index (`i < valeurs.length`).

**Spread sur de très grands tableaux.** `Math.max(...grandTableau)` peut lever `RangeError` ; utilisez une boucle ou `reduce`.

## Bonnes pratiques

- Déstructurez **ce dont vous avez besoin**, au plus près de son utilisation ; au-delà de deux niveaux d'imbrication, préférez plusieurs déstructurations ou `?.`.
- Pour une fonction à plus de deux ou trois paramètres, ou avec des booléens, utilisez un **objet d'options** déstructuré avec valeurs par défaut et `= {}`.
- Mettez à jour l'état **sans mutation** avec le spread, en recopiant uniquement les niveaux qui changent.
- Excluez une propriété avec le reste d'objet (`const { secret, ...publique } = objet;`) plutôt qu'avec `delete`.
- Utilisez `??` et `??=` pour les valeurs absentes, `||` seulement si toutes les valeurs falsy doivent être remplacées.
- Réservez les templates étiquetés aux vrais besoins (échappement, paramètres, DSL) : un tag cache un traitement, nommez-le clairement.
- Écrivez les séparateurs numériques pour les grandes constantes (`1_000_000`, `86_400_000`).
- Avant de transpiler, définissez vos **cibles** (Baseline, version de Node) : c'est elles qui décident, pas l'habitude.

## Résumé

- La syntaxe moderne n'est pas que du sucre : plusieurs constructions ont une sémantique propre (spread d'objet, fléchées, classes).
- La **déstructuration** extrait par position (tableaux et tout itérable) ou par nom (objets), avec renommage, valeurs par défaut (seulement pour `undefined`), reste et imbrication. Elle brille dans les paramètres (objet d'options) et les boucles.
- `...` étale (**spread**) là où l'on produit une valeur et rassemble (**rest**) là où l'on reçoit. Le spread copie en surface ; le spread d'objet copie les propriétés propres énumérables, la dernière gagne.
- Un **template étiqueté** appelle une fonction avec les morceaux littéraux (et leur version `raw`) et les valeurs : idéal pour échapper, paramétrer, transformer. `String.raw` est le tag standard.
- Les **paramètres par défaut** sont évalués à chaque appel et remplacent `x = x || défaut`.
- `??=`, `||=`, `&&=` n'affectent que si nécessaire ; `**` est associatif à droite ; `1_000` n'existe que dans le code source.
- ES2025 et ES2026 ont surtout enrichi la bibliothèque standard (itérateurs, `Set`, `Map`, base64…). ES2027 apportera `using`, Temporal et de nouveaux outils pour les itérateurs ; les décorateurs sont actuellement au stage 2.7.
- En 2026, on transpile surtout pour TypeScript, JSX et les cibles anciennes ; la cible se décide avec Baseline ou la version de Node.

## Exercices

### Exercice 1 — Lire une réponse d'API (★☆☆)

À partir de l'objet ci-dessous, obtenez en **une seule déstructuration** les variables `titre`, `nomAuteur` (depuis `auteur.nom`), `premierTag`, `autresTags` et `vues` (valeur par défaut `0`, car la propriété peut manquer).

```js
const article = {
  titre: "Comprendre la déstructuration",
  auteur: { nom: "Ana", email: "ana@exemple.fr" },
  tags: ["js", "es2015", "syntaxe"],
};
```

<details>
<summary>Solution</summary>

```js
const article = {
  titre: "Comprendre la déstructuration",
  auteur: { nom: "Ana", email: "ana@exemple.fr" },
  tags: ["js", "es2015", "syntaxe"],
};

const {
  titre,
  auteur: { nom: nomAuteur },
  tags: [premierTag, ...autresTags],
  vues = 0,
} = article;

console.log(titre); // Comprendre la déstructuration
console.log(nomAuteur, premierTag, autresTags, vues); // Ana js ["es2015", "syntaxe"] 0
```

`auteur: { nom: nomAuteur }` suit le chemin `auteur.nom` et range la valeur dans `nomAuteur` ; aucune variable `auteur` n'est créée. Le motif de tableau imbriqué combine position et reste, et `vues = 0` couvre la propriété absente.

</details>

### Exercice 2 — Fusionner des réglages (★☆☆)

Écrivez `fusionnerReglages(utilisateur)` qui part des réglages par défaut ci-dessous et applique ceux de l'utilisateur, **y compris dans le sous-objet `affichage`**, sans modifier `REGLAGES_DEFAUT`. Un utilisateur qui ne précise que `affichage.police` doit conserver `affichage.theme`.

```js
const REGLAGES_DEFAUT = { langue: "fr", affichage: { theme: "clair", police: 16 } };
```

<details>
<summary>Solution</summary>

```js
const REGLAGES_DEFAUT = { langue: "fr", affichage: { theme: "clair", police: 16 } };

function fusionnerReglages(utilisateur = {}) {
  return {
    ...REGLAGES_DEFAUT,
    ...utilisateur,
    affichage: { ...REGLAGES_DEFAUT.affichage, ...utilisateur.affichage },
  };
}

console.log(fusionnerReglages({ affichage: { police: 20 } })); // { langue: "fr", affichage: { theme: "clair", police: 20 } }
console.log(fusionnerReglages({ langue: "en" }).affichage); // { theme: "clair", police: 16 }
console.log(REGLAGES_DEFAUT.affichage.police); // 16
```

Un simple `{ ...REGLAGES_DEFAUT, ...utilisateur }` remplacerait **tout** le sous-objet `affichage` par celui de l'utilisateur (on perdrait `theme`). On fusionne donc ce niveau explicitement. `...utilisateur.affichage` fonctionne même si `affichage` est absent, car étaler `undefined` ne produit rien.

</details>

### Exercice 3 — Une fonction à options (★★☆)

Écrivez `construireUrl({ hote, chemin = "/", params = {}, https = true })` qui renvoie une URL complète. Les paramètres de requête doivent être encodés correctement (utilisez `URLSearchParams`, présenté au [chapitre 22](../22-fetch-http/README.md)), et l'appel sans argument doit lever une erreur claire plutôt qu'une `TypeError` obscure.

<details>
<summary>Solution</summary>

```js
function construireUrl({ hote, chemin = "/", params = {}, https = true } = {}) {
  if (!hote) throw new TypeError("L'option « hote » est obligatoire");
  const requete = new URLSearchParams(params).toString();
  return `${https ? "https" : "http"}://${hote}${chemin}${requete ? `?${requete}` : ""}`;
}

console.log(construireUrl({ hote: "exemple.fr" })); // https://exemple.fr/
console.log(construireUrl({ hote: "api.exemple.fr", chemin: "/recherche", params: { q: "café crème", page: 2 } })); // https://api.exemple.fr/recherche?q=caf%C3%A9+cr%C3%A8me&page=2
console.log(construireUrl({ hote: "localhost:3000", https: false })); // http://localhost:3000/

try {
  construireUrl();
} catch (erreur) {
  console.log(erreur.message); // L'option « hote » est obligatoire
}
```

Le `= {}` final évite l'erreur de déstructuration quand on n'envoie rien, ce qui permet ensuite de vérifier `hote` et de lever un message utile.

</details>

### Exercice 4 — Mise à jour immuable (★★☆)

Écrivez `basculerTache(etat, id)` qui renvoie un **nouvel** état dans lequel la tâche d'identifiant `id` a sa propriété `faite` inversée. L'état d'origine ne doit pas changer, et les tâches non concernées doivent être **les mêmes objets** (même référence) dans l'ancien et le nouvel état.

```js
const etat = {
  filtre: "toutes",
  taches: [
    { id: 1, titre: "Lire le chapitre", faite: true },
    { id: 2, titre: "Faire les exercices", faite: false },
  ],
};
```

<details>
<summary>Solution</summary>

```js
const etat = {
  filtre: "toutes",
  taches: [
    { id: 1, titre: "Lire le chapitre", faite: true },
    { id: 2, titre: "Faire les exercices", faite: false },
  ],
};

function basculerTache(etat, id) {
  return {
    ...etat,
    taches: etat.taches.map((tache) => (tache.id === id ? { ...tache, faite: !tache.faite } : tache)),
  };
}

const suivant = basculerTache(etat, 2);

console.log(etat.taches[1].faite, suivant.taches[1].faite); // false true
console.log(etat.taches[0] === suivant.taches[0]); // true
console.log(etat.taches === suivant.taches); // false
```

`map` produit un nouveau tableau ; seule la tâche modifiée est recréée avec un spread, les autres sont renvoyées telles quelles. C'est exactement ce qu'attendent les bibliothèques d'interface qui comparent les références pour savoir quoi redessiner.

</details>

### Exercice 5 — Un tag pour les journaux (★★☆)

Écrivez un tag `confidentiel` qui masque chaque valeur interpolée : on garde son premier caractère et on remplace le reste par `***`. Le texte littéral reste intact.

<!-- no-run -->
```js
confidentiel`Connexion de ${"ana@exemple.fr"} avec le code ${"482913"}`;
// "Connexion de a*** avec le code 4***"
```

<details>
<summary>Solution</summary>

```js
function confidentiel(chaines, ...valeurs) {
  const masquer = (valeur) => `${String(valeur).slice(0, 1)}***`;
  return chaines.reduce((acc, chaine, i) => acc + masquer(valeurs[i - 1]) + chaine);
}

const email = "ana@exemple.fr";
const code = 482913;

console.log(confidentiel`Connexion de ${email} avec le code ${code}`); // Connexion de a*** avec le code 4***
console.log(confidentiel`Aucune valeur`); // Aucune valeur
```

`reduce` sans valeur initiale démarre avec le premier morceau ; à l'index `i`, la valeur qui précède le morceau est `valeurs[i - 1]`. Avec un seul morceau (aucune interpolation), `reduce` renvoie ce morceau sans appeler la fonction.

</details>

### Exercice 6 — Un tag `html` qui sait composer (★★★)

Le tag `html` de ce chapitre a deux limites : il échappe aussi le résultat d'un autre appel à `html` (double échappement), et il affiche un tableau sous la forme `a,b,c`. Améliorez-le :

- le tag renvoie une instance d'une classe `HtmlSur` (qui enveloppe une chaîne déjà sûre) ;
- une valeur `HtmlSur` est insérée **sans** être échappée ;
- un tableau est inséré élément par élément, sans séparateur, chaque élément suivant les mêmes règles ;
- `null` et `undefined` n'affichent rien ;
- toute autre valeur est échappée.

<details>
<summary>Solution</summary>

```js
class HtmlSur {
  constructor(contenu) {
    this.contenu = contenu;
  }
  toString() {
    return this.contenu;
  }
}

const entites = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function convertir(valeur) {
  if (valeur instanceof HtmlSur) return valeur.contenu;
  if (Array.isArray(valeur)) return valeur.map(convertir).join("");
  if (valeur === null || valeur === undefined) return "";
  return String(valeur).replace(/[&<>"']/g, (caractere) => entites[caractere]);
}

function html(chaines, ...valeurs) {
  return new HtmlSur(chaines.reduce((acc, chaine, i) => acc + convertir(valeurs[i - 1]) + chaine));
}

const produits = [{ nom: "Thé <vert>" }, { nom: "Café & croissant" }];
const liste = html`<ul>${produits.map((p) => html`<li>${p.nom}</li>`)}</ul>`;

console.log(String(liste)); // <ul><li>Thé &lt;vert&gt;</li><li>Café &amp; croissant</li></ul>
console.log(String(html`<p>${null}${undefined}</p>`)); // <p></p>
```

La classe `HtmlSur` sert de **marqueur de confiance** : seul le tag fabrique des instances, donc une valeur `HtmlSur` a forcément déjà été échappée. C'est le principe des bibliothèques de gabarits sécurisées (`lit-html`, l'échappement automatique des frameworks…).

</details>

### Exercice 7 — Moderniser du code ES5 (★★★)

Réécrivez cette fonction avec la syntaxe moderne (paramètres par défaut et rest, déstructuration, template literals, raccourcis, `??`), sans changer son comportement pour les appels donnés. Attention à un bogue caché de la version d'origine avec la quantité `0`, que votre version doit corriger.

```js
function resumeCommande(commande) {
  var client = commande.client;
  var devise = commande.devise || "EUR";
  var lignes = Array.prototype.slice.call(arguments, 1);
  var total = 0;
  for (var i = 0; i < lignes.length; i++) {
    var quantite = lignes[i].quantite || 1;
    total = total + lignes[i].prix * quantite;
  }
  return { client: client, total: total, texte: client + " doit " + total + " " + devise };
}

console.log(resumeCommande({ client: "Ana" }, { prix: 10, quantite: 2 }, { prix: 5 }).texte); // Ana doit 25 EUR
console.log(resumeCommande({ client: "Bilal", devise: "CHF" }, { prix: 8, quantite: 0 }).texte); // Bilal doit 8 CHF
```

<details>
<summary>Solution</summary>

```js
function resumeCommande({ client, devise = "EUR" }, ...lignes) {
  const total = lignes.reduce((somme, { prix, quantite = 1 }) => somme + prix * quantite, 0);
  return { client, total, texte: `${client} doit ${total} ${devise}` };
}

console.log(resumeCommande({ client: "Ana" }, { prix: 10, quantite: 2 }, { prix: 5 }).texte); // Ana doit 25 EUR
console.log(resumeCommande({ client: "Bilal", devise: "CHF" }, { prix: 8, quantite: 0 }).texte); // Bilal doit 0 CHF
```

- `arguments` + `slice` devient un paramètre rest `...lignes`, un vrai tableau.
- La boucle `for` avec accumulateur devient un `reduce` dont le callback déstructure chaque ligne.
- `lignes[i].quantite || 1` transformait une quantité `0` en `1` (d'où « Bilal doit 8 CHF ») : la valeur par défaut `quantite = 1` ne s'applique qu'à `undefined` et corrige ce bogue.
- `commande.devise || "EUR"` devient un défaut de déstructuration. Si l'API pouvait renvoyer `devise: null`, il faudrait plutôt `devise ?? "EUR"` dans le corps.

</details>

## Pour aller plus loin

- [MDN — Affecter par décomposition](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Destructuring)
- [MDN — Syntaxe de décomposition (spread)](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [MDN — Paramètres du reste](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Functions/rest_parameters)
- [MDN — Littéraux de gabarits et gabarits étiquetés](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Template_literals)
- [MDN — Initialisateur d'objet](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Object_initializer)
- [Propositions TC39 en cours](https://github.com/tc39/proposals) et [propositions terminées](https://github.com/tc39/proposals/blob/main/finished-proposals.md)
- [Baseline sur web.dev](https://web.dev/baseline) et [Can I use](https://caniuse.com/)
- [Vite — Compatibilité navigateurs](https://vite.dev/guide/build#browser-compatibility)

---

[← Chapitre précédent](../10-objets/README.md) · [Sommaire](../README.md#sommaire) · [Chapitre suivant →](../12-collections/README.md)
