// Tests fuer das PreCompact-Mahn-Gate des Sitzungsabschlusses
// (plugins/nc/hooks/nc-end-mahnung.js + nc-end-stempel.js; Bauplan 2026-08-15
// „Onsite-Endstand-Nachbau", AP-B1; Port der Onsite-Vorlage oai-end-mahnung.test.mjs).
// Geprueft wird die Mahn-Mechanik: die erste Kompaktierung einer ungestempelten Sitzung
// wird geblockt (manual UND auto) und nennt /nc:end-session samt Stempel-Befehl, die
// ZWEITE laeuft durch (Loop-Schutz gegen Auto-Compact-Sackgassen), ein gesetzter
// Abschluss-Stempel unterdrueckt die Mahnung ganz, Subagenten und Env-Opt-out sind
// ausgenommen, defekter State und defekte Eingabe fallen offen.
//
// ABGRENZUNG: Das ist NICHT Gate 4 (Stop-Hook) — der bleibt auf Eis
// (grundwissen/NovaCore-OS-Gates-Definition.md). Gemahnt wird ausschliesslich vor der
// Kontext-Kompaktierung.
//
// ISOLATION: Jeder Lauf bekommt ein frisches NC_END_STATE_DIR (mkdtempSync) — kein Test
// fasst je den realen State-Ort oder gar `~/.claude` an. Einzige bewusste Ausnahme ist der
// letzte Test, der genau die Fallback-Ableitung des State-Orts pruefen MUSS; er arbeitet
// unter os.tmpdir() mit PID-eindeutigem Schluessel und raeumt hinterher auf.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const MAHNUNG = path.join(HIER, '..', 'hooks', 'nc-end-mahnung.js');
const STEMPEL = path.join(HIER, '..', 'hooks', 'nc-end-stempel.js');

function fixture() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'nc-endmahn-'));
}

/** Isoliertes State-Verzeichnis je Testfall — Sessions duerfen sich nie teilen. */
function stateDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'nc-endmahn-state-'));
}

function runMahnung(cwd, state, { trigger = 'manual', session = 'test-session', env = {}, stdin } = {}) {
  const eingabe = stdin !== undefined ? stdin : JSON.stringify({
    session_id: session, cwd, hook_event_name: 'PreCompact', trigger
  });
  const kindEnv = { ...process.env, NC_END_STATE_DIR: state, ...env };
  delete kindEnv.CLAUDE_PROJECT_DIR;
  delete kindEnv.NC_PRECOMPACT; // geerbtes Opt-out darf die Tests nicht aushebeln
  if (env.NC_PRECOMPACT) kindEnv.NC_PRECOMPACT = env.NC_PRECOMPACT;
  const r = spawnSync(process.execPath, [MAHNUNG], { cwd, input: eingabe, encoding: 'utf8', env: kindEnv });
  const stdout = (r.stdout || '').trim();
  let ausgabe = null;
  if (stdout) { try { ausgabe = JSON.parse(stdout); } catch (_) { ausgabe = 'UNPARSEBAR'; } }
  return { status: r.status, stdout, ausgabe };
}

function runStempel(cwd, state, args) {
  const kindEnv = { ...process.env, NC_END_STATE_DIR: state };
  return spawnSync(process.execPath, [STEMPEL, ...args], { cwd, encoding: 'utf8', env: kindEnv });
}

/** Prueft die Block-Ausgabe und liefert den Grund. PreCompact blockt ueber TOP-LEVEL decision. */
function blockReason(ergebnis) {
  assert.notEqual(ergebnis.ausgabe, null, 'erwartet eine Block-Ausgabe');
  assert.notEqual(ergebnis.ausgabe, 'UNPARSEBAR', 'Ausgabe muss gueltiges JSON sein');
  assert.equal(ergebnis.ausgabe.decision, 'block',
    'PreCompact blockt ueber das top-level Feld decision, nicht ueber hookSpecificOutput');
  assert.equal(typeof ergebnis.ausgabe.reason, 'string');
  return ergebnis.ausgabe.reason;
}

test('Erste Kompaktierung ohne Abschluss-Stempel wird geblockt und nennt end-session + Stempel', () => {
  const grund = blockReason(runMahnung(fixture(), stateDir()));
  assert.match(grund, /\[Sitzungsabschluss\]/);
  assert.match(grund, /\/nc:end-session/);
  assert.match(grund, /nc-end-stempel\.js/);
  assert.match(grund, /--session test-session/);
});

