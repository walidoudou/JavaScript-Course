# 08 — Nombres et Math

> **Niveau** : Débutant à intermédiaire · **Durée** : ~3 h · **Prérequis** : [Types et opérateurs](../03-types-et-operateurs/README.md), [Chaînes de caractères](../07-chaines/README.md)

Calculer un total, afficher un prix, convertir une saisie, tirer un nombre au hasard : les nombres sont partout. Ils réservent aussi des surprises célèbres, comme `0.1 + 0.2` qui ne vaut pas `0.3`. Ce chapitre explique d'où viennent ces surprises, puis présente les outils pour convertir, calculer, arrondir et formater sans erreur : `Number`, `Math`, `Intl.NumberFormat`, `BigInt` et l'aléatoire.

## Objectifs

- Expliquer pourquoi `0.1 + 0.2 !== 0.3` et comparer correctement des nombres à virgule.
- Connaître les limites du type `number` (entiers sûrs, `NaN`, `Infinity`, `-0`) et les tester avec les bonnes fonctions.
- Convertir une saisie en nombre de façon fiable (`Number`, `parseInt` avec base, `parseFloat`).
- Formater nombres, prix, pourcentages et unités pour un public francophone avec `Intl.NumberFormat`.
- Utiliser `Math` : arrondis, puissances, racines, trigonométrie, logarithmes, aléatoire.
- Générer des valeurs aléatoires adaptées à la sécurité (`crypto`).
- Manipuler de grands entiers avec `BigInt` et des montants d'argent sans erreur d'arrondi.

## Sommaire

