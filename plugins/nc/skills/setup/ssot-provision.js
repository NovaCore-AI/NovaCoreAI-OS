#!/usr/bin/env node
// ssot-provision.js — Implementierung von /nc:setup. Stellt die Wissensbasis (SSOT) lokal
// bereit. Bauplan 2026-08-10 „SSOT-Provisionierung" (Weg B).
//
// KEIN eigener Skill: Diese Datei liegt neben der SKILL.md und wird von ihr aufgerufen.
// Der Plugin-Scanner macht nur Ordner mit SKILL.md als Befehl sichtbar.
//
// WARUM ES DAS BRAUCHT: Der Marketplace liefert nur das PLUGIN aus. Die Wissensbasis des
// Kern-Repos liegt ausserhalb von plugins/nc/ und reist deshalb NICHT mit — der
// Firmen-Block in der globalen CLAUDE.md verweist aber auf sie („vor Vermutungen dort
// triagieren"), und /nc:start braucht sie. Ohne lokale Kopie zeigt das ins Leere.
//
// EIN Aufruf, EIN Ergebnis (bewusst ohne Modi und ohne Frische-Fenster — die gab es nur
// fuer eine automatische Start-Anbindung, die der Maintainer gestrichen hat):
//   node ssot-provision.js [--json]
// Fehlt eine Quelle → sparse klonen. Ist sie da → `git pull --ff-only`. Idempotent.
//
// QUELLEN (registry-getrieben, damit kuenftige Abteilungen ohne Codeaenderung mitlaufen):
//   - Kern: Repo-URL aus dem ausgelieferten .claude-plugin/plugin.json (`repository`),
//     Wissenspfad `knowledge-base`.
//   - Abteilung: aus module-registry.json, aber NUR wenn sie `repository` UND
//     `repoKnowledgePath` fuehrt. Satelliten setzen das nicht — bei ihnen IST das Repo das
//     Plugin, ihr Wissen reist im Paket mit. Dort gibt es nichts zu klonen.
//
// ABLAGE: <home>/.nc/ssot/<repo-name>/ plus Zeiger <home>/.nc/ssot/index.json, damit
// andere Skills die Kopie finden. Override fuer Tests/Betrieb: NC_SSOT_DIR.
//
// SICHERHEIT: ausschliesslich Fast-Forward — nie Merge, Rebase, Reset oder Force. Eine
// lokal veraenderte Kopie wird gemeldet, nicht ueberschrieben. Geschrieben wird nur
// unterhalb der Ablage, nie im Arbeits-Repo.
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const GIT_TIMEOUT_MS = 60000;
const KERN_WISSENSPFAD = 'knowledge-base';

// Plugin-Wurzel = zwei Ebenen ueber skills/setup/. NC_SSOT_PLUGIN_ROOT ist ausschliesslich
// ein Test-Override (gleiches Muster wie NC_FFG_STATE_DIR / NC_START_GATE_STATE_DIR bei den
// Hooks) — im Betrieb wird er nie gesetzt.
function pluginRoot() {
  const override = String(process.env.NC_SSOT_PLUGIN_ROOT || '').trim();
  return override ? path.resolve(override) : path.resolve(__dirname, '..', '..');
}

function basisVerzeichnis() {
  const override = String(process.env.NC_SSOT_DIR || '').trim();
  return override ? path.resolve(override) : path.join(os.homedir(), '.nc', 'ssot');
}

function indexDatei() {
  return path.join(basisVerzeichnis(), 'index.json');
}

function readJson(datei) {
  try { return JSON.parse(fs.readFileSync(datei, 'utf8').replace(/^﻿/, '')); } catch (_) { return null; }
}

function git(args) {
  return execFileSync('git', args, {
    encoding: 'utf8', timeout: GIT_TIMEOUT_MS,
    stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true
  }).trim();
}

// Verzeichnisname aus der Repo-URL — defensiv, damit eine manipulierte Registry nicht aus
// der Ablage herausfuehrt.
function verzeichnisName(repoUrl) {
  const letztes = String(repoUrl).replace(/\.git$/i, '').split(/[\\/]/).filter(Boolean).pop() || 'repo';
  const sauber = letztes.replace(/[^A-Za-z0-9._-]/g, '_');
  return sauber === '.' || sauber === '..' ? 'repo' : sauber;
}

