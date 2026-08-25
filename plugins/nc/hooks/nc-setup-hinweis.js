#!/usr/bin/env node
// nc-setup-hinweis.js — Setup-Hinweis des NovaCore-OS (Port Onsite
// oai-setup-hinweis.js@a9927b2, Mapping D32, Bauplan Phase J AP A5; Vorbedingung AP A3:
// `/nc:setup` schreibt seither `kernRepoPfad` + die Pflichtfelder). SessionStart-Hook,
// KEIN GATE: blockiert und erzwingt nichts (SessionStart kann laut Doku ohnehin nicht
// blocken — verifizierte Mechanik, siehe Kopf von nc-session-start.js). Prueft den
// Setup-BELEG (Infra-Registry: `/nc:setup` ist ihr einziger Schreiber, Invariante J-4 —
// „die Platte ist die Wahrheit") und injiziert bei fehlendem/neuerem/defektem Beleg
// HOECHSTENS EINMAL JE SITZUNG eine Anweisung zum Handeln (Muster Queue-Faelligkeit,
// Maintainer-Entscheid 2026-08-24): die lesende Session fuehrt `/nc:setup` aus oder
// delegiert an einen Subagenten. Der Sitzungsmarker verhindert den Compact-Hijack: nach
// jeder Auto-Kompaktierung laege die Anweisung sonst mitten in laufender Arbeit erneut.
// Gruen = stumm (Sparsamkeit: null Token auf eingerichteten Maschinen). Kein Cron, kein
// Scheduler, kein Netz.
// Opt-out: NC_SETUP_HINWEIS=off · Test: NC_SETUP_STATE_DIR (Registry-Verzeichnis),
// NC_SETUP_SESSION_DIR (Marker-Verzeichnis). Fail-open: jede Exception -> Exit 0.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { sanitizeSessionKey, resolveSessionKey, isSubagentInvocation } = require('./lib/session-key');
const { SCHEMA_VERSION, registryDatei, ladeRegistry, schemaVersionAlsZahl } = require('./lib/infra-registry');

const OFF_VALUES = new Set(['0', 'false', 'off', 'disabled', 'disable']);
const SITZUNGS_TTL_MS = 24 * 60 * 60 * 1000; // Sitzungs-Obergrenze; tmpdir raeumt der Reboot

function isDisabled() {
  return OFF_VALUES.has(String(process.env.NC_SETUP_HINWEIS || '').trim().toLowerCase());
}

function sitzungsDir() {
  const override = String(process.env.NC_SETUP_SESSION_DIR || '').trim();
  if (override) return path.resolve(override);
  return path.join(os.tmpdir(), 'nc-setup-hinweis');
}

// Dateiname IMMER ueber sanitizeSessionKey — kein Ausbruch aus dem Marker-Verzeichnis.
function markerDatei(sessionKey) {
  const safe = sanitizeSessionKey(sessionKey);
  return safe ? path.join(sitzungsDir(), 'setup-' + safe + '.json') : null;
}

// Defekter Marker gilt als „bereits gezeigt" -> Schweigen (Noise-Safety-Richtung wie bei
// den Schwester-Markern: ein kaputter State darf nie zu wiederholtem Rauschen fuehren —
// derselbe Fehlerteil wie beim Wissens-Zeiger und der PreCompact-Mahnung).
function schonGezeigt(datei) {
  if (!datei) return true;
  try {
    if (!fs.existsSync(datei)) return false;
    const m = JSON.parse(fs.readFileSync(datei, 'utf8'));
    if (!m || typeof m !== 'object') return true;
    const alter = Date.now() - (Number(m.last_active) || 0);
    return alter <= SITZUNGS_TTL_MS;
  } catch (_) { return true; }
}

/** Atomar ersetzen: Temp-Datei in derselben Verzeichnisebene, dann rename (Schwester-
 * Konvention aus nc-wissens-hinweis.js) — ein abgebrochener Lauf hinterlaesst nie ein
 * halbes JSON. Ein gerissener Marker zaehlt danach als defekt = bereits gezeigt. */
function schreibeAtomar(datei, text) {
  const dir = path.dirname(datei);
  fs.mkdirSync(dir, { recursive: true });
  const temp = path.join(dir, '.' + path.basename(datei) + '.' + process.pid + '.tmp');
  try {
    fs.writeFileSync(temp, text, 'utf8');
    fs.renameSync(temp, datei);
  } finally {
    try { if (fs.existsSync(temp)) fs.unlinkSync(temp); } catch (_) { /* egal */ }
  }
}

/** Marker schreiben; `false` heisst fuer den Aufrufer: NICHT ausgeben. */
function markiere(datei) {
  // Schwester-Konvention (Wissens-Zeiger, Queue-Faelligkeit): Ist der Marker nicht
  // schreibbar, bleibt der Hook STUMM — sonst wiederholte sich die Anweisung bei JEDEM
  // SessionStart-Ereignis (startup/resume/clear/Compact), also exakt der Hijack, den der
  // Marker verhindern soll. Ein verlorener Hinweis ist billiger als Dauer-Rauschen.
  try {
    schreibeAtomar(datei, JSON.stringify({ last_active: Date.now() }, null, 2));
    return true;
  } catch (_) { return false; }
}

