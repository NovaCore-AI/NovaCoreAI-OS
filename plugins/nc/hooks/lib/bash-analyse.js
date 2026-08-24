'use strict';
// bash-analyse.js — Bash-Befehlsanalyse fuer das FFG (Design-Spec 2026-07-28 §5 (OS-Repo)).
// Port der GateGuard-Erkennung aus dem ECC-Plugin (gateguard-fact-force.js, ecc@2.0.0,
// gelesen 2026-07-26; Upstream-Stand des ECC-Repos nachgezogen 2026-07-27):
// Quote-Stripping, Subshell-/Brace-Zerlegung, Segment-Splitting, rm-/git-Flag-Analyse,
// SQL-/dd-Muster, die Read-only-Git-Allowlist sowie die quote-aware Zweitpruefung und
// find-exec-Erkennung aus dem Upstream-Fix zu GHSA-4v57-ph3x-gf55 (gequotete
// Kommandowoerter, Newline-Trenner, sh/bash-c-Wrapper, find -exec rm).
// NovaCore-Zuschnitt: Zusatzmuster kommen als Regex-Quelltext ueber die Env-Variable
// NC_FFG_EXTRA_DESTRUCTIVE — der Einstiegspunkt fuer die roten Linien der Firma
// (glab mr merge, exec-*-Deploys, …); die konkreten Muster legt der Maintainer fest
// (Design-Spec 2026-07-28 §5 (OS-Repo), Punkt 5 bewusst offen).
// Onsite-Delta-Port 2026-08-23 (Mapping D3, Quelle: realer oai-ffg-Stand origin/main@6d3f8db):
//   - isDestructiveWindows() als eigener Pass mit Backslash-literalem Tokenizer (Onsite
//     §15.38; kein ECC-Port — Upstream hat keine Windows-Faelle): der flatten-Pfad stript
//     gequotete Bodies (powershell -Command "…"), der quote-aware-Pfad behandelt \ als
//     Escape (C:\…\cmd.exe verliert Separatoren) — beide wuerden die haeufigsten
//     Windows-Formen verfehlen. Rekursion ueber den Rest-STRING wie beim sh -c-Vorbild.
//   - Wrapper-Passthrough (Onsite §15.46): sudo/env/wsl/timeout & Co. reichen ein Kommando
//     durch; ein einzelner Wrapper hatte die gesamte Destruktiv-Erkennung umgangen.
//   - Randnotiz (Onsite uebernommen): isDestructiveFindExec gated rmdir geerbt-ohne-Flags
//     (Upstream-Inkonsistenz, bewusst unveraendert).
// Upstream-Pflege: Drift-Ritual + Pin-Stand einstellig in kern-plugin-bau.md §2b;
// Falltabelle testerzwungen in tests/nc-ffg-drift.test.mjs.
const {
  extractCommandSubstitutions,
  extractSubshellGroups,
  extractBraceGroups
} = require('./shell-substitution');

// SQL-Schluesselwoerter + dd bleiben ein einzelnes Regex — stabile Phrasen ohne
// Flag-Reihenfolge-Probleme. Quoted Strings werden vorher entfernt, damit eine
// Commit-Message mit "drop table" kein Fehlalarm ist.
const DESTRUCTIVE_SQL_DD = /\b(drop\s+table|delete\s+from|truncate|dd\s+if=)\b/i;

// Vom Betreiber gepflegte Zusatzmuster (Regex-Quelltext aus der Env). Ungueltiges
// Regex zaehlt als "nicht konfiguriert" (eingebaute Muster gelten weiter) und wird
// einmal je Prozess auf stderr gemeldet — ein Hook darf wegen Konfig-Fehlern nie
// die Tool-Ausfuehrung crashen.
let extraWarnLogged = false;
function getExtraDestructiveRegex() {
  const raw = process.env.NC_FFG_EXTRA_DESTRUCTIVE || '';
  if (!raw) return null;
  try {
    return new RegExp(raw, 'i');
  } catch (err) {
    if (!extraWarnLogged) {
      try {
        process.stderr.write(
          '[nc-ffg] ignoriere ungueltiges NC_FFG_EXTRA_DESTRUCTIVE-Regex: ' + err.message + '\n'
        );
      } catch (_) { /* stderr-Fehler sind nicht fatal */ }
      extraWarnLogged = true;
    }
    return null;
  }
}

// Inhalte von single-/double-quoted Strings entfernen, damit Phrasen in
// Commit-Messages o. Ae. den Destruktiv-Detektor nicht triggern. Command
// Substitutions werden separat VOR diesem Schritt eingesammelt, weil sie
// auch innerhalb doppelter Anfuehrungszeichen ausgefuehrt werden.
function stripQuotedStrings(input) {
  return input
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""');
}

