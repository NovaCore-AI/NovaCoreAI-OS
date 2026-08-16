#!/usr/bin/env node
// nc-queue-faelligkeit.js — Faelligkeits-Erinnerung des Queue-Flows (Standardprozess
// queue-flow.md des OS-Repos; Bauplan 2026-08-15, AP-E3). Port von Onsite.ai-OS
// origin/main@5c2c210 `oai-queue-faelligkeit.js`, gemappt auf NovaCore.
// EIN SessionStart-Hook, ZWEI Faelligkeiten:
//   /nc:queue-abteilung — nicht eingereichte Wissensbasis-Arbeit im Abteilungs-Klon
//                         UND letzter Lauf laenger als VIERZEHN Tage her.
//   /nc:queue-kern      — offene Zeilen in der GEMERGTEN Abteilungs-Queue, letzter Lauf
//                         laenger als vierzehn Tage her, PLUS ein Tag Versatz zu Skill 1
//                         (queue-kern liest ausdruecklich den gemergten Stand).
//
// BEWUSSTE ABWEICHUNGEN VOM VORBILD (Portkopf, Bauplan N6/E1):
//   - Takt 14 Tage statt 7 (Firmenspezifikation N6: 14-taegiger Rhythmus, +1 Tag Versatz).
//   - Registry-Schema: NovaCore fuehrt `abteilungen` als LISTE plus die optionale Map
//     `abteilungsRepoPfade` (Abteilungsname -> absoluter Klon-Pfad bzw. "ausstehend") —
//     Onsite fuehrt die Einzelfelder `abteilung`/`abteilungsRepoPfad`. Referenz:
//     skills/setup/infra-registry.md dieses Kern-Plugins. Verarbeitet wird der ERSTE
//     Eintrag mit realem Klon (Verteilannahme: genau ein Abteilungsplugin je Maschine).
//   - Heutiger Uebergangszustand (E1): nc-development ist repo-intern, es existiert kein
//     Abteilungs-Satellit und damit kein Klon-Pfad — der Hook SCHWEIGT dann by design.
//     Die Uebergangs-Queue liegt im OS-Repo vor aller Augen; die Erinnerung wird mit dem
//     ersten Abteilungs-Satelliten wirksam (queue-flow.md des OS-Repos, Abschnitt Takt).
//
// KEIN GATE — das ist die wichtigste Abgrenzung dieser Datei. Der Hook ERINNERT und
// blockiert nichts: keine Blockade, keine Bestaetigungspflicht, kein Abbruch. Er ist
// weder Gate 3 (Safety-Gate, nicht gebaut) noch Gate 4 (Sitzungsabschluss, auf Eis —
// die PreCompact-Mahnung ist ausdruecklich nicht Gate 4). Wer ihn zu einem Gate ausbaut,
// baut daneben. Ebenso KEIN Cron und KEIN Scheduler: Instruktionen wirken nur in
// Sessions; ein Scheduler je Maschine waere eine Setup-Abhaengigkeit gegen die
// Verteilannahme (queue-flow.md des OS-Repos, Abschnitt Takt).
//
// VERIFIZIERTE MECHANIK (code.claude.com/docs/en/hooks + /hooks-guide, vom Vorbild
// abgerufen 2026-08-14; Mechanik unveraendert uebernommen):
//   - "Some events can't be blocked: for `SessionStart`, `Setup`, and others, exit 2 shows
//     stderr to the user and execution continues." — SessionStart KANN also nicht blocken.
//     Genau das passt: Erinnern ist hier das Ziel, nicht Erzwingen.
//   - "For `UserPromptSubmit`, `UserPromptExpansion`, and `SessionStart` hooks, anything
//     you write to stdout is added to Claude's context." Der strukturierte Weg dafuer ist
//     hookSpecificOutput.additionalContext — derselbe Weg, den nc-session-start.js nutzt.
//   - SessionStart feuert bei source startup/resume/clear/compact/fork und laeuft damit
//     mehrfach je Sitzung; deshalb der Sitzungsmarker unten (hoechstens EINE Erinnerung
//     je Faelligkeit und Sitzung).
//   - Subagenten-Laeufe tragen agent_id/agent_type — sie sind ausgenommen, der Parent
//     fuehrt die Sitzung.
//   - Die Doku mahnt fuer SessionStart ausdruecklich Schnelligkeit an: dieser Hook macht
//     hoechstens FUENF lokale Git-Aufrufe mit 2-Sekunden-Timeout und KEINEN Netzzugriff
//     (kein fetch — ein haengender Netzaufruf im Sitzungsstart waere der teuerste
//     Fehlerfall). Der "gemergte" Stand ist folglich der Stand des letzten Fetches; das
//     ist bewusst so und steht auch im Erinnerungstext.
//     Die Fuenf im Ungluecksfall: status(1) · symbolic-ref(2) · for-each-ref(3) ·
//     rev-list(4) · show(5). Der Ref wird je Klon EINMAL ermittelt und gemerkt, und die
//     beiden Kandidatennamen origin/main|origin/master kosten zusammen einen Aufruf
//     (for-each-ref mit zwei Mustern) statt zweier rev-parse-Laeufe — sonst waeren es
//     sechs und die Zusage in hooks.json/README waere falsch (Onsite-Review-Befund H4).
//     Deterministisch geprueft: der GIT_TRACE-Zaehltest der Testsuite.
//
// STATE — zwei Sorten, bewusst an zwei Orten:
//   (1) LAUF-MARKER `<stateDir>/queue-lauf.json` — wann lief welcher Skill zuletzt.
//       Er muss Sitzungen, Neustarts und Reboots ueberleben, sonst waere der
//       14-Tage-Takt sinnlos. Er liegt deshalb NICHT in os.tmpdir() (dort raeumt Linux
//       nach Reboot bzw. nach Tagen auf — der Hook haette dann dauerhaft "nie gelaufen"
//       gelesen und in jeder Sitzung erinnert, bis der Nutzer ihn abschaltet), sondern
//       neben der Infra-Registry in `~/.claude/nc/` (infra-registry.md). Das ist derselbe
//       env-unabhaengige Ort, den setup und die Registry schon nutzen — insbesondere
//       OHNE CLAUDE_PLUGIN_DATA (Onsite-Lesson Kern 0.11.1: zwischen Prozessen
//       inkonsistent, hat schon einmal einen Deadlock erzeugt).
//   (2) SITZUNGSMARKER `<os.tmpdir()>/nc-queue-check/queue-<session>.json` — was in
//       DIESER Sitzung schon erinnert wurde. Ephemer wie der Mahn-Marker der
//       PreCompact-Mahnung, deshalb os.tmpdir() (Muster nc-end-stempel.js).
//   Geschrieben wird der Lauf-Marker vom Skill selbst, als letzter Ablaufschritt:
//       node nc-queue-faelligkeit.js --lauf <queue-abteilung|queue-kern>
//   (Muster: Abschluss-Stempel nc-end-stempel.js. Solange die Skills den Aufruf noch
//   nicht gefuehrt haben, gilt "nie gelaufen" — die Erinnerung kommt dann zu Recht.)
//   BEIDE Marker werden atomar ersetzt (Temp-Datei daneben + rename) und ihr
//   Read-modify-write laeuft unter einer kurzen Verzeichnis-Sperre — ohne das koennen
//   zwei parallele Laeufe einander Zeitstempel ueberschreiben und ein abgebrochener
//   Schreibvorgang eine halbe JSON-Datei hinterlassen (Onsite-Review-Befund M1).
//
// FAIL-OPEN UEBERALL, und bei defektem State ausdruecklich SCHWEIGEND: fehlende oder
// unlesbare Registry, toter Klon-Pfad, kaputte JSON-Marker, fehlendes Git — nichts davon
// darf eine Sitzung stoeren oder Rauschen erzeugen. Ein defekter State darf nie zu einer
// Dauer-Erinnerung werden (dieselbe Lehre wie beim Mahn-Marker der PreCompact-Mahnung).
// EINE Ausnahme, und zwar bewusst (Onsite-Review-Befund M3): Ist der LAUF-Marker
// unlesbar, ruht die Takt-Erinnerung dauerhaft — das ist zwar sitzungs-fail-open, aber
// nicht lebendigkeits-fail-open, denn niemand wuerde es je bemerken. Der Hook behauptet
// deshalb weiterhin keine Faelligkeit, meldet den Defekt aber EINMAL JE SITZUNG auf
// stderr und nennt den Reparaturweg. Sichtbar wird das ueber Exit-Code 2, den die Doku
// fuer SessionStart ausdruecklich als "zeigt stderr, Ausfuehrung laeuft weiter"
// beschreibt — eine Blockade ist das nicht und kann es fuer SessionStart auch nicht sein.
//
// Opt-out AUSSCHLIESSLICH per Env: NC_QUEUE_CHECK=off (bzw. 0/false/disabled).
// Test-Umleitungen: NC_QUEUE_STATE_DIR (Ersatz fuer ~/.claude/nc — Registry UND
// Lauf-Marker), NC_QUEUE_SESSION_DIR (Sitzungsmarker), NC_QUEUE_PFAD (Queue-Pfad
// relativ zur Klon-Wurzel).
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { resolveSessionKey, sanitizeSessionKey, isSubagentInvocation } = require('./lib/session-key');

