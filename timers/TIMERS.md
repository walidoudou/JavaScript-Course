# Les Timers en JavaScript

## Table des matières

- [Introduction](#introduction)
- [Fonctions de base](#fonctions-de-base)
  - [setTimeout](#settimeout)
  - [setInterval](#setinterval)
  - [clearTimeout et clearInterval](#cleartimeout-et-clearinterval)
- [Comportements spécifiques](#comportements-spécifiques)
  - [setTimeout avec délai de 0](#settimeout-avec-délai-de-0)
  - [Précision des timers](#précision-des-timers)
  - [Timers dans les onglets inactifs](#timers-dans-les-onglets-inactifs)
- [Méthodes avancées](#méthodes-avancées)
  - [requestAnimationFrame](#requestanimationframe)
  - [performance.now()](#performancenow)
- [Techniques de contrôle](#techniques-de-contrôle)
  - [Debounce](#debounce)
  - [Throttle](#throttle)
- [Timers en environnement spécifique](#timers-en-environnement-spécifique)
  - [Node.js](#nodejs)
  - [Web Workers](#web-workers)
- [Gestion des erreurs et des fuites de mémoire](#gestion-des-erreurs-et-des-fuites-de-mémoire)
- [Patterns d'implémentation](#patterns-dimplémentation)
  - [Récursion de setTimeout](#récursion-de-settimeout)
  - [Timers auto-ajustables](#timers-auto-ajustables)
- [Bonnes pratiques](#bonnes-pratiques)
- [Compatibilité des navigateurs](#compatibilité-des-navigateurs)
- [Exemples d'applications pratiques](#exemples-dapplications-pratiques)
- [Ressources supplémentaires](#ressources-supplémentaires)

## Introduction

Les timers (minuteurs) en JavaScript permettent de planifier l'exécution de code à un moment ultérieur ou à intervalles réguliers. Ils sont essentiels pour créer des animations, implémenter des fonctionnalités de polling, retarder l'exécution de certaines opérations ou limiter la fréquence d'exécution de fonctions gourmandes en ressources.

JavaScript propose plusieurs mécanismes de minuterie, chacun avec ses spécificités et cas d'utilisation. Ce document présente en détail les différents types de timers disponibles, leurs caractéristiques, et les bonnes pratiques pour les utiliser efficacement.

## Fonctions de base

### setTimeout

La fonction `setTimeout` exécute une fonction ou un bloc de code après un délai spécifié (en millisecondes).

#### Syntaxe de base

```javascript
const timeoutID = setTimeout(fonction, délai, param1, param2, ...);
```

- `fonction` : La fonction à exécuter après le délai.
- `délai` : Le temps d'attente en millisecondes (1000ms = 1 seconde).
- `param1, param2, ...` : Arguments optionnels à passer à la fonction.
- `timeoutID` : Identifiant retourné permettant d'annuler le timer.

#### Exemples

```javascript
// Exemple simple
setTimeout(() => {
  console.log("Ce message s'affiche après 2 secondes");
}, 2000);

// Avec paramètres
function saluer(nom, titre) {
  console.log(`Bonjour ${titre} ${nom}!`);
}

setTimeout(saluer, 1000, "Dupont", "Monsieur");

// Stockage de l'identifiant
const timeoutID = setTimeout(() => {
  console.log("Cette fonction ne sera jamais exécutée");
}, 5000);

// Annulation du timer
clearTimeout(timeoutID);
```

### setInterval

La fonction `setInterval` exécute une fonction ou un bloc de code à intervalles réguliers.

#### Syntaxe de base

```javascript
const intervalID = setInterval(fonction, intervalle, param1, param2, ...);
```

- `fonction` : La fonction à exécuter périodiquement.
- `intervalle` : La durée entre chaque exécution, en millisecondes.
- `param1, param2, ...` : Arguments optionnels à passer à la fonction.
- `intervalID` : Identifiant retourné permettant d'annuler le timer.

#### Exemples

```javascript
// Horloge simple
let secondes = 0;
const intervalID = setInterval(() => {
  secondes++;
  console.log(`Temps écoulé: ${secondes} secondes`);

  if (secondes >= 10) {
    clearInterval(intervalID); // Arrêt après 10 secondes
    console.log("Minuteur terminé");
  }
}, 1000);

// Avec paramètres
function miseAJour(element, valeur) {
  element.textContent = valeur;
}

const compteur = document.getElementById("compteur");
let nombre = 0;

setInterval(miseAJour, 1000, compteur, ++nombre);
```

### clearTimeout et clearInterval

Ces fonctions permettent d'annuler respectivement un `setTimeout` ou un `setInterval`.

```javascript
// Annulation d'un setTimeout
const timeoutID = setTimeout(maFonction, 5000);
clearTimeout(timeoutID); // La fonction ne sera jamais exécutée

// Annulation d'un setInterval
const intervalID = setInterval(maFonction, 1000);
// Plus tard dans le code...
clearInterval(intervalID); // Les exécutions périodiques s'arrêtent
```

## Comportements spécifiques

### setTimeout avec délai de 0

Utiliser `setTimeout` avec un délai de 0 ne signifie pas que la fonction sera exécutée immédiatement, mais plutôt qu'elle sera planifiée pour s'exécuter dès que possible après que les scripts en cours d'exécution soient terminés.

```javascript
console.log("Début");

setTimeout(() => {
  console.log("Callback du setTimeout");
}, 0);

console.log("Fin");

// Affiche:
// Début
// Fin
// Callback du setTimeout
```

Cette technique est souvent utilisée pour:

- Rendre une opération asynchrone
- Sortir de la pile d'appels actuelle
- Différer une exécution jusqu'à la fin du traitement actuel
- Éviter le blocage de l'interface utilisateur

### Précision des timers

Les timers JavaScript ne garantissent pas une précision à la milliseconde près. Plusieurs facteurs peuvent affecter leur précision:

1. **Résolution minimale** : La plupart des navigateurs ont une résolution minimale d'environ 4ms pour les timers, certains navigateurs plus anciens pouvant aller jusqu'à 10-15ms.

2. **Charge du processeur** : Si le thread principal est occupé, l'exécution du timer peut être retardée.

3. **Mode d'arrière-plan** : Les onglets inactifs peuvent avoir une fréquence de mise à jour des timers réduite.

```javascript
// Démonstration de l'imprécision
const debutMesure = Date.now();
let compteur = 0;

const intervalId = setInterval(() => {
  compteur++;
  const tempsEcoule = Date.now() - debutMesure;
  const tempsTheorique = compteur * 100;
  const difference = tempsEcoule - tempsTheorique;

  console.log(`Exécution #${compteur}: Différence de ${difference}ms`);

  if (compteur >= 20) {
    clearInterval(intervalId);
  }
}, 100);
```

### Timers dans les onglets inactifs

Les navigateurs modernes ralentissent ou suspendent les timers dans les onglets inactifs pour économiser les ressources:

- Un `setTimeout` prévu dans un onglet inactif peut être retardé jusqu'à ce que l'onglet redevienne actif.
- Les `setInterval` peuvent être limités à une exécution par seconde (ou moins) dans un onglet inactif.

Solutions possibles:

- Utiliser l'API `Page Visibility` pour détecter quand l'onglet devient inactif et ajuster le comportement en conséquence.
- Utiliser `Web Workers` pour les opérations qui doivent continuer en arrière-plan.

```javascript
// Exemple avec Page Visibility API
let intervalId = null;

function demarrerTimer() {
  if (intervalId === null) {
    intervalId = setInterval(maFonction, 1000);
    console.log("Timer démarré");
  }
}

function arreterTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("Timer arrêté");
  }
}

// Gestion de la visibilité
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    arreterTimer();
  } else {
    demarrerTimer();
  }
});

// Démarrage initial
demarrerTimer();
```

## Méthodes avancées

### requestAnimationFrame

`requestAnimationFrame` est une méthode spécialement conçue pour les animations, offrant plusieurs avantages par rapport à `setTimeout` ou `setInterval`:

- Synchronisation avec le taux de rafraîchissement de l'écran
- Suspension automatique dans les onglets inactifs
- Optimisations par le navigateur pour de meilleures performances
- Réduction de la consommation de batterie

#### Syntaxe de base

```javascript
const requestId = requestAnimationFrame(callback);
```

- `callback` : Fonction à appeler avant le prochain repaint.
- `requestId` : Identifiant permettant d'annuler la requête via `cancelAnimationFrame`.

#### Exemples

```javascript
// Animation de base
function animer(timestamp) {
  // timestamp est un argument optionnel fournissant le moment d'exécution
  console.log(`Animation frame at ${timestamp} ms`);

  // Logique d'animation
  element.style.left = `${(timestamp / 10) % 300}px`;

  // Demande la prochaine frame
  requestAnimationFrame(animer);
}

// Démarrer l'animation
requestAnimationFrame(animer);

// Exemple plus complet avec gestion du temps
let dernierTimestamp = 0;
const vitesse = 100; // pixels par seconde

function animerAvecDelta(timestamp) {
  if (!dernierTimestamp) dernierTimestamp = timestamp;

  // Calcul du delta (temps écoulé depuis la dernière frame)
  const delta = timestamp - dernierTimestamp;
  dernierTimestamp = timestamp;

  // Calcul du déplacement basé sur le temps écoulé, pas sur le nombre de frames
  const deplacement = (vitesse * delta) / 1000;
  element.style.left = `${parseFloat(element.style.left || 0) + deplacement}px`;

  // Continuer l'animation
  requestAnimationFrame(animerAvecDelta);
}

// Arrêt d'une animation
const requestId = requestAnimationFrame(maFonction);
cancelAnimationFrame(requestId);
```

### performance.now()

`performance.now()` fournit un timestamp haute résolution (en millisecondes) depuis le début du chargement de la page, avec une précision qui peut aller jusqu'à la microseconde.

```javascript
// Mesure précise du temps d'exécution
const debut = performance.now();

// Opération à mesurer
for (let i = 0; i < 1000000; i++) {
  // Travail intensif
}

const fin = performance.now();
console.log(`L'opération a pris ${fin - debut} millisecondes`);

// Utilisation avec requestAnimationFrame pour des animations fluides
let dernierTimestamp = 0;

function animer(timestamp) {
  if (!dernierTimestamp) {
    dernierTimestamp = timestamp;
    requestAnimationFrame(animer);
    return;
  }

  const deltaTemps = timestamp - dernierTimestamp;
  dernierTimestamp = timestamp;

  // Mise à jour basée sur le temps réel écoulé
  const deplacement = (vitesse * deltaTemps) / 1000;

  // Suite de l'animation
  requestAnimationFrame(animer);
}
```

## Techniques de contrôle

### Debounce

Le "debounce" est une technique qui empêche une fonction d'être appelée plusieurs fois en succession rapide. La fonction n'est exécutée qu'après une période d'inactivité spécifiée.

Cas d'utilisation typiques:

- Recherche en temps réel lors de la saisie
- Redimensionnement de fenêtre
- Scroll infini
- Soumission de formulaire

```javascript
/**
 * Fonction de debounce
 * @param {Function} fonction - La fonction à exécuter
 * @param {number} delai - Délai en millisecondes
 * @returns {Function} La fonction avec debounce
 */
function debounce(fonction, delai) {
  let timer;

  return function (...args) {
    const context = this;

    clearTimeout(timer);
    timer = setTimeout(() => {
      fonction.apply(context, args);
    }, delai);
  };
}

// Exemple d'utilisation
const rechercheInput = document.getElementById("recherche");

const rechercherAvecDebounce = debounce(function (event) {
  console.log("Recherche de:", event.target.value);
  // Appel API ou autre traitement
}, 500);

rechercheInput.addEventListener("input", rechercherAvecDebounce);
```

### Throttle

Le "throttle" est une technique qui limite le nombre de fois qu'une fonction peut être appelée sur une période donnée. Contrairement au debounce, throttle garantit que la fonction sera exécutée exactement une fois pendant l'intervalle spécifié.

Cas d'utilisation typiques:

- Événements de scroll
- Événements de mousemove
- Jeux (contrôles utilisateur)
- Animations complexes

```javascript
/**
 * Fonction de throttle
 * @param {Function} fonction - La fonction à exécuter
 * @param {number} limite - Intervalle minimum en millisecondes
 * @returns {Function} La fonction avec throttle
 */
function throttle(fonction, limite) {
  let attente = false;

  return function (...args) {
    const context = this;

    if (!attente) {
      fonction.apply(context, args);
      attente = true;

      setTimeout(() => {
        attente = false;
      }, limite);
    }
  };
}

// Exemple d'utilisation
const conteneur = document.getElementById("conteneur");

const gererScrollAvecThrottle = throttle(function (event) {
  console.log("Position de scroll:", window.scrollY);
  // Logique de chargement ou d'animation
}, 200);

window.addEventListener("scroll", gererScrollAvecThrottle);
```

## Timers en environnement spécifique

### Node.js

Node.js utilise les mêmes fonctions de base (`setTimeout`, `setInterval`), mais avec quelques différences et ajouts:

```javascript
// Timers immédiats en Node.js
setImmediate(() => {
  console.log(
    "Exécuté immédiatement après la fin du cycle d'événements actuel"
  );
});

// Différence avec process.nextTick qui s'exécute encore plus tôt
process.nextTick(() => {
  console.log("S'exécute avant setImmediate, à la fin de l'opération en cours");
});

// Timers avec références non maintenues
const timer = setTimeout(() => {
  console.log(
    "Cette fonction peut ne pas s'exécuter si le programme se termine avant"
  );
}, 5000);

// Pour éviter que Node ne reste en vie juste pour ce timer
timer.unref();

// Pour rétablir la référence
timer.ref();
```

### Web Workers

Les Web Workers permettent d'exécuter des scripts dans des threads en arrière-plan, avec leurs propres timers indépendants du thread principal:

```javascript
// Dans le thread principal
const worker = new Worker("worker.js");

worker.postMessage("démarrer");

worker.onmessage = function (event) {
  console.log("Message reçu du worker:", event.data);
};

// Dans worker.js
let compteur = 0;
let intervalId;

self.onmessage = function (event) {
  if (event.data === "démarrer") {
    intervalId = setInterval(() => {
      compteur++;
      self.postMessage(`Compteur: ${compteur}`);

      if (compteur >= 10) {
        clearInterval(intervalId);
        self.postMessage("Terminé");
      }
    }, 1000);
  }
};
```

## Gestion des erreurs et des fuites de mémoire

Les timers peuvent causer des fuites de mémoire si ils ne sont pas correctement nettoyés, particulièrement dans les composants à durée de vie limitée:

```javascript
// Exemple de risque de fuite de mémoire
function setupComponent() {
  const largeData = new Array(1000000).fill("donnée");

  // Problème: le timer maintient une référence à largeData
  // même si setupComponent n'est plus utilisé
  setInterval(() => {
    console.log(largeData.length);
  }, 1000);
}

// Solution: stocker et nettoyer l'identifiant du timer
function setupComponentCorrect() {
  const largeData = new Array(1000000).fill("donnée");
  const intervalId = setInterval(() => {
    console.log(largeData.length);
  }, 1000);

  // Retourner une fonction de nettoyage
  return function cleanup() {
    clearInterval(intervalId);
  };
}

const cleanup = setupComponentCorrect();
// Plus tard, quand le composant n'est plus nécessaire
cleanup();
```

Pour les frameworks comme React:

```jsx
// Dans un composant React
useEffect(() => {
  const intervalId = setInterval(() => {
    // Logique périodique
  }, 1000);

  // Fonction de nettoyage appelée lors du démontage du composant
  return () => {
    clearInterval(intervalId);
  };
}, []);
```

## Patterns d'implémentation

### Récursion de setTimeout

Utiliser `setTimeout` de façon récursive plutôt que `setInterval` peut offrir plus de flexibilité:

```javascript
function executeRecursive(callback, delay) {
  let active = true;

  function recursiveTimeout() {
    callback();

    // Planifier la prochaine exécution uniquement si toujours actif
    if (active) {
      setTimeout(recursiveTimeout, delay);
    }
  }

  // Démarrer la première exécution
  setTimeout(recursiveTimeout, delay);

  // Retourner une fonction d'arrêt
  return function stop() {
    active = false;
  };
}

// Utilisation
const stop = executeRecursive(() => {
  console.log("Exécution à", new Date().toLocaleTimeString());
}, 1000);

// Plus tard
stop(); // Arrête les exécutions
```

Avantages par rapport à `setInterval`:

- Évite les exécutions simultanées si le callback prend plus de temps que l'intervalle
- Permet de modifier le délai dynamiquement entre chaque exécution
- Donne plus de contrôle sur le flux d'exécution

### Timers auto-ajustables

Ce pattern ajuste dynamiquement l'intervalle d'un timer pour maintenir une fréquence constante:

```javascript
function createPreciseInterval(callback, targetInterval) {
  let expected = Date.now() + targetInterval;
  let timeout;

  function step() {
    const now = Date.now();
    const drift = now - expected;

    // Exécuter le callback
    callback();

    // Recalculer le prochain moment d'exécution prévu
    expected += targetInterval;

    // Ajuster le délai pour compenser la dérive
    const nextDelay = Math.max(0, targetInterval - drift);

    timeout = setTimeout(step, nextDelay);
  }

  // Démarrer le timer
  timeout = setTimeout(step, targetInterval);

  // Fonction d'arrêt
  return function stop() {
    clearTimeout(timeout);
  };
}

// Utilisation pour un timer à 100ms
const stop = createPreciseInterval(() => {
  console.log("Tick précis à", Date.now());
}, 100);

// Arrêt après 5 secondes
setTimeout(() => {
  stop();
  console.log("Timer arrêté");
}, 5000);
```

## Bonnes pratiques

1. **Toujours stocker les identifiants de timers** et les nettoyer lorsqu'ils ne sont plus nécessaires.

2. **Éviter les timers courts** (< 16ms) pour des opérations répétitives ; utiliser `requestAnimationFrame` à la place.

3. **Utiliser des stratégies de contrôle** comme debounce ou throttle pour les événements fréquents.

4. **Attention aux références** maintenues par les closures dans les callbacks de timers.

5. **Préférer `setTimeout` récursif** à `setInterval` pour les opérations dont la durée peut varier.

6. **Utiliser `requestAnimationFrame`** pour toutes les animations visuelles.

7. **Éviter les opérations intensives** dans les callbacks de timers, qui pourraient bloquer le thread principal.

8. **Considérer l'utilisation de Web Workers** pour les opérations longues ou complexes.

9. **Adapter le comportement des timers** en fonction de la visibilité de la page.

10. **Mesurer précisément les performances** avec `performance.now()` plutôt que `Date.now()`.

## Compatibilité des navigateurs

| Fonction                  | Chrome | Firefox | Safari | Edge | IE   |
| ------------------------- | ------ | ------- | ------ | ---- | ---- |
| setTimeout/clearTimeout   | 1.0    | 1.0     | 1.0    | 12   | 4.0  |
| setInterval/clearInterval | 1.0    | 1.0     | 1.0    | 12   | 4.0  |
| requestAnimationFrame     | 10.0   | 4.0     | 6.0    | 12   | 10.0 |
| performance.now()         | 20.0   | 15.0    | 8.0    | 12   | 10.0 |

Pour les navigateurs plus anciens, des polyfills sont disponibles pour `requestAnimationFrame` et `performance.now()`.

## Exemples d'applications pratiques

### Création d'un compte à rebours

```javascript
function createCountdown(durationInSeconds, onTick, onComplete) {
  let remainingSeconds = durationInSeconds;

  const intervalId = setInterval(() => {
    remainingSeconds--;

    // Appeler le callback de mise à jour
    onTick(remainingSeconds);

    // Vérifier si le compte à rebours est terminé
    if (remainingSeconds <= 0) {
      clearInterval(intervalId);
      onComplete();
    }
  }, 1000);

  // Retourner des méthodes de contrôle
  return {
    pause() {
      clearInterval(intervalId);
    },
    getRemainingTime() {
      return remainingSeconds;
    },
  };
}

// Utilisation
const countdown = createCountdown(
  60, // 60 secondes
  (seconds) => {
    document.getElementById("timer").textContent = seconds;
  },
  () => {
    document.getElementById("timer").textContent = "Terminé!";
  }
);

// Interface de contrôle
document.getElementById("pauseButton").addEventListener("click", () => {
  countdown.pause();
});
```

### Animation fluide

```javascript
function animateElement(element, duration, startProps, endProps) {
  const startTime = performance.now();

  function update(currentTime) {
    // Calculer la progression (0 à 1)
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    // Fonction d'atténuation (easing)
    const easedProgress = easeInOutCubic(progress);

    // Mettre à jour chaque propriété
    for (const prop in startProps) {
      if (Object.hasOwnProperty.call(startProps, prop)) {
        const start = startProps[prop];
        const end = endProps[prop];
        const current = start + (end - start) * easedProgress;

        // Appliquer la valeur (peut nécessiter des unités selon la propriété)
        element.style[prop] = `${current}px`;
      }
    }

    // Continuer l'animation si non terminée
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  // Fonction d'atténuation cubique
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Démarrer l'animation
  requestAnimationFrame(update);
}

// Utilisation
const element = document.getElementById("animated");

animateElement(
  element,
  1000, // durée en ms
  { left: 0, top: 0 },
  { left: 300, top: 200 }
);
```

### Système de polling intelligent

```javascript
function createIntelligentPoller(fetchFunction, config) {
  const {
    initialInterval = 1000,
    maxInterval = 30000,
    backoffFactor = 1.5,
    resetOnSuccess = true,
    onData,
    onError,
  } = config;

  let currentInterval = initialInterval;
  let timeoutId = null;
  let active = false;

  async function poll() {
    if (!active) return;

    try {
      const data = await fetchFunction();

      // Traiter les données
      onData(data);

      // Réinitialiser l'intervalle en cas de succès si configuré
      if (resetOnSuccess) {
        currentInterval = initialInterval;
      }
    } catch (error) {
      // Gérer l'erreur
      if (onError) {
        onError(error);
      }

      // Augmenter l'intervalle (backoff)
      currentInterval = Math.min(currentInterval * backoffFactor, maxInterval);
    }

    // Planifier la prochaine requête
    timeoutId = setTimeout(poll, currentInterval);
  }

  return {
    start() {
      if (!active) {
        active = true;
        poll();
      }
    },
    stop() {
      active = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
    getCurrentInterval() {
      return currentInterval;
    },
    resetInterval() {
      currentInterval = initialInterval;
    },
  };
}

// Utilisation
const poller = createIntelligentPoller(
  async () => {
    const response = await fetch("/api/status");
    if (!response.ok) throw new Error("Échec de la requête");
    return response.json();
  },
  {
    initialInterval: 2000,
    maxInterval: 60000,
    onData: (data) => {
      console.log("Nouvelles données:", data);
      updateUI(data);
    },
    onError: (error) => {
      console.error("Erreur de polling:", error);
      showErrorNotification();
    },
  }
);

// Démarrer le polling
poller.start();

// Arrêter en cas de changement de page
window.addEventListener("beforeunload", () => {
  poller.stop();
});
```

## Ressources supplémentaires

- [Documentation MDN sur setTimeout](https://developer.mozilla.org/fr/docs/Web/API/setTimeout)
- [Documentation MDN sur setInterval](https://developer.mozilla.org/fr/docs/Web/API/setInterval)
- [Documentation MDN sur requestAnimationFrame](https://developer.mozilla.org/fr/docs/Web/API/window/requestAnimationFrame)
- [Google Developers: Optimisation des timers et animations](https://developers.google.com/web/fundamentals/performance/rendering)
- [JavaScript Timers: Everything you need to know](https://www.javascripttutorial.net/javascript-bom/javascript-timers/)
- [Understanding JavaScript Timers](https://www.digitalocean.com/community/tutorials/js-understanding-timers-in-javascript)
- [David Walsh Blog: Debounce and Throttle Functions](https://davidwalsh.name/javascript-debounce-function)

---

Ce README a été créé pour fournir une vue d'ensemble complète des timers en JavaScript. N'hésitez pas à contribuer ou à suggérer des améliorations !
