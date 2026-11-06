# 30 — Commentaires et JSDoc

> **Niveau** : Intermédiaire · **Durée** : ~2 h 30 · **Prérequis** : [Fonctions](../06-fonctions/README.md), [Modules](../26-modules/README.md), [Outillage](../28-outillage/README.md)

Un commentaire bien placé explique ce que le code ne peut pas dire : pourquoi il est écrit ainsi. Un commentaire JSDoc va plus loin : il décrit l'interface d'une fonction de façon structurée, ce qui alimente l'autocomplétion de l'éditeur, permet à TypeScript de **vérifier les types de votre JavaScript** sans étape de compilation, et sert à générer une documentation. Ce chapitre montre comment écrire les deux, et comment transformer JSDoc en véritable filet de sécurité.

## Objectifs

- Distinguer un commentaire utile (le pourquoi) d'un commentaire nuisible (paraphrase, code mort, information périmée)
- Documenter fonctions, objets et classes avec les principaux tags JSDoc (`@param`, `@returns`, `@throws`, `@example`, `@deprecated`…)
- Décrire des types en JSDoc avec la syntaxe de TypeScript : unions, objets, fonctions, génériques (`@template`), `@typedef`, `@import`, `@satisfies`
- Activer la vérification de types d'un projet JavaScript (`// @ts-check`, `checkJs`, `jsconfig.json`) et la lancer en intégration continue
- Tirer parti d'IntelliSense dans VS Code et générer une documentation (TypeDoc)
- Choisir entre JSDoc et TypeScript selon le projet

## Sommaire

