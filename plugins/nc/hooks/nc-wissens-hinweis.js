#!/usr/bin/env node
// nc-wissens-hinweis.js — deterministische Prompt-Injektion der SSOT-Praesenz
// (Port des Onsite-Hooks `oai-wissens-hinweis.js`, Spec §15.40; Onsite-Anker 6d3f8db,
// Delta-Mapping 2026-08-23 Position D4, Phase H Paket C).
//
// ZWECK: Das Kern-Risiko des OS ist nicht eine unvollstaendige Wissensbasis, sondern eine
// UNSICHTBARE. Die Wissens-Router machen die Knotendokumente ueber ihre description
// dauerhaft im Kontext praesent; dieser Hook ergaenzt sie deterministisch: Er gleicht
// Prompt-Stichworte gegen einen VORGEBAUTEN Sucheindex ab und injiziert Treffer als
// additionalContext. Damit wandert der Zeiger aus dem Modell-Ermessen in die
// Kontroll-Schicht.
//
// KEIN GATE — die wichtigste Abgrenzung dieser Datei:
//   Fuer UserPromptSubmit gilt laut offizieller Hooks-Doku "Exit code 2 blocks prompt
//   processing, erases prompt". Ein Wissens-Zeiger, der Prompts LOESCHT, waere ein
//   Totalschaden. Exit 2 ist deshalb in KEINEM Pfad zulaessig; der Prozess endet immer mit
//   Code 0, auch bei internem Fehler. Der Hook fragt nichts, erzwingt nichts, blockiert
//   nichts — er injiziert oder schweigt.
//
// MECHANIK (uebernommen aus dem Onsite-Original, dort belegt an
// code.claude.com/docs/en/hooks):
//   - UserPromptSubmit feuert bei JEDEM Prompt, einmal je Turn, bevor Claude ihn verarbeitet.
//   - hookSpecificOutput.additionalContext ist der strukturierte Weg, Kontext beizulegen.
//     Genutzt wird ausschliesslich die strukturierte Form.
//   - Subagenten-Laeufe tragen agent_id/agent_type — sie sind ausgenommen, der Parent fuehrt
//     die Sitzung.
//
// KOSTENDISZIPLIN (der Hook laeuft bei jedem Prompt):
//   - KEIN Netzzugriff, KEIN Git-Aufruf, KEIN Parsen von Markdown-Dokumenten. Der
//     SSOT-Document-Index ist mehrere hundert Zeilen Markdown; ihn je Prompt zu lesen waere
//     nicht vertretbar. Gelesen wird ausschliesslich der kompakte Sucheindex
//     `hooks/wissen-sucheindex.json` (eine JSON-Datei, aufgeloest RELATIV ZU DIESER DATEI —
//     bewusst nicht ueber CLAUDE_PLUGIN_DATA, das ist zwischen Prozessen inkonsistent).
//   - Der Prompt wird nur bis PROMPT_DECKEL Zeichen betrachtet; danach bricht die Suche ab.
//     Ein Stichwort jenseits dieser Grenze wird verfehlt — bewusst: vorhersagbare Kosten
//     schlagen vollstaendige Treffer, wenn der Hook je Prompt laeuft.
//   - Hoechstens MAX_TREFFER Treffer, je EINE Zeile. Ein Hook, der bei jedem Prompt einen
//     Absatz injiziert, wird zu Recht abgeschaltet.
//   - Derselbe Treffer erscheint hoechstens EINMAL je Sitzung (Sitzungsmarker, os.tmpdir()).
//
// PLUGIN-GRENZE: Die genannten Dokumente leben in der Wissensbasis des OS-Repos, das in
// fremden Arbeits-Repos nicht existiert. Der Repo-Pfad kommt AUSSCHLIESSLICH aus der
// Infra-Registry `~/.claude/nc/infra.json` (Feld `kernRepoPfad`) — nie aus einem relativen
// Repo-Pfad und nie geraten. Fehlt die Registry, das Feld oder das Verzeichnis, SCHWEIGT der
// Hook: "Setup lief hier nie" ist kein Befund, und ein erfundener Pfad waere der teuerste
// Ausgang, weil er wie eine Auskunft aussieht. Den Reparaturweg (`/nc:setup`) nennen die
// Router-Skills und die Doku, wenn sie tatsaechlich aufgerufen werden — der Hook selbst
// schweigt.
//
// REGISTRY-AUFLOESUNG (Overseer-Entscheid Phase H, 2026-08-24): `kernRepoPfad` zuerst
// (Arbeitsklon, optionales Queue-Flow-Feld laut `skills/setup/infra-registry.md`), sonst
// `kernSsotPfad` (die von /nc:setup angelegte Lesekopie). Fuer reine ZEIGER ist die
// Lesekopie legitim — dieselbe Reihenfolge wie in den vier Router-Skills. Fehlen beide
// Felder oder stehen sie auf 'ausstehend', schweigt der Hook (kein erfundener Pfad).
//
// PFADBEZUG (Abweichung vom Onsite-Original): Feld `pfad` ist bei uns relativ zur
// REPO-WURZEL (also mit `knowledge-base/`-Praefix), nicht relativ zur Wissensbasis. Onsite
// schiebt dort ein festes `knowledge base`-Segment ein; unsere flachere Struktur braucht das
// nicht, und ein repo-relativer Pfad ist gegen die Platte pruefbar, ohne eine zweite Regel
// zu kennen. `basis: "kern-plugin"` bleibt wie im Original: Zeiger auf Dokumente im
// Plugin-Paket, aufgeloest gegen die Plugin-Wurzel.
//
// FAIL-OPEN UEBERALL, bei defektem Zustand ausdruecklich SCHWEIGEND: fehlender/kaputter
// Index, unlesbare Registry, toter Repo-Pfad, kaputter Sitzungsmarker, nicht parsbares stdin
// — nichts davon darf eine Sitzung stoeren oder Rauschen erzeugen.
//
// Opt-out AUSSCHLIESSLICH per Env: NC_WISSEN_HINWEIS=off (bzw. 0/false/disabled).
// Test-Umleitungen: NC_WISSEN_INDEX (Sucheindex-Datei), NC_WISSEN_STATE_DIR (Ersatz fuer
// ~/.claude/nc, also die Registry), NC_WISSEN_SESSION_DIR (Sitzungsmarker).
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
const MAX_TREFFER = 3;
const PROMPT_DECKEL = 8000;                  // Zeichen; siehe Kostendisziplin oben
const SITZUNGS_TTL_MS = 24 * 60 * 60 * 1000; // danach gilt eine Sitzung als neuer Arbeitstag
const REGISTRY_SCHEMA = 1;                   // hoehere Version → schweigen statt raten
const INDEX_SCHEMA = 1;

