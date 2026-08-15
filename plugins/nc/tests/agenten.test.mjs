// ============================================================================
// nc-agenten-invarianten — PORTABLER PRUEFBAUSTEIN, Baustein-Version 1.4.0
// NC-Port des Onsite-Bausteins (origin/fix/agenten-allowlist-norm, PR #60, I6;
// Bauplan 2026-08-15 AP-D1 + Nachtrag N7) — inhaltsgleich bis auf den
// Schreibend-Marker (nc:schreibend), diese Kopfzeilen und die 1.3.0/1.4.0-Haertungen.
// 1.4.0 (2026-08-16, NC-Haertung; Codex-Review Phase 2): Werkzeuggrenze arbeitet jetzt
// wirklich als POSITIV-Allowlist statt als Denylist — fuer Read-only sind nur lesende
// Built-ins (Read, Grep, Glob, WebFetch, WebSearch) plus server-qualifizierte MCP-Tools
// zulaessig; exec-faehige oder unbekannte Built-ins (PowerShell, Monitor, ...) fallen
// fail-closed durch. Token-Formpruefung fail-closed gegen nichtkanonisches YAML
// (Kommentare, Quotes, eingebettete Leerzeichen). Defense-Baseline prueft die vier
// Grundsaetze inhaltlich, nicht nur die Ueberschrift. name zusaetzlich kebab-case-hart.
// 1.3.0 (2026-08-16, NC-Haertung ueber das Vorbild hinaus; GLM-Review Phase 2): Marker
// <!-- nc:schreibend --> zaehlt nur DIREKT unter der Frontmatter (ein bloss im Fliesstext
// zitierter Marker klassifiziert nicht mehr still als schreibend); im Marker-Fall ist
// maxTurns Pflichtfeld (agent-authoring.md: "immer begrenzen"); feldWert traegt Leerzeilen
// in Feldwerten, toolTokens traegt Mischformen (Inline-Rest + YAML-Liste) — beides gegen
// false negatives beim Bash-/Schreib-Tool-Scan; Gegenproben im Parser-Helper-Test.
// 1.2.0 (2026-08-15, Onsite): Allowlist-Prinzip (Maintainer-Entscheid) — tools und model
// sind Pflichtfelder, die Werkzeuggrenze steht in der tools-Allowlist statt in einer
// disallowedTools-Sperrliste (disallowedTools bleibt zulaessige Zusatzsicherung);
// Defense-Baseline-Block im Body ist Pflicht; skills:-Eintraege muessen auf existierende
// Skills des eigenen Plugins aufloesen (Silent-Skip-Schutz: die Plattform ueberspringt
// fehlende Preload-Skills still, nur Debug-Log — doku-verifiziert 2026-08-15).
// 1.1.0 (2026-08-14, Onsite): Read-only-Sperre um Bash erweitert (Shell-Umleitungen umgehen
// die Werkzeug-Schreibsperre; Subagenten sind vom FFG-Datei-Gate ausgenommen) + MCP-Regel
// (globales mcp__* ist nur fuer disallowedTools dokumentiert, nicht fuer tools).
// Regelquelle: referenz/agent-authoring.md
// ============================================================================
//
// Warum als Test und nicht als Checkliste: Dieselbe Lage wie bei struktur.test.mjs — die
// Regeln in referenz/agent-authoring.md sind *Policy*, die die Plattform NICHT erzwingt,
// sondern still ignoriert: verbotene Felder (hooks, mcpServers, permissionMode) werden bei
// Plugin-Agenten lautlos fallengelassen, eine nicht parsende Frontmatter laesst die
// Metadaten still weg (19-von-22-Lektion) — und bei Agenten heisst das zusaetzlich: die
// Auto-Delegation greift nie, niemand merkt es. Diese Datei macht die Invarianten pruefbar.
//
// WARUM PORTABEL — und was das fuer eine Kopie bedeutet:
// Der plattenbasierte Scan endet an der Repo-Grenze. Zieht ein Agent in ein Satelliten-Repo
// um, verliert eine im Kern verbliebene Pruefung ihren Gegenstand, OHNE rot zu werden — sie
// findet dann schlicht nichts mehr (belegte Onsite-Beinahe-Lektion 2026-08-14).
// Deshalb gilt: **Bekommt ein Satellit ein agents/-Verzeichnis, wandert dieser Baustein im
// selben Zug mit** (Regel im Standardprozess subagenten-bau.md des OS-Repos). Damit das
// gelingt, enthaelt diese Datei ausschliesslich Pruefungen, die aus sich heraus laufen:
//   - kein Bezug auf module-registry.json, Vorlagen oder sonstige OS-Repo-Artefakte
//     (die repo-gebundenen Invarianten leben in agenten-os.test.mjs und bleiben hier),
//   - keine hartkodierte Verzeichnistiefe: die Repo-Wurzel wird gesucht, nicht gezaehlt —
//     ein Satellit legt sein Plugin an die Repo-Wurzel oder unter plugins/<name>/, beides
//     traegt diese Datei ohne Anpassung,
//   - ein Nicht-Leer-Guard, damit ein verrutschter Scan auffaellt statt still gruen zu laufen.
// **Baustein-Version im Kopf pflegen:** Jede inhaltliche Aenderung zaehlt sie hoch; eine
// Satelliten-Kopie mit niedrigerer Nummer ist damit als Drift erkennbar.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));

