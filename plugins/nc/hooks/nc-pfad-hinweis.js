#!/usr/bin/env node
// nc-pfad-hinweis.js — Disziplin-Schicht der SSOT-Praesenz
// (Port des Onsite-Hooks `oai-pfad-hinweis.js`, Spec §15.49; Onsite-Anker 6d3f8db,
// Delta-Mapping 2026-08-23 Position D5, Phase H Paket C).
//
// ZWECK — und die Abgrenzung, die diese Datei traegt: Die Wissens-Router und der
// Wissens-Zeiger (`nc-wissens-hinweis.js`) beseitigen UNWISSEN ("ich wusste nicht, dass es
// das Dokument gibt"). Was bleibt, ist ERMESSEN: Der Agent kennt den Aktualisierungs-Index
// und ueberspringt ihn trotzdem — "nur Doku", "ich kenne die Struktur", "zu klein fuer den
// Standardprozess". Dieser Hook greift NACH der Entscheidung zu schreiben, also genau dort,
// wo das Ermessen sitzt: Bei der ERSTEN Schreibaktion je Sitzung und je PFADKLASSE legt er
// die passende Zeile der Aenderungs-Matrix bei — was vorher zu lesen und was mitzuziehen
// ist. Eine Zeile, kein Index-Volltext.
//
// KEIN GATE — die wichtigste Abgrenzung dieser Datei:
//   Exit-Code 2 BLOCKT bei PreToolUse den Werkzeugaufruf. Ein Zeiger, der Schreibaktionen
//   blockiert, waere teurer als das Problem, das er loest. Exit 2 ist deshalb in KEINEM Pfad
//   zulaessig; der Prozess endet immer mit 0. Ebenso wird permissionDecision NIE gesetzt —
//   weder "deny" (waere eine Blockade) noch "allow" (wuerde den Freigabefluss des Menschen
//   ueberspringen). Der Hook injiziert oder schweigt.
//
// MECHANIK (uebernommen aus dem Onsite-Original, dort belegt an
// code.claude.com/docs/en/hooks):
//   - "PreToolUse decision control" fuehrt drei Felder in hookSpecificOutput:
//     permissionDecision ("allow" | "deny"), permissionDecisionReason und additionalContext.
//   - permissionDecision ist NICHT erforderlich. Wird es weggelassen, gilt "no decision;
//     normal permission flow applies" — genau der hier gewollte Vertrag: Kontext beilegen,
//     ohne in die Freigabe einzugreifen.
//   Faellt dieser Beleg kuenftig weg, ist der Hook wirkungslos, aber harmlos: ohne
//   uebernommenen additionalContext passiert schlicht nichts.
//
// KOSTENDISZIPLIN (weiterer PreToolUse-Hook auf derselben Matcher-Familie neben FFG,
// Start-Gate und Safety-Gate — er MUSS billig bleiben):
//   - KEIN Netzzugriff, KEIN Git-Aufruf, KEIN Parsen von Markdown. Gelesen wird
//     ausschliesslich der kompakte Index `hooks/pfad-aenderungsindex.json`, aufgeloest
//     RELATIV ZU DIESER DATEI (bewusst nicht ueber CLAUDE_PLUGIN_DATA, das ist zwischen
//     Prozessen inkonsistent).
//   - Der Normalfall — Schreibaktion in einer bereits gemeldeten Klasse oder ausserhalb des
//     OS-Repos — kostet einen JSON-Lesevorgang und einen Prefix-Vergleich.
//   - Hoechstens MAX_KLASSEN Zeilen je Aufruf; jede Klasse hoechstens EINMAL je Sitzung.
//
// PLUGIN-GRENZE: Die Aenderungs-Matrix beschreibt die Pflege des OS-Repos. In einem fremden
// Arbeits-Repo hat sie nichts zu sagen. Der Repo-Pfad kommt AUSSCHLIESSLICH aus der
// Infra-Registry `~/.claude/nc/infra.json` (Feld `kernRepoPfad`) — nie geraten. Fehlt sie,
// oder liegt die geschriebene Datei ausserhalb dieses Pfades, SCHWEIGT der Hook.
//
// BENANNTE GRENZE zur NovaCore-Registry (bewusst, Vertrag Phase H Paket C): `kernRepoPfad`
// ist bei uns laut `skills/setup/infra-registry.md` ein OPTIONALES Queue-Flow-Feld
// (Arbeitsklon des OS-Repos); die immer vorhandene Lesekopie steht in `kernSsotPfad` — die
// ist hier aber die FALSCHE Quelle, weil in einer Lesekopie nicht gearbeitet wird. Solange
// keine Maschine `kernRepoPfad` setzt, schweigt dieser Hook vollstaendig. Das ist die
// richtige Fehlerrichtung (kein geratener Repo-Pfad), aber eine reale Wirkungsgrenze; ob
// `/nc:setup` das Feld kuenftig auch ohne Queue-Bedarf schreibt, entscheidet der Maintainer.
//
// FAIL-OPEN UEBERALL, bei defektem Zustand ausdruecklich SCHWEIGEND: fehlender/kaputter
// Index, unlesbare Registry, toter Repo-Pfad, kaputter Sitzungsmarker, nicht parsbares stdin.
//
// EHRLICHE LUECKE (erste Fassung): Bash steht NICHT im Matcher. `echo > datei` und aehnliche
// Schreibwege an der Edit-Schranke vorbei bleiben unbemerkt. Das ist eine benannte Grenze,
// kein stilles Versprechen — nachruestbar, sobald ein belegter Bypass es wert ist.
//
// Opt-out AUSSCHLIESSLICH per Env: NC_PFAD_HINWEIS=off (bzw. 0/false/disabled).
// Test-Umleitungen: NC_PFAD_INDEX (Indexdatei), NC_PFAD_STATE_DIR (Ersatz fuer ~/.claude/nc,
// also die Registry), NC_PFAD_SESSION_DIR (Sitzungsmarker).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

