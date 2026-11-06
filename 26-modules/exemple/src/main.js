// Point d'entrée Node.js : node src/main.js [--csv]
import path from "node:path";
import { recapitulatif, panier } from "./recapitulatif.js";
import { lireJournal } from "#lib/journal.js";

console.log(recapitulatif());

if (process.argv.includes("--csv")) {
  // Import dynamique : csv.js n'est chargé que si l'option est présente.
  const { versCsv } = await import("#lib/csv.js");
  console.log(`\n${versCsv(panier.articles)}`);
}

console.log(`\nModule courant : ${path.relative(process.cwd(), import.meta.filename)}`);
console.log(`Journal : ${lireJournal().join(" | ")}`);
