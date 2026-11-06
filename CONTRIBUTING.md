# Contribuer au cours

Merci de vouloir améliorer ce cours ! Ce document décrit comment un chapitre est construit, pour que l'ensemble reste homogène.

## Organisation

- Un chapitre = un dossier numéroté `NN-nom/` contenant un `README.md` (GitHub l'affiche automatiquement quand on ouvre le dossier).
- Les fichiers annexes d'un chapitre (projets, solutions longues, pages HTML de démonstration) vont dans ce même dossier.
- Le sommaire général et le parcours se trouvent dans le [README](README.md) racine.

## Gabarit d'un chapitre

```markdown
# NN — Titre du chapitre

> **Niveau** : Débutant · **Durée** : ~2 h · **Prérequis** : [Variables](../02-variables/README.md)

Deux ou trois phrases : ce que le chapitre apporte et pourquoi c'est utile.

## Objectifs

- Ce que vous saurez faire à la fin (verbes d'action, 4 à 7 points)

## Sommaire

- liens vers les sections (ancres GitHub)

## …sections du cours…

## Pièges courants

## Bonnes pratiques

## Résumé

- les points clés, à relire avant de passer au chapitre suivant

## Exercices

### Exercice 1 — Titre (★☆☆)

Énoncé.

<details>
<summary>Solution</summary>

Code + explication.

</details>

## Pour aller plus loin

- liens de référence (MDN en priorité)

---

[← Chapitre précédent](../NN-x/README.md) · [Sommaire](../README.md#sommaire) · [Chapitre suivant →](../NN-y/README.md)
```

## Rédaction

- **Langue** : français soigné, accents compris ; vouvoiement.
- **Expliquer le pourquoi**, pas seulement le comment : chaque notion part d'un problème concret.
- **Progressif** : du cas simple au cas réel. Les notions avancées sont signalées comme telles.
- **Un concept, un chapitre de référence** : si une notion est traitée en détail ailleurs, faites un rappel bref et un lien plutôt que de la répéter.
- **Pas de remplissage** : pas de formules creuses (« Dans ce guide complet… », « N'hésitez pas à… »), pas d'émojis dans les titres, pas de pied de page générique.
- Les encadrés GitHub (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, `> [!IMPORTANT]`) servent aux informations qui méritent vraiment d'être mises en avant, avec parcimonie.
- Les schémas utilisent [Mermaid](https://docs.github.com/fr/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams), rendu nativement par GitHub.
- Chaque fonctionnalité postérieure à ES2015 indique sa version (`ES2023`, `ES2026`…). Pour une API récente, précisez où elle est disponible (navigateurs, version de Node.js) et datez l'information quand elle peut évoluer.

## Code

- JavaScript moderne : `const` par défaut, `let` si réassignation, jamais `var` hors explications historiques ; `===` ; modules ES (`import`/`export`).
- Style Prettier par défaut : 2 espaces, guillemets doubles, points-virgules.
- Identifiants en français sans accents et en camelCase (`prixTotal`, `nombreArticles`) ; les API standard restent évidemment en anglais.
- Résultats affichés en commentaire à droite : `console.log(total); // 42`. Ces valeurs doivent être **exactes** : exécutez le code pour les vérifier.
- Montrez les mauvaises pratiques à côté des bonnes en les signalant clairement (`// ❌` / `// ✅`).
- Chaque bloc ` ```js ` doit être **autonome et exécutable** avec Node.js (dernière LTS) : il ne dépend pas d'un bloc précédent.
- Un bloc qui ne peut pas s'exécuter dans Node (code navigateur, erreur volontaire, extrait partiel, appel réseau) est précédé de la ligne `<!-- no-run -->` (invisible dans le rendu GitHub).
- Le HTML, le CSS, le JSON et les commandes shell utilisent leurs propres langages (` ```html `, ` ```css `, ` ```json `, ` ```bash `).

## Vérifier les exemples

```bash
node scripts/verifier-exemples.mjs                     # tous les chapitres
node scripts/verifier-exemples.mjs 09-tableaux/README.md
```

Le script exécute chaque bloc ` ```js ` dans un processus Node isolé et liste ceux qui échouent. Une contribution ne doit introduire aucun échec.

## Proposer une modification

1. Forkez le dépôt et créez une branche.
2. Faites vos modifications en respectant ce guide, puis lancez la vérification des exemples.
3. Ouvrez une pull request qui explique ce que vous avez changé et pourquoi.

Une erreur, une explication peu claire ? Ouvrir une issue est aussi une excellente contribution.
