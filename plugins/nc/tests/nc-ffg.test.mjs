import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HOOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'hooks', 'nc-ffg.js');

const CLEAN_ENV = {
  NC_FFG: '', NC_FFG_EXTRA_DESTRUCTIVE: '', NC_FFG_STATE_DIR: '',
  NC_FFG_EXEMPT_GLOBS: '', NC_FFG_FULL_DENIALS: ''
};

function run(input, env) {
  return execFileSync(process.execPath, [HOOK], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    env: Object.assign({}, process.env, CLEAN_ENV, env),
    encoding: 'utf8'
  });
}

// Wie run(), aber mit stderr-Zugriff (fuer den Nicht-schreibbar-Fall).
function runFull(input, env) {
  return spawnSync(process.execPath, [HOOK], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    env: Object.assign({}, process.env, CLEAN_ENV, env),
    encoding: 'utf8'
  });
}

function freshDirs() {
  const proj = fs.mkdtempSync(path.join(os.tmpdir(), 'ffg-proj-'));
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'ffg-data-'));
  return { proj, data, env: { CLAUDE_PROJECT_DIR: proj, CLAUDE_PLUGIN_DATA: data } };
}

function inputFor(session, tool, toolInput, extra) {
  return Object.assign(
    { session_id: session, hook_event_name: 'PreToolUse', tool_name: tool, tool_input: toolInput || {} },
    extra || {}
  );
}

function denyReason(out) {
  const parsed = JSON.parse(out);
  assert.equal(parsed.hookSpecificOutput.permissionDecision, 'deny');
  return parsed.hookSpecificOutput.permissionDecisionReason;
}

test('Opt-out per NC_FFG=off: kein Eingriff', () => {
  const d = freshDirs();
  const out = run(inputFor('t-off', 'Bash', { command: 'ls' }),
    Object.assign({ NC_FFG: 'off' }, d.env));
  assert.equal(out, '');
});

test('ohne Marker aktiv: erste Routine-Bash geblockt, Wiederholung passiert', () => {
  const d = freshDirs();
  const first = denyReason(run(inputFor('t-bash', 'Bash', { command: 'npm test' }), d.env));
  assert.match(first, /\[FFG\]/);
  assert.doesNotMatch(first, /Destruktiver/);
  const second = run(inputFor('t-bash', 'Bash', { command: 'npm test' }), d.env);
  assert.equal(second, '');
});

test('Read-only-Git wird nie gegated, zaehlt aber nicht als Routine-Fakten', () => {
  const d = freshDirs();
  assert.equal(run(inputFor('t-ro', 'Bash', { command: 'git status --porcelain' }), d.env), '');
  assert.equal(run(inputFor('t-ro', 'Bash', { command: 'git log --oneline' }), d.env), '');
  // Routine-Gate ist weiterhin offen und feuert beim ersten echten Kommando.
  const reason = denyReason(run(inputFor('t-ro', 'Bash', { command: 'npm test' }), d.env));
  assert.match(reason, /ersten Bash-Befehl/);
});

test('destruktives Kommando wird je Kommando gegated — auch nach Routine-Gate', () => {
  const d = freshDirs();
  denyReason(run(inputFor('t-destr', 'Bash', { command: 'ls' }), d.env)); // Routine
  assert.equal(run(inputFor('t-destr', 'Bash', { command: 'ls' }), d.env), '');
  const r1 = denyReason(run(inputFor('t-destr', 'Bash', { command: 'git push --force origin main' }), d.env));
  assert.match(r1, /Destruktiver Befehl/);
  // Wiederholung desselben Kommandos passiert …
  assert.equal(run(inputFor('t-destr', 'Bash', { command: 'git push --force origin main' }), d.env), '');
  // … aber ein ANDERES destruktives Kommando wird erneut gegated.
  const r2 = denyReason(run(inputFor('t-destr', 'Bash', { command: 'rm -rf build' }), d.env));
  assert.match(r2, /Destruktiver Befehl/);
});

