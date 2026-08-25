// Tests fuer den Setup-Hinweis-Hook (Port Onsite oai-setup-hinweis.test.mjs@a9927b2,
// Mapping D32, Bauplan Phase J AP A5). SessionStart, KEIN Gate. Zwei Kernfragen:
//   (1) injiziert er die Anweisung zum Handeln, WENN der Setup-Beleg fehlt/defekt ist;
//   (2) schweigt er bei gruenem Beleg und innerhalb einer Sitzung nach dem ersten Mal.
//
// NC-ABWEICHUNGEN VOM VORBILD (Schema, infra-registry.md): `abteilungen` ist eine LISTE
// (nicht das Onsite-Einzelfeld `abteilung`), `abteilungsRepoPfade` ist eine MAP (nicht
// das Onsite-Einzelfeld `abteilungsRepoPfad`), und `kernRepoPfad` DARF „ausstehend" sein
// (seit AP A3 schreibt /nc:setup es auch ohne lokalen Arbeitsklon) — beim Vorbild war
// nur das Abteilungsfeld ausstehend-faehig.
//
// ABGRENZUNG, die jeder Test mittraegt: Das ist KEIN Gate (J-3). Exit-Code 2 waere eine
// Blockade, permissionDecision ein Eingriff in den Freigabefluss — beides darf nie
// vorkommen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const HOOK = path.join(HIER, '..', 'hooks', 'nc-setup-hinweis.js');

function tmp(prefix) { return fs.mkdtempSync(path.join(os.tmpdir(), prefix)); }

/**
 * Vollstaendige Testumgebung: zwei Klon-Attrappen (mit .git), Registry- und
 * Sitzungs-Verzeichnis. Der Hook spricht NUR ueber die Registry-Attrappe —
 * ohne echte Verzeichnisse wuerde jeder Test nur den defekt-Pfad sehen.
 */
function fixture(opts = {}) {
  const wurzel = tmp('nc-setup-test-');
  const kern = path.join(wurzel, 'kern-repo');
  const satellit = path.join(wurzel, 'abt-repo');
  fs.mkdirSync(kern, { recursive: true });
  fs.mkdirSync(satellit, { recursive: true });
  if (opts.gitDir !== false) {
    fs.mkdirSync(path.join(kern, '.git'), { recursive: true });
    fs.mkdirSync(path.join(satellit, '.git'), { recursive: true });
  }
  const stateDir = path.join(wurzel, 'state');
  fs.mkdirSync(stateDir, { recursive: true });
  if (opts.registry) {
    fs.writeFileSync(path.join(stateDir, 'infra.json'),
      typeof opts.registry === 'string' ? opts.registry : JSON.stringify(opts.registry, null, 2), 'utf8');
  }
  return { wurzel, kern, satellit, stateDir, sessionDir: path.join(wurzel, 'sessions') };
}

const GESUNDE_REGISTRY = (fx) => ({
  schemaVersion: 1, abteilungen: ['development'], szenario: 'windows',
  kernRepoPfad: fx.kern, abteilungsRepoPfade: { development: fx.satellit }
});

function runHook(fx, { input = {}, env = {} } = {}) {
  const res = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify(input), encoding: 'utf8',
    env: { ...process.env,
      NC_SETUP_STATE_DIR: fx.stateDir,
      NC_SETUP_SESSION_DIR: fx.sessionDir, ...env }
  });
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

const START_INPUT = { session_id: 'sitzung-1', source: 'startup', cwd: '/egal' };

/** Gemeinsame Zusicherung jedes Laufs: nie ein Gate (J-3). */
function niemalsGate(erg) {
  assert.notEqual(erg.status, 2, 'Exit 2 waere eine Blockade');
  assert.equal(erg.status, 0, 'Hook endet immer mit Exit-Code 0');
  assert.ok(!/permissionDecision/.test(erg.stdout),
    'permissionDecision darf nie gesetzt werden — weder deny noch allow');
}

function payload(erg) {
  return erg.stdout.trim() ? JSON.parse(erg.stdout) : null;
}

function text(erg) {
  const p = payload(erg);
  return (p && p.hookSpecificOutput && p.hookSpecificOutput.additionalContext) || '';
}

// --- T8: fehlt ----------------------------------------------------------------------------

test('T8 — Registry fehlt -> Anweisung mit Beleg, Event SessionStart, Exit 0', () => {
  const fx = fixture(); // keine infra.json
  const erg = runHook(fx, { input: START_INPUT });
  niemalsGate(erg);
  const p = payload(erg);
  assert.equal(p && p.hookSpecificOutput && p.hookSpecificOutput.hookEventName, 'SessionStart');
  const t = text(erg);
  assert.match(t, /infra\.json/);
  assert.match(t, /\/nc:setup/);
  assert.match(t, /\/nc:start/);
  assert.match(t, /NC_SETUP_HINWEIS=off/);
});

test('Unparsebares Registry-JSON -> wie fehlt', () => {
  const fx = fixture({ registry: '{kaputt' });
  assert.match(text(runHook(fx, { input: START_INPUT })), /\/nc:setup/);
});

