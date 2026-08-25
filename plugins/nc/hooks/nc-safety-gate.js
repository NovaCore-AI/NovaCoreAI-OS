#!/usr/bin/env node
// nc-safety-gate.js — Safety-Gate (Gate 3; Onsite §4.7 + §15.21 + §15.26, Port
// 2026-08-23 aus oai-safety-gate.js@6d3f8db — Mapping D1, Entscheid EN4).
// PreToolUse-Hook auf `Bash` und `mcp__.*`. Bei einem Treffer gibt er
// `permissionDecision: "ask"` zurueck und erzeugt damit einen ECHTEN, fuer den
// Menschen sichtbaren Freigabedialog — der Aufruf laeuft nicht ohne ausdrueckliche
// Zustimmung.
//
// ABGRENZUNG ZUM FFG (Pruefungs-Eigentum — keine Pruefung existiert doppelt):
// Das FFG fragt den Menschen NIE; es verlangt Fakten und laesst danach den normalen
// Permission-Flow laufen. Es deckt die LOKALE Zerstoerung ab (rm -rf, reset --hard,
// Force-Push, drop table, Windows-Destruktivmuster). Dieses Gate deckt genau das
// andere Feld ab: INFRASTRUKTUR, DEPLOY, PROD und KUNDENSICHTBARE Schreibaktionen.
// Die Basis-Destruktivmuster werden deshalb hier BEWUSST NICHT wiederholt — sie
// gehoeren dem FFG.
//
// MUSTERLISTE v1, NovaCore-Zuschnitt (EN4 — "heute werden keine Muster erfunden";
// Wortlaut-Abnahme durch den Maintainer am Phase-G-PR):
//   1. `tofu`/`terraform` mit dem Subkommando `apply` oder `destroy` (Onsite-Paritaet;
//      `apply` ist mitgemeint, weil es reale Cloud-Kosten und Prod-Aenderungen
//      erzeugt, nicht nur Zerstoerung). `plan` feuert nie.
//   2. Generisches `deploy`-Wort mit den Ausnahmen `get`/`describe`/`logs` — die
//      Ausnahme gilt nur, wenn das Lese-Verb VOR dem deploy-Wort steht (Verbposition,
//      GLM-Review des Vorbilds 2026-08-17). Deckt die WZS-rote-Linie „Deploys nur
//      der Mensch" auf der lokalen Kommando-Ebene. WERTENTSCHEIDUNG bei `NAME=wert`
//      (Port Onsite oai-safety-gate.js@a9927b2, Mapping D33, Phase-J-AP-A1, behoben
//      Fehlalarm 2026-08-24 „partsens"/DEPLOYMENT_TYPE): der WERT entscheidet, nicht
//      der Name — deploy-Wort im Wert fragt, deploy-Wort im Namen fragt nur bei
//      Prod-Praefix (`prod*`/`prd*`/`live*`) oder statisch unaufloesbarem Wert
//      (`$VAR`, Substitution), jeder andere Wert bleibt still. Bewertet werden nur
//      Namen, die im quote-bereinigten Strom real zugewiesen sind — eine Erwaehnung
//      IN einer Commit-Message (`git commit -m "DEPLOYMENT_TYPE=prod"`) feuert nicht.
//   3. Generische mcp-Schreibverben: send, post, publish, connect, invite, comment,
//      message — Liste erweiterbar, weil jede neue Drittanbieter-Anbindung eigene
//      Verben mitbringt. Deckt „Kundensichtbares nur der Mensch" fuer Konnektoren.
// BEWUSSTE ABWEICHUNG VOM VORBILD: Onsites Muster „Prod-SQL-Schutz-Flag
// (OFFSITE_RUN_SQL_SCRIPTS_DISABLE_READ_ONLY_PROD)" ist an deren offsite-Repo
// gebunden und waere hier ein totes Muster. Die WZS-Pendants sind MIT der
// Zulieferung des Live-Umgebungs-Kollegen (2026-08-24) und den Maintainer-
// Entscheid 2026-08-25 (curl/wp-Eigentumsfrage -> Gate 3) nachgetragen:
//   4. DB-Schreibweg WZS (DB-Haelfte): Prisma 7 als EINZIGER Prod-DB-Schreibweg
//      (migrate dev|deploy|reset, db push|execute|seed, db:*-npm-Skripte) plus
//      Admin-Pfad `docker compose exec postgres psql`. Die Deploy-Haelfte
//      (gh workflow run deploy-prod.yml, docker compose pull/up -d) wartet auf
//      die Maintainer-Weiche Actions+SSH vs. Coolify (Register 2026-08-24) —
//      ergaenzen erlaubt, erfinden nicht.
//
// KEIN STATE (Onsite §15.26 Nr. 2): gefragt wird bei JEDEM Treffer — der
// Freigabedialog IST die Kontrolle; ein zweites `tofu apply` verdient eine zweite
// Freigabe. Die dokumentierte Alternative fuer den Fall von Dialog-Muedigkeit ist das
// FFG-Muster "einmal je Kommando-Hash und Session"; ein Wechsel dorthin ist
// Maintainer-Entscheid, nie eine stillschweigende Umstellung.
//
// SUBAGENTEN SIND NICHT AUSGENOMMEN (bewusste Auslegung, Onsite-Paritaet).
// Die anderen Kern-Hooks nehmen Subagenten aus, weil ihre Pflicht eine SITZUNGS-Pflicht
// ist, die der Parent bereits erfuellt hat (Start-Zwang, Doks-Sync, Mahnung). Gate 3
// prueft dagegen je EINZELNER AKTION und verlangt eine menschliche Freigabe — diese
// Begruendung traegt hier nicht, und eine Ausnahme waere ein Loch im Sicherheitsnetz
// (ein Subagent koennte `tofu destroy` ungefragt ausfuehren).
//
// BYPASS-HAERTUNG (GLM-Review des Vorbilds 2026-08-17, vier Befunde — im Port
// vollstaendig uebernommen): Ein Muster wird auch dann erkannt, wenn es hinter einem
// SHELL-WRAPPER steht (`bash -c '…'`, `sh -c`, `cmd /c`, `powershell -Command` —
// der Body wird rekursiv geprueft, Wrapper-Konstanten aus bash-analyse.js) oder
// hinter einem PRAEFIX-KOMMANDO (`sudo`, `env`, `nice`, `time`, `nohup`, `command`,
// `xargs`, fuehrende `VAR=wert`-Zuweisungen). Das gequotete Kommandowort
// (`'deploy.sh'`) faengt der quote-aware Schlusspass. Und die deploy-Ausnahme gilt
// nur an der Verbposition, damit `./deploy.sh get` nicht durchrutscht.
// NC-SCHAERFUNGEN (GLM-Review 2026-08-24, R1 — ueber das Vorbild hinaus, in
// Port-Richtung): (1) Shell-Wrapper auch mit kombinierten -c-Flagbuenden
// (`bash -lc/-ic/-lic`, shellWrapperBody); (2) volle Argv-Passthrough-Grammatik via
// passthroughInner (env -S, doas, setsid, ionice, stdbuf, timeout, wsl — `wsl -- tofu
// destroy` fragt); (3) reine Lesekommandos mit deploy-Wort im Argument fragen nie
// (istLeseKommando — `cat DEPLOY.md`, `git log --grep=deploy` bleiben still).
//
// FEHLALARM-SCHUTZ ist Abnahmekriterium: `tofu plan`, `kubectl get deploy`
// und lesende mcp-Werkzeuge mit aehnlichen Namen (get_inbox, get_conversation,
// search_conversations, search_posts, get_company_posts, get_feed) duerfen NICHT
// feuern. Ein Gate, das zu oft fragt, wird weggeklickt und verliert seine Wirkung.
//
// REICHWEITEN-GRENZE: Der Hook sieht nur LOKALE Aufrufe. Der reale
// WZS-Prod-Risikobereich (Deploy-/DB-/Webhook-Eingriffe ueber Web-UIs oder fremde
// Maschinen) ist fuer jeden lokalen Hook unsichtbar — die Absicherung dort ist
// prozedural (Abteilungs-Skills `rel-vorbereitung`/`rel-verifikation`,
// Domaenen-rote-Linien der `pflege-auspraegung.json`).
//
// Manifest-Unabhaengigkeit (Onsite §15.21): Der `mcp__.*`-Matcher haengt NICHT daran,
// dass ein Plugin einen MCP-Server im Manifest mitbringt — Konnektoren werden
// skill-gefuehrt eingerichtet, der Nutzer traegt den Server selbst ein. Ein
// manifest-abhaengiges Gate waere im Regelfall blind. AFFILIATE-INVARIANTE (I-A0):
// Der Matcher trifft mcp-Werkzeuge JEDER Herkunft — auch Affiliate-Plugins; das ist
// gewollt (Gate je Aktion, nicht je Plugin-Kategorie) und beruehrt die SSOT-Isolation
// der Affiliates nicht.
//
// Kein Marker: aktiv, wo der Kern installiert ist. Opt-out AUSSCHLIESSLICH per
// Env: NC_SAFETY_GATE=off. Fail-open bei internen Fehlern.
'use strict';
const fs = require('fs');
const {
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
} = require('./lib/bash-analyse');

