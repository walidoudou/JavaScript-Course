# 20 — `async`/`await` et les patterns asynchrones

> **Niveau** : Intermédiaire à avancé · **Durée** : ~4 h · **Prérequis** : [Les promesses](../19-promises/README.md)

`async`/`await` (ES2017) permet d'écrire du code asynchrone qui se lit comme du code synchrone : de haut en bas, avec des variables ordinaires, des boucles et des `try/catch`. Sous le capot, ce sont toujours des [promesses](../19-promises/README.md). La première moitié du chapitre présente la syntaxe et ses règles ; la seconde, les patterns dont on a besoin en production : exécution parallèle, annulation, délai maximal, nouvelles tentatives, limitation de la concurrence et pagination.

## Objectifs

- Écrire des fonctions `async` et utiliser `await` en sachant ce qui se passe dans la boucle d'événements.
- Gérer les erreurs avec `try/catch/finally`, y compris le piège du `return` sans `await`.
- Choisir entre exécution séquentielle et parallèle, et combiner `await` avec les combinateurs de promesses.
- Utiliser `await` correctement dans les boucles, avec `for await…of` et `Array.fromAsync`.
- Annuler une opération avec `AbortController`, `AbortSignal.timeout` et `AbortSignal.any`.
- Implémenter les patterns de production : délai maximal, nouvelles tentatives avec backoff et jitter, limiteur de concurrence, pagination.
- Éviter les pièges : `await` oublié, `async` dans un constructeur, conditions de course entre deux `await`.

## Sommaire

