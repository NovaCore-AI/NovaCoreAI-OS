// Tests fuer den Pfad-Zeiger der Disziplin-Schicht
// (plugins/nc/hooks/nc-pfad-hinweis.js; Port des Onsite-Hooks oai-pfad-hinweis.js,
// Spec §15.49 / Delta-Mapping-Position D5, Phase H Paket C).
//
// Zwei Dinge werden geprueft, und das zweite ist das wichtigere:
//   (1) dass der Hook die Aenderungs-Matrix-Zeile beilegt, WENN eine Pfadklasse zum ersten
//       Mal in der Sitzung geschrieben wird;
//   (2) dass er sonst SCHWEIGT. Er sitzt auf JEDER Schreibaktion — ein Hook, der dort bei
//       jedem Aufruf etwas injiziert, wird abgeschaltet und ist dann wertlos.
//
// ABGRENZUNG, die jeder Test mittraegt: Das ist KEIN Gate. Exit-Code 2 BLOCKT bei PreToolUse
// laut Doku den Werkzeugaufruf. Es gibt deshalb keinen Test, der eine Blockade erwartet — im
// Gegenteil pruefen alle Pfade zusaetzlich, dass der Exit-Code 0 ist und nie 2 wird und dass
// niemals ein permissionDecision gesetzt ist (weder deny noch allow: 'allow' wuerde den
// Freigabefluss des Menschen ueberspringen).
//
// Der Hook ist in hooks.json registriert (PreToolUse); diese Tests rufen die
// Hook-Datei dennoch direkt auf — Black-Box je Lauf, unabhaengig vom Plugin-Loader.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.join(HIER, '..');
const REPO_ROOT = path.join(HIER, '..', '..', '..');
const HOOK = path.join(PLUGIN_ROOT, 'hooks', 'nc-pfad-hinweis.js');
const ECHT_INDEX = path.join(PLUGIN_ROOT, 'hooks', 'pfad-aenderungsindex.json');
const MATRIX = path.join(REPO_ROOT, 'knowledge-base', 'standardprozesse', 'aktualisierungs-index.md');

function tmp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

const STANDARD_EINTRAEGE = [
  {
    id: 'hook',
    prefix: 'plugins/nc/hooks/',
    titel: 'Hook',
    matrixKey: 'Hook neu/geändert',
    lesen: 'Gates-Definition · bestehender Hook-Code',
    mitziehen: 'hooks.json · README.md · Tests'
  },
  {
    id: 'hook-lib',
    prefix: 'plugins/nc/hooks/lib/',
    titel: 'Hook-Bibliothek',
    matrixKey: 'Hook neu/geändert',
    lesen: 'kern-plugin-bau.md §2b (Drift-Ritual)',
    mitziehen: 'alle aufrufenden Hooks'
  },
  {
    id: 'wissen',
    prefix: 'knowledge-base/',
    titel: 'Wissensdatei',
    matrixKey: 'Wissensdatei neu',
    lesen: 'SSOT-Document-Index Teil 1',
    mitziehen: 'Zeile in Teil 2'
  }
];

/**
 * Vollstaendige Testumgebung: OS-Repo-Attrappe, Infra-Registry, Index, Marker-Verzeichnis.
 * Der Hook spricht nur ueber die Registry — deshalb muss jede Fixture ein reales Verzeichnis
 * anlegen, sonst prueft der Test nur den Schweige-Pfad.
 */
function fixture(opts = {}) {
  const wurzel = tmp('nc-pfad-test-');
  const repo = path.join(wurzel, 'os-repo');
  fs.mkdirSync(path.join(repo, 'plugins', 'nc', 'hooks', 'lib'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'knowledge-base'), { recursive: true });

  const stateDir = path.join(wurzel, 'state');
  fs.mkdirSync(stateDir, { recursive: true });
  if (opts.registry !== null) {
    fs.writeFileSync(
      path.join(stateDir, 'infra.json'),
      JSON.stringify(opts.registry || { schemaVersion: 1, kernRepoPfad: repo }, null, 2),
      'utf8'
    );
  }

  const indexDatei = path.join(wurzel, 'pfad-index.json');
  fs.writeFileSync(indexDatei, JSON.stringify({
    schemaVersion: opts.schemaVersion || 1,
    eintraege: opts.eintraege || STANDARD_EINTRAEGE
  }, null, 2), 'utf8');

  return { wurzel, repo, stateDir, indexDatei, sessionDir: path.join(wurzel, 'sessions') };
}

