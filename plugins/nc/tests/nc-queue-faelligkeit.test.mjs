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
//
// ZWEI SPAETERE PORT-BLOECKE (Onsite-Delta, 2026-08-23, Quelle origin/main@6d3f8db):
//   - Sperren-Haertung: die nicht-EEXIST-Blockade wird ausgewartet statt sofort aufgegeben
//     (Test bei den Parallelitaets-Proben, POSIX-only — der Fehlercode ist plattformneutral
//     nicht erzwingbar).
//   - PR-Sichtbarkeit ueber die Repo-Grenzen (§15.39, eigener Abschnitt am Dateiende):
//     der EINZIGE Netzweg des Hooks, in der Suite per NC_PR_CHECK=off default AUS und in
//     den PR-Proben per NC_PR_CMD auf einen Node-Stub umgeleitet. Kein Test braucht Netz.
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
    'NC_QUEUE_PFAD', 'NC_PR_CHECK', 'NC_PR_CMD', 'CLAUDE_PLUGIN_ROOT', 'CLAUDE_PROJECT_DIR',
    'CLAUDE_SESSION_ID', 'GIT_TRACE']) {
    delete kindEnv[k];
  }
  kindEnv.NC_QUEUE_STATE_DIR = state;
  kindEnv.NC_QUEUE_SESSION_DIR = sessionDir || tmp('nc-queue-sess-');
  // WICHTIG: Der PR-Teil startet einen externen Prozess und damit potenziell einen
  // Netzaufruf. In der Testsuite ist er deshalb DEFAULT AUS — kein Test darf echtes Netz
  // brauchen, und ein auf der Entwicklermaschine installiertes `gh` darf die Ergebnisse der
  // Queue-Tests nicht verfaelschen. Die PR-Tests unten schalten ihn gezielt ein und leiten
  // den Aufruf per NC_PR_CMD auf einen Stub um.
  kindEnv.NC_PR_CHECK = 'off';
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

