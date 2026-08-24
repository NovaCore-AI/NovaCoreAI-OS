import { test } from 'node:test';
import assert from 'node:assert/strict';

// nc-ffg-drift.test.mjs — Upstream-Drift-Detektor der FFG-Engine (Onsite §15.38,
// Port 2026-08-23 aus oai-ffg-drift.test.mjs@6d3f8db — Mapping D3).
// Herkunft der Falltabelle: ECC ecc@2.0.0, tests/hooks/gateguard-fact-force.test.js
// Z. 1356–2377 (Engine-Anteil). Bewusst NICHT die Black-Box-Mechanik des Vorbilds
// (spawnSync-Runner, State-Seeding): Diese Datei ruft die Engine direkt auf
// (Unit-Falltabellen) — sie meldet Drift des eigenen Ports, sobald eine Zeile rot
// wird. Neue Upstream-Faelle hier eintragen (Ritual: kern-plugin-bau.md,
// Abschnitt „Upstream-Drift-Ritual FFG").
//
// BEWUSSTE ABWEICHUNGEN VOM UPSTREAM (nicht "Drift", sondern eigene Erweiterungen —
// wer das Ritual faehrt, darf sie NICHT gegen den Upstream zurueckbauen):
//   Onsite §15.38 — Windows-Destruktivmuster (MSYS-Formen, Switch-Ketten, implizites
//            PowerShell-Kommando, start-Indirektion, :$true, EncodedCommand).
//   Onsite §15.46 — Wrapper-Passthrough: Shell-Wrapper mit kombinierten Kurzflags
//            (`bash -lc`) und Argv-Passthrough-Wrapper (env/sudo/doas/nohup/nice/
//            timeout/stdbuf/setsid/exec/command/wsl) rekursieren; PowerShell-
//            Wertschalter `-ep` verbraucht seinen Wert. Rekursionstiefe acht statt
//            vier. Der Upstream kennt davon nichts — diese Datei prueft den
//            PORTIERTEN Anteil, nc-ffg.test.mjs den eigenen.
//   NC-Haertung 2026-08-14 — segmentweise Read-only-Introspektion (cd-Segmente,
//            `git worktree list`, `-sb`-Kurzflags): weder Upstream noch Onsite
//            kennen sie; die Gegenproben unten bleiben davon unberuehrt.
// Skipped wurden die 19 Hook-/Env-Faelle des Vorbilds (GATEGUARD_*/ECC_*-Namen,
// Dampening-Verhalten, warn-once) — dieses Verhalten deckt nc-ffg.test.mjs ab.
// Achtung In-Process-Import: NC_FFG_EXTRA_DESTRUCTIVE neutralisieren (s. u.),
// geerbte Env wuerde Allow-Faelle kippen.
delete process.env.NC_FFG_EXTRA_DESTRUCTIVE;

const { isDestructiveBash, isReadOnlyGitIntrospection } =
  await import('../hooks/lib/bash-analyse.js').then(m => m.default ?? m);

// Erwartungen, die bewusst VOM VORBILD ABWEICHEN (Port weiter/anders) —
// jede Abweichung mit Verweis, damit die Tabelle Drift meldet statt
// stille Abweichungen zu zementieren:
//  - Onsite §15.25 / NC-AP1 2026-08-10: git log -N, rev-parse --short HEAD, blankes
//    HEAD sind erlaubt (Formen des Fakten-Stempels) — im Upstream teils nicht
//    allowgelistet.

