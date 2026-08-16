// Tests fuer die Queue-Flow-Faelligkeits-Erinnerung
// (plugins/nc/hooks/nc-queue-faelligkeit.js — Bauplan 2026-08-15, AP-E3).
// Port von Onsite.ai-OS origin/main@5c2c210 `oai-queue-faelligkeit.test.mjs`, gemappt auf
// NovaCore: Takt 14 Tage statt 7 (N6), NC-Registry-Schema (`abteilungen`-Liste +
// `abteilungsRepoPfade`-Map statt Onsite-Einzelfeldern), Envs NC_QUEUE_*, Pfade
// `knowledge-base/kandidaten-queue/`. Drei NC-eigene Zusatzproben: die 14-Tage-Schwelle
// (10 Tage — bei Onsite faellig — muss hier schweigen), der Erinnerungstext (nennt den
// 14-Tage-Takt, nie den Wochentakt) und der heutige Uebergangszustand (Registry ohne
// `abteilungsRepoPfade` → schweigen, E1).
//
// Geprueft wird beides: dass der Hook erinnert, WENN etwas faellig ist (nicht eingereichte
// Wissensbasis-Arbeit bzw. offene Zeilen der GEMERGTEN Queue, jeweils nach vierzehn Tagen,
// queue-kern zusaetzlich mit einem Tag Versatz) — und vor allem, dass er sonst SCHWEIGT.
// Die Negativproben sind der eigentliche Kern: ein Hinweis, der in jeder Sitzung erscheint,
// wird abgeschaltet und ist dann wertlos.
//
// ABGRENZUNG: Das ist KEIN Gate. Der Hook blockiert nie — SessionStart kann laut Doku
// ohnehin nicht blocken (vom Vorbild verifiziert 2026-08-14). Es gibt daher keinen einzigen
// Test, der eine Blockade erwartet; geprueft wird Ausgabe vs. Schweigen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const HOOK = path.join(HIER, '..', 'hooks', 'nc-queue-faelligkeit.js');
const QUEUE_REL = 'knowledge-base/kandidaten-queue/queue.md';
const TAG_MS = 24 * 60 * 60 * 1000;

const GIT_DA = spawnSync('git', ['--version'], { encoding: 'utf8' }).status === 0;

function tmp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

// --- Fixtures --------------------------------------------------------------------------

function gitIn(dir, args) {
  const r = spawnSync('git', args, { cwd: dir, encoding: 'utf8' });
  if (r.status !== 0) throw new Error('git ' + args.join(' ') + ' -> ' + (r.stderr || r.stdout));
  return r.stdout;
}

function queueDatei(klon, zeilen) {
  const datei = path.join(klon, ...QUEUE_REL.split('/'));
  fs.mkdirSync(path.dirname(datei), { recursive: true });
  fs.writeFileSync(datei,
    '# Kandidaten-Queue test — append-only\n\n'
    + '> Kandidaten für die Kern-SSOT.\n\n'
    + '| Datum | Einzeiler | Verweis | erfülltes Kriterium | Status |\n'
    + '|---|---|---|---|---|\n'
    + '| 2026-08-11 | Beispielzeile beim Anlegen entfernen | Pfad oder Ticket | a | offen |\n'
    + zeilen.map(z => z + '\n').join(''), 'utf8');
  return datei;
}

/**
 * Abteilungs-Klon mit lokalem Bare-Remote (kein Netz). Der Erstcommit wird gepusht und
 * origin/HEAD gesetzt — erst dadurch gibt es einen "gemergten" Stand, gegen den der Hook
 * lesen kann. `zeilen` landen im gepushten Stand.
 *
 * Optionen:
 *   `branch`    — Name des Standardbranches (Vorgabe `main`).
 *   `setHead`   — `false` laesst origin/HEAD ungesetzt; dann muss der Hook den Ref ueber
 *                 die Kandidatennamen suchen (der teuerste Pfad, siehe Git-Zaehltest).
 *   `dateien`   — zusaetzliche Dateien `{ relPfad: Inhalt }`, mitgepusht (fuer abweichende
 *                 Queue-Pfade aus der Pflege-Auspraegung).
 */
function macheKlon(zeilen = [], { branch = 'main', setHead = true, dateien = {} } = {}) {
  const bare = tmp('nc-queue-remote-');
  gitIn(bare, ['init', '--bare', '--quiet']);
  const klon = tmp('nc-queue-klon-');
  gitIn(klon, ['init', '--quiet']);
  gitIn(klon, ['symbolic-ref', 'HEAD', 'refs/heads/' + branch]);
  gitIn(klon, ['config', 'user.email', 'test@example.invalid']);
  gitIn(klon, ['config', 'user.name', 'Testlauf']);
  gitIn(klon, ['config', 'commit.gpgsign', 'false']);
  queueDatei(klon, zeilen);
  for (const [rel, inhalt] of Object.entries(dateien)) {
    const ziel = path.join(klon, ...rel.split('/'));
    fs.mkdirSync(path.dirname(ziel), { recursive: true });
    fs.writeFileSync(ziel, inhalt, 'utf8');
  }
  gitIn(klon, ['add', '-A']);
  gitIn(klon, ['commit', '-q', '-m', 'init']);
  gitIn(klon, ['remote', 'add', 'origin', bare]);
  gitIn(klon, ['push', '-q', '-u', 'origin', branch]);
  if (setHead) gitIn(klon, ['remote', 'set-head', 'origin', branch]);
  return klon;
}

/**
 * State-Verzeichnis mit Infra-Registry (Ersatz fuer ~/.claude/nc) — NC-Schema v1
 * (infra-registry.md): `abteilungen` als Liste, Klon-Pfade in der optionalen Map
 * `abteilungsRepoPfade` (Abweichung vom Onsite-Einzelfeld, im Hook-Portkopf dokumentiert).
 */
function macheState(klon, extra = {}) {
  const dir = tmp('nc-queue-state-');
  fs.writeFileSync(path.join(dir, 'infra.json'), JSON.stringify(Object.assign({
    schemaVersion: 1,
    abteilungen: ['development'],
    szenario: 'test',
    abteilungsRepoPfade: { development: klon }
  }, extra), null, 2), 'utf8');
  return dir;
}

function setzeLaeufe(state, laeufe) {
  fs.writeFileSync(path.join(state, 'queue-lauf.json'), JSON.stringify(laeufe, null, 2), 'utf8');
}

// --- Hook-Lauf -------------------------------------------------------------------------