// Subshell-Begrenzer zu Top-Level-Trennern machen, damit der Destruktiv-Check
// auch in `$(...)` und Backticks greift — sonst rutscht `echo y | $(rm -rf x)`
// am Segment-Splitter vorbei. Iterativ fuer eine Verschachtelungsebene.
function explodeSubshells(input) {
  let out = input;
  for (let i = 0; i < 4; i += 1) {
    const before = out;
    out = out.replace(/\$\(([^()`]*)\)/g, ';$1;');
    out = out.replace(/`([^`]*)`/g, ';$1;');
    if (out === before) break;
  }
  return out;
}

// Kommandozeile an unquoted Shell-Trennern (`;`, `|`, `&`, `&&`, `||`) und
// ueber Subshells hinweg in Top-Level-Segmente zerlegen; Kommentare je
// Segment entfernen.
function splitCommandSegments(input) {
  const stripped = explodeSubshells(stripQuotedStrings(input));
  return stripped
    .split(/[;|&]+/)
    .map(segment => segment.replace(/(^|\s)#.*/, '$1').trim())
    .filter(Boolean);
}

// Einzelnes Segment an Whitespace tokenisieren (Quotes sind bereits zu ''/""
// kollabiert, naives Splitting reicht).
function tokenize(segment) {
  return segment.split(/\s+/).filter(Boolean);
}

// Fuehrenden Pfad und `.exe` abstreifen: `/usr/bin/git`, `git.exe`, `GIT` → `git`.
function commandBasename(token) {
  if (!token) return '';
  return token.replace(/^.*[\\/]/, '').replace(/\.exe$/i, '').toLowerCase();
}

const SHELL_SEGMENT_SEPARATORS = new Set([';', '|', '&', '\n', '\r']);

// Quote-aware Zerlegung einer Kommandozeile in Segmente, mit ENTFERNTEN Quotes in
// den Ergebnis-Woertern. Getrennt wird nur an UNQUOTED `;`, `|`, `&` und Newlines:
//  - ein gequotetes Kommandowort (`'rm'`, `"rm"`) normalisiert zu `rm` (die Shell
//    behandelt Quotes um Kommandonamen transparent), und
//  - Newline wirkt als Kommando-Trenner (die Shell fuehrt jede Zeile aus).
// Beides kann `stripQuotedStrings` + naives Splitting nicht — beides waren
// Destruktiv-Klassifizierer-Bypasses (GHSA-4v57-ph3x-gf55).
function quoteAwareSegments(input) {
  const segments = [];
  let words = [];
  let current = '';
  let hasWord = false;
  let quote = null;
  let escaped = false;

  const flushWord = () => {
    if (hasWord) words.push(current);
    current = '';
    hasWord = false;
  };
  const flushSegment = () => {
    flushWord();
    if (words.length) segments.push(words);
    words = [];
  };

  for (const ch of String(input || '')) {
    if (escaped) {
      current += ch;
      hasWord = true;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      hasWord = true;
      continue;
    }
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
      hasWord = true;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      hasWord = true; // Quote-Beginn startet ein Wort, auch bei leerem Inhalt
      continue;
    }
    if (SHELL_SEGMENT_SEPARATORS.has(ch)) {
      flushSegment();
      continue;
    }
    if (/\s/.test(ch)) {
      flushWord();
      continue;
    }
    current += ch;
    hasWord = true;
  }
  flushSegment();
  return segments;
}

const SHELL_WRAPPERS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh']);
const EMPTY_SET = new Set();

// --- Wrapper-Passthrough (Onsite §15.46, Port 2026-08-23 — kein ECC-Port) ---
// Ein Wrapper reicht ein Kommando durch. ZWEI semantisch verschiedene Sorten:
//   Shell-Wrapper (sh/bash/…): -c leitet eine Kommando-ZEICHENKETTE ein, die die Shell
//     NEU parst — deshalb rekursiert der Body als STRING. Kombinierte Kurzflags zaehlen
//     ebenso (`bash -lc`, `-ic`, `-lic`): ein Zweig, der nur das exakte `-c` matcht,
//     laesst die dokumentierte Bridge-Form dieser Maschinen ungegated durch.
//   Passthrough-Wrapper (env/sudo/wsl/…): fuehren nach ihren EIGENEN Optionen ein Kommando
//     als ARGUMENT-VEKTOR aus. Der Rest wird deshalb als TOKENS rekursiert, nie neu
//     zusammengestringt — sonst gingen die durch Quoting zusammengehaltenen Woerter
//     verloren (aus `bash -c 'rm -rf x'` wuerde `bash -c rm`).
// Ein einzelner Login-/env-/sudo-/wsl-Wrapper hat im Vorbild die gesamte
// Destruktiv-Erkennung umgangen; genau das schliesst dieser Pass.

// -c auch kombiniert: einstelliger Flag-Bund, der ein `c` enthaelt (-c, -lc, -ic, -lic, -cx).
const SHELL_C_FLAG = /^-[a-z]*c[a-z]*$/;

// Kommando-STRING eines Shell-Wrappers herausloesen (Body des ersten -c-Flags).
function shellWrapperBody(tokens) {
  for (let i = 1; i < tokens.length; i++) {
    if (SHELL_C_FLAG.test(tokens[i])) {
      return i + 1 < tokens.length ? { kind: 'string', body: tokens[i + 1] } : null;
    }
    // Ein Nicht-Options-Wort vor jedem -c ist das Skript/Operand (`bash script.sh`) —
    // undurchsichtig wie ein Binary, kein Gate (bewusste Grenze wie ./script.sh).
    if (!tokens[i].startsWith('-')) return null;
  }
  return null;
}

// Grammatik je Passthrough-Wrapper. `value`: Optionen, die den NAECHSTEN Token als Wert
// schlucken. `stringOpt`: Optionen, deren Wert selbst ein Kommando-STRING ist (env -S).
// `query`: ist eine davon gesetzt, fuehrt der Wrapper NICHT aus (command -v) → benign.
// `positional`: so viele Nicht-Options-Positionale vor dem Kommando ueberspringen
// (timeout: die Dauer). `assign`: NAME=value-Zuweisungen ueberspringen (env). `dashDash`:
// `--` beendet die Optionen. Unbekannte `-x` gelten konservativ als wertlose Flags —
// lieber ein Bypass zu wenig als ein Fehlalarm auf eine harmlose Option.
const PASSTHROUGH = {
  env:     { value: new Set(['-u', '--unset', '-C', '--chdir']), stringOpt: new Set(['-S', '--split-string']), assign: true, dashDash: true },
  sudo:    { value: new Set(['-u', '--user', '-g', '--group', '-C', '--close-from', '-p', '--prompt', '-r', '--role', '-t', '--type', '-U', '--other-user', '-R', '--chroot', '-h', '--host']), dashDash: true },
  doas:    { value: new Set(['-u', '-C', '-a']) },
  nohup:   {},
  setsid:  {},
  exec:    { value: new Set(['-a']) },
  command: { query: new Set(['-v', '-V']) },
  nice:    { value: new Set(['-n', '--adjustment']) },
  ionice:  { value: new Set(['-c', '--class', '-n', '--classdata', '-p', '--pid']) },
  stdbuf:  { value: new Set(['-i', '--input', '-o', '--output', '-e', '--error']) },
  timeout: { value: new Set(['-s', '--signal', '-k', '--kill-after']), positional: 1 },
  wsl:     { value: new Set(['-d', '--distribution', '-u', '--user', '--cd', '--shell-type']), dashDash: true }
};

// Inneres Kommando eines Passthrough-Wrappers: eigene Optionen ueberspringen, dann den
// Rest als Token-Vektor zurueckgeben (oder als STRING bei env -S / null bei command -v).
function passthroughInner(base, tokens) {
  const spec = PASSTHROUGH[base];
  if (!spec) return null;
  const value = spec.value || EMPTY_SET;
  const stringOpt = spec.stringOpt || EMPTY_SET;
  const query = spec.query || EMPTY_SET;
  let positionals = spec.positional || 0;
  let i = 1;
  while (i < tokens.length) {
    const t = tokens[i];
    if (spec.dashDash && t === '--') { i += 1; break; }
    if (t.startsWith('-') && t !== '-') {
      if (query.has(t)) return null;                    // command -v: fuehrt nicht aus
      if (stringOpt.has(t)) {                            // env -S 'rm -rf x' (getrennt)
        return i + 1 < tokens.length ? { kind: 'string', body: tokens[i + 1] } : null;
      }
      let attached = null;
      for (const so of stringOpt) {                      // env -S'rm -rf x' (angehaengt)
        if (so.length === 2 && t.length > 2 && t.startsWith(so)) { attached = t.slice(2); break; }
      }
      if (attached !== null) return { kind: 'string', body: attached };
      if (value.has(t)) { i += 2; continue; }            // Option mit getrenntem Wert
      i += 1; continue;                                  // Flag oder --opt=wert
    }
    if (spec.assign && /^[A-Za-z_][A-Za-z0-9_]*=/.test(t)) { i += 1; continue; } // env NAME=val
    if (positionals > 0) { positionals -= 1; i += 1; continue; }                 // timeout-Dauer
    break;                                               // erstes echtes Kommandowort
  }
  const inner = tokens.slice(i);
  return inner.length ? { kind: 'tokens', inner } : null;
}

// Destruktiv-Entscheidung fuer einen bereits quote-aufgeloesten Token-Vektor. Faengt
// rm/git/find -exec direkt und rekursiert durch Shell- und Passthrough-Wrapper. Der
// Wrapper-Body wird BEIDSEITIG geprueft (Unix UND Windows), weil ein Wrapper-Body auch
// ein Windows-Kompositionsweg ist (`wsl -- cmd /c del /s x`).
function isDestructiveTokens(tokens, depth) {
  if (depth > 8 || tokens.length === 0) return false;
  if (isDestructiveRm(tokens)) return true;
  if (isDestructiveGit(tokens)) return true;
  if (isDestructiveFindExec(tokens.join(' '))) return true;
  const base = commandBasename(tokens[0]);
  const res = SHELL_WRAPPERS.has(base) ? shellWrapperBody(tokens) : passthroughInner(base, tokens);
  if (!res) return false;
  if (res.kind === 'string') {
    return isDestructiveQuoteAware(res.body, depth + 1) || isDestructiveWindows(res.body, depth + 1);
  }
  return isDestructiveTokens(res.inner, depth + 1) || isDestructiveWindows(res.inner.join(' '), depth + 1);
}

// Quote-aware Destruktiv-Check: faengt gequotete Kommandowoerter, Newline-Trenner,
// gequotetes `find -exec`, Shell-Wrapper (auch kombinierte Flags) und Passthrough-Wrapper,
// die am Quote-Stripping-Pfad vorbeirutschen (GHSA-4v57-ph3x-gf55 + Onsite §15.46).
// `depth` begrenzt die Wrapper-Rekursion.
function isDestructiveQuoteAware(raw, depth = 0) {
  if (depth > 8) return false;
  for (const tokens of quoteAwareSegments(raw)) {
    if (isDestructiveTokens(tokens, depth)) return true;
  }
  return false;
}

// Destruktive Kommandos in `find ... -exec`-Aufrufen: `-exec rm {} \;` (mit oder
// ohne Flags), `-exec rmdir/unlink {} \;`, `-exec git reset --hard {} \;`.
function isDestructiveFindExec(command) {
  const trimmed = String(command || '').trim();
  if (!trimmed) return false;

  const tokens = tokenize(trimmed);
  if (tokens.length === 0 || commandBasename(tokens[0]) !== 'find') return false;

  const execIndex = tokens.indexOf('-exec');
  if (execIndex === -1) return false;

  // Tokens nach `-exec` bis zum Terminator (`;`, `\;` oder `+`) einsammeln.
  const execTokens = [];
  for (let i = execIndex + 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === ';' || token === '\\;' || token === '+') break;
    execTokens.push(token);
  }
  if (execTokens.length === 0) return false;

  const baseCmd = commandBasename(execTokens[0]);
  if (baseCmd === 'rmdir' || baseCmd === 'unlink') return true;
  // `rm` in -exec ist mit UND ohne Flags destruktiv (find liefert die Ziele).
  if (baseCmd === 'rm') return true;
  if (baseCmd === 'git') {
    const sub = findGitSubcommand(execTokens);
    if (sub && sub.command === 'reset' && sub.rest.includes('--hard')) return true;
  }
  return false;
}

// `rm`-Aufrufe erkennen, die rekursiv UND erzwungen loeschen — kombinierte
// (`-rf`, `-fr`, `-Rf`) und getrennte (`-r -f`) Flag-Formen.
function isDestructiveRm(tokens) {
  if (tokens.length === 0 || commandBasename(tokens[0]) !== 'rm') return false;
  let hasR = false;
  let hasF = false;
  for (const t of tokens.slice(1)) {
    if (t === '--recursive') {
      hasR = true;
      continue;
    }
    if (t === '--force') {
      hasF = true;
      continue;
    }
    if (!t.startsWith('-') || t.startsWith('--')) continue;
    const body = t.slice(1);
    if (/[rR]/.test(body)) hasR = true;
    if (/f/.test(body)) hasF = true;
  }
  return hasR && hasF;
}

// git-Subkommando finden und dabei globale Optionen ueberspringen
// (`-c key=value`, `-C <pfad>`, `--git-dir=…`, `--work-tree=…`, …).
function findGitSubcommand(tokens) {
  if (tokens.length === 0 || commandBasename(tokens[0]) !== 'git') return null;
  const valueConsumingShort = new Set(['-c', '-C']);
  const valueConsumingLong = new Set(['--git-dir', '--work-tree', '--namespace', '--super-prefix']);
  let i = 1;
  while (i < tokens.length) {
    const t = tokens[i];
    if (valueConsumingShort.has(t) || valueConsumingLong.has(t)) {
      i += 2;
      continue;
    }
    if (t.startsWith('--git-dir=') || t.startsWith('--work-tree=') || t.startsWith('--namespace=') || t.startsWith('--super-prefix=')) {
      i += 1;
      continue;
    }
    if (t.startsWith('-')) {
      // Unbekannte globale Option — ueberspringen, ohne einen Wert zu schlucken.
      i += 1;
      continue;
    }
    return { command: t.toLowerCase(), rest: tokens.slice(i + 1) };
  }
  return null;
}

// Destruktive git-Aufrufe: reset --hard, checkout --/-f/., clean -f…,
// push --force (nicht --force-with-lease), commit --amend, rm -r, switch
// --discard-changes/-f/-C.
function isDestructiveGit(tokens) {
  const sub = findGitSubcommand(tokens);
  if (!sub) return false;
  const { command, rest } = sub;

  if (command === 'reset') {
    return rest.includes('--hard');
  }

  if (command === 'checkout') {
    // `git checkout -- <pfad>`, `git checkout .` und die Force-Formen
    // (`--force` / `-f`) verwerfen uncommittete Working-Tree-Aenderungen.
    return rest.some(t => {
      if (t === '--' || t === '.' || t === '--force') return true;
      if (!t.startsWith('-') || t.startsWith('--')) return false;
      return t.slice(1).includes('f');
    });
  }

  if (command === 'clean') {
    // `git clean -f`, `-fd`, `-fdx`, `-df`, `--force`
    return rest.some(t => {
      if (t === '--force') return true;
      if (!t.startsWith('-') || t.startsWith('--')) return false;
      return t.slice(1).includes('f');
    });
  }

  if (command === 'push') {
    // Nur `--force-with-lease` zaehlt als abgesicherter Force.
    // `--force-if-includes` ist OHNE `--force-with-lease` wirkungslos
    // (git-scm.com/docs/git-push); kombiniert mit nacktem `--force` bleibt
    // der nackte Force wirksam → destruktiv. Ein `+`-Refspec-Praefix
    // (`git push origin +main`) erzwingt ebenfalls ein Non-Fast-Forward.
    let withLease = false;
    let bareForce = false;
    let plusRefspecForce = false;
    for (const t of rest) {
      if (t === '--force-with-lease' || t.startsWith('--force-with-lease=')) {
        withLease = true;
        continue;
      }
      if (t === '--force' || t.startsWith('--force=')) {
        bareForce = true;
        continue;
      }
      if (t.startsWith('-') && !t.startsWith('--') && t.slice(1).includes('f')) {
        bareForce = true;
        continue;
      }
      if (t.startsWith('+') && t.length > 1 && /^\+(?:[a-zA-Z_/.:]|HEAD)/.test(t)) {
        plusRefspecForce = true;
      }
    }
    return bareForce || (plusRefspecForce && !withLease);
  }

  if (command === 'commit') {
    return rest.includes('--amend');
  }

  if (command === 'rm') {
    // `git rm -r` / `-rf` / `-r -f` — auch im Index destruktiv.
    let hasR = false;
    for (const t of rest) {
      if (!t.startsWith('-') || t.startsWith('--')) continue;
      if (/[rR]/.test(t.slice(1))) hasR = true;
    }
    return hasR;
  }

  if (command === 'switch') {
    // `git switch` verwirft lokale Aenderungen via --discard-changes,
    // --force/-f oder -C (Force-Create ueberschreibt bestehenden Branch).
    return rest.some(t => {
      if (t === '--discard-changes' || t === '--force') return true;
      if (!t.startsWith('-') || t.startsWith('--')) return false;
      return /[fC]/.test(t.slice(1));
    });
  }

  return false;
}

// Alle ausfuehrbaren Bodies einer Kommandozeile einsammeln (BFS ueber die drei
// Extraktoren), damit auch syntaxuebergreifende Verschachtelungen — `(...)` in
// `$(...)`, `{ ...; }` in `(...)` — geprueft werden. `seen` begrenzt die Kosten
// auf O(eindeutige Bodies).
function collectExecutableBodies(raw) {
  const bodies = [raw];
  const queue = [raw];
  const seen = new Set();

  while (queue.length) {
    const current = queue.shift();
    if (seen.has(current)) continue;
    seen.add(current);

    for (const body of extractCommandSubstitutions(current)) {
      if (seen.has(body)) continue;
      bodies.push(body);
      queue.push(body);
    }
    for (const body of extractSubshellGroups(current)) {
      if (seen.has(body)) continue;
      bodies.push(body);
      queue.push(body);
    }
    for (const body of extractBraceGroups(current)) {
      if (seen.has(body)) continue;
      bodies.push(body);
      queue.push(body);
    }
  }

  return bodies;
}

// --- Windows-Destruktivmuster (Onsite §15.38, Port 2026-08-23 — kein ECC-Port) ---
// Team-Realitaet Windows-first: Agenten koennen cmd-/PowerShell-Kommandos durch
// die Bash senden. Nur rekursive/erzwungene Formen (Konsistenz mit isDestructiveRm):
// del/erase/rmdir/rd genau mit /s; Remove-Item-Aliase genau mit -Recurse UND -Force.
// In Git Bash erreicht uns cmd immer MSYS-praekonvertiert: //c statt /c, //s statt /s.

// Quote-aware Zerlegung mit LITERALEM Backslash (Windows-Pfade bleiben tokenizer-
// identifizierbar) — ansonsten analog quoteAwareSegments; Quotes gruppieren Woerter.
function windowsSegments(input) {
  const segments = [];
  let words = [];
  let current = '';
  let hasWord = false;
  let quote = null;

  const flushWord = () => {
    if (hasWord) words.push(current);
    current = '';
    hasWord = false;
  };
  const flushSegment = () => {
    flushWord();
    if (words.length) segments.push(words);
    words = [];
  };

  for (const ch of String(input || '')) {
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
      hasWord = true;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      hasWord = true;
      continue;
    }
    if (SHELL_SEGMENT_SEPARATORS.has(ch)) {
      flushSegment();
      continue;
    }
    if (/\s/.test(ch)) {
      flushWord();
      continue;
    }
    current += ch;
    hasWord = true;
  }
  flushSegment();
  return segments;
}

const CMD_DELETE_BUILTINS = new Set(['del', 'erase', 'rmdir', 'rd']);
// PowerShell-Aliase auf Remove-Item (rm ist im PS-Kontext derselbe Cmdlet — im
// Bash-Kontext faengt ihn isDestructiveRm; hier zaehlt die PS-Flag-Form).
const PS_REMOVE_ALIASES = new Set(['remove-item', 'ri', 'del', 'erase', 'rd', 'rm']);
const WINDOWS_CMD_WRAPPERS = new Set(['cmd']);
const WINDOWS_PS_WRAPPERS = new Set(['powershell', 'pwsh']);
// Wrapper-Switches von powershell/pwsh, die einen WERT konsumieren — nur sie
// duerfen den impliziten Body-Anfang weiter hinten schieben (Onsite-Restrukturierung
// Review-Runde 2, PR-65-Review).
const PS_VALUE_SWITCHES = new Set([
  '-executionpolicy', '-file', '-windowstyle', '-outputformat', '-inputformat',
  '-configurationname', '-session'
]);
// start (cmd-Builtin und Git-Bash-Helfer) oeffnet eine neue Shell — der Rest
// nach Switches und optionalem Leer-Titel ist das Kommando.
const WINDOWS_START_WRAPPERS = new Set(['start']);

// MSYS praekonvertiert einzelne /-Argumente zu //: //c, //k, //s — normalisieren.
// cmd akzeptiert Switches ausserdem als Slash-Kette: /s/q und /q/s sind
// aequivalent zu "/s /q" (empirisch verifiziert im Vorbild 2026-08-16; die
// Buchstaben-Buendelung /sq ist KEINE gueltige Form und bleibt bewusst aussen vor).
// Tokens ohne fuehrenden / (Pfade wie dir/x, C:\x) sind nie Switches.
function isCmdSwitch(token, name) {
  if (typeof token !== 'string' || !token.startsWith('/')) return false;
  return token.toLowerCase().split('/').filter(Boolean).includes(name);
}

// PowerShell-Parameterform -Recurse:$true — der Wert entscheidet, ob das Flag
// gilt (-Force:$false zaehlt nicht als Force).
// NC-Haertung ggue. dem Vorbild (GLM-R1/R2 2026-08-24, empirisch am Cmdlet belegt):
// Cmdlet-Parameter binden auch NUMERISCHE Wertformen — `Remove-Item -Recurse:1 -Force
// <dir>` loescht auf PS 5.1 real rekursiv (nur [switch]-Parameter von Skript-FUNKTIONEN
// werfen dabei einen Bindungsfehler; der Angriffsweg sind Cmdlets). Deshalb zaehlt jede
// Wertform als aktiv, die nicht EXPLIZIT falsy ist ($false/false/0) — unbekannte Werte
// konservativ als aktiv (Destruktiv-Detektor: lieber einmal zu viel Fakten verlangen).
// Das Vorbild (oai) prueft nur /\$?true$/ und teilt die Luecke — Dauer-Abweichung, im
// Drift-Ritual (kern-plugin-bau.md §2b) dokumentiert.
function psFlagActive(token, flagName) {
  const m = String(token).toLowerCase().match(/^-(recurse|force)(?::(.+))?$/);
  if (!m || m[1] !== flagName) return false;
  return m[2] === undefined || !/^\$?(false|0)$/.test(m[2]);
}

function isDestructiveWindows(raw, depth = 0) {
  if (depth > 4) return false;
  // PS-Call-Operator-Form "& { … }" und Scriptblock-Klammern normalisieren:
  // fuehrendes & verwerfen, {/} als Worttrenner — die idiomatische PS-Form
  // bleibt erkannt (Rekursionseingang, daher auch fuer Wrapper-Bodies).
  const input = String(raw || '').replace(/^\s*&\s*/, '').replace(/[{}]/g, ' ');
  for (const tokens of windowsSegments(input)) {
    if (tokens.length === 0) continue;
    const base = commandBasename(tokens[0]);

    // cmd-Builtins: destruktiv genau mit /s (Switches vor/nach dem Ziel,
    // case-insensitiv, einzeln oder als Slash-Kette /s/q).
    if (CMD_DELETE_BUILTINS.has(base) && tokens.some(t => isCmdSwitch(t, 's'))) return true;

    // PowerShell-Cmdlet-Form: -Recurse UND -Force (exakte Flags samt Wertformen
    // :$true und :1 — nur explizites false/0 schaltet ab, s. psFlagActive;
    // Praefixabkuerzung bleibt dokumentierte Grenze, §15.38).
    if (PS_REMOVE_ALIASES.has(base)) {
      let hasRecurse = false;
      let hasForce = false;
      for (const t of tokens.slice(1)) {
        if (psFlagActive(t, 'recurse')) hasRecurse = true;
        if (psFlagActive(t, 'force')) hasForce = true;
      }
      if (hasRecurse && hasForce) return true;
    }

    // cmd-Wrapper (/c oder /k): Rest als STRING rekursieren (wie sh -c; gequotete
    // Bodies werden so wieder zu Woertern) — zusaetzlich gegen die Unix-Erkennung,
    // weil powershell -c rm -rf x kein SHELL_WRAPPER ist.
    if (WINDOWS_CMD_WRAPPERS.has(base)) {
      const ci = tokens.findIndex(t => isCmdSwitch(t, 'c') || isCmdSwitch(t, 'k'));
      if (ci !== -1 && ci + 1 < tokens.length) {
        const rest = tokens.slice(ci + 1).join(' ');
        if (isDestructiveWindows(rest, depth + 1) || isDestructiveQuoteAware(rest, depth + 1)) return true;
      }
    }

    // PowerShell-Wrapper: Wrapper-Argumente und Body TRENNEN, dann den Body
    // BEIDSEITIG pruefen. Explizites -Command/-c leitet den Body ein; ohne Flag
    // fuehrt powershell den Rest nach den Wrapper-Switchen IMPLIZIT als Kommando
    // aus (im Vorbild vorher komplett am Gate vorbei). -enc…-Praefixformen
    // sind nur im Wrapper-Argumentbereich gueltige Abkuerzungen — im Body sind
    // sie Parameter wie -Encoding (Fehlalarm-Gegenprobe). -File laesst den
    // Skript-Inhalt unsichtbar: gleiches Modell wie ein opaque Binary, kein
    // Gate (bewusste Grenze wie ./script.sh).
    if (WINDOWS_PS_WRAPPERS.has(base)) {
      let bodyIndex = -1;
      for (let i = 1; i < tokens.length; i++) {
        const t = tokens[i];
        if (t.startsWith('-') && t !== '-') {
          const f = t.toLowerCase();
          const name = f.slice(1);
          // -EncodedCommand: -e/-ec sowie jedes Praefix von "encodedcommand" (-en,-enc,…)
          // → Base64-Body, opaque destruktiv-faehig. VOR ExecutionPolicy, sonst faengt -ep
          //   faelschlich hier (Vorbild-Review 2026-08-17, §15.46).
          if (name === 'e' || name === 'ec' || 'encodedcommand'.startsWith(name)) return true;
          // -ExecutionPolicy: Alias -ep und Praefixe -ex… verbrauchen einen WERT (die
          //   Policy). Frueher unbekannt → der Policy-Wert wurde als implizites Kommando
          //   gelesen und der eigentliche Body rutschte am Gate vorbei (Bypass-Befund).
          if (name === 'ep' || (name.length >= 2 && 'executionpolicy'.startsWith(name))) { i++; continue; }
          if (f === '-command' || f === '-c') { bodyIndex = i + 1; break; }
          if (f === '-file') break;
          if (PS_VALUE_SWITCHES.has(f)) i++;
        } else {
          bodyIndex = i;
          break;
        }
      }
      if (bodyIndex !== -1 && bodyIndex < tokens.length) {
        const rest = tokens.slice(bodyIndex).join(' ');
        if (isDestructiveWindows(rest, depth + 1) || isDestructiveQuoteAware(rest, depth + 1)) return true;
      }
    }

    // start-Wrapper: Switches (/b, /min, /wait …) und einen optionalen Titel
    // uebergehen, den Rest als neue Shell rekursieren. `start ["Titel"] cmd …` —
    // der Titel MUSS gequotet sein, aber windowsSegments hat die Quotes bereits
    // entfernt: ein leerer Titel ("" → Leer-Token) UND ein nicht-leerer ("Titel")
    // sind danach nicht mehr vom Kommando unterscheidbar. Deshalb wird von der ersten
    // Nicht-Switch-Position aus BEIDES geprueft — mit dem Token als Kommando UND mit
    // dem Token als Titel (eins weiter). Das kann nur zusaetzlich fangen, nie einen
    // Fehlalarm erzeugen, weil nur ein real destruktiver Body true liefert
    // (Vorbild-Restbefund §15.46: `start "Titel" cmd /c del /s x` lief vorher durch).
    if (WINDOWS_START_WRAPPERS.has(base)) {
      for (let i = 1; i < tokens.length; i++) {
        if (tokens[i] !== '' && tokens[i].startsWith('/')) continue; // /b,/min,/wait …
        for (const start of [i, i + 1]) {
          if (start >= tokens.length) continue;
          const rest = tokens.slice(start).join(' ');
          if (isDestructiveWindows(rest, depth + 1) || isDestructiveQuoteAware(rest, depth + 1)) return true;
        }
        break;
      }
    }
  }
  return false;
}

// Entscheidet, ob eine Bash-Kommandozeile eine destruktive Aktion enthaelt:
// SQL-/dd-Regex (auf quote-bereinigtem, subshell-aufgeloestem Input) plus
// per-Segment-Tokenisierung fuer rm/git — jeweils inklusive der
// Betreiber-Zusatzmuster aus NC_FFG_EXTRA_DESTRUCTIVE.
function isDestructiveBash(command) {
  const raw = String(command || '');
  const flattened = explodeSubshells(stripQuotedStrings(raw));
  if (DESTRUCTIVE_SQL_DD.test(flattened)) return true;

  const extra = getExtraDestructiveRegex();
  if (extra && extra.test(flattened)) return true;

  // find -exec auf ROHEN Body-Segmenten pruefen (vor dem Quote-Stripping):
  // splitCommandSegments entfernt Quotes vor dem Split, aus `find . -exec 'rm' {} \;`
  // wuerde `find . -exec  {} \;` — der Binaername verschwindet und der Check liefe
  // ins Leere. Der Roh-Split faengt zusaetzlich `&&`-/`;`-/`|`-Verbundformen.
  const bodies = collectExecutableBodies(raw);
  for (const body of bodies) {
    for (const rawSeg of body.split(/[;|&]+/).map(s => s.trim()).filter(Boolean)) {
      if (isDestructiveFindExec(rawSeg)) return true;
    }
  }

  const segments = bodies.flatMap(splitCommandSegments);
  for (const segment of segments) {
    const stripped = stripQuotedStrings(segment);
    if (DESTRUCTIVE_SQL_DD.test(stripped)) return true;
    if (extra && extra.test(stripped)) return true;
    const tokens = tokenize(segment);
    if (isDestructiveRm(tokens)) return true;
    if (isDestructiveGit(tokens)) return true;
  }

  // Quote-aware Schlusspass: schliesst die Bypasses gequotetes Kommandowort,
  // Newline-Trenner, gequotetes find -exec und sh/bash -c (GHSA-4v57-ph3x-gf55).
  // sh -c-Bodies sind auch Windows-Kompositionswege — der Wrapper-Zweig
  // rekursiert deshalb ZUSAETZLICH in die Windows-Erkennung (§15.38).
  if (isDestructiveQuoteAware(raw)) return true;

  // Windows-Pass ueber ALLE ausfuehrbaren Bodies (§15.38): bodies[0] ist der
  // Rohtext, die weiteren sind $(…)/Backtick/Subshell-/Brace-Inhalte — der
  // Windows-Detektor laeuft damit ueber dieselben Kompositionen wie rm/git
  // (sonst waere `echo $(del /s x)` ein Bypass, obwohl `echo $(rm -rf x)`
  // gefangen wird).
  for (const body of bodies) {
    if (isDestructiveWindows(body)) return true;
  }

  return false;
}

// Read-only-Allowlist: reine Git-Introspektion (status/log/diff/show/branch/worktree list/
// rev-parse in engen Formen) wird nie gegated — weder destruktiv noch routine.
// NC-Haertung 2026-08-14 (Bugfix, Bugreport Linux-Session; im Onsite-Vorbild NICHT
// vorhanden — Haertungs-Erhalt beim Delta-Port 2026-08-23): das Start-Gate blockte seinen
// eigenen Pflicht-Einstieg, sobald der Befehl einen Pfadwechsel (`cd … && git …`,
// `git -C <dir> …`) oder eine Verkettung read-only-Kommandos enthielt, und kannte
// `git worktree list` (Pflicht-Einstieg laut AGENTS.md) gar nicht. Die Pruefung laeuft
// deshalb SEGMENTweise: die Kommandozeile wird quote-aware an unquoted `;`, `&` und
// Zeilenumbruechen zerlegt, und JEDES Segment muss zulaessig sein — entweder ein reiner
// Pfadwechsel oder ein allowlistetes Git-Kommando. Pipes, Redirects, Substitutionen und
// Klammer-Gruppen bleiben hart ausgeschlossen (unquoted-Scan); das Subkommando wird ueber
// findGitSubcommand ermittelt, damit globale Optionen (`-C <dir>`, `--git-dir=…`) vor dem
// Subkommando stehen duerfen.

// Unquoted verbotene Zeichen: Pipes, Redirects, Command-Substitution und
// Subshell-/Brace-Klammern — in Quotes sind sie Daten, ausserhalb Steuerung.
function hasForbiddenUnquotedChar(input) {
  const s = String(input || '');
  let quote = null;
  let escaped = false;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '|' || ch === '<' || ch === '>' || ch === '`' || ch === '(' || ch === ')') return true;
    if (ch === '$' && s[i + 1] === '(') return true;
  }
  return false;
}

// Ein einzelnes Segment: reiner Pfadwechsel (`cd <pfad>`, genau ein Argument, keine
// Flags) oder ein allowlistetes read-only Git-Kommando.
function isReadOnlySegment(words) {
  const base = commandBasename(words[0]);
  if (base === 'cd') {
    return words.length === 2 && !words[1].startsWith('-');
  }
  if (base !== 'git') return false;

  const sub = findGitSubcommand(words);
  if (!sub) return false;
  const args = sub.rest;

  if (sub.command === 'status') {
    // Lange Formen sowie kombinierte Kurzflags aus {s, b} (`-s`, `-b`, `-sb`, `-bs`).
    return args.every(arg =>
      ['--porcelain', '--short', '--branch'].includes(arg) || /^-[sb]+$/.test(arg));
  }

  if (sub.command === 'diff') {
    // `git diff` ohne Argumente ist reine Introspektion; erlaubte Flags nach
    // Upstream-Stand: --name-only, --name-status, --cached, --staged, --stat.
    const allowedDiffArgs = new Set(['--name-only', '--name-status', '--cached', '--staged', '--stat']);
    if (args.length === 0) return true;
    return args.length <= 2 && args.every(arg => allowedDiffArgs.has(arg));
  }

  if (sub.command === 'log') {
    // `-N` (z. B. -10) ergaenzt 2026-08-10 (Bauplan Onsite-Align-Umbau, AP1): die Kurzform
    // ist der in AGENTS.md dokumentierte Pflicht-Einstieg (`git log --oneline -10`) und
    // rein lesend.
    return args.every(arg => arg === '--oneline' || /^--max-count=\d+$/.test(arg) || /^-\d+$/.test(arg));
  }

  if (sub.command === 'show') {
    // Erlaubt: `git show <ref>`, `git show --stat|--name-only`,
    // `git show <ref> --stat|--name-only` (Upstream-Stand).
    if (args.length === 0) return false;
    const isRef = (arg) => !arg.startsWith('--') && /^[a-zA-Z0-9._:/ -]+$/.test(arg);
    if (args.length === 1) {
      return args[0] === '--stat' || args[0] === '--name-only' || isRef(args[0]);
    }
    if (args.length === 2) {
      return isRef(args[0]) && (args[1] === '--stat' || args[1] === '--name-only');
    }
    return false;
  }

  if (sub.command === 'branch') {
    return args.length === 1 && args[0] === '--show-current';
  }

  if (sub.command === 'rev-parse') {
    // Erlaubt: `--abbrev-ref HEAD` (Branch) sowie seit 2026-08-10 (Bauplan Onsite-Align-
    // Umbau, AP1) `--short HEAD` und blankes `HEAD` (Commit-Hash) — die Formen des
    // Fakten-Stempels aus Gate 2, rein lesend.
    if (args.length === 2 && args[0] === '--abbrev-ref' && /^head$/i.test(args[1])) return true;
    if (args.length === 2 && args[0] === '--short' && /^head$/i.test(args[1])) return true;
    return args.length === 1 && /^head$/i.test(args[0]);
  }

  if (sub.command === 'worktree') {
    // `git worktree list` ist Teil des Pflicht-Einstiegs (AGENTS.md) und rein lesend;
    // alle anderen worktree-Subkommandos (add/remove/…) bleiben gegated.
    return args.length === 1 && args[0] === 'list';
  }

  return false;
}

function isReadOnlyGitIntrospection(command) {
  const trimmed = String(command || '').trim();
  if (!trimmed || hasForbiddenUnquotedChar(trimmed)) {
    return false;
  }
  const segments = quoteAwareSegments(trimmed);
  // Leere Kommandozeile (nur Trenner) ist keine Introspektion; jedes Segment muss
  // zulaessig sein — ein einziges fremdes Segment kippt den Durchlass.
  return segments.length > 0 && segments.every(isReadOnlySegment);
}

// Neben den beiden Entscheidern werden die Zerlegungs-Bausteine exportiert: Das
// Safety-Gate (Gate 3, Onsite §15.26 Nr. 4 — "lib/bash-analyse.js wird wiederverwendet")
// braucht dieselbe quote-aware Zerlegung fuer ANDERE Muster (Infrastruktur, Prod,
// Deploy) und dieselbe Wrapper-Erkennung wie isDestructiveQuoteAware (sh -c-Bodies,
// cmd /c, powershell -Command). Seit dem GLM-Review 2026-08-24 (NC-Findings MAJOR 1/2)
// zusaetzlich shellWrapperBody (kombinierte -c-Flagbuende, bash -lc) und
// passthroughInner (volle Argv-Wrapper-Grammatik env/sudo/wsl/timeout …), damit Gate 3
// dieselbe Wrapper-Flaeche abdeckt wie das Destruktiv-Gate statt einer kleineren.
// Reine Interface-Erweiterung — an der Logik der portierten Funktionen aendert sich
// nichts, der Upstream-Drift-Detektor bleibt unberuehrt.
module.exports = {
  isDestructiveBash,
  isReadOnlyGitIntrospection,
  splitCommandSegments,
  tokenize,
  quoteAwareSegments,
  commandBasename,
  isCmdSwitch,
  shellWrapperBody,
  passthroughInner,
  SHELL_WRAPPERS,
  WINDOWS_CMD_WRAPPERS,
  WINDOWS_PS_WRAPPERS
};
