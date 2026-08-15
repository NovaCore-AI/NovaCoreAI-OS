#!/usr/bin/env node
// nc-end-mahnung.js — PreCompact-Mahnung des Sitzungsabschlusses (Bauplan 2026-08-15
// „Onsite-Endstand-Nachbau", AP-B1; Vorbild: oai-end-mahnung.js aus Onsite 0.18.0–0.18.2,
// gelesen aus origin/feat/queue-flow, 1:1 auf NovaCore gemappt — einzige inhaltliche
// Abweichung: der Mahntext nennt keine Kandidaten-Queue, weil der Queue-Flow erst in
// Phase 3 des Bauplans gebaut wird).
// Blockt die ERSTE Kontext-Kompaktierung einer Sitzung, die /nc:end-session noch nicht
// abgeschlossen hat, und verlangt vorher die Wissenssicherung: Sitzungswissen darf nicht
// am Vergessen des Nutzers haengen — die Kompaktierung ist genau der Moment, in dem
// ungesicherter Kontext still verloren geht.
//
// ABGRENZUNG ZU GATE 4 (wichtig, nicht verwechseln): Das ist NICHT das Sitzungsabschluss-
// Gate der Kontroll-Schicht. Gate 4 (PostToolUse-Akkumulator + Stop-Hook + SessionEnd-
// Protokoll) bleibt AUF EIS (grundwissen/NovaCore-OS-Gates-Definition.md);
// end-session loest allein dieser PreCompact-Hook aus. Wer Gate 4 wieder aufnimmt, baut
// daneben — dieser Hook mahnt ausschliesslich vor der Kompaktierung, nie am Sitzungsende.
//
// VERIFIZIERTE MECHANIK (code.claude.com/docs/en/hooks, abgerufen 2026-08-11 vom Vorbild,
// unveraendert uebernommen):
//   - Event `PreCompact` feuert vor jeder Kompaktierung; Matcher-Werte sind `manual`
//     (Nutzer ruft /compact) und `auto` (automatische Kompaktierung). Ein Eintrag OHNE
//     matcher ("*", "" oder weggelassen) gilt fuer jede Auftretensform des Events —
//     genau so ist dieser Hook registriert, damit kein Regex-Missverstaendnis den
//     auto-Fall still auslaesst. Der Ausloeser steht im Eingabefeld `trigger`; dieser
//     Hook liest ihn NICHT, weil er in beiden Faellen identisch mahnt.
//   - PreCompact KANN blocken, laut Doku-Tabelle auf zwei Wegen: Exit-Code 2 ("Blocks
//     compaction", stderr geht an den Nutzer) ODER top-level JSON
//     {"decision":"block","reason":"…"}. Dieser Hook nutzt AUSSCHLIESSLICH das JSON:
//     der Grund erreicht damit sicher das Modell (nicht nur den Nutzer), und der
//     Exit-Code bleibt 0 — kein Risiko, dass ein interner Fehler versehentlich als
//     Blockade gelesen wird.
//   - `additionalContext` gibt es bei PreCompact NICHT (nur bei SessionStart,
//     UserPromptSubmit, PreToolUse, Stop, …) — der Mahntext reist deshalb im `reason`.
//   - Dateischreiben aus einem PreCompact-Hook ist nicht dokumentiert und damit kein
//     verlaesslicher Weg: Dieser Hook PRUEFT und MAHNT nur; geschrieben wird vom Skill
//     /nc:end-session. Die einzige Ausnahme ist der eigene Mahn-Marker (Loop-Schutz).
//
// LOOP-SCHUTZ (Design-Kern): Gemahnt wird genau EINMAL je Sitzung. Bei `auto`-Compact
// laeuft der Nutzer sonst in eine Sackgasse — das Kontextfenster ist voll, die
// Kompaktierung ist die Rettung, und ein Gate, das sie dauerhaft verweigert, macht die
// Sitzung unbrauchbar. Der Marker steht in einer eigenen State-Datei; die zweite
// Kompaktierung derselben Sitzung laeuft durch, ob gestempelt oder nicht.
//
// Subagenten sind ausgenommen (der Parent fuehrt die Sitzung).
// Opt-out AUSSCHLIESSLICH per Env: NC_PRECOMPACT=off (bzw. 0/false/disabled).
// Fail-open bei internen Fehlern: eine kaputte Mahnung darf keine Kompaktierung
// verhindern — sonst blockiert sie die Sitzung an ihrer engsten Stelle.
'use strict';
const fs = require('fs');
const path = require('path');
const { resolveSessionKey, isSubagentInvocation } = require('./lib/session-key');
const { stateDir, stateFileFor, mahnMarkerFor, refreshMarker } = require('./nc-end-stempel');

const OFF_VALUES = new Set(['0', 'false', 'off', 'disabled', 'disable']);
// Wie Start-Gate: Marker verfallen nach 30 Min INAKTIVITAET — nicht nach 30 Min Sitzung.
// Den Unterschied macht der Heartbeat (refreshMarker aus nc-end-stempel.js): jeder Lauf mit
// gueltigem Marker setzt das Fenster neu. Ohne ihn wuerde eine lange, aktive Sitzung ihren
// erledigten Abschluss verlieren und der Loop-Schutz nach 30 Minuten aufhoeren zu greifen.
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const STEMPEL_SKRIPT = path.join(__dirname, 'nc-end-stempel.js');

function isDisabled() {
  return OFF_VALUES.has(String(process.env.NC_PRECOMPACT || '').trim().toLowerCase());
}

