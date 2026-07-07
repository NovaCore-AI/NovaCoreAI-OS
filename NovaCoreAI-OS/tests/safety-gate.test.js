'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const GATE_PATH = path.join(__dirname, '..', 'hooks', 'nc-safety-gate.js');

const {
  isDestructiveCommand,
  hasNcOsMarker,
  buildGateResponse,
} = require(GATE_PATH);

const DESTRUCTIVE_COMMANDS = [
  'git push --force origin main',
  'git push -f origin main',
  'git push origin +main',
  'git reset --hard HEAD~3',
  'git clean -fd',
  'rm -rf build/',
  'rm -Rf build/',
  'rm -r -f build/',
  'rm --recursive --force build/',
  'psql -c "DROP TABLE kunden"',
  'npm run deploy',
  'terraform destroy -auto-approve',
];

const HARMLESS_COMMANDS = [
  'git status',
  'git push origin feature-branch',
  'git push -u origin feature-branch',
  'ls -la',
  'npm test',
  'rm datei.txt',
  'rm -f datei.txt',
  'git log --oneline',
  'echo "deployment docs"',
  'npm run deploy-docs',
  'kubectl get deploy',
];

test('erkennt destruktive Befehle', () => {
  for (const command of DESTRUCTIVE_COMMANDS) {
    assert.ok(isDestructiveCommand(command), `sollte destruktiv sein: ${command}`);
  }
});

test('lässt harmlose Befehle unangetastet', () => {
  for (const command of HARMLESS_COMMANDS) {
    assert.ok(!isDestructiveCommand(command), `sollte harmlos sein: ${command}`);
  }
});

function mkRepo({ withMarker }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nc-gate-'));
  if (withMarker) {
    fs.writeFileSync(path.join(dir, '.nc-os'), '');
  }
  return dir;
}

test('findet den .nc-os-Marker auch von Unterverzeichnissen aus', () => {
  const repo = mkRepo({ withMarker: true });
  const sub = path.join(repo, 'src', 'tief');
  fs.mkdirSync(sub, { recursive: true });
  assert.ok(hasNcOsMarker(sub));
  assert.ok(hasNcOsMarker(repo));
});

test('ohne .nc-os-Marker ist das Gate no-op, auch bei destruktiven Befehlen', () => {
  const repo = mkRepo({ withMarker: false });
  const response = buildGateResponse({
    tool_name: 'Bash',
    tool_input: { command: 'git reset --hard' },
    cwd: repo,
  });
  assert.equal(response, null);
});

test('mit Marker verlangt das Gate Faktennennung bei destruktiven Befehlen', () => {
  const repo = mkRepo({ withMarker: true });
  const response = buildGateResponse({
    tool_name: 'Bash',
    tool_input: { command: 'rm -rf node_modules' },
    cwd: repo,
  });
  assert.ok(response, 'Gate sollte antworten');
  assert.equal(response.hookSpecificOutput.hookEventName, 'PreToolUse');
  assert.equal(response.hookSpecificOutput.permissionDecision, 'ask');
  const reason = response.hookSpecificOutput.permissionDecisionReason;
  assert.match(reason, /rm -rf node_modules/, 'Grund muss den Befehl wörtlich zitieren');
  assert.match(reason, /Fakten/i, 'Grund muss Faktennennung verlangen');
});

test('mit Marker bleiben harmlose Befehle unbeanstandet', () => {
  const repo = mkRepo({ withMarker: true });
  const response = buildGateResponse({
    tool_name: 'Bash',
    tool_input: { command: 'git status' },
    cwd: repo,
  });
  assert.equal(response, null);
});

test('andere Tools als Bash werden ignoriert', () => {
  const repo = mkRepo({ withMarker: true });
  const response = buildGateResponse({
    tool_name: 'Write',
    tool_input: { file_path: '/x', content: 'rm -rf /' },
    cwd: repo,
  });
  assert.equal(response, null);
});

test('Ende-zu-Ende: Hook-Prozess liest stdin und liefert JSON-Entscheidung', () => {
  const repo = mkRepo({ withMarker: true });
  const input = JSON.stringify({
    tool_name: 'Bash',
    tool_input: { command: 'terraform destroy' },
    cwd: repo,
  });
  const stdout = execFileSync(process.execPath, [GATE_PATH], { input, encoding: 'utf8' });
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.hookSpecificOutput.permissionDecision, 'ask');
});

test('Ende-zu-Ende: ohne Marker keine Ausgabe und Exit 0', () => {
  const repo = mkRepo({ withMarker: false });
  const input = JSON.stringify({
    tool_name: 'Bash',
    tool_input: { command: 'terraform destroy' },
    cwd: repo,
  });
  const stdout = execFileSync(process.execPath, [GATE_PATH], { input, encoding: 'utf8' });
  assert.equal(stdout.trim(), '');
});