const OFF_VALUES = new Set(['0', 'false', 'off', 'disabled', 'disable']);
// Wrapper-Rekursion begrenzen. EIGENER Deckel: das Destruktiv-Gate steht seit dem
// Wrapper-Passthrough-Port bei acht Ebenen, dieses Gate bleibt bewusst bei vier —
// andere Pruefung, andere Kosten-/Nutzen-Lage (Pruefungs-Eigentum). Kein Gleichstand
// behaupten.
const MAX_TIEFE = 4;

function isDisabled() {
  return OFF_VALUES.has(String(process.env.NC_SAFETY_GATE || '').trim().toLowerCase());
}

// --- Praefix-Kommandos (Vorbild-Befund HOCH 2) -------------------------------------
// `sudo tofu destroy`, `env FOO=1 tofu destroy`, `nice tofu destroy` lief vorbei,
// weil nur tokens[0] als Binary galt. bash-analyse.js hat dafuer keinen Baustein
// (findGitSubcommand ueberspringt git-GLOBALOPTIONEN, keine Praefix-Kommandos) —
// deshalb hier ein eigener, bewusst kleiner Tokenizer-Helfer.
const PRAEFIX_KOMMANDOS = new Set(['sudo', 'env', 'nice', 'time', 'nohup', 'command', 'xargs']);
// Kurzflags dieser Praefixe, die einen WERT schlucken. Bewusst knappe, belegte Liste;
// unbekannte Wertflags bleiben eine dokumentierte Grenze (dann greift der Fallback
// unten nicht mehr, und das Kommando laeuft wie vor dem Fix durch).
const PRAEFIX_WERT_FLAGS = new Set(['-u', '-g', '-p', '-n', '-P', '-I', '-d', '-S', '-C', '-a', '-o', '-f']);
// Fuehrende Umgebungszuweisung: `FOO=1 tofu destroy` und `env FOO=1 tofu destroy`.
const ZUWEISUNG = /^[A-Za-z_][A-Za-z0-9_]*=/;