test('Auch die automatische Kompaktierung wird beim ersten Mal gemahnt', () => {
  const grund = blockReason(runMahnung(fixture(), stateDir(), { trigger: 'auto' }));
  assert.match(grund, /\[Sitzungsabschluss\]/);
});

test('Fehlender trigger aendert nichts — gemahnt wird unabhaengig vom Ausloeser', () => {
  const stdin = JSON.stringify({ session_id: 'test-session', hook_event_name: 'PreCompact' });
  blockReason(runMahnung(fixture(), stateDir(), { stdin }));
});

test('Zweite Kompaktierung derselben Session laeuft durch (Loop-Schutz bei Auto-Compact)', () => {
  const dir = fixture(); const state = stateDir();
  blockReason(runMahnung(dir, state));                       // 1. Mal: Mahnung
  const zweite = runMahnung(dir, state);
  assert.equal(zweite.stdout, '', 'nach der Mahnung darf nie ein zweites Mal geblockt werden');
  const dritte = runMahnung(dir, state, { trigger: 'auto' });
  assert.equal(dritte.stdout, '', 'auch ein anderer Ausloeser darf nicht erneut blocken');
});

test('Verschiedene Sessions mahnen unabhaengig voneinander', () => {
  const dir = fixture(); const state = stateDir();
  blockReason(runMahnung(dir, state, { session: 'sitzung-a' }));
  assert.equal(runMahnung(dir, state, { session: 'sitzung-a' }).stdout, '');
  blockReason(runMahnung(dir, state, { session: 'sitzung-b' }));
});

test('Mit gesetztem Abschluss-Stempel wird gar nicht gemahnt', () => {
  const dir = fixture(); const state = stateDir();
  const s = runStempel(dir, state, ['--session', 'test-session']);
  assert.equal(s.status, 0, 'Stempel muss durchgehen: ' + s.stderr);
  assert.match(s.stdout, /Abschluss-Stempel gesetzt/);
  const r = runMahnung(dir, state);
  assert.equal(r.stdout, '', 'mit Abschluss-Stempel darf die Kompaktierung nicht geblockt werden');
});

test('Ohne --session wird der Abschluss-Stempel verweigert', () => {
  const s = runStempel(fixture(), stateDir(), []);
  assert.equal(s.status, 1);
  assert.match(s.stderr, /--session/);
});

test('Abschluss-Stempel verfaellt nach 30 Minuten Inaktivitaet', () => {
  const dir = fixture(); const state = stateDir();
  assert.equal(runStempel(dir, state, ['--session', 'test-session']).status, 0);
  const datei = path.join(state, 'end-test-session.json');
  assert.ok(fs.existsSync(datei), 'Stempel-Datei muss im State-Verzeichnis liegen');
  const alt = JSON.parse(fs.readFileSync(datei, 'utf8'));
  alt.last_active = Date.now() - 31 * 60 * 1000;
  fs.writeFileSync(datei, JSON.stringify(alt), 'utf8');
  blockReason(runMahnung(dir, state)); // verfallener Stempel zaehlt als nicht gestempelt
});

// ---------------------------------------------------------------------------------------
// Heartbeat (Onsite-Lehre 0.18.1, Codex-Retro-Fund): Der 30-Min-Verfall darf nur echte
// INAKTIVITAET bestrafen. Eine lange, aktive Sitzung darf weder ihren erledigten Abschluss
// verlieren (sonst wird sie erneut gemahnt, obwohl WP8 lief) noch ihren Loop-Schutz (sonst
// mahnt jede weitere Kompaktierung wieder). Muster und Schwelle wie in nc-start-gate.js.
// ---------------------------------------------------------------------------------------

/** Setzt last_active eines Markers zurueck — simuliert vergangene Zeit ohne Warten. */
function alterAuf(datei, minuten) {
  const marker = JSON.parse(fs.readFileSync(datei, 'utf8'));
  marker.last_active = Date.now() - minuten * 60 * 1000;
  fs.writeFileSync(datei, JSON.stringify(marker), 'utf8');
}

/** Wie alt ist last_active jetzt (in ms)? */
function alterVon(datei) {
  return Date.now() - Number(JSON.parse(fs.readFileSync(datei, 'utf8')).last_active);
}

