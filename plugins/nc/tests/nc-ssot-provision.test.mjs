// Tests fuer die SSOT-Provisionierung (plugins/nc/skills/setup/ssot-provision.js,
// Bauplan 2026-08-10 „SSOT-Provisionierung", AP4).
//
// Alles laeuft gegen ein LOKAL erzeugtes file://-Origin-Repo — die Suite braucht damit
// weder Netz noch Zugangsdaten und funktioniert auch in der CI eines Forks. Geprueft wird,
// was im Betrieb wirklich schiefgehen kann: Erstanlage, Idempotenz, Fast-Forward,
// unversicherte lokale Arbeit, Divergenz, fehlender Wissenspfad, Registry-Auswahl
// (Satellit vs. Abteilung mit eigenem Wissen) und die Pfad-Eingrenzung der Ablage.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const SKRIPT = path.join(HIER, '..', 'skills', 'setup', 'ssot-provision.js');

function tmp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

// Inhalt vergleichen, nicht Zeilenenden: git normalisiert beim Checkout je nach
// core.autocrlf/.gitattributes des Rechners. Geprueft wird, ob der richtige STAND
// angekommen ist — CRLF vs. LF ist hier Rauschen.
function liesText(datei) {
  return fs.readFileSync(datei, 'utf8').replace(/\r\n/g, '\n');
}

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, 'git ' + args.join(' ') + ' fehlgeschlagen: ' + (r.stderr || ''));
  return (r.stdout || '').trim();
}