function runHook(fx, { input = {}, env = {} } = {}) {
  const res = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    env: {
      ...process.env,
      NC_PFAD_HINWEIS: '',
      NC_PFAD_INDEX: fx.indexDatei,
      NC_PFAD_STATE_DIR: fx.stateDir,
      NC_PFAD_SESSION_DIR: fx.sessionDir,
      ...env
    }
  });
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

/** Schreibaufruf auf eine repo-relative Datei. */
function schreibAufruf(fx, relPfad, sessionId = 'sitzung-1') {
  return {
    session_id: sessionId,
    tool_name: 'Write',
    tool_input: { file_path: path.join(fx.repo, ...relPfad.split('/')) }
  };
}

/** Gemeinsame Zusicherung jedes Laufs: nie ein Gate. */
function niemalsGate(ergebnis) {
  assert.notEqual(ergebnis.status, 2, 'Exit 2 wuerde den Werkzeugaufruf blocken');
  assert.equal(ergebnis.status, 0, 'der Hook endet immer mit Exit-Code 0');
  assert.ok(!/permissionDecision/.test(ergebnis.stdout),
    'permissionDecision darf nie gesetzt werden — weder deny noch allow');
}

function payload(ergebnis) {
  if (!ergebnis.stdout.trim()) return null;
  return JSON.parse(ergebnis.stdout);
}

// --- Positivfall -----------------------------------------------------------------------

test('Erste Schreibaktion einer Pfadklasse legt die Matrix-Zeile bei', () => {
  const fx = fixture();
  const erg = runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/neu.js') });
  niemalsGate(erg);
  const out = payload(erg);
  assert.ok(out, 'die erste Schreibaktion muss etwas injizieren');
  assert.equal(out.hookSpecificOutput.hookEventName, 'PreToolUse');
  const text = out.hookSpecificOutput.additionalContext;
  assert.match(text, /Hook neu\/geändert/, 'die Matrix-Zeile muss woertlich genannt sein');
  assert.match(text, /vorher lesen/, 'die Pflichtlektuere gehoert dazu');
  assert.match(text, /mitziehen/, 'der Nachzugsumfang gehoert dazu');
  assert.match(text, /aktualisierungs-index\.md/, 'die Quelle muss benannt sein');
  assert.match(text, /blockiert nichts/, 'die Nicht-Gate-Zusage steht im Text');
});

test('Zweite Schreibaktion derselben Klasse schweigt (einmal je Sitzung)', () => {
  const fx = fixture();
  const erst = runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/a.js') });
  assert.ok(payload(erst), 'Vorbedingung: der erste Lauf meldet');
  const zweit = runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/b.js') });
  niemalsGate(zweit);
  assert.equal(zweit.stdout.trim(), '', 'dieselbe Klasse darf kein zweites Mal melden');
});

test('Andere Sitzung meldet dieselbe Klasse erneut', () => {
  const fx = fixture();
  runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/a.js', 'sitzung-1') });
  const andere = runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/a.js', 'sitzung-2') });
  niemalsGate(andere);
  assert.ok(payload(andere), 'eine neue Sitzung faengt bei null an');
});

test('Laengster Prefix gewinnt — lib bekommt die Bibliotheks-Zeile, nicht die Hook-Zeile', () => {
  // Ohne diese Regel waere der Index eine Reihenfolgen-Falle: 'plugins/nc/hooks/' passt
  // ebenfalls auf jede Datei unter hooks/lib/.
  const fx = fixture();
  const erg = runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/lib/neu.js') });
  niemalsGate(erg);
  const text = payload(erg).hookSpecificOutput.additionalContext;
  assert.match(text, /Hook-Bibliothek/);
  assert.match(text, /Drift-Ritual/, 'die spezifischere Pflichtlektuere muss gewinnen');
});

// --- MultiEdit-Union -------------------------------------------------------------------

test('MultiEdit ueber mehrere Klassen meldet die Union, hoechstens drei Zeilen', () => {
  const fx = fixture();
  const erg = runHook(fx, {
    input: {
      session_id: 'multi',
      tool_name: 'MultiEdit',
      tool_input: {
        edits: [
          { file_path: path.join(fx.repo, 'plugins', 'nc', 'hooks', 'x.js') },
          { file_path: path.join(fx.repo, 'knowledge-base', 'neu.md') },
          { file_path: path.join(fx.repo, 'plugins', 'nc', 'hooks', 'y.js') }
        ]
      }
    }
  });
  niemalsGate(erg);
  const text = payload(erg).hookSpecificOutput.additionalContext;
  assert.match(text, /Hook neu\/geändert/);
  assert.match(text, /Wissensdatei neu/);
  const zeilen = text.split('\n').filter((z) => z.startsWith('- **'));
  assert.ok(zeilen.length <= 3, `hoechstens drei Klassen je Aufruf, waren ${zeilen.length}`);
  assert.equal(zeilen.length, 2, 'dieselbe Klasse wird in der Union nicht doppelt gefuehrt');
});