// --- Opt-out --------------------------------------------------------------------------

test('NC_SETUP_HINWEIS=off -> stumm (je Schreibweise)', () => {
  for (const w of ['off', '0', 'false', 'disabled', 'disable', 'OFF']) {
    const fx = fixture();
    const erg = runHook(fx, { input: START_INPUT, env: { NC_SETUP_HINWEIS: w } });
    niemalsGate(erg);
    assert.equal(erg.stdout.trim(), '', 'stumm bei ' + w);
  }
});

// --- T13a: Subagent ---------------------------------------------------------------------

test('T13 — Subagent-Invocation -> stumm', () => {
  const fx = fixture();
  const erg = runHook(fx, { input: { ...START_INPUT, agent_id: 'a1' } });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '');
});

// --- T11: defekt --------------------------------------------------------------------------

test('T11 — toter kernRepoPfad -> defekt mit Pfad im Beleg', () => {
  const fx = fixture();
  const reg = GESUNDE_REGISTRY(fx);
  reg.kernRepoPfad = path.join(fx.wurzel, 'gibts-nicht');
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(reg));
  const t = text(runHook(fx, { input: START_INPUT }));
  assert.match(t, /defekt/);
  assert.match(t, /gibts-nicht/);
});

test('T11 — toter Eintrag in abteilungsRepoPfade -> defekt', () => {
  const fx = fixture();
  const reg = GESUNDE_REGISTRY(fx);
  reg.abteilungsRepoPfade = { development: path.join(fx.wurzel, 'auch-nicht') };
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(reg));
  assert.match(text(runHook(fx, { input: START_INPUT })), /defekt/);
});

test('T11 — fehlendes Pflichtfeld -> defekt (schemaVersion/abteilungen/szenario)', () => {
  for (const feld of ['schemaVersion', 'abteilungen', 'szenario']) {
    const fx = fixture();
    const reg = GESUNDE_REGISTRY(fx);
    delete reg[feld];
    fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(reg));
    assert.match(text(runHook(fx, { input: START_INPUT })), /defekt/, feld);
  }
});

test('abteilungen nicht als Liste (String) -> defekt', () => {
  const fx = fixture();
  const reg = GESUNDE_REGISTRY(fx);
  reg.abteilungen = 'development';
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(reg));
  assert.match(text(runHook(fx, { input: START_INPUT })), /defekt/);
});

test('T11 — kernRepoPfad relativ/Deskriptor-Pfad -> defekt', () => {
  const fx = fixture();
  const reg = GESUNDE_REGISTRY(fx);
  reg.kernRepoPfad = '~/NovaCoreAI-OS';
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(reg));
  assert.match(text(runHook(fx, { input: START_INPUT })), /defekt/);
});

test('Pfadfeld fehlt ganz oder ist leer -> defekt', () => {
  for (const feld of ['kernRepoPfad']) {
    const fx = fixture();
    const reg = GESUNDE_REGISTRY(fx);
    delete reg[feld];
    fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(reg));
    assert.match(text(runHook(fx, { input: START_INPUT })), /defekt/, feld + ' fehlt');
    const fx2 = fixture();
    const reg2 = GESUNDE_REGISTRY(fx2);
    reg2[feld] = '';
    fs.writeFileSync(path.join(fx2.stateDir, 'infra.json'), JSON.stringify(reg2));
    assert.match(text(runHook(fx2, { input: START_INPUT })), /defekt/, feld + ' leer');
  }
});

test('Verzeichnis ohne .git -> „kein .git" statt „loest nicht auf" (ehrlicher Beleg)', () => {
  const fx = fixture({ gitDir: false });
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(GESUNDE_REGISTRY(fx)));
  const t = text(runHook(fx, { input: START_INPUT }));
  assert.match(t, /kein \.git unter/);
  assert.doesNotMatch(t, /loest nicht auf/);
});

// --- T9/T12: gruen --------------------------------------------------------------------

test('T9 — gesunde Registry -> stumm (null Ausgabe)', () => {
  const fx = fixture();
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(GESUNDE_REGISTRY(fx)));
  const erg = runHook(fx, { input: START_INPUT });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '');
});

test('T12 — kernRepoPfad „ausstehend" -> gruen (Uebergangszustand, NC-Abweichung vom Vorbild)', () => {
  const fx = fixture();
  const reg = GESUNDE_REGISTRY(fx);
  reg.kernRepoPfad = 'ausstehend';
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(reg));
  const erg = runHook(fx, { input: START_INPUT });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '');
});

test('leere abteilungen-Liste -> gruen (Uebergangszustand ohne Abteilung)', () => {
  const fx = fixture();
  const reg = GESUNDE_REGISTRY(fx);
  reg.abteilungen = [];
  delete reg.abteilungsRepoPfade;
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(reg));
  const erg = runHook(fx, { input: START_INPUT });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '');
});

test('Eintrag „ausstehend" in abteilungsRepoPfade -> gruen (stumm)', () => {
  const fx = fixture();
  const reg = GESUNDE_REGISTRY(fx);
  reg.abteilungsRepoPfade = { development: 'ausstehend' };
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(reg));
  const erg = runHook(fx, { input: START_INPUT });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '');
});

