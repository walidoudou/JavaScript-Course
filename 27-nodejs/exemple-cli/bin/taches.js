#!/usr/bin/env node
// Point d'entrée de la commande `taches` : toute la logique est dans src/.
import { executer } from "../src/cli.js";

process.exitCode = await executer(process.argv.slice(2));