test('NotebookEdit wird ueber notebook_path erfasst', () => {
  const fx = fixture();
  const erg = runHook(fx, {
    input: {
      session_id: 'nb',
      tool_name: 'NotebookEdit',
      tool_input: { notebook_path: path.join(fx.repo, 'knowledge-base', 'x.ipynb') }
    }
  });
  niemalsGate(erg);
  assert.match(payload(erg).hookSpecificOutput.additionalContext, /Wissensdatei neu/);
});

// --- Schweige-Pfade --------------------------------------------------------------------

test('Datei ausserhalb des OS-Repos: Schweigen (Plugin-Grenze)', () => {
  const fx = fixture();
  const fremd = path.join(fx.wurzel, 'fremdes-repo', 'plugins', 'nc', 'hooks', 'a.js');
  const erg = runHook(fx, {
    input: { session_id: 's', tool_name: 'Write', tool_input: { file_path: fremd } }
  });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '', 'die Aenderungs-Matrix gilt nur im OS-Repo');
});

test('Praefix-Nachbar wird nicht faelschlich als Repo-Inhalt gewertet', () => {
  // `/…/os-repo-alt/x` beginnt als String mit `/…/os-repo` — der Vergleich laeuft deshalb
  // ueber path.relative, nicht ueber Stringpraefixe.
  const fx = fixture();
  const nachbar = fx.repo + '-alt';
  fs.mkdirSync(path.join(nachbar, 'plugins', 'nc', 'hooks'), { recursive: true });
  const erg = runHook(fx, {
    input: {
      session_id: 's',
      tool_name: 'Write',
      tool_input: { file_path: path.join(nachbar, 'plugins', 'nc', 'hooks', 'a.js') }
    }
  });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '', 'ein Praefix-Nachbar ist nicht das Repo');
});

test('Pfad ohne Klasse: Schweigen', () => {
  const fx = fixture();
  const erg = runHook(fx, { input: schreibAufruf(fx, 'irgendwas/beliebig.txt') });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '', 'nicht klassifizierte Pfade erzeugen kein Rauschen');
});

test('Aufruf ohne Zieldatei (z. B. Bash): Schweigen — benannte Luecke', () => {
  const fx = fixture();
  const erg = runHook(fx, {
    input: { session_id: 's', tool_name: 'Bash', tool_input: { command: 'echo x > datei.md' } }
  });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '',
    'Bash steht bewusst nicht im Matcher — der Hook raet keinen Pfad aus einem Kommando');
});

test('Fehlende Infra-Registry: Schweigen', () => {
  const fx = fixture({ registry: null });
  const erg = runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/a.js') });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '', 'ohne Registry lief das Setup nie — kein Befund');
});

test('Registry ohne kernRepoPfad: Schweigen (optionales Queue-Flow-Feld)', () => {
  // NovaCore-Besonderheit: `kernRepoPfad` ist laut infra-registry.md optional. Fehlt es,
  // darf der Hook NICHT auf kernSsotPfad (Lesekopie) oder einen geratenen Pfad ausweichen.
  const fx = fixture({
    registry: { schemaVersion: 1, kernSsotPfad: 'C:\\irgendwo\\ssot\\NovaCoreAI-OS' }
  });
  const erg = runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/a.js') });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '', 'ohne kernRepoPfad wird kein Repo-Pfad geraten');
});

test('Registry zeigt auf ein totes Verzeichnis: Schweigen', () => {
  const fx = fixture();
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'),
    JSON.stringify({ schemaVersion: 1, kernRepoPfad: path.join(fx.wurzel, 'gibt-es-nicht') }),
    'utf8');
  const erg = runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/a.js') });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '', 'ein toter Registry-Eintrag fuehrt zum Schweigen');
});

test('Registry mit ausstehendem Pfad: Schweigen', () => {
  const fx = fixture({ registry: { schemaVersion: 1, kernRepoPfad: 'ausstehend' } });
  const erg = runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/a.js') });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '', '"ausstehend" ist kein Pfad');
});

