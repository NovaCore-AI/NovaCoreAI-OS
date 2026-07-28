#!/usr/bin/env node
'use strict';

/**
 * nc-session-start — SessionStart-Hook für NovaCoreAI-OS (Kern-Plugin `nc`,
 * Design-Spec 2026-07-28 §5 (OS-Repo)).
 *
 * Begrüßt zu Session-Beginn, weist auf `/nc:start` und `/nc:save-session` hin
 * und nennt die installierte Kern-Version. Nur aktiv, wenn das aktuelle Repo
 * den `.nc-os`-Marker trägt — sonst no-op (Koexistenz mit uni:/ECC). Reiner
 * Komfort-Hook, kein Gate: das Destruktiv-Gate des FFG deckt die
 * sicherheitsrelevanten Fälle bereits markerlos ab (nc-ffg.js).
 *
 * Die Marker-Prüfung (`hasNcOsMarker`, inkl. isFile()-Prüfung aus dem
 * 0.1.1-Regressionsfix) lebt hier im Hook selbst — kein Require auf das
 * entfallende `nc-safety-gate.js` (dessen Aufgabe hat das FFG übernommen).
 */

const fs = require('node:fs');
const path = require('node:path');

// Marker ist eine DATEI (`touch .nc-os`, siehe ONBOARDING). Das
// Staging-VERZEICHNIS `~/.nc-os/` darf nicht als Marker zählen, sonst wäre
// jedes Repo unterhalb des Home-Verzeichnisses markiert (Regressionstest des
// 0.1.1-Bugs).
function hasNcOsMarker(startDir) {
  if (typeof startDir !== 'string' || startDir.length === 0) {
    return false;
  }
  let current = path.resolve(startDir);
  for (;;) {
    let stat = null;
    try {
      stat = fs.statSync(path.join(current, '.nc-os'));
    } catch {
      stat = null;
    }
    if (stat && stat.isFile()) {
      return true;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return false;
    }
    current = parent;
  }
}

// Versionsquelle: die eigene plugin.json des Kern-Plugins — `../VERSION`
// existiert im installierten Plugin-Cache nicht (Design-Spec 2026-07-28 §5).
function readOsVersion() {
  const manifestPath = path.join(__dirname, '..', '.claude-plugin', 'plugin.json');
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest && typeof manifest.version === 'string' && manifest.version.trim()) {
      return manifest.version.trim();
    }
    return 'unbekannt';
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
        `[NovaCore-OS v${version}] Dieses Repo ist ein nc-Repo (.nc-os-Marker gefunden). ` +
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

module.exports = { buildSessionStartResponse, hasNcOsMarker, readOsVersion };