// Destruktiv-Faelle des Vorbilds (ecc@2.0.0, Z. 1386–2377): [kommando, label]
const DESTRUKTIV = [
  // Basis-Flags und Pipe/Substitution (Z. 1386–1500)
  ['git push -f origin main', 'git push -f'],
  ['git -c core.foo=bar reset --hard', 'git -c ... reset --hard'],
  ['rm -fr /tmp/junk', 'rm -fr'],
  ['rm -r -f /tmp/junk', 'rm -r -f'],
  ['rm --recursive --force /tmp/junk', 'rm --recursive --force'],
  ['git reset HEAD --hard', 'git reset HEAD --hard'],
  ['git clean -fd', 'git clean -fd'],
  ['echo y | rm -rf /tmp/junk', 'echo y | rm -rf'],
  ['echo $(rm -rf /tmp/junk)', 'rm -rf inside $()'],
  ['echo `git push -f origin main`', 'git push -f inside backticks'],
  ['git push --force --force-if-includes origin main', 'bare force trotz lease-mix'],
  ['git push --force-with-lease --force origin main', 'lease-mix umgekehrt'],
  ['git push origin +main', 'refspec-force kurz'],
  ['git push origin +refs/heads/main:refs/heads/main', 'refspec-force lang'],
  ['git switch --discard-changes feature', 'switch --discard-changes'],
  ['git switch --force main', 'switch --force'],
  ['git switch -f main', 'switch -f'],
  ['git switch -C feature', 'switch -C'],
  // Subshell-/Brace-Gruppen (Z. 1564–1645)
  ['echo y | `rm -rf /tmp/junk`', 'backtick subshell'],
  ['echo y | $(rm -rf /tmp/junk)', 'dollar-paren subshell'],
  ['echo "$(rm -rf /tmp/junk)"', 'double-quoted $()'],
  ['(rm -rf /tmp/junk)', 'plain subshell group'],
  ['((rm -rf /tmp/junk))', 'arithmetic-eval parens'],
  ['{ rm -rf /tmp/junk; }', 'brace group'],
  ['(git push --force origin main)', 'git-force in subshell'],
  ['{ git push --force origin main; }', 'git-force in brace group'],
  ['(echo y; { rm -rf /tmp/junk; })', '() containing {} cross-syntax'],
  ['$(echo y; (rm -rf /tmp/junk))', '$() containing () cross-syntax'],
  // Brace-Span-Skip-Runde (Z. 1713–1748)
  ['{ echo `echo }`; rm -rf /tmp/junk; }', 'brace + backtick containing }'],
  ['{ echo $(echo "}"); rm -rf /tmp/junk; }', 'brace + $() containing }'],
  ['{ (echo "}"); rm -rf /tmp/junk; }', 'brace + () containing }'],
  ['{ x=$(echo a}b); rm -rf /tmp/junk; }', 'brace + $() body with }'],
  ['{ echo foo{bar; rm -rf /tmp/junk; }', 'foo{ token inside brace body'],
  // find -exec (Z. 1936–2000)
  ['find . -name "*.tmp" -exec rm {} \\;', 'find -exec rm'],
  ['find . -name "*.tmp" -exec rm -rf {} \\;', 'find -exec rm -rf'],
  ['find . -name "*.tmp" -exec rmdir {} \\;', 'find -exec rmdir'],
  ['find . -name "*.tmp" -exec unlink {} \\;', 'find -exec unlink'],
  ['find . -name "*.tmp" -exec git reset --hard {} \\;', 'find -exec git reset --hard'],
  ['echo x && find . -exec rm {} \\;', 'compound find -exec rm'],
  ['true; find . -name "*.log" -exec rm -rf {} \\;', 'semicolon find -exec rm -rf'],
  ['echo start | find . -exec rm {} \\;', 'pipe find -exec rm'],
  ['false || find . -exec rm {} \\;', 'OR-chain find -exec rm'],
  // GHSA-4v57-ph3x-gf55 (Z. 2009–2049)
  ['echo safe\nrm -rf /tmp/victim', 'newline-separated rm -rf'],
  ["'rm' -rf /tmp/victim", "quoted 'rm' command word"],
  ['"rm" -rf /tmp/victim', 'quoted "rm" command word'],
  ["sh -c 'rm -rf /tmp/victim'", 'sh -c wrapper'],
  ["bash -c 'rm -rf /tmp/victim'", 'bash -c wrapper'],
  ["find . -name '*.tmp' -exec 'rm' {} \\;", 'quoted find -exec rm'],
  // „still denies" (Z. 2346–2373)
  ['git reset --hard', 'git reset --hard'],
  ['git checkout -f main', 'git checkout -f'],
  ['git push --force origin main', 'git push --force']
];

