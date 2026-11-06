# Projet 5 — Analyseur de texte (solution)

Solution du [projet 5 du chapitre 32](../README.md#projet-5--analyseur-de-texte). Aucune dépendance : Node.js 22 ou plus (testé avec Node 24).

## Lancer

```bash
cd 32-projets/05-analyseur-de-texte
node cli.js exemples/phare.txt                    # rapport texte, 10 mots les plus fréquents
node cli.js exemples/phare.txt -t 5 -s            # top 5 sans les mots grammaticaux
node cli.js exemples/phare.txt --format json      # rapport JSON (pour un autre programme)
cat exemples/phare.txt | node cli.js -m 6         # lecture sur l'entrée standard
npm test                                          # ou : node --test
```

Codes de sortie : `0` succès, `1` fichier illisible (introuvable, dossier, droits), `2` mauvaise utilisation (option inconnue ou invalide).

## Structure

```text
05-analyseur-de-texte/
├── cli.js                  options (util.parseArgs), choix du flux (fichier ou stdin), erreurs, sortie
├── src/analyseur.js        extraction des mots, statistiques, lecture ligne à ligne, rapport, mise en forme
├── exemples/phare.txt      texte d'exemple
└── test/analyseur.test.js  tests unitaires, test de flux, tests de la CLI
```

## Points à remarquer

- Le fichier est lu **en flux** (`createReadStream` + `readline`) : seuls les compteurs et la table des fréquences restent en mémoire. Un fichier de 200 Mo s'analyse avec un tas limité à 32 Mo (`node --max-old-space-size=32 cli.js gros.txt`).
- Les mots sont reconnus avec une expression régulière Unicode (`\p{L}`, `\p{N}`, drapeau `u`) : accents, grec, cyrillique, japonais… Les élisions françaises (`l'`, `qu'`…) sont retirées.
- Les fréquences sont comptées dans une `Map` ; le classement trie par nombre décroissant, puis par ordre alphabétique avec `localeCompare(…, "fr")`.
- Le rapport est un objet simple : la même donnée sort en texte (`formaterTexte`) ou en JSON (`JSON.stringify`).
