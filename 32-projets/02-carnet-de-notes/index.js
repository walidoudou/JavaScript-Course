// Affiche le rapport de la classe d'exemple dans le terminal.
// Les calculs gardent toute leur précision : on n'arrondit qu'à l'affichage.
import { coefficients, eleves } from "./donnees.js";
import {
  bulletin,
  classement,
  majorsParMatiere,
  regrouperParMention,
  statistiquesParMatiere,
} from "./src/carnet.js";

const nombre = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const formater = (valeur) => (valeur === null ? "—" : nombre.format(valeur));

const bulletins = classement(
  eleves.map((eleve) => bulletin(eleve, coefficients)),
);

console.log("Classement général");
console.table(
  bulletins.map(({ rang, nom, moyenne, mention }) => ({
    Rang: rang ?? "—",
    Élève: nom,
    Moyenne: formater(moyenne),
    Mention: mention ?? "—",
  })),
);

console.log("\nStatistiques par matière (sur les moyennes des élèves)");
const majors = majorsParMatiere(bulletins);
console.table(
  Object.fromEntries(
    Object.entries(statistiquesParMatiere(bulletins)).map(([matiere, s]) => [
      matiere,
      {
        Coef: coefficients[matiere] ?? 1,
        Moyenne: formater(s.moyenne),
        Médiane: formater(s.mediane),
        "Écart type": formater(s.ecartType),
        Min: formater(s.min),
        Max: formater(s.max),
        Major: majors[matiere].noms.join(", "),
      },
    ]),
  ),
);

console.log("\nÉlèves par mention");
for (const [libelle, noms] of Object.entries(regrouperParMention(bulletins))) {
  console.log(`- ${libelle} (${noms.length}) : ${noms.join(", ")}`);
}