function isDisabled() {
  return OFF_VALUES.has(String(process.env.NC_WISSEN_HINWEIS || '').trim().toLowerCase());
}

// --- Ablageorte -----------------------------------------------------------------------

function indexDatei() {
  const override = String(process.env.NC_WISSEN_INDEX || '').trim();
  if (override) return path.resolve(override);
  // Relativ zu DIESER Datei: das Plugin-Paket reist als Ganzes, CLAUDE_PLUGIN_DATA nicht.
  return path.join(__dirname, 'wissen-sucheindex.json');
}

/** Wurzel des Kern-Plugins — Heimat der `basis: "kern-plugin"`-Eintraege. */
function pluginWurzel() {
  return path.resolve(__dirname, '..');
}

/** Maschinenlokaler OS-Ordner `~/.claude/nc` — Heimat der Infra-Registry. */
function registryDatei() {
  const override = String(process.env.NC_WISSEN_STATE_DIR || '').trim();
  const dir = override ? path.resolve(override) : path.join(os.homedir(), '.claude', 'nc');
  return path.join(dir, 'infra.json');
}

function sitzungsDir() {
  const override = String(process.env.NC_WISSEN_SESSION_DIR || '').trim();
  if (override) return path.resolve(override);
  return path.join(os.tmpdir(), 'nc-wissens-hinweis');
}

/** Dateiname IMMER ueber sanitizeSessionKey — kein Ausbruch aus dem State-Verzeichnis. */
function sitzungsDatei(sessionKey) {
  const safe = sanitizeSessionKey(sessionKey);
  return safe ? path.join(sitzungsDir(), 'wissen-' + safe + '.json') : null;
}

// --- Lesen und Schreiben ---------------------------------------------------------------

// Dreiwertig: fehlt · defekt · daten. Die Unterscheidung traegt die Fehlerrichtung —
// "fehlt" heisst bei der Registry "Setup lief hier nie", "defekt" heisst "unbekannte Lage".
// Beide fuehren hier zum Schweigen, die Unterscheidung bleibt fuer die Tests sichtbar.
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