/** Alle Quellen, die lokal vorliegen muessen. */
function quellen() {
  const out = [];

  const manifest = readJson(path.join(pluginRoot(),'.claude-plugin', 'plugin.json'));
  const kernRepo = manifest && typeof manifest.repository === 'string' ? manifest.repository.trim() : '';
  if (kernRepo) {
    out.push({ name: manifest.name || 'nc', repo: kernRepo, wissenspfad: KERN_WISSENSPFAD, art: 'kern' });
  }

  const registry = readJson(path.join(pluginRoot(),'module-registry.json'));
  for (const a of (registry && Array.isArray(registry.abteilungen) ? registry.abteilungen : [])) {
    if (!a || !a.repository || !a.repoKnowledgePath) continue;
    const repo = /^[\w.-]+\/[\w.-]+$/.test(a.repository)
      ? 'https://github.com/' + a.repository   // Registry fuehrt owner/repo
      : String(a.repository);
    out.push({ name: a.plugin || a.name, repo, wissenspfad: String(a.repoKnowledgePath), art: 'abteilung' });
  }
  return out;
}

function schreibeIndex(quellenStand) {
  fs.mkdirSync(basisVerzeichnis(), { recursive: true });
  const idx = readJson(indexDatei()) || { quellen: {} };
  if (!idx.quellen || typeof idx.quellen !== 'object') idx.quellen = {};
  Object.assign(idx.quellen, quellenStand);
  const tmp = indexDatei() + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(idx, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, indexDatei());
}

/** Eine Quelle bereitstellen: klonen oder per Fast-Forward nachziehen. */
function bereitstellen(quelle) {
  const ziel = path.join(basisVerzeichnis(), verzeichnisName(quelle.repo));
  const wissen = path.join(ziel, ...quelle.wissenspfad.split('/'));
  const istKlon = fs.existsSync(path.join(ziel, '.git'));

  try {
    if (!istKlon) {
      fs.mkdirSync(basisVerzeichnis(), { recursive: true });
      // VOLLER Klon, bewusst. Ein frueherer Entwurf holte per --sparse nur die
      // Wissensbasis — das schnitt `plugins/` weg (das u. a. referenz/skill-authoring.md
      // traegt, auf das doku-sync verweist) und sparte dabei ganze 445 KB. Funktionsverlust
      // fuer nichts: das gesamte Repo ist wenige Megabyte. Wer die Wissensbasis lokal
      // braucht, soll das Repo lokal haben.
      git(['clone', quelle.repo, ziel]);
    } else {
      // Lokale Aenderungen NIE ueberschreiben — melden und in Ruhe lassen.
      if (git(['-C', ziel, 'status', '--porcelain'])) {
        return { ...quelle, pfad: ziel, zustand: 'lokal-veraendert' };
      }
      git(['-C', ziel, 'pull', '--ff-only']);
    }
  } catch (error) {
    return { ...quelle, pfad: ziel, zustand: 'fehler', meldung: fehlerText(error) };
  }

  if (!fs.existsSync(wissen)) {
    return {
      ...quelle, pfad: ziel, zustand: 'fehler',
      meldung: 'Der Wissenspfad "' + quelle.wissenspfad + '" existiert im Repo nicht.'
    };
  }

  let commit = null;
  try { commit = git(['-C', ziel, 'rev-parse', 'HEAD']); } catch (_) { /* egal */ }
  return {
    ...quelle, pfad: ziel, commit,
    zustand: istKlon ? 'aktualisiert' : 'angelegt',
    stand_am: new Date().toISOString()
  };
}