// Marker laden; abgelaufene verfallen (eine lange Pause bedeutet neue Arbeit, die wieder
// gesichert werden muss und wieder gemahnt werden darf).
//
// `defektIstGesetzt` dreht die Fehlerrichtung — die beiden Marker haben BEWUSST
// unterschiedliche Fail-Semantik, weil ihr Fehlerpreis unterschiedlich ist:
//   - Abschluss-Stempel (false): defekt ⇒ "nicht gestempelt". Kostet genau eine
//     zusaetzliche Mahnung, die der Nutzer mit /compact quittiert. Harmlos.
//   - Mahn-Marker (true): defekt ⇒ "schon gemahnt". Andernfalls schlaegt der Loop-Schutz
//     fehl und JEDE Kompaktierung wird erneut geblockt — bei auto-Compact eine
//     Dauer-Sackgasse mit vollem Kontextfenster. Ein Gate, das nur mahnen soll, darf
//     niemals durch einen kaputten State zur Blockade werden (belegt: eigener Test
//     "defekter Stempel-State blockt die Kompaktierung nicht dauerhaft").
function loadMarker(file, defektIstGesetzt) {
  if (!file) return null;
  try {
    if (!fs.existsSync(file)) return null;
  } catch (_) { return defektIstGesetzt ? { unlesbar: true } : null; }
  try {
    const marker = JSON.parse(fs.readFileSync(file, 'utf8'));
    const lastActive = Number(marker && marker.last_active) || 0;
    if (Date.now() - lastActive > SESSION_TIMEOUT_MS) {
      try { fs.unlinkSync(file); } catch (_) { /* egal */ }
      return null;
    }
    return marker;
  } catch (_) {
    // Datei ist da, Inhalt unbrauchbar: Richtung entscheidet der Aufrufer (siehe oben).
    return defektIstGesetzt ? { unlesbar: true } : null;
  }
}

// Mahn-Marker setzen. Schlaegt das Schreiben fehl, wird NICHT geblockt: sonst mahnt der
// Hook bei jeder Kompaktierung erneut, ohne den Loop-Schutz je zu erreichen.
function markiereGemahnt(file) {
  try {
    fs.mkdirSync(stateDir(), { recursive: true });
    const now = Date.now();
    fs.writeFileSync(file, JSON.stringify({ mahnung_at: now, last_active: now }, null, 2), 'utf8');
    return true;
  } catch (_) { return false; }
}

function block(reason) {
  // PreCompact blockt ueber das TOP-LEVEL Feld `decision` (nicht hookSpecificOutput).
  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
}

// Mahntext: nennt die WP8-Bestandteile und den EXAKTEN Stempel-Befehl samt Session-
// Schluessel — der Agent soll ihn nicht raten muessen. Bewusst OHNE Abschalt-Hinweis.
function mahnMsg(sessionKey) {
  return '[Sitzungsabschluss] Vor der Kompaktierung /nc:end-session ausführen (WP8: Journal, '
    + 'Stand, Roll-up, Offene-Stränge-Register) — sonst geht ungesichertes '
    + 'Sitzungswissen mit dem Kontext verloren. Als letzten Schritt den Abschluss-Stempel '
    + 'setzen: node "' + STEMPEL_SKRIPT + '" --session ' + sessionKey
    + ' — danach /compact erneut. Diese Mahnung kommt einmal je Sitzung; die nächste '
    + 'Kompaktierung läuft in jedem Fall durch.';
}

function main() {
  if (isDisabled()) return;

  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  if (isSubagentInvocation(input)) return;

  const sessionKey = resolveSessionKey(input);

  // 1) Abschluss-Stempel gesetzt → nichts zu mahnen. Defekt zaehlt als nicht gestempelt.
  //    Heartbeat: der gueltige Stempel wird aufgefrischt, damit eine LANGE, aktive Sitzung
  //    ihren erledigten Abschluss nicht durch Zeitablauf verliert und erneut gemahnt wird.
  const stempelDatei = stateFileFor(sessionKey);
  const stempel = loadMarker(stempelDatei, false);
  if (stempel) { refreshMarker(stempelDatei, stempel); return; }

  // 2) Schon gemahnt → durchlassen (Loop-Schutz, insbesondere bei auto-Compact).
  //    Defekt zaehlt hier als GEMAHNT — siehe Fehlerrichtung in loadMarker; ein defekter
  //    Marker wird NICHT aufgefrischt (nichts ueberschreiben, was man nicht gelesen hat —
  //    seine Fehlerrichtung traegt schon, und der Defekt bleibt sichtbar).
  const marker = mahnMarkerFor(sessionKey);
  const gemahnt = loadMarker(marker, true);
  if (gemahnt) { if (!gemahnt.unlesbar) refreshMarker(marker, gemahnt); return; }

  // 3) Erste Kompaktierung ohne Abschluss: markieren und einmal blocken.
  if (!markiereGemahnt(marker)) return; // Marker nicht schreibbar → lieber gar nicht mahnen
  return block(mahnMsg(sessionKey));
}

try {
  main();
} catch (e) {
  try { process.stderr.write('nc-end-mahnung fail-open: ' + (e && e.message)); } catch (_) { /* egal */ }
}
// Kein process.exit(): abgeschnittene Block-JSON hiesse, die Mahnung greift still nicht
// (POSIX-Pipe-Falle). exitCode 0 ist hier zusaetzlich Teil der Semantik — Exit 2 wuerde
// die Kompaktierung ebenfalls blocken, aber ohne den Grund ans Modell zu geben; geblockt
// wird ausschliesslich ueber das JSON.
process.exitCode = 0;
