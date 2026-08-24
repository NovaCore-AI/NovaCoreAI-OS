// Tests fuer das Safety-Gate (Gate 3, plugins/nc/hooks/nc-safety-gate.js — Port
// 2026-08-23 aus oai-safety-gate.test.mjs@6d3f8db, Mapping D1/EN4). Geprueft werden
// vier Klassen:
//   POSITIV  — die Muster der v1-Liste (NovaCore-Zuschnitt) erzeugen
//              `permissionDecision: "ask"`
//   NEGATIV  — Fehlalarm-Schutz (Abnahmekriterium): tofu plan, kubectl get deploy,
//              lesende mcp-Werkzeuge, Read-only-Git, und die FFG-Muster
//              (Pruefungs-Eigentum — kein Duplikat)
//   FAIL-OPEN — defekte Eingabe blockt nichts, crasht nicht, Exit 0
//   SUBAGENT — das Gate feuert AUCH im Subagenten (bewusste Auslegung, s. Hook-Kopf:
//              Gate 3 prueft je Aktion, nicht je Sitzung — eine Ausnahme waere ein Loch)
// BEWUSSTE ABWEICHUNG VOM VORBILD: Onsites Prod-SQL-Flag-Muster (OFFSITE_…) ist dort
// firmenspezifisch und hier nicht portiert — die zugehoerigen Vorbild-Tests entfallen;
// der WZS-Slot wird nachgetragen, sobald der Maintainer reale Muster benennt (EN4).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const GATE = path.join(HIER, '..', 'hooks', 'nc-safety-gate.js');

function runGate({ tool = 'Bash', toolInput, command, env = {}, stdin, extra = {} } = {}) {
  const eingabe = stdin !== undefined ? stdin : JSON.stringify({
    session_id: 'test-session',
    hook_event_name: 'PreToolUse',
    tool_name: tool,
    tool_input: toolInput !== undefined ? toolInput : { command: command || '' },
    ...extra
  });
  const kindEnv = { ...process.env, ...env };
  delete kindEnv.NC_SAFETY_GATE; // geerbtes Opt-out darf die Tests nicht aushebeln
  if (env.NC_SAFETY_GATE) kindEnv.NC_SAFETY_GATE = env.NC_SAFETY_GATE;
  const r = spawnSync(process.execPath, [GATE], { input: eingabe, encoding: 'utf8', env: kindEnv });
  const stdout = (r.stdout || '').trim();
  let ausgabe = null;
  if (stdout) { try { ausgabe = JSON.parse(stdout); } catch (_) { ausgabe = 'UNPARSEBAR'; } }
  return { status: r.status, stdout, ausgabe };
}

/** Erwartet einen Freigabedialog und liefert dessen Begruendung. */
function askReason(ergebnis) {
  assert.notEqual(ergebnis.ausgabe, null, 'erwartet eine Ask-Ausgabe');
  assert.notEqual(ergebnis.ausgabe, 'UNPARSEBAR', 'Ausgabe muss gueltiges JSON sein');
  const h = ergebnis.ausgabe.hookSpecificOutput;
  assert.equal(h.hookEventName, 'PreToolUse');
  assert.equal(h.permissionDecision, 'ask',
    'Gate 3 fragt (ask) — es blockt nicht und erlaubt nicht');
  return h.permissionDecisionReason;
}

function assertStill(ergebnis, was) {
  assert.equal(ergebnis.stdout, '', was + ' darf das Gate nicht ausloesen');
  assert.equal(ergebnis.status, 0);
}

// --- POSITIV: Muster 1 — Infrastruktur ------------------------------------------
test('tofu/terraform apply und destroy erzeugen einen Freigabedialog', () => {
  for (const command of [
    'tofu destroy', 'tofu apply', 'terraform destroy', 'terraform apply',
    'tofu apply -auto-approve', 'tofu -chdir=infra destroy',
    '/usr/local/bin/tofu destroy', 'cd infra && tofu apply'
  ]) {
    const grund = askReason(runGate({ command }));
    assert.match(grund, /\[Safety-Gate\]/, command);
    assert.match(grund, /(tofu|terraform) (apply|destroy)/, command + ' nennt das Muster nicht');
  }
});