// Require in Schutzhuelle (GLM-H-R1): bei defekter/unvollstaendiger Paketinstallation
// waere ein nacktes require der einzige Pfad mit Exit != 0 — der Hook ist dann
// wirkungslos, aber harmlos (CJS-Wrapper erlaubt top-level return).
let resolveSessionKey, sanitizeSessionKey, isSubagentInvocation;
try {
  ({ resolveSessionKey, sanitizeSessionKey, isSubagentInvocation } = require('./lib/session-key'));
} catch (_) {
  process.exitCode = 0;
  return;
}

const OFF_VALUES = new Set(['0', 'false', 'off', 'disabled', 'disable']);
const MAX_KLASSEN = 3;                       // gleicher Deckel wie beim Wissens-Zeiger
const SITZUNGS_TTL_MS = 24 * 60 * 60 * 1000; // danach gilt eine Sitzung als neuer Arbeitstag
const REGISTRY_SCHEMA = 1;                   // hoehere Version → schweigen statt raten
const INDEX_SCHEMA = 1;

function isDisabled() {
  return OFF_VALUES.has(String(process.env.NC_PFAD_HINWEIS || '').trim().toLowerCase());
}

// --- Ablageorte -----------------------------------------------------------------------

function indexDatei() {
  const override = String(process.env.NC_PFAD_INDEX || '').trim();
  if (override) return path.resolve(override);
  // Relativ zu DIESER Datei: das Plugin-Paket reist als Ganzes, CLAUDE_PLUGIN_DATA nicht.
  return path.join(__dirname, 'pfad-aenderungsindex.json');
}

/** Maschinenlokaler OS-Ordner `~/.claude/nc` — Heimat der Infra-Registry. */
function registryDatei() {
  const override = String(process.env.NC_PFAD_STATE_DIR || '').trim();
  const dir = override ? path.resolve(override) : path.join(os.homedir(), '.claude', 'nc');
  return path.join(dir, 'infra.json');
}

