# Les Boucles en JavaScript

## Table des matières

- [Introduction](#introduction)
- [Boucle for](#boucle-for)
  - [Syntaxe de base](#syntaxe-de-base)
  - [Variantes](#variantes)
- [Boucle while](#boucle-while)
  - [Syntaxe de base](#syntaxe-de-base-1)
  - [Cas d'utilisation](#cas-dutilisation)
- [Boucle do...while](#boucle-dowhile)
  - [Syntaxe de base](#syntaxe-de-base-2)
  - [Comparaison avec while](#comparaison-avec-while)
- [Boucle for...in](#boucle-forin)
  - [Syntaxe de base](#syntaxe-de-base-3)
  - [Précautions](#précautions)
- [Boucle for...of](#boucle-forof)
  - [Syntaxe de base](#syntaxe-de-base-4)
  - [Comparaison avec for...in](#comparaison-avec-forin)
- [Méthodes d'itération des tableaux](#méthodes-ditération-des-tableaux)
  - [forEach](#foreach)
  - [map](#map)
  - [filter](#filter)
  - [reduce](#reduce)
  - [every et some](#every-et-some)
  - [find et findIndex](#find-et-findindex)
- [Contrôle des boucles](#contrôle-des-boucles)
  - [break](#break)
  - [continue](#continue)
  - [return dans les fonctions](#return-dans-les-fonctions)
  - [Labels](#labels)
- [Bonnes pratiques](#bonnes-pratiques)
- [Techniques avancées](#techniques-avancées)
  - [Boucles asynchrones](#boucles-asynchrones)
  - [Récursion comme alternative](#récursion-comme-alternative)
  - [Optimisation des performances](#optimisation-des-performances)
- [Pièges et erreurs courantes](#pièges-et-erreurs-courantes)
- [Ressources supplémentaires](#ressources-supplémentaires)

## Introduction

Les boucles constituent un élément fondamental de la programmation, permettant d'exécuter un bloc de code plusieurs fois. Elles sont essentielles pour le traitement de données, la manipulation de collections, et l'automatisation de tâches répétitives. JavaScript offre plusieurs types de boucles, chacune adaptée à des cas d'utilisation spécifiques.

Ce guide présente toutes les structures de boucles disponibles en JavaScript, ainsi que leurs cas d'utilisation, bonnes pratiques et techniques avancées.

## Boucle for

La boucle `for` est l'une des structures les plus utilisées pour l'itération. Elle offre un contrôle précis sur le processus d'itération.

### Syntaxe de base

```javascript
for (initialisation; condition; incrémentation) {
  // Code à exécuter à chaque itération
}
```

Exemple concret :

```javascript
for (let i = 0; i < 5; i++) {
  console.log(`Itération ${i}`);
}
// Affiche :
// Itération 0
// Itération 1
// Itération 2
// Itération 3
// Itération 4
```

Explication des trois parties de la boucle `for` :

1. **Initialisation** : Exécutée une seule fois avant le début de la boucle (`let i = 0`)
2. **Condition** : Évaluée avant chaque itération; la boucle continue tant qu'elle est vraie (`i < 5`)
3. **Incrémentation** : Exécutée à la fin de chaque itération (`i++`)

### Variantes

Boucle `for` avec plusieurs variables :

```javascript
for (let i = 0, j = 10; i < 5; i++, j--) {
  console.log(`i = ${i}, j = ${j}`);
}
// Affiche :
// i = 0, j = 10
// i = 1, j = 9
// i = 2, j = 8
// i = 3, j = 7
// i = 4, j = 6
```

Boucle `for` avec des parties omises :

```javascript
// Initialisation externe
let i = 0;
for (; i < 5; i++) {
  console.log(i);
}

// Boucle infinie avec condition vérifiée manuellement
for (let j = 0; ; j++) {
  console.log(j);
  if (j >= 5) break;
}
```

## Boucle while

La boucle `while` exécute un bloc de code tant qu'une condition spécifiée est vraie.

### Syntaxe de base

```javascript
while (condition) {
  // Code à exécuter tant que la condition est vraie
}
```

Exemple concret :

```javascript
let compteur = 0;
while (compteur < 5) {
  console.log(`Compteur : ${compteur}`);
  compteur++;
}
// Affiche :
// Compteur : 0
// Compteur : 1
// Compteur : 2
// Compteur : 3
// Compteur : 4
```

### Cas d'utilisation

La boucle `while` est particulièrement utile lorsque :

- Le nombre d'itérations n'est pas connu à l'avance
- La condition dépend d'une entrée externe ou d'un état qui change

```javascript
// Exemple : attendre une condition
let donneesPrêtes = false;

// Simulation d'une opération asynchrone
setTimeout(() => {
  donneesPrêtes = true;
}, 2000);

// Vérification périodique (dans un contexte réel, utilisez plutôt des Promises)
function vérifierDonnées() {
  if (donneesPrêtes) {
    console.log("Données reçues, traitement...");
  } else {
    console.log("En attente des données...");
    setTimeout(vérifierDonnées, 500);
  }
}

vérifierDonnées();
```

## Boucle do...while

La boucle `do...while` exécute un bloc de code une fois, puis répète l'exécution tant qu'une condition est vraie.

### Syntaxe de base

```javascript
do {
  // Code à exécuter
} while (condition);
```

Exemple concret :

```javascript
let i = 0;
do {
  console.log(`Itération ${i}`);
  i++;
} while (i < 5);
// Affiche :
// Itération 0
// Itération 1
// Itération 2
// Itération 3
// Itération 4
```

### Comparaison avec while

La différence principale entre `while` et `do...while` réside dans l'ordre d'évaluation de la condition :

```javascript
// while : condition vérifiée avant la première exécution
let compteur1 = 10;
while (compteur1 < 5) {
  console.log(compteur1); // Jamais exécuté
  compteur1++;
}

// do...while : condition vérifiée après la première exécution
let compteur2 = 10;
do {
  console.log(compteur2); // Exécuté une fois, affiche "10"
  compteur2++;
} while (compteur2 < 5);
```

Utilisez `do...while` lorsque vous voulez garantir l'exécution du bloc au moins une fois, quelles que soient les conditions.

## Boucle for...in

La boucle `for...in` itère sur toutes les propriétés énumérables d'un objet.

### Syntaxe de base

```javascript
for (variable in objet) {
  // Code à exécuter pour chaque propriété
}
```

Exemple concret :

```javascript
const personne = {
  prénom: "Marie",
  nom: "Dupont",
  âge: 30,
  profession: "Ingénieure",
};

for (const propriété in personne) {
  console.log(`${propriété}: ${personne[propriété]}`);
}
// Affiche :
// prénom: Marie
// nom: Dupont
// âge: 30
// profession: Ingénieure
```

### Précautions

Attention aux pièges lors de l'utilisation de `for...in` :

1. Il itère également sur les propriétés héritées via la chaîne de prototypes
2. L'ordre d'itération n'est pas garanti
3. Ne doit pas être utilisé pour les tableaux, car il peut inclure des propriétés non numériques

```javascript
// Vérification des propriétés propres (non héritées)
for (const prop in personne) {
  if (Object.prototype.hasOwnProperty.call(personne, prop)) {
    console.log(`${prop}: ${personne[prop]}`);
  }
}

// Problème avec les tableaux
const nombres = [10, 20, 30];
nombres.propriétéPersonnalisée = "valeur";

for (const index in nombres) {
  console.log(index, nombres[index]);
}
// Affiche :
// 0 10
// 1 20
// 2 30
// propriétéPersonnalisée valeur  <- problématique pour un tableau
```

## Boucle for...of

La boucle `for...of` (ES6+) itère sur les valeurs des objets itérables (Array, String, Map, Set, etc.).

### Syntaxe de base

```javascript
for (variable of itérable) {
  // Code à exécuter pour chaque valeur
}
```

Exemple concret :

```javascript
const couleurs = ["rouge", "vert", "bleu"];

for (const couleur of couleurs) {
  console.log(couleur);
}
// Affiche :
// rouge
// vert
// bleu
```

Exemples avec différents itérables :

```javascript
// Avec une chaîne de caractères
for (const caractère of "Hello") {
  console.log(caractère);
}
// H, e, l, l, o

// Avec un Set
const ensembleCouleurs = new Set(["rouge", "vert", "bleu", "vert"]);
for (const couleur of ensembleCouleurs) {
  console.log(couleur);
}
// rouge, vert, bleu (pas de doublons)

// Avec un Map
const utilisateurs = new Map([
  ["u1", "Alice"],
  ["u2", "Bob"],
  ["u3", "Charlie"],
]);
for (const [id, nom] of utilisateurs) {
  console.log(`${id}: ${nom}`);
}
// u1: Alice, u2: Bob, u3: Charlie
```

### Comparaison avec for...in

Principales différences entre `for...of` et `for...in` :

```javascript
const tableau = ["a", "b", "c"];
tableau.propriété = "valeur";

// for...in parcourt les indices (et propriétés)
for (const index in tableau) {
  console.log(index);
}
// Affiche : "0", "1", "2", "propriété"

// for...of parcourt les valeurs (uniquement les éléments du tableau)
for (const valeur of tableau) {
  console.log(valeur);
}
// Affiche : "a", "b", "c"
```

## Méthodes d'itération des tableaux

JavaScript offre plusieurs méthodes intégrées pour itérer sur les tableaux, souvent plus élégantes et lisibles que les boucles traditionnelles.

### forEach

La méthode `forEach` exécute une fonction donnée sur chaque élément du tableau.

```javascript
const nombres = [1, 2, 3, 4, 5];

nombres.forEach((nombre, index, tableau) => {
  console.log(`nombres[${index}] = ${nombre}`);
});
// Affiche :
// nombres[0] = 1
// nombres[1] = 2
// ...
```

Notez que `forEach` :

- Ne peut pas être interrompu (pas de `break` ou `return`)
- Ne retourne aucune valeur
- Ne modifie pas le tableau original (sauf si vous modifiez explicitement les éléments)

### map

La méthode `map` crée un nouveau tableau avec les résultats de l'appel d'une fonction sur chaque élément.

```javascript
const nombres = [1, 2, 3, 4, 5];
const carrés = nombres.map((n) => n * n);

console.log(carrés); // [1, 4, 9, 16, 25]
```

### filter

La méthode `filter` crée un nouveau tableau avec tous les éléments qui passent le test de la fonction fournie.

```javascript
const nombres = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const nombresPairs = nombres.filter((n) => n % 2 === 0);

console.log(nombresPairs); // [2, 4, 6, 8, 10]
```

### reduce

La méthode `reduce` applique une fonction réductrice à chaque élément du tableau pour le réduire à une seule valeur.

```javascript
const nombres = [1, 2, 3, 4, 5];
const somme = nombres.reduce(
  (accumulateur, valeurCourante) => accumulateur + valeurCourante,
  0
);

console.log(somme); // 15
```

Exemple plus complexe :

```javascript
const panier = [
  { nom: "Ordinateur", prix: 1200, quantité: 1 },
  { nom: "Téléphone", prix: 800, quantité: 2 },
  { nom: "Écouteurs", prix: 100, quantité: 3 },
];

const total = panier.reduce(
  (acc, produit) => acc + produit.prix * produit.quantité,
  0
);
console.log(total); // 3100
```

### every et some

Les méthodes `every` et `some` testent si les éléments d'un tableau satisfont une condition.

```javascript
const notes = [85, 90, 78, 92, 88];

// every : vérifie si TOUS les éléments satisfont une condition
const tousRéussis = notes.every((note) => note >= 60);
console.log(tousRéussis); // true

// some : vérifie si AU MOINS UN élément satisfait une condition
const auMoinsUnExcellent = notes.some((note) => note >= 90);
console.log(auMoinsUnExcellent); // true
```

### find et findIndex

Les méthodes `find` et `findIndex` recherchent des éléments dans un tableau.

```javascript
const utilisateurs = [
  { id: 1, nom: "Alice", âge: 28 },
  { id: 2, nom: "Bob", âge: 35 },
  { id: 3, nom: "Charlie", âge: 22 },
];

// find : retourne le premier élément qui satisfait la condition
const utilisateurTrouvé = utilisateurs.find((u) => u.âge > 30);
console.log(utilisateurTrouvé); // { id: 2, nom: 'Bob', âge: 35 }

// findIndex : retourne l'indice du premier élément qui satisfait la condition
const indexTrouvé = utilisateurs.findIndex((u) => u.nom === "Charlie");
console.log(indexTrouvé); // 2
```

## Contrôle des boucles

JavaScript offre plusieurs instructions pour contrôler le flux d'exécution d'une boucle.

### break

L'instruction `break` termine la boucle actuelle immédiatement.

```javascript
for (let i = 0; i < 10; i++) {
  if (i === 5) {
    break; // Sort de la boucle quand i atteint 5
  }
  console.log(i);
}
// Affiche : 0, 1, 2, 3, 4
```

### continue

L'instruction `continue` saute à l'itération suivante de la boucle.

```javascript
for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) {
    continue; // Saute les nombres pairs
  }
  console.log(i);
}
// Affiche : 1, 3, 5, 7, 9
```

### return dans les fonctions

Dans une fonction, `return` quitte non seulement la boucle mais aussi la fonction entière.

```javascript
function trouverPremierNombrePair(tableau) {
  for (const nombre of tableau) {
    if (nombre % 2 === 0) {
      return nombre; // Quitte la fonction dès qu'un nombre pair est trouvé
    }
  }
  return null; // Retourne null si aucun nombre pair n'est trouvé
}

console.log(trouverPremierNombrePair([1, 3, 5, 6, 7])); // 6
console.log(trouverPremierNombrePair([1, 3, 5, 7, 9])); // null
```

### Labels

Les labels permettent de cibler des boucles spécifiques lors de l'utilisation de `break` ou `continue`, particulièrement utiles dans les boucles imbriquées.

```javascript
boucleExtérieure: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) {
      break boucleExtérieure; // Sort de la boucle extérieure complètement
    }
    console.log(`i = ${i}, j = ${j}`);
  }
}
// Affiche :
// i = 0, j = 0
// i = 0, j = 1
// i = 0, j = 2
// i = 1, j = 0
```

## Bonnes pratiques

Voici quelques bonnes pratiques à suivre lors de l'utilisation des boucles en JavaScript :

1. **Choisissez la boucle adaptée à votre cas d'utilisation**

   - `for` : lorsque le nombre d'itérations est connu
   - `while` : lorsque la condition d'arrêt dépend d'une valeur dynamique
   - `for...of` : pour les itérables (tableaux, chaînes, etc.)
   - `for...in` : pour les propriétés d'objets
   - Méthodes de tableau : pour des opérations spécifiques sur les tableaux

2. **Évitez les boucles infinies**

   ```javascript
   // À éviter - boucle infinie
   for (let i = 0; i < 10; i--) {
     // i diminue et ne dépassera jamais 10
   }

   // Utilisez des conditions de sortie claires
   let i = 0;
   while (i < maxIterations && !conditionTrouvée) {
     // ...
     i++;
   }
   ```

3. **Préférez les méthodes de tableau aux boucles classiques pour les tableaux**

   ```javascript
   const utilisateurs = [
     /* ... */
   ];

   // Moins lisible
   const utilisateursActifs = [];
   for (let i = 0; i < utilisateurs.length; i++) {
     if (utilisateurs[i].estActif) {
       utilisateursActifs.push(utilisateurs[i]);
     }
   }

   // Plus lisible et expressif
   const utilisateursActifs = utilisateurs.filter((u) => u.estActif);
   ```

4. **Minimisez les opérations à l'intérieur des boucles**

   ```javascript
   const éléments = document.querySelectorAll(".item");

   // Moins efficace
   for (let i = 0; i < éléments.length; i++) {
     // Recalcule éléments.length à chaque itération
   }

   // Plus efficace
   const longueur = éléments.length;
   for (let i = 0; i < longueur; i++) {
     // Utilise une valeur précalculée
   }
   ```

5. **Évitez les modifications de tableaux pendant l'itération**

   ```javascript
   const nombres = [1, 2, 3, 4, 5];

   // Problématique - modifie le tableau pendant l'itération
   for (let i = 0; i < nombres.length; i++) {
     if (nombres[i] % 2 === 0) {
       nombres.splice(i, 1); // Modifie les indices
       i--; // Correction, mais code fragile
     }
   }

   // Préférable - crée un nouveau tableau
   const nombreImpairs = nombres.filter((n) => n % 2 !== 0);
   ```

## Techniques avancées

### Boucles asynchrones

Les boucles standard ne gèrent pas naturellement les opérations asynchrones. Voici différentes approches pour itérer avec des opérations asynchrones :

```javascript
// 1. Utilisation de async/await avec for...of
async function traiterUtilisateurs(utilisateurs) {
  for (const utilisateur of utilisateurs) {
    try {
      const données = await fetchDonnéesUtilisateur(utilisateur.id);
      console.log(données);
    } catch (erreur) {
      console.error(`Erreur pour ${utilisateur.id}:`, erreur);
    }
  }
}

// 2. Exécution séquentielle avec reduce et Promises
async function traiterEnSéquence(items) {
  return items.reduce(async (promessePrécédente, item) => {
    // Attend que les traitements précédents soient terminés
    await promessePrécédente;
    // Traite l'élément actuel
    return processItem(item);
  }, Promise.resolve());
}

// 3. Exécution parallèle avec Promise.all
async function traiterEnParallèle(items) {
  const promesses = items.map((item) => processItem(item));
  return Promise.all(promesses);
}

// 4. Exécution parallèle avec limite de concurrence
async function traiterAvecLimite(items, limite = 3) {
  const résultats = [];
  const groupes = [];

  // Diviser les éléments en groupes
  for (let i = 0; i < items.length; i += limite) {
    groupes.push(items.slice(i, i + limite));
  }

  for (const groupe of groupes) {
    // Traiter chaque groupe en parallèle
    const groupeRésultats = await Promise.all(
      groupe.map((item) => processItem(item))
    );
    résultats.push(...groupeRésultats);
  }

  return résultats;
}
```

### Récursion comme alternative

La récursion peut parfois remplacer les boucles pour certains algorithmes, notamment pour parcourir des structures de données hiérarchiques :

```javascript
// Parcours récursif d'un arbre
function parcourirArbre(noeud) {
  // Traitement du nœud actuel
  console.log(noeud.valeur);

  // Appel récursif pour chaque enfant
  if (noeud.enfants && noeud.enfants.length > 0) {
    for (const enfant of noeud.enfants) {
      parcourirArbre(enfant);
    }
  }
}

// Parcours récursif d'un objet imbriqué
function parcourirObjet(obj, préfixe = "") {
  for (const clé in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, clé)) {
      const valeur = obj[clé];
      const cleCourante = préfixe ? `${préfixe}.${clé}` : clé;

      if (typeof valeur === "object" && valeur !== null) {
        parcourirObjet(valeur, cleCourante);
      } else {
        console.log(`${cleCourante}: ${valeur}`);
      }
    }
  }
}
```

### Optimisation des performances

Techniques d'optimisation pour les boucles dans les applications critiques en termes de performances :

```javascript
// 1. Parcours de tableau optimisé (de la fin vers le début)
const tableau = [
  /* grand tableau */
];
for (let i = tableau.length - 1; i >= 0; i--) {
  // Parcourir de la fin vers le début peut être plus rapide dans certains moteurs JS
}

// 2. Réduire les comparaisons dans les boucles
const fin = tableau.length;
for (let i = 0; i < fin; i++) {
  // Évite de vérifier tableau.length à chaque itération
}

// 3. Déroulement de boucle (loop unrolling)
for (let i = 0; i < tableauLong.length; i += 4) {
  // Traiter 4 éléments par itération
  traiter(tableauLong[i]);
  if (i + 1 < tableauLong.length) traiter(tableauLong[i + 1]);
  if (i + 2 < tableauLong.length) traiter(tableauLong[i + 2]);
  if (i + 3 < tableauLong.length) traiter(tableauLong[i + 3]);
}

// 4. Éviter les allocations mémoire dans les boucles
const résultats = new Array(sourceArray.length); // Pré-allouer
for (let i = 0; i < sourceArray.length; i++) {
  résultats[i] = transformer(sourceArray[i]);
}
```

## Pièges et erreurs courantes

1. **Fuite de variables dans les boucles `for`**

   ```javascript
   // Problème (avant ES6) - 'i' fuit dans la portée englobante
   for (var i = 0; i < 3; i++) {
     // 'i' est visible ici
   }
   console.log(i); // 3 (visible en dehors de la boucle)

   // Solution - utiliser 'let' pour la portée de bloc
   for (let j = 0; j < 3; j++) {
     // 'j' est limité à cette boucle
   }
   // console.log(j); // Erreur : j n'est pas défini
   ```

2. **Problèmes de closure dans les boucles**

   ```javascript
   // Problème - toutes les fonctions partagent la même référence à 'i'
   const fonctions = [];
   for (var i = 0; i < 3; i++) {
     fonctions.push(function () {
       console.log(i);
     });
   }
   fonctions.forEach((f) => f()); // Affiche : 3, 3, 3

   // Solution 1 - utiliser 'let' (ES6+)
   const fonctionsCorrigées = [];
   for (let i = 0; i < 3; i++) {
     fonctionsCorrigées.push(function () {
       console.log(i);
     });
   }
   fonctionsCorrigées.forEach((f) => f()); // Affiche : 0, 1, 2

   // Solution 2 - utiliser une IIFE (avant ES6)
   const fonctionsIIFE = [];
   for (var i = 0; i < 3; i++) {
     (function (index) {
       fonctionsIIFE.push(function () {
         console.log(index);
       });
     })(i);
   }
   fonctionsIIFE.forEach((f) => f()); // Affiche : 0, 1, 2
   ```

3. **Modification du tableau pendant l'itération**

   ```javascript
   const nombres = [1, 2, 3, 4, 5];

   // Problème - comportement imprévisible lorsqu'on modifie le tableau
   for (let i = 0; i < nombres.length; i++) {
     console.log(nombres[i]);
     if (nombres[i] === 3) {
       nombres.push(6); // Modifie le tableau pendant l'itération
     }
   }

   // Solution - faire une copie ou utiliser une méthode appropriée
   const nombresCopie = [...nombres];
   for (let i = 0; i < nombresCopie.length; i++) {
     // Opère sur la copie, pas sur l'original
   }
   ```

4. **Oubli de l'incrémentation dans les boucles `while`**

   ```javascript
   // Boucle infinie
   let i = 0;
   while (i < 5) {
     console.log(i);
     // Oubli de i++
   }

   // Correct
   let j = 0;
   while (j < 5) {
     console.log(j);
     j++; // Ne pas oublier l'incrémentation
   }
   ```

5. **Mauvaise itération sur les propriétés des objets**

   ```javascript
   const personne = {
     nom: "Alice",
     âge: 30,
     // Méthode héritée
     toString: function () {
       return `${this.nom}, ${this.âge} ans`;
     },
   };

   // Problème - inclut les propriétés héritées
   for (const prop in personne) {
     console.log(`${prop}: ${personne[prop]}`);
   }

   // Solution - vérifier si la propriété est propre à l'objet
   for (const prop in personne) {
     if (Object.prototype.hasOwnProperty.call(personne, prop)) {
       console.log(`${prop}: ${personne[prop]}`);
     }
   }

   // Alternative moderne - Object.keys(), Object.values(), Object.entries()
   Object.keys(personne).forEach((prop) => {
     console.log(`${prop}: ${personne[prop]}`);
   });
   ```

## Ressources supplémentaires

- [Documentation MDN sur les boucles et itérations](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Loops_and_iteration)
- [JavaScript.info - Boucles: while et for](https://fr.javascript.info/while-for)
- [Méthodes des tableaux JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [Optimisation des performances JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Performance)

---

Ce README a été créé pour fournir une vue d'ensemble complète des boucles en JavaScript. N'hésitez pas à contribuer ou à suggérer des améliorations !
