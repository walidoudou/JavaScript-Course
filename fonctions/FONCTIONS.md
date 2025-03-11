# Les Fonctions en JavaScript

## Table des matières

- [Introduction](#introduction)
- [Déclaration de fonctions](#déclaration-de-fonctions)
  - [Déclaration de fonction](#déclaration-de-fonction)
  - [Expression de fonction](#expression-de-fonction)
  - [Fonctions fléchées](#fonctions-fléchées)
  - [Méthodes d'objet](#méthodes-dobjet)
  - [Constructeurs de fonction](#constructeurs-de-fonction)
- [Paramètres et arguments](#paramètres-et-arguments)
  - [Paramètres par défaut](#paramètres-par-défaut)
  - [Paramètres du reste](#paramètres-du-reste)
  - [Déstructuration des paramètres](#déstructuration-des-paramètres)
- [Retour de valeurs](#retour-de-valeurs)
  - [Instruction return](#instruction-return)
  - [Retours implicites](#retours-implicites)
  - [Retour de multiples valeurs](#retour-de-multiples-valeurs)
- [Portée et closures](#portée-et-closures)
  - [Portée lexicale](#portée-lexicale)
  - [Closures](#closures)
  - [Variables locales vs globales](#variables-locales-vs-globales)
- [Fonctions avancées](#fonctions-avancées)
  - [Fonctions d'ordre supérieur](#fonctions-dordre-supérieur)
  - [Fonctions pures](#fonctions-pures)
  - [Fonctions récursives](#fonctions-récursives)
  - [Fonctions immédiatement invoquées (IIFE)](#fonctions-immédiatement-invoquées-iife)
  - [Fonctions génératrices](#fonctions-génératrices)
  - [Fonctions asynchrones](#fonctions-asynchrones)
- [Contexte d'exécution et this](#contexte-dexécution-et-this)
  - [La valeur de this](#la-valeur-de-this)
  - [Méthodes bind, call, et apply](#méthodes-bind-call-et-apply)
  - [Fonctions fléchées et this](#fonctions-fléchées-et-this)
- [Bonnes pratiques](#bonnes-pratiques)
- [Pièges et erreurs courantes](#pièges-et-erreurs-courantes)
- [Ressources supplémentaires](#ressources-supplémentaires)

## Introduction

Les fonctions sont l'un des éléments fondamentaux de JavaScript. Elles permettent d'encapsuler des blocs de code réutilisables, de structurer les applications et d'implémenter des comportements complexes. En JavaScript, les fonctions sont des objets de première classe, ce qui signifie qu'elles peuvent être assignées à des variables, passées comme arguments à d'autres fonctions, retournées par d'autres fonctions et possèdent des propriétés et des méthodes.

Ce guide offre une présentation complète des fonctions en JavaScript, de leur syntaxe de base aux concepts avancés et bonnes pratiques.

## Déclaration de fonctions

JavaScript propose plusieurs façons de déclarer des fonctions, chacune avec ses spécificités et cas d'utilisation.

### Déclaration de fonction

La déclaration de fonction définit une fonction nommée avec le mot-clé `function`.

```javascript
function saluer(nom) {
  return `Bonjour, ${nom} !`;
}

console.log(saluer("Marie")); // "Bonjour, Marie !"
```

Caractéristiques principales :

- La fonction est hoistée (peut être appelée avant sa déclaration dans le code)
- Possède un nom qui apparaît dans la stack trace (utile pour le débogage)
- Peut être récursive (s'appeler elle-même)

### Expression de fonction

Une expression de fonction assigne une fonction (souvent anonyme) à une variable ou une constante.

```javascript
const saluer = function (nom) {
  return `Bonjour, ${nom} !`;
};

console.log(saluer("Pierre")); // "Bonjour, Pierre !"
```

On peut également nommer une expression de fonction :

```javascript
const factorielle = function calculerFactorielle(n) {
  if (n <= 1) return 1;
  return n * calculerFactorielle(n - 1);
};

console.log(factorielle(5)); // 120
```

Caractéristiques principales :

- N'est pas hoistée (doit être définie avant d'être utilisée)
- Si nommée, le nom n'est accessible qu'à l'intérieur de la fonction
- Utile pour les affectations conditionnelles ou comme valeurs passées à d'autres fonctions

### Fonctions fléchées

Introduites dans ES6 (ES2015), les fonctions fléchées offrent une syntaxe plus concise.

```javascript
// Fonction fléchée avec bloc de code
const saluer = (nom) => {
  return `Bonjour, ${nom} !`;
};

// Fonction fléchée avec retour implicite (forme concise)
const addition = (a, b) => a + b;

console.log(saluer("Sophie")); // "Bonjour, Sophie !"
console.log(addition(2, 3)); // 5
```

Caractéristiques principales :

- Syntaxe plus concise
- Pas de liaison propre pour `this` (hérite du contexte parent)
- Ne peut pas être utilisée comme constructeur (pas de `new`)
- Pas d'objet `arguments`
- Ne peut pas changer la valeur de `this` avec `call()`, `apply()`, ou `bind()`

### Méthodes d'objet

Les fonctions peuvent être définies comme méthodes d'un objet.

```javascript
const utilisateur = {
  nom: "Alice",
  age: 30,
  // Méthode standard
  saluer: function () {
    return `Bonjour, je m'appelle ${this.nom}`;
  },
  // Syntaxe concise pour les méthodes (ES6)
  sePresenter() {
    return `Je m'appelle ${this.nom} et j'ai ${this.age} ans`;
  },
};

console.log(utilisateur.saluer()); // "Bonjour, je m'appelle Alice"
console.log(utilisateur.sePresenter()); // "Je m'appelle Alice et j'ai 30 ans"
```

### Constructeurs de fonction

Les fonctions peuvent servir de constructeurs pour créer des objets.

```javascript
function Personne(nom, age) {
  this.nom = nom;
  this.age = age;
  this.saluer = function () {
    return `Bonjour, je m'appelle ${this.nom}`;
  };
}

const alice = new Personne("Alice", 30);
console.log(alice.saluer()); // "Bonjour, je m'appelle Alice"
```

Avec ES6, les classes sont généralement préférées aux constructeurs de fonction :

```javascript
class Personne {
  constructor(nom, age) {
    this.nom = nom;
    this.age = age;
  }

  saluer() {
    return `Bonjour, je m'appelle ${this.nom}`;
  }
}

const bob = new Personne("Bob", 25);
console.log(bob.saluer()); // "Bonjour, je m'appelle Bob"
```

## Paramètres et arguments

Les paramètres sont les noms listés dans la définition de la fonction, tandis que les arguments sont les valeurs réelles passées à la fonction.

```javascript
function afficherInfos(nom, age, profession) {
  console.log(`Nom: ${nom}, Âge: ${age}, Profession: ${profession}`);
}

afficherInfos("Marie", 28, "Ingénieure"); // Nom: Marie, Âge: 28, Profession: Ingénieure
```

### Paramètres par défaut

ES6 permet de définir des valeurs par défaut pour les paramètres.

```javascript
function saluer(nom = "Invité", message = "Bienvenue") {
  return `${message}, ${nom} !`;
}

console.log(saluer()); // "Bienvenue, Invité !"
console.log(saluer("Marie")); // "Bienvenue, Marie !"
console.log(saluer("Pierre", "Salut")); // "Salut, Pierre !"
```

Les paramètres par défaut sont évalués au moment de l'appel, et peuvent utiliser des expressions :

```javascript
function creerIdentifiant(prefix = "user", id = Date.now()) {
  return `${prefix}-${id}`;
}

console.log(creerIdentifiant()); // "user-1677395271432"
```

### Paramètres du reste

Les paramètres du reste permettent de représenter un nombre indéfini d'arguments comme un tableau.

```javascript
function somme(...nombres) {
  return nombres.reduce((total, nombre) => total + nombre, 0);
}

console.log(somme(1, 2)); // 3
console.log(somme(1, 2, 3, 4, 5)); // 15
```

Combinaison avec des paramètres réguliers :

```javascript
function formatMessage(auteur, timestamp, ...messages) {
  const date = new Date(timestamp).toLocaleString();
  return `[${date}] ${auteur}: ${messages.join(" ")}`;
}

console.log(
  formatMessage("Alice", 1677395271432, "Bonjour", "tout", "le", "monde")
);
// "[20/12/2023, 15:47:51] Alice: Bonjour tout le monde"
```

### Déstructuration des paramètres

La déstructuration permet d'extraire des données de tableaux ou d'objets directement dans les paramètres de fonction.

```javascript
// Déstructuration d'objet
function afficherUtilisateur({ nom, age, profession = "Non spécifiée" }) {
  console.log(`Nom: ${nom}, Âge: ${age}, Profession: ${profession}`);
}

const utilisateur = {
  nom: "Alice",
  age: 30,
  email: "alice@example.com",
};

afficherUtilisateur(utilisateur); // "Nom: Alice, Âge: 30, Profession: Non spécifiée"

// Déstructuration de tableau
function afficherCoordonnées([x, y, z = 0]) {
  console.log(`X: ${x}, Y: ${y}, Z: ${z}`);
}

afficherCoordonnées([10, 20]); // "X: 10, Y: 20, Z: 0"
afficherCoordonnées([5, 15, 25]); // "X: 5, Y: 15, Z: 25"
```

## Retour de valeurs

Les fonctions JavaScript peuvent retourner des valeurs à l'aide de l'instruction `return`.

### Instruction return

L'instruction `return` spécifie la valeur à retourner et termine immédiatement l'exécution de la fonction.

```javascript
function multiplier(a, b) {
  return a * b;
}

const resultat = multiplier(4, 5);
console.log(resultat); // 20
```

Une fonction sans instruction `return` explicite ou avec `return;` sans valeur retourne `undefined` :

```javascript
function logMessage(message) {
  console.log(message);
  // Pas de return explicite
}

const resultat = logMessage("Test");
console.log(resultat); // undefined
```

### Retours implicites

Les fonctions fléchées sans accolades ont un retour implicite :

```javascript
// Avec retour implicite
const carre = (x) => x * x;

// Équivalent avec retour explicite
const carreExplicite = (x) => {
  return x * x;
};

console.log(carre(4)); // 16
console.log(carreExplicite(4)); // 16
```

Pour retourner un objet littéral implicitement, il faut l'entourer de parenthèses :

```javascript
const creerPersonne = (nom, age) => ({ nom, age });

console.log(creerPersonne("Alice", 30)); // { nom: 'Alice', age: 30 }
```

### Retour de multiples valeurs

JavaScript ne permet pas directement de retourner plusieurs valeurs, mais on peut utiliser des tableaux, des objets ou la déstructuration :

```javascript
// Retour d'un tableau
function calculerStatistiques(nombres) {
  const somme = nombres.reduce((total, n) => total + n, 0);
  const moyenne = somme / nombres.length;
  const min = Math.min(...nombres);
  const max = Math.max(...nombres);

  return [somme, moyenne, min, max];
}

const [somme, moyenne, min, max] = calculerStatistiques([1, 2, 3, 4, 5]);
console.log(`Somme: ${somme}, Moyenne: ${moyenne}, Min: ${min}, Max: ${max}`);
// "Somme: 15, Moyenne: 3, Min: 1, Max: 5"

// Retour d'un objet
function calculerStatistiquesObj(nombres) {
  const somme = nombres.reduce((total, n) => total + n, 0);
  const moyenne = somme / nombres.length;
  const min = Math.min(...nombres);
  const max = Math.max(...nombres);

  return { somme, moyenne, min, max };
}

const stats = calculerStatistiquesObj([1, 2, 3, 4, 5]);
console.log(`Somme: ${stats.somme}, Moyenne: ${stats.moyenne}`);
// "Somme: 15, Moyenne: 3"
```

## Portée et closures

La portée (scope) en JavaScript détermine l'accessibilité des variables et des fonctions dans différentes parties du code.

### Portée lexicale

JavaScript utilise la portée lexicale, ce qui signifie que la portée d'une variable est déterminée par son emplacement dans le code source.

```javascript
function externe() {
  const message = "Hello";

  function interne() {
    const reponse = "World";
    console.log(message); // Accessible (portée parente)
    console.log(reponse); // Accessible (portée locale)
  }

  interne();
  // console.log(reponse); // Erreur : reponse n'est pas définie ici
}

externe();
```

### Closures

Une closure est une fonction qui se "souvient" de son environnement lexical même lorsqu'elle est exécutée en dehors de sa portée d'origine.

```javascript
function creerCompteur() {
  let compteur = 0;

  return function () {
    compteur += 1;
    return compteur;
  };
}

const incrementer = creerCompteur();
console.log(incrementer()); // 1
console.log(incrementer()); // 2
console.log(incrementer()); // 3
```

Utilisations courantes des closures :

- Encapsulation de données
- Création de fonctions d'usine
- Gestion d'état privé
- Mémorisation (caching)

```javascript
// Fonction de mémorisation
function memoriser(fn) {
  const cache = {};

  return function (...args) {
    const key = JSON.stringify(args);

    if (key in cache) {
      console.log(`Utilisation du résultat en cache pour ${key}`);
      return cache[key];
    }

    const resultat = fn(...args);
    cache[key] = resultat;
    return resultat;
  };
}

// Fonction coûteuse à calculer
function calculerFactorielle(n) {
  console.log(`Calcul de factorielle(${n})`);
  if (n <= 1) return 1;
  return n * calculerFactorielle(n - 1);
}

const factorielleMemorisee = memoriser(calculerFactorielle);

console.log(factorielleMemorisee(5)); // Calcule et met en cache
console.log(factorielleMemorisee(5)); // Utilise le cache
console.log(factorielleMemorisee(6)); // Calcule uniquement 6 * factorielle(5)
```

### Variables locales vs globales

```javascript
// Variable globale
const globale = "Je suis globale";

function testPortee() {
  // Variable locale
  const locale = "Je suis locale";

  console.log(globale); // Accessible
  console.log(locale); // Accessible
}

testPortee();
console.log(globale); // Accessible
// console.log(locale); // Erreur : locale n'est pas définie
```

Bonnes pratiques :

- Limiter l'utilisation des variables globales
- Préférer les fonctions pures qui utilisent des arguments plutôt que des variables externes
- Utiliser des modules pour isoler le code

## Fonctions avancées

### Fonctions d'ordre supérieur

Une fonction d'ordre supérieur est une fonction qui prend une ou plusieurs fonctions comme arguments ou retourne une fonction.

```javascript
// Fonction prenant une fonction comme argument
function appliquerOperation(x, y, operation) {
  return operation(x, y);
}

const addition = (a, b) => a + b;
const multiplication = (a, b) => a * b;

console.log(appliquerOperation(5, 3, addition)); // 8
console.log(appliquerOperation(5, 3, multiplication)); // 15

// Fonction retournant une fonction
function creerMultiplicateur(facteur) {
  return function (nombre) {
    return nombre * facteur;
  };
}

const doubler = creerMultiplicateur(2);
const tripler = creerMultiplicateur(3);

console.log(doubler(5)); // 10
console.log(tripler(5)); // 15
```

Exemples courants de fonctions d'ordre supérieur en JavaScript :

- `map`, `filter`, `reduce` sur les tableaux
- `setTimeout`, `setInterval`
- Les middlewares dans les frameworks web

### Fonctions pures

Une fonction pure :

1. Produit toujours le même résultat pour les mêmes arguments
2. Ne produit pas d'effets secondaires (pas de modification d'état externe)

```javascript
// Fonction pure
function additionner(a, b) {
  return a + b;
}

// Fonction impure (dépend d'un état externe)
let total = 0;
function ajouterAuTotal(valeur) {
  total += valeur;
  return total;
}
```

Avantages des fonctions pures :

- Prévisibilité et fiabilité
- Testabilité simplifiée
- Parallélisation possible
- Mémorisation efficace

### Fonctions récursives

Une fonction récursive est une fonction qui s'appelle elle-même.

```javascript
function factorielle(n) {
  // Cas de base
  if (n <= 1) return 1;

  // Appel récursif
  return n * factorielle(n - 1);
}

console.log(factorielle(5)); // 120 (5 * 4 * 3 * 2 * 1)
```

Exemple plus complexe : parcours récursif d'une structure arborescente

```javascript
function parcourirArbre(noeud) {
  console.log(noeud.valeur);

  // Cas de base : pas d'enfants
  if (!noeud.enfants || noeud.enfants.length === 0) {
    return;
  }

  // Appel récursif pour chaque enfant
  for (const enfant of noeud.enfants) {
    parcourirArbre(enfant);
  }
}

const arbre = {
  valeur: "A",
  enfants: [
    {
      valeur: "B",
      enfants: [{ valeur: "D" }, { valeur: "E" }],
    },
    {
      valeur: "C",
      enfants: [{ valeur: "F" }],
    },
  ],
};

parcourirArbre(arbre); // Affiche A, B, D, E, C, F
```

Points importants :

- Toujours définir un cas de base pour éviter les boucles infinies
- Attention à la profondeur de récursion (risque de dépassement de pile)
- Parfois remplaçable par des approches itératives plus efficaces

### Fonctions immédiatement invoquées (IIFE)

Une IIFE (Immediately Invoked Function Expression) est une fonction qui est exécutée immédiatement après sa création.

```javascript
// Syntaxe de base
(function () {
  console.log("Cette fonction est exécutée immédiatement");
})();

// Avec paramètres
(function (message) {
  console.log(message);
})("Hello world!");

// Avec fonctions fléchées
(() => {
  console.log("IIFE avec fonction fléchée");
})();
```

Utilisations courantes :

- Créer un scope isolé pour éviter la pollution de l'espace de noms global
- Initialiser des applications
- Encapsuler des variables privées

```javascript
const compteur = (function () {
  // Variables privées
  let valeur = 0;

  // Interface publique
  return {
    incrementer() {
      valeur += 1;
      return valeur;
    },
    decrementer() {
      valeur -= 1;
      return valeur;
    },
    valeur() {
      return valeur;
    },
  };
})();

console.log(compteur.incrementer()); // 1
console.log(compteur.incrementer()); // 2
console.log(compteur.valeur()); // 2
console.log(compteur.decrementer()); // 1
```

### Fonctions génératrices

Les fonctions génératrices (introduites en ES6) peuvent suspendre et reprendre leur exécution.

```javascript
function* generateurSequence() {
  yield 1;
  yield 2;
  yield 3;
}

const generateur = generateurSequence();

console.log(generateur.next()); // { value: 1, done: false }
console.log(generateur.next()); // { value: 2, done: false }
console.log(generateur.next()); // { value: 3, done: false }
console.log(generateur.next()); // { value: undefined, done: true }
```

Exemple plus complexe : générer une séquence infinie

```javascript
function* generateurNombres() {
  let n = 0;
  while (true) {
    yield n++;
  }
}

const nombresGen = generateurNombres();
console.log(nombresGen.next().value); // 0
console.log(nombresGen.next().value); // 1
console.log(nombresGen.next().value); // 2
```

Utilisations des générateurs :

- Traitement de séquences potentiellement infinies
- Parcours efficace de grandes structures de données
- Simplification de code asynchrone

### Fonctions asynchrones

Les fonctions asynchrones (async/await) simplifient le travail avec les Promises.

```javascript
// Fonction retournant une Promise
function fetchUserData(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId >= 1) {
        resolve({
          id: userId,
          nom: `Utilisateur ${userId}`,
          email: `user${userId}@example.com`,
        });
      } else {
        reject(new Error("ID utilisateur invalide"));
      }
    }, 1000);
  });
}

// Utilisation avec async/await
async function afficherUtilisateur(userId) {
  try {
    console.log("Récupération des données...");
    const utilisateur = await fetchUserData(userId);
    console.log("Utilisateur:", utilisateur);
  } catch (erreur) {
    console.error("Erreur:", erreur.message);
  }
}

afficherUtilisateur(1);
// Affiche après 1 seconde :
// "Récupération des données..."
// "Utilisateur: { id: 1, nom: 'Utilisateur 1', email: 'user1@example.com' }"
```

Caractéristiques des fonctions async/await :

- Une fonction async retourne toujours une Promise
- Le mot-clé await ne peut être utilisé qu'à l'intérieur d'une fonction async
- await suspend l'exécution de la fonction jusqu'à ce que la Promise soit résolue
- Les erreurs peuvent être gérées avec try/catch standard

## Contexte d'exécution et this

Le mot-clé `this` en JavaScript fait référence au contexte d'exécution actuel.

### La valeur de this

La valeur de `this` dépend de la façon dont la fonction est appelée :

```javascript
// Dans le contexte global (navigateur)
console.log(this); // Window (navigateur) ou {} (Node.js)

// Dans une fonction régulière (mode non strict)
function afficherThis() {
  console.log(this);
}
afficherThis(); // Window (navigateur) ou global (Node.js)

// Dans une méthode d'objet
const utilisateur = {
  nom: "Alice",
  afficherNom() {
    console.log(this.nom);
  },
};
utilisateur.afficherNom(); // "Alice" (this === utilisateur)

// Lors de l'utilisation de new (constructeur)
function Personne(nom) {
  this.nom = nom;
  this.afficher = function () {
    console.log(this.nom);
  };
}
const personne = new Personne("Bob");
personne.afficher(); // "Bob" (this === personne)
```

### Méthodes bind, call, et apply

Ces méthodes permettent de contrôler la valeur de `this` lors de l'appel d'une fonction.

```javascript
function saluer() {
  console.log(`Bonjour, ${this.nom}`);
}

const personne1 = { nom: "Alice" };
const personne2 = { nom: "Bob" };

// call : appelle la fonction avec this spécifié et des arguments séparés
saluer.call(personne1); // "Bonjour, Alice"

// apply : appelle la fonction avec this spécifié et des arguments en tableau
saluer.apply(personne2); // "Bonjour, Bob"

// bind : crée une nouvelle fonction avec this fixé
const saluerAlice = saluer.bind(personne1);
saluerAlice(); // "Bonjour, Alice"
```

Avec des arguments :

```javascript
function saluerAvecDetail(greeting, ponctuation) {
  console.log(`${greeting}, ${this.nom}${ponctuation}`);
}

// call avec arguments
saluerAvecDetail.call(personne1, "Salut", "!"); // "Salut, Alice!"

// apply avec tableau d'arguments
saluerAvecDetail.apply(personne2, ["Bonjour", "..."]); // "Bonjour, Bob..."

// bind avec arguments prédéfinis
const saluerPolimentBob = saluerAvecDetail.bind(personne2, "Bien le bonjour");
saluerPolimentBob("!"); // "Bien le bonjour, Bob!"
```

### Fonctions fléchées et this

Les fonctions fléchées n'ont pas leur propre `this` ; elles héritent du `this` du contexte englobant.

```javascript
const utilisateur = {
  nom: "Alice",
  // Méthode classique
  saluerClassique: function () {
    setTimeout(function () {
      console.log(`Bonjour, ${this.nom}`); // this n'est pas utilisateur
    }, 100);
  },
  // Avec fonction fléchée
  saluerFleche: function () {
    setTimeout(() => {
      console.log(`Bonjour, ${this.nom}`); // this est utilisateur
    }, 100);
  },
};

utilisateur.saluerClassique(); // "Bonjour, undefined"
utilisateur.saluerFleche(); // "Bonjour, Alice"
```

## Bonnes pratiques

Voici quelques bonnes pratiques pour l'utilisation des fonctions en JavaScript :

1. **Nommer clairement les fonctions** pour indiquer leur intention

   ```javascript
   // À éviter
   function fn1(x) {
     return x * x;
   }

   // Préférable
   function calculerCarre(nombre) {
     return nombre * nombre;
   }
   ```

2. **Une fonction, une responsabilité** - suivre le principe de responsabilité unique

   ```javascript
   // À éviter
   function traiterDonnees(donnees) {
     // Validation
     // Transformation
     // Sauvegarde
     // Envoi d'email
     // Mise à jour d'interface
   }

   // Préférable
   function validerDonnees(donnees) {
     /* ... */
   }
   function transformerDonnees(donnees) {
     /* ... */
   }
   function sauvegarderDonnees(donnees) {
     /* ... */
   }
   ```

3. **Limiter le nombre de paramètres** (idéalement 3 ou moins)

   ```javascript
   // À éviter
   function creerUtilisateur(
     nom,
     prenom,
     email,
     age,
     adresse,
     ville,
     codePostal,
     pays,
     telephone
   ) {
     // ...
   }

   // Préférable
   function creerUtilisateur({ nom, prenom, email, age, adresse }) {
     // ...
   }
   ```

4. **Préférer les fonctions pures** quand c'est possible

   ```javascript
   // À éviter
   let total = 0;
   function ajouter(valeur) {
     total += valeur;
   }

   // Préférable
   function ajouter(total, valeur) {
     return total + valeur;
   }
   ```

5. **Utiliser des valeurs de retour explicites**

   ```javascript
   // À éviter
   function traiterDonnees(donnees) {
     if (!donnees) {
       return;
     }
     // Traitement
     return resultat;
   }

   // Préférable
   function traiterDonnees(donnees) {
     if (!donnees) {
       return null; // ou une valeur explicite
     }
     // Traitement
     return resultat;
   }
   ```

6. **Documenter les fonctions** avec des commentaires ou JSDoc

   ```javascript
   /**
    * Calcule la somme des nombres d'un tableau
    * @param {number[]} nombres - Tableau de nombres à additionner
    * @returns {number} La somme des nombres
    */
   function calculerSomme(nombres) {
     return nombres.reduce((total, nombre) => total + nombre, 0);
   }
   ```

7. **Gérer les erreurs correctement**

   ```javascript
   function diviser(a, b) {
     if (b === 0) {
       throw new Error("Division par zéro non autorisée");
     }
     return a / b;
   }

   // Utilisation
   try {
     const resultat = diviser(10, 0);
   } catch (erreur) {
     console.error("Erreur de calcul:", erreur.message);
   }
   ```

8. **Éviter les effets secondaires surprises**

   ```javascript
   // À éviter
   function ajouter(tableau, valeur) {
     tableau.push(valeur); // Modifie le tableau d'origine
     return tableau;
   }

   // Préférable
   function ajouter(tableau, valeur) {
     return [...tableau, valeur]; // Crée un nouveau tableau
   }
   ```

## Pièges et erreurs courantes

1. **Oublier le mot-clé `return`**

   ```javascript
   // Fonction qui ne retourne rien explicitement
   function carre(x) {
     x * x; // Aucun effet car pas de return
   }

   console.log(carre(5)); // undefined

   // Correction
   function carre(x) {
     return x * x;
   }
   ```

2. **Confusion avec la portée de `this`**

   ```javascript
   const utilisateur = {
     nom: "Alice",
     saluer: function () {
       function afficherNom() {
         console.log(this.nom); // this n'est pas utilisateur ici
       }
       afficherNom();
     },
   };

   utilisateur.saluer(); // undefined

   // Solutions
   const utilisateur2 = {
     nom: "Alice",
     saluer: function () {
       const that = this; // Conservation de la référence
       function afficherNom() {
         console.log(that.nom);
       }
       afficherNom();
     },
   };

   // ou avec une fonction fléchée
   const utilisateur3 = {
     nom: "Alice",
     saluer: function () {
       const afficherNom = () => {
         console.log(this.nom);
       };
       afficherNom();
     },
   };
   ```

3. **Hoisting mal compris**

   ```javascript
   // Cette fonction est hoistée et peut être appelée avant sa déclaration
   console.log(addition(2, 3)); // 5
   function addition(a, b) {
     return a + b;
   }

   // Les expressions de fonction ne sont pas hoistées
   console.log(soustraction(5, 2)); // Erreur: soustraction is not a function
   const soustraction = function (a, b) {
     return a - b;
   };
   ```

4. **Fuites de mémoire avec les closures**

   ```javascript
   function creerObservateurs() {
     // Tableau potentiellement grand
     const donnees = new Array(10000).fill("données");

     // Problème : capture la référence complète à 'donnees'
     return function () {
       console.log("Première donnée:", donnees[0]);
     };
   }

   const obs = creerObservateurs(); // 'donnees' reste en mémoire

   // Solution : capturer uniquement ce qui est nécessaire
   function creerObservateurOptimise() {
     const donnees = new Array(10000).fill("données");
     const premiereDonnee = donnees[0]; // Capture seulement la première valeur

     return function () {
       console.log("Première donnée:", premiereDonnee);
     };
   }
   ```

5. **Erreurs dans les fonctions récursives**

   ```javascript
   // Risque de dépassement de pile (stack overflow)
   function factorielleRisquee(n) {
     return n * factorielleRisquee(n - 1); // Pas de condition d'arrêt
   }

   // Correction
   function factorielle(n) {
     if (n <= 1) return 1;
     return n * factorielle(n - 1);
   }
   ```

6. **Confusion entre les déclarations de fonction et les expressions**

   ```javascript
   // Différence subtile dans la portée
   if (true) {
     function f1() {
       return "f1";
     }
   }
   console.log(typeof f1); // 'function' en mode non strict, peut varier

   if (true) {
     const f2 = function () {
       return "f2";
     };
   }
   console.log(typeof f2); // 'undefined' - f2 est limité au bloc
   ```

## Ressources supplémentaires

- [Documentation MDN sur les fonctions](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Functions)
- [JavaScript.info - Fonctions](https://fr.javascript.info/function-basics)
- [JavaScript.info - Fonctions avancées](https://fr.javascript.info/advanced-functions)
- [Eloquent JavaScript - Fonctions](https://eloquentjavascript.net/03_functions.html)
- [Clean Code JavaScript - Fonctions](https://github.com/ryanmcdermott/clean-code-javascript#functions)

---

Ce README a été créé pour fournir une vue d'ensemble complète des fonctions en JavaScript. N'hésitez pas à contribuer ou à suggérer des améliorations !
