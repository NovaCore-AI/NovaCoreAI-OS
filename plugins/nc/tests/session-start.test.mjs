// Tests fuer den Session-Start-Zwang (plugins/nc/hooks/nc-session-start.js, Gate 2 Teil 1;
// Bauplan 2026-08-10 „Onsite-Align-Umbau", AP2). Der Hook injiziert Kontext und kann laut
// offizieller Doku NICHT blocken — geprueft wird also: bedingungslose Aktivierung (KEIN
// Marker mehr), Inhalt (Pflicht-Einstieg + Stand), Robustheit (fehlende Quellen, defekte
// Eingabe, kein Git) und der Env-Opt-out. Jeder Fall bekommt ein eigenes Fixture-Verzeichnis.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const HOOK = path.join(HIER, '..', 'hooks', 'nc-session-start.js');
const PLUGIN_ROOT = path.join(HIER, '..');

/** Frisches Fixture-Verzeichnis mit optionalen Dateien (relativer Pfad → Inhalt). */
function fixture(extra = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nc-start-'));
  for (const [rel, inhalt] of Object.entries(extra)) {
    const ziel = path.join(dir, rel);
    fs.mkdirSync(path.dirname(ziel), { recursive: true });
    fs.writeFileSync(ziel, inhalt, 'utf8');
  }
  return dir;
}

/** Hook ausfuehren. Gibt { status, stdout, ausgabe } zurueck; `ausgabe` = geparstes JSON | null. */
function runHook(cwd, { stdin, env = {} } = {}) {
  const eingabe = stdin === undefined
    ? JSON.stringify({ session_id: 'test', cwd, source: 'startup', hook_event_name: 'SessionStart' })
    : stdin;
  const kindEnv = { ...process.env, CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT };
  // Muss weg: ein geerbtes CLAUDE_PROJECT_DIR wuerde das Fixture-Scoping aushebeln, ein
  // geerbtes NC_START_GATE=off (dokumentierte Koexistenz-Empfehlung) die ganze Suite
  // aushebeln — sie waere rot, ohne dass am Code etwas falsch ist.
  delete kindEnv.CLAUDE_PROJECT_DIR;
  delete kindEnv.NC_START_GATE;
  Object.assign(kindEnv, env);

  const r = spawnSync(process.execPath, [HOOK], {
    cwd, input: eingabe, encoding: 'utf8', env: kindEnv
  });
  const stdout = (r.stdout || '').trim();
  let ausgabe = null;
  if (stdout) {
    try { ausgabe = JSON.parse(stdout); } catch (_) { ausgabe = 'UNPARSEBAR'; }
  }
  return { status: r.status, stdout, ausgabe };
}

/** Kontext eines erfolgreichen Laufs. */
function kontextVon(dir, opts) {
  const { status, ausgabe } = runHook(dir, opts);
  assert.equal(status, 0);
  assert.notEqual(ausgabe, 'UNPARSEBAR', 'Ausgabe muss gueltiges JSON sein');
  assert.ok(ausgabe && ausgabe.hookSpecificOutput, 'hookSpecificOutput fehlt');
  assert.equal(ausgabe.hookSpecificOutput.hookEventName, 'SessionStart');
  return ausgabe.hookSpecificOutput.additionalContext;
}

test('Aktiv ohne jede Marker-Datei (Aktivierungsbedingung ist die Installation)', () => {
  // Regression gegen den gestrichenen `.nc-os`-Marker: ein leeres Verzeichnis ohne
  // Marker, ohne Git, ohne Repo-Quellen muss den Regelblock trotzdem liefern.
  const kontext = kontextVon(fixture());
  assert.match(kontext, /Pflicht-Einstieg/);
  assert.ok(!/\.nc-os/.test(kontext), 'der Marker darf nirgends mehr erwaehnt werden');
});

test('Injiziert Pflicht-Einstieg, rote Linien und die Kern-Version', () => {
  const kontext = kontextVon(fixture());
  assert.match(kontext, /\/nc:start/, 'muss auf das Start-Ritual verweisen');
  assert.match(kontext, /Rote Linien/, 'muss die roten Linien nennen');
  assert.match(kontext, /Kein Commit\/Push ohne/, 'muss die Freigabe-Regel nennen');
  assert.match(kontext, /0\.\d+\.\d+/, 'muss die Version des Kern-Plugins nennen');
});