/**
 * Git im Kindprozess unauffindbar machen (Onsite-Regressionsproben M5/H5): PATH auf ein
 * leeres Verzeichnis, PATHEXT geleert. Beides ist noetig — Windows haengt sonst .EXE/.CMD
 * an und sucht auch neben dem Prozess. Auf Windows heisst die Variable je nach Herkunft
 * `Path` oder `PATH`; eine Kopie von process.env kann beide Schreibweisen tragen, deshalb
 * wird case-insensitiv entfernt und genau eine gesetzt.
 */
function ohneGit(kindEnv) {
  for (const k of Object.keys(kindEnv)) {
    if (/^path$/i.test(k) || /^pathext$/i.test(k)) delete kindEnv[k];
  }
  kindEnv.PATH = tmp('nc-queue-kein-git-');
  kindEnv.PATHEXT = '';
  return kindEnv;
}

function hookEnv(state, { sessionDir, env = {}, keinGit = false } = {}) {
  const kindEnv = { ...process.env };
  // Geerbte OS-Variablen duerfen die Tests nie beeinflussen (Opt-out, echte Registry,
  // echter Plugin-Cache) — der Hook laeuft hier vollstaendig isoliert.
  for (const k of ['NC_QUEUE_CHECK', 'NC_QUEUE_STATE_DIR', 'NC_QUEUE_SESSION_DIR',
    'NC_QUEUE_PFAD', 'CLAUDE_PLUGIN_ROOT', 'CLAUDE_PROJECT_DIR', 'CLAUDE_SESSION_ID',
    'GIT_TRACE']) {
    delete kindEnv[k];
  }
  kindEnv.NC_QUEUE_STATE_DIR = state;
  kindEnv.NC_QUEUE_SESSION_DIR = sessionDir || tmp('nc-queue-sess-');
  Object.assign(kindEnv, env);
  return keinGit ? ohneGit(kindEnv) : kindEnv;
}

function hookEingabe(state, session, stdin) {
  return stdin !== undefined ? stdin : JSON.stringify({
    session_id: session, cwd: state, hook_event_name: 'SessionStart', source: 'startup'
  });
}

function ergebnis(status, stdout, stderr, dauer) {
  const roh = (stdout || '').trim();
  let ausgabe = null;
  if (roh) { try { ausgabe = JSON.parse(roh); } catch (_) { ausgabe = 'UNPARSEBAR'; } }
  return { status, stdout: roh, stderr: stderr || '', ausgabe, dauer };
}

function runHook(state, opt = {}) {
  const { session = 'test-session', stdin } = opt;
  const kindEnv = hookEnv(state, opt);
  const begonnen = Date.now();
  const r = spawnSync(process.execPath, [HOOK],
    { input: hookEingabe(state, session, stdin), encoding: 'utf8', env: kindEnv, cwd: state });
  return ergebnis(r.status, r.stdout, r.stderr, Date.now() - begonnen);
}

/** Nebenlaeufige Variante: liefert ein Promise, damit zwei Laeufe sich echt ueberlappen. */
function startHook(state, opt = {}) {
  const { session = 'test-session', stdin } = opt;
  const kindEnv = hookEnv(state, opt);
  const kind = spawn(process.execPath, [HOOK], { env: kindEnv, cwd: state, stdio: ['pipe', 'pipe', 'pipe'] });
  return sammle(kind, hookEingabe(state, session, stdin));
}

function runCli(state, args) {
  const kindEnv = { ...process.env, NC_QUEUE_STATE_DIR: state };
  delete kindEnv.NC_QUEUE_CHECK;
  return spawnSync(process.execPath, [HOOK, ...args], { encoding: 'utf8', env: kindEnv, cwd: state });
}

/** Nebenlaeufiger CLI-Lauf (Lauf-Marker) — fuer die echten Parallelitaets-Proben. */
function startCli(state, args) {
  const kindEnv = { ...process.env, NC_QUEUE_STATE_DIR: state };
  delete kindEnv.NC_QUEUE_CHECK;
  const kind = spawn(process.execPath, [HOOK, ...args],
    { env: kindEnv, cwd: state, stdio: ['ignore', 'pipe', 'pipe'] });
  return sammle(kind, null);
}

function sammle(kind, eingabe) {
  return new Promise(fertig => {
    let out = ''; let err = '';
    const begonnen = Date.now();
    kind.stdout.on('data', d => { out += d; });
    kind.stderr.on('data', d => { err += d; });
    kind.on('close', status => fertig(ergebnis(status, out, err, Date.now() - begonnen)));
    if (eingabe !== null && kind.stdin) { kind.stdin.end(eingabe); }
  });
}

/** Prueft die Ausgabeform und liefert den injizierten Text. */
function kontext(ergebnis) {
  assert.notEqual(ergebnis.ausgabe, null, 'erwartet eine Erinnerung');
  assert.notEqual(ergebnis.ausgabe, 'UNPARSEBAR', 'Ausgabe muss gueltiges JSON sein');
  const spez = ergebnis.ausgabe.hookSpecificOutput;
  assert.equal(spez.hookEventName, 'SessionStart');
  assert.equal(typeof spez.additionalContext, 'string');
  assert.equal(ergebnis.ausgabe.decision, undefined, 'der Hook darf nie eine Entscheidung faellen');
  return spez.additionalContext;
}

const OFFENE_ZEILE = '| 2026-08-14 | Firmenrelevanter Fund | pfad.md | a | offen |';
const BEFOERDERTE_ZEILE = '| 2026-08-01 | Schon oben angekommen | pfad.md | c | befördert (PR #7) |';

// =======================================================================================
// Positivfaelle
// =======================================================================================

test('queue-abteilung wird faellig bei ungesicherter Wissensbasis-Arbeit', { skip: !GIT_DA }, () => {
  const klon = macheKlon([BEFOERDERTE_ZEILE]);
  fs.writeFileSync(path.join(klon, 'knowledge-base', 'neu.md'), 'Arbeit\n', 'utf8');
  const text = kontext(runHook(macheState(klon)));
  assert.match(text, /\/nc:queue-abteilung/);
  assert.match(text, /ungesicherte Datei/);
  assert.equal(/\/nc:queue-kern/.test(text), false, 'ohne offene Queue-Zeilen kein queue-kern');
});

test('queue-abteilung wird faellig bei nicht eingereichten Commits', { skip: !GIT_DA }, () => {
  const klon = macheKlon([BEFOERDERTE_ZEILE]);
  fs.writeFileSync(path.join(klon, 'knowledge-base', 'neu.md'), 'Arbeit\n', 'utf8');
  gitIn(klon, ['add', '-A']);
  gitIn(klon, ['commit', '-q', '-m', 'ssot']);
  const text = kontext(runHook(macheState(klon)));
  assert.match(text, /nicht eingereichte\(r\) Commit\(s\)/);
});

