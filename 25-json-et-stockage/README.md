# 25 — JSON et stockage côté client

> **Niveau** : Intermédiaire · **Durée** : ~4 h · **Prérequis** : [Objets](../10-objets/README.md), [Async/await](../20-async-await/README.md), [Les événements](../24-evenements/README.md)

Une application doit **échanger** des données (avec une API, un fichier, un autre onglet) et en **conserver** certaines (préférences, brouillons, données hors ligne). Le premier besoin a un format universel : **JSON**. Le second a plusieurs réponses dans le navigateur : Web Storage, cookies, IndexedDB, Cache API, système de fichiers privé. Ce chapitre explique comment sérialiser sans perte, valider ce que l'on relit, et choisir le bon stockage sans créer de faille de sécurité.

> [!NOTE]
> Les sections sur JSON s'exécutent dans Node.js. Les API de stockage sont propres au navigateur : leurs blocs sont à essayer dans une page, et la page [`demo.html`](demo.html) en regroupe les exemples clés. Certaines API (cookies, Cache API, service workers) exigent une page servie en `http(s)://` : lancez par exemple `npx serve` dans le dossier, puis ouvrez l'adresse indiquée.

## Objectifs

- Écrire du JSON valide et savoir ce que ce format ne peut pas représenter.
- Maîtriser `JSON.stringify` (replacer, indentation, `toJSON`) et `JSON.parse` (reviver, erreurs, texte source ES2026).
- Choisir entre `structuredClone` et JSON, et valider toute donnée relue.
- Utiliser `localStorage` et `sessionStorage` avec un wrapper JSON sûr et l'événement `storage`.
- Lire et écrire des cookies en connaissant `Secure`, `HttpOnly` et `SameSite`.
- Stocker des données structurées dans IndexedDB avec des promesses.
- Choisir le bon stockage, et savoir ce qui ne doit **jamais** être stocké côté client.

## Sommaire

