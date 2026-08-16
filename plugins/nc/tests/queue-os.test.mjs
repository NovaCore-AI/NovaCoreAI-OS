// Queue-Flow-Invarianten, die an das OS-Repo gebunden sind (Bauplan 2026-08-15, AP-E1;
// NC-Port des Onsite-Apparats, origin/main@5c2c210, Invariante I6).
//
// Warum eine eigene Datei und kein Anbau an struktur.test.mjs: Der Queue-Apparat verteilt sich
// ueber drei Ebenen, die nichts miteinander zu tun haben ausser diesem Flow — die ausgelieferte
// Kern-Referenz (plugins/nc/referenz/pflege-auspraegung.md), die deklarative Ausspraegung eines
// Abteilungsplugins (plugins/nc-development/pflege-auspraegung.json) und die Uebergangs-Queue
// in der Wissensbasis dieses Repos. Die Struktur-Suite prueft Layout-Invarianten des
// Multi-Plugin-Schnitts; hier steht der Inhaltsvertrag des Formats.
//
// OS-Repo-gebunden (Muster: agenten-os.test.mjs): Die Pruefungen brauchen die Abteilungs-
// Registry des Kerns und die Wissensbasis dieses Repos. Ein Satellit fuehrt beides nicht — der
// Baustein wandert deshalb bewusst NICHT mit, es gibt keinen Versions-Stempel im Kopf.
//
// Der Formatpruefer (pruefeQueue/pruefeTransition) wird in T-5 gegen adversariale INLINE-
// Fixturen gehalten. Grund (Gegenprobe-Pflicht, Bauplan §6): Ein Pruefer, der nur gegen die
// heutige, korrekte Datei laeuft, ist von einem Pruefer, der gar nichts prueft, nicht zu
// unterscheiden. Die Fixturen sind Strings — keine Datei auf der Platte wird je angefasst.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const p = (...s) => path.join(REPO, ...s);
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

const REFERENZ = p('plugins', 'nc', 'referenz', 'pflege-auspraegung.md');
const AUSPRAEGUNG = p('plugins', 'nc-development', 'pflege-auspraegung.json');
const QUEUE = p('knowledge-base', 'kandidaten-queue', 'queue.md');
const QUEUE_FLOW = p('knowledge-base', 'standardprozesse', 'queue-flow.md');
const REGISTRY = p('plugins', 'nc', 'module-registry.json');

/** Datei lesen und dabei Existenz + Nicht-Leere belegen (Non-Empty-Guard gegen stilles Gruen). */
function lies(datei, zweck) {
  assert.ok(fs.existsSync(datei), `${datei} fehlt — ${zweck}`);
  const text = fs.readFileSync(datei, 'utf8');
  assert.ok(text.trim().length > 0,
    `${datei} ist leer — ${zweck}; eine leere Datei laesst jede Textpruefung dieser Suite ins Leere laufen`);
  return text;
}

/**
 * Rumpf eines Markdown-Abschnitts: ab der Ueberschriftszeile bis zur naechsten Ueberschrift
 * gleicher oder hoeherer Ebene. Liefert null, wenn die Ueberschrift fehlt.
 */
