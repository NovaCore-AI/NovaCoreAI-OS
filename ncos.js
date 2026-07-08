#!/usr/bin/env node
'use strict';

/**
 * ncos.js — globale CLI von NovaCoreAI-OS.
 *
 *   ncos setup    Erstinstallation (Skills/Hooks deployen)
 *   ncos update   Aktualisierung (git pull + Setup + Aufräumen)
 *   ncos version  Installierte Version anzeigen
 */

const USAGE = `Verwendung: ncos <befehl>

Befehle:
  setup     NovaCoreAI-OS installieren
  update    NovaCoreAI-OS aktualisieren
  version   Version anzeigen`;

function printVersion() {
  const { readCoreVersion } = require('./setup.js');
  console.log(`NovaCoreAI-OS v${readCoreVersion(__dirname)}`);
}

function main() {
  const command = process.argv[2];
  switch (command) {
    case 'setup': {
      const { runSetup, registerWithClaude } = require('./setup.js');
      const result = runSetup();
      console.log(`NovaCoreAI-OS v${result.version} — Staging nach ${result.targetDir}`);
      for (const warning of result.warnings) {
        console.warn(`WARNUNG: ${warning}`);
      }
      const registration = registerWithClaude();
      if (registration.registered) {
        console.log('Plugin bei Claude Code registriert (Marketplace-Install).');
      } else {
        console.warn(`WARNUNG: ${registration.warning}`);
      }
      break;
    }
    case 'update': {
      const { runUpdate } = require('./update.js');
      const result = runUpdate();
      console.log(`NovaCoreAI-OS v${result.version} aktualisiert (${result.targetDir})`);
      for (const warning of result.warnings) {
        console.warn(`WARNUNG: ${warning}`);
      }
      break;
    }
    case 'version': {
      printVersion();
      break;
    }
    default: {
      console.log(USAGE);
      process.exit(command ? 1 : 0);
    }
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`ncos fehlgeschlagen: ${error.message}`);
    process.exit(1);
  }
}
