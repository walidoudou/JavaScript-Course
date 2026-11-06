// Chargé à la demande avec import() : absent du chemin de démarrage.
import { totalLigne } from "./prix.js";
import { noter } from "./journal.js";

export function versCsv(articles) {
  noter("export CSV");
  const lignes = articles.map((a) => [a.nom, a.quantite, totalLigne(a).toFixed(2)].join(";"));
  return ["nom;quantite;total", ...lignes].join("\n");
}