function sitzungsDir() {
  const override = String(process.env.NC_PFAD_SESSION_DIR || '').trim();
  if (override) return path.resolve(override);
  return path.join(os.tmpdir(), 'nc-pfad-hinweis');
}

/** Dateiname IMMER ueber sanitizeSessionKey — kein Ausbruch aus dem State-Verzeichnis. */
function sitzungsDatei(sessionKey) {
  const safe = sanitizeSessionKey(sessionKey);
  return safe ? path.join(sitzungsDir(), 'pfad-' + safe + '.json') : null;
}

// --- Lesen und Schreiben ---------------------------------------------------------------

// Dreiwertig: fehlt · defekt · daten — dieselbe Fehlerrichtung wie im Wissens-Zeiger.
function ladeJson(datei) {
  try {
    if (!fs.existsSync(datei)) return { fehlt: true };
  } catch (_) { return { defekt: true }; }
  try {
    const daten = JSON.parse(fs.readFileSync(datei, 'utf8'));
    if (!daten || typeof daten !== 'object') return { defekt: true };
    return { daten };
  } catch (_) { return { defekt: true }; }
}

/** Datei atomar ersetzen — ein abgebrochener Lauf hinterlaesst nie ein halbes JSON. */
function schreibeAtomar(datei, text) {
  const dir = path.dirname(datei);
  fs.mkdirSync(dir, { recursive: true });
  const temp = path.join(dir, '.' + path.basename(datei) + '.' + process.pid + '.tmp');
  try {
    fs.writeFileSync(temp, text, 'utf8');
    fs.renameSync(temp, datei);
  } finally {
    try { if (fs.existsSync(temp)) fs.unlinkSync(temp); } catch (_) { /* egal */ }
  }
}

const DEFEKT = Symbol('defekt');

/**
 * Welche Klassen wurden in DIESER Sitzung schon gemeldet? Ein defekter Marker zaehlt als
 * "alles schon gemeldet" (Schweigen) — ein kaputter State darf nie zu wiederholtem Rauschen
 * bei JEDER Schreibaktion fuehren.
 */
function ladeSitzungsmarker(datei) {
  if (!datei) return DEFEKT;
  const gelesen = ladeJson(datei);
  if (gelesen.fehlt) return {};
  if (gelesen.defekt) return DEFEKT;
  const alter = Date.now() - (Number(gelesen.daten.last_active) || 0);
  if (alter > SITZUNGS_TTL_MS) return {};
  const gezeigt = gelesen.daten.gezeigt;
  return (gezeigt && typeof gezeigt === 'object') ? gezeigt : {};
}

/** Gemeldete Klassen festhalten. `false` heisst fuer den Aufrufer: NICHT ausgeben. */
function markiereGezeigt(datei, bisher, ids) {
  if (!datei) return false;
  try {
    const gezeigt = Object.assign({}, bisher);
    for (const id of ids) gezeigt[id] = Date.now();
    schreibeAtomar(datei, JSON.stringify({ last_active: Date.now(), gezeigt }, null, 2));
    return true;
  } catch (_) {
    // Ohne festgehaltenen Marker wiederholte sich der Hinweis bei jeder Schreibaktion —
    // dann lieber gar nicht ausgeben.
    return false;
  }
}

// --- Pfade einsammeln und klassifizieren -----------------------------------------------

/**
 * Alle Zieldateien eines Werkzeugaufrufs. Write/Edit tragen `file_path`, NotebookEdit
 * `notebook_path`; MultiEdit-Varianten fuehren die Ziele in `edits[]` bzw. `files[]`. Alles
 * wird eingesammelt und vereinigt (MultiEdit mit Dateien mehrerer Klassen: Union).
 * Unbekannte Formen liefern nichts — Schweigen statt Raten.
 */