test('Heartbeat: aktive Sitzung frischt den Abschluss-Stempel auf statt ihn verfallen zu lassen', () => {
  const dir = fixture(); const state = stateDir();
  assert.equal(runStempel(dir, state, ['--session', 'test-session']).status, 0);
  const datei = path.join(state, 'end-test-session.json');

  // 20 Minuten Sitzung, dann eine Kompaktierung: Stempel gueltig → kein Block …
  alterAuf(datei, 20);
  assert.equal(runMahnung(dir, state).stdout, '', 'gestempelte Sitzung darf nicht gemahnt werden');
  // … und das Verfallsfenster beginnt neu. Ohne Heartbeat bliebe last_active 20 Min alt und
  // die naechste Kompaktierung 20 Min spaeter faende einen verfallenen Stempel vor.
  assert.ok(alterVon(datei) < 60 * 1000, 'Heartbeat muss last_active des Stempels auffrischen');

  // Zweite Kompaktierung nach weiteren 20 Minuten: insgesamt > 30 Min Sitzung, trotzdem
  // gestempelt — genau der Fall, der vorher faelschlich erneut gemahnt wurde.
  alterAuf(datei, 20);
  assert.equal(runMahnung(dir, state).stdout, '',
    'aktive Sitzung jenseits des Verfallsfensters muss gestempelt bleiben');
});

test('Heartbeat: aktive Sitzung haelt den Loop-Schutz ueber das Verfallsfenster hinaus', () => {
  const dir = fixture(); const state = stateDir();
  blockReason(runMahnung(dir, state));                       // 1. Mal: Mahnung, Marker gesetzt
  const marker = path.join(state, 'mahnung-test-session.json');
  assert.ok(fs.existsSync(marker), 'Mahn-Marker muss geschrieben sein');

  alterAuf(marker, 20);
  assert.equal(runMahnung(dir, state).stdout, '', 'nach der Mahnung nie ein zweites Mal blocken');
  assert.ok(alterVon(marker) < 60 * 1000, 'Heartbeat muss last_active des Mahn-Markers auffrischen');

  alterAuf(marker, 20); // insgesamt > 30 Min aktive Sitzung
  assert.equal(runMahnung(dir, state).stdout, '',
    'Loop-Schutz muss auch in langen aktiven Sitzungen halten');
});

test('Inaktivitaet verfaellt weiter: Mahn-Marker aelter als 30 Minuten mahnt erneut', () => {
  const dir = fixture(); const state = stateDir();
  blockReason(runMahnung(dir, state));
  const marker = path.join(state, 'mahnung-test-session.json');
  alterAuf(marker, 31); // echte Pause — danach ist neue, wieder zu sichernde Arbeit passiert
  blockReason(runMahnung(dir, state));
});

test('Heartbeat schreibt nicht bei jedem Lauf (hoechstens einmal je Minute)', () => {
  const dir = fixture(); const state = stateDir();
  assert.equal(runStempel(dir, state, ['--session', 'test-session']).status, 0);
  const datei = path.join(state, 'end-test-session.json');
  const vorher = fs.readFileSync(datei, 'utf8');
  assert.equal(runMahnung(dir, state).stdout, '');
  assert.equal(fs.readFileSync(datei, 'utf8'), vorher,
    'frischer Marker darf nicht erneut geschrieben werden (kein Schreib-Sturm)');
});

test('Heartbeat laesst einen defekten Mahn-Marker unangetastet', () => {
  const dir = fixture(); const state = stateDir();
  fs.mkdirSync(state, { recursive: true });
  const marker = path.join(state, 'mahnung-test-session.json');
  fs.writeFileSync(marker, '{kaputt', 'utf8');
  assert.equal(runMahnung(dir, state).stdout, '', 'defekter Marker zaehlt als gemahnt');
  assert.equal(fs.readFileSync(marker, 'utf8'), '{kaputt',
    'ungelesener Inhalt wird nicht ueberschrieben — der Defekt bleibt sichtbar');
});

test('Subagenten sind vom Mahn-Gate ausgenommen', () => {
  const stdin = JSON.stringify({
    session_id: 'test-session', hook_event_name: 'PreCompact', trigger: 'manual',
    agent_type: 'reviewer'
  });
  const r = runMahnung(fixture(), stateDir(), { stdin });
  assert.equal(r.stdout, '');
});