// Index des real ausgefuehrten Kommandos: fuehrende Zuweisungen, Praefix-Kommandos
// und deren Flags ueberspringen. Ohne Praefix ist das schlicht 0.
function binaerIndex(tokens) {
  let i = 0;
  let praefixGesehen = false;
  while (i < tokens.length) {
    const t = tokens[i];
    if (ZUWEISUNG.test(t)) { i += 1; continue; }
    if (praefixGesehen && t.startsWith('-')) {
      i += PRAEFIX_WERT_FLAGS.has(t.toLowerCase()) ? 2 : 1;
      continue;
    }
    if (PRAEFIX_KOMMANDOS.has(commandBasename(t))) { praefixGesehen = true; i += 1; continue; }
    return i;
  }
  return -1;
}

// --- Muster 1: Infrastruktur-Kommandos -------------------------------------------
const INFRA_BINARIES = new Set(['tofu', 'terraform']);
const INFRA_SUBKOMMANDOS = new Set(['apply', 'destroy']);

// Erstes Nicht-Flag-Token nach dem Binary IST das Subkommando — globale Optionen
// (`-chdir=infra`, `-help`) stehen davor. `tofu plan` faellt damit sauber durch.
function infraTreffer(tokens) {
  const bi = binaerIndex(tokens);
  if (bi === -1) return null;
  const binary = commandBasename(tokens[bi]);
  if (!INFRA_BINARIES.has(binary)) return null;
  for (const t of tokens.slice(bi + 1)) {
    if (t.startsWith('-')) continue;
    const sub = t.toLowerCase();
    if (!INFRA_SUBKOMMANDOS.has(sub)) return null;
    return {
      muster: binary + ' ' + sub,
      wirkung: sub === 'destroy'
        ? 'baut real existierende Infrastruktur ab'
        : 'aendert real existierende Infrastruktur und erzeugt Cloud-Kosten'
    };
  }
  return null;
}

// --- Muster 2: generisches deploy-Wort --------------------------------------------
// Ausnahmen exakt wie im Vorbild: `get`, `describe`, `logs`. Damit bleibt
// `kubectl get deploy` still, `npm run deploy` fragt.
const DEPLOY_AUSNAHMEN = new Set(['get', 'describe', 'logs']);

// --- Wertentscheidung bei NAME=wert (Port Onsite oai-safety-gate.js@a9927b2, Muster 2;
// Mapping D33, Bauplan Phase J AP A1) --------------------------------------------------
// Belegter Fehlalarm 2026-08-24 (Arbeits-Repo "partsens"): dessen Compose-Achse heisst
// DEPLOYMENT_TYPE, weshalb JEDER lokale Containerstart (`make up DEPLOYMENT_TYPE=dev`)
// einen Freigabedialog erzeugte — der Alltagsstart, nicht die Auslieferung.
// Fehlalarm-Schutz ist Abnahmekriterium (Bauplan J-2): ein Gate, das den Alltagsweg
// gated, wird weggeklickt und verliert genau dort seine Wirkung, wo sie zaehlt.
//
// ENTSCHEIDEND IST DER WERT, NICHT DER NAME — in drei Stufen:
//   a) deploy-Wort im WERT              → fragen  (`MODE=deploy-prod`)
//   b) deploy-Wort im NAMEN, Wert PROD  → fragen  (`DEPLOYMENT_TYPE=prod`)
//   c) deploy-Wort im NAMEN, Wert sonst → still   (`DEPLOYMENT_TYPE=dev|local`)
// Stufe b ist der Kern (Maintainer-Vorgabe 2026-08-24): Wer die Deploy-Achse eines
// Repos auf `prod` stellt, faellt genau die Auslieferungs-Entscheidung, die dieses Gate
// abdeckt — dass das ueber eine Variable statt ueber ein Verb passiert, aendert die
// Wirkung nicht.
// PROD-Erkennung per PRAEFIX, nicht per exakter Liste: eine exakte Liste verliert die
// realen Prod-Achsen `prod-eu`, `prod2`, `prod-us-east-1`, `prd-01` — mehrregional und
// mehrstufig ist der Normalfall, nicht die Ausnahme. `preprod` braucht KEINE eigene
// Ausnahme: es beginnt nicht mit `prod`.
const PROD_PRAEFIXE = ['prod', 'prd', 'live'];