/**
 * Datei atomar ersetzen: Temp-Datei in DERSELBEN Verzeichnisebene, dann rename. Ein
 * abgebrochener Lauf hinterlaesst damit nie ein halbes JSON.
 * BEWUSST OHNE SPERRE — anders als beim Lauf-Marker des Queue-Flows: Hier ist der teuerste
 * Ausgang eines verlorenen Schreibvorgangs EIN Hinweis zu viel. Eine Verzeichnis-Sperre je
 * Prompt waere Kosten ohne Gegenwert (und dieser Hook laeuft bei jedem Prompt).
 */
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
 * Welche Treffer wurden in DIESER Sitzung schon gezeigt? Ein defekter Marker zaehlt als
 * "alles schon gezeigt" (Schweigen) — dieselbe Fehlerrichtung wie bei der PreCompact-Mahnung:
 * ein kaputter State darf nie zu wiederholtem Rauschen fuehren.
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

/** Gezeigte Treffer festhalten. `false` heisst fuer den Aufrufer: NICHT ausgeben. */
function markiereGezeigt(datei, bisher, ids) {
  if (!datei) return false;
  try {
    const gezeigt = Object.assign({}, bisher);
    for (const id of ids) gezeigt[id] = Date.now();
    schreibeAtomar(datei, JSON.stringify({ last_active: Date.now(), gezeigt }, null, 2));
    return true;
  } catch (_) {
    // Ohne festgehaltenen Marker wiederholte sich der Hinweis bei jedem Prompt — dann
    // lieber gar nicht ausgeben.
    return false;
  }
}

// --- Stichwort-Abgleich ----------------------------------------------------------------

/**
 * Kleinschreibung plus Umlaut-Faltung. Deutsche Prompts schreiben "Änderung", der Index
 * fuehrt "aenderung" — ohne Faltung liefe die Haelfte der Stichworte ins Leere.
 */
function normalisiere(text) {
  return String(text == null ? '' : text)
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
}

/**
 * Treffer mit LINKER Wortgrenze und offenem Wortende.
 *
 * Warum nicht beidseitig begrenzt: Deutsche Beugung haengt hinten an ("bauplan" →
 * "bauplaene", "bauplans"); eine rechte Grenze verfehlte genau die Formen, die im Prompt
 * stehen. Warum trotzdem eine linke Grenze: ohne sie traefe "gate" in "delegate" oder
 * "ffg" in "suffgabe" — Treffer, die niemand nachvollzieht. Die Stichworte im Index sind
 * entsprechend gewaehlt: lang genug, dass ein offenes Wortende nicht schadet
 * (testerzwungene Mindestlaenge).
 */
function trifft(promptNorm, stichwortNorm) {
  if (!stichwortNorm) return false;
  let von = 0;
  for (;;) {
    const i = promptNorm.indexOf(stichwortNorm, von);
    if (i === -1) return false;
    const davor = i === 0 ? '' : promptNorm.charAt(i - 1);
    if (!/[a-z0-9]/.test(davor)) return true;
    von = i + 1;
  }
}

/**
 * Treffer sammeln und nach Spezifitaet ordnen: das LAENGSTE passende Stichwort gewinnt.
 * Ein Prompt, der "aktualisierungs-index" nennt, meint etwas anderes als einer, der nur
 * "changelog" streift — und bei einem harten Deckel von drei Zeilen entscheidet die
 * Reihenfolge darueber, was ueberhaupt ankommt.
 */
function findeTreffer(eintraege, promptNorm) {
  const treffer = [];
  for (const e of eintraege) {
    if (!e || typeof e !== 'object') continue;
    if (!e.id || !e.pfad || !e.titel) continue;
    const worte = Array.isArray(e.stichworte) ? e.stichworte : [];
    let beste = 0;
    for (const w of worte) {
      const n = normalisiere(w);
      if (n.length > beste && trifft(promptNorm, n)) beste = n.length;
    }
    if (beste > 0) treffer.push({ eintrag: e, gewicht: beste });
  }
  treffer.sort((a, b) => b.gewicht - a.gewicht);
  return treffer.map((t) => t.eintrag);
}

// --- Injektionstext --------------------------------------------------------------------

function zielPfad(eintrag, kernRepoPfad) {
  const teile = String(eintrag.pfad).split('/').filter(Boolean);
  if (eintrag.basis === 'kern-plugin') return path.join(pluginWurzel(), ...teile);
  // Standardfall: repo-relativ (siehe PFADBEZUG im Kopf).
  return path.join(kernRepoPfad, ...teile);
}