const OFF_VALUES = new Set(['0', 'false', 'off', 'disabled', 'disable']);
const TAG_MS = 24 * 60 * 60 * 1000;
const FAELLIG_NACH_MS = 14 * TAG_MS;       // 14-Tage-Takt (Firmenspezifikation N6)
const VERSATZ_MS = 1 * TAG_MS;             // ein Tag Versatz queue-kern nach queue-abteilung
const SITZUNGS_TTL_MS = 24 * 60 * 60 * 1000; // danach gilt eine Sitzung als neuer Arbeitstag
const GIT_TIMEOUT_MS = 2000;
const REGISTRY_SCHEMA = 1;                 // hoehere Version → nicht raten (SessionStart-Hook schweigt bewusst; Skill-Meldepflicht: infra-registry.md)
const WISSENSBASIS = 'knowledge-base';
const QUEUE_PFAD_STANDARD = 'knowledge-base/kandidaten-queue/queue.md'; // Norm-Kategorie (pflege-auspraegung.md)
const SKILLS = ['queue-abteilung', 'queue-kern'];
const AUSPRAEGUNG = 'pflege-auspraegung.json';
const MELDEFELD_LAUF_DEFEKT = 'lauf_marker_defekt_gemeldet'; // Feld im Sitzungsmarker (M3)
// Sperre um Read-modify-write der Marker: kurz genug, um nie fuehlbar zu sein.
const SPERRE_VERSUCHE = 40;
const SPERRE_WARTE_MS = 25;
const SPERRE_ALT_MS = 10000;                // verwaiste Sperre eines abgestuerzten Laufs
// Deckel der Auspraegungs-Suche im Plugin-Cache — der Hook laeuft in jeder Sitzung.
const MAX_ORDNER = 40;
const MAX_PROBEN = 150;
// Deckel der Abteilungs-Auswahl aus der Registry-Liste (Verteilannahme: genau eine).
const MAX_ABTEILUNGEN = 8;

function isDisabled() {
  return OFF_VALUES.has(String(process.env.NC_QUEUE_CHECK || '').trim().toLowerCase());
}

function warn(text) {
  try { process.stderr.write('nc-queue-faelligkeit: ' + text + '\n'); } catch (_) { /* egal */ }
}