// --- Zustandsbewertung -------------------------------------------------------------------
// Erster zutreffender Zustand gewinnt. Nur lesend, kein Git, kein Netz. `.git` als DATEI
// zaehlt (Git-Worktrees tragen `.git` als Datei); `"ausstehend"` ist fuer `kernRepoPfad`
// (seit AP A3: kein Arbeitsklon auf dieser Maschine) UND fuer Eintraege in
// `abteilungsRepoPfade` gruen (Uebergangszustand E1).

function pruefePfad(p, ausstehendOk) {
  if (typeof p !== 'string' || !p.trim()) return { detail: 'Pfadfeld fehlt oder ist leer' };
  if (p === 'ausstehend') {
    return ausstehendOk ? null : { detail: '"ausstehend" ist an dieser Stelle unzulaessig' };
  }
  // Bewusst NUR isAbsolute: Ein `~`-Include-Check waere auf Windows falsch-positiv —
  // os.tmpdir() liefert bei Umlaut-Nutzernamen den 8.3-Kurzpfad (`C:\Users\LUCASV~1\...`),
  // der legal eine Tilde enthaelt. Unexpandierte `~/...`-Pfade fängt isAbsolute allein.
  if (!path.isAbsolute(p)) {
    return { detail: 'Pfad nicht absolut geschrieben: ' + p };
  }
  try {
    if (!fs.existsSync(p)) return { detail: 'Pfad loest nicht auf: ' + p };
    if (!fs.existsSync(path.join(p, '.git'))) return { detail: 'kein .git unter ' + p };
  } catch (_) { return { detail: 'Pfad loest nicht auf: ' + p }; }
  return null;
}

function bewerte(registry) {
  if (!registry || registry.fehlt) return { zustand: 'fehlt' };
  const d = registry.daten;
  const sv = schemaVersionAlsZahl(d.schemaVersion);
  if (!Number.isNaN(sv) && sv > SCHEMA_VERSION) {
    return { zustand: 'neuer', gefunden: d.schemaVersion };
  }
  // Pflichtfelder von Schema v1 (NC-Schema: `abteilungen` ist eine LISTE, nie ein
  // Einzelfeld — infra-registry.md): ohne diese Regel faelle eine handgeschriebene
  // Registry ohne schemaVersion durch die Pfadpruefung hindurch auf gruen.
  if (Number.isNaN(sv) || !Array.isArray(d.abteilungen)
      || typeof d.szenario !== 'string' || !d.szenario.trim()) {
    return { zustand: 'defekt', detail: 'Pflichtfeld fehlt (schemaVersion/abteilungen/szenario)' };
  }
  // kernRepoPfad: seit AP A3 Pflicht-Schreibziel von /nc:setup, "ausstehend" erlaubt
  // (kein Arbeitsklon auf dieser Maschine, reines Kunden-/Fremd-Repo).
  const kern = pruefePfad(d.kernRepoPfad, true);
  if (kern) return Object.assign({ zustand: 'defekt' }, kern);
  // abteilungsRepoPfade ist eine MAP (NC-Schema), optional — Uebergangszustand E1 kennt
  // sie noch nicht. Jeder vorhandene Eintrag wird geprueft, "ausstehend" ist dort immer
  // gruen.
  const pfade = d.abteilungsRepoPfade;
  if (pfade && typeof pfade === 'object' && !Array.isArray(pfade)) {
    for (const p of Object.values(pfade)) {
      const befund = pruefePfad(p, true);
      if (befund) return Object.assign({ zustand: 'defekt' }, befund);
    }
  }
  return { zustand: 'gruen' };
}

// --- Injektionstext -----------------------------------------------------------------------

function belegZeile(befund) {
  if (befund.zustand === 'fehlt') {
    return 'Infra-Registry `~/.claude/nc/infra.json` fehlt oder ist unlesbar — `/nc:setup` '
      + 'ist ihr einziger Schreiber: Ohne sie lief das Setup auf dieser Maschine nie sauber '
      + '(die Platte ist die Wahrheit).';
  }
  if (befund.zustand === 'neuer') {
    return 'Infra-Registry trägt `schemaVersion` ' + befund.gefunden + ', dieser Kern kennt '
      + SCHEMA_VERSION + ' — Registry neuer als der installierte Kern.';
  }
  return 'Infra-Registry defekt: ' + befund.detail + '.';
}

