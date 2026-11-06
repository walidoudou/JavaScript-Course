// Interface : formulaire de recherche, états (chargement / erreur / résultat), affichage.
import {
  chercherLieux,
  derniereSeulement,
  ErreurMeteo,
  obtenirPrevisions,
} from "./api.js";
import { formaterJour, libelleLieu } from "./meteo.js";

const $ = (selecteur) => document.querySelector(selecteur);

const formulaire = $("#recherche");
const champ = $("#ville");
const statut = $("#statut");
const resultat = $("#resultat");
const autresLieux = $("#autres-lieux");
const listeLieux = $("#lieux");
const modeleJour = $("#modele-jour");

let lieuxTrouves = [];

function afficherStatut(message, type = "info") {
  statut.textContent = message;
  statut.dataset.type = type;
}

/**
 * Exécute une étape asynchrone en gérant les états de l'interface.
 * derniereSeulement annule l'étape précédente si elle n'est pas terminée.
 */
const executer = derniereSeulement(async (signal, etape) => {
  resultat.setAttribute("aria-busy", "true");
  afficherStatut("Chargement…");
  try {
    await etape(signal);
    afficherStatut("");
  } catch (erreur) {
    if (erreur.name === "AbortError") return; // remplacée par une demande plus récente : rien à afficher
    if (erreur instanceof ErreurMeteo) {
      afficherStatut(erreur.message, "erreur"); // erreur prévue : son message est fait pour l'utilisateur
    } else {
      console.error(erreur); // bogue : détail technique pour le développeur
      afficherStatut(
        "Une erreur inattendue est survenue. Réessayez.",
        "erreur",
      );
    }
  } finally {
    // Si la demande a été annulée, c'est la suivante qui gère l'état « occupé ».
    if (!signal.aborted) resultat.removeAttribute("aria-busy");
  }
});

async function afficherLieu(lieu, signal) {
  const previsions = await obtenirPrevisions(lieu, { signal });
  afficherPrevisions(lieu, previsions);
  afficherAutresLieux(lieu);
}

function afficherPrevisions(lieu, { actuel, jours }) {
  $("#lieu").textContent = libelleLieu(lieu);
  $("#icone").textContent = actuel.icone;
  $("#temperature").textContent = actuel.temperature;
  $("#description").textContent = actuel.description;
  $("#ressentie").textContent = actuel.ressentie;
  $("#humidite").textContent = actuel.humidite;
  $("#vent").textContent = actuel.vent;
  $("#heure").textContent = actuel.heure;

  $("#jours").replaceChildren(
    ...jours.map((jour, i) => {
      const element = modeleJour.content.firstElementChild.cloneNode(true);
      element.querySelector(".nom").textContent =
        i === 0 ? "Aujourd'hui" : formaterJour(jour.date);
      element.querySelector(".icone").textContent = jour.icone;
      element.querySelector(".description").textContent = jour.description;
      element.querySelector(".temperatures").textContent =
        `${jour.min} / ${jour.max}`;
      element.querySelector(".pluie").textContent =
        jour.pluie === null ? "" : `pluie ${jour.pluie} %`;
      return element;
    }),
  );
  resultat.hidden = false;
}

/** Les homonymes (Paris, Texas…) restent accessibles en un clic. */
function afficherAutresLieux(lieuAffiche) {
  const autres = lieuxTrouves.filter((l) => l.id !== lieuAffiche.id);
  listeLieux.replaceChildren(
    ...autres.map((lieu) => {
      const item = document.createElement("li");
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.dataset.id = lieu.id;
      bouton.textContent = libelleLieu(lieu);
      item.append(bouton);
      return item;
    }),
  );
  autresLieux.hidden = autres.length === 0;
}

formulaire.addEventListener("submit", (evenement) => {
  evenement.preventDefault();
  const nom = champ.value.trim();
  if (nom.length < 2) {
    afficherStatut("Saisissez au moins deux caractères.", "erreur");
    return;
  }
  executer(async (signal) => {
    const lieux = await chercherLieux(nom, { signal });
    if (lieux.length === 0)
      throw new ErreurMeteo(`Aucun lieu trouvé pour « ${nom} ».`);
    lieuxTrouves = lieux;
    await afficherLieu(lieux[0], signal);
  });
});

// Délégation : un seul écouteur pour tous les boutons d'homonymes.
listeLieux.addEventListener("click", (evenement) => {
  const bouton = evenement.target.closest("button[data-id]");
  if (!bouton) return;
  const lieu = lieuxTrouves.find((l) => String(l.id) === bouton.dataset.id);
  executer((signal) => afficherLieu(lieu, signal));
});
