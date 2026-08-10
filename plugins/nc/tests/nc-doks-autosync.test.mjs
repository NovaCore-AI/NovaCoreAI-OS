// Tests fuer den SessionStart-Autosync der team-globalen CLAUDE-Anteile
// (plugins/nc/hooks/nc-doks-autosync.js; Bauplan 2026-08-10 „Onsite-Align-Umbau", AP3).
// Geprueft wird die Marker-Chirurgie an ~/.claude/CLAUDE.md — hier IMMER umgeleitet auf ein
// Temp-Ziel via NC_AUTOSYNC_TARGET, damit kein Test je die reale globale CLAUDE.md anfasst:
// Erstlauf, Privat-Zonen-Erhalt (byte-identisch), Idempotenz (No-op), Block-Ersatz bei
// Versionswechsel, Opt-out, Subagenten-Ausnahme, fail-safe bei defekten Markern, Backup,
// Fail-open. Muster wie session-start.test.mjs (frische Fixtures, spawnSync).
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

/** Frisches Temp-Verzeichnis; Rueckgabe = Zielpfad der simulierten globalen CLAUDE.md. */
function ziel(inhalt) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nc-autosync-'));
  const file = path.join(dir, 'CLAUDE.md');
  if (inhalt !== undefined) fs.writeFileSync(file, inhalt, 'utf8');
  return file;
}

/** Hook ausfuehren. Ziel geht IMMER ueber NC_AUTOSYNC_TARGET ins Temp-Verzeichnis. */
function runHook(target, { stdin, env = {} } = {}) {
  const eingabe = stdin === undefined
    ? JSON.stringify({ session_id: 'test', source: 'startup', hook_event_name: 'SessionStart' })
    : stdin;
  const r = spawnSync(process.execPath, [HOOK], {
    input: eingabe,
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT, NC_AUTOSYNC_TARGET: target, ...env }
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

test('Fail-open: unlesbares Ziel (Verzeichnis statt Datei) bricht die Session nicht', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nc-autosync-'));
  const target = path.join(dir, 'CLAUDE.md');
  fs.mkdirSync(target); // Ziel ist ein Verzeichnis → Lesen/Schreiben schlaegt fehl
  const { status, stderr } = runHook(target);
  assert.equal(status, 0, 'jeder interne Fehler muss fail-open enden (Exit 0)');
  assert.ok(stderr.length > 0, 'fail-open soll einen kurzen stderr-Hinweis hinterlassen');
});