test('queue-kern wird faellig bei offenen Zeilen der gemergten Queue', { skip: !GIT_DA }, () => {
  const klon = macheKlon([OFFENE_ZEILE, BEFOERDERTE_ZEILE]);
  const text = kontext(runHook(macheState(klon)));
  assert.match(text, /\/nc:queue-kern/);
  assert.match(text, /1 offene Zeile\(n\)/);
  assert.equal(/\/nc:queue-abteilung/.test(text), false, 'sauberer Klon → keine Abteilungs-Faelligkeit');
});

test('Beide Faelligkeiten erscheinen in EINEM Hinweis', { skip: !GIT_DA }, () => {
  const klon = macheKlon([OFFENE_ZEILE]);
  fs.writeFileSync(path.join(klon, 'knowledge-base', 'neu.md'), 'Arbeit\n', 'utf8');
  const text = kontext(runHook(macheState(klon)));
  assert.match(text, /\/nc:queue-abteilung/);
  assert.match(text, /\/nc:queue-kern/);
  assert.match(text, /Merge, Review-Resolves und alles Kundensichtbare bleiben Mensch/);
});

test('Der Hinweis nennt den Lauf-Marker-Befehl, sonst erinnert er ewig', { skip: !GIT_DA }, () => {
  const klon = macheKlon([OFFENE_ZEILE]);
  const text = kontext(runHook(macheState(klon)));
  assert.match(text, /--lauf queue-kern/);
  assert.match(text, /nc-queue-faelligkeit\.js/);
});

test('Der Hinweis nennt den 14-Tage-Takt, nicht den Onsite-Wochentakt (N6)', { skip: !GIT_DA }, () => {
  const klon = macheKlon([OFFENE_ZEILE]);
  const text = kontext(runHook(macheState(klon)));
  assert.match(text, /14-Tage-Takt/);
  assert.equal(/Wochentakt|sieben Tage/.test(text), false,
    'der Erinnerungstext darf keinen Wochen-Takt behaupten (Firmenspezifikation N6)');
});

test('NC_QUEUE_PFAD lenkt den Queue-Pfad um', { skip: !GIT_DA }, () => {
  const klon = macheKlon([]);
  const anders = path.join(klon, 'knowledge-base', 'anders.md');
  fs.writeFileSync(anders, '| 2026-08-14 | X | y.md | a | offen |\n', 'utf8');
  gitIn(klon, ['add', '-A']);
  gitIn(klon, ['commit', '-q', '-m', 'zweite queue']);
  gitIn(klon, ['push', '-q', 'origin', 'main']);
  const text = kontext(runHook(macheState(klon), {
    env: { NC_QUEUE_PFAD: 'knowledge-base/anders.md' }
  }));
  assert.match(text, /\/nc:queue-kern/);
});

// =======================================================================================
// Negativproben — Schweigen ist der Normalfall
// =======================================================================================

test('NEGATIV: sauberer Klon ohne offene Zeilen schweigt', { skip: !GIT_DA }, () => {
  const klon = macheKlon([BEFOERDERTE_ZEILE]);
  const r = runHook(macheState(klon));
  assert.equal(r.stdout, '', 'ohne Faelligkeit darf nichts injiziert werden');
  assert.equal(r.status, 0);
});

test('NEGATIV: die Vorlagen-Beispielzeile zaehlt nicht als offene Zeile', { skip: !GIT_DA }, () => {
  // macheKlon schreibt die Beispielzeile der Vorlage IMMER mit — sie steht auf "offen".
  // Zaehlte sie mit, waere jede frisch angelegte Queue sofort faellig.
  assert.equal(runHook(macheState(macheKlon([]))).stdout, '');
});

test('NEGATIV: ein unbekannter Statuswert wie "offen-alt" zaehlt nicht als offen',
  { skip: !GIT_DA }, () => {
    // NC-Verschaerfung gegenueber dem Vorbild-startsWith (Codex-Review-Befund 2026-08-16):
    // Format v1 kennt genau drei Statuswerte; ein Praefix-Treffer wie "offen-alt" oder
    // "offen (wartet)" ist ein unbekannter Wert und darf keine Erinnerung ausloesen.
    const klon = macheKlon([
      '| 2026-08-10 | Praefix-Treffer eins | pfad.md | a | offen-alt |',
      '| 2026-08-11 | Praefix-Treffer zwei | pfad.md | a | offen (wartet) |'
    ]);
    const r = runHook(macheState(klon));
    assert.equal(r.stdout, '', 'unbekannte Statuswerte duerfen keine Faelligkeit ausloesen');
    assert.equal(r.status, 0);
  });

test('NEGATIV: Arbeit ausserhalb der Wissensbasis macht nicht faellig', { skip: !GIT_DA }, () => {
  const klon = macheKlon([]);
  fs.writeFileSync(path.join(klon, 'fremd.txt'), 'kein SSOT\n', 'utf8');
  assert.equal(runHook(macheState(klon)).stdout, '');
});

test('NEGATIV: nur lokal angehaengte Queue-Zeilen machen queue-kern nicht faellig', { skip: !GIT_DA }, () => {
  // queue-kern liest den GEMERGTEN Stand. Frisch angehaengte Zeilen des laufenden Zyklus
  // gehoeren noch in den Abteilungs-PR — sonst waere der Tag Versatz sinnlos.
  const klon = macheKlon([]);
  fs.appendFileSync(path.join(klon, ...QUEUE_REL.split('/')), OFFENE_ZEILE + '\n', 'utf8');
  const text = kontext(runHook(macheState(klon)));
  assert.match(text, /\/nc:queue-abteilung/, 'die ungesicherte Zeile ist Abteilungs-Arbeit');
  assert.equal(/\/nc:queue-kern/.test(text), false, 'ungemergte Zeilen zaehlen fuer queue-kern nicht');
});

test('NEGATIV: Lauf juenger als vierzehn Tage schweigt', { skip: !GIT_DA }, () => {
  const klon = macheKlon([OFFENE_ZEILE]);
  fs.writeFileSync(path.join(klon, 'knowledge-base', 'neu.md'), 'Arbeit\n', 'utf8');
  const state = macheState(klon);
  setzeLaeufe(state, { 'queue-abteilung': Date.now() - 2 * TAG_MS, 'queue-kern': Date.now() - 2 * TAG_MS });
  assert.equal(runHook(state).stdout, '', 'innerhalb des 14-Tage-Takts wird nicht erinnert');
});

