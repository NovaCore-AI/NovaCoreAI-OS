#!/usr/bin/env node
// nc-start-gate.js — Erzwingungs-Begleiter des Session-Start-Zwangs („Start-Hook",
// Gate 2 Teil 2; Bauplan 2026-08-10 „Onsite-Align-Umbau", AP2). PreToolUse-Hook: lehnt
// jede SCHREIBENDE Aktion ab, solange /nc:start diese Session nicht mit dem Fakten-Stempel
// abgeschlossen hat (nc-start-stempel.js). Lesen und Fragen bleiben frei — Read/Glob/Grep
// matchen hier gar nicht, und Read-only-Git-Introspektion laeuft auch ueber Bash
// ungehindert (sie IST der Pflicht-Einstieg; Wiederverwendung der gehaerteten
// FFG-Erkennung).
//
// ZANGEN-PRINZIP (Plattform-Fakt: ein Hook kann keinen Skill starten, nur blocken und
// injizieren): Die SessionStart-Injektion SAGT dem Agenten, /nc:start auszufuehren,
// und nennt den Stempel-Befehl; dieses Gate macht Nicht-Ausfuehren zur Sackgasse und
// wiederholt den Befehl in jeder Ablehnung. Erzwingung der Readings laeuft ueber den
// FAKTEN-Stempel: --branch/--head muessen der realen Git-Lage entsprechen.
//
// Verhaeltnis zum FFG (Pruefungs-Eigentum): gleicher Matcher, ANDERE Pruefung — das FFG
// verlangt Fakten je Ziel, dieses Gate verlangt den erledigten Session-Start. Beide
// duerfen auf denselben Aufruf feuern; keines dupliziert das andere.
// Kein "allow"-Output bei erfuelltem Start: der normale Permission-Flow bleibt unberuehrt.
// Subagenten sind ausgenommen (der Parent hat den Start-Zwang erfuellt).
// Opt-out AUSSCHLIESSLICH per Env: NC_START_GATE=off — derselbe Schalter wie die
// Injektion (ein Gate, ein Schalter). Fail-open bei internen Fehlern.
'use strict';
const fs = require('fs');
const path = require('path');
const { resolveSessionKey, isSubagentInvocation } = require('./lib/session-key');
const { isReadOnlyGitIntrospection } = require('./lib/bash-analyse');
const { stateFileFor } = require('./nc-start-stempel');

const OFF_VALUES = new Set(['0', 'false', 'off', 'disabled', 'disable']);
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // wie FFG: Stempel verfaellt nach 30 Min Inaktivitaet
const HEARTBEAT_MS = 60 * 1000;            // last_active hoechstens einmal je Minute auffrischen
const STEMPEL_SKRIPT = path.join(__dirname, 'nc-start-stempel.js');

function isDisabled() {
  return OFF_VALUES.has(String(process.env.NC_START_GATE || '').trim().toLowerCase());
}

// Stempel laden; abgelaufene Stempel verfallen (lange Pause → neuer Kontext noetig,
// die Injektion feuert bei resume/compact ohnehin frisch).
function loadStamp(file) {
  try {
    if (!file || !fs.existsSync(file)) return null;
    const stamp = JSON.parse(fs.readFileSync(file, 'utf8'));
    const lastActive = Number(stamp && stamp.last_active) || 0;
    if (Date.now() - lastActive > SESSION_TIMEOUT_MS) {
      try { fs.unlinkSync(file); } catch (_) { /* egal */ }
      return null;
    }
    return stamp;
  } catch (_) { return null; } // defekter Stempel zaehlt als nicht gestempelt
}

function heartbeat(file, stamp) {
  try {
    if (Date.now() - (Number(stamp.last_active) || 0) > HEARTBEAT_MS) {
      stamp.last_active = Date.now();
      fs.writeFileSync(file, JSON.stringify(stamp, null, 2), 'utf8');
    }
  } catch (_) { /* Heartbeat-Fehler ist kein Gate-Fehler */ }
}

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason
    }
  }));
}

// Gate-Text: enthaelt den EXAKTEN Stempel-Befehl samt Session-Schluessel — der Agent
// soll ihn nicht raten muessen. Bewusst OHNE Abschalt-Hinweis (Schicht 5).
function startMsg(sessionKey) {
  return '[Start-Gate] Kein Blind-Start (Gate 2): Diese Session hat /nc:start noch nicht '
    + 'abgeschlossen. Ablauf: (1) /nc:start ausführen — Stand, jüngstes Journal, Git-Lage, '
    + 'Projekt-Doku (WP0). (2) Als Abschluss den Fakten-Stempel setzen: '
    + 'node "' + STEMPEL_SKRIPT + '" --session ' + sessionKey
    + ' --branch <branch> --head <head> — Branch und HEAD aus der realen Git-Lage '
    + '(git rev-parse --abbrev-ref HEAD · git rev-parse --short HEAD); außerhalb eines '
    + 'Git-Baums entfallen beide. Lesen und Fragen bleiben frei. '
    + 'Danach DENSELBEN Aufruf wiederholen.';
}

function main() {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  if (isDisabled()) return;

  const TOOL_MAP = {
    edit: 'Edit', write: 'Write', multiedit: 'MultiEdit',
    notebookedit: 'NotebookEdit', bash: 'Bash'
  };
  const rawTool = String(input.tool_name || '');
  const tool = TOOL_MAP[rawTool.toLowerCase()];
  if (!tool) return; // Read/Glob/Grep/Fragen: Lesen bleibt frei

  if (isSubagentInvocation(input)) return;

  const sessionKey = resolveSessionKey(input);
  const file = stateFileFor(sessionKey);
  const stamp = loadStamp(file);
  if (stamp) return heartbeat(file, stamp); // Start erledigt → normaler Permission-Flow

  if (tool === 'Bash') {
    const command = (input.tool_input && input.tool_input.command) || '';
    // Der Stempel-Befehl selbst muss durch — sonst kann das Gate nie oeffnen. Ein
    // Missbrauch dieses Durchlasses (Stempeln ohne /nc:start) ist die dokumentierte
    // Proxy-Grenze; der Fakten-Stempel verifiziert Branch/HEAD trotzdem.
    if (command.includes('nc-start-stempel.js')) return;
    if (isReadOnlyGitIntrospection(command)) return; // Pflicht-Einstieg selbst nie blocken
  }

  return deny(startMsg(sessionKey));
}

try {
  main();
} catch (e) {
  try { process.stderr.write('nc-start-gate fail-open: ' + (e && e.message)); } catch (_) { /* egal */ }
}
// Kein process.exit(): abgeschnittene Deny-JSON hiesse, das Gate blockt still nicht
// (POSIX-Pipe-Falle). exitCode 0 genuegt, nichts laeuft async.
process.exitCode = 0;