test('Gequotetes Kommandowort und Gruppierungen sind kein Bypass', () => {
  for (const command of ["'tofu' destroy", '$(tofu destroy)', '(tofu destroy)', 'echo x\ntofu destroy']) {
    askReason(runGate({ command }));
  }
});

// --- POSITIV: Muster 2 — generisches deploy-Wort --------------------------------
test('Generisches deploy-Wort erzeugt einen Freigabedialog', () => {
  for (const command of ['npm run deploy', './deploy.sh', 'make deploy', 'kubectl apply -f deployment.yaml']) {
    const grund = askReason(runGate({ command }));
    assert.match(grund, /deploy/, command);
  }
});

// --- POSITIV: Muster 3 — mcp-Schreibverben --------------------------------------
test('Schreibende mcp-Werkzeuge erzeugen einen Freigabedialog mit Vorlagepflicht', () => {
  for (const tool of [
    'mcp__linkedin__send_message', 'mcp__linkedin__connect_with_person',
    'mcp__x__create_post', 'mcp__x__publish_article', 'mcp__x__invite_user',
    'mcp__x__addComment', 'mcp__x__sendMessage'
  ]) {
    const grund = askReason(runGate({ tool, toolInput: { text: 'hallo' } }));
    assert.match(grund, /\[Safety-Gate\]/, tool);
    assert.match(grund, /Vorlagepflicht/, tool + ': die Vorlagepflicht muss im Text stehen');
    assert.match(grund, /WOERTLICHE/, tool + ': der woertliche Text ist Pflicht, keine Zusammenfassung');
  }
});

test('Schreib-Marker im Parameternamen zaehlt ebenso', () => {
  const grund = askReason(runGate({ tool: 'mcp__x__create_draft', toolInput: { message: 'hallo', ziel: 'y' } }));
  assert.match(grund, /Parameter "message"/);
});

// --- REGRESSION: Bypaesse aus dem GLM-Review des Vorbilds (2026-08-17) -----------
// Alle vier Befunde waren am ungefixten Vorbild-Stand manuell reproduziert.

test('HOCH 1 — Shell-Wrapper: der -c-Body wird rekursiv geprueft', () => {
  for (const command of [
    "bash -c 'tofu destroy'",           // einfach gequotet
    'bash -c "tofu destroy"',           // doppelt gequotet
    "sh -c 'tofu apply'",
    "zsh -c 'npm run deploy'",
    "bash -c \"sh -c 'tofu destroy'\"", // verschachtelt
    'cmd //c tofu destroy',             // cmd-Wrapper (MSYS-Form)
    'powershell -Command tofu destroy'  // PowerShell, explizite Form
  ]) {
    askReason(runGate({ command }));
  }
});

test('HOCH 1 — der Wrapper-Body erbt die Read-only-Git-Ausnahme nicht', () => {
  // `git status` selbst bleibt frei; ein Wrapper darf sich diese Ausnahme aber nicht
  // fuer seinen Body ausstellen.
  assertStill(runGate({ command: 'git status' }), 'git status');
  askReason(runGate({ command: "bash -c 'tofu destroy'" }));
});

test('HOCH 2 — Praefix-Kommandos verdecken das Binary nicht mehr', () => {
  for (const command of [
    'sudo tofu destroy', 'env tofu destroy', 'nice tofu destroy',
    'time tofu destroy', 'nohup tofu destroy', 'command tofu destroy',
    'env FOO=1 tofu destroy',   // Zuweisung hinter env
    'FOO=1 tofu destroy',       // fuehrende Zuweisung ohne env
    'sudo -u ci tofu destroy',  // Praefix mit Wertflag
    'sudo /usr/local/bin/tofu apply'
  ]) {
    askReason(runGate({ command }));
  }
});

