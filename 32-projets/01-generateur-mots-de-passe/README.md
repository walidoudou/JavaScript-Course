# Projet 1 — Générateur de mots de passe (solution)

Solution du [projet 1 du chapitre 32](../README.md#projet-1--générateur-de-mots-de-passe). Aucune dépendance : Node.js 22 ou plus suffit (testé avec Node 24).

## Lancer

```bash
cd 32-projets/01-generateur-mots-de-passe
node cli.js                       # un mot de passe de 16 caractères
node cli.js -l 24 -n 5 -e         # 5 mots de passe de 24 caractères + entropie
node cli.js --sans-symboles --sans-ambigus
node cli.js --aide
npm test                          # ou : node --test
```

Les mots de passe sont écrits sur la sortie standard (un par ligne) et l'entropie sur la sortie d'erreur : `node cli.js -n 10 > mdp.txt` n'enregistre que les mots de passe. Une option invalide affiche l'aide et termine avec le code de sortie `2`.

## Structure

```text
01-generateur-mots-de-passe/
├── cli.js                  lecture des options (util.parseArgs), affichage, codes de sortie
├── src/generateur.js       logique : tirage sûr, jeux de caractères, composition, entropie
├── test/generateur.test.js tests unitaires + tests de la CLI (node:test)
└── package.json            "type": "module", scripts start et test
```

## Points à remarquer

- `entierAleatoire` utilise `crypto.getRandomValues` et rejette les tirages au-delà du dernier multiple complet de `max` pour éviter le **biais du modulo**.
- `genererMotDePasse` tire chaque caractère uniformément dans l'alphabet complet et recommence tant qu'un jeu actif manque : chaque mot de passe valide a la même probabilité d'être produit.
- La CLI ne contient aucune logique métier : tout ce qui est testable vit dans `src/`.
