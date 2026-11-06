# 14 — Expressions régulières

> **Niveau** : Intermédiaire · **Durée** : ~4 h · **Prérequis** : [Chaînes de caractères](../07-chaines/README.md), [Fonctions](../06-fonctions/README.md)

Une expression régulière (*regex*) décrit un **motif** de texte : « cinq chiffres », « un mot répété deux fois », « tout ce qui ressemble à une date ». Elle permet de valider un format, d'extraire des informations, de remplacer intelligemment ou de découper un texte, là où les méthodes de chaînes du [chapitre 07](../07-chaines/README.md) deviendraient laborieuses. Ce chapitre couvre la syntaxe, les drapeaux, les méthodes, Unicode, les nouveautés jusqu'à ES2025, les pièges de performance, et une série de recettes testées.

## Objectifs

- Écrire et lire des motifs : classes, quantificateurs, ancres, groupes, références arrière, assertions.
- Choisir les bons drapeaux (`g`, `i`, `m`, `s`, `u`, `v`, `y`, `d`) et éviter le piège de `lastIndex`.
- Utiliser `test`, `exec`, `match`, `matchAll`, `replace`, `replaceAll`, `split` et `search` à bon escient.
- Traiter correctement les accents et les émojis avec `\p{…}` et le drapeau `v`.
- Construire un motif à partir d'une saisie sans risque grâce à `RegExp.escape` (ES2025).
- Reconnaître une expression vulnérable au ReDoS et la réécrire.
- Valider des formats courants avec mesure, en sachant quand une regex n'est **pas** le bon outil.

## Sommaire