test('Destruktiv in $( ) und git commit --amend werden erkannt', () => {
  const d = freshDirs();
  const r1 = denyReason(run(inputFor('t-sub', 'Bash', { command: 'echo start $(rm -rf /tmp/x)' }), d.env));
  assert.match(r1, /Destruktiver Befehl/);
  const r2 = denyReason(run(inputFor('t-sub', 'Bash', { command: 'git commit --amend' }), d.env));
  assert.match(r2, /Destruktiver Befehl/);
});

test('"drop table" in Anfuehrungszeichen und --force-with-lease sind KEINE Destruktiv-Treffer', () => {
  const d = freshDirs();
  const r1 = denyReason(run(inputFor('t-fp', 'Bash', { command: 'git commit -m "docs: drop table erklaert"' }), d.env));
  assert.doesNotMatch(r1, /Destruktiver/); // Routine-Gate, nicht Destruktiv-Gate
  assert.equal(run(inputFor('t-fp', 'Bash', { command: 'git commit -m "docs: drop table erklaert"' }), d.env), '');
  assert.equal(run(inputFor('t-fp', 'Bash', { command: 'git push --force-with-lease origin main' }), d.env), '');
});

test('Extra-Muster per NC_FFG_EXTRA_DESTRUCTIVE greifen; ungueltiges Regex crasht nicht', () => {
  const d = freshDirs();
  const env = Object.assign({ NC_FFG_EXTRA_DESTRUCTIVE: 'glab\\s+mr\\s+merge' }, d.env);
  const r = denyReason(run(inputFor('t-extra', 'Bash', { command: 'glab mr merge 42' }), env));
  assert.match(r, /Destruktiver Befehl/);
  // Ungueltiges Regex → wie nicht konfiguriert; Kommando faellt aufs Routine-Gate.
  const bad = Object.assign({}, d.env, { NC_FFG_EXTRA_DESTRUCTIVE: '(' });
  const r2 = denyReason(run(inputFor('t-extra-bad', 'Bash', { command: 'glab mr merge 42' }), bad));
  assert.doesNotMatch(r2, /Destruktiver/);
});

test('Edit: einmal je Datei — neue Datei blockt erneut', () => {
  const d = freshDirs();
  const a1 = denyReason(run(inputFor('t-edit', 'Edit', { file_path: path.join(d.proj, 'a.md') }), d.env));
  assert.match(a1, /\[FFG\]/);
  assert.equal(run(inputFor('t-edit', 'Edit', { file_path: path.join(d.proj, 'a.md') }), d.env), '');
  denyReason(run(inputFor('t-edit', 'Write', { file_path: path.join(d.proj, 'b.md') }), d.env));
});

test('.claude/settings.json ist vom Datei-Gate ausgenommen', () => {
  const d = freshDirs();
  const out = run(inputFor('t-settings', 'Edit', { file_path: path.join(d.proj, '.claude', 'settings.json') }), d.env);
  assert.equal(out, '');
});

test('Subagent: Datei-Gate uebersprungen, Destruktiv-Gate bleibt scharf', () => {
  const d = freshDirs();
  const sub = { agent_id: 'agent-42', agent_type: 'Explore' };
  assert.equal(run(inputFor('t-sub-agent', 'Edit', { file_path: path.join(d.proj, 'x.md') }, sub), d.env), '');
  const r = denyReason(run(inputFor('t-sub-agent', 'Bash', { command: 'git reset --hard HEAD~1' }, sub), d.env));
  assert.match(r, /Destruktiver Befehl/);
});

test('Sessions sind getrennt', () => {
  const d = freshDirs();
  denyReason(run(inputFor('t-s1', 'Bash', { command: 'ls' }), d.env));
  denyReason(run(inputFor('t-s2', 'Bash', { command: 'ls' }), d.env));
});

test('State-Timeout: nach 30 Min Inaktivitaet greift das Gate erneut', () => {
  const d = freshDirs();
  const stateDir = path.join(d.data, 'ffg');
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(path.join(stateDir, 'session-t-timeout.json'), JSON.stringify({
    checked: ['__bash_session__'],
    last_active: Date.now() - 31 * 60 * 1000
  }));
  const reason = denyReason(run(inputFor('t-timeout', 'Bash', { command: 'ls' }), d.env));
  assert.match(reason, /ersten Bash-Befehl/);
});

