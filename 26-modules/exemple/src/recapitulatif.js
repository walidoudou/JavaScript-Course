// Code partagé entre Node.js et le navigateur : aucune API propre à l'un ou à l'autre.
import panier from "../donnees/panier.json" with { type: "json" };
import { totalHT, totalTTC } from "#lib/prix.js";
import formaterMontant from "#lib/format.js";
import { noter } from "#lib/journal.js";

export { panier };

export function recapitulatif() {
  noter(`récapitulatif pour ${panier.client}`);
  return [
    `Panier de ${panier.client} (${panier.articles.length} articles)`,
    `Total HT  : ${formaterMontant(totalHT(panier.articles))}`,
    `Total TTC : ${formaterMontant(totalTTC(panier.articles))}`,
  ].join("\n");
}