function hinweisText(treffer, kernRepoPfad) {
  const zeilen = treffer.map((e) =>
    '- **' + e.titel + '** — ' + (e.hinweis || 'geführte Quelle der SSOT')
    + ' · `' + zielPfad(e, kernRepoPfad) + '`');
  const router = [...new Set(treffer.map((e) => e.router).filter(Boolean))]
    .map((r) => '`/nc:' + r + '`').join(' · ');
  return '# NovaCore-OS — Wissens-Zeiger (Hinweis, keine Blockade)\n\n'
    + 'Zu diesem Prompt führt die SSOT geführte Quellen. Erst dort triagieren, dann lesen — '
    + 'es gilt die Quelle, nicht diese Zeile:\n\n'
    + zeilen.join('\n')
    + (router ? '\n\nVertiefung: ' + router + '.' : '')
    + '\n\nJeder Treffer erscheint höchstens einmal je Sitzung; dieser Hinweis blockiert nichts.';
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

  const prompt = typeof input.prompt === 'string' ? input.prompt : '';
  if (!prompt.trim()) return;
  const promptNorm = normalisiere(prompt.slice(0, PROMPT_DECKEL));

  // Reihenfolge bewusst: erst der billige Abgleich, dann erst Registry und Marker. Der
  // Normalfall (kein Stichwort im Prompt) kostet damit genau EINEN JSON-Lesevorgang.
  const index = ladeJson(indexDatei());
  if (!index.daten) return;                                     // fehlt oder defekt → schweigen
  if (Number(index.daten.schemaVersion) > INDEX_SCHEMA) return; // neuer als der Hook → nicht raten
  const eintraege = Array.isArray(index.daten.eintraege) ? index.daten.eintraege : [];
  if (!eintraege.length) return;

  const treffer = findeTreffer(eintraege, promptNorm);
  if (!treffer.length) return;

  // Infra-Registry: einzige Quelle des OS-Repo-Pfades. Fehlt sie, lief das Setup auf dieser
  // Maschine nie — kein Befund, kein Hinweis (das erledigt `/nc:setup`).
  const registry = ladeJson(registryDatei());
  if (!registry.daten) return;
  if (Number(registry.daten.schemaVersion) > REGISTRY_SCHEMA) return;
  // Overseer-Entscheid Phase H (2026-08-24, loest die BENANNTE GRENZE im Kopf auf):
  // kernRepoPfad zuerst (Arbeitsklon), sonst kernSsotPfad (Lesekopie von /nc:setup).
  // Fuer ZEIGER ist die Lesekopie legitim — gelesen wird nur, nie geschrieben; dieselbe
  // Reihenfolge wie in den vier Router-Skills (Paket A). Der Pfad-Zeiger-Hook (D5)
  // bleibt bewusst bei kernRepoPfad allein: dort geht es um Schreibarbeit im Repo.
  let kernRepoPfad = String(registry.daten.kernRepoPfad || '').trim();
  if (!kernRepoPfad || kernRepoPfad === 'ausstehend') {
    kernRepoPfad = String(registry.daten.kernSsotPfad || '').trim();
  }
  if (!kernRepoPfad || kernRepoPfad === 'ausstehend') return;
  try {
    if (!fs.statSync(kernRepoPfad).isDirectory()) return;
  } catch (_) { return; }                                       // toter Registry-Eintrag → schweigen

  const datei = sitzungsDatei(resolveSessionKey(input));
  const bereits = ladeSitzungsmarker(datei);
  if (bereits === DEFEKT) return;

  const neue = treffer.filter((e) => !bereits[e.id]).slice(0, MAX_TREFFER);
  if (!neue.length) return;

  if (!markiereGezeigt(datei, bereits, neue.map((e) => e.id))) return;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: hinweisText(neue, kernRepoPfad)
    }
  }));
}

try {
  main();
} catch (e) {
  // Fail-open und STILL: eine Fehlermeldung je Prompt waere selbst das Rauschen, das dieser
  // Hook vermeiden soll. Kein stderr, kein Exit-Code ungleich 0.
  void e;
}
// Kein process.exit(): das kann auf POSIX den gepufferten stdout-Write (Pipe) abschneiden —
// die Injektion ginge still verloren.
// Exit-Code IMMER 0: Exit 2 wuerde bei UserPromptSubmit den Prompt loeschen (siehe Kopf).
process.exitCode = 0;
