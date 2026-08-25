// Struktur-Invarianten des Multi-Plugin-Layouts (Design-Spec 2026-07-28 §2/§5/§7, OS-Repo).
//
// Warum als Test und nicht als Checkliste: Mehrere dieser Regeln sind *Policy*, die die
// Plattform NICHT erzwingt — sie würde z. B. Hooks in einem Abteilungsplugin anstandslos
// aggregieren. Und `claude plugin validate` prüft an der Repo-Wurzel nur das
// Marketplace-Manifest, nicht die Skills; genau diese Lücke ließ beim Vorbild-System 19 von
// 22 Skills mit nicht parsender Frontmatter unentdeckt. Diese Datei macht die Invarianten
// prüfbar. (Muster übernommen aus dem Onsite.ai-OS, angepasst 2026-07-28.)
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const p = (...s) => path.join(REPO, ...s);
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

const marketplace = readJson(p('.claude-plugin', 'marketplace.json'));
const KERN = 'nc';

/** Verzeichnisse unter plugins/, die ein Manifest tragen. */
function pluginDirsOnDisk() {
  const base = p('plugins');
  return fs.readdirSync(base).filter((d) =>
    fs.existsSync(path.join(base, d, '.claude-plugin', 'plugin.json')));
}

/** Frontmatter-Block einer SKILL.md (roher Text zwischen den --- Zeilen). */
function frontmatter(file) {
  const raw = fs.readFileSync(file, 'utf8');
  assert.equal(raw.charCodeAt(0) !== 0xfeff, true, `${file}: BOM vor der Frontmatter`);
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(m, `${file}: keine Frontmatter am Dateianfang`);
  return m[1];
}

function skillFiles() {
  const out = [];
  for (const dir of pluginDirsOnDisk()) {
    const sd = p('plugins', dir, 'skills');
    if (!fs.existsSync(sd)) continue;
    for (const name of fs.readdirSync(sd)) {
      const f = path.join(sd, name, 'SKILL.md');
      if (fs.existsSync(f)) out.push({ plugin: dir, name, file: f });
    }
  }
  return out;
}