test('Injiziert den Stempel-Befehl samt Session-Schluessel (Zangen-Prinzip)', () => {
  const kontext = kontextVon(fixture());
  assert.match(kontext, /nc-start-stempel\.js/, 'Stempel-Skript fehlt im Hinweis');
  assert.match(kontext, /--session test/, 'Session-Schluessel fehlt im Stempel-Befehl');
  assert.match(kontext, /--branch <branch> --head <head>/, 'Fakten-Argumente fehlen');
});

test('Trägt den Red-Flags-Block der Disziplin-Schicht, knapp (Phase H, D5)', () => {
  // Anti-Rationalisierung, KEIN Skill-Katalog: geprueft werden die drei Saetze, mit denen der
  // Standardprozess uebersprungen wird — und das Laengenbudget, weil dieser Block in JEDER
  // Sitzung Dauerkontext kostet. Die Superpowers-1%-Regel wird bewusst nicht uebernommen.
  const kontext = kontextVon(fixture());
  assert.match(kontext, /Red Flags/, 'der Block muss als solcher erkennbar sein');
  assert.match(kontext, /nur eine\s+Doku-Änderung/,
    'die Rationalisierung „nur Doku" muss benannt sein');
  assert.match(kontext, /ich kenne die Struktur/);
  assert.match(kontext, /zu klein für den Standardprozess/);
  assert.match(kontext, /\/nc:wissen-aendern/,
    'der Wissens-Router bleibt der benannte Ausweg');

  const zeile = kontext.split('\n').find((z) => z.includes('Red Flags'));
  assert.ok(zeile.length <= 400,
    `der Red-Flags-Block muss unter 400 Zeichen bleiben, war ${zeile.length}`);
});

test('NC_START_GATE=off schaltet den Hook ab', () => {
  for (const wert of ['off', '0', 'false', 'disabled', 'OFF']) {
    const { status, stdout } = runHook(fixture(), { env: { NC_START_GATE: wert } });
    assert.equal(status, 0);
    assert.equal(stdout, '', `NC_START_GATE=${wert} muss den Hook abschalten`);
  }
});

test('Fehlende Repo-Quellen brechen den Hook nicht (fremdes Repo ohne knowledge-base)', () => {
  const kontext = kontextVon(fixture());
  assert.ok(!/Laufende Vorhaben/.test(kontext),
    'ohne grundwissen/-Ordner darf der Abschnitt nicht erscheinen');
  assert.ok(!/Unreleased/.test(kontext), 'ohne CHANGELOG darf der Abschnitt nicht erscheinen');
  assert.ok(!/Abteilungen und Module/.test(kontext),
    'ohne Registry darf der Abschnitt nicht erscheinen');
});

test('Vorhandene Quellen landen im Kontext (VERSION, CHANGELOG, Registry)', () => {
  const dir = fixture({
    'VERSION': '9.9.9\n',
    'CHANGELOG.md': '# Changelog\n\n## [Unreleased]\n\n### Added\n\n- **Testeintrag** mit Prosa\n  Fortsetzungszeile die nicht erscheinen darf\n\n## [0.1.0] — 2026-01-01\n- alt\n',
    'plugins/nc/module-registry.json': JSON.stringify({
      version: '9.9.9',
      abteilungen: [
        { name: 'gemeinsam', namespace: '/nc:', staendig: true, module: { core: 'x', _weiteres: 'y' } },
        { name: 'development', namespace: '/nc-development:', module: { fe: 'a', be: 'b' } }
      ]
    })
  });
  const kontext = kontextVon(dir);
  assert.match(kontext, /9\.9\.9/, 'Leitversion aus VERSION fehlt');
  assert.match(kontext, /Testeintrag/, 'Rubrik-/Bullet-Zeile des CHANGELOG fehlt');
  assert.ok(!/Fortsetzungszeile/.test(kontext),
    'Prosa-Fortsetzungszeilen sind Rauschen und muessen wegfallen');
  assert.ok(!/\[0\.1\.0\]/.test(kontext), 'nur [Unreleased] darf ausgelesen werden');
  assert.match(kontext, /\/nc-development:/, 'Namespace aus der Registry fehlt');
  assert.match(kontext, /fe, be/, 'Modulliste aus der Registry fehlt');
  assert.ok(!/_weiteres/.test(kontext), 'Registry-Schluessel mit _ sind intern und gehoeren nicht rein');
});

