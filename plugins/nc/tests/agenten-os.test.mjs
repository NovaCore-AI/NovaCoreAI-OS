// Agenten-Invarianten, die an das OS-Repo gebunden sind (Bauplan 2026-08-15, AP-D1;
// NC-Port des Onsite-Pendants, origin/feat/queue-flow, I6).
//
// Warum eine zweite Datei: Der Schwester-Baustein agenten.test.mjs ist bewusst portabel und
// wandert mit, sobald ein Satellit ein agents/-Verzeichnis bekommt (Regel in
// subagenten-bau.md, OS-Repo). Die Pruefungen hier koennen das nicht — sie brauchen
// Artefakte, die es NUR im OS-Repo gibt: die Abteilungs-Registry des Kerns und die
// Abteilungsplugin-Vorlage. Ein Satellit fuehrt beides nicht.
//
// Die Alternative waere ein "ueberspringen, wenn die Datei fehlt" in einer gemeinsamen Datei
// gewesen — bewusst verworfen (Onsite-Entscheid 2026-08-14): Ein stillschweigend
// uebersprungener Test meldet gruen, ohne geprueft zu haben, und das ist genau die
// Fehlerklasse, gegen die diese Suite gebaut ist. Getrennte Dateien laufen beide immer voll.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const p = (...s) => path.join(REPO, ...s);
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

const KERN = 'nc';

/** Verzeichnisse unter plugins/, die ein Manifest tragen (OS-Repo-Layout). */
function pluginDirsOnDisk() {
  const base = p('plugins');
  return fs.readdirSync(base).filter((d) =>
    fs.existsSync(path.join(base, d, '.claude-plugin', 'plugin.json')));
}

test('Registry-Konsistenz: agents-Segment je Abteilung passt zur Platte', () => {
  // module-registry.json fuehrt je Abteilung ein agents-Objekt (Name -> Kurzbeschreibung,
  // ggf. leer). Ohne diesen Abgleich driften Registry und ausgelieferte Agenten auseinander
  // — ein Agent ohne Registry-Eintrag ist im Produktbild unsichtbar, ein Registry-Eintrag
  // ohne Datei ein toter Verweis.
  const reg = readJson(p('plugins', KERN, 'module-registry.json'));
  for (const a of reg.abteilungen) {
    assert.equal(typeof a.agents, 'object', `Abteilung ${a.name}: Feld "agents" fehlt oder ist kein Objekt`);
    assert.ok(a.agents !== null && !Array.isArray(a.agents),
      `Abteilung ${a.name}: "agents" muss ein Objekt sein (Name -> Kurzbeschreibung)`);
    if (a.repository) continue; // Satellit: Agenten liegen im Satelliten-Repo, nicht auf dieser Platte
    const ad = p('plugins', a.plugin, 'agents');
    const dateien = fs.existsSync(ad)
      ? fs.readdirSync(ad).filter((n) => n.endsWith('.md')).map((n) => n.replace(/\.md$/, '')).sort()
      : [];
    const eintraege = Object.keys(a.agents).sort();
    assert.deepEqual(eintraege, dateien,
      `Abteilung ${a.name}: agents-Segment und plugins/${a.plugin}/agents/ driften auseinander `
      + `(nur Registry: ${eintraege.filter((k) => !dateien.includes(k)).join(', ') || '-'}; `
      + `nur Platte: ${dateien.filter((k) => !eintraege.includes(k)).join(', ') || '-'})`);
  }
});

test('Registry-Konsistenz: kein agents/-Verzeichnis ohne Registry-Abteilung', () => {
  // Gegenrichtung der Invariante darueber: Ein Plugin koennte Agenten ausliefern, ohne in der
  // Registry als Abteilung gefuehrt zu sein — dann fiele es aus dem Abgleich heraus und
  // waere unsichtbar. Der plattenbasierte Scan deckt diese Luecke.
  const reg = readJson(p('plugins', KERN, 'module-registry.json'));
  const gefuehrt = new Set(reg.abteilungen.map((a) => a.plugin));
  for (const dir of pluginDirsOnDisk()) {
    if (!fs.existsSync(p('plugins', dir, 'agents'))) continue;
    assert.ok(gefuehrt.has(dir),
      `plugins/${dir}/agents/ existiert, aber ${dir} ist in module-registry.json keine Abteilung`);
  }
});

