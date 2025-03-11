# Les Fonctions Usuelles en JavaScript

## Table des matières

- [Introduction](#introduction)
- [Manipulation de chaînes de caractères](#manipulation-de-chaînes-de-caractères)
  - [Méthodes de base](#méthodes-de-base)
  - [Recherche dans les chaînes](#recherche-dans-les-chaînes)
  - [Extraction et modification](#extraction-et-modification)
  - [Formatage des chaînes](#formatage-des-chaînes)
- [Manipulation de tableaux](#manipulation-de-tableaux)
  - [Méthodes d'accès et de modification](#méthodes-daccès-et-de-modification)
  - [Méthodes d'itération](#méthodes-ditération)
  - [Méthodes de transformation](#méthodes-de-transformation)
  - [Méthodes de recherche](#méthodes-de-recherche)
  - [Méthodes de tri et d'ordre](#méthodes-de-tri-et-dordre)
- [Manipulation d'objets](#manipulation-dobjets)
  - [Création et manipulation d'objets](#création-et-manipulation-dobjets)
  - [Méthodes Object](#méthodes-object)
  - [Classes utilitaires d'objets](#classes-utilitaires-dobjets)
- [Fonctions mathématiques](#fonctions-mathématiques)
  - [Constantes mathématiques](#constantes-mathématiques)
  - [Fonctions arithmétiques](#fonctions-arithmétiques)
  - [Fonctions trigonométriques](#fonctions-trigonométriques)
  - [Fonctions d'arrondi](#fonctions-darrondi)
  - [Autres fonctions mathématiques](#autres-fonctions-mathématiques)
- [Manipulation de dates](#manipulation-de-dates)
  - [Création de dates](#création-de-dates)
  - [Accès aux composants de date](#accès-aux-composants-de-date)
  - [Modification des dates](#modification-des-dates)
  - [Formatage des dates](#formatage-des-dates)
- [Conversion de types](#conversion-de-types)
  - [Conversion en nombres](#conversion-en-nombres)
  - [Conversion en chaînes](#conversion-en-chaînes)
  - [Conversion en booléens](#conversion-en-booléens)
  - [Vérification de types](#vérification-de-types)
- [Fonctions de temporisation](#fonctions-de-temporisation)
- [Fonctions de navigation et d'URL](#fonctions-de-navigation-et-durl)
  - [Manipulation d'URL](#manipulation-durl)
  - [Navigation](#navigation)
- [Manipulation du DOM](#manipulation-du-dom)
  - [Sélection d'éléments](#sélection-déléments)
  - [Modification du contenu](#modification-du-contenu)
  - [Manipulation des attributs](#manipulation-des-attributs)
  - [Gestion des classes CSS](#gestion-des-classes-css)
  - [Manipulation de la structure du DOM](#manipulation-de-la-structure-du-dom)
- [Stockage local](#stockage-local)
- [Fonctions JSON](#fonctions-json)
- [Bonnes pratiques](#bonnes-pratiques)
- [Ressources supplémentaires](#ressources-supplémentaires)

## Introduction

JavaScript dispose d'un large éventail de fonctions intégrées qui facilitent les opérations courantes sur différents types de données. Ce document présente les fonctions les plus fréquemment utilisées dans le développement JavaScript, regroupées par catégories, avec des exemples pratiques d'utilisation.

Que vous soyez débutant ou développeur expérimenté, ce guide vous servira de référence pour les fonctions essentielles que vous utiliserez régulièrement dans vos projets JavaScript.

## Manipulation de chaînes de caractères

Les chaînes de caractères (strings) sont l'un des types de données les plus courants en JavaScript. Voici les méthodes les plus utiles pour les manipuler.

### Méthodes de base

```javascript
// Longueur d'une chaîne
const texte = "JavaScript";
console.log(texte.length); // 10

// Convertir la casse
console.log(texte.toLowerCase()); // "javascript"
console.log(texte.toUpperCase()); // "JAVASCRIPT"

// Accéder à un caractère
console.log(texte[0]); // "J"
console.log(texte.charAt(0)); // "J"

// Vérifier si une chaîne contient une sous-chaîne
console.log(texte.includes("Script")); // true
console.log(texte.startsWith("Java")); // true
console.log(texte.endsWith("script")); // false (sensible à la casse)
```

### Recherche dans les chaînes

```javascript
const phrase = "JavaScript est un langage de programmation populaire";

// Trouver l'index d'une sous-chaîne
console.log(phrase.indexOf("langage")); // 17
console.log(phrase.lastIndexOf("a")); // 33 (dernière occurrence)

// Recherche avec expression régulière
console.log(phrase.search(/est/)); // 11
console.log(phrase.match(/a/g)); // ['a', 'a', 'a', 'a', 'a'] (toutes les occurrences)

// Vérification - renvoie true ou false
console.log(phrase.includes("langage")); // true
console.log(phrase.startsWith("Java")); // true
console.log(phrase.endsWith("populaire")); // true
```

### Extraction et modification

```javascript
const phrase = "JavaScript est un langage de programmation populaire";

// Extraction de sous-chaînes
console.log(phrase.substring(0, 10)); // "JavaScript"
console.log(phrase.substr(11, 3)); // "est" (départ, longueur)
console.log(phrase.slice(-9)); // "populaire" (depuis la fin)

// Remplacement
console.log(phrase.replace("JavaScript", "TypeScript")); // "TypeScript est un langage de programmation populaire"
console.log(phrase.replace(/a/g, "A")); // "JAvAScript est un lAngAge de progrAmmAtion populAire"

// Division en tableau
console.log(phrase.split(" ")); // ["JavaScript", "est", "un", "langage", "de", "programmation", "populaire"]

// Suppression des espaces
const texteBrut = "  Texte avec espaces  ";
console.log(texteBrut.trim()); // "Texte avec espaces"
console.log(texteBrut.trimStart()); // "Texte avec espaces  "
console.log(texteBrut.trimEnd()); // "  Texte avec espaces"
```

### Formatage des chaînes

```javascript
// Répétition
console.log("=".repeat(10)); // "=========="

// Remplissage (padding)
console.log("5".padStart(3, "0")); // "005"
console.log("Test".padEnd(10, ".")); // "Test......"

// Littéraux de gabarit (template literals)
const nom = "JavaScript";
const annee = 1995;
console.log(`${nom} a été créé en ${annee}.`); // "JavaScript a été créé en 1995."
```

## Manipulation de tableaux

Les tableaux (arrays) sont des structures de données fondamentales en JavaScript. Voici les méthodes essentielles pour les manipuler.

### Méthodes d'accès et de modification

```javascript
// Création de tableaux
const nombres = [1, 2, 3, 4, 5];
const fruits = new Array("pomme", "banane", "orange");

// Accès aux éléments
console.log(nombres[0]); // 1
console.log(nombres.at(-1)); // 5 (dernier élément, ES2022)

// Vérification de la taille
console.log(nombres.length); // 5

// Ajout d'éléments
nombres.push(6); // Ajoute à la fin: [1, 2, 3, 4, 5, 6]
nombres.unshift(0); // Ajoute au début: [0, 1, 2, 3, 4, 5, 6]

// Suppression d'éléments
nombres.pop(); // Supprime le dernier: [0, 1, 2, 3, 4, 5]
nombres.shift(); // Supprime le premier: [1, 2, 3, 4, 5]

// Modification d'éléments
nombres[2] = 10; // [1, 2, 10, 4, 5]

// Ajout/Suppression/Remplacement
nombres.splice(1, 2, 20, 30); // [1, 20, 30, 4, 5]
// splice(index de départ, nombre d'éléments à supprimer, éléments à ajouter...)
```

### Méthodes d'itération

```javascript
const nombres = [1, 2, 3, 4, 5];

// forEach - itération simple
nombres.forEach((nombre) => {
  console.log(nombre * 2);
});

// map - crée un nouveau tableau transformé
const doubles = nombres.map((nombre) => nombre * 2);
console.log(doubles); // [2, 4, 6, 8, 10]

// filter - crée un nouveau tableau filtré
const nombresPairs = nombres.filter((nombre) => nombre % 2 === 0);
console.log(nombresPairs); // [2, 4]

// reduce - réduit le tableau à une seule valeur
const somme = nombres.reduce((total, nombre) => total + nombre, 0);
console.log(somme); // 15

// reduceRight - comme reduce mais de droite à gauche
const resultat = [1, 2, 3].reduceRight((acc, val) => acc + val, "");
console.log(resultat); // "321"

// every - vérifie si tous les éléments satisfont une condition
console.log(nombres.every((nombre) => nombre > 0)); // true

// some - vérifie si au moins un élément satisfait une condition
console.log(nombres.some((nombre) => nombre > 4)); // true
```

### Méthodes de transformation

```javascript
// concat - fusion de tableaux
const array1 = [1, 2];
const array2 = [3, 4];
console.log(array1.concat(array2)); // [1, 2, 3, 4]

// slice - extraction d'une partie du tableau
const nombres = [1, 2, 3, 4, 5];
console.log(nombres.slice(1, 4)); // [2, 3, 4]

// flat - aplatissement de tableaux imbriqués
const imbriqué = [1, [2, [3, 4]]];
console.log(imbriqué.flat()); // [1, 2, [3, 4]]
console.log(imbriqué.flat(2)); // [1, 2, 3, 4]

// flatMap - map suivi de flat(1)
const phrases = ["Hello world", "JavaScript is awesome"];
console.log(phrases.flatMap((phrase) => phrase.split(" "))); // ["Hello", "world", "JavaScript", "is", "awesome"]

// join - conversion en chaîne
console.log(nombres.join(", ")); // "1, 2, 3, 4, 5"

// Réplication
const copieNombres = [...nombres]; // Syntaxe spread
console.log(copieNombres); // [1, 2, 3, 4, 5]
```

### Méthodes de recherche

```javascript
const fruits = ["pomme", "banane", "orange", "mangue", "banane"];

// indexOf - trouve l'index de la première occurrence
console.log(fruits.indexOf("banane")); // 1

// lastIndexOf - trouve l'index de la dernière occurrence
console.log(fruits.lastIndexOf("banane")); // 4

// includes - vérifie si un élément existe
console.log(fruits.includes("orange")); // true

// find - trouve le premier élément satisfaisant une condition
console.log([5, 12, 8, 130, 44].find((num) => num > 10)); // 12

// findIndex - trouve l'index du premier élément satisfaisant une condition
console.log([5, 12, 8, 130, 44].findIndex((num) => num > 10)); // 1

// findLast, findLastIndex (ES2023)
console.log([5, 12, 8, 130, 44].findLast((num) => num > 10)); // 44
console.log([5, 12, 8, 130, 44].findLastIndex((num) => num > 10)); // 4
```

### Méthodes de tri et d'ordre

```javascript
// reverse - inverse l'ordre
const nombres = [1, 2, 3, 4, 5];
console.log(nombres.reverse()); // [5, 4, 3, 2, 1]

// sort - tri
const fruits = ["orange", "pomme", "banane"];
console.log(fruits.sort()); // ["banane", "orange", "pomme"]

// Tri numérique personnalisé
const scores = [40, 100, 1, 5, 25, 10];
console.log(scores.sort((a, b) => a - b)); // [1, 5, 10, 25, 40, 100]

// Vérification de tableau
console.log(Array.isArray(nombres)); // true
console.log(Array.isArray("abc")); // false

// Création de tableau rempli
console.log(Array(5).fill(0)); // [0, 0, 0, 0, 0]

// Création de tableau depuis une séquence
console.log(Array.from({ length: 5 }, (_, i) => i + 1)); // [1, 2, 3, 4, 5]
console.log(Array.from("hello")); // ["h", "e", "l", "l", "o"]
```

## Manipulation d'objets

Les objets sont les structures de données les plus fondamentales en JavaScript. Voici les méthodes essentielles pour les manipuler.

### Création et manipulation d'objets

```javascript
// Création d'objet littéral
const personne = {
  nom: "Dupont",
  prenom: "Jean",
  age: 30,
  saluer() {
    return `Bonjour, je m'appelle ${this.prenom} ${this.nom}`;
  },
};

// Accès aux propriétés
console.log(personne.nom); // "Dupont"
console.log(personne["age"]); // 30

// Modification de propriétés
personne.age = 31;
personne.email = "jean.dupont@example.com"; // Ajout d'une nouvelle propriété

// Suppression de propriétés
delete personne.email;

// Vérification d'existence de propriété
console.log("nom" in personne); // true
console.log(personne.hasOwnProperty("adresse")); // false

// Énumération des propriétés
for (const prop in personne) {
  console.log(`${prop}: ${personne[prop]}`);
}

// Utilisation d'une méthode d'objet
console.log(personne.saluer()); // "Bonjour, je m'appelle Jean Dupont"
```

### Méthodes Object

```javascript
const personne = {
  nom: "Dupont",
  prenom: "Jean",
  age: 30,
};

// Obtenir les clés
console.log(Object.keys(personne)); // ["nom", "prenom", "age"]

// Obtenir les valeurs
console.log(Object.values(personne)); // ["Dupont", "Jean", 30]

// Obtenir les paires clé-valeur
console.log(Object.entries(personne)); // [["nom", "Dupont"], ["prenom", "Jean"], ["age", 30]]

// Créer un objet à partir de paires clé-valeur
const entrées = [
  ["nom", "Martin"],
  ["prenom", "Sophie"],
  ["age", 25],
];
const nouvellePersonne = Object.fromEntries(entrées);
console.log(nouvellePersonne); // {nom: "Martin", prenom: "Sophie", age: 25}

// Fusion d'objets
const infosBase = { nom: "Dupont", prenom: "Jean" };
const infosContact = { email: "jean@example.com", telephone: "0123456789" };
const personneComplete = Object.assign({}, infosBase, infosContact);
console.log(personneComplete);
// { nom: "Dupont", prenom: "Jean", email: "jean@example.com", telephone: "0123456789" }

// Fusion avec l'opérateur spread (plus moderne)
const personneFusion = { ...infosBase, ...infosContact };
console.log(personneFusion);
// { nom: "Dupont", prenom: "Jean", email: "jean@example.com", telephone: "0123456789" }

// Cloner un objet
const clone = Object.assign({}, personne);
const cloneSpread = { ...personne };

// Geler un objet (immuable)
Object.freeze(personne); // Aucune modification autorisée
personne.age = 31; // Ignoré en mode strict, silencieux sinon
console.log(personne.age); // 30

// Sceller un objet
const objetScellé = { x: 1, y: 2 };
Object.seal(objetScellé); // Peut modifier, mais pas ajouter/supprimer
objetScellé.x = 10; // Autorisé
objetScellé.z = 3; // Ignoré en mode strict, silencieux sinon
delete objetScellé.y; // Ignoré en mode strict, silencieux sinon
```

### Classes utilitaires d'objets

```javascript
// Map - Collection de paires clé-valeur avec n'importe quel type de clé
const map = new Map();
map.set("clé1", "valeur1");
map.set(42, "valeur2");
map.set({ obj: "key" }, "valeur3");

console.log(map.get("clé1")); // "valeur1"
console.log(map.has(42)); // true
console.log(map.size); // 3
map.delete(42);
console.log(map.size); // 2

// Itération sur Map
for (const [clé, valeur] of map) {
  console.log(`${clé} => ${valeur}`);
}

// Set - Collection de valeurs uniques
const set = new Set([1, 2, 3, 3, 4, 4, 5]);
console.log(set.size); // 5 (pas de doublons)
set.add(6);
console.log(set.has(4)); // true
set.delete(2);

// Itération sur Set
for (const valeur of set) {
  console.log(valeur);
}

// WeakMap et WeakSet - Versions "faibles" qui permettent la collecte de déchets
// Utiles pour stocker des données associées à des objets sans empêcher leur suppression
const weakMap = new WeakMap();
let obj = {};
weakMap.set(obj, "données associées");
obj = null; // L'entrée dans weakMap sera automatiquement supprimée
```

## Fonctions mathématiques

JavaScript propose de nombreuses fonctions mathématiques via l'objet `Math`.

### Constantes mathématiques

```javascript
console.log(Math.PI); // 3.141592653589793
console.log(Math.E); // 2.718281828459045
console.log(Math.SQRT2); // 1.4142135623730951 (racine carrée de 2)
console.log(Math.LN2); // 0.6931471805599453 (logarithme naturel de 2)
console.log(Math.LN10); // 2.302585092994046 (logarithme naturel de 10)
```

### Fonctions arithmétiques

```javascript
// Minimum et maximum
console.log(Math.min(2, 5, 1, 8, 3)); // 1
console.log(Math.max(2, 5, 1, 8, 3)); // 8

// Valeur absolue
console.log(Math.abs(-5)); // 5

// Puissance
console.log(Math.pow(2, 3)); // 8 (2³)

// Racine carrée
console.log(Math.sqrt(16)); // 4

// Racine cubique
console.log(Math.cbrt(27)); // 3

// Logarithmes
console.log(Math.log(Math.E)); // 1
console.log(Math.log10(100)); // 2
console.log(Math.log2(8)); // 3

// Exponentielle
console.log(Math.exp(1)); // 2.718281828459045 (e¹)
```

### Fonctions trigonométriques

```javascript
// Sinus, cosinus, tangente (en radians)
console.log(Math.sin(Math.PI / 2)); // 1
console.log(Math.cos(Math.PI)); // -1
console.log(Math.tan(Math.PI / 4)); // 0.9999999999999999 (presque 1)

// Arc sinus, arc cosinus, arc tangente
console.log(Math.asin(1)); // 1.5707963267948966 (π/2)
console.log(Math.acos(0)); // 1.5707963267948966 (π/2)
console.log(Math.atan(1)); // 0.7853981633974483 (π/4)

// Conversion degrés <-> radians
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

console.log(toRadians(90)); // 1.5707963267948966 (π/2)
console.log(toDegrees(Math.PI)); // 180
```

### Fonctions d'arrondi

```javascript
// Arrondi à l'entier le plus proche
console.log(Math.round(4.3)); // 4
console.log(Math.round(4.7)); // 5

// Arrondi au supérieur
console.log(Math.ceil(4.3)); // 5
console.log(Math.ceil(4.7)); // 5

// Arrondi à l'inférieur
console.log(Math.floor(4.3)); // 4
console.log(Math.floor(4.7)); // 4

// Troncature (supprime la partie décimale)
console.log(Math.trunc(4.3)); // 4
console.log(Math.trunc(4.7)); // 4
console.log(Math.trunc(-4.7)); // -4 (diffère de floor qui donnerait -5)

// Arrondi à un nombre de décimales spécifiques
function toFixed(num, decimals) {
  return Number(num.toFixed(decimals));
}

console.log(toFixed(1.23456, 2)); // 1.23
```

### Autres fonctions mathématiques

```javascript
// Génération de nombres aléatoires
console.log(Math.random()); // Nombre aléatoire entre 0 (inclus) et 1 (exclu)

// Nombre aléatoire dans une plage
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

console.log(getRandomInt(1, 10)); // Entier aléatoire entre 1 et 10 (inclus)

// Signe d'un nombre
console.log(Math.sign(5)); // 1
console.log(Math.sign(-5)); // -1
console.log(Math.sign(0)); // 0

// Test si un nombre est entier
console.log(Number.isInteger(5)); // true
console.log(Number.isInteger(5.5)); // false

// Test si une valeur est un nombre fini
console.log(Number.isFinite(42)); // true
console.log(Number.isFinite(Infinity)); // false

// Test si une valeur est NaN (Not a Number)
console.log(Number.isNaN(NaN)); // true
console.log(Number.isNaN("abc" / 4)); // true
console.log(Number.isNaN("abc")); // false (String, mais pas NaN)
```

## Manipulation de dates

JavaScript fournit l'objet `Date` pour travailler avec les dates et les heures.

### Création de dates

```javascript
// Date actuelle
const maintenant = new Date();
console.log(maintenant);

// Date spécifique (année, mois (0-11), jour, heure, minute, seconde, milliseconde)
const date1 = new Date(2023, 0, 15, 10, 30, 0); // 15 janvier 2023 10:30:00
console.log(date1);

// Date à partir d'un timestamp (millisecondes depuis le 1er janvier 1970)
const date2 = new Date(1674038400000);
console.log(date2);

// Date à partir d'une chaîne
const date3 = new Date("2023-01-15T10:30:00Z");
console.log(date3);

// Timestamp actuel en millisecondes
console.log(Date.now()); // millisecondes depuis l'époque Unix

// Timestamp d'une date
console.log(date1.getTime());
```

### Accès aux composants de date

```javascript
const date = new Date(2023, 11, 25, 10, 30, 15);

// Accès aux composants de date
console.log(date.getFullYear()); // 2023
console.log(date.getMonth()); // 11 (décembre, car les mois commencent à 0)
console.log(date.getDate()); // 25
console.log(date.getDay()); // jour de la semaine (0-6, où 0 est dimanche)

// Accès aux composants d'heure
console.log(date.getHours()); // 10
console.log(date.getMinutes()); // 30
console.log(date.getSeconds()); // 15
console.log(date.getMilliseconds()); // 0

// Accès aux valeurs UTC
console.log(date.getUTCFullYear());
console.log(date.getUTCMonth());
console.log(date.getUTCDate());
// etc.
```

### Modification des dates

```javascript
const date = new Date(2023, 0, 15);

// Modification des composants de date
date.setFullYear(2024);
date.setMonth(1); // février
date.setDate(20);
console.log(date); // 20 février 2024

// Modification des composants d'heure
date.setHours(14);
date.setMinutes(45);
date.setSeconds(30);
console.log(date); // 20 février 2024 14:45:30

// Ajouter ou soustraire des jours
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

console.log(addDays(date, 10)); // 1er mars 2024 14:45:30
console.log(addDays(date, -5)); // 15 février 2024 14:45:30
```

### Formatage des dates

```javascript
const date = new Date(2023, 11, 25, 10, 30, 15);

// Formats de base
console.log(date.toString()); // format complet
console.log(date.toDateString()); // date seulement
console.log(date.toTimeString()); // heure seulement

// Formats localisés
console.log(date.toLocaleString()); // format localisé de la date et de l'heure
console.log(date.toLocaleDateString()); // date localisée
console.log(date.toLocaleTimeString()); // heure localisée

// Formats spécifiques à la locale
console.log(date.toLocaleString("fr-FR")); // format français
console.log(date.toLocaleString("en-US")); // format américain
console.log(date.toLocaleString("ja-JP")); // format japonais

// Formats personnalisés avec des options
console.log(
  date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
); // "lundi 25 décembre 2023"

// Format ISO
console.log(date.toISOString()); // "2023-12-25T09:30:15.000Z" (UTC)

// Timestamp
console.log(date.valueOf()); // millisecondes depuis l'époque Unix
```

## Conversion de types

JavaScript offre plusieurs méthodes pour convertir des valeurs entre différents types de données.

### Conversion en nombres

```javascript
// Conversion explicite en nombre
console.log(Number("42")); // 42
console.log(Number("3.14")); // 3.14
console.log(Number("123abc")); // NaN
console.log(Number(true)); // 1
console.log(Number(false)); // 0
console.log(Number(null)); // 0
console.log(Number(undefined)); // NaN

// Conversion en entier (base 10 par défaut)
console.log(parseInt("42")); // 42
console.log(parseInt("42.9")); // 42 (tronque la partie décimale)
console.log(parseInt("42px")); // 42 (ignore les caractères non numériques)
console.log(parseInt("abc")); // NaN

// Avec spécification de la base
console.log(parseInt("1010", 2)); // 10 (binaire)
console.log(parseInt("FF", 16)); // 255 (hexadécimal)

// Conversion en nombre à virgule flottante
console.log(parseFloat("3.14")); // 3.14
console.log(parseFloat("3.14abc")); // 3.14
console.log(parseFloat("abc")); // NaN

// Conversion implicite (non recommandée)
console.log("5" * 1); // 5
console.log(+"5"); // 5
```

### Conversion en chaînes

```javascript
// Conversion explicite en chaîne
console.log(String(42)); // "42"
console.log(String(3.14)); // "3.14"
console.log(String(true)); // "true"
console.log(String(false)); // "false"
console.log(String(null)); // "null"
console.log(String(undefined)); // "undefined"
console.log(String([1, 2, 3])); // "1,2,3"
console.log(String({ a: 1 })); // "[object Object]"

// Méthode toString()
console.log((42).toString()); // "42"
console.log((3.14).toString()); // "3.14"
console.log(true.toString()); // "true"
// null et undefined n'ont pas de méthode toString()

// Avec spécification de la base
console.log((10).toString(2)); // "1010" (binaire)
console.log((255).toString(16)); // "ff" (hexadécimal)

// Formatage numérique
const num = 3.14159;
console.log(num.toFixed(2)); // "3.14" (2 décimales)
console.log(num.toPrecision(4)); // "3.142" (4 chiffres significatifs)
console.log(num.toExponential(2)); // "3.14e+0" (notation exponentielle)

// Conversion implicite (non recommandée)
console.log(42 + ""); // "42"
```

### Conversion en booléens

```javascript
// Conversion explicite en booléen
console.log(Boolean(42)); // true
console.log(Boolean(0)); // false
console.log(Boolean("")); // false
console.log(Boolean("hello")); // true
console.log(Boolean(null)); // false
console.log(Boolean(undefined)); // false
console.log(Boolean(NaN)); // false
console.log(Boolean({})); // true
console.log(Boolean([])); // true

// Opérateur logique non (!) - double négation
console.log(!!"hello"); // true
console.log(!!0); // false

// Valeurs falsy (évaluées à false en contexte booléen)
// false, 0, -0, "", null, undefined, NaN

// Valeurs truthy (évaluées à true en contexte booléen)
// Tout le reste, y compris: true, nombres non nuls, chaînes non vides, objets, tableaux
```

### Vérification de types

```javascript
// Opérateur typeof
console.log(typeof 42); // "number"
console.log(typeof "hello"); // "string"
console.log(typeof true); // "boolean"
console.log(typeof undefined); // "undefined"
console.log(typeof null); // "object" (c'est un bug connu de JavaScript)
console.log(typeof {}); // "object"
console.log(typeof []); // "object"
console.log(typeof function () {}); // "function"
console.log(typeof Symbol()); // "symbol"
console.log(typeof 42n); // "bigint" (ES2020)

// Vérification de tableau
console.log(Array.isArray([])); // true
console.log(Array.isArray({})); // false

// Méthode instanceof
console.log([] instanceof Array); // true
console.log([] instanceof Object); // true (les tableaux sont aussi des objets)
console.log({} instanceof Object); // true

// Object.prototype.toString.call() - plus précis
console.log(Object.prototype.toString.call(42)); // "[object Number]"
console.log(Object.prototype.toString.call("hello")); // "[object String]"
console.log(Object.prototype.toString.call(true)); // "[object Boolean]"
console.log(Object.prototype.toString.call(undefined)); // "[object Undefined]"
console.log(Object.prototype.toString.call(null)); // "[object Null]"
console.log(Object.prototype.toString.call({})); // "[object Object]"
console.log(Object.prototype.toString.call([])); // "[object Array]"
```

## Fonctions de temporisation

JavaScript propose des fonctions pour exécuter du code après un délai ou à intervalles réguliers.

```javascript
// Exécution différée unique
setTimeout(() => {
  console.log("Ce message s'affiche après 2 secondes");
}, 2000);

// Stockage de l'identifiant pour pouvoir annuler l'exécution
const timeoutId = setTimeout(() => {
  console.log("Ce message ne s'affichera jamais");
}, 5000);

// Annulation de l'exécution différée
clearTimeout(timeoutId);

// Exécution répétée à intervalles réguliers
const intervalId = setInterval(() => {
  console.log("Ce message s'affiche toutes les secondes");
}, 1000);

// Arrêt de l'exécution répétée après 5 secondes
setTimeout(() => {
  clearInterval(intervalId);
  console.log("Intervalle arrêté après 5 secondes");
}, 5000);

// Version moderne - exécution au prochain tick (microtâche)
// Utile pour différer l'exécution sans bloquer le rendu
queueMicrotask(() => {
  console.log("Exécuté à la prochaine microtâche");
});

// requestAnimationFrame - pour les animations fluides
// S'exécute avant le prochain rafraîchissement de l'écran
function animer() {
  // Code d'animation
  console.log("Frame d'animation");

  // Continuer l'animation
  requestAnimationFrame(animer);
}

// Lancer l'animation
// requestAnimationFrame(animer);

// Pour arrêter
// cancelAnimationFrame(requestId);
```

## Fonctions de navigation et d'URL

Ces fonctions sont spécifiques à l'environnement du navigateur.

### Manipulation d'URL

```javascript
// Créer et manipuler des URL
const url = new URL("https://www.example.com/path?query=value#fragment");
console.log(url.hostname); // "www.example.com"
console.log(url.pathname); // "/path"
console.log(url.search); // "?query=value"
console.log(url.hash); // "#fragment"

// Manipulation des paramètres de requête
url.searchParams.set("newParam", "newValue");
url.searchParams.append("list", "item1");
url.searchParams.append("list", "item2");

console.log(url.searchParams.get("query")); // "value"
console.log(url.searchParams.getAll("list")); // ["item1", "item2"]
console.log(url.toString()); // URL complète avec les modifications

// Encodage/décodage URI
const uri = "https://example.com/path with spaces/file.html?name=John Doe";
console.log(encodeURI(uri)); // "https://example.com/path%20with%20spaces/file.html?name=John%20Doe"
console.log(decodeURI(encodeURI(uri))); // retour à l'original

// Encodage/décodage des composants d'URI
const param = "value & special=chars?";
console.log(encodeURIComponent(param)); // "value%20%26%20special%3Dchars%3F"
console.log(decodeURIComponent(encodeURIComponent(param))); // retour à l'original
```

### Navigation

```javascript
// Informations sur l'URL courante
console.log(window.location.href); // URL complète
console.log(window.location.protocol); // "http:" ou "https:"
console.log(window.location.host); // "example.com:8080" (hôte avec port)
console.log(window.location.hostname); // "example.com" (sans le port)
console.log(window.location.port); // "8080" ou "" si standard
console.log(window.location.pathname); // "/path/page.html"
console.log(window.location.search); // "?query=value"
console.log(window.location.hash); // "#section"

// Navigation
// window.location.href = "https://www.example.com"; // Navigation complète
// window.location.assign("https://www.example.com"); // Navigation complète
// window.location.replace("https://www.example.com"); // Navigation sans historique
// window.location.reload(); // Recharger la page

// Historique de navigation
console.log(window.history.length); // Nombre d'entrées dans l'historique
// window.history.back(); // Équivalent à cliquer sur le bouton "retour"
// window.history.forward(); // Équivalent à cliquer sur le bouton "avancer"
// window.history.go(-2); // Reculer de 2 pages

// API History moderne
// history.pushState({data: 'value'}, "Titre", "/nouveau-chemin"); // Ajoute une entrée sans recharger
// history.replaceState({data: 'value'}, "Titre", "/remplace-chemin"); // Remplace l'entrée actuelle
```

## Manipulation du DOM

Ces fonctions permettent d'interagir avec le Document Object Model (DOM) dans un navigateur.

### Sélection d'éléments

```javascript
// Sélection par ID
const element = document.getElementById("monId");

// Sélection par classe
const elements = document.getElementsByClassName("maClasse"); // HTMLCollection
const elementsArray = Array.from(elements); // Conversion en tableau

// Sélection par balise
const paragraphes = document.getElementsByTagName("p");

// Sélection avec sélecteurs CSS (moderne)
const premier = document.querySelector(".maClasse"); // Premier élément correspondant
const tous = document.querySelectorAll("p.important"); // NodeList de tous les éléments

// Sélection relative
const parent = element.parentElement;
const enfants = element.children;
const premierEnfant = element.firstElementChild;
const dernierEnfant = element.lastElementChild;
const suivant = element.nextElementSibling;
const precedent = element.previousElementSibling;

// Vérifier si un élément contient un autre
const contient = parent.contains(element);
```

### Modification du contenu

```javascript
// Modification du contenu texte
element.textContent = "Nouveau texte";

// Modification du HTML interne
element.innerHTML = "<strong>Texte en gras</strong>";

// Alternative plus sécurisée
element.textContent = ""; // Vider d'abord
const strong = document.createElement("strong");
strong.textContent = "Texte en gras";
element.appendChild(strong);

// Clonage d'élément
const clone = element.cloneNode(true); // true pour clone profond (avec descendants)

// Insertion de contenu HTML
element.insertAdjacentHTML("beforeend", "<p>Texte ajouté à la fin</p>");
// Positions: "beforebegin", "afterbegin", "beforeend", "afterend"
```

### Manipulation des attributs

```javascript
// Lecture d'attribut
const src = image.getAttribute("src");
const href = lien.href; // Pour les attributs standard, accès direct possible

// Définition d'attribut
element.setAttribute("data-id", "123");
bouton.disabled = true; // Pour les attributs standard, assignation directe possible

// Suppression d'attribut
element.removeAttribute("title");

// Vérification d'existence d'attribut
const hasAttr = element.hasAttribute("hidden");

// Attributs data-*
element.dataset.userId = "456"; // Définit data-user-id="456"
console.log(element.dataset.userId); // Lecture de data-user-id
```

### Gestion des classes CSS

```javascript
// Ajout/suppression de classes
element.classList.add("actif");
element.classList.remove("inactif");
element.classList.toggle("surbrillance"); // Ajoute si absente, retire si présente
element.classList.replace("ancienne", "nouvelle");

// Vérification de présence d'une classe
const hasClass = element.classList.contains("actif");

// Support pour plusieurs classes
element.classList.add("classe1", "classe2", "classe3");

// Alternative (déconseillée car remplace toutes les classes)
// element.className = "classe1 classe2 classe3";
```

### Manipulation de la structure du DOM

```javascript
// Création d'élément
const div = document.createElement("div");
const texte = document.createTextNode("Contenu texte");

// Ajout d'élément
parent.appendChild(div);

// Insertion à position spécifique
parent.insertBefore(div, referenceNode);

// Insertion avec les nouvelles API
parent.append(div, texte); // Ajoute à la fin, accepte plusieurs nœuds
parent.prepend(div); // Ajoute au début
referenceNode.before(div); // Insère avant un nœud
referenceNode.after(div); // Insère après un nœud
referenceNode.replaceWith(div); // Remplace un nœud

// Suppression d'élément
parent.removeChild(child);
child.remove(); // Méthode moderne

// Remplacement d'élément
parent.replaceChild(newChild, oldChild);
```

## Stockage local

JavaScript offre plusieurs méthodes pour stocker des données côté client.

```javascript
// localStorage - Persistent entre les sessions
localStorage.setItem("préférence", "mode sombre");
const préférence = localStorage.getItem("préférence");
localStorage.removeItem("préférence");
localStorage.clear(); // Efface tout

// sessionStorage - Persiste uniquement pendant la session
sessionStorage.setItem("tempData", "valeur temporaire");
const tempData = sessionStorage.getItem("tempData");
sessionStorage.removeItem("tempData");
sessionStorage.clear();

// Stockage d'objets (conversion JSON nécessaire)
const utilisateur = { id: 1, nom: "Alice" };
localStorage.setItem("utilisateur", JSON.stringify(utilisateur));
const utilisateurChargé = JSON.parse(localStorage.getItem("utilisateur"));

// Cookies
document.cookie = "nom=valeur; expires=Thu, 18 Dec 2023 12:00:00 UTC; path=/";

// Lecture des cookies (nécessite du traitement)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// IndexedDB - Pour le stockage structuré à grande échelle
// (API plus complexe, nécessite plus de code)
```

## Fonctions JSON

JavaScript propose des méthodes pour convertir entre objets JavaScript et format JSON.

```javascript
// Conversion d'objet en chaîne JSON
const objet = {
  nom: "JavaScript",
  année: 1995,
  fonctionnalités: ["fonctions", "objets", "prototypes"],
  avancé: true,
  version: { majeure: 1, mineure: 0 },
};

const jsonString = JSON.stringify(objet);
console.log(jsonString);
// {"nom":"JavaScript","année":1995,"fonctionnalités":["fonctions","objets","prototypes"],"avancé":true,"version":{"majeure":1,"mineure":0}}

// Avec formatage pour lisibilité
console.log(JSON.stringify(objet, null, 2));
// {
//   "nom": "JavaScript",
//   "année": 1995,
//   "fonctionnalités": [
//     "fonctions",
//     "objets",
//     "prototypes"
//   ],
//   "avancé": true,
//   "version": {
//     "majeure": 1,
//     "mineure": 0
//   }
// }

// Avec fonction de remplacement
const jsonFiltered = JSON.stringify(objet, (key, value) => {
  if (key === "année") return 2023; // Remplace la valeur de l'année
  if (typeof value === "string") return value.toUpperCase(); // Met en majuscule les chaînes
  return value; // Retourne les autres valeurs telles quelles
});
console.log(jsonFiltered);

// Conversion de chaîne JSON en objet
const jsonData = '{"nom":"JavaScript","année":1995,"actif":true}';
const parsedObject = JSON.parse(jsonData);
console.log(parsedObject.nom); // "JavaScript"
console.log(parsedObject.année); // 1995

// Avec fonction de revivification
const dateJson = '{"nom":"JavaScript","création":"1995-12-04T00:00:00.000Z"}';
const objectWithDate = JSON.parse(dateJson, (key, value) => {
  if (key === "création") return new Date(value);
  return value;
});
console.log(objectWithDate.création instanceof Date); // true
```

## Bonnes pratiques

Pour utiliser efficacement les fonctions JavaScript :

1. **Préférez les méthodes modernes** : Privilégiez les méthodes récentes comme `Array.from()` plutôt que les anciennes approches.

2. **Attention aux conversions implicites** : Utilisez les méthodes explicites comme `Number()`, `String()` et `Boolean()` plutôt que les conversions implicites.

3. **Évitez la modification directe** : Pour les tableaux et objets, préférez les approches qui créent de nouvelles copies plutôt que de modifier les originaux.

4. **Utilisation de chaînes de méthodes** : Combinez les méthodes pour des opérations complexes en une seule expression.

   ```javascript
   // Au lieu de:
   const nombres = [1, 2, 3, 4, 5];
   const doubles = nombres.map((n) => n * 2);
   const doublePairs = doubles.filter((n) => n % 2 === 0);
   const somme = doublePairs.reduce((acc, n) => acc + n, 0);

   // Utilisez:
   const resultat = [1, 2, 3, 4, 5]
     .map((n) => n * 2)
     .filter((n) => n % 2 === 0)
     .reduce((acc, n) => acc + n, 0);
   ```

5. **Utilisez des méthodes dédiées** : Lorsqu'elles existent, utilisez les méthodes dédiées plutôt que d'écrire votre propre logique.

6. **Évitez les boucles traditionnelles** : Préférez les méthodes de tableau comme `forEach`, `map`, `filter`, etc. aux boucles `for` et `while` quand c'est possible.

7. **Validez les entrées** : Vérifiez toujours les entrées avant d'appliquer des fonctions pour éviter les erreurs.

## Ressources supplémentaires

- [Documentation MDN sur JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript)
- [Documentation sur les méthodes de chaînes](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String)
- [Documentation sur les méthodes de tableaux](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [Documentation sur l'objet Math](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Math)
- [Documentation sur l'objet Date](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [Documentation sur les API Web](https://developer.mozilla.org/fr/docs/Web/API)

---

Ce README a été créé pour fournir une vue d'ensemble complète des fonctions usuelles en JavaScript. N'hésitez pas à contribuer ou à suggérer des améliorations !