// Ein statisch nicht aufloesbarer Wert (`$TARGET`, `${ENV}`, `$(…)`, Backticks) zaehlt
// als potenziell PROD und fragt — dieselbe konservative Linie wie bei einem unbekannten
// Wert. `DEPLOY_TARGET=$TARGET ./release.sh` bleibt damit gegated.
const UNAUFLOESBAR = /[$`]/;

// Eigene, permissive Extraktion (nicht die identifier-verankerte ZUWEISUNG-Regex):
// ohne `=` liefert indexOf -1, und beide Helfer gaeben sonst still Unsinn zurueck.
const hatZuweisung = (t) => String(t).indexOf('=') > 0;
const zuweisungName = (t) => (hatZuweisung(t) ? t.slice(0, t.indexOf('=')) : '');
const zuweisungWert = (t) => (hatZuweisung(t)
  ? t.slice(t.indexOf('=') + 1).replace(/["']/g, '').trim()
  : '');

// Ein leerer Wert (`DEPLOYMENT_TYPE=`, `DEPLOYMENT_TYPE=""`) ist kein PROD-Ziel — eine
// geleerte Achse liefert nichts aus.
function istProdWert(wert) {
  if (!wert) return false;
  if (UNAUFLOESBAR.test(wert)) return true;
  const w = wert.toLowerCase();
  return PROD_PRAEFIXE.some(p => w.startsWith(p));
}

// Stufe b isoliert — der Dialogtext soll die Prod-Ausrichtung benennen, nicht von
// "Auslieferung" sprechen, wo eine Umgebungsachse gestellt wird.
function istProdZuweisung(t) {
  return ZUWEISUNG.test(t)
    && /deploy/i.test(zuweisungName(t))
    && istProdWert(zuweisungWert(t));
}

// Ist `t` eine Zuweisung, entscheidet der WERT (Stufe a/b); sonst das Token selbst wie
// bisher (Kommandowort-Position, Muster-1-Grammatik).
const TRAEGT_DEPLOY = (t) => (ZUWEISUNG.test(t)
  ? /deploy/i.test(zuweisungWert(t)) || istProdZuweisung(t)
  : /deploy/i.test(t));

// Vorbild-Befund MITTEL 4: Die Ausnahme galt fuer das GANZE Segment, egal an welcher
// Position — `./deploy.sh get` lief damit durch. Geschaerft auf die Verbposition:
// Die Ausnahme greift nur, wenn das Lese-Verb VOR dem deploy-Wort steht, das
// deploy-Wort also sein OBJEKT ist. `kubectl get deploy` und `kubectl -n prod get
// deploy` bleiben still, `./deploy.sh get` fragt.
// NC-Schaerfung (GLM-Review 2026-08-24, MINOR 3 — Fehlalarm-Schutz ist Abnahmekriterium):
// Reine LESEKOMMANDOS mit einem deploy-Wort im Argument fragen nie — `cat DEPLOY.md`,
// `ls deployments/`, `grep -rn deploy src/`, `git log --grep=deploy` sind Alltag und kein
// Auslieferungsweg. Die Ausnahme haengt an der KOMMANDOWORT-Position (binaerIndex);
// `./deploy.sh`, `npm run deploy` & Co. bleiben Treffer. Benannte Grenze:
// `cat deploy.sh | bash` rutscht damit durch — gezielte Indirektion, nicht der
// Versehens-Fall, gegen den dieses Gate schuetzt.
const LESE_KOMMANDOS = new Set(['cat', 'ls', 'dir', 'grep', 'rg', 'less', 'more', 'head', 'tail', 'echo', 'type', 'wc', 'stat', 'file']);
const GIT_LESE_SUBS = new Set(['log', 'grep', 'show', 'diff', 'status', 'blame']);
// `find` mutiert mit -delete/-exec real (GLM-R2-NIT) und zaehlt nur OHNE diese
// Aktionen als Lesekommando.
const FIND_MUTATIONEN = new Set(['-delete', '-exec', '-execdir', '-ok', '-okdir']);
function istLeseKommando(tokens) {
  // GLM-R2-Folgefund: die Exemption muss durch dieselben Argv-Wrapper sehen wie die
  // Mustererkennung (MAJOR 2) — sonst fragt `timeout 5 cat DEPLOY.md` faelschlich.
  let rest = tokens;
  for (let runde = 0; runde < 4 && rest.length > 0; runde += 1) {
    const bi = binaerIndex(rest);
    if (bi === -1) return false;
    rest = rest.slice(bi);
    const base = commandBasename(rest[0]);
    if (base === 'find') return !rest.some(t => FIND_MUTATIONEN.has(t));
    if (LESE_KOMMANDOS.has(base)) return true;
    if (base === 'git') {
      // Erstes Nicht-Options-Token nach git ist das Subkommando (bewusst enge Form).
      for (const t of rest.slice(1)) {
        if (t.startsWith('-')) continue;
        return GIT_LESE_SUBS.has(t.toLowerCase());
      }
      return false;
    }
    const res = passthroughInner(base, rest);
    if (res && res.kind === 'tokens') { rest = res.inner; continue; }
    return false;
  }
  return false;
}

function deployTreffer(tokens) {
  const dIdx = tokens.findIndex(TRAEGT_DEPLOY);
  if (dIdx === -1) return null;
  if (istLeseKommando(tokens)) return null; // NC-Schaerfung, s. o.
  for (let i = 0; i < dIdx; i += 1) {
    const t = tokens[i];
    if (DEPLOY_AUSNAHMEN.has(t.toLowerCase()) || DEPLOY_AUSNAHMEN.has(commandBasename(t))) return null;
  }
  return {
    muster: 'deploy',
    wirkung: istProdZuweisung(tokens[dIdx])
      ? 'richtet den Lauf auf die PROD-Umgebung aus'
      : 'stoesst eine Auslieferung an'
  };
}

// Quote-aware Variante (Vorbild-Befund MITTEL 3): `'deploy.sh'` ueberlebt das
// Quote-Stripping nicht. Bewusst NUR die Kommandowort-Position — sonst wuerde
// `echo "deploy done"` feuern, weil quoteAwareSegments den gequoteten Text zu EINEM
// Wort macht. Dieselbe Begrenzung wie beim Infrastruktur-Muster.
function deployKommandowort(tokens) {
  const bi = binaerIndex(tokens);
  if (bi === -1 || !TRAEGT_DEPLOY(tokens[bi])) return null;
  return { muster: 'deploy', wirkung: 'stoesst eine Auslieferung an' };
}

// Zuweisungs-Pass fuer den QUOTE-AWAREN Tokenstrom (Vorbild-Befund, Muster 2).
// Notwendig, weil die quote-bereinigte Zerlegung (segmentTokens/tokenize) den WERT
// einer gequoteten Zuweisung kollabiert (`DEPLOYMENT_TYPE="prod"` kommt dort als
// leeres `""` an, damit `echo "…"` nie feuert) — und genau der Wert traegt hier die
// Entscheidung. Anders als beim Kommandowort-Pass werden ALLE Tokens geprueft: eine
// Zuweisung steht nie an der Binary-Position.
//
// NUR REAL ZUGEWIESENE NAMEN: Im quote-awaren Strom ist eine Erwaehnung IM STRING von
// einer echten Zuweisung nicht zu unterscheiden — `git commit -m "DEPLOYMENT_TYPE=prod"`
// und `make up DEPLOYMENT_TYPE="prod"` ergeben dort dasselbe literale Token. Ohne diese
// Schranke feuerte das Gate auf Commit-Nachrichten und `grep`-Treffer, also genau gegen
// die Kopf-Invariante ("eine Erwaehnung IN einem String ist kein Kommando").
// `zugewieseneNamen` liest die Namen deshalb aus dem quote-BEREINIGTEN Strom (T4).
function deployZuweisung(tokens, namen) {
  for (const t of tokens) {
    if (!ZUWEISUNG.test(t)) continue;
    if (!namen.has(zuweisungName(t))) continue;
    if (istProdZuweisung(t)) {
      return { muster: 'deploy', wirkung: 'richtet den Lauf auf die PROD-Umgebung aus' };
    }
    if (/deploy/i.test(zuweisungWert(t))) {
      return { muster: 'deploy', wirkung: 'stoesst eine Auslieferung an' };
    }
  }
  return null;
}

// Namen der REAL zugewiesenen Variablen, gelesen aus dem quote-bereinigten Strom
// (segmentTokens) — Schranke des Zuweisungs-Passes oben.
function zugewieseneNamen(segmente) {
  const namen = new Set();
  for (const tokens of segmente) {
    for (const t of tokens) if (ZUWEISUNG.test(t)) namen.add(zuweisungName(t));
  }
  return namen;
}

// --- Muster 4: DB-Schreibweg WZS (DB-Haelfte) ---------------------------------------
// Zulieferung 2026-08-24: Prisma 7 ist der einzige Prod-DB-Schreibweg; der Admin-Pfad
// laeuft ueber `docker compose exec postgres psql`. Beides fragt — die DB ist die
// rote Linie „Datenveraenderung an Prod-Systemen". Lokales psql (Dev-Datenbank,
// --version) bleibt bewusst still: WZS-Prod ist nur ueber die zwei benannten Wege
// erreichbar, alles andere waere Fehlalarm (Abnahmekriterium).
const PRISMA_BINARIES = new Set(['prisma']);
const PRISMA_SUBKOMMANDOS = new Set(['push', 'execute', 'seed', 'migrate', 'db']);
const PRISMA_MIGRATE_SUBS = new Set(['dev', 'deploy', 'reset']);
// npm/yarn/pnpm run <script>: db:*-Skripte sind laut Zulieferung Schreibskripte.
const RUN_MANAGER = new Set(['npm', 'yarn', 'pnpm', 'bun']);
const DB_SKRIPT_PRAEFIX = /^db:.+/;

function prismaTreffer(tokens) {
  const bi = binaerIndex(tokens);
  if (bi === -1) return null;
  if (!['prisma', 'npx', 'pnpx'].includes(commandBasename(tokens[bi]).toLowerCase())) return null;
  const klein = tokens.map(t => commandBasename(t).toLowerCase());
  const pi = klein.indexOf('prisma');
  if (pi === -1) return null;
  const args = tokens.slice(pi + 1).filter(t => !t.startsWith('-'));
  const sub1 = (args[0] || '').toLowerCase();
  const sub2 = (args[1] || '').toLowerCase();
  if (sub1 === 'migrate') {
    if (PRISMA_MIGRATE_SUBS.has(sub2)) {
      return { muster: 'prisma migrate ' + sub2, wirkung: 'veraendert das Prod-DB-Schema (Prisma)' };
    }
    return null; // migrate status/diff — lesend
  }
  if (sub1 === 'db') {
    if (['push', 'execute', 'seed'].includes(sub2)) {
      return { muster: 'prisma db ' + sub2, wirkung: 'schreibt in die Datenbank (Prisma)' };
    }
    return null; // db pull — lesend
  }
  if (['push', 'execute', 'seed'].includes(sub1)) {
    return { muster: 'prisma ' + sub1, wirkung: 'schreibt in die Datenbank (Prisma)' };
  }
  return null;
}

// npm/yarn/pnpm/bun run <db:*-Skript> — Schreibskripte laut Zulieferung.
function npmDbTreffer(tokens) {
  const bi = binaerIndex(tokens);
  if (bi === -1) return null;
  if (!RUN_MANAGER.has(commandBasename(tokens[bi]).toLowerCase())) return null;
  const klein = tokens.map(t => t.toLowerCase());
  const runIdx = klein.indexOf('run');
  if (runIdx === -1) return null;
  const skript = tokens[runIdx + 1];
  if (skript && DB_SKRIPT_PRAEFIX.test(skript)) {
    return { muster: 'run ' + skript, wirkung: 'schreibt in die Datenbank (db-Skript)' };
  }
  return null;
}

// docker compose exec postgres psql — Admin-Pfad per SSH. Der psql-Body selbst wird
// NICHT zerlegt (SELECT vs. DROP): der Admin-Pfad als ganzer ist die rote Linie.
function composePsqlTreffer(tokens) {
  const bi = binaerIndex(tokens);
  if (bi === -1) return null;
  const base = commandBasename(tokens[bi]).toLowerCase();
  if (base !== 'docker' && base !== 'docker-compose') return null;
  const klein = tokens.map(t => commandBasename(t).toLowerCase());
  const execIdx = klein.indexOf('exec');
  if (execIdx === -1) return null;
  const nachExec = klein.slice(execIdx + 1).filter(w => w && !w.startsWith('-'));
  if (nachExec.length < 2) return null;
  if (nachExec[0] !== 'postgres' || nachExec[1] !== 'psql') return null;
  // Fehlalarm-Schutz: `psql --version` / `psql -V` druckt nur die lokale Version,
  // keine DB-Interaktion — still. Alles andere im Admin-Pfad fragt (auch SELECT:
  // der Pfad als ganzer ist die rote Linie).
  const psqlIdx = klein.indexOf('psql', execIdx + 1);
  const nurVersion = tokens.slice(psqlIdx + 1).every(t => ['--version', '-V', '-W'].includes(t));
  if (nurVersion) return null;
  return { muster: 'docker compose exec postgres psql', wirkung: 'oeffnet den Prod-DB-Admin-Pfad (psql)' };
}

function dbTreffer(tokens) {
  return prismaTreffer(tokens) || npmDbTreffer(tokens) || composePsqlTreffer(tokens);
}


// Zerlegung wie im FFG: quote-bereinigt und subshell-aufgeloest (eine Erwaehnung IN
// einem String — Commit-Message, echo — ist kein Kommando und darf nie feuern).
// Zusaetzlich werden Gruppierungsklammern zu Trennern, sonst waere `(tofu destroy)`
// ein Bypass.
function segmentTokens(command) {
  const out = [];
  for (const segment of splitCommandSegments(command)) {
    for (const teil of segment.split(/[(){}]+/)) {
      const trimmed = teil.trim();
      if (trimmed) out.push(tokenize(trimmed));
    }
  }
  return out;
}

// Body eines Shell-Wrappers herausziehen (Vorbild-Befund HOCH 1).
// `bash -c 'tofu destroy'` lief komplett vorbei, weil das -c-Argument EIN Token ist
// und damit nie als Binary geprueft wurde. Dasselbe Muster loest das FFG in
// isDestructiveQuoteAware (bash-analyse.js) — Wrapper-Konstanten von dort
// wiederverwendet, statt sie hier zu duplizieren.
// Dokumentierte Grenze: die IMPLIZITE PowerShell-Form (`powershell tofu destroy`
// ohne -Command) bleibt offen; ihre Aufloesung steckt in isDestructiveWindows und
// waere hier nur duplizierbar, nicht wiederverwendbar.
function wrapperBody(tokens) {
  if (tokens.length === 0) return null;
  const base = commandBasename(tokens[0]);

  if (SHELL_WRAPPERS.has(base)) {
    // NC-Schaerfung (GLM-Review 2026-08-24, MAJOR 1): shellWrapperBody statt indexOf('-c')
    // — kombinierte Flagbuende (`bash -lc`, `-ic`, `-lic`) sind die dokumentierte
    // Bridge-Form dieser Maschinen und liefen vorher am Gate vorbei.
    const res = shellWrapperBody(tokens);
    return res && res.kind === 'string' ? res.body : null;
  }
  if (WINDOWS_CMD_WRAPPERS.has(base)) {
    const ci = tokens.findIndex(t => isCmdSwitch(t, 'c') || isCmdSwitch(t, 'k'));
    return ci !== -1 && ci + 1 < tokens.length ? tokens.slice(ci + 1).join(' ') : null;
  }
  if (WINDOWS_PS_WRAPPERS.has(base)) {
    const ci = tokens.findIndex(t => ['-command', '-c'].includes(t.toLowerCase()));
    return ci !== -1 && ci + 1 < tokens.length ? tokens.slice(ci + 1).join(' ') : null;
  }
  return null;
}

function pruefeBash(command, tiefe = 0) {
  const raw = String(command || '');
  if (tiefe > MAX_TIEFE || !raw.trim()) return null;
  // Read-only-Git ist der dokumentierte Pflicht-Einstieg und wird nie gegated
  // (gleiche Allowlist wie im FFG). Nur auf der aeussersten Ebene: ein Wrapper-Body
  // darf sich diese Ausnahme nicht selbst ausstellen.
  if (tiefe === 0 && isReadOnlyGitIntrospection(raw)) return null;

  const segmente = segmentTokens(raw);
  for (const tokens of segmente) {
    // dbTreffer VOR deployTreffer: `prisma migrate deploy` ist primaer ein
    // DB-Schema-Eingriff, kein App-Deploy — die spezifischere Klasse gewinnt.
    const treffer = infraTreffer(tokens) || dbTreffer(tokens) || deployTreffer(tokens);
    if (treffer) return treffer;
  }

  // Namen der REAL zugewiesenen Variablen dieses Kommandos — Schranke fuer den
  // Zuweisungs-Pass im quote-awaren Strom unten (deployZuweisung).
  const namen = zugewieseneNamen(segmente);

  // Quote-aware Schlusspass: ein gequotetes Kommandowort (`'tofu' destroy`,
  // `'deploy.sh'`) rutscht am Quote-Stripping vorbei, und Wrapper-Bodies ueberleben
  // nur hier als eigenes Wort. Die Mustererkennung bleibt dabei bewusst auf die
  // KOMMANDOWORT-Position begrenzt — genau wie im FFG —, damit `echo "tofu destroy"`
  // und `echo "deploy done"` weiterhin still bleiben. Die WERT-Entscheidung
  // (deployZuweisung) ist die einzige Ausnahme: sie prueft ALLE Tokens, aber nur
  // real zugewiesene Namen (namen).
  for (const tokens of quoteAwareSegments(raw)) {
    const treffer = pruefeTokens(tokens, tiefe, namen);
    if (treffer) return treffer;
  }
  return null;
}

// Quote-aufgeloesten Token-Vektor pruefen und durch Wrapper rekursieren — Gegenstueck
// zu isDestructiveTokens im FFG. NC-Schaerfung (GLM-Review 2026-08-24, MAJOR 2): neben
// den Shell-/Windows-Wrappern (wrapperBody) rekursiert der Pass jetzt auch durch die
// volle Argv-Passthrough-Grammatik aus bash-analyse.js (env inkl. -S, sudo, doas, nohup,
// setsid, exec, command, nice, ionice, stdbuf, timeout, wsl) — vorher blieben
// `wsl -- tofu destroy`, `timeout 10 tofu apply` oder `env -S 'tofu destroy'` stumm,
// waehrend das FFG dieselbe Flaeche laengst abdeckte. Muster bleiben auf die
// Kommandowort-Position begrenzt (deployKommandowort), Fehlalarm-Verhalten unveraendert.
// `namen` reist durch die TOKEN-Rekursion (passthroughInner) mit, weil es dieselbe
// Kommandozeile bleibt; ein WRAPPER-Body ist eine neue Zeichenkette und bekommt seine
// eigenen `namen` frisch aus pruefeBash.
function pruefeTokens(tokens, tiefe, namen) {
  if (tiefe > MAX_TIEFE || tokens.length === 0) return null;
  const treffer = infraTreffer(tokens) || dbTreffer(tokens) || deployKommandowort(tokens)
    || deployZuweisung(tokens, namen);
  if (treffer) return treffer;
  const body = wrapperBody(tokens);
  if (body) return pruefeBash(body, tiefe + 1);
  const res = passthroughInner(commandBasename(tokens[0]), tokens);
  if (!res) return null;
  if (res.kind === 'string') return pruefeBash(res.body, tiefe + 1);
  return pruefeTokens(res.inner, tiefe + 1, namen);
}

// --- mcp-Pruefung ------------------------------------------------------------------
// Semantische Schreib-Marker ueber TOOL-NAMEN und schreibende PARAMETER.
const SCHREIBVERBEN = new Set(['send', 'post', 'publish', 'connect', 'invite', 'comment', 'message']);
// Lese-Praefixe: steht ein solches Verb an der VERB-Position (erstes Wort des
// Werkzeugnamens), feuert das Gate nie. Genau das haelt die im Abnahmekriterium
// benannten Fehlalarm-Faelle still — get_inbox, get_conversation, get_feed,
// get_company_posts, search_conversations, search_posts (die letzten beiden tragen
// "post" im Namen, sind aber lesend). Bewusst kurz gehalten: jede Ausnahme mehr ist
// ein Loch mehr.
const LESEVERBEN = new Set(['get', 'list', 'search', 'read', 'fetch']);

// mcp__<server>__<werkzeug> → Woerter des Werkzeugnamens, klein, ohne Trenner.
// Zerlegt snake_case, kebab-case UND camelCase (sendMessage → [send, message]).
function werkzeugWoerter(name) {
  const teile = String(name || '').split('__').filter(Boolean);
  const werkzeug = teile.length > 1 ? teile[teile.length - 1] : '';
  return werkzeug
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(w => w.toLowerCase());
}

// Plural mitfangen (posts → post, messages → message), ohne kurze Woerter zu zerlegen.
function istSchreibverb(wort) {
  if (SCHREIBVERBEN.has(wort)) return true;
  return wort.length > 4 && wort.endsWith('s') && SCHREIBVERBEN.has(wort.slice(0, -1));
}

function pruefeMcp(toolName, toolInput) {
  const woerter = werkzeugWoerter(toolName);
  if (woerter.length === 0) return null;
  if (LESEVERBEN.has(woerter[0])) return null; // lesendes Werkzeug — nie fragen

  for (const w of woerter) {
    if (istSchreibverb(w)) return { verb: w, quelle: 'Werkzeugname' };
  }

  // Schreibende Parameter: ein Werkzeug ohne Verb im Namen kann den Schreib-Marker
  // im Parameter tragen (…__create(message: "…")). Nur die Namen der obersten
  // Ebene, nie die Werte — Werte sind Nutzertext und wuerden dauernd falsch feuern.
  if (toolInput && typeof toolInput === 'object' && !Array.isArray(toolInput)) {
    for (const key of Object.keys(toolInput)) {
      for (const w of werkzeugWoerter('x__' + key)) {
        if (istSchreibverb(w)) return { verb: w, quelle: 'Parameter "' + key + '"' };
      }
    }
  }
  return null;
}

// --- Ausgabe ------------------------------------------------------------------------
function ask(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: reason
    }
  }));
}