test('NEGATIV: 10 Tage sind KEINE Faelligkeit — die Schwelle ist 14 Tage, nicht 7 (N6)',
  { skip: !GIT_DA }, () => {
    // Gegenprobe der Firmen-Anpassung: Beim Onsite-Vorbild (7-Tage-Takt) waere dieser
    // Aufbau laengst faellig. Erinnert der Hook hier, traegt er noch den Vorbild-Takt.
    const klon = macheKlon([OFFENE_ZEILE]);
    fs.writeFileSync(path.join(klon, 'knowledge-base', 'neu.md'), 'Arbeit\n', 'utf8');
    const state = macheState(klon);
    setzeLaeufe(state, { 'queue-abteilung': Date.now() - 10 * TAG_MS, 'queue-kern': Date.now() - 10 * TAG_MS });
    assert.equal(runHook(state).stdout, '',
      'zehn Tage liegen innerhalb des 14-Tage-Takts — eine Erinnerung waere der Onsite-Wochentakt');
  });

test('Lauf aelter als vierzehn Tage erinnert wieder', { skip: !GIT_DA }, () => {
  const klon = macheKlon([OFFENE_ZEILE]);
  const state = macheState(klon);
  setzeLaeufe(state, { 'queue-abteilung': Date.now() - 30 * TAG_MS, 'queue-kern': Date.now() - 15 * TAG_MS });
  const text = kontext(runHook(state));
  assert.match(text, /\/nc:queue-kern/);
  assert.match(text, /letzter Lauf vor 15 Tag\(en\)/);
});

test('NEGATIV: Versatz — frisch gelaufenes queue-abteilung laesst queue-kern warten', { skip: !GIT_DA }, () => {
  const klon = macheKlon([OFFENE_ZEILE]);
  const state = macheState(klon);
  setzeLaeufe(state, { 'queue-abteilung': Date.now() - 2 * 60 * 60 * 1000 }); // vor 2 Stunden
  assert.equal(runHook(state).stdout, '',
    'am Tag des Abteilungs-Laufs ist der gemergte Stand noch nicht nachgezogen (Versatz-Regel)');
});

test('NEGATIV: fehlende Registry schweigt (fail-open, Setup lief nie)', { skip: !GIT_DA }, () => {
  const klon = macheKlon([OFFENE_ZEILE]);
  fs.writeFileSync(path.join(klon, 'knowledge-base', 'neu.md'), 'Arbeit\n', 'utf8');
  const leer = tmp('nc-queue-ohne-registry-');
  const r = runHook(leer);
  assert.equal(r.stdout, '', 'ohne Infra-Registry gibt es keine Repo-Pfade — und keinen Hinweis');
  assert.equal(r.status, 0);
});

test('NEGATIV: kaputte Registry schweigt', { skip: !GIT_DA }, () => {
  const state = macheState(macheKlon([OFFENE_ZEILE]));
  fs.writeFileSync(path.join(state, 'infra.json'), '{kaputt', 'utf8');
  const r = runHook(state);
  assert.equal(r.stdout, '', 'unbekannte Lage → schweigen, nicht raten');
  assert.equal(r.status, 0);
});

test('NEGATIV: Registry ohne abteilungsRepoPfade schweigt (heutiger Uebergangszustand, E1)',
  { skip: !GIT_DA }, () => {
    // Das ist der reale NC-Ist-Zustand: nc-development ist repo-intern, es existiert kein
    // Abteilungs-Satellit. Die Uebergangs-Queue liegt im OS-Repo; der Hook hat dort nichts
    // zu erinnern und darf vor allem nicht raten.
    const klon = macheKlon([OFFENE_ZEILE]);
    const state = tmp('nc-queue-state-');
    fs.writeFileSync(path.join(state, 'infra.json'), JSON.stringify({
      schemaVersion: 1, abteilungen: ['development'], szenario: 'test',
      ssotAblage: klon
    }, null, 2), 'utf8');
    const r = runHook(state);
    assert.equal(r.stdout, '', 'ohne Satelliten-Klonpfad gibt es keinen Queue-Flow-Lauf zu erinnern');
    assert.equal(r.status, 0);
  });

test('Kaputter Lauf-Marker behauptet keine Faelligkeit, meldet sich aber sichtbar (M3)',
  { skip: !GIT_DA }, () => {
    // Sitzungs-fail-open, aber nicht lebendigkeits-fail-open: Ein kaputter Marker kann die
    // Takt-Erinnerung fuer immer abschalten, ohne dass es je jemand bemerkt. Richtig ist
    // beides zusammen — keine geratene Faelligkeit UND eine einmalige, sichtbare Diagnose
    // mit Reparaturweg.
    const state = macheState(macheKlon([OFFENE_ZEILE]));
    const sessionDir = tmp('nc-queue-sess-');
    fs.writeFileSync(path.join(state, 'queue-lauf.json'), '{kaputt', 'utf8');

    const r = runHook(state, { sessionDir });
    assert.equal(r.stdout, '', 'ohne verlaesslichen Lauf-Stand wird keine Faelligkeit behauptet');
    assert.match(r.stderr, /unlesbar/, 'der Defekt muss sichtbar werden, nicht still bleiben');
    assert.match(r.stderr, /queue-lauf\.json/, 'die Meldung nennt die betroffene Datei');
    assert.match(r.stderr, /--lauf/, 'die Meldung nennt einen Reparaturweg');
    assert.equal(r.status, 2,
      'SessionStart kann nicht blocken; Exit 2 ist laut Doku der Weg, stderr zu zeigen');

    // Einmal je Sitzung — eine Diagnose in JEDEM Session-Start (startup, resume, compact …)
    // waere genau das Rauschen, das zum Abschalten erzieht.
    const zweite = runHook(state, { sessionDir });
    assert.equal(zweite.stderr, '', 'die Diagnose wiederholt sich innerhalb der Sitzung nicht');
    assert.equal(zweite.status, 0);
    assert.equal(zweite.stdout, '');

    // Andere Sitzung: der Defekt besteht weiter und wird dort erneut gemeldet.
    const andere = runHook(state, { sessionDir, session: 'zweite-sitzung' });
    assert.match(andere.stderr, /unlesbar/, 'eine neue Sitzung erfaehrt den Defekt ebenfalls');
  });

test('NEGATIV: kaputter Sitzungsmarker schweigt', { skip: !GIT_DA }, () => {
  const state = macheState(macheKlon([OFFENE_ZEILE]));
  const sessionDir = tmp('nc-queue-sess-');
  fs.writeFileSync(path.join(sessionDir, 'queue-test-session.json'), '{kaputt', 'utf8');
  const r = runHook(state, { sessionDir });
  assert.equal(r.stdout, '', 'defekter Marker zaehlt als schon erinnert — nie Dauer-Rauschen');
  assert.equal(fs.readFileSync(path.join(sessionDir, 'queue-test-session.json'), 'utf8'), '{kaputt',
    'ungelesener Inhalt wird nicht ueberschrieben');
});

