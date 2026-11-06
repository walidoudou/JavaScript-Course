// Exécute chaque bloc ```js / ```javascript des chapitres dans un processus Node isolé
// (module ES, dossier temporaire dédié, délai de 10 s) et signale ceux qui échouent.
//
// Un bloc précédé de la ligne <!-- no-run --> est ignoré : code navigateur,
// erreur volontaire, extrait partiel ou dépendant du réseau.
//
// Usage : node scripts/verifier-exemples.mjs [chemin/vers/chapitre.md ...]
// Sans argument, tous les fichiers NN-*/README.md sont vérifiés.
import { execFile } from "node:child_process";
import { mkdtemp, readdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { availableParallelism, tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const executer = promisify(execFile);
const racine = path.join(import.meta.dirname, "..");
const argumentsCli = process.argv.slice(2);
const fichiers = argumentsCli.length
  ? argumentsCli.map((f) => path.resolve(f))
  : (await readdir(racine))
      .filter((nom) => /^\d{2}-/.test(nom))
      .sort()
      .map((nom) => path.join(racine, nom, "README.md"));

const blocs = [];
let ignores = 0;

for (const fichier of fichiers) {
  let texte;
  try {
    texte = await readFile(fichier, "utf8");
  } catch {
    continue; // chapitre pas encore écrit
  }
  const lignes = texte.split("\n");
  let derniereLigne = "";
  for (let i = 0; i < lignes.length; i++) {
    const ouverture = lignes[i].match(/^(\s*)```(?:js|javascript|mjs)\s*$/);
    if (!ouverture) {
      if (lignes[i].trim()) derniereLigne = lignes[i].trim();
      continue;
    }
    const indentation = ouverture[1].length;
    const code = [];
    let j = i + 1;
    while (j < lignes.length && !/^\s*```\s*$/.test(lignes[j])) {
      code.push(lignes[j].slice(indentation));
      j++;
    }
    if (derniereLigne === "<!-- no-run -->") ignores++;
    else blocs.push({ fichier: path.relative(racine, fichier), ligne: i + 1, code: code.join("\n") });
    derniereLigne = "";
    i = j;
  }
}

const echecs = [];
const dossierTemp = await realpath(tmpdir()); // /var → /private/var sur macOS
let prochain = 0;

async function travailleur() {
  while (prochain < blocs.length) {
    const bloc = blocs[prochain++];
    const dossier = await mkdtemp(path.join(dossierTemp, "verif-js-"));
    const script = path.join(dossier, "bloc.mjs");
    await writeFile(script, bloc.code);
    try {
      await executer(process.execPath, [script], { cwd: dossier, timeout: 10_000 });
    } catch (erreur) {
      const message = erreur.killed
        ? "délai dépassé (10 s) : un timer ou une connexion reste ouvert"
        : (erreur.stderr || erreur.message)
            .split("\n")
            .filter((l) => l.trim() && !l.startsWith("    at ") && !l.includes("Node.js v"))
            .slice(0, 4)
            .join("\n    ")
            .replaceAll(`file://${script}`, "bloc")
            .replaceAll(script, "bloc");
      echecs.push({ ...bloc, message });
    } finally {
      await rm(dossier, { recursive: true, force: true });
    }
  }
}

await Promise.all(Array.from({ length: availableParallelism() }, travailleur));

echecs.sort((a, b) => a.fichier.localeCompare(b.fichier) || a.ligne - b.ligne);
for (const { fichier, ligne, message } of echecs) console.log(`✗ ${fichier}:${ligne}\n    ${message}\n`);
console.log(`${blocs.length} blocs exécutés, ${ignores} ignorés (no-run), ${echecs.length} en échec.`);
process.exitCode = echecs.length ? 1 : 0;
