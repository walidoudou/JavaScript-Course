// Interface : relie le DOM à la logique (taches.js) et au stockage (stockage.js).
// Principe : un seul état, une seule fonction d'affichage. Chaque action calcule
// un nouvel état, l'enregistre, puis réaffiche tout.
import { CLE, chargerTaches, sauvegarderTaches } from "./stockage.js";
import {
  ajouterTache,
  basculerTache,
  basculerToutes,
  compter,
  filtrerTaches,
  filtreDepuisHash,
  supprimerTache,
  supprimerTerminees,
} from "./taches.js";

const formulaire = document.querySelector("#formulaire");
const champ = document.querySelector("#nouvelle-tache");
const erreur = document.querySelector("#erreur");
const liste = document.querySelector("#liste");
const modele = document.querySelector("#modele-tache");
const vide = document.querySelector("#vide");
const barre = document.querySelector("#barre");
const pied = document.querySelector("#pied");
const compteur = document.querySelector("#compteur");
const boutonToutes = document.querySelector("#tout-basculer");
const boutonEffacer = document.querySelector("#effacer-terminees");
const liensFiltres = document.querySelectorAll("#filtres a");

const MESSAGES_VIDE = {
  toutes: "Aucune tâche pour l'instant. Ajoutez-en une ci-dessus.",
  actives: "Rien à faire : toutes les tâches sont terminées.",
  terminees: "Aucune tâche terminée.",
};

const etat = {
  taches: chargerTaches(),
  filtre: filtreDepuisHash(location.hash),
};

function afficherErreur(message) {
  erreur.textContent = message;
  erreur.hidden = !message;
}

/** Remplace les tâches, les enregistre et réaffiche. */
function mettreAJour(taches) {
  etat.taches = taches;
  const ok = sauvegarderTaches(taches);
  afficherErreur(
    ok
      ? ""
      : "Impossible d'enregistrer : vos tâches seront perdues à la fermeture de la page.",
  );
  afficher();
}

function creerElement(tache) {
  const element = modele.content.firstElementChild.cloneNode(true);
  const caseACocher = element.querySelector(".basculer");
  const titre = element.querySelector(".titre");
  element.dataset.id = tache.id;
  element.classList.toggle("terminee", tache.terminee);
  caseACocher.checked = tache.terminee;
  caseACocher.id = `tache-${tache.id}`;
  titre.htmlFor = caseACocher.id;
  titre.textContent = tache.titre; // textContent, jamais innerHTML : un titre « <img onerror=…> » reste du texte
  element
    .querySelector(".supprimer")
    .setAttribute("aria-label", `Supprimer « ${tache.titre} »`);
  return element;
}

function afficher() {
  const visibles = filtrerTaches(etat.taches, etat.filtre);
  const { total, actives, terminees } = compter(etat.taches);

  liste.replaceChildren(...visibles.map(creerElement));
  vide.hidden = visibles.length > 0;
  vide.textContent = MESSAGES_VIDE[etat.filtre];
  barre.hidden = total === 0;
  pied.hidden = total === 0;
  // En français, 0 et 1 sont au singulier : « 0 tâche restante ».
  compteur.textContent = `${actives} tâche${actives > 1 ? "s" : ""} restante${actives > 1 ? "s" : ""}`;
  boutonEffacer.hidden = terminees === 0;
  boutonToutes.textContent = actives === 0 ? "Tout décocher" : "Tout cocher";

  for (const lien of liensFiltres) {
    if (lien.hash === `#/${etat.filtre}`)
      lien.setAttribute("aria-current", "page");
    else lien.removeAttribute("aria-current");
  }
}

// --- Événements -------------------------------------------------------------

formulaire.addEventListener("submit", (evenement) => {
  evenement.preventDefault(); // pas de rechargement de la page
  try {
    mettreAJour(ajouterTache(etat.taches, champ.value));
    formulaire.reset();
  } catch (e) {
    afficherErreur(e.message); // titre vide (que des espaces) ou trop long
  }
  champ.focus();
});

// Délégation : un seul écouteur sur la liste, quel que soit le nombre de tâches,
// et il fonctionne aussi pour les éléments créés après coup.
liste.addEventListener("change", (evenement) => {
  if (!evenement.target.matches(".basculer")) return;
  const { id } = evenement.target.closest(".tache").dataset;
  mettreAJour(basculerTache(etat.taches, id));
});

liste.addEventListener("click", (evenement) => {
  const bouton = evenement.target.closest(".supprimer");
  if (!bouton) return;
  mettreAJour(supprimerTache(etat.taches, bouton.closest(".tache").dataset.id));
  champ.focus(); // l'élément qui avait le focus vient de disparaître
});

boutonToutes.addEventListener("click", () =>
  mettreAJour(basculerToutes(etat.taches)),
);
boutonEffacer.addEventListener("click", () =>
  mettreAJour(supprimerTerminees(etat.taches)),
);

// Les filtres sont de simples liens (#/actives…) : l'URL reste partageable
// et le bouton « Précédent » du navigateur fonctionne.
window.addEventListener("hashchange", () => {
  etat.filtre = filtreDepuisHash(location.hash);
  afficher();
});

// « storage » n'est déclenché que dans les AUTRES onglets de la même origine :
// on garde ainsi plusieurs onglets synchronisés.
window.addEventListener("storage", (evenement) => {
  if (evenement.key !== CLE && evenement.key !== null) return; // null : stockage vidé
  etat.taches = chargerTaches();
  afficher();
});

afficher();