test('Marketplace: lokale Einträge zeigen auf vorhandene Plugins, Satelliten sind gepinnt', () => {
  for (const e of marketplace.plugins) {
    if (typeof e.source === 'string') {
      assert.ok(e.source.startsWith('./'), `${e.name}: source muss mit ./ beginnen`);
      const manifest = p(e.source.replace(/^\.\//, ''), '.claude-plugin', 'plugin.json');
      assert.ok(fs.existsSync(manifest), `${e.name}: ${manifest} fehlt`);
      assert.equal(readJson(manifest).name, e.name,
        `${e.name}: plugin.json.name weicht vom Marketplace-Eintrag ab (der Eintragsname bestimmt den Namespace)`);
    } else {
      // Satelliten-Eintrag (künftige Abteilungen in eigenen Repos): GitHub-Source.
      // Doku plugin-marketplaces: "When both ref and sha are set, the sha is the effective
      // pin" — deshalb ist der volle SHA Pflicht, ref dient nur der Lesbarkeit.
      assert.equal(e.source.source, 'github', `${e.name}: entfernte Quelle muss github sein`);
      assert.match(e.source.repo, /^[\w.-]+\/[\w.-]+$/, `${e.name}: repo nicht im owner/repo-Format`);
      assert.match(e.source.sha ?? '', /^[0-9a-f]{40}$/i,
        `${e.name}: Satelliten-Eintrag braucht einen vollen 40-stelligen Commit-SHA als Pin`);
    }
  }
});

test('Marketplace: kein Eintrag setzt version — einzige Quelle ist plugin.json', () => {
  // Doku (plugin-marketplaces, Version resolution): "Avoid setting version in both
  // plugin.json and the marketplace entry. Claude Code always uses the plugin.json value
  // without warning" — ein Marketplace-Wert waere also stille Doppelpflege.
  for (const e of marketplace.plugins) {
    assert.equal(e.version, undefined,
      `${e.name}: version gehoert nur in plugin.json, nicht in den Marketplace-Eintrag`);
  }
});

test('Alle lokalen Plugins auf der Platte sind im Marketplace registriert (und umgekehrt)', () => {
  const onDisk = pluginDirsOnDisk().sort();
  const listed = marketplace.plugins
    .filter((e) => typeof e.source === 'string')
    .map((e) => e.source.replace(/^\.\/plugins\//, '')).sort();
  assert.deepEqual(onDisk, listed,
    'plugins/ und lokale Marketplace-Einträge driften auseinander — ein Plugin ohne Eintrag wird nie ausgeliefert');
});

test('Abteilungsplugins haengen am Kern, der Kern haengt an niemandem', () => {
  for (const dir of pluginDirsOnDisk()) {
    const m = readJson(p('plugins', dir, '.claude-plugin', 'plugin.json'));
    const deps = (m.dependencies || []).map((d) => (typeof d === 'string' ? d : d.name));
    if (dir === KERN) {
      assert.deepEqual(deps, [], 'der Kern darf keine Dependencies haben (sonst Zyklusgefahr)');
    } else {
      assert.ok(deps.includes(KERN),
        `${dir}: dependencies muss "${KERN}" enthalten — sonst fehlt die transitive Kern-Aktivierung und die staendige Abteilung ist nicht erzwungen`);
    }
    for (const d of deps) {
      assert.ok(marketplace.plugins.some((e) => e.name === d),
        `${dir}: dependency "${d}" ist in diesem Marketplace nicht auffindbar`);
    }
  }
});

test('Hooks liegen ausschliesslich im Kern', () => {
  // Die Plattform erzwingt das nicht — sie aggregiert die Hooks aller aktiven Plugins.
  // Ohne diese Invariante feuert das Gate mehrfach, je nach installierten Abteilungen.
  for (const dir of pluginDirsOnDisk()) {
    const hasHooks = fs.existsSync(p('plugins', dir, 'hooks', 'hooks.json'));
    if (dir === KERN) assert.ok(hasHooks, 'der Kern muss die Kontroll-Schicht tragen');
    else assert.equal(hasHooks, false, `${dir}: Abteilungsplugins duerfen keine eigenen Hooks mitbringen`);
  }
});

test('Hook-Kommandos adressieren Dateien ueber die Plugin-Root-Variable', () => {
  const cfg = readJson(p('plugins', KERN, 'hooks', 'hooks.json'));
  const commands = Object.values(cfg.hooks).flat()
    .flatMap((m) => m.hooks).filter((h) => h.type === 'command').map((h) => h.command);
  assert.ok(commands.length > 0, 'keine command-Hooks gefunden');
  for (const c of commands) {
    assert.match(c, /\$\{CLAUDE_PLUGIN_ROOT\}/,
      `Hook-Kommando ohne CLAUDE_PLUGIN_ROOT: "${c}" — relative Pfade brechen im Plugin-Cache`);
  }
});

test('Sobald ein Plugin einen MCP-Server mitbringt, gatet das FFG auch mcp__*-Tools', () => {
  // Das FFG matcht heute nur Write|Edit|MultiEdit|Bash. MCP-Werkzeuge laufen unter
  // mcp__<plugin>_<server>__<tool> und wuerden am Matcher vorbeilaufen — ein
  // schreibfaehiger MCP-Server wuerde das Gate also still umgehen. Dieser Test ist heute
  // trivial gruen (kein LOKALES Plugin hat einen MCP-Server) und schlaegt an dem Tag an,
  // an dem einer dazukommt.
  //
  // REICHWEITE (praezisiert 2026-08-10, Bauplan AP7): Geprueft werden ausschliesslich die
  // Manifeste unter plugins/ — also die Plugins, die dieses Repo SELBST ausliefert.
  // Fremde Marketplace-Eintraege der Kategorie `affiliate` (z. B. kimi-code-plugin-cc,
  // das einen stdio-MCP-Server mitbringt) loesen die Invariante NICHT aus: ihr Inhalt
  // liegt in einem fremden Repo und ist hier weder lesbar noch pflegbar. Dass das FFG
  // mcp__*-Tools heute gar nicht gatet, bleibt damit eine bewusst dokumentierte Grenze
  // (Gates-Definition, Gate 1) — kein stiller Zustand.
  const mitMcp = pluginDirsOnDisk().filter((dir) => {
    const m = readJson(p('plugins', dir, '.claude-plugin', 'plugin.json'));
    return m.mcpServers !== undefined || fs.existsSync(p('plugins', dir, '.mcp.json'));
  });
  if (mitMcp.length === 0) return;
  const matcher = Object.values(readJson(p('plugins', KERN, 'hooks', 'hooks.json')).hooks)
    .flat().map((m) => m.matcher || '').join('|');
  assert.match(matcher, /mcp__/,
    `Plugin(s) ${mitMcp.join(', ')} bringen einen MCP-Server mit, aber der FFG-Matcher deckt keine mcp__*-Tools ab`);
});

test('Frontmatter: name entspricht dem Verzeichnis und erfuellt die Namensregeln', () => {
  for (const s of skillFiles()) {
    const fm = frontmatter(s.file);
    const m = fm.match(/^name:[ \t]*(\S+)[ \t]*$/m);
    assert.ok(m, `${s.file}: kein einzeiliges name-Feld`);
    assert.equal(m[1], s.name, `${s.file}: name weicht vom Verzeichnisnamen ab`);
    assert.match(m[1], /^[a-z0-9-]{1,64}$/, `${s.file}: name verletzt a-z0-9- / 64 Zeichen`);
  }
});

test('Frontmatter: description bricht nicht am YAML-Plain-Scalar', () => {
  // "Trigger-Begriffe: ..." enthaelt Doppelpunkt+Leerzeichen und beendet damit einen
  // unquotierten Plain-Scalar. Der Skill laedt dann laut Validator ohne jede
  // Metadatenangabe — still, ohne Fehlermeldung, und triggert nie automatisch.
  const RISKY = /:\s|(^|\s)#/;
  for (const s of skillFiles()) {
    const fm = frontmatter(s.file);
    const zeilen = fm.split(/\r?\n/);
    const idx = zeilen.findIndex((l) => /^description:/.test(l));
    assert.ok(idx >= 0, `${s.file}: kein description-Feld`);
    const value = zeilen[idx].replace(/^description:[ \t]*/, '').trim();
    const isBlock = ['>-', '>', '|', '|-'].includes(value);
    const isQuoted = /^(".*"|'.*')$/.test(value);
    if (!isBlock && !isQuoted) {
      assert.equal(RISKY.test(value), false,
        `${s.file}: description ist ein Plain-Scalar und enthaelt ": " oder "#" — als >- Block schreiben`);
    }
    const full = isBlock
      ? zeilen.slice(idx + 1).filter((l) => /^\s+\S/.test(l)).map((l) => l.trim()).join(' ')
      : value.replace(/^["']|["']$/g, '');
    assert.ok(full.length > 0 && full.length <= 1024,
      `${s.file}: description ist leer oder laenger als 1024 Zeichen (${full.length})`);
  }
});

// Kontext-Budget der Wissens-Router (Node-Doks-Definition, Abschnitt "Kontext-Oekonomie";
// Port der Onsite-Invariante via Mapping D7). Schliesst direkt an die description-Invariante
// oben an: Dort wird die EINZELgrenze (1024 Zeichen je Skill) geprueft, hier die SUMME der
// vier Router. Warum ueberhaupt ein Deckel: Von jedem Skill liegen `name` + `description` ab
// Sitzungsstart DAUERHAFT im Kontext. Genau das ist der Preis der Router — und der Grund,
// warum sie je Arbeitsanlass und nicht je Dokument geschnitten sind. Der Deckel haelt diesen
// Preis sichtbar und begrenzt; wer ihn hebt, tut es bewusst.
const ROUTER_SKILLS = ['wissen-aendern', 'wissen-planen', 'wissen-nachschlagen', 'wissen-protokolle'];
const ROUTER_BUDGET = 6000;

test('Wissens-Router: die Summe der descriptions bleibt im Kontext-Budget', () => {
  let summe = 0;
  for (const name of ROUTER_SKILLS) {
    const datei = p('plugins', KERN, 'skills', name, 'SKILL.md');
    assert.ok(fs.existsSync(datei),
      `${datei} fehlt — die vier Wissens-Router gehoeren zusammen (Node-Doks-Definition)`);
    const zeilen = frontmatter(datei).split(/\r?\n/);
    const idx = zeilen.findIndex((l) => /^description:/.test(l));
    assert.ok(idx >= 0, `${datei}: kein description-Feld`);
    const text = zeilen.slice(idx + 1)
      .filter((l) => /^\s+\S/.test(l)).map((l) => l.trim()).join(' ');
    assert.ok(text.length > 0 && text.length <= 1024,
      `${datei}: description ist leer oder ueber 1024 Zeichen (${text.length})`);
    summe += text.length;
  }
  assert.ok(summe <= ROUTER_BUDGET,
    `Router-descriptions belegen ${summe} Zeichen Dauerkontext (Budget ${ROUTER_BUDGET}) — `
    + 'Router werden je Arbeitsanlass geschnitten, nicht je Dokument '
    + '(knowledge-base/grundwissen/NovaCore-OS-Node-Doks-Definition.md des OS-Repos)');
});

test('Plugin-Dateien verweisen nicht ueber die Plugin-Grenze', () => {
  // Installierte Plugins liegen isoliert im Cache: "Installed plugins cannot reference files
  // outside their directory" (plugins-reference). Repo-Pfade sind daher nur als Quellenangabe
  // zulaessig, erkennbar an der Qualifizierung "OS-Repo". Geprueft werden ALLE ausgelieferten
  // Markdown-Dateien (SKILL.md, READMEs, workflow.md, ...), nicht nur Skills.
  // Einzige Ausnahme: skill-authoring.md zitiert die verbotenen Muster als Regeltext.
  const AUSNAHME = path.join('referenz', 'skill-authoring.md');
  for (const dir of pluginDirsOnDisk()) {
    const stack = [p('plugins', dir)];
    while (stack.length) {
      const cur = stack.pop();
      for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
        const full = path.join(cur, entry.name);
        if (entry.isDirectory()) { stack.push(full); continue; }
        if (!entry.name.endsWith('.md') || full.endsWith(AUSNAHME)) continue;
        const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
        lines.forEach((line, i) => {
          assert.equal(/\.\.\//.test(line), false,
            `${full}:${i + 1}: ../-Pfad verlaesst das Plugin-Verzeichnis`);
          if (/knowledge-base\//.test(line)) {
            const context = lines.slice(Math.max(0, i - 2), i + 2).join(' ');
            // Seit Phase 3 (Queue-Flow) ist neben "OS-Repo" auch die Abteilungs-Qualifizierung
            // zulaessig: Die Queue-Skills nennen die Wissensbasis des ABTEILUNGS-Klons, deren
            // Pfad zur Laufzeit ueber die Infra-Registry aufgeloest wird (git -C <pfad> ...) —
            // auch das ist eine Quellenangabe, keine plugin-relative Leseanweisung. Dieselbe
            // Doppel-Qualifizierung prueft queue-os.test.mjs (T-2) fuer die Queue-Referenz.
            assert.match(context, /OS-Repo|Abteilungs-Repo|Abteilungs-Klon/,
              `${full}:${i + 1}: Repo-Pfad ohne "OS-Repo"-/"Abteilungs-Repo"-Qualifizierung — nach Installation nicht auflösbar`);
          }
        });
      }
    }
  }
});

test('Leitversion: VERSION, Kern-Manifest und Registry sind gleich', () => {
  const version = fs.readFileSync(p('VERSION'), 'utf8').trim();
  assert.equal(readJson(p('plugins', KERN, '.claude-plugin', 'plugin.json')).version, version,
    'Kern-Manifest weicht von VERSION ab');
  assert.equal(readJson(p('plugins', KERN, 'module-registry.json')).version, version,
    'module-registry.json weicht von VERSION ab');
});

test('Registry beschreibt genau die vorhandenen Plugins mit korrektem Namespace', () => {
  const reg = readJson(p('plugins', KERN, 'module-registry.json'));
  assert.equal(reg.marketplace, marketplace.name, 'Registry nennt einen fremden Marketplace');
  const satellites = [];
  for (const a of reg.abteilungen) {
    const entry = marketplace.plugins.find((e) => e.name === a.plugin);
    assert.ok(entry, `Abteilung ${a.name}: Plugin ${a.plugin} fehlt im Marketplace`);
    assert.equal(a.namespace, `/${a.plugin}:`,
      `Abteilung ${a.name}: namespace muss dem Plugin-Namen folgen (erwartet /${a.plugin}:)`);
    assert.equal(a.staendig, a.plugin === KERN,
      `Abteilung ${a.name}: staendig gilt genau fuer die Abteilung im Kern`);
    if (a.repository) {
      // Satellit: die Registry nennt das Heimat-Repo, der Marketplace-Eintrag muss per
      // github-Source exakt dorthin gepinnt sein; repoSkillsPath ist relativ zur
      // Satelliten-Wurzel, nicht mehr zum OS-Repo.
      satellites.push(a.plugin);
      assert.equal(typeof entry.source === 'object' && entry.source.source, 'github',
        `Abteilung ${a.name}: Satellit braucht eine github-Source im Marketplace`);
      assert.equal(entry.source.repo, a.repository,
        `Abteilung ${a.name}: Registry-Repo und Marketplace-Pin driften auseinander`);
      assert.equal(a.repoSkillsPath.startsWith('plugins/'), false,
        `Abteilung ${a.name}: repoSkillsPath eines Satelliten ist relativ zur Satelliten-Wurzel`);
    } else {
      assert.equal(a.repoSkillsPath, `plugins/${a.plugin}/skills`,
        `Abteilung ${a.name}: repoSkillsPath passt nicht zum Plugin`);
    }
  }
  const localRegistered = reg.abteilungen.map((a) => a.plugin)
    .filter((pl) => !satellites.includes(pl)).sort();
  assert.deepEqual(localRegistered, pluginDirsOnDisk().sort(),
    'Registry (lokale Abteilungen) und plugins/ driften auseinander');
});

// --- SSOT-Document-Index (Bauplan 2026-08-10, AP4/AP6) --------------------------------
// Der Master-Index traegt zwei Funktionen: Ordner-Routing (wohin gehoert ein Dokument) und
// Quellen-Triage ("Relevant wenn …"). Beide sind nur so viel wert, wie der Index
// vollstaendig ist — das kann keine Checkliste garantieren, deshalb hier mechanisch.
const WISSEN = p('knowledge-base');
const INDEX_DATEI = path.join(WISSEN, 'SSOT-Document-Index.md');

// Tages-Journale des Sitzungswissens (Onsite §15.29/§15.48, Mapping D14) sind append-only und
// wachsen um eine Datei je Arbeitstag — eine Index-Zeile je Datei waere reine Fleisspflicht
// ohne Triage-Wert und wuerde jede Session-Sicherung zu einer Index-Aenderung zwingen. Sie
// sind deshalb von der Einzelzeilen-Pflicht ausgenommen; im Gegenzug erzwingt die
// Sitzungswissen-Invariante weiter unten die Routing-Zeile der Kategorie, den Stand je
// Abteilungsordner und das Register. Stand, Roll-up und Register bleiben einzeln
// indexpflichtig; die Linkgueltigkeit gilt unveraendert fuer alles Indizierte.
const JOURNAL_RE = /^sitzungswissen\/[^/]+\/journal\//;
// Dieselbe Begruendung fuer die Vorlagen-Bausteine (Umzug in die Wissensbasis, Mapping D10/EN7):
// Die .vorlage-Dateien sind EIN zusammengehoeriger Baustein-Satz, der als Ganzes gepflegt und
// ueber die Sammelzeile `standardprozesse/vorlagen/abteilungsplugin/VORLAGE.md` triagiert wird
// — diese Sammelzeile bleibt einzeln indexpflichtig (eigene Invariante weiter unten), eine
// Index-Zeile je Baustein haette keinen Triage-Wert. Die Linkgueltigkeit gilt unveraendert fuer
// alles Indizierte.
const VORLAGE_RE = /^standardprozesse\/vorlagen\/.+\.vorlage$/;

/** Alle Wissensdateien relativ zu `knowledge-base/`, POSIX-normalisiert. */
function wissensDateien() {
  const out = [];
  const stack = [WISSEN];
  while (stack.length) {
    const cur = stack.pop();
    for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, entry.name);
      if (entry.isDirectory()) { stack.push(full); continue; }
      if (full === INDEX_DATEI) continue;
      // PLATZHALTER.md haelt eine noch leere Kategorie in Git (Vorbild-Muster) und ist
      // bewusst NICHT indexpflichtig — sie traegt kein Wissen, nur Struktur.
      // Die Ausnahme gilt nur, SOLANGE der Ordner leer ist (so ist sie dokumentiert:
      // Index Teil 1 "solange leer", die Datei selbst "sobald das erste Dokument hier liegt,
      // wird diese Datei geloescht", Aktualisierungs-Index "PLATZHALTER.md entfernen, sobald
      // die erste echte Idee liegt"). Unbedingt gestellt waere sie ein Loch in der
      // Indexpflicht: echtes Wissen entkaeme ihr, indem es PLATZHALTER.md heisst
      // (Review-Gegenprobe 2026-08-12: zwei Dateien mit Inhalt in nicht-leeren Kategorien
      // liefen unbemerkt durch).
      if (entry.name === 'PLATZHALTER.md' && fs.readdirSync(cur).length === 1) continue;
      out.push(path.relative(WISSEN, full).split(path.sep).join('/'));
    }
  }
  return out.sort();
}

/** Link-Ziele des Index (Markdown, inkl. <>-Form fuer Pfade mit Leerzeichen). */
function indexZiele() {
  const raw = fs.readFileSync(INDEX_DATEI, 'utf8');
  return [...raw.matchAll(/\]\(\s*<?([^)>\n]+?)>?\s*\)/g)]
    .map((m) => m[1].trim())
    .filter((z) => !/^(https?:|mailto:|#)/.test(z));
}

test('SSOT-Document-Index: jede Wissensdatei ist indiziert', () => {
  assert.ok(fs.existsSync(INDEX_DATEI), 'knowledge-base/SSOT-Document-Index.md fehlt');
  const index = fs.readFileSync(INDEX_DATEI, 'utf8');
  const fehlend = wissensDateien()
    .filter((rel) => !JOURNAL_RE.test(rel))   // Journal-Ausnahme, siehe JOURNAL_RE
    .filter((rel) => !VORLAGE_RE.test(rel))   // Vorlagen-Baustein-Ausnahme, siehe VORLAGE_RE
    .filter((rel) => !index.includes(rel));
  assert.deepEqual(fehlend, [],
    `nicht im SSOT-Document-Index.md erfasst: ${fehlend.join(', ')} — jede neue Wissensdatei braucht eine Zeile mit "Relevant wenn …"`);
});

test('Vorlagen-Bausteine: die Sammelzeile VORLAGE.md ist indiziert', () => {
  // Gegenstueck zur Vorlagen-Ausnahme oben (VORLAGE_RE): Die Einzelzeilen-Pflicht der
  // .vorlage-Bausteine entfaellt NUR, weil der Index den Satz ueber seine VORLAGE.md-Zeile als
  // Ganzes triagiert. Faellt diese Zeile weg, liefe der ganze Vorlagen-Satz still an der
  // Indexpflicht vorbei — genau die Drift, die der Index verhindern soll.
  const index = fs.readFileSync(INDEX_DATEI, 'utf8');
  assert.ok(index.includes('standardprozesse/vorlagen/abteilungsplugin/VORLAGE.md'),
    'der SSOT-Document-Index muss die Sammelzeile der Vorlage (VORLAGE.md) fuehren — '
    + 'ohne sie ist die Ausnahme in VORLAGE_RE unbegruendet');
});

test('Sitzungswissen: Kategorie geroutet, Register erreichbar, Stand je Abteilung', () => {
  // Gegenstueck zur Journal-Ausnahme oben (JOURNAL_RE): Die Einzelzeilen-Pflicht entfaellt fuer
  // Tages-Journale NUR, weil diese Invariante die Struktur der Kategorie deterministisch
  // erzwingt — Residenzpflicht des Sitzungswissens in der Wissensbasis (Mapping D14, Onsite
  // §15.48). Der fruehere lokale Strom .nc/erinnerung/ war un-getrackt, stale und wurde von
  // niemandem zurueckgelesen; er ist mit Phase I aufgehoben. In Repos OHNE eigene Wissensbasis
  // traegt das Projekt-Memory den Stand allein — dort entsteht kein Dateistrom.
  const dir = path.join(WISSEN, 'sitzungswissen');
  assert.ok(fs.existsSync(dir),
    'knowledge-base/sitzungswissen/ fehlt — Sitzungswissen wohnt seit Phase I in der Wissensbasis');
  const index = fs.readFileSync(INDEX_DATEI, 'utf8');
  assert.ok(index.includes('`sitzungswissen/`'),
    'SSOT-Document-Index Teil 1 routet die Kategorie sitzungswissen/ nicht');
  assert.ok(fs.existsSync(path.join(dir, 'offene-straenge-register.md')),
    'sitzungswissen/offene-straenge-register.md fehlt — /nc:end-session muss offene Straenge eintragen koennen');
  assert.ok(index.includes('sitzungswissen/offene-straenge-register.md'),
    'das Offene-Straenge-Register ist nicht im Index verlinkt — /nc:start faende es nicht');
  assert.ok(fs.existsSync(path.join(dir, 'roll-up.md')),
    'sitzungswissen/roll-up.md fehlt — der Roll-up-Index ist Pflichtbaustein');
  const abteilungen = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory());
  assert.ok(abteilungen.length > 0,
    'sitzungswissen/ hat keinen Abteilungsordner — mindestens `gemeinsam/` ist Pflicht');
  for (const entry of abteilungen) {
    assert.ok(fs.existsSync(path.join(dir, entry.name, 'stand.md')),
      `sitzungswissen/${entry.name}/: stand.md fehlt — je Abteilungsordner ist der konsolidierte `
      + 'Stand Pflicht (Konsolidierungspflicht von /nc:end-session)');
  }
});

test('SSOT-Document-Index: kein Eintrag zeigt ins Leere', () => {
  const tot = indexZiele().filter((ziel) => !fs.existsSync(path.join(WISSEN, ...ziel.split('/'))));
  assert.deepEqual(tot, [],
    `toter Verweis im SSOT-Document-Index.md: ${tot.join(', ')} — Pfade sind relativ zu "knowledge-base/"`);
});

test('SSOT-Document-Index: jede Kategorie ist im Routing erfasst', () => {
  // Entscheid E1 (2026-08-11): Der Kern fuehrt die Fuenferstruktur des Vorbilds. Eine
  // Kategorie ohne Routing-Zeile in Teil 1 ist ein Ablageort ohne Regel — genau die Luecke,
  // durch die Dokumente am falschen Ort landen.
  //
  // Geprueft wird die ZEILE IN TEIL 1, nicht die blosse Erwaehnung irgendwo im Index
  // (Review-Gegenprobe 2026-08-12): Ein Kategoriename steht auch in der Mapping-Tabelle, in
  // der Spalte "gehoert nicht hierher" fremder Zeilen und in den Teil-2-Ueberschriften. Eine
  // Volltextsuche war deshalb schon gruen, NACHDEM die Routing-Zeile geloescht wurde — der
  // Test haette den Verlust der Regel nicht gemeldet.
  const index = fs.readFileSync(INDEX_DATEI, 'utf8');
  const teil1 = (index.split(/^## Teil 1\b[^\n]*$/m)[1] ?? '').split(/^## /m)[0];
  assert.ok(teil1.trim().length > 0,
    'Abschnitt "## Teil 1 …" im SSOT-Document-Index nicht gefunden — ohne ihn prueft diese '
    + 'Invariante nichts mehr (Ueberschrift umbenannt? dann hier nachziehen)');
  const kategorien = fs.readdirSync(WISSEN, { withFileTypes: true })
    .filter((e) => e.isDirectory()).map((e) => e.name).sort();
  const alsRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Ordnername ist Literal
  const ungeroutet = kategorien
    .filter((k) => !new RegExp('^\\|\\s*`' + alsRegex(k) + '/`', 'm').test(teil1));
  assert.deepEqual(ungeroutet, [],
    `Kategorie ohne Routing-Zeile in Teil 1: ${ungeroutet.join(', ')} — als eigene Tabellenzeile `
    + '`<name>/` in Teil 1 aufnehmen (gehoert hierher / gehoert nicht hierher / Lebenszyklus)');
});

test('Wissensbasis-Wurzel: nur der Index liegt oben', () => {
  // Entwurfsentscheidung: Der Index ist das einzige Dokument hierarchisch ueber den
  // Kategorien. Alles andere gehoert in eine Kategorie, sonst zerfaellt die Triage.
  const oben = fs.readdirSync(WISSEN, { withFileTypes: true })
    .filter((e) => e.isFile()).map((e) => e.name).sort();
  assert.deepEqual(oben, ['SSOT-Document-Index.md'],
    'direkt in knowledge-base/ darf nur SSOT-Document-Index.md liegen — jede weitere Datei gehoert in eine Kategorie');
});

// --- Repo-Wurzel und Instruktions-Traeger (Struktur-Paritaetsaudit 2026-08-25) -----------
// Drei Abweichungen vom Vorbild lagen wochenlang unbemerkt an der Wurzel: zwei Alt-Backup-
// Ordner (`_wzs-*-backup-*`), ein `docs/`-Seitenarm mit der Design-Spec ausserhalb der
// Wissensbasis und eine un-getrackte CLAUDE.md. Keine Checkliste hat sie gemeldet — deshalb
// jetzt Waechter. Geprueft wird der GETRACKTE Bestand (`git ls-files`), nicht das Verzeichnis:
// lokale Artefakte (.worktrees/, .nc/, CLAUDE.local.md, node_modules) sind gitignored und
// gehoeren nicht zur Struktur. Neue Wurzeldatei = neue Zeile in der Liste, bewusst.
test('Repo-Wurzel: nur die bekannten getrackten Eintraege, kein Backup, kein docs/-Seitenarm', () => {
  const ERLAUBT = new Set([
    '.claude-plugin', '.gitattributes', '.github', '.gitignore',
    'AGENTS.md', 'CHANGELOG.md', 'CLAUDE.md', 'CONTRIBUTING.md', 'LICENSE', 'ONBOARDING.md',
    'README.md', 'SECURITY.md', 'VERSION', 'knowledge-base', 'metaknowledge', 'package.json', 'plugins',
  ]);
  const getrackt = execFileSync('git', ['ls-files', '-z'], { cwd: REPO, encoding: 'utf8' })
    .split('\0').filter(Boolean)
    .map((f) => f.split('/')[0]);
  const wurzel = [...new Set(getrackt)].sort();
  const fremd = wurzel.filter((e) => !ERLAUBT.has(e));
  assert.deepEqual(fremd, [],
    `Unbekannte Eintraege an der Repo-Wurzel: ${fremd.join(', ')} — entweder gehoert es in eine `
    + 'Wissensbasis-Kategorie / ein Plugin, oder es ist eine bewusste neue Wurzeldatei (dann hier eintragen)');
  assert.ok(!fs.existsSync(p('docs')),
    'docs/ existiert — Design-Specs und Doku gehoeren in knowledge-base/ (Spec seit 2026-08-25 in bauplan-archiv/)');
});

test('Instruktions-Traeger: die Team-Sync-Payload wohnt in doks/, nicht an der Plugin-Wurzel', () => {
  // Onsite-Paritaet (Mapping D13, 2026-08-25): `doks/` ist der einzige freigegebene
  // Instruktions-Traeger im Paket. Bis dahin lag die Ebene-1b-Payload als nc-sync.md an der
  // Plugin-Wurzel — eine dokumentierte Abweichung, die mit dem Umzug aufgehoben ist.
  assert.ok(!fs.existsSync(p('plugins', KERN, 'nc-sync.md')),
    'plugins/nc/nc-sync.md existiert noch — die Payload heisst seit 2026-08-25 doks/nc-teamsync.md');
  assert.ok(fs.existsSync(p('plugins', KERN, 'doks', 'nc-teamsync.md')),
    'plugins/nc/doks/nc-teamsync.md fehlt — der Doks-Autosync (Ebene 1b) haette keine Quelle');
  const autosync = fs.readFileSync(p('plugins', KERN, 'hooks', 'nc-doks-autosync.js'), 'utf8');
  assert.ok(/doks[\\/'"+, ]+nc-teamsync\.md/.test(autosync),
    'nc-doks-autosync.js zeigt nicht auf doks/nc-teamsync.md — Payload-Quelle und Datei sind auseinander');
});

test('CLAUDE.md ist getrackt und importiert AGENTS.md', () => {
  // Claude Code liest CLAUDE.md, nicht AGENTS.md (Claude-Code-Doku "How Claude remembers your
  // project", Abschnitt AGENTS.md, 2026-08-25). Ohne getrackte CLAUDE.md hat ein frischer Klon
  // keinen Pflicht-Einstieg. Die Import-Zeile muss AUSSERHALB von Code-Spans stehen —
  // `@AGENTS.md` in Backticks ist laut Doku nur Text.
  assert.ok(fs.existsSync(p('CLAUDE.md')), 'CLAUDE.md fehlt an der Repo-Wurzel');
  const gitignore = fs.readFileSync(p('.gitignore'), 'utf8').split(/\r?\n/).map((l) => l.trim());
  assert.ok(!gitignore.includes('CLAUDE.md'),
    '.gitignore ignoriert CLAUDE.md — dann kommt sie in keinem Klon an (persoenliche Notizen: CLAUDE.local.md)');
  const ohneCode = fs.readFileSync(p('CLAUDE.md'), 'utf8')
    .replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  assert.ok(/^@AGENTS\.md\s*$/m.test(ohneCode),
    'CLAUDE.md importiert AGENTS.md nicht (Zeile `@AGENTS.md` ausserhalb von Code-Spans fehlt)');
  assert.ok(fs.existsSync(p('AGENTS.md')), 'AGENTS.md fehlt — der Import liefe ins Leere');
});

// Tag-Luecke (Lehre aus dem 0.2.0-Release): Der Tag-Schritt liegt hinter dem Merge, also
// hinter dem Ende der Arbeitseinheit, die ihn haette setzen koennen — und keine Pruefung
// sieht ihn. Absichtlich geprueft wird nur "alle AUSSER der juengsten": die oberste Version
// ist im Release-PR naturgemaess noch nicht getaggt (Henne-Ei). Sobald ein zweiter Abschnitt
// geschnitten wird, ohne den ersten zu taggen, wird die CI rot.
// Tag-Schema dieses Repos: `{plugin-name}--v{version}`, fuer die Leitversion also `nc--vX.Y.Z`
// (`claude plugin tag`). Die historischen `novacoreai-os--v*`-Tags bleiben unberuehrt.
//
// HISTORIE (Bauplan 2026-08-10, Nachtrag N1): Bei ihrer Einfuehrung deckte diese Invariante
// zwei veroeffentlichte, aber nie getaggte Staende auf (0.3.0, 0.4.0). Beide Tags wurden
// mit Maintainer-Freigabe nachgesetzt (annotiert, auf die Merge-Commits von PR #3 bzw. #4,
// analog nc--v0.5.0) — die Regel gilt daher OHNE Ausnahme.
test('Release-Tags: jede veroeffentlichte CHANGELOG-Version ausser der juengsten ist getaggt', () => {
  const versionen = [...fs.readFileSync(p('CHANGELOG.md'), 'utf8')
    .matchAll(/^## \[(\d+(?:\.\d+)+)\]/gm)].map((m) => m[1]);
  assert.ok(versionen.length > 1,
    'CHANGELOG fuehrt weniger als zwei veroeffentlichte Abschnitte — Muster geaendert?');

  let tags;
  let imRepo = false;
  try {
    imRepo = execFileSync('git', ['rev-parse', '--is-inside-work-tree'],
      { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() === 'true';
    tags = execFileSync('git', ['tag', '--list'], { cwd: REPO, encoding: 'utf8' })
      .split('\n').map((s) => s.trim()).filter(Boolean);
  } catch {
    return; // kein Git / kein Repo (Quell-Export): Regel hier nicht pruefbar, nicht falsch
  }
  // Wir sind in einem Repo, sehen aber keine Tags: dann ist die Invariante NICHT geprueft.
  // Frueher wurde hier still gruen gemeldet — genau so kann die Regel, die die 0.3.0/0.4.0-
  // Luecke gefunden hat, unbemerkt aussetzen (Review-Befund M3, Nachtrag N2). ci.yml holt
  // die Tags per `fetch-tags: true`; fehlen sie trotzdem, ist das ein Konfigurationsfehler.
  assert.notEqual(imRepo && tags.length === 0, true,
    'Git-Repo ohne Tags: die Release-Tag-Invariante konnte nichts pruefen — Checkout ohne '
    + '`fetch-tags: true` (ci.yml/release.yml) oder Fork ohne Tags');
  if (tags.length === 0) return;

  const vorhanden = new Set(tags);
  // Uebergangsregel: Vor Einfuehrung des Schemas `nc--v*` (2026-07-28) galten
  // `novacoreai-os--v*`-Tags; beide Formen zaehlen als getaggt.
  const istGetaggt = (v) => vorhanden.has(`${KERN}--v${v}`) || vorhanden.has(`novacoreai-os--v${v}`);
  const ohneTag = versionen.slice(1).filter((v) => !istGetaggt(v));
  assert.deepEqual(ohneTag, [],
    `veroeffentlichte Versionen ohne Tag: ${ohneTag.join(', ')} — Release nachholen `
    + '(Aktualisierungs-Index Abschnitt 3.6: annotiert taggen und pushen, Tag und Release '
    + 'nie vom Versions-Commit trennen)');
});

// SPAETE ANKER-INVARIANTE (Bauplan 2026-08-15, AP-C2; Onsite-Muster Karte 09 §7):
// Die fruehe Absicherung gegen parallele Doppelvergabe ist der reserve/*-Tag
// (standardprozesse/anker-reservierung.md); diese Invariante ist die SPAETE Ebene und
// faengt, was trotzdem durchrutscht — z. B. wenn zwei Straenge ohne Reservierung dieselbe
// Versionsueberschrift anlegen und Git die Bloecke konfliktfrei nebeneinander merged.
// Onsites zweite Invariante (Spec-Fusszeilen-Glied) entfaellt bewusst: NovaCore fuehrt
// keine Einzel-Spec mit Fusszeilen-Kette (Bauplan Nachtrag, AP-C2).
// Gegenprobe eingebaut: die Extraktion wird erst gegen eine synthetische Dublette
// verifiziert — ein Muster-Drift im Regex kann den Test damit nicht still leeren.
test('CHANGELOG: keine Versionsueberschrift doppelt vergeben (spaete Anker-Invariante)', () => {
  const extrahiere = (text) =>
    [...text.matchAll(/^## \[(\d+(?:\.\d+)+)\]/gm)].map((m) => m[1]);

  const synthetisch = '## [0.1.0]\ntext\n## [0.2.0]\ntext\n## [0.1.0]\n';
  assert.deepEqual(extrahiere(synthetisch), ['0.1.0', '0.2.0', '0.1.0'],
    'Gegenprobe fehlgeschlagen: die Versions-Extraktion erkennt eine synthetische '
    + 'Dublette nicht mehr — Regex gegen das CHANGELOG-Muster driftet');

  const versionen = extrahiere(fs.readFileSync(p('CHANGELOG.md'), 'utf8'));
  assert.ok(versionen.length > 1,
    'CHANGELOG fuehrt weniger als zwei veroeffentlichte Abschnitte — Muster geaendert?');
  const gesehen = new Set();
  const doppelt = versionen.filter((v) => (gesehen.has(v) ? true : (gesehen.add(v), false)));
  assert.deepEqual(doppelt, [],
    `doppelt vergebene CHANGELOG-Versionsueberschrift: ${doppelt.join(', ')} — zwei `
    + 'Straenge haben denselben Anker belegt; Aufloesung nach '
    + 'standardprozesse/anker-reservierung.md (naechste freie Nummer, Eintraege mergen)');
});

test('Vorlage ist kein Plugin und enthaelt keine ausgefuellten Werte', () => {
  const dir = p('knowledge-base', 'standardprozesse', 'vorlagen', 'abteilungsplugin');
  assert.equal(fs.existsSync(path.join(dir, '.claude-plugin', 'plugin.json')), false,
    'die Vorlage darf kein einsatzfaehiges plugin.json enthalten (nur .vorlage)');
  const tpl = fs.readFileSync(path.join(dir, '.claude-plugin', 'plugin.json.vorlage'), 'utf8');
  assert.match(tpl, /\{\{PLUGIN_NAME\}\}/, 'Vorlage ohne Platzhalter — wurde sie versehentlich ausgefuellt?');
  assert.match(tpl, /"dependencies":\s*\[\s*"nc"\s*\]/s, 'Vorlage muss dependencies ["nc"] vorgeben');

  // Die Wissensbasis-Vorlage der Satelliten faellt unter dieselbe Invariante: Der
  // Aktualisierungs-Index (Zeile "Vorlage `ssot-grundgeruest` geaendert") beruft sich fuer
  // "Platzhalter {{ABTEILUNG}} muss stehenbleiben" ausdruecklich auf sie — geprueft wurde das
  // bisher nicht (Review-Befund 2026-08-12). Ohne Platzhalter waere die Vorlage eine
  // ausgefuellte Instanz und wuerde beim Kopieren stillschweigend fremde Namen mitschleppen.
  const ssot = path.join(dir, 'ssot-grundgeruest.md.vorlage');
  assert.ok(fs.existsSync(ssot),
    'standardprozesse/vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage fehlt — sie ist die verbindliche '
    + 'Vorlage der Satelliten-Wissensbasis (ssot-aufbau.md §4, abteilungs-plugin-bau.md §3b.1)');
  assert.match(fs.readFileSync(ssot, 'utf8'), /\{\{ABTEILUNG\}\}/,
    'ssot-grundgeruest.md.vorlage ohne Platzhalter {{ABTEILUNG}} — wurde sie ausgefuellt?');
});

test('Keine offenen Vorlagen-Platzhalter in ausgelieferten Plugins', () => {
  for (const dir of pluginDirsOnDisk()) {
    const stack = [p('plugins', dir)];
    while (stack.length) {
      const cur = stack.pop();
      for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
        const full = path.join(cur, entry.name);
        if (entry.isDirectory()) { stack.push(full); continue; }
        if (!/\.(md|json)$/.test(entry.name)) continue;
        assert.equal(/\{\{[A-Z_]+\}\}/.test(fs.readFileSync(full, 'utf8')), false,
          `${full}: unersetzter Vorlagen-Platzhalter`);
      }
    }
  }
});
