#!/usr/bin/env node
// nc-doks-autosync.js — SessionStart-Autosync der team-globalen CLAUDE-Anteile
// (Ebenen 1 und 1b der CLAUDE-Ebenen, siehe knowledge-base/grundwissen/
// NovaCore-OS-CLAUDE-Ebenen-Definition.md; Bauplan 2026-08-10 „Onsite-Align-Umbau" AP3,
// erweitert um Ebene 1b durch Bauplan 2026-08-15 „Onsite-Endstand-Nachbau" AP-B2;
// Vorbild: oai-doks-autosync.js aus Onsite 0.17.0/0.19.0, gelesen aus
// origin/feat/queue-flow).
// Haelt ZWEI Zieldateien auf dem Stand des installierten Kern-Plugins — der Marketplace
// liefert keine Doks aus, ein SessionStart-Hook ist der einzige automatische Weg (kein
// Cron):
//   Ebene 1  ~/.claude/CLAUDE.md        → Firmen-BLOCK per Marker-Chirurgie (Privat-Zone!)
//   Ebene 1b ~/.claude/nc-teamsync.md   → GANZE DATEI, vollstaendig firmengefuehrt
// Die beiden Ziele werden unabhaengig voneinander verarbeitet: ein Fehler an einem Ziel
// darf das andere nicht verhindern.
//
// VERIFIZIERTE MECHANIK (offizielle Hooks-Doku, abgerufen 2026-08-10):
//   - SessionStart-Hooks laufen parallel, sind nicht-blockierend, Default-Timeout 600 s
//     je Hook; feuern bei source startup/resume/clear/compact/fork.
//   - command-Hooks duerfen Dateien schreiben.
//
// MARKER-CHIRURGIE (Konvention: NovaCore-OS-CLAUDE-Ebenen-Definition.md im OS-Repo):
//   Der Firmen-Block steht zwischen <!-- NC:BLOCK:START global --> und
//   <!-- NC:BLOCK:ENDE global -->; erste Zeile im Block ist der Versions-Stempel
//   <!-- NC:BLOCK:VERSION <kern-version> -->. Alles ausserhalb der Marker ist
//   PRIVAT-ZONE des Mitarbeiters und wird nie veraendert. Logik:
//     Ziel fehlt            → Datei mit Block anlegen.
//     Ziel ohne Marker      → Block ganz OBEN einfuegen, Bestand byte-identisch dahinter.
//     Marker + identisch    → No-op (nichts schreiben, kein Backup).
//     Marker + abweichend   → NUR den Inhalt zwischen den Markern ersetzen.
//     Marker DEFEKT (START ohne ENDE, ENDE vor START, Mehrfach-Marker)
//                           → NICHTS schreiben, Warnung auf stderr (fail-safe:
//                             lieber veraltet als zerstoert).
//   Vor jedem Schreiben eine rollierende Sicherung <ziel>.nc-autosync-backup.
//
// GANZDATEI-SYNC DER EBENE 1b (Onsite-Vorbild §15.32, hier AP-B2):
//   ~/.claude/nc-teamsync.md gehoert VOLLSTAENDIG der Firma — deshalb bewusst KEINE
//   Marker-Chirurgie, sondern Ganzdatei-Ersatz. Erste Zeile ist der Versions-Stempel
//   <!-- NC:TEAMSYNC:VERSION <kern-version> -->, danach die Payload. Logik:
//     Ziel fehlt / abweichend → schreiben (Backup vorher, wenn Bestand da war).
//     Ziel identisch          → No-op (nichts schreiben, kein Backup).
//   Es gibt hier keine Privat-Zone: wer eigene Regeln braucht, nutzt die Privat-Zone der
//   globalen CLAUDE.md ausserhalb der NC-Marker. Geladen wird die Datei ueber eine
//   @-Import-Zeile im Firmen-Block der Ebene 1 und zusaetzlich als Lese-Schritt in
//   /nc:start.
//   Die Payload ist die ausgelieferte Datei plugins/nc/doks/nc-teamsync.md — seit
//   2026-08-25 wie beim Vorbild UNTER doks/ (die frueher dokumentierte Abweichung
//   "keine Kopie nach doks/" ist damit aufgehoben; Onsite fuehrt die Payload als
//   doks/oai-teamsync.md, wir als doks/nc-teamsync.md).
//
// CRLF-HAERTUNG (NC ueber das Vorbild hinaus, Review-Finding 2026-08-15): Der Vergleich
// „identisch?" laeuft ueber ZEILENENDEN-NORMALISIERTE Texte (\r\n → \n). Windows-Editoren
// speichern Ziele gern mit CRLF; ein roher String-Vergleich saehe dann bei inhaltsgleichem
// Stand einen Dauer-Unterschied und wuerde die Datei in jeder Session neu schreiben
// (Backup-Churn; im Vorbild nur per Doku-Hinweis core.autocrlf geloest). Geschrieben wird
// immer LF; ein inhaltsgleiches CRLF-Ziel bleibt als No-op unangetastet.
//
// KEIN EXTERNER STATE, keine Stempeldateien: der Versions-Kommentar IST der Stempel —
// idempotent und umgebungsunabhaengig. Insbesondere KEINE Pfad-/State-Ableitung ueber
// CLAUDE_PLUGIN_DATA (Onsite-Lesson Kern 0.11.1: die Variable ist zwischen Prozessen
// inkonsistent); Payloads und Version werden relativ zu __dirname aufgeloest.
//
// Opt-out AUSSCHLIESSLICH per Env: NC_AUTOSYNC=off (bzw. 0/false/disabled) — EIN Schalter
// fuer beide Ziele. Ziele fuer Tests ueberschreibbar per NC_AUTOSYNC_TARGET=<pfad>
// (Ebene 1) und NC_AUTOSYNC_TEAMSYNC_TARGET=<pfad> (Ebene 1b).
// Subagenten sind ausgenommen (der Parent-Lauf hat den Sync bereits erledigt).
// Fail-open ueberall: jeder Fehler → kurzer stderr-Hinweis, Exit 0, Session laeuft weiter.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const { isSubagentInvocation } = require('./lib/session-key');

