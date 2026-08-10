// Tests fuer den Erzwingungs-Begleiter des Session-Start-Zwangs ("Start-Hook",
// plugins/nc/hooks/nc-start-gate.js + nc-start-stempel.js, Gate 2; Bauplan 2026-08-10
// „Onsite-Align-Umbau", AP2). Geprueft wird die Zangen-Mechanik: schreibende Aktionen sind
// vor dem Fakten-Stempel Sackgassen (Deny nennt den exakten Stempel-Befehl samt
// Session-Schluessel), Lesen und Read-only-Git bleiben frei, der Stempel verifiziert
// Branch/HEAD gegen die reale Git-Lage, Subagenten und Env-Opt-out sind ausgenommen,
// defekte Eingabe faellt offen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const GATE = path.join(HIER, '..', 'hooks', 'nc-start-gate.js');
const STEMPEL = path.join(HIER, '..', 'hooks', 'nc-start-stempel.js');

function fixture() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'nc-startgate-'));
}

/** Isoliertes State-Verzeichnis je Testfall — Sessions duerfen sich nie teilen. */
function stateDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'nc-startgate-state-'));
}

function runGate(cwd, state, { tool = 'Write', toolInput = { file_path: 'x.md' }, session = 'test-session', env = {}, stdin } = {}) {
  const eingabe = stdin !== undefined ? stdin : JSON.stringify({
    session_id: session, cwd, hook_event_name: 'PreToolUse',
    tool_name: tool, tool_input: toolInput
  });
  const kindEnv = { ...process.env, NC_START_GATE_STATE_DIR: state, ...env };
  delete kindEnv.CLAUDE_PROJECT_DIR;
  delete kindEnv.NC_START_GATE; // geerbtes Opt-out darf die Tests nicht aushebeln
  if (env.NC_START_GATE) kindEnv.NC_START_GATE = env.NC_START_GATE;
  const r = spawnSync(process.execPath, [GATE], { cwd, input: eingabe, encoding: 'utf8', env: kindEnv });
  const stdout = (r.stdout || '').trim();
  let ausgabe = null;
  if (stdout) { try { ausgabe = JSON.parse(stdout); } catch (_) { ausgabe = 'UNPARSEBAR'; } }
  return { status: r.status, stdout, ausgabe };
}

function runStempel(cwd, state, args, extraEnv = {}) {
  const kindEnv = { ...process.env, NC_START_GATE_STATE_DIR: state };
  // Ein geerbtes CLAUDE_PROJECT_DIR wuerde die Projekt-Aufloesung des Stempels aushebeln.
  delete kindEnv.CLAUDE_PROJECT_DIR;
  Object.assign(kindEnv, extraEnv);
  return spawnSync(process.execPath, [STEMPEL, ...args], { cwd, encoding: 'utf8', env: kindEnv });
}

function denyReason(ergebnis) {
  assert.notEqual(ergebnis.ausgabe, null, 'erwartet eine Deny-Ausgabe');
  assert.notEqual(ergebnis.ausgabe, 'UNPARSEBAR', 'Ausgabe muss gueltiges JSON sein');
  const h = ergebnis.ausgabe.hookSpecificOutput;
  assert.equal(h.permissionDecision, 'deny');
  return h.permissionDecisionReason;
}

