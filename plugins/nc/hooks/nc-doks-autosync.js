#!/usr/bin/env node
// nc-doks-autosync.js — SessionStart-Autosync der team-globalen CLAUDE-Anteile
// (Ebene 1 der CLAUDE-Ebenen, siehe knowledge-base/grundwissen/
// NovaCore-OS-CLAUDE-Ebenen-Definition.md; Bauplan 2026-08-10 „Onsite-Align-Umbau", AP3).
// Haelt den firmengefuehrten Block in ~/.claude/CLAUDE.md auf dem Stand des installierten
// Kern-Plugins — der Marketplace liefert keine Doks aus, ein SessionStart-Hook ist der
// einzige automatische Weg (kein Cron).
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
// KEIN EXTERNER STATE, keine Stempeldateien: der Versions-Kommentar im Block IST der
// Stempel — idempotent und umgebungsunabhaengig. Insbesondere KEINE Pfad-/State-
// Ableitung ueber CLAUDE_PLUGIN_DATA (Onsite-Lesson Kern 0.11.1: die Variable ist zwischen
// Prozessen inkonsistent); Payload und Version werden relativ zu __dirname aufgeloest.
//
// Opt-out AUSSCHLIESSLICH per Env: NC_AUTOSYNC=off (bzw. 0/false/disabled).
// Ziel fuer Tests ueberschreibbar per NC_AUTOSYNC_TARGET=<pfad>.
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

function isDisabled() {
  return OFF_VALUES.has(String(process.env.NC_AUTOSYNC || '').trim().toLowerCase());
}

function warn(text) {
  try { process.stderr.write('nc-doks-autosync: ' + text + '\n'); } catch (_) { /* egal */ }
}

function zielPfad() {
  const override = String(process.env.NC_AUTOSYNC_TARGET || '').trim();
  if (override) return path.resolve(override);
  return path.join(os.homedir(), '.claude', 'CLAUDE.md');
}

/** Firmen-Block bauen: START + Versions-Stempel + Payload + ENDE. Null bei fehlender Quelle. */
function buildBlock() {
  let version;
  try {
    version = String(JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).version || '').trim();
  } catch (_) { version = ''; }
  if (!version) { warn('Kern-Version nicht lesbar (' + MANIFEST + ') — Sync uebersprungen.'); return null; }

  let payload;
  try {
    payload = fs.readFileSync(PAYLOAD_DATEI, 'utf8').replace(/^﻿/, '').replace(/\s+$/, '');
  } catch (_) { payload = ''; }
  if (!payload) { warn('Payload nicht lesbar (' + PAYLOAD_DATEI + ') — Sync uebersprungen.'); return null; }

  return START + '\n<!-- NC:BLOCK:VERSION ' + version + ' -->\n' + payload + '\n' + ENDE;
}

function anzahl(text, marker) {
  return text.split(marker).length - 1;
}

/** Ein Text traegt genau ein wohlgeformtes Markerpaar. */
function hatIntaktesMarkerpaar(text) {
  return anzahl(text, START) === 1 && anzahl(text, ENDE) === 1
    && text.indexOf(START) < text.indexOf(ENDE);
}

/**
 * Sicherung anlegen — aber NIE eine gute Sicherung durch eine schlechtere ersetzen
 * (Nachtrag N2/M2). Wenn das vorhandene Backup ein intaktes Markerpaar traegt und der
 * aktuelle Bestand keines, ist der Bestand vermutlich beschaedigt (abgeschnittener Read,
 * fremder Teilschreiber) — dann bleibt das aeltere, bessere Backup stehen.
 */
function sichere(ziel) {
  const backup = ziel + '.nc-autosync-backup';
  try {
    if (fs.existsSync(backup)) {
      const altesBackup = fs.readFileSync(backup, 'utf8');
      const bestand = fs.readFileSync(ziel, 'utf8');
      if (hatIntaktesMarkerpaar(altesBackup) && !hatIntaktesMarkerpaar(bestand)) {
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
 * Atomar per Temp-Datei + rename (Review-Haertung 2026-08-10, Nachtrag N2/M2): SessionStart
 * feuert auch bei resume/clear/compact/fork, zwei parallel startende Fenster sind also real.
 * Vorher schrieb der Hook in-place — ein zweiter Prozess konnte einen halb geschriebenen
 * Bestand lesen, darin keine Marker finden, den Torso als "Backup" ueber die einzige gute
 * Sicherung kopieren und ihn hinter den Block haengen: Privat-Zone dauerhaft gekuerzt.
 * Die Temp-Datei liegt im selben Verzeichnis, damit rename auf demselben Volume bleibt.
 */
function schreibeMitBackup(ziel, neuerInhalt, bestandExistiert) {
  if (bestandExistiert) sichere(ziel);
  const tmp = ziel + '.nc-autosync-tmp-' + process.pid;
  try {
    fs.writeFileSync(tmp, neuerInhalt, 'utf8');
    fs.renameSync(tmp, ziel);
  } catch (error) {
    try { fs.unlinkSync(tmp); } catch (_) { /* egal */ }
    throw error;
  }
}

function main() {
  let input = {};
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8')) || {};
  } catch (_) { input = {}; }
  if (typeof input !== 'object' || input === null) input = {};

  if (isSubagentInvocation(input)) return; // Parent-Session hat den Sync bereits erledigt
  if (isDisabled()) return;

  const block = buildBlock();
  if (!block) return;

  const ziel = zielPfad();

  if (!fs.existsSync(ziel)) {
    fs.mkdirSync(path.dirname(ziel), { recursive: true });
    schreibeMitBackup(ziel, block + '\n', false);
    return;
  }

  const bestand = fs.readFileSync(ziel, 'utf8');
  const starts = anzahl(bestand, START);
  const enden = anzahl(bestand, ENDE);

  if (starts === 0 && enden === 0) {
    // Kein Firmen-Block: Block ganz oben, Privat-Zone byte-identisch dahinter erhalten.
    schreibeMitBackup(ziel, block + '\n\n' + bestand, true);
    return;
  }

  const idxStart = bestand.indexOf(START);
  const idxEnde = bestand.indexOf(ENDE);
  if (starts !== 1 || enden !== 1 || idxEnde < idxStart) {
    // Defekte Marker: fail-safe — lieber ein veralteter Block als eine zerstoerte Privat-Zone.
    warn('defekte NC-Marker in ' + ziel + ' (START: ' + starts + ', ENDE: ' + enden
      + ') — es wird NICHTS geschrieben; Marker manuell reparieren.');
    return;
  }

  const aktuell = bestand.slice(idxStart, idxEnde + ENDE.length);
  if (aktuell === block) return; // Version und Inhalt identisch → No-op

  schreibeMitBackup(ziel,
    bestand.slice(0, idxStart) + block + bestand.slice(idxEnde + ENDE.length), true);
}

try {
  main();
} catch (e) {
  warn('fail-open: ' + (e && e.message));
}
// Kein process.exit(): das kann auf POSIX gepufferte Writes abschneiden. exitCode 0
// genuegt fuer fail-open, es laeuft nichts Async.
process.exitCode = 0;
