# 07 — Chaînes de caractères

> **Niveau** : Débutant à intermédiaire · **Durée** : ~3 h · **Prérequis** : [Types et opérateurs](../03-types-et-operateurs/README.md), [Fonctions](../06-fonctions/README.md)

Noms, messages, adresses, URL, contenus saisis par les utilisateurs : presque tout programme manipule du texte. Ce chapitre montre comment créer, inspecter, découper, transformer et comparer des chaînes, sans se faire piéger par Unicode (émojis, accents) ni par les règles propres à chaque langue. Les expressions régulières, très liées aux chaînes, ont leur propre chapitre : [14 — Expressions régulières](../14-regex/README.md).

## Objectifs

- Écrire des chaînes avec les trois syntaxes de littéraux et les séquences d'échappement.
- Expliquer pourquoi `"😀".length` vaut `2` et compter les caractères réellement visibles avec `Intl.Segmenter`.
- Rechercher, extraire et transformer du texte avec les méthodes modernes (`at`, `slice`, `includes`, `replaceAll`, `padStart`…).
- Comparer et trier des chaînes selon les règles d'une langue avec `localeCompare` et `Intl.Collator`.
- Normaliser du texte (accents, espaces, casse) avant de le comparer ou de le stocker.
- Encoder du texte en base64 sans abîmer les caractères non ASCII.
- Écrire des utilitaires robustes : slug, troncature, masquage d'adresse e-mail.

## Sommaire