/** Git-Repo-Fixture mit einem Commit; liefert { dir, branch, head }. */
function gitFixture() {
  const dir = fixture();
  const git = (args) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
  git(['init', '-q']);
  git(['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '--allow-empty', '-q', '-m', 'init']);
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
  const head = git(['rev-parse', 'HEAD']).stdout.trim();
  return { dir, branch, head };
}

test('Write vor dem Stempel: Deny nennt Stempel-Befehl und Session-Schluessel', () => {
  const grund = denyReason(runGate(fixture(), stateDir()));
  assert.match(grund, /\[Start-Gate\]/);
  assert.match(grund, /\/nc:start/);
  assert.match(grund, /nc-start-stempel\.js/);
  assert.match(grund, /--session test-session/);
});

test('Edit, MultiEdit und NotebookEdit werden vor dem Stempel ebenfalls abgelehnt', () => {
  for (const tool of ['Edit', 'MultiEdit', 'NotebookEdit']) {
    const grund = denyReason(runGate(fixture(), stateDir(), { tool }));
    assert.match(grund, /\[Start-Gate\]/, tool + ' muss gegated sein');
  }
});

test('Read-only-Git-Introspektion bleibt frei (sie IST der Pflicht-Einstieg)', () => {
  const state = stateDir();
  for (const command of ['git status', 'git log --oneline -10', 'git rev-parse --abbrev-ref HEAD', 'git rev-parse --short HEAD', 'git rev-parse HEAD']) {
    const r = runGate(fixture(), state, { tool: 'Bash', toolInput: { command } });
    assert.equal(r.stdout, '', command + ' darf nicht gegated werden');
  }
});

test('Beliebige andere Bash wird vor dem Stempel abgelehnt', () => {
  const grund = denyReason(runGate(fixture(), stateDir(), { tool: 'Bash', toolInput: { command: 'npm test' } }));
  assert.match(grund, /\[Start-Gate\]/);
});

test('Der Stempel-Befehl selbst bleibt frei — sonst kann das Gate nie oeffnen', () => {
  const command = 'node "' + STEMPEL + '" --session test-session';
  const r = runGate(fixture(), stateDir(), { tool: 'Bash', toolInput: { command } });
  assert.equal(r.stdout, '');
});

test('Ausserhalb eines Git-Baums stempelt --session allein; danach ist das Gate offen', () => {
  const dir = fixture(); const state = stateDir();
  const s = runStempel(dir, state, ['--session', 'test-session']);
  assert.equal(s.status, 0, 'Stempel muss ausserhalb von Git ohne branch/head durchgehen');
  assert.match(s.stdout, /Stempel gesetzt/);
  const r = runGate(dir, state);
  assert.equal(r.stdout, '', 'nach dem Stempel darf Write nicht mehr gegated sein');
});

test('Fakten-Stempel: falsche Branch/HEAD-Angaben werden verweigert, korrekte oeffnen', () => {
  const { dir, branch, head } = gitFixture(); const state = stateDir();
  const falsch = runStempel(dir, state, ['--session', 'test-session', '--branch', 'falsch', '--head', '1234567']);
  assert.equal(falsch.status, 1, 'falsche Fakten muessen den Stempel verweigern');
  assert.match(falsch.stderr, /verweigert/);
  denyReason(runGate(dir, state)); // Gate bleibt zu

  const richtig = runStempel(dir, state, ['--session', 'test-session', '--branch', branch, '--head', head.slice(0, 8)]);
  assert.equal(richtig.status, 0, 'korrekte Fakten muessen stempeln: ' + richtig.stderr);
  const r = runGate(dir, state);
  assert.equal(r.stdout, '', 'nach korrektem Stempel ist das Gate offen');
});

// --- Review-Haertungen (PR #10, Nachtrag N2) ------------------------------------------
// Die folgenden drei Faelle waren im Review REPRODUZIERTE Umgehungen. Sie stehen hier als
// Regressionstests, damit sie nicht stillschweigend zurueckkehren.

test('H1: Stempel aus einem Nicht-Git-Verzeichnis oeffnet das Gate NICHT fuer ein Git-Repo', () => {
  const { dir: repo } = gitFixture();      // echtes Repo — hier wird spaeter geschrieben
  const fremd = fixture();                 // Nicht-Git-Verzeichnis — von hier aus gestempelt
  const state = stateDir();

  const s = runStempel(fremd, state, ['--session', 'test-h1']);
  assert.equal(s.status, 0, 'ausserhalb von Git darf gestempelt werden: ' + s.stderr);
  assert.match(s.stdout, /nichts zu verifizieren/,
    'die Meldung muss offenlegen, dass NICHTS verifiziert wurde');

  // Genau das war die Luecke: derselbe Stempel oeffnete das echte Repo.
  const r = runGate(repo, state, { session: 'test-h1' });
  const grund = denyReason(r);
  assert.match(grund, /OHNE Git-Verifikation/,
    'im Git-Baum muss ein unverifizierter Stempel abgelehnt werden');

  // Ausserhalb eines Git-Baums bleibt der unverifizierte Stempel gueltig (legitimer Fall).
  assert.equal(runGate(fremd, state, { session: 'test-h1' }).stdout, '',
    'ohne Git-Baum gibt es nichts zu verifizieren — der Stempel muss dort gelten');
});

test('H1: der Stempel verifiziert gegen CLAUDE_PROJECT_DIR, nicht gegen das cwd', () => {
  const { dir: repo, branch, head } = gitFixture();
  const fremd = fixture();
  const state = stateDir();

  // Aus dem fremden Verzeichnis, aber mit gesetztem Projektverzeichnis: die Fakten des
  // ECHTEN Repos muessen stimmen — falsche werden abgelehnt, richtige akzeptiert.
  const falsch = runStempel(fremd, state, ['--session', 'test-h1b', '--branch', 'falsch', '--head', '1234567'],
    { CLAUDE_PROJECT_DIR: repo });
  assert.equal(falsch.status, 1, 'falsche Fakten des Projekt-Repos muessen verweigert werden');

  const richtig = runStempel(fremd, state, ['--session', 'test-h1b', '--branch', branch, '--head', head.slice(0, 8)],
    { CLAUDE_PROJECT_DIR: repo });
  assert.equal(richtig.status, 0, 'korrekte Fakten muessen stempeln: ' + richtig.stderr);
  assert.equal(runGate(repo, state, { session: 'test-h1b' }).stdout, '',
    'nach verifiziertem Stempel ist das Gate offen');
});

test('M1: der Stempel-Durchlass matcht nur eine echte Invokation DIESES Skripts', () => {
  const state = stateDir();
  const echt = 'node "' + STEMPEL + '" --session test-session';
  // Gleicher Dateiname, anderer Pfad — darf NICHT als Stempel gelten.
  const fremdesSkript = path.join(fixture(), 'my-nc-start-stempel.js');

  // Muss durch: die echte Invokation, in allen legitimen Schreibweisen.
  for (const command of [
    echt,
    '"' + process.execPath + '" "' + STEMPEL + '" --session test-session',
    '  node   "' + STEMPEL + '"   --session test-session'
  ]) {
    assert.equal(runGate(fixture(), state, { tool: 'Bash', toolInput: { command } }).stdout, '',
      'legitime Stempel-Invokation muss durch: ' + command);
  }

  // Darf NICHT durch: Namensnennung, angehaengte Zweitaktion, Zeilenumbruch, Fremdskript.
  for (const command of [
    'echo pwned > /tmp/x.txt   # nc-start-stempel.js',
    'rm -rf /tmp/x # nc-start-stempel.js',
    'echo nc-start-stempel.js && npm publish',
    echt + ' ; echo pwned > /tmp/x.txt',
    echt + ' && rm -rf /tmp/x',
    echt + ' > /tmp/beute.txt',
    // Zeilenumbruch als Kommandotrenner (Review-Runde 2): die zweite Zeile darf beliebiger
    // Code sein und braucht keines der sonst verbotenen Zeichen.
    echt + '\necho pwned-via-newline',
    echt + '\r\nnode -e "process.exit(0)"',
    // Fremdes Skript mit passendem Namenssuffix (Review-Runde 2).
    'node "' + fremdesSkript + '" --session test-session',
    'node "' + path.join(fixture(), 'nc-start-stempel.js') + '" --session test-session',
    // Fremder INTERPRETER auf dem echten Stempelpfad (Review-Runde 3): frueher genuegte
    // es, dass der gequotete Pfad "node" enthielt — in jedem Repo mit node_modules
    // erfuellt das jede Datei in node_modules/.bin.
    '"' + path.join(fixture(), 'node_modules', '.bin', 'rimraf.cmd') + '" "' + STEMPEL + '" --session s',
    '"' + path.join(fixture(), 'nodejs-wrapper.bat') + '" "' + STEMPEL + '" --session s',
    '"' + path.join(fixture(), 'evilnode') + '" "' + STEMPEL + '" --session s',
    '"' + path.join(fixture(), 'evilnode.exe') + '" "' + STEMPEL + '" --session s',
    // Flags zwischen Interpreter und Skript sind keine legitime Aufrufform und koennten
    // fremden Code vorladen.
    'node --require=./evil.js "' + STEMPEL + '" --session s'
  ]) {
    const r = runGate(fixture(), state, { tool: 'Bash', toolInput: { command } });
    assert.notEqual(r.stdout, '', 'muss gegated werden: ' + JSON.stringify(command));
  }
});

test('Ohne --session wird der Stempel verweigert', () => {
  const s = runStempel(fixture(), stateDir(), []);
  assert.equal(s.status, 1);
  assert.match(s.stderr, /--session/);
});

test('Subagenten sind vom Start-Gate ausgenommen', () => {
  const dir = fixture();
  const stdin = JSON.stringify({
    session_id: 'test-session', cwd: dir, hook_event_name: 'PreToolUse',
    tool_name: 'Write', tool_input: { file_path: 'x.md' }, agent_type: 'reviewer'
  });
  const r = runGate(dir, stateDir(), { stdin });
  assert.equal(r.stdout, '');
});

test('NC_START_GATE=off schaltet das Gate ab (ein Schalter fuer beide Gate-2-Teile)', () => {
  for (const wert of ['off', '0', 'false', 'disabled', 'OFF']) {
    const r = runGate(fixture(), stateDir(), { env: { NC_START_GATE: wert } });
    assert.equal(r.stdout, '', 'NC_START_GATE=' + wert + ' muss abschalten');
  }
});

test('Lesende Werkzeuge matchen nicht (Lesen und Fragen bleiben frei)', () => {
  for (const tool of ['Read', 'Glob', 'Grep', 'WebFetch']) {
    const r = runGate(fixture(), stateDir(), { tool, toolInput: {} });
    assert.equal(r.stdout, '', tool + ' darf nie gegated werden');
  }
});

test('Fail-open: defekte Eingabe blockt nichts und crasht nicht', () => {
  const r = runGate(fixture(), stateDir(), { stdin: 'kein json' });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
});

// Regressionstest zur Onsite-Lesson 0.11.1: Stempel-Skript und Gate-Hook laufen in
// Prozessen mit VERSCHIEDENEM CLAUDE_PLUGIN_DATA (Bash-Tool vs. Hook-Env) — vor dem Fix
// landete der Stempel im fremden Verzeichnis und das Gate blieb trotz Erfolgsmeldung
// dauerhaft zu. Hier bewusst OHNE NC_START_GATE_STATE_DIR, damit die echte
// Fallback-Ableitung beider Seiten getestet wird.
test('CLAUDE_PLUGIN_DATA beeinflusst den State-Ort nicht (Stempel- und Gate-Env divergieren)', () => {
  const dir = fixture();
  const session = 'test-envdivergenz-' + process.pid;
  const stempelEnv = { ...process.env, CLAUDE_PLUGIN_DATA: fixture() };
  delete stempelEnv.NC_START_GATE_STATE_DIR;
  delete stempelEnv.NC_START_GATE;
  try {
    const s = spawnSync(process.execPath, [STEMPEL, '--session', session],
      { cwd: dir, encoding: 'utf8', env: stempelEnv });
    assert.equal(s.status, 0, 'Stempel muss durchgehen: ' + s.stderr);

    const gateEnv = { ...process.env, CLAUDE_PLUGIN_DATA: fixture() }; // anderes Verzeichnis als beim Stempel
    delete gateEnv.NC_START_GATE_STATE_DIR;
    delete gateEnv.NC_START_GATE;
    const eingabe = JSON.stringify({
      session_id: session, cwd: dir, hook_event_name: 'PreToolUse',
      tool_name: 'Write', tool_input: { file_path: 'x.md' }
    });
    const r = spawnSync(process.execPath, [GATE], { cwd: dir, input: eingabe, encoding: 'utf8', env: gateEnv });
    assert.equal((r.stdout || '').trim(), '',
      'Gate muss den Stempel trotz divergierendem CLAUDE_PLUGIN_DATA sehen');
  } finally {
    fs.rmSync(path.join(os.tmpdir(), 'nc-start-gate', 'start-' + session + '.json'), { force: true });
  }
});
