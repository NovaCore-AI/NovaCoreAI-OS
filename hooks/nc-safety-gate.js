#!/usr/bin/env node
'use strict';

/**
 * nc-safety-gate — PreToolUse-Hook (Bash) für NovaCoreAI-OS.
 *
 * Verlangt Faktennennung vor destruktiven Bash-Befehlen.
 * Außerhalb von Repos mit `.nc-os`-Marker ist das Gate no-op,
 * damit andere Systeme (uni:, ECC) nicht gestört werden.
 */

const fs = require('node:fs');
const path = require('node:path');

const SIMPLE_DESTRUCTIVE_PATTERNS = [
  /\bgit\s+reset\s+--hard\b/,
  /\bgit\s+clean\b[^|;&]*-[a-zA-Z]*f/,
  /\bdrop\s+table\b/i,
  /\bterraform\s+destroy\b/,
];

// Erkennt Force-Pushes semantisch: --force/--force-with-lease, kombinierte
// Kurzflags mit f sowie die Refspec-Form `git push origin +branch`.
function isForcePush(command) {
  const match = command.match(/\bgit\s+push\b([^|;&]*)/);
  if (!match) {
    return false;
  }
  const args = match[1];
  return (
    /(^|\s)--force(-with-lease)?\b/.test(args) ||
    /(^|\s)-[a-zA-Z]*f\b/.test(args) ||
    /(^|\s)\+\S/.test(args)
  );
}

// Destruktiv ist rm nur mit rekursiv UND force — unabhängig davon, ob die
// Flags kombiniert (-rf, -Rf), getrennt (-r -f) oder lang (--recursive
// --force) angegeben sind.
function isRecursiveForceRemove(command) {
  const match = command.match(/\brm\s+([^|;&]*)/);
  if (!match) {
    return false;
  }
  const args = match[1];
  const hasRecursive =
    /(^|\s)--recursive\b/.test(args) || /(^|\s)-[a-zA-Z]*[rR]/.test(args);
  const hasForce = /(^|\s)--force\b/.test(args) || /(^|\s)-[a-zA-Z]*f/.test(args);
  return hasRecursive && hasForce;
}

// `deploy` nur als eigenständiges Wort (nicht deploy-docs/deployment) und
// nicht in reinen Lese-Kontexten wie `kubectl get deploy`.
function isDeployCommand(command) {
  if (!/(^|[\s"'`])deploy([\s"'`]|$)/.test(command)) {
    return false;
  }
  if (/\b(get|describe|logs?)\s+deploy\b/.test(command)) {
    return false;
  }
  return true;
}

function isDestructiveCommand(command) {
  if (typeof command !== 'string' || command.length === 0) {
    return false;
  }
  return (
    SIMPLE_DESTRUCTIVE_PATTERNS.some((pattern) => pattern.test(command)) ||
    isForcePush(command) ||
    isRecursiveForceRemove(command) ||
    isDeployCommand(command)
  );
}

function hasNcOsMarker(startDir) {
  if (typeof startDir !== 'string' || startDir.length === 0) {
    return false;
  }
  let current = path.resolve(startDir);
  for (;;) {
    // Der Marker ist eine Datei (`touch .nc-os`, siehe ONBOARDING). Das
    // Staging-VERZEICHNIS `~/.nc-os/` darf nicht als Marker zählen, sonst
    // wäre jedes Repo unterhalb des Home-Verzeichnisses markiert.
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

function buildGateResponse(input) {
  if (!input || input.tool_name !== 'Bash') {
    return null;
  }
  const command = input.tool_input && input.tool_input.command;
  if (!isDestructiveCommand(command)) {
    return null;
  }
  if (!hasNcOsMarker(input.cwd || process.cwd())) {
    return null;
  }
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason:
        `[nc-safety-gate] Destruktiver Befehl erkannt: "${command}". ` +
        'Bitte vor der Ausführung Fakten nennen: (1) Was genau bewirkt dieser Befehl? ' +
        '(2) Warum ist er hier notwendig? (3) Wörtliches Zitat der Anweisung, die ihn rechtfertigt.',
    },
  };
}

function main() {
  let raw = '';
  try {
    raw = fs.readFileSync(0, 'utf8');
  } catch {
    process.exit(0);
  }
  let input = null;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const response = buildGateResponse(input);
  if (response) {
    process.stdout.write(JSON.stringify(response));
  }
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { isDestructiveCommand, hasNcOsMarker, buildGateResponse };
