// Tests fuer den Wissens-Zeiger der SSOT-Praesenz
// (plugins/nc/hooks/nc-wissens-hinweis.js; Port des Onsite-Hooks oai-wissens-hinweis.js,
// Spec §15.40 / Delta-Mapping-Position D4, Phase H Paket C).
//
// Zwei Dinge werden geprueft, und das zweite ist das wichtigere:
//   (1) dass der Hook zeigt, WENN ein Stichwort im Prompt steht — genau einmal je Treffer
//       und Sitzung, hoechstens drei Zeilen;
//   (2) dass er sonst SCHWEIGT. Ein Hook, der bei jedem Prompt etwas injiziert, wird
//       abgeschaltet und ist dann wertlos.
//
// ABGRENZUNG, die jeder Test mittraegt: Das ist KEIN Gate. Fuer UserPromptSubmit loescht
// Exit-Code 2 laut Doku den Prompt. Es gibt deshalb keinen Test, der eine Blockade erwartet
// — im Gegenteil pruefen alle Pfade zusaetzlich, dass der Exit-Code 0 ist und nie 2 wird.
//
// Der Hook ist in hooks.json registriert (UserPromptSubmit); diese Tests rufen die
// Hook-Datei dennoch direkt auf — Black-Box je Lauf, unabhaengig vom Plugin-Loader.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.join(HIER, '..');
const REPO_ROOT = path.join(HIER, '..', '..', '..');
const HOOK = path.join(PLUGIN_ROOT, 'hooks', 'nc-wissens-hinweis.js');
const ECHT_INDEX = path.join(PLUGIN_ROOT, 'hooks', 'wissen-sucheindex.json');

function tmp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/** Testindex — bewusst klein, damit Treffer eindeutig zuordenbar sind. */
function schreibeIndex(dir, eintraege, schemaVersion = 1) {
  const datei = path.join(dir, 'sucheindex.json');
  fs.writeFileSync(datei, JSON.stringify({ schemaVersion, eintraege }, null, 2), 'utf8');
  return datei;
}

const STANDARD_EINTRAEGE = [
  {
    id: 'aktualisierungs-index',
    titel: 'Aktualisierungs-Index',
    pfad: 'knowledge-base/standardprozesse/aktualisierungs-index.md',
    router: 'wissen-aendern',
    hinweis: 'je Änderungsart die Nachzüge',
    stichworte: ['aktualisierungs-index', 'was muss ich mitaendern']
  },
  {
    id: 'grundwissen',
    titel: 'Laufende Baupläne',
    pfad: 'knowledge-base/grundwissen/',
    router: 'wissen-planen',
    hinweis: 'laufende Vorhaben',
    stichworte: ['bauplan']
  },
  {
    id: 'agent-learnings',
    titel: 'Fehlerprotokoll',
    pfad: 'knowledge-base/debugging-findings/agent-learnings.md',
    router: 'wissen-protokolle',
    hinweis: 'Pflichteintrag nach jedem eigenen Fehler',
    stichworte: ['agent-learning', 'fehlerprotokoll']
  },
  {
    id: 'skill-authoring',
    titel: 'Skill-Authoring',
    pfad: 'referenz/skill-authoring.md',
    basis: 'kern-plugin',
    router: 'wissen-aendern',
    hinweis: 'Formatregeln der SKILL.md',
    stichworte: ['skill-authoring']
  }
];

/** Registry-Verzeichnis mit gueltigem kernRepoPfad (ein real existierendes Verzeichnis). */
function macheRegistry({ kernRepoPfad, kernSsotPfad, schemaVersion = 1, kaputt = false, ohneDatei = false } = {}) {
  const dir = tmp('nc-wissen-state-');
  if (ohneDatei) return dir;
  const datei = path.join(dir, 'infra.json');
  if (kaputt) { fs.writeFileSync(datei, '{ das ist kein json', 'utf8'); return dir; }
  const daten = {
    schemaVersion,
    abteilungen: ['development'],
    kernRepoPfad: kernRepoPfad === undefined ? tmp('nc-wissen-repo-') : kernRepoPfad
  };
  if (kernSsotPfad !== undefined) daten.kernSsotPfad = kernSsotPfad;
  fs.writeFileSync(datei, JSON.stringify(daten, null, 2), 'utf8');
  return dir;
}

