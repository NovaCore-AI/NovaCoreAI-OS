// lib/infra-registry.js — gemeinsames rohes Lesen der Infra-Registry (Port Onsite
// oai/hooks/lib/infra-registry.js@a9927b2, Mapping D32, Bauplan Phase J AP A4). Mehrere
// Hooks lesen ~/.claude/nc/infra.json; diese Lib ist die EINE Leseimplementierung
// (Schema-Waechter inklusive). Sie bewertet NICHT — die Zustandsbewertung
// (fehlt/neuer/defekt/gruen) wohnt im jeweiligen Hook (Pruefungs-Eigentum).
//
// Migration der drei Schwester-Leser (`nc-queue-faelligkeit.js`, `nc-wissens-hinweis.js`,
// `nc-pfad-hinweis.js`) ist BEWUSST NICHT Teil dieses Pakets — wie beim Vorbild ein
// eigener Strang, minimaler Diff (Bauplan-Invariante J-1: nur A1/A2 duerfen bestehende
// Hooks anfassen). Neue Leser (`nc-setup-hinweis.js`, `os-info`) nutzen diese Lib ab
// sofort.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const SCHEMA_VERSION = 1;

/** Maschinenlokaler Registry-Pfad; Override ersetzt das VERZEICHNIS ~/.claude/nc. */
function registryDatei(stateDirOverride) {
  const override = String(stateDirOverride || '').trim();
  const dir = override ? path.resolve(override) : path.join(os.homedir(), '.claude', 'nc');
  return path.join(dir, 'infra.json');
}

/** Zweiwertig: fehlt (nicht vorhanden oder unparsebar) | daten. Wirft nie. */
function ladeRegistry(datei) {
  try {
    if (!fs.existsSync(datei)) return { fehlt: true };
  } catch (_) { return { fehlt: true }; }
  try {
    const daten = JSON.parse(fs.readFileSync(datei, 'utf8'));
    if (!daten || typeof daten !== 'object') return { fehlt: true };
    return { daten };
  } catch (_) { return { fehlt: true }; }
}

/** schemaVersion numerisch, String-tolerant ("2" gilt als 2). NaN = fehlt. */
function schemaVersionAlsZahl(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return NaN;
}

module.exports = { SCHEMA_VERSION, registryDatei, ladeRegistry, schemaVersionAlsZahl };
