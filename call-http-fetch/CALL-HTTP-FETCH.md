# Les Appels HTTP avec fetch() en JavaScript

## Table des matières

- [Introduction](#introduction)
- [Utilisation de base](#utilisation-de-base)
  - [Requête GET simple](#requête-get-simple)
  - [Traitement de la réponse](#traitement-de-la-réponse)
  - [Gestion des erreurs](#gestion-des-erreurs)
- [Configuration des requêtes](#configuration-des-requêtes)
  - [Méthodes HTTP](#méthodes-http)
  - [En-têtes (Headers)](#en-têtes-headers)
  - [Corps de la requête](#corps-de-la-requête)
  - [Mode et credentials](#mode-et-credentials)
- [Traitement des réponses](#traitement-des-réponses)
  - [Formats de réponse](#formats-de-réponse)
  - [Vérification du statut](#vérification-du-statut)
  - [Utilisation des headers de réponse](#utilisation-des-headers-de-réponse)
- [Opérations CRUD](#opérations-crud)
  - [Création (POST)](#création-post)
  - [Lecture (GET)](#lecture-get)
  - [Mise à jour (PUT/PATCH)](#mise-à-jour-putpatch)
  - [Suppression (DELETE)](#suppression-delete)
- [Travail avec différents types de données](#travail-avec-différents-types-de-données)
  - [JSON](#json)
  - [FormData](#formdata)
  - [Téléchargement de fichiers](#téléchargement-de-fichiers)
  - [Streams et données binaires](#streams-et-données-binaires)
- [Techniques avancées](#techniques-avancées)
  - [Timeouts](#timeouts)
  - [Annulation de requêtes](#annulation-de-requêtes)
  - [Requêtes parallèles](#requêtes-parallèles)
  - [Requêtes séquentielles](#requêtes-séquentielles)
  - [Retentatives](#retentatives)
- [Gestion d'authentification](#gestion-dauthentification)
  - [Jetons d'authentification](#jetons-dauthentification)
  - [Cookies](#cookies)
  - [Intercepteurs de requêtes](#intercepteurs-de-requêtes)
- [Optimisation des performances](#optimisation-des-performances)
  - [Mise en cache](#mise-en-cache)
  - [Prefetching](#prefetching)
- [Considérations de sécurité](#considérations-de-sécurité)
  - [CORS](#cors)
  - [Protection CSRF](#protection-csrf)
  - [Stockage sécurisé des tokens](#stockage-sécurisé-des-tokens)
- [Patterns et meilleures pratiques](#patterns-et-meilleures-pratiques)
  - [Création d'un client HTTP](#création-dun-client-http)
  - [Gestion centralisée des erreurs](#gestion-centralisée-des-erreurs)
- [Comparaison avec les alternatives](#comparaison-avec-les-alternatives)
  - [fetch vs XMLHttpRequest](#fetch-vs-xmlhttprequest)
  - [fetch vs axios](#fetch-vs-axios)
- [Ressources supplémentaires](#ressources-supplémentaires)

## Introduction

L'API fetch() est une interface moderne pour effectuer des requêtes HTTP en JavaScript. Introduite comme une amélioration des anciennes méthodes comme XMLHttpRequest, fetch() utilise des Promises pour simplifier les opérations asynchrones et offre une API plus puissante et flexible.

Intégrée nativement dans les navigateurs modernes, l'API fetch est désormais le standard pour les communications client-serveur en JavaScript. Elle est également disponible dans Node.js (à partir de la version 18) et peut être utilisée avec des polyfills dans les environnements plus anciens.

Avantages de fetch() :

- Syntaxe plus simple et intuitive
- Basée sur les Promises pour un meilleur contrôle du flux asynchrone
- Support natif de diverses fonctionnalités modernes (CORS, streams, etc.)
- Séparation claire entre la requête et la réponse

## Utilisation de base

### Requête GET simple

La façon la plus simple d'utiliser fetch() est pour une requête GET :

```javascript
fetch("https://api.example.com/data")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Erreur:", error));
```

Par défaut, fetch() :

- Utilise la méthode HTTP GET
- Ne transmet pas de cookies dans les requêtes cross-origin
- Ne rejette pas la Promise en cas d'erreur HTTP (400, 500, etc.)

### Traitement de la réponse

La méthode fetch() renvoie une Promise qui se résout avec un objet Response, même si la requête HTTP a échoué avec une erreur 404 ou 500 :

```javascript
fetch("https://api.example.com/data")
  .then((response) => {
    // Vérifier si la réponse est OK (statut 200-299)
    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }
    return response.json(); // Analyse le corps de la réponse en JSON
  })
  .then((data) => {
    console.log("Données reçues:", data);
  })
  .catch((error) => {
    console.error("Problème avec la requête fetch:", error);
  });
```

### Gestion des erreurs

Il est important de comprendre que fetch() ne rejette la Promise que dans les cas suivants :

- Erreur réseau (connexion perdue, nom de domaine non résolu)
- Requête empêchée par le navigateur (CORS, problème de sécurité)
- Erreur interne à fetch()

Les erreurs HTTP comme 404 ou 500 ne rejettent pas la Promise. Il faut les intercepter manuellement en vérifiant la propriété `response.ok` ou `response.status`.

```javascript
async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      // Création d'une erreur enrichie
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.statusText = response.statusText;
      error.response = response;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);

    // Gestion spécifique selon le type d'erreur
    if (error.status === 404) {
      console.log("Ressource non trouvée");
    } else if (error.status >= 500) {
      console.log("Erreur serveur");
    } else if (error instanceof TypeError) {
      console.log("Erreur réseau probable");
    }

    throw error; // Propagation de l'erreur
  }
}
```

## Configuration des requêtes

### Méthodes HTTP

Pour spécifier une méthode HTTP, utilisez l'option `method` dans l'objet de configuration :

```javascript
// Requête POST
fetch('https://api.example.com/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Nouveau produit',
    price: 29.99
  })
})
.then(response => response.json())
.then(data => console.log('Succès:', data))
.catch(error => console.error('Erreur:', error));

// Autres méthodes courantes
// PUT
fetch('https://api.example.com/items/1', { method: 'PUT', ... });

// DELETE
fetch('https://api.example.com/items/1', { method: 'DELETE' });

// PATCH
fetch('https://api.example.com/items/1', { method: 'PATCH', ... });

// OPTIONS
fetch('https://api.example.com/items', { method: 'OPTIONS' });
```

### En-têtes (Headers)

Les en-têtes HTTP peuvent être définis à l'aide de l'option `headers` :

```javascript
fetch("https://api.example.com/items", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    Accept: "application/json",
    "X-Custom-Header": "CustomValue",
  },
});
```

L'API fetch() fournit également une classe `Headers` pour manipuler les en-têtes de manière plus dynamique :

```javascript
const headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append(
  "Authorization",
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);

// Vérifier, modifier ou supprimer des en-têtes
if (headers.has("Content-Type")) {
  console.log(headers.get("Content-Type"));
  headers.set("Content-Type", "text/plain");
  // headers.delete('Content-Type');
}

fetch("https://api.example.com/items", { headers });
```

### Corps de la requête

L'option `body` permet de définir le contenu de la requête pour les méthodes comme POST, PUT ou PATCH :

```javascript
// Corps de type String
fetch(url, {
  method: "POST",
  body: "texte brut",
});

// Corps de type JSON
fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ key: "value" }),
});

// Corps de type FormData (pour les formulaires)
const formData = new FormData();
formData.append("username", "john");
formData.append("file", fileInput.files[0]);

fetch(url, {
  method: "POST",
  body: formData,
  // Pas besoin de définir Content-Type, il sera automatiquement défini avec le boundary
});

// Corps de type Blob ou File
const blob = new Blob(["contenu du fichier"], { type: "text/plain" });
fetch(url, {
  method: "POST",
  body: blob,
});
```

### Mode et credentials

L'API fetch offre des options supplémentaires pour contrôler le comportement des requêtes cross-origin :

```javascript
fetch(url, {
  // Mode CORS
  mode: "cors", // Par défaut; suit les règles CORS pour les requêtes cross-origin
  // Autres valeurs possibles:
  // mode: 'no-cors', // Mode limité pour les ressources opaques
  // mode: 'same-origin', // Échoue pour les requêtes cross-origin
  // mode: 'navigate', // Utilisé pour les navigations du navigateur

  // Gestion des credentials (cookies, entêtes d'auth, certificats TLS)
  credentials: "same-origin", // Par défaut; envoie les credentials uniquement pour les requêtes same-origin
  // Autres valeurs possibles:
  // credentials: 'include', // Envoie les credentials pour toutes les requêtes, même cross-origin
  // credentials: 'omit', // N'envoie jamais les credentials
});
```

## Traitement des réponses

### Formats de réponse

L'objet Response fournit différentes méthodes pour extraire le corps de la réponse selon le format souhaité :

```javascript
fetch(url).then((response) => {
  // Format JSON
  return response.json(); // Renvoie une Promise
});

fetch(url).then((response) => {
  // Format texte
  return response.text(); // Renvoie une Promise
});

fetch(url).then((response) => {
  // Format blob (pour les images, fichiers, etc.)
  return response.blob(); // Renvoie une Promise
});

fetch(url).then((response) => {
  // Format ArrayBuffer (pour les données binaires)
  return response.arrayBuffer(); // Renvoie une Promise
});

fetch(url).then((response) => {
  // Format FormData
  return response.formData(); // Renvoie une Promise
});
```

Exemple complet pour télécharger et afficher une image :

```javascript
fetch("https://example.com/image.jpg")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
  })
  .then((blob) => {
    const objectURL = URL.createObjectURL(blob);
    const image = document.createElement("img");
    image.src = objectURL;
    document.body.appendChild(image);
  })
  .catch((error) => {
    console.error("Erreur lors du téléchargement de l'image:", error);
  });
```

### Vérification du statut

Pour une gestion complète des réponses HTTP, inspectez les propriétés de l'objet Response :

```javascript
fetch(url).then((response) => {
  console.log("Status:", response.status); // ex: 200, 404, 500
  console.log("Status Text:", response.statusText); // ex: "OK", "Not Found"
  console.log("OK?", response.ok); // true pour statut 200-299
  console.log("Type de réponse:", response.type); // "basic", "cors", "opaque", etc.
  console.log("URL:", response.url); // URL finale (après redirections)

  // Vérification par code
  if (response.status === 404) {
    throw new Error("Ressource non trouvée");
  } else if (response.status >= 500) {
    throw new Error("Erreur serveur");
  } else if (!response.ok) {
    throw new Error(`Erreur HTTP! statut: ${response.status}`);
  }

  return response.json();
});
```

### Utilisation des headers de réponse

Les en-têtes de réponse contiennent souvent des informations importantes :

```javascript
fetch(url).then((response) => {
  // Récupération d'un header spécifique
  const contentType = response.headers.get("Content-Type");
  console.log("Type de contenu:", contentType);

  // Pagination API
  const totalCount = response.headers.get("X-Total-Count");
  const linkHeader = response.headers.get("Link");

  // Itération sur tous les headers
  for (const [key, value] of response.headers.entries()) {
    console.log(`${key}: ${value}`);
  }

  // Vérifier si un header existe
  if (response.headers.has("Cache-Control")) {
    console.log("Directives de cache:", response.headers.get("Cache-Control"));
  }

  return response.json();
});
```

## Opérations CRUD

### Création (POST)

Pour créer une ressource, utilisez la méthode POST :

```javascript
async function createUser(userData) {
  try {
    const response = await fetch("https://api.example.com/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    const newUser = await response.json();
    return newUser;
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    throw error;
  }
}

// Utilisation
createUser({
  name: "John Doe",
  email: "john@example.com",
  role: "user",
})
  .then((user) => console.log("Utilisateur créé:", user))
  .catch((error) => console.error(error));
```

### Lecture (GET)

Pour récupérer des ressources, utilisez la méthode GET :

```javascript
async function getUsers(page = 1, limit = 10) {
  try {
    const response = await fetch(
      `https://api.example.com/users?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    const data = await response.json();

    // Traitement des métadonnées de pagination
    const totalCount = response.headers.get("X-Total-Count");
    const totalPages = Math.ceil(totalCount / limit);

    return {
      users: data,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: parseInt(totalCount || "0"),
        hasNextPage: page < totalPages,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw error;
  }
}

async function getUserById(id) {
  try {
    const response = await fetch(`https://api.example.com/users/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (response.status === 404) {
      return null; // Utilisateur non trouvé
    }

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'utilisateur ${id}:`,
      error
    );
    throw error;
  }
}
```

### Mise à jour (PUT/PATCH)

Pour mettre à jour une ressource, utilisez PUT (remplacement complet) ou PATCH (mise à jour partielle) :

```javascript
async function updateUser(id, userData, method = "PATCH") {
  try {
    const response = await fetch(`https://api.example.com/users/${id}`, {
      method: method, // 'PUT' ou 'PATCH'
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(userData),
    });

    if (response.status === 404) {
      throw new Error(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de l'utilisateur ${id}:`,
      error
    );
    throw error;
  }
}

// Utilisation avec PATCH (mise à jour partielle)
updateUser(123, { email: "nouveau@example.com" }).then((updatedUser) =>
  console.log("Utilisateur mis à jour:", updatedUser)
);

// Utilisation avec PUT (remplacement complet)
updateUser(
  123,
  {
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
  },
  "PUT"
).then((updatedUser) => console.log("Utilisateur remplacé:", updatedUser));
```

### Suppression (DELETE)

Pour supprimer une ressource, utilisez la méthode DELETE :

```javascript
async function deleteUser(id) {
  try {
    const response = await fetch(`https://api.example.com/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (response.status === 404) {
      throw new Error(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    // Certaines APIs renvoient la ressource supprimée, d'autres un message, d'autres rien
    if (response.status !== 204) {
      // 204 No Content
      return await response.json();
    } else {
      return { success: true };
    }
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de l'utilisateur ${id}:`,
      error
    );
    throw error;
  }
}
```

## Travail avec différents types de données

### JSON

JSON est le format le plus couramment utilisé pour les API RESTful :

```javascript
// Envoi de données JSON
async function sendJSONData(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

// Réception de données JSON
async function getJSONData(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur HTTP! statut: ${response.status}`);
  }

  // Vérification du type de contenu
  const contentType = response.headers.get("Content-Type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new TypeError("La réponse n'est pas au format JSON");
  }

  return response.json();
}
```

### FormData

Utilisez `FormData` pour envoyer des données de formulaire, y compris des fichiers :

```javascript
// À partir d'un formulaire existant
const form = document.querySelector("#myForm");
const formData = new FormData(form);

// Ou création manuelle
const formData = new FormData();
formData.append("name", "John Doe");
formData.append("email", "john@example.com");

// Ajout de fichiers
const fileInput = document.querySelector("#fileInput");
formData.append("avatar", fileInput.files[0]);

// Envoi du formulaire
async function submitFormData(url, formData) {
  const response = await fetch(url, {
    method: "POST",
    body: formData,
    // Pas besoin de définir Content-Type, il sera automatiquement défini
  });

  return response.json();
}

// Récupération et modification des données de formulaire
formData.get("name"); // 'John Doe'
formData.set("name", "Jane Doe"); // Modification
formData.has("email"); // true
formData.delete("email"); // Suppression

// Itération sur les entrées
for (const [key, value] of formData.entries()) {
  console.log(`${key}: ${value}`);
}
```

### Téléchargement de fichiers

Pour télécharger des fichiers avec fetch() :

```javascript
// Téléchargement et affichage d'image
async function downloadAndDisplayImage(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);

    const image = document.createElement("img");
    image.src = objectURL;
    document.body.appendChild(image);

    // Important: libérer la mémoire lorsque l'image n'est plus nécessaire
    // image.onload = () => URL.revokeObjectURL(objectURL);

    return objectURL;
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image:", error);
    throw error;
  }
}

// Téléchargement et sauvegarde d'un fichier
async function downloadFile(url, filename) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);

    // Création d'un lien de téléchargement
    const a = document.createElement("a");
    a.href = objectURL;
    a.download = filename || "downloaded_file";
    document.body.appendChild(a);
    a.click();

    // Nettoyage
    document.body.removeChild(a);
    URL.revokeObjectURL(objectURL);
  } catch (error) {
    console.error("Erreur lors du téléchargement du fichier:", error);
    throw error;
  }
}
```

### Streams et données binaires

Pour le traitement de données volumineuses ou en streaming :

```javascript
// Lecture du corps de la réponse comme un stream
async function streamResponseToElement(url, targetElement) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    // Accès au reader du body
    const reader = response.body.getReader();

    // Création d'un décodeur de texte
    const decoder = new TextDecoder();

    // Fonction de lecture récursive
    async function read() {
      const { done, value } = await reader.read();

      if (done) {
        console.log("Stream terminé");
        return;
      }

      // Décode et affiche les morceaux de texte reçus
      const text = decoder.decode(value, { stream: true });
      targetElement.textContent += text;

      // Continue à lire
      return read();
    }

    return read();
  } catch (error) {
    console.error("Erreur lors du streaming de la réponse:", error);
    throw error;
  }
}

// Utilisation
const outputDiv = document.getElementById("output");
streamResponseToElement("https://api.example.com/large-data", outputDiv);
```

## Techniques avancées

### Timeouts

fetch() ne fournit pas d'option de timeout native, mais vous pouvez l'implémenter avec Promise.race() :

```javascript
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Délai d'attente dépassé")), timeout)
    ),
  ]);
}

// Utilisation
fetchWithTimeout("https://api.example.com/data", {}, 3000)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => {
    if (error.message === "Délai d'attente dépassé") {
      console.error("La requête a pris trop de temps");
    } else {
      console.error("Erreur:", error);
    }
  });
```

### Annulation de requêtes

Utilisez l'API AbortController pour annuler des requêtes fetch() en cours :

```javascript
function fetchWithAbort(url, options = {}) {
  const controller = new AbortController();
  const signal = controller.signal;

  const promise = fetch(url, { ...options, signal });

  return {
    promise,
    abort: () => controller.abort(),
  };
}

// Utilisation
const { promise, abort } = fetchWithAbort("https://api.example.com/large-data");

// Traitement de la requête
promise
  .then((response) => response.json())
  .then((data) => console.log("Données reçues:", data))
  .catch((error) => {
    if (error.name === "AbortError") {
      console.log("Requête annulée");
    } else {
      console.error("Erreur:", error);
    }
  });

// Annulation après 2 secondes (par exemple)
setTimeout(() => {
  console.log("Annulation de la requête...");
  abort();
}, 2000);

// Exemple avec un bouton d'annulation
const abortButton = document.getElementById("abortButton");
abortButton.addEventListener("click", () => {
  abort();
  abortButton.disabled = true;
  abortButton.textContent = "Requête annulée";
});
```

### Requêtes parallèles

Pour exécuter plusieurs requêtes en parallèle, utilisez Promise.all() ou Promise.allSettled() :

```javascript
async function fetchMultipleResources(urls) {
  try {
    // Exécute toutes les requêtes en parallèle
    const responses = await Promise.all(urls.map((url) => fetch(url)));

    // Vérifie si toutes les requêtes ont réussi
    const hasFailures = responses.some((response) => !response.ok);
    if (hasFailures) {
      throw new Error("Une ou plusieurs requêtes ont échoué");
    }

    // Traite toutes les réponses comme du JSON
    const data = await Promise.all(
      responses.map((response) => response.json())
    );

    return data;
  } catch (error) {
    console.error("Erreur lors des requêtes parallèles:", error);
    throw error;
  }
}

// Version qui ne rejette pas si certaines requêtes échouent
async function fetchMultipleResourcesWithPartialSuccess(urls) {
  try {
    const results = await Promise.allSettled(
      urls.map((url) =>
        fetch(url).then((response) => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP! statut: ${response.status}`);
          }
          return response.json();
        })
      )
    );

    // Séparer les succès et les échecs
    const successes = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    const failures = results
      .filter((result) => result.status === "rejected")
      .map((result, index) => ({
        url: urls[index],
        error: result.reason,
      }));

    return { successes, failures };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    throw error;
  }
}
```

### Requêtes séquentielles

Pour exécuter des requêtes les unes après les autres :

```javascript
async function fetchSequentially(urls) {
  const results = [];

  for (const url of urls) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }

      const data = await response.json();
      results.push(data);
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${url}:`, error);
      // Vous pouvez choisir de continuer malgré l'erreur, ou de l'arrêter
      // throw error; // Décommentez pour arrêter la séquence en cas d'erreur
      results.push(null); // Ajouter null pour garder l'ordre
    }
  }

  return results;
}

// Exemple plus avancé où chaque requête dépend du résultat de la précédente
async function fetchChain(initialUrl) {
  try {
    // Première requête
    const response1 = await fetch(initialUrl);
    const data1 = await response1.json();

    // Seconde requête basée sur le résultat de la première
    const response2 = await fetch(
      `https://api.example.com/details/${data1.id}`
    );
    const data2 = await response2.json();

    // Troisième requête basée sur le résultat de la seconde
    const response3 = await fetch(
      `https://api.example.com/related/${data2.category}`
    );
    const data3 = await response3.json();

    return {
      initial: data1,
      details: data2,
      related: data3,
    };
  } catch (error) {
    console.error("Erreur dans la chaîne de requêtes:", error);
    throw error;
  }
}
```

### Retentatives

Implémentation d'un mécanisme de retentatives pour les requêtes instables :

```javascript
async function fetchWithRetry(
  url,
  options = {},
  maxRetries = 3,
  retryDelay = 1000
) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Tentative de requête
      const response = await fetch(url, options);

      // Si c'est un succès, retourner la réponse
      if (response.ok) {
        return response;
      }

      // Si c'est une erreur de serveur (5xx), on retente
      if (response.status >= 500) {
        lastError = new Error(`Erreur serveur: ${response.status}`);
        // Continue à la prochaine itération après le délai
      } else {
        // Pour les autres erreurs HTTP (4xx), on ne retente pas
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      lastError = error;

      // Ne pas réessayer pour certains types d'erreurs
      if (
        error.name === "AbortError" ||
        (error.message && !error.message.includes("Erreur serveur"))
      ) {
        throw error;
      }

      // Si ce n'est pas la dernière tentative, attendre avant de réessayer
      if (attempt < maxRetries - 1) {
        console.log(
          `Tentative ${
            attempt + 1
          } échouée, nouvelle tentative dans ${retryDelay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));

        // Backoff exponentiel : augmenter le délai à chaque tentative
        retryDelay *= 2;
      }
    }
  }

  // Si on arrive ici, c'est que toutes les tentatives ont échoué
  throw lastError || new Error(`Échec après ${maxRetries} tentatives`);
}

// Utilisation
fetchWithRetry("https://api.example.com/unstable-endpoint", {}, 5, 500)
  .then((response) => response.json())
  .then((data) => console.log("Succès après retentatives:", data))
  .catch((error) => console.error("Toutes les tentatives ont échoué:", error));
```

## Gestion d'authentification

### Jetons d'authentification

Utilisation des jetons d'authentification (tokens) :

```javascript
// Stockage du token (de préférence dans sessionStorage pour des raisons de sécurité)
function setAuthToken(token) {
  sessionStorage.setItem("authToken", token);
}

function getAuthToken() {
  return sessionStorage.getItem("authToken");
}

function removeAuthToken() {
  sessionStorage.removeItem("authToken");
}

// Fonction fetch authentifiée
async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Aucun token d'authentification trouvé");
  }

  // Fusion des en-têtes
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  // Effectuer la requête avec le token
  const response = await fetch(url, { ...options, headers });

  // Gestion des erreurs d'authentification
  if (response.status === 401) {
    // Token expiré ou invalide
    removeAuthToken();
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }

  return response;
}

// Login pour obtenir un token
async function login(email, password) {
  try {
    const response = await fetch("https://api.example.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Échec de l'authentification: ${response.status}`);
    }

    const data = await response.json();

    // Stockage du token
    setAuthToken(data.token);

    return data;
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    throw error;
  }
}

// Logout
function logout() {
  // Supprimer le token
  removeAuthToken();

  // Optionnel : informer le serveur
  return fetch("https://api.example.com/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  }).catch((error) => {
    console.warn("Erreur lors du logout côté serveur:", error);
    // Ne pas propager l'erreur, on a déjà supprimé le token localement
  });
}
```

### Cookies

Gestion des cookies dans les requêtes fetch :

```javascript
// Requête qui envoie et accepte les cookies
fetch("https://api.example.com/user-profile", {
  credentials: "include", // Envoie les cookies, même pour les requêtes cross-origin
  // Autres options...
});

// Requête qui n'envoie pas de cookies
fetch("https://api.example.com/public-data", {
  credentials: "omit",
  // Autres options...
});

// Requête qui envoie les cookies uniquement pour le même domaine (par défaut)
fetch("https://api.example.com/data", {
  credentials: "same-origin",
  // Autres options...
});

// Lecture des cookies à partir de la réponse
fetch("https://api.example.com/login", {
  method: "POST",
  // Options...
}).then((response) => {
  // Les cookies Set-Cookie seront automatiquement traités par le navigateur
  // Vous pouvez vérifier les cookies dans document.cookie ou les outils du navigateur

  console.log("Cookies après la requête:", document.cookie);
  return response.json();
});
```

### Intercepteurs de requêtes

Création d'intercepteurs pour traiter les requêtes et réponses :

```javascript
// Client HTTP avec intercepteurs
class HttpClient {
  constructor() {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  // Ajouter un intercepteur de requête
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
    return this;
  }

  // Ajouter un intercepteur de réponse
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
    return this;
  }

  // Méthode fetch avec intercepteurs
  async fetch(url, options = {}) {
    let modifiedOptions = { ...options };

    // Appliquer les intercepteurs de requête
    for (const interceptor of this.requestInterceptors) {
      modifiedOptions = await interceptor(url, modifiedOptions);
    }

    try {
      // Effectuer la requête
      let response = await fetch(url, modifiedOptions);

      // Appliquer les intercepteurs de réponse
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      return response;
    } catch (error) {
      // Gestion des erreurs de réseau
      console.error("Erreur réseau:", error);
      throw error;
    }
  }

  // Méthodes utilitaires pour les opérations courantes
  async get(url, options = {}) {
    return this.fetch(url, { ...options, method: "GET" });
  }

  async post(url, body, options = {}) {
    return this.fetch(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  async put(url, body, options = {}) {
    return this.fetch(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  async delete(url, options = {}) {
    return this.fetch(url, { ...options, method: "DELETE" });
  }
}

// Exemple d'utilisation
const httpClient = new HttpClient();

// Intercepteur pour ajouter un token d'authentification
httpClient.addRequestInterceptor(async (url, options) => {
  const token = getAuthToken();
  if (token) {
    return {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  }
  return options;
});

// Intercepteur pour la gestion des réponses
httpClient.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // Rediriger vers la page de login
    window.location.href = "/login";
    throw new Error("Session expirée");
  }
  return response;
});

// Utilisation du client
async function getUsers() {
  const response = await httpClient.get("https://api.example.com/users");
  return response.json();
}
```

## Optimisation des performances

### Mise en cache

Utilisation des options de cache dans fetch() :

```javascript
// Stratégies de cache avec fetch
fetch("https://api.example.com/data", {
  cache: "default", // Comportement par défaut du navigateur
  // Autres valeurs possibles:
  // cache: 'no-store', // Pas de cache, toujours récupérer depuis le réseau
  // cache: 'reload', // Toujours récupérer depuis le réseau mais mettre à jour le cache
  // cache: 'no-cache', // Vérifier la validité dans le cache, requête conditionnelle
  // cache: 'force-cache', // Utiliser le cache si disponible, même expiré
  // cache: 'only-if-cached', // Utiliser uniquement le cache (mode same-origin uniquement)
});

// Utilisation d'en-têtes conditionnels
async function fetchWithConditionalHeaders(url) {
  // Récupérer les en-têtes de la réponse précédente
  const cachedEtag = localStorage.getItem(`etag-${url}`);
  const cachedLastModified = localStorage.getItem(`lastModified-${url}`);

  const headers = new Headers();

  if (cachedEtag) {
    headers.append("If-None-Match", cachedEtag);
  }

  if (cachedLastModified) {
    headers.append("If-Modified-Since", cachedLastModified);
  }

  const response = await fetch(url, { headers });

  if (response.status === 304) {
    // Ressource non modifiée, récupérer la réponse en cache
    const cachedResponse = JSON.parse(localStorage.getItem(`response-${url}`));
    return cachedResponse;
  } else if (response.ok) {
    // Nouvelle réponse, mettre à jour le cache
    const etag = response.headers.get("ETag");
    const lastModified = response.headers.get("Last-Modified");
    const data = await response.json();

    if (etag) {
      localStorage.setItem(`etag-${url}`, etag);
    }

    if (lastModified) {
      localStorage.setItem(`lastModified-${url}`, lastModified);
    }

    localStorage.setItem(`response-${url}`, JSON.stringify(data));
    return data;
  }

  throw new Error(`Erreur HTTP: ${response.status}`);
}
```

### Prefetching

Préchargement des ressources :

```javascript
// Préchargement de données susceptibles d'être utilisées prochainement
function prefetchData(urls) {
  urls.forEach((url) => {
    fetch(url, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP! statut: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(`Données préchargées pour ${url}`);
        // Éventuellement stocker dans un cache ou state manager
      })
      .catch((error) => {
        console.warn(`Échec du préchargement pour ${url}:`, error);
      });
  });
}

// Préchargement basé sur les actions de l'utilisateur
function setupPrefetching() {
  // Précharger les données au survol d'un élément
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      const productId = card.dataset.productId;
      fetch(`https://api.example.com/products/${productId}/details`, {
        cache: "force-cache",
        priority: "low", // Indique au navigateur que c'est une ressource à basse priorité
      });
    });
  });

  // Précharger les pages de navigation probables
  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("mouseenter", () => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("/")) {
        const preloadUrl = `/api/page-data${href}`;
        fetch(preloadUrl, { cache: "force-cache", priority: "low" });
      }
    });
  });
}
```

## Considérations de sécurité

### CORS

Comprendre et gérer les problèmes CORS (Cross-Origin Resource Sharing) :

```javascript
// Requête avec mode CORS explicite
fetch("https://api.other-domain.com/data", {
  mode: "cors", // Le mode par défaut
});

// Requête avec mode no-cors (résultat "opaque", contenu inaccessible)
fetch("https://api.other-domain.com/data", {
  mode: "no-cors",
}).then((response) => {
  console.log(response.type); // "opaque"
  // Impossible d'accéder au contenu de la réponse
});

// Requête avec credentials pour les cookies cross-origin
fetch("https://api.other-domain.com/user-data", {
  credentials: "include",
});

// Si vous contrôlez le serveur, vous devez configurer les en-têtes CORS:
// Access-Control-Allow-Origin: https://your-domain.com
// Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
// Access-Control-Allow-Headers: Content-Type, Authorization
// Access-Control-Allow-Credentials: true (pour les cookies cross-origin)
```

### Protection CSRF

Implémentation de protection CSRF (Cross-Site Request Forgery) :

```javascript
// Récupération d'un token CSRF depuis une réponse ou un cookie
function getCsrfToken() {
  // Option 1: Extraire d'un meta tag
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute("content");
  }

  // Option 2: Extraire d'un cookie
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "XSRF-TOKEN") {
      return decodeURIComponent(value);
    }
  }

  return null;
}

// Ajout du token CSRF à toutes les requêtes non-GET
function addCsrfToken(url, options) {
  // Pas besoin de token pour les requêtes GET, HEAD, OPTIONS
  const nonModifyingMethods = ["GET", "HEAD", "OPTIONS"];
  const method = options.method || "GET";

  if (nonModifyingMethods.includes(method.toUpperCase())) {
    return options;
  }

  const csrfToken = getCsrfToken();
  if (!csrfToken) {
    console.warn("Token CSRF non trouvé");
    return options;
  }

  return {
    ...options,
    headers: {
      ...options.headers,
      "X-CSRF-Token": csrfToken,
    },
  };
}

// Utilisation
async function sendDataWithCsrf(url, data) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  const secureOptions = addCsrfToken(url, options);
  const response = await fetch(url, secureOptions);

  return response.json();
}
```

### Stockage sécurisé des tokens

Bonnes pratiques pour le stockage des tokens d'authentification :

```javascript
// Stockage des tokens dans le sessionStorage (préférable au localStorage pour les tokens)
function setAuthToken(token) {
  // Le sessionStorage est vidé quand l'onglet est fermé
  sessionStorage.setItem("authToken", token);
}

// Pour une sécurité accrue, stockez une empreinte du token, pas le token lui-même
function setSecureAuthToken(token) {
  // Stockez le token en mémoire (variable)
  window.authToken = token;

  // Stockez seulement une empreinte dans le sessionStorage
  // Cela rend le token inaccessible par XSS tout en permettant de vérifier s'il est toujours valide
  const tokenHash = hashToken(token); // Fonction de hachage simplifiée
  sessionStorage.setItem("authTokenHash", tokenHash);
}

function hashToken(token) {
  // Implémentation simplifiée, utilisez une vraie fonction de hachage en production
  return token.split("").reverse().join("");
}

function getSecureAuthToken() {
  // Vérifiez si le hash correspond
  const storedHash = sessionStorage.getItem("authTokenHash");
  const currentToken = window.authToken;

  if (currentToken && storedHash === hashToken(currentToken)) {
    return currentToken;
  }

  // Le token n'est plus valide ou a été altéré
  delete window.authToken;
  sessionStorage.removeItem("authTokenHash");
  return null;
}

// À utiliser pour les requêtes
async function fetchWithAuthToken(url, options = {}) {
  const token = getSecureAuthToken();

  if (!token) {
    throw new Error("Non authentifié");
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
```

## Patterns et meilleures pratiques

### Création d'un client HTTP

Implémentation d'un client HTTP réutilisable :

```javascript
class ApiClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = options;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Fusion des options par défaut et des options spécifiques
    const mergedOptions = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, mergedOptions);

      // Gestion des erreurs HTTP
      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.response = response;
        error.status = response.status;
        throw error;
      }

      // Traitement de la réponse selon le type de contenu
      const contentType = response.headers.get("Content-Type") || "";

      if (contentType.includes("application/json")) {
        return response.json();
      } else if (contentType.includes("text/")) {
        return response.text();
      } else if (contentType.includes("form-data")) {
        return response.formData();
      } else if (
        contentType.includes("image/") ||
        contentType.includes("audio/") ||
        contentType.includes("application/octet-stream")
      ) {
        return response.blob();
      } else {
        // Par défaut
        return response.json().catch(() => response.text());
      }
    } catch (error) {
      // Enrichir l'erreur avec des infos supplémentaires
      error.url = url;
      error.timestamp = new Date().toISOString();

      // Journalisation ou traitement spécifique
      console.error(`Erreur API pour ${url}:`, error);

      throw error;
    }
  }

  // Méthodes pour chaque type de requête HTTP
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  // Méthodes spécifiques pour les formulaires
  async postForm(endpoint, formData, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    });
  }

  // Création d'une instance préconfigurée
  static createWithAuth(baseURL, getTokenFn) {
    return new ApiClient(baseURL, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      // Fonction pour ajouter dynamiquement l'en-tête d'autorisation
      beforeSend: async (options) => {
        const token = getTokenFn();
        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        return options;
      },
    });
  }
}

// Utilisation
const api = new ApiClient("https://api.example.com");

// GET
api
  .get("/users")
  .then((users) => console.log("Utilisateurs:", users))
  .catch((error) => console.error("Erreur:", error));

// POST
api
  .post("/users", { name: "John Doe", email: "john@example.com" })
  .then((newUser) => console.log("Utilisateur créé:", newUser))
  .catch((error) => console.error("Erreur:", error));

// Utilisation avec authentification
const authApi = ApiClient.createWithAuth(
  "https://api.example.com",
  getAuthToken
);

authApi
  .get("/me")
  .then((profile) => console.log("Mon profil:", profile))
  .catch((error) => {
    if (error.status === 401) {
      console.error("Session expirée");
      redirectToLogin();
    } else {
      console.error("Erreur:", error);
    }
  });
```

### Gestion centralisée des erreurs

Mise en place d'un système de gestion d'erreurs centralisé :

```javascript
// Gestionnaire d'erreurs centralisé
class ErrorHandler {
  constructor() {
    this.handlers = {};
    this.defaultHandler = (error) => {
      console.error("Erreur non gérée:", error);
      return false; // Continue la propagation
    };
  }

  // Ajouter un gestionnaire pour un type d'erreur spécifique
  register(errorType, handler) {
    this.handlers[errorType] = handler;
    return this;
  }

  // Définir le gestionnaire par défaut
  setDefaultHandler(handler) {
    this.defaultHandler = handler;
    return this;
  }

  // Gérer une erreur
  handle(error) {
    let handled = false;

    // Détecter le type d'erreur
    let errorType = "unknown";

    if (error.status === 401) {
      errorType = "unauthorized";
    } else if (error.status === 403) {
      errorType = "forbidden";
    } else if (error.status === 404) {
      errorType = "notFound";
    } else if (error.status >= 500) {
      errorType = "serverError";
    } else if (
      error.name === "TypeError" &&
      error.message.includes("NetworkError")
    ) {
      errorType = "network";
    } else if (error.name === "AbortError") {
      errorType = "aborted";
    } else if (error.name === "SyntaxError" && error.message.includes("JSON")) {
      errorType = "invalidJson";
    }

    // Appliquer le gestionnaire spécifique s'il existe
    if (this.handlers[errorType]) {
      handled = this.handlers[errorType](error) === true;
    }

    // Si l'erreur n'a pas été complètement gérée, appliquer le gestionnaire par défaut
    if (!handled) {
      this.defaultHandler(error);
    }
  }
}

// Initialisation du gestionnaire d'erreurs
const errorHandler = new ErrorHandler();

// Enregistrement des gestionnaires spécifiques
errorHandler
  .register("unauthorized", (error) => {
    console.warn("Session expirée ou non authentifiée");

    // Rediriger vers la page de login
    window.location.href =
      "/login?redirect=" + encodeURIComponent(window.location.pathname);

    // Afficher une notification
    showNotification("Veuillez vous connecter pour continuer");

    return true; // Erreur complètement gérée
  })
  .register("network", (error) => {
    console.warn("Erreur réseau:", error);

    // Vérifier l'état de la connexion
    if (!navigator.onLine) {
      showOfflineWarning();
    } else {
      showNotification("Problème de connexion au serveur. Veuillez réessayer.");
    }

    return true;
  })
  .register("serverError", (error) => {
    console.error("Erreur serveur:", error);

    // Journaliser l'erreur sur un service externe
    logErrorToService({
      type: "serverError",
      status: error.status,
      url: error.url,
      timestamp: new Date().toISOString(),
      message: error.message,
    });

    showNotification(
      "Une erreur est survenue sur le serveur. Notre équipe a été notifiée."
    );

    return true;
  });

// Utilisation du gestionnaire d'erreurs dans les requêtes
async function fetchWithErrorHandling(url, options) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.url = url;
      throw error;
    }

    return response;
  } catch (error) {
    // Gestion centralisée des erreurs
    errorHandler.handle(error);

    // Propager l'erreur pour un traitement spécifique optionnel
    throw error;
  }
}
```

## Comparaison avec les alternatives

### fetch vs XMLHttpRequest

```javascript
// Même requête avec fetch
fetch("https://api.example.com/data")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => console.log("Données reçues:", data))
  .catch((error) => console.error("Erreur:", error));

// Équivalent avec XMLHttpRequest
function fetchWithXHR(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (error) {
          reject(new Error("Erreur de parsing JSON"));
        }
      } else {
        reject(new Error(`HTTP error! status: ${xhr.status}`));
      }
    };

    xhr.onerror = function () {
      reject(new Error("Erreur réseau"));
    };

    xhr.send();
  });
}

fetchWithXHR("https://api.example.com/data")
  .then((data) => console.log("Données reçues:", data))
  .catch((error) => console.error("Erreur:", error));
```

### fetch vs axios

```javascript
// Avec fetch
async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Erreur fetch:", error);
    throw error;
  }
}

// Équivalent avec axios
async function fetchDataWithAxios(url) {
  try {
    const response = await axios.get(url);

    // axios gère déjà les erreurs HTTP, et jette automatiquement une erreur pour les codes 4xx et 5xx
    // response.data est déjà parsé en JSON si possible

    return response.data;
  } catch (error) {
    // Accès aux informations détaillées d'erreur
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'état 4xx/5xx
      console.error(
        "Erreur de réponse:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // La requête a été faite mais pas de réponse reçue
      console.error("Pas de réponse reçue:", error.request);
    } else {
      // Erreur dans la configuration de la requête
      console.error("Erreur de configuration:", error.message);
    }

    throw error;
  }
}

// Differences principales:
// 1. axios gère automatiquement les erreurs HTTP
// 2. axios parse automatiquement JSON
// 3. axios a un système d'intercepteurs intégré
// 4. axios a une meilleure gestion des timeouts et annulations
// 5. fetch est intégré nativement et ne nécessite pas de dépendance externe
```

## Ressources supplémentaires

- [Documentation MDN sur Fetch API](https://developer.mozilla.org/fr/docs/Web/API/Fetch_API)
- [Guide complet sur l'utilisation de fetch()](https://developer.mozilla.org/fr/docs/Web/API/Fetch_API/Using_Fetch)
- [Spécification Fetch](https://fetch.spec.whatwg.org/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [CORS (Cross-Origin Resource Sharing)](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS)
- [Utilisation des Headers HTTP](https://developer.mozilla.org/fr/docs/Web/HTTP/Headers)
- [Guide sur les Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Utilisation de AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [APIs de cache dans les navigateurs](https://developer.mozilla.org/en-US/docs/Web/API/Cache)

---

Ce README a été créé pour fournir une vue d'ensemble complète des appels HTTP avec l'API fetch() en JavaScript. N'hésitez pas à contribuer ou à suggérer des améliorations !
