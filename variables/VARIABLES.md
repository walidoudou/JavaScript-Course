# Les Variables en JavaScript

## Table des matières

- [Introduction](#introduction)
- [Déclaration de variables](#déclaration-de-variables)
  - [var](#var)
  - [let](#let)
  - [const](#const)
  - [Comparaison des déclarations](#comparaison-des-déclarations)
- [Portée des variables](#portée-des-variables)
  - [Portée globale](#portée-globale)
  - [Portée de fonction](#portée-de-fonction)
  - [Portée de bloc](#portée-de-bloc)
- [Types de données](#types-de-données)
  - [Types primitifs](#types-primitifs)
  - [Types objets](#types-objets)
- [Conversion de types](#conversion-de-types)
- [Nommage des variables](#nommage-des-variables)
- [Bonnes pratiques](#bonnes-pratiques)
- [Exemples avancés](#exemples-avancés)
- [Ressources supplémentaires](#ressources-supplémentaires)

## Introduction

Les variables sont des conteneurs pour stocker des données. En JavaScript, une variable peut contenir n'importe quel type de données, des nombres simples aux structures de données complexes. La création et l'utilisation correctes des variables sont essentielles pour tout développeur JavaScript.

Ce guide vous présente tout ce que vous devez savoir sur les variables en JavaScript, des concepts de base aux meilleures pratiques.

## Déclaration de variables

JavaScript propose trois façons de déclarer des variables : `var`, `let` et `const`. Chacune a ses propres caractéristiques et cas d'utilisation.

### var

La déclaration `var` est la manière traditionnelle de déclarer des variables en JavaScript.

```javascript
var age = 25;
var nom = "Marie";
var estActif = true;
var utilisateur = { nom: "Jean", age: 30 };
```

Caractéristiques principales de `var` :

- Portée de fonction ou globale (pas de portée de bloc)
- Peut être redéclarée et mise à jour
- Sujet au hoisting (remontée des déclarations)

### let

Introduit dans ES6 (ES2015), `let` offre une meilleure façon de déclarer des variables dont la valeur changera.

```javascript
let compteur = 0;
compteur = compteur + 1;

let temperature = 22.5;
temperature = 23.0;
```

Caractéristiques principales de `let` :

- Portée de bloc
- Peut être mise à jour mais pas redéclarée dans le même bloc
- N'est pas initialisée lors du hoisting

### const

`const` est utilisé pour déclarer des variables dont la valeur ne doit pas changer après initialisation.

```javascript
const PI = 3.14159;
const TAUX_TVA = 0.2;
const CONFIG = {
  url: "https://api.exemple.com",
  timeout: 5000,
};

// Valide - modification d'une propriété d'un objet constant
CONFIG.timeout = 6000;

// Invalide - réassignation d'une constante
// CONFIG = { url: "https://autre-api.exemple.com" }; // Erreur !
```

Caractéristiques principales de `const` :

- Portée de bloc
- Ne peut pas être mise à jour ou redéclarée
- Pour les objets et tableaux, les propriétés peuvent être modifiées

### Comparaison des déclarations

| Caractéristique     | var                      | let                           | const                       |
| ------------------- | ------------------------ | ----------------------------- | --------------------------- |
| Portée              | Fonction/Globale         | Bloc                          | Bloc                        |
| Redéclaration       | ✅                       | ❌                            | ❌                          |
| Réassignation       | ✅                       | ✅                            | ❌                          |
| Hoisting            | ✅ (avec undefined)      | ✅ (sans initialisation)      | ✅ (sans initialisation)    |
| Déclaration requise | ❌                       | ✅                            | ✅                          |
| Quand l'utiliser    | Rarement en code moderne | Pour les valeurs qui changent | Pour les valeurs constantes |

## Portée des variables

La portée (scope) détermine où les variables sont accessibles dans votre code.

### Portée globale

Les variables déclarées en dehors de toute fonction ou bloc sont des variables globales.

```javascript
// Variable globale
var messageBienvenue = "Bonjour le monde";

function afficherMessage() {
  console.log(messageBienvenue); // Accessible ici
}

afficherMessage(); // "Bonjour le monde"
console.log(messageBienvenue); // "Bonjour le monde"
```

### Portée de fonction

Les variables déclarées dans une fonction ne sont accessibles qu'à l'intérieur de cette fonction.

```javascript
function calculerSomme() {
  var a = 5;
  var b = 10;
  var resultat = a + b;

  console.log(resultat); // 15
}

calculerSomme();
// console.log(resultat); // Erreur : resultat n'est pas défini
```

### Portée de bloc

Les variables déclarées avec `let` et `const` ont une portée de bloc (entre accolades `{}`).

```javascript
if (true) {
  let x = 10;
  const y = 20;
  var z = 30;

  console.log(x); // 10
  console.log(y); // 20
  console.log(z); // 30
}

// console.log(x); // Erreur : x n'est pas défini
// console.log(y); // Erreur : y n'est pas défini
console.log(z); // 30 (var n'a pas de portée de bloc)
```

## Types de données

Les variables JavaScript peuvent contenir différents types de données.

### Types primitifs

```javascript
// Nombre
let age = 25;
let prix = 19.99;

// Chaîne de caractères
let prenom = "Sophie";
let message = "Bienvenue !";
let template = `${prenom} a ${age} ans`; // Template literals (ES6)

// Booléen
let estValide = true;
let estTermine = false;

// Undefined
let valeurNonDefinie;
console.log(valeurNonDefinie); // undefined

// Null
let donneeVide = null;

// Symbol (ES6)
let identifiantUnique = Symbol("id");

// BigInt (ES2020)
let nombreTresGrand = 9007199254740991n;
```

### Types objets

```javascript
// Objet
let personne = {
  nom: "Dupont",
  prenom: "Jean",
  age: 30,
  adresse: {
    rue: "123 Avenue Exemple",
    ville: "Paris",
  },
};

// Tableau
let couleurs = ["rouge", "vert", "bleu"];
let mixte = [1, "deux", true, { id: 4 }];

// Function
let saluer = function (nom) {
  return `Bonjour ${nom}!`;
};

// Date
let maintenant = new Date();

// RegExp
let pattern = /^[a-z]+$/i;

// Map et Set (ES6)
let mapUtilisateurs = new Map();
let ensembleUnique = new Set([1, 2, 3, 3]); // {1, 2, 3}
```

## Conversion de types

JavaScript permet de convertir dynamiquement entre différents types de données.

```javascript
// Conversion en nombre
let chaine = "42";
let nombre = Number(chaine); // 42
let nombreFloat = parseFloat("42.5"); // 42.5
let nombreInt = parseInt("42.5"); // 42

// Conversion en chaîne
let valeur = 42;
let chaineValeur = String(valeur); // "42"
let autreMethode = valeur.toString(); // "42"

// Conversion en booléen
let booleen = Boolean(1); // true
let booleenFalse = Boolean(0); // false
let booleenChaine = Boolean(""); // false
let booleenChaineNonVide = Boolean("texte"); // true

// Conversions implicites
let somme = "5" + 3; // "53" (concaténation de chaînes)
let difference = "5" - 3; // 2 (conversion implicite en nombre)
```

## Nommage des variables

Un bon nommage rend votre code plus lisible et maintenable.

### Conventions et bonnes pratiques

```javascript
// camelCase pour les variables et fonctions (recommandé)
let nombreUtilisateurs = 42;
function calculerTotal() {}

// PascalCase pour les classes et constructeurs
class UtilisateurService {}
function Personne(nom, age) {}

// UPPER_SNAKE_CASE pour les constantes
const MAX_TENTATIVES = 3;
const URL_API = "https://api.exemple.com";

// Noms descriptifs
let nbArticlesPanier = 5; // Préférable à 'n' ou 'count'
let estAuthentifie = true; // Préférable à 'flag' ou 'b'

// Préfixes communs
let estValide = true; // Booléen (est_, a_, peut_)
let aPermission = false;
let onClickHandler = function () {}; // Gestionnaires d'événements (on_)
```

## Bonnes pratiques

Voici quelques bonnes pratiques à suivre pour l'utilisation des variables en JavaScript :

1. **Préférez `const` par défaut** et utilisez `let` uniquement quand la réassignation est nécessaire.

   ```javascript
   // Approche recommandée
   const API_URL = "https://api.exemple.com";
   const utilisateur = fetchUtilisateur();

   // Pour les valeurs qui changent
   let compteur = 0;
   compteur += 1;
   ```

2. **Évitez les variables globales** pour réduire les risques de conflits et d'effets secondaires.

   ```javascript
   // À éviter
   var score = 0;

   // Préférable
   function jeu() {
     let score = 0;
     // ...
   }
   ```

3. **Déclarez les variables au début de leur portée** pour une meilleure lisibilité.

   ```javascript
   function processData() {
     // Déclarations au début
     const MAX_ITEMS = 100;
     let results = [];
     let processedCount = 0;

     // Logique ensuite
     // ...
   }
   ```

4. **Une variable, une responsabilité** - chaque variable doit avoir un rôle clair.

   ```javascript
   // À éviter
   let data = "John,Doe,42";

   // Préférable
   let utilisateurCsv = "John,Doe,42";
   let utilisateur = {
     prenom: "John",
     nom: "Doe",
     age: 42,
   };
   ```

5. **Initialisez vos variables** lors de la déclaration quand c'est possible.

   ```javascript
   // Moins bien
   let utilisateur;
   utilisateur = getUtilisateur();

   // Mieux
   let utilisateur = getUtilisateur();
   ```

## Exemples avancés

### Destructuration (ES6)

La destructuration permet d'extraire des données de tableaux ou d'objets de manière concise.

```javascript
// Destructuration d'objet
const personne = { nom: "Durand", prenom: "Marie", age: 28 };
const { nom, prenom, age } = personne;

console.log(nom); // "Durand"
console.log(prenom); // "Marie"
console.log(age); // 28

// Avec renommage
const { nom: nomFamille, prenom: prenomUtilisateur } = personne;
console.log(nomFamille); // "Durand"
console.log(prenomUtilisateur); // "Marie"

// Destructuration de tableau
const couleurs = ["rouge", "vert", "bleu"];
const [primaire, secondaire, tertiaire] = couleurs;

console.log(primaire); // "rouge"
console.log(secondaire); // "vert"

// Ignorer des éléments
const [premier, , troisieme] = couleurs;
console.log(troisieme); // "bleu"

// Valeurs par défaut
const [a, b, c, d = "jaune"] = couleurs;
console.log(d); // "jaune"
```

### Closures et variables

Les closures permettent à une fonction d'accéder aux variables de sa fonction parente même après que celle-ci ait terminé son exécution.

```javascript
function createCounter() {
  // Variable privée
  let count = 0;

  // Retourne un objet avec des méthodes
  return {
    increment: function () {
      count += 1;
      return count;
    },
    decrement: function () {
      count -= 1;
      return count;
    },
    getValue: function () {
      return count;
    },
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
console.log(counter.getValue()); // 1
```

### Variables temporelles (let dans les boucles)

L'utilisation de `let` dans les boucles crée une nouvelle liaison pour chaque itération.

```javascript
// Problème avec var dans les boucles
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i); // Affiche 3, 3, 3
  }, 100);
}

// Solution avec let
for (let j = 0; j < 3; j++) {
  setTimeout(function () {
    console.log(j); // Affiche 0, 1, 2
  }, 100);
}
```

### Paramètres par défaut (ES6)

```javascript
function saluer(nom = "visiteur", message = `Bonjour`) {
  return `${message}, ${nom}!`;
}

console.log(saluer()); // "Bonjour, visiteur!"
console.log(saluer("Marie")); // "Bonjour, Marie!"
console.log(saluer("Pierre", "Salut")); // "Salut, Pierre!"
```

## Ressources supplémentaires

- [Documentation MDN sur les variables](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Grammar_and_types#D%C3%A9clarations)
- [Guide JavaScript ES6](https://developer.mozilla.org/fr/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla)
- [JavaScript.info - Variables](https://fr.javascript.info/variables)

---

Ce README a été créé pour fournir une vue d'ensemble complète des variables en JavaScript. N'hésitez pas à contribuer ou à suggérer des améliorations !