// Allow-Faelle des Vorbilds („nicht destruktiv" — Routine-Gate unberuehrt, das
// ist Hook-Verhalten und hier nicht Gegenstand): [kommando, label]
const ERLAUBT_NICHT_DESTRUKTIV = [
  ['git commit -m "fix: rm -rf race in worker"', 'rm -rf in -m'],
  ['git commit -m "docs: explain when drop table is safe"', 'drop table in -m'],
  ['git push --force-with-lease --force-if-includes origin main', 'gesicherter force'],
  ['git switch feature', 'switch ohne force'],
  ["git commit -m '(rm -rf /tmp/junk)'", 'single-quoted subshell literal'],
  ['echo "(rm -rf /tmp/junk)"', 'double-quoted subshell literal'],
  ['echo "{ rm -rf /tmp/junk; }"', 'double-quoted brace literal'],
  ['(echo hello)', 'non-destructive subshell'],
  ['{ echo hello; }', 'non-destructive brace group'],
  ['echo {rm -rf /tmp/junk}', 'no-space brace literal'],
  ['echo "to clean run: rm -rf build"', 'rm inside quoted string arg'],
  // find-exec-Gegenstueck (ECC Z. 2069): benignes -exec bleibt allow — der
  // FP-Schutz gerade fuer find-exec-Aenderungen ist Drift-Zweck.
  ['find . -name "*.tmp" -exec echo {} \\;', 'find -exec echo — benign']
];

test('Drift-Tabelle Destruktiv: alle Vorbild-Faelle werden erkannt (ecc@2.0.0 Z. 1386–2377)', () => {
  for (const [command, label] of DESTRUKTIV) {
    assert.equal(isDestructiveBash(command), true,
      'nicht erkannt (Port-Drift?): ' + label + ' → ' + JSON.stringify(command));
  }
});

test('Drift-Tabelle Allow: keine Fehlalarme auf Vorbild-Gegenproben', () => {
  for (const [command, label] of ERLAUBT_NICHT_DESTRUKTIV) {
    assert.equal(isDestructiveBash(command), false,
      'Fehlalarm (Port-Drift?): ' + label + ' → ' + JSON.stringify(command));
  }
});

// Read-only-Git-Introspektion: die 8 Allow-Faelle des Vorbilds (Z. 2273–2336)
// plus die Onsite-/NC-Erweiterungen (bewusste Abweichungen, s. Kopf).
const READ_ONLY = [
  ['git diff --cached', 'Z. 2273'],
  ['git diff --staged', 'Z. 2282'],
  ['git diff --stat', 'Z. 2291'],
  ['git diff --name-only --cached', 'Z. 2300'],
  ['git show --stat', 'Z. 2309'],
  ['git show --name-only', 'Z. 2318'],
  ['git show HEAD --stat', 'Z. 2327'],
  ['git show HEAD --name-only', 'Z. 2336'],
  ['git log --oneline -10', 'Onsite §15.25 / NC-AP1'],
  ['git rev-parse --short HEAD', 'Onsite §15.25 / NC-AP1'],
  ['git rev-parse --abbrev-ref HEAD', 'Onsite §15.25 / NC-AP1'],
  ['git rev-parse HEAD', 'Onsite §15.25 / NC-AP1'],
  ['git status --porcelain', 'Basis'],
  ['git branch --show-current', 'Basis'],
  ['git worktree list', 'NC-Haertung 2026-08-14 (Pflicht-Einstieg)']
];

test('Drift-Tabelle Read-only-Git: Vorbild- und NC-Allowlisten bleiben lesend', () => {
  for (const [command, label] of READ_ONLY) {
    assert.equal(isReadOnlyGitIntrospection(command), true,
      'nicht mehr allowgelistet (Drift?): ' + label + ' → ' + JSON.stringify(command));
  }
  // Gegenprobe: schreibende Formen bleiben false — auch als Segment einer Kette
  // (NC-Introspektion ist segmentweise: EIN fremdes Segment kippt den Durchlass).
  for (const command of ['git status; rm -rf x', 'git push origin main', 'git checkout -f main']) {
    assert.equal(isReadOnlyGitIntrospection(command), false,
      'duerfte nie read-only sein: ' + JSON.stringify(command));
  }
});