// --- Ablageorte -----------------------------------------------------------------------

/** Maschinenlokaler OS-Ordner `~/.claude/nc` — Heimat von Infra-Registry und Lauf-Marker. */
function stateDir() {
  const override = String(process.env.NC_QUEUE_STATE_DIR || '').trim();
  if (override) return path.resolve(override);
  return path.join(os.homedir(), '.claude', 'nc');
}

function registryDatei() { return path.join(stateDir(), 'infra.json'); }
function laufDatei() { return path.join(stateDir(), 'queue-lauf.json'); }

function sitzungsDir() {
  const override = String(process.env.NC_QUEUE_SESSION_DIR || '').trim();
  if (override) return path.resolve(override);
  return path.join(os.tmpdir(), 'nc-queue-check');
}

/** Dateiname IMMER ueber sanitizeSessionKey — kein Ausbruch aus dem State-Verzeichnis. */
function sitzungsDatei(sessionKey) {
  const safe = sanitizeSessionKey(sessionKey);
  return safe ? path.join(sitzungsDir(), 'queue-' + safe + '.json') : null;
}

// --- Schreiben: atomar und gegen Lost Updates gesperrt ---------------------------------

/** Synchron warten, ohne einen Prozess zu beschaeftigen (nur im Sperr-Wartelauf). */
function schlafe(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (_) { /* egal */ }
}

/**
 * Datei atomar ersetzen: erst als Temp-Datei in DIESELBE Verzeichnisebene schreiben (nur
 * dort ist rename ein reiner Verzeichniseintrag-Tausch und kein Kopieren ueber
 * Dateisystemgrenzen), dann umbenennen. Ein abgebrochener Lauf hinterlaesst damit
 * entweder den alten oder den neuen VOLLSTAENDIGEN Inhalt — nie ein halbes JSON.
 * Genau das ist hier teuer: eine halbe `queue-lauf.json` legt die Takt-Erinnerung
 * still lahm (Onsite-Review-Befund M1, zusammen mit M3).
 * Auf Windows ersetzt rename eine vorhandene Datei; scheitert es (Virenscanner haelt die
 * Datei kurz offen), wird genau einmal nachgefasst, danach faellt der Aufrufer offen.
 */
function schreibeAtomar(datei, text) {
  const dir = path.dirname(datei);
  fs.mkdirSync(dir, { recursive: true });
  const temp = path.join(dir, '.' + path.basename(datei) + '.' + process.pid + '.tmp');
  try {
    fs.writeFileSync(temp, text, 'utf8');
    try {
      fs.renameSync(temp, datei);
    } catch (_) {
      schlafe(SPERRE_WARTE_MS);
      fs.renameSync(temp, datei);
    }
  } finally {
    try { if (fs.existsSync(temp)) fs.unlinkSync(temp); } catch (_) { /* egal */ }
  }
}

/**
 * Read-modify-write eines Markers unter kurzer Sperre ausfuehren.
 *
 * Warum ueberhaupt eine Sperre — reicht der atomare Tausch nicht? Nein: Er verhindert
 * KAPUTTE Dateien, nicht VERLORENE Felder. Zwei parallele `--lauf`-Laeufe lesen sonst
 * beide denselben Ausgangsstand, und der zweite rename schreibt den ersten Zeitstempel
 * weg — die Erinnerung des ueberschriebenen Skills kaeme naechste Sitzung erneut.
 *
 * Warum ein VERZEICHNIS als Sperre? `mkdir` ist auf allen Zielplattformen (Windows, Linux,
 * macOS) und auch auf Netzlaufwerken atomar und scheitert vorhandenenfalls mit EEXIST —
 * ohne Sonderfall-Code und ohne Abhaengigkeit von O_EXCL-Feinheiten.
 *
 * Was, wenn die Sperre nicht zu bekommen ist? Der Read-modify-write-Abschnitt laeuft dann
 * NICHT ungeschuetzt — genau die Lost Updates, die die Sperre verhindern soll, wären die
 * Folge. Stattdessen wird nichts geschrieben: Der SessionStart-Marker schweigt still (die
 * Sitzung wird nie gestoert — im schlimmsten Fall kommt eine Erinnerung zu viel), der
 * Lauf-Marker-Schreiber (`--lauf`) meldet den Verweigerungsgrund per stderr und Exit 1.
 */
function mitSperre(datei, arbeit, schreibmodus) {
  const sperre = datei + '.lock';
  let gehalten = false;
  for (let i = 0; i < SPERRE_VERSUCHE && !gehalten; i++) {
    try {
      fs.mkdirSync(path.dirname(datei), { recursive: true });
      fs.mkdirSync(sperre);
      gehalten = true;
    } catch (e) {
      if (!e || e.code !== 'EEXIST') break;   // nicht sperrbar → ohne Sperre weiterarbeiten
      try {
        if (Date.now() - fs.statSync(sperre).mtimeMs > SPERRE_ALT_MS) {
          fs.rmdirSync(sperre);               // verwaiste Sperre brechen, dann neu versuchen
          continue;
        }
      } catch (_) { /* egal */ }
      schlafe(SPERRE_WARTE_MS);
    }
  }
  if (!gehalten) {
    // Ohne Sperre in den Read-modify-write-Abschnitt zu gehen, erzeugt genau die Lost
    // Updates, die die Sperre verhindern soll. Fail-open heisst hier: die Sitzung nicht
    // stoeren — also still nichts tun (SessionStart). Nur der explizite Schreibmodus
    // (--lauf) meldet den Verweigerungsgrund, denn dort ist "nichts geschrieben" ein
    // Fehler, kein Glücksfall.
    if (schreibmodus) {
      process.stderr.write('[Queue-Flow] Sperre fuer den Lauf-Marker nicht zu bekommen — nichts geschrieben.\n');
      process.exitCode = 1;
    }
    return false;
  }
  try {
    return arbeit();
  } finally {
    if (gehalten) { try { fs.rmdirSync(sperre); } catch (_) { /* egal */ } }
  }
}