// Fehlermeldungen handlungsfaehig machen statt roh durchzureichen — genau hier scheitert
// Weg B bei Nutzern ohne git oder ohne Zugriff auf das private Repo (Bauplan §6).
function fehlerText(error) {
  // Fehlendes Binary ist ein STRUKTURELLES Signal, kein Textfund: Node setzt
  // error.code = 'ENOENT', wenn sich der Prozess nicht starten laesst. Frueher wurde hier
  // auf "not recognized" gematcht — und das traf die harmlose git-Warnung "filtering not
  // recognized by server, ignoring", die bei file://-Remotes IMMER erscheint. Folge: jeder
  // git-Fehler wurde als "git fehlt" gemeldet (Testfund 2026-08-10). Der Textfall bleibt
  // nur als eng gefasste Reserve fuer Shell-Wrapper.
  if (error && error.code === 'ENOENT') {
    return 'git ist nicht installiert oder nicht im PATH. Ohne git kann die Wissensbasis '
      + 'nicht bereitgestellt werden.';
  }
  const roh = String((error && (error.stderr || error.message)) || '').trim();
  if (/is not recognized as an internal or external command|^bash: git: command not found/im.test(roh)) {
    return 'git ist nicht installiert oder nicht im PATH. Ohne git kann die Wissensbasis '
      + 'nicht bereitgestellt werden.';
  }
  if (/Authentication failed|could not read Username|Permission denied|403|access rights/i.test(roh)) {
    return 'Kein Zugriff auf das Repo (es ist privat). Zugang einrichten — z. B. `gh auth login` '
      + 'oder einen Git-Credential-Helper — und erneut versuchen. Rohmeldung: ' + roh.slice(0, 300);
  }
  // Wortlaut variiert je git-Version: "Not possible to fast-forward" (aeltere) vs.
  // "Diverging branches can't be fast-forwarded" (neuere). Deshalb auf den Wortstamm
  // `diverg` pruefen — die Variante mit -ing haette das erste Muster verfehlt und dem
  // Nutzer rohe git-Ausgabe statt einer handlungsfaehigen Meldung geliefert (Testfund).
  if (/not possible to fast-forward|diverg/i.test(roh)) {
    return 'Die lokale Kopie ist der Fernkopie gegenueber divergiert. Es wird bewusst NICHT '
      + 'gemergt oder zurueckgesetzt — Kopie pruefen oder loeschen und neu anlegen lassen.';
  }
  return roh.slice(0, 500) || 'unbekannter git-Fehler';
}

function main() {
  const alsJson = process.argv.slice(2).includes('--json');
  const liste = quellen();

  if (!liste.length) {
    const meldung = 'Keine Quelle aufloesbar — fehlt `repository` in der plugin.json des Kerns?';
    process.stdout.write(alsJson ? JSON.stringify({ ok: false, meldung, quellen: [] }, null, 2) + '\n' : meldung + '\n');
    process.exitCode = 1;
    return;
  }

  const ergebnisse = liste.map(bereitstellen);

  const stand = {};
  for (const e of ergebnisse) {
    if (e.zustand !== 'angelegt' && e.zustand !== 'aktualisiert') continue;
    stand[e.name] = {
      repo: e.repo, pfad: e.pfad, wissenspfad: e.wissenspfad,
      commit: e.commit, stand_am: e.stand_am
    };
  }
  if (Object.keys(stand).length) schreibeIndex(stand);

  const problem = ergebnisse.some((e) => e.zustand === 'fehler');
  const ausgabe = {
    ok: !problem,
    ablage: basisVerzeichnis(),
    quellen: ergebnisse.map((e) => ({
      name: e.name, art: e.art, zustand: e.zustand, pfad: e.pfad,
      wissenspfad: e.wissenspfad, commit: e.commit || null,
      ...(e.meldung ? { meldung: e.meldung } : {})
    }))
  };

  if (alsJson) {
    process.stdout.write(JSON.stringify(ausgabe, null, 2) + '\n');
  } else {
    const zeilen = ausgabe.quellen.map((q) => '  ' + q.zustand.padEnd(16) + q.name
      + ' (' + q.art + ') → ' + q.pfad + (q.meldung ? '\n      ' + q.meldung : ''));
    process.stdout.write('SSOT-Ablage: ' + ausgabe.ablage + '\n' + zeilen.join('\n') + '\n');
  }
  process.exitCode = problem ? 1 : 0;
}

module.exports = { quellen, bereitstellen, basisVerzeichnis, indexDatei, verzeichnisName };

if (require.main === module) {
  try {
    main();
  } catch (e) {
    try { process.stderr.write('[nc-setup] ' + (e && e.message) + '\n'); } catch (_) { /* egal */ }
    process.exitCode = 1;
  }
}