function abschnitt(text, ueberschrift) {
  const zeilen = text.split(/\r?\n/);
  const start = zeilen.findIndex((z) => ueberschrift.test(z));
  if (start === -1) return null;
  const ebene = (zeilen[start].match(/^#+/) ?? ['#'])[0].length;
  let ende = zeilen.length;
  for (let i = start + 1; i < zeilen.length; i++) {
    const m = zeilen[i].match(/^(#+)\s/);
    if (m && m[1].length <= ebene) { ende = i; break; }
  }
  return zeilen.slice(start + 1, ende).join('\n');
}

/** Zellen einer Markdown-Tabellenzeile (ohne die Randstriche), getrimmt. */
function zellen(zeile) {
  return zeile.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((z) => z.trim());
}

// --- Queue-Format v1: der Vertrag in Code ---------------------------------------------
// Der Tabellenkopf ist WOERTLICH vertraglich (Queue-Format v1, Abschnitt 4 der Referenz):
// die Skills des Flows finden ihre Zeilen ueber genau diese Kopfzeile.
const QUEUE_KOPF = '| Datum | Einzeiler | Verweis | erfülltes Kriterium | Status |';
const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/;
// Genau drei Statuswerte. Die einzige erlaubte Transition ist offen -> befördert/abgelehnt;
// gesetzt wird sie von /nc:queue-kern (Verdichtungsfall: derselbe Marker von Hand).
const STATUS = /^(offen|befördert \(PR #\d+\)|abgelehnt \(PR #\d+\))$/;

function istEchtesDatum(s) {
  const [j, m, t] = s.split('-').map(Number);
  const d = new Date(Date.UTC(j, m - 1, t));
  return d.getUTCFullYear() === j && d.getUTCMonth() === m - 1 && d.getUTCDate() === t;
}

/** Datenzeilen der Queue-Tabelle als { nr, zellen }; leer, wenn der Kopf fehlt. */
function datenzeilen(text) {
  const zeilen = text.split(/\r?\n/);
  const kopf = zeilen.findIndex((z) => z.trim() === QUEUE_KOPF);
  if (kopf === -1) return [];
  const out = [];
  for (let i = kopf + 2; i < zeilen.length; i++) {
    const z = zeilen[i].trim();
    if (z === '') continue;
    if (!z.startsWith('|')) break; // Tabelle zu Ende
    out.push({ nr: i + 1, zellen: zellen(z) });
  }
  return out;
}

/** Strukturpruefung EINES Queue-Standes. Liefert die Befundliste (leer = in Ordnung). */
function pruefeQueue(text) {
  const befunde = [];
  const zeilen = text.split(/\r?\n/);
  if (!/^>\s*\S/m.test(zeilen.slice(0, 12).join('\n'))) {
    befunde.push('Kopf-Blockquote fehlt — die Datei muss ihre append-only-Regel selbst tragen');
  }
  const kopf = zeilen.findIndex((z) => z.trim() === QUEUE_KOPF);
  if (kopf === -1) {
    befunde.push(`Tabellenkopf weicht ab — erwartet wird woertlich: ${QUEUE_KOPF}`);
    return befunde;
  }
  const trenner = (zeilen[kopf + 1] ?? '').trim();
  if (!/^\|(\s*:?-{3,}:?\s*\|){5}$/.test(trenner)) {
    befunde.push(`Trennzeile unter dem Tabellenkopf fehlt oder fuehrt nicht fuenf Spalten: "${trenner}"`);
  }
  for (const { nr, zellen: c } of datenzeilen(text)) {
    if (c.length !== 5) {
      befunde.push(`Zeile ${nr}: ${c.length} Spalten statt 5 — das Queue-Format v1 hat genau fuenf`);
      continue;
    }
    if (!ISO_DATUM.test(c[0]) || !istEchtesDatum(c[0])) {
      befunde.push(`Zeile ${nr}: "${c[0]}" ist kein ISO-Datum (YYYY-MM-DD)`);
    }
    if (c[1] === '') befunde.push(`Zeile ${nr}: Einzeiler leer — ein Kandidat ohne Satz ist nicht pruefbar`);
    if (c[2] === '') befunde.push(`Zeile ${nr}: Verweis leer — die Quelle bleibt in der Abteilung, der Verweis ist Pflicht`);
    if (c[3] === '') befunde.push(`Zeile ${nr}: erfuelltes Kriterium leer — ohne Kuerzel ist die Zeile nicht aufloesbar`);
    if (!STATUS.test(c[4])) {
      befunde.push(`Zeile ${nr}: Status "${c[4]}" ist keiner der drei erlaubten Werte `
        + '(offen | befördert (PR #n) | abgelehnt (PR #n))');
    }
  }
  return befunde;
}

/**
 * Vergleich ZWEIER Queue-Staende als Multimengen ueber die ersten vier Spalten.
 * Die Queue ist append-only: keine Zeile darf verschwinden, und der Status darf sich nur
 * in die eine erlaubte Richtung bewegen.
 */
function pruefeTransition(vorher, nachher) {
  const befunde = [];
  const sammle = (text) => {
    const map = new Map();
    for (const { zellen: c } of datenzeilen(text)) {
      if (c.length !== 5) continue; // Formfehler meldet pruefeQueue, nicht dieser Vergleich
      const k = c.slice(0, 4).join(' | ');
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(c[4]);
    }
    return map;
  };
  // Marker-Identitaet des Folgelaufs: /nc:queue-kern identifiziert Zeilen ueber
  // Datum + Einzeiler — zwei Zeilen mit gleichem Paar sind dort ein Befund, egal wie
  // Verweis und Kriterium aussehen. Der Vergleich muss dieselbe Identitaet kennen,
  // sonst laufen Zeilen durch, die im Folgelauf unmoeglich eindeutig markerbar sind.
  const markerIdentitaet = (text) => {
    const zaehler = new Map();
    for (const { zellen: c } of datenzeilen(text)) {
      if (c.length !== 5) continue;
      const k = c[0] + ' | ' + c[1];
      zaehler.set(k, (zaehler.get(k) || 0) + 1);
    }
    return zaehler;
  };
  for (const [k, n] of markerIdentitaet(vorher)) {
    if (n > 1) befunde.push(`doppeldeutige Marker-Identitaet (Datum + Einzeiler, ${n}x): ${k}`);
  }
  for (const [k, n] of markerIdentitaet(nachher)) {
    if (n > 1) befunde.push(`doppeldeutige Marker-Identitaet (Datum + Einzeiler, ${n}x): ${k}`);
  }
  const v = sammle(vorher);
  const n = sammle(nachher);
  const erlaubt = (alt, neu) =>
    alt === neu || (alt === 'offen' && /^(befördert|abgelehnt) \(PR #\d+\)$/.test(neu));
  for (const [k, alteStatus] of v) {
    const neueStatus = n.get(k);
    if (!neueStatus) {
      befunde.push(`Zeile verschwunden (append-only verletzt): ${k}`);
      continue;
    }
    if (alteStatus.length > 1 || neueStatus.length > 1) {
      befunde.push(`doppeldeutige Zeilen-Identitaet — Vergleich nicht eindeutig moeglich: ${k}`);
      continue;
    }
    if (!erlaubt(alteStatus[0], neueStatus[0])) {
      befunde.push(`unerlaubte Statustransition "${alteStatus[0]}" -> "${neueStatus[0]}": ${k}`);
    }
  }
  return befunde;
}

// --- T-1 -------------------------------------------------------------------------------
test('T-1 Kern-Referenz: die vier tragenden Abschnitte existieren und sind nicht leer', () => {
  // Ohne Non-Empty-Guard prueft ein Ueberschriften-Test weniger, als sein Name zusagt: eine
  // Ueberschrift ohne Rumpf waere gruen (Bauplan §6, Gegenprobe-Pflicht).
  const text = lies(REFERENZ,
    'sie ist der Traeger von Queue-Format und Kriterienliste und reist im Kern-Plugin mit '
    + '(AP-E1); ohne sie hat der Queue-Flow keine Norm');
  const erwartet = [
    ['Queue-Format', /^##\s.*Queue-Format v1/m],
    ['Kriterien a–d', /^###\s.*Kriterien a–d/m],
    ['Gegenkriterien GF1–GF4', /^###\s.*Gegenkriterien GF1–GF4/m],
    ['No-Duplicate', /^###\s.*No-Duplicate/m],
  ];
  for (const [name, muster] of erwartet) {
    const rumpf = abschnitt(text, muster);
    assert.notEqual(rumpf, null,
      `referenz/pflege-auspraegung.md ohne Abschnitt "${name}" — Ueberschrift umbenannt? `
      + `Dann hier nachziehen, sonst prueft T-1 nichts mehr (erwartetes Muster: ${muster})`);
    assert.ok(rumpf.trim().length >= 40,
      `Abschnitt "${name}" in referenz/pflege-auspraegung.md ist leer oder ein Stummel `
      + `(${rumpf.trim().length} Zeichen) — der Abschnitt ist normativ und muss Substanz tragen`);
  }
});

// --- T-2 -------------------------------------------------------------------------------
test('T-2 Plugin-Grenze: die Kern-Referenz bleibt nach der Installation aufloesbar', () => {
  // Schaerfer als die Bestandsinvariante in struktur.test.mjs (die ein Kontextfenster von
  // zwei Zeilen zulaesst): Diese Datei wird ausgeliefert, ein installiertes Plugin sieht
  // KEINE Repo-Pfade — die Qualifizierung muss deshalb im selben Satz bzw. derselben
  // Tabellenzelle stehen, nicht zwei Zeilen entfernt.
  const text = lies(REFERENZ, 'sie ist die ausgelieferte Norm des Queue-Formats (AP-E1)');
  const zeilen = text.split(/\r?\n/);
  zeilen.forEach((zeile, i) => {
    assert.equal(/\.\.\//.test(zeile), false,
      `referenz/pflege-auspraegung.md:${i + 1}: ../-Pfad verlaesst das Plugin-Verzeichnis — `
      + 'installierte Plugins koennen nicht ausserhalb ihres Verzeichnisses lesen');
    if (/knowledge-base\//.test(zeile)) {
      assert.match(zeile, /OS-Repo|Abteilungs-Repo/,
        `referenz/pflege-auspraegung.md:${i + 1}: Nennung von knowledge-base/ ohne die `
        + 'Qualifizierung "OS-Repo" bzw. "Abteilungs-Repo" in derselben Zeile — nach der '
        + 'Installation ist der Pfad nicht aufloesbar und liest sich als Leseanweisung');
    }
  });
  const nennungen = zeilen.filter((z) => /knowledge-base\//.test(z)).length;
  assert.ok(nennungen > 0,
    'referenz/pflege-auspraegung.md nennt knowledge-base/ kein einziges Mal — dann hat die '
    + 'Qualifizierungs-Invariante nichts geprueft. Der Standardwert von queuePfad nennt den '
    + 'Pfad; fehlt er, ist die Datei unvollstaendig (oder dieser Test ist zu einer Attrappe geworden)');
});

// --- T-3 -------------------------------------------------------------------------------
test('T-3 Pflege-Auspraegung nc-development: Schema v1 vollstaendig und registry-konsistent', () => {
  assert.ok(fs.existsSync(AUSPRAEGUNG),
    `${AUSPRAEGUNG} fehlt — jedes Abteilungsplugin liefert seine Pflege-Auspraegung an der `
    + 'Plugin-Wurzel mit; ohne sie findet /nc:end-session die Queue nicht');
  const roh = fs.readFileSync(AUSPRAEGUNG, 'utf8');
  let a;
  try {
    a = JSON.parse(roh);
  } catch (e) {
    assert.fail(`plugins/nc-development/pflege-auspraegung.json ist nicht parsebar (${e.message}) `
      + '— die Datei ist STRIKTES JSON: keine Kommentare, keine nachgestellten Kommata');
  }
  assert.equal(a.schemaVersion, 1,
    'schemaVersion muss die Zahl 1 sein — ein hoeherer Wert laesst jeden Kern-Skill mit '
    + '"Auspraegung neuer als der installierte Kern" abbrechen; das Schema sind die FELDER, '
    + 'nicht der Inhalt der Kriterienliste');
  for (const feld of ['abteilung', 'queuePfad', 'kriterienVerweis']) {
    assert.equal(typeof a[feld], 'string', `Pflichtfeld "${feld}" fehlt oder ist keine Zeichenkette`);
    assert.ok(a[feld].trim().length > 0, `Pflichtfeld "${feld}" ist leer — Schema v1 verlangt einen Wert`);
  }
  for (const feld of ['journalSonderregeln', 'roteLinienDomaene']) {
    assert.ok(Array.isArray(a[feld]),
      `Pflichtfeld "${feld}" muss eine Liste sein (darf leer sein, aber nicht fehlen)`);
    for (const eintrag of a[feld]) {
      assert.equal(typeof eintrag, 'string', `"${feld}" enthaelt einen Nicht-String-Eintrag`);
      assert.ok(eintrag.trim().length > 0, `"${feld}" enthaelt einen leeren Eintrag`);
    }
  }

  const reg = readJson(REGISTRY);
  const eintrag = reg.abteilungen.find((x) => x.name === a.abteilung);
  assert.ok(eintrag,
    `abteilung "${a.abteilung}" ist in plugins/nc/module-registry.json keine gefuehrte `
    + 'Abteilung — der Name muss zur Registry passen, sonst bricht der Kern-Skill ab');
  assert.equal(eintrag.plugin, 'nc-development',
    `die Auspraegung liegt in plugins/nc-development/, die Registry ordnet die Abteilung `
    + `"${a.abteilung}" aber dem Plugin "${eintrag.plugin}" zu — Auspraegung und Plugin driften`);
  if (!eintrag.repository) {
    // Kein Satelliten-Repo in der Registry = die Abteilung hat noch keinen eigenen Klon.
    // Ohne uebergang meldet der Kern-Skill den Kandidaten als "nicht abgelegt" — Verlust
    // waere sichtbar, aber vermeidbar. Solange der Uebergangszustand gilt, ist das Feld Pflicht.
    assert.equal(typeof a.uebergang, 'string',
      `Registry-Eintrag der Abteilung "${a.abteilung}" fuehrt kein repository (kein eigener `
      + 'Satellit), also MUSS das Feld "uebergang" gesetzt sein — sonst haben Queue-Zeilen '
      + 'keinen Ablageort und gehen als "nicht abgelegt" verloren');
    assert.ok(a.uebergang.trim().length > 0,
      '"uebergang" ist leer — ein Satz, wohin Queue-Eintraege stattdessen gehoeren, ist Pflicht');
  }
});

// --- T-4 -------------------------------------------------------------------------------
test('T-4 Uebergangs-Queue development: Kopf-Blockquote, Tabellenkopf und Zeilenformat', () => {
  const text = lies(QUEUE,
    'sie ist die Uebergangs-Queue der Abteilung development im OS-Repo (AP-E1); ohne sie hat '
    + 'die Klassifikation am Sitzungsende keinen Ablageort');
  assert.ok(text.includes(QUEUE_KOPF),
    `kandidaten-queue/queue.md fuehrt den Tabellenkopf nicht woertlich — erwartet: ${QUEUE_KOPF}`);
  assert.match(text.split(/\r?\n/).slice(0, 12).join('\n'), /^>\s*\S/m,
    'kandidaten-queue/queue.md ohne Kopf-Blockquote — die Datei muss ihre append-only-Regel '
    + 'selbst tragen (Queue-Format v1, Abschnitt 4 der Kern-Referenz)');
  const befunde = pruefeQueue(text);
  assert.deepEqual(befunde, [],
    `Queue-Format v1 verletzt in kandidaten-queue/queue.md:\n  - ${befunde.join('\n  - ')}`);
});

// --- T-5 -------------------------------------------------------------------------------
test('T-5 Gegenprobe: der Formatpruefer schlaegt bei adversarialen Inline-Fixturen an', () => {
  // Rein im Speicher — keine Datei auf der Platte wird gelesen oder geschrieben.
  const kopf = [
    '# Kandidaten-Queue development — append-only',
    '',
    '> Fixture, nur im Speicher. Zeilen werden nie geloescht.',
    '',
    QUEUE_KOPF,
    '|---|---|---|---|---|',
  ].join('\n');
  const mit = (...zeilen) => [kopf, ...zeilen, ''].join('\n');

  // (e) Positivkontrolle: eine gueltige neue offen-Zeile muss durchgehen. Ohne sie waere ein
  //     Pruefer, der ALLES ablehnt, in (a)-(d) unauffaellig gruen.
  const gueltig = mit('| 2026-08-16 | Beleg fuer den Positivfall | Pfad oder Ticket | a | offen |');
  assert.deepEqual(pruefeQueue(gueltig), [],
    'Positivkontrolle rot: der Formatpruefer lehnt eine regelkonforme offen-Zeile ab — er ist '
    + 'damit als Waechter unbrauchbar (jede echte Queue-Zeile waere ein Fehlalarm)');

  // (a) sechs Spalten
  const sechsSpalten = mit('| 2026-08-16 | zu viele Spalten | Pfad | a | offen | Zusatzspalte |');
  assert.ok(pruefeQueue(sechsSpalten).some((b) => /6 Spalten statt 5/.test(b)),
    'Gegenprobe (a) fehlgeschlagen: eine Zeile mit sechs Spalten laeuft durch — die '
    + 'Spaltenzahl-Pruefung ist wirkungslos geworden');

  // (b) Nicht-ISO-Datum
  const falschesDatum = mit('| 16.08.2026 | deutsches Datumsformat | Pfad | a | offen |');
  assert.ok(pruefeQueue(falschesDatum).some((b) => /kein ISO-Datum/.test(b)),
    'Gegenprobe (b) fehlgeschlagen: ein Nicht-ISO-Datum laeuft durch — dann sortiert und '
    + 'vergleicht kein Folgelauf die Queue mehr zuverlaessig');
  const unmoeglichesDatum = mit('| 2026-02-30 | Kalendertag existiert nicht | Pfad | a | offen |');
  assert.ok(pruefeQueue(unmoeglichesDatum).some((b) => /kein ISO-Datum/.test(b)),
    'Gegenprobe (b2) fehlgeschlagen: ein formal passendes, real unmoegliches Datum laeuft '
    + 'durch — die Pruefung ist auf eine reine Regex zurueckgefallen');

  // (c) verbotener Statuswert
  const falscherStatus = mit('| 2026-08-16 | unerlaubter Status | Pfad | a | gelöscht |');
  assert.ok(pruefeQueue(falscherStatus).some((b) => /Status "gelöscht"/.test(b)),
    'Gegenprobe (c) fehlgeschlagen: der Statuswert "gelöscht" laeuft durch — genau dieser Wert '
    + 'widerspricht der append-only-Regel und darf nie entstehen');

  // (d) Rueckwaerts-Transition zwischen zwei Staenden
  const vorher = mit('| 2026-08-16 | Zeile A | Pfad | a | befördert (PR #7) |');
  const nachher = mit('| 2026-08-16 | Zeile A | Pfad | a | offen |');
  assert.ok(pruefeTransition(vorher, nachher).some((b) => /unerlaubte Statustransition/.test(b)),
    'Gegenprobe (d) fehlgeschlagen: der Rueckweg "befördert (PR #7)" -> "offen" laeuft durch — '
    + 'ein beforderter Kandidat wuerde im Folgelauf erneut klassifiziert (Ledger-Bruch)');
  assert.deepEqual(pruefeTransition(nachher, vorher), [],
    'die EINZIG erlaubte Transition offen -> befördert (PR #n) wird faelschlich als Verstoss '
    + 'gemeldet — der Vergleich ist streng, aber nicht richtig');
  assert.ok(pruefeTransition(vorher, mit()).some((b) => /verschwunden/.test(b)),
    'Gegenprobe (d2) fehlgeschlagen: eine geloeschte Zeile laeuft durch — die Queue ist '
    + 'append-only, keine Zeile darf verschwinden');
  const doppelt = mit(
    '| 2026-08-16 | Zeile A | Pfad | a | offen |',
    '| 2026-08-16 | Zeile A | Pfad | a | offen |');
  assert.ok(pruefeTransition(doppelt, doppelt).some((b) => /doppeldeutige Zeilen-Identitaet/.test(b)),
    'Gegenprobe (d3) fehlgeschlagen: zwei identische Schluessel werden stillschweigend gepaart '
    + '— doppeldeutige Zeilen-Identitaet ist selbst ein Befund, kein Sonderfall zum Raten');
  // Adversarial: Der Folgelauf markiert ueber Datum + Einzeiler — zwei Zeilen mit gleichem
  // Paar, aber unterschiedlichem Verweis/Kriterium, haben unterschiedliche VIER-Spalten-
  // Schluessel und wuerden den obigen Vergleichen durchlaufen. Sie sind trotzdem unmarkierbar.
  const markerDoppelt = mit(
    '| 2026-08-16 | Zeile A | Pfad-1 | a | offen |',
    '| 2026-08-16 | Zeile A | Pfad-2 | c | offen |');
  assert.ok(pruefeTransition(markerDoppelt, markerDoppelt)
    .some((b) => /doppeldeutige Marker-Identitaet/.test(b)),
    'Gegenprobe fehlgeschlagen: gleiche Marker-Identitaet (Datum + Einzeiler) mit '
    + 'verschiedenem Verweis laeuft durch — der Folgelauf koennte den Marker nicht '
    + 'eindeutig setzen, der Vergleich muss es melden');
});

// --- T-6 -------------------------------------------------------------------------------
test('T-6 Kriterienliste: jedes Gegenkriterium nennt ein Routing-Ziel', () => {
  // Ein Gegenkriterium ohne benanntes Ziel ist unbrauchbar: Der klassifizierende Agent weiss
  // dann, dass etwas nicht in die Queue gehoert, aber nicht wohin.
  const text = lies(REFERENZ, 'sie traegt die Gegenkriterien GF1–GF4 (AP-E1)');
  const gf = abschnitt(text, /^###\s.*Gegenkriterien GF1–GF4/m);
  assert.notEqual(gf, null,
    'Abschnitt "Gegenkriterien GF1–GF4" nicht gefunden — Ueberschrift umbenannt? Dann hier '
    + 'nachziehen, sonst prueft T-6 nichts mehr');
  const zeilen = gf.split(/\r?\n/).filter((z) => /^\|\s*\*\*GF\d+\*\*/.test(z.trim()));
  assert.equal(zeilen.length, 4,
    `erwartet werden vier GF-Zeilen (GF1–GF4), gefunden ${zeilen.length} — Kuerzel werden nie `
    + 'neu belegt; kommt eines hinzu, ist diese Zahl bewusst mit nachzuziehen');
  for (const zeile of zeilen) {
    const c = zellen(zeile);
    assert.equal(c.length, 3,
      `GF-Zeile mit ${c.length} Spalten statt 3 (Kuerzel | Fall | Routing): ${zeile}`);
    const ziel = c[2].replace(/[*`]/g, '').trim();
    assert.ok(ziel.length >= 20,
      `GF-Zeile ohne belastbares Routing-Ziel (${ziel.length} Zeichen): ${zeile} — jede `
      + 'Gegenkriterien-Zeile muss sagen, WOHIN das Ergebnis stattdessen gehoert');
  }
});

// --- T-7 -------------------------------------------------------------------------------
test('T-7 Takt: 14-taegiger Rhythmus statt Wochen-Takt des Vorbilds', () => {
  // Firmenspezifikation NovaCore (Bauplan-Nachtrag N6): 14-taegiger Zyklus, +1 Tag Versatz
  // zwischen den Stationen. Das Vorbild faehrt woechentlich — jede uebersehene Taktangabe
  // waere eine stille Fehlaussage in einer ausgelieferten bzw. verbindlichen Datei.
  const dateien = [
    [REFERENZ, 'plugins/nc/referenz/pflege-auspraegung.md'],
    [QUEUE_FLOW, 'knowledge-base/standardprozesse/queue-flow.md'],
  ];
  for (const [datei, label] of dateien) {
    const text = lies(datei, 'sie traegt Taktaussagen des Queue-Flows (AP-E1)');
    text.split(/\r?\n/).forEach((zeile, i) => {
      assert.equal(/wöchentlich|woechentlich|Wochen-PR/i.test(zeile), false,
        `${label}:${i + 1}: Wochen-Takt des Vorbilds stehengeblieben — NovaCore faehrt `
        + '14-taegig (Bauplan-Nachtrag N6); Formulierung umstellen');
    });
    assert.match(text, /14-tägig|14 Tage/,
      `${label}: nennt weder "14-tägig" noch "14 Tage" — ohne benannten Takt ist die `
      + 'Faelligkeitsregel des Flows nicht nachlesbar');
  }
});