// NovaCore-Mapping (Bauplan §2): kein Ordner „Aktive Baupläne" wie im Vorbild — gelistet
// werden die juengsten 5 datierten Dateien aus knowledge-base/grundwissen/.
test('Laufende Vorhaben: juengste 5 datierte Dateien aus aktive-bauplaene/, undatierte nie', () => {
  const dateien = {};
  for (const tag of ['01', '02', '03', '04', '05', '06']) {
    dateien['knowledge-base/aktive-bauplaene/2026-03-' + tag + '-plan-' + tag + '.md'] = 'x\n';
  }
  dateien['knowledge-base/aktive-bauplaene/UEBERSICHT.md'] = 'x\n';
  // Gegenprobe zum Phase-I-Schnitt (P-E1): grundwissen/ traegt seit dem Umzug nur noch
  // dauerhafte Referenzen und Design-Specs. Eine datierte Spec DORT ist KEIN laufendes
  // Vorhaben — laeuft der Hook wieder gegen die alte Quelle, schlaegt genau diese Zeile an.
  dateien['knowledge-base/grundwissen/2026-03-09-alte-spec.md'] = 'x\n';
  const kontext = kontextVon(fixture(dateien));

  assert.match(kontext, /Laufende Vorhaben/);
  assert.match(kontext, /aktive-bauplaene/, 'die Quelle muss im Abschnittstitel stehen');
  assert.match(kontext, /2026-03-06-plan-06\.md/, 'juengste Datei fehlt');
  assert.match(kontext, /2026-03-02-plan-02\.md/, 'fuenftjuengste Datei fehlt');
  assert.ok(!/2026-03-01-plan-01\.md/.test(kontext), 'hoechstens 5 Dateien');
  assert.ok(!/UEBERSICHT/.test(kontext),
    'undatierte Dateien sind keine laufenden Vorhaben');
  assert.ok(!/2026-03-09-alte-spec\.md/.test(kontext),
    'datierte Specs aus grundwissen/ sind seit P-E1 KEINE laufenden Vorhaben mehr');
});

test('Session-Start nennt den Nachzugs-Aufruf, prueft ihn aber nicht (AP-C6)', () => {
  // Der Hook soll den Aufruf BEKANNT machen — mehr nicht. Kein Gate, keine dritte
  // Faelligkeit, kein zweiter Speicherort: Die Erkennung liegt in /nc:start, das
  // Nachholen in /nc:end-session nachzug. Die Negativproben halten das fest.
  const kontext = kontextVon(fixture({ 'VERSION': '9.9.9\n' }));
  assert.match(kontext, /end-session nachzug/,
    'der Nachzugs-Aufruf muss im Pflicht-Einstieg genannt sein');
  assert.ok(!/faellig seit|ueberfaellig|Tage ohne Abschluss/i.test(kontext),
    'der Hook darf KEINE Faelligkeit berechnen — das waere die dritte Faelligkeit');
  assert.ok(!/permissionDecision/.test(kontext),
    'der Hook bleibt ein Injektor, kein Gate');
});

test('Repo-Wurzel wird aus einem Unterverzeichnis gefunden (Git-Toplevel)', () => {
  const wurzel = fixture({ 'VERSION': '7.7.7\n' });
  if (spawnSync('git', ['-C', wurzel, 'init', '-q'], { encoding: 'utf8' }).status !== 0) return;
  const tief = path.join(wurzel, 'plugins', 'nc', 'skills');
  fs.mkdirSync(tief, { recursive: true });
  const kontext = kontextVon(tief);
  assert.match(kontext, /7\.7\.7/,
    'VERSION der Repo-Wurzel muss auch aus einem Unterordner gelesen werden');
});

test('Defekte Eingabe blockt nichts (fail-open, Exit 0)', () => {
  const dir = fixture();
  for (const stdin of ['', 'kein json', '[]', 'null']) {
    const { status } = runHook(dir, { stdin });
    assert.equal(status, 0, `Eingabe ${JSON.stringify(stdin)} darf nicht zu Exit != 0 fuehren`);
  }
});

test('Umlaut-Pfade erscheinen lesbar (core.quotepath=false)', () => {
  const dir = fixture();
  if (spawnSync('git', ['-C', dir, 'init', '-q'], { encoding: 'utf8' }).status !== 0) return;
  fs.writeFileSync(path.join(dir, 'Bauplän.md'), 'x\n', 'utf8');
  const kontext = kontextVon(dir);
  assert.ok(!/\\303/.test(kontext), 'git darf Nicht-ASCII-Pfade nicht oktal-escaped liefern');
});