/** Repo-Wurzel: nach oben suchen statt Ebenen zaehlen (Portabilitaet, s. Kopf).
 *  Erkennungsmerkmal ist .git — in einem Worktree eine Datei, sonst ein Verzeichnis. */
function repoWurzel() {
  let dir = HIER;
  for (;;) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const eltern = path.dirname(dir);
    if (eltern === dir) {
      throw new Error(`Repo-Wurzel ab ${HIER} nicht gefunden (kein .git im Pfad nach oben)`);
    }
    dir = eltern;
  }
}

const UEBERSPRINGEN = new Set(['.git', 'node_modules', '.worktrees']);

/** Alle Plugin-Wurzeln des Repos: Verzeichnisse mit .claude-plugin/plugin.json.
 *  Findet sowohl plugins/<name>/ (OS-Repo) als auch die Repo-Wurzel selbst (Satellit). */
function pluginWurzeln(start) {
  const gefunden = [];
  const stapel = [start];
  while (stapel.length) {
    const cur = stapel.pop();
    if (fs.existsSync(path.join(cur, '.claude-plugin', 'plugin.json'))) gefunden.push(cur);
    for (const eintrag of fs.readdirSync(cur, { withFileTypes: true })) {
      if (!eintrag.isDirectory() || UEBERSPRINGEN.has(eintrag.name)) continue;
      stapel.push(path.join(cur, eintrag.name));
    }
  }
  return gefunden;
}

/** Alle Agent-Dateien: <plugin-wurzel>/agents/*.md (flach — Hausregel, s. agent-authoring.md).
 *  Unterordner waeren plattformseitig erlaubt (sie wuerden Teil des Scoped Identifier), sind
 *  im OS aber bewusst ausgeschlossen; ein .md in einem Unterordner faellt hier daher auf. */
function agentDateien() {
  const wurzel = repoWurzel();
  const out = [];
  for (const pw of pluginWurzeln(wurzel)) {
    const ad = path.join(pw, 'agents');
    if (!fs.existsSync(ad)) continue;
    for (const eintrag of fs.readdirSync(ad, { withFileTypes: true })) {
      assert.equal(eintrag.isDirectory(), false,
        `${path.join(ad, eintrag.name)}: Unterordner in agents/ — flaches Layout ist Hausregel `
        + '(Unterordner werden Teil des Scoped Identifier, siehe agent-authoring.md)');
      if (!eintrag.name.endsWith('.md')) continue;
      out.push({
        plugin: path.basename(pw),
        pluginWurzel: pw,
        name: eintrag.name.replace(/\.md$/, ''),
        file: path.join(ad, eintrag.name),
      });
    }
  }
  return out;
}

/** Agent-Dateien mit Bestands-Garde: Ohne diese Haertung waeren die Datei-Tests bei leerem
 *  agents/-Bestand still gruen (leere Schleife) — genau die Blindheit, gegen die dieser
 *  Baustein mitwandert. Wer ihn in ein Repo ohne Agenten kopiert, soll das merken. */
