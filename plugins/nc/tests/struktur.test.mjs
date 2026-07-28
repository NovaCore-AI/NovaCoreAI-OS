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
  // trivial gruen (kein Plugin hat einen MCP-Server) und schlaegt an dem Tag an, an dem
  // einer dazukommt.
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
            assert.match(context, /OS-Repo/,
              `${full}:${i + 1}: Repo-Pfad ohne "OS-Repo"-Qualifizierung — nach Installation nicht auflösbar`);
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

test('Vorlage ist kein Plugin und enthaelt keine ausgefuellten Werte', () => {
  const dir = p('vorlagen', 'abteilungsplugin');
  assert.equal(fs.existsSync(path.join(dir, '.claude-plugin', 'plugin.json')), false,
    'die Vorlage darf kein einsatzfaehiges plugin.json enthalten (nur .vorlage)');
  const tpl = fs.readFileSync(path.join(dir, '.claude-plugin', 'plugin.json.vorlage'), 'utf8');
  assert.match(tpl, /\{\{PLUGIN_NAME\}\}/, 'Vorlage ohne Platzhalter — wurde sie versehentlich ausgefuellt?');
  assert.match(tpl, /"dependencies":\s*\[\s*"nc"\s*\]/s, 'Vorlage muss dependencies ["nc"] vorgeben');
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
