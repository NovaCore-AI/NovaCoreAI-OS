#!/usr/bin/env node
// nc-session-start.js — Session-Start-Zwang des NovaCore-OS (Gate 2 Teil 1; Bauplan
// 2026-08-10 „Onsite-Align-Umbau", AP2). SessionStart-Hook: injiziert Pflicht-Einstieg
// und LEBENDEN Projektstand als Kontext, statt nur auf /nc:start hinzuweisen.
//
// VERIFIZIERTE MECHANIK (code.claude.com/docs/en/hooks, abgerufen 2026-07-30):
//   - "SessionStart has no blocking mechanism": Exit 2 erzeugt nur eine Transcript-
//     Notiz, die Session laeuft weiter. Dieser Hook kann also NICHT blocken — er
//     injiziert. Die Erzwingung der ersten schreibenden Aktion ist Aufgabe des
//     PreToolUse-Begleiters nc-start-gate.js (Zangen-Prinzip).
//   - Ausgabe ueber hookSpecificOutput.additionalContext; landet als System-Reminder
//     VOR dem ersten User-Prompt.
//   - Feuert bei startup/resume/clear/compact/fork — also auch nach jeder
//     Kompaktierung, was den Stand automatisch auffrischt.
//   - Die Doku mahnt: laeuft in JEDER Session → schnell halten.
//
// SCOPING — KEIN Marker (Umbau 2026-08-10, gilt fuer ALLE Hooks des Kerns):
// Aktiv, wo das Plugin installiert ist — genau wie das FFG. Die frueher noetige
// Marker-Datei `.nc-os` als Aktivierungsbedingung ist gestrichen: sie muesste in jedem
// Repo manuell angelegt werden, wird vergessen, und ein Gate, das man vergessen kann,
// ist kein Gate. Aeltere Doku-Stellen zum Marker-Scope sind damit ueberholt (ONBOARDING
// fuehrt ihn nur noch historisch).
// Bewusst in Kauf genommen: Der Regelblock erscheint in JEDER Session auf dem Geraet.
// Deshalb ist er kurz; der repo-spezifische Teil entfaellt automatisch, wo die Quellen
// fehlen (fremdes Repo → nur der Regelblock).
//
// Opt-out AUSSCHLIESSLICH per Env: NC_START_GATE=off (bzw. 0/false/disabled) — derselbe
// Schalter wie das Start-Gate (ein Gate, ein Schalter).
// Fail-open: ein defekter Hook darf keine Session lahmlegen (Exit 0, Notiz auf stderr).
//
// SPARSAMKEIT ist Teil des Designs: Der Block kostet Tokens in JEDER Session. Er
// ersetzt keine Doku, sondern nennt den Pflicht-Einstieg und den Stand, den ein Agent
// sonst erst zusammensuchen muss (oder eben nicht tut — genau das ist der Blind-Start).
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const { resolveSessionKey } = require('./lib/session-key');

const OFF_VALUES = new Set(['0', 'false', 'off', 'disabled', 'disable']);
const GIT_TIMEOUT_MS = 2000;   // lieber Abschnitt weglassen als Session verzoegern
const MAX_COMMITS = 5;
const MAX_UNRELEASED_LINES = 8;
const MAX_STATUS_FILES = 8;
const MAX_VORHABEN = 5;        // juengste Planungsdateien aus grundwissen/

function isDisabled() {
  return OFF_VALUES.has(String(process.env.NC_START_GATE || '').trim().toLowerCase());
}

// --- Repo-Wurzel bestimmen ------------------------------------------------------------

// Wurzel = Git-Toplevel (funktioniert auch in Worktrees), sonst `.git` aufwaerts suchen,
// sonst das Startverzeichnis. Nur fuer das Auffinden der Stand-Quellen zustaendig — der
// Hook ist NICHT an ein Repo gebunden und laeuft auch ausserhalb eines Git-Baums.
function repoRoot(start) {
  const gitTop = git(start, ['rev-parse', '--show-toplevel']);
  if (gitTop) return path.resolve(gitTop.split(/\r?\n/)[0]);

  let dir = path.resolve(start);
  for (;;) {
    try {
      if (fs.existsSync(path.join(dir, '.git'))) return dir;
    } catch (_) { /* weitersuchen */ }
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start);
    dir = parent;
  }
}

// --- Quellen (jede optional; fehlt sie, entfaellt der Abschnitt) ---------------------

function readTextFile(file, maxLen) {
  try {
    const raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, '').trim();
    return raw ? raw.slice(0, maxLen) : null;
  } catch (_) { return null; }
}