- [Quand utiliser une expression régulière](#quand-utiliser-une-expression-régulière)
- [Créer une expression régulière](#créer-une-expression-régulière)
- [La syntaxe](#la-syntaxe)
- [Les drapeaux](#les-drapeaux)
- [Les méthodes](#les-méthodes)
- [Le piège de lastIndex](#le-piège-de-lastindex)
- [Unicode : accents, émojis et propriétés](#unicode--accents-émojis-et-propriétés)
- [Nouveautés ES2025](#nouveautés-es2025)
- [Valider avec mesure](#valider-avec-mesure)
- [Performance et ReDoS](#performance-et-redos)
- [Recettes testées](#recettes-testées)
- [Déboguer et documenter un motif](#déboguer-et-documenter-un-motif)
- [Pièges courants](#pièges-courants)
- [Bonnes pratiques](#bonnes-pratiques)
- [Résumé](#résumé)
- [Exercices](#exercices)
- [Pour aller plus loin](#pour-aller-plus-loin)

> [!NOTE]
> Dans les commentaires de résultat, les chaînes sont écrites entre guillemets et les tableaux renvoyés par `match` ou `exec` sont réduits à leurs éléments (`// ["2026", "11"]`) : Node.js y ajoute des propriétés `index`, `input` et `groups` présentées plus bas.

## Quand utiliser une expression régulière

Une regex est le bon outil quand on cherche un **motif** plutôt qu'un texte fixe :

- valider un format (code postal, couleur hexadécimale, identifiant) ;
- extraire des morceaux (montants dans un texte, champs d'une ligne de journal) ;
- remplacer selon un motif (reformater des dates, masquer des numéros) ;
- découper selon plusieurs séparateurs ;
- analyser un petit langage (jetons d'une expression arithmétique).

Ce n'est **pas** le bon outil quand une méthode plus simple ou une API dédiée existe :

| Besoin | Plutôt que une regex | Utilisez |
| --- | --- | --- |
| Le texte contient-il « erreur » ? | `/erreur/.test(texte)` | `texte.includes("erreur")` |
| Analyser une URL | une regex d'URL | `new URL(texte)`, `URL.canParse(texte)` |
| Lire du JSON | une regex | `JSON.parse` |
| Analyser du HTML | une regex | `DOMParser`, le DOM |
| Convertir un nombre | une regex | `Number(texte)` + `Number.isFinite` |
| Valider une date réelle | une regex seule | `Date` ou `Temporal` (voir le [chapitre 15](../15-dates/README.md)) |
| Lire un CSV | `split(",")` ou une regex | une bibliothèque CSV |

```js
console.log(URL.canParse("https://exemple.fr/page?id=3")); // true
console.log(URL.canParse("exemple.fr")); // false (pas de protocole)
console.log(new URL("https://exemple.fr/page?id=3").searchParams.get("id")); // "3"
```

## Créer une expression régulière

### Littéral ou constructeur

La forme **littérale** s'écrit entre barres obliques, suivie d'éventuels drapeaux :

```js
const codePostal = /^\d{5}$/;
const motCle = /javascript/i; // i : insensible à la casse

console.log(codePostal.test("75011")); // true
console.log(motCle.test("J'apprends JavaScript")); // true
console.log(typeof codePostal); // "object"
console.log(codePostal instanceof RegExp); // true
```

Le **constructeur** `new RegExp(motif, drapeaux)` sert quand le motif est construit dynamiquement. Le motif est alors une chaîne : chaque `\` doit être doublé, ou écrit avec `String.raw` (voir le [chapitre 07](../07-chaines/README.md)) :

```js
const decimal1 = new RegExp("^\\d+\\.\\d+$"); // barres obliques doublées
const decimal2 = new RegExp(String.raw`^\d+\.\d+$`); // plus lisible
const decimal3 = /^\d+\.\d+$/; // équivalent littéral

console.log(decimal1.test("3.14"), decimal2.test("3.14"), decimal3.test("3.14")); // true true true
console.log(new RegExp("\d+").source); // "d+" ❌ le \d a été perdu : "\d" vaut "d" dans une chaîne
```

Une regex expose son motif et ses drapeaux, et peut servir de modèle à une autre :

```js
const modele = /chat/g;

console.log(modele.source); // "chat"
console.log(modele.flags); // "g"
console.log(modele.global); // true
console.log(new RegExp(modele, "gi").flags); // "gi" (même motif, autres drapeaux)
```

### Construire un motif à partir d'une saisie : RegExp.escape

Insérer une saisie utilisateur dans un motif est dangereux : ses caractères spéciaux (`.`, `+`, `(`…) changent le sens du motif, voire le rendent invalide.

```js
const recherche = "1+1=2";

console.log(new RegExp(recherche).test("1+1=2")); // false ❌ « 1+ » signifie « un ou plusieurs 1 »
console.log(new RegExp(recherche).test("11=2")); // true ❌
```

`RegExp.escape(texte)` (ES2025) échappe tout ce qui doit l'être. D'après MDN, elle est Baseline 2025 (Chrome et Edge 136, Firefox 134, Safari 18.2) et disponible dans Node.js 24+ :

```js
const recherche = "Combien ? (2 €)";
const motif = new RegExp(RegExp.escape(recherche));

console.log(motif.test("Question : Combien ? (2 €)")); // true
console.log(RegExp.escape("a.b")); // "\\x61\\.b" (affiché : \x61\.b)
```

Le résultat paraît étrange (`\x61` pour « a ») : la première lettre ou le premier chiffre est écrit en hexadécimal pour que le motif reste correct même s'il est collé après `\1` ou `\x`. Peu importe : ce n'est pas fait pour être lu.

Pour les environnements plus anciens, la fonction classique suffit (pour un usage hors classe `[…]`) :

```js
function echapperRegExp(texte) {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

console.log(echapperRegExp("1+1=2 (vrai) ?")); // "1\\+1=2 \\(vrai\\) \\?" (affiché : 1\+1=2 \(vrai\) \?)
console.log(new RegExp(echapperRegExp("1+1=2")).test("1+1=2")); // true
```

## La syntaxe

### Caractères littéraux et métacaractères

La plupart des caractères se représentent eux-mêmes : `/chat/` trouve « chat ». Quatorze **métacaractères** ont un sens spécial et doivent être échappés avec `\` pour être cherchés tels quels :

```text
.  *  +  ?  ^  $  {  }  (  )  |  [  ]  \     (et / dans un littéral)
```

```js
console.log(/3.14/.test("3x14")); // true ❌ le point accepte n'importe quel caractère
console.log(/3\.14/.test("3x14")); // false ✅
console.log(/3\.14/.test("3.14")); // true
```

### Classes de caractères

Une classe désigne **un** caractère parmi un ensemble :

| Motif | Correspond à |
| --- | --- |
| `.` | n'importe quel caractère sauf un saut de ligne |
| `\d` / `\D` | un chiffre `0-9` / tout sauf un chiffre |
| `\w` / `\W` | une lettre ASCII, un chiffre ou `_` / l'inverse |
| `\s` / `\S` | un blanc (espace, tabulation, saut de ligne, espaces Unicode) / l'inverse |
| `[aeiou]` | un des caractères listés |
| `[^aeiou]` | tout caractère **sauf** ceux listés |
| `[a-z]`, `[0-9A-F]` | un intervalle |
| `[\d.,]` | un chiffre, un point ou une virgule |

```js
console.log("R2-D2 et C-3PO".match(/\d/g)); // ["2", "2", "3"]
console.log("Tél. : 06 12 34".replace(/\D/g, "")); // "061234"
console.log("bonjour".match(/[aeiouy]/g)); // ["o", "o", "u"]
console.log(/^[A-F0-9]+$/i.test("ff00cc")); // true
```

Dans une classe, la plupart des métacaractères perdent leur sens (`[.]` est un vrai point). Exceptions : `]`, `\`, `^` en première position (négation) et `-` entre deux caractères (intervalle) ; placez `-` au début ou à la fin pour le désigner lui-même.

> [!WARNING]
> `\w`, `\d` et `\b` ne connaissent que l'**ASCII** : « é », « ç » ou « ß » ne sont pas des caractères de mot pour eux. Pour du texte en français, utilisez `\p{L}` (toute lettre) avec le drapeau `u` (voir [Unicode](#unicode--accents-émojis-et-propriétés)).

```js
console.log("Prénom : Inès".match(/\w+/g)); // ["Pr", "nom", "In", "s"] ❌
console.log("Prénom : Inès".match(/\p{L}+/gu)); // ["Prénom", "Inès"] ✅
```

### Quantificateurs

Un quantificateur indique combien de fois répéter l'élément qui le précède :

| Quantificateur | Signification |
| --- | --- |
| `*` | 0 fois ou plus |
| `+` | 1 fois ou plus |
| `?` | 0 ou 1 fois (facultatif) |
| `{3}` | exactement 3 fois |
| `{2,}` | au moins 2 fois |
| `{2,4}` | de 2 à 4 fois |

```js
console.log(/colou?r/.test("color")); // true (le u est facultatif)
console.log(/^\d{5}$/.test("75011")); // true
console.log(/^\d{5}$/.test("7501")); // false
console.log("Il a dit : nooooon !".match(/no+n/)[0]); // "nooooon"
```

Par défaut, les quantificateurs sont **gourmands** : ils prennent le plus possible. Suivis d'un `?`, ils deviennent **paresseux** et prennent le moins possible :

```js
const html = "<b>gras</b> et <i>italique</i>";

console.log(html.match(/<.+>/)[0]); // "<b>gras</b> et <i>italique</i>" ❌ gourmand
console.log(html.match(/<.+?>/g)); // ["<b>", "</b>", "<i>", "</i>"] ✅ paresseux
console.log(html.match(/<[^>]+>/g)); // ["<b>", "</b>", "<i>", "</i>"] ✅ souvent mieux : classe niée
console.log("123456".match(/\d{2,4}/)[0]); // "1234"
console.log("123456".match(/\d{2,4}?/)[0]); // "12"
```

La classe niée `[^>]+` est souvent préférable au paresseux `.+?` : elle exprime précisément ce qui est permis et elle est plus rapide.

### Ancres et limites de mot

| Ancre | Position |
| --- | --- |
| `^` | début du texte (ou de chaque ligne avec le drapeau `m`) |
| `$` | fin du texte (ou de chaque ligne avec `m`) |
| `\b` | limite de mot (entre `\w` et `\W`) |
| `\B` | tout sauf une limite de mot |

Sans ancres, `test` réussit si le motif apparaît **n'importe où** : pour valider un format, encadrez toujours le motif par `^` et `$`.

```js
console.log(/\d{5}/.test("abc123456def")); // true ❌ contient cinq chiffres
console.log(/^\d{5}$/.test("abc123456def")); // false ✅ est exactement cinq chiffres
console.log("le chat chasse le chaton".match(/\bchat\b/g)); // ["chat"]
```

`\b` repose sur `\w`, donc sur l'ASCII. Avec des accents, il donne des faux négatifs et des faux positifs :

```js
console.log("un été chaud".match(/\b\w+\b/g)); // ["un", "t", "chaud"] ❌
console.log(/\bété\b/.test("un été chaud")); // false ❌ faux négatif
console.log(/\bété\b/.test("détérioré")); // true ❌ faux positif

// ✅ Limite de mot Unicode avec des assertions (voir plus bas)
const ete = /(?<![\p{L}\p{N}_])été(?![\p{L}\p{N}_])/u;
console.log(ete.test("un été chaud")); // true
console.log(ete.test("détérioré")); // false
```

### Alternance

`|` signifie « ou ». C'est l'opérateur de plus **faible priorité** : il sépare tout ce qui l'entoure, ancres comprises.

```js
console.log(/^chat|chien$/.test("chat noir")); // true ❌ lu comme « ^chat » ou « chien$ »
console.log(/^(?:chat|chien)$/.test("chat noir")); // false ✅
console.log(/^(?:chat|chien)$/.test("chien")); // true
```

Le moteur essaie les alternatives **dans l'ordre** et s'arrête à la première qui convient : mettez les plus longues en premier quand l'une est le début de l'autre.

```js
console.log("abc".match(/a|ab/)[0]); // "a"
console.log("abc".match(/ab|a/)[0]); // "ab"
```

### Groupes et captures

Les parenthèses **regroupent** (pour appliquer un quantificateur ou limiter une alternance) et **capturent** le texte trouvé, que l'on récupère ensuite par son numéro :

```js
const resultat = /(\d{4})-(\d{2})-(\d{2})/.exec("Livraison le 2026-11-06 à 14 h");

console.log(resultat[0]); // "2026-11-06" (toute la correspondance)
console.log(resultat[1]); // "2026" (premier groupe)
console.log(resultat.index); // 13 (position dans le texte)
console.log(/(?:ha)+/.exec("hahaha !")[0]); // "hahaha" (groupe non capturant)
```

`(?:…)` regroupe **sans** capturer : utilisez-le dès que vous n'avez pas besoin de la valeur, cela évite de décaler la numérotation.

Les **groupes nommés** `(?<nom>…)` (ES2018) rendent le code lisible et robuste aux modifications du motif. Les valeurs sont dans `groups`, qu'on peut décomposer :

```js
const dateIso = /(?<annee>\d{4})-(?<mois>\d{2})-(?<jour>\d{2})/;
const { annee, mois, jour } = dateIso.exec("Livraison le 2026-11-06").groups;

console.log(annee, mois, jour); // "2026" "11" "06"
console.log("2026-11-06".replace(dateIso, "$<jour>/$<mois>/$<annee>")); // "06/11/2026"
```

Une **référence arrière** réutilise dans le motif ce qu'un groupe a capturé : `\1` pour le premier groupe, `\k<nom>` pour un groupe nommé.

```js
console.log(/(\p{L})\1/u.test("bonne")); // true (deux lettres identiques consécutives)
console.log(/(\p{L})\1/u.test("bone")); // false

// Une chaîne entre guillemets simples ou doubles, fermée par le même guillemet
const citation = /(?<guillemet>["']).*?\k<guillemet>/;
console.log(`Il a dit "c'est l'heure" puis est parti`.match(citation)[0]); // "\"c'est l'heure\""
```

### Assertions avant et arrière

Une assertion vérifie ce qui **entoure** une position, sans l'inclure dans la correspondance :

| Assertion | Signification |
| --- | --- |
| `X(?=Y)` | X suivi de Y |
| `X(?!Y)` | X **non** suivi de Y |
| `(?<=Y)X` | X précédé de Y (ES2018) |
| `(?<!Y)X` | X **non** précédé de Y (ES2018) |

```js
const tarifs = "Menu 15 €, boisson 4 €, pourboire 2 $";

console.log(tarifs.match(/\d+(?= €)/g)); // ["15", "4"] (les nombres suivis de « € »)
console.log("€42 $13 €7".match(/(?<=€)\d+/g)); // ["42", "7"]
console.log("€42 $13 €7".match(/(?<!€)\b\d+/g)); // ["13"]
```

Les assertions arrière sont disponibles partout depuis Safari 16.4 (2023).

> [!CAUTION]
> Une assertion négative combinée à un quantificateur peut surprendre : le moteur **recule** jusqu'à trouver une position où l'assertion est vraie.

```js
console.log("100 € et 200 $".match(/\d+(?! €)/g)); // ["10", "200"] ❌ « 10 » n'est pas suivi de « € »
console.log("100 € et 200 $".match(/\d+\b(?! €)/g)); // ["200"] ✅ on impose la fin du nombre
```

## Les drapeaux

| Drapeau | Nom | Effet | Version |
| --- | --- | --- | --- |
| `g` | global | trouve **toutes** les correspondances | ES3 |
| `i` | ignoreCase | ignore la casse | ES3 |
| `m` | multiline | `^` et `$` s'appliquent à chaque ligne | ES3 |
| `s` | dotAll | `.` accepte aussi les sauts de ligne | ES2018 |
| `u` | unicode | traite le texte par points de code, active `\p{…}` | ES2015 |
| `v` | unicodeSets | `u` amélioré : opérations sur les classes, émojis complets | ES2024 |
| `y` | sticky | la correspondance doit commencer exactement à `lastIndex` | ES2015 |
| `d` | hasIndices | fournit les positions de début et de fin de chaque groupe | ES2022 |

```js
const texte = "ligne un\nligne deux";

console.log(texte.match(/^ligne \w+$/g)); // null (sans m, ^ et $ visent tout le texte)
console.log(texte.match(/^ligne \w+$/gm)); // ["ligne un", "ligne deux"]
console.log(/un.ligne/.test(texte)); // false (le . refuse \n)
console.log(/un.ligne/s.test(texte)); // true
console.log(/^.$/.test("😀")); // false (deux unités UTF-16)
console.log(/^.$/u.test("😀")); // true
```

Le drapeau `d` ajoute une propriété `indices` (positions `[début, fin]`), utile pour surligner un résultat dans un éditeur :

```js
const resultat = /(?<nombre>\d+)/d.exec("abc 123");
console.log(resultat.indices[0]); // [4, 7]
console.log(resultat.indices.groups.nombre); // [4, 7]
```

Le drapeau `y` (*sticky*) n'autorise une correspondance **qu'à** la position `lastIndex`, sans chercher plus loin : c'est la base des analyseurs lexicaux (voir la [recette](#analyseur-lexical-avec-le-drapeau-y)).

```js
const nombre = /\d+/y;
nombre.lastIndex = 3;
console.log(nombre.test("abc123")); // true (il y a un nombre à la position 3)
nombre.lastIndex = 1;
console.log(nombre.test("abc123")); // false (pas de nombre exactement à la position 1)
```

## Les méthodes

| Méthode | Renvoie | Avec `g` |
| --- | --- | --- |
| `regex.test(texte)` | `true` / `false` | avance `lastIndex` ⚠️ |
| `regex.exec(texte)` | un résultat détaillé ou `null` | une correspondance par appel, avance `lastIndex` |
| `texte.match(regex)` | le premier résultat détaillé, ou `null` | un tableau de toutes les correspondances (sans détails), ou `null` |
| `texte.matchAll(regex)` | **exige** `g` | un itérateur de résultats détaillés |
| `texte.replace(regex, rempl)` | nouvelle chaîne (1ʳᵉ occurrence) | toutes les occurrences |
| `texte.replaceAll(regex, rempl)` | **exige** `g` | toutes les occurrences |
| `texte.split(regex, limite)` | tableau | (sans effet) |
| `texte.search(regex)` | indice de la 1ʳᵉ correspondance ou `-1` | (sans effet) |

### test : est-ce que ça correspond ?

```js
const heure = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

console.log(heure.test("09:45")); // true
console.log(heure.test("23:59")); // true
console.log(heure.test("24:00")); // false
console.log(heure.test("9:45")); // false
```

### exec et match : obtenir les détails

Sans `g`, `exec` et `match` renvoient la même chose : un tableau (correspondance complète, puis groupes) enrichi de `index`, `input` et `groups`, ou `null`.

```js
const texte = "Commande #4521 du 2026-11-06";

const resultat = texte.match(/#(?<numero>\d+)/);
console.log(resultat[0]); // "#4521"
console.log(resultat.groups.numero); // "4521"
console.log(resultat.index); // 9

console.log(texte.match(/#\d+/g)); // ["#4521"] (avec g : les correspondances seules)
console.log(texte.match(/\d+/g)); // ["4521", "2026", "11", "06"]
console.log(texte.match(/facture/)); // null
```

> [!TIP]
> `match` renvoie `null` quand rien ne correspond, pas un tableau vide : `texte.match(/x/g).length` lève une `TypeError` si rien n'est trouvé. Écrivez `(texte.match(/x/g) ?? []).length` ou utilisez `matchAll`.

### matchAll : toutes les correspondances avec leurs détails

`matchAll` (ES2020) renvoie un **itérateur** de résultats détaillés (groupes, position) pour chaque correspondance. Il exige le drapeau `g` :

```js
const panier = "3 pommes, 12 noix et 1 melon";
const motif = /(?<quantite>\d+) (?<produit>\p{L}+)/gu;

for (const { groups } of panier.matchAll(motif)) {
  console.log(`${groups.produit} : ${groups.quantite}`);
}
// pommes : 3
// noix : 12
// melon : 1

const quantites = Array.from(panier.matchAll(motif), (m) => Number(m.groups.quantite));
console.log(quantites); // [3, 12, 1]

try {
  panier.matchAll(/\d+/); // sans g
} catch (erreur) {
  console.log(erreur.name); // "TypeError"
}
```

### replace et replaceAll : remplacer selon un motif

Dans la chaîne de remplacement, des séquences spéciales désignent les morceaux trouvés :

| Séquence | Insère |
| --- | --- |
| `$&` | toute la correspondance |
| `$1`, `$2`… | le groupe n° 1, 2… |
| `$<nom>` | le groupe nommé |
| `` $` `` / `$'` | le texte avant / après la correspondance |
| `$$` | un `$` littéral |

```js
console.log("2026-11-06".replace(/(\d+)-(\d+)-(\d+)/, "$3/$2/$1")); // "06/11/2026"
console.log("Ada Lovelace".replace(/(?<prenom>\p{L}+) (?<nom>\p{L}+)/u, "$<nom>, $<prenom>")); // "Lovelace, Ada"
console.log("Prix : 42".replace(/\d+/, "$& $$")); // "Prix : 42 $"
console.log("a-b-c".replace(/-/g, " / ")); // "a / b / c"
```

Le remplacement peut être une **fonction**, appelée pour chaque correspondance avec `(correspondance, groupe1, groupe2, …, position, texte, groupes)` :

```js
const ttc = "Livre 10 € HT, stylo 2,50 € HT".replace(/(\d+(?:,\d+)?) € HT/g, (tout, montant) => {
  const valeur = Number(montant.replace(",", ".")) * 1.2;
  return `${valeur.toFixed(2).replace(".", ",")} € TTC`;
});
console.log(ttc); // "Livre 12,00 € TTC, stylo 3,00 € TTC"
```

Avec des groupes nommés, le dernier argument est l'objet `groups` : `(...args) => args.at(-1).montant`.

`replaceAll` avec une regex **exige** le drapeau `g` (une erreur plutôt qu'un remplacement partiel silencieux) :

```js
console.log("aaa".replaceAll(/a/g, "b")); // "bbb"
try {
  "aaa".replaceAll(/a/, "b");
} catch (erreur) {
  console.log(erreur.name); // "TypeError"
}
```

### split : découper selon un motif

```js
console.log("un,deux;  trois".split(/[,;]\s*/)); // ["un", "deux", "trois"]
console.log("ligne 1\r\nligne 2\nligne 3".split(/\r?\n/)); // ["ligne 1", "ligne 2", "ligne 3"]
console.log("a1b2c3".split(/\d/)); // ["a", "b", "c", ""]
console.log("a1b2c3".split(/(\d)/)); // ["a", "1", "b", "2", "c", "3", ""] (les groupes capturés sont conservés)
```

### search : trouver la position

```js
console.log("JavaScript".search(/[A-Z]/)); // 0
console.log("javaScript".search(/[A-Z]/)); // 4
console.log("javascript".search(/[A-Z]/)); // -1
```

## Le piège de lastIndex

Une regex avec le drapeau `g` ou `y` a un **état** : la propriété `lastIndex`, qui indique où reprendre la recherche. `test` et `exec` la lisent et la mettent à jour. Réutiliser une telle regex sur plusieurs textes donne des résultats qui alternent :

```js
const motifEmail = /^[^\s@]+@[^\s@]+$/g; // ❌ g inutile pour une validation

const adresses = ["ada@exemple.fr", "alan@exemple.fr", "grace@exemple.fr"];
console.log(adresses.map((adresse) => motifEmail.test(adresse))); // [true, false, true] ❌
```

Après le premier succès, `lastIndex` vaut 14 : le deuxième test commence donc au 14ᵉ caractère de `"alan@exemple.fr"`, échoue, et remet `lastIndex` à 0. Le troisième réussit à nouveau.

Les solutions :

```js
// ✅ 1. Pas de g pour valider
const motifEmail = /^[^\s@]+@[^\s@]+$/;
const adresses = ["ada@exemple.fr", "alan@exemple.fr", "grace@exemple.fr"];
console.log(adresses.map((adresse) => motifEmail.test(adresse))); // [true, true, true]

// ✅ 2. Avec g, remettre lastIndex à zéro (ou créer la regex dans la fonction)
const chiffre = /\d/g;
function contientChiffre(texte) {
  chiffre.lastIndex = 0;
  return chiffre.test(texte);
}
console.log(["a1", "b2", "c3"].map(contientChiffre)); // [true, true, true]
```

Avec `g`, `match`, `replace` et `replaceAll` repartent toujours du début (ils remettent `lastIndex` à zéro) ; `split` et `matchAll` travaillent sur une **copie** de la regex (`matchAll` reprend toutefois le `lastIndex` courant de l'original). Le piège concerne donc surtout `test` et `exec` sur une regex partagée.

Avec `exec` et `g`, cet état est justement ce qui permet de parcourir les correspondances une à une (`matchAll` le fait pour vous) :

```js
const motif = /\d+/g;
const texte = "a1 b22 c333";
let resultat;
const positions = [];
while ((resultat = motif.exec(texte)) !== null) {
  positions.push(resultat.index);
}
console.log(positions); // [1, 4, 8]
```

## Unicode : accents, émojis et propriétés

### Le drapeau u

Sans drapeau `u`, une regex voit le texte comme une suite d'**unités UTF-16** (voir le [chapitre 07](../07-chaines/README.md)) : un émoji compte pour deux « caractères ». Le drapeau `u` (ES2015) la fait raisonner en **points de code**, autorise `\u{…}` et rend la syntaxe plus stricte (un échappement inconnu devient une erreur au lieu d'être ignoré).

```js
console.log("😀".match(/./g).length); // 2 ❌
console.log("😀".match(/./gu).length); // 1 ✅
console.log(/\u{1F600}/u.test("😀")); // true
```

### Les propriétés Unicode \p{…}

Avec `u` (ou `v`), `\p{…}` désigne un caractère selon ses propriétés Unicode, et `\P{…}` son contraire. C'est la façon correcte de parler de « lettres » dans un texte multilingue :

| Motif | Correspond à |
| --- | --- |
| `\p{L}` | une lettre, dans n'importe quelle écriture |
| `\p{Lu}` / `\p{Ll}` | une lettre majuscule / minuscule |
| `\p{N}` / `\p{Nd}` | un chiffre ou nombre / un chiffre décimal (toutes écritures) |
| `\p{P}` | un signe de ponctuation |
| `\p{M}` | un signe combinant (accent décomposé…) |
| `\p{Script=Greek}` | un caractère de l'alphabet grec (`Latin`, `Arabic`, `Han`…) |
| `\p{Extended_Pictographic}` | un pictogramme (émojis…) |

```js
console.log("Élise, Zoë et Ἀθηνᾶ".match(/\p{L}+/gu)); // ["Élise", "Zoë", "et", "Ἀθηνᾶ"]
console.log(/^\p{Lu}/u.test("Émile")); // true (commence par une majuscule)
console.log("Ελληνικά and English".match(/\p{Script=Greek}+/u)[0]); // "Ελληνικά"
console.log("١٢٣ et 123".match(/\d+/g)); // ["123"] (\d : chiffres ASCII seulement)
console.log("١٢٣ et 123".match(/\p{Nd}+/gu)); // ["١٢٣", "123"]
```

> [!WARNING]
> Sans le drapeau `u`, `\p{L}` ne signifie pas « une lettre » mais le texte littéral « p{L} » : `/\p{L}/.test("p{L}")` vaut `true` et `/^\p{L}+$/.test("été")` vaut `false`. N'oubliez jamais le `u` (ou le `v`).

Pour les émojis, méfiez-vous de `\p{Emoji}` : cette propriété inclut les chiffres, `#` et `*` (qui peuvent commencer un émoji « touche »). Préférez `\p{Extended_Pictographic}`, ou mieux `\p{RGI_Emoji}` avec le drapeau `v` :

```js
console.log(/\p{Emoji}/u.test("1")); // true ❌
console.log(/\p{Extended_Pictographic}/u.test("1")); // false ✅
console.log("Validé ✅ en 2 min 🚀".match(/\p{Extended_Pictographic}/gu)); // ["✅", "🚀"]
```

### Le drapeau v (ES2024)

Le drapeau `v` (*unicodeSets*, ES2024 ; Baseline 2023 : Chrome 112, Firefox 116, Safari 17 ; Node.js 20+) remplace `u` en l'améliorant. On ne peut pas combiner les deux. Il apporte :

**Les opérations sur les classes** : différence `--` et intersection `&&`, avec des classes imbriquées.

```js
// Les consonnes : les lettres de a à z, moins les voyelles
console.log("javascript".match(/[[a-z]--[aeiouy]]/gv)); // ["j", "v", "s", "c", "r", "p", "t"]

// Les lettres qui ne sont pas latines
console.log("Pi se dit π, oméga Ω".match(/[\p{L}--\p{Script=Latin}]/gv)); // ["π", "Ω"]

// Les lettres ASCII : intersection de « lettre » et « ASCII »
console.log("Ça va ?".match(/[\p{L}&&\p{ASCII}]/gv)); // ["a", "v", "a"]
```

**Les propriétés de chaînes**, qui correspondent à plusieurs points de code d'un coup, comme les émojis composés :

```js
const famille = "👨‍👩‍👧";

console.log(famille.match(/\p{Extended_Pictographic}/gu).length); // 3 ❌ trois personnes séparées
console.log(famille.match(/\p{RGI_Emoji}/gv).length); // 1 ✅ un seul émoji
console.log("Bravo 🇫🇷 👍🏽 !".match(/\p{RGI_Emoji}/gv)); // ["🇫🇷", "👍🏽"]
```

**Une syntaxe plus stricte dans les classes** : les caractères `( ) [ ] { } / - \ |` doivent y être échappés, et un intervalle utilisé dans une opération doit être entouré de crochets (`[[a-z]--[aeiou]]`). Ces règles évitent des ambiguïtés et permettront d'ajouter de futures fonctionnalités.

```js
try {
  new RegExp("[(]", "v");
} catch (erreur) {
  console.log(erreur.name); // "SyntaxError"
}
console.log(/[\(]/v.test("(")); // true
```

Pour du code neuf manipulant du texte Unicode, `v` est le meilleur choix par défaut.

## Nouveautés ES2025

ES2025 a apporté trois nouveautés aux expressions régulières : `RegExp.escape`, présentée [plus haut](#construire-un-motif-à-partir-dune-saisie--regexpescape), et les deux fonctionnalités ci-dessous.

### Modificateurs de drapeaux locaux

Les **modificateurs** `(?i:…)`, `(?m:…)` et `(?s:…)` activent un drapeau sur une partie du motif seulement ; `(?-i:…)` le désactive localement. Seuls `i`, `m` et `s` sont concernés. D'après MDN : Baseline 2025 (Chrome et Edge 125, Firefox 132, Safari 26), Node.js 23+.

```js
// Le mot-clé est insensible à la casse, le code ne l'est pas
const reference = /^(?i:ref)-[A-Z]{3}$/;
console.log(reference.test("REF-ABC")); // true
console.log(reference.test("ref-ABC")); // true
console.log(reference.test("ref-abc")); // false

// Tout est insensible à la casse, sauf le suffixe
const extension = /^rapport(?-i:\.PDF)$/i;
console.log(extension.test("RAPPORT.PDF")); // true
console.log(extension.test("Rapport.pdf")); // false
```

C'est particulièrement utile quand on assemble un motif à partir de morceaux qui n'ont pas les mêmes besoins.

### Groupes nommés dupliqués

Depuis ES2025, deux groupes peuvent porter le **même nom** s'ils sont dans des alternatives différentes (un seul peut alors correspondre). D'après MDN : Baseline 2024 (Chrome et Edge 125, Firefox 129, Safari 17), Node.js 23+.

```js
// Une année au format « 2026-11 » ou « 11/2026 »
const moisAnnee = /(?<annee>\d{4})-(?<mois>\d{2})|(?<mois>\d{2})\/(?<annee>\d{4})/;

console.log(moisAnnee.exec("2026-11").groups.annee); // "2026"
console.log(moisAnnee.exec("11/2026").groups.annee); // "2026"
console.log(moisAnnee.exec("11/2026").groups.mois); // "11"
```

Le code qui lit `groups.annee` n'a plus à savoir quelle alternative a correspondu. Dans une même alternative, un nom dupliqué reste une `SyntaxError`.

## Valider avec mesure

Une regex vérifie une **forme**, pas une **vérité** : `/^\d{5}$/` dit qu'un texte ressemble à un code postal, pas que ce code existe. Quelques principes :

- Ancrez toujours le motif (`^…$`).
- Nettoyez la saisie d'abord (`trim()`, normalisation, suppression des espaces) plutôt que de tout prévoir dans le motif.
- Préférez plusieurs vérifications simples à une regex illisible, et des messages d'erreur précis (« 5 chiffres attendus »).
- Validez côté serveur aussi : la validation dans le navigateur n'est qu'un confort.

### Le cas de l'adresse e-mail

Il n'existe **pas** de regex parfaite pour les e-mails. La norme (RFC 5322) autorise des formes exotiques (`"jean dupont"@exemple.fr`) et ne dit rien de l'existence de la boîte. Même la spécification HTML, pour `<input type="email">`, assume une **violation volontaire** de la norme avec un motif pragmatique :

```js
// Motif de la spécification HTML pour <input type="email">
const emailHtml =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

console.log(emailHtml.test("ada@exemple.fr")); // true
console.log(emailHtml.test("ada@intranet")); // true (domaine sans point accepté)
console.log(emailHtml.test("élodie@exemple.fr")); // false (pas de caractères non ASCII)
```

Pour une application, un motif volontairement **tolérant** suffit : quelque chose, une arobase, quelque chose, un point, quelque chose. La vraie validation consiste à envoyer un e-mail de confirmation.

```js
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const valides = ["ada@exemple.fr", "prenom.nom+tag@sous.domaine.co.uk", "élodie@exemple.fr"];
const invalides = ["ada@exemple", "ada exemple@x.fr", "@exemple.fr", "ada@@exemple.fr", "ada@.fr"];

console.log(valides.filter((c) => !email.test(c))); // [] (tous acceptés)
console.log(invalides.filter((c) => email.test(c))); // [] (tous refusés)
console.log(email.test("ada@exemple..fr")); // true (limite assumée : on ne cherche pas la perfection)
```

### Les mots de passe

Les assertions avant permettent d'exprimer plusieurs conditions indépendantes :

```js
// Au moins 12 caractères, au moins une lettre et au moins un chiffre
const motDePasse = /^(?=.*\p{L})(?=.*\d).{12,}$/u;

console.log(motDePasse.test("correct cheval 42")); // true
console.log(motDePasse.test("court1")); // false
console.log(motDePasse.test("seulementdeslettres")); // false
console.log(motDePasse.test("123456789012")); // false
```

Les recommandations actuelles (par exemple celles du NIST américain, SP 800-63B) privilégient la **longueur** et la vérification contre des listes de mots de passe compromis, et déconseillent d'imposer des mélanges de types de caractères. Une regex de complexité n'est donc pas une politique de sécurité.

## Performance et ReDoS

### Le retour sur trace

Le moteur de regex de JavaScript procède par **retour sur trace** (*backtracking*) : quand une piste échoue, il revient en arrière et essaie une autre façon de répartir les caractères entre les quantificateurs. D'ordinaire, c'est instantané. Mais si le motif offre un nombre **exponentiel** de façons de découper le texte et que la correspondance finit par échouer, le moteur les essaie toutes.

L'exemple type : un quantificateur dans un quantificateur, `(a+)+`. Un texte de n « a » peut se découper de 2ⁿ⁻¹ façons :

```js
const dangereux = /^(a+)+$/;
const sur = /^a+$/; // même langage reconnu, aucune ambiguïté

for (const n of [16, 18, 20, 22]) {
  const texte = "a".repeat(n) + "!"; // le « ! » final fait échouer la correspondance
  const debut = performance.now();
  dangereux.test(texte);
  console.log(`${n} caractères : ${(performance.now() - debut).toFixed(1)} ms`);
}
console.log(sur.test("a".repeat(100_000) + "!")); // false (instantané)
```

Chaque caractère ajouté **double** le temps de calcul. Mesuré avec Node.js 24 sur un ordinateur portable récent :

| Longueur | Temps |
| --- | --- |
| 20 | ~5 ms |
| 24 | ~70 ms |
| 26 | ~300 ms |
| 30 | ~5 s (extrapolé) |
| 40 | plus d'une heure (extrapolé) |

Pendant ce temps, le fil d'exécution est **bloqué** : dans un navigateur, la page se fige ; sur un serveur Node.js, **plus aucune requête** n'est traitée. Si un attaquant peut envoyer le texte, c'est un déni de service : le **ReDoS** (*Regular expression Denial of Service*). Ce n'est pas théorique : en juillet 2019, une regex mal conçue dans une règle de pare-feu a provoqué une panne mondiale de Cloudflare ; en 2016, Stack Overflow a été indisponible à cause d'une regex du type `\s+$` appliquée à un message contenant environ 20 000 espaces consécutives.

Ce dernier cas est quadratique et non exponentiel, mais tout aussi réel :

```js
const espaces = " ".repeat(20_000) + "x";
const debut = performance.now();
/\s+$/.test(espaces); // pour chaque position de départ, le moteur parcourt toutes les espaces suivantes
console.log(performance.now() - debut > 10); // true (des dizaines de millisecondes pour 20 000 caractères)
console.log(espaces.trimEnd() === espaces); // true (trimEnd : instantané, sans regex)
```

### Les motifs à risque

- Quantificateurs imbriqués : `(a+)+`, `(a*)*`, `(\w+\s?)*`, `(\d+,?)+`.
- Alternatives qui se recouvrent sous un quantificateur : `(a|a)*`, `(\w|\d)+`, `(\d|\d\d)*`.
- Plusieurs `.*` ou `\s*` qui peuvent se partager les mêmes caractères : `.*.*=.*`, `\s*\s*$`.

### Se protéger

1. **Écrire des motifs non ambigus** : pour chaque caractère, une seule partie du motif doit pouvoir le consommer. `(\w+\s?)*` devient `\w+(?:\s\w+)*` (voir l'[exercice 7](#exercice-7--désamorcer-un-redos-)).
2. **Limiter la longueur** des saisies avant d'appliquer une regex (un nom d'utilisateur ne fait pas 100 000 caractères).
3. **Utiliser les méthodes natives** quand elles existent : `trim()`, `includes()`, `URL.canParse()`…
4. **Outiller** : le module ESLint `eslint-plugin-regexp` signale les motifs à risque ; pour des motifs fournis par les utilisateurs, une bibliothèque à temps linéaire comme `re2` (moteur de Google, paquet npm) supprime le problème, au prix de quelques fonctionnalités (ni références arrière, ni assertions avant ou arrière).

### Performance au quotidien

- Une regex **littérale** est préparée une fois par le moteur ; un `new RegExp(…)` dans une boucle crée un nouvel objet à chaque tour (et, selon le moteur, le recompile) : créez-la une fois, hors de la boucle.
- Pour chercher un texte fixe, `includes`, `startsWith` ou `indexOf` sont plus simples et plus rapides.
- Préférez une classe précise (`[^"]*`) à `.*?` : moins de retours en arrière.

## Recettes testées

Chaque recette est accompagnée de cas **valides** et **invalides**. Les deux lignes `filter` doivent afficher `[]` : si un cas apparaît, c'est qu'il est mal classé.

### Code postal français

```js
// 01 à 95 (métropole et Corse), 97 (outre-mer), 98 (Monaco et collectivités du Pacifique)
const codePostal = /^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/;

const valides = ["75011", "20000", "97400", "98000", "01000"];
const invalides = ["7501", "750011", "2A004", "00123", "99999", " 75011"];

console.log(valides.filter((c) => !codePostal.test(c))); // []
console.log(invalides.filter((c) => codePostal.test(c))); // []
```

`2A004` est un code **commune** INSEE (Corse-du-Sud), pas un code postal. Le motif ne garantit pas que le code est attribué : pour cela, il faut la base officielle.

### Numéro de téléphone français

```js
// 0 ou +33, puis 9 chiffres ; séparateur facultatif (espace, point, tiret), toujours le même
const telephone = /^(?:\+33\s?|0)[1-9](?<sep>[\s.-]?)\d{2}(?:\k<sep>\d{2}){3}$/;

const valides = ["06 12 34 56 78", "0612345678", "+33 6 12 34 56 78", "+33612345678", "01.23.45.67.89"];
const invalides = ["06 12 34 56", "00 12 34 56 78", "+33 06 12 34 56 78", "06-12 34.56 78", "06 1234 56 78"];

console.log(valides.filter((c) => !telephone.test(c))); // []
console.log(invalides.filter((c) => telephone.test(c))); // []
```

La référence arrière `\k<sep>` impose d'utiliser le même séparateur partout. Pour stocker le numéro, normalisez-le ensuite : `numero.replace(/\D/g, "")`.

### Date ISO et vérification du calendrier

Le motif vérifie la forme ; `Date` vérifie que le jour existe (le 30 février passe la regex) :

```js
const dateIso = /^(?<annee>\d{4})-(?<mois>0[1-9]|1[0-2])-(?<jour>0[1-9]|[12]\d|3[01])$/;

function estDateIsoValide(texte) {
  const resultat = dateIso.exec(texte);
  if (!resultat) return false;
  const [annee, mois, jour] = [resultat.groups.annee, resultat.groups.mois, resultat.groups.jour].map(Number);
  const date = new Date(Date.UTC(annee, mois - 1, jour));
  return date.getUTCMonth() === mois - 1 && date.getUTCDate() === jour;
}

const valides = ["2026-11-06", "2028-02-29", "2026-12-31"];
const invalides = ["2026-02-29", "2026-02-30", "2026-13-01", "2026-1-6", "06/11/2026", "2026-04-31"];

console.log(valides.filter((c) => !estDateIsoValide(c))); // []
console.log(invalides.filter((c) => estDateIsoValide(c))); // []
```

Si la date n'existe pas, `Date` la fait « déborder » (le 30 février devient le 2 mars) : on le détecte en relisant le mois et le jour. Les dates sont détaillées au [chapitre 15](../15-dates/README.md).

### Couleur hexadécimale CSS

```js
// #rgb, #rgba, #rrggbb ou #rrggbbaa
const couleur = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;

const valides = ["#fff", "#FF8800", "#ff880080", "#abcd"];
const invalides = ["fff", "#ggg", "#fffff", "#ff8800800", "# fff"];

console.log(valides.filter((c) => !couleur.test(c))); // []
console.log(invalides.filter((c) => couleur.test(c))); // []
```

### Slug d'URL

```js
// Minuscules ASCII et chiffres, mots séparés par un seul tiret
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const valides = ["creme-brulee", "chapitre-14", "a"];
const invalides = ["-debut", "fin-", "double--tiret", "Majuscule", "accentué", ""];

console.log(valides.filter((c) => !slug.test(c))); // []
console.log(invalides.filter((c) => slug.test(c))); // []
```

Pour **produire** un slug à partir d'un titre, voir la recette du [chapitre 07](../07-chaines/README.md).

### Extraire les hashtags

```js
// Un # en début de texte ou après un blanc, suivi de lettres, chiffres ou _
const hashtag = /(?<!\S)#[\p{L}\p{N}_]+/gu;

const message = "Vive #JavaScript et le #café2026 ! # seul, https://site.fr/page#ancre";
console.log(message.match(hashtag)); // ["#JavaScript", "#café2026"]
```

L'assertion arrière `(?<!\S)` (« non précédé d'un non-blanc ») évite de prendre l'ancre d'une URL pour un hashtag.

### camelCase et kebab-case

```js
const versKebab = (texte) => texte.replace(/\p{Lu}/gu, (majuscule) => `-${majuscule.toLowerCase()}`);
const versCamel = (texte) => texte.replace(/-(\p{Ll})/gu, (_, lettre) => lettre.toUpperCase());

console.log(versKebab("nombreArticlesPanier")); // "nombre-articles-panier"
console.log(versCamel("nombre-articles-panier")); // "nombreArticlesPanier"
console.log(versKebab("analyseURL")); // "analyse-u-r-l" (limite : les sigles sont découpés)
```

### Analyser une ligne de journal

```js
const ligneJournal = /^(?<date>\S+) (?<niveau>DEBUG|INFO|WARN|ERROR) \[(?<module>[^\]]+)\] (?<message>.*)$/;

const { groups } = ligneJournal.exec("2026-11-06T14:03:12Z ERROR [paiement] Délai dépassé (3000 ms)");
console.log(groups.niveau); // "ERROR"
console.log(groups.module); // "paiement"
console.log(groups.message); // "Délai dépassé (3000 ms)"
console.log(ligneJournal.exec("ligne mal formée")); // null
```

### Remplir un gabarit

```js
function remplir(modele, valeurs) {
  return modele.replace(/\{\{\s*(\w+)\s*\}\}/g, (tout, cle) => (Object.hasOwn(valeurs, cle) ? valeurs[cle] : tout));
}

const modele = "Bonjour {{ prenom }}, votre code est {{code}}. {{inconnu}}";
console.log(remplir(modele, { prenom: "Inès", code: "A42" })); // "Bonjour Inès, votre code est A42. {{inconnu}}"
```

Les clés absentes restent visibles, ce qui facilite le débogage. `Object.hasOwn` évite d'aller chercher des propriétés héritées comme `toString`.

### Surligner un terme recherché

```js
function surligner(texte, terme) {
  const motif = new RegExp(RegExp.escape(terme), "gi");
  return texte.replace(motif, "<mark>$&</mark>");
}

console.log(surligner("J'aime le C++ et le c++ moderne", "c++")); // "J'aime le <mark>C++</mark> et le <mark>c++</mark> moderne"
```

Pour insérer le résultat dans une page, le texte doit d'abord être échappé (voir la recette « Échapper du HTML » du [chapitre 07](../07-chaines/README.md)), sinon c'est une faille XSS.

### Séparateur de milliers

```js
const grouper = (entier) => entier.replace(/\B(?=(?:\d{3})+(?!\d))/g, " ");

console.log(grouper("1234567")); // "1 234 567"
console.log(grouper("999")); // "999"
```

L'assertion avant cherche les positions suivies d'un multiple de trois chiffres jusqu'à la fin du nombre, et `\B` exclut le tout début. C'est un excellent exercice de lecture ; en production, `Intl.NumberFormat` fait mieux et selon la langue (voir le [chapitre 08](../08-nombres-et-math/README.md)).

### Analyseur lexical avec le drapeau y

Pour découper une petite expression en **jetons**, on essaie toutes les sortes de jetons à la position courante, grâce au drapeau `y`. Si rien ne correspond, on sait exactement où est l'erreur :

```js
function decouper(source) {
  const jeton = /(?<espace>\s+)|(?<nombre>\d+(?:\.\d+)?)|(?<nom>[a-z]+)|(?<operateur>[-+*\/()])/y;
  const jetons = [];
  while (jeton.lastIndex < source.length) {
    const position = jeton.lastIndex;
    const resultat = jeton.exec(source);
    if (resultat === null) {
      throw new SyntaxError(`Caractère inattendu « ${source[position]} » à la position ${position}`);
    }
    const [type, valeur] = Object.entries(resultat.groups).find(([, v]) => v !== undefined);
    if (type !== "espace") jetons.push(`${type}:${valeur}`);
  }
  return jetons;
}

console.log(decouper("12 + 3.5*(x - 4)")); // ["nombre:12", "operateur:+", "nombre:3.5", "operateur:*", "operateur:(", "nom:x", "operateur:-", "nombre:4", "operateur:)"]

try {
  decouper("12 + 3 $ 4");
} catch (erreur) {
  console.log(erreur.message); // "Caractère inattendu « $ » à la position 7"
}
```

Sans `y`, `exec` sauterait silencieusement le `$` pour trouver le jeton suivant.

## Déboguer et documenter un motif

- Testez vos motifs sur [regex101.com](https://regex101.com/) en choisissant la saveur **ECMAScript (JavaScript)** : le site explique chaque morceau et montre les étapes du moteur.
- Écrivez les cas valides et invalides **avant** le motif, comme dans les recettes ci-dessus, et gardez-les en tests (voir le [chapitre 29](../29-tests/README.md)).
- JavaScript n'a pas de mode « verbeux » permettant les commentaires dans un motif. Pour un motif long, assemblez-le à partir de morceaux nommés :

```js
const annee = String.raw`(?<annee>\d{4})`;
const mois = String.raw`(?<mois>0[1-9]|1[0-2])`;
const jour = String.raw`(?<jour>0[1-9]|[12]\d|3[01])`;
const dateIso = new RegExp(`^${annee}-${mois}-${jour}$`);

console.log(dateIso.source); // "^(?<annee>\\d{4})-(?<mois>0[1-9]|1[0-2])-(?<jour>0[1-9]|[12]\\d|3[01])$"
console.log(dateIso.test("2026-11-06")); // true
```

## Pièges courants

- **Oublier les ancres** pour valider : `/\d{5}/` accepte `"abc123456"`.
- **Un `g` sur une regex de validation** réutilisée avec `test` : résultats alternés à cause de `lastIndex`.
- **`\w`, `\d`, `\b` avec du français** : ASCII seulement. Utilisez `\p{L}`, `\p{N}` et des assertions.
- **`\p{…}` sans drapeau `u` ou `v`** : il est lu comme le texte « p{…} ».
- **Le `.` qui ne traverse pas les lignes** : ajoutez `s`, ou utilisez `[^]`… avec parcimonie.
- **Gourmandise** : `<.+>` avale tout jusqu'au dernier `>`. Utilisez `[^>]+` ou `+?`.
- **Priorité de `|`** : `/^a|b$/` n'est pas `/^(?:a|b)$/`.
- **`match` qui renvoie `null`** au lieu d'un tableau vide.
- **`replaceAll` ou `matchAll` sans `g`** : `TypeError`.
- **`$` dans une chaîne de remplacement** : `$&`, `$1`… sont interprétés ; passez une fonction pour un texte arbitraire.
- **Saisie utilisateur insérée dans `new RegExp`** sans `RegExp.escape`.
- **`new RegExp("\d")`** : la barre oblique inverse disparaît dans la chaîne ; doublez-la ou utilisez `String.raw`.
- **Quantificateurs imbriqués** (`(a+)+`, `(\w+\s?)*`) : risque de ReDoS.

## Bonnes pratiques

- Demandez-vous d'abord si une méthode de chaîne ou une API dédiée (`URL`, `JSON.parse`, `Intl`, `Date`) suffit.
- Ancrez les motifs de validation ; nettoyez les saisies avant de les valider.
- Drapeau `v` (ou `u`) par défaut pour tout texte humain ; `\p{L}` plutôt que `[a-zA-Z]`.
- Groupes nommés plutôt que numérotés, groupes non capturants `(?:…)` quand la valeur ne sert pas.
- Pas de `g` sur une regex qui ne sert qu'à `test`.
- `RegExp.escape` pour tout texte externe inséré dans un motif.
- Motifs sans ambiguïté, longueur des saisies limitée, `eslint-plugin-regexp` dans le projet.
- Des cas valides **et** invalides pour chaque motif, conservés comme tests.
- Un motif trop long à lire est un signal : découpez-le en morceaux nommés, ou en plusieurs vérifications simples.

## Résumé

- Une regex se crée littéralement (`/motif/drapeaux`) ou avec `new RegExp(chaine, drapeaux)` (barres obliques inverses doublées) ; `RegExp.escape` (ES2025) protège les saisies.
- Syntaxe : classes (`\d`, `[a-z]`, `[^…]`), quantificateurs gourmands ou paresseux (`+?`), ancres (`^`, `$`, `\b`), alternance (`|`, faible priorité), groupes (capturants, `(?:…)`, nommés `(?<nom>…)`), références arrière (`\1`, `\k<nom>`), assertions (`(?=…)`, `(?!…)`, `(?<=…)`, `(?<!…)`).
- Drapeaux : `g` (tout), `i` (casse), `m` (lignes), `s` (`.` et `\n`), `u`/`v` (Unicode), `y` (position exacte), `d` (indices).
- Méthodes : `test` (booléen), `exec`/`match` (détails), `matchAll` (itérateur, exige `g`), `replace`/`replaceAll` (avec `$1`, `$<nom>` ou une fonction), `split`, `search`.
- `g` et `y` rendent la regex **avec état** (`lastIndex`) : attention à `test` et `exec`.
- `\w`, `\d`, `\b` sont ASCII ; `\p{L}`, `\p{N}`, `\p{RGI_Emoji}` (avec `v`) gèrent toutes les langues et les émojis.
- ES2025 : `RegExp.escape`, modificateurs `(?i:…)` et groupes nommés dupliqués dans des alternatives.
- Une regex valide une forme, pas une vérité ; pas de regex parfaite pour les e-mails.
- Les quantificateurs imbriqués peuvent rendre une regex exponentielle (ReDoS) : motifs non ambigus et saisies bornées.

## Exercices

### Exercice 1 — Plaque d'immatriculation (★☆☆)

Les plaques françaises récentes ont la forme `AB-123-CD` : deux lettres, trois chiffres, deux lettres, séparés par des tirets. Les lettres I, O et U ne sont jamais utilisées. Écrivez le motif de deux façons : avec des intervalles classiques, puis avec la différence de classes du drapeau `v`.

<details>
<summary>Solution</summary>

```js
const plaqueClassique = /^[A-HJ-NP-TV-Z]{2}-\d{3}-[A-HJ-NP-TV-Z]{2}$/;
const plaqueV = /^[[A-Z]--[IOU]]{2}-\d{3}-[[A-Z]--[IOU]]{2}$/v;

const valides = ["AB-123-CD", "FG-007-HJ", "ZZ-999-ZZ"];
const invalides = ["AB-123-CI", "AO-123-CD", "ab-123-cd", "AB123CD", "AB-12-CD", "AB-1234-CD"];

for (const plaque of [plaqueClassique, plaqueV]) {
  console.log(valides.filter((c) => !plaque.test(c))); // []
  console.log(invalides.filter((c) => plaque.test(c))); // []
}
```

`[A-HJ-NP-TV-Z]` énumère les intervalles en sautant I, O et U ; c'est correct mais difficile à relire. Avec `v`, `[[A-Z]--[IOU]]` dit exactement l'intention : « les majuscules, sauf I, O et U ». Notez les crochets autour de `A-Z`, obligatoires dans une opération sur les classes.

</details>

### Exercice 2 — Reformater des dates (★☆☆)

Dans un texte, remplacez toutes les dates `JJ/MM/AAAA` par `AAAA-MM-JJ`, avec des groupes nommés. Les dates mal formées (`1/1/2027`) restent inchangées.

```text
"Du 06/11/2026 au 24/12/2026, puis le 1/1/2027."
→ "Du 2026-11-06 au 2026-12-24, puis le 1/1/2027."
```

<details>
<summary>Solution</summary>

```js
function versIso(texte) {
  return texte.replace(/\b(?<jour>\d{2})\/(?<mois>\d{2})\/(?<annee>\d{4})\b/g, "$<annee>-$<mois>-$<jour>");
}

console.log(versIso("Du 06/11/2026 au 24/12/2026, puis le 1/1/2027.")); // "Du 2026-11-06 au 2026-12-24, puis le 1/1/2027."
console.log(versIso("Réf. 123/45/67890")); // "Réf. 123/45/67890"
```

Les `\b` empêchent de prendre un morceau d'un nombre plus long (`123/45/67890` n'est pas modifié). Ici, `\b` convient car il ne touche que des chiffres, qui sont bien des caractères `\w`.

</details>

### Exercice 3 — Extraire les nombres d'un texte (★★☆)

Écrivez `extraireNombres(texte)` qui renvoie, sous forme de `number`, tous les nombres d'un texte en français : entiers ou décimaux à virgule, éventuellement négatifs. Une suite comme `2,5,1` (numéro de version) ne doit rien produire.

```text
extraireNombres("Il fait -3,5 °C, 12 personnes, 0,75 L")  → [-3.5, 12, 0.75]
extraireNombres("version 2,5,1")                          → []
```

<details>
<summary>Solution</summary>

```js
function extraireNombres(texte) {
  const nombre = /(?<![\d,])-?\d+(?:,\d+)?(?![\d,])/g;
  return Array.from(texte.matchAll(nombre), (resultat) => Number(resultat[0].replace(",", ".")));
}

console.log(extraireNombres("Il fait -3,5 °C, 12 personnes, 0,75 L")); // [-3.5, 12, 0.75]
console.log(extraireNombres("version 2,5,1")); // []
console.log(extraireNombres("Aucun chiffre ici")); // []
```

Le cœur du motif est `-?\d+(?:,\d+)?` : un signe facultatif, des chiffres, puis éventuellement une virgule et des chiffres. Les assertions `(?<![\d,])` et `(?![\d,])` refusent un nombre collé à un chiffre ou à une virgule, ce qui élimine `2,5,1`. Attention : dans « 12, 13 », la virgule suivie d'une espace n'est pas collée au nombre suivant, donc les deux nombres sont bien trouvés. `matchAll` renvoie un itérateur que `Array.from` transforme en tableau, avec une fonction de conversion.

</details>

### Exercice 4 — Mots répétés (★★☆)

Écrivez `motsRepetes(texte)` qui trouve les mots répétés par erreur (« le le », « est est »), sans tenir compte de la casse et en gérant les accents. « Elle elle-même » ne doit pas être signalé. Quelle est la limite de cette détection en français ?

<details>
<summary>Solution</summary>

```js
function motsRepetes(texte) {
  const repetition = /(?<![\p{L}\p{N}_-])(?<mot>[\p{L}\p{N}_]+)\s+\k<mot>(?![\p{L}\p{N}_-])/giu;
  return Array.from(texte.matchAll(repetition), (resultat) => resultat[0]);
}

console.log(motsRepetes("Le le chat est est là. Il a a un nouveau nouveau collier. Elle elle-même.")); // ["Le le", "est est", "a a", "nouveau nouveau"]
console.log(motsRepetes("C'est l'été été")); // ["été été"]
console.log(motsRepetes("Nous nous voyons demain")); // ["Nous nous"] (faux positif !)
```

Le groupe nommé capture un mot, puis `\k<mot>` exige la même suite de lettres après des blancs ; le drapeau `i` rend la référence arrière insensible à la casse (« Le le »). Les assertions jouent le rôle de `\b` en version Unicode, et le tiret dans les classes évite de couper « elle-même ». Limite : en français, certaines répétitions sont correctes (« nous nous voyons », « vous vous trompez ») ; un correcteur réel proposerait donc une vérification plutôt qu'une correction automatique.

</details>

### Exercice 5 — Masquer les numéros de téléphone (★★☆)

Pour anonymiser des messages, remplacez chaque numéro de téléphone français trouvé dans un texte par `** ** ** ** 78` (seuls les deux derniers chiffres restent visibles), quel que soit le séparateur utilisé.

```text
"Appelez le 06 12 34 56 78 ou le 01.23.45.67.89, pas le 1234."
→ "Appelez le ** ** ** ** 78 ou le ** ** ** ** 89, pas le 1234."
```

<details>
<summary>Solution</summary>

```js
function masquerTelephones(texte) {
  const telephone = /(?<!\d)(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){3}[\s.-]?(?<fin>\d{2})(?!\d)/g;
  return texte.replace(telephone, (...args) => `** ** ** ** ${args.at(-1).fin}`);
}

console.log(masquerTelephones("Appelez le 06 12 34 56 78 ou le 01.23.45.67.89, pas le 1234.")); // "Appelez le ** ** ** ** 78 ou le ** ** ** ** 89, pas le 1234."
console.log(masquerTelephones("Mon numéro : +33612345678")); // "Mon numéro : ** ** ** ** 78"
console.log(masquerTelephones("Commande 061234567891")); // "Commande 061234567891"
```

Le motif reprend celui de la recette, sans ancres puisqu'on cherche **dans** un texte, et isole les deux derniers chiffres dans un groupe nommé. Les assertions `(?<!\d)` et `(?!\d)` évitent de masquer une partie d'un nombre plus long. Avec une fonction de remplacement, le dernier argument est l'objet `groups`.

</details>

### Exercice 6 — Lire un fichier .env (★★★)

Un fichier `.env` contient des lignes `CLE=valeur`. Écrivez `lireEnv(texte)` qui renvoie un objet, en gérant : espaces autour de `=` et en début de ligne, valeurs entre guillemets simples ou doubles, valeurs vides, et en ignorant les commentaires (`#`) et les lignes invalides. Un seul `matchAll` doit suffire.

```js
const fichier = `# Configuration
PORT=3000
NOM_APP="Mon application"
VIDE=
  DEBUG = true
URL=https://exemple.fr/?a=1&b=2
ligne invalide
CITATION='il a dit "oui"'`;
console.log(fichier.split("\n").length); // 8
```

<details>
<summary>Solution</summary>

```js
const fichier = `# Configuration
PORT=3000
NOM_APP="Mon application"
VIDE=
  DEBUG = true
URL=https://exemple.fr/?a=1&b=2
ligne invalide
CITATION='il a dit "oui"'`;

function lireEnv(texte) {
  const ligne =
    /^[ \t]*(?<cle>[A-Z_][A-Z0-9_]*)[ \t]*=[ \t]*(?:"(?<guillemets>[^"]*)"|'(?<apostrophes>[^']*)'|(?<brut>[^\n]*?))[ \t]*$/gm;
  return Object.fromEntries(
    Array.from(texte.matchAll(ligne), ({ groups }) => [
      groups.cle,
      groups.guillemets ?? groups.apostrophes ?? groups.brut,
    ]),
  );
}

console.log(lireEnv(fichier)); // { PORT: "3000", NOM_APP: "Mon application", VIDE: "", DEBUG: "true", URL: "https://exemple.fr/?a=1&b=2", CITATION: "il a dit \"oui\"" }
```

Le drapeau `m` fait correspondre `^` et `$` à chaque ligne. Les blancs sont écrits `[ \t]` et non `\s` : `\s` inclut le saut de ligne, et `VIDE=` « mangerait » alors la ligne suivante. Les trois formes de valeur sont trois alternatives nommées ; une seule correspond, les autres valent `undefined`, d'où la chaîne de `??`. La valeur brute est paresseuse (`*?`) pour laisser `[ \t]*$` retirer les espaces finales. Les commentaires et lignes invalides ne correspondent simplement pas au motif. (Pour un vrai projet, Node.js sait lire ces fichiers avec `--env-file` et `process.loadEnvFile()` : voir le [chapitre 27](../27-nodejs/README.md).)

</details>

### Exercice 7 — Désamorcer un ReDoS (★★★)

Ce motif vérifie qu'un texte est une suite de mots séparés par une espace, avec une espace finale facultative :

```js
const phrase = /^(\w+\s?)*$/;
console.log(phrase.test("un deux trois")); // true
```

1. Expliquez pourquoi il est vulnérable.
2. Mesurez son temps sur `"a".repeat(n) + "!"` pour quelques valeurs de n.
3. Réécrivez-le pour qu'il accepte et refuse **exactement** les mêmes textes, en temps linéaire.

<details>
<summary>Solution</summary>

```js
const lente = /^(\w+\s?)*$/;
const rapide = /^(?:\w+(?:\s\w+)*\s?)?$/;

// 3. Mêmes résultats sur des cas variés
const cas = ["un deux trois", "un deux trois ", "un  deux", " un", "", "un-deux", "mot"];
console.log(cas.every((c) => lente.test(c) === rapide.test(c))); // true

// 2. Mesures
for (const n of [16, 18, 20, 22]) {
  const texte = "a".repeat(n) + "!";
  let debut = performance.now();
  lente.test(texte);
  const dureeLente = performance.now() - debut;
  debut = performance.now();
  rapide.test(texte);
  const dureeRapide = performance.now() - debut;
  console.log(`n = ${n} : ${dureeLente.toFixed(1)} ms contre ${dureeRapide.toFixed(3)} ms`);
}
console.log(rapide.test("a".repeat(1_000_000) + "!")); // false (instantané)
```

1. L'espace étant facultative (`\s?`), le groupe répété `(\w+\s?)*` peut découper « aaaa » de nombreuses façons : « aaaa », « a|aaa », « aa|aa », « a|a|aa »… soit 2ⁿ⁻¹ façons pour n lettres. Quand le `!` final fait échouer la correspondance, le moteur les essaie toutes.
2. Le temps double à chaque caractère ajouté (quelques millisecondes à n = 20, plusieurs secondes vers n = 30).
3. Dans la version réécrite, chaque caractère n'a qu'une seule place possible : un premier mot, puis des groupes « une espace **obligatoire** + un mot », puis une espace finale facultative ; le tout est facultatif pour accepter le texte vide, comme l'original. Il n'y a plus d'ambiguïté, donc plus de retour sur trace exponentiel.

</details>

## Pour aller plus loin

- [MDN — Guide des expressions régulières](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Regular_expressions) et [référence de RegExp](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/RegExp).
- [MDN — RegExp.escape](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape).
- [regex101](https://regex101.com/) : tester et comprendre un motif pas à pas (choisir « ECMAScript »).
- [Regular-Expressions.info](https://www.regular-expressions.info/) : la référence la plus complète sur les moteurs et le retour sur trace.
- [OWASP — ReDoS](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS) et [le compte rendu de la panne Cloudflare de 2019](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/).
- [V8 — An additional non-backtracking RegExp engine](https://v8.dev/blog/non-backtracking-regexp) : comment V8 explore un moteur à temps linéaire.
- [eslint-plugin-regexp](https://ota-meshi.github.io/eslint-plugin-regexp/) : règles ESLint pour détecter les motifs fragiles ou dangereux.

---

[← Chapitre précédent](../13-iterateurs-generateurs/README.md) · [Sommaire](../README.md#sommaire) · [Chapitre suivant →](../15-dates/README.md)