test('NEGATIV: abteilungsRepoPfade "ausstehend" schweigt', { skip: !GIT_DA }, () => {
  const state = macheState(macheKlon([OFFENE_ZEILE]),
    { abteilungsRepoPfade: { development: 'ausstehend' } });
  assert.equal(runHook(state).stdout, '', 'Abteilung ohne Satelliten hat keinen Zyklus-PR');
});

test('NEGATIV: toter Registry-Pfad schweigt', { skip: !GIT_DA }, () => {
  const state = macheState(macheKlon([OFFENE_ZEILE]),
    { abteilungsRepoPfade: { development: path.join(os.tmpdir(), 'gibt-es-nicht-' + process.pid) } });
  assert.equal(runHook(state).stdout, '', 'die Platte schlaegt die Registry (infra-registry.md)');
});

test('NEGATIV: hoehere schemaVersion der Registry schweigt', { skip: !GIT_DA }, () => {
  const state = macheState(macheKlon([OFFENE_ZEILE]), { schemaVersion: 2 });
  assert.equal(runHook(state).stdout, '', 'Registry neuer als der Kern → nicht raten');
});

test('NEGATIV: NC_QUEUE_CHECK=off schaltet die Erinnerung ab', { skip: !GIT_DA }, () => {
  const state = macheState(macheKlon([OFFENE_ZEILE]));
  for (const wert of ['off', '0', 'false', 'disabled', 'OFF']) {
    const r = runHook(state, { env: { NC_QUEUE_CHECK: wert }, session: 'off-' + wert });
    assert.equal(r.stdout, '', 'NC_QUEUE_CHECK=' + wert + ' muss abschalten');
  }
});

test('NEGATIV: Subagenten-Lauf loest nichts aus', { skip: !GIT_DA }, () => {
  const state = macheState(macheKlon([OFFENE_ZEILE]));
  const stdin = JSON.stringify({
    session_id: 'test-session', hook_event_name: 'SessionStart', source: 'startup',
    agent_type: 'Explore', agent_id: 'a-1'
  });
  assert.equal(runHook(state, { stdin }).stdout, '', 'der Parent-Lauf fuehrt die Sitzung');
});

test('NEGATIV: zweiter Session-Start derselben Sitzung wiederholt nicht', { skip: !GIT_DA }, () => {
  const state = macheState(macheKlon([OFFENE_ZEILE]));
  const sessionDir = tmp('nc-queue-sess-');
  kontext(runHook(state, { sessionDir }));                       // 1. Mal: Erinnerung
  const zweite = runHook(state, { sessionDir });                 // z. B. nach /compact
  assert.equal(zweite.stdout, '', 'hoechstens eine Erinnerung je Faelligkeit und Sitzung');
  // Andere Sitzung auf derselben Maschine erinnert unabhaengig.
  kontext(runHook(state, { sessionDir, session: 'andere-sitzung' }));
});

test('NEGATIV: defekte Eingabe faellt offen und crasht nicht', { skip: !GIT_DA }, () => {
  const r = runHook(macheState(macheKlon([BEFOERDERTE_ZEILE])), { stdin: 'kein json' });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
});

// =======================================================================================
// Lauf-Marker (CLI-Modus)
// =======================================================================================

test('--lauf haelt den Lauf fest und beendet die Faelligkeit', { skip: !GIT_DA }, () => {
  const state = macheState(macheKlon([OFFENE_ZEILE]));
  const s = runCli(state, ['--lauf', 'queue-kern']);
  assert.equal(s.status, 0, 'Lauf-Marker muss durchgehen: ' + s.stderr);
  assert.match(s.stdout, /queue-kern/);
  assert.match(s.stdout, /14 Tage/, 'die Bestaetigung nennt den 14-Tage-Takt (N6)');
  assert.ok(fs.existsSync(path.join(state, 'queue-lauf.json')),
    'der Lauf-Marker gehoert neben die Infra-Registry, nicht in os.tmpdir()');
  assert.equal(runHook(state).stdout, '', 'nach dem Lauf ruht die Erinnerung');
});

test('--lauf mit unbekanntem Skill wird verweigert', () => {
  const state = tmp('nc-queue-state-');
  const s = runCli(state, ['--lauf', 'irgendwas']);
  assert.equal(s.status, 1);
  assert.match(s.stderr, /queue-abteilung/);
  assert.equal(fs.existsSync(path.join(state, 'queue-lauf.json')), false,
    'ein verweigerter Stempel darf nichts schreiben');
});

test('NEGATIV: frische, dauerhaft gehaltene Sperre — kein ungeschuetzter Schreibversuch', () => {
  const state = tmp('nc-queue-state-');
  const ziel = path.join(state, 'queue-lauf.json');
  const ausgang = { fremd: 'bleibt' };
  fs.writeFileSync(ziel, JSON.stringify(ausgang, null, 2), 'utf8');
  fs.mkdirSync(ziel + '.lock', { recursive: true }); // frisch → gilt nicht als verwaist (SPERRE_ALT_MS)
  const s = runCli(state, ['--lauf', 'queue-kern']);
  assert.equal(s.status, 1, 'ohne erworbene Sperre kein Erfolg (kein falsches OK)');
  assert.match(s.stderr, /Sperre/, 'der Verweigerungsgrund wird genannt');
  const daten = JSON.parse(fs.readFileSync(ziel, 'utf8'));
  assert.equal(daten.fremd, 'bleibt', 'der Ausgangsstand bleibt unveraendert');
  assert.equal(daten['queue-kern'], undefined, 'kein Zeitstempel ohne Sperre — kein Lost-Update-Fenster');
  fs.rmdirSync(ziel + '.lock');
});

// =======================================================================================
// Echte Parallelitaet (Onsite-Review-Befund M2)
// =======================================================================================

/**
 * Beide Kinder an derselben Stelle sammeln, bevor es losgeht: Die Sperre wird VOR dem Start
 * angelegt und erst freigegeben, wenn beide laufen. Ein Read-modify-write ohne Schutz
 * ignoriert das Verzeichnis und liest sofort — der Lost Update ist dann sicher, statt vom
 * Prozess-Start-Jitter abzuhaengen.
 */
async function gleichzeitig(sperrZiel, starte) {
  const sperre = sperrZiel + '.lock';
  fs.mkdirSync(path.dirname(sperrZiel), { recursive: true });
  fs.mkdirSync(sperre, { recursive: true });
  const laeufe = starte();
  await new Promise(r => setTimeout(r, 120));           // beide Prozesse sind jetzt oben
  try { fs.rmdirSync(sperre); } catch (_) { /* schon uebernommen */ }
  return Promise.all(laeufe);
}