- [Pourquoi `async`/`await`](#pourquoi-asyncawait)
- [Les fonctions `async`](#les-fonctions-async)
- [L'opérateur `await`](#lopérateur-await)
- [Gérer les erreurs](#gérer-les-erreurs)
- [Séquentiel ou parallèle](#séquentiel-ou-parallèle)
- [`await` dans les boucles](#await-dans-les-boucles)
- [Top-level await](#top-level-await)
- [Annuler avec `AbortController`](#annuler-avec-abortcontroller)
- [Imposer un délai maximal](#imposer-un-délai-maximal)
- [Réessayer avec backoff exponentiel et jitter](#réessayer-avec-backoff-exponentiel-et-jitter)
- [Limiter la concurrence](#limiter-la-concurrence)
- [Paginer une API](#paginer-une-api)
- [Performance](#performance)
- [Pièges courants](#pièges-courants)
- [Bonnes pratiques](#bonnes-pratiques)
- [Résumé](#résumé)
- [Exercices](#exercices)
- [Pour aller plus loin](#pour-aller-plus-loin)

## Pourquoi `async`/`await`

Reprenons l'exemple des chapitres précédents : charger un utilisateur, puis ses commandes, puis calculer un total avec remise. Avec `then`, chaque étape ne voit que le résultat de la précédente. Avec `async`/`await`, tout est dans la même portée :

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function chargerUtilisateur(id) {
  await attendre(10); // simule un appel réseau
  if (id <= 0) throw new Error(`Utilisateur ${id} introuvable`);
  return { id, nom: "Ada", premium: true };
}

async function chargerCommandes(utilisateur) {
  await attendre(10);
  return [
    { numero: "C-101", total: 30 },
    { numero: "C-102", total: 55 },
  ];
}

async function afficherResume(id) {
  try {
    const utilisateur = await chargerUtilisateur(id);
    const commandes = await chargerCommandes(utilisateur);
    const total = commandes.reduce((somme, c) => somme + c.total, 0);
    const aPayer = utilisateur.premium ? total * 0.9 : total;
    console.log(`${utilisateur.nom} : ${commandes.length} commandes, ${aPayer} €`);
  } catch (erreur) {
    console.log("Résumé indisponible :", erreur.message);
  }
}

await afficherResume(1); // Ada : 2 commandes, 76.5 €
await afficherResume(0); // Résumé indisponible : Utilisateur 0 introuvable
```

Ce code ne bloque rien : à chaque `await`, la fonction se met en pause et rend la main à la boucle d'événements, qui peut traiter autre chose. Elle reprend quand la promesse attendue est réglée.

## Les fonctions `async`

Le mot-clé `async` se place devant toutes les formes de fonctions :

```js
async function chargerA() {} // déclaration
const chargerB = async function () {}; // expression
const chargerC = async (id) => id; // fléchée

const api = {
  async charger(id) {
    return { id }; // méthode d'objet
  },
};

class Depot {
  async trouver(id) {
    return { id }; // méthode de classe
  }
  static async ouvrir() {
    return new Depot(); // méthode statique
  }
}

console.log(chargerC(1) instanceof Promise); // true
console.log(await api.charger(2)); // { id: 2 }
console.log(await (await Depot.ouvrir()).trouver(3)); // { id: 3 }
```

Il existe aussi des générateurs asynchrones, `async function*`, présentés au [chapitre 13](../13-iterateurs-generateurs/README.md) et utilisés plus bas pour [paginer une API](#paginer-une-api).

Une fonction `async` **renvoie toujours une promesse** :

| Dans la fonction `async`… | La promesse renvoyée est… |
| --- | --- |
| `return valeur` | tenue avec `valeur` |
| pas de `return` | tenue avec `undefined` |
| `return promesse` | réglée comme `promesse` |
| une exception est levée (même avant le premier `await`) | rejetée avec cette exception |

La dernière ligne est précieuse : une fonction `async` ne lève **jamais** d'exception synchrone. L'appelant n'a qu'un seul canal d'erreur à surveiller, comme avec [`Promise.try`](../19-promises/README.md#promisetry).

```js
async function doubler(n) {
  if (typeof n !== "number") throw new TypeError("n doit être un nombre");
  return n * 2;
}

const resultat = doubler(21);
console.log(resultat instanceof Promise); // true
resultat.then((valeur) => console.log(valeur)); // 42
doubler("x").catch((erreur) => console.log("Rejet :", erreur.message)); // Rejet : n doit être un nombre
```

Une fonction `async` sans aucun `await` est légale, mais elle ne gagne rien à l'être, sinon cette garantie de toujours renvoyer une promesse.

## L'opérateur `await`

`await expression` met la fonction en pause jusqu'au règlement de la promesse, puis :

- si la promesse est **tenue**, l'expression vaut sa valeur ;
- si elle est **rejetée**, `await` **lève** la raison comme une exception, à cet endroit précis.

Si l'expression n'est pas une promesse, `await` l'enveloppe dans une promesse tenue (et un thenable est assimilé, voir le [chapitre 19](../19-promises/README.md#les-thenables)).

```js
const valeur = await 42; // pas une promesse : la valeur est enveloppée
console.log(valeur); // 42

try {
  await Promise.reject(new Error("refusé"));
} catch (erreur) {
  console.log("await a levé :", erreur.message); // await a levé : refusé
}
```

`await` n'est autorisé que dans une fonction `async` et au [premier niveau d'un module](#top-level-await). Ailleurs, c'est une `SyntaxError`.

> [!IMPORTANT]
> `await` met en pause **la fonction**, pas le programme. Pendant l'attente, le thread est libre : d'autres fonctions, d'autres événements, d'autres requêtes sont traités. C'est toute la différence avec une attente bloquante.

### L'ordre d'exécution d'une fonction `async`

Le corps d'une fonction `async` s'exécute **de façon synchrone jusqu'au premier `await`**. Ensuite, la suite de la fonction est programmée comme une microtâche quand la promesse attendue est réglée (voir le [chapitre 18](../18-asynchrone/README.md#prédire-lordre-dexécution)).

```js
async function preparer() {
  console.log("2. début de preparer (synchrone)");
  await null;
  console.log("4. suite de preparer (microtâche)");
}

console.log("1. avant l'appel");
setTimeout(() => console.log("6. minuteur (tâche)"), 0);
preparer().then(() => console.log("5. promesse de preparer tenue"));
console.log("3. après l'appel");
// 1. avant l'appel
// 2. début de preparer (synchrone)
// 3. après l'appel
// 4. suite de preparer (microtâche)
// 5. promesse de preparer tenue
// 6. minuteur (tâche)
```

Conséquence : entre deux `await`, **d'autres morceaux de code ont pu s'exécuter** et modifier l'état partagé. On y revient dans les [pièges](#une-condition-de-course-entre-deux-await).

## Gérer les erreurs

### `try/catch/finally`

Un `await` dont la promesse est rejetée lève une exception : on la traite avec un `try/catch` ordinaire, et `finally` sert au nettoyage.

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function chargerProduit(id) {
  await attendre(10);
  if (id === 0) throw new Error("Produit introuvable");
  return { id, nom: "Lampe" };
}

async function afficherProduit(id) {
  console.log(`[${id}] Indicateur affiché`);
  try {
    const produit = await chargerProduit(id);
    console.log(`[${id}] Produit : ${produit.nom}`);
  } catch (erreur) {
    console.log(`[${id}] Erreur : ${erreur.message}`);
  } finally {
    console.log(`[${id}] Indicateur masqué`);
  }
}

await afficherProduit(7);
await afficherProduit(0);
// [7] Indicateur affiché
// [7] Produit : Lampe
// [7] Indicateur masqué
// [0] Indicateur affiché
// [0] Erreur : Produit introuvable
// [0] Indicateur masqué
```

Les principes du [chapitre 17](../17-erreurs/README.md) s'appliquent tels quels : attrapez l'erreur là où vous savez quoi en faire, ajoutez du contexte avec `cause`, et laissez remonter le reste.

### Une valeur de repli pour une seule étape

Pour qu'une étape facultative ne fasse pas échouer toute la fonction, combiner `await` et `.catch` est souvent plus lisible qu'un `try/catch` dédié :

```js
const chargerPreferences = async () => {
  throw new Error("service des préférences indisponible");
};

const preferences = await chargerPreferences().catch(() => ({ theme: "clair", langue: "fr" }));
console.log(preferences.theme); // clair
```

### `return await` dans un `try`

C'est le piège le plus subtil de `async`/`await`. Dans un `try`, `return promesse` renvoie la promesse **sans l'attendre** : si elle est rejetée plus tard, le `catch` de cette fonction n'en saura rien.

```js
const chargerConfig = async () => {
  throw new Error("fichier de configuration illisible");
};

async function configSansAwait() {
  try {
    return chargerConfig(); // ❌ la promesse sort du try avant d'être rejetée
  } catch {
    return { theme: "clair" };
  }
}

async function configAvecAwait() {
  try {
    return await chargerConfig(); // ✅ le rejet est levé ici, dans le try
  } catch {
    return { theme: "clair" };
  }
}

await configSansAwait().catch((erreur) => console.log("❌ Rejet qui a échappé au catch :", erreur.message));
console.log("✅", await configAvecAwait());
// ❌ Rejet qui a échappé au catch : fichier de configuration illisible
// ✅ { theme: 'clair' }
```

Hors d'un `try`, `return promesse` et `return await promesse` donnent le même résultat. Prenez tout de même l'habitude du `return await` : il ne coûte rien et les piles d'appels sont plus complètes. L'ancienne règle ESLint `no-return-await`, qui le déconseillait, est d'ailleurs dépréciée depuis ESLint 8.46.

### Des piles d'appels lisibles

V8 (Chrome, Node.js) reconstitue la chaîne des `await` dans les piles d'appels, marquée par le mot `async` :

```js
async function niveau3() {
  await null;
  throw new Error("au fond");
}
async function niveau2() {
  await niveau3();
}
async function niveau1() {
  await niveau2();
}

niveau1().catch((erreur) => {
  const pile = erreur.stack.split("\n").map((ligne) => ligne.trim().split(" (")[0]);
  console.log(pile.join("\n"));
});
// Error: au fond
// at niveau3
// at async niveau2
// at async niveau1
```

Cette reconstitution ne fonctionne que si chaque niveau **attend** le suivant : un `return` sans `await` ou une promesse lancée sans être attendue fait disparaître des maillons.

### Ne pas oublier les rejets

Appeler une fonction `async` sans `await` ni `.catch` crée une promesse que personne ne surveille : en cas d'échec, c'est un [rejet non géré](../19-promises/README.md#les-rejets-non-gérés), qui arrête un processus Node.js. Si vous lancez volontairement une tâche sans l'attendre (« fire and forget »), gérez son erreur explicitement :

<!-- no-run -->
```js
// ❌ Si l'envoi échoue, le processus Node.js s'arrête
envoyerStatistiques(evenement);

// ✅ On assume de ne pas attendre, mais l'erreur est gérée
envoyerStatistiques(evenement).catch((erreur) => journal.warn("Statistiques perdues", erreur));
```

## Séquentiel ou parallèle

### La cascade involontaire

Deux `await` successifs s'exécutent **l'un après l'autre**. C'est indispensable quand la seconde opération dépend de la première, mais c'est du temps perdu quand elles sont indépendantes.

```js
const attendre = (ms, valeur) => new Promise((resolve) => setTimeout(resolve, ms, valeur));
const chargerProfil = () => attendre(100, "profil");
const chargerNotifications = () => attendre(100, "notifications");
const chargerMeteo = () => attendre(100, "météo");

async function mesurer(etiquette, fonction) {
  const debut = performance.now();
  const resultat = await fonction();
  const duree = Math.round((performance.now() - debut) / 100) * 100;
  console.log(`${etiquette} : ≈ ${duree} ms`, resultat);
}

// ❌ Trois attentes indépendantes, faites l'une après l'autre
await mesurer("séquentiel", async () => {
  const profil = await chargerProfil();
  const notifications = await chargerNotifications();
  const meteo = await chargerMeteo();
  return [profil, notifications, meteo];
});

// ✅ Les trois opérations démarrent ensemble
await mesurer("parallèle", async () => {
  const [profil, notifications, meteo] = await Promise.all([
    chargerProfil(),
    chargerNotifications(),
    chargerMeteo(),
  ]);
  return [profil, notifications, meteo];
});
// séquentiel : ≈ 300 ms [ 'profil', 'notifications', 'météo' ]
// parallèle : ≈ 100 ms [ 'profil', 'notifications', 'météo' ]
```

« Parallèle » est ici un abus de langage courant : un seul thread exécute le JavaScript, mais les trois **attentes** se chevauchent (c'est de la concurrence, voir le [chapitre 18](../18-asynchrone/README.md#vocabulaire)).

### Respecter les dépendances

Les vraies situations mélangent étapes dépendantes et indépendantes. La règle : **regroupez chaque suite d'étapes dépendantes dans une fonction `async`, puis lancez les groupes indépendants avec `Promise.all`.**

```js
const attendre = (ms, valeur) => new Promise((resolve) => setTimeout(resolve, ms, valeur));
const chargerUtilisateur = (id) => attendre(50, { id, nom: "Ada" });
const chargerCommandes = (utilisateur) => attendre(50, ["C-101", "C-102"]);
const chargerRecommandations = (utilisateur) => attendre(50, ["Lampe", "Bureau"]);
const chargerMeteo = () => attendre(80, "ensoleillé");

// Groupe dépendant : il faut l'utilisateur avant le reste
async function chargerEspaceClient(id) {
  const utilisateur = await chargerUtilisateur(id);
  const [commandes, recommandations] = await Promise.all([
    chargerCommandes(utilisateur),
    chargerRecommandations(utilisateur),
  ]);
  return { utilisateur, commandes, recommandations };
}

const debut = performance.now();
const [espace, meteo] = await Promise.all([chargerEspaceClient(1), chargerMeteo()]);
console.log(espace.utilisateur.nom, espace.commandes, espace.recommandations, meteo);
console.log(`≈ ${Math.round((performance.now() - debut) / 50) * 50} ms`);
// Ada [ 'C-101', 'C-102' ] [ 'Lampe', 'Bureau' ] ensoleillé
// ≈ 100 ms
```

En séquentiel, il aurait fallu 230 ms ; ici, la durée est celle du chemin le plus long (utilisateur puis commandes : 100 ms).

### Démarrer tôt, attendre tard : attention aux rejets

Une autre façon de paralléliser consiste à lancer les opérations, puis à les attendre une par une. Cela fonctionne… tant que rien n'échoue :

```js
process.on("unhandledRejection", (erreur) => console.log("Rejet non géré :", erreur.message));

const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const chargerProfil = () => attendre(100).then(() => "profil");
const chargerNotifications = () =>
  attendre(10).then(() => {
    throw new Error("notifications indisponibles");
  });

try {
  const profil = chargerProfil(); // ❌ lancée, attendue plus tard
  const notifications = chargerNotifications(); // ❌ échoue pendant qu'on attend le profil
  console.log(await profil);
  console.log(await notifications);
} catch (erreur) {
  console.log("Attrapée :", erreur.message);
}
// Rejet non géré : notifications indisponibles
// profil
// Attrapée : notifications indisponibles
```

Les notifications échouent au bout de 10 ms, alors que personne n'a encore branché de gestionnaire sur leur promesse (on attend encore le profil) : c'est un rejet non géré. Sans l'écouteur de la première ligne, **Node.js s'arrêterait à cet instant**, et le `catch` ne servirait à rien. `Promise.all` n'a pas ce défaut, car il s'abonne à toutes les promesses immédiatement.

### Les autres combinateurs avec `await`

Les combinateurs du [chapitre 19](../19-promises/README.md#les-combinateurs) s'utilisent naturellement avec `await` :

```js
const reussir = (ms, valeur) => new Promise((resolve) => setTimeout(resolve, ms, valeur));
const echouer = (ms, message) => new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));

const bilan = await Promise.allSettled([reussir(10, "A envoyé"), echouer(5, "B refusé")]);
console.log(bilan.map((r) => r.value ?? r.reason.message)); // [ 'A envoyé', 'B refusé' ]

const miroir = await Promise.any([echouer(5, "Paris en panne"), reussir(20, "Lyon")]);
console.log(miroir); // Lyon

try {
  await Promise.all([reussir(20, "OK"), echouer(10, "un échec suffit")]);
} catch (erreur) {
  console.log(erreur.message); // un échec suffit
}
```

## `await` dans les boucles

### `for…of` : l'une après l'autre

Une boucle `for…of` (ou `for`, `while`) avec `await` traite les éléments **en séquence**. C'est ce qu'il faut quand l'ordre compte, quand chaque étape dépend de la précédente, ou pour ménager un service distant.

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const paiements = [
  { id: "P1", montant: 40 },
  { id: "P2", montant: 25 },
  { id: "P3", montant: 60 },
];

async function debiter(paiement) {
  await attendre(10);
  return `${paiement.id} débité de ${paiement.montant} €`;
}

for (const paiement of paiements) {
  console.log(await debiter(paiement));
}
// P1 débité de 40 €
// P2 débité de 25 €
// P3 débité de 60 €
```

### `map` + `Promise.all` : toutes ensemble

Pour traiter les éléments **en parallèle**, transformez-les en promesses avec `map`, puis attendez le tout :

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const villes = ["Paris", "Lyon", "Lille"];

async function chargerTemperature(ville) {
  await attendre(30);
  return { ville, temperature: ville.length * 3 };
}

const releves = await Promise.all(villes.map(chargerTemperature));
console.log(releves.map((r) => `${r.ville} ${r.temperature} °C`).join(", "));
// Paris 15 °C, Lyon 12 °C, Lille 15 °C
```

Si la liste peut contenir des centaines d'éléments, limitez le nombre d'opérations simultanées (voir [Limiter la concurrence](#limiter-la-concurrence)).

### Le piège de `forEach`

`forEach` appelle le callback et **ignore la promesse** qu'il renvoie : il n'attend rien, et les erreurs des callbacks deviennent des rejets non gérés. Il en va de même pour `some`, `every`, `find`…

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fichiers = ["a.txt", "b.txt", "c.txt"];

async function televerser(fichier) {
  await attendre(10);
  console.log("téléversé :", fichier);
}

// ❌ forEach n'attend pas les callbacks async
fichiers.forEach(async (fichier) => {
  await televerser(fichier);
});
console.log("forEach terminé ?");

await attendre(50);

// ✅ for…of attend chaque itération
for (const fichier of fichiers) {
  await televerser(fichier);
}
console.log("for…of terminé");
// forEach terminé ?
// téléversé : a.txt
// téléversé : b.txt
// téléversé : c.txt
// téléversé : a.txt
// téléversé : b.txt
// téléversé : c.txt
// for…of terminé
```

### Le piège de `filter` (et de `reduce`)

Un prédicat `async` renvoie une **promesse**, toujours truthy : `filter` garde tous les éléments.

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pseudos = ["ada", "admin", "grace", "root"];

async function estDisponible(pseudo) {
  await attendre(5);
  return !["admin", "root"].includes(pseudo);
}

// ❌ Chaque prédicat renvoie une promesse : tout est gardé
console.log(pseudos.filter(async (pseudo) => await estDisponible(pseudo)));
// [ 'ada', 'admin', 'grace', 'root' ]

// ✅ On calcule d'abord les booléens, puis on filtre de façon synchrone
const disponibles = await Promise.all(pseudos.map(estDisponible));
console.log(pseudos.filter((_, index) => disponibles[index])); // [ 'ada', 'grace' ]
```

Avec `reduce`, l'accumulateur devient une promesse qu'il faut attendre à chaque tour : le code fonctionne, mais il est difficile à lire et séquentiel. Une boucle `for…of` dit la même chose plus clairement.

### `for await…of`

`for await…of` parcourt un **itérable asynchrone** : chaque valeur est attendue avant le tour suivant. On le rencontre avec les générateurs asynchrones, les flux de Node.js (`readline`, streams) ou les réponses paginées.

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function* lireCapteur() {
  for (let mesure = 1; mesure <= 3; mesure++) {
    await attendre(10); // une nouvelle mesure toutes les 10 ms
    yield { mesure, temperature: 20 + mesure * 0.5 };
  }
}

for await (const releve of lireCapteur()) {
  console.log(`Mesure ${releve.mesure} : ${releve.temperature} °C`);
}
// Mesure 1 : 20.5 °C
// Mesure 2 : 21 °C
// Mesure 3 : 21.5 °C
```

`for await…of` accepte aussi un tableau de promesses, mais c'est un piège : il les attend une par une, et si une promesse plus loin dans le tableau échoue pendant qu'il attend la première, ce rejet n'est pas encore surveillé.

<!-- no-run -->
```js
// ❌ Si la seconde promesse échoue avant que la première soit tenue,
//    Node.js signale un rejet non géré et s'arrête, malgré le try/catch
try {
  for await (const resultat of [chargerLent(), chargerRapideQuiEchoue()]) {
    console.log(resultat);
  }
} catch (erreur) {
  console.log("trop tard");
}

// ✅ Pour un tableau de promesses déjà lancées : Promise.all
const resultats = await Promise.all([chargerLent(), chargerRapideQuiEchoue()]);
```

### `Array.fromAsync`

`Array.fromAsync(iterable, fonction?)` (ES2026) est l'équivalent asynchrone d'`Array.from` : il parcourt un itérable asynchrone (ou synchrone), attend chaque valeur **dans l'ordre**, et renvoie une promesse du tableau complet. La fonction de transformation facultative peut elle-même être asynchrone. Il est disponible dans tous les navigateurs principaux depuis janvier 2024 (Baseline, largement disponible) et dans Node.js 22+.

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function* lireCapteur() {
  for (let mesure = 1; mesure <= 3; mesure++) {
    await attendre(10);
    yield { mesure, temperature: 20 + mesure * 0.5 };
  }
}

const releves = await Array.fromAsync(lireCapteur());
console.log(releves.length); // 3

const temperatures = await Array.fromAsync(lireCapteur(), (releve) => releve.temperature);
console.log(temperatures); // [ 20.5, 21, 21.5 ]
```

Comme `for await…of`, il traite les éléments séquentiellement : pour un tableau de promesses déjà lancées, préférez `Promise.all`, plus rapide et sans le risque de rejet non géré décrit ci-dessus.

## Top-level await

Depuis ES2022, `await` est autorisé **au premier niveau d'un module** (fichier `.mjs`, package avec `"type": "module"`, `<script type="module">`), sans fonction `async` englobante. Il ne fonctionne pas dans un script classique ni dans un module CommonJS.

```js
import { readFile, rm, writeFile } from "node:fs/promises";

await writeFile("config.json", JSON.stringify({ langue: "fr", theme: "sombre" }));
const config = JSON.parse(await readFile("config.json", "utf8"));
console.log(`Thème : ${config.theme}`); // Thème : sombre
await rm("config.json");
```

Usages typiques : lire une configuration au démarrage, ouvrir une connexion, charger un module conditionnellement avec `import()`. Un module qui utilise `await` au premier niveau **retarde l'exécution des modules qui l'importent** jusqu'à ce que son attente soit terminée : réservez-le à l'initialisation, pas à des opérations longues. Le [chapitre 26](../26-modules/README.md) détaille son interaction avec les imports.

Dans Node.js, si l'attente de premier niveau ne se règle jamais (et que plus rien ne maintient le programme en vie), le processus s'arrête avec un avertissement et le code de sortie 13 :

<!-- no-run -->
```js
await new Promise(() => {}); // ne se règle jamais
// Warning: Detected unsettled top-level await at file:///…/script.mjs:1
// (code de sortie 13)
```

## Annuler avec `AbortController`

### Le principe

Une promesse ne peut pas être annulée : elle représente une opération déjà lancée. Pourtant, il faut souvent **arrêter** un travail devenu inutile : l'utilisateur a quitté la page, une nouvelle recherche remplace la précédente, un délai est dépassé. Le mécanisme standard, commun au navigateur et à Node.js, repose sur deux objets :

- un **`AbortController`**, gardé par celui qui décide d'annuler ;
- son **`AbortSignal`** (`controleur.signal`), transmis à l'opération, qui l'écoute.

| API | Rôle |
| --- | --- |
| `controleur.abort(raison?)` | annule ; la raison par défaut est une `DOMException` nommée `"AbortError"` |
| `signal.aborted` | `true` une fois annulé |
| `signal.reason` | la raison de l'annulation |
| `signal.throwIfAborted()` | lève `signal.reason` si le signal est annulé |
| événement `"abort"` | déclenché au moment de l'annulation |
| `AbortSignal.abort(raison?)` | un signal déjà annulé |
| `AbortSignal.timeout(ms)` | un signal qui s'annule seul au bout de `ms`, avec une `DOMException` nommée `"TimeoutError"` |
| `AbortSignal.any(signaux)` | un signal annulé dès que l'un des signaux l'est, avec la même raison |

`AbortSignal.timeout` et `AbortSignal.any` sont disponibles dans tous les navigateurs principaux (Baseline, largement disponibles) et dans toutes les versions maintenues de Node.js. De nombreuses API acceptent directement une option `signal` : `fetch`, `addEventListener`, `node:timers/promises`, `fs.readFile`, `events.once`, les streams…

```js
import { setTimeout as attendre } from "node:timers/promises";

const controleur = new AbortController();
setTimeout(() => controleur.abort(), 50); // on annule au bout de 50 ms

try {
  await attendre(1000, "terminé", { signal: controleur.signal });
} catch (erreur) {
  console.log(erreur.name); // AbortError
  console.log(controleur.signal.aborted); // true
}
```

### Rendre sa propre fonction annulable

Pour qu'une fonction respecte un signal, quatre règles :

1. si le signal est **déjà** annulé, échouer tout de suite ;
2. écouter l'événement `"abort"` ;
3. à l'annulation, **arrêter réellement le travail** (minuteur, connexion…) et rejeter avec `signal.reason` ;
4. une fois terminé, **retirer l'écouteur** (un signal peut vivre longtemps et servir à beaucoup d'opérations).

```js
function simulerRequete(url, { signal } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted(); // règle 1 : dans l'exécuteur, l'exception devient un rejet

    const minuteur = setTimeout(() => {
      signal?.removeEventListener("abort", surAnnulation); // règle 4
      resolve(`réponse de ${url}`);
    }, 100);

    function surAnnulation() {
      clearTimeout(minuteur); // règle 3 : on arrête le travail…
      reject(signal.reason); // …et on rejette avec la raison
    }
    signal?.addEventListener("abort", surAnnulation, { once: true }); // règle 2
  });
}

console.log(await simulerRequete("/produits")); // réponse de /produits

try {
  await simulerRequete("/lent", { signal: AbortSignal.timeout(30) });
} catch (erreur) {
  console.log(erreur.name); // TimeoutError
}

try {
  await simulerRequete("/jamais", { signal: AbortSignal.abort() });
} catch (erreur) {
  console.log(erreur.name); // AbortError
}
```

### Annuler la recherche précédente

Cas d'école : une recherche lancée à chaque frappe. Seule la dernière réponse compte ; les précédentes doivent être annulées, sinon une réponse lente pourrait écraser une réponse plus récente.

```js
function simulerRequete(url, { signal } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const minuteur = setTimeout(() => {
      signal?.removeEventListener("abort", surAnnulation);
      resolve(`résultats de ${url}`);
    }, 50);
    function surAnnulation() {
      clearTimeout(minuteur);
      reject(signal.reason);
    }
    signal?.addEventListener("abort", surAnnulation, { once: true });
  });
}

let controleurPrecedent;

async function rechercher(terme) {
  controleurPrecedent?.abort(); // annule la recherche en cours, s'il y en a une
  const controleur = new AbortController();
  controleurPrecedent = controleur;
  try {
    const resultats = await simulerRequete(`/recherche?q=${terme}`, { signal: controleur.signal });
    console.log("Affichage :", resultats);
  } catch (erreur) {
    if (erreur.name === "AbortError") console.log("Annulée :", terme);
    else throw erreur; // une vraie erreur : on la laisse remonter
  }
}

rechercher("ja");
rechercher("jav");
await rechercher("java");
// Annulée : ja
// Annulée : jav
// Affichage : résultats de /recherche?q=java
```

Remarquez le tri des erreurs : une annulation est un événement **normal**, pas une panne. On l'ignore (ou on la journalise discrètement), et on laisse remonter les autres erreurs.

### Combiner annulation et délai

`AbortSignal.any` combine plusieurs raisons d'arrêter, par exemple un bouton « Annuler » et un délai maximal. La raison du signal combiné indique laquelle a joué :

```js
import { setTimeout as attendre } from "node:timers/promises";

async function exporterRapport({ signal }) {
  await attendre(200, undefined, { signal }); // simule un long export
  return "rapport.pdf";
}

const boutonAnnuler = new AbortController();
const signal = AbortSignal.any([boutonAnnuler.signal, AbortSignal.timeout(50)]);

try {
  await exporterRapport({ signal });
} catch {
  if (signal.reason.name === "TimeoutError") console.log("L'export a pris trop de temps");
  else console.log("Export annulé par l'utilisateur");
}
// L'export a pris trop de temps
```

> [!NOTE]
> Selon l'API, l'erreur reçue est la raison elle-même (`fetch` rejette avec la `TimeoutError`) ou une `AbortError` qui porte la raison dans `cause` (`node:timers/promises`). Tester `signal.reason`, comme ci-dessus, fonctionne dans tous les cas. Autre particularité de Node.js : le minuteur interne d'`AbortSignal.timeout` ne maintient pas le processus en vie ; s'il ne reste rien d'autre à attendre, le programme se termine sans attendre son expiration.

## Imposer un délai maximal

### Avec `Promise.race`

Quand une opération n'accepte pas de signal, on peut faire la course entre elle et un minuteur qui rejette. L'erreur classique est d'oublier d'**arrêter le minuteur** quand l'opération gagne : il continue de tourner, garde un processus Node.js en vie et finit par rejeter une promesse que plus personne n'écoute.

```js
async function avecDelaiMax(promesse, ms) {
  let minuteur;
  const delaiDepasse = new Promise((_, reject) => {
    minuteur = setTimeout(() => reject(new Error(`Délai de ${ms} ms dépassé`)), ms);
  });
  try {
    return await Promise.race([promesse, delaiDepasse]);
  } finally {
    clearTimeout(minuteur); // ✅ dans tous les cas, on arrête le minuteur
  }
}

const attendre = (ms, valeur) => new Promise((resolve) => setTimeout(resolve, ms, valeur));

console.log(await avecDelaiMax(attendre(20, "réponse rapide"), 100)); // réponse rapide

try {
  await avecDelaiMax(attendre(300, "réponse lente"), 50);
} catch (erreur) {
  console.log(erreur.message); // Délai de 50 ms dépassé
}
```

Limite : `Promise.race` n'arrête pas l'opération perdante, qui continue en arrière-plan (ici, le minuteur de 300 ms court jusqu'au bout).

### Avec un signal

Quand l'opération accepte un `signal`, c'est bien meilleur : elle est **réellement interrompue**, et le code tient en une ligne.

<!-- no-run -->
```js
// Abandonne la requête (et libère la connexion) au bout de 5 secondes
const reponse = await fetch("https://api.exemple.fr/rapport", { signal: AbortSignal.timeout(5000) });
```

Préférez toujours cette forme quand elle est possible. Le [chapitre 22](../22-fetch-http/README.md) l'applique aux requêtes HTTP.

## Réessayer avec backoff exponentiel et jitter

### Quand réessayer

Une nouvelle tentative a du sens pour une erreur **passagère** : coupure réseau, délai dépassé, serveur surchargé (HTTP 429, 502, 503, 504). Elle n'en a aucun pour une erreur **permanente** : données invalides (400), accès refusé (401, 403), ressource absente (404). Et elle n'est sûre que pour une opération **idempotente** (la répéter ne change pas le résultat : lecture, `PUT`, `DELETE`) ; pour un paiement ou un `POST`, il faut une clé d'idempotence côté serveur.

### Le backoff exponentiel et le jitter

- **Backoff exponentiel** : on attend de plus en plus longtemps entre deux tentatives (100 ms, 200 ms, 400 ms…), pour laisser au service le temps de se rétablir. On plafonne ce délai.
- **Jitter** : on tire le délai **au hasard** entre 0 et ce plafond (« full jitter »). Sans cela, mille clients coupés au même instant réessaieraient tous au même instant, et feraient retomber le serveur.

| Tentative échouée | Plafond (base 100 ms, × 2, max 2 s) | Délai réel |
| --- | --- | --- |
| 1 | 100 ms | entre 0 et 100 ms |
| 2 | 200 ms | entre 0 et 200 ms |
| 3 | 400 ms | entre 0 et 400 ms |
| 6 | 2 000 ms (plafonné) | entre 0 et 2 000 ms |

Si le serveur envoie un en-tête `Retry-After`, respectez-le plutôt que votre propre calcul.

### L'implémentation

```js
import { setTimeout as attendre } from "node:timers/promises";

async function reessayer(
  operation,
  { tentatives = 4, delaiBase = 100, delaiMax = 2000, doitReessayer = () => true, signal } = {},
) {
  for (let tentative = 1; ; tentative++) {
    try {
      return await operation({ tentative, signal });
    } catch (erreur) {
      if (signal?.aborted || !doitReessayer(erreur)) throw erreur; // erreur permanente
      if (tentative >= tentatives) {
        throw new Error(`Échec après ${tentative} tentatives`, { cause: erreur });
      }
      const plafond = Math.min(delaiMax, delaiBase * 2 ** (tentative - 1));
      await attendre(Math.random() * plafond, undefined, { signal }); // full jitter
    }
  }
}

// Un service qui échoue deux fois avant de répondre
let appels = 0;
async function serviceInstable({ tentative }) {
  appels++;
  console.log(`Tentative ${tentative}…`);
  await attendre(5);
  if (appels < 3) throw Object.assign(new Error("Service indisponible"), { statut: 503 });
  return "données";
}

const estPassagere = (erreur) => [429, 502, 503, 504].includes(erreur.statut);

const donnees = await reessayer(serviceInstable, { delaiBase: 20, doitReessayer: estPassagere });
console.log(`Résultat : ${donnees}`);

// Une erreur permanente n'est pas réessayée
try {
  await reessayer(
    async () => {
      throw Object.assign(new Error("Introuvable"), { statut: 404 });
    },
    { doitReessayer: estPassagere },
  );
} catch (erreur) {
  console.log(`Abandon immédiat : ${erreur.message}`);
}
// Tentative 1…
// Tentative 2…
// Tentative 3…
// Résultat : données
// Abandon immédiat : Introuvable
```

Points de conception :

- l'opération est une **fonction** (et non une promesse) : on doit pouvoir la rappeler (voir le [chapitre 19](../19-promises/README.md#croire-quune-promesse-est-paresseuse)) ;
- l'erreur finale garde l'erreur d'origine dans `cause` ;
- le `signal` interrompt aussi bien l'opération que l'attente entre deux tentatives ;
- le nombre de tentatives est borné : réessayer à l'infini transforme une panne en surcharge.

## Limiter la concurrence

### Le problème

Vous devez traiter 1 000 éléments (images à redimensionner, URL à vérifier). `for…of` est trop lent (une à la fois) ; `Promise.all` lance **tout en même temps** : le service distant vous bloque (HTTP 429), les connexions ou la mémoire s'épuisent. Il faut un juste milieu : **au plus N opérations simultanées**.

### Un groupe de travailleurs

L'idée : lancer N « travailleurs » asynchrones qui puisent dans **le même itérateur**. Chaque `for…of` demande l'élément suivant à cet itérateur partagé : aucun élément n'est traité deux fois, et un travailleur libéré prend aussitôt le suivant.

```js
async function mapAvecLimite(elements, limite, fonction) {
  const resultats = new Array(elements.length);
  const entrees = elements.entries(); // itérateur partagé par tous les travailleurs

  async function travailleur() {
    for (const [index, element] of entrees) {
      resultats[index] = await fonction(element, index);
    }
  }

  const travailleurs = Array.from({ length: Math.min(limite, elements.length) }, travailleur);
  await Promise.all(travailleurs);
  return resultats;
}

// Démonstration : on mesure le nombre d'opérations simultanées
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let enCours = 0;
let maximumObserve = 0;

async function verifierUrl(url) {
  enCours++;
  maximumObserve = Math.max(maximumObserve, enCours);
  await attendre(50);
  enCours--;
  return `${url} : OK`;
}

const urls = Array.from({ length: 10 }, (_, i) => `/page/${i + 1}`);
const debut = performance.now();
const rapports = await mapAvecLimite(urls, 3, verifierUrl);

console.log(rapports.at(0), "…", rapports.at(-1)); // /page/1 : OK … /page/10 : OK
console.log("Simultanées au maximum :", maximumObserve); // Simultanées au maximum : 3
console.log(`≈ ${Math.round((performance.now() - debut) / 50) * 50} ms`); // ≈ 200 ms
```

Dix opérations de 50 ms, trois à la fois : quatre « vagues », soit environ 200 ms (contre 500 ms en séquence et 50 ms sans limite). Les résultats sont rangés par index : ils restent dans l'ordre des entrées.

En cas d'erreur, `Promise.all` rejette immédiatement, mais les autres travailleurs continuent de vider la liste. Pour tout arrêter, il faut un drapeau ou un `AbortSignal` partagé (voir l'[exercice 7](#exercice-7--sarrêter-au-premier-échec-)).

### Un limiteur réutilisable

Quand les opérations viennent de plusieurs endroits du programme (et pas d'un seul tableau), on préfère un **limiteur** : une fonction qui reçoit des tâches et n'en exécute que N à la fois. Il réutilise `Promise.withResolvers` et `Promise.try` du [chapitre 19](../19-promises/README.md).

```js
function creerLimiteur(maximum) {
  let actives = 0;
  const file = [];

  function lancerSuivante() {
    if (actives >= maximum || file.length === 0) return;
    const { tache, resolve, reject } = file.shift();
    actives++;
    Promise.try(tache)
      .then(resolve, reject)
      .finally(() => {
        actives--;
        lancerSuivante();
      });
  }

  return function limiter(tache) {
    const { promise, resolve, reject } = Promise.withResolvers();
    file.push({ tache, resolve, reject });
    lancerSuivante();
    return promise;
  };
}

const attendre = (ms, valeur) => new Promise((resolve) => setTimeout(resolve, ms, valeur));
const limiter = creerLimiteur(2);

const debut = performance.now();
const resultats = await Promise.all(
  ["A", "B", "C", "D"].map((lettre) => limiter(() => attendre(50, `tâche ${lettre}`))),
);
console.log(resultats); // [ 'tâche A', 'tâche B', 'tâche C', 'tâche D' ]
console.log(`≈ ${Math.round((performance.now() - debut) / 50) * 50} ms`); // ≈ 100 ms
```

La tâche est encore une **fonction** : le limiteur décide quand l'appeler. Dans un vrai projet, les paquets npm `p-limit` et `p-queue` proposent ce service avec plus d'options (priorités, pause, délai entre tâches).

## Paginer une API

Une API renvoie rarement des milliers de résultats d'un coup : elle les découpe en **pages**, et chaque réponse indique comment obtenir la suivante (un numéro de page, un curseur, un lien). Simulons-en une, avec un curseur :

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const ARTICLES = Array.from({ length: 7 }, (_, i) => ({ id: i + 1, titre: `Article ${i + 1}` }));

async function chargerPage(curseur = 0, taille = 3) {
  await attendre(10);
  const elements = ARTICLES.slice(curseur, curseur + taille);
  const suivant = curseur + taille < ARTICLES.length ? curseur + taille : null;
  return { elements, suivant };
}

// Tout charger, page par page
async function chargerTousLesArticles() {
  const tous = [];
  let curseur = 0;
  do {
    const page = await chargerPage(curseur);
    tous.push(...page.elements);
    curseur = page.suivant;
  } while (curseur !== null);
  return tous;
}

const articles = await chargerTousLesArticles();
console.log(articles.length, "articles"); // 7 articles
```

Les pages s'enchaînent forcément **en séquence** : on ne connaît le curseur suivant qu'après avoir reçu la page courante.

### Un générateur asynchrone pour consommer à la demande

Tout charger d'avance n'est pas toujours souhaitable : on veut parfois s'arrêter dès qu'on a trouvé ce qu'on cherche. Un **générateur asynchrone** charge les pages **à la demande**, au rythme de la consommation, et le code appelant ignore tout du découpage :

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const ARTICLES = Array.from({ length: 7 }, (_, i) => ({ id: i + 1, titre: `Article ${i + 1}` }));
let pagesChargees = 0;

async function chargerPage(curseur = 0, taille = 3) {
  pagesChargees++;
  await attendre(10);
  const elements = ARTICLES.slice(curseur, curseur + taille);
  const suivant = curseur + taille < ARTICLES.length ? curseur + taille : null;
  return { elements, suivant };
}

async function* tousLesArticles() {
  let curseur = 0;
  while (curseur !== null) {
    const page = await chargerPage(curseur);
    yield* page.elements; // délègue élément par élément
    curseur = page.suivant;
  }
}

for await (const article of tousLesArticles()) {
  console.log(article.titre);
  if (article.id === 4) break; // on a trouvé : le générateur s'arrête
}
console.log("Pages chargées :", pagesChargees); // Pages chargées : 2

const tous = await Array.fromAsync(tousLesArticles());
console.log(tous.length, "articles au total"); // 7 articles au total
// Article 1
// Article 2
// Article 3
// Article 4
// Pages chargées : 2
// 7 articles au total
```

Le `break` met fin au générateur (son éventuel bloc `finally` s'exécute) : la troisième page n'est jamais demandée. Les méthodes `map`, `filter` ou `take` directement sur un itérateur asynchrone font l'objet d'une proposition du TC39 (*Async Iterator Helpers*, stade 2 d'après son dépôt), qui n'est pas encore standard ; en attendant, on utilise `for await…of` ou `Array.fromAsync` suivi des méthodes de tableau. Les générateurs sont détaillés au [chapitre 13](../13-iterateurs-generateurs/README.md).

Dans un vrai client, ajoutez deux protections : un nombre maximal de pages (une API défaillante pourrait renvoyer indéfiniment le même curseur), et un `signal` pour pouvoir interrompre le parcours.

## Performance

**Ce qui coûte vraiment, c'est l'attente cumulée.** Le surcoût d'`async`/`await` lui-même est minime (quelques microtâches) ; une cascade de `await` indépendants, elle, additionne des dizaines ou des centaines de millisecondes. Cherchez d'abord les opérations qui pourraient se chevaucher.

**Ne rendez pas `async` ce qui ne l'est pas.** Chaque `await` coûte au moins un tour de microtâche, même sur une valeur ordinaire. Dans une boucle de calcul sur un million d'éléments, appeler une fonction `async` à chaque tour est un gaspillage inutile.

**Trop de parallélisme nuit aussi.** Des milliers de promesses simultanées consomment mémoire et connexions : [limitez la concurrence](#limiter-la-concurrence).

**Le calcul pur ne profite pas de l'asynchrone.** Un `await` ne rend pas un calcul plus rapide et ne le déplace pas sur un autre thread. Pour ne pas figer le programme, découpez le calcul en rendant la main entre deux morceaux, ou confiez-le à un [worker](../18-asynchrone/README.md#workers-et-vrai-parallélisme). Voici la version `async` du découpage présenté au chapitre 18 :

```js
import { setImmediate as rendreLaMain } from "node:timers/promises";

async function totalParMorceaux(elements, tailleMorceau = 1000) {
  let total = 0;
  for (let debut = 0; debut < elements.length; debut += tailleMorceau) {
    for (const element of elements.slice(debut, debut + tailleMorceau)) total += element.montant;
    await rendreLaMain(); // les autres tâches passent entre deux morceaux
  }
  return total;
}

const commandes = Array.from({ length: 30_000 }, (_, i) => ({ montant: i % 100 }));
setImmediate(() => console.log("Une requête est traitée pendant le calcul"));
console.log("Total :", await totalParMorceaux(commandes));
// Une requête est traitée pendant le calcul
// Total : 1485000
```

Dans le navigateur, on rend la main avec `await scheduler.yield()` là où il est disponible, ou `await new Promise((resolve) => setTimeout(resolve, 0))` sinon (voir le [chapitre 21](../21-timers/README.md)).

**Mesurez avant d'optimiser** : `performance.now()` ou `console.time()` autour d'un `await`, et l'onglet *Performance* des outils de développement pour visualiser les attentes.

## Pièges courants

### Le `await` oublié

Sans `await`, on manipule la **promesse**, pas sa valeur. Dans une condition, une promesse est toujours truthy :

```js
async function estDisponible(pseudo) {
  return pseudo !== "admin";
}

// ❌ La promesse est truthy : la condition est toujours vraie
if (estDisponible("admin")) console.log("❌ « admin » serait disponible ?");

// ✅
if (!(await estDisponible("admin"))) console.log("✅ « admin » est déjà pris");
// ❌ « admin » serait disponible ?
// ✅ « admin » est déjà pris
```

TypeScript et l'outil de lint `typescript-eslint` (règles `no-floating-promises`, `no-misused-promises`) détectent ces oublis ; c'est l'un des meilleurs arguments pour les adopter (voir le [chapitre 28](../28-outillage/README.md)).

### Mélanger `then` et `await`

Les deux styles peuvent cohabiter (`await chargerPreferences().catch(…)` est un idiome courant), mais un `then` à accolades glissé dans une fonction `async` réintroduit le piège du `return` oublié :

```js
const chargerUtilisateur = async (id) => ({ id, nom: "Ada" });

async function chargerNom(id) {
  // ❌ Le then à accolades ne renvoie rien : utilisateur vaut undefined
  const utilisateur = await chargerUtilisateur(id).then((u) => {
    console.log("Chargé :", u.id);
  });
  return utilisateur?.nom;
}

async function chargerNomCorrige(id) {
  // ✅ Un seul style : une étape par ligne
  const utilisateur = await chargerUtilisateur(id);
  console.log("Chargé :", utilisateur.id);
  return utilisateur.nom;
}

console.log(await chargerNom(1));
console.log(await chargerNomCorrige(1));
// Chargé : 1
// undefined
// Chargé : 1
// Ada
```

Dans une fonction `async`, écrivez chaque étape avec `await` ; réservez `then`/`catch` aux transformations d'une ligne.

### `async` dans un constructeur

Un constructeur ne peut pas être `async` (`SyntaxError: Class constructor may not be an async method`) : `new` doit renvoyer l'objet, pas une promesse. La solution est une **méthode statique asynchrone** qui prépare les données, puis appelle un constructeur synchrone :

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Catalogue {
  #produits;

  constructor(produits) {
    this.#produits = produits; // reçoit des données déjà prêtes
  }

  static async charger(source) {
    await attendre(10); // lecture d'un fichier, appel réseau…
    return new Catalogue([`${source} : lampe`, `${source} : bureau`]);
  }

  get taille() {
    return this.#produits.length;
  }
}

const catalogue = await Catalogue.charger("entrepôt");
console.log(catalogue.taille); // 2
```

### `new Promise(async …)`

Un exécuteur `async` est un anti-pattern : une exception levée après un `await` dans l'exécuteur ne rejette pas la promesse, qui reste **en attente pour toujours**, et l'erreur devient un rejet non géré.

```js
process.on("unhandledRejection", (erreur) => console.log("Rejet non géré :", erreur.name));

// ❌
const promesse = new Promise(async (resolve) => {
  await null;
  JSON.parse("{ invalide"); // lève une SyntaxError…
  resolve("ok");
});

setTimeout(() => console.log("La promesse est toujours :", promesse), 20);
// Rejet non géré : SyntaxError
// La promesse est toujours : Promise { <pending> }
```

Si vous avez besoin d'`await`, écrivez simplement une fonction `async` : elle renvoie déjà une promesse.

### Des callbacks `async` passés à des API qui ignorent les promesses

`forEach`, `addEventListener`, les écouteurs d'un `EventEmitter` ou `setTimeout` appellent votre callback sans regarder ce qu'il renvoie. Un callback `async` qui échoue y produit un rejet non géré. Gérez l'erreur **dans** le callback avec un `try/catch`. Pour les `EventEmitter` de Node.js, l'option `captureRejections` redirige ces rejets vers l'événement `"error"` :

```js
import { EventEmitter } from "node:events";

const boutique = new EventEmitter({ captureRejections: true });

boutique.on("commande", async (numero) => {
  throw new Error(`commande ${numero} invalide`);
});
boutique.on("error", (erreur) => console.log("Erreur capturée :", erreur.message));

boutique.emit("commande", 42); // Erreur capturée : commande 42 invalide
```

### Une condition de course entre deux `await`

JavaScript n'a qu'un thread, mais l'état partagé peut changer **pendant un `await`**. Le schéma « vérifier, attendre, agir » est donc dangereux :

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let solde = 100;

async function retirer(montant) {
  if (solde < montant) throw new Error("Solde insuffisant");
  await attendre(10); // appel au système bancaire : l'autre retrait s'exécute pendant ce temps
  solde -= montant;
}

const resultats = await Promise.allSettled([retirer(80), retirer(80)]);
console.log(resultats.map((r) => r.status)); // [ 'fulfilled', 'fulfilled' ]
console.log(solde); // -60
```

Les deux retraits ont vérifié le solde **avant** que l'un d'eux ne le débite. Les remèdes : refaire la vérification juste avant d'agir, sans `await` entre les deux, ou sérialiser les opérations avec un verrou (voir l'[exercice 8](#exercice-8--un-verrou-asynchrone-)). Le même problème touche les caches : deux appels simultanés qui constatent tous deux l'absence d'une valeur la chargent deux fois (voir l'[exercice 6](#exercice-6--dédupliquer-les-appels-simultanés-)).

### Récapitulatif

- Oublier `await` : on obtient une promesse (toujours truthy), et ses erreurs ne sont pas surveillées.
- `return promesse` dans un `try` : le rejet échappe au `catch`. Écrivez `return await`.
- Des `await` indépendants en cascade : utilisez `Promise.all`.
- Lancer plusieurs opérations puis les attendre une à une : rejet non géré si l'une échoue tôt.
- `forEach`, `filter`, `some`… avec un callback `async` : rien n'est attendu.
- `for await…of` ou `Array.fromAsync` sur un tableau de promesses déjà lancées : même risque.
- Supposer que l'état n'a pas changé entre deux `await`.
- Un `then` à accolades sans `return` au milieu d'une fonction `async`.
- Un constructeur `async`, un exécuteur `new Promise(async …)`.
- Un minuteur de délai maximal jamais arrêté.

## Bonnes pratiques

- Préférez `async`/`await` à `then` pour la logique applicative ; gardez `then`/`catch` pour de courtes transformations (`await chargerPreferences().catch(() => valeurParDefaut)`).
- Attendez (`await`) ou renvoyez toujours les promesses que vous créez ; si vous ne les attendez pas, gérez leur erreur.
- Parallélisez ce qui est indépendant avec `Promise.all`, en regroupant les étapes dépendantes dans des fonctions `async`.
- Bornez tout : la concurrence (limiteur), la durée (`AbortSignal.timeout`), le nombre de tentatives et de pages.
- Acceptez un `signal` dans vos fonctions asynchrones longues et transmettez-le aux API que vous appelez.
- Distinguez l'annulation (normale) des vraies erreurs, et les erreurs passagères (à réessayer) des permanentes.
- Écrivez `return await` dans un `try`, et utilisez un outil de lint qui détecte les promesses oubliées.

## Résumé

- Une fonction `async` renvoie toujours une promesse ; une exception, même immédiate, devient un rejet.
- `await` met en pause la fonction, pas le thread ; il vaut la valeur de la promesse ou lève sa raison. Le corps s'exécute de façon synchrone jusqu'au premier `await`.
- Les erreurs se gèrent avec `try/catch/finally` ; dans un `try`, écrivez `return await`.
- Des `await` successifs sont séquentiels ; `Promise.all` fait se chevaucher les attentes indépendantes et surveille toutes les promesses dès le départ.
- Dans les boucles : `for…of` pour la séquence, `map` + `Promise.all` pour le parallèle, jamais `forEach` ni `filter` avec un callback `async` ; `for await…of` et `Array.fromAsync` (ES2026) pour les itérables asynchrones.
- Le top-level await (ES2022) fonctionne dans les modules et retarde les modules importateurs.
- `AbortController`/`AbortSignal` annulent réellement une opération ; `AbortSignal.timeout` et `AbortSignal.any` gèrent délais et combinaisons.
- Patterns de production : délai maximal (en nettoyant le minuteur), nouvelles tentatives avec backoff exponentiel et jitter, limiteur de concurrence, pagination avec un générateur asynchrone.

## Exercices

### Exercice 1 — De `then` à `await` (★☆☆)

Réécrivez cette fonction avec `async`/`await`, sans changer son comportement.

```js
const attendre = (ms, valeur) => new Promise((resolve) => setTimeout(resolve, ms, valeur));
const chargerPanier = (id) => attendre(10, { id, articles: [12.5, 30, 7.5] });

function totalPanier(id) {
  console.log("Calcul…");
  return chargerPanier(id)
    .then((panier) => panier.articles.reduce((somme, prix) => somme + prix, 0))
    .then((total) => `Total : ${total} €`)
    .catch(() => "Total indisponible")
    .finally(() => console.log("Fin du calcul"));
}

totalPanier(1).then(console.log);
// Calcul…
// Fin du calcul
// Total : 50 €
```

<details>
<summary>Solution</summary>

```js
const attendre = (ms, valeur) => new Promise((resolve) => setTimeout(resolve, ms, valeur));
const chargerPanier = (id) => attendre(10, { id, articles: [12.5, 30, 7.5] });

async function totalPanier(id) {
  console.log("Calcul…");
  try {
    const panier = await chargerPanier(id);
    const total = panier.articles.reduce((somme, prix) => somme + prix, 0);
    return `Total : ${total} €`;
  } catch {
    return "Total indisponible";
  } finally {
    console.log("Fin du calcul");
  }
}

console.log(await totalPanier(1));
// Calcul…
// Fin du calcul
// Total : 50 €
```

Le `catch` d'une chaîne devient un bloc `catch`, et `finally` un bloc `finally`. Le calcul du total n'a plus besoin d'être une étape asynchrone séparée : c'est une simple ligne synchrone.

</details>

### Exercice 2 — Pronostic (★★☆)

Sans l'exécuter, donnez l'ordre des affichages.

```js
async function a() {
  console.log("a1");
  await b();
  console.log("a2");
}

async function b() {
  console.log("b1");
}

console.log("1");
setTimeout(() => console.log("2"), 0);
a();
new Promise((resolve) => {
  console.log("3");
  resolve();
}).then(() => console.log("4"));
console.log("5");
```

<details>
<summary>Solution</summary>

```text
1 a1 b1 3 5 a2 4 2
```

`a()` s'exécute de façon synchrone jusqu'à son `await` : `a1`, puis l'appel de `b()` affiche `b1` (synchrone lui aussi). `await` suspend `a` : la suite (`a2`) attend dans les microtâches. L'exécuteur de la promesse affiche `3`, puis `5`. Microtâches dans l'ordre : la reprise de `a` (`a2`), programmée en premier, puis le `then` (`4`). Enfin, la tâche du minuteur (`2`).

</details>

### Exercice 3 — Réparer les boucles (★★☆)

Cette fonction doit envoyer une relance aux clients dont la facture est impayée, puis afficher le nombre de relances. Elle affiche « 0 relance(s) » et envoie des relances à tout le monde. Corrigez-la, en envoyant les relances en parallèle.

<!-- no-run -->
```js
async function relancerImpayes(clients) {
  const impayes = clients.filter(async (client) => !(await factureReglee(client)));
  let envoyees = 0;
  impayes.forEach(async (client) => {
    await envoyerRelance(client);
    envoyees++;
  });
  console.log(`${envoyees} relance(s)`);
}
```

<details>
<summary>Solution</summary>

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const reglees = new Set(["Grace"]);

async function factureReglee(client) {
  await attendre(5);
  return reglees.has(client);
}

async function envoyerRelance(client) {
  await attendre(10);
  console.log("Relance envoyée à", client);
}

async function relancerImpayes(clients) {
  const statuts = await Promise.all(clients.map(factureReglee));
  const impayes = clients.filter((_, index) => !statuts[index]);
  await Promise.all(impayes.map(envoyerRelance));
  console.log(`${impayes.length} relance(s)`);
}

await relancerImpayes(["Ada", "Grace", "Alan"]);
// Relance envoyée à Ada
// Relance envoyée à Alan
// 2 relance(s)
```

Deux bugs : le prédicat `async` de `filter` renvoie une promesse (truthy), donc tous les clients sont gardés ; `forEach` n'attend pas ses callbacks, donc le compteur est lu avant toute incrémentation. On calcule les statuts avec `Promise.all`, on filtre de façon synchrone, puis on attend toutes les relances. Le compteur devient inutile : c'est `impayes.length`.

</details>

### Exercice 4 — Accélérer une page produit (★★☆)

Cette fonction met environ 250 ms. Sans changer les fonctions de chargement, réorganisez-la pour qu'elle en mette environ 100, en respectant les dépendances : les avis et le stock ont besoin du produit ; les promotions et le panier ne dépendent de rien.

<!-- no-run -->
```js
async function chargerPageProduit(id) {
  const produit = await chargerProduit(id); // 50 ms
  const avis = await chargerAvis(produit); // 50 ms
  const stock = await chargerStock(produit); // 50 ms
  const promotions = await chargerPromotions(); // 50 ms
  const panier = await chargerPanier(); // 50 ms
  return { produit, avis, stock, promotions, panier };
}
```

<details>
<summary>Solution</summary>

```js
const attendre = (ms, valeur) => new Promise((resolve) => setTimeout(resolve, ms, valeur));
const chargerProduit = (id) => attendre(50, { id, nom: "Lampe" });
const chargerAvis = (produit) => attendre(50, ["Très bien"]);
const chargerStock = (produit) => attendre(50, 12);
const chargerPromotions = () => attendre(50, ["-10 %"]);
const chargerPanier = () => attendre(50, { articles: 2 });

async function chargerPartieProduit(id) {
  const produit = await chargerProduit(id);
  const [avis, stock] = await Promise.all([chargerAvis(produit), chargerStock(produit)]);
  return { produit, avis, stock };
}

async function chargerPageProduit(id) {
  const [partieProduit, promotions, panier] = await Promise.all([
    chargerPartieProduit(id),
    chargerPromotions(),
    chargerPanier(),
  ]);
  return { ...partieProduit, promotions, panier };
}

const debut = performance.now();
const page = await chargerPageProduit(7);
console.log(page.produit.nom, page.stock, page.promotions); // Lampe 12 [ '-10 %' ]
console.log(`≈ ${Math.round((performance.now() - debut) / 50) * 50} ms`); // ≈ 100 ms
```

Le chemin le plus long est produit → (avis et stock en parallèle) : 100 ms. Les promotions et le panier se chargent pendant ce temps. Regrouper la partie dépendante dans `chargerPartieProduit` évite de lancer des promesses qu'on attendrait plus tard, avec le risque de rejet non géré que cela comporte.

</details>

### Exercice 5 — Une pause annulable (★★☆)

Écrivez `pause(ms, { signal })` qui renvoie une promesse tenue au bout de `ms` millisecondes, rejetée avec `signal.reason` si le signal est annulé (avant ou pendant la pause). Le minuteur doit être arrêté en cas d'annulation, et l'écouteur retiré en fin de pause. N'utilisez pas `node:timers/promises`.

<details>
<summary>Solution</summary>

```js
function pause(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const minuteur = setTimeout(() => {
      signal?.removeEventListener("abort", annuler);
      resolve();
    }, ms);
    function annuler() {
      clearTimeout(minuteur);
      reject(signal.reason);
    }
    signal?.addEventListener("abort", annuler, { once: true });
  });
}

await pause(20);
console.log("Pause simple terminée");

const controleur = new AbortController();
setTimeout(() => controleur.abort(new Error("l'utilisateur a fermé la fenêtre")), 10);
try {
  await pause(1000, { signal: controleur.signal });
} catch (erreur) {
  console.log("Annulée :", erreur.message);
}

try {
  await pause(1000, { signal: AbortSignal.abort() });
} catch (erreur) {
  console.log("Déjà annulé :", erreur.name);
}
// Pause simple terminée
// Annulée : l'utilisateur a fermé la fenêtre
// Déjà annulé : AbortError
```

Si on oubliait `clearTimeout`, l'annulation rejetterait bien la promesse, mais le minuteur de 1 000 ms maintiendrait le programme en vie jusqu'au bout. Si on oubliait `removeEventListener`, chaque pause terminée laisserait un écouteur accroché au signal, une fuite mémoire si le signal est partagé par de nombreuses opérations.

</details>

### Exercice 6 — Dédupliquer les appels simultanés (★★★)

Écrivez `memoiserAsync(fonction)` qui renvoie une version mise en cache d'une fonction asynchrone à un argument. Exigences : deux appels **simultanés** avec le même argument ne déclenchent qu'un seul appel réel ; un échec n'est pas mis en cache (l'appel suivant réessaie).

<details>
<summary>Solution</summary>

```js
function memoiserAsync(fonction) {
  const cache = new Map();
  return (argument) => {
    if (!cache.has(argument)) {
      const promesse = fonction(argument).catch((erreur) => {
        cache.delete(argument); // on n'enregistre pas les échecs
        throw erreur;
      });
      cache.set(argument, promesse); // on met en cache la PROMESSE, immédiatement
    }
    return cache.get(argument);
  };
}

const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let appelsReels = 0;

async function chargerTaux(devise) {
  appelsReels++;
  await attendre(20);
  if (devise === "XXX") throw new Error(`Devise ${devise} inconnue`);
  return { devise, taux: 1.08 };
}

const chargerTauxMemo = memoiserAsync(chargerTaux);

const [a, b] = await Promise.all([chargerTauxMemo("USD"), chargerTauxMemo("USD")]);
console.log(a === b, "appels réels :", appelsReels); // true appels réels : 1

await chargerTauxMemo("XXX").catch((erreur) => console.log(erreur.message)); // Devise XXX inconnue
await chargerTauxMemo("XXX").catch(() => {});
console.log("appels réels :", appelsReels); // appels réels : 3
```

L'astuce : mettre en cache la **promesse** au moment de l'appel, pas la valeur à son arrivée. Le second appel simultané trouve la promesse en cours et la partage. Mettre la valeur en cache après un `await` laisserait passer les appels simultanés (la condition de course décrite dans les [pièges](#une-condition-de-course-entre-deux-await)). Le `catch` interne retire l'entrée en cas d'échec, puis relance l'erreur pour que l'appelant la reçoive : les deux appels pour `XXX` atteignent donc la fonction réelle. En production, on ajouterait une durée de validité et une taille maximale.

</details>

### Exercice 7 — S'arrêter au premier échec (★★★)

Modifiez `mapAvecLimite` (section [Limiter la concurrence](#limiter-la-concurrence)) pour qu'après un échec, **aucun nouvel élément ne soit démarré** : les opérations déjà en cours peuvent finir, puis la fonction rejette avec la première erreur. Vérifiez-le en comptant les éléments démarrés.

<details>
<summary>Solution</summary>

```js
async function mapAvecLimite(elements, limite, fonction) {
  const resultats = new Array(elements.length);
  const entrees = elements.entries();
  let echec = null;

  async function travailleur() {
    for (const [index, element] of entrees) {
      if (echec) return; // un autre travailleur a échoué : on ne démarre plus rien
      try {
        resultats[index] = await fonction(element, index);
      } catch (erreur) {
        echec ??= erreur; // on garde la première erreur
        return;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limite, elements.length) }, travailleur));
  if (echec) throw echec;
  return resultats;
}

const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const demarres = [];

async function traiter(numero) {
  demarres.push(numero);
  await attendre(20);
  if (numero === 4) throw new Error(`Élément ${numero} corrompu`);
  return numero * 10;
}

try {
  await mapAvecLimite([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, traiter);
} catch (erreur) {
  console.log(erreur.message); // Élément 4 corrompu
}
console.log("Démarrés :", demarres.join(", ")); // Démarrés : 1, 2, 3, 4, 5, 6
```

Les éléments 1 à 3 forment la première vague, 4 à 6 la deuxième. Quand l'élément 4 échoue, les éléments 5 et 6 sont déjà en cours : on les laisse finir, mais les travailleurs testent `echec` avant de démarrer l'élément suivant, donc 7 à 10 ne démarrent jamais. Les travailleurs ne rejettent pas eux-mêmes : `Promise.all` attend donc la fin des opérations en cours avant que la fonction ne rejette, ce qui évite de laisser du travail orphelin. Pour interrompre aussi les opérations en cours, on passerait un `AbortSignal` à `fonction` et on l'annulerait au premier échec.

</details>

### Exercice 8 — Un verrou asynchrone (★★★)

Écrivez une classe `Verrou` dont la méthode `executer(tache)` exécute les tâches asynchrones **une seule à la fois**, dans l'ordre d'arrivée, et renvoie le résultat de chacune. Une tâche qui échoue ne doit pas bloquer les suivantes. Utilisez-la pour corriger le retrait bancaire de la section [Une condition de course entre deux `await`](#une-condition-de-course-entre-deux-await).

<details>
<summary>Solution</summary>

```js
class Verrou {
  #derniere = Promise.resolve();

  executer(tache) {
    const resultat = this.#derniere.then(() => tache());
    this.#derniere = resultat.catch(() => {}); // un échec ne bloque pas la file
    return resultat;
  }
}

const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const verrou = new Verrou();
let solde = 100;

function retirer(montant) {
  return verrou.executer(async () => {
    if (solde < montant) throw new Error(`Solde insuffisant pour retirer ${montant} €`);
    await attendre(10);
    solde -= montant;
    return solde;
  });
}

const resultats = await Promise.allSettled([retirer(80), retirer(80), retirer(20)]);
for (const r of resultats) console.log(r.status === "fulfilled" ? `Nouveau solde : ${r.value} €` : r.reason.message);
console.log("Solde final :", solde);
// Nouveau solde : 20 €
// Solde insuffisant pour retirer 80 €
// Nouveau solde : 0 €
// Solde final : 0
```

Le verrou garde la promesse de la dernière tâche programmée ; chaque nouvelle tâche s'enchaîne derrière elle. Le second retrait ne vérifie donc le solde qu'une fois le premier entièrement terminé. `this.#derniere` est une version « qui ne rejette jamais » du résultat : sans ce `catch`, un seul échec ferait échouer toutes les tâches suivantes. L'appelant, lui, reçoit bien `resultat`, avec son éventuel rejet.

</details>

## Pour aller plus loin

- [MDN — `async function`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/async_function) et [`await`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/await)
- [MDN — `for await…of`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/for-await...of)
- [MDN — `Array.fromAsync()`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync)
- [MDN — `AbortController`](https://developer.mozilla.org/fr/docs/Web/API/AbortController) et [`AbortSignal`](https://developer.mozilla.org/fr/docs/Web/API/AbortSignal)
- [Node.js — `timers/promises`](https://nodejs.org/docs/latest/api/timers.html) (minuteurs annulables)
- [AWS Architecture Blog — Exponential Backoff And Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) (en anglais)
- [javascript.info — Async/await](https://fr.javascript.info/async-await)

---

[← Chapitre précédent](../19-promises/README.md) · [Sommaire](../README.md#sommaire) · [Chapitre suivant →](../21-timers/README.md)
