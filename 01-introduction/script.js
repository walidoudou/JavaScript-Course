// Chargé par index.html avec <script type="module">.
// Un module est exécuté une fois le HTML analysé : les éléments existent déjà.
console.log("Bonjour depuis script.js !");

const message = document.querySelector("#message");
const bouton = document.querySelector("#bouton");

message.textContent = `Page chargée à ${new Date().toLocaleTimeString("fr-FR")}.`;

let clics = 0;

bouton.addEventListener("click", () => {
  clics += 1;
  console.log(`Clic n° ${clics}`);
  message.textContent = `Vous avez cliqué ${clics} fois.`;
});