test('Vorlagen-Invariante: beispiel-agent.md.vorlage traegt Platzhalter und Allowlist-Norm', () => {
  // Der Vorlagen-Baustein gibt neuen Abteilungsplugins den Agenten-Bauweg mit — er darf
  // weder fehlen noch versehentlich mit echten Werten ausgefuellt worden sein. Seit dem
  // Allowlist-Prinzip (2026-08-15) gibt die Vorlage die Pflichtfelder tools und model sowie
  // den Defense-Baseline-Block vor; die Read-only-Variante kommt ohne Bash und ohne
  // Schreib-Werkzeuge in der Allowlist aus (disallowedTools ist nicht mehr Traeger der Grenze).
  const vorlage = p('vorlagen', 'abteilungsplugin', 'agents', 'beispiel-agent.md.vorlage');
  assert.ok(fs.existsSync(vorlage), `${vorlage} fehlt — der Agenten-Baustein der Vorlage ist Pflicht`);
  const inhalt = fs.readFileSync(vorlage, 'utf8');
  assert.match(inhalt, /\{\{AGENT_NAME\}\}/, 'Vorlage ohne Platzhalter {{AGENT_NAME}} — wurde sie ausgefuellt?');
  assert.match(inhalt, /\{\{ZWECK\}\}/, 'Vorlage ohne Platzhalter {{ZWECK}} — wurde sie ausgefuellt?');
  assert.match(inhalt, /^model:/m,
    'Vorlage ohne model-Feld — die Modellwahl ist Pflichtfeld (Allowlist-Norm 2026-08-15)');
  // Seit Baustein 1.4.0 (Codex-Review): den GESAMTEN Feldwert lesen (Inline- wie
  // YAML-Listenform) und POSITIV pruefen — eine mehrzeilige Liste mit Write/Bash/
  // PowerShell darf nicht unbemerkt bleiben, und nur lesende Built-ins sind zulaessig.
  const zeilen = inhalt.split(/\r?\n/);
  const idx = zeilen.findIndex((l) => /^tools:/.test(l));
  assert.notEqual(idx, -1,
    'Vorlage ohne tools-Feld — die Allowlist ist Pflichtfeld (Allowlist-Norm 2026-08-15)');
  const teile = [zeilen[idx].replace(/^tools:[ \t]*/, '')];
  for (let i = idx + 1; i < zeilen.length && (/^\s/.test(zeilen[i]) || zeilen[i] === ''); i++) {
    teile.push(zeilen[i]);
  }
  const tokens = teile.join(',').split(',')
    .map((t) => t.replace(/^[-\s]+|[\s]+$/g, '')).filter(Boolean);
  const LESE_BUILTINS = new Set(['Read', 'Grep', 'Glob', 'WebFetch', 'WebSearch']);
  const unzulaessig = tokens.filter((t) => !t.startsWith('mcp__') && !LESE_BUILTINS.has(t));
  assert.deepEqual(unzulaessig, [],
    `Vorlage muss die Read-only-Variante vorgeben — unzulaessige tools-Eintraege: ${unzulaessig.join(', ')}`);
  assert.match(inhalt, /^## Defense-Baseline[ \t]*$/m,
    'Vorlage ohne Defense-Baseline-Block — Pflichtbaustein seit 2026-08-15');
});

test('Portabler Pruefbaustein: agenten.test.mjs traegt eine Baustein-Version', () => {
  // Auflage der Extraktions-Lehre: Die Satelliten-Kopie muss Drift erkennbar machen. Ohne
  // Versions-Stempel im Kopf laesst sich eine veraltete Kopie nicht von einer aktuellen
  // unterscheiden. Der Stempel steht nur im portablen Baustein — diese OS-Datei wandert nie.
  const baustein = p('plugins', KERN, 'tests', 'agenten.test.mjs');
  const kopf = fs.readFileSync(baustein, 'utf8').split(/\r?\n/).slice(0, 40).join('\n');
  assert.match(kopf, /Baustein-Version\s+\d+\.\d+\.\d+/,
    'agenten.test.mjs ohne "Baustein-Version X.Y.Z" im Dateikopf — ohne Stempel ist eine '
    + 'Satelliten-Kopie nicht als veraltet erkennbar');
});
