// Tests fuer den SessionStart-Autosync der team-globalen CLAUDE-Anteile
// (plugins/nc/hooks/nc-doks-autosync.js; Bauplan 2026-08-10 „Onsite-Align-Umbau", AP3,
// erweitert um Ebene 1b durch Bauplan 2026-08-15 „Onsite-Endstand-Nachbau", AP-B2).
// Geprueft wird die Marker-Chirurgie an ~/.claude/CLAUDE.md (Ebene 1) UND der Ganzdatei-Sync
// von ~/.claude/nc-teamsync.md (Ebene 1b) — BEIDE Ziele werden IMMER auf Temp-Dateien
// umgeleitet (NC_AUTOSYNC_TARGET bzw. NC_AUTOSYNC_TEAMSYNC_TARGET), damit kein Test je eine
// reale Datei im Home-`.claude`-Ordner anfasst:
// Erstlauf, Privat-Zonen-Erhalt (byte-identisch), Idempotenz (No-op), Block-Ersatz bei
// Versionswechsel, Opt-out, Subagenten-Ausnahme, fail-safe bei defekten Markern, Backup,
// Fail-open, Unabhaengigkeit der beiden Ziele, CRLF-Haertung.
// Muster wie session-start.test.mjs (frische Fixtures, spawnSync).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const HOOK = path.join(HIER, '..', 'hooks', 'nc-doks-autosync.js');
const PLUGIN_ROOT = path.join(HIER, '..');
const KERN_VERSION = JSON.parse(fs.readFileSync(
  path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json'), 'utf8')).version;

const START = '<!-- NC:BLOCK:START global -->';
const ENDE = '<!-- NC:BLOCK:ENDE global -->';
const TEAMSYNC_STEMPEL = '<!-- NC:TEAMSYNC:VERSION ' + KERN_VERSION + ' -->';

/** Frisches Temp-Verzeichnis; Rueckgabe = Zielpfad der simulierten globalen CLAUDE.md. */
function ziel(inhalt) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nc-autosync-'));
  const file = path.join(dir, 'CLAUDE.md');
  if (inhalt !== undefined) fs.writeFileSync(file, inhalt, 'utf8');
  return file;
}

/** Zweites Ziel (Ebene 1b) neben einem bestehenden CLAUDE.md-Ziel im selben Temp-Ordner. */
function teamsyncZiel(claudeZiel, inhalt) {
  const file = path.join(path.dirname(claudeZiel), 'nc-teamsync.md');
  if (inhalt !== undefined) fs.writeFileSync(file, inhalt, 'utf8');
  return file;
}

/**
 * Hook ausfuehren. BEIDE Ziele gehen immer per Env ins Temp-Verzeichnis
 * (NC_AUTOSYNC_TARGET fuer Ebene 1, NC_AUTOSYNC_TEAMSYNC_TARGET fuer Ebene 1b), damit kein
 * Test je eine reale Datei im Home-`.claude`-Ordner anfasst.
 */
function runHook(target, { stdin, env = {} } = {}) {
  const eingabe = stdin === undefined
    ? JSON.stringify({ session_id: 'test', source: 'startup', hook_event_name: 'SessionStart' })
    : stdin;
  // Geerbte Opt-outs muessen raus, BEVOR das testeigene env greift: auf einer Maschine mit
  // dokumentiertem NC_AUTOSYNC=off (Koexistenz-Empfehlung) waere die Suite sonst rot, ohne
  // dass am Code etwas falsch ist. Muster aus nc-start-gate.test.mjs.
  const kindEnv = {
    ...process.env,
    CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT,
    NC_AUTOSYNC_TARGET: target,
    NC_AUTOSYNC_TEAMSYNC_TARGET: path.join(path.dirname(target), 'nc-teamsync.md')
  };
  delete kindEnv.NC_AUTOSYNC;
  Object.assign(kindEnv, env);

  const r = spawnSync(process.execPath, [HOOK], {
    input: eingabe,
    encoding: 'utf8',
    env: kindEnv
  });
  return { status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

test('Erstlauf legt das Ziel mit Firmen-Block und Versions-Stempel an', () => {
  const target = ziel(); // Datei existiert noch nicht
  const { status } = runHook(target);
  assert.equal(status, 0);
  assert.ok(fs.existsSync(target), 'Erstlauf muss die Zieldatei anlegen');
  const inhalt = fs.readFileSync(target, 'utf8');
  assert.ok(inhalt.startsWith(START), 'Block muss mit dem START-Marker beginnen');
  assert.match(inhalt, new RegExp('<!-- NC:BLOCK:VERSION ' + KERN_VERSION.replace(/\./g, '\\.') + ' -->'),
    'erste Zeile im Block muss die Kern-Version stempeln');
  assert.ok(inhalt.includes(ENDE), 'ENDE-Marker fehlt');
  assert.match(inhalt, /Rote Linien/, 'Payload-Inhalt (rote Linien) fehlt');
});

test('Bestandsdatei ohne Marker: Block kommt nach oben, Privat-Zone bleibt byte-identisch', () => {
  const privat = '# Meine privaten Regeln\n\n- Umlaut-Test äöü\r\n- Zeile mit  doppelten  Spaces\n';
  const target = ziel(privat);
  const { status } = runHook(target);
  assert.equal(status, 0);
  const inhalt = fs.readFileSync(target, 'utf8');
  assert.ok(inhalt.startsWith(START), 'Block muss ganz oben stehen');
  assert.ok(inhalt.endsWith(privat),
    'die Privat-Zone muss byte-identisch hinter dem Block erhalten bleiben');
});

test('No-op bei identischem Stand: Datei-Inhalt bleibt unveraendert, kein neues Backup', () => {
  const target = ziel();
  runHook(target);
  const stand = fs.readFileSync(target, 'utf8');
  const backup = target + '.nc-autosync-backup';
  if (fs.existsSync(backup)) fs.unlinkSync(backup);
  const { status } = runHook(target); // zweiter Lauf: Version + Inhalt identisch
  assert.equal(status, 0);
  assert.equal(fs.readFileSync(target, 'utf8'), stand, 'No-op darf den Inhalt nicht aendern');
  assert.equal(fs.existsSync(backup), false, 'No-op darf nicht schreiben — also auch kein Backup');
});

test('Versionswechsel ersetzt nur den Block, die Privat-Zone bleibt unangetastet', () => {
  const privat = '\n# Privat\nMeine Zone, Finger weg.\n';
  const alterBlock = START + '\n<!-- NC:BLOCK:VERSION 0.0.1 -->\nVeralteter Firmentext.\n' + ENDE;
  const target = ziel(alterBlock + privat);
  const { status } = runHook(target);
  assert.equal(status, 0);
  const inhalt = fs.readFileSync(target, 'utf8');
  assert.match(inhalt, new RegExp('VERSION ' + KERN_VERSION.replace(/\./g, '\\.')),
    'Block muss auf die aktuelle Kern-Version gehoben werden');
  assert.ok(!inhalt.includes('Veralteter Firmentext'), 'alter Block-Inhalt muss ersetzt sein');
  assert.ok(inhalt.endsWith(privat), 'Privat-Zone hinter dem Block muss byte-identisch bleiben');
  assert.match(inhalt, /Rote Linien/, 'neuer Payload-Inhalt fehlt');
});

test('Opt-out NC_AUTOSYNC=off schreibt nichts', () => {
  for (const wert of ['off', '0', 'false', 'disabled', 'OFF']) {
    const target = ziel();
    const { status, stdout } = runHook(target, { env: { NC_AUTOSYNC: wert } });
    assert.equal(status, 0);
    assert.equal(stdout, '', `NC_AUTOSYNC=${wert}: keine Ausgabe erwartet`);
    assert.equal(fs.existsSync(target), false, `NC_AUTOSYNC=${wert} darf nichts schreiben`);
  }
});

test('Subagenten-Aufruf schreibt nichts (der Parent hat den Sync bereits)', () => {
  const target = ziel();
  const stdin = JSON.stringify({
    session_id: 'test', source: 'startup', hook_event_name: 'SessionStart',
    agent_id: 'sub-1', agent_type: 'general-purpose'
  });
  const { status } = runHook(target, { stdin });
  assert.equal(status, 0);
  assert.equal(fs.existsSync(target), false, 'Subagenten-Session darf nichts schreiben');
});

test('Defekter Marker (nur START): nichts schreiben, Warnung auf stderr, Exit 0', () => {
  const kaputt = START + '\nFirmentext ohne ENDE-Marker\n# Privat\n';
  const target = ziel(kaputt);
  const { status, stderr } = runHook(target);
  assert.equal(status, 0, 'defekte Marker duerfen die Session nicht brechen (fail-safe)');
  assert.equal(fs.readFileSync(target, 'utf8'), kaputt,
    'bei defekten Markern darf NICHTS geschrieben werden — lieber veraltet als zerstoert');
  assert.equal(fs.existsSync(target + '.nc-autosync-backup'), false,
    'ohne Schreiblauf auch kein Backup');
  assert.match(stderr, /Marker/i, 'stderr muss auf die defekten Marker hinweisen');
});

test('Defekte Marker: ENDE vor START und Mehrfach-Marker bleiben ebenfalls unangetastet', () => {
  const faelle = [
    ENDE + '\nverdreht\n' + START + '\n',                          // ENDE vor START
    START + '\na\n' + ENDE + '\n' + START + '\nb\n' + ENDE + '\n'  // Mehrfach-Marker
  ];
  for (const kaputt of faelle) {
    const target = ziel(kaputt);
    const { status, stderr } = runHook(target);
    assert.equal(status, 0);
    assert.equal(fs.readFileSync(target, 'utf8'), kaputt, 'defekter Fall darf nicht geschrieben werden');
    assert.match(stderr, /Marker/i);
  }
});

test('Vor einem Schreiblauf existiert danach die rollierende Sicherung', () => {
  const privat = 'Bestandsinhalt ohne Marker\n';
  const target = ziel(privat);
  const { status } = runHook(target);
  assert.equal(status, 0);
  const backup = target + '.nc-autosync-backup';
  assert.ok(fs.existsSync(backup), 'Backup-Datei fehlt nach dem Schreiblauf');
  assert.equal(fs.readFileSync(backup, 'utf8'), privat,
    'das Backup muss den Stand VOR dem Schreiben tragen');
});

// Review-Haertung (PR #10, Nachtrag N2/M2): Der Schreiblauf ist atomar (Temp + rename), und
// eine gute Sicherung darf nie durch eine schlechtere ersetzt werden. Sonst konnte ein
// zweiter, gleichzeitig startender Prozess einen halb geschriebenen Bestand als "Backup"
// ueber die einzige intakte Sicherung kopieren — Privat-Zone dauerhaft weg.
test('Eine intakte Sicherung wird nicht durch einen markerlosen Torso ersetzt', () => {
  const privat = '# Privat\nWichtige eigene Regeln.\n';
  const target = ziel();
  runHook(target);                                    // Erstlauf: legt Block an
  const backup = target + '.nc-autosync-backup';

  // Zustand herstellen: gutes Backup (mit Markerpaar), Bestand als Torso ohne Marker.
  fs.writeFileSync(backup, START + '\nguter Stand\n' + ENDE + '\n' + privat, 'utf8');
  fs.writeFileSync(target, 'abgeschnittener Torso ohne Marker\n', 'utf8');
  const gutesBackup = fs.readFileSync(backup, 'utf8');

  const { status, stderr } = runHook(target);
  assert.equal(status, 0);
  assert.equal(fs.readFileSync(backup, 'utf8'), gutesBackup,
    'das intakte Backup darf nicht mit dem Torso ueberschrieben werden');
  assert.match(stderr, /Sicherung/i, 'der Verzicht auf das Ueberschreiben gehoert auf stderr');
});

test('Nach dem Schreiblauf bleibt keine Temp-Datei liegen', () => {
  const target = ziel('Bestand ohne Marker\n');
  runHook(target);
  const reste = fs.readdirSync(path.dirname(target)).filter((f) => f.includes('.nc-autosync-tmp-'));
  assert.deepEqual(reste, [], 'atomarer Write darf keine Temp-Datei hinterlassen');
});

test('Fail-open: unlesbares Ziel (Verzeichnis statt Datei) bricht die Session nicht', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nc-autosync-'));
  const target = path.join(dir, 'CLAUDE.md');
  fs.mkdirSync(target); // Ziel ist ein Verzeichnis → Lesen/Schreiben schlaegt fehl
  const { status, stderr } = runHook(target);
  assert.equal(status, 0, 'jeder interne Fehler muss fail-open enden (Exit 0)');
  assert.ok(stderr.length > 0, 'fail-open soll einen kurzen stderr-Hinweis hinterlassen');
});

// --- Ebene 1b: Team-Sync-Datei ~/.claude/nc-teamsync.md (Ganzdatei, Bauplan AP-B2) --------
// Bewusst KEINE Marker-Chirurgie: die Datei gehoert vollstaendig der Firma. Geprueft werden
// Anlage, Update bei altem Stempel, No-op, Backup, Opt-out, Subagenten-Ausnahme und die
// Kopplung an Ebene 1. Port der Onsite-Vorlage oai-doks-autosync.test.mjs.

test('Ebene 1b: Erstlauf legt nc-teamsync.md mit Stempel in der ERSTEN Zeile an', () => {
  const target = ziel();
  const teamsync = teamsyncZiel(target);
  const { status } = runHook(target);
  assert.equal(status, 0);
  assert.ok(fs.existsSync(teamsync), 'Erstlauf muss die Team-Sync-Datei anlegen');
  const inhalt = fs.readFileSync(teamsync, 'utf8');
  assert.equal(inhalt.split(/\r?\n/)[0], TEAMSYNC_STEMPEL,
    'erste Zeile muss der Versions-Stempel der Kern-Version sein');
  assert.ok(!inhalt.includes('NC:BLOCK:START'),
    'die Ganzdatei-Payload darf keine Block-Marker tragen — sie hat keine Privat-Zone');
  assert.match(inhalt, /Verhaltens-Defaults/, 'Payload-Inhalt (nc-sync.md) fehlt');
});

test('Ebene 1b: alter Stempel wird durch die ganze Datei ersetzt, Backup entsteht', () => {
  const target = ziel();
  const alt = '<!-- NC:TEAMSYNC:VERSION 0.0.1 -->\nVeralteter Team-Sync-Text.\n';
  const teamsync = teamsyncZiel(target, alt);
  const { status } = runHook(target);
  assert.equal(status, 0);
  const inhalt = fs.readFileSync(teamsync, 'utf8');
  assert.equal(inhalt.split(/\r?\n/)[0], TEAMSYNC_STEMPEL, 'Stempel muss gehoben werden');
  assert.ok(!inhalt.includes('Veralteter Team-Sync-Text'),
    'der alte Inhalt muss vollstaendig ersetzt sein (Ganzdatei-Sync, kein Teil-Ersatz)');
  const backup = teamsync + '.nc-autosync-backup';
  assert.ok(fs.existsSync(backup), 'Backup der Team-Sync-Datei fehlt');
  assert.equal(fs.readFileSync(backup, 'utf8'), alt,
    'das Backup muss den Stand VOR dem Schreiben tragen');
});

test('Ebene 1b: No-op bei identischem Stand — kein Schreiben, kein Backup', () => {
  const target = ziel();
  const teamsync = teamsyncZiel(target);
  runHook(target);
  const stand = fs.readFileSync(teamsync, 'utf8');
  const backup = teamsync + '.nc-autosync-backup';
  if (fs.existsSync(backup)) fs.unlinkSync(backup);
  const { status } = runHook(target);
  assert.equal(status, 0);
  assert.equal(fs.readFileSync(teamsync, 'utf8'), stand, 'No-op darf den Inhalt nicht aendern');
  assert.equal(fs.existsSync(backup), false, 'No-op darf nicht schreiben — also auch kein Backup');
});

test('Ebene 1b: Opt-out und Subagenten-Ausnahme gelten fuer BEIDE Ziele', () => {
  const aus = ziel();
  runHook(aus, { env: { NC_AUTOSYNC: 'off' } });
  assert.equal(fs.existsSync(path.join(path.dirname(aus), 'nc-teamsync.md')), false,
    'NC_AUTOSYNC=off muss auch die Team-Sync-Datei ungeschrieben lassen');

  const sub = ziel();
  runHook(sub, {
    stdin: JSON.stringify({
      session_id: 'test', source: 'startup', hook_event_name: 'SessionStart',
      agent_id: 'sub-1', agent_type: 'general-purpose'
    })
  });
  assert.equal(fs.existsSync(path.join(path.dirname(sub), 'nc-teamsync.md')), false,
    'Subagenten-Session darf auch die Team-Sync-Datei nicht schreiben');
});

test('Ebene 1b: der Firmen-Block importiert die Team-Sync-Datei (Ebenen-Kopplung)', () => {
  // Negativprobe zur Kopplung: Ohne die @-Import-Zeile im Firmen-Block wuerde Ebene 1b
  // geschrieben, aber von keiner Sitzung geladen — der Sync waere wirkungslos.
  const target = ziel();
  runHook(target);
  assert.match(fs.readFileSync(target, 'utf8'), /^@~\/\.claude\/nc-teamsync\.md$/m,
    'der Firmen-Block muss die Team-Sync-Datei per @-Import einbinden');
});

test('Unabhaengigkeit: ein defektes Ziel verhindert den Sync des anderen nicht', () => {
  // Richtung A: Ebene 1 unbrauchbar (Verzeichnis statt Datei) → Ebene 1b laeuft trotzdem.
  const dirA = fs.mkdtempSync(path.join(os.tmpdir(), 'nc-autosync-'));
  const kaputtesZiel1 = path.join(dirA, 'CLAUDE.md');
  fs.mkdirSync(kaputtesZiel1);
  const a = runHook(kaputtesZiel1);
  assert.equal(a.status, 0);
  assert.ok(fs.existsSync(path.join(dirA, 'nc-teamsync.md')),
    'ein Fehler an Ebene 1 darf den Sync der Ebene 1b nicht verhindern');

  // Richtung B: Ebene 1b unbrauchbar → Ebene 1 wird trotzdem geschrieben.
  const target = ziel();
  const kaputtesZiel1b = path.join(path.dirname(target), 'teamsync-als-verzeichnis');
  fs.mkdirSync(kaputtesZiel1b);
  const b = runHook(target, { env: { NC_AUTOSYNC_TEAMSYNC_TARGET: kaputtesZiel1b } });
  assert.equal(b.status, 0, 'jeder interne Fehler muss fail-open enden (Exit 0)');
  assert.ok(b.stderr.length > 0, 'fail-open soll einen kurzen stderr-Hinweis hinterlassen');
  assert.ok(fs.readFileSync(target, 'utf8').startsWith(START),
    'ein Fehler an Ebene 1b darf den Sync der Ebene 1 nicht verhindern');
});

// --- CRLF-Haertung (NC ueber die Onsite-Vorlage hinaus, Bauplan-Testfall T10) --------------
// Windows-Editoren speichern die Ziele gern mit CRLF. Ein roher String-Vergleich saehe dann
// bei inhaltsgleichem Stand einen Dauer-Unterschied und wuerde die Datei in JEDER Session neu
// schreiben (Backup-Churn, wandernde Sicherungen). Der Vergleich normalisiert deshalb die
// Zeilenenden — geprueft fuer BEIDE Ziele.

/**
 * Denselben Inhalt in reinem CRLF ausdruecken. ERST auf LF normalisieren: die
 * ausgelieferten Payloads liegen im Arbeitsbaum je nach Git-Konfiguration schon mit CRLF
 * vor — ein blindes \n→\r\n wuerde daraus \r\r\n machen, also einen ECHT anderen Inhalt
 * (und der Hook muesste ihn zu Recht neu schreiben; genau daran ist dieser Test zuerst
 * gescheitert).
 */
function alsCrlf(text) {
  return text.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
}

test('CRLF-Ziel der Ebene 1: inhaltsgleicher Block wird nicht neu geschrieben', () => {
  const target = ziel();
  runHook(target);                                   // Erstlauf: aktueller Stand
  const backup = target + '.nc-autosync-backup';
  const crlf = alsCrlf(fs.readFileSync(target, 'utf8'));
  fs.writeFileSync(target, crlf, 'utf8');            // gleicher Inhalt, nur CRLF
  if (fs.existsSync(backup)) fs.unlinkSync(backup);

  const { status } = runHook(target);
  assert.equal(status, 0);
  assert.equal(fs.readFileSync(target, 'utf8'), crlf,
    'ein inhaltsgleiches CRLF-Ziel muss byte-identisch bleiben (kein Rewrite)');
  assert.equal(fs.existsSync(backup), false, 'ohne Schreiblauf darf kein neues Backup entstehen');
});

test('CRLF-Ziel der Ebene 1b: inhaltsgleiche Ganzdatei wird nicht neu geschrieben', () => {
  const target = ziel();
  const teamsync = teamsyncZiel(target);
  runHook(target);                                   // Erstlauf: aktueller Stand
  const backup = teamsync + '.nc-autosync-backup';
  const crlf = alsCrlf(fs.readFileSync(teamsync, 'utf8'));
  fs.writeFileSync(teamsync, crlf, 'utf8');          // gleicher Inhalt, nur CRLF
  if (fs.existsSync(backup)) fs.unlinkSync(backup);

  const { status } = runHook(target);
  assert.equal(status, 0);
  assert.equal(fs.readFileSync(teamsync, 'utf8'), crlf,
    'ein inhaltsgleiches CRLF-Ziel muss byte-identisch bleiben (kein Rewrite)');
  assert.equal(fs.existsSync(backup), false, 'ohne Schreiblauf darf kein neues Backup entstehen');
});

// Backup-Schutz der Ebene 1b (Bauplan-Testfall T11) — dieselbe Haertung wie bei Ebene 1,
// nur mit dem Intaktheitskriterium dieses Ziels: intakt = beginnt mit der Stempelzeile.
test('Ebene 1b: eine intakte Sicherung wird nicht durch einen stempellosen Torso ersetzt', () => {
  const target = ziel();
  const teamsync = teamsyncZiel(target);
  runHook(target);                                   // Erstlauf legt beide Ziele an
  const backup = teamsync + '.nc-autosync-backup';

  // Zustand herstellen: gutes Backup (mit Stempelzeile), Bestand als Torso ohne Stempel.
  fs.writeFileSync(backup, '<!-- NC:TEAMSYNC:VERSION 0.0.1 -->\nguter Stand\n', 'utf8');
  fs.writeFileSync(teamsync, 'abgeschnittener Torso ohne Stempel\n', 'utf8');
  const gutesBackup = fs.readFileSync(backup, 'utf8');

  const { status, stderr } = runHook(target);
  assert.equal(status, 0);
  assert.equal(fs.readFileSync(backup, 'utf8'), gutesBackup,
    'das intakte Backup darf nicht mit dem Torso ueberschrieben werden');
  assert.match(stderr, /Sicherung/i, 'der Verzicht auf das Ueberschreiben gehoert auf stderr');
  assert.equal(fs.readFileSync(teamsync, 'utf8').split(/\r?\n/)[0], TEAMSYNC_STEMPEL,
    'der Torso selbst wird trotzdem durch den aktuellen Stand ersetzt');
});

test('Privat-Zone bleibt auch im Zwei-Ziel-Lauf byte-identisch', () => {
  // Der Zwei-Ziel-Lauf ist der Normalfall seit AP-B2: Ebene 1b darf die Marker-Chirurgie der
  // Ebene 1 in keiner Weise beeinflussen — die Privat-Zone bleibt Byte fuer Byte stehen.
  const privat = '# Meine privaten Regeln\n\n- Umlaut-Test äöü\r\n- Zeile mit  doppelten  Spaces\n';
  const target = ziel(privat);
  const teamsync = teamsyncZiel(target);
  const { status } = runHook(target);
  assert.equal(status, 0);
  const inhalt = fs.readFileSync(target, 'utf8');
  assert.ok(inhalt.startsWith(START), 'Block muss ganz oben stehen');
  assert.ok(inhalt.endsWith(privat),
    'die Privat-Zone muss byte-identisch hinter dem Block erhalten bleiben');
  assert.ok(fs.existsSync(teamsync), 'im selben Lauf muss auch Ebene 1b geschrieben worden sein');
  assert.equal(fs.readFileSync(teamsync, 'utf8').split(/\r?\n/)[0], TEAMSYNC_STEMPEL,
    'Ebene 1b traegt den aktuellen Versions-Stempel');
});
