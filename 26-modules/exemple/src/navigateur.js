// Point d'entrée navigateur, chargé par index.html.
import { recapitulatif, panier } from "./recapitulatif.js";
import { lireJournal } from "#lib/journal.js";

const sortie = document.querySelector("#sortie");
sortie.textContent = recapitulatif();

document.querySelector("#bouton-csv").addEventListener("click", async () => {
  const { versCsv } = await import("#lib/csv.js");
  sortie.textContent += `\n\n${versCsv(panier.articles)}`;
  document.querySelector("#journal").textContent = lireJournal().join(" | ");
});