test('State nicht schreibbar: allow + Warnung statt Endlosschleife', () => {
  const d = freshDirs();
  // Eine DATEI als State-Verzeichnis vorgeben → mkdir/write schlagen fehl.
  const blocker = path.join(d.data, 'blocker');
  fs.writeFileSync(blocker, 'x');
  const res = runFull(inputFor('t-nostate', 'Bash', { command: 'ls' }),
    Object.assign({}, d.env, { NC_FFG_STATE_DIR: blocker }));
  assert.equal(res.stdout, ''); // kein Deny → Aktion passiert
  assert.match(res.stderr, /State nicht schreibbar/);
});

test('kaputtes stdin: fail-open ohne Block', () => {
  const d = freshDirs();
  assert.equal(run('kein json', d.env), '');
});

test('nicht getriggertes Tool: kein Eingriff', () => {
  const d = freshDirs();
  assert.equal(run(inputFor('t-read', 'Read', { file_path: 'x' }), d.env), '');
});

// --- Upstream-Paritaet (GateGuard-Vorbild, Marketplace-Stand gelesen 2026-07-27) ---

test('GHSA-Bypasses: quoted rm, newline, sh -c und find -exec werden erkannt', () => {
  const d = freshDirs();
  denyReason(run(inputFor('t-ghsa', 'Bash', { command: 'ls' }), d.env)); // Routine-Gate abraeumen
  const cases = [
    "'rm' -rf /tmp/x",
    'echo safe\nrm -rf /tmp/x',
    'sh -c "rm -rf /tmp/x"',
    "bash -c 'git reset --hard HEAD~1'",
    'find . -name "*.tmp" -exec rm {} \\;',
    "find . -exec 'rm' -rf {} \\;"
  ];
  for (const command of cases) {
    const r = denyReason(run(inputFor('t-ghsa', 'Bash', { command }), d.env));
    assert.match(r, /Destruktiver Befehl/, 'nicht erkannt: ' + JSON.stringify(command));
  }
});

test('quote-aware: Phrase IN Anfuehrungszeichen bleibt Fehlalarm-frei', () => {
  const d = freshDirs();
  denyReason(run(inputFor('t-qfp', 'Bash', { command: 'ls' }), d.env)); // Routine-Gate abraeumen
  assert.equal(run(inputFor('t-qfp', 'Bash', { command: 'echo "rm -rf waere gefaehrlich"' }), d.env), '');
});

test('Edit- und Write-Gate haben getrennte Investigations-Texte', () => {
  const d = freshDirs();
  const e = denyReason(run(inputFor('t-txt', 'Edit', { file_path: path.join(d.proj, 'mod.js') }), d.env));
  assert.match(e, /\[FFG\]/);
  assert.match(e, /ALLE Dateien/);          // Importer-Recherche (Edit-spezifisch)
  assert.match(e, /wörtlich zitieren/);
  const w = denyReason(run(inputFor('t-txt', 'Write', { file_path: path.join(d.proj, 'neu.js') }), d.env));
  assert.match(w, /\[FFG\]/);
  assert.match(w, /denselben Zweck/);       // Duplikat-Check (Write-spezifisch)
  assert.doesNotMatch(w, /ALLE Dateien/);
});

test('MultiEdit wird wie Edit je Datei gegated; Edit-Gate zaehlt fuer MultiEdit', () => {
  const d = freshDirs();
  const f = path.join(d.proj, 'm.md');
  const r = denyReason(run(inputFor('t-me', 'MultiEdit', { edits: [{ file_path: f, old_string: 'a', new_string: 'b' }] }), d.env));
  assert.match(r, /\[FFG\]/);
  assert.equal(run(inputFor('t-me', 'MultiEdit', { edits: [{ file_path: f }] }), d.env), '');
  // Datei, die schon per Edit gegated wurde, blockt in MultiEdit nicht erneut.
  const g = path.join(d.proj, 'n.md');
  denyReason(run(inputFor('t-me', 'Edit', { file_path: g }), d.env));
  assert.equal(run(inputFor('t-me', 'MultiEdit', { edits: [{ file_path: g }] }), d.env), '');
});

test('Tool-Namen case-insensitiv: "edit" wird wie "Edit" gegated', () => {
  const d = freshDirs();
  const r = denyReason(run(inputFor('t-case', 'edit', { file_path: path.join(d.proj, 'c.md') }), d.env));
  assert.match(r, /\[FFG\]/);
});

