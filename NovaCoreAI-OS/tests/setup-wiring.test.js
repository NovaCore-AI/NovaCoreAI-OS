'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO_ROOT = path.join(__dirname, '..');
const { runSetup, registerWithClaude } = require(path.join(REPO_ROOT, 'setup.js'));

function mkTmp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function freshSetupOptions() {
  const targetDir = mkTmp('nc-target-');
  const manifestPath = path.join(mkTmp('nc-manifest-'), 'installed-manifest.json');
  return { repoRoot: REPO_ROOT, targetDir, manifestPath };
}

test('deployt alle Core-Skills in das Zielverzeichnis', () => {
  const options = freshSetupOptions();
  runSetup(options);
  for (const skill of ['nc-start', 'nc-save-session', 'nc-setup', 'nc-update']) {
    const skillPath = path.join(options.targetDir, 'skills', skill, 'SKILL.md');
    assert.ok(fs.existsSync(skillPath), `Core-Skill fehlt im Deploy: ${skill}`);
  }
});

test('deployt Skills aktivierter Module (feature-lifecycle)', () => {
  const options = freshSetupOptions();
  runSetup(options);
  for (const skill of ['nc-feature-start', 'nc-plan', 'nc-commit-prep', 'nc-pr']) {
    const skillPath = path.join(options.targetDir, 'skills', skill, 'SKILL.md');
    assert.ok(fs.existsSync(skillPath), `Modul-Skill fehlt im Deploy: ${skill}`);
  }
});

test('deployt Hooks und Plugin-Manifest', () => {
  const options = freshSetupOptions();
  runSetup(options);
  assert.ok(fs.existsSync(path.join(options.targetDir, 'hooks', 'nc-safety-gate.js')));
  assert.ok(fs.existsSync(path.join(options.targetDir, 'hooks', 'nc-session-start.js')));
  assert.ok(fs.existsSync(path.join(options.targetDir, 'hooks', 'hooks.json')));
  assert.ok(fs.existsSync(path.join(options.targetDir, '.claude-plugin', 'plugin.json')));
});

test('deployt keine Skills deaktivierter Module', () => {
  const options = freshSetupOptions();
  runSetup(options);
  for (const skill of ['nc-review', 'nc-scope', 'nc-debug']) {
    const skillPath = path.join(options.targetDir, 'skills', skill);
    assert.ok(!fs.existsSync(skillPath), `deaktivierter Modul-Skill wurde deployt: ${skill}`);
  }
});

test('schreibt ein Deploy-Manifest mit allen deployten Dateien', () => {
  const options = freshSetupOptions();
  runSetup(options);
  assert.ok(fs.existsSync(options.manifestPath), 'installed-manifest.json fehlt');
  const manifest = JSON.parse(fs.readFileSync(options.manifestPath, 'utf8'));
  assert.ok(Array.isArray(manifest.files) && manifest.files.length > 0);
  assert.ok(manifest.files.includes(path.join('skills', 'nc-start', 'SKILL.md')));
  for (const relative of manifest.files) {
    assert.ok(
      fs.existsSync(path.join(options.targetDir, relative)),
      `Manifest listet nicht existierende Datei: ${relative}`
    );
  }
});

test('entfernt beim erneuten Setup verwaiste Dateien aus altem Manifest', () => {
  const options = freshSetupOptions();
  const stale = path.join('skills', 'nc-entfernt', 'SKILL.md');
  const stalePath = path.join(options.targetDir, stale);
  fs.mkdirSync(path.dirname(stalePath), { recursive: true });
  fs.writeFileSync(stalePath, 'veraltet');
  fs.mkdirSync(path.dirname(options.manifestPath), { recursive: true });
  fs.writeFileSync(
    options.manifestPath,
    JSON.stringify({ version: '0.0.1', installedAt: '2026-01-01T00:00:00.000Z', files: [stale] })
  );

  runSetup(options);

  assert.ok(!fs.existsSync(stalePath), 'verwaiste Datei wurde nicht entfernt');
  const manifest = JSON.parse(fs.readFileSync(options.manifestPath, 'utf8'));
  assert.ok(!manifest.files.includes(stale));
});

test('überspringt Module mit zu hoher minCoreVersion und warnt', () => {
  const options = freshSetupOptions();
  const registry = {
    version: '0.1.0',
    modules: [
      { name: 'feature-lifecycle', enabled: true, minCoreVersion: '9.9.9' },
    ],
  };
  const result = runSetup({ ...options, registry });
  const deployed = path.join(options.targetDir, 'skills', 'nc-feature-start');
  assert.ok(!fs.existsSync(deployed), 'Modul mit zu hoher minCoreVersion wurde deployt');
  assert.ok(
    result.warnings.some((w) => w.includes('feature-lifecycle')),
    'fehlende Warnung für übersprungenes Modul'
  );
});