test('Zwei gleichzeitige --lauf-Prozesse verlieren keinen Zeitstempel (M1)', async () => {
  for (let runde = 0; runde < 3; runde++) {
    const state = tmp('nc-queue-state-');
    const frueher = Date.now() - 3 * TAG_MS;
    // Der Ausgangsstand ist absichtlich GROSS: Lesen, Parsen und Schreiben dauern damit
    // Dutzende Millisekunden statt Mikrosekunden. Ohne dieses breite Fenster entscheidet
    // allein der Prozess-Start-Jitter, ob sich die beiden Laeufe ueberhaupt ueberlappen —
    // und ein ungeschuetztes Read-modify-write kaeme zufaellig davon.
    setzeLaeufe(state, { fremd: 'x'.repeat(3 * 1024 * 1024), alt: frueher });
    const ziel = path.join(state, 'queue-lauf.json');

    const beide = await gleichzeitig(ziel, () => [
      startCli(state, ['--lauf', 'queue-abteilung']),
      startCli(state, ['--lauf', 'queue-kern'])
    ]);
    for (const r of beide) assert.equal(r.status, 0, 'beide Stempel muessen durchgehen: ' + r.stderr);

    const daten = JSON.parse(fs.readFileSync(ziel, 'utf8'));
    assert.ok(Number(daten['queue-abteilung']) > frueher,
      'Runde ' + runde + ': der Zeitstempel von queue-abteilung wurde ueberschrieben');
    assert.ok(Number(daten['queue-kern']) > frueher,
      'Runde ' + runde + ': der Zeitstempel von queue-kern wurde ueberschrieben');
    assert.equal(daten.fremd.length, 3 * 1024 * 1024, 'fremde Felder bleiben unangetastet');
    assert.equal(daten.alt, frueher, 'bestehende Zeitstempel bleiben stehen');
  }
});

test('Ein abgebrochener Schreibvorgang hinterlaesst nie eine halbe Datei (M1)', async () => {
  // Belegt den atomaren Tausch: Waehrend zwanzig Stempel-Laeufe schreiben, wird die Datei
  // laufend gelesen. Jeder gelesene Stand muss vollstaendiges JSON sein — bei einem
  // In-place-Write faende der Leser irgendwann einen abgeschnittenen Puffer.
  const state = tmp('nc-queue-state-');
  const ziel = path.join(state, 'queue-lauf.json');
  setzeLaeufe(state, { fremd: 'x'.repeat(20000) });      // gross genug fuer Teilschreibungen
  let gelesen = 0;
  const leser = setInterval(() => {
    try {
      const roh = fs.readFileSync(ziel, 'utf8');
      JSON.parse(roh);                                   // wirft bei halbem Inhalt
      gelesen++;
    } catch (e) {
      if (e && e.code === 'ENOENT') return;              // Fenster zwischen Temp und rename
      throw new Error('unvollstaendiger Lauf-Marker gelesen: ' + e.message);
    }
  }, 1);
  try {
    for (let i = 0; i < 10; i++) {
      await Promise.all([
        startCli(state, ['--lauf', 'queue-abteilung']),
        startCli(state, ['--lauf', 'queue-kern'])
      ]);
    }
  } finally { clearInterval(leser); }
  assert.ok(gelesen > 0, 'der Leser muss die Datei ueberhaupt gesehen haben');
  const daten = JSON.parse(fs.readFileSync(ziel, 'utf8'));
  assert.equal(daten.fremd.length, 20000, 'der fremde Inhalt ueberlebt jeden Tausch');
});

test('Zwei gleichzeitige Session-Starts derselben Sitzung erinnern hoechstens einmal (M2)',
  { skip: !GIT_DA }, async () => {
    for (let runde = 0; runde < 2; runde++) {
      const state = macheState(macheKlon([OFFENE_ZEILE]));
      const sessionDir = tmp('nc-queue-sess-');
      const session = 'parallel-' + runde;
      const beide = await Promise.all([
        startHook(state, { sessionDir, session }),
        startHook(state, { sessionDir, session })
      ]);
      const mitAusgabe = beide.filter(r => r.stdout);
      assert.equal(mitAusgabe.length, 1,
        'Runde ' + runde + ': genau ein Lauf darf erinnern, der andere schweigt (bekam '
        + mitAusgabe.length + ')');
      kontext(mitAusgabe[0]);
      for (const r of beide) assert.equal(r.status, 0);
    }
  });

// =======================================================================================
// Form der Ausgabe
// =======================================================================================

test('Kein process.exit: Exit-Code 0 und vollstaendiges JSON', { skip: !GIT_DA }, () => {
  // POSIX-Pipe-Falle (Onsite-Debug-Log 2026-08-04): process.exit() nach stdout.write kann
  // die Ausgabe abschneiden — die Injektion ginge dann still verloren.
  const r = runHook(macheState(macheKlon([OFFENE_ZEILE])));
  assert.equal(r.status, 0, 'SessionStart kann nicht blocken — der Exit-Code bleibt 0');
  const text = kontext(r);
  assert.ok(text.endsWith('blockiert nichts.'), 'die Ausgabe muss vollstaendig ankommen');
});

// =======================================================================================
// Fehlendes / unbenutzbares Git (Onsite-Review-Befund M5 zu H5)
// =======================================================================================

test('NEGATIV: ohne benutzbares Git schweigt der Hook und kommt schnell zurueck',
  { skip: !GIT_DA }, () => {
    const klon = macheKlon([OFFENE_ZEILE]);
    fs.writeFileSync(path.join(klon, 'knowledge-base', 'neu.md'), 'Arbeit\n', 'utf8');
    const r = runHook(macheState(klon), { keinGit: true });
    assert.equal(r.stdout, '', 'ohne Git gibt es keinen belegten Befund — also keinen Hinweis');
    assert.equal(r.status, 0, 'fehlendes Git ist kein Fehlerfall, sondern fail-open');
    assert.equal(r.stderr, '', 'fehlendes Git ist auch kein Diagnosefall — es rauscht nicht');
    // Sobald Git als unbrauchbar erkannt ist, wird kein weiterer Prozess gestartet; fuenf
    // aufsummierte 2-Sekunden-Timeouts wuerden das Budget des Sitzungsstarts sprengen.
    assert.ok(r.dauer < 5000, 'der Hook muss schnell zurueckkommen, gebraucht: ' + r.dauer + ' ms');
  });

