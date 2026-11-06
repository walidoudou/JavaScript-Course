// Un module n'est évalué qu'une fois : ce tableau est partagé
// par tous les modules qui importent journal.js (singleton).
const messages = [];

export function noter(message) {
  messages.push(message);
}

export function lireJournal() {
  return [...messages];
}