test('NC_FFG_EXEMPT_GLOBS nimmt passende Pfade vom Datei-Gate aus', () => {
  const d = freshDirs();
  const env = Object.assign({ NC_FFG_EXEMPT_GLOBS: '**/*.test.mjs, **/scratch/**' }, d.env);
  assert.equal(run(inputFor('t-ex', 'Edit', { file_path: path.join(d.proj, 'tests', 'x.test.mjs') }), env), '');
  assert.equal(run(inputFor('t-ex', 'Write', { file_path: path.join(d.proj, 'scratch', 'tmp.md') }), env), '');
  // Nicht-passender Pfad bleibt gegated.
  denyReason(run(inputFor('t-ex', 'Edit', { file_path: path.join(d.proj, 'src', 'x.js') }), env));
});

test('Exempt-Globs sind voll verankert und case-gefoldet (Review-Härtung 2026-07-28)', () => {
  const d = freshDirs();
  const env = Object.assign({ NC_FFG_EXEMPT_GLOBS: '**/*.md, **/*.MJS' }, d.env);
  // Kein Substring-Bypass: .md.bak endet nicht auf .md → bleibt gegated.
  denyReason(run(inputFor('t-anchor', 'Edit', { file_path: path.join(d.proj, 'notes.md.bak') }), env));
  // Kein Verzeichnis-Trick: x.md/evil.js matcht *.md nicht → bleibt gegated.
  denyReason(run(inputFor('t-anchor', 'Write', { file_path: path.join(d.proj, 'x.md', 'evil.js') }), env));
  // Case-Folding: grossgeschriebenes Muster matcht kleingeschriebenen Pfad.
  assert.equal(run(inputFor('t-anchor', 'Edit', { file_path: path.join(d.proj, 'lib', 'a.mjs') }), env), '');
  // Der gemeinte Fall bleibt exempt.
  assert.equal(run(inputFor('t-anchor', 'Edit', { file_path: path.join(d.proj, 'docs', 'readme.md') }), env), '');
});