function git(root, args) {
  try {
    // core.quotepath=false: sonst liefert git Nicht-ASCII-Pfade oktal-escaped
    // ("Aenderungspl\303\244ne") — im injizierten Kontext unlesbar und als Pfad unbrauchbar.
    const out = execFileSync('git', ['-c', 'core.quotepath=false', '-C', root, ...args], {
      encoding: 'utf8',
      timeout: GIT_TIMEOUT_MS,
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true
    });
    const trimmed = String(out || '').trim();
    return trimmed || null;
  } catch (_) { return null; } // kein Git, Timeout, kein Repo → Abschnitt entfaellt
}

// Kopf des [Unreleased]-Abschnitts: zeigt, WAS integriert aber nicht veroeffentlicht ist.
// Bewusst nur Rubriken (### Added/Changed/Fixed) und die ERSTE Zeile jedes Top-Level-
// Bullets — die Prosa-Fortsetzungszeilen der Eintraege sind hier Rauschen und blaehen
// den Block auf.
function unreleasedHead(root) {
  const raw = readTextFile(path.join(root, 'CHANGELOG.md'), 60000);
  if (!raw) return null;
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex(l => /^##\s*\[Unreleased\]/i.test(l));
  if (start === -1) return null;
  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s*\[/.test(line)) break;              // naechster Versionsabschnitt
    if (/^###\s+/.test(line)) {
      body.push(line.trim());
    } else if (/^-\s+/.test(line)) {
      body.push(line.trim().replace(/\s+$/, '').slice(0, 160));
    }
    if (body.length >= MAX_UNRELEASED_LINES) break;
  }
  return body.length ? body.join('\n') : '(leer — nichts Unveroeffentlichtes)';
}

// Laufende Vorhaben: reine Dateinamen, kein Inhalt (Triage macht der Agent).
// NovaCore-Mapping (Bauplan §2): kein Ordner „Aktive Baupläne" wie im Vorbild — Pläne und
// Specs liegen mit Datumspraefix in knowledge-base/grundwissen/, die juengsten zaehlen.
// Dateien ohne Datumspraefix (Produktvision, Begriffsnormen) sind dauerhafte Referenzen
// und gehoeren nicht in diese Liste.
function laufendeVorhaben(root) {
  const dir = path.join(root, 'knowledge-base', 'grundwissen');
  try {
    const files = fs.readdirSync(dir)
      .filter(f => /^\d{4}-\d{2}-\d{2}-.+\.md$/i.test(f))
      .sort()
      .reverse()
      .slice(0, MAX_VORHABEN);
    return files.length ? files : null;
  } catch (_) { return null; }
}

// Abteilungen/Module aus dem Metadaten-SSOT. Das ist die Antwort auf "welche Skills
// gehoeren ins Start-Ritual": der Hook liest sie, statt eine zweite Liste zu pflegen.
function abteilungen(root) {
  const raw = readTextFile(path.join(root, 'plugins', 'nc', 'module-registry.json'), 200000);
  if (!raw) return null;
  try {
    const reg = JSON.parse(raw);
    if (!Array.isArray(reg.abteilungen)) return null;
    return reg.abteilungen.map(a => {
      const module = a && a.module && typeof a.module === 'object'
        ? Object.keys(a.module).filter(k => !k.startsWith('_'))
        : [];
      return {
        name: String((a && a.name) || '?'),
        namespace: String((a && a.namespace) || ''),
        staendig: Boolean(a && a.staendig),
        module
      };
    });
  } catch (_) { return null; }
}

function pluginVersion() {
  const root = process.env.CLAUDE_PLUGIN_ROOT;
  if (!root) return null;
  const raw = readTextFile(path.join(root, '.claude-plugin', 'plugin.json'), 20000);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw).version;
    return v ? String(v) : null;
  } catch (_) { return null; }
}

// --- Kontextblock bauen --------------------------------------------------------------

// Stempel-Hinweis (Gate 2 Teil 2): nennt den EXAKTEN Befehl samt Session-Schluessel,
// damit der Agent ihn nach /nc:start nicht raten muss. Das Start-Gate
// (nc-start-gate.js) lehnt schreibende Aktionen ab, bis der Stempel gesetzt ist.
function stempelHinweis(sessionKey) {
  const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
  const skript = pluginRoot
    ? path.join(pluginRoot, 'hooks', 'nc-start-stempel.js')
    : 'nc-start-stempel.js (hooks/-Verzeichnis des Kern-Plugins nc)';
  return '**Abschluss-Stempel (Start-Gate):** Erst NACH abgeschlossenem `/nc:start` setzen: '
    + '`node "' + skript + '" --session ' + sessionKey + ' --branch <branch> --head <head>` — '
    + 'Branch und HEAD aus der realen Git-Lage (`git rev-parse --abbrev-ref HEAD` · '
    + '`git rev-parse --short HEAD`); außerhalb eines Git-Baums entfallen beide. Bis zum '
    + 'Stempel lehnt das Start-Gate jede schreibende Aktion ab; Lesen und Read-only-Git '
    + 'bleiben frei.';
}

