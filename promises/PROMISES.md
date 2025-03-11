# Les Promises en JavaScript

## Table des matières

- [Introduction](#introduction)
- [Concepts fondamentaux](#concepts-fondamentaux)
  - [États d'une Promise](#états-dune-promise)
  - [Création de Promises](#création-de-promises)
  - [Consommation de Promises](#consommation-de-promises)
- [Chaînage de Promises](#chaînage-de-promises)
  - [Principe de base](#principe-de-base)
  - [Retour de valeurs](#retour-de-valeurs)
  - [Propagation d'erreurs](#propagation-derreurs)
- [Gestion des erreurs](#gestion-des-erreurs)
  - [Méthode catch](#méthode-catch)
  - [finally](#finally)
  - [Bonnes pratiques de gestion d'erreurs](#bonnes-pratiques-de-gestion-derreurs)
- [Méthodes statiques](#méthodes-statiques)
  - [Promise.all](#promiseall)
  - [Promise.allSettled](#promiseallsettled)
  - [Promise.race](#promiserace)
  - [Promise.any](#promiseany)
  - [Promise.resolve et Promise.reject](#promiseresolve-et-promisereject)
- [Promisification](#promisification)
  - [Conversion de fonctions basées sur des callbacks](#conversion-de-fonctions-basées-sur-des-callbacks)
  - [Création d'API basées sur des Promises](#création-dapi-basées-sur-des-promises)
- [Patterns avancés](#patterns-avancés)
  - [Exécution séquentielle](#exécution-séquentielle)
  - [Exécution parallèle avec limitation](#exécution-parallèle-avec-limitation)
  - [Délais d'attente (Timeouts)](#délais-dattente-timeouts)
  - [Retentatives (Retries)](#retentatives-retries)
  - [Annulation de Promises](#annulation-de-promises)
- [Promises et Async/Await](#promises-et-asyncawait)
  - [Bases d'Async/Await](#bases-dasyncawait)
  - [Gestion des erreurs avec Async/Await](#gestion-des-erreurs-avec-asyncawait)
  - [Différences et cas d'utilisation](#différences-et-cas-dutilisation)
- [Performance et optimisation](#performance-et-optimisation)
  - [Microtasks vs Macrotasks](#microtasks-vs-macrotasks)
  - [Débogage des Promises](#débogage-des-promises)
- [Compatibilité et polyfills](#compatibilité-et-polyfills)
- [Bonnes pratiques](#bonnes-pratiques)
- [Ressources supplémentaires](#ressources-supplémentaires)

## Introduction

Les Promises sont un mécanisme fondamental en JavaScript pour gérer les opérations asynchrones. Introduites dans ECMAScript 6 (ES2015), elles offrent une alternative plus élégante et puissante aux callbacks traditionnels pour traiter les opérations qui ne s'exécutent pas immédiatement, comme les requêtes réseau, les opérations de fichiers, ou les calculs longs.

Une Promise représente une valeur qui peut ne pas être disponible immédiatement mais qui le sera à un moment dans le futur, ou qui ne sera jamais disponible (en cas d'erreur). Les Promises permettent d'écrire du code asynchrone d'une manière plus lisible et maintenable, en évitant le "callback hell" et en facilitant la gestion des erreurs.

## Concepts fondamentaux

### États d'une Promise

Une Promise peut se trouver dans l'un des trois états suivants :

1. **Pending (en attente)** : État initial, la Promise n'est ni tenue (fulfilled) ni rompue (rejected).
2. **Fulfilled (tenue)** : L'opération a réussi et la Promise a une valeur résultante.
3. **Rejected (rompue)** : L'opération a échoué et la Promise a une raison d'échec (erreur).

Une Promise est dite "settled" (réglée) lorsqu'elle est soit tenue (fulfilled), soit rompue (rejected).

```javascript
// Représentation conceptuelle des états
const pendingPromise = new Promise((resolve, reject) => {
  // La Promise reste en état "pending" jusqu'à ce que resolve() ou reject() soit appelé
});

const fulfilledPromise = new Promise((resolve, reject) => {
  resolve("Succès"); // Passe à l'état "fulfilled" avec la valeur 'Succès'
});

const rejectedPromise = new Promise((resolve, reject) => {
  reject(new Error("Échec")); // Passe à l'état "rejected" avec l'erreur spécifiée
});
```

### Création de Promises

Pour créer une Promise, on utilise le constructeur `Promise` qui prend une fonction exécuteur avec deux paramètres : `resolve` et `reject`.

```javascript
const maPromise = new Promise((resolve, reject) => {
  // Opération asynchrone
  const succès = true; // Simulation de succès ou d'échec

  if (succès) {
    // Opération réussie
    resolve("Données récupérées avec succès");
  } else {
    // Opération échouée
    reject(new Error("Échec de récupération des données"));
  }
});
```

Exemples concrets :

```javascript
// Promise pour une requête HTTP
function fetchData(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(`Échec de la requête: ${xhr.status}`));
      }
    };

    xhr.onerror = function () {
      reject(new Error("Erreur réseau"));
    };

    xhr.send();
  });
}

// Promise avec setTimeout
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
```

### Consommation de Promises

Pour utiliser une Promise et réagir à son résultat, on utilise les méthodes `.then()` et `.catch()`.

```javascript
maPromise
  .then((resultat) => {
    console.log("Succès:", resultat);
  })
  .catch((erreur) => {
    console.error("Erreur:", erreur);
  });

// Exemple avec notre fonction fetchData
fetchData("https://api.example.com/data")
  .then((data) => {
    console.log("Données reçues:", data);
    return JSON.parse(data); // Traitement des données, retourne une nouvelle valeur
  })
  .then((objetJSON) => {
    console.log("Objet parsé:", objetJSON);
  })
  .catch((erreur) => {
    console.error("Erreur lors de la récupération ou du traitement:", erreur);
  });

// Exemple avec notre fonction delay
delay(2000).then(() => {
  console.log("2 secondes se sont écoulées");
});
```

## Chaînage de Promises

### Principe de base

L'un des avantages majeurs des Promises est la possibilité de les chaîner, ce qui permet d'exécuter des opérations asynchrones séquentiellement et de transmettre des résultats d'une étape à l'autre.

```javascript
fetchData("https://api.example.com/utilisateurs")
  .then((reponse) => {
    return JSON.parse(reponse); // Retourne une valeur (pas une Promise)
  })
  .then((utilisateurs) => {
    const premierUtilisateur = utilisateurs[0];
    return fetchData(
      `https://api.example.com/utilisateurs/${premierUtilisateur.id}/posts`
    ); // Retourne une Promise
  })
  .then((postsReponse) => {
    const posts = JSON.parse(postsReponse);
    console.log("Posts du premier utilisateur:", posts);
  })
  .catch((erreur) => {
    console.error("Une erreur est survenue:", erreur);
  });
```

### Retour de valeurs

Dans une chaîne de Promises, chaque fonction de callback `.then()` peut retourner :

1. Une valeur simple, qui sera automatiquement encapsulée dans une Promise résolue
2. Une nouvelle Promise, qui sera attendue avant de continuer la chaîne

```javascript
// Exemple de chaînage avec différents types de retours
fetch("https://api.example.com/donnees")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Échec de la requête");
    }
    return response.json(); // Retourne une Promise
  })
  .then((data) => {
    console.log("Données JSON:", data);
    return data.id; // Retourne une valeur simple
  })
  .then((id) => {
    console.log("ID extrait:", id);
    return fetch(`https://api.example.com/details/${id}`); // Retourne une Promise
  })
  .then((response) => response.json())
  .then((details) => {
    console.log("Détails:", details);
  })
  .catch((error) => {
    console.error("Erreur:", error);
  });
```

### Propagation d'erreurs

Dans une chaîne de Promises, les erreurs se propagent jusqu'au premier gestionnaire `.catch()` rencontré.

```javascript
fetch("https://api.example.com/ressource-inexistante")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    // Cette fonction ne sera pas exécutée si une erreur a été levée précédemment
    console.log("Données:", data);
  })
  .catch((error) => {
    // Capture toutes les erreurs survenues dans les blocs then précédents
    console.error("Erreur capturée:", error);
  })
  .then(() => {
    // Cette fonction sera exécutée même après un catch
    console.log("Fin de la chaîne, que ce soit en succès ou en échec");
  });
```

## Gestion des erreurs

### Méthode catch

La méthode `.catch()` est un raccourci pour `.then(null, errorHandler)` et permet de gérer les erreurs dans une chaîne de Promises.

```javascript
maPromise
  .then((resultat) => {
    // Traitement du succès
  })
  .catch((erreur) => {
    // Gestion de l'erreur
    console.error("Une erreur est survenue:", erreur);

    // Options après avoir capturé une erreur :

    // 1. Propagation de l'erreur
    throw erreur; // L'erreur continue à se propager dans la chaîne

    // 2. Récupération après erreur
    return valeurDeSecours; // La chaîne continue normalement avec cette valeur

    // 3. Transformation de l'erreur
    throw new Error(`Erreur traitée: ${erreur.message}`);
  });
```

### finally

La méthode `.finally()` permet d'exécuter du code quelle que soit l'issue de la Promise (réussite ou échec).

```javascript
fetch("https://api.example.com/donnees")
  .then((response) => response.json())
  .then((data) => {
    console.log("Données:", data);
  })
  .catch((error) => {
    console.error("Erreur:", error);
  })
  .finally(() => {
    // Ce code s'exécute toujours, que la Promise soit résolue ou rejetée
    console.log("Requête terminée");
    // Idéal pour nettoyer des ressources, masquer des indicateurs de chargement, etc.
    document.getElementById("loading").style.display = "none";
  });
```

### Bonnes pratiques de gestion d'erreurs

```javascript
// Gestion d'erreurs détaillée avec récupération
fetchData("/api/utilisateurs")
  .then((response) => {
    if (!response.ok) {
      // Utilisation d'un objet Error avec des informations supplémentaires
      const error = new Error(`Erreur HTTP: ${response.status}`);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }
    return response.json();
  })
  .then((data) => {
    console.log("Données utilisateurs:", data);
  })
  .catch((error) => {
    console.error("Erreur lors de la récupération des utilisateurs:", error);

    // Analyse de l'erreur pour une récupération adaptée
    if (error.status === 404) {
      console.log("Ressource non trouvée, affichage des données en cache");
      return getCachedUsers(); // Récupération depuis le cache
    } else if (error.status >= 500) {
      console.log("Erreur serveur, nouvelle tentative dans 5 secondes");
      return new Promise((resolve) => {
        setTimeout(() => resolve(fetchData("/api/utilisateurs")), 5000);
      });
    } else {
      // Erreurs non gérées
      console.log("Affichage d'un message d'erreur à l'utilisateur");
      showErrorMessage(error.message);
      throw error; // Propagation pour traitement ailleurs si nécessaire
    }
  })
  .then((users) => {
    // Traitement des utilisateurs (soit obtenus normalement, soit récupérés)
    if (users) {
      displayUsers(users);
    }
  });
```

## Méthodes statiques

### Promise.all

`Promise.all()` exécute plusieurs Promises en parallèle et attend que toutes soient résolues.

```javascript
const promises = [
  fetch("/api/utilisateurs").then((response) => response.json()),
  fetch("/api/produits").then((response) => response.json()),
  fetch("/api/commandes").then((response) => response.json()),
];

Promise.all(promises)
  .then(([utilisateurs, produits, commandes]) => {
    console.log("Toutes les données ont été récupérées");
    console.log("Utilisateurs:", utilisateurs);
    console.log("Produits:", produits);
    console.log("Commandes:", commandes);
  })
  .catch((erreur) => {
    // Si une seule Promise échoue, toutes échouent
    console.error("Une erreur est survenue dans au moins une requête:", erreur);
  });
```

### Promise.allSettled

`Promise.allSettled()` (ajouté en ES2020) attend que toutes les Promises soient réglées (terminées), qu'elles soient résolues ou rejetées.

```javascript
const promises = [
  fetch("/api/utilisateurs").then((response) => response.json()),
  fetch("/api/produits-inexistants").then((response) => response.json()), // Pourrait échouer
  fetch("/api/commandes").then((response) => response.json()),
];

Promise.allSettled(promises).then((resultats) => {
  resultats.forEach((resultat, index) => {
    if (resultat.status === "fulfilled") {
      console.log(`Requête ${index + 1} réussie:`, resultat.value);
    } else {
      console.log(`Requête ${index + 1} échouée:`, resultat.reason);
    }
  });

  // Filtrer uniquement les résultats réussis
  const donneesReussies = resultats
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);

  console.log("Données récupérées avec succès:", donneesReussies);
});
```

### Promise.race

`Promise.race()` renvoie la première Promise qui se règle (résolue ou rejetée).

```javascript
// Exemple avec timeout
function fetchWithTimeout(url, timeout) {
  const fetchPromise = fetch(url).then(response => response.json());
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Délai d'attente dépassé')), timeout);
  });

  return Promise.race([fetchPromise, timeoutPromise]);
}

fetchWithTimeout('https://api.example.com/donnees', 5000)
  .then(data => {
    console.log('Données reçues:', data);
  })
  .catch(error => {
    console.error('Erreur:', error);
  });

// Autre exemple: première source de données disponible
const sources = [
  'https://api1.example.com/donnees',
  'https://api2.example.com/donnees',
  'https://api3.example.com/donnees'
];

const promisesSources = sources.map(url => fetch(url).then(res => res.json()));

Promise.race(promisesSources)
  .then(data => {
    console.log('Première source disponible:', data);
  })
  .catch(error => {
    console.error('Toutes les sources ont échoué:', error);
  });
```

### Promise.any

`Promise.any()` (ajouté en ES2021) renvoie la première Promise qui est résolue avec succès. Si toutes échouent, elle renvoie une erreur de type `AggregateError`.

```javascript
const sources = [
  fetch("https://api1.example.com/donnees").then((res) => res.json()),
  fetch("https://api2.example.com/donnees").then((res) => res.json()),
  fetch("https://api3.example.com/donnees").then((res) => res.json()),
];

Promise.any(sources)
  .then((premieresDonnees) => {
    console.log("Premières données disponibles:", premieresDonnees);
  })
  .catch((error) => {
    // AggregateError contient un tableau 'errors' avec toutes les erreurs
    console.error("Toutes les sources ont échoué:", error);
    console.error("Erreurs spécifiques:", error.errors);
  });
```

### Promise.resolve et Promise.reject

Ces méthodes permettent de créer des Promises déjà résolues ou rejetées.

```javascript
// Promise déjà résolue
const promiseResolue = Promise.resolve("Données");
promiseResolue.then((data) => console.log(data)); // Affiche 'Données' immédiatement

// Promise déjà rejetée
const promiseRejetee = Promise.reject(new Error("Échec"));
promiseRejetee.catch((err) => console.error(err)); // Capture l'erreur immédiatement

// Utilisations pratiques
function getUtilisateur(id) {
  // Vérification de cache
  const utilisateurCache = cache.get(`utilisateur:${id}`);
  if (utilisateurCache) {
    return Promise.resolve(utilisateurCache); // Retourne immédiatement sans appel réseau
  }

  // Vérification de paramètre
  if (!id || isNaN(id)) {
    return Promise.reject(new Error("ID d'utilisateur invalide"));
  }

  // Sinon, effectuer la requête normale
  return fetch(`/api/utilisateurs/${id}`).then((res) => res.json());
}
```

## Promisification

### Conversion de fonctions basées sur des callbacks

La "promisification" consiste à convertir des fonctions basées sur des callbacks en fonctions retournant des Promises.

```javascript
// Fonction traditionnelle avec callback
function readFile(path, callback) {
  fs.readFile(path, "utf8", (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
}

// Fonction promisifiée
function readFilePromise(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Fonction utilitaire de promisification
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };
}

// Utilisation de l'utilitaire
const readFileAsync = promisify(fs.readFile);
readFileAsync("fichier.txt", "utf8")
  .then((contenu) => console.log(contenu))
  .catch((err) => console.error(err));
```

### Création d'API basées sur des Promises

```javascript
// Classe API avec méthodes retournant des Promises
class API {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  get(endpoint) {
    return fetch(`${this.baseURL}/${endpoint}`).then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return response.json();
    });
  }

  post(endpoint, data) {
    return fetch(`${this.baseURL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return response.json();
    });
  }

  delete(endpoint) {
    return fetch(`${this.baseURL}/${endpoint}`, {
      method: "DELETE",
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return response.ok;
    });
  }
}

// Utilisation
const api = new API("https://api.example.com");

api
  .get("users")
  .then((users) => console.log("Utilisateurs:", users))
  .catch((error) => console.error("Erreur:", error));

api
  .post("users", { name: "Nouveau", email: "nouveau@example.com" })
  .then((newUser) => console.log("Utilisateur créé:", newUser))
  .catch((error) => console.error("Erreur:", error));
```

## Patterns avancés

### Exécution séquentielle

Exécuter des Promises en séquence, l'une après l'autre.

```javascript
// Exécution séquentielle de Promises
function executerEnSequence(fonctionsPromises) {
  return fonctionsPromises.reduce((promessePrecedente, fonctionPromise) => {
    return promessePrecedente.then((resultats) => {
      return fonctionPromise().then((resultat) => {
        return [...resultats, resultat];
      });
    });
  }, Promise.resolve([]));
}

// Exemple d'utilisation
const ids = [1, 2, 3, 4, 5];
const fonctionsPromises = ids.map((id) => {
  return () => {
    console.log(`Récupération de l'utilisateur ${id}...`);
    return fetch(`/api/utilisateurs/${id}`).then((response) => response.json());
  };
});

executerEnSequence(fonctionsPromises)
  .then((resultats) => {
    console.log("Tous les utilisateurs récupérés en séquence:", resultats);
  })
  .catch((erreur) => {
    console.error("Erreur lors de la récupération séquentielle:", erreur);
  });
```

### Exécution parallèle avec limitation

Exécuter plusieurs Promises en parallèle, mais avec un nombre maximum de Promises simultanées.

```javascript
function executerAvecLimite(fonctionsPromises, limite) {
  const resultats = [];
  let index = 0;
  let actives = 0;

  return new Promise((resolve, reject) => {
    // Fonction récursive pour exécuter les promises
    function lancer() {
      // S'il reste des promises à exécuter et qu'on n'a pas dépassé la limite
      while (index < fonctionsPromises.length && actives < limite) {
        const indexCourant = index++;
        actives++;

        // Exécution de la promise
        fonctionsPromises[indexCourant]()
          .then((resultat) => {
            resultats[indexCourant] = resultat;
            actives--;

            // Vérification si toutes les promises sont terminées
            if (actives === 0 && index === fonctionsPromises.length) {
              resolve(resultats);
            } else {
              // Sinon, lancer la prochaine
              lancer();
            }
          })
          .catch((erreur) => {
            reject(erreur);
          });
      }
    }

    // Lancement initial
    lancer();

    // Gestion du cas où il n'y a pas de promises
    if (fonctionsPromises.length === 0) {
      resolve([]);
    }
  });
}

// Exemple d'utilisation
const urls = [
  "/api/donnees/1",
  "/api/donnees/2",
  "/api/donnees/3",
  "/api/donnees/4",
  "/api/donnees/5",
  "/api/donnees/6",
  "/api/donnees/7",
  "/api/donnees/8",
  "/api/donnees/9",
  "/api/donnees/10",
];

const fonctionsPromises = urls.map((url) => {
  return () => {
    console.log(`Récupération de ${url}...`);
    return fetch(url).then((response) => response.json());
  };
});

// Exécution avec un maximum de 3 requêtes simultanées
executerAvecLimite(fonctionsPromises, 3)
  .then((resultats) => {
    console.log("Toutes les données récupérées avec limitation:", resultats);
  })
  .catch((erreur) => {
    console.error("Erreur lors de la récupération:", erreur);
  });
```

### Délais d'attente (Timeouts)

Ajouter un délai d'attente à une Promise.

```javascript
function avecTimeout(promise, dureeMs) {
  const timeoutPromise = new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Délai d'attente dépassé (${dureeMs}ms)`));
    }, dureeMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

// Exemple d'utilisation
const requeteAvecTimeout = avecTimeout(
  fetch("https://api.example.com/donnees-lentes").then((response) =>
    response.json()
  ),
  5000 // 5 secondes
);

requeteAvecTimeout
  .then((donnees) => {
    console.log("Données reçues à temps:", donnees);
  })
  .catch((erreur) => {
    console.error("Erreur ou timeout:", erreur.message);
  });
```

### Retentatives (Retries)

Réessayer une opération en cas d'échec.

```javascript
function avecRetentatives(fonctionPromise, options = {}) {
  const {
    retentatives = 3,
    delaiInitial = 1000,
    facteurBackoff = 2,
    validerReponse = () => true,
    onRetry = null,
  } = options;

  return new Promise((resolve, reject) => {
    let tentatives = 0;

    function essayer() {
      fonctionPromise()
        .then((resultat) => {
          if (validerReponse(resultat)) {
            resolve(resultat);
          } else {
            throw new Error("Validation de la réponse échouée");
          }
        })
        .catch((erreur) => {
          tentatives++;
          if (tentatives >= retentatives) {
            return reject(
              new Error(
                `Nombre maximal de tentatives atteint: ${erreur.message}`
              )
            );
          }

          const delai = delaiInitial * Math.pow(facteurBackoff, tentatives - 1);

          if (onRetry) {
            onRetry(erreur, tentatives, delai);
          }

          setTimeout(essayer, delai);
        });
    }

    // Première tentative
    essayer();
  });
}

// Exemple d'utilisation
function fetchData(url) {
  return () =>
    fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return response.json();
    });
}

avecRetentatives(fetchData("https://api.example.com/donnees-instables"), {
  retentatives: 5,
  delaiInitial: 500,
  facteurBackoff: 1.5,
  onRetry: (erreur, tentative, delai) => {
    console.log(
      `Tentative ${tentative} a échoué: ${erreur.message}. Nouvelle tentative dans ${delai}ms`
    );
  },
})
  .then((donnees) => {
    console.log("Données récupérées après retentatives:", donnees);
  })
  .catch((erreur) => {
    console.error("Échec final après retentatives:", erreur);
  });
```

### Annulation de Promises

Les Promises standard ne peuvent pas être annulées, mais on peut implémenter un mécanisme d'annulation.

```javascript
// Implémentation avec l'API AbortController (moderne)
function fetchAvecAnnulation(url) {
  const controller = new AbortController();
  const signal = controller.signal;

  const promise = fetch(url, { signal }).then((response) => {
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return response.json();
  });

  return {
    promise,
    annuler: () => controller.abort(),
  };
}

// Utilisation
const { promise, annuler } = fetchAvecAnnulation(
  "https://api.example.com/donnees"
);

promise
  .then((data) => {
    console.log("Données reçues:", data);
  })
  .catch((error) => {
    if (error.name === "AbortError") {
      console.log("Requête annulée par l'utilisateur");
    } else {
      console.error("Erreur:", error);
    }
  });

// Annulation après 2 secondes
setTimeout(() => {
  annuler();
  console.log("Requête annulée");
}, 2000);
```

## Promises et Async/Await

### Bases d'Async/Await

`async/await` est une syntaxe plus moderne (introduite en ES2017) qui simplifie l'utilisation des Promises.

```javascript
// Fonction asynchrone de base
async function fetchUtilisateur(id) {
  try {
    const response = await fetch(`/api/utilisateurs/${id}`);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const utilisateur = await response.json();
    return utilisateur;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    throw error;
  }
}

// Utilisation
async function afficherUtilisateur(id) {
  try {
    const utilisateur = await fetchUtilisateur(id);
    console.log("Utilisateur récupéré:", utilisateur);

    // Chaînage d'opérations asynchrones
    const posts = await fetch(`/api/utilisateurs/${utilisateur.id}/posts`).then(
      (res) => res.json()
    );
    console.log("Posts de l'utilisateur:", posts);
  } catch (error) {
    console.error("Impossible d'afficher les données de l'utilisateur:", error);
  }
}

// Appel de la fonction
afficherUtilisateur(1);
```

### Gestion des erreurs avec Async/Await

```javascript
async function processData() {
  try {
    // Plusieurs opérations asynchrones
    const response = await fetch("/api/data");

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Traitement conditionnel des données
    if (data.requiresAdditionalProcessing) {
      try {
        // Bloc try/catch imbriqué pour gestion d'erreur spécifique
        const additionalData = await fetch(`/api/additional/${data.id}`);
        const processedData = await additionalData.json();
        return { ...data, additionalInfo: processedData };
      } catch (additionalError) {
        // Gestion spécifique pour cette étape
        console.warn(
          "Impossible de récupérer les données additionnelles:",
          additionalError
        );
        // Continuer avec les données principales uniquement
        return { ...data, additionalInfo: null };
      }
    }

    return data;
  } catch (error) {
    // Gestion des erreurs principales
    console.error("Erreur lors du traitement des données:", error);
    throw error;
  } finally {
    // Nettoyage, s'exécute toujours
    console.log("Processus terminé");
  }
}
```

### Différences et cas d'utilisation

**Style avec Promises classiques :**

```javascript
function getUsageStats(userId) {
  return fetch(`/api/users/${userId}`)
    .then((response) => response.json())
    .then((user) => {
      return Promise.all([
        fetch(`/api/stats/logins/${userId}`).then((res) => res.json()),
        fetch(`/api/stats/purchases/${userId}`).then((res) => res.json()),
      ]);
    })
    .then(([loginStats, purchaseStats]) => {
      return {
        user: userId,
        logins: loginStats.count,
        purchases: purchaseStats.total,
      };
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    });
}
```

**Même fonction avec async/await :**

```javascript
async function getUsageStats(userId) {
  try {
    const user = await fetch(`/api/users/${userId}`).then((response) =>
      response.json()
    );

    const [loginStats, purchaseStats] = await Promise.all([
      fetch(`/api/stats/logins/${userId}`).then((res) => res.json()),
      fetch(`/api/stats/purchases/${userId}`).then((res) => res.json()),
    ]);

    return {
      user: userId,
      logins: loginStats.count,
      purchases: purchaseStats.total,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw error;
  }
}
```

**Cas d'utilisation optimaux :**

- **Promises classiques** :

  - Opérations en chaîne plus simples
  - Transformation de données en flux
  - Compatibilité avec du code plus ancien
  - Quand on crée des utilitaires ou une API

- **Async/Await** :
  - Logique conditionnelle complexe
  - Meilleure lisibilité pour les débutants
  - Débogage plus facile
  - Traitement séquentiel avec logique intercalée

## Performance et optimisation

### Microtasks vs Macrotasks

Les Promises utilisent la file des microtâches en JavaScript, ce qui affecte leur ordre d'exécution.

```javascript
console.log("Début");

// Macrotâche (setTimeout)
setTimeout(() => {
  console.log("Timeout");
}, 0);

// Microtâche (Promise)
Promise.resolve().then(() => {
  console.log("Promise résolue");
});

console.log("Fin");

// Sortie :
// Début
// Fin
// Promise résolue
// Timeout
```

Explication :

1. Le code synchrone s'exécute d'abord: 'Début' puis 'Fin'
2. Les microtâches (Promises) s'exécutent ensuite: 'Promise résolue'
3. Les macrotâches (setTimeout, événements) s'exécutent en dernier: 'Timeout'

### Débogage des Promises

Techniques pour déboguer les Promises :

```javascript
// 1. Ajouter des points de journalisation
fetch("/api/data")
  .then((response) => {
    console.log("Réponse reçue:", response.status);
    return response.json();
  })
  .then((data) => {
    console.log("Données parsées:", data);
    return processData(data);
  })
  .catch((error) => {
    console.error("Erreur capturée:", error);
  });

// 2. Utiliser des breakpoints dans async/await
async function fetchData() {
  try {
    const response = await fetch("/api/data"); // Mettre un breakpoint ici
    const data = await response.json(); // Et ici
    return processData(data);
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// 3. Erreurs non capturées avec unhandledrejection
window.addEventListener("unhandledrejection", (event) => {
  console.warn(
    "Promesse rejetée non gérée:",
    event.promise,
    "Raison:",
    event.reason
  );
  // Empêcher l'affichage de l'erreur dans la console (optionnel)
  event.preventDefault();
});
```

## Compatibilité et polyfills

Les Promises sont nativement prises en charge par tous les navigateurs modernes, mais pour les navigateurs plus anciens, des polyfills sont nécessaires.

```javascript
// Vérifier la prise en charge des Promises
if (typeof Promise === "undefined") {
  // Charger un polyfill
  document.write(
    '<script src="https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js"></script>'
  );
}

// Pour les méthodes plus récentes comme Promise.allSettled ou Promise.any
if (Promise && !Promise.allSettled) {
  Promise.allSettled = function (promises) {
    return Promise.all(
      promises.map((p) =>
        Promise.resolve(p).then(
          (value) => ({ status: "fulfilled", value }),
          (reason) => ({ status: "rejected", reason })
        )
      )
    );
  };
}
```

Bibliothèques de polyfills courantes :

- `promise-polyfill`
- `es6-promise`
- `core-js`

## Bonnes pratiques

1. **Toujours retourner des valeurs** dans les fonctions de callback `.then()` pour maintenir la chaîne de Promises.

2. **Toujours gérer les rejets** avec `.catch()` ou dans un bloc `try/catch` pour les fonctions `async`.

3. **Éviter les Promises imbriquées** - préférer le chaînage ou async/await.

4. **Être attentif à l'exécution parallèle** - utiliser `Promise.all()` lorsque les opérations peuvent s'exécuter en parallèle.

5. **Utiliser les méthodes appropriées** en fonction du cas d'utilisation (`Promise.all`, `Promise.race`, etc.)

6. **Créer des fonctions utilitaires réutilisables** pour les opérations Promise courantes.

7. **Éviter les fuites de mémoire** en gérant correctement les Promises de longue durée.

8. **Signaler clairement les erreurs** avec des objets Error contenant des informations détaillées.

```javascript
// Exemple de fonction bien structurée suivant les bonnes pratiques
async function loadUserDashboard(userId) {
  try {
    // Validation d'entrée
    if (!userId || typeof userId !== "string") {
      throw new Error("ID utilisateur invalide");
    }

    // Opérations parallèles qui ne dépendent pas les unes des autres
    const [user, permissions, recentActivity] = await Promise.all([
      fetchUser(userId),
      fetchUserPermissions(userId),
      fetchUserActivity(userId),
    ]);

    // Opération séquentielle qui dépend des résultats précédents
    let recommendedContent = [];
    if (permissions.canAccessContent) {
      recommendedContent = await fetchRecommendedContent(user.preferences);
    }

    // Traitement et nettoyage des données
    const dashboard = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      permissions: permissions.permissions,
      activity: recentActivity.slice(0, 5),
      recommendations: recommendedContent,
    };

    return dashboard;
  } catch (error) {
    // Enrichissement de l'erreur avec le contexte
    const contextError = new Error(
      `Erreur lors du chargement du tableau de bord pour l'utilisateur ${userId}`
    );
    contextError.originalError = error;
    contextError.userId = userId;

    // Journalisation centralisée
    logError(contextError);

    // Propagation de l'erreur
    throw contextError;
  }
}
```

## Ressources supplémentaires

- [Documentation MDN sur les Promises](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Documentation MDN sur Async/Await](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/async_function)
- [JavaScript.info: Promises, async/await](https://javascript.info/async)
- [You Don't Know JS: Async & Performance](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/async-performance/README.md)
- [Promise Patterns & Anti-Patterns](https://www.datchley.name/promise-patterns-anti-patterns/)
- [Google Developers: JavaScript Promises](https://developers.google.com/web/fundamentals/primers/promises)

---

Ce README a été créé pour fournir une vue d'ensemble complète des Promises en JavaScript. N'hésitez pas à contribuer ou à suggérer des améliorations !