test('Registry mit hoeherer schemaVersion: Schweigen statt Raten', () => {
  const fx = fixture();
  fs.writeFileSync(path.join(fx.stateDir, 'infra.json'),
    JSON.stringify({ schemaVersion: 99, kernRepoPfad: fx.repo }), 'utf8');
  const erg = runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/a.js') });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '', 'unbekanntes Registry-Schema wird nicht interpretiert');
});

test('Defekter Index: Schweigen', () => {
  const fx = fixture();
  fs.writeFileSync(fx.indexDatei, '{ kaputt', 'utf8');
  const erg = runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/a.js') });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '', 'ein defekter Index darf keine Sitzung stoeren');
});

test('Index mit hoeherer schemaVersion: Schweigen statt Raten', () => {
  const fx = fixture({ schemaVersion: 99 });
  const erg = runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/a.js') });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '', 'unbekanntes Index-Schema wird nicht interpretiert');
});

test('Defekter Sitzungsmarker zaehlt als "schon gemeldet"', () => {
  // Fehlerrichtung wie beim Mahn-Marker: ein kaputter State darf nie zu Rauschen bei JEDER
  // Schreibaktion fuehren.
  const fx = fixture();
  fs.mkdirSync(fx.sessionDir, { recursive: true });
  fs.writeFileSync(path.join(fx.sessionDir, 'pfad-sitzung-1.json'), '{ kaputt', 'utf8');
  const erg = runHook(fx, { input: schreibAufruf(fx, 'plugins/nc/hooks/a.js') });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '', 'defekter Marker → schweigen, nicht wiederholen');
});

test('Nicht parsbares stdin: Schweigen ohne Fehler', () => {
  const fx = fixture();
  for (const roh of ['', 'kein json', '[]', 'null']) {
    const res = spawnSync(process.execPath, [HOOK], {
      input: roh,
      encoding: 'utf8',
      env: {
        ...process.env,
        NC_PFAD_HINWEIS: '',
        NC_PFAD_INDEX: fx.indexDatei,
        NC_PFAD_STATE_DIR: fx.stateDir,
        NC_PFAD_SESSION_DIR: fx.sessionDir
      }
    });
    assert.equal(res.status, 0, `stdin ${JSON.stringify(roh)} darf nicht zu Exit != 0 fuehren`);
    assert.equal((res.stdout || '').trim(), '');
  }
});

// --- Opt-out und Subagenten -------------------------------------------------------------

test('NC_PFAD_HINWEIS=off schaltet den Hook ab', () => {
  for (const wert of ['off', '0', 'false', 'disabled', 'OFF']) {
    const fx = fixture();
    const erg = runHook(fx, {
      input: schreibAufruf(fx, 'plugins/nc/hooks/a.js'),
      env: { NC_PFAD_HINWEIS: wert }
    });
    niemalsGate(erg);
    assert.equal(erg.stdout.trim(), '', `Opt-out-Wert "${wert}" muss greifen`);
  }
});

test('Subagenten sind ausgenommen — der Parent fuehrt die Sitzung', () => {
  const fx = fixture();
  const aufruf = schreibAufruf(fx, 'plugins/nc/hooks/a.js');
  const erg = runHook(fx, {
    input: { ...aufruf, agent_id: 'a-123', agent_type: 'general-purpose' }
  });
  niemalsGate(erg);
  assert.equal(erg.stdout.trim(), '', 'Subagenten erhalten keinen eigenen Pfad-Zeiger');
});

// --- Ausgelieferter Index: die zwei Drift-Invarianten ------------------------------------
// Drift-Sicherung der Disziplin-Schicht. Zwei Richtungen, beide noetig: Ein prefix ohne
// realen Einstieg zeigt ins Leere; ein matrixKey, den die Aenderungs-Matrix nicht kennt,
// verspricht eine Zeile, die es nicht gibt — und genau das waere schlimmer als kein Hinweis,
// weil er wie eine Auskunft aussieht.

test('Pfad-Änderungsindex: wohlgeformt und eindeutig', () => {
  const daten = JSON.parse(fs.readFileSync(ECHT_INDEX, 'utf8'));
  assert.equal(daten.schemaVersion, 1,
    'Pfad-Index-Schema geaendert? Dann auch nc-pfad-hinweis.js nachziehen');
  assert.ok(Array.isArray(daten.eintraege) && daten.eintraege.length > 0,
    'Pfad-Index ohne Eintraege');
  const ids = new Set();
  const prefixe = new Set();
  for (const e of daten.eintraege) {
    for (const feld of ['id', 'prefix', 'titel', 'matrixKey', 'lesen', 'mitziehen']) {
      assert.ok(typeof e[feld] === 'string' && e[feld].trim(),
        `Pfad-Index-Eintrag ohne ${feld}: ${JSON.stringify(e.id || e)}`);
    }
    assert.ok(!ids.has(e.id), `doppelte id: ${e.id}`);
    ids.add(e.id);
    assert.ok(!prefixe.has(e.prefix), `doppeltes prefix: ${e.prefix}`);
    prefixe.add(e.prefix);
    assert.ok(!e.prefix.startsWith('/') && !e.prefix.includes('\\'),
      `prefix muss repo-relativ mit / sein: ${e.prefix}`);
  }
});