// --- Lesen ----------------------------------------------------------------------------

// Dreiwertiges Lesen: fehlt (harmlos, Standardwerte) · defekt (SCHWEIGEN, nichts raten) ·
// daten. Die Unterscheidung ist der Kern der Fehlerrichtung: Eine fehlende Registry heisst
// "Setup lief hier nie" — kein Befund. Eine kaputte Registry heisst "unbekannte Lage" —
// und Erinnerungen aus unbekannter Lage waeren Rauschen.
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

// Zwei Fehlerklassen, die NICHT dasselbe bedeuten (Onsite-Review-Befund H5):
//   (a) Git fehlt / Timeout / abgebrochen → wir wissen NICHTS und muessen schweigen;
//   (b) Git laeuft, das Kommando liefert nur kein Ergebnis (Ref existiert nicht, Datei
//       nicht im Baum) → belegte Aussage, mit der weitergearbeitet werden darf.
// Frueher gaben beide `null` zurueck. Folge: Bei fehlendem Git fiel queueText() auf die
// LOKALE Arbeitskopie zurueck und konnte eine noch ungemergte `offen`-Zeile als gemergten
// Stand lesen — also genau die Falschmeldung, die der Versatz verhindern soll.
// Dazu eine dritte, POSITIVE Groesse: Ist ueberhaupt schon ein Git-Aufruf sauber
// zurueckgekommen? Erst das belegt, dass hier ein benutzbares Git auf ein lesbares
// Repository trifft. Ohne diesen Beleg greift die Ausnahme "kein Remote-Bezug → lies die
// Arbeitskopie" zu weit: Ein Git, das JEDEN Aufruf mit Exit 128 quittiert (kein
// Repository, `detected dubious ownership`, kaputte Installation), liefert lauter
// "belegte Aussagen" nach Klasse (b) und sieht damit aus wie ein frischer Klon ohne
// Remote — die Arbeitskopie wuerde erneut als gemergter Stand gelesen (Onsite-Befund
// vom POSIX-Lauf der Timeout-Probe: der Ersatz-`git` gab 127 zurueck statt zu haengen,
// und der Hook erinnerte prompt an eine Zeile, die nie gemergt war).
let gitUnbrauchbar = false;
let gitBelegt = false;

function git(root, args) {
  // Ist Git einmal als unbrauchbar erkannt, wird nicht erneut gestartet: Sonst summieren
  // sich die 2-Sekunden-Timeouts ueber das 10-Sekunden-Budget des Hooks, und die fertige
  // Erinnerung geht mit dem abgeschnittenen Prozess verloren (Onsite-Review-Befund H4).
  if (gitUnbrauchbar) return null;
  try {
    // core.quotepath=false: sonst kommen Nicht-ASCII-Pfade oktal-escaped zurueck.
    const out = execFileSync('git', ['-c', 'core.quotepath=false', '-C', root, ...args], {
      encoding: 'utf8',
      timeout: GIT_TIMEOUT_MS,
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true
    });
    gitBelegt = true;
    return String(out == null ? '' : out);
  } catch (e) {
    // ENOENT = keine Git-Binary · ETIMEDOUT = Timeout · status == null = per Signal beendet.
    // Ein normaler Exit-Code != 0 (status ist dann eine Zahl) ist dagegen eine Aussage.
    const code = e && e.code;
    if (code === 'ENOENT' || code === 'ETIMEDOUT' || (e && e.status == null)) gitUnbrauchbar = true;
    return null;
  }
}

// Remote-Standardbranch OHNE Netzzugriff: erst origin/HEAD (setzt `git clone` bzw.
// `git remote set-head`), sonst die beiden ueblichen Namen. Null heisst: kein
// Remote-Bezug ermittelbar — dann wird ueber Commits nicht geurteilt.
// Ergebnis wird je Klon gemerkt: Beide Faelligkeiten brauchen den Ref, und ohne Cache
// liefe die Suche zweimal (Onsite-Review-Befund H4).
// Die beiden Kandidatennamen kosten zusammen EINEN Aufruf: `for-each-ref` nimmt mehrere
// Muster und liefert nur die existierenden Refs zurueck — zwei `rev-parse --verify`-Laeufe
// waeren ein Prozess mehr und wuerden die Zusage "hoechstens fuenf Git-Aufrufe" brechen.
const refCache = new Map();

function standardRef(klon) {
  if (refCache.has(klon)) return refCache.get(klon);
  let ref = null;
  const sym = git(klon, ['symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD']);
  if (sym && sym.trim()) {
    ref = sym.trim();
  } else {
    const roh = git(klon, ['for-each-ref', '--format=%(refname:short)',
      'refs/remotes/origin/main', 'refs/remotes/origin/master']);
    const vorhanden = new Set(String(roh || '').split(/\r?\n/).map(z => z.trim()).filter(Boolean));
    // Reihenfolge explizit statt aus der Ausgabe: main schlaegt master, auch wenn eine
    // kuenftige Git-Version anders sortiert.
    for (const kandidat of ['origin/main', 'origin/master']) {
      if (vorhanden.has(kandidat)) { ref = kandidat; break; }
    }
  }
  refCache.set(klon, ref);
  return ref;
}

// --- Faelligkeit 1: nicht eingereichte Wissensbasis-Arbeit ----------------------------