function agentenBestand() {
  const agents = agentDateien();
  assert.ok(agents.length > 0,
    'keine Agent-Dateien gefunden (<plugin>/agents/*.md) — entweder fehlt die erste Garnitur, '
    + 'oder dieser Pruefbaustein liegt in einem Repo, das gar keine Agenten fuehrt');
  return agents;
}

/** Frontmatter-Block einer Agent-Datei (roher Text zwischen den --- Zeilen). */
function frontmatter(file) {
  const raw = fs.readFileSync(file, 'utf8');
  assert.equal(raw.charCodeAt(0) !== 0xfeff, true, `${file}: BOM vor der Frontmatter`);
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(m, `${file}: keine Frontmatter am Dateianfang`);
  return m[1];
}

/** Body einer Agent-Datei (alles nach der schliessenden --- Zeile). */
function body(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
  assert.ok(m, `${file}: keine Frontmatter am Dateianfang`);
  return m[1];
}

/** Wert eines Frontmatter-Felds: Inline-Rest plus eingerueckte Fortsetzungs-/Listenzeilen —
 *  oder null, wenn das Feld fehlt. Traegt einzeilige Komma-Listen wie YAML-Listenform. */
function feldWert(fm, feld) {
  const zeilen = fm.split(/\r?\n/);
  const idx = zeilen.findIndex((l) => new RegExp(`^${feld}:`).test(l));
  if (idx === -1) return null;
  const teile = [zeilen[idx].replace(new RegExp(`^${feld}:[ \\t]*`), '')];
  // 1.3.0: Leerzeilen beenden den Wert nicht mehr (Block-Scalars mit Absatz) — gesammelt
  // wird bis zur naechsten nicht-eingerueckten, nicht-leeren Zeile.
  for (let i = idx + 1; i < zeilen.length && (/^\s/.test(zeilen[i]) || zeilen[i] === ''); i++) {
    teile.push(zeilen[i]);
  }
  return teile.join('\n');
}