function hinweisText(befund) {
  const teile = ['## NovaCore-OS — Setup-Beleg ' + befund.zustand + ' (Setup-Hinweis, kein Gate)',
    '', '**Beleg:** ' + belegZeile(befund), ''];
  if (befund.zustand === 'neuer') {
    teile.push('**Anweisung:** Kern-Plugin über den Marketplace `novacore-os` aktualisieren, '
      + 'danach `/nc:setup` ausführen (gleiche Reihenfolge: erst `/nc:start`, dann der '
      + 'Start-Stempel). Nie die neuere Registry überschreiben oder ignorieren. Szenario '
      + 'der Maschine vorher erheben (Windows nativ · WSL · macOS/Linux) — bei '
      + 'Doppelumgebung oder Widerspruch zur Registry den Nutzer fragen, nie annehmen.', '',
      '**Mensch-Grenze:** Bleibt `/nc:setup` nach dem Update bei S0/S1 stehen (`gh auth`, '
      + 'fehlendes Plugin), das dem Nutzer melden — nichts selbst installieren oder '
      + 'authentifizieren, keine Credentials anfassen oder ausgeben.', '');
  } else {
    teile.push('**Anweisung zum Handeln:** `/nc:setup` **jetzt** ausführen — direkt oder per '
      + 'Delegation an einen Subagenten. Reihenfolge: erst `/nc:start`, dann der Start-Stempel '
      + '(`/nc:setup` schreibt; das Start-Gate bricht ungestempelte Schreibschritte ohnehin '
      + 'ab), dann `/nc:setup`. Der Skill ist Reconciler: Zweitläufe überspringen Erledigtes; '
      + 'eine defekte Registry wird repariert, nicht neu geklont (verschobener Klon → '
      + 'Registry-Reparatur statt Duplikat-Klon). Szenario der Maschine vorher erheben '
      + '(Windows nativ · WSL · macOS/Linux) — bei Doppelumgebung oder Widerspruch zur '
      + 'Registry den Nutzer fragen, nie annehmen.', '',
      '**Mensch-Grenze:** Bleibt `/nc:setup` bei S0/S1 stehen (`gh auth`, fehlendes Plugin), '
      + 'das dem Nutzer melden — nichts selbst installieren oder authentifizieren, keine '
      + 'Credentials anfassen oder ausgeben.', '');
  }
  teile.push('**Bewusst ohne Setup?** `NC_SETUP_HINWEIS=off` stellt diesen Hinweis dauerhaft ab.');
  return teile.join('\n');
}

// --- Hauptlauf ---------------------------------------------------------------------------

// stdin GENAU EINMAL lesen (Pipe) und beiden Verbrauchern reichen.
function leseStdin() {
  try { return fs.readFileSync(0, 'utf8') || '{}'; } catch (_) { return '{}'; }
}

function parseEingabe(text) {
  try {
    const eingabe = JSON.parse(text);
    return (eingabe && typeof eingabe === 'object') ? eingabe : {};
  } catch (_) { return {}; }
}

function main(input) {
  if (isDisabled()) return;

  const registry = ladeRegistry(registryDatei(process.env.NC_SETUP_STATE_DIR));
  const befund = bewerte(registry);
  if (befund.zustand === 'gruen') return; // Sparsamkeit: stumm auf eingerichteten Maschinen

  const datei = markerDatei(resolveSessionKey(input));
  if (schonGezeigt(datei)) return; // Hoechstens einmal je Sitzung (kein Compact-Hijack)
  if (!markiere(datei)) return;    // Marker unbeschreibbar -> stumm (Noise-Safety, s.o.)

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: hinweisText(befund)
    }
  }));
}

/**
 * `--pruefe`: reiner Diagnose-Modus fuer `/nc:os-info` (Bauplan Phase J AP A6) — dieselbe
 * Bewertung wie im Hook-Lauf, aber OHNE Sitzungsmarker zu lesen oder zu schreiben und
 * ohne den Session-Text zu injizieren. Verhindert, dass os-info die Zustandslogik
 * dupliziert (Pruefungs-Eigentum). Gibt `{zustand, detail?, gefunden?}` als JSON aus.
 */
function pruefeModus() {
  const registry = ladeRegistry(registryDatei(process.env.NC_SETUP_STATE_DIR));
  process.stdout.write(JSON.stringify(bewerte(registry)));
}

if (process.argv.includes('--pruefe')) {
  try {
    pruefeModus();
  } catch (e) {
    try { process.stderr.write('nc-setup-hinweis fail-open: ' + (e && e.message) + '\n'); } catch (_) { /* egal */ }
  }
} else {
  const EINGABE = leseStdin();
  if (isSubagentInvocation(parseEingabe(EINGABE))) {
    /* Subagenten ausgenommen — stumm */
  } else {
    try {
      main(parseEingabe(EINGABE));
    } catch (e) {
      try { process.stderr.write('nc-setup-hinweis fail-open: ' + (e && e.message) + '\n'); } catch (_) { /* egal */ }
    }
  }
}
// Kein process.exit(): kann auf POSIX den gepufferten stdout-Write (Pipe) abschneiden —
// die Injektion ginge still verloren (Fussnote von nc-session-start.js).
