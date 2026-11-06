# 21 — Timers et planification

> **Niveau** : Intermédiaire · **Durée** : ~3 h · **Prérequis** : [La boucle d'événements](../18-asynchrone/README.md), [Promesses](../19-promises/README.md), [async/await](../20-async-await/README.md)

Retarder une action, la répéter, l'annuler, la synchroniser avec l'affichage ou la limiter quand un événement se déclenche cent fois par seconde : tout cela repose sur quelques API de planification. Elles semblent simples, mais leurs garanties sont faibles (un délai est un _minimum_, pas une promesse) et un timer oublié est l'une des fuites les plus courantes. Ce chapitre vous apprend à choisir le bon outil, à écrire un debounce et un throttle corrects, et à toujours nettoyer derrière vous.

## Objectifs

- Planifier, répéter et annuler du code avec `setTimeout`, `setInterval` et leurs équivalents en promesses.
- Expliquer pourquoi un timer se déclenche en retard et ce que garantit (ou non) un délai.
- Choisir entre `setTimeout` récursif, `setInterval`, `requestAnimationFrame`, `requestIdleCallback` et `scheduler.postTask`.
- Mesurer une durée correctement avec `performance.now()`.
- Implémenter et tester un debounce et un throttle complets (`this`, arguments, options, annulation).
- Éviter les fuites en arrêtant chaque timer, notamment avec `AbortSignal`.
- Utiliser les spécificités de Node.js : `node:timers/promises`, `unref`, `refresh`, `setImmediate`.

## Sommaire

- [Vue d'ensemble](#vue-densemble)
- [`setTimeout` : exécuter plus tard](#settimeout--exécuter-plus-tard)
- [`setInterval` : répéter](#setinterval--répéter)
- [`setTimeout` récursif ou `setInterval` ?](#settimeout-récursif-ou-setinterval-)
- [Ce que garantit un délai (et ce qu'il ne garantit pas)](#ce-que-garantit-un-délai-et-ce-quil-ne-garantit-pas)
- [Timers et promesses](#timers-et-promesses)
- [Mesurer le temps avec `performance.now()`](#mesurer-le-temps-avec-performancenow)
- [`requestAnimationFrame` : animer au rythme de l'écran](#requestanimationframe--animer-au-rythme-de-lécran)
- [`requestIdleCallback` : profiter des temps morts](#requestidlecallback--profiter-des-temps-morts)
- [`scheduler.postTask` et `scheduler.yield` : prioriser et céder la main](#schedulerposttask-et-scheduleryield--prioriser-et-céder-la-main)
- [Debounce et throttle](#debounce-et-throttle)
- [Nettoyer ses timers](#nettoyer-ses-timers)
- [Spécificités de Node.js](#spécificités-de-nodejs)
- [Recettes](#recettes)
- [Pièges courants](#pièges-courants)
- [Bonnes pratiques](#bonnes-pratiques)
- [Résumé](#résumé)
- [Exercices](#exercices)
- [Pour aller plus loin](#pour-aller-plus-loin)

## Vue d'ensemble

| Besoin                                         | Outil                                         | Disponible                                  |
| ---------------------------------------------- | --------------------------------------------- | ------------------------------------------- |
| Exécuter une fois, plus tard                   | `setTimeout` / `clearTimeout`                 | Partout                                     |
| Répéter à intervalle régulier                  | `setInterval` / `clearInterval`, ou `setTimeout` récursif | Partout                         |
| Attendre dans une fonction `async`             | `new Promise` + `setTimeout`, `node:timers/promises` | Partout / Node.js                    |
| Abandonner une opération trop longue           | `AbortSignal.timeout(ms)`                     | Partout (Baseline largement disponible)     |
| Animer, mettre à jour l'affichage              | `requestAnimationFrame`                       | Navigateurs                                 |
| Travail non urgent quand le navigateur est libre | `requestIdleCallback`                       | Chromium, Firefox (pas Safari)              |
| Prioriser des tâches, découper un long calcul  | `scheduler.postTask`, `scheduler.yield`       | Chromium, Firefox (pas Safari)              |
| Mesurer une durée                              | `performance.now()`                           | Partout                                     |
| Limiter la fréquence d'une fonction            | debounce, throttle (à écrire ou importer)     | —                                           |

Tous ces mécanismes passent par la boucle d'événements : le rappel (_callback_) est placé dans une file et ne s'exécute que lorsque la pile d'appels est vide. Si ce mécanisme ne vous est pas familier, relisez le [chapitre 18](../18-asynchrone/README.md) avant de continuer.

## `setTimeout` : exécuter plus tard

<!-- no-run -->
```js
const identifiant = setTimeout(rappel, delaiEnMs, argument1, argument2 /* … */);
clearTimeout(identifiant);
```

- `rappel` : la fonction à exécuter. Passez **la fonction**, pas le résultat de son appel (`setTimeout(f, 100)`, pas `setTimeout(f(), 100)`).
- `delaiEnMs` : le délai **minimal** en millisecondes (0 par défaut).
- Les arguments supplémentaires sont transmis au rappel.
- La valeur renvoyée identifie le timer : un entier positif dans les navigateurs, un objet `Timeout` dans Node.js. Elle sert à l'annuler avec `clearTimeout`.

```js
function saluer(prenom, ponctuation) {
  console.log(`Bonjour ${prenom}${ponctuation}`);
}

setTimeout(saluer, 50, "Ada", " !"); // Bonjour Ada ! (après 50 ms)
setTimeout(() => saluer("Grace", "."), 100); // Bonjour Grace. (après 100 ms)

const rappelAnnule = setTimeout(() => console.log("jamais affiché"), 80);
clearTimeout(rappelAnnule);
clearTimeout(rappelAnnule); // sans effet, aucune erreur
clearTimeout(undefined); // sans effet non plus
```

Les deux formes (arguments supplémentaires ou fonction fléchée) sont équivalentes ; la fonction fléchée est souvent plus lisible.

### Un délai de 0 ne veut pas dire « tout de suite »

Le rappel attend toujours la fin du code en cours **et** des microtâches (promesses) :

```js
console.log("1. script : début");
setTimeout(() => console.log("4. setTimeout de 0 ms"), 0);
Promise.resolve().then(() => console.log("3. microtâche (promesse)"));
console.log("2. script : fin");
// 1. script : début
// 2. script : fin
// 3. microtâche (promesse)
// 4. setTimeout de 0 ms
```

`setTimeout(f, 0)` sert donc à **reporter** du travail après le code courant : laisser le navigateur afficher quelque chose, sortir d'une pile d'appels profonde, ou laisser d'autres rappels passer. Pour céder la main au navigateur pendant un long calcul, il existe désormais mieux : [`scheduler.yield()`](#schedulerposttask-et-scheduleryield--prioriser-et-céder-la-main).

### Le problème de `this`

Une méthode passée en rappel perd son objet : elle est appelée comme une fonction simple. Dans un navigateur, `this` vaut alors `window` (`globalThis`) ; dans Node.js, il vaut l'objet `Timeout`. Dans les deux cas, ce n'est pas ce que vous vouliez.

```js
const minuteur = {
  nom: "Minuteur de cuisine",
  afficher() {
    console.log(this.nom);
  },
};

setTimeout(minuteur.afficher, 10); // ❌ undefined : this n'est plus « minuteur »
setTimeout(() => minuteur.afficher(), 20); // ✅ Minuteur de cuisine
setTimeout(minuteur.afficher.bind(minuteur), 30); // ✅ Minuteur de cuisine
```

Le [chapitre 6](../06-fonctions/README.md) détaille les règles de `this`.

> [!WARNING]
> `setTimeout` accepte aussi une **chaîne de caractères** à la place d'une fonction (`setTimeout("alert(1)", 100)`) : elle est alors évaluée comme du code, exactement comme `eval`. C'est une porte ouverte aux injections (XSS) et c'est bloqué par une politique de sécurité de contenu (CSP) stricte. N'utilisez jamais cette forme ; Node.js la refuse d'ailleurs avec une `TypeError`.

## `setInterval` : répéter

`setInterval` exécute le rappel toutes les `delai` millisecondes, jusqu'à ce que vous l'arrêtiez avec `clearInterval`. **Un intervalle ne s'arrête jamais tout seul** : prévoyez toujours sa condition d'arrêt.

```js
let tic = 0;

const identifiant = setInterval(() => {
  tic++;
  console.log(`tic ${tic}`);
  if (tic === 3) {
    clearInterval(identifiant);
    console.log("intervalle arrêté");
  }
}, 100);
// tic 1
// tic 2
// tic 3
// intervalle arrêté
```

### Les arguments sont évalués une seule fois

Les arguments supplémentaires sont calculés **au moment de l'appel à `setInterval`**, pas à chaque répétition. Pour transmettre une valeur qui évolue, lisez-la dans le rappel :

```js
let compteur = 0;
let repetitions = 0;

// ❌ ++compteur est évalué une seule fois : le rappel reçoit toujours 1
const intervalle = setInterval(
  (valeur) => {
    console.log("valeur reçue :", valeur);
    if (++repetitions === 3) clearInterval(intervalle);
  },
  50,
  ++compteur,
);
// valeur reçue : 1
// valeur reçue : 1
// valeur reçue : 1
```

```js
let compteur = 0;

// ✅ la valeur est lue (et modifiée) à chaque exécution
const intervalle = setInterval(() => {
  compteur++;
  console.log("valeur courante :", compteur);
  if (compteur === 3) clearInterval(intervalle);
}, 50);
// valeur courante : 1
// valeur courante : 2
// valeur courante : 3
```

## `setTimeout` récursif ou `setInterval` ?

`setInterval` ne tient pas compte de la durée du rappel. Si celui-ci est **asynchrone** (une requête réseau, par exemple) et dure plus longtemps que l'intervalle, les exécutions se **chevauchent** :

```text
setInterval(tache, 100) avec une tâche asynchrone de 150 ms

temps (ms)  0    100   200   300   400
tâche 1          ├─────────┤
tâche 2                ├─────────┤          ← plusieurs tâches en même temps :
tâche 3                      ├─────────┤      réponses dans le désordre, serveur surchargé

setTimeout récursif : la pause de 100 ms commence à la FIN de chaque tâche

tâche 1          ├─────────┤
tâche 2                          ├─────────┤
tâche 3                                          ├── …
```

Démonstration : on compte combien de tâches tournent en même temps.

```js
const attendre = (ms) => new Promise((resoudre) => setTimeout(resoudre, ms));

let enCours = 0;
let maximum = 0;

async function tacheLente() {
  enCours++;
  maximum = Math.max(maximum, enCours);
  await attendre(200); // simule une requête de 200 ms
  enCours--;
}

// ❌ setInterval : une nouvelle tâche démarre toutes les 50 ms, terminée ou non
const identifiant = setInterval(tacheLente, 50);
await attendre(400);
clearInterval(identifiant);
console.log("chevauchement avec setInterval :", maximum > 1); // chevauchement avec setInterval : true
```

```js
const attendre = (ms) => new Promise((resoudre) => setTimeout(resoudre, ms));

/**
 * Exécute `tache` (synchrone ou asynchrone) en laissant `pause` ms entre
 * la fin d'une exécution et le début de la suivante.
 * Renvoie une fonction d'arrêt.
 */
function repeter(tache, pause) {
  let actif = true;
  let identifiant;

  async function boucle() {
    await tache();
    if (actif) identifiant = setTimeout(boucle, pause);
  }

  identifiant = setTimeout(boucle, pause);
  return () => {
    actif = false;
    clearTimeout(identifiant);
  };
}

let enCours = 0;
let maximum = 0;
let executions = 0;

const arreter = repeter(async () => {
  enCours++;
  maximum = Math.max(maximum, enCours);
  await attendre(200);
  enCours--;
  executions++;
}, 50);

await attendre(600);
arreter();
console.log("chevauchement avec setTimeout récursif :", maximum > 1); // chevauchement avec setTimeout récursif : false
console.log("au moins une exécution :", executions >= 1); // au moins une exécution : true
```

Le drapeau `actif` est indispensable : si `arreter()` est appelée pendant que la tâche tourne, `clearTimeout` n'a rien à annuler, et c'est le drapeau qui empêche de replanifier.

| Critère                                 | `setInterval`                  | `setTimeout` récursif             |
| --------------------------------------- | ------------------------------ | --------------------------------- |
| Rappel asynchrone plus long que le délai | Chevauchements                 | Jamais de chevauchement           |
| Délai variable (backoff, adaptatif)     | Impossible sans tout recréer   | Naturel : on calcule chaque délai |
| Cadence régulière d'un rappel très court | Adapté                         | Adapté (la durée du rappel s'ajoute) |
| Arrêt                                   | `clearInterval`                | `clearTimeout` + drapeau          |

En pratique : `setInterval` pour un rappel **court et synchrone** (une horloge, une barre de progression), `setTimeout` récursif dès qu'il y a de l'asynchrone ou un délai qui varie (sondage d'un serveur, nouvelles tentatives).

## Ce que garantit un délai (et ce qu'il ne garantit pas)

Le délai est un **minimum**. Le rappel peut s'exécuter (bien) plus tard, pour plusieurs raisons.

### 1. Le fil d'exécution est occupé

Un timer échu attend que la pile d'appels soit vide. Un calcul synchrone de 200 ms retarde donc tous les timers d'au moins 200 ms :

```js
const debut = performance.now();

setTimeout(() => {
  const ecoule = performance.now() - debut;
  console.log(`délai demandé : 10 ms, écoulé : ${ecoule >= 200 ? "au moins 200" : "moins de 200"} ms`);
}, 10);

// Boucle bloquante de 200 ms (à ne jamais faire dans une vraie application)
while (performance.now() - debut < 200) {}
// délai demandé : 10 ms, écoulé : au moins 200 ms
```

C'est aussi pour cela qu'un long calcul « gèle » une page : ni les clics, ni l'affichage, ni les timers ne peuvent passer.

### 2. Les navigateurs imposent des délais minimaux

- **Imbrication** : quand des `setTimeout` s'appellent les uns les autres, les navigateurs imposent un minimum de **4 ms** à partir du 5ᵉ niveau d'imbrication (règle de la spécification HTML). Node.js n'applique pas cette règle, mais il arrondit tout délai inférieur à 1 ms à **1 ms**.
- **Onglets en arrière-plan** : pour économiser la batterie, les timers d'un onglet masqué sont bridés. Firefox (bureau) impose au moins 1 seconde ; Chrome regroupe les timers pour ne les vérifier qu'**une fois par seconde**, puis, après 5 minutes de masquage (page silencieuse, timers chaînés), **une fois par minute** (« intensive throttling », depuis Chrome 88). Firefox pour Android peut aller jusqu'à 15 minutes, voire décharger l'onglet.
- **Pendant le chargement** : Firefox diffère certains timers tant que la page charge.

Voici ce que l'on observe dans un navigateur avec des `setTimeout(…, 0)` imbriqués :

<!-- no-run -->
```js
// À exécuter dans la console d'un navigateur
let precedent = performance.now();
let niveau = 0;

function suivant() {
  const maintenant = performance.now();
  console.log(`niveau ${++niveau} : ${(maintenant - precedent).toFixed(1)} ms`);
  precedent = maintenant;
  if (niveau < 8) setTimeout(suivant, 0);
}
setTimeout(suivant, 0);
// niveau 1 à 4 : environ 0 ms, puis environ 4 ms à partir du niveau 5
```

> [!IMPORTANT]
> Conséquence directe : **ne comptez jamais le temps en comptant les tics**. Un compte à rebours qui fait `secondes--` à chaque `setInterval(…, 1000)` dérive, et prend des minutes de retard dans un onglet masqué. Calculez toujours le temps restant à partir d'un horodatage (`performance.now()` ou `Date.now()`), comme dans les [recettes](#recettes).

### 3. Le délai maximal est d'environ 24,8 jours

Le délai est stocké sur un entier signé de 32 bits : la valeur maximale est `2 ** 31 - 1` = 2 147 483 647 ms (24,8 jours). Au-delà, les navigateurs subissent un dépassement d'entier (le rappel peut partir immédiatement) et Node.js remplace le délai par 1 ms en émettant un avertissement :

```js
// Node.js affiche : TimeoutOverflowWarning: 2147483648 does not fit into a 32-bit signed integer.
setTimeout(() => console.log("déclenché tout de suite !"), 2 ** 31);
// déclenché tout de suite !
```

Pour planifier à plusieurs semaines, enchaînez plusieurs timers (voir l'[exercice 7](#exercice-7--planifier-au-delà-de-248-jours-)) ou, mieux, stockez la date cible et vérifiez-la régulièrement : un processus ou un onglet ouvert pendant un mois n'est de toute façon pas fiable.

### 4. La dérive s'accumule

Chaque exécution d'un `setInterval` (ou d'un `setTimeout` récursif) peut partir avec quelques millisecondes de retard, et ces retards s'additionnent. Pour une cadence fiable, recalculez chaque délai à partir de l'instant de départ :

```js
/**
 * Comme setInterval, mais chaque exécution est planifiée par rapport à
 * l'instant de départ : les retards ne s'accumulent pas.
 */
function intervalleStable(rappel, periode) {
  const depart = performance.now();
  let numero = 0;
  let actif = true;
  let identifiant;

  function planifier() {
    const cible = depart + (numero + 1) * periode;
    identifiant = setTimeout(etape, Math.max(0, cible - performance.now()));
  }

  function etape() {
    numero++;
    rappel(numero);
    if (actif) planifier();
  }

  planifier();
  return () => {
    actif = false;
    clearTimeout(identifiant);
  };
}

const arreter = intervalleStable((numero) => {
  console.log(`tic ${numero}`);
  if (numero === 4) arreter();
}, 100);
// tic 1
// tic 2
// tic 3
// tic 4
```

## Timers et promesses

### Attendre dans une fonction `async`

Envelopper `setTimeout` dans une promesse donne une fonction « pause », très utile dans les scripts, les tests et les nouvelles tentatives :

```js
const attendre = (ms) => new Promise((resoudre) => setTimeout(resoudre, ms));

console.log("avant");
await attendre(100);
console.log("après au moins 100 ms");
// avant
// après au moins 100 ms
```

`await attendre(…)` ne bloque **rien** : seule la fonction `async` en cours est suspendue, le reste du programme continue. Attention, dans une boucle, les attentes s'additionnent (`for` + `await` = séquentiel) : voir le [chapitre 20](../20-async-await/README.md).

### `node:timers/promises`

Node.js fournit directement des versions en promesses, annulables avec un `AbortSignal` :

```js
import { setTimeout as attendre, setInterval as chaque } from "node:timers/promises";

// setTimeout(délai, valeur) : la promesse est résolue avec « valeur »
const message = await attendre(50, "prêt");
console.log(message); // prêt

// setInterval renvoie un itérateur asynchrone : un tour par intervalle
let tour = 0;
for await (const _ of chaque(100)) {
  tour++;
  console.log(`tour ${tour}`);
  if (tour === 3) break; // break arrête et libère l'intervalle
}
// tour 1
// tour 2
// tour 3
```

Le module expose aussi `setImmediate()` et un objet `scheduler` (`scheduler.wait(ms)`, `scheduler.yield()`), ce dernier encore **expérimental** dans Node.js 26.

### `AbortSignal.timeout` : un délai maximal pour n'importe quelle opération

`AbortSignal.timeout(ms)` crée un signal qui s'annule tout seul après `ms` millisecondes, avec une raison de type `TimeoutError`. Toute API qui accepte un `signal` (`fetch`, `node:timers/promises`, `addEventListener`, `readFile` et `writeFile` de `node:fs/promises`…) gagne ainsi un délai maximal, sans que vous gériez le moindre timer. `AbortSignal.any([...])` combine plusieurs signaux : le premier qui s'annule l'emporte.

```js
import { setTimeout as attendre } from "node:timers/promises";

const annulationUtilisateur = new AbortController(); // ex. : bouton « Annuler »
const signal = AbortSignal.any([annulationUtilisateur.signal, AbortSignal.timeout(100)]);

try {
  await attendre(500, "résultat", { signal }); // une opération trop lente
} catch (erreur) {
  console.log(erreur.name); // AbortError
  console.log(signal.reason.name); // TimeoutError
}
```

- `AbortSignal.timeout` et `AbortSignal.any` sont Baseline (largement disponibles depuis l'automne 2026) et présents dans Node.js depuis les versions 17.3 et 20.3.
- Dans Node.js, le timer interne n'empêche pas le processus de se terminer.
- Le temps compté est le temps **actif** : il est suspendu quand la page est mise en cache (_back-forward cache_) ou qu'un worker est gelé.
- `fetch` rejette avec la raison elle-même (`TimeoutError`), alors que `node:timers/promises` rejette avec une `AbortError` dont `cause` est la raison : testez `signal.reason` si vous devez distinguer « trop long » de « annulé ».

Le [chapitre 20](../20-async-await/README.md) approfondit l'annulation (`AbortController`, `throwIfAborted`) et montre comment imposer un délai à une promesse quelconque ; le [chapitre 22](../22-fetch-http/README.md) l'applique aux requêtes HTTP.

## Mesurer le temps avec `performance.now()`

`Date.now()` donne l'heure murale en millisecondes : elle peut **reculer ou sauter** si l'horloge système est corrigée (synchronisation NTP, changement manuel, passage à l'heure d'été mal géré). Pour mesurer une durée, utilisez `performance.now()` :

- horloge **monotone** : elle ne recule jamais ;
- valeur en millisecondes **avec décimales**, relative au début de la page (ou du processus dans Node.js) ;
- précision volontairement réduite dans les navigateurs (100 µs, ou 5 µs dans un contexte isolé _cross-origin_) pour limiter les attaques temporelles.

```js
const debut = performance.now();

let somme = 0;
for (let i = 0; i < 1_000_000; i++) somme += i;

const duree = performance.now() - debut;
console.log(somme); // 499999500000
console.log(`durée : ${duree.toFixed(2)} ms`); // durée : 1.84 ms (varie d'une exécution à l'autre)

// Raccourci pour un diagnostic rapide :
console.time("tri");
Array.from({ length: 100_000 }, () => Math.random()).sort((a, b) => a - b);
console.timeEnd("tri"); // tri: 45.123ms (variable)
```

| Besoin                                     | Utilisez                          |
| ------------------------------------------ | --------------------------------- |
| Mesurer une durée, animer, cadencer        | `performance.now()`               |
| Horodater un événement, afficher une date  | `Date.now()`, `new Date()` ([chapitre 15](../15-dates/README.md)) |
| Mesurer une très longue durée (heures, mise en veille) | `Date.now()` : la plupart des navigateurs arrêtent `performance.now()` pendant la veille de l'ordinateur (sauf sous Windows) |

> [!TIP]
> Un micro-benchmark isolé est trompeur (compilateur JIT, cache, ramasse-miettes). Répétez la mesure, ignorez les premières exécutions et comparez des médianes ; pour une analyse sérieuse, utilisez l'onglet Performance des DevTools ou `node --cpu-prof`.

## `requestAnimationFrame` : animer au rythme de l'écran

Animer avec `setInterval(…, 16)` donne des saccades : le timer n'est pas synchronisé avec le rafraîchissement de l'écran (60, 120 ou 144 Hz), il continue à tourner dans un onglet masqué et il peut tomber au milieu d'une image. `requestAnimationFrame(rappel)` demande au navigateur d'appeler `rappel` **juste avant le prochain affichage** :

- une fois par image, au rythme réel de l'écran ;
- mis en pause, dans la plupart des navigateurs, dans les onglets en arrière-plan et les `<iframe>` masquées (économie de batterie) ;
- le rappel reçoit un horodatage de même nature que `performance.now()`.

`requestAnimationFrame` ne programme **qu'une** image : pour animer, le rappel se redemande lui-même. `cancelAnimationFrame(identifiant)` annule la demande en attente.

```html
<div id="balle" style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: tomato"></div>
<button id="stop">Arrêter</button>
```

<!-- no-run -->
```js
const balle = document.querySelector("#balle");
const VITESSE = 200; // pixels par seconde, quelle que soit la fréquence de l'écran

let position = 0;
let precedent = null;
let identifiant = requestAnimationFrame(animer);

function animer(horodatage) {
  if (precedent !== null) {
    const delta = (horodatage - precedent) / 1000; // secondes écoulées depuis l'image précédente
    position = (position + VITESSE * delta) % window.innerWidth;
    balle.style.transform = `translateX(${position}px)`;
  }
  precedent = horodatage;
  identifiant = requestAnimationFrame(animer); // l'image suivante
}

document.querySelector("#stop").addEventListener("click", () => cancelAnimationFrame(identifiant));
```

Deux règles à retenir :

1. **Basez le mouvement sur le temps écoulé** (`delta`), jamais sur le nombre d'images : sur un écran à 120 Hz, une animation « +2 px par image » irait deux fois plus vite.
2. **Animez `transform` et `opacity`** plutôt que `left`/`top` : le navigateur peut les composer sans recalculer la mise en page. Et pour une animation déclarative simple, préférez les transitions CSS ou l'API Web Animations (`element.animate()`), que le navigateur optimise pour vous.

Une animation de durée fixe avec une courbe d'accélération (_easing_) :

<!-- no-run -->
```js
function animerVers(element, { x, y }, duree = 600) {
  const depart = performance.now();
  const adoucir = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2); // easeInOutCubic

  return new Promise((resoudre) => {
    function image(maintenant) {
      const progression = Math.min((maintenant - depart) / duree, 1); // de 0 à 1
      const p = adoucir(progression);
      element.style.transform = `translate(${x * p}px, ${y * p}px)`;
      if (progression < 1) requestAnimationFrame(image);
      else resoudre();
    }
    requestAnimationFrame(image);
  });
}

await animerVers(document.querySelector("#balle"), { x: 300, y: 150 });
console.log("animation terminée");
```

`requestAnimationFrame` sert aussi à **regrouper des mises à jour visuelles** : si un événement se déclenche plusieurs fois entre deux images, il est inutile de redessiner à chaque fois (voir le [throttle par image](#un-throttle-calé-sur-laffichage)).

## `requestIdleCallback` : profiter des temps morts

Certaines tâches ne sont pas urgentes : envoyer des statistiques, précharger des données, indexer un contenu pour une recherche. `requestIdleCallback(rappel, { timeout })` les exécute quand le navigateur n'a **rien de mieux à faire**. Le rappel reçoit un objet `IdleDeadline` :

- `deadline.timeRemaining()` : millisecondes restantes dans la période d'inactivité courante (50 ms au maximum) ;
- `deadline.didTimeout` : `true` si le rappel a été forcé parce que le `timeout` est écoulé.

<!-- no-run -->
```js
const aTraiter = [...documents]; // une longue liste de tâches non urgentes

function traiterPendantLesTempsMorts(deadline) {
  // Travailler tant qu'il reste du temps (ou si le délai maximal est dépassé)
  while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && aTraiter.length > 0) {
    indexer(aTraiter.shift());
  }
  if (aTraiter.length > 0) {
    requestIdleCallback(traiterPendantLesTempsMorts, { timeout: 2000 });
  }
}

requestIdleCallback(traiterPendantLesTempsMorts, { timeout: 2000 });
```

> [!NOTE]
> Disponibilité (novembre 2026) : Chrome 47+, Edge 79+, Firefox 55+ ; **Safari ne le propose pas** (seulement derrière un drapeau dans Safari Technology Preview). Ce n'est donc pas Baseline. Prévoyez un repli, par exemple `const auRepos = globalThis.requestIdleCallback ?? ((rappel) => setTimeout(() => rappel({ didTimeout: true, timeRemaining: () => 0 }), 1));`, et passez toujours un `timeout` pour le travail qui doit finir par se faire : sans lui, le rappel peut attendre plusieurs secondes sur une page active.

Ne modifiez pas le DOM dans un rappel d'inactivité (cela peut déclencher une mise en page imprévue) : préparez les données, puis appliquez les changements dans un `requestAnimationFrame`.

## `scheduler.postTask` et `scheduler.yield` : prioriser et céder la main

Une **tâche longue** (plus de 50 ms sans rendre la main) bloque les clics et l'affichage : la page paraît figée et l'indicateur INP (_Interaction to Next Paint_, l'un des Core Web Vitals) se dégrade. La solution consiste à découper le travail et à **céder la main** régulièrement au navigateur.

L'API Prioritized Task Scheduling, exposée par l'objet global `scheduler`, rend cela explicite :

- `scheduler.postTask(rappel, { priority, delay, signal })` planifie une tâche avec une priorité : `"user-blocking"` (urgent), `"user-visible"` (par défaut) ou `"background"` (quand rien d'autre ne presse). Elle renvoie une promesse du résultat ; un `TaskController` permet d'annuler la tâche ou d'en changer la priorité.
- `await scheduler.yield()` rend la main au navigateur (affichage, saisie) puis reprend **en priorité** sur les autres tâches de même niveau, contrairement à `setTimeout(…, 0)` qui repasse en fin de file.

> [!NOTE]
> Disponibilité (novembre 2026) : `scheduler.postTask` dans Chrome/Edge 94+ et Firefox 142+ ; `scheduler.yield` dans Chrome/Edge 129+ et Firefox 142+. **Safari ne les propose pas encore** : ce n'est pas Baseline. Détectez la fonctionnalité et prévoyez un repli.

Ce découpage fonctionne aussi dans Node.js grâce au repli sur `setTimeout`. Ici, un timer programmé avant le traitement parvient à s'exécuter **pendant** celui-ci, preuve que le fil d'exécution n'est pas monopolisé :

```js
// scheduler.yield() si disponible (Chrome, Edge, Firefox), sinon setTimeout(…, 0)
const cederLaMain = () => globalThis.scheduler?.yield?.() ?? new Promise((resoudre) => setTimeout(resoudre, 0));

async function traiterParTranches(elements, traiter, budgetMs = 10) {
  let debutTranche = performance.now();
  let pauses = 0;
  for (const element of elements) {
    traiter(element);
    if (performance.now() - debutTranche > budgetMs) {
      await cederLaMain(); // laisse passer les clics, l'affichage, les autres timers
      pauses++;
      debutTranche = performance.now();
    }
  }
  return pauses;
}

// Une tâche « coûteuse » : environ 0,5 ms par élément
function traitementCouteux() {
  const fin = performance.now() + 0.5;
  while (performance.now() < fin) {}
}

setTimeout(() => console.log("un autre rappel a pu s'exécuter pendant le traitement"), 0);

const pauses = await traiterParTranches(Array.from({ length: 200 }), traitementCouteux);
console.log("traitement terminé, avec des pauses :", pauses > 0);
// un autre rappel a pu s'exécuter pendant le traitement
// traitement terminé, avec des pauses : true
```

Avec les priorités, dans un navigateur compatible :

<!-- no-run -->
```js
// Afficher le résultat d'abord, envoyer les statistiques ensuite
scheduler.postTask(() => afficherResultats(donnees), { priority: "user-blocking" });
scheduler.postTask(() => envoyerStatistiques(), { priority: "background" });

// Une tâche annulable dont on peut changer la priorité
const controleur = new TaskController({ priority: "background" });
scheduler
  .postTask(() => prechargerImages(), { signal: controleur.signal })
  .catch((erreur) => console.log("préchargement annulé :", erreur.name)); // AbortError
controleur.setPriority("user-visible"); // l'utilisateur s'approche de la galerie
controleur.abort(); // finalement, il quitte la page
```

Dans Node.js, l'équivalent de `scheduler.yield()` est `setImmediate()` (ou `scheduler.yield()` de `node:timers/promises`, expérimental) ; mais pour un vrai calcul lourd côté serveur, déplacez-le plutôt dans un `worker_thread` ([chapitre 27](../27-nodejs/README.md)).

## Debounce et throttle

Certains événements se déclenchent en rafale : `input` à chaque touche, `scroll` et `pointermove` des dizaines de fois par seconde, `resize` en continu pendant qu'on redimensionne. Exécuter un traitement coûteux (requête réseau, calcul de mise en page) à chaque fois gaspille des ressources, voire bloque la page. Deux techniques limitent la fréquence d'exécution :

- **debounce** (« anti-rebond ») : attendre que la rafale soit **terminée**, c'est-à-dire qu'il se soit écoulé `attente` ms sans nouvel appel, puis exécuter une seule fois avec les derniers arguments ;
- **throttle** (« étranglement ») : exécuter **au plus une fois** toutes les `intervalle` ms pendant la rafale.

```text
appels          x x x x x x x x x                  x x x
debounce (300)                    ··· ●                   ··· ●     une fois, 300 ms après le DERNIER appel
throttle (300)  ●       ●       ●       ●          ●     ●          régulièrement PENDANT la rafale
```

| Situation                                   | Technique              |
| ------------------------------------------- | ---------------------- |
| Recherche pendant la frappe, autocomplétion | debounce (200 à 400 ms) |
| Sauvegarde automatique d'un brouillon       | debounce (~1 s)        |
| Valider un champ quand l'utilisateur s'arrête de taper | debounce      |
| Recalculer après la fin d'un `resize`       | debounce               |
| Suivre le défilement (barre de progression, chargement infini) | throttle (100 à 200 ms) ou [`IntersectionObserver`](../23-dom/README.md) |
| Suivre la souris, glisser-déposer           | throttle, ou throttle calé sur l'affichage |
| Empêcher le double clic sur « Payer »       | debounce avec `leading: true`, ou mieux : désactiver le bouton pendant la requête |

### Tester avec une horloge simulée

Tester du code temporel avec de vraies attentes est lent et fragile. Les exemples suivants remplacent l'horloge par une **horloge simulée** grâce à `mock.timers` du module `node:test` : `mock.timers.tick(100)` fait avancer le temps de 100 ms instantanément et exécute les timers échus. Les tests sont ainsi exacts et immédiats. Le [chapitre 29](../29-tests/README.md) détaille cet outil.

### Implémenter `debounce`

Les exigences d'une implémentation sérieuse :

- conserver `this` et **tous** les arguments du dernier appel (une fonction fléchée en enveloppe perdrait `this`) ;
- option `trailing` (par défaut `true`) : exécuter à la fin de la période de calme ;
- option `leading` (par défaut `false`) : exécuter immédiatement au **premier** appel d'une rafale ;
- avec les deux options, n'exécuter à la fin que s'il y a eu d'autres appels entre-temps ;
- `cancel()` pour abandonner l'exécution en attente (composant détruit, page quittée) et `flush()` pour la forcer tout de suite (enregistrer avant de fermer).

```js
import { mock } from "node:test";
import assert from "node:assert/strict";

/**
 * Renvoie une version « anti-rebond » de `fn` : elle ne s'exécute qu'après
 * `attente` ms sans nouvel appel.
 * @param {Function} fn
 * @param {number} attente
 * @param {{ leading?: boolean, trailing?: boolean }} [options]
 */
function debounce(fn, attente, { leading = false, trailing = true } = {}) {
  let minuteur = null; // non nul tant qu'une rafale est en cours
  let enAttente = null; // { contexte, args } du dernier appel pas encore exécuté

  function executer() {
    const { contexte, args } = enAttente;
    enAttente = null;
    fn.apply(contexte, args);
  }

  function finDuCalme() {
    minuteur = null;
    if (trailing && enAttente) executer();
    enAttente = null;
  }

  function debounced(...args) {
    const debutDeRafale = minuteur === null;
    enAttente = { contexte: this, args };
    clearTimeout(minuteur);
    minuteur = setTimeout(finDuCalme, attente);
    if (leading && debutDeRafale) executer();
  }

  debounced.cancel = () => {
    clearTimeout(minuteur);
    minuteur = null;
    enAttente = null;
  };

  debounced.flush = () => {
    if (minuteur === null) return;
    clearTimeout(minuteur);
    finDuCalme();
  };

  return debounced;
}

mock.timers.enable({ apis: ["setTimeout"] }); // horloge simulée

// 1. Cas classique : seule la dernière valeur de la rafale est traitée
const recherches = [];
const rechercher = debounce((terme) => recherches.push(terme), 300);
rechercher("j");
mock.timers.tick(100);
rechercher("ja");
mock.timers.tick(100);
rechercher("jav");
mock.timers.tick(299);
console.log(recherches); // []
mock.timers.tick(1);
console.log(recherches); // [ 'jav' ]

// 2. leading : exécution immédiate, puis plus rien pendant la rafale
const clics = [];
const payer = debounce((n) => clics.push(n), 500, { leading: true, trailing: false });
payer(1);
payer(2);
payer(3);
mock.timers.tick(500);
payer(4); // nouvelle rafale
assert.deepEqual(clics, [1, 4]);

// 3. leading + trailing : au début ET à la fin, si la rafale a continué
const traces = [];
const suivre = debounce((v) => traces.push(v), 100, { leading: true });
suivre("a");
suivre("b");
suivre("c");
mock.timers.tick(100);
suivre("seul"); // rafale d'un seul appel : exécutée une seule fois
mock.timers.tick(100);
assert.deepEqual(traces, ["a", "c", "seul"]);

// 4. cancel et flush
const sauvegardes = [];
const sauvegarder = debounce((texte) => sauvegardes.push(texte), 1000);
sauvegarder("brouillon 1");
sauvegarder.cancel();
mock.timers.tick(2000);
sauvegarder("brouillon 2");
sauvegarder.flush(); // l'utilisateur ferme l'éditeur : on enregistre tout de suite
assert.deepEqual(sauvegardes, ["brouillon 2"]);

// 5. this et arguments sont conservés
const panier = {
  total: 0,
  ajouter: debounce(function (prix, quantite) {
    this.total += prix * quantite;
  }, 50),
};
panier.ajouter(10, 1);
panier.ajouter(10, 3);
mock.timers.tick(50);
assert.equal(panier.total, 30); // seul le dernier appel compte

mock.timers.reset(); // on rend la vraie horloge
console.log("debounce : tous les tests passent"); // debounce : tous les tests passent
```

Cette version ne renvoie pas le résultat de `fn` (il n'existe pas encore au moment de l'appel). Si vous en avez besoin, renvoyez une promesse : c'est l'[exercice 6](#exercice-6--un-debounce-qui-renvoie-une-promesse-).

### Implémenter `throttle`

Pour le throttle, les options par défaut sont inversées : `leading: true` (réagir tout de suite au premier événement) et `trailing: true` (ne pas perdre le **dernier** état, par exemple la position finale du défilement).

```js
import { mock } from "node:test";
import assert from "node:assert/strict";

/**
 * Renvoie une version de `fn` exécutée au plus une fois toutes les `intervalle` ms.
 * @param {Function} fn
 * @param {number} intervalle
 * @param {{ leading?: boolean, trailing?: boolean }} [options]
 */
function throttle(fn, intervalle, { leading = true, trailing = true } = {}) {
  let minuteur = null; // non nul pendant une période de blocage
  let enAttente = null; // dernier appel reçu pendant la période

  function finDePeriode() {
    if (trailing && enAttente) {
      const { contexte, args } = enAttente;
      enAttente = null;
      fn.apply(contexte, args);
      minuteur = setTimeout(finDePeriode, intervalle); // une nouvelle période commence
    } else {
      minuteur = null;
      enAttente = null;
    }
  }

  function throttled(...args) {
    if (minuteur === null) {
      if (leading) fn.apply(this, args);
      else enAttente = { contexte: this, args };
      minuteur = setTimeout(finDePeriode, intervalle);
    } else {
      enAttente = { contexte: this, args };
    }
  }

  throttled.cancel = () => {
    clearTimeout(minuteur);
    minuteur = null;
    enAttente = null;
  };

  return throttled;
}

mock.timers.enable({ apis: ["setTimeout"] });

// Un appel toutes les 30 ms (positions de défilement), intervalle de 100 ms
function simulerRafale(f, nombre) {
  for (let i = 1; i <= nombre; i++) {
    f(i * 30);
    mock.timers.tick(30);
  }
}

const positions = [];
const suivreDefilement = throttle((y) => positions.push(y), 100);
simulerRafale(suivreDefilement, 7); // appels avec 30, 60, …, 210, sur 210 ms
mock.timers.tick(500);
console.log(positions); // [ 30, 120, 210 ]

// Sans trailing : la dernière position (210) est perdue
const sansFin = [];
const suivreSansFin = throttle((y) => sansFin.push(y), 100, { trailing: false });
simulerRafale(suivreSansFin, 7);
mock.timers.tick(500);
assert.deepEqual(sansFin, [30, 150]);

// Sans leading : on attend la fin de la première période
const sansDebut = [];
const suivreSansDebut = throttle((y) => sansDebut.push(y), 100, { leading: false });
simulerRafale(suivreSansDebut, 7);
mock.timers.tick(500);
assert.deepEqual(sansDebut, [120, 210]);

// cancel : rien ne part après l'annulation
const annules = [];
const suivreAnnule = throttle((y) => annules.push(y), 100);
suivreAnnule(1);
suivreAnnule(2);
suivreAnnule.cancel();
mock.timers.tick(500);
assert.deepEqual(annules, [1]);

// this est conservé
const jauge = {
  valeur: 0,
  regler: throttle(function (v) {
    this.valeur = v;
  }, 100),
};
jauge.regler(42);
assert.equal(jauge.valeur, 42);

mock.timers.reset();
console.log("throttle : tous les tests passent"); // throttle : tous les tests passent
```

Décortiquons la première rafale : l'appel à 30 ms s'exécute immédiatement (`leading`) et ouvre une période de 100 ms ; les appels suivants (60, 90, 120) remplacent tour à tour l'appel en attente ; à la fin de la période, le dernier (120) s'exécute (`trailing`) et ouvre une nouvelle période, et ainsi de suite. On obtient bien au plus une exécution par tranche de 100 ms, sans perdre la dernière position.

> [!TIP]
> Dans un vrai projet, vous pouvez aussi importer `debounce` et `throttle` depuis une bibliothèque éprouvée comme [lodash-es](https://lodash.com/docs/#debounce) ou [es-toolkit](https://es-toolkit.dev/), qui ajoutent des options comme `maxWait`. Les écrire une fois reste le meilleur moyen de comprendre leurs options.

### Utilisation dans une page

Une recherche « pendant la frappe » combine debounce et annulation : on attend que l'utilisateur fasse une pause, et on annule la requête précédente si elle n'est pas terminée (sinon une réponse lente pourrait écraser une réponse plus récente).

```html
<input id="recherche" type="search" placeholder="Rechercher un livre…" />
<ul id="resultats"></ul>
```

<!-- no-run -->
```js
// debounce : la fonction écrite plus haut (ou importée d'une bibliothèque)
const champ = document.querySelector("#recherche");
const liste = document.querySelector("#resultats");
let controleur = null;

const rechercher = debounce(async (terme) => {
  controleur?.abort(); // annule la requête précédente
  controleur = new AbortController();
  if (terme.length < 2) return liste.replaceChildren();
  try {
    const url = `/api/livres?${new URLSearchParams({ q: terme })}`;
    const reponse = await fetch(url, { signal: controleur.signal });
    const livres = await reponse.json();
    liste.replaceChildren(...livres.map((livre) => Object.assign(document.createElement("li"), { textContent: livre.titre })));
  } catch (erreur) {
    if (erreur.name !== "AbortError") throw erreur;
  }
}, 300);

champ.addEventListener("input", (evenement) => rechercher(evenement.target.value.trim()));
```

Et un throttle sur le défilement, avec un écouteur `passive` (le navigateur sait qu'il n'appellera pas `preventDefault()` et peut défiler sans attendre) :

<!-- no-run -->
```js
const barre = document.querySelector("#progression-lecture");

const mettreAJour = throttle(() => {
  const max = document.documentElement.scrollHeight - innerHeight;
  barre.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}, 100);

addEventListener("scroll", mettreAJour, { passive: true });
```

### Un throttle calé sur l'affichage

Pour une mise à jour **visuelle**, l'intervalle idéal est… une image. Ce throttle exécute au plus une fois par image, avec les derniers arguments reçus :

<!-- no-run -->
```js
function throttleParImage(fn) {
  let demande = null;
  let derniersArgs;
  return function (...args) {
    derniersArgs = args;
    if (demande !== null) return; // une image est déjà demandée
    demande = requestAnimationFrame(() => {
      demande = null;
      fn.apply(this, derniersArgs);
    });
  };
}

const curseur = document.querySelector("#curseur-perso");
addEventListener(
  "pointermove",
  throttleParImage((evenement) => {
    curseur.style.transform = `translate(${evenement.clientX}px, ${evenement.clientY}px)`;
  }),
);
```

## Nettoyer ses timers

Un timer actif garde en mémoire son rappel **et tout ce que ce rappel référence** (sa fermeture) : tableaux, éléments du DOM, connexions. Un intervalle jamais arrêté est donc une fuite de mémoire, mais aussi un comportement fantôme : un composant détruit continue de mettre à jour un élément disparu, ou d'interroger un serveur toutes les secondes.

```js
// ❌ Impossible d'arrêter cette horloge : l'identifiant n'est conservé nulle part
function demarrerHorlogeSansFin(afficher) {
  setInterval(() => afficher(new Date()), 1000);
}
```

La règle : **toute fonction qui démarre un timer doit fournir un moyen de l'arrêter**. Deux conventions courantes :

1. renvoyer une fonction de nettoyage (c'est ce que font `repeter` et `intervalleStable` plus haut, et ce qu'attendent `useEffect` de React ou `onCleanup` de Solid) ;
2. accepter un `AbortSignal`, ce qui permet d'arrêter d'un coup tout ce qui dépend du même contrôleur (timers, écouteurs, requêtes).

```js
function demarrerHorloge(afficher, { signal }) {
  const identifiant = setInterval(() => afficher(new Date()), 100);
  signal.addEventListener("abort", () => clearInterval(identifiant), { once: true });
}

const controleur = new AbortController();
let tics = 0;
demarrerHorloge(() => tics++, { signal: controleur.signal });

setTimeout(() => {
  const avant = tics;
  controleur.abort(); // arrête l'horloge (et tout ce qui partage ce signal)
  setTimeout(() => console.log(tics === avant ? "plus aucun tic" : "fuite !"), 250);
}, 350);
// plus aucun tic
```

Dans un navigateur, le même signal peut servir à `addEventListener(type, rappel, { signal })` et à `fetch(url, { signal })` : un seul `abort()` démonte tout le composant.

### `using` : annulation automatique en fin de bloc

Dans Node.js, les objets `Timeout` et `Immediate` implémentent `Symbol.dispose` (stable depuis Node.js 24.2). Combinés à la déclaration `using` (gestion explicite des ressources, stade 4, prévue pour ES2027, disponible dans Node.js 24+ et Chrome 134+), ils sont annulés automatiquement à la sortie du bloc, même en cas d'exception :

```js
{
  using rappel = setTimeout(() => console.log("jamais affiché"), 100);
  console.log("dans le bloc");
} // rappel[Symbol.dispose]() annule le timer ici
console.log("après le bloc");
// dans le bloc
// après le bloc
```

Dans les navigateurs, les identifiants de timers sont de simples nombres, sans `Symbol.dispose` : enregistrez l'annulation dans un `DisposableStack` (`pile.defer(() => clearTimeout(id))`) là où il est disponible (voir le [chapitre 17](../17-erreurs/README.md)).

### Mettre en pause quand la page est masquée

Même bridés, les timers d'un onglet masqué consomment des ressources et peuvent envoyer des requêtes inutiles. L'événement `visibilitychange` permet de suspendre le travail périodique :

<!-- no-run -->
```js
let arreter = null;

function demarrer() {
  arreter ??= repeter(() => rafraichirTableauDeBord(), 5000); // repeter : défini plus haut
}

function suspendre() {
  arreter?.();
  arreter = null;
}

document.addEventListener("visibilitychange", () => (document.hidden ? suspendre() : demarrer()));
if (!document.hidden) demarrer();
```

## Spécificités de Node.js

Les fonctions globales sont les mêmes, mais Node.js renvoie des **objets** `Timeout` (et `Immediate`) dotés de méthodes utiles.

| Méthode                       | Rôle                                                                    |
| ----------------------------- | ----------------------------------------------------------------------- |
| `timer.unref()` / `timer.ref()` | Le timer n'empêche plus (ou de nouveau) le processus de se terminer   |
| `timer.hasRef()`              | Indique si le timer retient le processus                                |
| `timer.refresh()`             | Relance le compte à rebours avec le même délai, sans recréer d'objet    |
| `+timer` (`Symbol.toPrimitive`) | Identifiant numérique, accepté par `clearTimeout`                     |
| `timer[Symbol.dispose]()`     | Annule le timer (utilisé par `using`)                                   |

### `unref` : ne pas retenir le processus

Un processus Node.js reste vivant tant qu'un timer actif existe. Pour une tâche accessoire (rafraîchir un cache, envoyer un battement de cœur), `unref()` permet au programme de se terminer normalement quand il n'a plus rien d'autre à faire :

```js
const nettoyageDuCache = setTimeout(() => console.log("nettoyage du cache"), 800);
nettoyageDuCache.unref();

console.log(nettoyageDuCache.hasRef()); // false
console.log("fin du script"); // fin du script
// … et le processus se termine sans attendre le nettoyage
```

### `refresh` : un minuteur d'inactivité

`refresh()` repart de zéro avec le même délai : c'est un debounce intégré, idéal pour un délai d'inactivité (fermer une connexion, verrouiller une session).

```js
let activites = 0;
const inactivite = setTimeout(() => console.log(`inactif depuis 150 ms (après ${activites} activités)`), 150);

const activite = setInterval(() => {
  activites++;
  inactivite.refresh(); // chaque activité repousse l'échéance
  if (activites === 3) clearInterval(activite);
}, 40);
// inactif depuis 150 ms (après 3 activités)
```

### `setImmediate`, `process.nextTick` et `setTimeout(…, 0)`

- `setImmediate(rappel)` s'exécute dans la phase « check » de la boucle d'événements, juste après les entrées/sorties ; c'est la bonne façon de « céder la main » dans Node.js.
- `process.nextTick(rappel)` passe avant les timers et toutes les phases de la boucle ; son ordre par rapport aux promesses dépend du contexte (au premier niveau d'un module ES, les promesses passent d'abord). À réserver aux cas très particuliers : un usage récursif affame la boucle.
- Dans le script principal, l'ordre entre `setTimeout(…, 0)` et `setImmediate` n'est pas garanti ; dans un rappel d'entrée/sortie, `setImmediate` passe toujours en premier.

Le [chapitre 18](../18-asynchrone/README.md) détaille les phases de la boucle d'événements de Node.js.

### Délais hors limites

Dans Node.js, un délai négatif, `NaN` ou supérieur à 2 147 483 647 devient **1 ms**, avec un avertissement (`TimeoutNegativeWarning`, `TimeoutNaNWarning` ou `TimeoutOverflowWarning`) ; un délai de 0 devient aussi 1 ms, et un délai décimal est tronqué. Un rappel qui n'est pas une fonction lève une `TypeError`.

## Recettes

### Compte à rebours sans dérive

Le temps affiché se déduit de l'instant de départ, pas du nombre de tics : le compte à rebours reste juste même si un tic part en retard. Les durées sont ici réduites (un « tic » de 100 ms) pour l'exemple.

```js
function compteARebours(depuis, { intervalle = 1000, surTic, surFin }) {
  const depart = performance.now();
  let etape = 0;
  let identifiant;
  let actif = true;

  function tic() {
    if (!actif) return;
    if (etape === depuis) return surFin();
    surTic(depuis - etape);
    etape++;
    // Prochaine échéance calculée depuis le départ : les retards ne s'additionnent pas
    identifiant = setTimeout(tic, Math.max(0, depart + etape * intervalle - performance.now()));
  }

  tic();
  return () => {
    actif = false;
    clearTimeout(identifiant);
  };
}

compteARebours(3, {
  intervalle: 100,
  surTic: (n) => console.log(n),
  surFin: () => console.log("Décollage !"),
});
// 3
// 2
// 1
// Décollage !
```

### Sondage (polling) adaptatif

Interroger un serveur jusqu'à ce qu'un traitement soit terminé, en espaçant les essais (backoff) pour ne pas le surcharger, avec un délai maximal global :

```js
const attendre = (ms, signal) =>
  new Promise((resoudre, rejeter) => {
    signal?.throwIfAborted();
    const identifiant = setTimeout(resoudre, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(identifiant);
        rejeter(signal.reason);
      },
      { once: true },
    );
  });

async function sonder(verifier, { delaiInitial = 1000, delaiMax = 30_000, facteur = 2, signal } = {}) {
  let delai = delaiInitial;
  for (let essai = 1; ; essai++) {
    const etat = await verifier();
    if (etat.termine) return etat;
    console.log(`essai ${essai} : ${etat.statut}, prochain essai dans ${delai} ms`);
    await attendre(delai, signal);
    delai = Math.min(delai * facteur, delaiMax);
  }
}

// Simulation d'un export qui se termine au 4e appel
let appels = 0;
const verifierExport = async () => (++appels < 4 ? { termine: false, statut: "en cours" } : { termine: true, url: "/exports/rapport.pdf" });

const resultat = await sonder(verifierExport, { delaiInitial: 20, delaiMax: 60, signal: AbortSignal.timeout(2000) });
console.log("prêt :", resultat.url);
// essai 1 : en cours, prochain essai dans 20 ms
// essai 2 : en cours, prochain essai dans 40 ms
// essai 3 : en cours, prochain essai dans 60 ms
// prêt : /exports/rapport.pdf
```

Pour un serveur qui doit **pousser** des mises à jour fréquentes, le sondage n'est pas la meilleure solution : préférez les Server-Sent Events ou les WebSockets ([chapitre 22](../22-fetch-http/README.md)). Les nouvelles tentatives après échec (backoff exponentiel avec _jitter_) sont traitées au [chapitre 20](../20-async-await/README.md).

### Horloge alignée sur la seconde

Une horloge mise à jour par `setInterval(…, 1000)` démarrée à 12:00:00,700 change d'affichage 700 ms après le vrai changement de seconde, et dérive. En visant à chaque fois le **début de la seconde suivante**, l'affichage reste synchronisé :

```html
<p>Il est <time id="horloge"></time></p>
```

<!-- no-run -->
```js
function demarrerHorloge(element) {
  const format = new Intl.DateTimeFormat("fr-FR", { timeStyle: "medium" });
  let identifiant;

  function tic() {
    const maintenant = new Date();
    element.textContent = format.format(maintenant);
    element.dateTime = maintenant.toISOString();
    identifiant = setTimeout(tic, 1000 - (maintenant.getTime() % 1000)); // jusqu'à la seconde suivante
  }

  tic();
  return () => clearTimeout(identifiant);
}

const arreterHorloge = demarrerHorloge(document.querySelector("#horloge"));
```

## Pièges courants

- **Appeler la fonction au lieu de la passer** : `setTimeout(sauvegarder(), 1000)` exécute `sauvegarder` immédiatement et planifie… son résultat. Écrivez `setTimeout(sauvegarder, 1000)` ou `setTimeout(() => sauvegarder(document), 1000)`.
- **Perdre `this`** en passant une méthode : `setTimeout(objet.methode, 100)`. Utilisez une fonction fléchée ou `bind`.
- **Croire que le délai est exact** : c'est un minimum. Calculez les durées à partir d'horodatages.
- **Compter le temps en comptant les tics** d'un `setInterval` : la dérive s'accumule, surtout en arrière-plan.
- **Oublier d'arrêter un intervalle**, ou en démarrer plusieurs (double clic sur « Démarrer ») : protégez le démarrage (`if (identifiant) return;` ou `??=`).
- **Utiliser `setInterval` avec un rappel asynchrone** : les exécutions se chevauchent. Préférez un `setTimeout` récursif.
- **Passer des arguments « dynamiques » à `setInterval`** : ils sont évalués une seule fois.
- **Dépasser 2³¹ − 1 ms** : le rappel part immédiatement.
- **Animer avec `setInterval`** au lieu de `requestAnimationFrame`, ou faire avancer une animation d'un nombre fixe de pixels par image.
- **Écrire un debounce avec une fonction fléchée** en guise d'enveloppe (`return (...args) => …`) : `this` est perdu pour les méthodes.
- **Passer une chaîne à `setTimeout`** : c'est un `eval` déguisé.

## Bonnes pratiques

1. Conservez **chaque** identifiant de timer et prévoyez son arrêt : fonction de nettoyage ou `AbortSignal`.
2. Préférez un `setTimeout` récursif à `setInterval` dès que le rappel est asynchrone ou que le délai varie.
3. Mesurez les durées avec `performance.now()`, horodatez avec `Date.now()`.
4. Animez avec `requestAnimationFrame` (ou CSS / Web Animations) et basez le mouvement sur le temps écoulé.
5. Découpez les calculs de plus de 50 ms et cédez la main (`scheduler.yield()` avec repli), ou déplacez-les dans un worker.
6. Limitez les événements en rafale avec debounce ou throttle, et choisissez le délai en pensant à l'utilisateur (300 ms pour une recherche, 100 ms pour un défilement).
7. Utilisez `AbortSignal.timeout()` pour imposer un délai maximal aux opérations asynchrones plutôt que de gérer un timer à la main.
8. Suspendez le travail périodique quand la page est masquée (`visibilitychange`) et, dans Node.js, `unref()` les timers accessoires.
9. Testez le code temporel avec une horloge simulée plutôt qu'avec de vraies attentes.

## Résumé

- `setTimeout(f, ms, ...args)` exécute `f` une fois, **au plus tôt** après `ms` ; `setInterval` répète jusqu'à `clearInterval`. Un délai de 0 attend la fin du code courant et des microtâches.
- Un délai est un minimum : un fil d'exécution occupé, l'imbrication (4 ms), les onglets masqués (1 s, voire 1 min) et la dérive retardent les rappels. Ne comptez jamais le temps en comptant les tics.
- `setTimeout` récursif évite les chevauchements et permet des délais variables ; un drapeau `actif` le rend arrêtable à tout moment.
- En asynchrone : `new Promise((r) => setTimeout(r, ms))`, `node:timers/promises`, et `AbortSignal.timeout()` / `AbortSignal.any()` pour les délais maximaux.
- `performance.now()` est monotone et précis : c'est l'outil des mesures de durée.
- `requestAnimationFrame` cale les animations sur l'écran ; `requestIdleCallback` et `scheduler.postTask` / `scheduler.yield()` (pas encore dans Safari) planifient selon la priorité et gardent la page réactive.
- Debounce = une exécution après la fin de la rafale ; throttle = au plus une exécution par intervalle. Une bonne implémentation conserve `this` et les arguments, propose `leading`/`trailing` et `cancel`.
- Chaque timer démarré doit pouvoir être arrêté (fonction de nettoyage, `AbortSignal`, `using` dans Node.js).
- Node.js ajoute `unref`, `refresh`, `setImmediate` et des timers en promesses.

## Exercices

### Exercice 1 — Prédire l'ordre (★☆☆)

Sans l'exécuter, écrivez dans quel ordre s'affichent les lettres, puis vérifiez.

```js
setTimeout(() => console.log("A"), 20);
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
setTimeout(() => {
  console.log("E");
  Promise.resolve().then(() => console.log("F"));
}, 0);
queueMicrotask(() => console.log("G"));
```

<details>
<summary>Solution</summary>

```js
setTimeout(() => console.log("A"), 20);
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
setTimeout(() => {
  console.log("E");
  Promise.resolve().then(() => console.log("F"));
}, 0);
queueMicrotask(() => console.log("G"));
// D
// C
// G
// B
// E
// F
// A
```

1. `D` : seul code synchrone, il s'exécute en premier.
2. `C` puis `G` : les microtâches passent dès que la pile est vide, dans leur ordre d'inscription.
3. `B` puis `E` : les deux timers de 0 ms, dans l'ordre de création.
4. `F` : la microtâche créée par `E` passe juste après `E`, avant tout autre timer.
5. `A` : le timer de 20 ms, en dernier.

</details>

### Exercice 2 — Trois bugs (★☆☆)

Ce minuteur de cuisine est censé afficher « Les pâtes sont prêtes » après 100 ms, puis « Plus que 2… », « Plus que 1… » à chaque tic de 50 ms avant de s'arrêter. Trouvez et corrigez les trois bugs.

<!-- no-run -->
```js
const minuteur = {
  plat: "Les pâtes",
  annoncer() {
    console.log(`${this.plat} sont prêtes`);
  },
  decompter(depart) {
    let restant = depart;
    setInterval(() => {
      console.log(`Plus que ${restant}…`);
      restant--;
    }, 50);
  },
};

setTimeout(minuteur.annoncer(), 100);
setTimeout(minuteur.annoncer, 100);
minuteur.decompter(2);
```

<details>
<summary>Solution</summary>

1. `setTimeout(minuteur.annoncer(), 100)` **appelle** la méthode tout de suite et planifie son résultat (`undefined`).
2. `setTimeout(minuteur.annoncer, 100)` perd `this` : affiche « undefined sont prêtes ».
3. L'intervalle n'est jamais arrêté : il afficherait « Plus que 0… », « Plus que -1… », etc., à l'infini.

```js
const minuteur = {
  plat: "Les pâtes",
  annoncer() {
    console.log(`${this.plat} sont prêtes`);
  },
  decompter(depart) {
    let restant = depart;
    const identifiant = setInterval(() => {
      console.log(`Plus que ${restant}…`);
      restant--;
      if (restant === 0) clearInterval(identifiant);
    }, 50);
  },
};

setTimeout(() => minuteur.annoncer(), 130);
minuteur.decompter(2);
// Plus que 2…
// Plus que 1…
// Les pâtes sont prêtes
```

Le délai de l'annonce est porté à 130 ms pour qu'elle arrive nettement après le dernier tic (à 100 ms) : deux timers presque simultanés ne garantissent pas un ordre précis.

</details>

### Exercice 3 — Une pause annulable (★★☆)

Écrivez `attendre(ms, { signal } = {})` qui renvoie une promesse résolue après `ms` millisecondes, et rejetée avec `signal.reason` si le signal est annulé (avant ou pendant l'attente). Le timer doit être nettoyé en cas d'annulation, et l'écouteur retiré en cas de succès. La fonction doit fonctionner dans un navigateur comme dans Node.js.

<details>
<summary>Solution</summary>

```js
function attendre(ms, { signal } = {}) {
  return new Promise((resoudre, rejeter) => {
    if (signal?.aborted) return rejeter(signal.reason);

    const surAnnulation = () => {
      clearTimeout(identifiant);
      rejeter(signal.reason);
    };

    const identifiant = setTimeout(() => {
      signal?.removeEventListener("abort", surAnnulation);
      resoudre();
    }, ms);

    signal?.addEventListener("abort", surAnnulation, { once: true });
  });
}

await attendre(50);
console.log("pause terminée"); // pause terminée

try {
  await attendre(1000, { signal: AbortSignal.timeout(50) });
} catch (erreur) {
  console.log(erreur.name); // TimeoutError
}

const controleur = new AbortController();
controleur.abort(new Error("l'utilisateur a quitté la page"));
try {
  await attendre(1000, { signal: controleur.signal });
} catch (erreur) {
  console.log(erreur.message); // l'utilisateur a quitté la page
}
```

Retirer l'écouteur après le succès évite d'accumuler des écouteurs sur un signal partagé et de garder la promesse en mémoire. Le cas « déjà annulé » est traité d'emblée : un signal annulé ne déclenche plus d'événement `abort`.

</details>

### Exercice 4 — Attendre qu'une condition soit vraie (★★☆)

Écrivez `attendreQue(condition, { intervalle = 50, delaiMax = 1000 } = {})` qui vérifie `condition()` (synchrone ou asynchrone) toutes les `intervalle` ms, se résout avec la première valeur « truthy » renvoyée, et se rejette avec une erreur `TimeoutError` si `delaiMax` est dépassé. C'est l'utilitaire `waitFor` que l'on trouve dans les bibliothèques de test.

<details>
<summary>Solution</summary>

```js
const pause = (ms) => new Promise((resoudre) => setTimeout(resoudre, ms));

async function attendreQue(condition, { intervalle = 50, delaiMax = 1000 } = {}) {
  const limite = performance.now() + delaiMax;
  while (true) {
    const resultat = await condition();
    if (resultat) return resultat;
    if (performance.now() + intervalle > limite) {
      throw new DOMException(`condition non remplie après ${delaiMax} ms`, "TimeoutError");
    }
    await pause(intervalle);
  }
}

// Une file de commandes qui se remplit au bout de 120 ms
const commandes = [];
setTimeout(() => commandes.push({ id: 42 }), 120);

const premiere = await attendreQue(() => commandes[0]);
console.log("commande reçue :", premiere.id); // commande reçue : 42

try {
  await attendreQue(() => false, { delaiMax: 200 });
} catch (erreur) {
  console.log(erreur.name, "-", erreur.message); // TimeoutError - condition non remplie après 200 ms
}
```

On utilise un `setTimeout` récursif implicite (`await pause` dans une boucle) : une condition asynchrone lente ne provoque jamais de vérifications simultanées. `DOMException` est disponible globalement dans les navigateurs et dans Node.js ; on lui donne le même nom (`TimeoutError`) que les erreurs de `AbortSignal.timeout`.

</details>

### Exercice 5 — Un minuteur pausable (★★☆)

Les notifications « toast » disparaissent après quelques secondes, mais le compte à rebours doit se mettre en pause quand la souris les survole. Écrivez `creerMinuteur(rappel, delai)` qui démarre immédiatement et renvoie un objet `{ pause(), reprendre(), restant() }`. `restant()` donne le temps restant en millisecondes.

<details>
<summary>Solution</summary>

```js
function creerMinuteur(rappel, delai) {
  let restant = delai;
  let debut = null; // instant du dernier démarrage, null si en pause
  let identifiant = null;

  function reprendre() {
    if (debut !== null || restant <= 0) return; // déjà en marche ou terminé
    debut = performance.now();
    identifiant = setTimeout(() => {
      restant = 0;
      debut = null;
      rappel();
    }, restant);
  }

  function pause() {
    if (debut === null) return;
    clearTimeout(identifiant);
    restant -= performance.now() - debut;
    debut = null;
  }

  reprendre();
  return {
    pause,
    reprendre,
    restant: () => Math.max(0, debut === null ? restant : restant - (performance.now() - debut)),
  };
}

const debutTest = performance.now();
const toast = creerMinuteur(() => {
  const ecoule = performance.now() - debutTest;
  console.log("toast fermé après la pause :", ecoule >= 300); // toast fermé après la pause : true
}, 200);

setTimeout(() => toast.pause(), 50); // survol après 50 ms
setTimeout(() => {
  const r = toast.restant();
  console.log("restant pendant la pause entre 100 et 150 ms :", r > 100 && r <= 150); // restant pendant la pause entre 100 et 150 ms : true
  toast.reprendre(); // fin du survol après 150 ms
}, 150);
```

Le temps restant n'est pas décompté par un intervalle : il est **recalculé** à partir des horodatages, ce qui le rend exact quels que soient les retards des timers. Les gardes de `reprendre` et `pause` rendent les appels répétés sans danger.

</details>

### Exercice 6 — Un debounce qui renvoie une promesse (★★★)

Pour une validation de formulaire asynchrone (« ce pseudo est-il libre ? »), on veut `const libre = await verifierPseudo(valeur)`. Écrivez `debouncePromesse(fn, attente)` : chaque appel renvoie une promesse ; quand la rafale se termine, `fn` est appelée **une seule fois** avec les derniers arguments, et **toutes** les promesses de la rafale se résolvent avec son résultat (ou se rejettent avec son erreur). `fn` peut être asynchrone.

<details>
<summary>Solution</summary>

```js
function debouncePromesse(fn, attente) {
  let minuteur = null;
  let enAttente = []; // { resoudre, rejeter } de chaque appel de la rafale

  return function (...args) {
    clearTimeout(minuteur);
    return new Promise((resoudre, rejeter) => {
      enAttente.push({ resoudre, rejeter });
      minuteur = setTimeout(async () => {
        const rafale = enAttente;
        enAttente = []; // les appels suivants ouvrent une nouvelle rafale
        try {
          const resultat = await fn.apply(this, args);
          for (const promesse of rafale) promesse.resoudre(resultat);
        } catch (erreur) {
          for (const promesse of rafale) promesse.rejeter(erreur);
        }
      }, attente);
    });
  };
}

const pseudosPris = new Set(["ada", "linus"]);
let appelsServeur = 0;
const verifierPseudo = debouncePromesse(async (pseudo) => {
  appelsServeur++;
  if (pseudo === "") throw new Error("pseudo vide");
  return !pseudosPris.has(pseudo);
}, 100);

const reponses = await Promise.all([verifierPseudo("l"), verifierPseudo("li"), verifierPseudo("linus")]);
console.log(reponses, appelsServeur); // [ false, false, false ] 1

console.log(await verifierPseudo("grace")); // true

try {
  await verifierPseudo("");
} catch (erreur) {
  console.log(erreur.message); // pseudo vide
}
```

Points clés : la fonction renvoyée est une `function` (pour transmettre `this`) et la fonction fléchée du `setTimeout` en hérite ; la liste `enAttente` est remplacée **avant** l'appel à `fn`, de sorte qu'un appel arrivant pendant l'exécution de `fn` démarre une nouvelle rafale au lieu de recevoir un résultat périmé.

</details>

### Exercice 7 — Planifier au-delà de 24,8 jours (★★★)

`setTimeout` ne peut pas attendre plus de 2³¹ − 1 ms. Écrivez `planifierLongDelai(rappel, delai, max = 2 ** 31 - 1)` qui enchaîne autant de timers que nécessaire (aucun ne dépassant `max`) et renvoie une fonction d'annulation. Le paramètre `max` permet de tester la logique rapidement.

<details>
<summary>Solution</summary>

```js
function planifierLongDelai(rappel, delai, max = 2 ** 31 - 1) {
  const echeance = Date.now() + delai; // heure murale : le délai peut couvrir une mise en veille
  let identifiant;
  let morceaux = 0;

  function planifier() {
    const restant = echeance - Date.now();
    if (restant <= 0) return rappel(morceaux);
    morceaux++;
    identifiant = setTimeout(planifier, Math.min(restant, max));
  }

  planifier();
  return () => clearTimeout(identifiant);
}

// Test rapide : 250 ms découpées en morceaux de 100 ms au plus
const debut = Date.now();
planifierLongDelai(
  (morceaux) => {
    console.log("déclenché après 250 ms :", Date.now() - debut >= 250); // déclenché après 250 ms : true
    console.log("nombre de timers :", morceaux); // nombre de timers : 3
  },
  250,
  100,
);

const annuler = planifierLongDelai(() => console.log("jamais affiché"), 300, 100);
setTimeout(annuler, 150);
```

Le temps restant est recalculé à chaque étape à partir de l'échéance : la fonction reste juste même si un timer part en retard. On utilise ici `Date.now()` plutôt que `performance.now()`, car sur une durée de plusieurs semaines l'ordinateur sera probablement mis en veille, ce que `performance.now()` ne compte pas sur la plupart des systèmes.

</details>

## Pour aller plus loin

- [MDN — `setTimeout()`](https://developer.mozilla.org/fr/docs/Web/API/Window/setTimeout) (délais minimaux, onglets inactifs, délai maximal)
- [MDN — `setInterval()`](https://developer.mozilla.org/fr/docs/Web/API/Window/setInterval)
- [MDN — `requestAnimationFrame()`](https://developer.mozilla.org/fr/docs/Web/API/Window/requestAnimationFrame)
- [MDN — `requestIdleCallback()`](https://developer.mozilla.org/fr/docs/Web/API/Window/requestIdleCallback)
- [MDN — Prioritized Task Scheduling API](https://developer.mozilla.org/en-US/docs/Web/API/Prioritized_Task_Scheduling_API) (`scheduler.postTask`, `scheduler.yield`)
- [MDN — `performance.now()`](https://developer.mozilla.org/fr/docs/Web/API/Performance/now)
- [MDN — `AbortSignal.timeout()`](https://developer.mozilla.org/fr/docs/Web/API/AbortSignal/timeout_static)
- [Node.js — Timers](https://nodejs.org/docs/latest/api/timers.html) (y compris `node:timers/promises`)
- [web.dev — Optimiser les tâches longues](https://web.dev/articles/optimize-long-tasks)
- [Node.js — `mock.timers`](https://nodejs.org/docs/latest/api/test.html#class-mocktimers) pour tester le code temporel

---

[← Chapitre précédent](../20-async-await/README.md) · [Sommaire](../README.md#sommaire) · [Chapitre suivant →](../22-fetch-http/README.md)
