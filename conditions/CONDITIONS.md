# Les Conditions en JavaScript

## Table des matières

- [Introduction](#introduction)
- [Opérateurs de comparaison](#opérateurs-de-comparaison)
- [Instructions conditionnelles](#instructions-conditionnelles)
  - [if...else](#ifelse)
  - [else if](#else-if)
  - [switch](#switch)
  - [Opérateur ternaire](#opérateur-ternaire)
- [Valeurs truthy et falsy](#valeurs-truthy-et-falsy)
- [Opérateurs logiques](#opérateurs-logiques)
  - [AND logique (&&)](#and-logique-)
  - [OR logique (||)](#or-logique-)
  - [NOT logique (!)](#not-logique-)
  - [Nullish coalescing (??)](#nullish-coalescing-)
- [Court-circuit des opérateurs](#court-circuit-des-opérateurs)
- [Bonnes pratiques](#bonnes-pratiques)
- [Techniques avancées](#techniques-avancées)
  - [Chaînage optionnel](#chaînage-optionnel)
  - [Objets de configuration](#objets-de-configuration)
  - [Tables de vérité](#tables-de-vérité)
- [Pièges et erreurs courantes](#pièges-et-erreurs-courantes)
- [Ressources supplémentaires](#ressources-supplémentaires)

## Introduction

Les conditions sont fondamentales en programmation pour prendre des décisions et contrôler le flux d'exécution d'un programme. JavaScript offre plusieurs façons d'exprimer des conditions, permettant de créer des programmes dynamiques qui réagissent différemment selon les circonstances.

Ce guide vous présente tout ce que vous devez savoir sur les conditions en JavaScript, des concepts de base aux techniques avancées.

## Opérateurs de comparaison

Les opérateurs de comparaison sont utilisés pour tester les conditions. Ils renvoient toujours une valeur booléenne (`true` ou `false`).

```javascript
// Égalité (==) - compare les valeurs (avec conversion de type)
console.log(5 == 5); // true
console.log("5" == 5); // true
console.log(0 == false); // true

// Égalité stricte (===) - compare les valeurs ET les types
console.log(5 === 5); // true
console.log("5" === 5); // false
console.log(0 === false); // false

// Inégalité (!=)
console.log(5 != 6); // true
console.log("5" != 5); // false (après conversion)

// Inégalité stricte (!==)
console.log(5 !== 6); // true
console.log("5" !== 5); // true

// Supérieur à (>)
console.log(10 > 5); // true

// Inférieur à (<)
console.log(5 < 10); // true

// Supérieur ou égal à (>=)
console.log(10 >= 10); // true

// Inférieur ou égal à (<=)
console.log(5 <= 10); // true
```

| Opérateur | Description                         | Exemple                 |
| --------- | ----------------------------------- | ----------------------- |
| `==`      | Égalité (avec conversion de type)   | `5 == '5'` est `true`   |
| `===`     | Égalité stricte (sans conversion)   | `5 === '5'` est `false` |
| `!=`      | Inégalité (avec conversion de type) | `5 != '6'` est `true`   |
| `!==`     | Inégalité stricte (sans conversion) | `5 !== '5'` est `true`  |
| `>`       | Supérieur à                         | `10 > 5` est `true`     |
| `<`       | Inférieur à                         | `5 < 10` est `true`     |
| `>=`      | Supérieur ou égal à                 | `10 >= 10` est `true`   |
| `<=`      | Inférieur ou égal à                 | `5 <= 10` est `true`    |

## Instructions conditionnelles

### if...else

L'instruction `if...else` est la structure conditionnelle la plus basique. Elle exécute un bloc de code si une condition est vraie, et un autre bloc si elle est fausse.

```javascript
const age = 18;

if (age >= 18) {
  console.log("Vous êtes majeur.");
} else {
  console.log("Vous êtes mineur.");
}
// Affiche "Vous êtes majeur."
```

Pour une condition simple, vous pouvez également utiliser une syntaxe sans accolades (non recommandé pour maintenir la cohérence) :

```javascript
if (age >= 18) console.log("Vous êtes majeur.");
else console.log("Vous êtes mineur.");
```

### else if

Pour tester plusieurs conditions, vous pouvez utiliser `else if` :

```javascript
const note = 85;

if (note >= 90) {
  console.log("Excellent (A)");
} else if (note >= 80) {
  console.log("Très bien (B)");
} else if (note >= 70) {
  console.log("Bien (C)");
} else if (note >= 60) {
  console.log("Passable (D)");
} else {
  console.log("Échec (F)");
}
// Affiche "Très bien (B)"
```

### switch

L'instruction `switch` est utile pour comparer une valeur à plusieurs cas possibles. Elle offre une alternative plus lisible aux multiples `else if` dans certaines situations.

```javascript
const jour = "Mardi";

switch (jour) {
  case "Lundi":
    console.log("Début de semaine");
    break;
  case "Mardi":
  case "Mercredi":
  case "Jeudi":
    console.log("Milieu de semaine");
    break;
  case "Vendredi":
    console.log("Fin de semaine");
    break;
  case "Samedi":
  case "Dimanche":
    console.log("Week-end");
    break;
  default:
    console.log("Jour invalide");
}
// Affiche "Milieu de semaine"
```

Points importants pour `switch` :

- Le mot-clé `break` est nécessaire pour sortir du switch après l'exécution d'un cas
- Sans `break`, l'exécution continue jusqu'au prochain `break` ou la fin du `switch` (cas de "fall-through")
- Le cas `default` est exécuté si aucun des cas ne correspond

### Opérateur ternaire

L'opérateur ternaire (`condition ? exprSiVrai : exprSiFaux`) est une forme concise pour écrire des conditions simples.

```javascript
const age = 20;
const statut = age >= 18 ? "majeur" : "mineur";
console.log(`Vous êtes ${statut}.`);
// Affiche "Vous êtes majeur."
```

Les ternaires peuvent être imbriqués, mais cela peut nuire à la lisibilité :

```javascript
const note = 85;
const resultat =
  note >= 90
    ? "A"
    : note >= 80
    ? "B"
    : note >= 70
    ? "C"
    : note >= 60
    ? "D"
    : "F";
console.log(`Votre grade est ${resultat}.`);
// Affiche "Votre grade est B."
```

## Valeurs truthy et falsy

En JavaScript, toutes les valeurs ont une équivalence booléenne inhérente appelée "truthy" ou "falsy". Cela permet d'utiliser des valeurs non booléennes dans des contextes conditionnels.

### Valeurs falsy

Les valeurs suivantes sont toujours évaluées comme `false` :

- `false`
- `0` (zéro)
- `''` ou `""` (chaîne vide)
- `null`
- `undefined`
- `NaN` (Not a Number)

```javascript
if (0) {
  console.log("Ce code ne s'exécutera jamais");
}

if ("") {
  console.log("Ce code ne s'exécutera jamais");
}
```

### Valeurs truthy

Toutes les autres valeurs sont considérées comme "truthy", notamment :

- `true`
- Tout nombre différent de zéro (positif ou négatif)
- Toute chaîne non vide, y compris `"0"` et `"false"`
- Tous les objets, y compris les objets vides `{}`
- Tous les tableaux, y compris les tableaux vides `[]`
- Les fonctions

```javascript
if (1) {
  console.log("Ce code s'exécutera toujours");
}

if ([]) {
  console.log("Les tableaux vides sont truthy");
}

if ({}) {
  console.log("Les objets vides sont truthy");
}
```

## Opérateurs logiques

Les opérateurs logiques combinent ou modifient des expressions booléennes.

### AND logique (&&)

L'opérateur `&&` renvoie `true` si toutes les expressions sont vraies.

```javascript
const age = 25;
const aPermisConduire = true;

if (age >= 18 && aPermisConduire) {
  console.log("Vous pouvez conduire.");
}
// Affiche "Vous pouvez conduire."
```

### OR logique (||)

L'opérateur `||` renvoie `true` si au moins une des expressions est vraie.

```javascript
const estMembre = false;
const estInvite = true;

if (estMembre || estInvite) {
  console.log("Accès autorisé.");
}
// Affiche "Accès autorisé."
```

### NOT logique (!)

L'opérateur `!` inverse la valeur booléenne d'une expression.

```javascript
const estConnecte = false;

if (!estConnecte) {
  console.log("Veuillez vous connecter.");
}
// Affiche "Veuillez vous connecter."

// Double négation pour convertir en booléen
const actif = "utilisateur";
const estActif = !!actif; // true
console.log(estActif); // true
```

### Nullish coalescing (??)

L'opérateur `??` (ES2020) renvoie la valeur de droite si la valeur de gauche est `null` ou `undefined`.

```javascript
const nomUtilisateur = null;
const nomAffichage = nomUtilisateur ?? "Invité";
console.log(nomAffichage); // "Invité"

const age = 0;
const ageParDefaut = age ?? 18;
console.log(ageParDefaut); // 0 (car 0 n'est ni null ni undefined)
```

## Court-circuit des opérateurs

Les opérateurs logiques `&&` et `||` utilisent un mécanisme de court-circuit qui peut être utilisé pour des expressions concises.

```javascript
// Court-circuit AND (&&)
// Si la première expression est falsy, le résultat final sera cette valeur falsy
// Si la première expression est truthy, le résultat final sera la valeur de la dernière expression

console.log(false && "Bonjour"); // false
console.log(true && "Bonjour"); // "Bonjour"
console.log(null && getSomething()); // null (getSomething n'est jamais appelé)

// Court-circuit OR (||)
// Si la première expression est truthy, le résultat final sera cette valeur truthy
// Si la première expression est falsy, le résultat final sera la valeur de la dernière expression

console.log(true || "Bonjour"); // true
console.log(false || "Bonjour"); // "Bonjour"
console.log("" || "Valeur par défaut"); // "Valeur par défaut"
```

Exemples d'utilisation courante :

```javascript
// Définir une valeur par défaut (avant ES2020 et ??)
function saluer(nom) {
  nom = nom || "Invité";
  return `Bonjour, ${nom}!`;
}

console.log(saluer("Marie")); // "Bonjour, Marie!"
console.log(saluer("")); // "Bonjour, Invité!" (car "" est falsy)
console.log(saluer(0)); // "Bonjour, Invité!" (car 0 est falsy)

// Exécuter une fonction seulement si une condition est vraie
function enregistrerUtilisateur(utilisateur) {
  // Exécuté seulement si utilisateur.actif est truthy
  utilisateur.actif && enregistrerConnexion(utilisateur);

  // Équivalent à :
  // if (utilisateur.actif) {
  //   enregistrerConnexion(utilisateur);
  // }
}
```

## Bonnes pratiques

Voici quelques bonnes pratiques à suivre lors de l'utilisation des conditionnels en JavaScript :

1. **Utilisez l'égalité stricte (===)** plutôt que l'égalité simple (==) pour éviter les conversions de type imprévues.

   ```javascript
   // À éviter
   if (id == 123) { ... }

   // Préférable
   if (id === 123) { ... }
   ```

2. **Simplifiez les conditions booléennes** en utilisant directement la valeur booléenne.

   ```javascript
   // À éviter
   if (estValide === true) { ... }

   // Préférable
   if (estValide) { ... }

   // À éviter
   if (estValide === false) { ... }

   // Préférable
   if (!estValide) { ... }
   ```

3. **Utilisez des clauses de garde** au début des fonctions pour échouer rapidement.

   ```javascript
   function processData(data) {
     // Clauses de garde
     if (!data) return null;
     if (!data.userId) return new Error("userId requis");

     // Traitement principal
     // ...
   }
   ```

4. **Préférez les ternaires pour les affectations simples** mais pas pour les logiques complexes.

   ```javascript
   // Bon usage du ternaire
   const message = age >= 18 ? "Autorisé" : "Refusé";

   // Évitez ce type d'utilisation
   age >= 18 ? utilisateurMajeur() : mineurDetecté() && notifierParent();
   ```

5. **Utilisez des fonctions pour les conditions complexes** afin d'améliorer la lisibilité.

   ```javascript
   // À éviter
   if (utilisateur.age >= 18 && utilisateur.abonnement && utilisateur.abonnement.actif && !utilisateur.restreint) { ... }

   // Préférable
   function peutAcceder(utilisateur) {
     return utilisateur.age >= 18 &&
            utilisateur.abonnement?.actif &&
            !utilisateur.restreint;
   }

   if (peutAcceder(utilisateur)) { ... }
   ```

6. **Structurez vos `switch` avec des `break`** pour éviter les comportements inattendus.
   ```javascript
   switch (status) {
     case "success":
       saveData();
       notifyUser("Success");
       break; // Ne pas oublier le break
     case "error":
       handleError();
       break;
     default:
       logUnknownStatus(status);
   }
   ```

## Techniques avancées

### Chaînage optionnel

L'opérateur de chaînage optionnel `?.` (ES2020) permet d'accéder à des propriétés imbriquées sans vérification explicite.

```javascript
const utilisateur = {
  profil: {
    adresse: {
      ville: "Paris",
    },
  },
};

// Ancien style (verbeux)
const ville =
  utilisateur && utilisateur.profil && utilisateur.profil.adresse
    ? utilisateur.profil.adresse.ville
    : undefined;

// Avec chaînage optionnel
const ville = utilisateur?.profil?.adresse?.ville;

// Avec méthodes
const longueurNom = utilisateur?.nom?.length; // undefined si utilisateur.nom n'existe pas
```

### Objets de configuration

Utilisez des objets pour remplacer des conditions complexes, notamment pour le mapping d'actions.

```javascript
// Au lieu de ceci
function processStatut(statut) {
  if (statut === "brouillon") {
    sauvegarderBrouillon();
  } else if (statut === "soumis") {
    envoyerPourRevue();
  } else if (statut === "approuvé") {
    publier();
  } else if (statut === "rejeté") {
    notifierAuteur();
  } else {
    logErreur(`Statut inconnu: ${statut}`);
  }
}

// Utilisez ceci
const PROCESSEURS_STATUT = {
  brouillon: () => sauvegarderBrouillon(),
  soumis: () => envoyerPourRevue(),
  approuvé: () => publier(),
  rejeté: () => notifierAuteur(),
  default: (statut) => logErreur(`Statut inconnu: ${statut}`),
};

function processStatut(statut) {
  const processeur = PROCESSEURS_STATUT[statut] || PROCESSEURS_STATUT.default;
  processeur(statut);
}
```

### Tables de vérité

Comprendre les tables de vérité est utile pour les conditions complexes.

Table de vérité pour AND (`&&`) :

| A     | B     | A && B |
| ----- | ----- | ------ |
| true  | true  | true   |
| true  | false | false  |
| false | true  | false  |
| false | false | false  |

Table de vérité pour OR (`||`) :

| A     | B     | A \|\| B |
| ----- | ----- | -------- |
| true  | true  | true     |
| true  | false | true     |
| false | true  | true     |
| false | false | false    |

```javascript
// Exemple utilisant des règles de table de vérité
function peutVoter(utilisateur) {
  // Doit avoir 18+ ans ET (être citoyen OU avoir un statut de résident)
  return (
    utilisateur.age >= 18 && (utilisateur.estCitoyen || utilisateur.estResident)
  );
}
```

## Pièges et erreurs courantes

1. **Confusion entre `==` et `===`**

   ```javascript
   // Peut causer des bugs difficiles à repérer
   if ("0" == 0) {
     // true
     // ...
   }

   // Comportement plus prévisible
   if ("0" === 0) {
     // false
     // ...
   }
   ```

2. **Oubli de `break` dans les `switch`**

   ```javascript
   // Entraîne l'exécution du cas suivant
   switch (type) {
     case "A":
       console.log("Type A");
     // Oubli de break ici
     case "B":
       console.log("Type B"); // Exécuté même si type === 'A'
       break;
   }
   ```

3. **Évaluation incorrecte des objets**

   ```javascript
   // Les objets sont toujours truthy
   if ({}) { // true
     console.log("Un objet vide est truthy!");
   }

   // Comparaison d'objets
   {} === {} // false (compare les références, pas le contenu)
   ```

4. **Problèmes de précédence des opérateurs**

   ```javascript
   // Ce que vous pensez écrire
   if (a === 1 || 2 || 3) { ... }

   // Ce que JavaScript interprète
   if ((a === 1) || 2 || 3) { ... } // Toujours true si a !== 1

   // Ce que vous vouliez probablement
   if (a === 1 || a === 2 || a === 3) { ... }
   // ou plus concis
   if ([1, 2, 3].includes(a)) { ... }
   ```

5. **Affectation accidentelle dans les conditions**

   ```javascript
   let x = 5;

   // Erreur accidentelle : affectation au lieu de comparaison
   if (x = 10) { // x devient 10, et l'expression vaut 10 (truthy)
     console.log("Cette condition est toujours vraie");
   }

   // Correct
   if (x === 10) { ... }
   ```

## Ressources supplémentaires

- [Documentation MDN sur les instructions conditionnelles](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Control_flow_and_error_handling#Instructions_conditionnelles)
- [Expressions et opérateurs JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Expressions_and_Operators)
- [JavaScript.info - Opérateurs logiques](https://fr.javascript.info/logical-operators)
- [JavaScript.info - Opérateur de coalescence des nuls (??)](https://fr.javascript.info/nullish-coalescing-operator)

---

Ce README a été créé pour fournir une vue d'ensemble complète des conditions en JavaScript. N'hésitez pas à contribuer ou à suggérer des améliorations !