- [Un type number pour presque tout](#un-type-number-pour-presque-tout)
- [La précision des nombres à virgule](#la-précision-des-nombres-à-virgule)
- [Les limites du type number](#les-limites-du-type-number)
- [Valeurs spéciales : NaN, Infinity et -0](#valeurs-spéciales--nan-infinity-et--0)
- [Convertir une chaîne en nombre](#convertir-une-chaîne-en-nombre)
- [Formater un nombre](#formater-un-nombre)
- [Intl.NumberFormat](#intlnumberformat)
- [L'objet Math](#lobjet-math)
- [Additionner précisément avec Math.sumPrecise](#additionner-précisément-avec-mathsumprecise)
- [Nombres aléatoires](#nombres-aléatoires)
- [BigInt : les grands entiers](#bigint--les-grands-entiers)
- [Manipuler de l'argent](#manipuler-de-largent)
- [Recettes](#recettes)
- [Pièges courants](#pièges-courants)
- [Bonnes pratiques](#bonnes-pratiques)
- [Résumé](#résumé)
- [Exercices](#exercices)
- [Pour aller plus loin](#pour-aller-plus-loin)

> [!NOTE]
> Dans les commentaires de résultat, les chaînes sont écrites entre guillemets (`// "3.14"`) pour les distinguer des nombres (`// 3.14`).

## Un type number pour presque tout

JavaScript n'a pas de type distinct pour les entiers et les nombres à virgule : `42` et `42.5` sont tous deux des `number`, stockés comme des **flottants double précision** sur 64 bits (norme IEEE 754). Le seul autre type numérique est `bigint`, réservé aux très grands entiers ([voir plus bas](#bigint--les-grands-entiers)).

```js
console.log(typeof 42); // "number"
console.log(typeof 42.5); // "number"
console.log(Number.isInteger(5.0)); // true (5.0 et 5 sont le même nombre)
console.log(42 === 42.0); // true
```

### Écrire un nombre

| Écriture | Exemple | Valeur |
| --- | --- | --- |
| Décimale | `42`, `3.14`, `.5` | 42, 3,14, 0,5 |
| Exposant | `1e6`, `2.5e-3` | 1 000 000, 0,0025 |
| Hexadécimale | `0xff` | 255 |
| Octale (ES2015) | `0o17` | 15 |
| Binaire (ES2015) | `0b1010` | 10 |
| Avec séparateurs (ES2021) | `1_000_000`, `0b1010_0001` | 1 000 000, 161 |

```js
const budget = 1_500_000; // le _ ne sert qu'à la lisibilité
const masque = 0b1111_0000;
const couleur = 0xff_88_00;

console.log(budget); // 1500000
console.log(masque); // 240
console.log(couleur); // 16746496
console.log(2.5e-3); // 0.0025
```

Les séparateurs numériques `_` sont ignorés par le moteur. Ils ne peuvent apparaître qu'entre deux chiffres (ni au début, ni à la fin, ni doublés) et ne sont **pas** reconnus par `Number("1_000")` ou `parseInt`.

> [!WARNING]
> Un zéro initial ne fait pas un nombre décimal : en mode strict (donc dans les modules), `017` est une **erreur de syntaxe** (ancienne notation octale). Utilisez `0o17` si vous voulez vraiment de l'octal, et ne mettez jamais de zéro devant un entier décimal.

Pour appeler une méthode directement sur un entier littéral, entourez-le de parenthèses : `42.toFixed(1)` est une erreur de syntaxe (le point est lu comme une virgule décimale), `(42).toFixed(1)` fonctionne.

## La précision des nombres à virgule

### Pourquoi 0.1 + 0.2 ne vaut pas 0.3

```js
console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false
console.log(1.1 + 2.2); // 3.3000000000000003
console.log(0.3 - 0.1); // 0.19999999999999998
console.log(4.35 * 100); // 434.99999999999994
```

Ce n'est pas un bogue de JavaScript : Python, Java, C# ou C donnent les mêmes résultats, car ils utilisent la même norme. L'ordinateur calcule en **binaire**, et la plupart des fractions décimales n'ont pas d'écriture binaire finie, exactement comme 1/3 n'a pas d'écriture décimale finie (0,3333…). `0.1` est donc arrondi au flottant le plus proche, qui vaut un tout petit peu plus que 0,1 :

```js
console.log((0.1).toFixed(20)); // "0.10000000000000000555"
console.log((0.3).toFixed(20)); // "0.29999999999999998890"
console.log((0.1).toString(2)); // "0.0001100110011001100110011001100110011001100110011001101"
```

Quand on additionne deux valeurs déjà arrondies, les petites erreurs s'ajoutent, et le résultat peut tomber sur un flottant voisin de celui qu'on attendait.

Un `number` occupe 64 bits : 1 bit de signe, 11 bits d'exposant et 52 bits de mantisse. Cela donne environ **15 à 17 chiffres significatifs** de précision, ce qui est largement suffisant pour la plupart des calculs, à condition de savoir ce qui est exact et ce qui ne l'est pas :

- Les **entiers** jusqu'à 2⁵³ sont représentés exactement, et les additions, soustractions et multiplications d'entiers donnent des résultats exacts tant qu'on reste dans cette limite.
- Les **fractions décimales** (0,1 ; 19,99 ; 4,35) sont presque toujours approchées.

D'où la règle d'or pour l'argent : [calculer en centimes entiers](#manipuler-de-largent).

### Comparer des nombres à virgule

On ne compare pas deux résultats de calcul avec `===`, mais on vérifie que leur écart est négligeable. `Number.EPSILON` (environ 2,2 × 10⁻¹⁶) est l'écart entre 1 et le flottant suivant : c'est la bonne échelle pour des nombres proches de 1, mais pas pour des grands nombres. Une tolérance **relative** fonctionne à toutes les échelles :

```js
function presqueEgal(a, b, tolerance = Number.EPSILON) {
  return Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b));
}

console.log(presqueEgal(0.1 + 0.2, 0.3)); // true
console.log(presqueEgal(1_000_000.1 + 0.2, 1_000_000.3)); // true
console.log(Math.abs(1_000_000.1 + 0.2 - 1_000_000.3) < Number.EPSILON); // false (tolérance absolue trop stricte)
console.log(presqueEgal(0.3, 0.31)); // false
```

Pour des mesures physiques ou des calculs approchés, choisissez une tolérance adaptée au métier (`1e-9`, un millimètre, un centime…) plutôt que `Number.EPSILON`.

## Les limites du type number

### Entiers sûrs

Au-delà de 2⁵³ − 1, tous les entiers ne sont plus représentables : deux entiers différents peuvent devenir le même `number`.

```js
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991 (2 ** 53 - 1)
console.log(Number.MIN_SAFE_INTEGER); // -9007199254740991
console.log(2 ** 53 + 1); // 9007199254740992 ❌ le + 1 est perdu
console.log(2 ** 53 === 2 ** 53 + 1); // true
console.log(Number.isSafeInteger(2 ** 53 - 1)); // true
console.log(Number.isSafeInteger(2 ** 53)); // false
```

Ce problème apparaît très concrètement avec les **identifiants** renvoyés par certaines API (réseaux sociaux, bases de données distribuées) qui dépassent cette limite :

```js
const reponse = '{"id": 12345678901234567890}';
console.log(JSON.parse(reponse).id); // 12345678901234567000 ❌ ce n'est plus le même identifiant
```

Traitez ces identifiants comme des **chaînes** (ou des `BigInt` si vous devez calculer avec). Les solutions côté JSON (`JSON.rawJSON`, accès au texte source dans le *reviver*, ES2026) sont présentées au [chapitre 25](../25-json-et-stockage/README.md).

### Plus grand, plus petit

```js
console.log(Number.MAX_VALUE); // 1.7976931348623157e+308
console.log(Number.MAX_VALUE * 2); // Infinity (dépassement)
console.log(Number.MIN_VALUE); // 5e-324 (le plus petit nombre POSITIF, pas le plus négatif !)
console.log(Number.MIN_VALUE / 2); // 0 (trop petit : arrondi à zéro)
```

> [!CAUTION]
> `Number.MIN_VALUE` n'est pas le nombre le plus négatif, mais le plus petit nombre strictement positif. Pour initialiser une recherche de maximum, utilisez `-Infinity`.

## Valeurs spéciales : NaN, Infinity et -0

### NaN

`NaN` (*Not a Number*) est le résultat d'une opération numérique impossible. Paradoxalement, son type est `"number"`, et c'est la seule valeur qui n'est pas égale à elle-même.

```js
console.log(0 / 0); // NaN
console.log(Math.sqrt(-1)); // NaN
console.log(Number("abc")); // NaN
console.log(typeof NaN); // "number"
console.log(NaN === NaN); // false
console.log(NaN + 5); // NaN (NaN contamine tous les calculs)
```

Pour tester `NaN`, utilisez `Number.isNaN` (ES2015). L'ancienne fonction globale `isNaN` convertit d'abord son argument en nombre, ce qui donne des réponses trompeuses :

```js
console.log(Number.isNaN(NaN)); // true
console.log(Number.isNaN("abc")); // false ✅ "abc" est une chaîne, pas NaN
console.log(isNaN("abc")); // true ❌ "abc" est d'abord converti en NaN
console.log(isNaN("")); // false ❌ "" est converti en 0
console.log(Object.is(NaN, NaN)); // true
console.log([NaN].includes(NaN)); // true
console.log([NaN].indexOf(NaN)); // -1 (indexOf utilise ===)
```

### Infinity

```js
console.log(1 / 0); // Infinity
console.log(-1 / 0); // -Infinity
console.log(Infinity - Infinity); // NaN
console.log(Math.max()); // -Infinity (maximum d'aucune valeur)
console.log(Number.isFinite(1 / 0)); // false
```

Diviser par zéro ne lève pas d'erreur en JavaScript : le résultat est `Infinity`, `-Infinity` ou `NaN`. Vérifiez vos diviseurs quand ils peuvent être nuls.

### Le zéro négatif

La norme IEEE 754 distingue `0` et `-0`. Ils sont égaux pour `===`, mais pas pour `Object.is`, et le signe réapparaît dans certains calculs :

```js
console.log(-0 === 0); // true
console.log(Object.is(-0, 0)); // false
console.log(1 / -0); // -Infinity
console.log(Math.round(-0.4)); // -0
console.log(String(-0)); // "0" (le signe disparaît à la conversion en chaîne)
```

En pratique, `-0` pose rarement problème, sauf si vous affichez un résultat avec `console.log` (qui montre `-0`) ou avec `Intl.NumberFormat` (qui affiche `-0`). `Math.round(x) || 0` ou `x + 0` le ramènent à `0`.

### Tester une valeur numérique

| Fonction | Vrai pour | Convertit l'argument ? |
| --- | --- | --- |
| `Number.isNaN(x)` | `NaN` uniquement | non ✅ |
| `isNaN(x)` | tout ce qui devient `NaN` (`"abc"`, `undefined`…) | oui ❌ |
| `Number.isFinite(x)` | les nombres finis | non ✅ |
| `isFinite(x)` | tout ce qui devient un nombre fini (`"42"`…) | oui ❌ |
| `Number.isInteger(x)` | les nombres entiers | non |
| `Number.isSafeInteger(x)` | les entiers entre `MIN_SAFE_INTEGER` et `MAX_SAFE_INTEGER` | non |

```js
console.log(Number.isFinite("42")); // false (une chaîne n'est pas un nombre)
console.log(isFinite("42")); // true
console.log(Number.isInteger(5.5)); // false
console.log(Number.isInteger("5")); // false
```

Retenez : **les versions `Number.is…` ne convertissent jamais**, ce qui les rend prévisibles.

## Convertir une chaîne en nombre

### Number, parseInt, parseFloat

Trois outils, trois comportements :

- `Number(x)` (ou le `+` unaire) convertit **toute** la chaîne et renvoie `NaN` au moindre caractère invalide (les espaces autour sont tolérés).
- `parseInt(x, base)` lit un **entier** au début de la chaîne et s'arrête au premier caractère invalide.
- `parseFloat(x)` lit un **nombre décimal** au début de la chaîne, toujours en base 10.

| Entrée | `Number(x)` | `parseInt(x, 10)` | `parseFloat(x)` |
| --- | --- | --- | --- |
| `"42"` | 42 | 42 | 42 |
| `"42.7"` | 42.7 | 42 | 42.7 |
| `"42px"` | `NaN` | 42 | 42 |
| `"  12  "` | 12 | 12 | 12 |
| `"1e3"` | 1000 | 1 | 1000 |
| `"0x1F"` | 31 | 0 | 0 |
| `"3,14"` | `NaN` | 3 | 3 |
| `"1_000"` | `NaN` | 1 | 1 |
| `""` | **0** ❌ | `NaN` | `NaN` |
| `null` | **0** ❌ | `NaN` | `NaN` |
| `undefined` | `NaN` | `NaN` | `NaN` |
| `true` | 1 | `NaN` | `NaN` |

```js
console.log(Number("42")); // 42
console.log(Number("42px")); // NaN
console.log(Number("")); // 0 ❌ une saisie vide devient 0
console.log(+"3.14"); // 3.14
console.log(parseInt("42px", 10)); // 42
console.log(parseInt("1010", 2)); // 10 (lecture en binaire)
console.log(parseInt("ff", 16)); // 255
console.log(parseFloat("3.14 €")); // 3.14
```

> [!IMPORTANT]
> Passez **toujours** la base à `parseInt` : `parseInt(x, 10)`. Sans elle, une chaîne qui commence par `0x` est lue en hexadécimal, et le lecteur du code doit deviner votre intention.

Deux pièges classiques de `parseInt`, qui convertit d'abord son argument en chaîne :

```js
console.log(parseInt(0.0000005, 10)); // 5 ❌ car String(0.0000005) vaut "5e-7"
console.log(["1", "2", "3"].map(parseInt)); // [1, NaN, NaN] ❌
console.log(["1", "2", "3"].map(Number)); // [1, 2, 3] ✅
```

Le second vient de ce que `map` passe `(valeur, indice)` : on appelle donc `parseInt("2", 1)` et `parseInt("3", 2)`, deux bases invalides pour ces chiffres. Pour tronquer un nombre, utilisez `Math.trunc`, jamais `parseInt`.

### Valider une saisie

Un champ de formulaire renvoie toujours une chaîne. Une fonction de lecture robuste refuse le vide et tout ce qui n'est pas un nombre fini :

```js
function lireNombre(saisie) {
  const texte = String(saisie).trim();
  if (texte === "") return null;
  const nombre = Number(texte);
  return Number.isFinite(nombre) ? nombre : null;
}

console.log(lireNombre(" 42 ")); // 42
console.log(lireNombre("3.5")); // 3.5
console.log(lireNombre("")); // null
console.log(lireNombre("12abc")); // null
console.log(lireNombre("Infinity")); // null
```

Les utilisateurs francophones tapent souvent une **virgule** décimale et des espaces entre les milliers, que `Number` refuse. Il faut alors nettoyer la saisie avant de la convertir (voir l'[exercice 3](#exercice-3--lire-un-prix-saisi-en-français-)) :

```js
console.log(Number("12,5")); // NaN
console.log(parseFloat("12,5")); // 12 ❌ s'arrête à la virgule, sans erreur
console.log(Number("12,5".replace(",", "."))); // 12.5
```

## Formater un nombre

### toString et les bases

```js
console.log((255).toString()); // "255"
console.log((255).toString(16)); // "ff"
console.log((255).toString(2)); // "11111111"
console.log((5).toString(2).padStart(8, "0")); // "00000101"
console.log((35).toString(36)); // "z" (base 36 : chiffres puis lettres)
```

La conversion inverse se fait avec `parseInt(texte, base)`.

### toFixed, toPrecision, toExponential

Ces trois méthodes renvoient une **chaîne** :

```js
const pi = 3.14159;

console.log(pi.toFixed(2)); // "3.14" (2 décimales)
console.log((42).toFixed(2)); // "42.00"
console.log(pi.toPrecision(3)); // "3.14" (3 chiffres significatifs)
console.log((123456).toPrecision(2)); // "1.2e+5"
console.log(pi.toExponential(2)); // "3.14e+0"
console.log(typeof pi.toFixed(2)); // "string"
```

`toFixed` arrondit la **valeur binaire réelle** du nombre, pas son écriture décimale. Comme `1.005` est stocké un peu en dessous de 1,005, il est arrondi vers le bas :

```js
console.log((1.005).toFixed(2)); // "1.00" ❌ on attendait "1.01"
console.log((1.005).toFixed(20)); // "1.00499999999999989342"
console.log((1.45).toFixed(1)); // "1.4" (1.45 est stocké 1.4499999…)
console.log((1.55).toFixed(1)); // "1.6" (1.55 est stocké 1.5500000…)
console.log((2.5).toFixed(0)); // "3"
console.log((1e21).toFixed(2)); // "1e+21" (au-delà de 10²¹, notation exponentielle)
```

`toFixed` convient pour un affichage technique rapide (journaux, tests). Pour afficher un nombre à un humain, utilisez `Intl.NumberFormat` ; pour arrondir une valeur qu'on va réutiliser dans des calculs, voir la [recette d'arrondi](#arrondir-à-n-décimales).

> [!WARNING]
> `Number(x.toFixed(2))` est un raccourci courant pour arrondir, mais il hérite des défauts de `toFixed` (`1.005` donne `1`) et convertit deux fois. Ce n'est pas une méthode d'arrondi fiable.

## Intl.NumberFormat

`Intl.NumberFormat` met en forme les nombres selon les conventions d'une langue et d'un pays : séparateur décimal, groupement des milliers, symbole monétaire, unités. `nombre.toLocaleString(langue, options)` accepte les mêmes options, mais crée un formateur à chaque appel : dès que vous formatez plusieurs valeurs, créez le formateur une fois et réutilisez-le.

```js
const nombre = 1234567.891;

console.log(new Intl.NumberFormat("fr-FR").format(nombre)); // "1 234 567,891"
console.log(new Intl.NumberFormat("en-US").format(nombre)); // "1,234,567.891"
console.log(new Intl.NumberFormat("de-DE").format(nombre)); // "1.234.567,891"
console.log(new Intl.NumberFormat("de-CH").format(nombre)); // "1'234'567.891"
console.log(new Intl.NumberFormat("en-IN").format(nombre)); // "12,34,567.891"
```

> [!WARNING]
> Les espaces produites pour le français ne sont **pas** des espaces ordinaires : le groupement des milliers utilise l'espace fine insécable (U+202F) et l'espace avant `€` ou `%` est une espace insécable (U+00A0). C'est typographiquement correct, mais un test comme `format(1234) === "1 234"` écrit avec une espace normale échoue. Dans vos tests, comparez avec les vrais caractères (`"1\u202F234"`) ou normalisez les espaces avec `texte.replace(/\s/g, " ")`. Ces caractères dépendent aussi des données de langue du moteur et peuvent changer d'une version à l'autre.

```js
const format = new Intl.NumberFormat("fr-FR");
console.log(format.format(1234) === "1 234"); // false
console.log(format.format(1234) === "1\u202F234"); // true
console.log(format.format(1234).replace(/\s/g, " ") === "1 234"); // true
```

### Monnaies

```js
const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

console.log(euros.format(1234.5)); // "1 234,50 €"
console.log(euros.format(-42)); // "-42,00 €"
console.log(new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(1234.5)); // "$1,234.50"
console.log(new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD" }).format(1234.5)); // "1 234,50 $US"
console.log(new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(1234.5)); // "￥1,235" (le yen n'a pas de décimales)
```

L'option `currency` est **obligatoire** avec `style: "currency"` : la langue ne détermine pas la monnaie (un site en français peut afficher des dollars canadiens). D'autres options utiles :

```js
const options = { style: "currency", currency: "EUR" };

console.log(new Intl.NumberFormat("fr-FR", { ...options, currencyDisplay: "code" }).format(10)); // "10,00 EUR"
console.log(new Intl.NumberFormat("fr-FR", { ...options, currencyDisplay: "name" }).format(10)); // "10,00 euros"
console.log(new Intl.NumberFormat("fr-FR", { ...options, currencySign: "accounting" }).format(-42)); // "(42,00 €)"
console.log(new Intl.NumberFormat("fr-FR", { ...options, trailingZeroDisplay: "stripIfInteger" }).format(12)); // "12 €"
```

### Pourcentages

`style: "percent"` multiplie la valeur par 100 : on lui passe donc un **ratio** (0,256), pas un pourcentage (25,6).

```js
const pourcent = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 });

console.log(pourcent.format(0.256)); // "25,6 %"
console.log(pourcent.format(1)); // "100 %"
console.log(new Intl.NumberFormat("en-US", { style: "percent" }).format(0.256)); // "26%"
```

### Contrôler les chiffres

| Option | Rôle |
| --- | --- |
| `minimumFractionDigits` / `maximumFractionDigits` | nombre de décimales (0 à 100) |
| `minimumSignificantDigits` / `maximumSignificantDigits` | nombre de chiffres significatifs (1 à 21) |
| `minimumIntegerDigits` | complète la partie entière avec des zéros |
| `useGrouping` | `false` pour supprimer le groupement des milliers |

```js
const deuxDecimales = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
console.log(deuxDecimales.format(3.5)); // "3,50"
console.log(deuxDecimales.format(3.14159)); // "3,14"

console.log(new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 3 }).format(123456)); // "123 000"
console.log(new Intl.NumberFormat("fr-FR", { minimumIntegerDigits: 3 }).format(7)); // "007"
console.log(new Intl.NumberFormat("fr-FR", { useGrouping: false }).format(1234567)); // "1234567"
```

### Notation compacte et scientifique

```js
const compact = new Intl.NumberFormat("fr-FR", { notation: "compact" });

console.log(compact.format(1500)); // "1,5 k"
console.log(compact.format(1234567)); // "1,2 M"
console.log(compact.format(2_500_000_000)); // "2,5 Md"
console.log(new Intl.NumberFormat("fr-FR", { notation: "compact", compactDisplay: "long" }).format(1234567)); // "1,2 million"
console.log(new Intl.NumberFormat("en-US", { notation: "compact" }).format(1234567)); // "1.2M"
console.log(new Intl.NumberFormat("fr-FR", { notation: "scientific" }).format(123456)); // "1,235E5"
```

La notation compacte est idéale pour les compteurs (abonnés, vues, téléchargements).

### Unités

`style: "unit"` accepte une liste d'unités normalisées (`kilometer`, `liter`, `celsius`, `megabyte`, `percent`…) et leurs combinaisons avec `-per-` :

```js
console.log(new Intl.NumberFormat("fr-FR", { style: "unit", unit: "kilometer-per-hour" }).format(130)); // "130 km/h"
console.log(new Intl.NumberFormat("fr-FR", { style: "unit", unit: "kilometer-per-hour", unitDisplay: "long" }).format(130)); // "130 kilomètres par heure"
console.log(new Intl.NumberFormat("fr-FR", { style: "unit", unit: "celsius" }).format(21.5)); // "21,5 °C"
console.log(new Intl.NumberFormat("fr-FR", { style: "unit", unit: "liter", unitDisplay: "long" }).format(2)); // "2 litres"
console.log(new Intl.NumberFormat("fr-FR", { style: "unit", unit: "megabyte", maximumFractionDigits: 1 }).format(3.456)); // "3,5 Mo"
```

L'accord au pluriel (« litre », « litres ») est géré automatiquement. `Intl.supportedValuesOf("unit")` renvoie la liste des unités reconnues.

### Signe et arrondi

```js
const variation = new Intl.NumberFormat("fr-FR", { signDisplay: "exceptZero", style: "percent" });
console.log(variation.format(0.12)); // "+12 %"
console.log(variation.format(-0.05)); // "-5 %"
console.log(variation.format(0)); // "0 %"

const entier = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
console.log(entier.format(2.5)); // "3" (par défaut, la moitié s'arrondit en s'éloignant de zéro)
console.log(entier.format(-2.5)); // "-3"
console.log(new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0, roundingMode: "halfEven" }).format(2.5)); // "2" (arrondi « du banquier »)
console.log(new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0, roundingMode: "floor" }).format(2.7)); // "2"
console.log(new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2, roundingIncrement: 5 }).format(1.23)); // "1,25" (au 0,05 près)
```

`roundingMode`, `roundingIncrement`, `trailingZeroDisplay` et `formatRange` (ci-dessous) viennent de la révision « NumberFormat v3 » d'`Intl` (2023), Baseline 2023 et disponibles dans Node.js 19 et plus.

### Décomposer et formater des intervalles

`formatToParts` renvoie les morceaux du résultat, pour les styliser séparément (par exemple les centimes en plus petit) ; `formatRange` met en forme un intervalle :

```js
const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

const morceaux = euros.formatToParts(1234.5).map((morceau) => morceau.type);
console.log(morceaux); // ["integer", "group", "integer", "decimal", "fraction", "literal", "currency"]
console.log(euros.formatRange(10, 20)); // "10,00–20,00 €"
```

## L'objet Math

`Math` est un objet global qui regroupe des constantes et des fonctions mathématiques. Ce n'est pas un constructeur : on écrit `Math.round(x)`, jamais `new Math()`.

### Constantes

```js
console.log(Math.PI); // 3.141592653589793
console.log(Math.E); // 2.718281828459045
console.log(Math.SQRT2); // 1.4142135623730951
console.log(Math.LN2); // 0.6931471805599453
console.log(Math.LN10); // 2.302585092994046
```

### Arrondir à l'entier

| Fonction | Rôle | `2.4` | `2.5` | `-2.5` | `-2.6` |
| --- | --- | --- | --- | --- | --- |
| `Math.round` | au plus proche (moitié vers +∞) | 2 | 3 | **-2** | -3 |
| `Math.floor` | vers le bas (−∞) | 2 | 2 | -3 | -3 |
| `Math.ceil` | vers le haut (+∞) | 3 | 3 | -2 | -2 |
| `Math.trunc` | supprime la partie décimale (vers 0) | 2 | 2 | -2 | -2 |

```js
console.log(Math.round(2.5)); // 3
console.log(Math.round(-2.5)); // -2 (et non -3 : la moitié va toujours vers +∞)
console.log(Math.floor(-2.5)); // -3
console.log(Math.trunc(-2.5)); // -2
console.log(Math.ceil(2.1)); // 3
```

Pour arrondir à une décimale donnée, il faut une petite fonction : voir la [recette](#arrondir-à-n-décimales).

> [!WARNING]
> Les astuces `~~x` et `x | 0` tronquent aussi, mais passent par un entier 32 bits : elles donnent des résultats faux au-delà de 2³¹. `2 ** 31 | 0` vaut `-2147483648`. Utilisez `Math.trunc`.

### Minimum et maximum

```js
const temperatures = [12, -3, 25, 8];

console.log(Math.max(4, 9, 2)); // 9
console.log(Math.max(...temperatures)); // 25
console.log(Math.min(...temperatures)); // -3
console.log(Math.max(...[])); // -Infinity (tableau vide)
console.log(Math.max(1, NaN)); // NaN (un seul NaN suffit)
```

La décomposition `...` passe chaque élément comme un argument : au-delà d'environ cent mille éléments (la limite exacte dépend du moteur), elle dépasse la taille de la pile (`RangeError`). Pour de très grands tableaux, utilisez une boucle ou `reduce` :

```js
const mesures = Array.from({ length: 500_000 }, (_, i) => i % 1000);
const maximum = mesures.reduce((max, valeur) => (valeur > max ? valeur : max), -Infinity);
console.log(maximum); // 999
```

### Valeur absolue et signe

```js
console.log(Math.abs(-7.5)); // 7.5
console.log(Math.sign(-3)); // -1
console.log(Math.sign(0)); // 0
console.log(Math.sign(12)); // 1

const ecart = Math.abs(18 - 21); // distance entre deux valeurs, quel que soit l'ordre
console.log(ecart); // 3
```

### Puissances et racines

```js
console.log(2 ** 10); // 1024 (opérateur ** depuis ES2016)
console.log(Math.pow(2, 10)); // 1024 (forme historique)
console.log(2 ** -1); // 0.5
console.log(Math.sqrt(16)); // 4
console.log(Math.cbrt(-8)); // -2 (racine cubique)
console.log((-8) ** (1 / 3)); // NaN ❌ puissance fractionnaire d'un négatif
console.log(Math.hypot(3, 4)); // 5 (√(3² + 4²))
```

`Math.hypot` calcule la distance entre deux points sans risque de dépassement intermédiaire :

```js
function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

console.log(distance({ x: 1, y: 1 }, { x: 4, y: 5 })); // 5
```

### Trigonométrie

Les fonctions trigonométriques travaillent en **radians** (un tour complet vaut 2π) :

```js
const enRadians = (degres) => (degres * Math.PI) / 180;
const enDegres = (radians) => (radians * 180) / Math.PI;

console.log(Math.cos(Math.PI)); // -1
console.log(Math.sin(enRadians(30))); // 0.49999999999999994 (et non 0.5 : π est approché)
console.log(enDegres(Math.PI / 2)); // 90
console.log(Math.sin(Math.PI)); // 1.2246467991473532e-16 (quasi nul, pas exactement 0)
```

`Math.atan2(dy, dx)` donne l'angle d'un vecteur dans le bon quadrant, ce que `Math.atan(dy / dx)` ne sait pas faire. C'est l'outil pour orienter un objet vers une cible (jeu, animation) :

```js
const enDegres = (radians) => (radians * 180) / Math.PI;

console.log(enDegres(Math.atan2(1, 1))); // 45
console.log(enDegres(Math.atan2(-1, -1))); // -135
console.log(enDegres(Math.atan(-1 / -1))); // 45 ❌ le quadrant est perdu
```

### Logarithmes et exponentielle

```js
console.log(Math.log(Math.E)); // 1 (logarithme népérien)
console.log(Math.log10(1000)); // 3
console.log(Math.log2(1024)); // 10
console.log(Math.exp(1)); // 2.718281828459045
console.log(Math.log(1000) / Math.log(10)); // 2.9999999999999996 ❌ préférez Math.log10
```

`Math.log1p(x)` et `Math.expm1(x)` calculent `log(1 + x)` et `exp(x) - 1` avec précision quand `x` est très petit (calculs financiers ou scientifiques).

### Réduire la précision : fround et f16round

`Math.fround(x)` arrondit au flottant 32 bits le plus proche et `Math.f16round(x)` (ES2025, Baseline 2025, Node.js 24+) au flottant 16 bits. Ils servent surtout à simuler les calculs faits sur des tableaux typés `Float32Array` ou `Float16Array` (graphisme, apprentissage automatique) :

```js
console.log(Math.fround(5.05)); // 5.050000190734863
console.log(Math.f16round(5.05)); // 5.05078125
```

## Additionner précisément avec Math.sumPrecise

Quand on additionne beaucoup de nombres, les erreurs d'arrondi de chaque addition s'accumulent, et l'ordre des opérations change le résultat. Pire, une très grande valeur peut « absorber » une petite :

```js
console.log(0.1 + 0.2 + 0.3); // 0.6000000000000001
console.log(0.3 + 0.2 + 0.1); // 0.6 (même nombres, autre ordre, autre résultat)
console.log([1e20, 0.1, -1e20].reduce((somme, n) => somme + n, 0)); // 0 ❌ le 0.1 a disparu
```

`Math.sumPrecise(iterable)` (ES2026) calcule la somme **exacte** des flottants fournis, puis l'arrondit une seule fois. D'après MDN, elle est Baseline 2026 (Firefox 137, Safari 26.2, Chrome et Edge 147, avril 2026), mais toujours **absente de Node.js** en novembre 2026 (ni Node 24, ni Node 26 LTS).

<!-- no-run -->
```js
console.log(Math.sumPrecise([0.1, 0.2, 0.3])); // 0.6
console.log(Math.sumPrecise([1e20, 0.1, -1e20])); // 0.1
console.log(Math.sumPrecise(new Set([1, 2, 3]))); // 6 (n'importe quel itérable)
console.log(Math.sumPrecise([])); // -0
console.log(Math.sumPrecise([0.1, 0.2])); // 0.30000000000000004 (0.1 et 0.2 sont déjà approchés)
try {
  Math.sumPrecise([1, "2"]);
} catch (erreur) {
  console.log(erreur.name); // "TypeError" (uniquement des nombres)
}
```

Elle supprime l'erreur **accumulée**, pas l'erreur de **représentation** : `0.1` reste approché. Elle ne remplace donc pas les centimes entiers pour l'argent. Faute de `sumPrecise`, un `reduce` classique convient pour la plupart des usages ; une bibliothèque de calcul décimal s'impose pour des besoins comptables ou scientifiques exigeants.

## Nombres aléatoires

### Math.random

`Math.random()` renvoie un nombre à virgule dans l'intervalle **[0, 1[** : 0 est possible, 1 ne l'est jamais. Tout le reste se construit à partir de là :

```js
// Nombre à virgule dans [min, max[
function aleatoireEntre(min, max) {
  return min + Math.random() * (max - min);
}

// Entier dans [min, max], bornes incluses
function entierAleatoire(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Élément au hasard d'un tableau
function choisir(tableau) {
  return tableau[Math.floor(Math.random() * tableau.length)];
}

const tirages = Array.from({ length: 10_000 }, () => entierAleatoire(1, 6));
console.log(Math.min(...tirages), Math.max(...tirages)); // 1 6
console.log(["pierre", "feuille", "ciseaux"].includes(choisir(["pierre", "feuille", "ciseaux"]))); // true

const temperature = aleatoireEntre(18, 22);
console.log(temperature >= 18 && temperature < 22); // true
```

Pourquoi `Math.floor` et `max - min + 1` ? `Math.random() * 6` donne un nombre dans [0, 6[ ; `Math.floor` le ramène à 0, 1, 2, 3, 4 ou 5 avec la même probabilité ; on ajoute ensuite `min`. Avec `Math.round`, les bornes sortiraient deux fois moins souvent que les autres valeurs.

Pour mélanger un tableau, utilisez l'algorithme de Fisher-Yates, présenté au [chapitre 09](../09-tableaux/README.md) (`tableau.sort(() => Math.random() - 0.5)` donne un mélange biaisé).

### Aléatoire cryptographique

`Math.random()` est rapide mais **prévisible** : son générateur n'est pas conçu pour la sécurité. Pour un jeton, un mot de passe, un identifiant de session ou un tirage au sort à enjeu, utilisez l'API Web Crypto, disponible dans les navigateurs et dans Node.js via l'objet global `crypto` :

```js
// Identifiant unique (UUID version 4)
const id = crypto.randomUUID();
console.log(id.length); // 36 (par exemple "3b241101-e2bb-4255-8caf-4136c566a962")

// Octets aléatoires sûrs
const octets = crypto.getRandomValues(new Uint8Array(16));
console.log(octets.length); // 16

// Entier sûr dans [min, max], sans biais
function entierAleatoireSur(min, max) {
  const etendue = max - min + 1;
  const limite = Math.floor(2 ** 32 / etendue) * etendue;
  const tampon = new Uint32Array(1);
  do {
    crypto.getRandomValues(tampon);
  } while (tampon[0] >= limite); // on rejette la fin de plage qui créerait un biais
  return min + (tampon[0] % etendue);
}

const code = entierAleatoireSur(100_000, 999_999);
console.log(code >= 100_000 && code <= 999_999); // true
```

Le rejet des valeurs au-delà de `limite` évite le **biais du modulo** : sans lui, les petites valeurs sortiraient un peu plus souvent que les grandes. Dans Node.js, `randomInt(min, max)` du module `node:crypto` fait la même chose (avec `max` exclu).

> [!NOTE]
> Dans le navigateur, `crypto.randomUUID()` n'est disponible que dans un **contexte sécurisé** (page servie en HTTPS ou depuis `localhost`). `crypto.getRandomValues()` fonctionne partout.

## BigInt : les grands entiers

`BigInt` (ES2020) représente des entiers de taille **arbitraire**, sans perte de précision. On le crée avec le suffixe `n` ou la fonction `BigInt()` :

```js
const grand = 9007199254740993n;
console.log(typeof grand); // "bigint"
console.log(grand + 2n); // 9007199254740995n
console.log(2n ** 64n); // 18446744073709551616n
console.log(BigInt("12345678901234567890")); // 12345678901234567890n
```

> [!WARNING]
> Créez un grand `BigInt` à partir d'une **chaîne** ou d'un littéral `…n`, jamais d'un `number` : `BigInt(9007199254740993)` vaut `9007199254740992n`, car le nombre a déjà perdu sa précision avant la conversion.

### Opérations

Les opérateurs habituels fonctionnent (`+ - * ** %`), mais la division renvoie un **entier** (tronqué vers zéro), et on ne peut pas mélanger `bigint` et `number` dans un calcul :

```js
console.log(7n / 2n); // 3n (pas de décimales)
console.log(-7n / 2n); // -3n
console.log(7n % 2n); // 1n

try {
  console.log(10n + 1);
} catch (erreur) {
  console.log(erreur.constructor.name); // "TypeError"
}
console.log(10n + BigInt(1)); // 11n (conversion explicite)
console.log(Number(10n) + 1); // 11 (attention : perte de précision au-delà de 2 ** 53)
```

Les comparaisons, elles, fonctionnent entre les deux types :

```js
console.log(1n == 1); // true
console.log(1n === 1); // false (types différents)
console.log(2n > 1); // true
console.log(1n < 1.5); // true
console.log(0n ? "vrai" : "faux"); // "faux" (0n est falsy)
```

### Limites

```js
const essais = [
  () => Math.max(1n, 2n), // Math n'accepte pas les BigInt
  () => +1n, // pas de + unaire
  () => JSON.stringify({ id: 1n }), // JSON ne sait pas les sérialiser
  () => BigInt(1.5), // pas de décimales
  () => 1n / 0n, // la division par zéro est une erreur, pas Infinity
];

for (const essai of essais) {
  try {
    essai();
  } catch (erreur) {
    console.log(erreur.constructor.name);
  }
}
// TypeError
// TypeError
// TypeError
// RangeError
// RangeError

// Sérialiser en JSON : convertir en chaîne
console.log(JSON.stringify({ id: 123n }, (cle, valeur) => (typeof valeur === "bigint" ? String(valeur) : valeur))); // "{\"id\":\"123\"}"
```

Les `BigInt` sont aussi plus lents que les `number`, et MDN déconseille de les utiliser tels quels en cryptographie (leurs opérations ne s'exécutent pas en temps constant).

### Quand utiliser BigInt

- Identifiants et compteurs qui dépassent 2⁵³ (avec conversion explicite à l'entrée et à la sortie).
- Calculs exacts sur de très grands entiers (combinatoire, factorielles, arithmétique modulaire).
- Interfaçage avec des entiers 64 bits (`BigInt64Array`, certains formats binaires).

```js
function factorielle(n) {
  let resultat = 1n;
  for (let i = 2n; i <= n; i++) resultat *= i;
  return resultat;
}

console.log(factorielle(25n)); // 15511210043330985984000000n (exact)
console.log(Number(factorielle(25n))); // 1.5511210043330986e+25 (approché)
```

Pour des nombres à virgule exacts (prix, taux), `BigInt` n'est pas adapté directement : on l'utilise en comptant en unités entières (centimes), comme ci-dessous.

## Manipuler de l'argent

Additionner des prix en euros avec des flottants finit toujours par produire un centime fantôme :

```js
const panier = [1.1, 2.2];
const total = panier.reduce((somme, prix) => somme + prix, 0);
console.log(total); // 3.3000000000000003
console.log(total === 3.3); // false
```

La solution standard : **stocker et calculer les montants en centimes entiers**, et ne convertir en euros qu'au moment de l'affichage.

```js
const panierCentimes = [110, 220];
const totalCentimes = panierCentimes.reduce((somme, prix) => somme + prix, 0);
console.log(totalCentimes); // 330 (exact)

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
console.log(euros.format(totalCentimes / 100)); // "3,30 €"
```

Convertir des euros en centimes demande un `Math.round`, jamais une troncature :

```js
console.log(Math.trunc(4.35 * 100)); // 434 ❌ un centime perdu
console.log(Math.round(4.35 * 100)); // 435 ✅
```

Les calculs qui produisent des fractions (TVA, remises, intérêts) doivent être **arrondis explicitement** au centime, à l'étape où la règle métier le demande :

```js
function calculerTva(montantHtCentimes, taux) {
  return Math.round(montantHtCentimes * taux);
}

const ht = 1999; // 19,99 €
const tva = calculerTva(ht, 0.2); // 399,8 centimes → 400
console.log(tva); // 400
console.log(ht + tva); // 2399
```

Répartir un montant en parts égales ne tombe pas toujours juste : 100 € en trois parts ne font pas trois fois 33,33 €. On distribue les centimes restants un par un :

```js
function repartir(totalCentimes, nombreDeParts) {
  const base = Math.floor(totalCentimes / nombreDeParts);
  const reste = totalCentimes % nombreDeParts;
  return Array.from({ length: nombreDeParts }, (_, i) => base + (i < reste ? 1 : 0));
}

const parts = repartir(10_000, 3);
console.log(parts); // [3334, 3333, 3333]
console.log(parts.reduce((a, b) => a + b, 0)); // 10000 (aucun centime perdu)
```

Toutes les monnaies n'ont pas deux décimales : le yen n'en a aucune, le dinar tunisien en a trois. `Intl.NumberFormat` connaît ces règles :

```js
const decimales = (devise) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: devise }).resolvedOptions().maximumFractionDigits;

console.log(decimales("EUR")); // 2
console.log(decimales("JPY")); // 0
console.log(decimales("TND")); // 3
```

Les entiers sûrs vont jusqu'à environ 90 000 milliards d'euros en centimes, ce qui suffit à presque toutes les applications ; au-delà, ou pour de la comptabilité exigeante (taux à nombreuses décimales, règles d'arrondi réglementaires), utilisez `BigInt` ou une bibliothèque de calcul décimal.

## Recettes

### Borner une valeur

```js
function borner(valeur, min, max) {
  return Math.min(Math.max(valeur, min), max);
}

console.log(borner(150, 0, 100)); // 100
console.log(borner(-5, 0, 100)); // 0
console.log(borner(42, 0, 100)); // 42
```

Utile pour un volume, une opacité, une note, une position à l'écran. (Une méthode native `Math.clamp` est en cours de normalisation : stade 2 au TC39 depuis mai 2025, donc pas encore utilisable.)

### Arrondir à n décimales

La formule naïve `Math.round(x * 100) / 100` échoue sur les valeurs dont la représentation binaire tombe juste sous la moitié, comme `1.005`. En passant par `toPrecision(15)`, on efface ce « bruit » binaire avant d'arrondir ; en travaillant sur la valeur absolue, on arrondit les moitiés en s'éloignant de zéro, comme on l'apprend à l'école :

```js
function arrondir(nombre, decimales = 0) {
  const facteur = 10 ** decimales;
  const decale = Number((Math.abs(nombre) * facteur).toPrecision(15));
  return (Math.sign(nombre) * Math.round(decale)) / facteur;
}

console.log(Math.round(1.005 * 100) / 100); // 1 ❌
console.log(arrondir(1.005, 2)); // 1.01 ✅
console.log(arrondir(2.345, 2)); // 2.35
console.log(arrondir(-1.005, 2)); // -1.01
console.log(arrondir(0.1 + 0.2, 2)); // 0.3
console.log(arrondir(1234.5678, -2)); // 1200 (centaine la plus proche)
```

Le résultat reste un flottant (`1.01` est lui-même approché) : c'est parfait pour l'affichage ou une comparaison, mais pour l'argent, préférez les centimes entiers. Limite assumée : `toPrecision(15)` ne garde que 15 chiffres significatifs, au-delà des besoins courants.

### Interpoler et changer d'échelle

L'interpolation linéaire (*lerp*) calcule une valeur intermédiaire entre deux bornes ; son inverse indique où se situe une valeur entre deux bornes. Combinées, elles convertissent d'une échelle à une autre :

```js
const interpoler = (debut, fin, t) => debut + (fin - debut) * t;
const proportion = (debut, fin, valeur) => (valeur - debut) / (fin - debut);
const changerEchelle = (valeur, de, a) => interpoler(a[0], a[1], proportion(de[0], de[1], valeur));

console.log(interpoler(0, 100, 0.25)); // 25
console.log(proportion(0, 200, 50)); // 0.25
console.log(changerEchelle(37, [0, 100], [32, 212])); // 98.6 (37 °C en °F)
console.log(changerEchelle(25, [0, 100], [0, 255])); // 63.75 (25 % → composante de couleur)
```

### Modulo toujours positif

En JavaScript, `%` est un **reste** qui prend le signe du dividende : `-1 % 5` vaut `-1`. Pour un indice circulaire (carrousel, jours de la semaine), il faut un modulo toujours positif :

```js
const modulo = (n, m) => ((n % m) + m) % m;

const jours = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
console.log(-1 % 7); // -1
console.log(jours[modulo(-1, 7)]); // "dim" (la veille de lundi)
console.log(jours[modulo(9, 7)]); // "mer"
```

Même piège pour la parité : `-3 % 2` vaut `-1`, donc `n % 2 === 1` est faux pour les impairs négatifs. Écrivez `n % 2 !== 0`.

### Moyenne et pourcentage

```js
function moyenne(valeurs) {
  if (valeurs.length === 0) return NaN; // évite une division par zéro silencieuse
  return valeurs.reduce((somme, v) => somme + v, 0) / valeurs.length;
}

console.log(moyenne([12, 15, 9])); // 12
console.log(moyenne([])); // NaN

const progression = new Intl.NumberFormat("fr-FR", { style: "percent" });
console.log(progression.format(37 / 120)); // "31 %"
```

## Pièges courants

- **Comparer des flottants avec `===`** : `0.1 + 0.2 === 0.3` est faux. Comparez avec une tolérance, ou travaillez en entiers.
- **Calculer de l'argent en euros flottants** : des centimes apparaissent ou disparaissent. Comptez en centimes entiers.
- **`Number("")` et `Number(null)` valent `0`** : un champ vide passe pour un zéro. Testez le vide avant de convertir.
- **`parseInt` sans base**, ou utilisé pour tronquer (`parseInt(0.0000005)` vaut 5) ; `.map(parseInt)`.
- **`parseFloat("12,5")` vaut 12**, sans erreur : la virgule française arrête la lecture.
- **`isNaN` et `isFinite` globaux** : ils convertissent leur argument. Utilisez `Number.isNaN` et `Number.isFinite`.
- **`toFixed` pour arrondir** : il renvoie une chaîne et arrondit la valeur binaire (`(1.005).toFixed(2)` donne `"1.00"`).
- **`Math.round(-2.5)` vaut `-2`** : la moitié va toujours vers +∞.
- **`Math.max(...grandTableau)`** : `RangeError` au-delà d'environ cent mille éléments, et `-Infinity` pour un tableau vide.
- **`~~x` ou `x | 0` pour tronquer** : faux au-delà de 2³¹.
- **`Number.MIN_VALUE` pris pour le plus petit nombre** : c'est le plus petit **positif**.
- **`BigInt(grandNombre)`** : la précision est déjà perdue. Partez d'une chaîne.
- **`Math.random()` pour la sécurité** : utilisez `crypto.getRandomValues` ou `crypto.randomUUID`.
- **Tester une sortie d'`Intl` avec des espaces ordinaires** : le français utilise U+202F et U+00A0.

## Bonnes pratiques

- Convertissez les saisies à la frontière du programme, avec validation (`Number.isFinite`), et refusez explicitement le vide.
- Toujours `parseInt(texte, 10)` ; `Number(texte)` pour une conversion stricte.
- Montants en centimes entiers ; arrondi explicite (`Math.round`) à chaque étape où la règle métier le prévoit ; conversion en euros à l'affichage seulement.
- Affichage avec `Intl.NumberFormat`, langue et devise explicites, formateur créé une fois.
- `Number.isNaN`, `Number.isFinite`, `Number.isInteger`, `Number.isSafeInteger` plutôt que les fonctions globales.
- `Math.trunc` pour tronquer, `Math.log10`/`Math.log2` plutôt que des divisions de logarithmes, `**` plutôt que `Math.pow`.
- Identifiants numériques venus d'une API : des chaînes.
- `crypto` pour tout aléatoire lié à la sécurité.

## Résumé

- Un seul type `number` (flottant 64 bits IEEE 754) pour les entiers et les décimaux ; `bigint` pour les entiers arbitrairement grands.
- Les fractions décimales sont approchées : `0.1 + 0.2` vaut `0.30000000000000004`. Les entiers sont exacts jusqu'à `Number.MAX_SAFE_INTEGER` (2⁵³ − 1).
- `NaN` n'est égal à rien, pas même à lui-même : testez-le avec `Number.isNaN`. Diviser par zéro donne `Infinity`, sans erreur.
- `Number()` convertit strictement (mais `""` donne 0) ; `parseInt(x, 10)` et `parseFloat` lisent le début d'une chaîne.
- `toFixed`, `toPrecision` et `toString(base)` renvoient des chaînes ; `Intl.NumberFormat` formate pour les humains (monnaies, pourcentages, notation compacte, unités).
- `Math` fournit arrondis (`round`, `floor`, `ceil`, `trunc`), `min`/`max`, puissances, racines, trigonométrie (en radians) et logarithmes.
- `Math.sumPrecise` (ES2026) additionne sans accumuler d'erreurs ; pas encore dans Node.js.
- `Math.random()` pour le jeu et la simulation ; `crypto.getRandomValues` et `crypto.randomUUID` pour la sécurité.
- L'argent se calcule en centimes entiers et s'affiche avec `Intl.NumberFormat`.

## Exercices

### Exercice 1 — Thermomètre (★☆☆)

Écrivez `celsiusVersFahrenheit(celsius)` (°F = °C × 9/5 + 32), puis `afficherFahrenheit(celsius)` qui renvoie le résultat formaté en français avec au plus une décimale et l'unité « °F ».

```text
celsiusVersFahrenheit(100)  → 212
celsiusVersFahrenheit(-40)  → -40
afficherFahrenheit(37)      → "98,6 °F"
afficherFahrenheit(36.6)    → "97,9 °F"
```

<details>
<summary>Solution</summary>

```js
function celsiusVersFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

const formatFahrenheit = new Intl.NumberFormat("fr-FR", {
  style: "unit",
  unit: "fahrenheit",
  maximumFractionDigits: 1,
});

function afficherFahrenheit(celsius) {
  return formatFahrenheit.format(celsiusVersFahrenheit(celsius));
}

console.log(celsiusVersFahrenheit(100)); // 212
console.log(celsiusVersFahrenheit(-40)); // -40
console.log(celsiusVersFahrenheit(36.6)); // 97.88000000000001
console.log(afficherFahrenheit(37)); // "98,6 °F"
console.log(afficherFahrenheit(36.6)); // "97,9 °F"
```

Le calcul brut laisse apparaître l'imprécision des flottants (`97.88000000000001`) ; c'est le formatage, avec `maximumFractionDigits: 1`, qui produit un affichage propre. Le formateur est créé une seule fois, en dehors de la fonction. L'espace avant « °F » est une espace fine insécable (U+202F).

</details>

### Exercice 2 — Lancer de dés (★☆☆)

Écrivez `lancerDe(faces = 6)` qui renvoie un entier entre 1 et `faces`, puis `lancerDes(nombre, faces = 6)` qui renvoie un objet `{ des, total }`. Vérifiez sur 100 000 lancers que toutes les faces sortent et qu'aucune valeur n'est hors limites.

<details>
<summary>Solution</summary>

```js
function lancerDe(faces = 6) {
  return Math.floor(Math.random() * faces) + 1;
}

function lancerDes(nombre, faces = 6) {
  const des = Array.from({ length: nombre }, () => lancerDe(faces));
  const total = des.reduce((somme, de) => somme + de, 0);
  return { des, total };
}

const { des, total } = lancerDes(3);
console.log(des.length); // 3
console.log(total >= 3 && total <= 18); // true

const vus = new Set();
for (let i = 0; i < 100_000; i++) {
  const resultat = lancerDe();
  if (resultat < 1 || resultat > 6 || !Number.isInteger(resultat)) throw new Error(`Valeur invalide : ${resultat}`);
  vus.add(resultat);
}
console.log(vus.size); // 6
```

`Math.random() * faces` est dans [0, faces[ ; `Math.floor` donne un entier de 0 à `faces - 1`, et `+ 1` décale vers 1…`faces`. Le test vérifie les deux propriétés importantes : jamais hors limites, toutes les faces atteintes. (Avec 100 000 tirages, la probabilité qu'une face ne sorte jamais est négligeable.)

</details>

### Exercice 3 — Lire un prix saisi en français (★★☆)

Écrivez `lirePrix(saisie)` qui accepte une saisie « à la française » et renvoie le montant en **centimes** (entier), ou `null` si la saisie est invalide. Acceptez : espaces (y compris insécables) entre les milliers, virgule ou point décimal, au plus deux décimales, symbole `€` facultatif.

```text
lirePrix("12,50")        → 1250
lirePrix(" 1 234,5 € ")  → 123450
lirePrix("4.35")         → 435
lirePrix("7")            → 700
lirePrix("12,345")       → null (trop de décimales)
lirePrix("abc")          → null
lirePrix("")             → null
```

<details>
<summary>Solution</summary>

```js
function lirePrix(saisie) {
  const texte = saisie
    .replace(/\s/g, "") // toutes les espaces, insécables comprises
    .replace(/€$/, "")
    .replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(texte)) return null;
  return Math.round(Number(texte) * 100);
}

console.log(lirePrix("12,50")); // 1250
console.log(lirePrix(" 1 234,5 € ")); // 123450
console.log(lirePrix("4.35")); // 435
console.log(lirePrix("7")); // 700
console.log(lirePrix("12,345")); // null
console.log(lirePrix("abc")); // null
console.log(lirePrix("")); // null
```

On nettoie (espaces, symbole), on unifie le séparateur décimal, puis on **valide le format** avant de convertir : une expression régulière (voir le [chapitre 14](../14-regex/README.md)) exige des chiffres, puis éventuellement un point et une ou deux décimales. La conversion en centimes utilise `Math.round`, car `4.35 * 100` vaut `434.99999999999994`.

</details>

### Exercice 4 — Partager l'addition (★★☆)

Écrivez `partager(totalCentimes, convives)` qui renvoie un tableau de montants formatés en euros, dont la somme fait exactement le total, les centimes en trop étant attribués aux premiers convives. Refusez (`RangeError`) un nombre de convives qui n'est pas un entier strictement positif.

```text
partager(10000, 3)  → ["33,34 €", "33,33 €", "33,33 €"]
partager(1000, 4)   → ["2,50 €", "2,50 €", "2,50 €", "2,50 €"]
```

<details>
<summary>Solution</summary>

```js
const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

function partager(totalCentimes, convives) {
  if (!Number.isInteger(convives) || convives <= 0) {
    throw new RangeError(`Nombre de convives invalide : ${convives}`);
  }
  const base = Math.floor(totalCentimes / convives);
  const reste = totalCentimes % convives;
  return Array.from({ length: convives }, (_, i) => euros.format((base + (i < reste ? 1 : 0)) / 100));
}

console.log(partager(10_000, 3)); // ["33,34 €", "33,33 €", "33,33 €"]
console.log(partager(1000, 4)); // ["2,50 €", "2,50 €", "2,50 €", "2,50 €"]

try {
  partager(1000, 0);
} catch (erreur) {
  console.log(erreur.name); // "RangeError"
}
```

Tout le calcul se fait en centimes entiers : `Math.floor` donne la part de base, `%` le nombre de centimes à redistribuer. La conversion en euros n'a lieu qu'au formatage.

</details>

### Exercice 5 — Taille de fichier lisible (★★☆)

Écrivez `formaterTaille(octets)` qui choisit l'unité adaptée (o, ko, Mo, Go, To, en base 1000) et affiche au plus une décimale.

```text
formaterTaille(512)         → "512 o"
formaterTaille(1536)        → "1,5 ko"
formaterTaille(3_456_789)   → "3,5 Mo"
formaterTaille(2.5e12)      → "2,5 To"
```

<details>
<summary>Solution</summary>

```js
const unites = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];
const formateurs = unites.map(
  (unit) => new Intl.NumberFormat("fr-FR", { style: "unit", unit, maximumFractionDigits: 1 }),
);

function formaterTaille(octets) {
  let valeur = octets;
  let rang = 0;
  while (valeur >= 1000 && rang < unites.length - 1) {
    valeur /= 1000;
    rang++;
  }
  return formateurs[rang].format(valeur);
}

console.log(formaterTaille(512)); // "512 o"
console.log(formaterTaille(1536)); // "1,5 ko"
console.log(formaterTaille(3_456_789)); // "3,5 Mo"
console.log(formaterTaille(2.5e12)); // "2,5 To"
```

On divise par 1000 tant que la valeur est trop grande pour l'unité courante, sans dépasser la dernière unité. Une boucle est plus sûre qu'un calcul par logarithmes (`Math.log(1000) / Math.log(10)` vaut `2.9999999999999996`). Les systèmes d'exploitation n'utilisent pas tous la même base : 1 Kio (kibioctet) vaut 1024 octets, 1 ko en vaut 1000.

</details>

### Exercice 6 — Facture avec TVA (★★★)

Une facture contient des lignes `{ libelle, prixHtCentimes, quantite, tauxTva }`. Écrivez `calculerFacture(lignes)` qui renvoie `{ totalHt, totalTva, totalTtc }` en centimes, la TVA étant arrondie au centime **par ligne**. Comparez avec un calcul naïf en euros flottants.

```js
const lignes = [
  { libelle: "Livre", prixHtCentimes: 1896, quantite: 2, tauxTva: 0.055 },
  { libelle: "Câble USB", prixHtCentimes: 833, quantite: 3, tauxTva: 0.2 },
  { libelle: "Café", prixHtCentimes: 425, quantite: 1, tauxTva: 0.1 },
];
console.log(lignes.length); // 3
```

<details>
<summary>Solution</summary>

```js
const lignes = [
  { libelle: "Livre", prixHtCentimes: 1896, quantite: 2, tauxTva: 0.055 },
  { libelle: "Câble USB", prixHtCentimes: 833, quantite: 3, tauxTva: 0.2 },
  { libelle: "Café", prixHtCentimes: 425, quantite: 1, tauxTva: 0.1 },
];

function calculerFacture(lignes) {
  let totalHt = 0;
  let totalTva = 0;
  for (const { prixHtCentimes, quantite, tauxTva } of lignes) {
    const ht = prixHtCentimes * quantite; // entier × entier : exact
    totalHt += ht;
    totalTva += Math.round(ht * tauxTva); // arrondi au centime, ligne par ligne
  }
  return { totalHt, totalTva, totalTtc: totalHt + totalTva };
}

const facture = calculerFacture(lignes);
console.log(facture); // { totalHt: 6716, totalTva: 752, totalTtc: 7468 }

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
console.log(euros.format(facture.totalTtc / 100)); // "74,68 €"

// ❌ Calcul naïf en euros flottants, sans arrondi intermédiaire
const naif = lignes.reduce((total, l) => total + (l.prixHtCentimes / 100) * l.quantite * (1 + l.tauxTva), 0);
console.log(naif); // 74.6686
```

Chaque montant HT est un produit d'entiers, donc exact ; la TVA est arrondie au centime sur chaque ligne (règle courante, à valider avec la comptabilité : certaines règles arrondissent sur le total par taux). La version naïve donne `74.6686`, un montant qui n'existe pas en euros ; arrondi à la fin, il donnerait 74,67 €, soit **un centime de moins** que la somme des lignes telles qu'elles sont imprimées sur la facture. C'est exactement le genre d'écart qu'un client ou un contrôle fiscal remarque.

</details>

### Exercice 7 — Fibonacci exact (★★★)

La suite de Fibonacci commence par 0, 1, et chaque terme est la somme des deux précédents. Écrivez `fibonacci(n)` qui renvoie le n-ième terme **exact** sous forme de `BigInt`, puis trouvez à partir de quel rang la version en `number` devient fausse.

<details>
<summary>Solution</summary>

```js
function fibonacci(n) {
  let a = 0n;
  let b = 1n;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

function fibonacciNumber(n) {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

console.log(fibonacci(10)); // 55n
console.log(fibonacci(100)); // 354224848179261915075n
console.log(fibonacciNumber(100)); // 354224848179262000000 (approché)

let rang = 0;
while (BigInt(fibonacciNumber(rang)) === fibonacci(rang)) rang++;
console.log(rang); // 79
console.log(fibonacciNumber(78) <= Number.MAX_SAFE_INTEGER); // true
console.log(fibonacciNumber(79) <= Number.MAX_SAFE_INTEGER); // false
```

La version `bigint` est exacte quel que soit `n`. La version `number` reste juste tant que les termes sont des entiers sûrs : F(78) ≈ 8,9 × 10¹⁵ passe encore sous 2⁵³, F(79) ≈ 1,4 × 10¹⁶ le dépasse et l'addition n'est plus exacte.

</details>

## Pour aller plus loin

- [MDN — Number](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Number) et [Math](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Math).
- [MDN — Intl.NumberFormat](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat) : la liste complète des options.
- [MDN — BigInt](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/BigInt).
- [MDN — Math.sumPrecise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sumPrecise) et [Crypto.getRandomValues](https://developer.mozilla.org/fr/docs/Web/API/Crypto/getRandomValues).
- [The Floating-Point Guide](https://floating-point-gui.de/) : l'arithmétique flottante expliquée sans formules.
- [MDN — Intl.supportedValuesOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf) : `Intl.supportedValuesOf("unit")` liste les unités acceptées, `Intl.supportedValuesOf("currency")` les devises.

---

[← Chapitre précédent](../07-chaines/README.md) · [Sommaire](../README.md#sommaire) · [Chapitre suivant →](../09-tableaux/README.md)