test('T12 — .git als DATEI (Worktree-Lage) -> gruen', () => {
  const fx = fixture({ gitDir: false });
  fs.writeFileSync(path.join(fx.kern, '.git'), 'gitdir: ../egal', 'utf8');
  fs.writeFileSync(path.join(fx.satellit, '.git'), 'gitdir: ../egal', 'utf8');
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(GESUNDE_REGISTRY(fx)));
  const erg = runHook(fx, { input: START_INPUT });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '');
});

test('T12 — Windows-8.3-Kurzpfad (Tilde) ist KEIN Relativpfad-Indiz -> gruen', () => {
  const fx = fixture();
  // Der 8.3-Kurzpfad selbst enthaelt eine Tilde, ist aber absolut — isAbsolute() muss
  // reichen, ohne die Tilde als Ausschlusskriterium zu behandeln.
  const kurzpfad = fx.kern.replace(path.basename(fx.kern), 'KERNRE~1');
  fs.mkdirSync(kurzpfad, { recursive: true });
  fs.mkdirSync(path.join(kurzpfad, '.git'), { recursive: true });
  const reg = GESUNDE_REGISTRY(fx);
  reg.kernRepoPfad = kurzpfad;
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(reg));
  const erg = runHook(fx, { input: START_INPUT });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '');
});

// --- T10: neuer -----------------------------------------------------------------------

test('T10 — schemaVersion hoeher (Zahl) -> Marketplace-Update statt Setup', () => {
  const fx = fixture();
  const reg = GESUNDE_REGISTRY(fx); reg.schemaVersion = 2;
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(reg));
  const t = text(runHook(fx, { input: START_INPUT }));
  assert.match(t, /Marketplace/);
  assert.doesNotMatch(t, /Anweisung zum Handeln/); // nicht der Setup-Weg
});

test('T10 — schemaVersion „2" als String -> ebenfalls neuer', () => {
  const fx = fixture();
  const reg = GESUNDE_REGISTRY(fx); reg.schemaVersion = '2';
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'), JSON.stringify(reg));
  assert.match(text(runHook(fx, { input: START_INPUT })), /Marketplace/);
});

// --- T13: Sitzungsmarker (kein Compact-Hijack) ------------------------------------------

test('T13 — zweiter Lauf gleicher Sitzung -> stumm; neuer Schluessel -> Anweisung', () => {
  const fx = fixture();
  const erst = runHook(fx, { input: START_INPUT });
  assert.match(text(erst), /\/nc:setup/);
  const zweit = runHook(fx, { input: START_INPUT }); // z. B. nach Compact (resume)
  niemalsGate(zweit);
  assert.equal(zweit.stdout.trim(), '', 'kein Compact-Hijack: hoechstens einmal je Sitzung');
  const dritt = runHook(fx, { input: { ...START_INPUT, session_id: 'sitzung-2' } });
  assert.match(text(dritt), /\/nc:setup/);
});

test('Marker aelter als TTL -> Anweisung erneut erlaubt', () => {
  const fx = fixture();
  runHook(fx, { input: START_INPUT });
  const m = path.join(fx.sessionDir, 'setup-sitzung-1.json');
  fs.writeFileSync(m, JSON.stringify({ last_active: Date.now() - 25 * 60 * 60 * 1000 }));
  assert.match(text(runHook(fx, { input: START_INPUT })), /\/nc:setup/);
});

test('T13 — defekter Marker -> Schweigen statt Rauschen (Noise-Safety)', () => {
  const fx = fixture();
  fs.mkdirSync(fx.sessionDir, { recursive: true });
  fs.writeFileSync(path.join(fx.sessionDir, 'setup-sitzung-1.json'), '{kaputt');
  const erg = runHook(fx, { input: START_INPUT });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '', 'kaputter Marker gilt als bereits gezeigt');
});

test('Unbeschreibbarer Marker -> stumm statt Wiederholung (Schwester-Konvention)', () => {
  const fx = fixture(); // Registry fehlt -> wuerde injizieren
  fs.writeFileSync(fx.sessionDir, 'kein-verzeichnis', 'utf8'); // Marker-Pfad unbeschreibbar
  const erg = runHook(fx, { input: START_INPUT });
  assert.equal(erg.status, 0);
  assert.equal(erg.stdout.trim(), '', 'Marker unbeschreibbar: lieber stumm als Dauer-Rauschen');
});

// --- fail-open --------------------------------------------------------------------------

test('Unlesbares State-Verzeichnis -> Exit 0, Session laeuft weiter (fail-open)', () => {
  const fx = fixture();
  fs.rmSync(fx.stateDir, { recursive: true, force: true });
  fs.writeFileSync(fx.stateDir, 'kein-verzeichnis', 'utf8'); // Pfad ist jetzt eine Datei
  const erg = runHook(fx, { input: START_INPUT });
  assert.equal(erg.status, 0, 'fail-open trotz kaputter Registry-Umgebung');
  assert.match(text(erg), /\/nc:setup/);
});
