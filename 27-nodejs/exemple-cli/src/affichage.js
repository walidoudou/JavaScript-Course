// Mise en forme pour le terminal. styleText désactive les couleurs toute seule
// quand la sortie n'est pas un terminal (redirection, pipe) ou si NO_COLOR est défini.
import { styleText } from "node:util";

const marquePriorite = {
  haute: styleText(["bold", "red"], "!"),
  normale: " ",
  basse: styleText("dim", "↓"),
};

export function formaterTache(tache) {
  const caseACocher = tache.faite ? styleText("green", "[x]") : "[ ]";
  const numero = styleText("gray", String(tache.id).padStart(3));
  const texte = tache.faite ? styleText("dim", tache.texte) : tache.texte;
  return `${numero} ${caseACocher} ${marquePriorite[tache.priorite]} ${texte}`;
}

export function formaterListe(taches) {
  if (taches.length === 0) return styleText("gray", "Aucune tâche. Ajoutez-en une : taches ajouter \"…\"");
  return taches.map(formaterTache).join("\n");
}

export function succes(message) {
  return `${styleText("green", "✓")} ${message}`;
}

export function erreur(message) {
  return `${styleText("red", "Erreur :", { stream: process.stderr })} ${message}`;
}
