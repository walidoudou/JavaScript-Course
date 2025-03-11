# L'Objet Date en JavaScript

## Table des matières

- [Introduction](#introduction)
- [Création de dates](#création-de-dates)
  - [Constructeur Date](#constructeur-date)
  - [Obtenir la date actuelle](#obtenir-la-date-actuelle)
  - [Créer une date spécifique](#créer-une-date-spécifique)
  - [Parser des chaînes de date](#parser-des-chaînes-de-date)
- [Méthodes d'obtention (getters)](#méthodes-dobtention-getters)
  - [Obtenir l'année, le mois et le jour](#obtenir-lannée-le-mois-et-le-jour)
  - [Obtenir l'heure, les minutes, les secondes et les millisecondes](#obtenir-lheure-les-minutes-les-secondes-et-les-millisecondes)
  - [Obtenir le jour de la semaine](#obtenir-le-jour-de-la-semaine)
  - [Obtenir le timestamp](#obtenir-le-timestamp)
- [Méthodes de définition (setters)](#méthodes-de-définition-setters)
  - [Définir l'année, le mois et le jour](#définir-lannée-le-mois-et-le-jour)
  - [Définir l'heure, les minutes, les secondes et les millisecondes](#définir-lheure-les-minutes-les-secondes-et-les-millisecondes)
  - [Définir le timestamp](#définir-le-timestamp)
- [Opérations sur les dates](#opérations-sur-les-dates)
  - [Addition et soustraction](#addition-et-soustraction)
  - [Comparaison de dates](#comparaison-de-dates)
  - [Calcul de différences](#calcul-de-différences)
- [Formatage des dates](#formatage-des-dates)
  - [Méthodes de base](#méthodes-de-base)
  - [Méthodes toLocaleString](#méthodes-tolocalestring)
  - [Formatage manuel](#formatage-manuel)
- [Fuseaux horaires et internationalisation](#fuseaux-horaires-et-internationalisation)
  - [Date et fuseaux horaires](#date-et-fuseaux-horaires)
  - [Méthodes UTC](#méthodes-utc)
  - [API Intl pour internationalisation](#api-intl-pour-internationalisation)
- [Bibliothèques externes](#bibliothèques-externes)
  - [Date-fns](#date-fns)
  - [Day.js](#dayjs)
  - [Luxon](#luxon)
  - [Moment.js](#momentjs)
- [Bonnes pratiques](#bonnes-pratiques)
  - [Immutabilité des dates](#immutabilité-des-dates)
  - [Validation des dates](#validation-des-dates)
  - [Gestion des erreurs](#gestion-des-erreurs)
- [Cas d'usage courants](#cas-dusage-courants)
  - [Calendriers et agendas](#calendriers-et-agendas)
  - [Chronomètres et comptes à rebours](#chronomètres-et-comptes-à-rebours)
  - [Calcul d'âge](#calcul-dâge)
  - [Extraction de composants de date](#extraction-de-composants-de-date)
- [Pièges courants](#pièges-courants)
  - [Le problème de mois (index 0-11)](#le-problème-de-mois-index-0-11)
  - [Modifications involontaires](#modifications-involontaires)
  - [Problèmes de fuseaux horaires](#problèmes-de-fuseaux-horaires)
  - [Conversion de chaînes de date](#conversion-de-chaînes-de-date)
- [Date dans les navigateurs modernes](#date-dans-les-navigateurs-modernes)
  - [Temporal API](#temporal-api)
  - [Compatibilité](#compatibilité)
- [Ressources supplémentaires](#ressources-supplémentaires)

## Introduction

L'objet `Date` en JavaScript est utilisé pour travailler avec les dates et les heures. Il permet de créer, manipuler, formater et effectuer des calculs sur des dates. Bien que cet objet présente certaines limitations, notamment dans la gestion des fuseaux horaires complexes, il reste un outil fondamental pour la majorité des manipulations de dates dans les applications JavaScript.

Une instance de `Date` représente un moment précis dans le temps, stocké en interne comme le nombre de millisecondes écoulées depuis le 1er janvier 1970 00:00:00 UTC (souvent appelé "timestamp Unix" ou "époque Unix"), avec une précision limitée aux millisecondes.

Ce guide explore en détail les capacités de l'objet `Date`, ses méthodes, ses limitations et les bonnes pratiques pour travailler efficacement avec les dates en JavaScript.

## Création de dates

### Constructeur Date

Le constructeur `Date` permet de créer des objets Date de plusieurs façons :

```javascript
// Sans arguments : date et heure actuelles
const maintenant = new Date();
console.log(maintenant); // 2023-09-20T15:30:45.123Z (exemple)

// À partir d'un timestamp (millisecondes depuis le 1er janvier 1970 UTC)
const timestampDate = new Date(1632150000000);
console.log(timestampDate); // 2021-09-20T15:00:00.000Z

// À partir d'une chaîne de date
const stringDate = new Date("2023-09-20T15:30:00");
console.log(stringDate); // 2023-09-20T15:30:00.000Z

// À partir de composants de date (année, mois, jour, heure, minute, seconde, milliseconde)
// Note: les mois sont indexés à partir de 0 (0 = janvier, 11 = décembre)
const componentDate = new Date(2023, 8, 20, 15, 30, 0, 0);
console.log(componentDate); // 2023-09-20T13:30:00.000Z (dépend du fuseau horaire local)
```

### Obtenir la date actuelle

Pour obtenir la date et l'heure actuelles, utilisez le constructeur sans arguments :

```javascript
// Date et heure actuelles
const maintenant = new Date();
console.log(maintenant);

// Timestamp actuel en millisecondes (méthode statique, ne nécessite pas de créer un objet Date)
const timestampActuel = Date.now();
console.log(timestampActuel); // par exemple: 1695224647123
```

### Créer une date spécifique

Pour créer une date spécifique, plusieurs approches sont possibles :

```javascript
// Année, mois (0-11), jour, heure, minute, seconde, milliseconde
const date1 = new Date(2023, 8, 20, 15, 30, 0, 0); // 20 septembre 2023, 15:30:00

// Année, mois (0-11), jour
const date2 = new Date(2023, 8, 20); // 20 septembre 2023, 00:00:00

// Attention au mois indexé à partir de 0
const janvier = new Date(2023, 0, 15); // 15 janvier 2023
const decembre = new Date(2023, 11, 31); // 31 décembre 2023

// Timestamp (millisecondes depuis l'époque Unix)
const date3 = new Date(1695224647123);

// ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
const date4 = new Date("2023-09-20T15:30:00Z"); // Z indique UTC
const date5 = new Date("2023-09-20T15:30:00+02:00"); // Avec décalage horaire

// Format de date court
const date6 = new Date("2023-09-20");

// Format de date écrit en anglais
const date7 = new Date("September 20, 2023 15:30:00");
```

### Parser des chaînes de date

La méthode statique `Date.parse()` permet de convertir une chaîne de date en timestamp :

```javascript
// Convertir une chaîne de date en timestamp (millisecondes)
const timestamp = Date.parse("2023-09-20T15:30:00Z");
console.log(timestamp); // 1695222600000

// Utiliser ce timestamp pour créer un objet Date
const date = new Date(timestamp);
console.log(date); // 2023-09-20T15:30:00.000Z

// Attention : Date.parse() peut être incohérent entre les navigateurs
// pour certains formats de date. Préférez les formats ISO 8601.
```

## Méthodes d'obtention (getters)

### Obtenir l'année, le mois et le jour

```javascript
const date = new Date("2023-09-20T15:30:00Z");

// Obtenir l'année (4 chiffres)
const annee = date.getFullYear();
console.log(annee); // 2023

// Obtenir le mois (0-11, où 0 = janvier)
const mois = date.getMonth();
console.log(mois); // 8 (septembre)
console.log(mois + 1); // 9 (conversion en nombre de mois conventionnel)

// Obtenir le jour du mois (1-31)
const jour = date.getDate();
console.log(jour); // 20

// Obtenir le quantième du jour dans l'année (1-366)
const jourAnnee = (function () {
  const debut = new Date(date.getFullYear(), 0, 0);
  const diff = date - debut;
  const unJour = 1000 * 60 * 60 * 24;
  return Math.floor(diff / unJour);
})();
console.log(jourAnnee); // 263 (jour de l'année)
```

### Obtenir l'heure, les minutes, les secondes et les millisecondes

```javascript
const date = new Date("2023-09-20T15:30:45.123Z");

// Obtenir l'heure (0-23)
const heure = date.getHours();
console.log(heure); // Dépend du fuseau horaire local

// Obtenir les minutes (0-59)
const minutes = date.getMinutes();
console.log(minutes); // 30

// Obtenir les secondes (0-59)
const secondes = date.getSeconds();
console.log(secondes); // 45

// Obtenir les millisecondes (0-999)
const ms = date.getMilliseconds();
console.log(ms); // 123
```

### Obtenir le jour de la semaine

```javascript
const date = new Date("2023-09-20T15:30:00Z");

// Obtenir le jour de la semaine (0-6, où 0 = dimanche)
const jourSemaine = date.getDay();
console.log(jourSemaine); // 3 (mercredi)

// Convertir en jour de la semaine nommé
const joursNoms = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];
console.log(joursNoms[jourSemaine]); // "Mercredi"
```

### Obtenir le timestamp

```javascript
const date = new Date("2023-09-20T15:30:00Z");

// Obtenir le timestamp (millisecondes depuis l'époque Unix)
const timestamp = date.getTime();
console.log(timestamp); // 1695222600000

// Alternative avec Date.now() pour l'heure actuelle
const timestampActuel = Date.now();
console.log(timestampActuel);

// Obtenir le timestamp en secondes (convention Unix)
const timestampSecondes = Math.floor(date.getTime() / 1000);
console.log(timestampSecondes); // 1695222600
```

## Méthodes de définition (setters)

### Définir l'année, le mois et le jour

```javascript
const date = new Date("2023-09-20T15:30:00Z");
console.log(date); // 2023-09-20T15:30:00.000Z

// Définir l'année
date.setFullYear(2024);
console.log(date); // 2024-09-20T15:30:00.000Z

// Définir le mois (0-11)
date.setMonth(0); // Janvier
console.log(date); // 2024-01-20T15:30:00.000Z

// Définir le jour du mois (1-31)
date.setDate(15);
console.log(date); // 2024-01-15T15:30:00.000Z

// Définir plusieurs composants à la fois
date.setFullYear(2025, 5, 10); // 10 juin 2025
console.log(date); // 2025-06-10T15:30:00.000Z
```

### Définir l'heure, les minutes, les secondes et les millisecondes

```javascript
const date = new Date("2023-09-20T15:30:00Z");
console.log(date); // 2023-09-20T15:30:00.000Z

// Définir l'heure (0-23)
date.setHours(10);
console.log(date); // 2023-09-20T10:30:00.000Z

// Définir les minutes (0-59)
date.setMinutes(45);
console.log(date); // 2023-09-20T10:45:00.000Z

// Définir les secondes (0-59)
date.setSeconds(30);
console.log(date); // 2023-09-20T10:45:30.000Z

// Définir les millisecondes (0-999)
date.setMilliseconds(500);
console.log(date); // 2023-09-20T10:45:30.500Z

// Définir plusieurs composants à la fois
date.setHours(8, 15, 0, 0); // 8h15m00s000ms
console.log(date); // 2023-09-20T08:15:00.000Z
```

### Définir le timestamp

```javascript
const date = new Date();

// Définir la date via un timestamp (millisecondes depuis l'époque Unix)
date.setTime(1695222600000); // 20 septembre 2023 15:30:00 UTC
console.log(date); // 2023-09-20T15:30:00.000Z

// Créer une date à partir d'un timestamp en secondes (format Unix)
const timestampSecondes = 1695222600;
const dateFromSeconds = new Date(timestampSecondes * 1000);
console.log(dateFromSeconds); // 2023-09-20T15:30:00.000Z
```

## Opérations sur les dates

### Addition et soustraction

```javascript
const date = new Date("2023-09-20T12:00:00Z");
console.log(date); // 2023-09-20T12:00:00.000Z

// Ajouter des jours
const dateAddJours = new Date(date);
dateAddJours.setDate(date.getDate() + 5); // Ajouter 5 jours
console.log(dateAddJours); // 2023-09-25T12:00:00.000Z

// Soustraire des jours
const dateSubJours = new Date(date);
dateSubJours.setDate(date.getDate() - 5); // Soustraire 5 jours
console.log(dateSubJours); // 2023-09-15T12:00:00.000Z

// Ajouter des mois
const dateAddMois = new Date(date);
dateAddMois.setMonth(date.getMonth() + 3); // Ajouter 3 mois
console.log(dateAddMois); // 2023-12-20T12:00:00.000Z

// Gestion automatique du passage d'année
const dateFinAnnee = new Date("2023-12-20T12:00:00Z");
const dateAnneSuivante = new Date(dateFinAnnee);
dateAnneSuivante.setMonth(dateFinAnnee.getMonth() + 2); // Décembre + 2 = Février
console.log(dateAnneSuivante); // 2024-02-20T12:00:00.000Z

// Ajouter des heures, minutes, secondes
const dateAddTime = new Date(date);
dateAddTime.setHours(date.getHours() + 6); // Ajouter 6 heures
dateAddTime.setMinutes(date.getMinutes() + 30); // Ajouter 30 minutes
console.log(dateAddTime); // 2023-09-20T18:30:00.000Z

// Ajouter un intervalle de temps calculé en millisecondes
const dateAddMs = new Date(date.getTime() + 24 * 60 * 60 * 1000); // Ajouter 1 jour
console.log(dateAddMs); // 2023-09-21T12:00:00.000Z
```

### Comparaison de dates

```javascript
const date1 = new Date("2023-09-20T12:00:00Z");
const date2 = new Date("2023-10-15T12:00:00Z");
const date3 = new Date("2023-09-20T12:00:00Z");

// Comparaison d'égalité
console.log(date1.getTime() === date3.getTime()); // true (même moment)
console.log(date1.getTime() === date2.getTime()); // false (moments différents)

// Attention: ceci ne fonctionne pas car les objets Date sont des objets
console.log(date1 === date3); // false (références d'objets différentes)

// Comparaisons chronologiques
console.log(date1 < date2); // true (date1 est antérieure à date2)
console.log(date1 > date2); // false (date1 n'est pas postérieure à date2)
console.log(date1 <= date3); // true (date1 est égale à date3)

// Comparaison recommandée via les timestamps
console.log(date1.getTime() < date2.getTime()); // true
console.log(date1.getTime() > date2.getTime()); // false
console.log(date1.getTime() === date3.getTime()); // true

// Déterminer la date la plus récente/ancienne
const dateLaPlusRecente = new Date(
  Math.max(date1.getTime(), date2.getTime(), date3.getTime())
);
console.log(dateLaPlusRecente); // 2023-10-15T12:00:00.000Z

const dateLaPlusAncienne = new Date(
  Math.min(date1.getTime(), date2.getTime(), date3.getTime())
);
console.log(dateLaPlusAncienne); // 2023-09-20T12:00:00.000Z
```

### Calcul de différences

```javascript
const dateDebut = new Date("2023-09-01T10:00:00Z");
const dateFin = new Date("2023-09-15T18:30:00Z");

// Différence en millisecondes
const diffMs = dateFin.getTime() - dateDebut.getTime();
console.log(diffMs); // 1252200000 millisecondes

// Conversion en jours, heures, minutes, secondes
const diffJours = Math.floor(diffMs / (1000 * 60 * 60 * 24));
const resteMsApresJours = diffMs % (1000 * 60 * 60 * 24);
const diffHeures = Math.floor(resteMsApresJours / (1000 * 60 * 60));
const resteMsApresHeures = resteMsApresJours % (1000 * 60 * 60);
const diffMinutes = Math.floor(resteMsApresHeures / (1000 * 60));
const resteMsApresMinutes = resteMsApresHeures % (1000 * 60);
const diffSecondes = Math.floor(resteMsApresMinutes / 1000);

console.log(
  `Différence: ${diffJours} jours, ${diffHeures} heures, ${diffMinutes} minutes, ${diffSecondes} secondes`
);
// Différence: 14 jours, 8 heures, 30 minutes, 0 secondes

// Calcul de la différence en mois (approximation)
const diffAnnees = dateFin.getFullYear() - dateDebut.getFullYear();
const diffMois = dateFin.getMonth() - dateDebut.getMonth() + diffAnnees * 12;
console.log(`Différence approximative en mois: ${diffMois}`); // 0

// Une implémentation plus précise pour calculer la différence en mois prendrait en compte les jours
```

## Formatage des dates

### Méthodes de base

```javascript
const date = new Date("2023-09-20T15:30:45Z");

// Conversion en chaîne de caractères
console.log(date.toString());
// "Wed Sep 20 2023 17:30:45 GMT+0200 (Central European Summer Time)" (dépend de la locale)

// Format ISO
console.log(date.toISOString()); // "2023-09-20T15:30:45.000Z"

// Format date simple
console.log(date.toDateString()); // "Wed Sep 20 2023"

// Format heure simple
console.log(date.toTimeString()); // "17:30:45 GMT+0200 (Central European Summer Time)" (dépend de la locale)

// Format UTC
console.log(date.toUTCString()); // "Wed, 20 Sep 2023 15:30:45 GMT"

// Format locale
console.log(date.toLocaleString()); // "20/09/2023, 17:30:45" (dépend de la locale)
console.log(date.toLocaleDateString()); // "20/09/2023" (dépend de la locale)
console.log(date.toLocaleTimeString()); // "17:30:45" (dépend de la locale)
```

### Méthodes toLocaleString

Les méthodes `toLocaleString()`, `toLocaleDateString()` et `toLocaleTimeString()` acceptent des arguments pour personnaliser le formatage :

```javascript
const date = new Date("2023-09-20T15:30:45Z");

// Spécifier la locale
console.log(date.toLocaleString("fr-FR")); // "20/09/2023, 17:30:45"
console.log(date.toLocaleString("en-US")); // "9/20/2023, 5:30:45 PM"
console.log(date.toLocaleString("de-DE")); // "20.9.2023, 17:30:45"
console.log(date.toLocaleString("ja-JP")); // "2023/9/20 17:30:45"

// Options de formatage
const options = {
  weekday: "long", // 'long', 'short', 'narrow'
  year: "numeric", // 'numeric', '2-digit'
  month: "long", // 'numeric', '2-digit', 'long', 'short', 'narrow'
  day: "numeric", // 'numeric', '2-digit'
  hour: "2-digit", // 'numeric', '2-digit'
  minute: "2-digit", // 'numeric', '2-digit'
  second: "2-digit", // 'numeric', '2-digit'
  timeZoneName: "short", // 'short', 'long'
};

console.log(date.toLocaleString("fr-FR", options));
// "mercredi 20 septembre 2023, 17:30:45 GMT+2"

console.log(
  date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
);
// "mercredi 20 septembre 2023"

console.log(
  date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
);
// "17:30:45"
```

### Formatage manuel

Pour un contrôle total sur le formatage, vous pouvez créer votre propre fonction :

```javascript
function formatDate(date, format) {
  const pad = (num) => String(num).padStart(2, "0");

  const tokens = {
    yyyy: date.getFullYear(),
    MM: pad(date.getMonth() + 1),
    dd: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    D: date.getDate(),
    M: date.getMonth() + 1,
    H: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds(),
  };

  return format.replace(
    /yyyy|MM|dd|HH|mm|ss|D|M|H|m|s/g,
    (match) => tokens[match]
  );
}

const date = new Date("2023-09-20T15:30:45Z");

console.log(formatDate(date, "yyyy-MM-dd HH:mm:ss")); // "2023-09-20 17:30:45" (heure locale)
console.log(formatDate(date, "le dd/MM/yyyy à H:mm")); // "le 20/09/2023 à 17:30" (heure locale)
console.log(formatDate(date, "D/M/yyyy")); // "20/9/2023"
```

## Fuseaux horaires et internationalisation

### Date et fuseaux horaires

L'objet `Date` en JavaScript stocke toujours les dates en UTC en interne, mais la plupart de ses méthodes renvoient des valeurs dans le fuseau horaire local :

```javascript
const date = new Date("2023-09-20T15:30:45Z"); // 'Z' indique UTC

// Obtenir le décalage du fuseau horaire local en minutes
const timezoneOffset = date.getTimezoneOffset();
console.log(timezoneOffset); // -120 (CET+2, les valeurs sont inversées)

// Convertir le décalage en heures:minutes
const offsetHours = Math.abs(Math.floor(timezoneOffset / 60));
const offsetMinutes = Math.abs(timezoneOffset % 60);
const offsetSign = timezoneOffset <= 0 ? "+" : "-";
const offsetString = `${offsetSign}${String(offsetHours).padStart(
  2,
  "0"
)}:${String(offsetMinutes).padStart(2, "0")}`;
console.log(`Fuseau horaire local: UTC${offsetString}`); // "Fuseau horaire local: UTC+02:00" (pour l'Europe centrale en été)

// Méthodes locales vs méthodes UTC
console.log(date.getHours()); // Heures en fuseau horaire local
console.log(date.getUTCHours()); // 15 (heures en UTC)
```

### Méthodes UTC

Pour travailler avec des dates en UTC plutôt qu'en heure locale, utilisez les méthodes `getUTC*` et `setUTC*` :

```javascript
const date = new Date("2023-09-20T15:30:45Z");

// Getters UTC
console.log(date.getUTCFullYear()); // 2023
console.log(date.getUTCMonth()); // 8 (septembre)
console.log(date.getUTCDate()); // 20
console.log(date.getUTCHours()); // 15
console.log(date.getUTCMinutes()); // 30
console.log(date.getUTCSeconds()); // 45
console.log(date.getUTCDay()); // 3 (mercredi)

// Setters UTC
const dateUTC = new Date();
dateUTC.setUTCFullYear(2023);
dateUTC.setUTCMonth(8); // septembre
dateUTC.setUTCDate(20);
dateUTC.setUTCHours(15);
dateUTC.setUTCMinutes(30);
dateUTC.setUTCSeconds(45);
console.log(dateUTC.toISOString()); // "2023-09-20T15:30:45.000Z"

// Conversion explicite entre heure locale et UTC
function localToUTC(date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
}

function utcToLocal(utcDate) {
  return new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds(),
    utcDate.getUTCMilliseconds()
  );
}
```

### API Intl pour internationalisation

L'API `Intl` fournit des fonctionnalités avancées d'internationalisation :

```javascript
const date = new Date("2023-09-20T15:30:45Z");

// DateTimeFormat pour un formatage avancé
const formatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZone: "Europe/Paris",
  timeZoneName: "short",
});

console.log(formatter.format(date));
// "mercredi 20 septembre 2023 à 17:30:45 GMT+2"

// Formatage dans différentes langues
const formatterEN = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "long",
  timeZone: "America/New_York",
});

console.log(formatterEN.format(date));
// "Wednesday, September 20, 2023 at 11:30:45 AM EDT"

// Formatage relatif avec RelativeTimeFormat
const rtf = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

console.log(rtf.format(-1, "day")); // "hier"
console.log(rtf.format(2, "day")); // "après-demain"
console.log(rtf.format(-5, "month")); // "il y a 5 mois"
```

## Bibliothèques externes

### Date-fns

[date-fns](https://date-fns.org/) est une bibliothèque moderne, modulaire et centrée sur les performances.

Installation :

```bash
npm install date-fns
```

Exemples d'utilisation :

```javascript
import { format, addDays, differenceInDays, isAfter, parse } from "date-fns";
import { fr } from "date-fns/locale";

const date = new Date("2023-09-20T15:30:00Z");

// Formatage
console.log(format(date, "dd/MM/yyyy")); // "20/09/2023"
console.log(format(date, "PPP", { locale: fr })); // "20 septembre 2023"

// Manipulation
const dateIncrementee = addDays(date, 5);
console.log(format(dateIncrementee, "yyyy-MM-dd")); // "2023-09-25"

// Comparaison
const dateA = new Date("2023-09-15");
const dateB = new Date("2023-09-20");
console.log(differenceInDays(dateB, dateA)); // 5
console.log(isAfter(dateB, dateA)); // true

// Parsing
const parsedDate = parse("20/09/2023", "dd/MM/yyyy", new Date());
console.log(parsedDate); // 2023-09-20T00:00:00.000Z
```

### Day.js

[Day.js](https://day.js.org/) est une alternative légère à Moment.js avec une API similaire.

Installation :

```bash
npm install dayjs
```

Exemples d'utilisation :

```javascript
import dayjs from "dayjs";
import "dayjs/locale/fr";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Configuration
dayjs.locale("fr");
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const date = dayjs("2023-09-20T15:30:00Z");

// Formatage
console.log(date.format("DD/MM/YYYY HH:mm")); // "20/09/2023 17:30" (heure locale)

// Manipulation
console.log(date.add(5, "day").format("YYYY-MM-DD")); // "2023-09-25"
console.log(date.subtract(1, "month").format("YYYY-MM-DD")); // "2023-08-20"

// Comparaison
const dateA = dayjs("2023-09-15");
const dateB = dayjs("2023-09-20");
console.log(dateB.diff(dateA, "day")); // 5
console.log(dateB.isAfter(dateA)); // true

// Temps relatif
console.log(date.fromNow()); // "il y a X jours" (dépend de la date actuelle)

// Fuseaux horaires
console.log(date.tz("America/New_York").format("YYYY-MM-DD HH:mm")); // "2023-09-20 11:30"
```

### Luxon

[Luxon](https://moment.github.io/luxon/) est une bibliothèque moderne qui gère particulièrement bien les fuseaux horaires et les opérations complexes sur les dates.

Installation :

```bash
npm install luxon
```

Exemples d'utilisation :

```javascript
import { DateTime, Interval, Duration } from 'luxon';

// Création
const date = DateTime.fromISO('2023-09-20T15:30:00Z');
console.log(date.toString()); // "2023-09-20T15:30:00.000Z"

// Formatage
console.log(date.toFormat('dd/MM/yyyy HH:mm')); // "20/09/2023 17:30" (heure locale)
console.log(date.setLocale('fr').toLocaleString(DateTime.DATETIME_FULL));
// "20 septembre 2023 à 17:30:00 UTC+2" (dépend de la locale)

// Manipulation
console.log(date.plus({ days: 5 }).toISODate()); // "2023-09-25"
console.log(date.minus({ months: 1 }).toISODate()); // "2023-08-20"

// Fuseaux horaires
console.log(date.setZone('America/New_York').toFormat('HH:mm')); // "11:30"

// Intervalles
const debut = DateTime.fromISO('2023-09-15');
const fin = DateTime.fromISO('2023-09-25');
const intervalle = Interval.fromDateTimes(debut, fin);
console.log(intervalle.length('days')); // 10
console.log(intervalle.contains(date)); // true

// Durées
const duree = Duration.fromObject({ days: 5, hours: 6 });
console.log(duree.toFormat('d'h'"\')); // "5h6'"
console.log(date.plus(duree).toISO()); // "2023-09-25T21:30:00.000Z"
```

### Moment.js

[Moment.js](https://momentjs.com/) est une bibliothèque populaire, mais elle est maintenant considérée comme legacy. Les développeurs sont encouragés à utiliser des alternatives comme date-fns, Day.js ou Luxon.

Installation :

```bash
npm install moment
```

Exemples d'utilisation :

```javascript
import moment from "moment";
import "moment/locale/fr";

// Configuration
moment.locale("fr");

const date = moment("2023-09-20T15:30:00Z");

// Formatage
console.log(date.format("DD/MM/YYYY HH:mm")); // "20/09/2023 17:30" (heure locale)

// Manipulation
console.log(date.add(5, "days").format("YYYY-MM-DD")); // "2023-09-25"
console.log(date.subtract(1, "month").format("YYYY-MM-DD")); // "2023-08-20"

// Comparaison
const dateA = moment("2023-09-15");
const dateB = moment("2023-09-20");
console.log(dateB.diff(dateA, "days")); // 5
console.log(dateB.isAfter(dateA)); // true

// Temps relatif
console.log(date.fromNow()); // "il y a X jours" (dépend de la date actuelle)
```

## Bonnes pratiques

### Immutabilité des dates

Les objets `Date` sont mutables en JavaScript, ce qui peut entraîner des erreurs subtiles. Adoptez une approche immutable :

```javascript
// Mauvaise pratique (mutation)
function ajouterJours(date, jours) {
  date.setDate(date.getDate() + jours); // Modifie l'original
  return date;
}

// Bonne pratique (immutabilité)
function ajouterJours(date, jours) {
  const resultat = new Date(date); // Cloner la date
  resultat.setDate(resultat.getDate() + jours);
  return resultat;
}

const dateOrigine = new Date("2023-09-20");
const dateNouvelleImmutable = ajouterJours(dateOrigine, 5);
console.log(dateOrigine.toISOString()); // La date originale reste inchangée
console.log(dateNouvelleImmutable.toISOString()); // Date + 5 jours
```

### Validation des dates

Vérifiez toujours que les objets `Date` sont valides :

```javascript
// Vérifier si une date est valide
function estDateValide(date) {
  return date instanceof Date && !isNaN(date);
}

const dateValide = new Date("2023-09-20");
const dateInvalide = new Date("not-a-date");

console.log(estDateValide(dateValide)); // true
console.log(estDateValide(dateInvalide)); // false

// Parsing sécurisé
function parseDate(dateStr, format = "yyyy-MM-dd") {
  try {
    // Utiliser une bibliothèque comme date-fns pour le parsing
    // Ou implémenter un parsing manuel selon le format
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (!estDateValide(date)) {
      throw new Error("Date invalide");
    }

    return date;
  } catch (e) {
    console.error(
      `Erreur de parsing: ${dateStr} ne correspond pas au format ${format}`
    );
    return null;
  }
}
```

### Gestion des erreurs

Anticipez et gérez les erreurs courantes liées aux dates :

```javascript
// Fonction sécurisée pour obtenir une date
function getDate(value, defaultValue = new Date()) {
  let date;

  try {
    if (value instanceof Date) {
      date = new Date(value);
    } else if (typeof value === "string") {
      date = new Date(value);
    } else if (typeof value === "number") {
      date = new Date(value);
    } else {
      throw new Error("Type non pris en charge");
    }

    if (isNaN(date.getTime())) {
      throw new Error("Date invalide");
    }

    return date;
  } catch (error) {
    console.warn(`Erreur lors de la conversion en Date: ${error.message}`);
    return defaultValue;
  }
}

// Exemples d'utilisation
console.log(getDate("2023-09-20")); // Date valide
console.log(getDate("invalid")); // Date par défaut (maintenant)
console.log(getDate(1695222600000)); // Date depuis timestamp
```

## Cas d'usage courants

### Calendriers et agendas

Création d'un calendrier mensuel simple :

```javascript
function genererCalendrier(annee, mois) {
  // Créer une date pour le premier jour du mois
  const premierJour = new Date(annee, mois, 1);
  // Déterminer le nombre de jours dans le mois
  const dernierJour = new Date(annee, mois + 1, 0);
  const nombreJours = dernierJour.getDate();

  // Déterminer le jour de la semaine du premier jour (0 = Dimanche, 1 = Lundi, etc.)
  const jourSemainePremier = premierJour.getDay();

  // Créer un tableau représentant le calendrier
  const calendrier = [];
  let semaine = Array(7).fill(null);

  // Remplir les jours vides avant le premier jour du mois
  for (let i = 0; i < jourSemainePremier; i++) {
    semaine[i] = null;
  }

  // Remplir les jours du mois
  let jourCourant = 1;
  for (let i = jourSemainePremier; i < 7; i++) {
    semaine[i] = jourCourant++;
  }
  calendrier.push(semaine);

  // Remplir les semaines suivantes
  while (jourCourant <= nombreJours) {
    semaine = Array(7).fill(null);
    for (let i = 0; i < 7 && jourCourant <= nombreJours; i++) {
      semaine[i] = jourCourant++;
    }
    calendrier.push(semaine);
  }

  return calendrier;
}

// Exemple d'utilisation
const calendrierSeptembre2023 = genererCalendrier(2023, 8); // 8 = septembre (0-indexed)
console.log(calendrierSeptembre2023);

// Affichage formaté du calendrier
const joursNoms = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const moisNoms = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function afficherCalendrier(calendrier, annee, mois) {
  console.log(`\n${moisNoms[mois]} ${annee}`);
  console.log(joursNoms.join("\t"));

  calendrier.forEach((semaine) => {
    const semaineFormatee = semaine.map((jour) =>
      jour === null ? "" : jour.toString().padStart(2)
    );
    console.log(semaineFormatee.join("\t"));
  });
}

afficherCalendrier(calendrierSeptembre2023, 2023, 8);
```

### Chronomètres et comptes à rebours

Implémentation d'un compte à rebours :

```javascript
function creerCompteARebours(dateCible, elementId) {
  const elementCompteARebours = document.getElementById(elementId);
  if (!elementCompteARebours) return;

  function mettreAJour() {
    const maintenant = new Date();
    const difference = dateCible - maintenant;

    if (difference <= 0) {
      elementCompteARebours.innerHTML = "Expiré!";
      clearInterval(interval);
      return;
    }

    const jours = Math.floor(difference / (1000 * 60 * 60 * 24));
    const heures = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const secondes = Math.floor((difference % (1000 * 60)) / 1000);

    elementCompteARebours.innerHTML = `${jours}j ${heures}h ${minutes}m ${secondes}s`;
  }

  // Mise à jour initiale
  mettreAJour();

  // Mise à jour toutes les secondes
  const interval = setInterval(mettreAJour, 1000);

  // Retourner une fonction pour arrêter le compte à rebours
  return () => clearInterval(interval);
}

// HTML: <div id="compte-a-rebours"></div>
// Utilisation:
const dateCible = new Date();
dateCible.setDate(dateCible.getDate() + 10); // 10 jours dans le futur
const arreterCompteARebours = creerCompteARebours(
  dateCible,
  "compte-a-rebours"
);

// Pour arrêter manuellement:
// arreterCompteARebours();
```

### Calcul d'âge

Fonction pour calculer l'âge à partir d'une date de naissance :

```javascript
function calculerAge(dateNaissance) {
  // Vérification de la validité de la date
  if (!(dateNaissance instanceof Date) || isNaN(dateNaissance)) {
    throw new Error("Date de naissance invalide");
  }

  const aujourdhui = new Date();

  // Calcul de base de l'âge
  let age = aujourdhui.getFullYear() - dateNaissance.getFullYear();

  // Vérifier si l'anniversaire est déjà passé cette année
  const moisAujourdhui = aujourdhui.getMonth();
  const jourAujourdhui = aujourdhui.getDate();
  const moisNaissance = dateNaissance.getMonth();
  const jourNaissance = dateNaissance.getDate();

  // Si l'anniversaire n'est pas encore passé cette année, soustraire 1
  if (
    moisNaissance > moisAujourdhui ||
    (moisNaissance === moisAujourdhui && jourNaissance > jourAujourdhui)
  ) {
    age--;
  }

  return age;
}

// Exemple d'utilisation
const dateNaissance = new Date(1990, 5, 15); // 15 juin 1990
const age = calculerAge(dateNaissance);
console.log(`Âge: ${age} ans`);
```

### Extraction de composants de date

Une fonction utilitaire pour extraire les composants d'une date :

```javascript
function extraireComposantsDate(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error("Date invalide");
  }

  return {
    annee: date.getFullYear(),
    mois: date.getMonth() + 1, // Convertir en 1-12
    jour: date.getDate(),
    jourSemaine: date.getDay(), // 0-6 (Dimanche-Samedi)
    heure: date.getHours(),
    minute: date.getMinutes(),
    seconde: date.getSeconds(),
    milliseconde: date.getMilliseconds(),
    timestamp: date.getTime(),
    timezoneOffset: date.getTimezoneOffset(),
  };
}

// Exemple d'utilisation
const date = new Date("2023-09-20T15:30:45Z");
const composants = extraireComposantsDate(date);
console.log(composants);

// Utilisation pour le formatage personnalisé
function formaterDateAvecComposants(date, format) {
  const comp = extraireComposantsDate(date);
  const joursNoms = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  const moisNoms = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  return format
    .replace("YYYY", comp.annee)
    .replace("MM", String(comp.mois).padStart(2, "0"))
    .replace("DD", String(comp.jour).padStart(2, "0"))
    .replace("HH", String(comp.heure).padStart(2, "0"))
    .replace("mm", String(comp.minute).padStart(2, "0"))
    .replace("ss", String(comp.seconde).padStart(2, "0"))
    .replace("MMMM", moisNoms[comp.mois - 1])
    .replace("MMM", moisNoms[comp.mois - 1].substring(0, 3))
    .replace("dddd", joursNoms[comp.jourSemaine])
    .replace("ddd", joursNoms[comp.jourSemaine].substring(0, 3));
}

console.log(formaterDateAvecComposants(date, "Le dddd DD MMMM YYYY à HH:mm"));
// "Le Mercredi 20 Septembre 2023 à 17:30" (heure locale)
```

## Pièges courants

### Le problème de mois (index 0-11)

Un des pièges les plus courants avec l'objet `Date` en JavaScript est que les mois sont indexés à partir de 0 :

```javascript
// Attention: les mois sont indexés à partir de 0 (0 = janvier, 11 = décembre)
const janvier = new Date(2023, 0, 15); // 15 janvier 2023
const decembre = new Date(2023, 11, 31); // 31 décembre 2023

// ERREUR COURANTE
const dateErronee = new Date(2023, 12, 15); // Ce n'est PAS le 15 décembre 2023!
console.log(dateErronee); // 15 janvier 2024 (mois 12 = janvier de l'année suivante)

// Fonction utilitaire pour éviter ce piège
function creerDate(annee, mois, jour) {
  // Vérifier que le mois est entre 1 et 12
  if (mois < 1 || mois > 12) {
    throw new Error("Le mois doit être entre 1 et 12");
  }
  // Convertir le mois de 1-12 à 0-11 pour l'objet Date
  return new Date(annee, mois - 1, jour);
}

const dateCorrecte = creerDate(2023, 12, 15); // 15 décembre 2023
console.log(dateCorrecte); // 2023-12-15T...
```

### Modifications involontaires

L'objet `Date` est mutable, ce qui peut entraîner des modifications accidentelles :

```javascript
function processDate(date) {
  // DANGER: ceci modifie l'objet original
  date.setDate(date.getDate() + 1);
  return date;
}

const maDate = new Date("2023-09-20");
console.log(maDate); // 2023-09-20T...

const resultat = processDate(maDate);
console.log(resultat); // 2023-09-21T...
console.log(maDate); // 2023-09-21T... (l'original a été modifié!)

// Solution: toujours cloner les dates avant de les modifier
function processDateSafe(date) {
  const clone = new Date(date.getTime());
  clone.setDate(clone.getDate() + 1);
  return clone;
}

const maDate2 = new Date("2023-09-20");
const resultat2 = processDateSafe(maDate2);
console.log(resultat2); // 2023-09-21T...
console.log(maDate2); // 2023-09-20T... (l'original reste inchangé)
```

### Problèmes de fuseaux horaires

Les problèmes de fuseaux horaires sont une source courante de bugs :

```javascript
// Création de date sans spécifier de fuseau horaire
const dateLocale = new Date("2023-09-20");
console.log(dateLocale.toISOString()); // Peut varier selon le fuseau horaire local

// Création de date avec fuseau horaire explicite
const dateUTC = new Date("2023-09-20T00:00:00Z"); // Z signifie UTC
console.log(dateUTC.toISOString()); // "2023-09-20T00:00:00.000Z" (constant)

// Problème: conversion implicite de fuseau horaire
const dateCreee = new Date(2023, 8, 20); // En fuseau horaire local
console.log(dateCreee.toISOString()); // Converti en UTC (peut être la veille selon le fuseau)

// Solution: être explicite avec les fuseaux horaires
const dateCreeeUTC = new Date(Date.UTC(2023, 8, 20));
console.log(dateCreeeUTC.toISOString()); // "2023-09-20T00:00:00.000Z" (garantie d'être le 20 septembre)

// Conversion entre heure locale et UTC
function afficherDifferenceFuseauHoraire(date) {
  const localeHours = date.getHours();
  const utcHours = date.getUTCHours();
  const diff = localeHours - utcHours;

  console.log(`Heure locale: ${localeHours}h`);
  console.log(`Heure UTC: ${utcHours}h`);
  console.log(`Différence: ${diff} heures`);
}

afficherDifferenceFuseauHoraire(new Date()); // Différence selon votre fuseau horaire
```

### Conversion de chaînes de date

Attention lors de la conversion de chaînes en dates :

```javascript
// DANGER: format ambigu
const dateAmbigue = new Date("09/20/2023");
// Aux États-Unis: 20 septembre 2023
// En Europe: 9 août 2023 (interprété comme jj/mm/aaaa)
console.log(dateAmbigue);

// Solution: utiliser le format ISO 8601 (non ambigu)
const dateISO = new Date("2023-09-20");
console.log(dateISO);

// Alternative: être explicite avec les composants
const dateExplicite = new Date(2023, 8, 20); // 20 septembre 2023
console.log(dateExplicite);

// Parsing sécurisé de date au format jj/mm/aaaa
function parseDate(dateStr) {
  const [jour, mois, annee] = dateStr.split("/").map(Number);
  return new Date(annee, mois - 1, jour);
}

const dateFr = parseDate("20/09/2023"); // Format français (jj/mm/aaaa)
console.log(dateFr); // 20 septembre 2023
```

## Date dans les navigateurs modernes

### Temporal API

La nouvelle API Temporal, encore à l'état de proposition, est conçue pour résoudre de nombreux problèmes de l'objet `Date` :

```javascript
// Attention: Temporal n'est pas encore implémenté nativement
// Vous pouvez utiliser un polyfill pour tester: https://github.com/js-temporal/temporal-polyfill

// Exemple de ce que Temporal permettra (syntaxe préliminaire)
/*
// Instant précis dans le temps (comme Date mais plus précis)
const instant = Temporal.Instant.from('2023-09-20T15:30:00Z');
console.log(instant.toString());

// Date sans heure ni fuseau horaire
const plainDate = Temporal.PlainDate.from('2023-09-20');
console.log(plainDate.toString()); // "2023-09-20" (garanti)

// Date et heure sans fuseau horaire
const plainDateTime = Temporal.PlainDateTime.from('2023-09-20T15:30:00');
console.log(plainDateTime.toString()); // "2023-09-20T15:30:00" (garanti)

// Date avec fuseau horaire explicite
const zonedDateTime = plainDateTime.toZonedDateTime('Europe/Paris');
console.log(zonedDateTime.toString());

// Opérations immutables
const demain = plainDate.add({ days: 1 });
console.log(plainDate.toString()); // Toujours "2023-09-20"
console.log(demain.toString()); // "2023-09-21"

// Durées
const duration = Temporal.Duration.from({ days: 5, hours: 6 });
console.log(duration.toString()); // "P5DT6H"
*/
```

### Compatibilité

Compatibilité des fonctionnalités de l'objet `Date` :

```javascript
// Vérifier la compatibilité des fonctionnalités modernes
function verifierCompatibilite() {
  const compatibilite = {
    dateFromISO: typeof Date.parse === "function",
    dateNow: typeof Date.now === "function",
    intl: typeof Intl !== "undefined",
    intlDateTimeFormat:
      typeof Intl === "object" && typeof Intl.DateTimeFormat === "function",
    intlRelativeTimeFormat:
      typeof Intl === "object" && typeof Intl.RelativeTimeFormat === "function",
    toISOString: typeof new Date().toISOString === "function",
    toLocaleString: typeof new Date().toLocaleString === "function",
    temporal: typeof Temporal !== "undefined",
  };

  return compatibilite;
}

console.log(verifierCompatibilite());

// Polyfill simple pour Date.now si nécessaire
if (!Date.now) {
  Date.now = function () {
    return new Date().getTime();
  };
}
```

## Ressources supplémentaires

- [MDN Web Docs: Date](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MDN Web Docs: Intl](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [date-fns Documentation](https://date-fns.org/)
- [Day.js Documentation](https://day.js.org/)
- [Luxon Documentation](https://moment.github.io/luxon/)
- [Proposal Temporal API](https://tc39.es/proposal-temporal/docs/)
- [JavaScript Date Internationalization](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString)

---

Ce guide a été créé pour fournir une vue d'ensemble complète de l'objet Date en JavaScript. N'hésitez pas à contribuer ou à suggérer des améliorations !