const OFF_VALUES = new Set(['0', 'false', 'off', 'disabled', 'disable']);
const BLOCK_NAME = 'global';
const START = '<!-- NC:BLOCK:START ' + BLOCK_NAME + ' -->';
const ENDE = '<!-- NC:BLOCK:ENDE ' + BLOCK_NAME + ' -->';
const PAYLOAD_DATEI = path.join(__dirname, '..', 'doks', 'global-claude-firmenblock.md');
const MANIFEST = path.join(__dirname, '..', '.claude-plugin', 'plugin.json');

// Ebene 1b (Team-Sync): Ganzdatei, Stempel in der ersten Zeile. Payload = doks/nc-teamsync.md
// (die eine ausgelieferte Quelle, siehe Kopf).
const TEAMSYNC_PAYLOAD = path.join(__dirname, '..', 'doks', 'nc-teamsync.md');
const TEAMSYNC_STEMPEL = '<!-- NC:TEAMSYNC:VERSION ';

function isDisabled() {
  return OFF_VALUES.has(String(process.env.NC_AUTOSYNC || '').trim().toLowerCase());
}

function warn(text) {
  try { process.stderr.write('nc-doks-autosync: ' + text + '\n'); } catch (_) { /* egal */ }
}

/** Zielpfad im Home-`.claude`-Ordner; fuer Tests per Env umleitbar. */
function zielPfad(envName, datei) {
  const override = String(process.env[envName] || '').trim();
  if (override) return path.resolve(override);
  return path.join(os.homedir(), '.claude', datei);
}

/** Zeilenenden normalisieren — NUR fuer Vergleiche, nie fuer das Geschriebene. */
function normalisiert(text) {
  return String(text).replace(/\r\n/g, '\n');
}

/** Soll-Version = Version des installierten Kern-Plugins. Leerstring, wenn unlesbar. */
function kernVersion() {
  try {
    return String(JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).version || '').trim();
  } catch (_) { return ''; }
}