test('Denial-Budget: nach Budget kondensierter Einzeiler ohne Abschalt-Hinweis', () => {
  const d = freshDirs();
  const env = Object.assign({ NC_FFG_FULL_DENIALS: '1' }, d.env);
  const full = denyReason(run(inputFor('t-bud', 'Edit', { file_path: path.join(d.proj, 'a.js') }), env));
  assert.match(full, /ALLE Dateien/); // Volltext innerhalb des Budgets
  const cond = denyReason(run(inputFor('t-bud', 'Edit', { file_path: path.join(d.proj, 'b.js') }), env));
  assert.match(cond, /#2/);                 // Ordinal macht Verweigerungen textuell verschieden
  assert.doesNotMatch(cond, /ALLE Dateien/); // kein Volltext mehr
  assert.doesNotMatch(cond, /NC_FFG/);       // Schicht 5: kein Abschalt-Hinweis, auch kondensiert
  assert.ok(!cond.includes('\n'), 'kondensierte Meldung ist einzeilig');
  // Wiederholung nach Fakten-Vorlage passiert weiterhin.
  assert.equal(run(inputFor('t-bud', 'Edit', { file_path: path.join(d.proj, 'b.js') }), env), '');
});

test('erweiterte Read-only-Git-Introspektion: diff --cached/--stat und show <ref> --stat', () => {
  const d = freshDirs();
  assert.equal(run(inputFor('t-ro2', 'Bash', { command: 'git diff --cached --stat' }), d.env), '');
  assert.equal(run(inputFor('t-ro2', 'Bash', { command: 'git show HEAD --stat' }), d.env), '');
});

// Erweiterung 2026-08-10 (Bauplan Onsite-Align-Umbau, AP1): Pflicht-Einstieg `git log
// --oneline -10` und die drei Fakten-Stempel-Formen von `git rev-parse` sind rein lesend.
test('Read-only-Git: log -N und die rev-parse-Formen des Fakten-Stempels', () => {
  const d = freshDirs();
  for (const command of [
    'git log --oneline -10',
    'git log -5',
    'git rev-parse --abbrev-ref HEAD',
    'git rev-parse --short HEAD',
    'git rev-parse HEAD'
  ]) {
    assert.equal(run(inputFor('t-ro3', 'Bash', { command }), d.env), '', command + ' darf nicht gaten');
  }
});

// Erweiterung 2026-08-14 (Bugfix: Start-Gate/FFG blockten den eigenen Pflicht-Einstieg,
// Bugreport Linux-Session): Pfadwechsel (`cd` / `git -C`), Verkettung mehrerer
// Read-only-Kommandos, `git worktree list` (Pflicht-Einstieg laut AGENTS.md) und
// kombinierte status-Kurzflags sind rein lesend und muessen frei sein.
test('Read-only-Git: Pfadwechsel, Verkettung, worktree list und -sb', () => {
  const d = freshDirs();
  for (const command of [
    'cd /tmp/irgendwo && git status',
    'git -C /tmp/irgendwo status',
    'git -C /tmp/irgendwo log --oneline -10',
    'git status && git log --oneline -5',
    'git worktree list',
    'git status -sb'
  ]) {
    assert.equal(run(inputFor('t-ro5', 'Bash', { command }), d.env), '', command + ' darf nicht gaten');
  }
});

// Negativkontrolle zur Erweiterung: Pfadwechsel und Verkettung duerfen die Allowlist
// nicht aufweichen — schreibende/unbekannte Formen gaten weiter.
test('Read-only-Git-Allowlist bleibt eng bei Pfadwechsel und Verkettung', () => {
  for (const command of [
    'cd /tmp/irgendwo && rm -rf y',
    'git -C /tmp/irgendwo push',
    'git worktree remove foo',
    'git status | grep x',
    'git status > out.txt'
  ]) {
    const d = freshDirs();
    assert.notEqual(run(inputFor('t-ro6', 'Bash', { command }), d.env), '', command + ' muss gegated werden');
  }
});

// Negativkontrolle zur Erweiterung: die Allowlist bleibt eng — nicht abgedeckte bzw.
// angehaengte Formen laufen weiter ins Routine- bzw. Destruktiv-Gate.
test('Read-only-Git-Allowlist bleibt eng: unbekannte rev-parse-/log-Formen gaten weiter', () => {
  for (const command of [
    'git rev-parse --git-dir',
    'git rev-parse --abbrev-ref main',
    'git log --oneline -10 --author=x',
    'git log -10 && rm -rf /tmp/x'
  ]) {
    const d = freshDirs();
    assert.notEqual(run(inputFor('t-ro4', 'Bash', { command }), d.env), '', command + ' muss gegated werden');
  }
});

// --- Onsite-Delta-Port 2026-08-23 (Mapping D3): NotebookEdit, Windows-Muster,
// --- Wrapper-Passthrough — Faelle wortgleich aus oai-ffg.test.mjs@6d3f8db uebernommen.

// --- NotebookEdit im Datei-Gate (§15.38): wie Edit, Zielfeld notebook_path ---

test('NotebookEdit: erste Aenderung blockt (Edit-Text), teilt den Fakten-Key mit Edit', () => {
  const d = freshDirs();
  const nb = path.join(d.proj, 'n.ipynb');
  const first = denyReason(run(inputFor('t-nb', 'NotebookEdit', { notebook_path: nb }), d.env));
  assert.match(first, /Änderung/); // istEdit-Wortlaut (Modify), nicht Write
  // Wiederholung passiert.
  assert.equal(run(inputFor('t-nb', 'NotebookEdit', { notebook_path: nb }), d.env), '');
  // Key-Teilung beidseitig: NotebookEdit-Fakten gelten fuer Edit auf demselben Pfad …
  const nb2 = path.join(d.proj, 'm.ipynb');
  assert.ok(run(inputFor('t-nb', 'NotebookEdit', { notebook_path: nb2 }), d.env).length > 0);
  assert.equal(run(inputFor('t-nb', 'Edit', { file_path: nb2 }), d.env), '');
  // … und Edit-Fakten gelten fuer NotebookEdit.
  assert.ok(run(inputFor('t-nb', 'Edit', { file_path: path.join(d.proj, 'x.js') }), d.env).length > 0);
  assert.equal(run(inputFor('t-nb', 'NotebookEdit', { notebook_path: path.join(d.proj, 'x.js') }), d.env), '');
  // Subagent: NotebookEdit-Datei-Gate uebersprungen (Parent hat gegated).
  assert.equal(run(inputFor('t-nb-sub', 'NotebookEdit', { notebook_path: path.join(d.proj, 's.ipynb') },
    { agent_id: 'agent-x' }), d.env), '');
});

// --- Windows-Destruktivmuster (§15.38): nur rekursive/erzwungene Formen ---

test('Windows-Destruktivmuster: cmd-Builtins mit /s und PowerShell mit -Recurse UND -Force', () => {
  const d = freshDirs();
  const cases = [
    'del /s /q build', 'del /q /s build', 'del build /s', 'erase /s /q x',
    'rmdir /s x', 'rd /s /q x',
    'cmd /c del /s x', 'cmd /k del /s x', 'cmd //c "del /s /q x"',
    'C:' + String.fromCharCode(92) + 'Windows' + String.fromCharCode(92) + 'System32'
      + String.fromCharCode(92) + 'cmd.exe /c "del /s x"',
    'cmd /c powershell -c rm -rf x',
    // Kompositionen (Vorbild-Review 2026-08-15, Critical #1): Windows-Muster in
    // $()/Backticks/Subshell/Brace — dieselbe Klasse wie die Unix-GHSA-Faelle.
    'echo $(del /s x)',
    'echo `del /s /q x`',
    '(del /s x)',
    '{ del /s x; }',
    'echo $(powershell -Command "Remove-Item -Recurse -Force x")',
    'bash -c "rd /s /q build"',
    "sh -c 'cmd /c del /s x'"
  ];
  for (const command of cases) {
    const out = run(inputFor('t-win', 'Bash', { command }), d.env);
    assert.ok(out.length > 0, 'erwartet Deny: ' + JSON.stringify(command));
  }
});

test('Windows-Destruktivmuster: PowerShell-Cmdlet-Formen, Wrapper und EncodedCommand', () => {
  const d = freshDirs();
  const cases = [
    'powershell -Command "Remove-Item -Recurse -Force x"',
    'powershell -Command Remove-Item -Recurse -Force x',
    'powershell -Command del -Recurse -Force x',
    'powershell -c rm -rf x',
    "powershell -Command 'Remove-Item' -Recurse -Force x",
    "'Remove-Item' -Recurse -Force x",
    'pwsh -EncodedCommand AAAA',
    // -enc…-Präfixformen sind gültige PS-Abkürzungen (eindeutig ggü.
    // -ExecutionPolicy) — Vorbild-Review 2026-08-15, Important #3.
    'pwsh -enc AAAA',
    'powershell -enco AAAA',
    // PS-Call-Operator-Form "& { … }" — Vorbild-Review 2026-08-15, Important #2.
    'powershell -Command "& {Remove-Item -Recurse -Force x}"',
    'pwsh -Command "& { del /s x }"'
  ];
  for (const command of cases) {
    const out = run(inputFor('t-win2', 'Bash', { command }), d.env);
    assert.ok(out.length > 0, 'erwartet Deny: ' + JSON.stringify(command));
  }
});

test('Windows-Fehlalarm-Gegenproben: benigne Formen und Einzeldatei-Loeschungen bleiben frei', () => {
  const d = freshDirs();
  // Routine-Bash einmal erledigen, damit nur der Destruktiv-Detektor entscheidet.
  assert.ok(run(inputFor('t-win3', 'Bash', { command: 'ls' }), d.env).length > 0);
  const cases = [
    'dir /s', 'Get-ChildItem -Recurse', 'del datei.txt', 'del /q build',
    'rmdir x', 'rd x', 'Remove-Item -Recurse x', 'Remove-Item -Force x',
    'ri x', 'erase datei.txt', 'cmd /c dir /s', 'cmd /k echo hi',
    'powershell -Command Get-ChildItem -Recurse',
    // Kompositions-Gegenproben: literal/gequotete Erwaehnungen bleiben frei.
    'echo "del /s x"',
    'git commit -m "fix del /s issue"',
    'echo {del /s x}',
    'powershell -executionpolicy bypass -Command Get-ChildItem'
  ];
  for (const command of cases) {
    const out = run(inputFor('t-win3', 'Bash', { command }), d.env);
    assert.equal(out, '', 'erwartet allow: ' + JSON.stringify(command));
  }
});

// --- Vorbild-Review-Runde 2 (2026-08-16, PR-65-Review): Switch-Syntax-Varianten ---

test('Windows-Destruktivmuster: Switch-Buendelung, implizites -Command, start-Indirektion, :$true-Formen', () => {
  const d = freshDirs();
  const cases = [
    // cmd bündelt Switches ohne Leerzeichen (/s/q statt /s /q) — die gängige
    // Löschform; MSYS-Variante //s/q mitgedeckt.
    'rd /s/q x', 'rmdir /s/q build', 'del /f/s/q *',
    'cmd /c "del /s/q x"', 'cmd //c "rd /s/q x"', 'rd //s/q x',
    // powershell/pwsh führen den Rest ohne -Command-Flag implizit als Kommando
    // aus — Wrapper-Switches (mit Wert) übergehen, Rest rekursieren.
    'powershell Remove-Item -Recurse -Force x',
    'pwsh rm -Recurse -Force x',
    'powershell del /s x',
    'powershell -executionpolicy bypass Remove-Item -Recurse -Force x',
    // start öffnet eine neue Shell — Switches/leeren Titel übergehen, Rest
    // rekursieren.
    'cmd /c start del /s x',
    'start cmd /c del /s x',
    'cmd /c start /b del /s x',
    'cmd /c start "" cmd /c del /s x',
    // PS-Parameterwertform -Flag:$true statt blankem Flag.
    'Remove-Item -Recurse:$true -Force:$true x',
    'ri -Recurse:$true -Force:$true x',
    'powershell -Command Remove-Item -Recurse:$true -Force:$true x',
    // NUMERISCHE Wertform (NC-Haertung nach GLM-R2 2026-08-24): Cmdlets binden
    // -Recurse:1 real — auf PS 5.1 empirisch verifiziert (loescht rekursiv).
    'Remove-Item -Recurse:1 -Force:1 x',
    'ri -Recurse:1 -Force x',
    'powershell -Command "Remove-Item -Recurse:1 -Force C:\\x"'
  ];
  for (const command of cases) {
    const out = run(inputFor('t-win4', 'Bash', { command }), d.env);
    assert.ok(out.length > 0, 'erwartet Deny: ' + JSON.stringify(command));
  }
});

test('Windows-Fehlalarm-Gegenproben Runde 2: -Encoding im Body und implizite Benign-Kommandos', () => {
  const d = freshDirs();
  // Routine-Bash einmal erledigen, damit nur der Destruktiv-Detektor entscheidet.
  assert.ok(run(inputFor('t-win5', 'Bash', { command: 'ls' }), d.env).length > 0);
  const cases = [
    // -enc…-Präfixregel darf nur Wrapper-Argumente prüfen, nicht Body-Parameter:
    // -Encoding ist legitimer Cmdlet-Parameter (z. B. Get-Content), kein
    // -EncodedCommand.
    'powershell -Command Get-Content -Encoding UTF8 log.txt',
    'powershell Get-Content -Encoding UTF8 log.txt',
    // Implizite Benign-Kommandos (ohne -Command) und Wrapper-Wert-Switches.
    'powershell Get-Date',
    'powershell -executionpolicy bypass Get-Date',
    'pwsh -file script.ps1',
    // start mit benignem Ziel bleibt frei.
    'cmd /c start notepad',
    // Explizit abgeschaltete Wertformen zählen nicht als Force ($false wie 0).
    'Remove-Item -Recurse:$true -Force:$false x',
    'Remove-Item -Recurse:1 -Force:0 x',
    'Remove-Item -Recurse:$true -Force:false x'
  ];
  for (const command of cases) {
    const out = run(inputFor('t-win5', 'Bash', { command }), d.env);
    assert.equal(out, '', 'erwartet allow: ' + JSON.stringify(command));
  }
});

// --- Wrapper-Passthrough (§15.46): ein Wrapper darf die Destruktiv-Erkennung nicht umgehen ---
test('Wrapper-Passthrough: Login-Shell, wsl-Bridge, env/sudo/timeout und PowerShell-Wertschalter', () => {
  const d = freshDirs();
  const cases = [
    // Shell-Wrapper mit KOMBINIERTEN Flags — vorher matchte nur das exakte -c,
    // die dokumentierte Bridge-Form dieser Maschinen (bash -lc) lief durch.
    "bash -lc 'rm -rf x'", "bash -ic 'rm -rf x'", "bash -lic 'git push --force origin main'",
    // wsl.exe/wsl — der reale Alltagsweg auf Windows-Maschinen.
    "wsl.exe -d Ubuntu -- bash -lc 'rm -rf ~/x'", 'wsl -d Ubuntu rm -rf /tmp/x',
    "wsl.exe bash -c 'rm -rf x'",
    // Argv-Passthrough-Wrapper: env (auch -i/-S), sudo, doas, nohup, nice, timeout,
    // stdbuf, setsid, exec, command.
    "env FOO=1 bash -c 'rm -rf x'", "env -i bash -c 'rm -rf x'", "env -S 'rm -rf x'",
    'sudo rm -rf /', 'sudo -u root rm -rf x', 'doas rm -rf x', 'nohup rm -rf x',
    'nice -n 10 rm -rf x', 'timeout 5 rm -rf x', 'stdbuf -oL rm -rf x',
    'setsid rm -rf x', 'exec rm -rf x', 'command rm -rf x',
    // PowerShell-Wertschalter: -ep <policy> verbrauchte den Body vorher als
    // implizites Kommando; -en/-e sind EncodedCommand (opaque).
    'powershell -en ZGVsIC9zIHgK', 'powershell -ep bypass -c "rm -rf x"',
    'powershell -ep bypass -Command "Remove-Item -Recurse -Force C:\\x"',
    // start mit nicht-leerem, gequotetem Titel.
    'start "Titel" cmd /c del /s x'
  ];
  for (const command of cases) {
    const out = run(inputFor('t-wrap', 'Bash', { command }), d.env);
    assert.ok(out.length > 0, 'erwartet Deny: ' + JSON.stringify(command));
  }
});

test('Wrapper-Passthrough Gegenprobe: benigne Wrapper-Aufrufe bleiben frei', () => {
  const d = freshDirs();
  // Routine-Bash einmal erledigen, damit nur der Destruktiv-Detektor entscheidet.
  assert.ok(run(inputFor('t-wrap2', 'Bash', { command: 'ls' }), d.env).length > 0);
  const cases = [
    "bash -lc 'ls -la'", "wsl.exe -d Ubuntu -- bash -lc 'git status'",
    'env NODE_ENV=test node script.js', 'sudo apt-get update', 'timeout 5 npm test',
    'command -v rm', 'wsl --list --verbose', 'env',
    'powershell -ep bypass -Command "Get-ChildItem"', 'start "" notepad',
    // Der gefaehrliche String in einem Commit-Text ist KEIN Aufruf.
    "git commit -m 'bash -lc cleanup'"
  ];
  for (const command of cases) {
    const out = run(inputFor('t-wrap2', 'Bash', { command }), d.env);
    assert.equal(out, '', 'erwartet allow: ' + JSON.stringify(command));
  }
});

test('Destruktiv-Deny behaelt Volltext unabhaengig vom verbrauchten Datei-Gate-Budget', () => {
  const d = freshDirs();
  const env = Object.assign({ NC_FFG_FULL_DENIALS: '1' }, d.env);
  // Datei-Gate-Budget bewusst ueberziehen (kondensierte Einzeiler, #2, #3 …).
  denyReason(run(inputFor('t-dd', 'Edit', { file_path: path.join(d.proj, 'a.js') }), env));
  denyReason(run(inputFor('t-dd', 'Edit', { file_path: path.join(d.proj, 'b.js') }), env));
  // Destruktiv-Deny bleibt Volltext (kein Ordinal, keine Kondensierung — Vorbild #2142).
  const msg = denyReason(run(inputFor('t-dd', 'Bash', { command: 'rm -rf build' }), env));
  assert.match(msg, /Destruktiver Befehl erkannt/);
  assert.doesNotMatch(msg, /#\d+ dieser Session/);
});