test('liefert eine Ergebnisliste der deployten Dateien zurück', () => {
  const options = freshSetupOptions();
  const result = runSetup(options);
  assert.ok(Array.isArray(result.deployed));
  assert.ok(result.deployed.length >= 8, 'zu wenige Dateien deployt');
  assert.ok(Array.isArray(result.warnings));
});

function mkFixtureRepo() {
  const repoRoot = mkTmp('nc-fixture-');
  fs.writeFileSync(path.join(repoRoot, 'VERSION'), '0.1.0\n');
  fs.mkdirSync(path.join(repoRoot, '.claude-plugin'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, '.claude-plugin', 'plugin.json'),
    JSON.stringify({ name: 'novacoreai-os', version: '0.1.0' })
  );
  fs.mkdirSync(path.join(repoRoot, 'skills', 'nc-doppelt'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, 'skills', 'nc-doppelt', 'SKILL.md'), 'CORE');
  const moduleSkill = path.join(repoRoot, 'modules', 'm1', 'skills', 'nc-doppelt');
  fs.mkdirSync(moduleSkill, { recursive: true });
  fs.writeFileSync(path.join(moduleSkill, 'SKILL.md'), 'MODUL');
  return repoRoot;
}

test('warnt bei Skill-Namenskollision und deployt den zuerst gefundenen (Core gewinnt)', () => {
  const options = freshSetupOptions();
  const repoRoot = mkFixtureRepo();
  const registry = {
    version: '0.1.0',
    modules: [{ name: 'm1', enabled: true, minCoreVersion: '0.1.0' }],
  };
  const result = runSetup({ ...options, repoRoot, registry });
  const duplicates = result.deployed.filter(
    (relative) => relative === path.join('skills', 'nc-doppelt', 'SKILL.md')
  );
  assert.equal(duplicates.length, 1, 'kollidierender Skill darf nur einmal deployt werden');
  const content = fs.readFileSync(
    path.join(options.targetDir, 'skills', 'nc-doppelt', 'SKILL.md'),
    'utf8'
  );
  assert.equal(content, 'CORE', 'bei Kollision muss der Core-Skill gewinnen');
  assert.ok(
    result.warnings.some((w) => w.includes('nc-doppelt')),
    'fehlende Kollisionswarnung'
  );
});

test('warnt bei unlesbarem altem Deploy-Manifest statt still aufzugeben', () => {
  const options = freshSetupOptions();
  fs.mkdirSync(path.dirname(options.manifestPath), { recursive: true });
  fs.writeFileSync(options.manifestPath, '{kaputt');
  const result = runSetup(options);
  assert.ok(
    result.warnings.some((w) => w.toLowerCase().includes('manifest')),
    'fehlende Warnung zu unlesbarem Manifest'
  );
});

test('entfernt verwaiste Dateien auch bei relativ angegebenem targetDir', () => {
  const base = mkTmp('nc-rel-');
  const manifestPath = path.join(mkTmp('nc-manifest-'), 'installed-manifest.json');
  const stale = path.join('skills', 'nc-alt', 'SKILL.md');
  fs.mkdirSync(path.join(base, 'ziel', 'skills', 'nc-alt'), { recursive: true });
  fs.writeFileSync(path.join(base, 'ziel', stale), 'veraltet');
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(
    manifestPath,
    JSON.stringify({ version: '0.0.1', installedAt: '2026-01-01T00:00:00.000Z', files: [stale] })
  );

  const previousCwd = process.cwd();
  process.chdir(base);
  try {
    runSetup({ repoRoot: REPO_ROOT, targetDir: 'ziel', manifestPath });
  } finally {
    process.chdir(previousCwd);
  }

  assert.ok(
    !fs.existsSync(path.join(base, 'ziel', stale)),
    'verwaiste Datei wurde bei relativem targetDir nicht entfernt'
  );
});

test('registerWithClaude registriert Marketplace und installiert das Plugin', () => {
  const calls = [];
  const exec = (command, args) => {
    calls.push([command, ...args]);
    return { status: 0, stdout: '', stderr: '' };
  };
  const result = registerWithClaude({ repoRoot: REPO_ROOT, exec });
  assert.equal(result.registered, true);
  assert.ok(
    calls.some((call) => call.join(' ').includes('plugin marketplace add')),
    'marketplace add wurde nicht aufgerufen'
  );
  assert.ok(
    calls.some((call) => call.join(' ').includes('plugin install novacoreai-os@')),
    'plugin install wurde nicht aufgerufen'
  );
});

test('registerWithClaude liefert bei fehlender claude-CLI eine Anleitung statt zu werfen', () => {
  const exec = () => ({ status: 1, stdout: '', stderr: 'command not found', error: new Error('ENOENT') });
  const result = registerWithClaude({ repoRoot: REPO_ROOT, exec });
  assert.equal(result.registered, false);
  assert.match(result.warning, /claude plugin marketplace add/);
  assert.match(result.warning, /claude plugin install/);
});
