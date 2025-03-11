# Les Classes en JavaScript

## Table des matières

- [Introduction](#introduction)
- [Déclaration de classes](#déclaration-de-classes)
  - [Syntaxe de base](#syntaxe-de-base)
  - [Expressions de classe](#expressions-de-classe)
  - [Création d'instances](#création-dinstances)
- [Constructeurs et propriétés](#constructeurs-et-propriétés)
  - [Méthode constructor](#méthode-constructor)
  - [Propriétés d'instance](#propriétés-dinstance)
  - [Champs de classe](#champs-de-classe)
- [Méthodes](#méthodes)
  - [Méthodes d'instance](#méthodes-dinstance)
  - [Méthodes statiques](#méthodes-statiques)
- [Héritage](#héritage)
  - [Extension de classes](#extension-de-classes)
  - [Appel au constructeur parent](#appel-au-constructeur-parent)
  - [Surcharge de méthodes](#surcharge-de-méthodes)
- [Getters et Setters](#getters-et-setters)
- [Propriétés et méthodes statiques](#propriétés-et-méthodes-statiques)
- [Modificateurs d'accès](#modificateurs-daccès)
  - [Champs privés](#champs-privés)
  - [Méthodes privées](#méthodes-privées)
- [Classes avancées](#classes-avancées)
  - [Classes abstraites](#classes-abstraites)
  - [Classes comme expressions](#classes-comme-expressions)
  - [Mixins et composition](#mixins-et-composition)
- [Classes vs Prototypes](#classes-vs-prototypes)
  - [Héritage prototypal traditionnel](#héritage-prototypal-traditionnel)
  - [Comparaison avec les classes](#comparaison-avec-les-classes)
- [Patterns de conception avec les classes](#patterns-de-conception-avec-les-classes)
  - [Singleton](#singleton)
  - [Factory](#factory)
  - [Observer](#observer)
- [Bonnes pratiques](#bonnes-pratiques)
- [Pièges et erreurs courantes](#pièges-et-erreurs-courantes)
- [Ressources supplémentaires](#ressources-supplémentaires)

## Introduction

Les classes en JavaScript, introduites dans ECMAScript 2015 (ES6), offrent une syntaxe plus claire et plus intuitive pour la programmation orientée objet. Bien que JavaScript soit fondamentalement basé sur des prototypes, les classes fournissent une abstraction syntaxique qui permet d'adopter un style de programmation orientée objet similaire à celui des langages comme Java ou C#.

Une classe JavaScript est essentiellement un modèle pour créer des objets, encapsulant des données (propriétés) et du comportement (méthodes). Les classes permettent de structurer le code de manière plus organisée, facilitant la réutilisation, l'extension et la maintenance du code.

## Déclaration de classes

### Syntaxe de base

La déclaration d'une classe en JavaScript utilise le mot-clé `class` suivi du nom de la classe et d'un bloc de code définissant son contenu.

```javascript
class Personne {
  constructor(nom, age) {
    this.nom = nom;
    this.age = age;
  }

  saluer() {
    return `Bonjour, je m'appelle ${this.nom} et j'ai ${this.age} ans.`;
  }
}
```

### Expressions de classe

Comme les fonctions, les classes peuvent être définies par des expressions. Elles peuvent être nommées ou anonymes.

```javascript
// Expression de classe anonyme
const Vehicule = class {
  constructor(marque) {
    this.marque = marque;
  }
};

// Expression de classe nommée
const Animal = class Animal {
  constructor(espece) {
    this.espece = espece;
  }
};
```

### Création d'instances

Pour créer une instance d'une classe, on utilise l'opérateur `new` suivi du nom de la classe et des arguments à passer au constructeur.

```javascript
const alice = new Personne("Alice", 30);
console.log(alice.saluer()); // "Bonjour, je m'appelle Alice et j'ai 30 ans."

const voiture = new Vehicule("Toyota");
console.log(voiture.marque); // "Toyota"
```

## Constructeurs et propriétés

### Méthode constructor

La méthode `constructor` est une méthode spéciale d'une classe qui est appelée automatiquement lors de la création d'une instance. Elle permet d'initialiser les propriétés de l'objet.

```javascript
class Rectangle {
  constructor(largeur, hauteur) {
    this.largeur = largeur;
    this.hauteur = hauteur;
  }
}
```

Si une classe ne définit pas de constructeur, un constructeur vide par défaut est utilisé.

### Propriétés d'instance

Les propriétés d'instance sont des valeurs spécifiques à chaque instance de la classe. Elles sont généralement définies dans le constructeur.

```javascript
class Utilisateur {
  constructor(nom, email) {
    this.nom = nom; // Propriété d'instance
    this.email = email; // Propriété d'instance
    this.dateInscription = new Date(); // Valeur par défaut
  }
}

const user1 = new Utilisateur("Jean", "jean@example.com");
const user2 = new Utilisateur("Marie", "marie@example.com");

console.log(user1.nom); // "Jean"
console.log(user2.nom); // "Marie"
```

### Champs de classe

Les champs de classe (Class fields) sont une fonctionnalité plus récente qui permet de déclarer des propriétés directement dans la définition de la classe, sans passer par le constructeur.

```javascript
class Produit {
  // Champs de classe publics
  nom;
  prix;
  categorie = "Non catégorisé"; // Avec valeur par défaut

  constructor(nom, prix) {
    this.nom = nom;
    this.prix = prix;
  }
}

const prod = new Produit("Ordinateur", 1200);
console.log(prod.categorie); // "Non catégorisé"
```

## Méthodes

### Méthodes d'instance

Les méthodes d'instance sont des fonctions définies dans la classe qui sont disponibles sur chaque instance de la classe.

```javascript
class Calculatrice {
  constructor(valeurInitiale = 0) {
    this.valeur = valeurInitiale;
  }

  ajouter(nombre) {
    this.valeur += nombre;
    return this; // Pour permettre le chaînage
  }

  soustraire(nombre) {
    this.valeur -= nombre;
    return this;
  }

  multiplier(nombre) {
    this.valeur *= nombre;
    return this;
  }

  getValeur() {
    return this.valeur;
  }
}

const calc = new Calculatrice(10);
const resultat = calc.ajouter(5).multiplier(2).soustraire(7).getValeur();
console.log(resultat); // 23
```

### Méthodes statiques

Les méthodes statiques sont appelées sur la classe elle-même, pas sur les instances. Elles sont souvent utilisées pour des opérations utilitaires liées à la classe.

```javascript
class MathUtils {
  static carre(x) {
    return x * x;
  }

  static estPair(nombre) {
    return nombre % 2 === 0;
  }
}

console.log(MathUtils.carre(4)); // 16
console.log(MathUtils.estPair(5)); // false
```

## Héritage

### Extension de classes

L'héritage permet à une classe d'hériter des propriétés et méthodes d'une autre classe, favorisant la réutilisation du code. On utilise le mot-clé `extends` pour créer une classe qui hérite d'une autre.

```javascript
class Animal {
  constructor(nom) {
    this.nom = nom;
  }

  manger() {
    return `${this.nom} est en train de manger.`;
  }
}

class Chien extends Animal {
  aboyer() {
    return `${this.nom} fait ouaf ouaf !`;
  }
}

const rex = new Chien("Rex");
console.log(rex.manger()); // "Rex est en train de manger."
console.log(rex.aboyer()); // "Rex fait ouaf ouaf !"
```

### Appel au constructeur parent

Le mot-clé `super` est utilisé pour appeler des fonctions sur la classe parente d'un objet, notamment son constructeur.

```javascript
class Personne {
  constructor(nom, age) {
    this.nom = nom;
    this.age = age;
  }
}

class Employe extends Personne {
  constructor(nom, age, poste, salaire) {
    super(nom, age); // Appel du constructeur parent
    this.poste = poste;
    this.salaire = salaire;
  }

  obtenirInfos() {
    return `${this.nom}, ${this.age} ans, ${this.poste}, ${this.salaire}€`;
  }
}

const emp = new Employe("Alice", 30, "Développeuse", 50000);
console.log(emp.obtenirInfos()); // "Alice, 30 ans, Développeuse, 50000€"
```

### Surcharge de méthodes

Une classe enfant peut redéfinir (surcharger) une méthode de la classe parente.

```javascript
class Vehicule {
  constructor(marque) {
    this.marque = marque;
  }

  description() {
    return `Véhicule de marque ${this.marque}`;
  }
}

class Voiture extends Vehicule {
  constructor(marque, modele) {
    super(marque);
    this.modele = modele;
  }

  description() {
    return `${super.description()}, modèle ${this.modele}`;
  }
}

const maVoiture = new Voiture("Toyota", "Corolla");
console.log(maVoiture.description()); // "Véhicule de marque Toyota, modèle Corolla"
```

## Getters et Setters

Les getters et setters permettent de contrôler l'accès aux propriétés d'une classe.

```javascript
class Compte {
  constructor() {
    this._solde = 0; // Convention: préfixe _ pour propriété "privée"
  }

  get solde() {
    console.log("Accès au solde");
    return this._solde;
  }

  set solde(nouveauSolde) {
    if (nouveauSolde < 0) {
      throw new Error("Le solde ne peut pas être négatif");
    }
    console.log(`Modification du solde: ${this._solde} -> ${nouveauSolde}`);
    this._solde = nouveauSolde;
  }
}

const monCompte = new Compte();
monCompte.solde = 100; // Utilise le setter
console.log(monCompte.solde); // Utilise le getter, affiche 100
// monCompte.solde = -50; // Erreur: Le solde ne peut pas être négatif
```

## Propriétés et méthodes statiques

Les propriétés et méthodes statiques appartiennent à la classe elle-même, pas aux instances.

```javascript
class Configuration {
  static API_URL = "https://api.example.com";
  static MODE = "production";

  static getFullApiUrl(endpoint) {
    return `${this.API_URL}/${endpoint}`;
  }

  static setMode(mode) {
    if (["development", "production", "test"].includes(mode)) {
      this.MODE = mode;
    } else {
      throw new Error("Mode non valide");
    }
  }
}

console.log(Configuration.API_URL); // "https://api.example.com"
console.log(Configuration.getFullApiUrl("users")); // "https://api.example.com/users"
Configuration.setMode("development");
console.log(Configuration.MODE); // "development"
```

## Modificateurs d'accès

### Champs privés

Les champs privés (introduits dans une version plus récente de JavaScript) sont des propriétés qui ne sont accessibles qu'à l'intérieur de la classe. Ils sont préfixés par `#`.

```javascript
class Utilisateur {
  #motDePasse;

  constructor(nom, motDePasse) {
    this.nom = nom;
    this.#motDePasse = motDePasse;
  }

  verifierMotDePasse(tentative) {
    return this.#motDePasse === tentative;
  }

  changerMotDePasse(ancienMDP, nouveauMDP) {
    if (this.verifierMotDePasse(ancienMDP)) {
      this.#motDePasse = nouveauMDP;
      return true;
    }
    return false;
  }
}

const user = new Utilisateur("alice", "azerty123");
console.log(user.verifierMotDePasse("azerty123")); // true
console.log(user.changerMotDePasse("azerty123", "qwerty456")); // true
// console.log(user.#motDePasse); // Erreur: La propriété privée '#motDePasse' n'est pas accessible
```

### Méthodes privées

De même, les méthodes privées ne sont accessibles qu'à l'intérieur de la classe.

```javascript
class GestionnaireAuthentification {
  #utilisateurs = [];

  inscrireUtilisateur(identifiant, motDePasse) {
    const utilisateurExistant = this.#trouverUtilisateur(identifiant);
    if (utilisateurExistant) {
      throw new Error("Identifiant déjà utilisé");
    }

    const motDePasseHache = this.#hacherMotDePasse(motDePasse);
    this.#utilisateurs.push({ identifiant, motDePasse: motDePasseHache });
    return true;
  }

  #trouverUtilisateur(identifiant) {
    return this.#utilisateurs.find((u) => u.identifiant === identifiant);
  }

  #hacherMotDePasse(motDePasse) {
    // Simulation d'un hachage de mot de passe
    return motDePasse.split("").reverse().join("") + "hashed";
  }
}

const auth = new GestionnaireAuthentification();
auth.inscrireUtilisateur("alice", "secret");
// auth.#trouverUtilisateur('alice'); // Erreur: La méthode privée n'est pas accessible
```

## Classes avancées

### Classes abstraites

JavaScript ne supporte pas nativement les classes abstraites, mais on peut simuler ce comportement.

```javascript
class Forme {
  constructor() {
    if (new.target === Forme) {
      throw new TypeError(
        'La classe abstraite "Forme" ne peut pas être instanciée directement'
      );
    }
  }

  calculerAire() {
    throw new Error(
      'La méthode "calculerAire" doit être implémentée par les classes dérivées'
    );
  }
}

class Rectangle extends Forme {
  constructor(largeur, hauteur) {
    super();
    this.largeur = largeur;
    this.hauteur = hauteur;
  }

  calculerAire() {
    return this.largeur * this.hauteur;
  }
}

// const forme = new Forme(); // Erreur: La classe abstraite "Forme" ne peut pas être instanciée directement
const rectangle = new Rectangle(5, 3);
console.log(rectangle.calculerAire()); // 15
```

### Classes comme expressions

Les classes peuvent être utilisées dans des expressions, permettant des patterns avancés comme les classes anonymes et les fonctions de fabrique de classe.

```javascript
// Fonction qui retourne une classe
function creerClasseAnimal(type) {
  return class {
    constructor(nom) {
      this.nom = nom;
      this.type = type;
    }

    description() {
      return `${this.nom} est un ${this.type}`;
    }
  };
}

const ClasseChien = creerClasseAnimal("chien");
const ClasseChat = creerClasseAnimal("chat");

const rex = new ClasseChien("Rex");
const felix = new ClasseChat("Felix");

console.log(rex.description()); // "Rex est un chien"
console.log(felix.description()); // "Felix est un chat"
```

### Mixins et composition

Les mixins permettent de composer des classes en ajoutant des méthodes et propriétés provenant de différentes sources.

```javascript
// Mixin: objet contenant des méthodes
const LoggerMixin = {
  log(message) {
    console.log(`[${this.constructor.name}] ${message}`);
  },
  warn(message) {
    console.warn(`[${this.constructor.name}] ATTENTION: ${message}`);
  },
  error(message) {
    console.error(`[${this.constructor.name}] ERREUR: ${message}`);
  },
};

// Fonction pour appliquer un mixin à une classe
function applyMixin(targetClass, mixin) {
  Object.getOwnPropertyNames(mixin).forEach((property) => {
    Object.defineProperty(
      targetClass.prototype,
      property,
      Object.getOwnPropertyDescriptor(mixin, property)
    );
  });
}

class Application {
  constructor(nom) {
    this.nom = nom;
  }

  demarrer() {
    this.log(`Application ${this.nom} démarrée`);
  }
}

// Appliquer le mixin
applyMixin(Application, LoggerMixin);

const app = new Application("MonApp");
app.demarrer(); // "[Application] Application MonApp démarrée"
app.warn("Ressources limitées"); // "[Application] ATTENTION: Ressources limitées"
```

## Classes vs Prototypes

### Héritage prototypal traditionnel

Avant ES6, l'héritage en JavaScript était réalisé à l'aide de prototypes.

```javascript
// Construction d'objets avec fonction constructeur
function Personne(nom, age) {
  this.nom = nom;
  this.age = age;
}

// Ajout de méthodes au prototype
Personne.prototype.saluer = function () {
  return `Bonjour, je m'appelle ${this.nom} et j'ai ${this.age} ans.`;
};

// Héritage prototypal
function Employe(nom, age, poste) {
  // Appel du constructeur parent
  Personne.call(this, nom, age);
  this.poste = poste;
}

// Configuration de la chaîne de prototypes
Employe.prototype = Object.create(Personne.prototype);
Employe.prototype.constructor = Employe;

// Ajout de méthodes spécifiques à Employe
Employe.prototype.travailler = function () {
  return `${this.nom} travaille comme ${this.poste}.`;
};

const alice = new Personne("Alice", 30);
console.log(alice.saluer()); // "Bonjour, je m'appelle Alice et j'ai 30 ans."

const bob = new Employe("Bob", 25, "Développeur");
console.log(bob.saluer()); // "Bonjour, je m'appelle Bob et j'ai 25 ans."
console.log(bob.travailler()); // "Bob travaille comme Développeur."
```

### Comparaison avec les classes

Les classes ES6 sont essentiellement du "sucre syntaxique" par-dessus le système de prototypes de JavaScript.

```javascript
// Avec classes ES6
class Personne {
  constructor(nom, age) {
    this.nom = nom;
    this.age = age;
  }

  saluer() {
    return `Bonjour, je m'appelle ${this.nom} et j'ai ${this.age} ans.`;
  }
}

class Employe extends Personne {
  constructor(nom, age, poste) {
    super(nom, age);
    this.poste = poste;
  }

  travailler() {
    return `${this.nom} travaille comme ${this.poste}.`;
  }
}

// Le résultat est équivalent à l'exemple précédent
```

Différences et similarités :

- Les classes offrent une syntaxe plus claire et plus similaire à d'autres langages OO
- Les classes sont hoistées mais pas initialisées (contrairement aux fonctions)
- Les méthodes de classe sont non-énumérables par défaut
- Les deux approches utilisent toujours le système de prototypes en interne

## Patterns de conception avec les classes

### Singleton

Le pattern Singleton garantit qu'une classe n'a qu'une seule instance et fournit un point d'accès global à cette instance.

```javascript
class ConfigurationSingleton {
  static #instance;

  constructor() {
    if (ConfigurationSingleton.#instance) {
      return ConfigurationSingleton.#instance;
    }

    this.config = {
      apiUrl: "https://api.example.com",
      timeout: 5000,
      mode: "production",
    };

    ConfigurationSingleton.#instance = this;
  }

  getConfig() {
    return { ...this.config }; // Retourne une copie
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

const config1 = new ConfigurationSingleton();
const config2 = new ConfigurationSingleton();

console.log(config1 === config2); // true - même instance

config1.updateConfig({ timeout: 10000 });
console.log(config2.getConfig().timeout); // 10000 - les modifications sont partagées
```

### Factory

Le pattern Factory encapsule la logique de création d'objets.

```javascript
class Vehicule {
  constructor(marque, modele) {
    this.marque = marque;
    this.modele = modele;
  }
}

class Voiture extends Vehicule {
  constructor(marque, modele, portes = 4) {
    super(marque, modele);
    this.type = "voiture";
    this.portes = portes;
  }
}

class Moto extends Vehicule {
  constructor(marque, modele, cylindree) {
    super(marque, modele);
    this.type = "moto";
    this.cylindree = cylindree;
  }
}

class VehiculeFactory {
  static createVehicule(type, options) {
    switch (type.toLowerCase()) {
      case "voiture":
        return new Voiture(options.marque, options.modele, options.portes);
      case "moto":
        return new Moto(options.marque, options.modele, options.cylindree);
      default:
        throw new Error(`Type de véhicule non pris en charge: ${type}`);
    }
  }
}

const maVoiture = VehiculeFactory.createVehicule("voiture", {
  marque: "Toyota",
  modele: "Corolla",
  portes: 5,
});

const maMoto = VehiculeFactory.createVehicule("moto", {
  marque: "Honda",
  modele: "CBR",
  cylindree: 1000,
});

console.log(maVoiture); // Voiture { marque: 'Toyota', modele: 'Corolla', type: 'voiture', portes: 5 }
console.log(maMoto); // Moto { marque: 'Honda', modele: 'CBR', type: 'moto', cylindree: 1000 }
```

### Observer

Le pattern Observer permet à un objet de notifier d'autres objets des changements d'état.

```javascript
class Observable {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify(data) {
    this.observers.forEach((observer) => observer.update(data));
  }
}

class NewsPublisher extends Observable {
  constructor() {
    super();
    this.news = [];
  }

  addNews(news) {
    this.news.push(news);
    this.notify(news);
  }
}

class NewsSubscriber {
  constructor(name) {
    this.name = name;
  }

  update(news) {
    console.log(`${this.name} a reçu une nouvelle: ${news.title}`);
  }
}

const publisher = new NewsPublisher();

const subscriber1 = new NewsSubscriber("Alice");
const subscriber2 = new NewsSubscriber("Bob");

publisher.subscribe(subscriber1);
publisher.subscribe(subscriber2);

publisher.addNews({
  title: "JavaScript élu langage de l'année",
  content: "...",
});
// Alice a reçu une nouvelle: JavaScript élu langage de l'année
// Bob a reçu une nouvelle: JavaScript élu langage de l'année

publisher.unsubscribe(subscriber1);
publisher.addNews({ title: "Nouvel article sur les classes", content: "..." });
// Bob a reçu une nouvelle: Nouvel article sur les classes
```

## Bonnes pratiques

1. **Utilisez des noms de classe significatifs**

```javascript
// À éviter
class X {}

// Préférable
class GestionnaireUtilisateurs {}
```

2. **Une classe, une responsabilité**

```javascript
// À éviter - trop de responsabilités
class Utilisateur {
  constructor(nom) {
    this.nom = nom;
  }

  sauvegarderDansBaseDeDonnees() {}
  envoyerEmail() {}
  genererRapportPDF() {}
}

// Préférable - séparation des responsabilités
class Utilisateur {
  constructor(nom) {
    this.nom = nom;
  }
}

class UtilisateurRepository {
  sauvegarder(utilisateur) {}
  charger(id) {}
}

class EmailService {
  envoyer(destinataire, sujet, contenu) {}
}
```

3. **Préférez la composition à l'héritage quand c'est approprié**

```javascript
// Héritage - peut devenir complexe avec plusieurs niveaux
class Animal {}
class Mammifere extends Animal {}
class Chien extends Mammifere {}
class ChienDeChasse extends Chien {}

// Composition - plus flexible
class Animal {
  constructor(attributs) {
    this.attributs = { ...attributs };
  }

  ajouterAttribut(nom, valeur) {
    this.attributs[nom] = valeur;
  }
}

const chien = new Animal({
  espece: "chien",
  peutMarcher: true,
  peutNager: true,
});

chien.ajouterAttribut("peutChasser", true);
```

4. **Utilisez des champs privés pour l'encapsulation**

```javascript
class CompteBancaire {
  #solde = 0;
  #historique = [];

  deposer(montant) {
    if (montant <= 0) throw new Error("Le montant doit être positif");
    this.#solde += montant;
    this.#enregistrerTransaction("dépôt", montant);
    return this.#solde;
  }

  retirer(montant) {
    if (montant <= 0) throw new Error("Le montant doit être positif");
    if (montant > this.#solde) throw new Error("Solde insuffisant");
    this.#solde -= montant;
    this.#enregistrerTransaction("retrait", montant);
    return this.#solde;
  }

  getSolde() {
    return this.#solde;
  }

  #enregistrerTransaction(type, montant) {
    this.#historique.push({
      type,
      montant,
      date: new Date(),
    });
  }
}
```

5. **Documentez vos classes avec JSDoc**

```javascript
/**
 * Représente un utilisateur du système.
 */
class Utilisateur {
  /**
   * Crée une instance d'Utilisateur.
   * @param {string} nom - Le nom de l'utilisateur.
   * @param {string} email - L'email de l'utilisateur.
   */
  constructor(nom, email) {
    this.nom = nom;
    this.email = email;
  }

  /**
   * Envoie un message à l'utilisateur.
   * @param {string} sujet - Le sujet du message.
   * @param {string} contenu - Le contenu du message.
   * @returns {boolean} - True si l'envoi est réussi, sinon False.
   */
  envoyerMessage(sujet, contenu) {
    // Implémentation
    return true;
  }
}
```

## Pièges et erreurs courantes

1. **Oublier d'appeler `super()` dans les constructeurs dérivés**

```javascript
class Base {
  constructor() {
    this.prop = "valeur";
  }
}

class Derivee extends Base {
  constructor() {
    // Erreur: Le constructeur dérivé doit appeler super() avant d'accéder à this
    this.autreProp = "autre valeur";
    super();
  }
}

// Correction
class DeriveCorrigee extends Base {
  constructor() {
    super(); // Appeler super() avant d'utiliser this
    this.autreProp = "autre valeur";
  }
}
```

2. **Confusion entre méthodes statiques et d'instance**

```javascript
class MathUtils {
  static calculerAire(largeur, hauteur) {
    return largeur * hauteur;
  }

  doubler(nombre) {
    return nombre * 2;
  }
}

// Correct
console.log(MathUtils.calculerAire(5, 4)); // 20

// Erreur: doubler est une méthode d'instance, pas statique
// console.log(MathUtils.doubler(10)); // TypeError: MathUtils.doubler is not a function

// Correct
const utils = new MathUtils();
console.log(utils.doubler(10)); // 20

// Erreur: calculerAire est une méthode statique, pas d'instance
// console.log(utils.calculerAire(5, 4)); // TypeError: utils.calculerAire is not a function
```

3. **Modifications du prototype après la création de la classe**

```javascript
class Exemple {
  methode() {
    return "original";
  }
}

const instance = new Exemple();
console.log(instance.methode()); // "original"

// Modification du prototype - déconseillé
Exemple.prototype.methode = function () {
  return "modifié";
};

console.log(instance.methode()); // "modifié" - peut causer des bugs inattendus
```

4. **this dans les méthodes de classe**

```javascript
class Bouton {
  constructor(texte) {
    this.texte = texte;
    this.element = document.createElement("button");
    this.element.textContent = texte;

    // Problème: la valeur de this est perdue lors de l'appel à onClick
    this.element.addEventListener("click", this.onClick);

    // Solution 1: binding
    this.element.addEventListener("click", this.onClick.bind(this));

    // Solution 2: fonction fléchée
    this.element.addEventListener("click", () => this.onClick());
  }

  onClick() {
    console.log(`Bouton "${this.texte}" cliqué`);
  }
}
```

5. **Confusion entre champs de classe et propriétés d'instance**

```javascript
class Exemple {
  // Champ de classe - partagé entre toutes les instances
  static compteur = 0;

  // Propriété d'instance - unique pour chaque instance
  compteurInstance = 0;

  constructor() {
    Exemple.compteur++;
    this.compteurInstance++;
  }
}

const a = new Exemple();
console.log(Exemple.compteur); // 1
console.log(a.compteurInstance); // 1

const b = new Exemple();
console.log(Exemple.compteur); // 2 (partagé)
console.log(b.compteurInstance); // 1 (unique à b)
console.log(a.compteurInstance); // toujours 1 (unique à a)
```

## Ressources supplémentaires

- [Documentation MDN sur les classes](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Classes)
- [JavaScript.info - Classes](https://fr.javascript.info/classes)
- [ECMAScript 6 pour les développeurs de Classe(s)](https://www.sitepoint.com/object-oriented-javascript-deep-dive-es6-classes/)
- [Design Patterns en JavaScript](https://www.patterns.dev/posts)
- [Comprendre les prototypes en JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)

---

Ce README a été créé pour fournir une vue d'ensemble complète des classes en JavaScript. N'hésitez pas à contribuer ou à suggérer des améliorations !