// Zwei Belege, beide nur lesend und beide auf `knowledge-base/` begrenzt (der
// Abteilungs-Klon fuehrt seine SSOT dort — ssot-grundgeruest.md.vorlage): ungesicherte
// Dateien im Working Tree UND Commits, die noch nicht auf dem Remote-Standardbranch
// stehen. Fehlt der Remote-Bezug, zaehlen nur die Dateien — lieber ein unvollstaendiger
// Befund als ein erfundener.
function nichtEingereichteArbeit(klon) {
  const status = git(klon, ['status', '--porcelain', '--', WISSENSBASIS]);
  if (status === null) return null; // kein Git → kein Urteil
  const dateien = status.split(/\r?\n/).filter(z => z.trim()).length;

  let commits = 0;
  const ref = standardRef(klon);
  if (ref) {
    const zahl = git(klon, ['rev-list', '--count', ref + '..HEAD', '--', WISSENSBASIS]);
    const n = Number(String(zahl || '').trim());
    if (Number.isFinite(n) && n > 0) commits = n;
  }

  if (!dateien && !commits) return null;
  const teile = [];
  if (commits) teile.push(commits + ' nicht eingereichte(r) Commit(s)');
  if (dateien) teile.push(dateien + ' ungesicherte Datei(en) im Working Tree');
  return teile.join(' und ') + ' unterhalb `' + WISSENSBASIS + '/` des Abteilungs-Klons';
}

// --- Faelligkeit 2: offene Zeilen der gemergten Queue ---------------------------------

/** Unterordner eines Verzeichnisses, ohne Punkt-Eintraege, gedeckelt. Nie werfend. */
function unterordner(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .map(e => e.name)
      .slice(0, MAX_ORDNER);
  } catch (_) { return []; }
}

/**
 * Versionsordner eines Plugins im Cache, in Suchreihenfolge: erst die nicht abgeloesten,
 * dann absteigend nach Name. `.orphaned_at` markiert im realen Cache die abgeloesten
 * Staende (vom Vorbild verifiziert 2026-08-14 an ~/.claude/plugins/cache). Sie ist nur
 * REIHENFOLGE, kein Filter — sonst wuerde eine Cache-Eigenheit Daten unsichtbar machen,
 * und die Marke ist nicht dokumentiert.
 */
function versionsOrdner(pluginDir) {
  const frisch = [];
  const verwaist = [];
  for (const name of unterordner(pluginDir)) {
    const voll = path.join(pluginDir, name);
    let abgeloest = false;
    try { abgeloest = fs.existsSync(path.join(voll, '.orphaned_at')); } catch (_) { /* egal */ }
    (abgeloest ? verwaist : frisch).push(voll);
  }
  const abwaerts = (a, b) => (a < b ? 1 : (a > b ? -1 : 0));
  return frisch.sort(abwaerts).concat(verwaist.sort(abwaerts));
}

/**
 * Eine Auspraegung pruefen. Treffer der gesuchten Abteilung → sofortiger Fund; jede andere
 * gueltige Auspraegung wird als Rueckfallwert gemerkt (mehrere Abteilungsplugins sind
 * nicht die Verteilannahme).
 */
function pruefeAuspraegung(dir, abteilung, fund) {
  if (fund.proben >= MAX_PROBEN) return false;
  fund.proben++;
  const gelesen = ladeJson(path.join(dir, AUSPRAEGUNG));
  if (!gelesen.daten) return false;
  const pfad = String(gelesen.daten.queuePfad || '').trim();
  if (!pfad) return false;
  if (String(gelesen.daten.abteilung || '').trim() === abteilung) { fund.exakt = pfad; return true; }
  if (!fund.erster) fund.erster = pfad;
  return false;
}

/**
 * Queue-Pfad relativ zur Klon-Wurzel. Quelle ist `queuePfad` der Pflege-Auspraegung des
 * installierten Abteilungsplugins (referenz/pflege-auspraegung.md dieses Kern-Plugins),
 * die an dessen Plugin-Wurzel liegt. Gesucht wird in ZWEI Layouts, weil der Kern in
 * beiden laeuft (Onsite-Review-Befund M4):
 *
 *   Ebene 1 — flach: `<eltern>/<plugin>/pflege-auspraegung.json`. So sieht es im
 *     Repo-Checkout und bei einer lokalen Marketplace-Quelle (`./plugins/<name>`) aus.
 *   Ebene 2 — versioniert: `<marktplatz>/<plugin>/<version>/pflege-auspraegung.json`.
 *     DAS ist der reale Auslieferungsfall (vom Vorbild verifiziert am realen Cache).
 *     Nur Ebene 1 zu pruefen hiesse: der Elternordner des Kerns enthaelt lauter
 *     VERSIONSordner des Kerns selbst, die Suche geht immer leer aus, und ein
 *     abweichender `queuePfad` faellt still auf den Standard zurueck.
 *
 * Findet sich nichts, gilt die Norm-Kategorie — der Standardwert der Auspraegung selbst.
 * Bewusst KEINE Tiefensuche und keine Suche ueber den eigenen Marktplatz-Ordner hinaus:
 * Der Hook laeuft in jeder Sitzung, die Verteilannahme ist EIN Marktplatz mit Kern plus
 * genau einem Abteilungsplugin. Alles ist zusaetzlich gedeckelt (MAX_ORDNER,
 * MAX_PROBEN), damit ein ungewoehnlich voller Cache den Sitzungsstart nicht ausbremst.
 */
function queuePfad(abteilung) {
  const override = String(process.env.NC_QUEUE_PFAD || '').trim();
  if (override) return override;

  const wurzel = process.env.CLAUDE_PLUGIN_ROOT;
  if (!wurzel) return QUEUE_PFAD_STANDARD;
  const fund = { exakt: null, erster: null, proben: 0 };
  try {
    const eltern = path.dirname(path.resolve(wurzel));
    for (const name of unterordner(eltern)) {
      if (pruefeAuspraegung(path.join(eltern, name), abteilung, fund)) return fund.exakt;
    }
    const marktplatz = path.dirname(eltern);
    for (const plugin of unterordner(marktplatz)) {
      for (const version of versionsOrdner(path.join(marktplatz, plugin))) {
        if (pruefeAuspraegung(version, abteilung, fund)) return fund.exakt;
      }
    }
  } catch (_) { /* fail-open — Standard ist immer besser als ein Abbruch */ }
  return fund.erster || QUEUE_PFAD_STANDARD;
}

