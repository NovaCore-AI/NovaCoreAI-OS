#!/usr/bin/env node
'use strict';

/**
 * nc-session-start — SessionStart-Hook für NovaCoreAI-OS.
 *
 * Begrüßt zu Session-Beginn, weist auf `/nc:start` hin und nennt die
 * installierte Version. Nur aktiv, wenn das aktuelle Repo den
 * `.nc-os`-Marker trägt — sonst no-op (Koexistenz mit uni:/ECC).
 */

const fs = require('node:fs');
const path = require('node:path');

const { hasNcOsMarker } = require('./nc-safety-gate.js');

function readOsVersion() {
  const versionPath = path.join(__dirname, '..', 'VERSION');
  try {
    return fs.readFileSync(versionPath, 'utf8').trim();
  } catch {
    return 'unbekannt';
  }
}

function buildSessionStartResponse(input) {
  const cwd = (input && input.cwd) || process.cwd();
  if (!hasNcOsMarker(cwd)) {
    return null;
  }
  const version = readOsVersion();
  return {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext:
        `[NovaCoreAI-OS v${version}] Dieses Repo ist ein nc-Repo (.nc-os-Marker gefunden). ` +
        'Starte die Session mit /nc:start, um Kontext aus .nc/erinnerung/ zu laden. ' +
        'Beende die Session mit /nc:save-session, um Stand und Journal zu sichern.',
    },
  };
}

function main() {
  let input = null;
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    // Ohne parsebare Eingabe entscheidet der Marker im Arbeitsverzeichnis.
  }
  const response = buildSessionStartResponse(input);
  if (response) {
    process.stdout.write(JSON.stringify(response));
  }
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { buildSessionStartResponse, readOsVersion };