function zieldateien(toolInput) {
  if (!toolInput || typeof toolInput !== 'object') return [];
  const gefunden = [];
  const nimm = (wert) => {
    if (typeof wert === 'string' && wert.trim()) gefunden.push(wert.trim());
  };
  nimm(toolInput.file_path);
  nimm(toolInput.notebook_path);
  for (const feld of ['edits', 'files']) {
    const liste = toolInput[feld];
    if (!Array.isArray(liste)) continue;
    for (const e of liste) {
      if (typeof e === 'string') nimm(e);
      else if (e && typeof e === 'object') { nimm(e.file_path); nimm(e.notebook_path); }
    }
  }
  return [...new Set(gefunden)];
}

/**
 * realpath, das auch fuer NOCH NICHT existierende Dateien funktioniert: Es loest den
 * naechsten vorhandenen Vorfahren auf und haengt den Rest wieder an.
 *
 * Warum das noetig ist: Ein `Write` auf eine neue Datei ist der Regelfall dieses Hooks, aber
 * `fs.realpathSync` wirft dort. Loest man nur die Repo-Wurzel auf und die Datei nicht, liegen
 * beide Seiten in verschiedenen Namensraeumen — auf macOS ist `/var` ein Symlink auf
 * `/private/var`, der Vergleich schlaegt dann still fehl und der Hook schweigt immer.
 */
function realpathTolerant(p) {
  let abs;
  try { abs = path.resolve(p); } catch (_) { return null; }
  const rest = [];
  let kandidat = abs;
  for (;;) {
    try {
      const echt = fs.realpathSync(kandidat);
      return rest.length ? path.join(echt, ...rest.reverse()) : echt;
    } catch (_) { /* weiter nach oben */ }
    const eltern = path.dirname(kandidat);
    if (eltern === kandidat) return abs;   // Wurzel erreicht, nichts aufloesbar
    rest.push(path.basename(kandidat));
    kandidat = eltern;
  }
}

/**
 * Repo-relativer Pfad — oder null, wenn die Datei ausserhalb des OS-Repos liegt.
 * Der Vergleich laeuft ueber path.relative, NICHT ueber Stringpraefixe: sonst passte
 * `/pfad/repo-alt` faelschlich zu `/pfad/repo`.
 */
function repoRelativ(datei, kernRepoPfad) {
  const abs = realpathTolerant(datei);
  if (!abs) return null;
  let rel;
  try { rel = path.relative(kernRepoPfad, abs); } catch (_) { return null; }
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join('/');
}

/**
 * Laengster Prefix gewinnt: `plugins/nc/hooks/lib/session-key.js` bekommt die Lib-Zeile
 * (mit dem Drift-Ritual), nicht die allgemeine Hook-Zeile. Ohne diese Regel waere der Index
 * eine Reihenfolgen-Falle.
 */
function klassifiziere(relPfad, eintraege) {
  let treffer = null;
  for (const e of eintraege) {
    if (!e || typeof e !== 'object') continue;
    if (!e.id || !e.prefix || !e.matrixKey) continue;
    const prefix = String(e.prefix);
    if (!relPfad.startsWith(prefix)) continue;
    if (!treffer || prefix.length > String(treffer.prefix).length) treffer = e;
  }
  return treffer;
}

// --- Injektionstext --------------------------------------------------------------------

function hinweisText(klassen) {
  const zeilen = klassen.map((e) =>
    '- **' + (e.titel || e.id) + '** → Änderungs-Matrix **' + e.matrixKey + '**'
    + (e.lesen ? '\n  - *vorher lesen:* ' + e.lesen : '')
    + (e.mitziehen ? '\n  - *in derselben Änderung mitziehen:* ' + e.mitziehen : ''));
  return '# NovaCore-OS — Pfad-Zeiger (Hinweis, keine Blockade)\n\n'
    + 'Erste Änderung dieser Pfadklasse in dieser Sitzung. Der Aktualisierungs-Index führt dazu '
    + 'eine Zeile — sie gilt, nicht diese Zusammenfassung:\n\n'
    + zeilen.join('\n')
    + '\n\nQuelle (OS-Repo): `knowledge-base/standardprozesse/aktualisierungs-index.md` §2 '
    + '(Änderungs-Matrix); die Kurzform steht in `AGENTS.md`. Umfang bestimmen statt schätzen — '
    + 'auch bei „nur Doku" und „zu klein für den Standardprozess".'
    + '\n\nJede Pfadklasse erscheint höchstens einmal je Sitzung; dieser Hinweis blockiert nichts.';
}