/**
 * Queue-Inhalt im GEMERGTEN Stand lesen: `git show <origin-standardbranch>:<pfad>`.
 * Das ist der Punkt, an dem sich der Versatz auszahlt — der lokale Working-Tree-Stand
 * enthaelt die frisch angehaengten Zeilen des laufenden Zyklus und wuerde queue-kern
 * sofort faellig melden, obwohl der Abteilungs-PR noch offen ist. Fallback auf die
 * Arbeitskopie nur, wenn kein Remote-Bezug existiert (frischer, noch nicht gepushter Klon).
 */
function queueText(klon, relPfad) {
  const ref = standardRef(klon);
  if (ref) {
    const inhalt = git(klon, ['show', ref + ':' + relPfad.replace(/\\/g, '/')]);
    if (inhalt !== null) return inhalt;
    return null; // Remote-Bezug da, Datei dort nicht → nichts zu erinnern
  }
  // Kein Ref — aber das hat sehr verschiedene Ursachen (Onsite-Review-Befund H5). Die
  // Arbeitskopie wird deshalb nur mit POSITIVEM Beleg gelesen: mindestens ein Git-Aufruf
  // sauber zurueckgekommen (dann existiert hier wirklich ein lesbares Repository) UND
  // keiner abgeschnitten (sonst koennte der Remote-Bezug bloss unentdeckt geblieben sein).
  // Fehlt der Beleg, wissen wir ueber den gemergten Stand NICHTS und schweigen: Frisch
  // angehaengte Zeilen sind gerade nicht gemergt, eine Erinnerung daraus waere falsch.
  if (gitUnbrauchbar || !gitBelegt) return null;
  // Git laeuft, es gibt nur (noch) keinen Remote-Bezug — frischer, nie gepushter Klon.
  // Hier ist die Arbeitskopie der einzige und zugleich ehrliche Stand.
  try {
    return fs.readFileSync(path.join(klon, ...relPfad.split(/[\\/]+/)), 'utf8');
  } catch (_) { return null; }
}

/**
 * Offene Zeilen zaehlen (Queue-Format v1, referenz/pflege-auspraegung.md dieses
 * Kern-Plugins): Tabellenzeilen `| Datum | Einzeiler | Verweis | Kriterium | Status |`;
 * offen ist AUSSCHLIESSLICH der exakte Statuswert `offen` (NC-Verschaerfung gegenueber dem
 * Vorbild-`startsWith`: Format v1 kennt genau drei Werte, und ein unbekannter Wert wie
 * `offen-alt` darf keine Erinnerung ausloesen — Codex-Review-Befund 2026-08-16). Alles
 * andere (`befördert …`, `abgelehnt …`, leer, unbekannt) zaehlt NICHT. Kopfzeile,
 * Trennzeile und die Vorlagen-Beispielzeile werden uebersprungen.
 */
function offeneZeilen(text) {
  if (!text) return 0;
  let offen = 0;
  for (const zeile of String(text).split(/\r?\n/)) {
    const roh = zeile.trim();
    if (!roh.startsWith('|')) continue;
    const zellen = roh.replace(/^\|/, '').replace(/\|$/, '').split('|').map(z => z.trim());
    if (zellen.length < 5) continue;
    if (zellen.every(z => /^:?-{2,}:?$/.test(z))) continue;          // Trennzeile
    const status = zellen[zellen.length - 1].toLowerCase();
    if (status === 'status') continue;                                // Kopfzeile
    if (/Beispielzeile beim Anlegen entfernen/i.test(zellen[1])) continue; // Vorlage
    if (status === 'offen') offen++;
  }
  return offen;
}

// --- Abteilungs-Auswahl aus der NC-Registry ---------------------------------------------

/**
 * NC-Registry-Schema (infra-registry.md): `abteilungen` ist eine LISTE der installierten
 * internen Abteilungsplugins; die optionale Map `abteilungsRepoPfade` traegt je Abteilung
 * den absoluten Pfad ihres Satelliten-Arbeitsklons bzw. "ausstehend". Verarbeitet wird
 * der ERSTE Eintrag mit realem Klon (Verteilannahme: genau ein Abteilungsplugin je
 * Maschine); Kollegen-OS-Satelliten (Felix, Biggi) erscheinen hier nie (I8).
 * Heutiger Uebergangszustand: kein Satellit, keine Pfade → null, der Hook schweigt.
 */
function klonAuswahl(reg) {
  const namen = Array.isArray(reg.abteilungen)
    ? reg.abteilungen.map(n => String(n || '').trim()).filter(Boolean).slice(0, MAX_ABTEILUNGEN)
    : [];
  const pfade = (reg.abteilungsRepoPfade && typeof reg.abteilungsRepoPfade === 'object'
    && !Array.isArray(reg.abteilungsRepoPfade)) ? reg.abteilungsRepoPfade : {};
  for (const name of namen) {
    const p = String(pfade[name] || '').trim();
    if (!p || p === 'ausstehend') continue;   // Abteilung ohne Satelliten (Uebergang, E1)
    try {
      if (fs.statSync(p).isDirectory()) return { abteilung: name, klon: p };
    } catch (_) { /* toter Registry-Eintrag → naechster Kandidat bzw. schweigen */ }
  }
  return null;
}

// --- Sitzungsmarker -------------------------------------------------------------------