/** Origin-Repo mit Wissensbasis + einer Datei ausserhalb davon (Vollklon-Probe). */
function origin({ wissenspfad = 'knowledge-base', mitWissen = true } = {}) {
  const dir = tmp('nc-ssot-origin-');
  git(dir, ['init', '-q', '-b', 'main']);
  git(dir, ['config', 'user.email', 't@t']);
  git(dir, ['config', 'user.name', 't']);
  if (mitWissen) {
    fs.mkdirSync(path.join(dir, ...wissenspfad.split('/')), { recursive: true });
    fs.writeFileSync(path.join(dir, ...wissenspfad.split('/'), 'index.md'), 'stand eins\n', 'utf8');
  }
  // Ein VERZEICHNIS ausserhalb des Wissenspfads — es MUSS mit dem vollen Klon ankommen
  // (die SSOT-Skills verweisen auch auf Repo-Inhalt neben der Wissensbasis).
  fs.mkdirSync(path.join(dir, 'grossordner'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'grossordner', 'gross.md'), 'gehoert dazu\n', 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', 'eins']);
  return { dir, url: pathToFileURL(dir).href };
}

/** Falsche Plugin-Wurzel: plugin.json (Kern) + optionale Abteilungen in der Registry. */
function pluginWurzel(kernRepoUrl, abteilungen = []) {
  const dir = tmp('nc-ssot-plugin-');
  fs.mkdirSync(path.join(dir, '.claude-plugin'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.claude-plugin', 'plugin.json'),
    JSON.stringify({ name: 'nc', version: '0.6.0', repository: kernRepoUrl }, null, 2), 'utf8');
  fs.writeFileSync(path.join(dir, 'module-registry.json'),
    JSON.stringify({ version: '0.6.0', marketplace: 'novacore-os', abteilungen }, null, 2), 'utf8');
  return dir;
}

function run(pluginDir, ablage) {
  const env = { ...process.env, NC_SSOT_PLUGIN_ROOT: pluginDir, NC_SSOT_DIR: ablage };
  const r = spawnSync(process.execPath, [SKRIPT, '--json'], { encoding: 'utf8', env });
  let json = null;
  try { json = JSON.parse(r.stdout); } catch (_) { /* bleibt null */ }
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, json };
}

function quelle(ergebnis, name) {
  assert.ok(ergebnis.json, 'keine JSON-Ausgabe: ' + ergebnis.stdout + ergebnis.stderr);
  const q = ergebnis.json.quellen.find((x) => x.name === name);
  assert.ok(q, 'Quelle ' + name + ' fehlt in der Ausgabe');
  return q;
}

test('Erstlauf: klont voll, materialisiert das ganze Repo, schreibt den Zeiger', () => {
  const o = origin();
  const ablage = tmp('nc-ssot-ablage-');
  const r = run(pluginWurzel(o.url), ablage);

  assert.equal(r.status, 0, r.stderr);
  const q = quelle(r, 'nc');
  assert.equal(q.zustand, 'angelegt');
  assert.equal(liesText(path.join(q.pfad, 'knowledge-base', 'index.md')), 'stand eins\n');

  // VOLLER Klon: Der Rest des Repos MUSS mitkommen. Ein frueherer Entwurf holte per
  // --sparse nur die Wissensbasis und schnitt damit `plugins/` weg — genau das, worauf
  // doku-sync (referenz/skill-authoring.md) verweist. Dieser Test haelt das offen.
  assert.equal(fs.existsSync(path.join(q.pfad, 'grossordner', 'gross.md')), true,
    'der Klon ist unvollstaendig — die SSOT-Skills brauchen das ganze Repo, nicht nur die Wissensbasis');

  const zeiger = JSON.parse(fs.readFileSync(path.join(ablage, 'index.json'), 'utf8'));
  assert.equal(zeiger.quellen.nc.pfad, q.pfad);
  assert.match(zeiger.quellen.nc.commit, /^[0-9a-f]{40}$/);
  assert.match(zeiger.quellen.nc.stand_am, /^\d{4}-\d{2}-\d{2}T/);
});

test('Zweitlauf ist idempotent und meldet aktualisiert', () => {
  const o = origin();
  const ablage = tmp('nc-ssot-ablage-');
  const plugin = pluginWurzel(o.url);
  run(plugin, ablage);
  const r = run(plugin, ablage);

  assert.equal(r.status, 0, r.stderr);
  assert.equal(quelle(r, 'nc').zustand, 'aktualisiert');
  assert.equal(
    liesText(path.join(quelle(r, 'nc').pfad, 'knowledge-base', 'index.md')),
    'stand eins\n');
});

test('Neuer Stand im Origin wird per Fast-Forward nachgezogen', () => {
  const o = origin();
  const ablage = tmp('nc-ssot-ablage-');
  const plugin = pluginWurzel(o.url);
  run(plugin, ablage);

  fs.writeFileSync(path.join(o.dir, 'knowledge-base', 'index.md'), 'stand zwei\n', 'utf8');
  git(o.dir, ['add', '-A']);
  git(o.dir, ['commit', '-q', '-m', 'zwei']);

  const r = run(plugin, ablage);
  assert.equal(quelle(r, 'nc').zustand, 'aktualisiert');
  assert.equal(
    liesText(path.join(quelle(r, 'nc').pfad, 'knowledge-base', 'index.md')),
    'stand zwei\n', 'der neue Stand ist nicht angekommen');
});

test('Lokale Aenderungen werden gemeldet, NICHT ueberschrieben', () => {
  const o = origin();
  const ablage = tmp('nc-ssot-ablage-');
  const plugin = pluginWurzel(o.url);
  const pfad = quelle(run(plugin, ablage), 'nc').pfad;

  // Unversicherte Arbeit in der lokalen Kopie …
  const datei = path.join(pfad, 'knowledge-base', 'index.md');
  fs.writeFileSync(datei, 'HANDARBEIT\n', 'utf8');
  // … waehrend der Origin weiterlaeuft.
  fs.writeFileSync(path.join(o.dir, 'knowledge-base', 'index.md'), 'stand zwei\n', 'utf8');
  git(o.dir, ['add', '-A']);
  git(o.dir, ['commit', '-q', '-m', 'zwei']);

  const r = run(plugin, ablage);
  assert.equal(quelle(r, 'nc').zustand, 'lokal-veraendert');
  assert.equal(fs.readFileSync(datei, 'utf8'), 'HANDARBEIT\n',
    'die lokale Aenderung wurde ueberschrieben — genau das darf nie passieren');
});

test('Divergenz endet als Fehler mit klarer Meldung, ohne Reset', () => {
  const o = origin();
  const ablage = tmp('nc-ssot-ablage-');
  const plugin = pluginWurzel(o.url);
  const pfad = quelle(run(plugin, ablage), 'nc').pfad;

  // Beide Seiten laufen auseinander (lokal committet, remote committet).
  fs.writeFileSync(path.join(pfad, 'knowledge-base', 'index.md'), 'lokal\n', 'utf8');
  git(pfad, ['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-aqm', 'lokal']);
  const lokalerCommit = git(pfad, ['rev-parse', 'HEAD']);
  fs.writeFileSync(path.join(o.dir, 'knowledge-base', 'index.md'), 'remote\n', 'utf8');
  git(o.dir, ['add', '-A']);
  git(o.dir, ['commit', '-q', '-m', 'remote']);

  const r = run(plugin, ablage);
  const q = quelle(r, 'nc');
  assert.equal(q.zustand, 'fehler');
  assert.match(q.meldung, /divergiert/i);
  assert.equal(git(pfad, ['rev-parse', 'HEAD']), lokalerCommit,
    'bei Divergenz darf nichts zurueckgesetzt werden');
  assert.equal(r.status, 1, 'ein Fehler muss sich im Exit-Code zeigen');
});

test('Fehlt der Wissenspfad im Repo, ist das ein Fehler und kein stiller Erfolg', () => {
  const o = origin({ mitWissen: false });
  const ablage = tmp('nc-ssot-ablage-');
  const r = run(pluginWurzel(o.url), ablage);

  const q = quelle(r, 'nc');
  assert.equal(q.zustand, 'fehler');
  assert.match(q.meldung, /Wissenspfad/);
  assert.equal(r.status, 1);
});

test('Registry-Auswahl: nur Abteilungen mit eigenem Wissen ausserhalb des Plugins', () => {
  const kern = origin();
  const abt = origin({ wissenspfad: 'wissen' });
  const ablage = tmp('nc-ssot-ablage-');

  const plugin = pluginWurzel(kern.url, [
    // Satellit: eigenes Repo, aber Wissen liegt IM Plugin → nichts zu klonen.
    { name: 'biggi', plugin: 'nc-biggi', repository: 'NovaCore-AI/Biggi-OS' },
    // Abteilung mit eigenem Wissen ausserhalb des Plugins → wird provisioniert.
    { name: 'sonder', plugin: 'nc-sonder', repository: abt.url, repoKnowledgePath: 'wissen' }
  ]);

  const r = run(plugin, ablage);
  assert.equal(r.status, 0, r.stderr);
  const namen = r.json.quellen.map((q) => q.name).sort();
  assert.deepEqual(namen, ['nc', 'nc-sonder'],
    'Satelliten duerfen nicht provisioniert werden, Abteilungen mit eigenem Wissen schon');
  assert.equal(quelle(r, 'nc-sonder').art, 'abteilung');
  assert.ok(fs.existsSync(path.join(quelle(r, 'nc-sonder').pfad, 'wissen', 'index.md')));
});

test('Die Ablage wird nie verlassen, auch nicht bei einer manipulierten Repo-Angabe', () => {
  const o = origin();
  const ablage = tmp('nc-ssot-ablage-');
  // Repo-URL, deren letztes Segment ein Ausbruchsversuch ist.
  const boese = pluginWurzel(o.url, [
    { name: 'x', plugin: 'nc-x', repository: o.url + '/../../../../evil', repoKnowledgePath: 'knowledge-base' }
  ]);
  const r = run(boese, ablage);

  for (const q of r.json.quellen) {
    const rel = path.relative(ablage, q.pfad);
    assert.ok(rel && !rel.startsWith('..') && !path.isAbsolute(rel),
      'Zielpfad liegt ausserhalb der Ablage: ' + q.pfad);
  }
});