/** Werkzeug-Tokens aus einem tools-/skills-Wert (Komma- oder YAML-Listenform). */
function toolTokens(wert) {
  const zeilen = wert.split(/\r?\n/).map((z) => z.trim()).filter(Boolean);
  const yamlListe = zeilen
    .filter((z) => z.startsWith('- '))
    .map((z) => z.replace(/^-\s+/, ''));
  // 1.3.0: Mischform traegt beide Anteile — ein Inline-Rest auf der Feldzeile geht bei
  // vorhandener YAML-Liste nicht mehr verloren (false-negative-Schutz beim Bash-Scan).
  const inlineRest = zeilen.filter((z) => !z.startsWith('- ')).join(',');
  const basis = yamlListe.length > 0
    ? [inlineRest, ...yamlListe].filter(Boolean).join(',')
    : wert.replace(/^\s*\[|\]\s*$/g, '');
  return basis
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

// 1.4.0: Klassifikation der Werkzeuggrenze — positiv statt negativ.
// Kanonische Token-Form (fail-closed): ein Built-in-Name ODER ein server-qualifiziertes
// MCP-Tool. Alles andere (Quotes, #-Kommentare, eingebettete Leerzeichen) ist keine
// stille Allowlist, sondern ein Befund.
const TOKEN_FORM = /^(?:[A-Za-z][A-Za-z0-9_]*|mcp__[A-Za-z0-9_*-]+)$/;
const LESE_BUILTINS = new Set(['Read', 'Grep', 'Glob', 'WebFetch', 'WebSearch']);
const SCHREIB_TOOLS = ['Write', 'Edit', 'MultiEdit', 'NotebookEdit'];

/** Unzulaessige Tokens einer tools-Allowlist je Klasse (read-only vs. schreibend).
 *  MCP-Tokens sind per Norm zulaessig (server-qualifiziert, lesende Auswahl liegt beim
 *  Autor); jedes nicht gelistete Built-in ist unzulaessig — Bash, PowerShell, Monitor
 *  und Unbekanntes fallen damit automatisch durch, ohne dass eine Denylist gepflegt
 *  werden muesste. */
function unzulaessigeTokens(tokens, schreibend) {
  const erlaubt = new Set(LESE_BUILTINS);
  if (schreibend) for (const t of SCHREIB_TOOLS) erlaubt.add(t);
  return tokens.filter((t) => !t.startsWith('mcp__') && !erlaubt.has(t));
}

/** Defense-Baseline-Block eines Agent-Bodys (Text von der Ueberschrift bis zur naechsten
 *  ##-Ueberschrift) — oder null, wenn die Ueberschrift fehlt. */
function defenseBaselineBlock(b) {
  const m = b.match(/^## Defense-Baseline[ \t]*$\r?\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
  return m ? m[1] : null;
}

test('Parser-Helper: feldWert/toolTokens tragen Inline-, YAML- und Mischform', () => {
  const fm = `name: probe
model: inherit
tools:
  - Read
  - Grep
skills: [ps-debug, ps-healthcheck]`;
  assert.deepEqual(toolTokens(feldWert(fm, 'tools')), ['Read', 'Grep']);
  assert.deepEqual(toolTokens(feldWert(fm, 'skills')), ['ps-debug', 'ps-healthcheck']);
  // Gegenproben der 1.3.0-Haertungen (Gegenprobe-Pflicht, debug-log 2026-08-12):
  // (a) Leerzeile im Wert beendet feldWert nicht mehr — Bash NACH der Leerzeile bleibt sichtbar.
  const fmLeerzeile = `tools:
  - Read

  - Bash
model: inherit`;
  assert.deepEqual(toolTokens(feldWert(fmLeerzeile, 'tools')), ['Read', 'Bash'],
    'Gegenprobe fehlgeschlagen: Leerzeile im Feldwert verschluckt Folge-Eintraege');
  // (b) Mischform: Inline-Rest + YAML-Liste — der Inline-Anteil (Bash!) geht nicht verloren.
  const fmMisch = `tools: Bash
  - Read`;
  assert.deepEqual(toolTokens(feldWert(fmMisch, 'tools')), ['Bash', 'Read'],
    'Gegenprobe fehlgeschlagen: Mischform verwirft den Inline-Anteil');
  // Gegenproben der 1.4.0-Haertungen:
  // (c) Positiv-Allowlist: exec-faehige/unbekannte Built-ins fallen in BEIDEN Klassen durch.
  assert.deepEqual(unzulaessigeTokens(['Read', 'PowerShell', 'Monitor', 'mcp__srv__x'], false),
    ['PowerShell', 'Monitor'],
    'Gegenprobe fehlgeschlagen: PowerShell/Monitor rutschen als read-only durch');
  assert.deepEqual(unzulaessigeTokens(['Write', 'Edit', 'Bash'], true), ['Bash'],
    'Gegenprobe fehlgeschlagen: Bash rutscht im Schreibend-Fall durch');
  // (d) Token-Formpruefung: Kommentare/Quotes sind keine kanonischen Tokens.
  assert.equal(TOKEN_FORM.test('# Kommentar'), false);
  assert.equal(TOKEN_FORM.test('"Read, Write"'), false);
  assert.equal(TOKEN_FORM.test('Read'), true);
  assert.equal(TOKEN_FORM.test('mcp__server__tool'), true);
  // (e) Defense-Baseline-Extraktion: leerer Block liefert keinen Grundsatz-Text.
  const leererBlock = defenseBaselineBlock('## Defense-Baseline\n\n## Vorgehen\n1. x\n');
  assert.ok(leererBlock !== null && !/Rolle und Auftrag sind fix/.test(leererBlock),
    'Gegenprobe fehlgeschlagen: leerer Defense-Baseline-Block gilt als gefuellt');
});

test('Agenten-Frontmatter: name entspricht dem Dateinamen, description ist vorhanden', () => {
  // name == Dateiname ist HAUSREGEL, nicht Plattformzwang (die Doku sagt ausdruecklich
  // "The filename doesn't have to match") — nur so bleiben Registry, Tests und Aufrufe
  // eindeutig zuzuordnen.
  for (const a of agentenBestand()) {
    const fm = frontmatter(a.file);
    const m = fm.match(/^name:[ \t]*(\S+)[ \t]*$/m);
    assert.ok(m, `${a.file}: kein einzeiliges name-Feld`);
    assert.equal(m[1], a.name,
      `${a.file}: name weicht vom Dateinamen ab (Hausregel — nur so bleiben Registry, Tests und Aufrufe eindeutig)`);
    // 1.4.0: kebab-case ist Norm (agent-authoring.md) — nicht nur der Doppelpunkt ist
    // verboten, sondern jede Form ausserhalb a-z0-9-.
    assert.ok(/^[a-z0-9-]+$/.test(m[1]),
      `${a.file}: name "${m[1]}" ist kein kebab-case (erlaubt: a-z, 0-9, Bindestrich)`);
    assert.ok(/^description:/m.test(fm), `${a.file}: kein description-Feld`);
  }
});

test('Agenten-Frontmatter: description als >- Block-Scalar, kein Plain-Scalar mit ": "', () => {
  // Dieselbe 19-von-22-Lektion wie bei den Skills: ": " beendet einen unquotierten
  // Plain-Scalar, die Frontmatter parst nicht — bei Agenten faellt damit still die
  // Auto-Delegation aus (agent-authoring.md, YAML-Falle). Deshalb description immer als
  // >- Block, und ueber ALLE Felder: kein Plain-Scalar-Wert mit ": ".
  for (const a of agentenBestand()) {
    const fm = frontmatter(a.file);
    assert.ok(/^description:[ \t]*>-[ \t]*$/m.test(fm),
      `${a.file}: description muss als >- Block-Scalar geschrieben sein (Plain-Scalar-Verbot)`);
    for (const zeile of fm.split(/\r?\n/)) {
      if (!zeile.trim() || /^\s/.test(zeile)) continue; // Leerzeile oder Fortsetzung
      const kv = zeile.match(/^([A-Za-z0-9_-]+):[ \t]*(.*)$/);
      if (!kv || !kv[2]) continue;
      assert.equal(/:\s/.test(kv[2]), false,
        `${a.file}: Feld "${kv[1]}" ist ein Plain-Scalar und enthaelt ": " — als >- Block schreiben`);
    }
  }
});

test('Agenten-Frontmatter: keine verbotenen Felder, kein ":" im name', () => {
  // hooks/mcpServers/permissionMode werden bei Plugin-Agenten lautlos ignoriert — die
  // vermeintliche Absicherung existiert zur Laufzeit nicht (agent-authoring.md). isolation
  // ist in v1 gesperrt (Onsite-Entscheid H3: Working-Directory-Check vor v2.1.210
  // unzureichend). ":" im name verhindert ab Plattform v2.1.218 das Laden der Datei.
  const VERBOTEN = ['hooks', 'mcpServers', 'permissionMode', 'isolation'];
  for (const a of agentenBestand()) {
    const fm = frontmatter(a.file);
    for (const feld of VERBOTEN) {
      assert.equal(new RegExp(`^${feld}:`, 'm').test(fm), false,
        `${a.file}: verbotenes Feld "${feld}" — bei Plugin-Agenten lautlos ignoriert bzw. in v1 gesperrt`);
    }
    const m = fm.match(/^name:[ \t]*(\S+)[ \t]*$/m);
    assert.ok(m, `${a.file}: kein einzeiliges name-Feld`);
    assert.equal(m[1].includes(':'), false,
      `${a.file}: ":" im name — Datei laedt ab Plattform v2.1.218 nicht (nur Debug-Log)`);
  }
});

test('Pflichtfelder-Regel (1.2.0): tools-Allowlist und model sind gesetzt', () => {
  // Allowlist-Prinzip (agent-authoring.md, Werkzeuggrenzen-Regel): Ohne tools-Feld erbt
  // ein Agent ALLE Werkzeuge des Parent — der verbotene stille Default. Ohne model-Feld
  // ist die Modellwahl Zufall statt Entscheidung (Routing-Regel: sonnet fuer Bulk,
  // inherit fuer urteilskritische Agenten).
  const MODELL_FORM = /^(sonnet|opus|haiku|fable|inherit|claude-[a-z0-9.-]+)$/;
  for (const a of agentenBestand()) {
    const fm = frontmatter(a.file);
    const tools = feldWert(fm, 'tools');
    assert.ok(tools && toolTokens(tools).length > 0,
      `${a.file}: kein tools-Feld — ohne Allowlist erbt der Agent alle Werkzeuge des Parent `
      + '(agent-authoring.md, Werkzeuggrenzen-Regel)');
    const modell = feldWert(fm, 'model');
    assert.ok(modell,
      `${a.file}: kein model-Feld — die Modellwahl ist Pflicht (Routing-Regel, agent-authoring.md)`);
    assert.ok(MODELL_FORM.test(modell.trim()),
      `${a.file}: model "${modell.trim()}" ist keine bekannte Form `
      + '(sonnet|opus|haiku|fable|inherit|claude-<id>)');
  }
});

test('Werkzeuggrenzen-Regel (Allowlist-Prinzip): Grenze steht in tools, positiv geprueft', () => {
  // Seit 2026-08-15 traegt die tools-Allowlist die Grenze (Maintainer-Entscheid); seit
  // 1.4.0 prueft dieser Test POSITIV (Codex-Review-Blocker: eine Denylist liesse
  // exec-faehige Built-ins wie PowerShell oder Monitor als "read-only" durch):
  //   - ohne Marker (read-only/Standard): nur lesende Built-ins (Read, Grep, Glob,
  //     WebFetch, WebSearch) plus server-qualifizierte MCP-Tools;
  //   - mit Marker <!-- nc:schreibend -->: zusaetzlich die vier Schreib-Tools — Bash,
  //     PowerShell & Co. bleiben in BEIDEN Klassen draussen (Referenzmuster
  //     sync-nachzug-executor; das FFG-Datei-Gate greift bei Subagenten nicht).
  // disallowedTools ist optionale Zusatzsicherung, kein Traeger der Grenze mehr.
  // Eine kuenftige Diagnose-Klasse (Bash lesend, Command-Disziplin) braucht eine eigene,
  // ausdrueckliche Kennzeichnung — bis dahin ist dieser Test bewusst hart.
  for (const a of agentenBestand()) {
    const fm = frontmatter(a.file);
    const tools = feldWert(fm, 'tools');
    assert.ok(tools, `${a.file}: kein tools-Feld (siehe Pflichtfelder-Regel)`);
    const tokens = toolTokens(tools);
    // 1.4.0: fail-closed gegen nichtkanonisches YAML — Kommentare, Quotes und
    // eingebettete Leerzeichen sind keine stillen Allowlist-Eintraege.
    const unlesbar = tokens.filter((t) => !TOKEN_FORM.test(t));
    assert.deepEqual(unlesbar, [],
      `${a.file}: nichtkanonische tools-Eintraege (${unlesbar.join(' | ')}) — nur nackte `
      + 'Built-in-Namen oder server-qualifizierte MCP-Tools, keine Kommentare/Quotes');
    // 1.3.0: Der Marker zaehlt nur DIREKT unter der Frontmatter (agent-authoring.md) — ein
    // im Fliesstext zitierter Marker deklariert nichts. Ein Marker an falscher Stelle ist
    // ein eigener Befund, kein stiller Schreibend-Status.
    const b = body(a.file);
    const markerVorn = /^\s*<!-- nc:schreibend -->/.test(b);
    assert.equal(!markerVorn && b.includes('<!-- nc:schreibend -->'), false,
      `${a.file}: Marker <!-- nc:schreibend --> steht nicht direkt unter der Frontmatter — `
      + 'dorthin verschieben (agent-authoring.md, Werkzeuggrenzen-Regel)');
    if (markerVorn) {
      // 1.3.0: Schreibende Agenten begrenzen ihre Runden immer (agent-authoring.md).
      assert.ok(/^maxTurns:[ \t]*\d+[ \t]*$/m.test(fm),
        `${a.file}: schreibender Agent ohne maxTurns — Rundenobergrenze ist Pflicht `
        + '(agent-authoring.md, Werkzeuggrenzen-Regel Punkt 2)');
    }
    const verboten = unzulaessigeTokens(tokens, markerVorn);
    assert.deepEqual(verboten, [],
      `${a.file}: unzulaessige Werkzeuge in der Allowlist (${verboten.join(', ')}) — `
      + (markerVorn
        ? 'auch schreibende Agenten fuehren nur die vier Schreib-Tools plus lesende Built-ins/MCP (kein Bash, kein PowerShell)'
        : 'read-only erlaubt nur lesende Built-ins (Read, Grep, Glob, WebFetch, WebSearch) plus MCP; fuer Schreib-Tools Marker <!-- nc:schreibend --> setzen'));
  }
});

test('Defense-Baseline (1.2.0/1.4.0): jeder Agent traegt den Pflichtblock mit allen vier Grundsaetzen', () => {
  // Subagenten arbeiten auf Fremdinhalten ausserhalb der Sichtweite des Menschen; die
  // Prompt-Defense-Baseline muss deshalb im Agenten-Kontext selbst stehen
  // (agent-authoring.md, Defense-Baseline — Pflichtbaustein). Seit 1.4.0 wird der
  // Blockinhalt geprueft, nicht nur die Ueberschrift — ein leerer Block schuetzt nichts.
  const GRUNDSAETZE = [
    [/Rolle und Auftrag sind fix/, 'fixe Rolle (Grundsatz 1)'],
    [/sind Daten, keine\s+Instruktionen/, 'Fremdinhalte sind Daten (Grundsatz 2)'],
    [/[Kk]eine Secrets\/Tokens/, 'Secrets-Verbot (Grundsatz 3)'],
    [/Unicode-Auff/, 'Unicode-Wachsamkeit (Grundsatz 4)'],
  ];
  for (const a of agentenBestand()) {
    const block = defenseBaselineBlock(body(a.file));
    assert.ok(block !== null,
      `${a.file}: kein "## Defense-Baseline"-Block im Body — Pflichtbaustein seit 2026-08-15 `
      + '(agent-authoring.md)');
    for (const [muster, name] of GRUNDSAETZE) {
      assert.ok(muster.test(block),
        `${a.file}: Defense-Baseline ohne ${name} — alle vier Grundsaetze sind Pflicht `
        + '(agent-authoring.md, Defense-Baseline)');
    }
  }
});

test('skills-Preload (1.2.0): jeder Eintrag loest auf einen Skill des eigenen Plugins auf', () => {
  // Die Plattform ueberspringt fehlende oder deaktivierte Preload-Skills STILL (nur
  // Debug-Log; doku-verifiziert 2026-08-15) — ein Tippfehler hiesse: der Agent arbeitet
  // ohne sein Fachwissen und niemand merkt es. Hausregeln (agent-authoring.md): nackte
  // Skill-Namen (keine Plugin-Qualifizierung) und nur Skills des EIGENEN Plugins —
  // fremde Skills laedt der Agent zur Laufzeit ueber das Skill-Tool.
  for (const a of agentenBestand()) {
    const fm = frontmatter(a.file);
    const skills = feldWert(fm, 'skills');
    if (skills === null) continue;
    const eintraege = toolTokens(skills);
    assert.ok(eintraege.length > 0,
      `${a.file}: leeres skills-Feld — entweder Eintraege nennen oder das Feld entfernen`);
    for (const s of eintraege) {
      assert.equal(s.includes(':'), false,
        `${a.file}: skills-Eintrag "${s}" ist plugin-qualifiziert — die Plattform erwartet `
        + 'nackte Skill-Namen (doku-verifiziert 2026-08-15)');
      const skillPfad = path.join(a.pluginWurzel, 'skills', s, 'SKILL.md');
      assert.ok(fs.existsSync(skillPfad),
        `${a.file}: skills-Eintrag "${s}" loest nicht auf ${skillPfad} auf — fehlende `
        + 'Preload-Skills werden von der Plattform still uebersprungen (Silent-Skip)');
    }
  }
});

test('MCP-Regel: kein globales mcp__* im tools-Feld', () => {
  // Doku-verifiziert 2026-08-14 (Onsite): das globale Muster mcp__* ist nur fuer
  // disallowedTools dokumentiert ("removes every MCP tool from any server"); in tools
  // gehoeren server-qualifizierte Formen (mcp__<server>, mcp__<server>__*) oder konkrete
  // Tools.
  for (const a of agentenBestand()) {
    const fm = frontmatter(a.file);
    const tools = feldWert(fm, 'tools');
    if (tools === null) continue;
    for (const t of toolTokens(tools)) {
      assert.notEqual(t, 'mcp__*',
        `${a.file}: globales "mcp__*" im tools-Feld — nur server-qualifizierte MCP-Formen `
        + 'sind dort dokumentiert (agent-authoring.md, Feldkanon)');
    }
  }
});
