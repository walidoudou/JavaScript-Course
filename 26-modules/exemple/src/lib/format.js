// Export par défaut : une seule fonction principale par module.
const formateur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export default function formaterMontant(montant) {
  return formateur.format(montant);
}