- [Créer une chaîne](#créer-une-chaîne)
- [Immutabilité](#immutabilité)
- [Accéder aux caractères](#accéder-aux-caractères)
- [Longueur et Unicode](#longueur-et-unicode)
- [Rechercher dans une chaîne](#rechercher-dans-une-chaîne)
- [Extraire une partie](#extraire-une-partie)
- [Transformer](#transformer)
- [Comparer et trier](#comparer-et-trier)
- [Chaînes brutes avec String.raw](#chaînes-brutes-avec-stringraw)
- [Formater une liste avec Intl.ListFormat](#formater-une-liste-avec-intllistformat)
- [Encoder en base64](#encoder-en-base64)
- [Recettes](#recettes)
- [Récapitulatif des méthodes](#récapitulatif-des-méthodes)
- [Pièges courants](#pièges-courants)
- [Bonnes pratiques](#bonnes-pratiques)
- [Résumé](#résumé)
- [Exercices](#exercices)
- [Pour aller plus loin](#pour-aller-plus-loin)

> [!NOTE]
> Dans les commentaires de résultat, les chaînes sont écrites entre guillemets (`// "café"`) pour les distinguer des nombres, comme sur MDN. La console de Node.js ou du navigateur, elle, affiche le texte sans guillemets.

## Créer une chaîne

### Trois syntaxes de littéraux

Une chaîne (`string`) est une valeur primitive qui contient du texte. On peut l'écrire entre guillemets simples, doubles ou entre accents graves (*backticks*) :

```js
const simple = 'Bonjour';
const double = "Bonjour";
const gabarit = `Bonjour`;

console.log(simple === double && double === gabarit); // true
console.log(typeof double); // "string"
```

Les trois produisent exactement la même valeur. Ce cours suit la convention de Prettier : **guillemets doubles par défaut** (pratique en français, car l'apostrophe n'a pas besoin d'être échappée : `"l'été"`), et accents graves dès qu'on a besoin d'interpolation ou de plusieurs lignes.

### Séquences d'échappement

La barre oblique inverse `\` introduit un caractère spécial :

| Séquence | Signification |
| --- | --- |
| `\n` | saut de ligne |
| `\t` | tabulation |
| `\\` | barre oblique inverse |
| `\"`, `\'`, `` \` `` | guillemet (utile dans une chaîne délimitée par le même guillemet) |
| `\u00E9` | caractère Unicode par son code hexadécimal sur 4 chiffres (ici « é ») |
| `\u{1F680}` | n'importe quel point de code, de 1 à 6 chiffres (ES2015) |
| `\x41` | caractère sur 2 chiffres hexadécimaux (ici « A ») |

```js
console.log("Chemin : C:\\temp"); // Chemin : C:\temp
console.log("Il a dit : \"oui\""); // Il a dit : "oui"
console.log("caf\u00E9"); // "café"
console.log("\u{1F680} décollage"); // "🚀 décollage"
console.log("Ligne 1\nLigne 2");
// Ligne 1
// Ligne 2
```

> [!TIP]
> Les fichiers texte créés sous Windows terminent souvent leurs lignes par `\r\n` au lieu de `\n`. Pour découper un texte en lignes quelle que soit son origine, utilisez `texte.split(/\r?\n/)` (voir le [chapitre 14](../14-regex/README.md)).

### Les gabarits (template literals)

Les gabarits (ES2015), délimités par des accents graves, acceptent des **expressions** dans `${…}` et s'étendent sur plusieurs lignes :

```js
const prenom = "Inès";
const panier = [12.5, 7.25];

console.log(`Bonjour ${prenom} !`); // "Bonjour Inès !"
console.log(`Total : ${panier[0] + panier[1]} €`); // "Total : 19.75 €"
console.log(`Vous avez ${panier.length} article${panier.length > 1 ? "s" : ""}`); // "Vous avez 2 articles"

const message = `Première ligne
Deuxième ligne`;
console.log(message.includes("\n")); // true
```

Toute expression est permise dans `${…}` : calcul, appel de fonction, ternaire. Gardez-les courtes : au-delà, calculez la valeur dans une variable avant le gabarit.

> [!WARNING]
> Dans un gabarit multiligne, l'indentation fait partie de la chaîne. Si vous indentez les lignes pour aligner le code, ces espaces se retrouvent dans le texte.

Les gabarits **étiquetés** (*tagged templates*, comme `html`…``) sont traités au [chapitre 11](../11-syntaxe-moderne/README.md).

### Convertir une valeur en chaîne

`String(valeur)` est la conversion la plus sûre : elle fonctionne avec toutes les valeurs, y compris `null`, `undefined` et les symboles.

```js
console.log(String(42)); // "42"
console.log(String(null)); // "null"
console.log(String(undefined)); // "undefined"
console.log(String([1, 2, 3])); // "1,2,3"
console.log(String({ a: 1 })); // "[object Object]"
console.log(String(Symbol("id"))); // "Symbol(id)"

// La concaténation et les gabarits échouent avec un symbole
try {
  console.log(`${Symbol("id")}`);
} catch (erreur) {
  console.log(erreur.message); // "Cannot convert a Symbol value to a string"
}
```

`valeur.toString()` fonctionne aussi, sauf sur `null` et `undefined` qui n'ont pas de méthodes (`TypeError`). Les conversions entre nombres et chaînes (`toFixed`, `parseInt`, `Intl.NumberFormat`…) sont détaillées au [chapitre 08](../08-nombres-et-math/README.md).

> [!IMPORTANT]
> N'utilisez jamais `new String("texte")` : cela crée un **objet** qui enveloppe la chaîne, pas une chaîne. `typeof new String("a")` vaut `"object"` et `new String("a") === "a"` vaut `false`.

## Immutabilité

Une chaîne ne peut **jamais** être modifiée. Toutes les méthodes renvoient une **nouvelle** chaîne et laissent l'originale intacte :

```js
let titre = "bonjour";
titre.toUpperCase(); // ❌ le résultat est perdu
console.log(titre); // "bonjour"

titre = titre.toUpperCase(); // ✅ on réaffecte la variable
console.log(titre); // "BONJOUR"
```

Tenter de modifier un caractère par son indice est ignoré en silence dans un script classique, et lève une `TypeError` en mode strict (donc dans tous les modules) :

```js
const animal = "chat";
try {
  animal[0] = "C";
} catch (erreur) {
  console.log(erreur.constructor.name); // "TypeError"
}
console.log(animal); // "chat"

// ✅ On construit une nouvelle chaîne
const avecMajuscule = "C" + animal.slice(1);
console.log(avecMajuscule); // "Chat"
```

Pour assembler des morceaux, utilisez `+`, `+=` ou un gabarit. Construire une chaîne avec `+=` dans une boucle est parfaitement efficace dans les moteurs modernes ; si les morceaux sont déjà dans un tableau, `join` est plus lisible :

```js
const etapes = ["Lire", "Comprendre", "Pratiquer"];

let parcours = "";
for (const etape of etapes) {
  parcours += parcours ? ` → ${etape}` : etape;
}
console.log(parcours); // "Lire → Comprendre → Pratiquer"

console.log(etapes.join(" → ")); // "Lire → Comprendre → Pratiquer"
```

## Accéder aux caractères

Les caractères sont numérotés à partir de `0`. Trois façons de lire l'un d'eux :

```js
const langage = "JavaScript";

console.log(langage[0]); // "J"
console.log(langage.at(0)); // "J"
console.log(langage.at(-1)); // "t" (indice négatif : depuis la fin)
console.log(langage[langage.length - 1]); // "t" (ancienne façon)
console.log(langage.charAt(4)); // "S"
```

`at()` (ES2022) est la façon moderne de lire depuis la fin. Les trois diffèrent quand l'indice est hors limites :

| Expression | Résultat |
| --- | --- |
| `"abc"[5]` | `undefined` |
| `"abc".at(5)` | `undefined` |
| `"abc".charAt(5)` | `""` (chaîne vide) |
| `"abc"[-1]` | `undefined` (les crochets ne comprennent pas les indices négatifs) |
| `"abc".at(-1)` | `"c"` |

Pour parcourir une chaîne, préférez `for…of`, qui avance **point de code par point de code** (la section suivante explique pourquoi c'est important) :

```js
const caracteres = [];
for (const caractere of "Né 🎉") {
  caracteres.push(caractere);
}
console.log(caracteres); // ["N", "é", " ", "🎉"]
```

Chaque caractère a un code numérique :

```js
console.log("A".codePointAt(0)); // 65
console.log("é".codePointAt(0).toString(16)); // "e9"
console.log("😀".codePointAt(0).toString(16)); // "1f600"
console.log(String.fromCodePoint(0x1f600)); // "😀"
console.log(String.fromCodePoint(72, 105)); // "Hi"
```

`charCodeAt` et `String.fromCharCode`, plus anciennes, travaillent sur des unités de code UTF-16 et ne savent pas gérer seules les caractères au-delà de U+FFFF : préférez `codePointAt` et `String.fromCodePoint`.

## Longueur et Unicode

### Trois façons de compter

`length` ne compte pas des « caractères » au sens où un humain l'entend. JavaScript stocke les chaînes en **UTF-16** : chaque caractère occupe une ou deux **unités de code** de 16 bits, et `length` compte ces unités.

- La plupart des caractères (lettres latines, accentuées, grecques, arabes, chinois courants…) tiennent dans **une** unité.
- Les caractères au-delà de U+FFFF (émojis, certains idéogrammes, symboles mathématiques) en occupent **deux** : on parle de **paire de substitution** (*surrogate pair*).
- Ce que l'œil voit comme un seul caractère, un **graphème**, peut combiner plusieurs points de code : une lettre suivie d'un accent combinant, un drapeau (deux lettres régionales), une famille d'émojis reliés par des « liants » invisibles (U+200D).

| Texte | `length` (unités UTF-16) | `[...texte].length` (points de code) | Graphèmes |
| --- | --- | --- | --- |
| `"A"` | 1 | 1 | 1 |
| `"é"` (précomposé, U+00E9) | 1 | 1 | 1 |
| `"é"` (`e` + accent combinant U+0301) | 2 | 2 | 1 |
| `"😀"` | 2 | 1 | 1 |
| `"🇫🇷"` | 4 | 2 | 1 |
| `"👨‍👩‍👧"` | 8 | 5 | 1 |

```js
console.log("😀".length); // 2
console.log([..."😀"].length); // 1
console.log("👨‍👩‍👧".length); // 8
console.log([..."👨‍👩‍👧"].length); // 5
```

L'itération (`for…of`, décomposition `[...texte]`, `Array.from`) découpe par **points de code** : c'est mieux que `length`, mais pas encore ce qu'un humain compte.

### Compter les graphèmes avec Intl.Segmenter

`Intl.Segmenter` (Baseline 2024 : Chrome 87, Safari 14.1, Firefox 125 ; Node.js 16+) découpe un texte en graphèmes, en mots ou en phrases selon les règles Unicode :

```js
const segmenteur = new Intl.Segmenter("fr", { granularity: "grapheme" });

function compterGraphemes(texte) {
  let total = 0;
  for (const _ of segmenteur.segment(texte)) total++;
  return total;
}

console.log(compterGraphemes("Bonjour")); // 7
console.log(compterGraphemes("👨‍👩‍👧🇫🇷é")); // 3
console.log(compterGraphemes("e\u0301")); // 1
```

Le même objet sait découper en mots, ce qui évite de bricoler avec `split(" ")` :

```js
const segmenteurMots = new Intl.Segmenter("fr", { granularity: "word" });
const phrase = "L'été, c'est génial ! 42 fois.";

const mots = Array.from(segmenteurMots.segment(phrase))
  .filter((segment) => segment.isWordLike)
  .map((segment) => segment.segment);

console.log(mots); // ["L'été", "c'est", "génial", "42", "fois"]
console.log(mots.length); // 5
```

Quelle mesure choisir ?

- **Afficher** une limite (« 280 caractères maximum ») ou tronquer un texte : les graphèmes.
- Respecter l'attribut HTML `maxlength` : il compte en unités UTF-16, comme `length`.
- Respecter une limite d'**octets** (colonne de base de données, en-tête HTTP, protocole) : la taille encodée en UTF-8.

```js
const encodeur = new TextEncoder(); // encode en UTF-8
console.log(encodeur.encode("abc").length); // 3
console.log(encodeur.encode("é").length); // 2
console.log(encodeur.encode("😀").length); // 4
```

### Normaliser : un même texte, deux écritures

Le « é » peut s'écrire avec un seul point de code (U+00E9, forme **précomposée**) ou avec `e` suivi de l'accent combinant U+0301 (forme **décomposée**). À l'écran, c'est identique ; pour `===`, ce sont deux chaînes différentes. Des noms de fichiers venus de macOS, du texte copié depuis certains PDF ou certaines saisies arrivent parfois sous forme décomposée.

```js
const precompose = "\u00E9"; // é
const decompose = "e\u0301"; // é

console.log(precompose === decompose); // false
console.log(precompose.normalize() === decompose.normalize()); // true
console.log(decompose.normalize("NFC").length); // 1
console.log(precompose.normalize("NFD").length); // 2
```

`normalize()` utilise par défaut la forme **NFC** (composée), la plus courante sur le Web. **Normalisez les textes saisis avant de les comparer, de les indexer ou de les stocker.**

La forme décomposée **NFD** a un usage pratique : séparer les lettres de leurs accents pour les retirer. `\p{M}` désigne tous les signes combinants (accents, cédille, tréma…) ; la syntaxe `/…/gu` est expliquée au [chapitre 14](../14-regex/README.md) :

```js
function retirerAccents(texte) {
  return texte.normalize("NFD").replace(/\p{M}/gu, "");
}

console.log(retirerAccents("Crème brûlée à l'été")); // "Creme brulee a l'ete"
console.log(retirerAccents("Ça coûte cher")); // "Ca coute cher"
console.log(retirerAccents("cœur")); // "cœur" (œ est une ligature, pas une lettre accentuée)
```

### Chaînes mal formées (ES2024)

Couper une chaîne au milieu d'une paire de substitution laisse une moitié orpheline (*lone surrogate*). Une telle chaîne est dite **mal formée** : elle s'affiche avec un « � » et certaines API la refusent.

```js
const moitie = "😀".slice(0, 1);

console.log(moitie.length); // 1
console.log(moitie.isWellFormed()); // false
console.log("😀".isWellFormed()); // true
console.log(moitie.toWellFormed() === "\uFFFD"); // true (remplacée par « � »)

try {
  encodeURIComponent(moitie);
} catch (erreur) {
  console.log(erreur.name); // "URIError"
}
```

`isWellFormed()` et `toWellFormed()` (ES2024, Baseline 2023, Node.js 20+) permettent de vérifier ou de réparer une chaîne avant de l'envoyer à une API stricte (`encodeURIComponent`, certaines bases de données).

## Rechercher dans une chaîne

Pour savoir **si** un texte en contient un autre, utilisez les méthodes qui renvoient un booléen :

```js
const titre = "Introduction à JavaScript";

console.log(titre.includes("Java")); // true
console.log(titre.includes("java")); // false (sensible à la casse)
console.log(titre.startsWith("Intro")); // true
console.log(titre.endsWith("Script")); // true
console.log(titre.startsWith("à", 13)); // true (en commençant à l'indice 13)
```

Pour savoir **où**, utilisez `indexOf` et `lastIndexOf`, qui renvoient l'indice de la première (ou dernière) occurrence, ou `-1` :

```js
const phrase = "JavaScript est un langage de programmation populaire";

console.log(phrase.indexOf("langage")); // 18
console.log(phrase.indexOf("a")); // 1
console.log(phrase.indexOf("a", 2)); // 3 (recherche à partir de l'indice 2)
console.log(phrase.lastIndexOf("a")); // 48
console.log(phrase.indexOf("Python")); // -1
```

```js
const fichier = "rapport.final.pdf";

console.log(fichier.indexOf(".pdf") !== -1); // true ❌ ancienne façon, peu lisible (et vrai aussi pour "x.pdf.exe")
console.log(fichier.endsWith(".pdf")); // true ✅ exprime exactement l'intention
```

Toutes ces méthodes sont sensibles à la casse et aux accents. Pour une recherche plus tolérante, normalisez les deux côtés :

```js
function simplifier(texte) {
  return texte.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function contientSouple(texte, recherche) {
  return simplifier(texte).includes(simplifier(recherche));
}

console.log(contientSouple("Le Café de la Gare", "cafe")); // true
console.log(contientSouple("Le Café de la Gare", "thé")); // false
```

Pour compter les occurrences, une boucle sur `indexOf` suffit :

```js
function compterOccurrences(texte, motif) {
  if (motif === "") return 0;
  let total = 0;
  let position = texte.indexOf(motif);
  while (position !== -1) {
    total++;
    position = texte.indexOf(motif, position + motif.length);
  }
  return total;
}

console.log(compterOccurrences("banane", "an")); // 2
console.log(compterOccurrences("aaaa", "aa")); // 2 (occurrences sans chevauchement)
```

Les recherches par motif (`search`, `match`, `matchAll`) utilisent des expressions régulières : voir le [chapitre 14](../14-regex/README.md).

## Extraire une partie

### slice, la méthode à retenir

`slice(debut, fin)` renvoie la portion qui va de `debut` (inclus) à `fin` (exclu). Les indices négatifs comptent depuis la fin.

```js
const langage = "JavaScript";

console.log(langage.slice(0, 4)); // "Java"
console.log(langage.slice(4)); // "Script" (jusqu'à la fin)
console.log(langage.slice(-6)); // "Script" (les 6 derniers)
console.log(langage.slice(0, -6)); // "Java" (tout sauf les 6 derniers)
console.log(langage.slice(4, 1)); // "" (début après la fin : chaîne vide)
```

Combinée à `indexOf` et `lastIndexOf`, elle suffit pour la plupart des extractions :

```js
const email = "ada.lovelace@exemple.fr";
const arobase = email.indexOf("@");
console.log(email.slice(0, arobase)); // "ada.lovelace"
console.log(email.slice(arobase + 1)); // "exemple.fr"

const nomFichier = "photo.vacances.jpeg";
console.log(nomFichier.slice(nomFichier.lastIndexOf(".") + 1)); // "jpeg"
```

### substring et substr

Deux autres méthodes existent ; elles se comportent différemment et sont source de confusion :

| Méthode | Arguments | Indices négatifs | Remarque |
| --- | --- | --- | --- |
| `slice(debut, fin)` | début, fin (exclue) | comptent depuis la fin | ✅ à privilégier |
| `substring(debut, fin)` | début, fin (exclue) | ramenés à `0` | échange les arguments si `debut > fin` |
| `substr(debut, longueur)` | début, **longueur** | début seulement | ❌ obsolète (annexe B de la spécification) |

```js
const langage = "JavaScript";

console.log(langage.substring(4, 1)); // "ava" (arguments échangés en silence)
console.log(langage.substring(-3)); // "JavaScript" (-3 devient 0)
console.log(langage.slice(-3)); // "ipt"
```

`substr` ne figure dans la spécification que pour la compatibilité avec le vieux code : remplacez `texte.substr(debut, n)` par `texte.slice(debut, debut + n)`.

> [!WARNING]
> `slice`, `substring` et les indices travaillent en **unités UTF-16**. Couper au milieu d'un émoji produit une chaîne mal formée (voir [plus haut](#chaînes-mal-formées-es2024)). Pour tronquer un texte destiné à l'affichage, découpez par graphèmes (voir la [recette de troncature](#tronquer-un-texte)).

## Transformer

### Casse

```js
console.log("Bonjour".toUpperCase()); // "BONJOUR"
console.log("BONJOUR".toLowerCase()); // "bonjour"
console.log("élève".toUpperCase()); // "ÉLÈVE"
```

Deux subtilités :

- La conversion peut **changer la longueur** : `"ß".toUpperCase()` donne `"SS"`.
- Certaines langues ont leurs propres règles. En turc, la majuscule de « i » est « İ » (avec un point) : utilisez alors `toLocaleUpperCase("tr")` et `toLocaleLowerCase("tr")`.

```js
console.log("ß".toUpperCase()); // "SS"
console.log("istanbul".toUpperCase()); // "ISTANBUL"
console.log("istanbul".toLocaleUpperCase("tr")); // "İSTANBUL"
```

### Espaces en trop

`trim()` retire les blancs **au début et à la fin** ; `trimStart()` et `trimEnd()` (ES2019) d'un seul côté. Les « blancs » incluent les espaces, tabulations, sauts de ligne, l'espace insécable (U+00A0), l'espace fine insécable (U+202F) et l'indicateur d'ordre des octets (U+FEFF).

```js
const saisie = "  \t ada@exemple.fr \n";

console.log(saisie.trim()); // "ada@exemple.fr"
console.log(saisie.trimStart()); // "ada@exemple.fr \n"
console.log("\u00A0Prix\u202F".trim()); // "Prix"
```

`trim()` ne touche pas aux espaces intérieurs. Pour réduire toute suite de blancs à une seule espace, combinez-le avec une expression régulière :

```js
const nom = "  Ada    Lovelace \n";
console.log(nom.trim().replace(/\s+/g, " ")); // "Ada Lovelace"
```

### Compléter et répéter

`padStart(longueur, motif)` et `padEnd(longueur, motif)` (ES2017) complètent une chaîne jusqu'à la longueur voulue ; `repeat(n)` (ES2015) la répète :

```js
console.log("7".padStart(3, "0")); // "007"
console.log("abc".padStart(2, "0")); // "abc" (déjà assez longue : inchangée)
console.log("Total".padEnd(10, ".")); // "Total....."
console.log("=".repeat(12)); // "============"

const heures = 9;
const minutes = 5;
console.log(`${String(heures).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`); // "09:05"
```

Elles sont idéales pour aligner du texte dans un terminal :

```js
const articles = [
  ["Café", "2,50 €"],
  ["Croissant", "1,20 €"],
  ["Jus d'orange", "4,00 €"],
];

for (const [nom, prix] of articles) {
  console.log(nom.padEnd(15, ".") + prix.padStart(8));
}
// Café...........  2,50 €
// Croissant......  1,20 €
// Jus d'orange...  4,00 €
```

### Remplacer

Avec une chaîne comme motif, `replace` ne remplace **que la première occurrence**. `replaceAll` (ES2021) les remplace toutes :

```js
const date = "2026-11-06";

console.log(date.replace("-", "/")); // "2026/11-06" ❌ une seule occurrence
console.log(date.replaceAll("-", "/")); // "2026/11/06" ✅
```

Le second argument peut être une **fonction**, appelée pour chaque occurrence ; sa valeur de retour sert de remplacement :

```js
const modele = "Bonjour {prenom}, votre commande {commande} est prête.";
const valeurs = { prenom: "Inès", commande: "#4521" };

let resultat = modele;
for (const [cle, valeur] of Object.entries(valeurs)) {
  resultat = resultat.replaceAll(`{${cle}}`, () => valeur);
}
console.log(resultat); // "Bonjour Inès, votre commande #4521 est prête."
```

> [!WARNING]
> Quand le remplacement est une **chaîne**, certaines séquences y sont interprétées : `$&` (le texte trouvé), `` $` `` (ce qui précède), `$'` (ce qui suit), `$$` (un vrai `$`). Si la chaîne de remplacement vient de l'extérieur (saisie, base de données), passez-la par une fonction, qui n'interprète rien.

```js
const motDePasseGenere = "ab$&cd";

console.log("Code : ???".replace("???", motDePasseGenere)); // "Code : ab???cd" ❌
console.log("Code : ???".replace("???", () => motDePasseGenere)); // "Code : ab$&cd" ✅
```

Avec une expression régulière, `replace` devient beaucoup plus puissant (groupes, `$1`, `$<nom>`) : voir le [chapitre 14](../14-regex/README.md).

### Découper et assembler

`split(separateur, limite)` découpe une chaîne en tableau ; `join(separateur)`, méthode des tableaux, fait l'inverse :

```js
console.log("pomme,poire,kiwi".split(",")); // ["pomme", "poire", "kiwi"]
console.log("a,b,,c".split(",")); // ["a", "b", "", "c"] (les champs vides sont conservés)
console.log("a,b,c,d".split(",", 2)); // ["a", "b"] (au plus 2 éléments)
console.log("".split(",")); // [""] (et non un tableau vide)
console.log(["2026", "11", "06"].join("/")); // "2026/11/06"
```

`split("")` découpe en **unités UTF-16** et casse les émojis. Pour obtenir les caractères, utilisez la décomposition (points de code) ou `Intl.Segmenter` (graphèmes) :

```js
console.log("ok😀".split("").length); // 4 ❌ l'émoji est coupé en deux moitiés
console.log([..."ok😀"]); // ["o", "k", "😀"] ✅
```

> [!CAUTION]
> `ligne.split(",")` ne suffit pas pour lire un vrai fichier CSV : un champ peut contenir une virgule entre guillemets (`"Dupont, Jean"`). Utilisez une bibliothèque dédiée pour le CSV réel.

## Comparer et trier

### Comparaison stricte et ordre des opérateurs

`===` compare les chaînes unité par unité : deux textes visuellement identiques mais normalisés différemment ne sont pas égaux (voir [Normaliser](#normaliser--un-même-texte-deux-écritures)).

Les opérateurs `<` et `>` comparent les **codes** des caractères, pas l'ordre alphabétique d'une langue :

```js
console.log("abc" < "abd"); // true
console.log("Z" < "a"); // true (toutes les majuscules ASCII précèdent les minuscules)
console.log("é" > "z"); // true (é a un code plus grand que z)
console.log("10" < "9"); // true (comparaison caractère par caractère)
```

Conséquence : `sort()` sans comparateur trie mal les textes humains. Les exemples utilisent `toSorted()` (ES2023), qui renvoie une copie triée sans modifier le tableau d'origine.

```js
const prenoms = ["Émile", "Zoé", "eric", "Ana", "zoé", "élodie"];
console.log(prenoms.toSorted()); // ["Ana", "Zoé", "eric", "zoé", "Émile", "élodie"] ❌
```

### localeCompare et Intl.Collator

`a.localeCompare(b, langue, options)` compare selon les règles d'une langue et renvoie un nombre **négatif** si `a` vient avant `b`, **positif** s'il vient après, `0` s'ils sont équivalents (ne testez pas `=== -1` : seul le signe est garanti).

Pour trier un tableau, créez un `Intl.Collator` **une seule fois** et passez sa méthode `compare` : c'est plus rapide que d'appeler `localeCompare` à chaque comparaison.

```js
const prenoms = ["Émile", "Zoé", "eric", "Ana", "zoé", "élodie"];
const collateur = new Intl.Collator("fr");

console.log(prenoms.toSorted(collateur.compare)); // ["Ana", "élodie", "Émile", "eric", "zoé", "Zoé"] ✅
console.log("a".localeCompare("b", "fr")); // -1
```

L'ordre dépend vraiment de la langue : en suédois, « ä » est une lettre à part qui se range après « z ».

```js
console.log(["z", "ä"].toSorted(new Intl.Collator("de").compare)); // ["ä", "z"]
console.log(["z", "ä"].toSorted(new Intl.Collator("sv").compare)); // ["z", "ä"]
```

Les options les plus utiles :

| Option | Valeurs | Effet |
| --- | --- | --- |
| `sensitivity` | `"base"`, `"accent"`, `"case"`, `"variant"` | quelles différences comptent (`"base"` : ni la casse ni les accents) |
| `numeric` | `true` / `false` | compare les suites de chiffres comme des nombres (`"2" < "10"`) |
| `caseFirst` | `"upper"`, `"lower"`, `"false"` | majuscules ou minuscules en premier à égalité |
| `ignorePunctuation` | `true` / `false` | ignore la ponctuation |

```js
const fichiers = ["chapitre10.md", "chapitre2.md", "chapitre1.md"];
console.log(fichiers.toSorted()); // ["chapitre1.md", "chapitre10.md", "chapitre2.md"] ❌
console.log(fichiers.toSorted(new Intl.Collator("fr", { numeric: true }).compare)); // ["chapitre1.md", "chapitre2.md", "chapitre10.md"] ✅

// Égalité sans tenir compte de la casse ni des accents
const egaliteSouple = new Intl.Collator("fr", { sensitivity: "base" });
console.log(egaliteSouple.compare("Éric", "eric") === 0); // true
console.log(egaliteSouple.compare("Éric", "Erik") === 0); // false
```

Les comparateurs et le tri de tableaux sont approfondis au [chapitre 09](../09-tableaux/README.md).

## Chaînes brutes avec String.raw

`String.raw` est une fonction d'étiquette fournie par le langage : elle renvoie le texte d'un gabarit **sans interpréter les échappements**. Les interpolations `${…}` fonctionnent toujours.

```js
const chemin = String.raw`C:\Users\ines\notes`;
console.log(chemin); // C:\Users\ines\notes

console.log(String.raw`\n`.length); // 2 (une barre oblique inverse et un « n »)
console.log(String.raw`Total : ${2 + 3}\n`); // Total : 5\n
```

C'est pratique pour les chemins Windows et pour écrire le motif d'un `new RegExp(…)` sans doubler chaque barre oblique inverse (voir le [chapitre 14](../14-regex/README.md)). Le fonctionnement des fonctions d'étiquette est expliqué au [chapitre 11](../11-syntaxe-moderne/README.md).

## Formater une liste avec Intl.ListFormat

Joindre des éléments avec des virgules et un « et » final semble trivial, jusqu'à ce qu'on doive gérer l'anglais (*Oxford comma*), une liste à un élément ou une autre langue. `Intl.ListFormat` (Baseline 2021 ; Node.js 12+) s'en charge :

```js
const listeEt = new Intl.ListFormat("fr", { type: "conjunction" });
const listeOu = new Intl.ListFormat("fr", { type: "disjunction" });

console.log(listeEt.format(["pommes", "poires", "kiwis"])); // "pommes, poires et kiwis"
console.log(listeEt.format(["pommes"])); // "pommes"
console.log(listeOu.format(["thé", "café"])); // "thé ou café"
console.log(new Intl.ListFormat("en").format(["apples", "pears", "kiwis"])); // "apples, pears, and kiwis"

// type "unit" : pour des mesures
const duree = new Intl.ListFormat("fr", { type: "unit", style: "narrow" });
console.log(duree.format(["3 h", "20 min"])); // "3 h 20 min"
```

## Encoder en base64

Le **base64** représente des octets quelconques avec 64 caractères ASCII sûrs (`A-Z`, `a-z`, `0-9`, `+`, `/`). On le croise dans les URL de données (`data:image/png;base64,…`), l'authentification HTTP Basic, les pièces jointes d'e-mails et, dans sa variante **base64url** (`-` et `_` au lieu de `+` et `/`), dans les jetons JWT.

> [!IMPORTANT]
> Le base64 est un **encodage**, pas un chiffrement : n'importe qui peut le décoder. Il ne protège aucune donnée.

### btoa et atob : seulement pour l'ASCII

Les fonctions historiques `btoa` (encode) et `atob` (décode), disponibles dans les navigateurs et dans Node.js, travaillent sur des « chaînes binaires » où chaque caractère représente **un octet** (code 0 à 255) :

```js
console.log(btoa("Bonjour")); // "Qm9uam91cg=="
console.log(atob("Qm9uam91cg==")); // "Bonjour"

try {
  btoa("5 €"); // « € » a le code 8364 : ce n'est pas un octet
} catch (erreur) {
  console.log(erreur.name); // "InvalidCharacterError"
}
```

Pire : `btoa("é")` ne lève pas d'erreur (le code de « é » est 233), mais encode l'octet Latin-1 `E9` au lieu de l'UTF-8 `C3 A9`. Un autre système qui décode en UTF-8 obtiendra un caractère illisible.

### La bonne méthode : passer par les octets UTF-8

Il faut d'abord convertir le texte en octets UTF-8 avec `TextEncoder`, puis encoder ces octets. Version portable, qui fonctionne partout :

```js
function versBase64(texte) {
  const octets = new TextEncoder().encode(texte);
  let binaire = "";
  for (const octet of octets) binaire += String.fromCharCode(octet);
  return btoa(binaire);
}

function depuisBase64(base64) {
  const octets = Uint8Array.from(atob(base64), (caractere) => caractere.charCodeAt(0));
  return new TextDecoder().decode(octets);
}

const encode = versBase64("Ça coûte 5 €");
console.log(encode); // "w4dhIGNvw7t0ZSA1IOKCrA=="
console.log(depuisBase64(encode)); // "Ça coûte 5 €"
```

ES2026 ajoute des méthodes natives sur `Uint8Array`, qui gèrent aussi la variante base64url et le hexadécimal : `toBase64()`, `Uint8Array.fromBase64()`, `toHex()`, `Uint8Array.fromHex()`. D'après MDN, elles sont Baseline 2025 (Chrome et Edge 140, Firefox 133, Safari 18.2) et présentes dans Node.js 25 et plus, donc dans Node 26 LTS, mais **pas dans Node 24**.

<!-- no-run -->
```js
const octets = new TextEncoder().encode("Ça coûte 5 €");

console.log(octets.toBase64()); // "w4dhIGNvw7t0ZSA1IOKCrA=="
console.log(octets.toBase64({ alphabet: "base64url", omitPadding: true })); // "w4dhIGNvw7t0ZSA1IOKCrA"

const decode = Uint8Array.fromBase64("w4dhIGNvw7t0ZSA1IOKCrA==");
console.log(new TextDecoder().decode(decode)); // "Ça coûte 5 €"
```

Dans Node.js, `Buffer` fait la même chose depuis toujours ; la documentation de Node classe d'ailleurs `btoa`/`atob` comme « héritées » (*legacy*) et recommande `Buffer` :

```js
const base64 = Buffer.from("Ça coûte 5 €", "utf8").toString("base64");
console.log(base64); // "w4dhIGNvw7t0ZSA1IOKCrA=="
console.log(Buffer.from(base64, "base64").toString("utf8")); // "Ça coûte 5 €"
console.log(Buffer.from("Ça coûte 5 €").toString("base64url")); // "w4dhIGNvw7t0ZSA1IOKCrA"
```

## Recettes

### Mettre une majuscule initiale

```js
function capitaliser(texte, langue = "fr") {
  const [premier = "", ...reste] = texte; // découpe par points de code
  return premier.toLocaleUpperCase(langue) + reste.join("");
}

console.log(capitaliser("élan")); // "Élan"
console.log(capitaliser("bonjour tout le monde")); // "Bonjour tout le monde"
console.log(capitaliser("")); // "" (pas d'erreur sur une chaîne vide)
```

La décomposition `[premier, ...reste]` découpe par points de code : un émoji initial reste intact, contrairement à `texte[0]`.

> [!NOTE]
> En français, un titre ne prend une majuscule qu'à son premier mot (et aux noms propres) : « Le Seigneur des anneaux ». Mettre une majuscule à chaque mot est un usage anglais.

### Créer un slug

Un *slug* est une version d'un titre utilisable dans une URL : minuscules, sans accents, mots séparés par des tirets.

```js
function slugifier(texte) {
  return texte
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // retire les accents
    .toLowerCase()
    .replaceAll("œ", "oe")
    .replaceAll("æ", "ae")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-") // tout le reste devient un tiret
    .replace(/^-+|-+$/g, ""); // pas de tiret au début ni à la fin
}

console.log(slugifier("Crème brûlée : la recette (facile) !")); // "creme-brulee-la-recette-facile"
console.log(slugifier("Cœur d'artichaut")); // "coeur-d-artichaut"
console.log(slugifier("  Été 2026 — Bilan  ")); // "ete-2026-bilan"
console.log(slugifier("🚀🚀")); // "" (prévoyez une valeur de secours)
```

Les ligatures « œ » et « æ » ne se décomposent pas en NFD : sans le traitement explicite, « cœur » deviendrait `c-ur`.

### Tronquer un texte

```js
const segmenteur = new Intl.Segmenter("fr", { granularity: "grapheme" });

function tronquer(texte, max) {
  const graphemes = Array.from(segmenteur.segment(texte), (s) => s.segment);
  if (graphemes.length <= max) return texte;
  return graphemes.slice(0, max - 1).join("").trimEnd() + "…";
}

console.log(tronquer("Bonjour tout le monde", 10)); // "Bonjour t…"
console.log(tronquer("Court", 10)); // "Court"
console.log(tronquer("Vive les 🇫🇷 et les 👨‍👩‍👧", 11)); // "Vive les 🇫🇷…"

// ❌ Avec slice, le drapeau est coupé en deux
console.log("Vive les 🇫🇷 et les 👨‍👩‍👧".slice(0, 10).isWellFormed()); // false
```

Le résultat compte `max` graphèmes, points de suspension (« … », U+2026, un seul caractère) compris. Une version qui coupe entre deux mots est proposée en [exercice](#exercice-6--tronquer-sans-couper-les-mots-).

### Masquer une adresse e-mail

```js
function masquerEmail(email) {
  const arobase = email.lastIndexOf("@");
  if (arobase < 1) return email; // pas une adresse exploitable : on ne touche à rien
  const local = email.slice(0, arobase);
  const domaine = email.slice(arobase);
  const fin = local.length > 2 ? local.at(-1) : "";
  return `${local.at(0)}***${fin}${domaine}`;
}

console.log(masquerEmail("ada.lovelace@exemple.fr")); // "a***e@exemple.fr"
console.log(masquerEmail("jo@exemple.fr")); // "j***@exemple.fr"
console.log(masquerEmail("pas-une-adresse")); // "pas-une-adresse"
```

Le nombre d'astérisques est fixe pour ne pas révéler la longueur de l'adresse.

### Inverser une chaîne

Trois niveaux de correction, selon l'unité de découpe :

```js
const salut = "Salut 👋🏽";
const graphemes = new Intl.Segmenter("fr", { granularity: "grapheme" });

const unites = salut.split("").reverse().join("");
const points = [...salut].reverse().join("");
const visibles = Array.from(graphemes.segment(salut), (s) => s.segment).reverse().join("");

console.log(unites.isWellFormed()); // false ❌ émoji cassé
console.log(points); // "🏽👋 tulaS" ❌ la couleur de peau est détachée de la main
console.log(visibles); // "👋🏽 tulaS" ✅
```

### Échapper du HTML

Avant d'insérer un texte venu de l'utilisateur dans du HTML construit à la main, échappez les caractères spéciaux, sinon vous ouvrez la porte aux injections de script (XSS, voir le [chapitre 23](../23-dom/README.md)) :

```js
const entites = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function echapperHtml(texte) {
  return texte.replace(/[&<>"']/g, (caractere) => entites[caractere]);
}

console.log(echapperHtml(`<img src=x onerror="alert('piège')">`)); // "&lt;img src=x onerror=&quot;alert(&#39;piège&#39;)&quot;&gt;"
```

Dans le DOM, le plus simple reste d'utiliser `textContent`, qui n'interprète jamais le HTML.

## Récapitulatif des méthodes

| Besoin | Méthode | Renvoie |
| --- | --- | --- |
| Lire un caractère | `at(i)`, `[i]`, `charAt(i)` | chaîne (ou `undefined`) |
| Code d'un caractère | `codePointAt(i)`, `String.fromCodePoint(n)` | nombre / chaîne |
| Tester la présence | `includes`, `startsWith`, `endsWith` | booléen |
| Trouver la position | `indexOf`, `lastIndexOf` | indice ou `-1` |
| Extraire | `slice(debut, fin)` | chaîne |
| Casse | `toUpperCase`, `toLowerCase`, `toLocaleUpperCase(langue)` | chaîne |
| Blancs | `trim`, `trimStart`, `trimEnd` | chaîne |
| Compléter, répéter | `padStart`, `padEnd`, `repeat` | chaîne |
| Remplacer | `replace` (1ʳᵉ occurrence), `replaceAll` | chaîne |
| Découper | `split(separateur, limite)` | tableau |
| Normaliser | `normalize("NFC" \| "NFD")` | chaîne |
| Vérifier/réparer l'UTF-16 | `isWellFormed`, `toWellFormed` | booléen / chaîne |
| Comparer, trier | `localeCompare`, `Intl.Collator` | nombre |
| Graphèmes, mots, phrases | `Intl.Segmenter` | segments itérables |
| Liste lisible | `Intl.ListFormat` | chaîne |

## Pièges courants

- **Oublier de réaffecter** : `texte.trim();` seul ne fait rien, les chaînes sont immuables. Écrivez `texte = texte.trim();`.
- **`replace` avec une chaîne ne remplace qu'une fois** : utilisez `replaceAll`.
- **`$` dans une chaîne de remplacement** : `$&`, `` $` ``, `$'` sont interprétés. Passez une fonction si le texte vient de l'extérieur.
- **Croire que `length` compte les caractères visibles** : `"👍🏽".length` vaut 4. Comptez les graphèmes avec `Intl.Segmenter`.
- **`split("")`, `slice`, `[i]` sur du texte avec émojis** : ils coupent les paires de substitution. Utilisez `[...texte]` ou `Intl.Segmenter`.
- **Comparer des textes non normalisés** : `"é" === "e\u0301"` vaut `false`. Normalisez à l'entrée.
- **Trier des noms avec `sort()` ou `<`** : l'ordre obtenu est celui des codes Unicode. Utilisez `Intl.Collator`.
- **Tester `localeCompare(...) === -1`** : seul le signe du résultat est garanti.
- **`substring` avec des indices négatifs** ou `substr` : préférez toujours `slice`.
- **`btoa` sur du texte non ASCII** : erreur ou, pire, encodage Latin-1 silencieux. Passez par `TextEncoder`.
- **`new String("…")`** : crée un objet, pas une chaîne.

## Bonnes pratiques

- Guillemets doubles par défaut, gabarits pour l'interpolation et le multiligne.
- `at(-1)` pour le dernier caractère, `slice` pour extraire, `includes`/`startsWith`/`endsWith` pour tester.
- Nettoyez les saisies à la frontière de votre programme : `trim()`, `normalize()`, éventuellement réduction des espaces.
- Pour l'affichage et les limites « humaines », raisonnez en graphèmes ; pour le stockage et le réseau, en octets UTF-8.
- Créez les objets `Intl` (`Collator`, `Segmenter`, `ListFormat`) une fois et réutilisez-les.
- Précisez toujours la langue (`"fr"`) dans les appels `Intl` et `toLocale…` : sinon, le résultat dépend de la machine qui exécute le code.
- Pour du HTML, préférez `textContent` à l'échappement manuel.

## Résumé

- Une chaîne est une valeur primitive **immuable** : chaque méthode renvoie une nouvelle chaîne.
- Trois littéraux équivalents ; les gabarits ajoutent `${…}` et le multiligne. `String(x)` convertit n'importe quelle valeur.
- `length` compte des **unités UTF-16** ; l'itération compte des **points de code** ; `Intl.Segmenter` compte des **graphèmes**, ce que voit l'utilisateur.
- `normalize()` unifie les écritures d'un même texte ; NFD + suppression de `\p{M}` retire les accents.
- `includes`, `startsWith`, `endsWith`, `indexOf` pour chercher ; `slice` pour extraire ; `substr` est obsolète.
- `replace` avec une chaîne ne remplace que la première occurrence ; `replaceAll` les remplace toutes.
- `<` et `sort()` comparent des codes ; `Intl.Collator` trie selon une langue, avec options (`numeric`, `sensitivity`).
- `btoa`/`atob` ne gèrent que des octets : encodez d'abord en UTF-8. `toBase64`/`fromBase64` (ES2026) et `Buffer` (Node) font le travail proprement.

## Exercices

### Exercice 1 — Initiales (★☆☆)

Écrivez `initiales(nomComplet)` qui renvoie les initiales en majuscules suivies d'un point, séparées par une espace. Les espaces en trop doivent être ignorées.

```text
initiales("ada lovelace")        → "A. L."
initiales("  grace   hopper ")   → "G. H."
initiales("Émile")               → "É."
```

<details>
<summary>Solution</summary>

```js
function initiales(nomComplet) {
  return nomComplet
    .trim()
    .split(" ")
    .filter((mot) => mot !== "") // les espaces multiples produisent des mots vides
    .map((mot) => `${mot.charAt(0).toLocaleUpperCase("fr")}.`)
    .join(" ");
}

console.log(initiales("ada lovelace")); // "A. L."
console.log(initiales("  grace   hopper ")); // "G. H."
console.log(initiales("Émile")); // "É."
```

`split(" ")` sur `"grace   hopper"` produit des éléments vides entre les espaces consécutives : le `filter` les élimine. `charAt(0)` renvoie `""` plutôt que `undefined` si le mot était vide, ce qui évite toute erreur.

</details>

### Exercice 2 — Ticket de caisse (★☆☆)

À partir du tableau ci-dessous, affichez un ticket dont les prix sont alignés à droite sur une largeur totale de 24 caractères, avec une ligne de séparation et le total.

```js
const lignes = [
  ["Café", 250],
  ["Croissant", 120],
  ["Jus d'orange", 400],
];
console.log(lignes.length); // 3
```

Les prix sont en centimes ; affichez-les sous la forme `2,50 €` (sans `Intl`, avec `padStart` pour les centimes).

<details>
<summary>Solution</summary>

```js
const lignes = [
  ["Café", 250],
  ["Croissant", 120],
  ["Jus d'orange", 400],
];

function formaterPrix(centimes) {
  const euros = Math.trunc(centimes / 100);
  const reste = String(centimes % 100).padStart(2, "0");
  return `${euros},${reste} €`;
}

const largeur = 24;
let total = 0;
for (const [nom, centimes] of lignes) {
  const prix = formaterPrix(centimes);
  console.log(nom.padEnd(largeur - prix.length, ".") + prix);
  total += centimes;
}
console.log("-".repeat(largeur));
const prixTotal = formaterPrix(total);
console.log("TOTAL".padEnd(largeur - prixTotal.length) + prixTotal);
// Café..............2,50 €
// Croissant.........1,20 €
// Jus d'orange......4,00 €
// ------------------------
// TOTAL             7,70 €
```

Chaque ligne fait exactement 24 caractères : le nom est complété jusqu'à `24 - longueur du prix`. Travailler en centimes entiers évite les erreurs d'arrondi (voir le [chapitre 08](../08-nombres-et-math/README.md)). En vrai, `Intl.NumberFormat` formaterait les montants.

</details>

### Exercice 3 — Palindromes (★★☆)

Écrivez `estPalindrome(phrase)` qui ignore la casse, les accents, les espaces et la ponctuation.

```text
estPalindrome("Ésope reste ici et se repose")   → true
estPalindrome("Engage le jeu que je le gagne")  → true
estPalindrome("Bonjour")                        → false
```

<details>
<summary>Solution</summary>

```js
function estPalindrome(phrase) {
  const lettres = phrase
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // accents
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, ""); // tout ce qui n'est ni lettre ni chiffre
  return lettres === [...lettres].reverse().join("");
}

console.log(estPalindrome("Ésope reste ici et se repose")); // true
console.log(estPalindrome("Engage le jeu que je le gagne")); // true
console.log(estPalindrome("Bonjour")); // false
```

On réduit d'abord la phrase à ses seules lettres et chiffres, sans accents ni majuscules, puis on la compare à son inverse. `\p{L}` (lettre) et `\p{N}` (chiffre) sont des classes Unicode détaillées au [chapitre 14](../14-regex/README.md).

</details>

### Exercice 4 — Compter les voyelles (★★☆)

Écrivez `compterVoyelles(texte)` qui compte les voyelles (`a e i o u y`), accentuées ou non, majuscules comprises, **sans expression régulière** pour le comptage.

```text
compterVoyelles("Où est passé l'élève ?")  → 8
compterVoyelles("Rythme")                  → 2
```

<details>
<summary>Solution</summary>

```js
const voyelles = new Set(["a", "e", "i", "o", "u", "y"]);

function compterVoyelles(texte) {
  let total = 0;
  for (const caractere of texte.normalize("NFD").toLowerCase()) {
    if (voyelles.has(caractere)) total++;
  }
  return total;
}

console.log(compterVoyelles("Où est passé l'élève ?")); // 8
console.log(compterVoyelles("Rythme")); // 2 (« y » et « e »)
```

En NFD, « é » devient « e » suivi de l'accent combinant : la lettre de base est comptée, l'accent ne l'est pas (il n'est pas dans l'ensemble). Inutile donc de retirer les accents.

</details>

### Exercice 5 — Annuaire trié sans doublons (★★☆)

Écrivez `annuaire(noms)` qui renvoie les noms triés à la française, en supprimant ceux qui ne diffèrent que par la casse ou les accents (on garde la première orthographe rencontrée).

```text
annuaire(["Émilie", "eva", "Zoé", "emilie", "Éva", "adam"])
→ ["adam", "Émilie", "eva", "Zoé"]
```

<details>
<summary>Solution</summary>

```js
const souple = new Intl.Collator("fr", { sensitivity: "base" });
const tri = new Intl.Collator("fr");

function annuaire(noms) {
  const uniques = [];
  for (const nom of noms) {
    const dejaVu = uniques.some((existant) => souple.compare(existant, nom) === 0);
    if (!dejaVu) uniques.push(nom);
  }
  return uniques.toSorted(tri.compare);
}

console.log(annuaire(["Émilie", "eva", "Zoé", "emilie", "Éva", "adam"])); // ["adam", "Émilie", "eva", "Zoé"]
```

Deux collateurs : l'un, avec `sensitivity: "base"`, décide de l'égalité (« Émilie » et « emilie » sont équivalents) ; l'autre trie. La recherche avec `some` est en O(n²) : suffisant pour quelques centaines de noms. Pour de gros volumes, utilisez une clé normalisée dans un `Set` (voir le [chapitre 12](../12-collections/README.md)).

</details>

### Exercice 6 — Tronquer sans couper les mots (★★★)

Écrivez `tronquerMots(texte, max)` qui renvoie au plus `max` graphèmes, points de suspension compris, en coupant **entre deux mots** et sans laisser d'espace ni de ponctuation avant « … ». Si le premier mot est déjà trop long, coupez-le au graphème près.

```text
tronquerMots("Le petit chat est mort, vive le chat !", 20)  → "Le petit chat est…"
tronquerMots("Bonjour, le monde", 10)                        → "Bonjour…"
tronquerMots("Anticonstitutionnellement", 10)                → "Anticonst…"
tronquerMots("Court", 10)                                    → "Court"
```

<details>
<summary>Solution</summary>

```js
const parGrapheme = new Intl.Segmenter("fr", { granularity: "grapheme" });
const parMot = new Intl.Segmenter("fr", { granularity: "word" });

function graphemes(texte) {
  return Array.from(parGrapheme.segment(texte), (s) => s.segment);
}

function tronquerMots(texte, max) {
  if (graphemes(texte).length <= max) return texte;

  let resultat = "";
  for (const { segment } of parMot.segment(texte)) {
    const candidat = resultat + segment;
    if (graphemes(candidat.replace(/[\s\p{P}]+$/u, "")).length + 1 > max) break;
    resultat = candidat;
  }
  resultat = resultat.replace(/[\s\p{P}]+$/u, ""); // ni espace ni ponctuation avant « … »

  if (resultat === "") resultat = graphemes(texte).slice(0, max - 1).join("");
  return resultat + "…";
}

console.log(tronquerMots("Le petit chat est mort, vive le chat !", 20)); // "Le petit chat est…"
console.log(tronquerMots("Bonjour, le monde", 10)); // "Bonjour…"
console.log(tronquerMots("Anticonstitutionnellement", 10)); // "Anticonst…"
console.log(tronquerMots("Court", 10)); // "Court"
```

Le segmenteur de mots renvoie aussi les espaces et la ponctuation comme segments : on les ajoute un à un tant que le texte, une fois nettoyé de ses blancs et ponctuations finales, tient avec l'ellipse. Le cas « premier mot trop long » donne un résultat vide, que l'on remplace par une coupe au graphème.

</details>

### Exercice 7 — Base64url pour du texte UTF-8 (★★★)

Sans utiliser `Buffer` ni les méthodes ES2026, écrivez `versBase64Url(texte)` et `depuisBase64Url(chaine)` : le résultat doit utiliser `-` et `_` au lieu de `+` et `/`, sans `=` final, et l'aller-retour doit préserver n'importe quel texte.

<details>
<summary>Solution</summary>

```js
function versBase64Url(texte) {
  let binaire = "";
  for (const octet of new TextEncoder().encode(texte)) {
    binaire += String.fromCharCode(octet);
  }
  return btoa(binaire).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function depuisBase64Url(chaine) {
  let base64 = chaine.replaceAll("-", "+").replaceAll("_", "/");
  base64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const octets = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(octets);
}

const texte = "Ça coûte 5 € ? 🚀";
const encode = versBase64Url(texte);
console.log(encode); // "w4dhIGNvw7t0ZSA1IOKCrCA_IPCfmoA"
console.log(depuisBase64Url(encode) === texte); // true
```

Le texte passe par ses octets UTF-8, que l'on transforme en « chaîne binaire » acceptée par `btoa`. Pour décoder, on rétablit l'alphabet standard et le remplissage `=` (la longueur d'un base64 est un multiple de 4). Avec ES2026, tout cela se résume à `octets.toBase64({ alphabet: "base64url", omitPadding: true })` et `Uint8Array.fromBase64(chaine, { alphabet: "base64url" })`.

</details>

## Pour aller plus loin

- [MDN — String](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String) : référence complète des méthodes.
- [MDN — Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) et [Intl.Collator](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator).
- [MDN — String.prototype.normalize](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) : les quatre formes de normalisation.
- [MDN — Uint8Array.prototype.toBase64](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64) : l'API base64 d'ES2026.
- [Mathias Bynens — JavaScript has a Unicode problem](https://mathiasbynens.be/notes/javascript-unicode) : l'article de référence sur UTF-16 en JavaScript.
- [Nikita Prokopov — The Absolute Minimum Every Software Developer Must Know About Unicode in 2023](https://tonsky.me/blog/unicode/) : graphèmes, normalisation et encodages expliqués simplement.

---

[← Chapitre précédent](../06-fonctions/README.md) · [Sommaire](../README.md#sommaire) · [Chapitre suivant →](../08-nombres-et-math/README.md)