const DEFEKT = Symbol('defekt');

/**
 * Was wurde in DIESER Sitzung schon erinnert? Rueckgabe: Objekt mit Skill-Namen als
 * Schluessel, oder DEFEKT. Ein defekter Marker zaehlt als "alles schon erinnert"
 * (Schweigen) — dieselbe Fehlerrichtung wie beim Mahn-Marker der PreCompact-Mahnung: ein
 * kaputter State darf nie zu wiederholtem Rauschen fuehren. Abgelaufene Marker verfallen.
 */
function ladeSitzungsmarker(datei) {
  if (!datei) return DEFEKT;
  const gelesen = ladeJson(datei);
  if (gelesen.fehlt) return {};
  if (gelesen.defekt) return DEFEKT;
  const alter = Date.now() - (Number(gelesen.daten.last_active) || 0);
  if (alter > SITZUNGS_TTL_MS) return {};
  return gelesen.daten;
}

/**
 * Erledigtes dieser Sitzung festhalten (erinnerte Faelligkeiten, gemeldete Defekte).
 * Rueckgabe `false` heisst fuer den Aufrufer immer: NICHT ausgeben.
 *
 * Zwei Gruende fuer ein `false`:
 *   (a) Das Schreiben schlaegt fehl — sonst wiederholte sich der Hinweis bei jedem
 *       Session-Start (startup, resume, compact …), ohne je den Wiederholungsschutz zu
 *       erreichen.
 *   (b) Ein PARALLELER Lauf derselben Sitzung war schneller (SessionStart feuert je
 *       Sitzung mehrfach, und zwei Laeufe koennen sich ueberlappen). Deshalb wird der
 *       Marker unter der Sperre NEU gelesen statt dem Stand von vor der Git-Arbeit zu
 *       vertrauen: Wer als Erster markiert, gibt aus; alle anderen schweigen. Ohne diese
 *       Neupruefung koennten zwei gleichzeitige Laeufe denselben Hinweis doppelt zeigen.
 *       Hat der andere Lauf nur EINE von zwei Faelligkeiten markiert, schweigen wir
 *       trotzdem ganz — der Text ist zu diesem Zeitpunkt bereits gebaut, und "eine
 *       Erinnerung weniger" ist die richtige Fehlerrichtung.
 */
function markiereErledigt(datei, felder) {
  if (!datei) return false;
  let erfolg = false;
  try {
    mitSperre(datei, () => {
      const stand = ladeSitzungsmarker(datei);
      if (stand === DEFEKT) return;                   // defekt zaehlt als schon erledigt
      if (felder.some(f => stand[f])) return;         // paralleler Lauf war schneller
      const neu = Object.assign({}, stand, { last_active: Date.now() });
      for (const f of felder) neu[f] = Date.now();
      schreibeAtomar(datei, JSON.stringify(neu, null, 2));
      erfolg = true;
    });
  } catch (_) { return false; }
  return erfolg;
}

// --- Erinnerungstext ------------------------------------------------------------------

function alterText(zeitpunkt) {
  const ts = Number(zeitpunkt);
  if (!Number.isFinite(ts) || ts <= 0) return 'kein Lauf verzeichnet';
  const tage = Math.floor((Date.now() - ts) / TAG_MS);
  return 'letzter Lauf vor ' + tage + ' Tag(en)';
}

// Bewusst OHNE Abschalt-Hinweis (Muster der PreCompact-Mahnung): ein Hinweis, der seine
// eigene Abschaltung mitliefert, erzieht zum Abschalten. Der Opt-out steht im Dateikopf,
// in hooks.json und im README.
function erinnerungsText(faellig, stempelSkript) {
  const zeilen = faellig.map(f => '- **`/nc:' + f.skill + '`** — ' + f.befund + ' · ' + f.alter);
  return '# NovaCore-OS — Queue-Flow fällig (Erinnerung, keine Blockade)\n\n'
    + 'Der 14-Tage-Takt des Queue-Flows (standardprozesse/queue-flow.md des OS-Repos) ist '
    + 'überschritten:\n\n'
    + zeilen.join('\n') + '\n\n'
    + 'Beide Skills arbeiten **bis zum fertigen PR** und nicht weiter: Merge, '
    + 'Review-Resolves und alles Kundensichtbare bleiben Mensch. Der geprüfte '
    + 'Stand ist der letzte lokal bekannte (kein Netzzugriff im Sitzungsstart) — vor dem '
    + 'Lauf selbst nachziehen. **Nach dem Lauf** den Zeitpunkt festhalten, sonst erinnert '
    + 'dieser Hinweis weiter:\n'
    + faellig.map(f => '`node "' + stempelSkript + '" --lauf ' + f.skill + '`').join(' · ')
    + '\n\nDiese Erinnerung erscheint höchstens einmal je Fälligkeit und Sitzung; sie '
    + 'blockiert nichts.';
}

// --- Lauf-Marker schreiben (CLI-Modus) ------------------------------------------------