test('MITTEL 3 — gequotetes deploy-Kommandowort triggert', () => {
  for (const command of ["'deploy.sh'", '"deploy.sh" --prod', "'./deploy-prod.sh'"]) {
    askReason(runGate({ command }));
  }
});

test('MITTEL 4 — die deploy-Ausnahme gilt nur vor dem deploy-Wort (Verbposition)', () => {
  // Lese-Verb NACH dem deploy-Wort ist keine Ausnahme mehr: `deploy` ist hier das
  // ausfuehrende Kommando, nicht das Objekt einer Leseoperation.
  for (const command of ['./deploy.sh get', './deploy.sh logs', './deploy.sh describe', './deploy.sh get-config']) {
    askReason(runGate({ command }));
  }
  // Umgekehrte Reihenfolge bleibt die Vorbild-Ausnahme — auch mit Flags dazwischen.
  for (const command of ['kubectl get deploy', 'kubectl -n prod get deploy', 'kubectl logs deploy/my-app']) {
    assertStill(runGate({ command }), command);
  }
});

// --- NC-Schaerfungen (GLM-Review 2026-08-24, R1-Findings MAJOR 1/2 + MINOR 3) ---------

test('MAJOR 1 — kombinierte -c-Flagbuende der Shell-Wrapper sind kein Bypass', () => {
  for (const command of [
    "bash -lc 'tofu destroy'", "bash -ic 'tofu apply'", "bash -lic 'npm run deploy'",
    "zsh -lc 'terraform destroy'"
  ]) {
    askReason(runGate({ command }));
  }
});

test('MAJOR 2 — Argv-Passthrough-Wrapper (wsl/timeout/doas/setsid/env -S) sind kein Bypass', () => {
  for (const command of [
    'wsl -- tofu destroy', 'wsl -d Ubuntu tofu destroy', "wsl bash -c 'tofu destroy'",
    'timeout 10 tofu apply', 'doas tofu destroy', 'setsid tofu destroy',
    "env -S 'tofu destroy'", 'stdbuf -oL terraform apply'
  ]) {
    askReason(runGate({ command }));
  }
});

test('MINOR 3 — Lesekommandos mit deploy-Wort im Argument bleiben still', () => {
  for (const command of [
    'cat DEPLOY.md', 'ls deployments/', 'grep -rn deploy src/',
    'git log --grep=deploy --oneline', 'head -20 deploy.log', 'echo deploy'
  ]) {
    assertStill(runGate({ command }), command);
  }
  // Gegenprobe: die Positivfaelle bleiben Treffer.
  for (const command of ['npm run deploy', './deploy.sh', 'make deploy']) {
    askReason(runGate({ command }));
  }
});

test('R2-Folgefunde — gewrappte Lesekommandos still, find nur ohne Mutations-Aktionen', () => {
  // Die Lesekommando-Exemption sieht durch dieselben Argv-Wrapper wie die Muster.
  for (const command of [
    'timeout 5 cat DEPLOY.md', 'wsl -- cat DEPLOY.md', 'timeout 5 grep deploy src/',
    'sudo git log --grep=deploy', 'find . -name deploy', 'find deployments/ -type f'
  ]) {
    assertStill(runGate({ command }), command);
  }
  // find mit -delete/-exec ist KEIN Lesekommando — das deploy-Wort fragt wieder.
  for (const command of ['find . -name deploy -delete', 'find . -name deploy -exec rmdir {} +']) {
    askReason(runGate({ command }));
  }
});

test('Praefix und Wrapper heben den Fehlalarm-Schutz nicht auf', () => {
  for (const command of ['sudo tofu plan', "bash -c 'tofu plan'", "bash -c 'npm test'", 'sudo kubectl get deploy']) {
    assertStill(runGate({ command }), command);
  }
});