test('Drift-Invariante 1: jeder prefix trifft einen real existierenden Einstieg', () => {
  const daten = JSON.parse(fs.readFileSync(ECHT_INDEX, 'utf8'));
  for (const e of daten.eintraege) {
    // Ein prefix ist dreierlei: ein Verzeichnis (endet auf /), eine Datei — oder ein
    // NAMENSTEIL, mit dem eine Gruppe zusammengefasst wird. Der dritte Fall existiert nicht
    // als Pfad, deshalb wird er gegen das Elternverzeichnis geprueft: Es muss mindestens
    // einen Eintrag geben, der so beginnt. Ohne diese Pruefung waere ein Tippfehler im
    // Namensteil unsichtbar.
    const teile = e.prefix.replace(/\/+$/, '').split('/').filter(Boolean);
    const ziel = path.join(REPO_ROOT, ...teile);
    if (fs.existsSync(ziel)) continue;
    const eltern = path.join(REPO_ROOT, ...teile.slice(0, -1));
    const rumpf = teile[teile.length - 1];
    assert.ok(fs.existsSync(eltern),
      `Pfad-Index ${e.id}: weder "${e.prefix}" noch dessen Elternverzeichnis existiert`);
    assert.ok(fs.readdirSync(eltern).some((n) => n.startsWith(rumpf)),
      `Pfad-Index ${e.id}: Namensteil "${e.prefix}" trifft in `
      + `${teile.slice(0, -1).join('/')} keinen einzigen Eintrag — toter Einstieg oder Tippfehler`);
  }
});

test('Drift-Invariante 2: jeder matrixKey steht als Fett-Anker in der Änderungs-Matrix', () => {
  const daten = JSON.parse(fs.readFileSync(ECHT_INDEX, 'utf8'));
  const text = fs.readFileSync(MATRIX, 'utf8');
  const von = text.indexOf('## 2. Änderungs-Matrix');
  const bis = text.indexOf('## 3. Version, Release');
  assert.ok(von >= 0 && bis > von,
    'Abschnitt 2 (Änderungs-Matrix) im Aktualisierungs-Index nicht gefunden — '
    + 'Ueberschrift umbenannt? Dann diese Invariante nachziehen');
  const matrix = text.slice(von, bis);
  for (const e of daten.eintraege) {
    assert.ok(matrix.includes('**' + e.matrixKey + '**'),
      `Pfad-Index ${e.id}: matrixKey "${e.matrixKey}" kommt in der Änderungs-Matrix (§2) nicht `
      + 'als Fett-Anker vor — der Hook verspräche eine Zeile, die es nicht gibt');
  }
});

test('Der ausgelieferte Index traegt den Hook: eine echte Pfadklasse greift', () => {
  // Gegenprobe mit dem AUSGELIEFERTEN Index statt der Fixture-Attrappe: Ein Schreibzugriff
  // auf eine reale Pfadklasse muss die zugehoerige Matrix-Zeile beilegen.
  const wurzel = tmp('nc-pfad-echt-');
  const stateDir = path.join(wurzel, 'state');
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(path.join(stateDir, 'infra.json'),
    JSON.stringify({ schemaVersion: 1, kernRepoPfad: REPO_ROOT }), 'utf8');
  const fx = {
    wurzel,
    repo: REPO_ROOT,
    stateDir,
    indexDatei: ECHT_INDEX,
    sessionDir: path.join(wurzel, 'sessions')
  };
  const erg = runHook(fx, { input: schreibAufruf(fx, 'knowledge-base/grundwissen/probe.md') });
  niemalsGate(erg);
  const text = payload(erg).hookSpecificOutput.additionalContext;
  assert.match(text, /Wissensdatei neu/, 'die Wissens-Klasse muss greifen');
  assert.match(text, /SSOT-Document-Index/, 'die Pflichtlektuere der Zeile muss genannt sein');
});