- [Le format JSON](#le-format-json)
- [JSON.stringify : de l'objet au texte](#jsonstringify--de-lobjet-au-texte)
- [JSON.parse : du texte à l'objet](#jsonparse--du-texte-à-lobjet)
- [Copier des données : structuredClone ou JSON](#copier-des-données--structuredclone-ou-json)
- [Valider les données](#valider-les-données)
- [Panorama du stockage côté client](#panorama-du-stockage-côté-client)
- [Web Storage : localStorage et sessionStorage](#web-storage--localstorage-et-sessionstorage)
- [Cookies](#cookies)
- [IndexedDB](#indexeddb)
- [Cache API et service workers (aperçu)](#cache-api-et-service-workers-aperçu)
- [OPFS, un système de fichiers privé (aperçu)](#opfs-un-système-de-fichiers-privé-aperçu)
- [Quotas, persistance et éviction](#quotas-persistance-et-éviction)
- [Quel stockage choisir](#quel-stockage-choisir)
- [Pièges courants](#pièges-courants)
- [Bonnes pratiques](#bonnes-pratiques)
- [Résumé](#résumé)
- [Exercices](#exercices)
- [Pour aller plus loin](#pour-aller-plus-loin)

## Le format JSON

**JSON** (_JavaScript Object Notation_) est un format **texte** de données, inspiré de la syntaxe des littéraux JavaScript et popularisé au début des années 2000 par Douglas Crockford. Il est normalisé (ECMA-404, RFC 8259), lisible par un humain, et chaque langage sait le lire et l'écrire. C'est le format par défaut des API web (type MIME `application/json`) et de nombreux fichiers de configuration (`package.json`).

```json
{
  "id": 42,
  "nom": "Ada Lovelace",
  "actif": true,
  "langues": ["fr", "en"],
  "adresse": { "ville": "Londres", "codePostal": null },
  "solde": -1.25e3
}
```

JSON connaît **six types** : objet, tableau, chaîne, nombre, booléen et `null`. Il ressemble à un littéral JavaScript, mais il est beaucoup plus strict :

| | JSON | Littéral JavaScript |
| --- | --- | --- |
| Clés | chaînes entre **guillemets doubles**, obligatoires | guillemets facultatifs |
| Chaînes | guillemets doubles uniquement | `'…'`, `"…"` ou `` `…` `` |
| Virgule finale | **interdite** | autorisée |
| Commentaires | **interdits** | autorisés |
| Nombres | décimaux : ni `NaN`, ni `Infinity`, ni `0x1F`, ni `+1`, ni `01` | tout |
| Valeurs | les six types | tout : `undefined`, fonctions, `Date`, `Map`… |

Les fichiers de configuration qui acceptent des commentaires (`tsconfig.json`, réglages de VS Code) utilisent en réalité des variantes (JSONC, JSON5) que `JSON.parse` refuse. Pour importer un fichier JSON dans un module, voir les _import attributes_ au chapitre [Modules](../26-modules/README.md) (`import config from "./config.json" with { type: "json" }`, ES2025).

## JSON.stringify : de l'objet au texte

`JSON.stringify(valeur)` produit une chaîne JSON. C'est l'étape de **sérialisation**, avant d'envoyer des données sur le réseau ou de les écrire quelque part.

```js
const utilisateur = { id: 42, nom: "Ada", langues: ["fr", "en"], actif: true };
const texte = JSON.stringify(utilisateur);
console.log(texte); // {"id":42,"nom":"Ada","langues":["fr","en"],"actif":true}
console.log(typeof texte); // "string"
```

### Ce que JSON ne sait pas représenter

Tout ce qui n'entre pas dans les six types est converti, ou perdu **sans erreur** :

```js
const donnees = {
  nom: "Ada",
  age: undefined, // propriété omise
  saluer() {}, // omise
  [Symbol("id")]: 1, // omise
  score: NaN, // null
  plafond: Infinity, // null
  date: new Date(Date.UTC(2026, 10, 6, 9, 30)), // chaîne ISO 8601
  liste: [undefined, () => 1, NaN], // null dans un tableau
  carte: new Map([["a", 1]]), // {} : le contenu est perdu
  ensemble: new Set([1, 2]), // {}
  motif: /ab+c/i, // {}
  erreur: new Error("oups"), // {} : message et pile ne sont pas énumérables
};

console.log(JSON.stringify(donnees));
// {"nom":"Ada","score":null,"plafond":null,"date":"2026-11-06T09:30:00.000Z","liste":[null,null,null],"carte":{},"ensemble":{},"motif":{},"erreur":{}}
console.log(JSON.stringify(undefined), JSON.stringify("Ada")); // undefined "Ada"
```

| Valeur | Dans un objet | Dans un tableau |
| --- | --- | --- |
| `undefined`, fonction, symbole | propriété **omise** | `null` |
| `NaN`, `Infinity`, `-Infinity` | `null` | `null` |
| `Date` | chaîne ISO 8601 (via `toJSON`) | idem |
| `Map`, `Set`, `RegExp`, `Error` | `{}` | `{}` |
| `BigInt` | **`TypeError`** | **`TypeError`** |
| référence circulaire | **`TypeError`** | **`TypeError`** |

Remarquez que `JSON.stringify(undefined)` renvoie `undefined`, pas une chaîne. Les deux cas qui lèvent une erreur :

```js
try {
  JSON.stringify({ montant: 10n });
} catch (erreur) {
  console.log(erreur.message); // "Do not know how to serialize a BigInt"
}

const noeud = { nom: "racine" };
noeud.parent = noeud; // l'objet se référence lui-même
try {
  JSON.stringify(noeud);
} catch (erreur) {
  console.log(erreur.name); // "TypeError" (message : Converting circular structure to JSON…)
}
```

Les messages d'erreur varient d'un moteur à l'autre (ceux-ci viennent de V8, le moteur de Chrome et de Node.js) ; seul le type `TypeError` est garanti. Pour conserver une `Map` ou un `Set`, convertissez-les explicitement, puis reconstruisez-les à la lecture :

```js
const stock = new Map([
  ["the-vert", 12],
  ["cafe", 0],
]);
const tags = new Set(["bio", "vrac"]);

const texte = JSON.stringify({
  stock: Object.fromEntries(stock),
  tags: [...tags],
});
console.log(texte); // {"stock":{"the-vert":12,"cafe":0},"tags":["bio","vrac"]}

const relu = JSON.parse(texte);
const stockRelu = new Map(Object.entries(relu.stock));
console.log(stockRelu.get("the-vert"), new Set(relu.tags).has("bio")); // 12 true
```

### Indentation

Le troisième argument rend le texte lisible : un nombre d'espaces (10 au maximum) ou une chaîne (10 caractères au maximum, par exemple `"\t"`). Réservez-le aux fichiers et au débogage : sur le réseau, il ne fait qu'alourdir.

```js
const config = { theme: "sombre", taille: 16, raccourcis: ["Ctrl+K", "/"] };
console.log(JSON.stringify(config, null, 2));
// {
//   "theme": "sombre",
//   "taille": 16,
//   "raccourcis": [
//     "Ctrl+K",
//     "/"
//   ]
// }
```

### Le paramètre replacer

Le deuxième argument, le **replacer**, filtre ou transforme les valeurs. Sous forme de **fonction**, il est appelé pour chaque paire clé/valeur (en commençant par la racine, avec la clé `""`) ; ce qu'il renvoie est sérialisé, et `undefined` omet la propriété :

```js
const compte = {
  email: "ada@exemple.fr",
  motDePasse: "s3cr3t",
  creeLe: new Date(Date.UTC(2026, 0, 15)),
  solde: 1234.5,
};

const versionPublique = JSON.stringify(compte, (cle, valeur) => {
  if (cle === "motDePasse") return undefined; // jamais dans les journaux
  if (typeof valeur === "number") return Math.round(valeur);
  return valeur;
});
console.log(versionPublique); // {"email":"ada@exemple.fr","creeLe":"2026-01-15T00:00:00.000Z","solde":1235}
```

Subtilité : quand le replacer est appelé, `toJSON` a **déjà** été appliqué. Une `Date` lui arrive donc sous forme de chaîne ; la valeur d'origine reste accessible via `this[cle]`, `this` étant l'objet qui contient la propriété (d'où une `function` et non une fléchée) :

```js
JSON.stringify({ quand: new Date(0) }, function (cle, valeur) {
  if (cle) console.log(typeof valeur, this[cle] instanceof Date); // string true
  return valeur;
});
```

Sous forme de **tableau**, le replacer est une liste blanche de clés, appliquée à **tous les niveaux** :

```js
const commande = {
  id: 7,
  client: { id: 3, nom: "Ada", email: "ada@exemple.fr" },
  total: 42,
  notesInternes: "client à relancer",
};
console.log(JSON.stringify(commande, ["id", "client", "nom", "total"]));
// {"id":7,"client":{"id":3,"nom":"Ada"},"total":42}
```

### La méthode toJSON

Un objet qui possède une méthode `toJSON` choisit lui-même sa représentation : `JSON.stringify` sérialise ce qu'elle renvoie. C'est ainsi que `Date` devient une chaîne ISO (une date invalide devient `null`).

```js
class Prix {
  constructor(centimes, devise = "EUR") {
    this.centimes = centimes;
    this.devise = devise;
  }

  toJSON() {
    return { montant: this.centimes / 100, devise: this.devise };
  }
}

console.log(JSON.stringify({ article: "Thé", prix: new Prix(1250) }));
// {"article":"Thé","prix":{"montant":12.5,"devise":"EUR"}}
console.log(JSON.stringify(new Date(NaN))); // null
```

Pour les `BigInt`, ne modifiez pas le prototype natif (`BigInt.prototype.toJSON = …` change le comportement de **tout** le programme, bibliothèques comprises) : utilisez un replacer.

Enfin, l'ordre des clés suit celui de `Object.keys` : d'abord les clés « entières » par ordre croissant, puis les autres dans l'ordre de création. Deux objets égaux peuvent donc produire des chaînes différentes : ne comparez pas des objets en comparant leur JSON.

```js
console.log(JSON.stringify({ b: 1, 2: "x", a: 2, 1: "y" })); // {"1":"y","2":"x","b":1,"a":2}
```

## JSON.parse : du texte à l'objet

`JSON.parse(texte)` fait l'inverse : il analyse une chaîne JSON et construit les valeurs JavaScript correspondantes.

```js
const reponse =
  '{"id":42,"nom":"Ada","langues":["fr","en"],"actif":true,"chef":null}';
const utilisateur = JSON.parse(reponse);
console.log(utilisateur.langues[1], utilisateur.chef); // en null
```

### Erreurs de syntaxe

Un texte invalide lève une `SyntaxError`. Elle survient plus souvent qu'on ne le croit : page d'erreur HTML reçue à la place du JSON (« Unexpected token '<' »), réponse vide, donnée corrompue dans un stockage, fichier édité à la main.

```js
for (const texte of ["{'nom':'Ada'}", '{"a":1,}', "", "undefined"]) {
  try {
    JSON.parse(texte);
  } catch (erreur) {
    console.log(`${erreur.name} : ${erreur.message}`);
  }
}
// SyntaxError : Expected property name or '}' in JSON at position 1 (line 1 column 2)
// SyntaxError : Expected double-quoted property name in JSON at position 7 (line 1 column 8)
// SyntaxError : Unexpected end of JSON input
// SyntaxError : "undefined" is not valid JSON
```

Comme pour `stringify`, les messages dépendent du moteur. Attention à un cas silencieux : `JSON.parse(null)` renvoie `null`, car `null` est d'abord converti en la chaîne `"null"`, qui est du JSON valide. C'est ce qui se passe avec `JSON.parse(localStorage.getItem("cle"))` quand la clé n'existe pas.

```js
console.log(JSON.parse(null)); // null : pas d'erreur
console.log(JSON.parse(" [1, 2] ")); // [1, 2] : les espaces autour sont permis
```

### Le paramètre reviver

Le second argument de `JSON.parse`, le **reviver**, est appelé pour chaque valeur, **des feuilles vers la racine**, et peut la remplacer (renvoyer `undefined` supprime la propriété) :

```js
JSON.parse('{"a":{"b":1},"c":[2]}', (cle, valeur) => {
  console.log(cle === "" ? "(racine)" : cle);
  return valeur;
});
// b
// a
// 0
// c
// (racine)
```

Usage classique : **réhydrater les dates**, qui reviennent sous forme de chaînes. Plutôt que de lister les noms des propriétés, on reconnaît le format ISO 8601 produit par `toJSON` :

```js
const ISO_8601 =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const reviverDates = (cle, valeur) =>
  typeof valeur === "string" && ISO_8601.test(valeur)
    ? new Date(valeur)
    : valeur;

const texte =
  '{"titre":"Réunion","debut":"2026-11-06T09:30:00.000Z","rappel":{"avant":"2026-11-06T09:15:00.000Z"}}';
const evenement = JSON.parse(texte, reviverDates);
console.log(evenement.debut instanceof Date); // true
console.log(evenement.rappel.avant.getUTCMinutes()); // 15
console.log(typeof evenement.titre); // "string"
```

### Grands nombres et texte source (ES2026)

Les nombres JSON deviennent des `Number` JavaScript : au-delà de `Number.MAX_SAFE_INTEGER` (2⁵³ − 1), des chiffres sont perdus. C'est un problème réel avec les identifiants 64 bits de certaines API (d'où les champs « `id_str` » qu'elles ajoutent).

ES2026 donne enfin accès au **texte source** : le reviver reçoit un troisième argument, `contexte`, dont la propriété `source` contient le texte exact d'une valeur primitive. Et `JSON.rawJSON(texte)` produit une valeur que `JSON.stringify` recopie telle quelle :

```js
const texte = '{"id":12345678901234567890,"prix":0.1}';
console.log(JSON.parse(texte).id); // 12345678901234567000 : précision perdue

const exact = JSON.parse(texte, (cle, valeur, contexte) =>
  cle === "id" ? BigInt(contexte.source) : valeur,
);
console.log(exact.id); // 12345678901234567890n

const sortie = JSON.stringify(exact, (cle, valeur) =>
  typeof valeur === "bigint" ? JSON.rawJSON(valeur.toString()) : valeur,
);
console.log(sortie); // {"id":12345678901234567890,"prix":0.1}
console.log(JSON.isRawJSON(JSON.rawJSON("1"))); // true
```

`JSON.rawJSON` n'accepte qu'une valeur **primitive** (nombre, chaîne, booléen, `null`) : `JSON.rawJSON("{}")` lève une `SyntaxError`. Ces ajouts sont disponibles dans Chrome et Edge 114+, Firefox 135+, Safari 18.4+ (Baseline 2025) et Node.js 21+.

## Copier des données : structuredClone ou JSON

`JSON.parse(JSON.stringify(x))` a longtemps servi à copier un objet en profondeur. Il cumule toutes les pertes vues plus haut. `structuredClone(x)` (Baseline 2022, Node.js 17+) fait une vraie copie profonde avec l'**algorithme de clonage structuré**, celui qu'utilisent aussi `postMessage`, IndexedDB et `history.pushState` :

```js
const original = {
  quand: new Date(Date.UTC(2026, 10, 6)),
  tags: new Set(["a", "b"]),
  index: new Map([["x", 1]]),
  octets: new Uint8Array([1, 2, 3]),
  absent: undefined,
};
original.moi = original; // référence circulaire

const copie = structuredClone(original);
console.log(copie.quand instanceof Date, copie.tags.has("b")); // true true
console.log(copie.index.get("x")); // 1
console.log(copie.moi === copie, "absent" in copie); // true true
console.log(copie.quand !== original.quand); // true : copie profonde, pas de partage

const viaJson = JSON.parse(JSON.stringify({ ...original, moi: null }));
console.log(typeof viaJson.quand, viaJson.tags, "absent" in viaJson); // string {} false
```

Le clonage structuré a lui aussi ses limites : une **fonction** provoque une `DataCloneError`, une instance de classe redevient un **objet simple** (son prototype est perdu), les accesseurs sont évalués et les clés symboles ignorées.

```js
class Point {
  constructor(x) {
    this.x = x;
  }
}
const clone = structuredClone(new Point(-3));
console.log(clone instanceof Point, clone.x); // false -3

try {
  structuredClone({ calculer() {} });
} catch (erreur) {
  console.log(erreur.name); // "DataCloneError"
}
```

| | `JSON.parse(JSON.stringify(x))` | `structuredClone(x)` |
| --- | --- | --- |
| `Date` | devient une chaîne | conservée |
| `Map`, `Set`, tableaux typés | `{}` | conservés |
| `undefined`, `NaN`, `Infinity` | omis ou `null` | conservés |
| `BigInt`, références circulaires | `TypeError` | conservés |
| Fonctions | omises | `DataCloneError` |
| Instances de classe | objet simple | objet simple |
| Usage | **sérialiser** (texte à envoyer ou écrire) | **copier** en mémoire |

Les copies superficielles (`{ ...objet }`) et la comparaison d'objets sont traitées au chapitre [Objets](../10-objets/README.md).

## Valider les données

`JSON.parse` renvoie **ce que dit le texte**, pas ce qu'attend votre code. Toute donnée qui franchit une frontière (réponse d'API, stockage local, paramètre d'URL, fichier importé, message d'un autre onglet) peut être mal formée, venir d'une ancienne version de votre application… ou avoir été fabriquée par un attaquant. Validez-la **à l'entrée**, une fois, pour que le reste du code puisse lui faire confiance.

```js
const THEMES = ["clair", "sombre", "systeme"];

function lirePreferences(texte) {
  let brut;
  try {
    brut = JSON.parse(texte);
  } catch {
    return null; // texte illisible
  }
  if (typeof brut !== "object" || brut === null || Array.isArray(brut))
    return null;

  // On construit un NOUVEL objet avec les seuls champs attendus, validés un par un
  const taille = brut.taillePolice;
  return {
    theme: THEMES.includes(brut.theme) ? brut.theme : "systeme",
    taillePolice:
      Number.isInteger(taille) && taille >= 12 && taille <= 32 ? taille : 16,
  };
}

console.log(lirePreferences('{"theme":"sombre","taillePolice":18}')); // { theme: "sombre", taillePolice: 18 }
const douteux = '{"theme":"rose","taillePolice":"énorme","admin":true}';
console.log(lirePreferences(douteux)); // { theme: "systeme", taillePolice: 16 }
console.log(lirePreferences("[1, 2]")); // null
console.log(lirePreferences("pas du JSON")); // null
```

Construire un objet neuf (liste blanche) plutôt que de recopier l'objet reçu évite d'embarquer des propriétés inattendues, dont la clé spéciale `"__proto__"`. `JSON.parse` la crée comme une propriété ordinaire, inoffensive en elle-même, mais un `Object.assign` ou une fusion récursive naïve en ferait une modification de prototype : c'est la **pollution de prototype** (voir [Objets](../10-objets/README.md)).

```js
const recu = JSON.parse('{"__proto__": {"admin": true}}');
console.log(Object.hasOwn(recu, "__proto__"), recu.admin); // true undefined : propriété ordinaire

const fusion = Object.assign({}, recu); // ❌ l'affectation de __proto__ change le prototype de fusion
console.log(fusion.admin); // true
```

Pour des structures plus riches, une bibliothèque de **schémas** décrit la forme attendue une seule fois et fournit validation, messages d'erreur et (avec TypeScript) les types. Les plus répandues : [Zod](https://zod.dev/) (version 4), [Valibot](https://valibot.dev/) (version 1, conçue pour peser très peu dans un bundle) et, côté standard, [JSON Schema](https://json-schema.org/) avec Ajv, utilisable par d'autres langages.

<!-- no-run -->
```js
// npm install zod
import * as z from "zod";

const Utilisateur = z.object({
  id: z.number().int().positive(),
  email: z.email(),
  roles: z.array(z.enum(["lecteur", "admin"])),
});

const resultat = Utilisateur.safeParse(await reponse.json());
if (resultat.success) {
  afficher(resultat.data); // objet validé ; les clés inconnues ont été retirées
} else {
  console.error(z.prettifyError(resultat.error));
  // ✖ Too small: expected number to be >0
  //   → at id
}
```

> [!IMPORTANT]
> Valider côté client protège **votre code** contre des données inattendues. Cela ne protège pas le serveur : lui aussi doit valider tout ce qu'il reçoit.

## Panorama du stockage côté client

| | Capacité | API | Contenu | Envoyé au serveur | Durée de vie | Dans un worker |
| --- | --- | --- | --- | --- | --- | --- |
| **Cookies** | ~4 Ko par cookie | `document.cookie` (synchrone), Cookie Store (asynchrone) | chaînes | **oui, à chaque requête** | jusqu'à expiration, ou fin de session | Cookie Store seulement |
| **`localStorage`** | ~5 Mio par origine | synchrone | chaînes | non | illimitée (jusqu'à effacement) | non |
| **`sessionStorage`** | ~5 Mio par origine | synchrone | chaînes | non | celle de l'onglet | non |
| **IndexedDB** | une part du disque (Go) | asynchrone | tout objet clonable, `Blob`, `File` | non | durable, mais évictable | oui |
| **Cache API** | partagée avec IndexedDB | asynchrone | paires requête/réponse HTTP | non | durable, mais évictable | oui |
| **OPFS** | partagée avec IndexedDB | asynchrone (synchrone en worker) | fichiers | non | durable, mais évictable | oui |

Tous ces espaces sont cloisonnés par **origine** (protocole + hôte + port) : `https://exemple.fr`, `http://exemple.fr` et `https://app.exemple.fr` ne partagent rien. Les cookies suivent leurs propres règles (domaine et chemin). Pour inspecter ou effacer ces données, ouvrez l'onglet **Application** (Chrome, Edge) ou **Stockage** (Firefox) des outils de développement.

## Web Storage : localStorage et sessionStorage

### L'API

`localStorage` et `sessionStorage` sont deux objets `Storage` à l'API identique et très simple : des paires clé/valeur, **toutes deux des chaînes**.

<!-- no-run -->
```js
localStorage.setItem("theme", "sombre");
console.log(localStorage.getItem("theme")); // "sombre"
console.log(localStorage.getItem("inconnue")); // null

localStorage.setItem("taille", 16);
console.log(typeof localStorage.getItem("taille")); // "string" : tout est converti en chaîne

localStorage.setItem("preferences", { theme: "sombre" }); // ❌
console.log(localStorage.getItem("preferences")); // "[object Object]" : l'objet est perdu

localStorage.setItem("preferences", JSON.stringify({ theme: "sombre" })); // ✅
console.log(JSON.parse(localStorage.getItem("preferences")).theme); // "sombre"

console.log(localStorage.length); // 3
localStorage.removeItem("taille");
localStorage.clear(); // efface tout, pour cette origine seulement
```

Utilisez toujours les méthodes. L'accès par propriété (`localStorage.theme = "x"`) fonctionne, mais entre en collision avec les noms des méthodes (`key`, `length`, `getItem`…).

| | `localStorage` | `sessionStorage` |
| --- | --- | --- |
| Portée | l'origine, tous onglets confondus | l'origine **et l'onglet** |
| Durée de vie | jusqu'à effacement (par le code, l'utilisateur ou le navigateur) | jusqu'à la fermeture de l'onglet (survit au rechargement) |
| Cas d'usage | préférences, état d'interface | brouillon de formulaire, étape d'un assistant, position de défilement |

Trois limites à connaître :

- l'API est **synchrone** : chaque lecture ou écriture bloque le fil principal. Gardez-y de petites valeurs ; pour des volumes importants, utilisez IndexedDB ;
- la capacité est d'environ **5 Mio par origine** pour chacun ; au-delà, `setItem` lève une `QuotaExceededError` ;
- le stockage peut être **indisponible** : cookies bloqués par l'utilisateur, iframe isolée (_sandbox_)… L'accès lève alors une exception (souvent `SecurityError`). Tout accès doit donc être protégé par `try…catch`.

Node.js 25 et suivants exposent aussi `localStorage` et `sessionStorage`, à des fins de compatibilité (pour `localStorage`, il faut indiquer un fichier avec `--localstorage-file`). Les exemples ci-dessous restent exécutables avec n'importe quelle version, car ils reçoivent le stockage en paramètre.

### Un wrapper JSON sûr

Plutôt que de répéter `JSON.stringify`, `JSON.parse` et `try…catch` partout, regroupez-les. Le stockage est passé en paramètre : dans la page, on donne `localStorage` ; dans un test (ou dans Node.js), un faux stockage en mémoire.

```js
function creerStockage(zone = globalThis.localStorage, prefixe = "app:") {
  return {
    lire(cle, valeurParDefaut = null) {
      try {
        const texte = zone.getItem(prefixe + cle);
        return texte === null ? valeurParDefaut : JSON.parse(texte);
      } catch {
        return valeurParDefaut; // JSON corrompu ou stockage inaccessible
      }
    },
    ecrire(cle, valeur) {
      try {
        zone.setItem(prefixe + cle, JSON.stringify(valeur));
        return true;
      } catch (erreur) {
        console.warn(`Impossible d'enregistrer « ${cle} » : ${erreur.name}`); // QuotaExceededError, SecurityError…
        return false;
      }
    },
    supprimer(cle) {
      try {
        zone.removeItem(prefixe + cle);
      } catch {
        // stockage inaccessible : rien à supprimer
      }
    },
  };
}

// Un stockage en mémoire qui imite l'API Storage (tests, Node.js)
function creerZoneMemoire() {
  const donnees = new Map();
  return {
    getItem: (cle) => (donnees.has(cle) ? donnees.get(cle) : null),
    setItem: (cle, valeur) => void donnees.set(cle, String(valeur)),
    removeItem: (cle) => void donnees.delete(cle),
  };
}

const zone = creerZoneMemoire(); // dans une page : creerStockage(localStorage)
const stockage = creerStockage(zone);

stockage.ecrire("preferences", { theme: "sombre", taille: 18 });
console.log(stockage.lire("preferences")); // { theme: "sombre", taille: 18 }
console.log(stockage.lire("absente", { theme: "systeme" })); // { theme: "systeme" }

zone.setItem("app:corrompue", "{pas du json");
console.log(stockage.lire("corrompue", "défaut")); // "défaut" : pas de plantage au démarrage
```

Le **préfixe** évite les collisions entre plusieurs applications servies sur la même origine. Pour aller plus loin : enregistrez un numéro de version avec les données (`{ version: 2, donnees }`) afin de pouvoir migrer un ancien format, et validez ce que vous relisez comme toute donnée externe (voir [Valider les données](#valider-les-données)).

### Synchroniser les onglets : l'événement storage

Quand un onglet modifie `localStorage`, les **autres** documents de la même origine reçoivent un événement `storage` (pas celui qui a fait la modification). Il porte `key`, `oldValue`, `newValue`, `url` et `storageArea` ; après un `clear()`, `key` vaut `null`.

```html
<label for="theme">Thème</label>
<select id="theme">
  <option value="systeme">Système</option>
  <option value="clair">Clair</option>
  <option value="sombre">Sombre</option>
</select>
```

<!-- no-run -->
```js
const CLE = "app:theme";
const choix = document.getElementById("theme");

function appliquerTheme(theme) {
  const valide = ["clair", "sombre", "systeme"].includes(theme)
    ? theme
    : "systeme";
  document.documentElement.dataset.theme = valide;
  choix.value = valide;
}

choix.addEventListener("change", () => {
  localStorage.setItem(CLE, choix.value);
  appliquerTheme(choix.value);
});

// Un autre onglet a changé le thème : on suit
window.addEventListener("storage", (event) => {
  if (
    event.storageArea === localStorage &&
    (event.key === CLE || event.key === null)
  ) {
    appliquerTheme(event.newValue);
  }
});

appliquerTheme(localStorage.getItem(CLE));
```

Pour simplement **prévenir** les autres onglets sans rien stocker (« déconnexion », « panier mis à jour »), `BroadcastChannel` est plus direct :

<!-- no-run -->
```js
const canal = new BroadcastChannel("app");
canal.addEventListener("message", (event) => {
  if (event.data.type === "deconnexion") location.assign("/connexion");
});
canal.postMessage({ type: "deconnexion" }); // reçu par les autres onglets de la même origine
```

### Ce qu'il ne faut jamais y mettre

> [!CAUTION]
> **Jamais de jeton d'authentification dans `localStorage` ou `sessionStorage`** (JWT, identifiant de session, jeton de rafraîchissement, clé d'API). Tout script exécuté dans la page peut les lire en une ligne et les envoyer ailleurs : une faille XSS (voir [Le DOM](../23-dom/README.md#innerhtml-et-les-failles-xss)), un script tiers compromis, une dépendance npm malveillante, une extension. Ils n'expirent pas et restent sur un ordinateur partagé.

<!-- no-run -->
```js
// ❌ Lisible par n'importe quel script de la page
localStorage.setItem("jeton", reponse.accessToken);
```

À la place :

- la **session** est portée par un cookie `HttpOnly; Secure; SameSite=Lax` posé **par le serveur** : JavaScript ne peut pas le lire, donc une faille XSS ne peut pas le voler (elle reste grave, mais limitée à la page ouverte). Ce choix demande une protection contre le CSRF (voir [Fetch et HTTP](../22-fetch-http/README.md)) ;
- si une API exige un jeton dans l'en-tête `Authorization`, gardez-le **en mémoire** (une variable dans un module), avec une durée de vie courte, et renouvelez-le grâce à un cookie `HttpOnly` ;
- pas de données personnelles sensibles (santé, finances, documents d'identité) dans le stockage du navigateur ;
- **ne faites pas confiance** à ce que vous relisez : l'utilisateur peut tout modifier depuis les outils de développement. Un `estAdmin: true` stocké localement ne prouve rien ; seul le serveur décide des droits.

## Cookies

Un cookie est une petite donnée (environ 4 Ko au maximum) que le **serveur** dépose avec l'en-tête `Set-Cookie` et que le navigateur lui **renvoie automatiquement** (en-tête `Cookie`) à chaque requête vers ce site. C'est le bon outil pour ce que le serveur doit connaître : la session, la langue à utiliser pour le rendu. Pour des données que seul le JavaScript utilise, préférez Web Storage ou IndexedDB, qui n'alourdissent pas chaque requête.

### document.cookie

`document.cookie` est une API étrange : en **lecture**, elle renvoie tous les cookies visibles sous forme d'une seule chaîne `"nom=valeur; nom2=valeur2"` (sans leurs attributs) ; en **écriture**, elle crée ou modifie **un seul** cookie, sans toucher aux autres. Elle ne fonctionne que dans une page servie en HTTP(S).

<!-- no-run -->
```js
document.cookie =
  "theme=sombre; Max-Age=31536000; Path=/; SameSite=Lax; Secure";
document.cookie = `recherche=${encodeURIComponent("thé & café")}; Path=/; SameSite=Lax; Secure`;
console.log(document.cookie); // "theme=sombre; recherche=th%C3%A9%20%26%20caf%C3%A9"

// Supprimer : même nom, même Path (et même Domain), avec Max-Age=0
document.cookie = "theme=; Max-Age=0; Path=/";
console.log(document.cookie); // "recherche=th%C3%A9%20%26%20caf%C3%A9"
```

La valeur ne doit contenir ni `;`, ni `,`, ni espace : encodez-la avec `encodeURIComponent`. Pour lire un cookie, découpez la chaîne. Cette fonction ne dépend pas du navigateur, on peut donc la tester dans Node.js :

```js
function lireCookies(chaine) {
  const cookies = new Map();
  for (const paire of chaine.split(";")) {
    const position = paire.indexOf("=");
    if (position === -1) continue;
    const nom = paire.slice(0, position).trim();
    const brute = paire.slice(position + 1).trim();
    if (!nom || cookies.has(nom)) continue; // en cas de doublon, le premier est le plus spécifique
    try {
      cookies.set(nom, decodeURIComponent(brute));
    } catch {
      cookies.set(nom, brute); // valeur mal encodée : on la garde telle quelle
    }
  }
  return cookies;
}

const cookies = lireCookies(
  "theme=sombre; recherche=th%C3%A9%20%26%20caf%C3%A9; filtre=a=b; theme=clair",
);
console.log(cookies.get("theme")); // "sombre"
console.log(cookies.get("recherche")); // "thé & café"
console.log(cookies.get("filtre")); // "a=b" : seul le premier « = » sépare le nom de la valeur
// Dans la page : lireCookies(document.cookie).get("theme")
```

Deux cookies peuvent porter le même nom avec des chemins différents ; le navigateur liste alors en premier celui dont le `Path` est le plus long. L'ancienne version de ce cours proposait une fonction `getCookie` qui ne décodait pas les valeurs et renvoyait `undefined` dans ce cas, ainsi qu'un exemple d'écriture avec `expires=…2023`, une date **passée**, ce qui **supprime** le cookie au lieu de le créer.

### Les attributs de sécurité

| Attribut | Rôle |
| --- | --- |
| `Max-Age=<secondes>` ou `Expires=<date HTTP>` | durée de vie ; sans eux, cookie « de session », supprimé à la fermeture du navigateur (que la restauration de session peut toutefois conserver) ; `Max-Age=0` ou une date passée le suppriment |
| `Path=/` | chemins pour lesquels le cookie est envoyé (par défaut : le « dossier » de la page) |
| `Domain=exemple.fr` | sans cet attribut, seul l'hôte exact reçoit le cookie ; avec, **tous les sous-domaines** aussi (cela élargit l'exposition) |
| `Secure` | envoyé uniquement en HTTPS (`localhost` est toléré) |
| `HttpOnly` | **invisible pour JavaScript** ; seul le serveur peut le poser, ce qui protège la session contre le vol par XSS |
| `SameSite=Strict`, `Lax` ou `None` | envoi lors d'une requête venant d'un **autre site** : jamais (`Strict`), seulement pour une navigation de premier niveau comme un clic sur un lien (`Lax`), toujours (`None`, qui exige `Secure`) ; première ligne de défense contre le CSRF |
| `Partitioned` | cookie tiers cloisonné par site principal (CHIPS) : Chrome et Edge 114+, Firefox 141+, Safari 26.2+ |

Les préfixes de nom ajoutent des garanties : un cookie `__Secure-…` doit être `Secure`, et un cookie `__Host-…` doit être `Secure`, avoir `Path=/` et ne pas avoir de `Domain`. Un cookie de session bien configuré, posé par le serveur, ressemble à ceci :

```http
Set-Cookie: __Host-session=8f3a2c…; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400
```

Chrome et Edge traitent un cookie sans `SameSite` comme `Lax`, mais pas Firefox ni Safari (novembre 2026) : indiquez-le toujours explicitement. Les cookies **tiers** (déposés par un autre site que celui affiché) sont bloqués ou cloisonnés par défaut dans Safari et Firefox : ne construisez rien qui en dépende.

### Cookie Store API

La **Cookie Store API** remplace `document.cookie` par une interface asynchrone, à base d'objets, utilisable aussi dans un service worker, avec un événement `change`. Elle est disponible dans Chrome et Edge 87+, Firefox 140+ et Safari 18.4+ (ses méthodes principales sont Baseline 2025), dans un contexte sécurisé uniquement. Comme `document.cookie`, elle ne voit pas les cookies `HttpOnly`.

<!-- no-run -->
```js
await cookieStore.set({
  name: "theme",
  value: "sombre",
  expires: Date.now() + 365 * 24 * 3600 * 1000, // horodatage en millisecondes
  sameSite: "lax",
});

const cookie = await cookieStore.get("theme");
console.log(cookie?.value); // "sombre"

cookieStore.addEventListener("change", (event) => {
  for (const modifie of event.changed) console.log("modifié :", modifie.name);
  for (const supprime of event.deleted)
    console.log("supprimé :", supprime.name);
});

await cookieStore.delete("theme");
```

## IndexedDB

### Concepts

IndexedDB est une vraie base de données dans le navigateur : asynchrone, transactionnelle, capable de stocker des centaines de mégaoctets d'objets structurés (dates, `Map`, `Blob`, fichiers…) et de les rechercher par index. C'est le stockage des applications hors ligne (messagerie, notes, cartes), disponible aussi dans les workers.

| Notion | Rôle |
| --- | --- |
| **Base** | identifiée par un nom et un **numéro de version** entier |
| **Magasin d'objets** (_object store_) | l'équivalent d'une table ; chaque enregistrement a une **clé** (propriété `keyPath` ou clé générée avec `autoIncrement`) |
| **Index** | permet de chercher par une autre propriété (`unique`, `multiEntry` pour les tableaux) |
| **Transaction** | toute lecture ou écriture se fait dans une transaction `"readonly"` ou `"readwrite"` portant sur un ou plusieurs magasins ; elle est atomique |
| **Requête** (`IDBRequest`) | chaque opération renvoie une requête, qui signale `success` ou `error` |
| **`upgradeneeded`** | événement déclenché à l'ouverture quand la version augmente : **seul endroit** où l'on peut créer magasins et index |

L'API d'origine est fondée sur des événements, antérieure aux promesses. Deux petites fonctions suffisent à l'utiliser avec `await` :

<!-- no-run -->
```js
function enPromesse(requete) {
  return new Promise((resoudre, rejeter) => {
    requete.onsuccess = () => resoudre(requete.result);
    requete.onerror = () => rejeter(requete.error);
  });
}

function finDeTransaction(transaction) {
  return new Promise((resoudre, rejeter) => {
    transaction.oncomplete = () => resoudre();
    transaction.onerror = () => rejeter(transaction.error);
    transaction.onabort = () =>
      rejeter(
        transaction.error ??
          new DOMException("Transaction annulée", "AbortError"),
      );
  });
}
```

### Un exemple complet avec des promesses

Un carnet de notes hors ligne. La version 1 de la base crée le magasin `notes` et un index par date ; la version 2 ajoute un index par étiquette. Grâce aux tests sur `event.oldVersion`, un utilisateur qui avait la version 1 reçoit seulement la migration manquante.

<!-- no-run -->
```js
function enPromesse(requete) {
  return new Promise((resoudre, rejeter) => {
    requete.onsuccess = () => resoudre(requete.result);
    requete.onerror = () => rejeter(requete.error);
  });
}
function finDeTransaction(transaction) {
  return new Promise((resoudre, rejeter) => {
    transaction.oncomplete = () => resoudre();
    transaction.onerror = transaction.onabort = () =>
      rejeter(transaction.error);
  });
}

async function ouvrirCarnet() {
  const requete = indexedDB.open("carnet", 2);
  requete.onupgradeneeded = (event) => {
    const base = requete.result;
    if (event.oldVersion < 1) {
      const notes = base.createObjectStore("notes", {
        keyPath: "id",
        autoIncrement: true,
      });
      notes.createIndex("parDate", "modifieeLe");
    }
    if (event.oldVersion < 2) {
      requete.transaction
        .objectStore("notes")
        .createIndex("parEtiquette", "etiquettes", { multiEntry: true });
    }
  };
  requete.onblocked = () =>
    console.warn(
      "Fermez les autres onglets de l'application pour terminer la mise à jour.",
    );
  const base = await enPromesse(requete);
  base.onversionchange = () => base.close(); // un autre onglet veut mettre à jour : on libère la base
  return base;
}

const base = await ouvrirCarnet();

// Écrire
const ecriture = base.transaction("notes", "readwrite");
const notes = ecriture.objectStore("notes");
notes.add({
  titre: "Courses",
  texte: "Pain, lait",
  etiquettes: ["maison"],
  modifieeLe: new Date(),
});
notes.add({
  titre: "Idée",
  texte: "Un cours sur le DOM",
  etiquettes: ["travail", "js"],
  modifieeLe: new Date(),
});
await finDeTransaction(ecriture);

// Lire
const lecture = base.transaction("notes").objectStore("notes"); // "readonly" par défaut
const toutes = await enPromesse(lecture.getAll());
console.log(toutes.length, toutes[0].id, toutes[0].modifieeLe instanceof Date); // 2 1 true
const travail = await enPromesse(
  lecture.index("parEtiquette").getAll("travail"),
);
console.log(travail.map((note) => note.titre)); // ["Idée"]

// Modifier et supprimer, dans une même transaction atomique
const modification = base.transaction("notes", "readwrite");
modification
  .objectStore("notes")
  .put({ ...toutes[0], texte: "Pain, lait, œufs", modifieeLe: new Date() });
modification.objectStore("notes").delete(toutes[1].id);
await finDeTransaction(modification);
const verification = base.transaction("notes").objectStore("notes");
console.log(await enPromesse(verification.count())); // 1
```

Le piège principal concerne la durée de vie des transactions : une transaction se **valide automatiquement** dès qu'elle n'a plus de requête en cours à la fin d'une tâche. Attendre autre chose qu'une requête IndexedDB (un `fetch`, un `setTimeout`) au milieu d'une transaction la referme :

<!-- no-run -->
```js
// ❌ TransactionInactiveError : la transaction s'est terminée pendant le fetch
const transaction = base.transaction("notes", "readwrite");
const reponse = await fetch("/api/notes");
transaction.objectStore("notes").put(await reponse.json());

// ✅ récupérer d'abord, puis ouvrir la transaction et écrire sans attente intermédiaire
const nouvelles = await (await fetch("/api/notes")).json();
const tx = base.transaction("notes", "readwrite");
for (const note of nouvelles) tx.objectStore("notes").put(note);
await finDeTransaction(tx);
```

### La bibliothèque idb

En pratique, on utilise souvent [idb](https://github.com/jakearchibald/idb) (version 8), une couche très légère qui transforme chaque requête en promesse et ajoute des raccourcis. Le même carnet :

<!-- no-run -->
```js
// npm install idb
import { openDB } from "idb";

const base = await openDB("carnet", 2, {
  upgrade(base, ancienneVersion, nouvelleVersion, transaction) {
    if (ancienneVersion < 1) {
      base
        .createObjectStore("notes", { keyPath: "id", autoIncrement: true })
        .createIndex("parDate", "modifieeLe");
    }
    if (ancienneVersion < 2) {
      transaction
        .objectStore("notes")
        .createIndex("parEtiquette", "etiquettes", { multiEntry: true });
    }
  },
});

await base.add("notes", {
  titre: "Idée",
  etiquettes: ["travail"],
  modifieeLe: new Date(),
});
const travail = await base.getAllFromIndex("notes", "parEtiquette", "travail");

const tx = base.transaction("notes", "readwrite"); // plusieurs opérations atomiques
await Promise.all([
  tx.store.put({ ...travail[0], titre: "Idée validée" }),
  tx.done,
]);
```

Pour un simple stockage clé/valeur asynchrone, `idb-keyval` suffit ; pour des requêtes plus riches, Dexie.js offre une API de plus haut niveau.

## Cache API et service workers (aperçu)

La **Cache API** stocke des paires **requête/réponse HTTP**. Associée à un **service worker**, elle permet à un site de fonctionner hors ligne (c'est la base des PWA, _Progressive Web Apps_). Elle est accessible depuis la page et depuis les workers, via l'objet global `caches`, dans un contexte sécurisé.

<!-- no-run -->
```js
const cache = await caches.open("app-v1");
await cache.put("/api/config", Response.json({ theme: "sombre" })); // ou cache.addAll([...urls]) pour télécharger
const reponse = await cache.match("/api/config");
console.log(await reponse.json()); // { theme: "sombre" }
console.log(await caches.keys()); // ["app-v1"]
await caches.delete("app-v1");
```

Un **service worker** est un script qui s'exécute en arrière-plan, entre la page et le réseau : il intercepte les requêtes (`fetch`) et peut répondre depuis le cache. Il exige HTTPS (sauf sur `localhost`). Esquisse d'une stratégie « cache d'abord » :

<!-- no-run -->
```js
// Dans la page
if ("serviceWorker" in navigator) {
  await navigator.serviceWorker.register("/sw.js");
}
```

<!-- no-run -->
```js
// sw.js
const CACHE = "app-v2";
const FICHIERS = ["/", "/app.js", "/styles.css"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FICHIERS)));
});

self.addEventListener("activate", (event) => {
  // Supprime les caches des versions précédentes
  event.waitUntil(
    caches
      .keys()
      .then((noms) =>
        Promise.all(
          noms.filter((nom) => nom !== CACHE).map((nom) => caches.delete(nom)),
        ),
      ),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches
      .match(event.request)
      .then((enCache) => enCache ?? fetch(event.request)),
  );
});
```

Les autres stratégies courantes sont « réseau d'abord » (données fraîches, cache en secours) et _stale-while-revalidate_ (réponse immédiate depuis le cache, mise à jour en arrière-plan). Le cycle de vie d'un service worker (installation, attente, activation, mise à jour) a ses subtilités : la bibliothèque [Workbox](https://developer.chrome.com/docs/workbox) les prend en charge. Ne mettez pas en cache sans réfléchir des réponses privées (données d'un utilisateur connecté) sur un ordinateur partagé.

## OPFS, un système de fichiers privé (aperçu)

L'**Origin Private File System** (Baseline 2023) donne à chaque origine un système de fichiers privé, invisible pour l'utilisateur, optimisé pour les gros fichiers et les écritures fréquentes. C'est lui qu'utilise par exemple la version WebAssembly officielle de SQLite pour stocker sa base.

<!-- no-run -->
```js
const racine = await navigator.storage.getDirectory();
const poignee = await racine.getFileHandle("brouillon.txt", { create: true });

const flux = await poignee.createWritable();
await flux.write("Premier jet du chapitre 25");
await flux.close(); // l'écriture n'est visible qu'après close()

const fichier = await poignee.getFile(); // un objet File
console.log(await fichier.text()); // "Premier jet du chapitre 25"
for await (const [nom, entree] of racine.entries())
  console.log(nom, entree.kind); // brouillon.txt file
await racine.removeEntry("brouillon.txt");
```

`createWritable()` est disponible dans tous les navigateurs récents (Safari depuis la version 26). Dans un worker, `createSyncAccessHandle()` offre un accès synchrone beaucoup plus rapide.

## Quotas, persistance et éviction

Les espaces de stockage ne sont pas illimités, et le navigateur peut les **effacer**. D'après MDN (novembre 2026) :

- Web Storage : 5 Mio pour `localStorage` et 5 Mio pour `sessionStorage`, par origine ;
- IndexedDB, Cache API et OPFS partagent un quota par origine : jusqu'à 60 % du disque dans Chrome et Edge ; dans Firefox, le plus petit de 10 % du disque et 10 Gio (50 % du disque pour une origine persistante) ; dans Safari (macOS 14 et iOS 17 ou plus récents), environ 60 % du disque pour un navigateur ;
- dépasser le quota lève une `QuotaExceededError`.

Par défaut, les données sont stockées **« au mieux »** (_best-effort_) : en cas de manque de place, le navigateur efface les origines les moins récemment utilisées, **en entier**. Safari va plus loin : quand la protection contre le pistage est active, les données créées par script sont supprimées après **sept jours** d'utilisation du navigateur sans interaction avec le site. Une origine peut demander un stockage **persistant**, qui ne sera effacé que par l'utilisateur :

<!-- no-run -->
```js
const { usage, quota } = await navigator.storage.estimate();
console.log(
  `${(usage / 1024 ** 2).toFixed(1)} Mio utilisés sur ${(quota / 1024 ** 3).toFixed(1)} Gio disponibles`,
);

if (!(await navigator.storage.persisted())) {
  const accorde = await navigator.storage.persist(); // Firefox demande à l'utilisateur ; Chrome et Safari décident seuls
  console.log(accorde ? "stockage persistant" : "stockage « au mieux »");
}
```

Conclusion pratique : traitez le stockage du navigateur comme un **cache**. Les données importantes doivent exister ailleurs (serveur, export de fichier) ou pouvoir être reconstruites.

## Quel stockage choisir

| Besoin | Choix |
| --- | --- |
| Préférence d'affichage (thème, langue de l'interface) | `localStorage` avec un wrapper JSON ; un cookie si le serveur doit la connaître pour le rendu |
| Session, authentification | cookie `HttpOnly; Secure; SameSite` posé par le serveur — **jamais** Web Storage |
| Brouillon de formulaire, étape d'un assistant | `sessionStorage` (ou `localStorage` pour survivre à la fermeture) |
| Données d'application, mode hors ligne, gros volumes, fichiers | IndexedDB (avec `idb`) |
| Pages et ressources disponibles hors ligne | service worker + Cache API |
| Très gros fichiers, base SQLite dans le navigateur | OPFS |
| Prévenir les autres onglets | `BroadcastChannel` (ou l'événement `storage`) |
| État d'une vue que l'on veut pouvoir partager | l'URL (`?filtre=bio&page=2`, voir [Fetch et HTTP](../22-fetch-http/README.md)) |
| État temporaire d'une page | une simple variable |

## Pièges courants

- **Stocker un objet sans `JSON.stringify`** : `"[object Object]"`.
- **`JSON.parse` sans `try…catch`** sur une donnée stockée : une valeur corrompue empêche l'application de démarrer.
- **`JSON.parse(null)`** renvoie `null` sans erreur quand la clé n'existe pas.
- **Oublier que les dates reviennent en chaînes** et les nombres stockés aussi (`"1" + 1 === "11"`).
- **Perdre des données sans le voir** : `undefined`, fonctions, `Map`, `Set` disparaissent dans `JSON.stringify` ; les grands entiers perdent leur précision dans `JSON.parse`.
- **Comparer deux objets via leur JSON** : l'ordre des clés peut différer.
- **Mettre un jeton ou des données sensibles dans `localStorage`.**
- **Faire confiance aux données relues** : l'utilisateur peut les modifier.
- **Écrire de gros volumes dans `localStorage`** : l'API synchrone fige la page ; `QuotaExceededError` non gérée.
- **Cookies** : valeur non encodée ; suppression avec un autre `Path` (rien n'est supprimé) ; date d'expiration passée ; `SameSite` et `Secure` oubliés ; plusieurs cookies dans une seule affectation de `document.cookie` (seul le premier est pris en compte).
- **IndexedDB** : attendre un `fetch` au milieu d'une transaction ; créer un magasin hors de `upgradeneeded` ; ne pas gérer `blocked` et `versionchange`.
- **Croire le stockage permanent** : effacement par l'utilisateur, navigation privée, éviction, règle des sept jours de Safari.

## Bonnes pratiques

- Sérialisez avec `JSON.stringify`, relisez avec `JSON.parse` dans un `try…catch`, et **validez** (à la main ou avec un schéma) avant d'utiliser.
- Utilisez `structuredClone` pour copier, JSON pour échanger ou écrire du texte.
- Passez les dates en ISO 8601 et réhydratez-les avec un reviver ; transmettez les grands identifiants sous forme de chaînes (ou utilisez `context.source`).
- Regroupez l'accès à Web Storage dans un petit module (préfixe, JSON, erreurs, version), injectable pour les tests.
- Réservez Web Storage aux petites données non sensibles ; IndexedDB pour le reste.
- Sessions dans des cookies `__Host-`, `HttpOnly`, `Secure`, `SameSite=Lax` (ou `Strict`) posés par le serveur ; jamais de jeton accessible au JavaScript s'il peut l'éviter.
- Versionnez vos schémas (numéro de version IndexedDB, champ `version` dans le JSON stocké) et prévoyez la migration.
- Considérez tout stockage du navigateur comme un cache évictable.

## Résumé

- JSON est un format texte strict à six types (objet, tableau, chaîne, nombre, booléen, `null`) : guillemets doubles, ni commentaires ni virgule finale.
- `JSON.stringify` omet `undefined`, fonctions et symboles, convertit `NaN`/`Infinity` en `null`, les `Date` en chaînes ISO, les `Map`/`Set` en `{}`, et échoue sur `BigInt` et les cycles. Replacer (fonction ou liste blanche), indentation et `toJSON` personnalisent le résultat.
- `JSON.parse` lève une `SyntaxError` sur un texte invalide ; le reviver transforme les valeurs (dates) ; ES2026 ajoute `context.source` et `JSON.rawJSON` pour les nombres exacts.
- `structuredClone` copie en profondeur `Date`, `Map`, `Set`, cycles… mais pas les fonctions ni les prototypes.
- Toute donnée relue (réseau, stockage, URL) doit être validée ; les schémas (Zod, Valibot, JSON Schema) automatisent ce travail.
- `localStorage` (permanent) et `sessionStorage` (par onglet) : chaînes uniquement, ~5 Mio, synchrones, à envelopper de JSON et de `try…catch` ; l'événement `storage` synchronise les onglets.
- Jamais de jeton ni de donnée sensible dans Web Storage : session dans un cookie `HttpOnly; Secure; SameSite`.
- Les cookies sont envoyés au serveur à chaque requête ; `document.cookie` lit une chaîne et écrit un cookie à la fois ; la Cookie Store API est asynchrone.
- IndexedDB stocke de gros volumes d'objets structurés, avec index, transactions et migrations par version ; `idb` la rend agréable.
- Cache API + service worker pour le hors-ligne ; OPFS pour les fichiers ; `navigator.storage` pour les quotas et la persistance.

## Exercices

### Exercice 1 — Prédire la sérialisation (★☆☆)

Sans l'exécuter, écrivez ce qu'affiche ce code. Vérifiez ensuite.

```js
const reservation = {
  id: 12,
  client: "Léa",
  options: ["vue mer", undefined, () => "petit-déjeuner"],
  remise: undefined,
  prixTotal: 0.1 + 0.2,
  date: new Date(Date.UTC(2026, 6, 14, 18, 0)),
  chambre: { numero: 204, toJSON: () => "Chambre 204" },
  note: NaN,
};
console.log(JSON.stringify(reservation));
```

<details>
<summary>Solution</summary>

```text
{"id":12,"client":"Léa","options":["vue mer",null,null],"prixTotal":0.30000000000000004,"date":"2026-07-14T18:00:00.000Z","chambre":"Chambre 204","note":null}
```

- `remise` (`undefined`) est **omise** de l'objet, mais `undefined` et la fonction deviennent `null` **dans le tableau** (les positions doivent être conservées) ;
- `0.1 + 0.2` est sérialisé tel quel, avec son erreur d'arrondi (voir [Nombres et Math](../08-nombres-et-math/README.md)) ;
- les mois de `Date.UTC` commencent à 0 : `6` est juillet ;
- `toJSON` remplace l'objet `chambre` par la chaîne qu'il renvoie ;
- `NaN` devient `null`.

</details>

### Exercice 2 — Analyser sans planter (★☆☆)

Écrivez `analyserJson(texte)` qui renvoie `{ ok: true, valeur }` si `texte` est une chaîne JSON valide, et `{ ok: false, erreur }` sinon (`erreur` étant l'erreur levée). Si `texte` n'est **pas une chaîne** (par exemple `null` renvoyé par `getItem`), renvoyez `{ ok: false, erreur }` avec une `TypeError`, au lieu de laisser `JSON.parse` convertir `null` en `"null"`.

<details>
<summary>Solution</summary>

```js
function analyserJson(texte) {
  if (typeof texte !== "string") {
    return {
      ok: false,
      erreur: new TypeError(
        `Une chaîne était attendue, reçu : ${texte === null ? "null" : typeof texte}`,
      ),
    };
  }
  try {
    return { ok: true, valeur: JSON.parse(texte) };
  } catch (erreur) {
    return { ok: false, erreur };
  }
}

console.log(analyserJson('{"a":[1,2]}')); // { ok: true, valeur: { a: [1, 2] } }
console.log(analyserJson("null")); // { ok: true, valeur: null } : "null" est du JSON valide
console.log(analyserJson(null).erreur.message); // "Une chaîne était attendue, reçu : null"
console.log(analyserJson("{oups}").erreur.name); // "SyntaxError"

const resultat = analyserJson("[1, 2, 3]");
if (resultat.ok) console.log(resultat.valeur.length); // 3
```

Renvoyer un objet « résultat » plutôt que lever une exception (voir [Erreurs](../17-erreurs/README.md)) oblige l'appelant à traiter les deux cas, et le test `resultat.ok` se lit bien. La distinction entre la **chaîne** `"null"` (du JSON valide qui vaut `null`) et la **valeur** `null` (aucune donnée) est exactement ce que `JSON.parse` seul ne fait pas.

</details>

### Exercice 3 — Sérialiser Map, Set, Date et BigInt (★★☆)

Écrivez `serialiser(valeur)` et `deserialiser(texte)` qui font l'aller-retour de valeurs contenant des `Map`, des `Set`, des `Date` et des `BigInt`, à n'importe quelle profondeur. Représentez ces valeurs en JSON par des objets étiquetés, par exemple `{ "$type": "Map", "valeur": [["a", 1]] }`.

<details>
<summary>Solution</summary>

```js
function serialiser(valeur) {
  return JSON.stringify(valeur, function (cle, v) {
    const original = this[cle]; // avant toJSON : une Date est encore une Date ici
    if (original instanceof Date)
      return { $type: "Date", valeur: original.toISOString() };
    if (v instanceof Map) return { $type: "Map", valeur: [...v] };
    if (v instanceof Set) return { $type: "Set", valeur: [...v] };
    if (typeof v === "bigint") return { $type: "BigInt", valeur: v.toString() };
    return v;
  });
}

const reconstruire = {
  Date: (valeur) => new Date(valeur),
  Map: (valeur) => new Map(valeur),
  Set: (valeur) => new Set(valeur),
  BigInt: (valeur) => BigInt(valeur),
};

function deserialiser(texte) {
  return JSON.parse(texte, (cle, v) =>
    v !== null && typeof v === "object" && Object.hasOwn(reconstruire, v.$type)
      ? reconstruire[v.$type](v.valeur)
      : v,
  );
}

const etat = {
  maj: new Date(Date.UTC(2026, 10, 6)),
  vues: new Map([["accueil", new Set(["ada", "léa"])]]),
  octetsTransferes: 9007199254740993n,
};

const texte = serialiser(etat);
console.log(texte);
// {"maj":{"$type":"Date","valeur":"2026-11-06T00:00:00.000Z"},"vues":{"$type":"Map","valeur":[["accueil",{"$type":"Set","valeur":["ada","léa"]}]]},"octetsTransferes":{"$type":"BigInt","valeur":"9007199254740993"}}

const relu = deserialiser(texte);
console.log(relu.maj instanceof Date, relu.vues.get("accueil").has("léa")); // true true
console.log(relu.octetsTransferes === etat.octetsTransferes); // true
```

Le replacer doit être une `function` : `this[cle]` donne la valeur **avant** `toJSON`, seul moyen de reconnaître une `Date` (le paramètre `v` est déjà une chaîne). Les `Map` et `Set` sont convertis en tableaux, eux-mêmes parcourus par le replacer : le `Set` imbriqué dans la `Map` est donc traité aussi. Le reviver travaille des feuilles vers la racine, si bien que le `Set` est reconstruit avant la `Map` qui le contient. `Object.hasOwn` (ES2022) évite qu'un `"$type": "constructor"` malicieux n'appelle une fonction héritée. Limite : un vrai objet de vos données qui aurait une propriété `$type` valant `"Map"` serait mal interprété ; une bibliothèque comme `devalue` ou `superjson` gère ces cas.

</details>

### Exercice 4 — Stockage avec expiration (★★☆)

Écrivez `ecrireAvecExpiration(zone, cle, valeur, dureeMs, maintenant = Date.now())` et `lireAvecExpiration(zone, cle, maintenant = Date.now())`. La lecture renvoie la valeur si elle n'a pas expiré, sinon `null`, et **supprime** alors l'entrée. Une entrée illisible (JSON corrompu, ancien format sans date d'expiration) est traitée comme expirée. `zone` est un objet `Storage` (ou le faux stockage en mémoire de ce chapitre) ; le paramètre `maintenant` permet de tester sans attendre.

<details>
<summary>Solution</summary>

```js
function ecrireAvecExpiration(
  zone,
  cle,
  valeur,
  dureeMs,
  maintenant = Date.now(),
) {
  zone.setItem(cle, JSON.stringify({ valeur, expireLe: maintenant + dureeMs }));
}

function lireAvecExpiration(zone, cle, maintenant = Date.now()) {
  const texte = zone.getItem(cle);
  if (texte === null) return null;
  try {
    const entree = JSON.parse(texte);
    if (typeof entree?.expireLe === "number" && entree.expireLe > maintenant)
      return entree.valeur;
  } catch {
    // JSON corrompu : traité comme expiré
  }
  zone.removeItem(cle);
  return null;
}

function creerZoneMemoire() {
  const donnees = new Map();
  return {
    getItem: (cle) => (donnees.has(cle) ? donnees.get(cle) : null),
    setItem: (cle, valeur) => void donnees.set(cle, String(valeur)),
    removeItem: (cle) => void donnees.delete(cle),
    get length() {
      return donnees.size;
    },
  };
}

const zone = creerZoneMemoire();
const t0 = Date.UTC(2026, 10, 6, 12, 0);
const UNE_HEURE = 3_600_000;

ecrireAvecExpiration(
  zone,
  "meteo",
  { ville: "Lyon", temperature: 14 },
  UNE_HEURE,
  t0,
);
console.log(lireAvecExpiration(zone, "meteo", t0 + 30 * 60_000)); // { ville: "Lyon", temperature: 14 }
console.log(lireAvecExpiration(zone, "meteo", t0 + 2 * UNE_HEURE)); // null
console.log(zone.length); // 0 : l'entrée expirée a été supprimée

zone.setItem("ancienne", '"format sans date"');
console.log(lireAvecExpiration(zone, "ancienne"), zone.length); // null 0
```

On stocke une **date absolue** d'expiration plutôt qu'une durée : la lecture n'a qu'une comparaison à faire. `entree?.expireLe` protège contre un JSON valide mais d'une autre forme (une chaîne, `null`). L'injection de `maintenant` rend le code testable sans manipuler l'horloge ; dans la page, on appelle simplement `lireAvecExpiration(localStorage, "meteo")`. C'est le principe d'un cache de réponses d'API côté client.

</details>

### Exercice 5 — Construire un cookie (★★☆)

Écrivez `serialiserCookie(nom, valeur, options = {})` qui produit la chaîne à affecter à `document.cookie` (ou à envoyer dans un `Set-Cookie`). Options : `maxAge` (secondes), `path` (par défaut `"/"`), `domain`, `sameSite` (`"Strict"`, `"Lax"` ou `"None"`, par défaut `"Lax"`), `secure` (par défaut `true`). La valeur est encodée avec `encodeURIComponent`. Levez une erreur si :

- le nom est vide ou contient un caractère interdit (espace, `;`, `=`, `,`…) ;
- `sameSite` vaut `"None"` sans `secure` ;
- le nom commence par `__Host-` alors que `secure` est faux, que `path` n'est pas `"/"` ou qu'un `domain` est indiqué.

<details>
<summary>Solution</summary>

```js
const NOM_VALIDE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/; // « token » de la RFC 6265
const SAME_SITE = ["Strict", "Lax", "None"];

function serialiserCookie(
  nom,
  valeur,
  { maxAge, path = "/", domain, sameSite = "Lax", secure = true } = {},
) {
  if (!NOM_VALIDE.test(nom))
    throw new TypeError(`Nom de cookie invalide : « ${nom} »`);
  if (!SAME_SITE.includes(sameSite))
    throw new TypeError(`SameSite invalide : ${sameSite}`);
  if (sameSite === "None" && !secure)
    throw new TypeError("SameSite=None exige Secure");
  if (nom.startsWith("__Host-") && (!secure || path !== "/" || domain)) {
    throw new TypeError(
      "Un cookie __Host- exige Secure, Path=/ et aucun Domain",
    );
  }

  const morceaux = [`${nom}=${encodeURIComponent(valeur)}`];
  if (maxAge !== undefined) morceaux.push(`Max-Age=${Math.trunc(maxAge)}`);
  if (path) morceaux.push(`Path=${path}`);
  if (domain) morceaux.push(`Domain=${domain}`);
  morceaux.push(`SameSite=${sameSite}`);
  if (secure) morceaux.push("Secure");
  return morceaux.join("; ");
}

console.log(serialiserCookie("theme", "sombre", { maxAge: 365 * 24 * 3600 }));
// theme=sombre; Max-Age=31536000; Path=/; SameSite=Lax; Secure
console.log(serialiserCookie("recherche", "thé & café"));
// recherche=th%C3%A9%20%26%20caf%C3%A9; Path=/; SameSite=Lax; Secure
console.log(serialiserCookie("theme", "", { maxAge: 0 })); // suppression
// theme=; Max-Age=0; Path=/; SameSite=Lax; Secure

for (const essai of [
  () => serialiserCookie("mon cookie", "x"),
  () => serialiserCookie("suivi", "x", { sameSite: "None", secure: false }),
  () => serialiserCookie("__Host-session", "x", { domain: "exemple.fr" }),
]) {
  try {
    essai();
  } catch (erreur) {
    console.log(erreur.message);
  }
}
// Nom de cookie invalide : « mon cookie »
// SameSite=None exige Secure
// Un cookie __Host- exige Secure, Path=/ et aucun Domain
```

Les valeurs par défaut sont les plus sûres (`Secure`, `SameSite=Lax`, `Path=/`) : il faut un choix explicite pour les affaiblir. Les règles vérifiées sont celles qu'appliquent les navigateurs, qui **ignorent silencieusement** un cookie non conforme : lever une erreur rend le problème visible pendant le développement. L'attribut `HttpOnly` n'est pas proposé : `document.cookie` ne peut pas le poser (seul le serveur le peut).

</details>

### Exercice 6 — Préférences synchronisées entre onglets (★★★)

Réalisez un sélecteur de taille de police (`<input type="range" min="12" max="24">`) et de thème (`<select>`) dont les valeurs :

- sont enregistrées dans `localStorage` sous une seule clé `"prefs"` (objet JSON), via le wrapper sûr du chapitre ;
- sont **validées** à la lecture (valeurs inconnues ou hors bornes remplacées par les valeurs par défaut) ;
- s'appliquent à la page (`data-theme` sur `<html>`, variable CSS `--taille-police`) au chargement ;
- se propagent aux **autres onglets** ouverts grâce à l'événement `storage`.

```html
<label for="taille">Taille du texte</label>
<input type="range" id="taille" min="12" max="24" step="1" />
<label for="theme">Thème</label>
<select id="theme">
  <option value="systeme">Système</option>
  <option value="clair">Clair</option>
  <option value="sombre">Sombre</option>
</select>
```

<details>
<summary>Solution</summary>

```html
<label for="taille">Taille du texte</label>
<input type="range" id="taille" min="12" max="24" step="1" />
<label for="theme">Thème</label>
<select id="theme">
  <option value="systeme">Système</option>
  <option value="clair">Clair</option>
  <option value="sombre">Sombre</option>
</select>
```

<!-- no-run -->
```js
const CLE = "prefs";
const DEFAUT = { theme: "systeme", taille: 16 };
const champTaille = document.getElementById("taille");
const champTheme = document.getElementById("theme");

function valider(brut) {
  const taille = Number(brut?.taille);
  return {
    theme: ["clair", "sombre", "systeme"].includes(brut?.theme)
      ? brut.theme
      : DEFAUT.theme,
    taille:
      Number.isInteger(taille) && taille >= 12 && taille <= 24
        ? taille
        : DEFAUT.taille,
  };
}

function lire() {
  try {
    return valider(JSON.parse(localStorage.getItem(CLE)));
  } catch {
    return { ...DEFAUT }; // JSON corrompu ou stockage indisponible
  }
}

function appliquer(prefs) {
  document.documentElement.dataset.theme = prefs.theme;
  document.documentElement.style.setProperty(
    "--taille-police",
    `${prefs.taille}px`,
  );
  champTheme.value = prefs.theme;
  champTaille.value = prefs.taille;
}

function enregistrer() {
  const prefs = valider({ theme: champTheme.value, taille: champTaille.value });
  try {
    localStorage.setItem(CLE, JSON.stringify(prefs));
  } catch {
    // quota ou stockage indisponible : la préférence ne vaudra que pour cette page
  }
  appliquer(prefs);
}

champTheme.addEventListener("change", enregistrer);
champTaille.addEventListener("input", enregistrer);

window.addEventListener("storage", (event) => {
  if (event.storageArea !== localStorage) return;
  if (event.key === CLE || event.key === null) appliquer(lire()); // null : localStorage.clear()
});

appliquer(lire());
console.log(document.documentElement.dataset.theme, champTaille.value); // "systeme" "16" au premier chargement
```

`valider` reçoit aussi bien l'objet relu que les valeurs des champs (des chaînes) : `Number(brut?.taille)` couvre les deux, et `?.` gère `null` (clé absente : `JSON.parse(null)` vaut `null`). Dans l'écouteur `storage`, on relit et revalide plutôt que de faire confiance à `event.newValue`. Pour le vérifier, ouvrez la page dans deux onglets : changer le thème dans l'un met l'autre à jour aussitôt. Il est inutile d'écouter `storage` dans l'onglet qui écrit : il ne le reçoit pas, c'est pourquoi `enregistrer` appelle `appliquer` lui-même.

</details>

### Exercice 7 — Un magasin clé/valeur sur IndexedDB (★★★)

Écrivez `creerMagasin(nomBase)` qui renvoie un objet `{ get(cle), set(cle, valeur), delete(cle), keys() }`, chaque méthode renvoyant une promesse. La base (un seul magasin `"valeurs"`, sans `keyPath`) n'est ouverte qu'**une fois**, au premier appel. Les valeurs peuvent être de tout type clonable (`Date`, `Map`, `Blob`…).

<details>
<summary>Solution</summary>

<!-- no-run -->
```js
function enPromesse(requete) {
  return new Promise((resoudre, rejeter) => {
    requete.onsuccess = () => resoudre(requete.result);
    requete.onerror = () => rejeter(requete.error);
  });
}

function creerMagasin(nomBase) {
  let baseOuverte; // promesse partagée : une seule ouverture, même avec des appels simultanés

  function base() {
    baseOuverte ??= new Promise((resoudre, rejeter) => {
      const requete = indexedDB.open(nomBase, 1);
      requete.onupgradeneeded = () =>
        requete.result.createObjectStore("valeurs");
      requete.onsuccess = () => resoudre(requete.result);
      requete.onerror = () => rejeter(requete.error);
    });
    return baseOuverte;
  }

  async function operation(mode, action) {
    const transaction = (await base()).transaction("valeurs", mode);
    const resultat = await enPromesse(
      action(transaction.objectStore("valeurs")),
    );
    if (mode === "readwrite") {
      await new Promise((resoudre, rejeter) => {
        transaction.oncomplete = resoudre; // écriture réellement validée
        transaction.onerror = transaction.onabort = () =>
          rejeter(transaction.error);
      });
    }
    return resultat;
  }

  return {
    get: (cle) => operation("readonly", (magasin) => magasin.get(cle)),
    set: (cle, valeur) =>
      operation("readwrite", (magasin) => magasin.put(valeur, cle)),
    delete: (cle) => operation("readwrite", (magasin) => magasin.delete(cle)),
    keys: () => operation("readonly", (magasin) => magasin.getAllKeys()),
  };
}

const magasin = creerMagasin("preferences-app");
await Promise.all([
  magasin.set("derniereVisite", new Date(Date.UTC(2026, 10, 6))),
  magasin.set("filtres", new Map([["bio", true]])),
]);
const date = await magasin.get("derniereVisite");
console.log(date instanceof Date, (await magasin.get("filtres")).get("bio")); // true true
console.log(await magasin.keys()); // ["derniereVisite", "filtres"]
await magasin.delete("filtres");
console.log(await magasin.get("filtres")); // undefined
```

La promesse d'ouverture est mémorisée (`??=`, ES2021) : deux appels simultanés attendent la même ouverture au lieu d'ouvrir deux connexions. Sans `keyPath`, la clé est passée à part : `put(valeur, cle)`. Pour une écriture, on attend `complete` sur la transaction et non seulement le `success` de la requête : c'est la garantie que les données sont enregistrées. Les clés sont renvoyées triées (ordre des clés IndexedDB), et une clé absente donne `undefined`. C'est, en quelques lignes, le principe de la bibliothèque `idb-keyval`.

</details>

## Pour aller plus loin

- [MDN — JSON](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/JSON), [`JSON.stringify()`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify), [`JSON.parse()`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
- [MDN — `structuredClone()`](https://developer.mozilla.org/fr/docs/Web/API/Window/structuredClone)
- [MDN — Utiliser l'API Web Storage](https://developer.mozilla.org/fr/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
- [MDN — Cookies HTTP](https://developer.mozilla.org/fr/docs/Web/HTTP/Guides/Cookies) et [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API)
- [MDN — Utiliser IndexedDB](https://developer.mozilla.org/fr/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [MDN — Quotas de stockage et critères d'éviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [MDN — Origin Private File System](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)
- [web.dev — Stockage pour le Web](https://web.dev/articles/storage-for-the-web)
- [OWASP — HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html) (section Local Storage)

---

[← Chapitre précédent](../24-evenements/README.md) · [Sommaire](../README.md#sommaire) · [Chapitre suivant →](../26-modules/README.md)
