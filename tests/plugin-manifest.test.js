'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(REPO_ROOT, '.claude-plugin', 'plugin.json');

test('plugin.json existiert und ist gültiges JSON', () => {
  assert.ok(fs.existsSync(MANIFEST_PATH), '.claude-plugin/plugin.json fehlt');
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
  assert.doesNotThrow(() => JSON.parse(raw));
});

test('plugin.json trägt Name "novacoreai-os" und eine Beschreibung', () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  assert.equal(manifest.name, 'novacoreai-os');
  assert.ok(
    typeof manifest.description === 'string' && manifest.description.length > 0,
    'description fehlt oder ist leer'
  );
});

test('plugin.json folgt dem offiziellen Claude-Code-Plugin-Schema', () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  assert.equal(
    manifest.$schema,
    'https://anthropic.com/claude-code/plugin.schema.json',
    '$schema fehlt oder zeigt nicht auf das offizielle Plugin-Schema'
  );
  assert.ok(
    typeof manifest.repository === 'string' && /^https?:\/\//.test(manifest.repository),
    'repository muss eine absolute URL sein (offizielles Plugin-Format)'
  );
  assert.ok(
    typeof manifest.license === 'string' && manifest.license.length > 0,
    'license fehlt (offizielles Plugin-Format)'
  );
  assert.ok(
    manifest.author && typeof manifest.author.name === 'string',
    'author.name fehlt (offizielles Plugin-Format)'
  );
});

test('plugin.json-Version stimmt mit VERSION-Datei überein', () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const version = fs.readFileSync(path.join(REPO_ROOT, 'VERSION'), 'utf8').trim();
  assert.equal(manifest.version, version);
});

test('package.json und module-registry.json tragen dieselbe Version wie VERSION', () => {
  const version = fs.readFileSync(path.join(REPO_ROOT, 'VERSION'), 'utf8').trim();
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
  const registry = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, 'modules', 'module-registry.json'), 'utf8')
  );
  assert.equal(pkg.version, version, 'package.json-Version weicht von VERSION ab');
  assert.equal(registry.version, version, 'module-registry-Version weicht von VERSION ab');
});

test('marketplace.json existiert und listet das Plugin novacoreai-os', () => {
  const marketplacePath = path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json');
  assert.ok(fs.existsSync(marketplacePath), '.claude-plugin/marketplace.json fehlt');
  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
  assert.ok(typeof marketplace.name === 'string' && marketplace.name.length > 0);
  assert.ok(Array.isArray(marketplace.plugins), 'plugins-Array fehlt');
  assert.ok(
    marketplace.plugins.some((plugin) => plugin.name === 'novacoreai-os'),
    'Plugin novacoreai-os fehlt im Marketplace'
  );
});

test('marketplace.json folgt dem offiziellen Claude-Code-Marketplace-Schema', () => {
  const marketplacePath = path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json');
  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
  assert.equal(
    marketplace.$schema,
    'https://anthropic.com/claude-code/marketplace.schema.json',
    '$schema fehlt oder zeigt nicht auf das offizielle Marketplace-Schema'
  );
  assert.ok(
    marketplace.owner && typeof marketplace.owner.name === 'string',
    'owner.name fehlt (offizielles Marketplace-Format)'
  );
  const plugin = marketplace.plugins.find((p) => p.name === 'novacoreai-os');
  assert.ok(plugin, 'Plugin novacoreai-os fehlt');
  assert.equal(plugin.source, './', 'Plugin-Source muss "./" sein (lokaler Marketplace)');
});

test('Hooks-Konfiguration des Plugins existiert und referenziert beide Hooks', () => {
  const hooksConfigPath = path.join(REPO_ROOT, 'hooks', 'hooks.json');
  assert.ok(fs.existsSync(hooksConfigPath), 'hooks/hooks.json fehlt');
  const hooksConfig = JSON.parse(fs.readFileSync(hooksConfigPath, 'utf8'));
  const serialized = JSON.stringify(hooksConfig);
  assert.match(serialized, /nc-session-start\.js/);
  assert.match(serialized, /nc-safety-gate\.js/);
  assert.ok(hooksConfig.hooks.SessionStart, 'SessionStart-Hook fehlt');
  assert.ok(hooksConfig.hooks.PreToolUse, 'PreToolUse-Hook fehlt');
});
