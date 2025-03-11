# Les Erreurs en JavaScript

## Table des matières

- [Introduction](#introduction)
- [Types d'erreurs natifs](#types-derreurs-natifs)
  - [SyntaxError](#syntaxerror)
  - [ReferenceError](#referenceerror)
  - [TypeError](#typeerror)
  - [RangeError](#rangeerror)
  - [URIError](#urierror)
  - [EvalError](#evaluror)
  - [AggregateError](#aggregateerror)
  - [InternalError](#internalerror)
- [Gestion des erreurs](#gestion-des-erreurs)
  - [Try...Catch...Finally](#trycatchfinally)
  - [Structure conditionnelle vs Try...Catch](#structure-conditionnelle-vs-trycatch)
  - [Capture d'informations d'erreur](#capture-dinformations-derreur)
- [Création d'erreurs personnalisées](#création-derreurs-personnalisées)
  - [Extension de la classe Error](#extension-de-la-classe-error)
  - [Propriétés personnalisées](#propriétés-personnalisées)
  - [Hiérarchie d'erreurs](#hiérarchie-derreurs)
- [Propagation des erreurs](#propagation-des-erreurs)
  - [Rethrow](#rethrow)
  - [Chaînage d'erreurs](#chaînage-derreurs)
  - [Erreurs dans les fonctions imbriquées](#erreurs-dans-les-fonctions-imbriquées)
- [Erreurs asynchrones](#erreurs-asynchrones)
  - [Gestion avec Promises](#gestion-avec-promises)
  - [Gestion avec Async/Await](#gestion-avec-asyncawait)
  - [Erreurs dans les événements](#erreurs-dans-les-événements)
  - [Erreurs non capturées](#erreurs-non-capturées)
- [Débogage des erreurs](#débogage-des-erreurs)
  - [Stack Trace](#stack-trace)
  - [Console API](#console-api)
  - [Debugger](#debugger)
  - [Source Maps](#source-maps)
- [Bonnes pratiques](#bonnes-pratiques)
  - [Validation précoce](#validation-précoce)
  - [Messages d'erreur explicites](#messages-derreur-explicites)
  - [Journalisation des erreurs](#journalisation-des-erreurs)
  - [Récupération gracieuse](#récupération-gracieuse)
- [Outils et bibliothèques](#outils-et-bibliothèques)
- [Ressources supplémentaires](#ressources-supplémentaires)

## Introduction

Les erreurs sont une partie inévitable du développement logiciel. En JavaScript, comprendre comment les erreurs se produisent, comment les capturer et comment les gérer efficacement est essentiel pour créer des applications robustes et fiables.

Une erreur en JavaScript est un objet qui est créé et lancé lorsqu'une exception se produit pendant l'exécution du code. Lorsqu'une erreur est levée et qu'elle n'est pas capturée, l'exécution du script s'arrête et un message d'erreur est affiché dans la console.

Ce document explore en détail les différents types d'erreurs en JavaScript, comment les gérer, et comment implémenter des stratégies efficaces de gestion des erreurs pour améliorer la robustesse et la maintenabilité de vos applications.

## Types d'erreurs natifs

JavaScript dispose de plusieurs types d'erreurs intégrés qui sont lancés dans différentes circonstances. Chaque type d'erreur est représenté par un constructeur spécifique qui hérite de la classe de base `Error`.

### SyntaxError

Une `SyntaxError` est levée lorsque le moteur JavaScript rencontre un code qui viole les règles syntaxiques du langage. Ces erreurs se produisent lors de l'analyse du code, avant son exécution.

```javascript
// SyntaxError: Missing parenthesis
if (true {
  console.log("Cette ligne ne sera jamais exécutée");
}

// SyntaxError: Unexpected token
const obj = {name: "John", age: 30,};  // Virgule de fin (trailing comma) autorisée
const arr = [1, 2, 3,];                // Virgule de fin autorisée
const x = 5,;                          // SyntaxError
```

Les `SyntaxError` ne peuvent généralement pas être capturées avec `try...catch` car elles se produisent lors de la phase de compilation, avant l'exécution du code.

### ReferenceError

Une `ReferenceError` est levée lorsque le code tente d'accéder à une variable qui n'existe pas dans la portée actuelle.

```javascript
// ReferenceError: variableInexistante is not defined
console.log(variableInexistante);

// ReferenceError avec let/const avant initialisation (Temporal Dead Zone)
console.log(maVariable); // ReferenceError
let maVariable = "valeur";

// Pas d'erreur avec var (hoisting)
console.log(autreVariable); // undefined (pas d'erreur)
var autreVariable = "valeur";

// ReferenceError en essayant d'appeler une fonction non définie
fonctionInexistante(); // ReferenceError
```

### TypeError

Une `TypeError` est levée lorsqu'une opération est tentée sur un type de valeur incorrect, par exemple en essayant d'appeler quelque chose qui n'est pas une fonction ou d'accéder à une propriété d'une valeur `null` ou `undefined`.

```javascript
// TypeError: opération sur type incorrect
const nombre = 42;
nombre.toUpperCase(); // TypeError: nombre.toUpperCase is not a function

// TypeError: accès à propriété sur null/undefined
const obj = null;
console.log(obj.propriete); // TypeError: Cannot read property 'propriete' of null

// TypeError: appel de quelque chose qui n'est pas une fonction
const nonFonction = 123;
nonFonction(); // TypeError: nonFonction is not a function
```

### RangeError

Une `RangeError` est levée lorsqu'une valeur numérique est en dehors de la plage autorisée.

```javascript
// RangeError avec récursion infinie
function causeStackOverflow() {
  return causeStackOverflow(); // RangeError: Maximum call stack size exceeded
}

// RangeError avec Array
const arr = new Array(-1); // RangeError: Invalid array length

// RangeError avec toFixed, toPrecision, etc.
const num = 123;
console.log(num.toFixed(101)); // RangeError: toFixed() digits argument must be between 0 and 100
```

### URIError

Une `URIError` est levée lorsque les fonctions de manipulation d'URI (`encodeURI()`, `decodeURI()`, etc.) sont utilisées de manière incorrecte.

```javascript
// URIError avec decodeURI
try {
  decodeURI("%"); // URIError: URI malformed
} catch (err) {
  console.log(err instanceof URIError); // true
  console.log(err.message); // "URI malformed"
}
```

### EvalError

Un `EvalError` était historiquement levé lorsque la fonction `eval()` était utilisée de manière incorrecte. Dans les versions modernes de JavaScript, cette erreur n'est plus lancée par le moteur, mais le constructeur existe toujours pour la compatibilité.

```javascript
// EvalError n'est plus utilisé dans les moteurs modernes
// mais on peut toujours le créer manuellement
const monEvalError = new EvalError("Message d'erreur");
console.log(monEvalError.name); // "EvalError"
console.log(monEvalError.message); // "Message d'erreur"
```

### AggregateError

Introduit dans ES2020, `AggregateError` est un type d'erreur qui regroupe plusieurs erreurs en une seule. Il est principalement utilisé avec les opérations qui peuvent produire plusieurs erreurs, comme `Promise.any()`.

```javascript
// AggregateError avec Promise.any()
const promesses = [
  Promise.reject(new Error("Erreur 1")),
  Promise.reject(new Error("Erreur 2")),
  Promise.reject(new Error("Erreur 3")),
];

Promise.any(promesses).catch((err) => {
  console.log(err instanceof AggregateError); // true
  console.log(err.message); // "All Promises rejected"
  console.log(err.errors); // [Error: 'Erreur 1', Error: 'Erreur 2', Error: 'Erreur 3']
});

// Création manuelle
const aggErr = new AggregateError(
  [new Error("Erreur A"), new Error("Erreur B")],
  "Erreurs multiples détectées"
);
```

### InternalError

Un `InternalError` (non standard, spécifique à certains moteurs comme SpiderMonkey) peut être levé lorsqu'une erreur interne se produit dans le moteur JavaScript, par exemple lors d'une récursion trop profonde ou d'une allocation de mémoire excessive.

```javascript
// InternalError n'est pas disponible dans tous les environnements
// Exemple d'erreur qui pourrait générer un InternalError dans certains moteurs

// Boucle trop grande pouvant causer un "out of memory"
// const arr = [];
// while (true) {
//   arr.push(new Array(1000000));
// }
```

## Gestion des erreurs

La gestion des erreurs est essentielle pour créer des applications robustes. JavaScript fournit plusieurs mécanismes pour capturer et traiter les erreurs.

### Try...Catch...Finally

La structure `try...catch...finally` est le mécanisme principal pour gérer les exceptions en JavaScript.

```javascript
try {
  // Code qui pourrait générer une erreur
  const resultat = fonctionRisquee();
  console.log("Opération réussie:", resultat);
} catch (err) {
  // Gestion de l'erreur
  console.error("Une erreur s'est produite:", err.message);
} finally {
  // Code exécuté dans tous les cas, qu'une erreur se produise ou non
  console.log("Nettoyage des ressources...");
}
```

Le bloc `try` contient le code qui pourrait générer une erreur. Si une erreur se produit, l'exécution de ce bloc s'arrête immédiatement et le contrôle passe au bloc `catch`. Le bloc `finally`, s'il est présent, est exécuté après les blocs `try` ou `catch`, qu'une erreur se produise ou non.

Depuis ES2019, il est possible d'utiliser un bloc `catch` sans paramètre d'erreur :

```javascript
try {
  // Code qui pourrait générer une erreur
} catch {
  // Gestion de l'erreur sans accéder à l'objet d'erreur
  console.error("Une erreur s'est produite");
}
```

### Structure conditionnelle vs Try...Catch

Il est important de choisir entre la validation conditionnelle et `try...catch` en fonction du contexte :

```javascript
// Validation conditionnelle (préférable pour les cas prévisibles)
function diviser(a, b) {
  if (b === 0) {
    return { erreur: "Division par zéro impossible" };
  }
  return { resultat: a / b };
}

const resultat = diviser(10, 0);
if (resultat.erreur) {
  console.error(resultat.erreur);
} else {
  console.log(resultat.resultat);
}

// try...catch (préférable pour les erreurs imprévisibles)
function chargerDonnees(url) {
  try {
    // Opération qui pourrait échouer pour diverses raisons
    const donnees = fetch(url);
    return donnees;
  } catch (err) {
    console.error("Erreur lors du chargement:", err.message);
    return null;
  }
}
```

Utilisez la validation conditionnelle pour les cas d'erreur prévisibles (comme les validations d'entrée) et `try...catch` pour les opérations pouvant échouer de manière imprévisible (I/O, parsing JSON, etc.).

### Capture d'informations d'erreur

L'objet `Error` et ses sous-classes fournissent plusieurs propriétés utiles pour le débogage :

```javascript
try {
  throw new Error("Une erreur s'est produite");
} catch (err) {
  console.log(err.name); // "Error" - Nom de l'erreur
  console.log(err.message); // "Une erreur s'est produite" - Message d'erreur
  console.log(err.stack); // Trace de la pile d'appels (stack trace)

  // Informations supplémentaires
  console.log(err instanceof Error); // true
  console.log(err.fileName); // Non standard, peut être undefined
  console.log(err.lineNumber); // Non standard, peut être undefined
}
```

## Création d'erreurs personnalisées

JavaScript permet de créer des types d'erreurs personnalisés en étendant la classe `Error` ou ses sous-classes.

### Extension de la classe Error

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message); // Appel du constructeur parent
    this.name = "ValidationError"; // Modification du nom de l'erreur

    // Correction de la trace de pile pour les environnements V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

try {
  throw new ValidationError("Les données ne sont pas valides");
} catch (err) {
  console.log(err.name); // "ValidationError"
  console.log(err.message); // "Les données ne sont pas valides"
  console.log(err instanceof ValidationError); // true
  console.log(err instanceof Error); // true
}
```

### Propriétés personnalisées

Vous pouvez ajouter des propriétés personnalisées à vos erreurs pour fournir des informations supplémentaires :

```javascript
class ApiError extends Error {
  constructor(message, statusCode, endpoint) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.date = new Date();

    // Correction de la trace de pile
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      endpoint: this.endpoint,
      date: this.date,
    };
  }
}

try {
  throw new ApiError("Service indisponible", 503, "/api/users");
} catch (err) {
  console.log(err.name); // "ApiError"
  console.log(err.statusCode); // 503
  console.log(err.endpoint); // "/api/users"
  console.log(JSON.stringify(err)); // Chaîne JSON avec toutes les propriétés
}
```

### Hiérarchie d'erreurs

Vous pouvez créer une hiérarchie d'erreurs pour différents types de situations :

```javascript
// Classe de base pour les erreurs d'application
class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Erreurs spécifiques
class NetworkError extends AppError {
  constructor(message, request) {
    super(message);
    this.request = request;
  }
}

class ValidationError extends AppError {
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

class AuthorizationError extends AppError {
  constructor(message, user) {
    super(message);
    this.user = user;
  }
}

// Utilisation
try {
  const user = { id: 1, role: "user" };
  if (user.role !== "admin") {
    throw new AuthorizationError("Accès refusé", user);
  }
} catch (err) {
  if (err instanceof NetworkError) {
    // Gérer les erreurs réseau
  } else if (err instanceof ValidationError) {
    // Gérer les erreurs de validation
  } else if (err instanceof AuthorizationError) {
    console.log("Erreur d'autorisation:", err.message);
    console.log("Utilisateur:", err.user);
  } else {
    // Erreur inconnue
    console.error("Erreur inattendue:", err);
  }
}
```

## Propagation des erreurs

La propagation des erreurs est le processus par lequel une erreur se déplace à travers la pile d'appels jusqu'à ce qu'elle soit capturée.

### Rethrow

Vous pouvez capturer une erreur, effectuer certaines opérations, puis la relancer :

```javascript
function processData(data) {
  try {
    // Traitement des données
    if (!data) {
      throw new Error("Données manquantes");
    }
    return parseData(data);
  } catch (err) {
    // Journalisation de l'erreur
    console.error("Erreur lors du traitement:", err.message);

    // Relancement de l'erreur pour qu'elle soit traitée plus haut
    throw err;
  }
}

try {
  const result = processData(null);
} catch (err) {
  console.log("Erreur capturée dans le bloc principal:", err.message);
  // Gestion gracieuse de l'erreur
}
```

### Chaînage d'erreurs

Vous pouvez créer une nouvelle erreur avec des informations supplémentaires tout en conservant l'erreur originale :

```javascript
function fetchUserData(userId) {
  try {
    // Simulation d'une erreur réseau
    throw new Error("Connexion réseau perdue");
  } catch (originalError) {
    // Création d'une nouvelle erreur avec plus de contexte
    const enrichedError = new Error(
      `Échec de récupération des données pour l'utilisateur ${userId}`
    );
    enrichedError.cause = originalError; // Propriété cause (ES2022)
    enrichedError.userId = userId;
    throw enrichedError;
  }
}

try {
  fetchUserData(123);
} catch (err) {
  console.error("Erreur:", err.message);
  if (err.cause) {
    console.error("Cause:", err.cause.message);
  }
  console.error("ID utilisateur:", err.userId);
}
```

En ES2022, la propriété `cause` est standardisée et peut être définie directement via le constructeur :

```javascript
try {
  // Erreur originale
  throw new Error("Erreur de base");
} catch (originalError) {
  // Nouvelle erreur avec cause
  throw new Error("Erreur enrichie", { cause: originalError });
}
```

### Erreurs dans les fonctions imbriquées

Les erreurs se propagent à travers plusieurs niveaux d'appels jusqu'à ce qu'elles soient capturées :

```javascript
function niveau3() {
  throw new Error("Erreur au niveau 3");
}

function niveau2() {
  niveau3();
}

function niveau1() {
  try {
    niveau2();
  } catch (err) {
    console.log("Erreur capturée au niveau 1:", err.message);
    console.log("Stack trace:", err.stack);
  }
}

niveau1();
// Affiche:
// "Erreur capturée au niveau 1: Erreur au niveau 3"
// Puis la stack trace montrant niveau3 -> niveau2 -> niveau1
```

## Erreurs asynchrones

La gestion des erreurs dans le code asynchrone nécessite des approches spécifiques.

### Gestion avec Promises

Les Promises utilisent les méthodes `.then()` et `.catch()` pour gérer les résultats et les erreurs :

```javascript
function fetchData(url) {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return response.json();
  });
}

fetchData("https://api.example.com/data")
  .then((data) => {
    console.log("Données reçues:", data);
  })
  .catch((err) => {
    console.error("Erreur lors de la récupération:", err.message);
  })
  .finally(() => {
    console.log("Opération terminée");
  });
```

Les erreurs sont propagées à travers la chaîne de Promises jusqu'au premier gestionnaire `.catch()`.

### Gestion avec Async/Await

`async/await` est une syntaxe plus moderne qui utilise `try/catch` standard pour gérer les erreurs asynchrones :

```javascript
async function fetchUserData(userId) {
  try {
    const response = await fetch(`https://api.example.com/users/${userId}`);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const userData = await response.json();
    return userData;
  } catch (err) {
    console.error(
      `Erreur lors de la récupération des données de l'utilisateur ${userId}:`,
      err.message
    );
    throw err; // Relance l'erreur pour un traitement plus haut
  }
}

// Utilisation
async function displayUserInfo(userId) {
  try {
    const user = await fetchUserData(userId);
    console.log(`Informations de l'utilisateur ${userId}:`, user);
  } catch (err) {
    console.error(
      "Impossible d'afficher les informations de l'utilisateur:",
      err.message
    );
    // Gestion gracieuse
  }
}
```

### Erreurs dans les événements

Les erreurs dans les gestionnaires d'événements ne sont pas automatiquement propagées, il faut donc les capturer explicitement :

```javascript
// Gestionnaire d'événement asynchrone
document
  .getElementById("myButton")
  .addEventListener("click", async function (event) {
    try {
      const result = await processData();
      updateUI(result);
    } catch (err) {
      console.error("Erreur lors du traitement:", err.message);
      showErrorMessage(
        "Une erreur s'est produite lors du traitement des données."
      );
    }
  });

// Éviter les erreurs non capturées
element.addEventListener("click", function (event) {
  try {
    riskyOperation();
  } catch (err) {
    console.error("Erreur dans le gestionnaire d'événement:", err);
  }
});
```

### Erreurs non capturées

JavaScript fournit des mécanismes pour capturer les erreurs non gérées :

```javascript
// Dans le navigateur - erreurs globales
window.addEventListener("error", function (event) {
  console.error("Erreur non capturée:", event.error.message);
  // Empêcher l'affichage de l'erreur dans la console (optionnel)
  event.preventDefault();
});

// Dans le navigateur - rejets de promesses non gérés
window.addEventListener("unhandledrejection", function (event) {
  console.error("Promesse rejetée non gérée:", event.reason);
  // Empêcher l'affichage du rejet dans la console (optionnel)
  event.preventDefault();
});

// Dans Node.js
process.on("uncaughtException", function (err) {
  console.error("Erreur non capturée:", err);
  // Nettoyer les ressources, journaliser l'erreur, puis terminer le processus
  process.exit(1);
});

process.on("unhandledRejection", function (reason, promise) {
  console.error("Promesse rejetée non gérée:", reason);
});
```

## Débogage des erreurs

Comprendre et corriger les erreurs est une partie importante du développement JavaScript.

### Stack Trace

La stack trace (trace de pile) est une liste des appels de fonction qui ont mené à l'erreur :

```javascript
function fonction3() {
  throw new Error("Quelque chose s'est mal passé");
}

function fonction2() {
  fonction3();
}

function fonction1() {
  fonction2();
}

try {
  fonction1();
} catch (err) {
  console.error(err.stack);
  /*
  Error: Quelque chose s'est mal passé
      at fonction3 (file.js:2:9)
      at fonction2 (file.js:6:3)
      at fonction1 (file.js:10:3)
      at file.js:14:3
  */
}
```

### Console API

L'API Console offre plusieurs méthodes pour le débogage :

```javascript
// Niveaux de journalisation
console.log("Information normale");
console.info("Information détaillée");
console.warn("Avertissement");
console.error("Erreur");

// Groupement
console.group("Opération de traitement");
console.log("Étape 1");
console.log("Étape 2");
console.groupEnd();

// Tableau
console.table([
  { nom: "Alice", age: 30 },
  { nom: "Bob", age: 25 },
]);

// Mesure du temps
console.time("opération");
// ... code à mesurer
console.timeEnd("opération"); // "opération: 123.45ms"

// Assertion
const x = 5;
console.assert(x === 6, "x devrait être 6"); // Affiche une erreur si la condition est fausse
```

### Debugger

Le mot-clé `debugger` provoque un point d'arrêt dans le code lorsque les outils de débogage sont actifs :

```javascript
function calculComplexe(data) {
  let resultat = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i] < 0) {
      debugger; // Le débogueur s'arrêtera ici si ouvert
      // Examiner la valeur de data[i], i, etc.
    }
    resultat += data[i];
  }

  return resultat;
}
```

### Source Maps

Les Source Maps permettent de faire correspondre le code minifié ou transpilé à votre code source original lors du débogage :

```javascript
// Configuration de source maps dans webpack
module.exports = {
  // ...
  devtool: 'source-map', // ou 'eval-source-map' pour le développement
  // ...
};

// Génération de source maps avec Babel
{
  "presets": ["@babel/preset-env"],
  "sourceMaps": true
}

// Configuration dans un fichier JS
//# sourceMappingURL=script.min.js.map
```

## Bonnes pratiques

Voici quelques bonnes pratiques pour gérer efficacement les erreurs en JavaScript.

### Validation précoce

Validez les entrées le plus tôt possible pour éviter les erreurs ultérieures :

```javascript
function transferMoney(fromAccount, toAccount, amount) {
  // Validation des arguments
  if (!fromAccount || !toAccount) {
    throw new Error("Les comptes source et destination sont requis");
  }

  if (typeof amount !== "number" || amount <= 0) {
    throw new TypeError("Le montant doit être un nombre positif");
  }

  if (fromAccount.balance < amount) {
    throw new Error("Solde insuffisant");
  }

  // Si la validation passe, effectuer l'opération
  fromAccount.balance -= amount;
  toAccount.balance += amount;

  return { success: true, newBalance: fromAccount.balance };
}
```

### Messages d'erreur explicites

Créez des messages d'erreur clairs et informatifs :

```javascript
// Mauvais exemple
if (!user) {
  throw new Error("Erreur");
}

// Bon exemple
if (!user) {
  throw new Error("Utilisateur non trouvé lors de la validation du profil");
}

// Exemple amélioré
if (!user) {
  throw new Error(
    `Utilisateur avec ID ${userId} non trouvé lors de la validation du profil`
  );
}
```

### Journalisation des erreurs

Mettez en place un système de journalisation des erreurs adapté à votre application :

```javascript
// Système de journalisation simple
const Logger = {
  debug: (message, ...data) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEBUG] ${message}`, ...data);
    }
  },
  info: (message, ...data) => {
    console.info(`[INFO] ${message}`, ...data);
  },
  warn: (message, ...data) => {
    console.warn(`[WARN] ${message}`, ...data);
  },
  error: (message, err, ...data) => {
    console.error(`[ERROR] ${message}`, err, ...data);

    // En production, envoi à un service de surveillance
    if (process.env.NODE_ENV === "production") {
      sendToErrorMonitoring(message, err, ...data);
    }
  },
};

// Utilisation
try {
  riskyOperation();
} catch (err) {
  Logger.error("Échec de l'opération risquée", err, {
    context: "additionalData",
  });
}
```

### Récupération gracieuse

Concevez votre application pour qu'elle puisse se remettre des erreurs de manière élégante :

```javascript
async function fetchUserData(userId) {
  try {
    return await api.getUser(userId);
  } catch (err) {
    // Journalisation
    console.error("Erreur lors de la récupération de l'utilisateur:", err);

    // Retour de données par défaut
    return {
      id: userId,
      name: "Utilisateur inconnu",
      isPlaceholder: true,
    };
  }
}

// Interface utilisateur résiliente
async function renderUserProfile(userId) {
  const userDataElement = document.getElementById("userData");

  try {
    userDataElement.classList.add("loading");
    const userData = await fetchUserData(userId);

    if (userData.isPlaceholder) {
      userDataElement.classList.add("error-state");
    }

    renderUserInterface(userData);
  } catch (err) {
    userDataElement.classList.add("error-state");
    userDataElement.innerHTML = `
      <div class="error-message">
        Impossible de charger les données utilisateur.
        <button onclick="retryLoading(${userId})">Réessayer</button>
      </div>
    `;
  } finally {
    userDataElement.classList.remove("loading");
  }
}
```

## Outils et bibliothèques

Plusieurs outils et bibliothèques peuvent améliorer la gestion des erreurs dans vos applications JavaScript :

- **Sentry** : Plateforme de surveillance des erreurs pour le front-end et le back-end
- **TrackJS** : Surveillance des erreurs JavaScript avec informations contextuelles
- **Winston** : Bibliothèque de journalisation polyvalente pour Node.js
- **Pino** : Logger Node.js rapide avec une faible empreinte
- **joi** : Validation de schéma puissante pour les objets JavaScript
- **zod** : Validation de schéma avec inférence de type TypeScript
- **Express Error Handler** : Middleware pour la gestion centralisée des erreurs dans Express.js
- **Boom** : Objets d'erreur HTTP pour Hapi.js et autres frameworks
- **AxiosError** : Gestion des erreurs avec la bibliothèque HTTP Axios

Exemple avec Axios :

```javascript
import axios from "axios";

axios
  .get("/api/data")
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'état
      console.error("Erreur de réponse:", error.response.status);
      console.error("Données:", error.response.data);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error("Erreur de requête:", error.request);
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error("Erreur:", error.message);
    }
    console.error("Configuration:", error.config);
  });
```

## Ressources supplémentaires

- [Documentation MDN sur les erreurs](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [Types d'erreurs JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Error#types_derreur)
- [Gestion des exceptions JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [Erreurs et promesses](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Using_promises#error_handling)
- [Console API](https://developer.mozilla.org/fr/docs/Web/API/console)
- [Débogage dans Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/javascript)
- [Débogage dans Firefox Developer Tools](https://developer.mozilla.org/fr/docs/Tools/Debugger)

---

Ce README a été créé pour fournir une vue d'ensemble complète des erreurs en JavaScript. N'hésitez pas à contribuer ou à suggérer des améliorations !