test('REGRESSION H5: ohne Git gilt die Arbeitskopie NICHT als gemergter Stand',
  { skip: !GIT_DA }, () => {
    // Aufbau: Der gemergte Stand hat KEINE offene Zeile; lokal (uncommittet) wird eine
    // angehaengt. queue-abteilung lief vor drei Tagen (nicht faellig, Versatz nicht aktiv),
    // queue-kern vor zwanzig (faellig, falls es etwas Offenes GAEBE).
    const klon = macheKlon([]);
    fs.appendFileSync(path.join(klon, ...QUEUE_REL.split('/')), OFFENE_ZEILE + '\n', 'utf8');
    const state = macheState(klon);
    setzeLaeufe(state, {
      'queue-abteilung': Date.now() - 3 * TAG_MS,
      'queue-kern': Date.now() - 20 * TAG_MS
    });

    assert.equal(runHook(state).stdout, '',
      'mit Git wird der gemergte Stand gelesen — dort ist nichts offen');
    const ohne = runHook(state, { keinGit: true, session: 'ohne-git' });
    assert.equal(ohne.stdout, '',
      'ohne Git darf die lokale, noch ungemergte Zeile keine Erinnerung ausloesen (H5)');
    assert.equal(ohne.status, 0);

    // Kontrollprobe: Derselbe Aufbau mit GEMERGTER offener Zeile erinnert sehr wohl —
    // ohne sie wuerde das doppelte Schweigen oben auch bei einem kaputten Test gelten.
    const klon2 = macheKlon([OFFENE_ZEILE]);
    const state2 = macheState(klon2);
    setzeLaeufe(state2, {
      'queue-abteilung': Date.now() - 3 * TAG_MS,
      'queue-kern': Date.now() - 20 * TAG_MS
    });
    assert.match(kontext(runHook(state2)), /\/nc:queue-kern/,
      'Kontrollprobe: der gemergte Stand loest die Erinnerung aus');
  });

test('Ein haengendes Git summiert keine Timeouts auf',
  { skip: process.platform === 'win32' }, () => {
    // Nur POSIX: Auf Windows braeuchte der Ersatz-`git` eine .exe (execFile fuehrt .cmd/.bat
    // ohne Shell nicht aus), ein Shell-Skript reicht dort nicht.
    // Belegt die andere Haelfte von H4: Nicht nur ein FEHLENDES Git muss billig sein,
    // sondern auch ein haengendes — nach dem ersten Timeout darf kein Prozess mehr starten.
    // Der Shim wird dem echten PATH VORANGESTELLT (nicht ersetzt), sonst findet die Shell
    // im Shim ihr eigenes `sleep` nicht und der Ersatz-git endet mit 127 statt zu haengen.
    const binDir = tmp('nc-queue-langsames-git-');
    const shim = path.join(binDir, 'git');
    fs.writeFileSync(shim, '#!/bin/sh\nsleep 30\n', 'utf8');
    fs.chmodSync(shim, 0o755);
    const klon = macheKlon([OFFENE_ZEILE]);
    fs.writeFileSync(path.join(klon, 'knowledge-base', 'neu.md'), 'Arbeit\n', 'utf8');
    const r = runHook(macheState(klon), { env: { PATH: binDir + ':' + process.env.PATH } });
    assert.equal(r.stdout, '', 'ein Timeout ist kein Befund');
    assert.ok(r.dauer < 6000,
      'nach dem ersten Timeout darf kein weiterer Git-Prozess starten, gebraucht: ' + r.dauer + ' ms');
  });

test('REGRESSION: ein Git, das nur Fehler liefert, ist kein "Klon ohne Remote"',
  { skip: !GIT_DA }, () => {
    // Zweiter Weg in dieselbe Falschmeldung: Git ist da und laeuft, quittiert hier aber
    // jeden Aufruf mit einem Fehler-Exit (kein Repository, `dubious ownership`, kaputte
    // Installation). Ohne positiven Beleg sieht das aus wie ein frischer Klon ohne
    // Remote — und die ungemergte Arbeitskopie wuerde als gemergter Stand gelesen.
    // Aufbau: ein ganz normales Verzeichnis mit Queue-Datei, KEIN Repo.
    const kein_repo = tmp('nc-queue-kein-repo-');
    queueDatei(kein_repo, [OFFENE_ZEILE]);
    const r = runHook(macheState(kein_repo));
    assert.equal(r.stdout, '',
      'ohne belegtes Repository gibt es keinen gemergten Stand — also keine Erinnerung');
    assert.equal(r.status, 0);
  });

test('Der Klon ohne Remote liest weiterhin die Arbeitskopie', { skip: !GIT_DA }, () => {
  // Gegenprobe zur Verschaerfung oben: Ein echtes, aber nie gepushtes Repository hat
  // keinen Remote-Bezug — dort IST die Arbeitskopie der einzige und ehrliche Stand.
  // Ohne diesen Test waere „schweigen, weil kein Ref da ist" nicht von „schweigen, weil
  // Git nicht arbeitet" zu unterscheiden, und die Verschaerfung koennte still zu weit gehen.
  const klon = tmp('nc-queue-ohne-remote-');
  gitIn(klon, ['init', '--quiet']);
  gitIn(klon, ['config', 'user.email', 'test@example.invalid']);
  gitIn(klon, ['config', 'user.name', 'Testlauf']);
  gitIn(klon, ['config', 'commit.gpgsign', 'false']);
  queueDatei(klon, [OFFENE_ZEILE]);
  gitIn(klon, ['add', '-A']);
  gitIn(klon, ['commit', '-q', '-m', 'init']);
  const text = kontext(runHook(macheState(klon)));
  assert.match(text, /\/nc:queue-kern/, 'ohne Remote ist die Arbeitskopie der Stand');
});

// =======================================================================================
// Git-Budget (Onsite-Review-Befund H4) — gezaehlt, nicht behauptet
// =======================================================================================