function stempleLauf(skill) {
  if (!SKILLS.includes(skill)) {
    process.stderr.write('[Queue-Flow] Lauf-Marker verweigert: --lauf braucht einen der Skills '
      + SKILLS.join(' | ') + '.\n');
    process.exitCode = 1;
    return;
  }
  // Fremde Felder erhalten — parallele Sitzungen sind real (Registry-Regel in
  // infra-registry.md). Lesen, Aendern und Schreiben laufen deshalb unter der Sperre und
  // enden in einem atomaren Tausch: Ohne die Sperre ueberschreibt der zweite von zwei
  // gleichzeitigen Laeufen den Zeitstempel des ersten, ohne den Tausch bleibt bei einem
  // Abbruch eine halbe Datei liegen — und die legt die Takt-Erinnerung still lahm (M1/M3).
  try {
    const geschrieben = mitSperre(laufDatei(), () => {
      const gelesen = ladeJson(laufDatei());
      const daten = gelesen.daten && typeof gelesen.daten === 'object' ? gelesen.daten : {};
      if (gelesen.defekt) warn('Lauf-Marker war unlesbar und wird neu angelegt.');
      daten[skill] = Date.now();
      schreibeAtomar(laufDatei(), JSON.stringify(daten, null, 2));
      return true;
    }, true);
    if (!geschrieben) return; // Sperre nicht zu bekommen — Meldung kam aus mitSperre
  } catch (e) {
    process.stderr.write('[Queue-Flow] Lauf-Marker nicht schreibbar: ' + (e && e.message) + '\n');
    process.exitCode = 1;
    return;
  }
  process.stdout.write('[Queue-Flow] Lauf von /nc:' + skill + ' festgehalten — die '
    + 'Fälligkeits-Erinnerung ruht für 14 Tage.\n');
}

// --- Hook-Lauf ------------------------------------------------------------------------

function main() {
  if (isDisabled()) return;

  let input = {};
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8')) || {};
  } catch (_) { input = {}; }
  if (typeof input !== 'object' || input === null) input = {};

  if (isSubagentInvocation(input)) return; // der Parent-Lauf fuehrt die Sitzung

  const datei = sitzungsDatei(resolveSessionKey(input));
  const bereits = ladeSitzungsmarker(datei);
  if (bereits === DEFEKT) return;

  // Infra-Registry (infra-registry.md): einzige Quelle der Repo-Pfade. Fehlt sie, lief
  // das Setup auf dieser Maschine nie — kein Befund, kein Hinweis (das erledigt /nc:setup).
  const registry = ladeJson(registryDatei());
  if (registry.fehlt || registry.defekt) return;
  const reg = registry.daten;
  if (Number(reg.schemaVersion) > REGISTRY_SCHEMA) return; // neuer als der Kern → nicht raten

  const auswahl = klonAuswahl(reg);
  if (!auswahl) return; // kein Abteilungs-Satellit registriert (Uebergangszustand E1) → schweigen
  const klon = auswahl.klon;

  const laufMarker = ladeJson(laufDatei());
  if (laufMarker.defekt) {
    // Unbekannte Lage → keine Faelligkeit behaupten. Aber auch NICHT unbegrenzt
    // diagnoselos schweigen (Onsite-Review-Befund M3): Ohne Meldung waere die
    // Takt-Erinnerung dauerhaft tot, und niemand koennte den Unterschied zu "nichts
    // faellig" sehen. Einmal je Sitzung, mit Reparaturweg, ueber stderr + Exit 2 (fuer
    // SessionStart laut Doku sichtbar, ohne zu blocken).
    if (markiereErledigt(datei, [MELDEFELD_LAUF_DEFEKT])) {
      warn('Lauf-Marker "' + laufDatei() + '" ist unlesbar — die Faelligkeits-Erinnerung '
        + 'des Queue-Flows ruht, bis er repariert ist (es wird bewusst KEINE Faelligkeit '
        + 'geraten). Reparatur: Datei loeschen oder nach dem naechsten Lauf '
        + '`node "' + __filename + '" --lauf <' + SKILLS.join('|') + '>` ausfuehren — das '
        + 'legt sie neu an. Diese Meldung erscheint einmal je Sitzung.');
      process.exitCode = 2;
    }
    return;
  }
  const laeufe = laufMarker.fehlt ? {} : laufMarker.daten;
  const jetzt = Date.now();
  const alterVon = (skill) => {
    const ts = Number(laeufe[skill]);
    return Number.isFinite(ts) && ts > 0 ? jetzt - ts : Infinity; // unbekannt = nie gelaufen
  };

  const faellig = [];

  if (!bereits['queue-abteilung'] && alterVon('queue-abteilung') > FAELLIG_NACH_MS) {
    const befund = nichtEingereichteArbeit(klon);
    if (befund) {
      faellig.push({ skill: 'queue-abteilung', befund, alter: alterText(laeufe['queue-abteilung']) });
    }
  }

  // Versatz: Lief queue-abteilung vor weniger als einem Tag, ist der gemergte Stand noch
  // nicht nachgezogen — dann waere die Erinnerung an queue-kern verfrueht.
  const versatzOffen = alterVon('queue-abteilung') < VERSATZ_MS;
  if (!bereits['queue-kern'] && !versatzOffen && alterVon('queue-kern') > FAELLIG_NACH_MS) {
    const offen = offeneZeilen(queueText(klon, queuePfad(auswahl.abteilung)));
    if (offen > 0) {
      faellig.push({
        skill: 'queue-kern',
        befund: offen + ' offene Zeile(n) in der gemergten Abteilungs-Queue',
        alter: alterText(laeufe['queue-kern'])
      });
    }
  }

  if (!faellig.length) return;
  if (!markiereErledigt(datei, faellig.map(f => f.skill))) return;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: erinnerungsText(faellig, __filename)
    }
  }));
}

try {
  const argv = process.argv.slice(2);
  const idx = argv.indexOf('--lauf');
  if (idx !== -1) stempleLauf(String(argv[idx + 1] || '').trim());
  else main();
} catch (e) {
  warn('fail-open: ' + (e && e.message));
}
// Kein process.exit(): das kann auf POSIX den gepufferten stdout-Write (Pipe) abschneiden —
// die Erinnerung ginge still verloren (Onsite-Debug-Log 2026-08-04). exitCode bleibt, was
// gesetzt wurde: 0 im Hook-Lauf (SessionStart kann ohnehin nicht blocken), 1 nur beim
// verweigerten Lauf-Marker im CLI-Modus.
if (process.exitCode === undefined) process.exitCode = 0;