function bashMsg(treffer) {
  return '[Safety-Gate] Freigabepflichtig (Gate 3, Mapping D1/EN4): Muster „'
    + treffer.muster + '" — ' + treffer.wirkung + '. Vor der Bestaetigung gehoert der '
    + 'vollstaendige Wirkungsumfang auf den Tisch: Zielumgebung, was die Aktion real '
    + 'veraendert, und der ausloesende Auftrag. Merges, Deploy-Klicks und '
    + 'Review-Freigaben bleiben rote Linien und werden nie automatisiert.';
}

function mcpMsg(toolName, treffer) {
  return '[Safety-Gate] Kundensichtbare Schreibaktion (Gate 3, Mapping D1/EN4): '
    + toolName + ' traegt den Schreib-Marker „' + treffer.verb + '" (' + treffer.quelle
    + '). Vorlagepflicht vor der Bestaetigung: Zielort bzw. Empfaenger, der WOERTLICHE '
    + 'Text und der ausloesende Auftrag — keine Zusammenfassung. Ohne ausdrueckliche '
    + 'Bestaetigung wird nicht abgesetzt.';
}

function main() {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  if (isDisabled()) return;

  const rawTool = String(input.tool_name || '');
  if (rawTool.toLowerCase() === 'bash') {
    const treffer = pruefeBash((input.tool_input && input.tool_input.command) || '');
    if (treffer) ask(bashMsg(treffer));
    return;
  }
  if (/^mcp__/i.test(rawTool)) {
    const treffer = pruefeMcp(rawTool, input.tool_input);
    if (treffer) ask(mcpMsg(rawTool, treffer));
  }
}

try {
  main();
} catch (e) {
  try { process.stderr.write('nc-safety-gate fail-open: ' + (e && e.message)); } catch (_) { /* egal */ }
}
// Kein process.exit(): abgeschnittene Ask-JSON hiesse, das Gate fragt still nicht
// (POSIX-Pipe-Falle). exitCode 0 genuegt, nichts laeuft async.
process.exitCode = 0;