/** Payload-Text ohne BOM und ohne Trailing-Whitespace. Leerstring, wenn unlesbar. */
function payloadText(datei) {
  try {
    return fs.readFileSync(datei, 'utf8').replace(/^﻿/, '').replace(/\s+$/, '');
  } catch (_) { return ''; }
}

/** Firmen-Block bauen: START + Versions-Stempel + Payload + ENDE. Null bei fehlender Quelle. */
function buildBlock(version) {
  const payload = payloadText(PAYLOAD_DATEI);
  if (!payload) { warn('Payload nicht lesbar (' + PAYLOAD_DATEI + ') — Ebene 1 uebersprungen.'); return null; }
  return START + '\n<!-- NC:BLOCK:VERSION ' + version + ' -->\n' + payload + '\n' + ENDE;
}

/** Ganzdatei-Inhalt der Ebene 1b: Stempelzeile + Payload. Null bei fehlender Quelle. */
function buildTeamsync(version) {
  const payload = payloadText(TEAMSYNC_PAYLOAD);
  if (!payload) { warn('Payload nicht lesbar (' + TEAMSYNC_PAYLOAD + ') — Ebene 1b uebersprungen.'); return null; }
  return TEAMSYNC_STEMPEL + version + ' -->\n' + payload + '\n';
}

function anzahl(text, marker) {
  return text.split(marker).length - 1;
}

/** Ein Text traegt genau ein wohlgeformtes Markerpaar (Ebene-1-Intaktheitskriterium). */
function hatIntaktesMarkerpaar(text) {
  return anzahl(text, START) === 1 && anzahl(text, ENDE) === 1
    && text.indexOf(START) < text.indexOf(ENDE);
}

/** Ein Text beginnt mit dem Teamsync-Versions-Stempel (Ebene-1b-Intaktheitskriterium). */
function hatTeamsyncStempel(text) {
  return normalisiert(text).startsWith(TEAMSYNC_STEMPEL);
}

/**
 * Sicherung anlegen — aber NIE eine gute Sicherung durch eine schlechtere ersetzen
 * (NC-Haertung, Nachtrag N2/M2 des Onsite-Align-Umbaus; gilt jetzt je Ziel mit dessen
 * eigenem Intaktheitskriterium). Wenn das vorhandene Backup intakt wirkt und der aktuelle
 * Bestand nicht, ist der Bestand vermutlich beschaedigt (abgeschnittener Read, fremder
 * Teilschreiber) — dann bleibt das aeltere, bessere Backup stehen.
 */
function sichere(ziel, istIntakt) {
  const backup = ziel + '.nc-autosync-backup';
  try {
    if (fs.existsSync(backup)) {
      const altesBackup = fs.readFileSync(backup, 'utf8');
      const bestand = fs.readFileSync(ziel, 'utf8');
      if (istIntakt(altesBackup) && !istIntakt(bestand)) {
        warn('vorhandene Sicherung wirkt intakter als der aktuelle Bestand von ' + ziel
          + ' — sie wird NICHT ueberschrieben.');
        return;
      }
    }
  } catch (_) { /* unlesbares Backup: normal weiter sichern */ }
  fs.copyFileSync(ziel, backup);
}

/**
 * Rollierende Sicherung vor JEDEM Schreiben, danach ATOMARER Write; wirft bei Fehlern
 * (dann wird nicht geschrieben).
 *
 * Atomar per Temp-Datei + rename (NC-Haertung, Review 2026-08-10, Nachtrag N2/M2):
 * SessionStart feuert auch bei resume/clear/compact/fork, zwei parallel startende Fenster
 * sind also real. Vorher schrieb der Hook in-place — ein zweiter Prozess konnte einen halb
 * geschriebenen Bestand lesen, darin keine Marker finden, den Torso als "Backup" ueber die
 * einzige gute Sicherung kopieren und ihn hinter den Block haengen: Privat-Zone dauerhaft
 * gekuerzt. Die Temp-Datei liegt im selben Verzeichnis, damit rename auf demselben Volume
 * bleibt.
 */