// T14 (Bauplan Phase J AP A2/J-E5, Port Onsite 2b8938e): der Hinweis WEIST AN statt nur
// zu erinnern — Titel, Adressatin, Subagenten-Weg und Stempel-Kommando sind Pflicht.
test('T14 — der Hinweis weist an (Titel, Adressatin, Subagenten-Weg, Stempel-Kommando)',
  { skip: !GIT_DA }, () => {
    const klon = macheKlon([OFFENE_ZEILE]);
    const text = kontext(runHook(macheState(klon)));
    assert.match(text, /Queue-Flow fällig: JETZT ausführen \(keine Blockade\)/, 'Titel');
    assert.match(text, /Anweisung an die Session/, 'Adressatin');
    assert.match(text, /beauftragt einen Subagenten damit/, 'Subagenten-Weg');
    assert.match(text, /node ".*nc-queue-faelligkeit\.js" --lauf queue-kern/, 'Stempel-Kommando im Text');
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

test('Eine nicht-EEXIST-Blockade der Sperre wird ausgewartet, nicht sofort aufgegeben',
  { skip: process.platform === 'win32' || (process.getuid && process.getuid() === 0) }, () => {
    // Regression zum Windows-CI-Befund des Vorbilds vom 2026-08-17 (node 22/24 rot, node 20
    // und POSIX gruen): `mitSperre` hat frueher JEDEN Fehlercode ausser EEXIST als "nicht
    // sperrbar" gelesen und sofort aufgegeben. Windows liefert fuer eine belegte Sperre aber
    // auch EPERM/EACCES/EBUSY/ENOTEMPTY (Verzeichnis wird gerade entfernt, Handle noch
    // offen) — der Schreibvorgang waere nach kurzem Warten problemlos durchgelaufen, wurde
    // aber verweigert. Bei NC ist die Folge nicht der Lost Update des Vorbilds (unsere
    // Haertung arbeitet nie ohne Sperre), sondern eine vorzeitige VERWEIGERUNG.
    //
    // Der Fehlercode laesst sich plattformneutral nicht erzwingen; POSIX liefert EACCES,
    // wenn das Elternverzeichnis nicht schreibbar ist — dasselbe „belegt statt unbekannt".
    // Beobachtbar ist die Fehlerrichtung ueber die DAUER: mit dem Fix wird das Warte-Budget
    // (40 x 25 ms) ausgeschoepft, ohne ihn kehrt der Lauf sofort zurueck. Genau dieses
    // Muster hat den Bug in der CI verraten (Durchfall nach 221 ms).
    // Unter root greift chmod nicht — dann wird uebersprungen.
    const state = tmp('nc-queue-state-');
    setzeLaeufe(state, { alt: Date.now() - 3 * TAG_MS });
    fs.chmodSync(state, 0o555);
    try {
      const begonnen = Date.now();
      const r = runCli(state, ['--lauf', 'queue-kern']);
      const dauer = Date.now() - begonnen;
      assert.equal(r.status, 1, 'ein nicht sperrbarer Marker meldet sich sichtbar (NC-Haertung)');
      assert.match(r.stderr, /Sperre/, 'der Verweigerungsgrund wird genannt');
      assert.ok(dauer >= 700,
        'die Sperre muss ausgewartet werden statt sofort aufgegeben zu werden, gebraucht: '
        + dauer + ' ms');
    } finally {
      fs.chmodSync(state, 0o755);
    }
  });

test('Die Sperre zaehlt alle Windows-Codes einer belegten Sperre als "belegt"', () => {
  // ERGAENZUNG zur Probe oben, kein Ersatz: Die verhaltensbasierte Probe laeuft nur auf
  // POSIX (EACCES ist dort erzwingbar) — ausgerechnet auf Windows, wo EPERM/EBUSY/ENOTEMPTY
  // real auftreten, wird sie uebersprungen. Damit die Haertung dort nicht unbemerkt
  // zurueckgedreht werden kann (die alte Zeile `e.code !== 'EEXIST'` sah harmlos aus und war
  // der Bug), wird die Codeliste hier statisch festgenagelt.
  const quelle = fs.readFileSync(HOOK, 'utf8');
  const zeile = /const SPERRE_BELEGT_CODES = new Set\(\[([^\]]*)\]\)/.exec(quelle);
  assert.ok(zeile, 'die Codeliste der Sperre muss als benannte Menge existieren');
  for (const code of ['EEXIST', 'EPERM', 'EACCES', 'EBUSY', 'ENOTEMPTY']) {
    assert.match(zeile[1], new RegExp("'" + code + "'"),
      code + ' quittiert unter Windows eine belegte Sperre — Warten, nicht aufgeben');
  }
  assert.equal(/e\.code !== 'EEXIST'/.test(quelle), false,
    'der alte Frueh-Ausstieg auf alles ausser EEXIST darf nicht zurueckkehren');
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

// =======================================================================================
// PR-Sichtbarkeit ueber die Repo-Grenzen (Port des Onsite-Bausteins §15.39)
//
// Anlass beim Vorbild (2026-08-17): Im dortigen Satelliten stand drei Tage ein fertiger,
// CI-gruener PR, den niemand bemerkt hat — `gh pr list` ohne --repo zeigt nur das aktuelle
// Repo. Geprueft wird hier vor allem, was den Sitzungsstart schuetzt: kein Netzaufruf bei
// frischem Cache, harte Zeitgrenze, Schweigen bei jedem Fehlerpfad.
//
// NC-Anpassungen gegenueber dem Vorbild: Envs NC_PR_CHECK/NC_PR_CMD, und die Repo-Pfade
// kommen aus dem NC-Registry-Schema — `kernRepoPfad` plus ALLE Werte der Map
// `abteilungsRepoPfade` (Onsite hat dort das Einzelfeld `abteilungsRepoPfad`).
//
// KEIN Test braucht echtes Netz: Der `gh`-Aufruf wird ueber NC_PR_CMD auf einen Node-Stub
// umgeleitet (Array-Form, damit es auch unter Windows ohne .exe funktioniert). Der Stub
// protokolliert JEDEN Aufruf — daran haengen die Negativproben „es wurde nicht abgefragt".
// =======================================================================================

const PR_CACHE = 'pr-sichtbarkeit.json';
const STD_MS = 60 * 60 * 1000;

/** Ein Repo-Verzeichnis, dessen Basename als Schluessel des Stubs dient. */
function macheRepo(kennung) {
  return tmp('nc-pr-' + kennung + '-');
}

function pr(nummer, titel, slug, extra = {}) {
  return Object.assign({
    number: nummer,
    title: titel,
    url: 'https://github.com/' + slug + '/pull/' + nummer,
    isDraft: false,
    updatedAt: '2026-08-14T10:00:00Z'
  }, extra);
}

/**
 * Stub fuer `gh`. Antwortet je nach Basename des Arbeitsverzeichnisses:
 *   { modus: 'ok', prs: [...] } · 'fehler' (Exit 1 mit Auth-Text auf stderr) ·
 *   'haenger' (blockiert 30 s) · 'muell' (unlesbare Ausgabe).
 * Jeder Aufruf wird protokolliert. Bewusst OHNE process.exit() nach dem Schreiben —
 * dieselbe POSIX-Pipe-Falle wie im Hook selbst.
 */
function macheGhStub(antworten, protokoll) {
  const datei = path.join(tmp('nc-pr-stub-'), 'gh-stub.cjs');
  fs.writeFileSync(datei,
    "'use strict';\n"
    + 'const fs = require("fs");\n'
    + 'const path = require("path");\n'
    + 'const antworten = ' + JSON.stringify(antworten) + ';\n'
    + 'const protokoll = ' + JSON.stringify(protokoll) + ';\n'
    + 'const schluessel = path.basename(process.cwd());\n'
    + 'try { fs.appendFileSync(protokoll, schluessel + "\\n"); } catch (e) {}\n'
    + 'const a = antworten[schluessel] || antworten["*"] || { modus: "fehler" };\n'
    + 'if (a.modus === "haenger") {\n'
    + '  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 30000);\n'
    + '} else if (a.modus === "fehler") {\n'
    + '  process.stderr.write("gh: authentication failed — token ghp_GEHEIM123\\n");\n'
    + '  process.exitCode = 1;\n'
    + '} else if (a.modus === "muell") {\n'
    + '  process.stdout.write("<html>kein json</html>");\n'
    + '} else {\n'
    + '  process.stdout.write(JSON.stringify(a.prs || []));\n'
    + '}\n', 'utf8');
  return datei;
}

function prEnv(stubDatei) {
  return { NC_PR_CHECK: 'an', NC_PR_CMD: JSON.stringify([process.execPath, stubDatei]) };
}

function stubAufrufe(protokoll) {
  try {
    return fs.readFileSync(protokoll, 'utf8').split(/\r?\n/).filter(Boolean);
  } catch (_) { return []; }
}

function protokollDatei() {
  return path.join(tmp('nc-pr-prot-'), 'aufrufe.log');
}

function setzePrCache(state, repos) {
  fs.writeFileSync(path.join(state, PR_CACHE),
    JSON.stringify({ schemaVersion: 1, repos }, null, 2), 'utf8');
}

function lesePrCache(state) {
  return JSON.parse(fs.readFileSync(path.join(state, PR_CACHE), 'utf8'));
}

/**
 * Standardaufbau: Kern-Repo + Abteilungs-Repo in der Registry (NC-Schema), Queue-Teil
 * bewusst ruhig (frische Laeufe), damit die Proben allein die PR-Sichtbarkeit messen.
 */
function prAufbau({ kernPrs = [], satellitPrs = [] } = {}) {
  const kern = macheRepo('kern');
  const satellit = macheRepo('sat');
  const state = tmp('nc-queue-state-');
  fs.writeFileSync(path.join(state, 'infra.json'), JSON.stringify({
    schemaVersion: 1, abteilungen: ['development'], szenario: 'test',
    kernRepoPfad: kern, abteilungsRepoPfade: { development: satellit }
  }, null, 2), 'utf8');
  setzeLaeufe(state, { 'queue-abteilung': Date.now(), 'queue-kern': Date.now() });
  const protokoll = protokollDatei();
  const stub = macheGhStub({
    [path.basename(kern)]: { modus: 'ok', prs: kernPrs },
    [path.basename(satellit)]: { modus: 'ok', prs: satellitPrs }
  }, protokoll);
  return { kern, satellit, state, protokoll, stub };
}

test('PR: offene PRs beider Repos erscheinen in EINER Meldung', () => {
  const a = prAufbau({
    kernPrs: [pr(62, 'Release-Zug', 'NovaCore-AI/NovaCoreAI-OS')],
    satellitPrs: [pr(1, 'Wissensbasis-Nachzug', 'NovaCore-AI/NovaCoreAI-OS-Development')]
  });
  const text = kontext(runHook(a.state, { env: prEnv(a.stub) }));
  assert.match(text, /NovaCore-AI\/NovaCoreAI-OS-Development/,
    'der Satellit ist genau der blinde Fleck, um den es geht');
  assert.match(text, /#1 Wissensbasis-Nachzug/);
  assert.match(text, /#62 Release-Zug/);
  assert.match(text, /blockiert nichts/, 'die Nicht-Gate-Zusage gehoert in den Text');
  assert.equal(stubAufrufe(a.protokoll).length, 2, 'beide Repos werden genau einmal abgefragt');
});

test('PR: frischer Cache loest KEINE Abfrage aus', () => {
  const a = prAufbau({ kernPrs: [pr(99, 'darf nie erscheinen', 'x/y')] });
  setzePrCache(a.state, {
    [a.kern]: {
      geprueft: Date.now() - STD_MS, stand: Date.now() - STD_MS, erfolg: true,
      prs: [{ nummer: 62, titel: 'Aus dem Cache', url: 'https://github.com/o/r/pull/62',
        entwurf: false, aktualisiert: '2026-08-14' }]
    },
    [a.satellit]: { geprueft: Date.now() - STD_MS, stand: Date.now() - STD_MS, erfolg: true, prs: [] }
  });
  const text = kontext(runHook(a.state, { env: prEnv(a.stub) }));
  assert.match(text, /#62 Aus dem Cache/, 'gemeldet wird der Zwischenstand …');
  assert.equal(/darf nie erscheinen/.test(text), false, '… nicht ein frischer Abruf');
  assert.deepEqual(stubAufrufe(a.protokoll), [],
    'bei frischem Cache darf kein einziger Prozess starten — das ist der Normalfall');
});

test('PR: abgelaufener Cache wird aufgefrischt', () => {
  const a = prAufbau({ kernPrs: [pr(62, 'Frisch geholt', 'NovaCore-AI/NovaCoreAI-OS')] });
  setzePrCache(a.state, {
    [a.kern]: { geprueft: Date.now() - 2 * TAG_MS, stand: Date.now() - 2 * TAG_MS, erfolg: true, prs: [] },
    [a.satellit]: { geprueft: Date.now() - STD_MS, stand: Date.now() - STD_MS, erfolg: true, prs: [] }
  });
  const text = kontext(runHook(a.state, { env: prEnv(a.stub) }));
  assert.match(text, /#62 Frisch geholt/);
  assert.deepEqual(stubAufrufe(a.protokoll), [path.basename(a.kern)],
    'nur das abgelaufene Repo wird abgefragt, das frische bleibt unberuehrt');
});

test('PR: fehlendes gh schweigt und rauscht nicht', () => {
  const a = prAufbau({ kernPrs: [pr(62, 'X', 'o/r')] });
  const fehlt = path.join(tmp('nc-pr-leer-'), 'gibt-es-kein-gh');
  const r = runHook(a.state, {
    env: { NC_PR_CHECK: 'an', NC_PR_CMD: JSON.stringify([fehlt]) }
  });
  assert.equal(r.stdout, '', 'ohne gh gibt es keinen belegten Befund — also keinen Hinweis');
  assert.equal(r.stderr, '', 'fehlendes gh ist kein Diagnosefall');
  assert.equal(r.status, 0);
});

test('PR: ein haengendes gh laeuft in die Zeitgrenze und schweigt', () => {
  const a = prAufbau();
  const protokoll = protokollDatei();
  const stub = macheGhStub({ '*': { modus: 'haenger' } }, protokoll);
  const r = runHook(a.state, { env: prEnv(stub) });
  assert.equal(r.stdout, '', 'ein Timeout ist kein Befund');
  assert.equal(r.status, 0);
  // Zwei Repos x 1,5 s waeren 3 s; nach dem ersten Timeout darf kein weiterer Prozess mehr
  // starten (dieselbe Lehre wie bei Git, Onsite-Review-Befund H4).
  assert.equal(stubAufrufe(protokoll).length, 1,
    'nach dem ersten Timeout wird kein zweiter Prozess gestartet');
  assert.ok(r.dauer < 4000, 'der Sitzungsstart darf nicht haengen, gebraucht: ' + r.dauer + ' ms');
});

test('PR: Fehler-Exit von gh schweigt, leakt nichts und ruht danach', () => {
  const a = prAufbau();
  const protokoll = protokollDatei();
  const stub = macheGhStub({ '*': { modus: 'fehler' } }, protokoll);
  const r = runHook(a.state, { env: prEnv(stub) });
  assert.equal(r.stdout, '', 'kein Zugriff heisst kein Befund');
  assert.equal(r.stderr, '', 'stderr des Kindprozesses wird verworfen');
  assert.equal(/ghp_GEHEIM123/.test(r.stdout + r.stderr), false,
    'Auth-Diagnosen von gh duerfen nie durchgereicht werden');
  assert.equal(/ghp_GEHEIM123/.test(fs.readFileSync(path.join(a.state, PR_CACHE), 'utf8')), false,
    'und sie landen auch nicht im Cache');
  const nachFehler = lesePrCache(a.state).repos[a.kern];
  assert.equal(nachFehler.erfolg, false, 'der Fehlversuch wird als solcher vermerkt');

  // Zweite Sitzung: der Fehler-Ruheabstand (6 h) verhindert einen neuen Versuch.
  const vorher = stubAufrufe(protokoll).length;
  runHook(a.state, { env: prEnv(stub), session: 'zweite' });
  assert.equal(stubAufrufe(protokoll).length, vorher,
    'ein kaputtes/abgemeldetes gh darf nicht in jeder Sitzung erneut Zeit kosten');
});

test('PR: unlesbare gh-Ausgabe schweigt', () => {
  const a = prAufbau();
  const protokoll = protokollDatei();
  const stub = macheGhStub({ '*': { modus: 'muell' } }, protokoll);
  const r = runHook(a.state, { env: prEnv(stub) });
  assert.equal(r.stdout, '', 'was nicht parst, wird nicht geraten');
  assert.equal(r.status, 0);
});

test('PR: defekter Cache schweigt, repariert sich und fragt nicht ab', () => {
  const a = prAufbau({ kernPrs: [pr(62, 'X', 'o/r')] });
  fs.writeFileSync(path.join(a.state, PR_CACHE), '{kaputt', 'utf8');
  const r = runHook(a.state, { env: prEnv(a.stub) });
  assert.equal(r.stdout, '', 'unbekannte Lage → schweigen, nicht raten');
  assert.deepEqual(stubAufrufe(a.protokoll), [], 'und in diesem Lauf auch kein Netzaufruf');
  // Selbstheilung: Ohne Reparatur wuerde eine einmal kaputte Datei das Feature fuer immer
  // abschalten, ohne dass es jemand von "nichts offen" unterscheiden koennte.
  assert.deepEqual(lesePrCache(a.state), { schemaVersion: 1, repos: {} },
    'der Cache wird auf einen leeren, gueltigen Stand zurueckgesetzt');
  const text = kontext(runHook(a.state, { env: prEnv(a.stub), session: 'danach' }));
  assert.match(text, /#62/, 'die naechste Sitzung arbeitet wieder normal');
});

test('PR: hoehere schemaVersion des Caches wird weder gelesen noch ueberschrieben', () => {
  const a = prAufbau({ kernPrs: [pr(62, 'X', 'o/r')] });
  const fremd = JSON.stringify({ schemaVersion: 99, repos: { irgendwas: true } }, null, 2);
  fs.writeFileSync(path.join(a.state, PR_CACHE), fremd, 'utf8');
  const r = runHook(a.state, { env: prEnv(a.stub) });
  assert.equal(r.stdout, '', 'neuer als der Kern → nicht raten');
  assert.equal(fs.readFileSync(path.join(a.state, PR_CACHE), 'utf8'), fremd,
    'ein fremder, neuerer Stand wird nicht ueberschrieben');
});

test('PR: hoechstens eine Meldung je Sitzung', () => {
  const a = prAufbau({ satellitPrs: [pr(1, 'Teil A', 'NovaCore-AI/NovaCoreAI-OS-Development')] });
  const sessionDir = tmp('nc-queue-sess-');
  kontext(runHook(a.state, { sessionDir, env: prEnv(a.stub) }));
  const zweite = runHook(a.state, { sessionDir, env: prEnv(a.stub) });
  assert.equal(zweite.stdout, '', 'der zweite Session-Start derselben Sitzung schweigt');
  assert.deepEqual(stubAufrufe(a.protokoll).length, 2,
    'und fragt gar nicht erst ab — der Sitzungsmarker greift vor dem Netzaufruf');
  // Eine andere Sitzung erfaehrt es sehr wohl, jetzt aber aus dem frischen Cache.
  kontext(runHook(a.state, { sessionDir, env: prEnv(a.stub), session: 'andere' }));
  assert.equal(stubAufrufe(a.protokoll).length, 2, 'ohne neuen Abruf');
});

test('PR: NC_PR_CHECK=off schaltet nur den Netzteil ab, nicht den ganzen Hook',
  { skip: !GIT_DA }, () => {
    // Aufbau mit echtem Abteilungs-Klon, damit der Queue-Teil etwas zu melden hat.
    const klon = macheKlon([OFFENE_ZEILE]);
    const kern = macheRepo('kern');
    const state = macheState(klon, { kernRepoPfad: kern });
    setzePrCache(state, {
      [kern]: {
        geprueft: Date.now(), stand: Date.now(), erfolg: true,
        prs: [{ nummer: 62, titel: 'Offen im OS-Repo', url: 'https://github.com/o/r/pull/62',
          entwurf: false, aktualisiert: '2026-08-14' }]
      }
    });
    const protokoll = protokollDatei();
    const stub = macheGhStub({ '*': { modus: 'ok', prs: [] } }, protokoll);

    for (const wert of ['off', '0', 'false', 'disabled', 'OFF']) {
      const text = kontext(runHook(state, {
        env: { NC_PR_CHECK: wert, NC_PR_CMD: JSON.stringify([process.execPath, stub]) },
        session: 'proff-' + wert
      }));
      assert.match(text, /\/nc:queue-kern/, 'die lokale Queue-Erinnerung bleibt bestehen');
      assert.equal(/Offen im OS-Repo/.test(text), false,
        'NC_PR_CHECK=' + wert + ' muss den PR-Teil abschalten');
    }

    // Und der Sammelschalter des ganzen Hooks schaltet beides ab.
    const alles = runHook(state, {
      env: { NC_QUEUE_CHECK: 'off', NC_PR_CHECK: 'an',
        NC_PR_CMD: JSON.stringify([process.execPath, stub]) },
      session: 'alles-aus'
    });
    assert.equal(alles.stdout, '', 'NC_QUEUE_CHECK=off schaltet den ganzen Hook ab');
  });

test('PR: beide Befunde erscheinen zusammen, in EINEM JSON', { skip: !GIT_DA }, () => {
  const klon = macheKlon([OFFENE_ZEILE]);
  const kern = macheRepo('kern');
  const state = macheState(klon, { kernRepoPfad: kern });
  const protokoll = protokollDatei();
  const stub = macheGhStub({
    [path.basename(kern)]: { modus: 'ok', prs: [pr(62, 'Release-Zug', 'NovaCore-AI/NovaCoreAI-OS')] },
    [path.basename(klon)]: { modus: 'ok', prs: [] }
  }, protokoll);
  const r = runHook(state, { env: prEnv(stub) });
  const text = kontext(r);
  assert.match(text, /\/nc:queue-kern/, 'Queue-Teil');
  assert.match(text, /#62 Release-Zug/, 'PR-Teil');
  assert.equal(r.stdout.trim().startsWith('{'), true, 'SessionStart vertraegt nur EIN JSON-Objekt');
  assert.equal(JSON.parse(r.stdout).decision, undefined, 'weiterhin kein Gate');
});

test('PR: der Kern-Klon allein reicht — "ausstehend" legt die Sichtbarkeit nicht still', () => {
  // Regression gegen den frueheren Fruehausstieg: Vor diesem Baustein verliess main() den
  // Lauf, sobald keine Abteilung einen Satelliten hatte — und das ist heute der REGELFALL
  // (Uebergangszustand E1). Der PR-Teil haengt daran nicht.
  const kern = macheRepo('kern');
  const state = tmp('nc-queue-state-');
  fs.writeFileSync(path.join(state, 'infra.json'), JSON.stringify({
    schemaVersion: 1, abteilungen: ['development'], szenario: 'test',
    kernRepoPfad: kern, abteilungsRepoPfade: { development: 'ausstehend' }
  }, null, 2), 'utf8');
  const protokoll = protokollDatei();
  const stub = macheGhStub({
    [path.basename(kern)]: { modus: 'ok', prs: [pr(62, 'Nur im OS-Repo', 'NovaCore-AI/NovaCoreAI-OS')] }
  }, protokoll);
  const text = kontext(runHook(state, { env: prEnv(stub) }));
  assert.match(text, /#62 Nur im OS-Repo/);
  assert.deepEqual(stubAufrufe(protokoll), [path.basename(kern)],
    'ein "ausstehend"-Eintrag wird uebersprungen, nicht zum Abbruch');
});

test('PR: alle Werte der Map werden abgefragt — Lesekopien und Geratenes nie', () => {
  // NC-eigene Probe zum Registry-Schema und zur Affiliate-Invariante: Gefragt wird
  // `kernRepoPfad` plus JEDER Wert von `abteilungsRepoPfade` (Onsite kennt dort nur ein
  // Einzelfeld). NICHT gefragt werden die SSOT-Lesekopien `ssotAblage`/`kernSsotPfad` — und
  // schon gar nicht geratene Pfade oder Kollegen-OS-Satelliten, die in der Registry nie
  // stehen.
  const kern = macheRepo('kern');
  const eins = macheRepo('abt-eins');
  const zwei = macheRepo('abt-zwei');
  const lesekopie = macheRepo('lesekopie');
  const state = tmp('nc-queue-state-');
  fs.writeFileSync(path.join(state, 'infra.json'), JSON.stringify({
    schemaVersion: 1, abteilungen: ['development', 'marketing'], szenario: 'test',
    ssotAblage: lesekopie, kernSsotPfad: lesekopie,
    kernRepoPfad: kern, abteilungsRepoPfade: { development: eins, marketing: zwei }
  }, null, 2), 'utf8');
  setzeLaeufe(state, { 'queue-abteilung': Date.now(), 'queue-kern': Date.now() });
  const protokoll = protokollDatei();
  const stub = macheGhStub({
    [path.basename(zwei)]: { modus: 'ok', prs: [pr(5, 'Im zweiten Satelliten', 'NovaCore-AI/Zwei')] },
    '*': { modus: 'ok', prs: [] }
  }, protokoll);
  const text = kontext(runHook(state, { env: prEnv(stub) }));
  assert.match(text, /#5 Im zweiten Satelliten/, 'auch der zweite Map-Eintrag wird gesehen');
  const gefragt = stubAufrufe(protokoll).sort();
  assert.deepEqual(gefragt, [kern, eins, zwei].map(p => path.basename(p)).sort(),
    'genau die drei Registry-Repos — nicht mehr, nicht weniger');
  assert.equal(gefragt.includes(path.basename(lesekopie)), false,
    'Lesekopien sind keine Arbeitsklone und werden nie abgefragt');
});

test('PR: heutiger Uebergangszustand E1 — ohne Registry-Pfade kein einziger Netzaufruf', () => {
  // Der reale NC-Ist-Zustand: Die optionalen Queue-Flow-Felder sind auf keiner Maschine
  // gesetzt (infra-registry.md). Dann ist der PR-Teil vollstaendig still — und zwar OHNE
  // zu raten: kein Prozess, kein Cache-Schreiben, kein Hinweis.
  const state = tmp('nc-queue-state-');
  fs.writeFileSync(path.join(state, 'infra.json'), JSON.stringify({
    schemaVersion: 1, abteilungen: ['development'], szenario: 'test'
  }, null, 2), 'utf8');
  const protokoll = protokollDatei();
  const stub = macheGhStub({ '*': { modus: 'ok', prs: [pr(9, 'darf nie erscheinen', 'o/r')] } },
    protokoll);
  const r = runHook(state, { env: prEnv(stub) });
  assert.equal(r.stdout, '', 'ohne registrierte Repo-Pfade gibt es nichts zu melden');
  assert.equal(r.status, 0);
  assert.deepEqual(stubAufrufe(protokoll), [], 'und keinen einzigen Netzaufruf');
  assert.equal(fs.existsSync(path.join(state, PR_CACHE)), false,
    'ein Lauf ohne Kandidaten legt auch keinen Cache an');
});

test('PR: keine offenen PRs heisst Schweigen', () => {
  const a = prAufbau();                       // beide Repos antworten mit leerer Liste
  const r = runHook(a.state, { env: prEnv(a.stub) });
  assert.equal(r.stdout, '', 'ohne offene PRs gibt es nichts zu melden');
  assert.equal(lesePrCache(a.state).repos[a.kern].erfolg, true,
    'der erfolgreiche Leerbefund wird trotzdem gecacht — sonst wird taeglich neu gefragt');
});

test('PR: ein zu alter Stand wird nicht mehr gemeldet', () => {
  const a = prAufbau();
  const uralt = Date.now() - 30 * TAG_MS;
  setzePrCache(a.state, {
    [a.kern]: {
      geprueft: Date.now(), stand: uralt, erfolg: false,
      prs: [{ nummer: 7, titel: 'Vor einem Monat gesehen', url: 'https://github.com/o/r/pull/7',
        entwurf: false, aktualisiert: '2026-07-18' }]
    }
  });
  const r = runHook(a.state, { env: prEnv(a.stub) });
  assert.equal(r.stdout, '',
    'ein seit Wochen unbestaetigter PR ist vermutlich laengst gemergt — das waere Rauschen');
});

test('PR: Entwuerfe werden gekennzeichnet, unbrauchbare Eintraege verworfen', () => {
  const a = prAufbau({
    kernPrs: [
      pr(62, 'Entwurf-PR', 'NovaCore-AI/NovaCoreAI-OS', { isDraft: true }),
      { number: 'kaputt', title: 'ohne Nummer', url: 'https://github.com/o/r/pull/1' },
      { number: 63, title: 'boese URL', url: 'javascript:alert(1)' }
    ]
  });
  const text = kontext(runHook(a.state, { env: prEnv(a.stub) }));
  assert.match(text, /#62 Entwurf-PR \*\(Entwurf\)\*/);
  assert.equal(/ohne Nummer/.test(text), false, 'Eintraege ohne belegte Nummer fallen heraus');
  assert.equal(/javascript:/.test(text), false, 'nur https-URLs gehen in den Kontext');
});

test('PR: der Hinweis liefert seine eigene Abschaltung nicht mit', () => {
  const a = prAufbau({ kernPrs: [pr(62, 'X', 'o/r')] });
  const text = kontext(runHook(a.state, { env: prEnv(a.stub) }));
  assert.equal(/NC_PR_CHECK/.test(text), false,
    'ein Hinweis, der seinen Opt-out mitliefert, erzieht zum Abschalten (Muster der Mahnung)');
});