function buildContext(root, source, sessionKey) {
  const teile = [];
  const version = pluginVersion();

  teile.push('# NovaCore-OS — Pflicht-Einstieg (Session-Start-Zwang, Gate 2)'
    + (version ? '\nKern-Plugin ' + version : '')
    + (source && source !== 'startup' ? '\nAuslöser: `' + source + '`.' : ''));

  teile.push('**Vor der ersten inhaltlichen Aktion:** `/nc:start` ausführen — oder, wenn du '
    + 'ohne den Skill arbeitest, dessen Schritte selbst erledigen: Log-Stand und `git status` '
    + 'lesen (der Working Tree ist die Wahrheit, nicht der letzte Commit), `CHANGELOG.md` + '
    + '`VERSION` für den Produktstand, dann die Projekt-Doku (`AGENTS.md` als normativer '
    + 'Einstieg, ersatzweise `CLAUDE.md`) und die für die Aufgabe passende Wissensquelle. '
    + 'Der WP-Rahmen WP0–WP8 steht normativ in `wp-rahmen.md` des Kern-Plugins.');

  if (sessionKey) teile.push(stempelHinweis(sessionKey));

  teile.push('**Rote Linien (nie automatisiert, gelten auch hier):** Merges · Deploy-Klicks · '
    + 'Review-Resolves/Approvals · alles Kundensichtbare (PR-Texte, Ticket-Kommentare posten). '
    + '**Kein Commit/Push ohne explizite Freigabe des Maintainers.**');

  const repoVersion = readTextFile(path.join(root, 'VERSION'), 64);
  const commits = git(root, ['log', '--oneline', '-' + MAX_COMMITS]);
  const status = git(root, ['status', '--porcelain']);
  const branch = git(root, ['rev-parse', '--abbrev-ref', 'HEAD']);

  const stand = [];
  if (repoVersion) stand.push('- Leitversion (`VERSION`): ' + repoVersion.split(/\r?\n/)[0]);
  if (branch) stand.push('- Branch: `' + branch + '`');
  if (commits) stand.push('- Letzte Commits:\n' + commits.split(/\r?\n/).map(l => '  - ' + l).join('\n'));
  if (status !== null) {
    const zeilen = status.split(/\r?\n/).filter(Boolean);
    const gezeigt = zeilen.slice(0, MAX_STATUS_FILES).map(l => '  - ' + l.trim());
    const rest = zeilen.length - gezeigt.length;
    stand.push('- **Working Tree hat ' + zeilen.length + ' Änderung(en)** — vor eigenen '
      + 'Änderungen prüfen, ob ein fremder Umbau läuft:\n' + gezeigt.join('\n')
      + (rest > 0 ? '\n  - … und ' + rest + ' weitere' : ''));
  } else if (branch) {
    stand.push('- Working Tree: clean');
  }
  if (stand.length) teile.push('## Lebender Stand\n' + stand.join('\n'));

  const unreleased = unreleasedHead(root);
  if (unreleased) teile.push('## `[Unreleased]` im CHANGELOG\n' + unreleased);

  const vorhaben = laufendeVorhaben(root);
  if (vorhaben) {
    teile.push('## Laufende Vorhaben (`knowledge-base/grundwissen/`, jüngste zuerst)\n'
      + vorhaben.map(f => '- ' + f).join('\n')
      + '\nDie jüngste Datei ist der aktuellste Planungsstand; Routing und Quellen-Triage '
      + 'stehen in `knowledge-base/SSOT-Document-Index.md`.');
  }

  const abt = abteilungen(root);
  if (abt) {
    teile.push('## Abteilungen und Module (aus `module-registry.json`)\n'
      + abt.map(a => '- `' + a.namespace + '` **' + a.name + '**'
        + (a.staendig ? ' (ständig, im Kern)' : '')
        + (a.module.length ? ' — Module: ' + a.module.join(', ') : '')).join('\n'));
  }

  return teile.join('\n\n');
}

function main() {
  if (isDisabled()) return;

  let input = {};
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8')) || {};
  } catch (_) { input = {}; } // leere/defekte Eingabe: mit cwd weiterarbeiten
  if (typeof input !== 'object' || input === null) input = {};

  const start = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const root = repoRoot(start);

  const context = buildContext(root, typeof input.source === 'string' ? input.source : '',
    resolveSessionKey(input));
  if (!context) return;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: context
    }
  }));
}

try {
  main();
} catch (e) {
  try { process.stderr.write('nc-session-start fail-open: ' + (e && e.message)); } catch (_) { /* egal */ }
}
// Kein process.exit(): das kann auf POSIX den gepufferten stdout-Write (Pipe) abschneiden —
// die Injektion ginge still verloren. exitCode 0 genuegt fuer fail-open, es laeuft nichts Async.
process.exitCode = 0;