function schreibeMitBackup(ziel, neuerInhalt, bestandExistiert, istIntakt) {
  if (bestandExistiert) sichere(ziel, istIntakt);
  const tmp = ziel + '.nc-autosync-tmp-' + process.pid;
  try {
    fs.writeFileSync(tmp, neuerInhalt, 'utf8');
    fs.renameSync(tmp, ziel);
  } catch (error) {
    try { fs.unlinkSync(tmp); } catch (_) { /* egal */ }
    throw error;
  }
}

/** Ebene 1b: Ganzdatei-Ersatz, kein Marker, No-op bei (normalisiert) identischem Stand. */
function syncTeamsync(version) {
  const inhalt = buildTeamsync(version);
  if (!inhalt) return;

  const ziel = zielPfad('NC_AUTOSYNC_TEAMSYNC_TARGET', 'nc-teamsync.md');

  if (!fs.existsSync(ziel)) {
    fs.mkdirSync(path.dirname(ziel), { recursive: true });
    schreibeMitBackup(ziel, inhalt, false, hatTeamsyncStempel);
    return;
  }
  const bestand = fs.readFileSync(ziel, 'utf8');
  if (normalisiert(bestand) === normalisiert(inhalt)) return; // Stempel + Inhalt identisch → No-op
  schreibeMitBackup(ziel, inhalt, true, hatTeamsyncStempel);
}

/** Ebene 1: Marker-Chirurgie am Firmen-Block, Privat-Zone bleibt unangetastet. */
function syncFirmenBlock(version) {
  const block = buildBlock(version);
  if (!block) return;

  const ziel = zielPfad('NC_AUTOSYNC_TARGET', 'CLAUDE.md');

  if (!fs.existsSync(ziel)) {
    fs.mkdirSync(path.dirname(ziel), { recursive: true });
    schreibeMitBackup(ziel, block + '\n', false, hatIntaktesMarkerpaar);
    return;
  }

  const bestand = fs.readFileSync(ziel, 'utf8');
  const starts = anzahl(bestand, START);
  const enden = anzahl(bestand, ENDE);

  if (starts === 0 && enden === 0) {
    // Kein Firmen-Block: Block ganz oben, Privat-Zone byte-identisch dahinter erhalten.
    schreibeMitBackup(ziel, block + '\n\n' + bestand, true, hatIntaktesMarkerpaar);
    return;
  }

  const idxStart = bestand.indexOf(START);
  const idxEnde = bestand.indexOf(ENDE);
  if (starts !== 1 || enden !== 1 || idxEnde < idxStart) {
    // Defekte Marker: fail-safe — lieber ein veralteter Block als eine zerstoerte Privat-Zone.
    warn('defekte NC-Marker in ' + ziel + ' (START: ' + starts + ', ENDE: ' + enden
      + ') — es wird NICHTS geschrieben; Marker manuell reparieren oder /nc:update-doks nutzen.');
    return;
  }

  const aktuell = bestand.slice(idxStart, idxEnde + ENDE.length);
  if (normalisiert(aktuell) === normalisiert(block)) return; // Version + Inhalt identisch → No-op

  schreibeMitBackup(ziel,
    bestand.slice(0, idxStart) + block + bestand.slice(idxEnde + ENDE.length), true,
    hatIntaktesMarkerpaar);
}

function main() {
  let input = {};
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8')) || {};
  } catch (_) { input = {}; }
  if (typeof input !== 'object' || input === null) input = {};

  if (isSubagentInvocation(input)) return; // Parent-Session hat den Sync bereits erledigt
  if (isDisabled()) return;

  const version = kernVersion();
  if (!version) { warn('Kern-Version nicht lesbar (' + MANIFEST + ') — Sync uebersprungen.'); return; }

  // Beide Ziele unabhaengig: ein defektes Ziel darf das andere nicht mitnehmen.
  for (const [name, fn] of [['Ebene 1', syncFirmenBlock], ['Ebene 1b', syncTeamsync]]) {
    try {
      fn(version);
    } catch (e) {
      warn(name + ' fail-open: ' + (e && e.message));
    }
  }
}

try {
  main();
} catch (e) {
  warn('fail-open: ' + (e && e.message));
}
// Kein process.exit(): das kann auf POSIX gepufferte Writes abschneiden. exitCode 0
// genuegt fuer fail-open, es laeuft nichts Async.
process.exitCode = 0;