// --- Hook-Lauf -------------------------------------------------------------------------

function main() {
  if (isDisabled()) return;

  let input = {};
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8')) || {};
  } catch (_) { input = {}; }
  if (typeof input !== 'object' || input === null) input = {};

  if (isSubagentInvocation(input)) return; // der Parent-Lauf fuehrt die Sitzung

  const dateien = zieldateien(input.tool_input);
  if (!dateien.length) return;

  // Reihenfolge bewusst: erst der billige Index-Lesevorgang, dann Registry und Marker.
  const index = ladeJson(indexDatei());
  if (!index.daten) return;                                     // fehlt oder defekt → schweigen
  if (Number(index.daten.schemaVersion) > INDEX_SCHEMA) return; // neuer als der Hook → nicht raten
  const eintraege = Array.isArray(index.daten.eintraege) ? index.daten.eintraege : [];
  if (!eintraege.length) return;

  // Infra-Registry: einzige Quelle des OS-Repo-Pfades. Fehlt sie, lief das Setup auf dieser
  // Maschine nie — kein Befund, kein Hinweis (das erledigt `/nc:setup`).
  const registry = ladeJson(registryDatei());
  if (!registry.daten) return;
  if (Number(registry.daten.schemaVersion) > REGISTRY_SCHEMA) return;
  const kernRepoPfad = String(registry.daten.kernRepoPfad || '').trim();
  if (!kernRepoPfad || kernRepoPfad === 'ausstehend') return;
  let repoWurzel;
  try {
    repoWurzel = fs.realpathSync(kernRepoPfad);
    if (!fs.statSync(repoWurzel).isDirectory()) return;
  } catch (_) { return; }                                       // toter Registry-Eintrag → schweigen

  // Union ueber alle Zieldateien, Reihenfolge der Erstnennung bleibt erhalten.
  const klassen = [];
  const gesehen = new Set();
  for (const datei of dateien) {
    const rel = repoRelativ(datei, repoWurzel);
    if (!rel) continue;                                          // fremdes Repo → schweigen
    const klasse = klassifiziere(rel, eintraege);
    if (!klasse || gesehen.has(klasse.id)) continue;
    gesehen.add(klasse.id);
    klassen.push(klasse);
  }
  if (!klassen.length) return;

  const marker = sitzungsDatei(resolveSessionKey(input));
  const bereits = ladeSitzungsmarker(marker);
  if (bereits === DEFEKT) return;

  const neue = klassen.filter((e) => !bereits[e.id]).slice(0, MAX_KLASSEN);
  if (!neue.length) return;

  if (!markiereGezeigt(marker, bereits, neue.map((e) => e.id))) return;

  // NUR hookEventName + additionalContext: kein permissionDecision, damit der normale
  // Freigabefluss unberuehrt bleibt (siehe MECHANIK oben).
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      additionalContext: hinweisText(neue)
    }
  }));
}

try {
  main();
} catch (e) {
  // Fail-open und STILL: eine Fehlermeldung je Schreibaktion waere selbst das Rauschen, das
  // dieser Hook vermeiden soll. Kein stderr, kein Exit-Code ungleich 0.
  void e;
}
// Kein process.exit(): das kann auf POSIX den gepufferten stdout-Write (Pipe) abschneiden —
// die Injektion ginge still verloren.
// Exit-Code IMMER 0: Exit 2 wuerde bei PreToolUse den Werkzeugaufruf BLOCKEN (siehe Kopf).
process.exitCode = 0;