// --- NEGATIV: Fehlalarm-Schutz (Abnahmekriterium) --------------------------------
test('Fehlalarm-Schutz Bash: plan, get/describe/logs und aehnliche Kommandos bleiben still', () => {
  for (const command of [
    'tofu plan', 'terraform plan', 'tofu -chdir=infra plan', 'tofu validate',
    'kubectl get deploy', 'kubectl get deployment my-app', 'kubectl describe deploy my-app',
    'kubectl logs deploy/my-app', 'npm test', 'echo "tofu destroy"',
    'git commit -m "prepare deploy"'
  ]) {
    assertStill(runGate({ command }), command);
  }
});

test('Fehlalarm-Schutz mcp: lesende Werkzeuge mit aehnlichen Namen bleiben still', () => {
  for (const tool of [
    'mcp__linkedin__get_inbox', 'mcp__linkedin__get_conversation',
    'mcp__linkedin__search_conversations', 'mcp__linkedin__search_posts',
    'mcp__linkedin__get_company_posts', 'mcp__linkedin__get_feed',
    'mcp__github__list_pull_requests', 'mcp__github__read_file'
  ]) {
    assertStill(runGate({ tool, toolInput: { query: 'x' } }), tool);
  }
});

test('Read-only-Git-Introspektion wird nie gegated (Pflicht-Einstieg)', () => {
  for (const command of ['git status', 'git log --oneline -10', 'git diff --stat', 'git worktree list']) {
    assertStill(runGate({ command }), command);
  }
});

test('Pruefungs-Eigentum: die FFG-Muster feuern hier NICHT (kein Duplikat)', () => {
  for (const command of [
    'rm -rf /tmp/junk', 'git reset --hard', 'git push --force origin main',
    'git clean -fd', 'psql -c "drop table kunden"', 'del /s /q build'
  ]) {
    assertStill(runGate({ command }), command + ' gehoert dem FFG');
  }
});

test('Nicht gematchte Werkzeuge loesen nichts aus', () => {
  for (const tool of ['Write', 'Edit', 'Read', 'Glob', 'Grep']) {
    assertStill(runGate({ tool, toolInput: { file_path: 'x.md' } }), tool);
  }
});

// --- SUBAGENTEN ------------------------------------------------------------------
test('Subagenten sind NICHT ausgenommen — Gate 3 prueft je Aktion, nicht je Sitzung', () => {
  const grund = askReason(runGate({ command: 'tofu destroy', extra: { agent_type: 'reviewer', agent_id: 'a1' } }));
  assert.match(grund, /\[Safety-Gate\]/);
  const mcp = askReason(runGate({
    tool: 'mcp__linkedin__send_message', toolInput: { text: 'hallo' },
    extra: { agent_type: 'reviewer', agent_id: 'a1' }
  }));
  assert.match(mcp, /\[Safety-Gate\]/);
});

// --- OPT-OUT / FAIL-OPEN ----------------------------------------------------------
test('NC_SAFETY_GATE=off schaltet das Gate ab', () => {
  for (const wert of ['off', '0', 'false', 'disabled', 'OFF']) {
    assertStill(runGate({ command: 'tofu destroy', env: { NC_SAFETY_GATE: wert } }), 'NC_SAFETY_GATE=' + wert);
  }
});

test('Fail-open: defekte Eingabe fragt nichts, blockt nichts, crasht nicht', () => {
  for (const stdin of ['kein json', '', '{"tool_name":"Bash"}', '{"tool_name":"Bash","tool_input":null}']) {
    const r = runGate({ stdin });
    assert.equal(r.status, 0, 'Exit-Code muss 0 bleiben: ' + JSON.stringify(stdin));
    assert.equal(r.stdout, '');
  }
});

test('Kein State: derselbe Treffer fragt jedes Mal erneut', () => {
  askReason(runGate({ command: 'tofu apply' }));
  askReason(runGate({ command: 'tofu apply' }));
  askReason(runGate({ command: 'tofu apply' }));
});