test('NC_PRECOMPACT=off schaltet das Mahn-Gate ab', () => {
  for (const wert of ['off', '0', 'false', 'disabled', 'OFF']) {
    const r = runMahnung(fixture(), stateDir(), { env: { NC_PRECOMPACT: wert } });
    assert.equal(r.stdout, '', 'NC_PRECOMPACT=' + wert + ' muss abschalten');
  }
});

test('Fail-open: defekte Eingabe blockt nichts und crasht nicht', () => {
  const r = runMahnung(fixture(), stateDir(), { stdin: 'kein json' });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
});

test('Fail-open: defekter Stempel-State blockt die Kompaktierung nicht dauerhaft', () => {
  const dir = fixture(); const state = stateDir();
  fs.mkdirSync(state, { recursive: true });
  fs.writeFileSync(path.join(state, 'end-test-session.json'), '{kaputt', 'utf8');
  // Defekter Stempel zaehlt als nicht gestempelt → einmal mahnen ist korrekt …
  blockReason(runMahnung(dir, state));
  // … aber der defekte Mahn-Marker darf keine Dauer-Sackgasse erzeugen.
  fs.writeFileSync(path.join(state, 'mahnung-test-session.json'), '{kaputt', 'utf8');
  const r = runMahnung(dir, state);
  assert.equal(r.stdout, '', 'defekter Mahn-Marker darf nicht in eine zweite Blockade laufen');
});

test('Kein process.exit: der Hook beendet sich mit Code 0, auch wenn er blockt', () => {
  // POSIX-Pipe-Falle (Onsite-Debug-Log 2026-08-04): process.exit() nach stdout.write kann die
  // JSON-Ausgabe abschneiden. Zusaetzlich blockt PreCompact laut Doku auch bei Exit 2 —
  // dieser Hook blockt bewusst ausschliesslich ueber das JSON, nie ueber den Exit-Code.
  const r = runMahnung(fixture(), stateDir());
  assert.equal(r.status, 0, 'Blocken laeuft ueber das JSON, nicht ueber den Exit-Code');
  blockReason(r);
});

// Regressionstest analog zum Start-Gate-Fund vom 2026-08-10 (Onsite-Debug-Log): Stempel-Skript
// (Bash-Tool) und Hook laufen in Prozessen mit VERSCHIEDENEM CLAUDE_PLUGIN_DATA. Der State
// darf davon nicht abhaengen, sonst sieht die Mahnung den Stempel nie. Hier bewusst OHNE
// NC_END_STATE_DIR, damit die echte Fallback-Ableitung beider Seiten getestet wird — sie
// zeigt auf os.tmpdir()/nc-end-gate (nie auf ~/.claude), der Schluessel ist PID-eindeutig,
// und die beiden State-Dateien werden im finally wieder entfernt.
test('CLAUDE_PLUGIN_DATA beeinflusst den State-Ort nicht (Stempel- und Hook-Env divergieren)', () => {
  const dir = fixture();
  const session = 'test-endenvdivergenz-' + process.pid;
  const stempelEnv = { ...process.env, CLAUDE_PLUGIN_DATA: fixture() };
  delete stempelEnv.NC_END_STATE_DIR;
  delete stempelEnv.NC_PRECOMPACT;
  try {
    const s = spawnSync(process.execPath, [STEMPEL, '--session', session],
      { cwd: dir, encoding: 'utf8', env: stempelEnv });
    assert.equal(s.status, 0, 'Stempel muss durchgehen: ' + s.stderr);

    const hookEnv = { ...process.env, CLAUDE_PLUGIN_DATA: fixture() }; // anderes Verzeichnis
    delete hookEnv.NC_END_STATE_DIR;
    delete hookEnv.NC_PRECOMPACT;
    const eingabe = JSON.stringify({
      session_id: session, cwd: dir, hook_event_name: 'PreCompact', trigger: 'manual'
    });
    const r = spawnSync(process.execPath, [MAHNUNG], { cwd: dir, input: eingabe, encoding: 'utf8', env: hookEnv });
    assert.equal((r.stdout || '').trim(), '',
      'Mahnung muss den Stempel trotz divergierendem CLAUDE_PLUGIN_DATA sehen');
  } finally {
    fs.rmSync(path.join(os.tmpdir(), 'nc-end-gate', 'end-' + session + '.json'), { force: true });
    fs.rmSync(path.join(os.tmpdir(), 'nc-end-gate', 'mahnung-' + session + '.json'), { force: true });
  }
});
