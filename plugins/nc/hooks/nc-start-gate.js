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
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { resolveSessionKey, isSubagentInvocation } = require('./lib/session-key');
const { isReadOnlyGitIntrospection } = require('./lib/bash-analyse');
const { stateFileFor } = require('./nc-start-stempel');

const OFF_VALUES = new Set(['0', 'false', 'off', 'disabled', 'disable']);
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // wie FFG: Stempel verfaellt nach 30 Min Inaktivitaet
const HEARTBEAT_MS = 60 * 1000;            // last_active hoechstens einmal je Minute auffrischen
const GIT_TIMEOUT_MS = 2000;
const STEMPEL_SKRIPT = path.join(__dirname, 'nc-start-stempel.js');

// Echte Invokation des Stempel-Skripts erkennen — NICHT per Substring (Review-Haertung
// 2026-08-10, Nachtrag N2/M1): `echo x > /tmp/y   # nc-start-stempel.js` haette den
// Durchlass sonst geoeffnet, also jeden schreibenden Befehl mit angehaengtem Kommentar.
// Verlangt wird: der Befehl BEGINNT mit einem node-Aufruf auf GENAU DIESES Skript, und
// danach folgt nichts, was eine zweite Aktion anhaengt.
// Gruppe 1/2/3 fangen den Skriptpfad (gequotet doppelt/einfach/nackt) fuer den
// Identitaetsvergleich in istDiesesSkript().
const STEMPEL_INVOKATION = /^[^\S\r\n]*(?:"[^"]*node[^"]*"|'[^']*node[^']*'|[^\s;&|<>#]*node(?:\.exe)?)[^\S\r\n]+(?:"([^"]*nc-start-stempel\.js)"|'([^']*nc-start-stempel\.js)'|([^\s;&|<>#]*nc-start-stempel\.js))(?![^\s;&|<>#])/i;

// Zeigt der Pfad auf DIESE Datei? Der blosse Namenssuffix genuegt nicht (Review-Runde 2):
// `node "<irgendwo>/my-nc-start-stempel.js"` waere sonst ein Kanal fuer beliebigen
// Node-Code durch Gate 2. Verglichen wird der aufgeloeste Pfad; Case-Folding nur auf
// case-insensitiven Plattformen (wie im FFG-Datei-Gate).
function istDiesesSkript(pfad) {
  if (!pfad) return false;
  try {
    const kandidat = path.resolve(pfad);
    const echt = path.resolve(STEMPEL_SKRIPT);
    const foldCase = process.platform === 'win32' || process.platform === 'darwin';
    return foldCase ? kandidat.toLowerCase() === echt.toLowerCase() : kandidat === echt;
  } catch (_) { return false; }
}

function istStempelBefehl(command) {
  const raw = String(command || '');
  // Zeilenumbruch und Wagenruecklauf sind vollwertige Kommandotrenner (Bash wie
  // PowerShell). Ein mehrzeiliger Befehl ist NIE "nur der Stempel" — genau darueber war
  // der erste M1-Fix noch umgehbar (Review-Runde 2).
  if (/[\r\n]/.test(raw)) return false;
  const treffer = STEMPEL_INVOKATION.exec(raw);
  if (!treffer) return false;
  if (!istDiesesSkript(treffer[1] || treffer[2] || treffer[3])) return false;
  // Nach dem Skriptpfad duerfen nur noch Argumente stehen — kein Verketten, kein Kommentar,
  // keine Umleitung, keine Kommando-Substitution.
  const rest = raw.slice(treffer[0].length);
  return !/[;&|<>#`]|\$\(/.test(rest);
}

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

// Ist `dir` ein Git-Arbeitsbaum? Rein lesend, kurz getimeoutet. Wird nur gebraucht, um zu
// entscheiden, ob ein UNVERIFIZIERTER Stempel hier gelten darf (Nachtrag N2, H1).
function istGitBaum(dir) {
  try {
    const out = execFileSync('git', ['-C', dir, 'rev-parse', '--is-inside-work-tree'], {
      encoding: 'utf8', timeout: GIT_TIMEOUT_MS,
      stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true
    });
    return String(out || '').trim() === 'true';
  } catch (error) {
    // Kein Git / kein Repo → es gibt wirklich nichts zu verifizieren, stiller Durchlass.
    // Ein TIMEOUT ist etwas anderes: dann wissen wir es nicht und lassen fail-open durch
    // (repo-weite Doktrin) — das aber nicht stumm, sonst schwaecht Last unbemerkt Gate 2.
    if (error && (error.code === 'ETIMEDOUT' || error.signal === 'SIGTERM')) {
      try {
        process.stderr.write('[nc-start-gate] git rev-parse in ' + dir + ' lief in den '
          + 'Timeout — ein unverifizierter Stempel wird hier durchgelassen (fail-open).\n');
      } catch (_) { /* egal */ }
    }
    return false;
  }
}

// Ein Stempel gilt als verifiziert, wenn er es ausweist. Aeltere Stempel ohne das Feld
// werden aus branch/head abgeleitet, damit ein Versionswechsel mitten in einer Session
// niemanden aussperrt.
function istVerifiziert(stamp) {
  if (typeof stamp.verified === 'boolean') return stamp.verified;
  return Boolean(stamp.branch && stamp.head);
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

// Ablehnung, wenn ein ungeprueft gesetzter Stempel in einem echten Git-Baum vorgelegt wird.
function ungeprueftMsg(sessionKey) {
  return '[Start-Gate] Der Stempel dieser Session wurde OHNE Git-Verifikation gesetzt '
    + '(er entstand außerhalb eines Git-Baums), dieses Verzeichnis ist aber eines. Damit ist '
    + 'die Git-Lage nie geprüft worden. Erneut stempeln — aus dem Projektverzeichnis heraus '
    + 'bzw. mit gesetztem CLAUDE_PROJECT_DIR: '
    + 'node "' + STEMPEL_SKRIPT + '" --session ' + sessionKey
    + ' --branch <branch> --head <head> (git rev-parse --abbrev-ref HEAD · '
    + 'git rev-parse --short HEAD). Lesen und Read-only-Git bleiben frei.';
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
  if (stamp) {
    // Ein verifizierter Stempel oeffnet ueberall. Ein UNVERIFIZIERTER gilt nur dort, wo es
    // wirklich nichts zu verifizieren gab — sonst waere er per `cd` in ein Nicht-Git-
    // Verzeichnis erschlichen (Nachtrag N2, H1).
    if (istVerifiziert(stamp)) return heartbeat(file, stamp);
    const arbeitsDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
    if (!istGitBaum(arbeitsDir)) return heartbeat(file, stamp);
    return deny(ungeprueftMsg(sessionKey));
  }

  if (tool === 'Bash') {
    const command = (input.tool_input && input.tool_input.command) || '';
    // Der Stempel-Befehl selbst muss durch — sonst kann das Gate nie oeffnen. Erkannt wird
    // eine ECHTE Invokation (verankert, ohne angehaengte Zweitaktion), nicht ein blosses
    // Vorkommen der Zeichenkette. Ein Missbrauch des Durchlasses (Stempeln ohne /nc:start)
    // bleibt die dokumentierte Proxy-Grenze; der Fakten-Stempel verifiziert Branch/HEAD
    // dabei trotzdem gegen das Projektverzeichnis.
    if (istStempelBefehl(command)) return;
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