- [Les trois formes de commentaires](#les-trois-formes-de-commentaires)
- [Écrire des commentaires utiles](#écrire-des-commentaires-utiles)
- [Les commentaires lus par les outils](#les-commentaires-lus-par-les-outils)
- [JSDoc : le principe](#jsdoc--le-principe)
- [Documenter une fonction](#documenter-une-fonction)
- [Les types en JSDoc](#les-types-en-jsdoc)
- [Définir et réutiliser des types](#définir-et-réutiliser-des-types)
- [Génériques avec @template](#génériques-avec-template)
- [Surcharges avec @overload](#surcharges-avec-overload)
- [Documenter une classe](#documenter-une-classe)
- [Vérifier les types avec TypeScript](#vérifier-les-types-avec-typescript)
- [IntelliSense dans VS Code](#intellisense-dans-vs-code)
- [Générer une documentation](#générer-une-documentation)
- [JSDoc ou TypeScript ?](#jsdoc-ou-typescript-)
- [Pièges courants](#pièges-courants)
- [Bonnes pratiques](#bonnes-pratiques)
- [Résumé](#résumé)
- [Exercices](#exercices)
- [Pour aller plus loin](#pour-aller-plus-loin)

## Les trois formes de commentaires

```js
// Commentaire sur une ligne : jusqu'à la fin de la ligne
const tva = 0.2; // en fin de ligne aussi

/* Commentaire de bloc :
   peut s'étendre sur plusieurs lignes */

/**
 * Commentaire de documentation (JSDoc) : commence par deux astérisques
 * et se place juste avant ce qu'il documente.
 * @param {number} prixHt
 */
function prixTtc(prixHt) {
  return prixHt * (1 + tva);
}

console.log(prixTtc(100)); // 120
```

Trois détails de syntaxe :

- Les commentaires de bloc **ne s'imbriquent pas** : le premier `*/` rencontré ferme le commentaire. Pour désactiver temporairement un bloc qui en contient déjà, utilisez `//` sur chaque ligne (raccourci <kbd>Ctrl</kbd>+<kbd>/</kbd> ou <kbd>Cmd</kbd>+<kbd>/</kbd> dans VS Code).
- La ligne `#!/usr/bin/env node` en tête d'un script exécutable (*hashbang*, ES2023) n'est pas un commentaire au sens strict, mais elle est ignorée par le moteur (voir le [chapitre 11](../11-syntaxe-moderne/README.md)).
- Le format JSON **n'accepte aucun commentaire**. Certains fichiers de configuration (`tsconfig.json`, `jsconfig.json`, réglages de VS Code) utilisent une variante, JSONC, qui les tolère.

## Écrire des commentaires utiles

**Le code dit *comment*, le commentaire dit *pourquoi*.** Un lecteur peut toujours relire le code pour savoir ce qu'il fait ; il ne peut pas deviner l'intention, la contrainte externe ou l'option écartée.

```js
const panier = { articles: [{ prix: 1999, quantite: 2 }] };

// ❌ Paraphrase : n'apprend rien
// Multiplie le prix par la quantité et additionne
const total1 = panier.articles.reduce((s, a) => s + a.prix * a.quantite, 0);

// ✅ Explique une décision invisible dans le code
// Les prix sont stockés en centimes pour éviter les erreurs d'arrondi des flottants
// (0.1 + 0.2 !== 0.3) : on ne convertit en euros qu'à l'affichage.
const total2 = panier.articles.reduce((s, a) => s + a.prix * a.quantite, 0);

console.log(total1 === total2, total2 / 100); // true 39.98
```

Ce qui mérite un commentaire :

- **Une contrainte externe** : bogue d'un navigateur, limite d'une API, exigence légale. Ajoutez le lien (ticket, documentation, spécification).
- **Une décision** et l'alternative écartée (« un tableau plutôt qu'une `Map` : moins de 20 éléments, l'ordre compte »).
- **Une unité ou un format** (`// durée en millisecondes`, `// date ISO 8601 en UTC`).
- **Une formule, une expression régulière, un algorithme** non évident, avec sa source.
- **Un avertissement** (« ne pas paralléliser : l'API limite à 1 requête par seconde »).

```js
// L'API de paiement refuse plus de 10 requêtes par seconde et par clé
// (https://docs.exemple-paiement.fr/limites) : on espace les appels de 110 ms.
const DELAI_ENTRE_APPELS_MS = 110;

// Code postal français : 5 chiffres, les départements corses commençant par 20.
const REGEX_CODE_POSTAL = /^\d{5}$/;

console.log(DELAI_ENTRE_APPELS_MS, REGEX_CODE_POSTAL.test("20000")); // 110 true
```

Ce qu'il faut éviter :

| À éviter | Pourquoi | À la place |
| --- | --- | --- |
| La paraphrase (`i++; // incrémente i`) | bruit, double la lecture | rien |
| Le commentaire qui ment (code modifié, commentaire oublié) | pire qu'aucun commentaire | mettre à jour ou supprimer le commentaire avec le code |
| Le code commenté « au cas où » | personne n'ose le supprimer, il pourrit | le supprimer : Git le garde |
| Le journal des modifications en tête de fichier | doublon de l'historique Git | des messages de commit soignés |
| Le commentaire qui compense un mauvais nom | le nom reste mauvais partout ailleurs | renommer, extraire une fonction ou une constante |

Le dernier point est le plus fréquent. Souvent, un commentaire disparaît en améliorant le code lui-même :

```js
const utilisateur = { age: 17, paysResidence: "FR", consentementParental: true };

// ❌ Le commentaire explique une condition illisible
// vérifie si l'utilisateur peut s'inscrire (majeur, ou mineur avec accord)
if (utilisateur.age >= 18 || (utilisateur.age >= 15 && utilisateur.consentementParental)) {
  console.log("inscription autorisée"); // inscription autorisée
}

// ✅ Le nom de la fonction porte l'intention, la règle est isolée et testable
const AGE_MAJORITE = 18;
const AGE_MINIMUM_AVEC_ACCORD = 15;

function peutSInscrire({ age, consentementParental }) {
  const estMajeur = age >= AGE_MAJORITE;
  const estMineurAutorise = age >= AGE_MINIMUM_AVEC_ACCORD && consentementParental;
  return estMajeur || estMineurAutorise;
}

console.log(peutSInscrire(utilisateur)); // true
```

### Les marqueurs TODO, FIXME, HACK

Des préfixes conventionnels signalent un travail restant. Ils ne sont utiles que s'ils sont **actionnables** : qui, quoi, et idéalement un lien vers un ticket.

```js
// TODO(#412) : paginer quand le catalogue dépassera 500 articles
// FIXME(#398) : renvoie un total faux si une remise dépasse le prix de l'article
// HACK : Safari < 17 ne gère pas l'option X, retirer quand la cible minimale sera Safari 17
// NOTE : l'ordre des étapes compte, la validation doit précéder la normalisation
console.log("marqueurs"); // marqueurs
```

VS Code les retrouve avec une recherche globale (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Maj</kbd>+<kbd>F</kbd>), et la règle ESLint `no-warning-comments` peut les signaler pour qu'ils ne s'accumulent pas.

## Les commentaires lus par les outils

Certains commentaires ne s'adressent pas aux humains mais aux outils. Il faut savoir les reconnaître, et ne pas les supprimer par erreur :

| Commentaire | Lu par | Effet |
| --- | --- | --- |
| `// @ts-check`, `// @ts-nocheck` | TypeScript, VS Code | active ou désactive la vérification de types du fichier |
| `// @ts-expect-error`, `// @ts-ignore` | TypeScript | ignore l'erreur de type de la ligne suivante |
| `// eslint-disable-next-line règle` | ESLint | désactive une règle pour la ligne suivante |
| `// prettier-ignore` | Prettier | ne reformate pas l'instruction suivante |
| `//# sourceMappingURL=app.js.map` | navigateurs, Node.js | désigne la source map du fichier ([chapitre 17](../17-erreurs/README.md)) |
| `/* @vite-ignore */` | Vite | n'analyse pas un `import()` dynamique |
| `/* @__PURE__ */` | bundlers (esbuild, Rollup…) | l'appel peut être supprimé s'il n'est pas utilisé (*tree shaking*) |
| `/** … */` (JSDoc) | éditeurs, TypeScript, générateurs de documentation | documentation et types : la suite du chapitre |

> [!TIP]
> Une directive de désactivation doit toujours être justifiée : `// eslint-disable-next-line no-console -- sortie voulue dans la CLI`. ESLint accepte une explication après `--`.

## JSDoc : le principe

JSDoc est une convention, née en 1999 sur le modèle de Javadoc, pour décrire du code JavaScript dans des commentaires `/** … */`. Un bloc JSDoc se compose :

1. d'une **phrase de résumé** (la première ligne, affichée en priorité par l'éditeur) ;
2. d'une **description** facultative, qui accepte le Markdown ;
3. de **tags** commençant par `@`, souvent suivis d'un **type entre accolades** `{…}`, d'un nom et d'une description.

```js
/**
 * Convertit une durée en secondes en texte lisible.
 *
 * Les durées supérieures à une heure sont affichées en heures et minutes ;
 * les secondes restantes sont alors **ignorées**.
 *
 * @param {number} secondes - Durée positive, en secondes.
 * @returns {string} Par exemple `"1 h 05"` ou `"42 s"`.
 * @example
 * formaterDuree(3930); // "1 h 05"
 */
function formaterDuree(secondes) {
  if (secondes < 60) return `${secondes} s`;
  const minutes = Math.floor(secondes / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

console.log(formaterDuree(42), formaterDuree(600), formaterDuree(3930)); // 42 s 10 min 1 h 05
```

Ces commentaires servent aujourd'hui à trois choses :

| Usage | Outil | Ce que vous y gagnez |
| --- | --- | --- |
| Documentation dans l'éditeur | VS Code, WebStorm… | infobulles au survol, aide à la saisie des paramètres, autocomplétion |
| Vérification de types | TypeScript (`checkJs`) | les erreurs de type sont signalées dans du JavaScript pur, sans compilation |
| Documentation générée | TypeDoc, JSDoc | un site de référence pour une bibliothèque |

> [!IMPORTANT]
> Les **types** JSDoc s'écrivent aujourd'hui avec la **syntaxe de TypeScript** (`string[]`, `(a: number) => string`, `Record<string, number>`…), car c'est TypeScript qui les interprète dans les éditeurs. L'ancienne syntaxe du Closure Compiler (`function(string): void`, `?`, `!number`) n'est plus acceptée par TypeScript 7.

## Documenter une fonction

### @param et @returns

```js
/**
 * Calcule le prix TTC d'un montant hors taxes.
 *
 * @param {number} prixHt - Prix hors taxes, en centimes.
 * @param {number} [taux=0.2] - Taux de TVA (0.2 pour 20 %). Facultatif.
 * @returns {number} Le prix TTC, arrondi au centime.
 */
function prixTtc(prixHt, taux = 0.2) {
  return Math.round(prixHt * (1 + taux));
}

console.log(prixTtc(1000)); // 1200
console.log(prixTtc(1000, 0.055)); // 1055
```

- `@param {type} nom - description` : le tiret est facultatif mais courant.
- `[nom]` signale un paramètre **facultatif** ; `[nom=valeur]` documente sa valeur par défaut (c'est la valeur dans la signature qui compte à l'exécution).
- `@returns` (ou `@return`) décrit la valeur renvoyée. Pour une fonction `async`, le type est `Promise<…>`.

### Objet d'options et paramètres déstructurés

Pour un paramètre objet, documentez chaque propriété avec un chemin pointé :

```js
/**
 * Affiche une notification.
 *
 * @param {object} options
 * @param {string} options.titre - Texte principal.
 * @param {"info" | "succes" | "erreur"} [options.niveau="info"] - Couleur et icône.
 * @param {number} [options.duree=3000] - Durée d'affichage en millisecondes.
 * @returns {string} Le texte affiché.
 */
function notifier({ titre, niveau = "info", duree = 3000 }) {
  return `[${niveau}] ${titre} (${duree} ms)`;
}

console.log(notifier({ titre: "Enregistré", niveau: "succes" })); // [succes] Enregistré (3000 ms)
```

Le nom de premier niveau (`options`) est libre quand le paramètre est déstructuré : seuls les noms des propriétés doivent correspondre.

Pour des paramètres du reste, le type décrit **un** élément précédé de `...`, ou directement le tableau :

```js
/**
 * Additionne des montants en centimes.
 * @param {...number} montants - Autant de montants que nécessaire.
 * @returns {number}
 */
function additionner(...montants) {
  return montants.reduce((somme, m) => somme + m, 0);
}

console.log(additionner(1999, 450, 1)); // 2450
```

### @throws, @example, @deprecated, @see, @since

```js
/**
 * Retire un montant d'un compte.
 *
 * @param {{ solde: number }} compte - Compte à débiter (modifié sur place).
 * @param {number} montant - Montant strictement positif, en centimes.
 * @returns {number} Le nouveau solde.
 * @throws {RangeError} Si le montant est négatif, nul, ou dépasse le solde.
 * @example
 * const compte = { solde: 5000 };
 * retirer(compte, 2000); // 3000
 * @see {@link https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/RangeError | RangeError sur MDN}
 * @since 2.1.0
 */
function retirer(compte, montant) {
  if (montant <= 0 || montant > compte.solde) {
    throw new RangeError(`Montant invalide : ${montant} (solde : ${compte.solde})`);
  }
  compte.solde -= montant;
  return compte.solde;
}

/**
 * @deprecated Depuis la version 2.1, utilisez {@link retirer}, qui vérifie le solde.
 * @param {{ solde: number }} compte
 * @param {number} montant
 */
function debiter(compte, montant) {
  compte.solde -= montant;
}

const compte = { solde: 5000 };
console.log(retirer(compte, 2000)); // 3000
debiter(compte, 500); // l'éditeur affiche « debiter » barré
console.log(compte.solde); // 2500
```

| Tag | Rôle | Remarque |
| --- | --- | --- |
| `@throws {Type} description` | erreur que la fonction peut lancer | purement documentaire : TypeScript ne le vérifie pas |
| `@example` | exemple d'utilisation (le reste du bloc, jusqu'au tag suivant) | affiché tel quel dans l'infobulle ; gardez-le exact |
| `@deprecated` | fonction à ne plus utiliser | VS Code **barre** son nom à chaque utilisation |
| `@see` | renvoi vers une autre fonction ou une URL | |
| `{@link cible}` / `{@link url \| texte}` | lien cliquable dans une description | utilisable dans n'importe quel texte du bloc |
| `@since` | version d'apparition | documentaire |

## Les types en JSDoc

Tous les types de TypeScript sont utilisables entre les accolades. L'essentiel :

| Besoin | Syntaxe | Exemple de valeur |
| --- | --- | --- |
| Primitifs | `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined` | `"Ada"`, `42` |
| Tableau | `string[]` ou `Array<string>` | `["a", "b"]` |
| Tuple | `[number, number]` | `[48.85, 2.35]` |
| Objet | `{ nom: string, age?: number }` (`?` : propriété facultative) | `{ nom: "Ada" }` |
| Dictionnaire | `Record<string, number>` | `{ cafe: 12, the: 3 }` |
| Union | `string \| number` | `"12"` ou `12` |
| Valeurs littérales | `"GET" \| "POST"` | `"GET"` |
| Valeur possiblement absente | `string \| null`, `string \| undefined` | `null` |
| Fonction | `(a: number, b: number) => number` | `(a, b) => a + b` |
| Promesse | `Promise<string>` | `fetch(…).then((r) => r.text())` |
| Collections | `Map<string, number>`, `Set<string>` | `new Map()` |
| Classes et DOM | `Date`, `Error`, `HTMLElement`, `HTMLInputElement` | `new Date()` |
| N'importe quoi, sans contrôle | `any` | à éviter |
| N'importe quoi, à vérifier avant usage | `unknown` | résultat de `JSON.parse` |
| Type d'une valeur existante | `typeof config` | |
| Clés d'un type | `keyof Article` | `"id" \| "prix"` |
| Type d'un autre module | `import("./types.js").Article` | |
| Utilitaires | `Partial<T>`, `Readonly<T>`, `Pick<T, "a">`, `Omit<T, "b">`, `ReturnType<typeof f>` | |

Le tag `@type` annote une variable :

```js
/** @type {Map<string, Set<number>>} */
const commandesParClient = new Map();
commandesParClient.set("ada", new Set([1042, 1043]));

/** @type {(a: number, b: number) => number} */
const multiplier = (a, b) => a * b;

/** @type {"clair" | "sombre"} */
let theme = "clair";
theme = "sombre";

console.log(commandesParClient.get("ada")?.size, multiplier(6, 7), theme); // 2 42 sombre
```

### Conversion de type (« cast »)

Quand vous en savez plus que TypeScript, une annotation `@type` **suivie d'une expression entre parenthèses** force le type. Les parenthèses sont obligatoires :

<!-- no-run -->
```js
// querySelector renvoie Element | null : on précise qu'il s'agit d'un champ de saisie
const champ = /** @type {HTMLInputElement} */ (document.querySelector("#email"));
console.log(champ.value);
```

C'est l'équivalent de `as HTMLInputElement` en TypeScript : aucune vérification n'a lieu à l'exécution. Si l'élément n'existe pas, `champ.value` plantera quand même. Préférez une vérification réelle quand c'est possible (`if (champ instanceof HTMLInputElement) …`).

## Définir et réutiliser des types

### @typedef et @property

Un type utilisé à plusieurs endroits se nomme avec `@typedef`. Deux écritures équivalentes :

```js
/**
 * Un article du catalogue.
 * @typedef {object} Article
 * @property {string} id - Référence unique (SKU).
 * @property {string} nom
 * @property {number} prix - Prix en centimes.
 * @property {string[]} [etiquettes] - Facultatif.
 */

/** @typedef {{ article: Article, quantite: number }} Ligne */

/**
 * @param {Ligne[]} lignes
 * @returns {number} Total en centimes.
 */
function totalPanier(lignes) {
  return lignes.reduce((somme, { article, quantite }) => somme + article.prix * quantite, 0);
}

/** @type {Ligne[]} */
const panier = [
  { article: { id: "CAF-01", nom: "Café", prix: 450 }, quantite: 2 },
  { article: { id: "THE-02", nom: "Thé", prix: 380, etiquettes: ["bio"] }, quantite: 1 },
];

console.log(totalPanier(panier)); // 1280
```

La forme avec `@property` permet une description par propriété (affichée dans l'infobulle) ; la forme compacte `{{ … }}` convient aux petits types.

### @callback

`@callback` nomme un type de fonction, avec la même syntaxe qu'une fonction documentée :

```js
/**
 * Décide si une tâche doit être conservée.
 * @callback Filtre
 * @param {{ titre: string, faite: boolean }} tache
 * @param {number} index
 * @returns {boolean}
 */

/**
 * @param {{ titre: string, faite: boolean }[]} taches
 * @param {Filtre} filtre
 */
function filtrerTaches(taches, filtre) {
  return taches.filter(filtre).map((t) => t.titre);
}

const taches = [
  { titre: "Écrire le chapitre", faite: true },
  { titre: "Relire", faite: false },
];
console.log(filtrerTaches(taches, (t) => !t.faite)); // [ 'Relire' ]
```

L'équivalent compact est un `@typedef` de type fonction : `/** @typedef {(tache: Tache, index: number) => boolean} Filtre */`.

### Partager des types entre fichiers : @import

Depuis TypeScript 5.5, le tag `@import` importe des **types** d'un autre module, avec la syntaxe d'un `import` ordinaire. Il n'a aucun effet à l'exécution :

<!-- no-run -->
```js
// types.js — un module qui ne contient que des définitions de types
/**
 * @typedef {object} Utilisateur
 * @property {number} id
 * @property {string} nom
 * @property {"admin" | "membre"} role
 */
export {}; // fait de ce fichier un module
```

<!-- no-run -->
```js
// utilisateurs.js
/** @import { Utilisateur } from "./types.js" */

/**
 * @param {Utilisateur[]} utilisateurs
 * @returns {Utilisateur[]}
 */
export function administrateurs(utilisateurs) {
  return utilisateurs.filter((u) => u.role === "admin");
}

// Équivalent sans @import, en ligne :
/** @param {import("./types.js").Utilisateur} utilisateur */
export const nomAffiche = (utilisateur) => utilisateur.nom.toUpperCase();
```

`@import` fonctionne aussi pour les types des modules de Node.js ou des paquets npm qui fournissent leurs types :

```js
/** @import { IncomingMessage, ServerResponse } from "node:http" */

/**
 * @param {IncomingMessage} requete
 * @param {ServerResponse} reponse
 */
function repondre(requete, reponse) {
  reponse.end(`Vous avez demandé ${requete.url}`);
}

console.log(typeof repondre); // function
```

### Énumérations : un objet gelé et une union

JavaScript n'a pas d'`enum`. On utilise un objet gelé, et l'on dérive le type de ses valeurs :

```js
const Statut = Object.freeze({
  BROUILLON: "brouillon",
  PAYEE: "payee",
  EXPEDIEE: "expediee",
});

/** @typedef {(typeof Statut)[keyof typeof Statut]} Statut */
// Statut (le type) vaut "brouillon" | "payee" | "expediee"

/** @param {Statut} statut */
function libelle(statut) {
  return { brouillon: "En préparation", payee: "Payée", expediee: "Expédiée" }[statut];
}

console.log(libelle(Statut.PAYEE)); // Payée
console.log(libelle("expediee")); // Expédiée
```

Le même nom `Statut` désigne la valeur (l'objet) et le type (l'union) : TypeScript les range dans deux espaces de noms distincts. Le tag historique `@enum` n'est **plus reconnu par TypeScript 7** ; c'est ce motif qui le remplace.

### Vérifier sans élargir : @satisfies

`@type` impose un type à une variable, quitte à **perdre** de l'information. `@satisfies` (TypeScript 5.0) vérifie que la valeur est conforme, mais conserve son type exact :

```js
/** @type {Record<string, { port: number, hote: string }>} */
const environnementsLarges = {
  dev: { port: 3000, hote: "localhost" },
};
// Le type est un dictionnaire : n'importe quelle clé est acceptée, même absente, sans erreur
console.log(environnementsLarges.recette?.port); // undefined

/** @satisfies {Record<string, { port: number, hote: string }>} */
const environnements = {
  dev: { port: 3000, hote: "localhost" },
  prod: { port: 443, hote: "exemple.fr" },
};
// Le type reste { dev: …, prod: … } : les clés sont connues et l'autocomplétion les propose
console.log(environnements.prod.port); // 443
// environnements.recette → erreur : la propriété 'recette' n'existe pas
```

## Génériques avec @template

Une fonction **générique** fonctionne pour plusieurs types tout en préservant le lien entre l'entrée et la sortie. `@template T` déclare un paramètre de type :

```js
/**
 * Renvoie le dernier élément d'un tableau.
 * @template T
 * @param {T[]} elements
 * @returns {T | undefined}
 */
function dernier(elements) {
  return elements.at(-1);
}

const n = dernier([3, 1, 2]); // TypeScript en déduit : number | undefined
const mot = dernier(["café", "thé"]); // string | undefined
console.log(n?.toFixed(1), mot?.toUpperCase()); // 2.0 THÉ
```

Sans générique, il faudrait écrire `@returns {any}` et l'on perdrait toute vérification sur `n` et `mot`.

Une **contrainte** se place entre accolades : `@template {keyof T} K` signifie « K doit être une clé de T ».

```js
/**
 * Regroupe des éléments selon la valeur d'une de leurs propriétés.
 * @template {Record<string, unknown>} T
 * @template {keyof T} K
 * @param {T[]} elements
 * @param {K} cle
 * @returns {Map<T[K], T[]>}
 */
function grouperPar(elements, cle) {
  const groupes = new Map();
  for (const element of elements) {
    const valeur = element[cle];
    if (!groupes.has(valeur)) groupes.set(valeur, []);
    groupes.get(valeur).push(element);
  }
  return groupes;
}

const livres = [
  { titre: "Dune", genre: "SF" },
  { titre: "Fondation", genre: "SF" },
  { titre: "Germinal", genre: "Roman" },
];
const parGenre = grouperPar(livres, "genre");
console.log([...parGenre.keys()], parGenre.get("SF")?.length); // [ 'SF', 'Roman' ] 2
// grouperPar(livres, "auteur") → erreur : '"auteur"' n'est pas une clé des livres
```

Un `@typedef` peut aussi être générique. C'est ainsi qu'on type le pattern Result du [chapitre 17](../17-erreurs/README.md) :

```js
/**
 * @template T
 * @typedef {{ ok: true, valeur: T } | { ok: false, erreur: Error }} Resultat
 */

/**
 * @param {string} texte
 * @returns {Resultat<unknown>}
 */
function analyserJson(texte) {
  try {
    return { ok: true, valeur: JSON.parse(texte) };
  } catch (erreur) {
    return { ok: false, erreur: /** @type {Error} */ (erreur) };
  }
}

const resultat = analyserJson('{"port": 80}');
// resultat.valeur → erreur : 'valeur' n'existe pas tant que ok n'a pas été testé
if (resultat.ok) {
  console.log(resultat.valeur); // { port: 80 }
} else {
  console.log(resultat.erreur.message);
}
```

TypeScript comprend les **unions discriminées** : après `if (resultat.ok)`, il sait que `resultat` est la variante qui possède `valeur`. Il comprend de la même façon `typeof`, `instanceof`, `Array.isArray` et `in` : c'est le *rétrécissement* (*narrowing*) du type.

## Surcharges avec @overload

Quand le type de retour dépend du type des arguments, `@overload` (TypeScript 5.0) décrit chaque signature dans un bloc séparé, suivi de l'implémentation :

```js
/**
 * @overload
 * @param {string} valeur
 * @returns {string}
 */
/**
 * @overload
 * @param {number} valeur
 * @returns {number}
 */
/**
 * Double une chaîne (répétition) ou un nombre (multiplication).
 * @param {string | number} valeur
 * @returns {string | number}
 */
function doubler(valeur) {
  return typeof valeur === "string" ? valeur.repeat(2) : valeur * 2;
}

console.log(doubler("ha").toUpperCase(), doubler(21).toFixed(1)); // HAHA 42.0
```

Grâce aux surcharges, `doubler("ha")` est de type `string` (et non `string | number`), donc `.toUpperCase()` est accepté sans conversion. Dans TypeScript 7, `@overload` ne s'applique qu'aux déclarations `function`, pas aux fonctions fléchées.

## Documenter une classe

```js
/**
 * @typedef {object} Forme
 * @property {() => number} aire
 */

/**
 * Un rectangle immuable.
 * @implements {Forme}
 */
class Rectangle {
  /** @readonly */
  largeur;
  /** @readonly */
  hauteur;

  /**
   * @param {number} largeur - En centimètres.
   * @param {number} hauteur - En centimètres.
   */
  constructor(largeur, hauteur) {
    this.largeur = largeur;
    this.hauteur = hauteur;
  }

  /** @returns {number} Surface en cm². */
  aire() {
    return this.largeur * this.hauteur;
  }
}

class Carre extends Rectangle {
  /** @param {number} cote */
  constructor(cote) {
    super(cote, cote);
  }

  /** @override */
  aire() {
    return this.largeur ** 2;
  }
}

const formes = [new Rectangle(2, 3), new Carre(4)];
console.log(formes.map((f) => f.aire())); // [ 6, 16 ]
```

| Tag | Effet avec TypeScript |
| --- | --- |
| `@implements {Forme}` | vérifie que la classe possède bien les membres de `Forme` |
| `@readonly` | interdit la réaffectation hors du constructeur (vérification uniquement) |
| `@private`, `@protected`, `@public` | restreignent l'accès pendant la vérification, **pas à l'exécution** |
| `@override` | signale une redéfinition ; avec l'option `noImplicitOverride`, TypeScript vérifie que la méthode existe dans la classe parente |
| `@extends {Pile<number>}` | précise le type de la classe parente quand elle est générique |
| `@this {HTMLButtonElement}` | type de `this` dans une fonction ordinaire (écouteur d'événement…) |

> [!TIP]
> Pour la confidentialité réelle, préférez les champs privés `#` du [chapitre 16](../16-classes/README.md) : ils sont garantis par le moteur à l'exécution, et TypeScript les comprend sans aucune annotation. `@private` ne sert plus qu'au code ancien qui utilise la convention `_nom`.

Une classe générique déclare son paramètre de type avec `@template` au-dessus de la classe :

```js
/**
 * Une pile LIFO typée.
 * @template T
 */
class Pile {
  /** @type {T[]} */
  #elements = [];

  /** @param {T} element */
  empiler(element) {
    this.#elements.push(element);
  }

  /** @returns {T | undefined} */
  depiler() {
    return this.#elements.pop();
  }
}

/** @type {Pile<string>} */
const historique = new Pile();
historique.empiler("/accueil");
historique.empiler("/panier");
console.log(historique.depiler()); // /panier
// historique.empiler(42) → erreur : 'number' n'est pas attribuable à 'string'
```

## Vérifier les types avec TypeScript

Tout ce qui précède devient réellement utile quand **TypeScript vérifie** le code. Le compilateur TypeScript sait analyser des fichiers `.js` : il infère les types qu'il peut, lit ceux des commentaires JSDoc, et signale les incohérences. Votre code reste du JavaScript standard, exécuté tel quel par le navigateur ou Node.js.

### Fichier par fichier : // @ts-check

Ajoutez `// @ts-check` en **première ligne** d'un fichier : VS Code le vérifie immédiatement, sans rien installer.

```js
// @ts-check

/**
 * @param {number} prixHt
 * @param {number} [taux=0.2]
 * @returns {number}
 */
function prixTtc(prixHt, taux = 0.2) {
  return Math.round(prixHt * (1 + taux));
}

prixTtc("1000"); // ❌ L'argument de type 'string' n'est pas attribuable au paramètre de type 'number'.

/**
 * @param {object} options
 * @param {string} options.titre
 * @param {"info" | "succes" | "erreur"} [options.niveau]
 */
function notifier({ titre, niveau = "info" }) {
  return `[${niveau}] ${titre}`;
}

notifier({ titre: "Enregistré", niveau: "succès" }); // ❌ Le type '"succès"' ne peut pas être attribué au type '"erreur" | "info" | "succes" | undefined'. Voulez-vous dire '"succes"'?
notifier({ niveau: "info" }); // ❌ La propriété 'titre' est absente du type '{ niveau: "info"; }' mais obligatoire dans le type '{ titre: string; niveau?: "erreur" | "info" | "succes" | undefined; }'.

console.log(prixTtc(1000)); // 1200
```

Ce code **s'exécute** sans erreur (JavaScript convertit `"1000"` en nombre, et la notification s'affiche avec un niveau inconnu) : c'est justement le problème. Sans vérification, ces bogues passent inaperçus jusqu'à ce qu'un utilisateur les rencontre. Les messages ci-dessus sont ceux de TypeScript en français, tels que VS Code les affiche quand il est configuré en français (en ligne de commande : `tsc --locale fr`).

### Pour tout le projet : jsconfig.json

Plutôt que d'ajouter `// @ts-check` partout, placez un fichier `jsconfig.json` à la racine du projet. C'est un `tsconfig.json` dans lequel `allowJs` est implicitement activé :

```json
{
  "compilerOptions": {
    "checkJs": true,
    "noEmit": true,
    "strict": true,
    "target": "es2024",
    "module": "nodenext",
    "types": ["node"]
  },
  "include": ["src"]
}
```

| Option | Rôle |
| --- | --- |
| `checkJs` | vérifie tous les fichiers `.js` inclus (un fichier peut s'exclure avec `// @ts-nocheck`) |
| `noEmit` | TypeScript vérifie, mais ne produit aucun fichier |
| `strict` | active les vérifications strictes, notamment `null`/`undefined` et les paramètres sans type (`any` implicite). C'est la valeur par défaut depuis TypeScript 7, l'écrire rend la configuration explicite |
| `target`, `module` | version de JavaScript et système de modules du projet (`nodenext` pour Node.js, `esnext` avec `"moduleResolution": "bundler"` pour un projet Vite) |
| `types` | paquets de types globaux à charger. Depuis TypeScript 7, la liste est vide par défaut : sans `"node"`, `process` ou `node:fs` sont inconnus |
| `include` | fichiers à analyser |

Pour un projet Node.js, installez TypeScript et les types de Node en dépendances de développement, puis ajoutez un script :

```bash
npm install --save-dev typescript @types/node
npx tsc -p jsconfig.json
```

```json
{
  "scripts": {
    "typecheck": "tsc -p jsconfig.json"
  }
}
```

`npm run typecheck` affiche les erreurs et se termine avec un code non nul s'il y en a : il suffit de l'ajouter à votre intégration continue, à côté du linter et des tests (voir le [chapitre 28](../28-outillage/README.md)). Avec un `tsconfig.json` plutôt qu'un `jsconfig.json`, ajoutez `"allowJs": true` et lancez simplement `npx tsc`.

> [!NOTE]
> **TypeScript 7.0** (juillet 2026) est une réécriture du compilateur en Go, nettement plus rapide (jusqu'à environ 10 fois selon l'équipe de TypeScript). Il s'installe toujours avec `npm install typescript` et fournit la même commande `tsc` (version 7.0.2 en novembre 2026). Il ne fournit pas encore d'API de programmation : certains outils qui s'appuient sur elle (TypeDoc, par exemple) restent pour l'instant sur TypeScript 6.

### Un premier projet vérifié

```js
// @ts-check
import { readFile } from "node:fs/promises";

/**
 * Lit un fichier JSON de configuration.
 * @param {string} chemin
 * @returns {Promise<Record<string, unknown>>}
 */
async function lireJson(chemin) {
  return JSON.parse(await readFile(chemin, "utf8"));
}

/**
 * @param {Record<string, unknown>} config
 * @returns {number}
 */
function lirePort(config) {
  const port = config.port; // type unknown : il faut le vérifier avant usage
  if (typeof port !== "number" || !Number.isInteger(port)) {
    throw new TypeError(`port doit être un entier, reçu : ${String(port)}`);
  }
  return port; // ici, TypeScript sait que port est un number
}

console.log(lirePort({ port: 8080 })); // 8080
console.log(await lireJson("absent.json").catch((erreur) => erreur.code)); // ENOENT
```

Le type `unknown` oblige à **vérifier avant d'utiliser** : écrire `config.port.toFixed()` serait refusé. C'est exactement le comportement voulu pour une donnée externe (fichier, réponse d'API) : la vérification de types vous pousse à la [valider aux frontières](../17-erreurs/README.md).

### Faire taire une erreur : @ts-expect-error plutôt que @ts-ignore

| Directive | Effet |
| --- | --- |
| `// @ts-expect-error explication` | ignore l'erreur de la ligne suivante, **et signale une erreur s'il n'y en a pas** |
| `// @ts-ignore` | ignore l'erreur de la ligne suivante, silencieusement et pour toujours |
| `// @ts-nocheck` (en tête de fichier) | désactive la vérification du fichier |

Préférez `@ts-expect-error` : le jour où le problème est corrigé (mise à jour d'une bibliothèque…), TypeScript vous signale que la directive est devenue inutile. Dans les deux cas, ajoutez une explication.

Le cas d'usage typique est un test qui vérifie volontairement le comportement avec un argument invalide :

```js
// @ts-check

/** @param {number} n */
function carre(n) {
  if (typeof n !== "number") throw new TypeError("n doit être un nombre");
  return n * n;
}

try {
  // @ts-expect-error -- argument invalide volontaire : on teste la validation à l'exécution
  carre("3");
} catch (erreur) {
  // En mode strict, la variable d'un catch est de type unknown : on la vérifie avant usage
  if (erreur instanceof TypeError) console.log(erreur.message); // n doit être un nombre
}
```

### Ce qui change avec TypeScript 7

TypeScript 7 a revu l'analyse du JavaScript pour la rapprocher de celle des fichiers `.ts`. Plusieurs motifs hérités du Closure Compiler ne fonctionnent plus :

| Ne fonctionne plus | Écrire à la place |
| --- | --- |
| `@enum` | un objet gelé et `@typedef {(typeof X)[keyof typeof X]} X` ([voir plus haut](#énumérations--un-objet-gelé-et-une-union)) |
| `{function(string): void}` | `{(texte: string) => void}` |
| `{?}`, `{*}` pour « n'importe quoi » | `{any}` ou, mieux, `{unknown}` |
| `{!Article}` (non nullable) | `{Article}` |
| une valeur utilisée comme type (`@param {config}`) | `{typeof config}` |
| fonction constructeur + `@class` / `@constructor` | une vraie `class` |
| `@overload` sur une fonction fléchée | une déclaration `function`, ou un `@type` avec plusieurs signatures |

Si vous suivez la syntaxe présentée dans ce chapitre, vous n'êtes pas concerné.

## IntelliSense dans VS Code

VS Code utilise TypeScript pour analyser le JavaScript, **même sans aucune configuration**. JSDoc enrichit directement :

- l'**infobulle** au survol d'une fonction : signature, résumé, description de chaque paramètre, exemple ;
- l'**aide à la saisie** des paramètres (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Maj</kbd>+<kbd>Espace</kbd>) : le paramètre en cours est mis en évidence avec sa description ;
- l'**autocomplétion** : les propriétés d'un `@typedef`, les valeurs possibles d'une union de chaînes (`"info" | "succes" | "erreur"`) ;
- la **navigation** : « Atteindre la définition » (<kbd>F12</kbd>) fonctionne aussi sur les types `@typedef` et `@import` ;
- le **renommage** sûr (<kbd>F2</kbd>) qui met à jour les noms dans les commentaires `@param`.

Quelques réglages et réflexes :

- Tapez `/**` puis <kbd>Entrée</kbd> au-dessus d'une fonction : VS Code génère le squelette avec un `@param` par paramètre.
- Le réglage `"js/ts.implicitProjectConfig.checkJs": true` active la vérification pour les fichiers `.js` qui n'appartiennent à aucun projet (`jsconfig.json`/`tsconfig.json`).
- Les bibliothèques sans types intégrés reçoivent ceux du dépôt communautaire DefinitelyTyped (`@types/nom`), que VS Code télécharge automatiquement pour l'autocomplétion (*Automatic Type Acquisition*). Pour la vérification en ligne de commande, installez-les vous-même : `npm install --save-dev @types/nom`.
- L'erreur affichée au survol d'un soulignement rouge est la même que celle de `tsc` : lisez-la de haut en bas, la dernière ligne indentée est souvent la plus précise.

## Générer une documentation

Pour une bibliothèque, un site de documentation de référence se génère à partir des mêmes commentaires.

### TypeDoc

[TypeDoc](https://typedoc.org/) est l'outil le plus utilisé aujourd'hui. Conçu pour TypeScript, il documente aussi un projet JavaScript dès lors que `allowJs` (ou un `jsconfig.json`) est configuré, et il comprend la syntaxe de types moderne de ce chapitre :

```bash
npm install --save-dev typedoc typescript@6
npx typedoc src/index.js
```

La commande produit un site HTML dans `docs/` : une page par fonction et par type, avec les descriptions, les paramètres, les exemples et les liens `{@link}`. Les options utiles : `--out` (dossier de sortie), `--readme` (page d'accueil), et le greffon `typedoc-plugin-markdown` pour produire du Markdown plutôt que du HTML.

> [!NOTE]
> En novembre 2026, TypeDoc 0.28 s'appuie sur l'API de TypeScript, versions 5.0 à 6.0, d'où l'installation de `typescript@6` ci-dessus : TypeScript 7 n'a pas encore d'API. Vérifiez la [page de compatibilité](https://typedoc.org/) avant d'installer.

### L'outil historique : JSDoc

Le générateur d'origine, `jsdoc` (version 4), fonctionne toujours (`npx jsdoc src -r -d docs`), mais son analyseur de types ne comprend que l'ancienne syntaxe Closure : un type comme `{(a: Article) => boolean}` provoque une erreur « Unable to parse a tag's type expression ». Réservez-le aux projets anciens. Les générateurs `documentation.js` et ESDoc ne sont plus activement maintenus.

### Faire respecter la documentation : eslint-plugin-jsdoc

L'ancienne règle `valid-jsdoc` d'ESLint a été supprimée. Le greffon `eslint-plugin-jsdoc` la remplace : il vérifie que chaque paramètre est documenté, que les noms correspondent à la signature, que les tags existent, etc.

<!-- no-run -->
```js
// eslint.config.js
import jsdoc from "eslint-plugin-jsdoc";

export default [
  // règles recommandées, adaptées au JavaScript annoté avec la syntaxe TypeScript
  jsdoc.configs["flat/recommended-typescript-flavor"],
  {
    files: ["src/**/*.js"],
    rules: {
      "jsdoc/require-description": "warn",
    },
  },
];
```

### Le cas des frameworks

Les mêmes techniques s'appliquent aux composants. Par exemple, les propriétés d'un composant React écrit en `.jsx` se décrivent avec un `@typedef` :

```jsx
/**
 * @typedef {object} BoutonProps
 * @property {"principal" | "secondaire"} [variante="principal"]
 * @property {boolean} [desactive=false]
 * @property {() => void} onClick
 * @property {import("react").ReactNode} children
 */

/** @param {BoutonProps} props */
export function Bouton({ variante = "principal", desactive = false, onClick, children }) {
  return (
    <button className={`btn btn-${variante}`} disabled={desactive} onClick={onClick}>
      {children}
    </button>
  );
}
```

Vue, Svelte et Angular ont leurs propres mécanismes de typage des composants : reportez-vous à leur documentation. À la sortie de TypeScript 7.0 (juillet 2026), la vérification des gabarits Vue, Svelte, Astro et Angular dans l'éditeur n'était pas encore possible avec TypeScript 7, faute d'API : l'équipe de TypeScript conseillait de rester sur TypeScript 6 pour ces projets. Vérifiez l'état actuel dans la documentation de votre framework.

## JSDoc ou TypeScript ?

Les deux reposent sur le même vérificateur : la question est **où écrire les types**.

| Critère | JavaScript + JSDoc | TypeScript (`.ts`) |
| --- | --- | --- |
| Étape de compilation | aucune : le code livré est le code écrit | nécessaire pour le navigateur (bundler, `tsc`) ; Node.js exécute le `.ts` directement en effaçant les types |
| Concision des types | verbeuse, surtout pour les génériques et les surcharges | concise |
| Expressivité | quasi complète (tout type TypeScript est utilisable) | complète (`interface`, `enum`, modificateurs d'accès…) |
| Adoption progressive | fichier par fichier, sans rien changer | renommage des fichiers, configuration |
| Pour qui ? | scripts, bibliothèques qui veulent livrer du JS pur, projets existants, équipes qui débutent | applications de taille moyenne ou grande, équipes à l'aise avec les types |

Une voie médiane fréquente : du JavaScript annoté en JSDoc, avec les types complexes regroupés dans des fichiers `.d.ts` importés par `@import`. Et si une bibliothèque JavaScript doit publier des types pour ses utilisateurs, TypeScript les génère à partir du JSDoc :

```bash
npx tsc -p jsconfig.json --noEmit false --declaration --emitDeclarationOnly --rootDir src --outDir types
```

Depuis Node.js 22.18 et 23.6, Node exécute directement les fichiers `.ts` qui n'utilisent que de la syntaxe « effaçable » (fonctionnalité stable depuis Node.js 24.12 et 25.2) ; il ne vérifie pas les types pour autant, `tsc --noEmit` reste nécessaire. Voir le [chapitre 27](../27-nodejs/README.md).

## Pièges courants

| Piège | Conséquence | Correction |
| --- | --- | --- |
| Un commentaire `/* … */` (une seule étoile) au lieu de `/** … */` | ignoré par JSDoc, l'éditeur et TypeScript | deux étoiles à l'ouverture |
| Un bloc JSDoc séparé de la fonction par une autre instruction ou un commentaire | le bloc n'est rattaché à rien | le placer juste au-dessus de la déclaration |
| Nom de `@param` différent du paramètre réel (après un renommage) | documentation fausse ; avec `checkJs`, erreur | renommer avec <kbd>F2</kbd> ; `eslint-plugin-jsdoc` le détecte |
| `@type {X}` suivi d'une expression **sans parenthèses** | la conversion de type ne s'applique pas | `/** @type {X} */ (expression)` |
| Croire que `@private` ou `@readonly` protège à l'exécution | le code tourne quand même | champs `#privés`, `Object.freeze` |
| Abuser de `any` ou de `@ts-ignore` | la vérification ne sert plus à rien | `unknown` + vérification, `@ts-expect-error` justifié |
| Syntaxe Closure (`function(…)`, `@enum`, `?`) | rejetée ou ignorée par TypeScript 7 | syntaxe TypeScript |
| `@example` faux ou périmé | trompe tous les lecteurs | des exemples courts, idéalement repris d'un test |
| Oublier `"types": ["node"]` avec TypeScript 7 | `process`, `node:fs`… inconnus | ajouter `@types/node` et `"types": ["node"]` |
| Documenter chaque ligne privée | bruit, maintenance | documenter l'interface publique ; commenter l'intérieur seulement quand c'est utile |

## Bonnes pratiques

- Commentez le **pourquoi** ; améliorez les noms et la structure avant d'ajouter un commentaire.
- Supprimez le code commenté et les commentaires périmés : un commentaire faux est pire qu'aucun.
- Rendez les `TODO`/`FIXME` actionnables (ticket, responsable) et justifiez chaque directive de désactivation.
- Documentez en JSDoc toute fonction **exportée** : résumé d'une ligne, paramètres, retour, erreurs possibles, un exemple pour les fonctions non triviales.
- Écrivez les types avec la syntaxe TypeScript, nommez les types réutilisés avec `@typedef`, partagez-les avec `@import`.
- Activez `checkJs` et `strict` dans un `jsconfig.json`, et lancez `tsc` en intégration continue.
- Préférez `unknown` à `any`, `@ts-expect-error` à `@ts-ignore`, `#privé` à `@private`, `@satisfies` à `@type` quand vous voulez garder le type précis.
- Générez la documentation d'une bibliothèque avec TypeDoc, et gardez les exemples exacts (idéalement repris des tests).

## Résumé

- Trois formes : `//`, `/* … */`, et `/** … */` pour JSDoc. Les commentaires de bloc ne s'imbriquent pas ; JSON n'accepte aucun commentaire.
- Un bon commentaire explique une intention, une contrainte, une décision ou une unité ; le code commenté et la paraphrase sont à proscrire.
- Certains commentaires sont des directives pour les outils (`@ts-check`, `eslint-disable-next-line`, `sourceMappingURL`, `@__PURE__`).
- JSDoc : résumé, description en Markdown, tags (`@param`, `@returns`, `@throws`, `@example`, `@deprecated`, `@see`, `{@link}`).
- Les types JSDoc utilisent la syntaxe TypeScript ; `@typedef`, `@callback`, `@import`, `@template`, `@overload`, `@satisfies` et les tags de classe couvrent l'essentiel de TypeScript.
- `// @ts-check` ou un `jsconfig.json` avec `checkJs` font vérifier le JavaScript par TypeScript ; `tsc -p jsconfig.json` s'intègre à la CI. TypeScript 7 (2026) est `strict` par défaut, n'accepte plus `@enum` ni la syntaxe Closure et ne charge plus les types globaux automatiquement (`"types": ["node"]`).
- VS Code exploite JSDoc pour les infobulles, l'autocomplétion et la navigation ; TypeDoc génère un site de documentation.

## Exercices

### Exercice 1 — Nettoyer des commentaires (★☆☆)

Réécrivez ce code : supprimez les commentaires inutiles, gardez ou reformulez ceux qui apportent quelque chose, et améliorez les noms pour qu'il en faille le moins possible.

```js
// fonction qui calcule
function calc(l) {
  // total à 0
  let t = 0;
  // on parcourt la liste
  for (const x of l) {
    // ajoute le prix fois la quantité
    t += x.p * x.q;
  }
  // t / 100 car en centimes
  return t / 100;
  // return t;
}

console.log(calc([{ p: 1250, q: 2 }])); // 25
```

<details>
<summary>Solution</summary>

```js
/**
 * Calcule le total d'un panier en euros.
 * @param {{ prixCentimes: number, quantite: number }[]} lignes
 * @returns {number}
 */
function totalEnEuros(lignes) {
  // Les prix sont stockés en centimes (entiers) pour éviter les erreurs d'arrondi :
  // la conversion en euros n'a lieu qu'à la fin.
  const totalCentimes = lignes.reduce((somme, ligne) => somme + ligne.prixCentimes * ligne.quantite, 0);
  return totalCentimes / 100;
}

console.log(totalEnEuros([{ prixCentimes: 1250, quantite: 2 }])); // 25
```

- Les commentaires « total à 0 », « on parcourt la liste », « ajoute le prix… » paraphrasaient le code : ils disparaissent.
- Le code mort `// return t;` est supprimé (Git le conserve si besoin).
- Le seul commentaire utile, l'unité en centimes, est reformulé pour expliquer **pourquoi**.
- Les noms `calc`, `l`, `t`, `x.p`, `x.q` sont remplacés par des noms explicites, et `reduce` exprime directement l'intention « additionner ».

</details>

### Exercice 2 — Documenter une fonction (★☆☆)

Écrivez et documentez en JSDoc `formaterPrix(centimes, devise, locale)` : `devise` vaut `"EUR"` par défaut et `locale` `"fr-FR"`. La fonction lance une `TypeError` si `centimes` n'est pas un entier. Ajoutez un `@example` exact.

<details>
<summary>Solution</summary>

```js
/**
 * Formate un montant exprimé en centimes selon les conventions d'une locale.
 *
 * @param {number} centimes - Montant entier en centimes (1999 pour 19,99).
 * @param {string} [devise="EUR"] - Code de devise ISO 4217.
 * @param {string} [locale="fr-FR"] - Locale BCP 47 utilisée pour le format.
 * @returns {string} Le montant formaté, symbole de la devise compris.
 * @throws {TypeError} Si `centimes` n'est pas un entier.
 * @example
 * formaterPrix(1999); // "19,99 €"
 * formaterPrix(1999, "USD", "en-US"); // "$19.99"
 */
function formaterPrix(centimes, devise = "EUR", locale = "fr-FR") {
  if (!Number.isInteger(centimes)) {
    throw new TypeError(`centimes doit être un entier, reçu : ${centimes}`);
  }
  return new Intl.NumberFormat(locale, { style: "currency", currency: devise }).format(centimes / 100);
}

console.log(formaterPrix(1999)); // 19,99 €
console.log(formaterPrix(1999, "USD", "en-US")); // $19.99
```

Les crochets `[devise="EUR"]` signalent à la fois le caractère facultatif et la valeur par défaut. Le `@throws` documente le contrat, et l'exemple a été vérifié en l'exécutant (dans la sortie française, l'espace avant `€` est une espace insécable, U+00A0).

</details>

### Exercice 3 — Typer un petit module (★★☆)

Définissez avec `@typedef` un type `Tache` (`id` : nombre, `titre` : chaîne, `priorite` : `"basse"`, `"normale"` ou `"haute"`, `echeance` : `Date` facultative). Écrivez puis documentez `tachesUrgentes(taches, maintenant)` qui renvoie les titres des tâches de priorité haute **ou** dont l'échéance est dans moins de 24 h, triées par échéance (sans échéance en dernier).

<details>
<summary>Solution</summary>

```js
// @ts-check

/** @typedef {"basse" | "normale" | "haute"} Priorite */

/**
 * @typedef {object} Tache
 * @property {number} id
 * @property {string} titre
 * @property {Priorite} priorite
 * @property {Date} [echeance] - Facultative.
 */

const UN_JOUR_MS = 24 * 60 * 60 * 1000;

/**
 * Sélectionne les tâches à traiter en priorité.
 * @param {Tache[]} taches
 * @param {Date} [maintenant=new Date()] - Paramètre injectable pour les tests.
 * @returns {string[]} Les titres, des échéances les plus proches aux plus lointaines.
 */
function tachesUrgentes(taches, maintenant = new Date()) {
  /** @param {Tache} tache */
  const estProche = (tache) =>
    tache.echeance !== undefined && tache.echeance.getTime() - maintenant.getTime() < UN_JOUR_MS;

  return taches
    .filter((tache) => tache.priorite === "haute" || estProche(tache))
    .toSorted((a, b) => (a.echeance?.getTime() ?? Infinity) - (b.echeance?.getTime() ?? Infinity))
    .map((tache) => tache.titre);
}

const maintenant = new Date("2026-11-06T09:00:00Z");
/** @type {Tache[]} */
const taches = [
  { id: 1, titre: "Préparer la démo", priorite: "haute" },
  { id: 2, titre: "Payer la facture", priorite: "normale", echeance: new Date("2026-11-06T17:00:00Z") },
  { id: 3, titre: "Ranger le bureau", priorite: "basse", echeance: new Date("2026-11-20T09:00:00Z") },
  { id: 4, titre: "Corriger le bogue #398", priorite: "haute", echeance: new Date("2026-11-08T09:00:00Z") },
];

console.log(tachesUrgentes(taches, maintenant)); // [ 'Payer la facture', 'Corriger le bogue #398', 'Préparer la démo' ]
```

`Priorite` est extrait dans son propre `@typedef` : on pourra le réutiliser (filtres, formulaires). Le paramètre `maintenant` rend la fonction déterministe et donc testable. Remplacer `Infinity` par `0` mettrait les tâches sans échéance en premier.

</details>

### Exercice 4 — Prévoir les erreurs de TypeScript (★★☆)

Sans lancer TypeScript, trouvez les trois lignes que `// @ts-check` signalera, et expliquez pourquoi. Vérifiez ensuite dans VS Code ou avec `npx tsc --noEmit --allowJs --checkJs --locale fr fichier.js`.

<!-- no-run -->
```js
// @ts-check

/**
 * @typedef {object} Livre
 * @property {string} titre
 * @property {number} annee
 * @property {string[]} auteurs
 */

/** @param {Livre} livre */
function citer(livre) {
  return `${livre.auteurs.join(", ")} (${livre.annee}). ${livre.titre}.`;
}

/** @type {Livre} */
const dune = { titre: "Dune", annee: "1965", auteurs: ["Frank Herbert"] };

console.log(citer(dune));
console.log(citer({ titre: "Fondation", annee: 1951, auteur: ["Isaac Asimov"] }));
console.log(dune.editeur);
```

<details>
<summary>Solution</summary>

TypeScript signale :

1. `annee: "1965"` : `Impossible d'assigner le type 'string' au type 'number'.` L'année a été saisie entre guillemets.
2. `auteur: [...]` : `Un littéral d'objet peut uniquement spécifier des propriétés connues, mais 'auteur' n'existe pas dans le type 'Livre'. Est-ce que vous avez voulu écrire 'auteurs' ?` Une faute de frappe, que TypeScript devine.
3. `dune.editeur` : `La propriété 'editeur' n'existe pas sur le type 'Livre'.`

Le plus instructif est le deuxième cas : sans vérification, ce code **plante** à l'exécution (`livre.auteurs` vaut `undefined`, donc `.join` lance une `TypeError`). Le troisième n'aurait jamais planté, mais aurait affiché `undefined` sans prévenir. Une fois les trois lignes corrigées :

```js
// @ts-check

/**
 * @typedef {object} Livre
 * @property {string} titre
 * @property {number} annee
 * @property {string[]} auteurs
 * @property {string} [editeur]
 */

/** @param {Livre} livre */
function citer(livre) {
  return `${livre.auteurs.join(", ")} (${livre.annee}). ${livre.titre}.`;
}

/** @type {Livre} */
const dune = { titre: "Dune", annee: 1965, auteurs: ["Frank Herbert"] };

console.log(citer(dune)); // Frank Herbert (1965). Dune.
console.log(citer({ titre: "Fondation", annee: 1951, auteurs: ["Isaac Asimov"] })); // Isaac Asimov (1951). Fondation.
console.log(dune.editeur ?? "éditeur inconnu"); // éditeur inconnu
```

</details>

### Exercice 5 — Une fonction générique (★★☆)

Écrivez et typez avec `@template` la fonction `indexerPar(elements, cle)` qui renvoie un objet dont les clés sont les valeurs de la propriété `cle` (des chaînes) et les valeurs, les éléments eux-mêmes. Le type de retour doit conserver le type des éléments : `indexerPar(produits, "sku").ABC.prix` doit être reconnu comme un nombre.

<details>
<summary>Solution</summary>

```js
// @ts-check

/**
 * Indexe des éléments par une propriété dont la valeur est une chaîne unique.
 * En cas de doublon, le dernier élément l'emporte.
 * @template {Record<K, string>} T
 * @template {PropertyKey} K
 * @param {T[]} elements
 * @param {K} cle
 * @returns {Record<string, T>}
 */
function indexerPar(elements, cle) {
  return Object.fromEntries(elements.map((element) => [element[cle], element]));
}

const produits = [
  { sku: "ABC", nom: "Clavier", prix: 4990 },
  { sku: "XYZ", nom: "Souris", prix: 2490 },
];

const parSku = indexerPar(produits, "sku");
console.log(parSku.ABC.prix + parSku.XYZ.prix); // 7480
// indexerPar(produits, "prix") → erreur : la propriété 'prix' n'est pas une chaîne
```

La contrainte `{Record<K, string>} T` exige que la propriété choisie contienne une chaîne : on ne peut pas indexer par `prix`. Le retour `Record<string, T>` conserve le type des éléments, d'où l'autocomplétion de `.prix`. Pour des clés réellement imprévisibles, `Record<string, T | undefined>` serait plus honnête (une clé absente renvoie `undefined`), ou activez l'option `noUncheckedIndexedAccess`.

</details>

### Exercice 6 — Des formes et une vérification exhaustive (★★★)

Définissez un type `Forme`, union discriminée par `type` : cercle (`rayon`), rectangle (`largeur`, `hauteur`) et triangle (`base`, `hauteur`). Écrivez `aire(forme)` avec un `switch`. Faites en sorte que TypeScript signale une erreur si l'on ajoute une nouvelle forme au type sans la traiter dans `aire`.

<details>
<summary>Solution</summary>

```js
// @ts-check

/**
 * @typedef {{ type: "cercle", rayon: number }
 *   | { type: "rectangle", largeur: number, hauteur: number }
 *   | { type: "triangle", base: number, hauteur: number }} Forme
 */

/**
 * @param {Forme} forme
 * @returns {number}
 */
function aire(forme) {
  switch (forme.type) {
    case "cercle":
      return Math.PI * forme.rayon ** 2;
    case "rectangle":
      return forme.largeur * forme.hauteur;
    case "triangle":
      return (forme.base * forme.hauteur) / 2;
    default: {
      /** @type {never} */
      const impossible = forme; // erreur de type si un cas n'est pas traité
      throw new Error(`Forme inconnue : ${JSON.stringify(impossible)}`);
    }
  }
}

/** @type {Forme[]} */
const formes = [
  { type: "cercle", rayon: 1 },
  { type: "rectangle", largeur: 2, hauteur: 3 },
  { type: "triangle", base: 4, hauteur: 5 },
];
console.log(formes.map((f) => aire(f).toFixed(2))); // [ '3.14', '6.00', '10.00' ]
```

Dans chaque `case`, TypeScript **rétrécit** le type : après `case "cercle"`, `forme.rayon` est accessible, mais `forme.largeur` serait refusé. Dans le `default`, tous les cas ont été traités : il ne reste « rien », le type `never`. Si l'on ajoute `{ type: "losange", d1: number, d2: number }` à l'union sans nouveau `case`, `forme` n'est plus `never` dans le `default`, et TypeScript signale : `Impossible d'assigner le type '{ type: "losange"; d1: number; d2: number; }' au type 'never'.` L'oubli est détecté avant même d'exécuter le code. Le `throw` protège en plus contre des données invalides à l'exécution (JSON externe).

</details>

### Exercice 7 — Mettre un projet sous vérification (★★★)

Dans un nouveau dossier, créez un projet Node.js (`"type": "module"`) avec un fichier `src/stats.js` qui exporte `moyenne(nombres)` et `mediane(nombres)` documentées en JSDoc. Ajoutez un `jsconfig.json` et un script `npm run typecheck`. Introduisez volontairement un appel `moyenne("1,2,3")` et vérifiez que le script échoue, puis corrigez.

<details>
<summary>Solution</summary>

```bash
mkdir stats && cd stats
npm init -y
npm pkg set type=module scripts.typecheck="tsc -p jsconfig.json"
npm install --save-dev typescript @types/node
```

`jsconfig.json` :

```json
{
  "compilerOptions": {
    "checkJs": true,
    "noEmit": true,
    "strict": true,
    "target": "es2024",
    "module": "nodenext",
    "types": ["node"]
  },
  "include": ["src"]
}
```

`src/stats.js` :

```js
/**
 * Moyenne arithmétique.
 * @param {number[]} nombres - Tableau non vide.
 * @returns {number}
 * @throws {RangeError} Si le tableau est vide.
 */
export function moyenne(nombres) {
  if (nombres.length === 0) throw new RangeError("La moyenne d'un tableau vide n'est pas définie");
  return nombres.reduce((somme, n) => somme + n, 0) / nombres.length;
}

/**
 * Médiane (moyenne des deux valeurs centrales si la taille est paire).
 * @param {number[]} nombres - Tableau non vide ; il n'est pas modifié.
 * @returns {number}
 * @throws {RangeError} Si le tableau est vide.
 */
export function mediane(nombres) {
  if (nombres.length === 0) throw new RangeError("La médiane d'un tableau vide n'est pas définie");
  const tries = nombres.toSorted((a, b) => a - b);
  const milieu = Math.floor(tries.length / 2);
  return tries.length % 2 === 0 ? (tries[milieu - 1] + tries[milieu]) / 2 : tries[milieu];
}

console.log(moyenne([12, 15, 9]), mediane([12, 15, 9, 20])); // 12 13.5
```

En ajoutant `console.log(moyenne("1,2,3"));`, `npm run typecheck` affiche :

```text
src/stats.js(26,21): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number[]'.
```

et se termine avec le code 1 : l'intégration continue échouerait. Sans vérification, l'erreur n'apparaîtrait qu'à l'exécution de cette ligne (`TypeError: nombres.reduce is not a function`), c'est-à-dire peut-être en production ; TypeScript la signale **avant**. Remarquez aussi `toSorted` (ES2023) : `sort` aurait modifié le tableau de l'appelant, contrairement à ce que promet la documentation.

</details>

## Pour aller plus loin

- [TypeScript — Types JSDoc reconnus](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) : la référence de tous les tags
- [TypeScript — JS Projects Utilizing TypeScript](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html) et [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)
- [Annonce de TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) (changements pour le JavaScript)
- [VS Code — Working with JavaScript](https://code.visualstudio.com/docs/nodejs/working-with-javascript)
- [TypeDoc](https://typedoc.org/) · [eslint-plugin-jsdoc](https://github.com/gajus/eslint-plugin-jsdoc) · [JSDoc (jsdoc.app)](https://jsdoc.app/)
- [MDN — Commentaires](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Lexical_grammar#commentaires)

---

[← Tests](../29-tests/README.md) · [Sommaire](../README.md#sommaire) · [Aide-mémoire →](../31-aide-memoire/README.md)
