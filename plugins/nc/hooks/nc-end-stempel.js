#!/usr/bin/env node
// nc-end-stempel.js — Abschluss-Stempel des Sitzungsabschlusses (Bauplan 2026-08-15
// „Onsite-Endstand-Nachbau", AP-B1; Vorbild: oai-end-stempel.js aus Onsite 0.18.0–0.18.2,
// gelesen aus origin/feat/queue-flow, 1:1 auf NovaCore gemappt).
// Wird von /nc:end-session als LETZTER Ablaufschritt ausgefuehrt und schaltet die
// PreCompact-Mahnung (nc-end-mahnung.js) fuer diese Sitzung ab: Wer den Sitzungsstand
// gesichert hat, soll vor dem Kompaktieren nicht daran erinnert werden.
//
// KEIN FAKTEN-STEMPEL (anders als nc-start-stempel.js): Dort gibt es eine pruefbare
// Aussenwelt — Branch und HEAD lassen sich gegen `git rev-parse` verifizieren. Der
// Sitzungsabschluss hat keine solche Instanz: WELCHE Dateien end-session schreibt,
// haengt am Arbeits-Repo (seit Kern 0.13.0: die Kategorie `sitzungswissen/` der eigenen
// Wissensbasis — und wo es keine gibt, GAR KEINE Datei, weil dort das Projekt-Memory
// allein traegt) und am installierten Abteilungsplugin. Ein Pfad-Check waere damit erst
// recht entweder umgehbar oder falsch-negativ und
// wuerde ein *mahnendes* Gate in eine Sackgasse verwandeln. Der Stempel ist daher ein
// reiner Selbstauskunfts-Marker — vertretbar, weil die Mahnung nur mahnt (einmal je
// Sitzung) und nichts dauerhaft verweigert.
//
// Aufruf (den exakten Befehl nennt die Mahn-Ausgabe und der letzte end-session-Schritt):
//   node nc-end-stempel.js --session <key>
// Exit 0 = gestempelt; Exit 1 = verweigert (--session fehlt).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { sanitizeSessionKey } = require('./lib/session-key');

// State-Ablage (getrennt vom Start-Gate: eigene Pruefung, eigener State).
// BEWUSST OHNE CLAUDE_PLUGIN_DATA — dieselbe Lektion wie beim Start-Stempel (Onsite
// 0.11.1): Den Stempel schreibt der Agent aus dem Bash-Tool, gelesen wird im
// Hook-Prozess; beide sehen VERSCHIEDENE CLAUDE_PLUGIN_DATA-Werte, der Stempel landete
// unsichtbar neben dem Gate. os.tmpdir() ist in beiden Prozessen derselbe
// Nutzer-Temp-Pfad, und der Stempel ist ephemer (30-Min-Verfall) — Persistenz braucht
// er nicht. NC_END_STATE_DIR bleibt als expliziter Override (Tests); wer ihn setzt,
// muss ihn beiden Prozessen geben.
function stateDir() {
  if (process.env.NC_END_STATE_DIR) return process.env.NC_END_STATE_DIR;
  return path.join(os.tmpdir(), 'nc-end-gate');
}

// Dateiname IMMER ueber sanitizeSessionKey — ein manipulierter --session-Wert ("../…")
// darf nie aus dem State-Verzeichnis herausfuehren.
function stateFileFor(sessionKey) {
  const safe = sanitizeSessionKey(sessionKey);
  return safe ? path.join(stateDir(), 'end-' + safe + '.json') : null;
}

// Mahn-Marker derselben Sitzung: getrennte Datei, damit "gestempelt" und "schon gemahnt"
// zwei unabhaengige Zustaende bleiben (der Loop-Schutz darf den Stempel nicht vortaeuschen).
function mahnMarkerFor(sessionKey) {
  const safe = sanitizeSessionKey(sessionKey);
  return safe ? path.join(stateDir(), 'mahnung-' + safe + '.json') : null;
}

// HEARTBEAT (Muster von nc-start-gate.js): Der 30-Min-Verfall der Marker misst
// INAKTIVITAET, nicht Sitzungsalter (Onsite-Lehre 0.18.1: der Verfall mass zunaechst
// Sitzungsalter und mahnte fleissige Sitzungen erneut). Ohne Auffrischung bestraft er
// genau den Fleissigen: Eine Sitzung, die um 10:00 /nc:end-session abschliesst und um
// 11:00 kompaktiert, saehe ihren Abschluss-Stempel verfallen und wuerde ERNEUT gemahnt,
// obwohl WP8 erledigt ist; derselbe Verfall traefe den Mahn-Marker und braeche den
// Loop-Schutz. Deshalb frischt jeder Hook-Durchlauf, der einen GUELTIGEN Marker
// vorfindet, dessen last_active auf — das Verfallsfenster beginnt neu, und nur echte
// Inaktivitaet laesst den Marker fallen.
// Grenze, bewusst so: aufgefrischt wird nur bei einem Hook-Lauf, und PreCompact laeuft
// selten. Eine Kompaktierungs-KETTE bleibt damit gestempelt; liegen zwischen zwei
// Kompaktierungen mehr als 30 Minuten ohne Lauf, verfaellt der Marker weiter (Preis:
// eine zusaetzliche Mahnung — die harmlose Fehlerrichtung, siehe loadMarker im
// Mahn-Hook).
const HEARTBEAT_MS = 60 * 1000; // last_active hoechstens einmal je Minute schreiben

// Frischt last_active eines bereits als gueltig erkannten Markers auf. Rueckgabe: wurde
// geschrieben? Fehler werden geschluckt — ein misslungener Heartbeat ist kein
// Gate-Fehler (die Mahnung mahnt dann hoechstens einmal zu viel, sie blockiert nie
// dauerhaft).
function refreshMarker(file, marker) {
  try {
    if (!file || !marker) return false;
    if (Date.now() - (Number(marker.last_active) || 0) <= HEARTBEAT_MS) return false;
    fs.mkdirSync(stateDir(), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(
      Object.assign({}, marker, { last_active: Date.now() }), null, 2), 'utf8');
    return true;
  } catch (_) { return false; }
}

function main() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const m = /^--([a-z]+)$/.exec(argv[i]);
    if (m && i + 1 < argv.length) { args[m[1]] = String(argv[++i]); }
  }

  const file = stateFileFor(args.session);
  if (!file) {
    process.stderr.write('[Sitzungsabschluss] Stempel verweigert: --session <key> fehlt. Den exakten '
      + 'Befehl (samt Schluessel) nennt die Mahn-Ausgabe des PreCompact-Hooks bzw. der letzte '
      + 'Ablaufschritt von /nc:end-session.\n');
    process.exitCode = 1;
    return;
  }

  const now = Date.now();
  fs.mkdirSync(stateDir(), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ stamped_at: now, last_active: now }, null, 2), 'utf8');
  process.stdout.write('[Sitzungsabschluss] Abschluss-Stempel gesetzt — die PreCompact-Mahnung '
    + 'dieser Sitzung entfaellt. Rote Linien gelten unveraendert; ein Commit bleibt Sache des '
    + 'Freigabeprozesses.\n');
}

module.exports = { stateDir, stateFileFor, mahnMarkerFor, refreshMarker, HEARTBEAT_MS };

if (require.main === module) {
  try {
    main();
  } catch (e) {
    try { process.stderr.write('[Sitzungsabschluss] Stempel-Fehler: ' + (e && e.message) + '\n'); } catch (_) { /* egal */ }
    process.exitCode = 1;
  }
}