test('Hoechstens fuenf Git-Aufrufe je Hook-Lauf (GIT_TRACE-Zaehlung)', { skip: !GIT_DA }, () => {
  // Der Ungluecksfall in einem Lauf: kein origin/HEAD (die Ref-Suche muss arbeiten), der
  // Standardbranch heisst master (beide Kandidaten sind zu pruefen) und BEIDE Faelligkeiten
  // liegen an (Status, rev-list und show fallen alle an). Teurer kann ein Lauf nicht werden.
  const klon = macheKlon([OFFENE_ZEILE], { branch: 'master', setHead: false });
  fs.writeFileSync(path.join(klon, 'knowledge-base', 'neu.md'), 'Arbeit\n', 'utf8');
  const spur = path.join(tmp('nc-queue-trace-'), 'git-trace.log').replace(/\\/g, '/');

  const r = runHook(macheState(klon), { env: { GIT_TRACE: spur } });
  const text = kontext(r);
  assert.match(text, /\/nc:queue-abteilung/, 'gezaehlt wird ein VOLLER Lauf …');
  assert.match(text, /\/nc:queue-kern/, '… mit beiden Faelligkeiten, kein Frueh-Ausstieg');

  // GIT_TRACE schreibt je gestartetem Git-Prozess genau eine „built-in:"-Zeile. Kann git
  // die Datei nicht anlegen, landet dieselbe Spur auf stderr.
  const roh = fs.existsSync(spur) ? fs.readFileSync(spur, 'utf8') : r.stderr;
  const aufrufe = roh.split(/\r?\n/).filter(z => z.includes('trace: built-in: git '));
  assert.ok(aufrufe.length > 0, 'GIT_TRACE muss die Aufrufe ueberhaupt protokollieren');
  assert.ok(aufrufe.length <= 5,
    'hooks.json/README sagen hoechstens fuenf lokale Git-Aufrufe — gezaehlt: ' + aufrufe.length
    + '\n' + aufrufe.join('\n'));
});

// =======================================================================================
// Pflege-Auspraegung im realen Plugin-Cache (Onsite-Review-Befund M4)
//
// Nachgebaut nach der realen Cache-Topologie:
//   <cache>/<marktplatz>/<plugin>/<version>/…   — CLAUDE_PLUGIN_ROOT ist der VERSIONSordner.
// Der Elternordner des Kerns enthaelt also lauter Versionsstaende des Kerns selbst; wer
// nur dort sucht, findet ein Abteilungsplugin nie und faellt still auf den Standardpfad
// zurueck. Der abgeloeste Stand traegt `.orphaned_at`.
// =======================================================================================

function schreibeAuspraegung(dir, abteilung, queuePfad, { abgeloest = false } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'pflege-auspraegung.json'), JSON.stringify({
    schemaVersion: 1, abteilung, queuePfad,
    kriterienVerweis: 'Kriterienliste v1', journalSonderregeln: [], roteLinienDomaene: []
  }, null, 2), 'utf8');
  if (abgeloest) fs.writeFileSync(path.join(dir, '.orphaned_at'), '2026-01-01', 'utf8');
  return dir;
}

const QUEUE_ABWEICHEND = 'knowledge-base/kandidaten-queue/abteilungs-queue.md';
const QUEUE_TOT = 'knowledge-base/gibt-es-nicht/queue.md';

test('queuePfad kommt aus dem versionierten Plugin-Cache (M4)', { skip: !GIT_DA }, () => {
  const klon = macheKlon([], {
    dateien: { [QUEUE_ABWEICHEND]: '| Datum | Einzeiler | Verweis | Kriterium | Status |\n'
      + '|---|---|---|---|---|\n' + OFFENE_ZEILE + '\n' }
  });
  const markt = path.join(tmp('nc-queue-cache-'), 'novacoreai');
  const kern = path.join(markt, 'nc', '0.10.0');
  fs.mkdirSync(path.join(kern, '.claude-plugin'), { recursive: true });
  fs.mkdirSync(path.join(markt, 'nc', '0.9.0'), { recursive: true });          // Altstand
  fs.writeFileSync(path.join(markt, 'nc', '0.9.0', '.orphaned_at'), '', 'utf8');
  // Fremde Abteilung (falscher Pfad) und ein abgeloester Stand der eigenen Abteilung
  // (ebenfalls falscher Pfad) — nur der aktuelle Stand traegt den richtigen.
  schreibeAuspraegung(path.join(markt, 'nc-marketing', '0.4.1'), 'marketing', QUEUE_TOT);
  schreibeAuspraegung(path.join(markt, 'nc-development', '0.1.0'), 'development', QUEUE_TOT,
    { abgeloest: true });
  schreibeAuspraegung(path.join(markt, 'nc-development', '0.2.0'), 'development', QUEUE_ABWEICHEND);

  const text = kontext(runHook(macheState(klon), { env: { CLAUDE_PLUGIN_ROOT: kern } }));
  assert.match(text, /\/nc:queue-kern/,
    'die Auspraegung des installierten Abteilungsplugins muss im Versions-Cache gefunden werden');
  assert.match(text, /1 offene Zeile\(n\)/);
});

test('queuePfad wird auch im flachen Layout gefunden (Repo-Checkout)', { skip: !GIT_DA }, () => {
  const klon = macheKlon([], {
    dateien: { [QUEUE_ABWEICHEND]: '| Datum | Einzeiler | Verweis | Kriterium | Status |\n'
      + '|---|---|---|---|---|\n' + OFFENE_ZEILE + '\n' }
  });
  const plugins = tmp('nc-queue-plugins-');
  const kern = path.join(plugins, 'nc');
  fs.mkdirSync(path.join(kern, '.claude-plugin'), { recursive: true });
  schreibeAuspraegung(path.join(plugins, 'nc-development'), 'development', QUEUE_ABWEICHEND);

  const text = kontext(runHook(macheState(klon), { env: { CLAUDE_PLUGIN_ROOT: kern } }));
  assert.match(text, /\/nc:queue-kern/, 'das flache Layout darf durch den Cache-Fix nicht verlieren');
});

test('Ohne auffindbare Auspraegung gilt die Norm-Kategorie', { skip: !GIT_DA }, () => {
  const klon = macheKlon([OFFENE_ZEILE]);                       // Standardpfad, offene Zeile
  const markt = path.join(tmp('nc-queue-cache-'), 'novacoreai');
  const kern = path.join(markt, 'nc', '0.10.0');
  fs.mkdirSync(path.join(kern, '.claude-plugin'), { recursive: true });
  const text = kontext(runHook(macheState(klon), { env: { CLAUDE_PLUGIN_ROOT: kern } }));
  assert.match(text, /1 offene Zeile\(n\)/,
    'kein Abteilungsplugin installiert → Standardpfad, kein Abbruch');
});

test('Der Hook ist in hooks.json als SessionStart-Hook registriert', () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(HIER, '..', 'hooks', 'hooks.json'), 'utf8'));
  const kommandos = cfg.hooks.SessionStart.flatMap(m => m.hooks).map(h => h.command);
  assert.ok(kommandos.some(c => c.includes('nc-queue-faelligkeit.js')),
    'ohne Registrierung laeuft der Check nie');
  assert.match(cfg.description, /NC_QUEUE_CHECK=off/,
    'der Opt-out gehoert in die description (Aktualisierungs-Index §2.1)');
  assert.match(cfg.description, /KEIN Gate/,
    'die Abgrenzung zu Gate 3\/4 gehoert in die description');
});