/**
 * Hook-Lauf. Gibt `{ status, stdout, kontext }` zurueck; `kontext` ist der injizierte Text
 * oder null, wenn geschwiegen wurde.
 */
function laufe({ prompt, index, stateDir, sessionDir, session = 'S1', env = {}, roh = null }) {
  const eingabe = roh !== null ? roh : JSON.stringify({
    session_id: session,
    hook_event_name: 'UserPromptSubmit',
    prompt
  });
  const r = spawnSync(process.execPath, [HOOK], {
    input: eingabe,
    encoding: 'utf8',
    env: {
      ...process.env,
      NC_WISSEN_HINWEIS: '',
      NC_WISSEN_INDEX: index || '',
      NC_WISSEN_STATE_DIR: stateDir || '',
      NC_WISSEN_SESSION_DIR: sessionDir || '',
      ...env
    }
  });
  let kontext = null;
  if (r.stdout && r.stdout.trim()) {
    const daten = JSON.parse(r.stdout);
    assert.equal(daten.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
    kontext = daten.hookSpecificOutput.additionalContext;
  }
  // Invariante ueber ALLE Pfade: nie Exit 2 (das loeschte den Prompt), nie ein Fehlercode.
  assert.notEqual(r.status, 2, 'Exit 2 wuerde bei UserPromptSubmit den Prompt loeschen');
  assert.equal(r.status, 0, 'der Hook muss immer mit 0 enden — stderr: ' + (r.stderr || ''));
  return { status: r.status, stdout: r.stdout, kontext };
}

/** Standard-Umgebung: gueltiger Index, gueltige Registry, frischer Sitzungsordner. */
function umgebung(eintraege = STANDARD_EINTRAEGE) {
  const idxDir = tmp('nc-wissen-idx-');
  return {
    index: schreibeIndex(idxDir, eintraege),
    stateDir: macheRegistry(),
    sessionDir: tmp('nc-wissen-sess-')
  };
}

// --- Positivfall -----------------------------------------------------------------------

test('Treffer: genau eine Injektion mit dem passenden Dokument', () => {
  const u = umgebung();
  const { kontext } = laufe({ ...u, prompt: 'Ich ändere einen Hook — was muss ich mitändern?' });
  assert.ok(kontext, 'ein Stichwort im Prompt muss zu einer Injektion fuehren');
  assert.match(kontext, /Aktualisierungs-Index/);
  assert.match(kontext, /\/nc:wissen-aendern/);
  assert.match(kontext, /blockiert nichts/, 'die Nicht-Gate-Zusage steht im Text');
  assert.doesNotMatch(kontext, /Fehlerprotokoll/, 'nicht getroffene Eintraege gehoeren nicht hinein');
});

test('Umlaut-Faltung: „Änderung" im Prompt trifft das gefaltete Stichwort', () => {
  const u = umgebung();
  assert.ok(laufe({ ...u, prompt: 'was muss ich mitändern' }).kontext);
  assert.ok(laufe({ ...u, session: 'S2', prompt: 'WAS MUSS ICH MITAENDERN' }).kontext);
});

test('Offenes Wortende deckt angehaengte Beugung ab („Bauplans", „Bauplan-Entwurf")', () => {
  const u = umgebung();
  assert.ok(laufe({ ...u, prompt: 'Wo liegt der Bauplan dazu?' }).kontext);
  assert.ok(laufe({ ...u, session: 'S2', prompt: 'Gibt es einen Bauplan-Entwurf?' }).kontext);
  assert.ok(laufe({ ...u, session: 'S3', prompt: 'Der Inhalt des Bauplans ist alt.' }).kontext);
});

test('Umlaut-Plural braucht ein EIGENES Stichwort — belegte Grenze der Faltung', () => {
  // „Baupläne" faltet zu „bauplaene"; darin steckt „bauplan" NICHT (das „e" der Faltung
  // steht dort, wo im Singular das „n" steht). Ein offenes Wortende hilft hier also nicht.
  // Der ausgelieferte Index fuehrt deshalb beide Formen — dieser Test haelt die Grenze fest,
  // damit sie beim naechsten Stichwort nicht erneut uebersehen wird.
  const nurSingular = umgebung([{
    id: 'x', titel: 'X', pfad: 'knowledge-base/grundwissen/', router: 'wissen-planen',
    hinweis: 'h', stichworte: ['bauplan']
  }]);
  assert.equal(laufe({ ...nurSingular, prompt: 'Wo liegen die Baupläne?' }).kontext, null);

  const beideFormen = umgebung([{
    id: 'x', titel: 'X', pfad: 'knowledge-base/grundwissen/', router: 'wissen-planen',
    hinweis: 'h', stichworte: ['bauplan', 'bauplaene']
  }]);
  assert.ok(laufe({ ...beideFormen, prompt: 'Wo liegen die Baupläne?' }).kontext);
});

test('Linke Wortgrenze schuetzt vor Zufallstreffern mitten im Wort', () => {
  const u = umgebung([{
    id: 'x', titel: 'X', pfad: 'knowledge-base/SSOT-Document-Index.md',
    router: 'wissen-nachschlagen', hinweis: 'h', stichworte: ['plan']
  }]);
  assert.equal(laufe({ ...u, prompt: 'Der Flugzeugbauplan ist fertig' }).kontext, null);
  assert.ok(laufe({ ...u, session: 'S2', prompt: 'Der Plan ist fertig' }).kontext);
});

test('Der Pfad wird ueber die Infra-Registry aufgeloest, nicht relativ geraten', () => {
  // NovaCore-Abweichung vom Onsite-Original: `pfad` ist REPO-RELATIV, es wird kein
  // Wissensbasis-Segment eingeschoben.
  const repo = tmp('nc-wissen-repo-');
  const u = { ...umgebung(), stateDir: macheRegistry({ kernRepoPfad: repo }) };
  const { kontext } = laufe({ ...u, prompt: 'bauplan' });
  assert.ok(kontext.includes(path.join(repo, 'knowledge-base', 'grundwissen')),
    'der Zeiger muss den Registry-Pfad plus den repo-relativen Pfad nennen — gesehen: ' + kontext);
});

test('basis kern-plugin zeigt ins Plugin-Paket, nicht ins Repo-Arbeitsverzeichnis', () => {
  const repo = tmp('nc-wissen-repo-');
  const u = { ...umgebung(), stateDir: macheRegistry({ kernRepoPfad: repo }) };
  const { kontext } = laufe({ ...u, prompt: 'Regeln aus skill-authoring bitte' });
  assert.ok(kontext.includes(path.join(PLUGIN_ROOT, 'referenz', 'skill-authoring.md')),
    'ein Plugin-internes Dokument muss gegen die Plugin-Wurzel aufgeloest werden');
  assert.equal(kontext.includes(path.join(repo, 'referenz')), false,
    'ein Plugin-internes Dokument darf nicht unter dem Repo-Pfad verortet werden');
});

test('Deckel: hoechstens drei Treffer je Injektion', () => {
  const viele = ['a', 'b', 'c', 'd', 'e'].map((k, i) => ({
    id: 'e' + i, titel: 'Titel ' + i, pfad: 'knowledge-base/SSOT-Document-Index.md',
    router: 'wissen-nachschlagen', hinweis: 'h', stichworte: ['stichwort' + k]
  }));
  const u = umgebung(viele);
  const { kontext } = laufe({
    ...u,
    prompt: 'stichworta stichwortb stichwortc stichwortd stichworte'
  });
  const zeilen = kontext.split('\n').filter((z) => z.startsWith('- **'));
  assert.equal(zeilen.length, 3, 'mehr als drei Zeilen waeren Rauschen');
});

test('Spezifitaet gewinnt: das laengste passende Stichwort steht oben', () => {
  const u = umgebung([
    {
      id: 'kurz', titel: 'Kurz', pfad: 'knowledge-base/SSOT-Document-Index.md',
      router: 'wissen-nachschlagen', hinweis: 'h', stichworte: ['queue']
    },
    {
      id: 'lang', titel: 'Lang', pfad: 'knowledge-base/SSOT-Document-Index.md',
      router: 'wissen-nachschlagen', hinweis: 'h', stichworte: ['queue-flow standardprozess']
    }
  ]);
  const { kontext } = laufe({ ...u, prompt: 'zum queue-flow standardprozess bitte' });
  const zeilen = kontext.split('\n').filter((z) => z.startsWith('- **'));
  assert.match(zeilen[0], /Lang/);
});

// --- Wiederholungsschutz ---------------------------------------------------------------

test('Zweiter Prompt derselben Sitzung wiederholt denselben Treffer nicht', () => {
  const u = umgebung();
  assert.ok(laufe({ ...u, prompt: 'bauplan' }).kontext);
  assert.equal(laufe({ ...u, prompt: 'bauplan schon wieder' }).kontext, null);
});

test('Ein NEUER Treffer derselben Sitzung wird sehr wohl gezeigt', () => {
  const u = umgebung();
  assert.ok(laufe({ ...u, prompt: 'bauplan' }).kontext);
  const zweiter = laufe({ ...u, prompt: 'ich habe einen Fehler gemacht — fehlerprotokoll' });
  assert.ok(zweiter.kontext, 'der Schutz gilt je Treffer, nicht je Sitzung');
  assert.match(zweiter.kontext, /Fehlerprotokoll/);
});

test('Andere Sitzung sieht denselben Treffer wieder', () => {
  const u = umgebung();
  assert.ok(laufe({ ...u, prompt: 'bauplan' }).kontext);
  assert.ok(laufe({ ...u, session: 'ANDERE', prompt: 'bauplan' }).kontext);
});

// --- Negativfaelle: der eigentliche Kern -----------------------------------------------

test('Kein Treffer im Prompt: Schweigen', () => {
  const u = umgebung();
  const r = laufe({ ...u, prompt: 'Bitte formatiere diese Funktion um.' });
  assert.equal(r.kontext, null);
  assert.equal(r.stdout.trim(), '');
});

test('Leerer Prompt: Schweigen', () => {
  const u = umgebung();
  assert.equal(laufe({ ...u, prompt: '   ' }).kontext, null);
});

test('Defekter Sucheindex: Schweigen statt Fehler', () => {
  const dir = tmp('nc-wissen-idx-');
  const datei = path.join(dir, 'sucheindex.json');
  fs.writeFileSync(datei, '{ kaputt', 'utf8');
  const r = laufe({
    index: datei, stateDir: macheRegistry(), sessionDir: tmp('nc-wissen-sess-'),
    prompt: 'bauplan'
  });
  assert.equal(r.kontext, null);
});

test('Fehlender Sucheindex: Schweigen', () => {
  const r = laufe({
    index: path.join(tmp('nc-wissen-idx-'), 'gibt-es-nicht.json'),
    stateDir: macheRegistry(), sessionDir: tmp('nc-wissen-sess-'),
    prompt: 'bauplan'
  });
  assert.equal(r.kontext, null);
});

test('Sucheindex mit hoeherer schemaVersion: Schweigen statt Raten', () => {
  const dir = tmp('nc-wissen-idx-');
  const r = laufe({
    index: schreibeIndex(dir, STANDARD_EINTRAEGE, 99),
    stateDir: macheRegistry(), sessionDir: tmp('nc-wissen-sess-'),
    prompt: 'bauplan'
  });
  assert.equal(r.kontext, null);
});

test('Fehlende Infra-Registry: Schweigen (Setup lief hier nie)', () => {
  const u = umgebung();
  const r = laufe({ ...u, stateDir: macheRegistry({ ohneDatei: true }), prompt: 'bauplan' });
  assert.equal(r.kontext, null);
});

test('Defekte Infra-Registry: Schweigen', () => {
  const u = umgebung();
  const r = laufe({ ...u, stateDir: macheRegistry({ kaputt: true }), prompt: 'bauplan' });
  assert.equal(r.kontext, null);
});

test('Registry mit hoeherer schemaVersion: Schweigen statt Raten', () => {
  const u = umgebung();
  const r = laufe({ ...u, stateDir: macheRegistry({ schemaVersion: 99 }), prompt: 'bauplan' });
  assert.equal(r.kontext, null);
});

test('Fehlendes kernRepoPfad-Feld: Schweigen (optionales Queue-Flow-Feld)', () => {
  // NovaCore-Besonderheit: `kernRepoPfad` ist laut infra-registry.md optional. Fehlt es,
  // greift der Overseer-Entscheid Phase H (2026-08-24): `kernSsotPfad` (Lesekopie von
  // /nc:setup) ist die legitime ZWEITQUELLE fuer reine Zeiger — fehlt AUCH sie (wie hier),
  // schweigt der Hook; ein geratener Pfad ist in keinem Fall zulaessig.
  const u = umgebung();
  const r = laufe({ ...u, stateDir: macheRegistry({ kernRepoPfad: '' }), prompt: 'bauplan' });
  assert.equal(r.kontext, null);
});

test('Fallback (Overseer-Entscheid Phase H): Registry nur mit kernSsotPfad injiziert', () => {
  const u = umgebung();
  const lesekopie = tmp('nc-wissen-lesekopie-');
  const r = laufe({
    ...u,
    stateDir: macheRegistry({ kernRepoPfad: '', kernSsotPfad: lesekopie }),
    prompt: 'Ich ändere einen Hook — was muss ich mitändern?'
  });
  assert.ok(r.kontext, 'kernSsotPfad ist die legitime Zweitquelle fuer Zeiger');
  assert.match(r.kontext, /Aktualisierungs-Index/);
});

test('Fallback-Grenze: kernSsotPfad "ausstehend" oder tot → Schweigen', () => {
  const u = umgebung();
  const r1 = laufe({
    ...u,
    stateDir: macheRegistry({ kernRepoPfad: '', kernSsotPfad: 'ausstehend' }),
    prompt: 'bauplan'
  });
  assert.equal(r1.kontext, null);
  const r2 = laufe({
    ...u,
    stateDir: macheRegistry({ kernRepoPfad: '', kernSsotPfad: path.join(os.tmpdir(), 'nc-wissen-gibt-es-nicht-' + Date.now()) }),
    prompt: 'bauplan'
  });
  assert.equal(r2.kontext, null);
});

test('Toter kernRepoPfad: Schweigen statt erfundenem Pfad', () => {
  const u = umgebung();
  const tot = path.join(tmp('nc-wissen-tot-'), 'weg');
  const r = laufe({ ...u, stateDir: macheRegistry({ kernRepoPfad: tot }), prompt: 'bauplan' });
  assert.equal(r.kontext, null);
});

test('kernRepoPfad "ausstehend": Schweigen', () => {
  const u = umgebung();
  const r = laufe({ ...u, stateDir: macheRegistry({ kernRepoPfad: 'ausstehend' }), prompt: 'bauplan' });
  assert.equal(r.kontext, null);
});

test('Defekter Sitzungsmarker: Schweigen statt Dauer-Rauschen', () => {
  const u = umgebung();
  fs.mkdirSync(u.sessionDir, { recursive: true });
  fs.writeFileSync(path.join(u.sessionDir, 'wissen-S1.json'), 'kein json', 'utf8');
  assert.equal(laufe({ ...u, prompt: 'bauplan' }).kontext, null);
});

test('Abgelaufener Sitzungsmarker gilt als neuer Arbeitstag', () => {
  const u = umgebung();
  fs.mkdirSync(u.sessionDir, { recursive: true });
  fs.writeFileSync(path.join(u.sessionDir, 'wissen-S1.json'), JSON.stringify({
    last_active: Date.now() - 48 * 60 * 60 * 1000,
    gezeigt: { grundwissen: Date.now() - 48 * 60 * 60 * 1000 }
  }), 'utf8');
  assert.ok(laufe({ ...u, prompt: 'bauplan' }).kontext);
});

test('Opt-out per NC_WISSEN_HINWEIS greift', () => {
  const u = umgebung();
  for (const wert of ['off', '0', 'false', 'disabled', 'OFF']) {
    const r = laufe({ ...u, session: 'S-' + wert, prompt: 'bauplan', env: { NC_WISSEN_HINWEIS: wert } });
    assert.equal(r.kontext, null, 'Opt-out-Wert "' + wert + '" wurde nicht beachtet');
  }
});

test('Subagenten-Lauf: Schweigen (der Parent fuehrt die Sitzung)', () => {
  const u = umgebung();
  const roh = JSON.stringify({
    session_id: 'S1', hook_event_name: 'UserPromptSubmit', prompt: 'bauplan',
    agent_id: 'sub-1', agent_type: 'general-purpose'
  });
  assert.equal(laufe({ ...u, roh }).kontext, null);
});

test('Unbrauchbares stdin: Schweigen, kein Absturz, Exit 0', () => {
  const u = umgebung();
  for (const roh of ['', 'kein json', '[]', 'null']) {
    const r = laufe({ ...u, roh });
    assert.equal(r.kontext, null);
  }
});

test('Sehr langer Prompt bremst nicht und bleibt fail-safe', () => {
  const u = umgebung();
  const start = Date.now();
  const r = laufe({ ...u, prompt: 'x'.repeat(200000) + ' bauplan' });
  // Jenseits des Deckels wird bewusst nicht mehr gesucht — Schweigen ist hier korrekt.
  assert.equal(r.kontext, null);
  assert.ok(Date.now() - start < 10000, 'der Hook darf den Prompt-Pfad nicht ausbremsen');
});

// --- Der ausgelieferte Index: Struktur- und Drift-Invarianten ---------------------------
// Der Sucheindex ist ein ABGELEITETES Artefakt: Er zeigt auf Dokumente der Wissensbasis,
// ohne deren Inhalt zu tragen. Ohne Verdrahtung driftet er gegen die Platte — und ein Zeiger
// auf ein verschobenes Dokument ist SCHLIMMER als kein Zeiger, weil ihm vertraut wird.
// Die Existenz der genannten Router wird hier bewusst NICHT geprueft: die Wissens-Router
// entstehen in einem eigenen Paket, und ein Test, der auf sie wartet, waere hier rot ohne
// eigenen Befund.

test('Sucheindex: wohlgeformt, eindeutig, jeder Pfad existiert real', () => {
  const idx = JSON.parse(fs.readFileSync(ECHT_INDEX, 'utf8'));
  assert.equal(idx.schemaVersion, 1,
    'Sucheindex-Schema geaendert? Dann auch nc-wissens-hinweis.js nachziehen');
  assert.ok(Array.isArray(idx.eintraege) && idx.eintraege.length > 0, 'Sucheindex ohne Eintraege');

  const ids = new Set();
  for (const e of idx.eintraege) {
    assert.ok(e.id && !ids.has(e.id), `Sucheindex: doppelte oder fehlende id "${e.id}"`);
    ids.add(e.id);
    assert.ok(e.titel && e.hinweis, `Sucheindex ${e.id}: titel und hinweis sind Pflicht`);
    assert.ok(e.router && typeof e.router === 'string',
      `Sucheindex ${e.id}: router ist Pflicht (die Vertiefungszeile braucht ihn)`);

    const teile = String(e.pfad || '').replace(/\/+$/, '').split('/').filter(Boolean);
    assert.ok(teile.length > 0, `Sucheindex ${e.id}: pfad fehlt`);
    assert.ok(!String(e.pfad).startsWith('/') && !String(e.pfad).includes('\\'),
      `Sucheindex ${e.id}: pfad muss relativ und mit / getrennt sein ("${e.pfad}")`);
    // Standardbasis ist die REPO-WURZEL (NovaCore-Abweichung), `kern-plugin` die
    // Plugin-Wurzel.
    const basis = e.basis === 'kern-plugin' ? PLUGIN_ROOT : REPO_ROOT;
    assert.ok(fs.existsSync(path.join(basis, ...teile)),
      `Sucheindex ${e.id}: "${e.pfad}" existiert nicht (basis ${e.basis || 'repo-wurzel'}) — `
      + 'ein Zeiger auf ein verschobenes Dokument ist schlimmer als kein Zeiger');
  }
});

test('Sucheindex: Stichworte erfuellen die Normalisierungsregeln des Hooks', () => {
  const idx = JSON.parse(fs.readFileSync(ECHT_INDEX, 'utf8'));
  for (const e of idx.eintraege) {
    assert.ok(Array.isArray(e.stichworte) && e.stichworte.length > 0,
      `Sucheindex ${e.id}: ohne Stichworte kann der Hook den Eintrag nie finden`);
    assert.ok(e.stichworte.length <= 8,
      `Sucheindex ${e.id}: mehr als acht Stichworte je Eintrag verwaessern die Spezifitaet`);
    for (const w of e.stichworte) {
      assert.equal(/[A-ZÄÖÜ]/.test(w), false,
        `Sucheindex ${e.id}: Stichwort "${w}" ist nicht kleingeschrieben`);
      assert.equal(/[äöüß]/.test(w), false,
        `Sucheindex ${e.id}: Stichwort "${w}" traegt Umlaute — der Hook faltet sie (ae/oe/ue/ss)`);
      assert.ok(w.length >= 4,
        `Sucheindex ${e.id}: Stichwort "${w}" ist zu kurz — offenes Wortende erzeugt Fehltreffer`);
    }
  }
});

test('Sucheindex: jeder wissensbasis-Pfad steht im SSOT-Document-Index', () => {
  // Zweite Haelfte der Drift-Sicherung: Ein Zeiger auf ein Dokument, das der Master-Index
  // nicht kennt, umginge die Triage — genau das, was der Index verhindern soll. Der Index
  // selbst kann sich nicht enthalten und ist deshalb ausgenommen.
  const idx = JSON.parse(fs.readFileSync(ECHT_INDEX, 'utf8'));
  const master = fs.readFileSync(path.join(REPO_ROOT, 'knowledge-base', 'SSOT-Document-Index.md'), 'utf8');
  for (const e of idx.eintraege) {
    if (e.basis === 'kern-plugin') continue;
    const pfad = String(e.pfad);
    if (pfad === 'knowledge-base/SSOT-Document-Index.md') continue;
    const indexRelativ = pfad.replace(/^knowledge-base\//, '');
    assert.ok(master.includes(indexRelativ),
      `Sucheindex ${e.id}: "${pfad}" steht nicht im SSOT-Document-Index — `
      + 'erst indizieren, dann verzeigern');
  }
});

test('Der echte Sucheindex traegt den Hook: ein realistischer Prompt trifft', () => {
  const r = laufe({
    index: ECHT_INDEX,
    stateDir: macheRegistry(),
    sessionDir: tmp('nc-wissen-sess-'),
    prompt: 'Ich habe einen Fehler gemacht — wo trage ich das ein?'
  });
  assert.ok(r.kontext, 'der ausgelieferte Index muss auf diesen Anlass greifen');
  assert.match(r.kontext, /agent-learnings|Fehlerprotokoll/);
});

test('Der echte Sucheindex schweigt bei einem fachfremden Prompt', () => {
  for (const prompt of [
    'Schreibe mir eine Funktion, die zwei Zahlen addiert.',
    'Bitte formatiere diese Funktion um und benenne die Variable neu.'
  ]) {
    const r = laufe({
      index: ECHT_INDEX,
      stateDir: macheRegistry(),
      sessionDir: tmp('nc-wissen-sess-'),
      prompt
    });
    assert.equal(r.kontext, null, `fachfremder Prompt darf nichts injizieren: ${prompt}`);
  }
});
